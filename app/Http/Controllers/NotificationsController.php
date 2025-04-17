<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationsController extends Controller
{
    //show notification data
    public function showNotificationComponent(Request $request){
        $user=auth()->user();
        //get notification data
        $unreadNotifications = $request->user()->unreadNotifications;
        $readNotifications = $request->user()->notifications()
                        ->whereNotNull('read_at') 
                        ->latest('read_at') 
                        //->take(5)
                        ->get();
        
        return response()->json([
            'unreadNotifications' => $unreadNotifications,
            'readNotifications' => $readNotifications,
        ]);
    }
    //update notification as read
    public function markAsRead(Request $request)
    {
        auth()->user()->unreadNotifications->markAsRead();
    }
    //delete all notification
    public function clearAll(Request $request)
    {
        $user = $request->user();
        $user->notifications()->delete();

    }
}
