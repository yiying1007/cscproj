<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\AdminLogs;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;

class AnnouncementsManageController extends Controller
{
    public function showAnnouncementManagementComponent(){
        //all announcement
        $announcements = Announcement::leftJoin('admins','admins.id','=','announcements.admin_id')
                    ->select(
                        'announcements.*',
                        'admins.name',
                        'admins.position'
                    )
                    ->latest()
                    ->get();
        //
        return Inertia('Admin/AnnouncementManage/AnnouncementManagement', [
            'announcements' => $announcements,
        ]);
    }

    public function createAnnouncement(Request $request){
        $admin = auth('admin')->user();
        //verify input 
        $data=$request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'end_time' => 'nullable|date|after_or_equal:now',
        ]);
        
        //create announcement into db
        Announcement::create([
            'title' => $request->title,
            'content' => $request->content,
            'end_time' => $request->end_time, 
            'admin_id' => $admin->id, 
        ]);
        //insert admin logs
        AdminLogs::create([
            'admin_id'=> $admin->id,
            'action' => "Create",
            'details'=> $admin->name.' create announcement: '.$data['title'],
        ]);

        return redirect()->back()->with('success', 'Announcement create  successfully!');
        
    }

    public function editAnnouncement(Request $request,$id){
        
        $admin = auth('admin')->user();
        $announcement=Announcement::findOrFail($id);
        //validate user input
        $data=$request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'end_time' => 'nullable|date|after_or_equal:now',
        ]);

        foreach (['title', 'content', 'end_time'] as $field) {
            if (array_key_exists($field, $data)) {
                $announcement->{$field} = $data[$field];
            }
        }

        $announcement->save();
        
        //insert admin logs
        $adminLog=AdminLogs::create([
            'admin_id'=> $admin->id,
            'action' => "Edit",
            'details'=> $admin->name.' edit announcement ID: '.$id.', title: '.$data['title'],
        ]);

        return redirect()->back()->with('success', 'Announcement updated successfully!');
        
    }
    //delete
    public function deleteAnnouncement($id){
        $admin = auth('admin')->user();
        $announcement=Announcement::findOrFail($id);

        $announcement->delete();
        //insert admin logs
        $adminLog=AdminLogs::create([
            'admin_id'=> $admin->id,
            'action' => "Delete",
            'details'=> $admin->name.' delete announcement ID: '.$id.', announcement name: '.$announcement->title,
        ]);
        return redirect()->back()->with('success', 'Announcement deleted successfully!');
        
    }
}
