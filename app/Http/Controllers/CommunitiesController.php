<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Communities;
use App\Models\CommunityMembers;
use App\Models\IdentityVerification;
use App\Models\Friendships;
use App\Models\Post;
use App\Models\Like;
use App\Models\Comment;
use App\Models\PostType;
use App\Models\Report;
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



class CommunitiesController extends Controller
{
    //community list
    public function showCommunitiesComponent(){
        $user=auth()->user();
        $communities=Communities::where('status','Active')
                    ->paginate(6);
        $myCommunities=CommunityMembers::join('communities','community_members.communities_id','=','communities.id')
                                        ->where('community_members.user_id',$user->id)
                                        ->where('community_members.status','Accepted')
                                        ->paginate(6);
        return Inertia('User/Communities/CommunitiesList', [
            'communities'=> $communities->items(),
            'hasMoreCommunities' => $communities->hasMorePages(), 
            'myCommunities'=>$myCommunities->items(),
            'hasMoreMyCommunities' => $myCommunities->hasMorePages(), 
        ]);
    }
    // load more community
    public function loadMoreCommunities(Request $request)
    {
        $user = auth()->user();
        $page = $request->input('page', 1);
        $perPage = 6; 

        // load more communities
        $communities = Communities::where('status','Active')
                ->paginate($perPage, ['*'], 'page', $page);

        // load more myCommunities
        $myCommunities = CommunityMembers::join('communities', 'community_members.communities_id', '=', 'communities.id')
                    ->where('community_members.user_id', $user->id)
                    ->where('community_members.status', 'Accepted')
                    ->paginate($perPage, ['communities.*'], 'myPage', $page);

        return response()->json([
            'communities' => $communities->items(),
            'hasMoreCommunities' => $communities->hasMorePages(),
            'myCommunities' => $myCommunities->items(),
            'hasMoreMyCommunities' => $myCommunities->hasMorePages(),
        ]);
    }
    //community pofile
    public function showCommunityProfileComponent(Communities $community){
        $userId = auth()->user()->id;
        if(!$community){
            return redirect()->route('user.communities')->with('error', 'Something error! Not found community.');
        }
        $postTypes=PostType::all();
        //check is member or not
        $isMember = CommunityMembers::where('user_id', $userId)
                                    ->where('communities_id', $community->id)
                                    ->first(['status','position']);
        //get is private or public
        $communityType = $community->is_private;
        //check user is community leader or not
        $isLeader = $community->created_by == $userId;
        //get leader name
        $leader=User::where('id',$community->created_by)
                        ->first(['id','nickname','avatar']);
        
        //count member
        $memberCount = CommunityMembers::where('communities_id', $community->id)
                                        ->where('status', 'Accepted')
                                        ->count();
        
        //show community posts
        $posts = Post::where('posts.communities_id',$community->id)
                    ->join('communities', 'posts.communities_id', '=', 'communities.id') 
                    ->join('users', 'posts.user_id', '=', 'users.id')
                    ->leftJoin('post_types','posts.type_id','=','post_types.id')
                    ->leftJoin('community_members', function ($join) {
                        $join->on('posts.communities_id', '=', 'community_members.communities_id')
                             ->on('posts.user_id', '=', 'community_members.user_id'); 
                    })
                    ->where('posts.status', 'Active')
                    ->select('posts.*', 'communities.name as community_name','community_members.position as member_position', 'users.nickname', 'users.avatar','post_types.type_name as post_type')
                    ->latest()
                    ->paginate(6);
        
        //count community post like and return is liked
        $posts->each(function ($post) use ($userId) {
            $post->likeCount = Like::where('content_type','Post')
                                    ->where('content_id', $post->id)
                                    ->count(); 
            $post->isLiked = Like::where('content_type','Post')
                                ->where('content_id', $post->id)
                                ->where('user_id', $userId)
                                ->exists();
            
        });

        //get member list
        $members=CommunityMembers::join('users','community_members.user_id','=','users.id')
                                ->where('community_members.communities_id', $community->id)
                                ->where('community_members.status', 'Accepted')
                                ->select('users.id', 
                                        'users.nickname',          
                                        'users.avatar',         
                                        'users.position as user_position', 
                                        'community_members.communities_id',
                                        'community_members.position as member_position')
                                ->orderByRaw("FIELD(community_members.position, 'Admin', 'Member')")
                                ->paginate(6);       
        //get member request list
        $memberRequest=CommunityMembers::where('communities_id', $community->id)
                                        ->where('status', 'Pending')
                                        ->join('users','community_members.user_id','=','users.id')
                                        ->join('identity_verifications','community_members.user_id','=','identity_verifications.user_id')
                                        ->select('community_members.user_id', 
                                                'community_members.communities_id',
                                                'users.id', 
                                                'users.nickname',          
                                                'users.avatar',         
                                                'users.position',
                                                'identity_verifications.course',
                                                'identity_verifications.faculty')
                                        ->get();
        // get all member id
        $memberUserIds = CommunityMembers::where('communities_id', $community->id)
                                        ->where('status', 'Accepted')
                                        ->pluck('user_id');
        // get friend id
        $friendIds = Friendships::where(function ($query) use ($userId) {
                                    $query->where('user_id', $userId)->orWhere('friend_id', $userId);
                                })
                                ->where('status', 'Accepted')
                                ->get()
                                ->map(function ($friendship) use ($userId) {
                                    return $friendship->user_id === $userId ? $friendship->friend_id : $friendship->user_id;
                                });
        // get user not is member
        $users = User::whereIn('users.id', $friendIds)
                    ->whereNotIn('users.id', $memberUserIds)
                    ->where('users.id', '!=', $userId)
                    ->join('identity_verifications', 'users.id', '=', 'identity_verifications.user_id')
                    ->select('users.id', 
                            'users.nickname', 
                            'users.avatar', 
                            'users.position', 
                            'identity_verifications.faculty', 
                            'identity_verifications.course') 
                    ->get();
        
        return Inertia('User/Communities/CommunityProfile', [
            'community'=>$community,
            'isMember' => $isMember,
            'communityType' => $communityType,
            'isLeader'=>$isLeader,
            'leader'=>$leader,
            'memberCount' => $memberCount,
            'posts'=>$posts->items(),
            'hasMorePosts' => $posts->hasMorePages(),
            'postTypes' => $postTypes,
            'members'=> $members->items(),
            'hasMoreMembers' => $members->hasMorePages(),
            'memberRequest'=>$memberRequest,
            'users' => $users,
            'communityIsPublic' => $community->is_private,
        ]);
    }
    // load more post
    public function loadMorePosts(Request $request,Communities $community)
    {
        $page = $request->input('page', 1);
        $perPage = 6; 

        // load more posts
        $posts = Post::where('posts.communities_id',$community->id)
                    ->join('communities', 'posts.communities_id', '=', 'communities.id') 
                    ->join('users', 'posts.user_id', '=', 'users.id')
                    ->leftJoin('community_members', function ($join) {
                        $join->on('posts.communities_id', '=', 'community_members.communities_id')
                             ->on('posts.user_id', '=', 'community_members.user_id'); // ✅ 只获取发帖者的职位
                    })
                    ->where('posts.status', 'Active')
                    ->select('posts.*', 'communities.name as community_name','community_members.position as member_position', 'users.nickname', 'users.avatar')
                    ->latest()
                    ->paginate($perPage, ['*'], 'page', $page);
        
        return response()->json([
            'posts'=>$posts->items(),
            'hasMorePosts' => $posts->hasMorePages(), 
        ]);
    }
    
