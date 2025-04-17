<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\AdminLogs;
use App\Models\User;
use App\Models\IdentityVerification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class UserIdentityManageController extends Controller
{
    public function showUserIdentityManagementComponent(){
        $identity=IdentityVerification::leftJoin('users','identity_verifications.user_id','=','users.id')
                ->select(
                    'identity_verifications.*',
                    'users.nickname',
                    'users.email as acc_email',
                    'users.gender',
                    'users.acc_status'
                )
                ->get();

        $userIds = IdentityVerification::whereNotNull('user_id')->pluck('user_id')->toArray();

        $users = User::when(!empty($userIds), function ($query) use ($userIds) {
                return $query->whereNotIn('id', $userIds);
            })
            ->get(['nickname','position', 'avatar', 'id']);

        $allUsers=User::all();

        return Inertia('Admin/UserIdentityManage/UserIdentityManagement', [
            'identity'=> $identity,
            'users'=> $users,
            'allUsers'=> $allUsers,
        ]);
    }
    


    public function createUserIdentity(Request $request){
        $admin = auth('admin')->user();
        //verify input 
        $data = $request->validate([
            'name' => [
                'required',
                'regex:/^[a-zA-Z\s]+$/',
                'max:60',
                'unique:' . IdentityVerification::class,
            ],
            'email' => [
                'required',
                'email',
                'regex:/^[a-zA-Z0-9._%+-]+@(segi4u\.my|segi\.edu\.my)$/',
                'unique:' . IdentityVerification::class,
            ],
            'role' => 'required',
            'course' => 'nullable',
            'faculty'=> 'nullable',
            'user_id' => 'nullable',
        ]);
        //check user position 
        if (!empty($data['user_id'])) {
            $user = User::findOrFail($data['user_id']);
            
            // remove admin id when position != admin
            $updateData = ['position' => $data['role']];
            if ($user->position === "Admin" && $user->position !== $data['role']) {
                $updateData['admin_id'] = null;
            }
            User::where('id', $user->id)->update($updateData);
        }
        
        //create identity into db
        $identity = IdentityVerification::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'],
            'course' => $data['course'],
            'faculty' => $data['faculty'],
            'user_id' => $data['user_id'],
        ]);
        //insert admin logs
        $adminLog=AdminLogs::create([
            'admin_id'=> $admin->id,
            'action' => "Create",
            'details'=> $admin->name.' create user identity: '.$data['email'].', role: '.$data['role'],
        ]);

        return redirect()->back()->with('success', 'Identity create  successfully!');
        
    }

    public function editUserIdentity(Request $request,$id){
        
        $admin = auth('admin')->user();
        $identity=IdentityVerification::findOrFail($id);
        //validate user input
        $data=$request->validate([
            'name' => 'required|regex:/^[a-zA-Z\s]+$/|max:60|unique:identity_verifications,name,' . $identity->id,
            //'email' => 'required|email|unique:identity_verifications,email,' . $identity->id,
            'email' => 'required|email|regex:/^[a-zA-Z0-9._%+-]+@segi4u\.my$/|unique:identity_verifications,email,' . $identity->id,
            'role' => 'required',
            'course' => 'nullable',
            'faculty' => 'nullable',
            'user_id' => 'nullable|numeric',
        ]);
        //check user position 
        if (!empty($data['user_id'])) {
            $user = User::findOrFail($data['user_id']);
        
            if ($user->position != $data['role']) {
                User::where('id', $user->id)
                    ->update(['position' => $data['role']]);
            }
        }

        foreach (['name','email', 'role','faculty','course', 'user_id'] as $field) {
            if (array_key_exists($field, $data)) {
                $identity->{$field} = $data[$field];
            }
        }
        $identity->save();
            
        //insert admin logs
        $adminLog=AdminLogs::create([
            'admin_id'=> $admin->id,
            'action' => "Edit",
            'details'=> $admin->name.' edit user identity ID: '.$id.', email: '.$identity->email,
        ]);

        return redirect()->back()->with('success', 'Identity updated successfully!');
        
    }

    public function deleteUserIdentity($id){
        $admin = auth('admin')->user();
        $identity=IdentityVerification::findOrFail($id);
        
        if($identity){
            
            $identity->delete();
            //insert admin logs
            $adminLog=AdminLogs::create([
                'admin_id'=> $admin->id,
                'action' => "Delete",
                'details'=> $admin->name.' delete user identity ID: '.$id.', email: '.$identity->email,
            ]);
            return redirect()->back()->with('success', 'Identity deleted successfully!');
        }else{  
            return redirect()->back()->with('error', 'Identity delete unsuccessfully!');
        }
    }
}
