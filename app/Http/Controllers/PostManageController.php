<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Communities;
use App\Models\Post;
use App\Models\Report;
use App\Models\Comment;
use App\Models\Like;
use App\Models\PostType;
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

class PostManageController extends Controller
{
    //show post and its comments
    public function showPostManagementComponent(){
        //all post
        $posts = Post::leftJoin('users','users.id','=','posts.user_id')
                    ->leftJoin('post_types','post_types.id','=','posts.type_id')
                    ->select(
                        'posts.*',
                        'users.nickname',
                        'users.position',
                        'users.avatar',
                        'post_types.type_name'
                    )
                    ->latest()
                    ->get();
        
        return Inertia('Admin/PostManage/PostManagement', [
            'posts' => $posts,
        ]);
    }
    //report post
    public function showCommentManagementComponent($postId){
        if(!$postId){
            return back()->route('admin.postManagemet')->with('error', 'Something error! Not found Post ');
        }
        // post comment
        $comments=Comment::where('post_id',$postId)
                        ->get();

        return Inertia('Admin/PostManage/CommentManagement', [
            'comments' => $comments,
        ]);
    }
    public function blockPost(Request $request,$postId){
        $admin=auth('admin')->user();
        $post=Post::findOrFail($postId);
        if(!$postId){
            return back()->with('error', 'Something error! Not found Post ');
        }
        $data=$request->validate([
            'reason' => 'required|string|max:255',
            'details' => 'nullable|string',
            'review_notes' => 'nullable',
            'acc_block_until' => 'nullable|after:now',
        ]);

        //is report exist
        $reportExist=Report::where('content_type','Post')
                            ->where('content_id',$postId)
                            ->where('user_id',$post->user_id)
                            ->exists();
        if($reportExist){
            return back()->with('error', 'Post Report exist!');
        }
        DB::transaction(function () use ($request,$postId,$data,$post,$admin){
            //create record
            Report::create([
                'user_id' => $post->user_id,
                'content_type' => 'Post',
                'content_id' => $postId,
                'reason' => $data['reason'],
                'details' => $data['details'],
                'status' => 'Resolved', 
                'reviewed_by'=> $admin->id,
                'review_notes' => $data['review_notes'],
                
            ]);
            //block post
            Post::where('id', $postId)
                ->where('user_id', $post->user_id)
                ->update(['status' => 'Block']);
            //increase number violation 
            User::where('id', $post->user_id)
                ->increment('acc_violation_count');
            //if acc_block_until != null,update acc_status -> Block ->block until acc_block_until time,then update Block to Active
            if(!empty($data['acc_block_until'])){
                $blockUntil=Carbon::parse($request->acc_block_until);
                //block user acc
                User::where('id', $post->user_id)
                    ->update([
                    'acc_status' => 'Block',
                    'acc_block_until' => $blockUntil,
                ]);
                $violationUser=User::findOrFail($post->user_id);
                //auto unblock user acc
                UnblockUserJob::dispatch($post->user_id)->delay($blockUntil);
                
                //send mail
                $subject="<h1>SEGiSpace account Blocked</h1>";
                $message = "<h1>Your post contains prohibited content.</h1>
                            <p>After review, your account [`{$violationUser->email}`] has 
                            been temporarily suspended due to a violation of our platform's 
                            guidelines: [`{$data['reason']}`]. This action is taken to maintain
                            a safe and healthy community environment.</p>
                            <p>Your account will remain blocked from [`" . now() . "`] until [`{$violationUser->acc_block_until}`]. 
                            During this period, you will not be able to log in or use any platform features.</p>
                            <p>If further violations occur after your account is reinstated, stricter actions may be taken, including permanent suspension.</p>
                            <p>Thank you for your understanding and cooperation. We encourage you to adhere to the platform rules to help maintain a positive community.</p>";
                Mail::to($violationUser->email)->send(new AccBlockMail($subject,$message));
            }
            //send notification to user
            $postUserId=User::find($post->user_id);
            $postUserId->notify(new SendNotification($admin, 'postReport_byAdmin',$post->title));
            return back()->with('success', 'Post block successfully!');
        });
        
    }
    // report comment
    public function blockComment(Request $request,$commentId){
        //return response()->json(['status' => 'success', 'commentId' => $commentId]);
        $admin=auth('admin')->user();
        $comment=Comment::findOrFail($commentId);
        if(!$comment){
            return back()->with('error', 'Comment not found');
        }
        $data=$request->validate([
            'reason' => 'required|string|max:255',
            'details' => 'nullable|string',
            'review_notes' => 'nullable',
            'acc_block_until' => 'nullable|after:now',
        ]);
        
        //is report exist
        $reportExist=Report::where('content_type','Comment')
                            ->where('content_id',$commentId)
                            ->where('user_id',$comment->user_id)
                            ->exists();
        if($reportExist){
            return back()->with('error', 'Comment Report exist!');
        }
        DB::transaction(function () use ($request,$commentId,$data,$comment,$admin){
            //create record
            Report::create([
                'user_id' => $comment->user_id,
                'content_type' => 'Comment',
                'content_id' => $commentId,
                'reason' => $data['reason'],
                'details' => $data['details'],
                'status' => 'Resolved', 
                'reviewed_by'=> $admin->id,
                'review_notes' => $data['review_notes'],
                
            ]);
            //block comment
            Comment::where('id', $commentId)
                ->where('user_id', $comment->user_id)
                ->update(['status' => 'Block']);
            //increase number violation 
            User::where('id', $comment->user_id)
                ->increment('acc_violation_count');
            //if acc_block_until != null,update acc_status -> Block ->block until acc_block_until time,then update Block to Active
            if(!empty($data['acc_block_until'])){
                $blockUntil=Carbon::parse($request->acc_block_until);
                //block user acc
                User::where('id', $comment->user_id)
                    ->update([
                    'acc_status' => 'Block',
                    'acc_block_until' => $blockUntil,
                ]);
                $violationUser=User::findOrFail($comment->user_id);
                //auto unblock user acc
                UnblockUserJob::dispatch($comment->user_id)->delay($blockUntil);
                
                //send mail
                $subject="<h1>SEGiSpace account Blocked</h1>";
                $message = "<h1>Your comment contains prohibited content.</h1>
                            <p>After review, your account [`{$violationUser->email}`] has 
                            been temporarily suspended due to a violation of our platform's 
                            guidelines: [`{$data['reason']}`]. This action is taken to maintain
                            a safe and healthy community environment.</p>
                            <p>Your account will remain blocked from [`" . now() . "`] until [`{$violationUser->acc_block_until}`]. 
                            During this period, you will not be able to log in or use any platform features.</p>
                            <p>If further violations occur after your account is reinstated, stricter actions may be taken, including permanent suspension.</p>
                            <p>Thank you for your understanding and cooperation. We encourage you to adhere to the platform rules to help maintain a positive community.</p>";
                Mail::to($violationUser->email)->send(new AccBlockMail($subject,$message));
            }
            //send notification to user
            $commentUserId=User::find($comment->user_id);
            $commentUserId->notify(new SendNotification($admin, 'commentReport_byAdmin',$comment->content));
            return back()->with('success', 'Comment block successfully!');
        });
        
    }
}
