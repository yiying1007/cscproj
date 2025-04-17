<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\AdminLogs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AdminLogsManagementController extends Controller
{
    public function showAdminLogsManagementComponent(){
        //$adminLogs=AdminLogs::orderBy('created_at', 'desc')->get();
        $adminLogs=DB::table('admin_logs')->orderBy('created_at', 'desc')->get();
        
        return Inertia('Admin/AdminLogsManagement', [
            'adminLogs'=> $adminLogs,
        ]);
    }


    public function deleteAdminLogs($adminLogs){
        
        $adminLogs=AdminLogs::findOrFail($adminLogs);
        
        if($adminLogs){
            
            $adminLogs->delete();
            
            return redirect()->back()->with('success', 'User deleted successfully!');
        }else{  
            return redirect()->back()->with('error', 'User delete unsuccessfully!');
        }
    }
}
