<?php

namespace App\Http\Controllers;


use App\Models\User;
use App\Models\Chat;
use App\Models\ChatMember;
use App\Models\Message;
use App\Models\Friendships;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;
use App\Events\MessageSent;
use Illuminate\Support\Facades\Storage;
use App\Notifications\SendNotification;


class ChatController extends Controller
{
    public function showChatComponent(){
        $userId=auth()->user()->id;

        //show chat relate with current user
        $defaultDate = '1970-01-01 00:00:00';
        $coalesce = DB::getDriverName() === 'pgsql' ? 'COALESCE' : 'IFNULL';

        $chatList = Chat::whereHas('members', function ($query) use ($userId) {
            $query->where('user_id', $userId)
                ->where('message_status', 'Active');
        })
        ->with([
            'latestMessage' => function ($query) use ($userId, $defaultDate, $coalesce) {
                $query->whereIn('chat_id', function ($subQuery) use ($userId, $defaultDate, $coalesce) {
                    $subQuery->select('chat_id')
                        ->from('chat_members')
                        ->where('user_id', $userId)
                        ->whereColumn('chat_members.chat_id', 'messages.chat_id')
                        ->whereRaw("messages.created_at > {$coalesce}(chat_members.message_status_updated, ?)", [$defaultDate]);
                });
            },
            'latestMessage.sender',
            'members.user:id,nickname,avatar'
        ])
        ->orderByDesc(
            Message::select('created_at')
                ->whereColumn('messages.chat_id', 'chats.id')
                ->latest()
                ->take(1)
        )
        ->select('chats.*')
        ->paginate(9);

        
        //show friend list(create chat)
        $friendIds = Friendships::where(function ($query) use ($userId) {
            $query->where('user_id', $userId)->orWhere('friend_id', $userId);
        })
        ->where('status', 'Accepted')
        ->get()
        // get friend id
        ->map(function ($friendship) use ($userId) {
            return $friendship->user_id === $userId ? $friendship->friend_id : $friendship->user_id;
        });

        //get friend info
        $friends = User::whereIn('id', $friendIds)
                ->get();

       
        return Inertia('User/Chat/UserChat', [
            'chatList'=>$chatList->items(),
            'hasMoreChats' => $chatList->hasMorePages(), 
            'friends'=>$friends,
        ]);
    }
    // load more posts
    public function loadMoreChats(Request $request)
    {
        $userId = Auth::id();
        $page = $request->input('page', 1);
        $perPage = 9; 

        // 查询用户参与的所有聊天（无论是否有消息）
        $chatList = Chat::whereHas('members', function ($query) use ($userId) {
            $query->where('user_id', $userId)
                ->where('message_status', 'Active'); // 只显示活跃的聊天
        })
        ->with([
            'latestMessage.sender', // 预加载最新消息及发送者
            'members.user:id,nickname,avatar' // 预加载聊天成员
        ])
        ->orderByDesc(
            Message::select('created_at')
                ->whereColumn('messages.chat_id', 'chats.id')
                ->latest()
                ->take(1)
        )
        ->select('chats.*')
        ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'chatList'=>$chatList->items(),
            'hasMoreChats' => $chatList->hasMorePages(), 
        ]);
    }
    public function showUnreadMessageNotice(){
        $userId=auth()->user()->id;
        $chatIds=ChatMember::where('user_id',$userId)
                ->pluck('chat_id');
        $unreadMessage=Message::whereIn('chat_id',$chatIds)
                ->whereNull('read_at')
                ->where('sender_id', '!=', $userId)
                ->where('status','Active')
                ->get();

        return response()->json([
            'unreadMessage'=>$unreadMessage,
        ]);
    }
    public function showMessageComponent($chatId){
        $userId=auth()->user()->id;

        $targetUser=ChatMember::where('chat_id', $chatId)
            ->where('user_id','!=', $userId)
            ->with('user')
            ->first();
        //show messages
        $chatMember = ChatMember::where('chat_id', $chatId)
                            ->where('user_id', $userId)
                            ->first();
        if (!$chatMember) {
            return redirect()->route('user.chat')->with('error', 'Something error ! chat not find');  
        }
        
        // filter message
        $query = Message::where('chat_id', $chatId)->where('status','Active');

        if ($chatMember->message_status_updated !== null) {
            // get message after `message_status_updated` 
            $query->where('created_at', '>=', $chatMember->message_status_updated)->where('status','Active');
        }
        // get messages
        $messages = $query->orderBy('created_at', 'asc')->with(['sender','chat'])->get();
        
        //update  is read status
        Message::where('chat_id', $chatId)
                ->where('sender_id', '!=', $userId) 
                ->whereNull('read_at')
                ->update(['read_at' => now()]);
        

        return Inertia('User/Chat/ChatWindow', [
            'messages'=>$messages,
            'targetUser' => $targetUser,
            
        ]);

    }
    public function markAsRead(Request $request)
    {
        $userId = auth()->id();
        $chatId = $request->chat_id;

        Message::where('chat_id', $chatId)
            ->where('sender_id', '!=', $userId) 
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['status' => 'success']);
    }

    //create chat
    public function createChat($targetUserId){
        
        $userId=auth()->user()->id;
        $targetUser=User::findOrFail($targetUserId);
        if(!$targetUser){
            return redirect()->back()->with('error', 'Something error ! Find not users');  
        }
        //check is already have chat
        $chat = Chat::where('type', 'Private')
                ->whereHas('members', function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                })
                ->whereHas('members', function ($query) use ($targetUserId) {
                    $query->where('user_id', $targetUserId);
                })
                ->first();
        
        if($chat) {
            $chatMember=ChatMember::where('chat_id',$chat->id)
                ->where('user_id',$userId)
                ->first();
            
            if($chatMember->message_status==="Inactive"){
                ChatMember::where('chat_id',$chat->id)
                ->where('user_id',$userId)
                ->update(['message_status'=>'Active']);
            }
            return redirect()->route('user.showMessage', ['chatId' => $chat->id])->with('success', 'Chat now');
        }            
        $chat = DB::transaction(function () use ($userId,$targetUserId){
            //create chat
            $chat=Chat::create([
                'type' => 'Private',
                'created_by'=>$userId,
            ]);
            //create first member
            ChatMember::create([
                'chat_id'=>$chat->id,
                'user_id'=>$userId,
            ]);
            //create second member
            ChatMember::create([
                'chat_id'=>$chat->id,
                'user_id'=>$targetUserId,
            ]);
            return $chat;
        });
        return redirect()->route('user.showMessage', ['chatId' => $chat->id])->with('success', 'Chat now');  
    }
    //delete all message
    public function deleteHistoryMessage($chat_id){
        
        $userId=auth()->user()->id;
       
        
       //update current user chat status
       $user=ChatMember::where('chat_id', $chat_id)
                ->where('user_id', $userId)
                ->update(['message_status_updated' => now()]);
        
        if (!$user) {
            return redirect()->back()->with('error', 'Something error.');
        }
        return redirect()->back()->with('success', 'Messages deleted');  
        
    }
    //delete chat
    public function deleteChat($chat_id){
        
        $userId=auth()->user()->id;
        $targetUser=ChatMember::where('chat_id',$chat_id)
                    ->where('user_id','!=',$userId)
                    ->first();
        $user=ChatMember::where('chat_id',$chat_id)
                    ->where('user_id',$userId)
                    ->first();
        if (!$user) {
            return redirect()->back()->with('error', 'Chat not found.');

        }if (!$targetUser) {
            return redirect()->back()->with('error', 'Chat not found.');
        }
        DB::transaction(function () use ($targetUser,$userId,$chat_id){
            
            //update current user chat status
            ChatMember::where('chat_id', $chat_id)
                ->where('user_id', $userId)
                ->update(['message_status_updated' => now(),
                        'message_status'=>'Inactive',
                    ]);
            $user = ChatMember::where('user_id', $userId)->first();
            if($targetUser->message_status==='Inactive' && $user->message_status === 'Inactive'){
                //delete chat
                Chat::where('id',$user->chat_id)->delete();
            }
            return redirect()->route('user.chat')->with('success', 'Chat deleted');  
        });
    }
    //delete message
    public function deleteMessage($messageId){
        
        $userId=auth()->user()->id;
        
        $message=Message::findOrFail($messageId);
        $oneDayAgo = now()->subDay();
        if($message->created_at < $oneDayAgo){
            return redirect()->back()->with('error', 'You can only delete messages within 24 hours.');
        }
        $message->delete();
        return redirect()->back()->with('success', 'Message deleted');  
    }
    //create message
    public function sendMessage(Request $request){
        $user=auth()->user();
        $data=$request->validate([
            'content' => 'nullable|string|max:800',
            'media_files' => 'nullable|mimes:jpg,jpeg,png,gif,mp4,webm,mov,avi,mp3,mpeg,wav,pdf,docx,doc,xlsx,pptx|max:20480', 
        ]);
        if (!$request->filled('content') && !$request->hasFile('media_files')) {
            return back()->with('error', 'Nothing Submitted');
        }
        $mediaUrl = null;
        //store file to s3
        if ($request->hasFile('media_files')) {
            $media = $request->file('media_files');
            $originalName = pathinfo($media->getClientOriginalName(), PATHINFO_FILENAME);
            $originalExtension = $media->getClientOriginalExtension();

            $mediaName = $user->id . '_' . time() . '.' . $media->getClientOriginalExtension();
            $path = Storage::disk('s3')->putFile('messageMedia', $media, 'public');
            $mediaUrl = Storage::disk('s3')->url($path);
        }

        $message=Message::create([
            'content' => $request->content,
            'chat_id' => $request->chat_id,
            'sender_id' => $user->id,
            'media_url' => $mediaUrl,
            'media_name' => isset($originalName) ? ($originalName . '.' . $originalExtension) : null, 
        ]);

        broadcast(new MessageSent($message))->toOthers();

        return back()->with('success', 'Message sent');
    }

    //report message
    public function reportMessage(Request $request,$messageId){
        $user = auth()->user();

        $data=$request->validate([
            'reason' => 'required|string|max:255',
            'details' => 'nullable|string',
            'review_notes' => 'nullable',
            'acc_block_until' => 'nullable|after:now',
        ]);

        $message=Message::findOrFail($messageId);
        
        $reportExist=Report::where('content_type','Chat')
                            ->where('content_id',$messageId)
                            ->where('user_id',$message->sender_id)
                            ->exists();
        if($reportExist){
            return back()->with('error', 'This message have be reported!');
        }

        if($user->position != "Admin"){
            //create record
            Report::create([
                'user_id' => $message->sender_id,
                'content_type' => 'Chat',
                'content_id' => $messageId,
                'reason' => $data['reason'],
                'details' => $data['details'],
                'status' => 'Pending', 
            ]);
            return back()->with('success', 'Message reported successfully!');
        }else{
            if($user->admin_id===null){
                return redirect()->back()->with('error', 'Operation failed. Admin account not bound yet.');
            }
            DB::transaction(function () use ($request,$user,$messageId,$data,$message){
                //check report is exist
                $report=Report::where('content_type','Chat')
                            ->where('content_id',$messageId)
                            ->first();
                if($report){
                    $report->delete();
                }
                //create record
                Report::create([
                    'user_id' => $message->sender_id,
                    'content_type' => 'Chat',
                    'content_id' => $messageId,
                    'reason' => $data['reason'],
                    'details' => $data['details'],
                    'status' => 'Resolved', 
                    'reviewed_by'=> $user->admin_id,
                    'review_notes' => $data['review_notes'],
                ]);
            
            //block post
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
                $message = "<h1>Your chat message contains prohibited content.</h1>
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
            //send notification to user
            $messageUser=User::find($message->sender_id);
            $messageUser->notify(new SendNotification($user, 'chatReport_byAdmin',$message->content));
            return back()->with('success', 'Messahe block successfully!');
            });
        }
    }

}