    /*
    //community member
    public function showCommunityMemberComponent($communityId){
        $userId = auth()->user()->id;

        $community=Communities::findOrFail($communityId);

        $userMemberPosition = CommunityMembers::where('user_id', $userId)
                                        ->where('communities_id', $communityId)
                                        ->value('position');
        //check is member or not
        $isMember = CommunityMembers::where('user_id', $userId)
                                    ->where('communities_id', $communityId)
                                    ->first(['status','position']);
        
        //check is admin or not
        $isAdmin = $userMemberPosition == 'Admin' || $userMemberPosition == 'Leader';

        //get member list
        $members=CommunityMembers::join('users','community_members.user_id','=','users.id')
                                ->where('community_members.communities_id', $communityId)
                                ->where('community_members.status', 'Accepted')
                                ->select('users.id', 
                                        'users.nickname',          
                                        'users.avatar',         
                                        'users.position as user_position', 
                                        'community_members.communities_id',
                                        'community_members.position as member_position')
                                ->orderByRaw("FIELD(community_members.position, 'Admin', 'Member')")
                                ->paginate(6);       
        //get member request list
        $memberRequest=CommunityMembers::where('communities_id', $communityId)
                                        ->where('status', 'Pending')
                                        ->join('users','community_members.user_id','=','users.id')
                                        ->join('identity_verifications','community_members.user_id','=','identity_verifications.user_id')
                                        ->select('community_members.user_id', 
                                                'community_members.communities_id',
                                                'users.id', 
                                                'users.nickname',          
                                                'users.avatar',         
                                                'users.position',
                                                'identity_verifications.course',
                                                'identity_verifications.faculty')
                                        ->get();
        // get all member id
        $memberUserIds = CommunityMembers::where('communities_id', $communityId)
                                        ->where('status', 'Accepted')
                                        ->pluck('user_id');
        // get friend id
        $friendIds = Friendships::where(function ($query) use ($userId) {
                                    $query->where('user_id', $userId)->orWhere('friend_id', $userId);
                                })
                                ->where('status', 'Accepted')
                                ->get()
                                ->map(function ($friendship) use ($userId) {
                                    return $friendship->user_id === $userId ? $friendship->friend_id : $friendship->user_id;
                                });
        // get user not is member
        $users = User::whereIn('users.id', $friendIds)
                    ->whereNotIn('users.id', $memberUserIds)
                    ->where('users.id', '!=', $userId)
                    ->join('identity_verifications', 'users.id', '=', 'identity_verifications.user_id')
                    ->select('users.id', 
                            'users.nickname', 
                            'users.avatar', 
                            'users.position', 
                            'identity_verifications.faculty', 
                            'identity_verifications.course') 
                    ->get();
        
        return response()->json([
            'members'=> $members->items(),
            'hasMoreMembers' => $members->hasMorePages(), 
            'memberRequest'=>$memberRequest,
            'communityId' =>$communityId,
            'users' => $users,
            'communityIsPublic' => $community->is_private,
            'isAdmin' => $isAdmin,
        ]);
    }
    */
    // load more community members
    public function loadMoreCommunityMembers(Request $request,Communities $community)
    {
        $page = $request->input('page', 1);
        $perPage = 6; 

        // load more communities member
        $members=CommunityMembers::join('users','community_members.user_id','=','users.id')
                                ->where('community_members.communities_id', $community->id)
                                ->where('community_members.status', 'Accepted')
                                ->select('users.id', 
                                        'users.nickname',          
                                        'users.avatar',         
                                        'users.position as user_position', 
                                        'community_members.communities_id',
                                        'community_members.position as member_position')
                                ->orderByRaw("FIELD(community_members.position, 'Admin', 'Member')")
                                ->paginate($perPage, ['*'], 'page', $page);          

        return response()->json([
            'members'=> $members->items(),
            'hasMoreMembers' => $members->hasMorePages(),
        ]);
    }
    /*
    public function showCommunityEditComponent($communityId){

        //get community info
        $community=Communities::where('id',$communityId)->first();

        return Inertia('User/Communities/CommunityEdit', [
            'community'=>$community,
            'communityId' =>$communityId,
        ]);
    }*/

