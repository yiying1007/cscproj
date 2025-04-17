<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\AdminLogs;
use App\Models\Chat;
use App\Models\Message;
use App\Models\WordSensitive;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use App\Notifications\SendNotification;

class ChatManagementController extends Controller
{
    // Show the chat management component
    public function showChatManageComponent()
    {
        $sensitiveWords = WordSensitive::pluck('word')->toArray();
        //filler message ,show messages that contain sensitive word
        $messages = Message::where(function ($query) use ($sensitiveWords) {
            foreach ($sensitiveWords as $word) {
                $query->orWhere('content', 'LIKE', "%{$word}%");
            }
        })
        ->with('sender') 
        ->orderBy('created_at', 'desc')
        ->get();
        
        return Inertia::render('Admin/ChatManage/ChatManagement', [
            'messages' => $messages,
        ]);
    }
    // block chat
    public function blockChat(Request $request,$messageId){
        $admin=auth('admin')->user();
        $message=Message::findOrFail($messageId);
        if(!$message){
            return back()->with('error', 'Message not found');
        }
        $data=$request->validate([
            'reason' => 'required|string|max:255',
            'details' => 'nullable|string',
            'review_notes' => 'nullable',
            'acc_block_until' => 'nullable|after:now',
        ]);
        
        //is report exist
        $reportExist=Report::where('content_type','Chat')
                            ->where('content_id',$messageId)
                            ->where('user_id',$message->sender_id)
                            ->exists();
        if($reportExist){
            return back()->with('error', 'Chat Report exist!');
        }
        DB::transaction(function () use ($request,$messageId,$data,$message,$admin){
            //create record
            Report::create([
                'user_id' => $message->sender_id,
                'content_type' => 'Chat',
                'content_id' => $messageId,
                'reason' => $data['reason'],
                'details' => $data['details'],
                'status' => 'Resolved', 
                'reviewed_by'=> $admin->id,
                'review_notes' => $data['review_notes'],
            ]);
            //block message
            Message::where('id', $messageId)
                ->where('sender_id', $message->sender_id)
                ->update(['status' => 'Block']);
            //increase number violation 
            User::where('id', $message->sender_id)
                ->increment('acc_violation_count');
            //if acc_block_until != null,update acc_status -> Block ->block until acc_block_until time,then update Block to Active
            if(!empty($data['acc_block_until'])){
                $blockUntil=Carbon::parse($request->acc_block_until);
                //block user acc
                User::where('id', $message->sender_id)
                    ->update([
                    'acc_status' => 'Block',
                    'acc_block_until' => $blockUntil,
                ]);
                $violationUser=User::findOrFail($message->sender_id);
                //auto unblock user acc
                UnblockUserJob::dispatch($message->sender_id)->delay($blockUntil);
                
                //send mail
                $subject="<h1>SEGiSpace account Blocked</h1>";
                $emailMessage = "<h1>Your message contains prohibited content.</h1>
                            <p>After review, your account [`{$violationUser->email}`] has 
                            been temporarily suspended due to a violation of our platform's 
                            guidelines: [`{$data['reason']}`]. This action is taken to maintain
                            a safe and healthy community environment.</p>
                            <p>Your account will remain blocked from [`" . now() . "`] until [`{$violationUser->acc_block_until}`]. 
                            During this period, you will not be able to log in or use any platform features.</p>
                            <p>If further violations occur after your account is reinstated, stricter actions may be taken, including permanent suspension.</p>
                            <p>Thank you for your understanding and cooperation. We encourage you to adhere to the platform rules to help maintain a positive community.</p>";
                Mail::to($violationUser->email)->send(new AccBlockMail($subject,$emailMessage));
            }
            //send notification to user
            $senderUser=User::find($message->sender_id);
            $senderUser->notify(new SendNotification($admin, 'chatReport_byAdmin',$message->content? $message->content: $media_name));
            return back()->with('success', 'Message block successfully!');
        });
        
    }

}
