<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\AdminLogs;
use App\Models\User;
use App\Models\IdentityVerification;
use App\Models\Communities;
use App\Models\CommunityMembers;
use App\Models\Friendships;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\AccBlockMail;
use Carbon\Carbon;
use App\Jobs\UnblockUserJob;

class UserManageController extends Controller
{
    public function showUserManagementComponent(){
        $users=User::leftJoin('identity_verifications','identity_verifications.user_id','=','users.id')
                ->select(
                    'users.*',
                    'identity_verifications.name',
                    'identity_verifications.email as segi_email',
                    'identity_verifications.role',
                    'identity_verifications.faculty',
                    'identity_verifications.course'
                )
                ->with(['admin' => function ($query) {
                    $query->select('id', 'name');
                }])
                ->get();
        $adminIds = User::whereNotNull('admin_id')->pluck('admin_id')->toArray();

        $admins = Admin::when(!empty($adminIds), function ($query) use ($adminIds) {
                return $query->whereNotIn('id', $adminIds);
            })
            ->get(['name', 'avatar', 'id']);

        $allAdmins=Admin::all();

        return Inertia('Admin/UserManage/UserManagement', [
            'users' => $users,
            'admins'=> $admins,
            'allAdmins'=> $allAdmins,
        ]);
    }
    


