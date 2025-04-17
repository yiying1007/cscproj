<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\AdminLogs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class AdminManageController extends Controller
{
    public function showAdminManagementComponent(){
        $admins=Admin::all();
        return Inertia('Admin/AdminManage/AdminManagement', [
            'admins'=> $admins,
        ]);
    }

    public function createAdmin(Request $request){
        $admin_login = auth('admin')->user();
        //verify input 
        $data=$request->validate([
            'name' => 'required|regex:/^[a-zA-Z\s]+$/|max:60|unique:'.Admin::class,
            'email' => 'required|email|unique:'.Admin::class,
            'password' => 'required|string|min:6|confirmed',
            'password_confirmation' => 'required|string|min:6',
            'gender' => 'required',
            'position' => 'required',
        ]);

        
        $defaultAvatarPath = 'avatar/defaultAdmin.png';
        //create user into db
        $admin = Admin::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'avatar' => $defaultAvatarPath,
            'gender' => $data['gender'],
            'position' => $data['position'],
        ]);
        //insert admin logs
        $adminLog=AdminLogs::create([
            'admin_id'=> $admin_login->id,
            'action' => "Create",
            'details'=> $admin_login->name.' create admin account: '.$data['email'].', role: '.$data['position'],
        ]);

        return redirect()->back()->with('success', 'Admin create  successfully!');
        
    }

    public function editAdmin(Request $request,$id){
        
        $admin_login = auth('admin')->user();
        $admin=Admin::findOrFail($id);
        //validate user input
        $data=$request->validate([
            'name' => 'required|string|max:60|unique:admins,name,' . $admin->id,
            'email' => 'required|email|unique:admins,email,' . $admin->id,
            'password' => 'nullable|string|min:6',
            'gender' => 'required',
            'position' => 'required',
        ]);
        
        foreach (['name','email', 'gender', 'position'] as $field) {
            if (array_key_exists($field, $data)) {
                $admin->{$field} = $data[$field];
            }
        }
        //if password !"" then updated new password
        if ($request->filled('password')) {
            $admin->password = Hash::make($data['password']);
        }
        
        $admin->save();
            
        //insert admin logs
        $adminLog=AdminLogs::create([
            'admin_id'=> $admin_login->id,
            'action' => "Edit",
            'details'=> $admin_login->name.' edit admin account ID: '.$id.', email: '.$admin->email,
        ]);

        return redirect()->back()->with('success', 'User updated successfully!');
        
    }

    public function editAdminAvatar(Request $request,$id){
        $admin_login = auth('admin')->user();
        $admin=Admin::findOrFail($id);
        $data = $request->validate([
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
                
            try {
                $avatar = $request->file('avatar');
                $avatarName = $admin->id . '_' . time() . '.' . $avatar->getClientOriginalExtension();
        
                // Delete old avatar
                if ($admin->avatar && $admin->avatar !== 'avatar/defaultAdmin.png') {
                    Storage::disk('s3')->delete($admin->avatar);
                }
        
                // Upload to s3
                $path = $avatar->storeAs('avatar', $avatarName, 's3');
                Storage::disk('s3')->setVisibility($path, 'public');
        
                // Update avatar to database
                $admin->avatar = 'avatar/' . $avatarName;
                $admin->save();

                //insert admin logs
                $adminLog=AdminLogs::create([
                    'admin_id'=> $admin_login->id,
                    'action' => "Edit",
                    'details'=> $admin_login->name.' edit admin avatar account ID: '.$id,
                ]);

                return redirect()->back()->with('success', 'Admin avatar updated successfully!');
            } catch (\Exception $e) {

                return redirect()->back()->with('error', 'Failed to upload avatar: ' . $e->getMessage());
            }
        }else{
            return redirect()->back()->with('error', 'Not upload new avatar. ');
        }
        
        


    }

    public function deleteAdmin($id){
        $admin_login = auth('admin')->user();
        $admin=Admin::findOrFail($id);

        if($id == $admin_login->id){
            return redirect()->back()->with('error', 'Warning! Cannot delete yourself account.');
        }else{
            if($admin){
                $path = $admin->avatar;
                // Delete avatar from s3
                if ($admin->avatar && $admin->avatar !== 'avatar/defaultAdmin.png') {
                    Storage::disk('s3')->delete($admin->avatar);
                }
                $admin->delete();
                //insert admin logs
                $adminLog=AdminLogs::create([
                    'admin_id'=> $admin_login->id,
                    'action' => "Delete",
                    'details'=> $admin_login->name.' delete admin account ID: '.$id.', email: '.$admin->email,
                ]);
                return redirect()->back()->with('success', 'Admin deleted successfully!');
            }else{  
                return redirect()->back()->with('error', 'Admin delete unsuccessfully!');
            }
        }
        
    }
}
