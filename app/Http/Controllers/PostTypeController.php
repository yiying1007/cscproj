<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\PostType;
use App\Models\AdminLogs;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;


class PostTypeController extends Controller
{
    public function showPostTypeManagementComponent(){
        $types=PostType::all();
        return Inertia('Admin/PostTypeManage/PostTypeManagement', [
            'types'=> $types,
        ]);
    }

    public function createPostType(Request $request){
        $admin = auth('admin')->user();
        //verify input 
        $data=$request->validate([
            'type_name' => 'required|string|max:60|unique:'.PostType::class,
        ]);
        
        //create type into db
        PostType::create([
            'type_name' => $data['type_name'],
        ]);
        //insert admin logs
        AdminLogs::create([
            'admin_id'=> $admin->id,
            'action' => "Create",
            'details'=> $admin->name.' create post type: '.$data['type_name'],
        ]);

        return redirect()->back()->with('success', 'Post type create  successfully!');
        
    }

    public function editPostType(Request $request,$id){
        
        $admin = auth('admin')->user();
        $type=PostType::findOrFail($id);
        //validate user input
        $data=$request->validate([
            'type_name' => 'required|string|max:60|unique:post_types,type_name,' . $type->id,
        ]);
        $type->update(['type_name'=>$data['type_name']]);
        
        //insert admin logs
        $adminLog=AdminLogs::create([
            'admin_id'=> $admin->id,
            'action' => "Edit",
            'details'=> $admin->name.' edit post type ID: '.$id.', change type name to: '.$data['type_name'],
        ]);

        return redirect()->back()->with('success', 'Post type updated successfully!');
        
    }
    //delete
    public function deletePostType($id){
        $admin = auth('admin')->user();
        $type=PostType::findOrFail($id);

        $type->delete();
        //insert admin logs
        $adminLog=AdminLogs::create([
            'admin_id'=> $admin->id,
            'action' => "Delete",
            'details'=> $admin->name.' delete post type ID: '.$id.', type name: '.$type->type_name,
        ]);
        return redirect()->back()->with('success', 'Post type deleted successfully!');
        
    }
}