    public function createUser(Request $request){
        $admin = auth('admin')->user();
        //verify input 
        $data = $request->validate([
            'nickname' => 'required|string|max:60|unique:'.User::class,
            'email' => 'required|email|unique:'.User::class,
            'password' => 'required|string|min:6|confirmed',
            'gender' => 'nullable',
            'position' => 'required',
            'intro' => 'nullable|string',
        ]);
        
        if ($data['position'] === 'Admin') {
            $request->validate([
                'admin_id' => 'required',
            ]);
            $data['admin_id'] = $request->admin_id; 
        } else {
            $data['admin_id'] = null;
        }
        $defaultAvatarPath = 'avatar/defaultAvatar.png';
        //create user into db
        $user = User::create([
            'nickname' => $data['nickname'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'acc_status'=> "active",
            'avatar' => $defaultAvatarPath,
            'gender' => $data['gender'] ?? null,
            'position' => $data['position'],
            'intro' => $data['intro'] ?? null,
            'admin_id' => $data['admin_id'],
        ]);
        //insert admin logs
        $adminLog=AdminLogs::create([
            'admin_id'=> $admin->id,
            'action' => "Create",
            'details'=> $admin->name.' create user account: '.$data['email'].', role: '.$data['position'],
        ]);

        return redirect()->back()->with('success', 'User create  successfully!');
        
    }

    public function editUser(Request $request,$id){
        
        $admin = auth('admin')->user();
        $user=User::findOrFail($id);
        //validate user input
        $data=$request->validate([
            'nickname' => 'required|string|max:60|unique:users,nickname,' . $user->id,
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'gender' => 'nullable',
            'position' => 'required',
            'intro' => 'nullable|string',
            'acc_status'=>'required',
        ]);
        //admin position
        if ($data['position'] === "Admin") {
            $request->validate([
                'admin_id' => 'required',
            ]);
            $data['admin_id'] = $request->admin_id;
        } else {
            $data['admin_id'] = null;
        }
        //block status
        if ($data['acc_status'] === "Block") {
            $request->validate([
                'acc_block_until' => 'required|after:now',
                'blockReason'=>'required',
            ]);
            $data['acc_block_until'] = Carbon::parse($request->acc_block_until); 
            //auto unblock user acc
            UnblockUserJob::dispatch($user->id)->delay($data['acc_block_until']);
            $data['blockReason'] = $request->blockReason;
        } else if($data['acc_status'] === "Inactive"){
            $request->validate([
                'blockReason'=>'required'
            ]);
            $data['blockReason'] = $request->blockReason;
        }
        else {
            $data['acc_block_until'] = null;
        }
        
        foreach (['nickname', 'email', 'admin_id', 'gender', 'position', 'intro','acc_status','acc_block_until'] as $field) {
            if (array_key_exists($field, $data)) {
                $user->{$field} = $data[$field];
            }
        }
        //if password !"" then updated new password
        if ($request->filled('password')) {
            $user->password = Hash::make($data['password']);
        }
        
        $user->save();
        if($user->acc_status==="Block"){
            //increase number violation 
            $user->increment('acc_violation_count');

            //send mail to user
            $subject="<h1>SEGiSpace account Blocked</h1>";
            $message = "<h1>Your account contains prohibited content.</h1>
                        <p>After review, your account [`{$user->email}`] has 
                        been temporarily suspended due to a violation of our platform's 
                        guidelines: [{$request->blockReason}]. This action is taken to maintain
                        a safe and healthy community environment.</p>
                        <p>Your account will remain blocked from [`" . now() . "`] until [`{$user->acc_block_until}`]. 
                        During this period, you will not be able to log in or use any platform features.</p>
                        <p>If further violations occur after your account is reinstated, stricter actions may be taken, including permanent suspension.</p>
                        <p>Thank you for your understanding and cooperation. We encourage you to adhere to the platform rules to help maintain a positive community.</p>";
            Mail::to($user->email)->send(new AccBlockMail($subject,$message));
        } else if($user->acc_status==="Inactive"){
            //send mail to user
            $subject="<h1>SEGiSpace account announcement</h1>";
            $message = "<h1>Your account is set to inactive.</h1>
                        <p>After review, your account [`{$user->email}`] has been logged out and 
                        can no longer be used to log in to SEGiSpace.</p>
                        <strong>Reason:</strong><br />
                        {$request->blockReason} <br />
                        <p>Thank you for your understanding and cooperation.</p>";
            Mail::to($user->email)->send(new AccBlockMail($subject,$message));

        } else if($user->acc_status==="Active"){
            //send mail to user
            $subject="<h1>SEGiSpace account announcement</h1>";
            $message = "<h1>Your account is set to active.</h1>
                        <p>After review, your account [`{$user->email}`]
                        can now be used to log in to SEGiSpace.</p><br />
                        <p>Thank you for your understanding and cooperation.</p>";
            Mail::to($user->email)->send(new AccBlockMail($subject,$message));
        } 
        //insert admin logs
        $adminLog=AdminLogs::create([
            'admin_id'=> $admin->id,
            'action' => "Edit",
            'details'=> $admin->name.' edit user account ID: '.$id.', email: '.$user->email,
        ]);

        return redirect()->back()->with('success', 'User updated successfully!');
        
    }

    public function editUserAvatar(Request $request,$id){
        $admin = auth('admin')->user();
        $user=User::findOrFail($id);
        $data = $request->validate([
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
                
            try {
                $avatar = $request->file('avatar');
                $avatarName = $user->id . '_' . time() . '.' . $avatar->getClientOriginalExtension();
        
                // Delete old avatar
                if ($user->avatar && $user->avatar !== 'avatar/defaultAvatar.png') {
                    Storage::disk('s3')->delete($user->avatar);
                }
        
                // Upload to s3
                $path = $avatar->storeAs('avatar', $avatarName, 's3');
                Storage::disk('s3')->setVisibility($path, 'public');
        
                // Update avatar to database
                $user->avatar = 'avatar/' . $avatarName;
                $user->save();

                //insert admin logs
                $adminLog=AdminLogs::create([
                    'admin_id'=> $admin->id,
                    'action' => "Edit",
                    'details'=> $admin->name.' edit user avatar account ID: '.$id,
                ]);

                return redirect()->back()->with('success', 'User avatar updated successfully!');
            } catch (\Exception $e) {

                return redirect()->back()->with('error', 'Failed to upload avatar: ' . $e->getMessage());
            }
        }else{
            return redirect()->back()->with('error', 'Not upload new avatar. ');
        }

    }

    public function deleteUser($id){
        $admin = auth('admin')->user();
        $user=User::findOrFail($id);
        if(!$user){
            return redirect()->back()->with('error', 'User delete unsuccessfully!');  
        }
        //delete friend
        Friendships::where('user_id', $user->id)
                    ->orWhere('friend_id', $user->id)
                    ->delete();
        //delete community member record
        CommunityMembers::where('user_id', $user->id)->delete();
        
        //check user is community leader
        $userCommunities = Communities::where('created_by', $user->id)->get();
        foreach ($userCommunities as $community) {
            //transfer community leader
            $newLeader = CommunityMembers::where('communities_id', $community->id)
                                        ->orderBy('created_at', 'asc')
                                        ->first();

            if ($newLeader) {
                // change leader
                $community->update(['created_by' => $newLeader->user_id]);
                CommunityMembers::where('user_id', $newLeader->user_id)->update(['position' => 'Leader']);
            } else {
                $community->delete();
            }
        }
        //remove user_id on verification record
        IdentityVerification::where('user_id', $user->id)->update(['user_id' => null]);

        // Delete avatar from s3
        if ($user->avatar && $user->avatar !== 'avatar/defaultAvatar.png') {
            Storage::disk('s3')->delete($user->avatar);
        }
        //delete user
        $user->delete();

        //insert admin logs
        $adminLog=AdminLogs::create([
            'admin_id'=> $admin->id,
            'action' => "Delete",
            'details'=> $admin->name.' delete user account ID: '.$id.', email: '.$user->email,
        ]);
        return redirect()->back()->with('success', 'User deleted successfully!');
    }

}
