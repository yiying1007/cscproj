<?php

namespace App\Http\Controllers;


use App\Models\Admin;
use App\Models\AdminLogs;
use App\Models\User;
use App\Models\Communities;
use App\Models\CommunityMembers;
use App\Models\Report;
use App\Models\IdentityVerification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Notifications\SendNotification;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Jobs\UnblockUserJob;
use Illuminate\Support\Facades\Mail;
use App\Mail\AccBlockMail;

class CommunitiesManageController extends Controller
{
    // show communities
    public function showCommunitiesManagementComponent(){
        $communities=Communities::leftJoin('users','users.id','=','communities.created_by')
                    ->select(
                        'communities.*',
                        'users.nickname'
                    )
                    ->get();
        $users=User::join('identity_verifications', 'users.id', '=', 'identity_verifications.user_id')
                    ->select('users.id', 
                            'users.nickname', 
                            'users.avatar', 
                            'users.position', 
                            'identity_verifications.faculty', 
                            'identity_verifications.course') 
                    ->get();
        
        return Inertia('Admin/CommunityManage/CommunitiesManagement', [
            'communities'=> $communities,
            'users'=>$users,
        ]);
    }

    // create
    public function createCommunity(Request $request){
        $admin = auth('admin')->user();
        //verify input 
        $data=$request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable',
            'type' => 'required',
            'created_by' => 'required',
            'is_private' => 'required',
        ]);

        $defaultAvatarPath = 'avatar/defaultCommunity.png';
        //store into db
        $community = Communities::create([
            'name' => $data['name'],
            'description' => $data['description'],
            'avatar' => $defaultAvatarPath,
            'type' => $data['type'],
            'created_by' => $data['created_by'],
            'is_private' => $data['is_private'],
        ]);
        if($community){
            CommunityMembers::firstOrCreate(
            [
                'communities_id' => $community->id,
                'user_id' => $data['created_by'],
            ],
            [
                'position' => 'Leader',
                'status' => 'Accepted',
            ]
            );
            
        }else{
            return redirect()->back()->with('error', 'Find not community');
        }
        //insert admin logs
        $adminLog=AdminLogs::create([
            'admin_id'=> $admin->id,
            'action' => "Create",
            'details'=> $admin->name.' create community : '.$data['name'].', type: '.$data['type'],
        ]);

        return redirect()->back()->with('success', 'Community create  successfully!');
        
    }

    public function editCommunityAvatar(Request $request,$id){
        $admin = auth('admin')->user();
        $community=Communities::findOrFail($id);
        $data = $request->validate([
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
                
            try {
                $avatar = $request->file('avatar');
                $avatarName = $community->id . '_' . time() . '.' . $avatar->getClientOriginalExtension();
        
                // Delete old avatar
                if ($community->avatar && $community->avatar !== 'avatar/defaultCommunity.png') {
                    Storage::disk('s3')->delete($community->avatar);
                }
        
                // Upload to s3
                $path = $avatar->storeAs('avatar', $avatarName, 's3');
                Storage::disk('s3')->setVisibility($path, 'public');
        
                // Update avatar to database
                $community->avatar = 'avatar/' . $avatarName;
                $community->save();

                //insert admin logs
                $adminLog=AdminLogs::create([
                    'admin_id'=> $admin->id,
                    'action' => "Edit",
                    'details'=> $admin->name.' edit community avatar community ID: '.$id,
                ]);

                return redirect()->back()->with('success', 'Community avatar updated successfully!');
            } catch (\Exception $e) {

                return redirect()->back()->with('error', 'Failed to upload avatar: ' . $e->getMessage());
            }
        }else{
            return redirect()->back()->with('error', 'Not upload new avatar. ');
        }

    }

    // edit community
    public function editCommunity(Request $request,$id){
        $admin = auth('admin')->user();
        $community=Communities::findOrFail($id);
        //validate user input
        $data=$request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable',
            'type' => 'required',
            'created_by' => 'required',
            'is_private' => 'required',
        ]);
        //check leader is change
        $oldLeaderId = $community->created_by;
        $newLeaderId = $data['created_by'];
        foreach (['name','description', 'type', 'created_by','is_private'] as $field) {
            if (array_key_exists($field, $data)) {
                $community->{$field} = $data[$field];
            }
        }
        $community->save();
        if ($oldLeaderId != $newLeaderId) {
            //change old leader to member
            CommunityMembers::where('communities_id', $community->id)
                            ->where('user_id', $oldLeaderId)
                            ->update(['position' => 'Member']);
            
            //create or update new leader record
            $member = CommunityMembers::where('communities_id', $community->id)
                                        ->where('user_id', $newLeaderId)
                                        ->first();

            if ($member) {
                CommunityMembers::where('communities_id', $community->id)
                                ->where('user_id', $newLeaderId)
                                ->update(['position' => 'Leader']);

            } else {
                CommunityMembers::create([
                    'communities_id' => $community->id,
                    'user_id' => $newLeaderId,
                    'position' => 'Leader',
                    'status' => 'Accepted',
                ]);
            }
        }
        //insert admin logs
        $adminLog=AdminLogs::create([
            'admin_id'=> $admin->id,
            'action' => "Edit",
            'details'=> $admin->name.' edit community ID: '.$id,
        ]);

        return redirect()->back()->with('success', 'Community updated successfully!');
       
    }
    //delete community
    public function deleteCommunity($id){
        $admin = auth('admin')->user();
        $community=Communities::findOrFail($id);

        if($community){
            $members = CommunityMembers::where('communities_id', $id)                    
                                        ->pluck('user_id');

            // Send notifications to all members
            foreach ($members as $memberId) {
                $member = User::find($memberId);
                if ($member) {
                    $member->notify(new SendNotification($admin, 'community_deletedByAdmin', $community->name));
                }
            }
            CommunityMembers::where('communities_id',$id)->delete();
            
            // Delete avatar from s3
            if ($community->avatar && $community->avatar !== 'avatar/defaultCommunity.png') {
                Storage::disk('s3')->delete($community->avatar);
            }
            $community->delete();
            //insert admin logs
            $adminLog=AdminLogs::create([
                'admin_id'=> $admin->id,
                'action' => "Delete",
                'details'=> $admin->name.' delete community account ID: '.$id,
            ]);
            return redirect()->back()->with('success', 'Community deleted successfully!');
        }else{  
            return redirect()->back()->with('error', 'Community delete unsuccessfully!');
        }
    }
    // report community
    public function blockCommunity(Request $request,$communityId){
        //return response()->json(['status' => 'success', 'commentId' => $commentId]);
        $admin=auth('admin')->user();
        $community=Communities::findOrFail($communityId);
        if(!$community){
            return back()->with('error', 'Community not found');
        }
        $data=$request->validate([
            'reason' => 'required|string|max:255',
            'details' => 'nullable|string',
            'review_notes' => 'nullable',
            'acc_block_until' => 'nullable|after:now',
        ]);
        
        //is report exist
        $reportExist=Report::where('content_type','Community')
                            ->where('content_id',$communityId)
                            ->where('user_id',$community->user_id)
                            ->exists();
        if($reportExist){
            return back()->with('error', 'Community Report exist!');
        }
        DB::transaction(function () use ($request,$communityId,$data,$community,$admin){
            //create record
            Report::create([
                'user_id' => $community->user_id,
                'content_type' => 'Community',
                'content_id' => $communityId,
                'reason' => $data['reason'],
                'details' => $data['details'],
                'status' => 'Resolved', 
                'reviewed_by'=> $admin->id,
                'review_notes' => $data['review_notes'],
                
            ]);
            //block community
            Communities::where('id', $communityId)
                ->where('created_by', $community->created_by)
                ->update(['status' => 'Block']);
            //increase number violation 
            User::where('id', $community->created_by)
                ->increment('acc_violation_count');
            //if acc_block_until != null,update acc_status -> Block ->block until acc_block_until time,then update Block to Active
            if(!empty($data['acc_block_until'])){
                $blockUntil=Carbon::parse($request->acc_block_until);
                //block user acc
                User::where('id', $community->created_by)
                    ->update([
                    'acc_status' => 'Block',
                    'acc_block_until' => $blockUntil,
                ]);
                $violationUser=User::findOrFail($community->created_by);
                //auto unblock user acc
                UnblockUserJob::dispatch($community->created_by)->delay($blockUntil);
                
                //send mail
                $subject="<h1>SEGiSpace account Blocked</h1>";
                $message = "<h1>Your community contains prohibited content.</h1>
                            <p>After review, your account [`{$violationUser->email}`] has 
                            been temporarily suspended due to a violation of our platform's 
                            guidelines: [`{$data['reason']}`]. This action is taken to maintain
                            a safe and healthy community environment.</p>
                            <p>Your account will remain blocked from [`" . now() . "`] until [`{$violationUser->acc_block_until}`]. 
                            During this period, you will not be able to log in or use any platform features.</p>
                            <p>If further violations occur after your account is reinstated, stricter actions may be taken, including permanent suspension.</p>
                            <p>Thank you for your understanding and cooperation. We encourage you to adhere to the platform rules to help maintain a positive community.</p>";
                Mail::to($violationUser->email)->send(new AccBlockMail($subject,$message));
            }
            //send notification to user
            $communityUser=User::find($community->created_by);
            $communityUser->notify(new SendNotification($admin, 'community_blockedByAdmin',$community->name));
            return back()->with('success', 'Community block successfully!');
        });
        
    }
    //show communitiy member
    public function showMemberManagementComponent($communityId){
        $community=Communities::findOrFail($communityId);
        //get members
        $members=CommunityMembers::where('communities_id',$communityId)
                                ->where('status','Accepted')
                                ->join('users','community_members.user_id','=','users.id')
                                ->select('users.id', 
                                        'users.nickname', 
                                        'users.avatar', 
                                        'users.position as user_position',
                                        'community_members.communities_id',
                                        'community_members.position as member_position') 
                                ->orderByRaw("FIELD(community_members.position, 'Leader','Admin', 'Member')")
                                ->get();
        // get all member id
        $memberUserIds = CommunityMembers::where('communities_id', $communityId)
                                        ->where('status', 'Accepted')
                                        ->pluck('user_id');
        // get user not is member
        $users = User::whereNotIn('users.id', $memberUserIds)
                    ->join('identity_verifications', 'users.id', '=', 'identity_verifications.user_id')
                    ->select('users.id', 
                            'users.nickname', 
                            'users.avatar', 
                            'users.position', 
                            'identity_verifications.faculty', 
                            'identity_verifications.course') 
                    ->get();


        return Inertia('Admin/CommunityManage/MemberManagement', [
            'community'=> $community,
            'users'=> $users,
            'members' => $members,
        ]);
    }

    // remove member
    public function deleteMember($memberId,$communityId){
        $admin = auth('admin')->user();
        $community=Communities::findOrFail($communityId);
        $member = CommunityMembers::where('communities_id', $communityId)
                                    ->where('user_id', $memberId)
                                    ->where('status', 'Accepted')
                                    ->first();

        if(!$member){
        return redirect()->back()->with('error', 'Unauthorized.');
        }
        CommunityMembers::where('communities_id', $communityId)
                        ->where('user_id', $memberId)
                        ->delete();
        //insert admin logs
        $adminLog=AdminLogs::create([
            'admin_id'=> $admin->id,
            'action' => "Delete",
            'details'=> $admin->name.' remove community member ID: '.$memberId.' from community ID: '.$communityId,
        ]);
        //send notification to member remove and leader
        User::find($memberId)->notify(new SendNotification($admin, 'communityMember_removeByAdmin',[
            'community_name'=>$community->name,
            'community_id'=>$communityId,
        ]));
        User::find($community->created_by)->notify(new SendNotification($admin, 'communityMemberRemoved_byAdmin',[
            'community_name'=>$community->name,
            'community_id'=>$communityId,
        ]));

        return redirect()->back()->with('success', 'Member already removed.');
    }

    //set member to admin
    public function setMemberToAdmin($memberId,$communityId)
    {
        $admin = auth('admin')->user();
        $community=Communities::findOrFail($communityId);
      
        $member = CommunityMembers::where('communities_id', $communityId)
                                    ->where('user_id', $memberId)
                                    ->where('status', 'Accepted')
                                    ->first();
        
        if(!$member){
            return redirect()->back()->with('error', 'Unauthorized.');
        }
        //update position to admin
        CommunityMembers::where('communities_id', $communityId)
                        ->where('user_id', $memberId)
                        ->update(['position' => 'Admin']);
        //insert admin logs
        $adminLog=AdminLogs::create([
            'admin_id'=> $admin->id,
            'action' => "Edit",
            'details'=> $admin->name.' set position [Admin] for member ID: '.$memberId.' from community ID: '.$communityId,
        ]);
        // send notification
        User::find($memberId)->notify(new SendNotification($admin, 'community_positionChangeByAdmin',[
            'community_name'=>$community->name,
            'community_id'=>$communityId,
        ]));
        User::find($community->created_by)->notify(new SendNotification($admin, 'communityPositionChange_byAdmin',[
            'community_name'=>$community->name,
            'community_id'=>$communityId,
        ]));

        return redirect()->back()->with('success', 'Member position have changed.');
    }

    //set admin to member
    public function setAdminToMember($memberId,$communityId)
    {
        $admin = auth('admin')->user();
        $community=Communities::findOrFail($communityId);

        $member = CommunityMembers::where('communities_id', $communityId)
                                    ->where('user_id', $memberId)
                                    ->where('status', 'Accepted')
                                    ->first();

        if(!$member){
            return redirect()->back()->with('error', 'Unauthorized.');
        }
        CommunityMembers::where('communities_id', $communityId)
                        ->where('user_id', $memberId)
                        ->update(['position' => 'Member']);
        
        //insert admin logs
        $adminLog=AdminLogs::create([
            'admin_id'=> $admin->id,
            'action' => "Edit",
            'details'=> $admin->name.' set position [Member] for member ID: '.$memberId.' from community ID: '.$communityId,
        ]);

        // send notification
        User::find($memberId)->notify(new SendNotification($admin, 'community_positionChangeByAdmin',[
            'community_name'=>$community->name,
            'community_id'=>$communityId,
        ]));
        User::find($community->created_by)->notify(new SendNotification($admin, 'communityPositionChange_byAdmin',[
            'community_name'=>$community->name,
            'community_id'=>$communityId,
        ]));

        return redirect()->back()->with('success', 'Member position have changed.');
    }
    //set to leader
    public function setToLeader($memberId,$communityId)
    {
        $admin = auth('admin')->user();
        $community = Communities::findOrFail($communityId);

        $member = CommunityMembers::where('communities_id', $communityId)
                                    ->where('user_id', $memberId)
                                    ->where('status', 'Accepted')
                                    ->first();

        if(!$member){
            return redirect()->back()->with('error', 'Unauthorized.');
        }

        DB::transaction(function () use ($communityId, $admin, $memberId, $community){
            CommunityMembers::where('communities_id', $communityId)
                            ->where('user_id', $community->created_by)
                            ->update(['position' => 'Member']);

            CommunityMembers::where('communities_id', $communityId)
                            ->where('user_id', $memberId)
                            ->update(['position' => 'Leader']);
            Communities::where('id', $communityId)
                    ->update(['created_by' => $memberId]);
            //insert admin logs
            $adminLog=AdminLogs::create([
                'admin_id'=> $admin->id,
                'action' => "Edit",
                'details'=> $admin->name.' set position [Leader] for member ID: '.$memberId.' from community ID: '.$communityId,
            ]);
            // send notification
            User::find($community->created_by)->notify(new SendNotification($admin, 'community_positionChangeByAdmin',[
                'community_name'=>$community->name,
                'community_id'=>$communityId,
            ]));
            User::find($memberId)->notify(new SendNotification($admin, 'community_positionChangeByAdmin',[
                'community_name'=>$community->name,
                'community_id'=>$communityId,
            ]));
        });
        return redirect()->back()->with('success', 'Member position have changed.');
    }

    //add user to community
    public function addMember($userId,$communityId){
        $admin = auth('admin')->user();
        $community=Communities::findOrFail($communityId);
        
        //check is record exist
        $isMemberPending=CommunityMembers::where('communities_id', $communityId)
                                        ->where('user_id', $userId)
                                        ->where('status','Pending')
                                        ->exists();
        //update record status
        if($isMemberPending){
            CommunityMembers::where('communities_id', $communityId)
                            ->where('user_id', $userId)
                            ->update(['status'=>'Accepted']);
            //send notification
            User::find($userId)->notify(new SendNotification($admin, 'communityInviteMember_byAdmin',[
                'community_name'=>$community->name,
                'community_id'=>$communityId,
            ]));
        }
        // create member record
        CommunityMembers::create([
            'communities_id' => $communityId,
            'user_id' => $userId,
            'status' => 'Accepted'
        ]);

        //insert admin logs
        $adminLog=AdminLogs::create([
            'admin_id'=> $admin->id,
            'action' => "Edit",
            'details'=> $admin->name.' invite user ID: '.$userId.' to join community ID: '.$communityId,
        ]);

        //send notification
        User::find($userId)->notify(new SendNotification($admin, 'communityInviteMember_byAdmin',[
            'community_name'=>$community->name,
            'community_id'=>$communityId,
        ]));
        return redirect()->back()->with('success', 'Invite Member successfully.');
    }
}