    //join community
    public function joinCommunity(Request $request,$communityId){
        $userId = auth()->user()->id;
        $isMember = CommunityMembers::where('user_id', $userId)
                                    ->where('communities_id', $communityId)
                                    ->exists();
        if($isMember){
            return redirect()->back()->with('error', ' Already join the community.');
        }

        CommunityMembers::create([
            'communities_id' => $communityId,
            'user_id' => $userId,
            'position' => 'Member',
            'status' => 'Accepted',
        ]);
        return redirect()->back()->with('success', ' Successfully joined the community.');

    }
    //request community
    public function sendCommunityRequest(Request $request,$communityId){
        $userId = auth()->user()->id;
        $community=Communities::findOrFail($communityId);
        
        //check request is exist
        $existRequest=CommunityMembers::where('user_id',$userId)
                                        ->where('communities_id', $communityId)
                                        ->where('status','Pending')
                                        ->first();
        if($existRequest){
            return redirect()->back()->with('error', ' Already send the join request.');
        }
        //create record
        CommunityMembers::create([
            'communities_id' => $communityId,
            'user_id' => $userId,
            'position' => 'Member',
            'status' => 'Pending',
        ]);
        return redirect()->back()->with('success', ' Community join request send successfully.');
    }
    //exit community
    public function exitCommunity(Request $request,$communityId){
        $userId = auth()->user()->id;
        $community=Communities::findOrFail($communityId);
        if(!$community){
            return redirect()->back()->with('error', ' Not found the community.');
            
        }
        $isMember = CommunityMembers::where('user_id', $userId)
                                    ->where('communities_id', $communityId)
                                    ->exists();
        if(!$isMember){
            return redirect()->back()->with('error', ' Not the member for this community.');
        }
        //delete
        CommunityMembers::where('user_id', $userId)
                        ->where('communities_id', $communityId)
                        ->delete();

        return redirect()->back()->with('success', ' Successfully exit the community.');
    }
    //accept request
    public function acceptMemberRequest($memberId,$communityId)
    {
        $user=auth()->user();
        $communityName=Communities::where('id', $communityId)
                                ->value('name');
        $memberRequest = CommunityMembers::where('communities_id', $communityId)
                                        ->where('user_id', $memberId)
                                        ->where('status', 'Pending')
                                        ->first();
        if(!$memberRequest){
            return redirect()->back()->with('error', 'Unauthorized.');
        }
        CommunityMembers::where('communities_id', $communityId)
                        ->where('user_id', $memberId)
                        ->update(['status' => 'Accepted']);
        
        // send notification
        $sender=User::findOrFail($memberId); 
        $sender->notify(new SendNotification($user, 'community_accept',[
            'community_name'=>$communityName,
            'community_id'=>$communityId,
        ]));
        return redirect()->back()->with('success', 'Member request accepted.');

    }
    //reject request
    public function rejectMemberRequest($memberId,$communityId)
    {
        $memberRequest = CommunityMembers::where('communities_id', $communityId)
                                        ->where('user_id', $memberId)
                                        ->where('status', 'Pending')
                                        ->first();

        if(!$memberRequest){
            return redirect()->back()->with('error', 'Unauthorized.');
        }
        CommunityMembers::where('communities_id', $communityId)
                        ->where('user_id', $memberId)
                        ->delete();
        
        
        return redirect()->back()->with('success', 'Member request rejected.');

    }
    //create community
    public function createCommunity(Request $request){
        $userId=auth()->user()->id;
        $data=$request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|max:255',
            'type' => 'required',
            'is_private' => 'required',
        ]);

        $defaultAvatarPath = 'avatar/defaultCommunity.png';
        //store into db
        $community = Communities::create([
            'name' => $data['name'],
            'description' => $data['description'],
            'avatar' => $defaultAvatarPath,
            'type' => $data['type'],
            'created_by' => $userId,
            'is_private' => $data['is_private'],
        ]);

        if($community){
            CommunityMembers::create([
                'communities_id' => $community->id,
                'user_id'=>$userId,
                'position'=>'Leader',
                'status'=>'Accepted',
            ]);
        }
        return redirect()->back()->with('success', 'Community created successfully. ');

    }
    //edit community
    public function editCommunity(Request $request,$id){
        $community=Communities::findOrFail($id);
        //validate user input
        $data=$request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|max:255',
            'type' => 'required',
            'is_private' => 'required',
        ]);
        foreach (['name','description', 'type','is_private'] as $field) {
            if (array_key_exists($field, $data)) {
                $community->{$field} = $data[$field];
            }
        }
        $community->save();
        return redirect()->route('user.communityProfile', ['community' => $id])->with('success', 'Community updated successfully!');
    }
    //edit avatar community
    public function communityAvatarEdit(Request $request,$id){
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
                return redirect()->back()->with('success', 'Community avatar updated successfully!');
            } catch (\Exception $e) {

                return redirect()->back()->with('error', 'Failed to upload avatar: ' . $e->getMessage());
            }
        }else{
            return redirect()->back()->with('error', 'Not upload new avatar. ');
        }
    }
    //leave member
    public function deleteCommunityMember($memberId,$communityId){
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

        return redirect()->back()->with('success', 'Member already removed.');
    }
    //set member to admin
    public function setMemberToAdmin($memberId,$communityId)
    {
        $user=auth()->user();
        $communityName=Communities::where('id', $communityId)
                                ->value('name');
        $member = CommunityMembers::where('communities_id', $communityId)
                                    ->where('user_id', $memberId)
                                    ->where('status', 'Accepted')
                                    ->first();

        if(!$member){
            return redirect()->back()->with('error', 'Unauthorized.');
        }
        CommunityMembers::where('communities_id', $communityId)
                        ->where('user_id', $memberId)
                        ->update(['position' => 'Admin']);
        
        // send notification
        $sender=User::findOrFail($memberId); 
        $sender->notify(new SendNotification($user, 'community_positionChange',[
            'community_name'=>$communityName,
            'community_id'=>$communityId,
        ]));
        return back()->with('success', 'Member position have changed.');

    }
    //set admin to member
    public function setAdminToMember($memberId,$communityId)
    {
        $user=auth()->user();
        $communityName=Communities::where('id', $communityId)
                                ->value('name');
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
        
        // send notification
        $sender=User::findOrFail($memberId); 
        $sender->notify(new SendNotification($user, 'community_positionChange',[
            'community_name'=>$communityName,
            'community_id'=>$communityId,
        ]));
        return redirect()->back()->with('success', 'Member position have changed.');

    }
    //set to leader
    public function setToLeader($memberId,$communityId)
    {
        $user=auth()->user();
        $community = Communities::findOrFail($communityId);

        $member = CommunityMembers::where('communities_id', $communityId)
                                    ->where('user_id', $memberId)
                                    ->where('status', 'Accepted')
                                    ->first();

        if(!$member){
            return redirect()->back()->with('error', 'Unauthorized.');
        }
        DB::transaction(function () use ($communityId, $user, $memberId, $community){
            CommunityMembers::where('communities_id', $communityId)
                            ->where('user_id', $user->id)
                            ->update(['position' => 'Member']);

            CommunityMembers::where('communities_id', $communityId)
                            ->where('user_id', $memberId)
                            ->update(['position' => 'Leader']);
            Communities::where('id', $communityId)
                    ->update(['created_by' => $memberId]);
            // send notification
            $sender=User::findOrFail($memberId); 
            $sender->notify(new SendNotification($user, 'community_positionChange',[
                'community_name'=>$community->name,
                'community_id'=>$communityId,
            ]));
        });
        
        return redirect()->back()->with('success', 'Member position have changed.');

    }
    //delete community
    public function deleteCommunity($communityId){
        $user = auth()->user();
        $community=Communities::findOrFail($communityId);

        if($community){
            $members = CommunityMembers::where('communities_id', $communityId)
                                        ->where('user_id', '!=', $user->id)                       
                                        ->pluck('user_id');

            // Send notifications to all members
            foreach ($members as $memberId) {
                $member = User::find($memberId);
                if ($member) {
                    $member->notify(new SendNotification($user, 'community_deleted', $community->name));
                }
            }
            //$path = $community->avatar;
            CommunityMembers::where('communities_id',$communityId)->delete();
            //delete report
            Report::where('content_id',$communityId)
                ->where('content_type','Community')
                ->delete();
            Post::where('communities_id',$communityId)
                ->update(['communities_id'=> null]);
            
            // Delete avatar from s3
            if ($community->avatar && $community->avatar !== 'avatar/defaultCommunity.png') {
                Storage::disk('s3')->delete($community->avatar);
            }
            $community->delete();
            
            return redirect()->route('user.communities')->with('success', 'Community deleted successfully!');
        }else{  
            return redirect()->back()->with('error', 'Community delete unsuccessfully!');
        }
    }

    //invite member
    public function inviteMember($userId,$communityId){
        $currentUser = auth()->user();
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
            User::find($userId)->notify(new SendNotification($currentUser, 'community_inviteMember',[
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
        //send notification
        User::find($userId)->notify(new SendNotification($currentUser, 'community_inviteMember',[
            'community_name'=>$community->name,
            'community_id'=>$communityId,
        ]));
        return redirect()->back()->with('success', 'Invite Member successfully.');

    }
    //report community
    public function reportCommunity(Request $request,$communityId){
        $user = auth()->user();

        $data=$request->validate([
            'reason' => 'required|string|max:255',
            'details' => 'nullable|string',
            'review_notes' => 'nullable',
            'acc_block_until' => 'nullable|after:now',
        ]);

        $community=Communities::findOrFail($communityId);
        
        $reportExist=Report::where('content_type','Community')
                            ->where('content_id',$communityId)
                            ->where('user_id',$community->created_by)
                            ->exists();
        if($reportExist){
            return back()->with('error', 'This community have be reported!');
        }

        if($user->position != "Admin"){
            //create record
            Report::create([
                'user_id' => $community->created_by,
                'content_type' => 'Community',
                'content_id' => $communityId,
                'reason' => $data['reason'],
                'details' => $data['details'],
                'status' => 'Pending', 
            ]);
            return back()->with('success', 'Community reported successfully!');
        }else{
            if($user->admin_id===null){
                return redirect()->back()->with('error', 'Operation failed. Admin account not bound yet.');
            }
            DB::transaction(function () use ($request,$user,$communityId,$data,$community){
                //check report is exist
                $report=Report::where('content_type','Community')
                            ->where('content_id',$communityId)
                            ->first();
                if($report){
                    $report->delete();
                }
                //create record
                Report::create([
                    'user_id' => $community->created_by,
                    'content_type' => 'Community',
                    'content_id' => $communityId,
                    'reason' => $data['reason'],
                    'details' => $data['details'],
                    'status' => 'Resolved', 
                    'reviewed_by'=> $user->admin_id,
                    'review_notes' => $data['review_notes'],
                ]);
            
            //block post
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
                            <p>After review, your account [{$violationUser->email}] has 
                            been temporarily suspended due to a violation of our platform's 
                            guidelines: [{$data['reason']}]. This action is taken to maintain
                            a safe and healthy community environment.</p>
                            <p>Your account will remain blocked from [" . now() . "] until [{$violationUser->acc_block_until}]. 
                            During this period, you will not be able to log in or use any platform features.</p>
                            <p>If further violations occur after your account is reinstated, stricter actions may be taken, including permanent suspension.</p>
                            <p>Thank you for your understanding and cooperation. We encourage you to adhere to the platform rules to help maintain a positive community.</p>";
                Mail::to($violationUser->email)->send(new AccBlockMail($subject,$message));
            }
            //send notification to member
            $members = CommunityMembers::where('communities_id', $communityId)                    
                                        ->pluck('user_id');

            // Send notifications to all members
            foreach ($members as $memberId) {
                $member = User::find($memberId);
                if ($member) {
                    $member->notify(new SendNotification($user, 'community_blockedByAdmin', $community->name));
                }
            }
            CommunityMembers::where('communities_id',$communityId)->delete();
            Post::where('communities_id',$communityId)->update(['status'=>'Block']);
            return back()->with('success', 'Community block successfully!');
            });
        }
    }
}   

