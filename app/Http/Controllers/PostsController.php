<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Communities;
use App\Models\Post;
use App\Models\Report;
use App\Models\Comment;
use App\Models\Like;
use App\Models\Friendships;
use App\Models\CommunityMembers;
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
use App\Events\CommentCreated;

class PostsController extends Controller
{
    public function showIndexPostsComponent(Request $request){
        $userId = Auth::id();
        $typeFilter = $request->query('type'); 
        $postTypes=PostType::all();
        $communityIds = CommunityMembers::where('user_id', $userId)
        ->pluck('communities_id')->toArray();
        $friendIds  = Friendships::where(function ($query) use ($userId) {
            $query->where('user_id', $userId)
                  ->where('status', 'Accepted');
        })
        ->orWhere(function ($query) use ($userId) {
            $query->where('friend_id', $userId)
                  ->where('status', 'Accepted');
        })
        ->selectRaw("CASE 
        WHEN user_id = ? THEN friendships.friend_id 
        ELSE user_id 
        END as friend_id", [$userId])
        ->pluck('friend_id')
        ->toArray();

        //show user post,friend post and community member post
        $partialPost = Post::leftJoin('users', 'posts.user_id', '=', 'users.id')
        ->leftJoin('post_types', 'posts.type_id', '=', 'post_types.id')
        ->leftJoin('communities', 'posts.communities_id', '=', 'communities.id')
        ->leftJoin('community_members', function ($join) use ($userId) {
            $join->on('posts.communities_id', '=', 'community_members.communities_id')
                 ->where('community_members.user_id', '=', $userId);
        })
        ->when($typeFilter && $typeFilter !== 'all', function ($query) use ($typeFilter) {
            $query->where('post_types.type_name', $typeFilter);
        })
        ->where(function ($query) use ($userId, $friendIds, $communityIds) {
            // show current user post
            $query->where('posts.user_id', $userId) 
                ->orWhere(function ($subQuery) use ($friendIds, $communityIds) {
                    $subQuery->whereIn('posts.user_id', $friendIds)
                            ->where(function ($q) use ($communityIds) {
                                $q->whereNull('posts.communities_id') //show public post
                                ->orWhere('communities.is_private', 'Public') // 公开社区
                                ->orWhere(function ($subQ) { 
                                $subQ->whereNotNull('community_members.user_id')
                                    ->where('community_members.status', 'Accepted'); // ✅ 只允许 Accepted
                                });
                            });
                })
                ->orWhereIn('posts.communities_id', function ($q) use ($userId) {
                    $q->select('communities_id')
                      ->from('community_members')
                      ->where('user_id', $userId)
                      ->where('status', 'Accepted'); 
                });
        })
        ->where('posts.status', 'Active')
        ->where('posts.is_private', 'Public')
        ->select('posts.*', 'users.nickname', 'users.avatar', 'communities.name as community_name','post_types.type_name as post_type')
        ->latest()
        ->paginate(6);
        
        //like count in each post
        $partialPost->each(function ($post) use ($userId) {
            $post->likeCount = Like::where('content_type','Post')
                                    ->where('content_id', $post->id)
                                    ->count(); 
            $post->isLiked = Like::where('content_type','Post')
                                ->where('content_id', $post->id)
                                ->where('user_id', $userId)
                                ->exists(); 
            
        });


        //public all posts
        $publicPosts = Post::leftJoin('users', 'posts.user_id', '=', 'users.id')
        ->leftJoin('post_types', 'posts.type_id', '=', 'post_types.id')
        ->leftJoin('communities', 'posts.communities_id', '=', 'communities.id')
        ->leftJoin('community_members', function ($join) use ($userId) {
            $join->on('posts.communities_id', '=', 'community_members.communities_id')
                 ->where('community_members.user_id', '=', $userId)
                 ->where('community_members.status', 'Accepted');
        })
        ->when($typeFilter && $typeFilter !== 'all', function ($query) use ($typeFilter) {
            $query->where('post_types.type_name', $typeFilter);
        })
        ->where(function ($query) use ($userId) {
            $query->where('posts.is_private', 'Public')
                  ->where(function ($subQuery) use ($userId) {
                      $subQuery->whereNull('communities.is_private') // 没有社区的帖子
                               ->orWhere('communities.is_private', 'Public') // 公开社区
                               ->orWhereNotNull('community_members.user_id'); // 用户已加入的私有社区
                  });
        })
        ->where('posts.status', 'Active')
        ->select('posts.*', 'users.nickname', 'users.avatar', 'communities.name as community_name', 'post_types.type_name as post_type')
        ->latest()
        ->paginate(6);
        //dd($publicPosts);

        //count like
        $publicPosts->each(function ($post) use ($userId) {
            $post->likeCount = Like::where('content_type', 'Post')
                                    ->where('content_id', $post->id)
                                    ->count();
            $post->isLiked = Like::where('content_type', 'Post')
                                ->where('content_id', $post->id)
                                ->where('user_id', $userId)
                                ->exists();
        });


        return Inertia('User/Index',[
            'partialPost'=>$partialPost->items(),
            'hasMorePosts' => $partialPost->hasMorePages(), 
            'postTypes' => $postTypes,
            'publicPosts' => $publicPosts->items(), 
            'hasMorePublicPosts' => $publicPosts->hasMorePages(),
        ]);
    }
    // load more posts
    public function loadMorePosts(Request $request)
    {
        $userId = Auth::id();
        $typeFilter = $request->query('type');
        $page = $request->input('page', 1);
        $perPage = 6; 

        $communityIds = CommunityMembers::where('user_id', $userId)
        ->pluck('communities_id')->toArray();
        $friendIds  = Friendships::where(function ($query) use ($userId) {
            $query->where('user_id', $userId)
                  ->where('status', 'Accepted');
        })
        ->orWhere(function ($query) use ($userId) {
            $query->where('friend_id', $userId)
                  ->where('status', 'Accepted');
        })
        ->selectRaw("CASE 
        WHEN user_id = ? THEN friendships.friend_id 
        ELSE user_id 
        END as friend_id", [$userId])
        ->pluck('friend_id')
        ->toArray();

        //show user post,friend post and community member post
        $partialPost = Post::leftJoin('users', 'posts.user_id', '=', 'users.id')
        ->leftJoin('post_types', 'posts.type_id', '=', 'post_types.id')
        ->leftJoin('communities', 'posts.communities_id', '=', 'communities.id')
        ->leftJoin('community_members', function ($join) use ($userId) {
            $join->on('posts.communities_id', '=', 'community_members.communities_id')
                 ->where('community_members.user_id', '=', $userId);
        })
        ->when($typeFilter && $typeFilter !== 'all', function ($query) use ($typeFilter) {
            $query->where('post_types.type_name', $typeFilter);
        })
        ->where(function ($query) use ($userId, $friendIds, $communityIds) {
            // show current user post
            $query->where('posts.user_id', $userId) 
                ->orWhere(function ($subQuery) use ($friendIds, $communityIds) {
                    $subQuery->whereIn('posts.user_id', $friendIds)
                            ->where(function ($q) use ($communityIds) {
                                $q->whereNull('posts.communities_id') //show public post
                                ->orWhere('communities.is_private', 'Public') // 公开社区
                                ->orWhere(function ($subQ) { 
                                $subQ->whereNotNull('community_members.user_id')
                                    ->where('community_members.status', 'Accepted'); // ✅ 只允许 Accepted
                                });
                            });
                })
                ->orWhereIn('posts.communities_id', function ($q) use ($userId) {
                    $q->select('communities_id')
                      ->from('community_members')
                      ->where('user_id', $userId)
                      ->where('status', 'Accepted'); // ✅ 只允许 Accepted 看到
                });
        })
        ->where('posts.status', 'Active')
        ->where('posts.is_private', 'Public')
        ->select('posts.*', 'users.nickname', 'users.avatar', 'communities.name as community_name','post_types.type_name as post_type')
        ->latest()
        ->paginate($perPage, ['*'], 'page', $page);
        
        $partialPost->each(function ($post) use ($userId) {
            $post->likeCount = Like::where('content_type','Post')
                                    ->where('content_id', $post->id)
                                    ->count(); 
            $post->isLiked = Like::where('content_type','Post')
                                ->where('content_id', $post->id)
                                ->where('user_id', $userId)
                                ->exists(); 
            
        });

        
        //public all posts
        $publicPosts = Post::leftJoin('users', 'posts.user_id', '=', 'users.id')
        ->leftJoin('post_types', 'posts.type_id', '=', 'post_types.id')
        ->leftJoin('communities', 'posts.communities_id', '=', 'communities.id')
        ->leftJoin('community_members', function ($join) use ($userId) {
            $join->on('posts.communities_id', '=', 'community_members.communities_id')
                 ->where('community_members.user_id', '=', $userId)
                 ->where('community_members.status', 'Accepted');
        })
        ->when($typeFilter && $typeFilter !== 'all', function ($query) use ($typeFilter) {
            $query->where('post_types.type_name', $typeFilter);
        })
        ->where(function ($query) use ($userId) {
            $query->where('posts.is_private', 'Public')
                  ->where(function ($subQuery) use ($userId) {
                      $subQuery->whereNull('communities.is_private') // 没有社区的帖子
                               ->orWhere('communities.is_private', 'Public') // 公开社区
                               ->orWhereNotNull('community_members.user_id'); // 用户已加入的私有社区
                  });
        })
        ->where('posts.status', 'Active')
        ->select('posts.*', 'users.nickname', 'users.avatar', 'communities.name as community_name', 'post_types.type_name as post_type')
        ->latest()
        ->paginate($perPage, ['*'], 'page', $page);
        
        //count like
        $publicPosts->each(function ($post) use ($userId) {
            $post->likeCount = Like::where('content_type', 'Post')
                                    ->where('content_id', $post->id)
                                    ->count();
            $post->isLiked = Like::where('content_type', 'Post')
                                ->where('content_id', $post->id)
                                ->where('user_id', $userId)
                                ->exists();
        });

        return response()->json([
            'posts'=>$partialPost->items(),
            'hasMorePosts' => $partialPost->hasMorePages(), 
            'publicPosts' => $publicPosts->items(), 
            'hasMorePublicPosts' => $publicPosts->hasMorePages(),
        ]);
    }
    

    public function showPostDetailComponent(Post $post){
        $user = auth()->user();
        $postDetail = Post::leftJoin('communities', 'posts.communities_id', '=', 'communities.id') 
                ->join('users', 'posts.user_id', '=', 'users.id')
                ->where('posts.id', $post->id)
                ->select(['posts.*', 'communities.name as community_name', 'users.nickname', 'users.avatar'])
                ->first(); 
        //show post comment
        $comments = Comment::join('users as commenter', 'comments.user_id', '=', 'commenter.id')
                            ->leftJoin('users as target_user', 'comments.targetUser_id', '=', 'target_user.id')
                            ->where('comments.post_id',$post->id)
                            ->where('comments.status','Active')
                            ->select('comments.*', 'commenter.nickname', 'target_user.nickname as targetUserNickname','commenter.avatar')
                            ->orderBy('comments.created_at', 'desc')
                            ->paginate(6);
        
        //show post like 
        $likeCount = Like::where('content_type','Post')
                    ->where('content_id',$post->id)
                    ->count();
        $isLiked = Like::where('content_type', 'Post')
                    ->where('content_id', $post->id)
                    ->where('user_id', $user->id)
                    ->exists();
        
        //show  comment like
        $comments->each(function ($comment) use ($user) {
            $comment->likeCount = Like::where('content_type','Comment')
                                    ->where('content_id', $comment->id)
                                    ->count(); 
            $comment->isLiked = Like::where('content_type','Comment')
                                ->where('content_id', $comment->id)
                                ->where('user_id', $user->id)
                                ->exists(); 
            
        });          
        return Inertia('User/Post/PostDetail',[
            'postDetail'=>$postDetail,
            'comments'=>$comments->items(),
            'hasMoreComments' => $comments->hasMorePages(),
            'likeCount' => $likeCount,
            'isLiked' => $isLiked,
        ]);
    }   
    // load more comment
    public function loadMoreComments(Request $request,Post $post)
    {
        $user = auth()->user();
        $page = $request->input('page', 1);
        $perPage = 6; 

        // load more comments
        $comments = Comment::join('users as commenter', 'comments.user_id', '=', 'commenter.id')
                            ->leftJoin('users as target_user', 'comments.targetUser_id', '=', 'target_user.id')
                            ->where('comments.post_id',$post->id)
                            ->select('comments.*', 'commenter.nickname', 'target_user.nickname as targetUserNickname','commenter.avatar')
                            ->orderBy('comments.created_at', 'desc')
                            ->paginate($perPage, ['*'], 'page', $page);
        //
        //show post like 
        $likeCount = Like::where('content_type','Post')
                    ->where('content_id',$post->id)
                    ->count();
        $isLiked = Like::where('content_type', 'Post')
                    ->where('content_id', $post->id)
                    ->where('user_id', $user->id)
                    ->exists();
        //show  comment like
        $comments->each(function ($comment) use ($user) {
            $comment->likeCount = Like::where('content_type','Comment')
                                    ->where('content_id', $comment->id)
                                    ->count(); 
            $comment->isLiked = Like::where('content_type','Comment')
                                ->where('content_id', $comment->id)
                                ->where('user_id', $user->id)
                                ->exists(); 
            
        });

        return response()->json([
            'comments'=>$comments->items(),
            'hasMoreComments' => $comments->hasMorePages(), 
        ]);
    }
    
    //create post
    public function createPost(Request $request){
        $userId=auth()->user()->id;
        $data=$request->validate([
            'communities_id' => 'nullable',
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'type_id' => 'nullable',
            'type_name'=> 'nullable',
            'is_private' => 'required',
            'youtube_link' => 'nullable|url',
            'media_files' => 'nullable|array|max:9',
            'media_files.*' => 'file|mimes:jpg,jpeg,png,gif,mp4,webm,mov,avi,mp3,mpeg,wav|max:20480', 
        ]);
        if ($data['type_name']==='Event') {
            $request->validate([
                'event_start_time' => 'nullable|date|after_or_equal:now',
                'event_end_time' => 'nullable|date|after:event_start_time',
            ]);
            $data['event_start_time'] = $request->event_start_time;
            $data['event_end_time'] = $request->event_end_time;  
        } else {
            $data['event_start_time'] = null;
            $data['event_end_time'] = null;
        }
        $mediaUrls = [];

        //store link
        if (!empty($request->youtube_link)) {
            $mediaUrls[] = $request->youtube_link;
        }

        //store file to s3
        if ($request->hasFile('media_files')) {
            $imageCount = 0;
            $videoCount = 0;
            $audioCount = 0;
            //calculate number of file
            foreach ($request->file('media_files') as $file) {
                if (str_starts_with($file->getMimeType(), 'image')) {
                    $imageCount++;
                } elseif (str_starts_with($file->getMimeType(), 'video')) {
                    $videoCount++;
                }elseif (str_starts_with($file->getMimeType(), 'audio')) {
                    $audioCount++;
                }
            }
            
            //return error message
            if ($videoCount > 1) {
                return redirect()->back()->withErrors(['media_files' => 'You can only upload 1 video111.']);
            }
            if ($audioCount > 1) {
                return redirect()->back()->withErrors(['media_files' => 'You can only upload 1 audio.']);
            }
            if ($imageCount > 9) {
                return redirect()->back()->withErrors(['media_files' => 'You can only upload up to 9 images.']);
            }
            
            foreach ($request->file('media_files') as $mediaFile) {
                $mediaName = $userId . '_' . time() . '.' . $mediaFile->getClientOriginalExtension();
                $path = Storage::disk('s3')->putFile('postMedia', $mediaFile, 'public');
                $mediaUrls[] = Storage::disk('s3')->url($path);
            }
        }
        Post::create([
            'communities_id' => $request->communities_id,
            'user_id' => $userId,
            'title' => $request->title,
            'content' => $request->content,
            'type_id' => $request->type_id,
            'is_private' => $request->is_private,
            'media_url' => json_encode($mediaUrls),
            'event_start_time' => $request->event_start_time,
            'event_end_time' => $request->event_end_time,  
        ]);
        
        return back()->with('success', 'Post created successfully. ');

    }

    //change post visibility
    public function changeVisibility($postId)
    {
        $user=auth()->user();
        $post=Post::findOrFail($postId);
        //$visibility=$post->is_private;

        if($post->is_private === "Public"){
            Post::where('id', $postId)
                ->where('user_id', $user->id)
                ->update(['is_private' => 'Private']);
        }else{
            Post::where('id', $postId)
                ->where('user_id', $user->id)
                ->update(['is_private' => 'Public']);
        }
        return back()->with('success', 'Post visibilty have changed.');
    }
    //delete post
    public function deletePost($postId){
        $user = auth()->user();
        $post=Post::findOrFail($postId);
        
        $mediaUrls = json_decode($post->media_url, true);
        if(!$post){
            return redirect()->back()->with('error', 'Post delete unsuccessfully!');
        }
        //delete post comments
        Comment::where('post_id',$postId)->delete();
        //delete like
        Like::where('content_id',$postId)
            ->where('content_type','Post')
            ->delete();
        //delete report record
        Report::where('content_id',$postId)
            ->where('content_type','Post')
            ->delete();
        //delete media from s3
        if(!empty($mediaUrls)) {
            foreach ($mediaUrls as $mediaUrl) {
                //get file name
                $path = parse_url($mediaUrl, PHP_URL_PATH);
                $path = ltrim($path, '/');
                //delete
                Storage::disk('s3')->delete($path);
            }
        }
        //delete post
        $post->delete();
        return back()->with('success', 'Post deleted successfully!');
    }
    public function deleteDetailPost($postId){
        
        $user = auth()->user();
        $post=Post::findOrFail($postId);
        
        $mediaUrls = json_decode($post->media_url, true);
        if(!$post){
            return redirect()->back()->with('error', 'Post delete unsuccessfully!');
        }
        //delete post comments
        Comment::where('post_id',$postId)->delete();
        //delete like
        Like::where('content_id',$postId)
            ->where('content_type','Post')
            ->delete();
        //delete report record
        Report::where('content_id',$postId)
            ->where('content_type','Post')
            ->delete();
        //delete media from s3
        if(!empty($mediaUrls)) {
            foreach ($mediaUrls as $mediaUrl) {
                //get file name
                $path = parse_url($mediaUrl, PHP_URL_PATH);
                $path = ltrim($path, '/');
                //delete
                Storage::disk('s3')->delete($path);
            }
        }
        //delete post
        $post->delete();
        return redirect()->route('user.index')->with('success', 'Post deleted successfully!');
    }
    //report post
    public function reportPost(Request $request,$postId){
        $user = auth()->user();

        $data=$request->validate([
            'reason' => 'required|string|max:255',
            'details' => 'nullable|string',
            'review_notes' => 'nullable',
            'acc_block_until' => 'nullable|after:now',
        ]);

        $post=Post::findOrFail($postId);
        
        $reportExist=Report::where('content_type','Post')
                            ->where('content_id',$postId)
                            ->where('user_id',$post->user_id)
                            ->exists();
        if($reportExist){
            return back()->with('error', 'You have reported!');
        }

        if($user->position != "Admin"){
            //create record
            Report::create([
                'user_id' => $post->user_id,
                'content_type' => 'Post',
                'content_id' => $postId,
                'reason' => $data['reason'],
                'details' => $data['details'],
                'status' => 'Pending', 
            ]);
            return back()->with('success', 'Post reported successfully!');
        }else{
            if($user->admin_id===null){
                return redirect()->back()->with('error', 'Operation failed. Admin account not bound yet.');
            }
            DB::transaction(function () use ($request,$user,$postId,$data,$post){
                //check report is exist
                $report=Report::where('content_type','Post')
                            ->where('content_id',$postId)
                            ->first();
                if($report){
                    $report->delete();
                }
                //create record
                Report::create([
                    'user_id' => $post->user_id,
                    'content_type' => 'Post',
                    'content_id' => $postId,
                    'reason' => $data['reason'],
                    'details' => $data['details'],
                    'status' => 'Resolved', 
                    'reviewed_by'=> $user->admin_id,
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
            $postUserId->notify(new SendNotification($user, 'postReport_byAdmin',$post->title));
            return back()->with('success', 'Post block successfully!');
            });
        }
    }
    //create comment
    public function createComment(Request $request){
        //dd($request->all);
        $user = auth()->user();
        $data=$request->validate([
            'content' => 'required|string|max:255',
            'post_id' => 'required',
            'user_id' => 'required',
            'targetUser_id' => 'nullable',
        ]);
        $post=Post::findOrFail($data['post_id']);
        //create record 
        $comment = Comment::create([
            'user_id' => $data['user_id'],
            'post_id' => $data['post_id'],
            'content' => $data['content'],
            'targetUser_id' => $data['targetUser_id'],
        ]);

        //send notification to post's user
        $postUser = User::find($post->user_id);
        //post user not receive when comment on self post
        //not receive notification when people reply self comment
        if ($postUser && ($post->user_id!=$user->id && $comment->targetUser_id!= $user->id) ) {
            $postUser->notify(new SendNotification($user, 'post_comment', [
                'post_id' => $post->id,
                'comment_id' => $comment->id, 
                'content' => $data['content'], 
            ]));
        }
        //send reply comment notification
        $replyUser= User::find($data['targetUser_id']);
        if($replyUser && $comment->targetUser_id!= $user->id){
            $replyUser->notify(new SendNotification($user, 'post_replyComment', [
                'post_id' => $post->id,
                'comment_id' => $comment->id, 
                'content' => $data['content'], 
            ]));
        }
        //broadcast(new CommentCreated($comment->load('user','targetUser')))->toOthers();
        
        return back()->with('success', 'Comment successfully!');
    }
    //delete comment
    public function deleteComment($commentId){
        
        $user = auth()->user();
        $comment=Comment::findOrFail($commentId);
        
        if(!$comment){
            return redirect()->back()->with('error', 'Comment delete unsuccessfully!');
        }
        //delete like
        Like::where('content_id',$commentId)
            ->where('content_type','Comment')
            ->delete();
        //delete report 
        Report::where('content_id',$commentId)
            ->where('content_type','Comment')
            ->delete();
        $comment->delete();
        return back()->with('success', 'Comment deleted successfully!');
    }
    //report comment
    public function reportComment(Request $request,$commentId){
        $user = auth()->user();

        $data=$request->validate([
            'reason' => 'required|string|max:255',
            'details' => 'nullable|string',
            'review_notes' => 'nullable',
            'acc_block_until' => 'nullable|after:now',
        ]);

        $comment=Comment::findOrFail($commentId);
        
        $reportExist=Report::where('content_type','Comment')
                            ->where('content_id',$commentId)
                            ->where('user_id',$comment->user_id)
                            ->exists();
        if($reportExist){
            return redirect()->back()->with('error', 'You have reported!');
        }

        if($user->position != "Admin"){
            //create record
            Report::create([
                'user_id' => $comment->user_id,
                'content_type' => 'Comment',
                'content_id' => $commentId,
                'reason' => $data['reason'],
                'details' => $data['details'],
                'status' => 'Pending', 
            ]);
            return redirect()->back()->with('success', 'Comment reported successfully!');
        }else{
            DB::transaction(function () use ($request,$user,$commentId,$data,$comment){
            
            $report=Report::where('content_type','Comment')
                        ->where('content_id',$commentId)
                        ->first();
            if($report){
                $report->delete();
            }
            //create record
            Report::create([
                'user_id' => $comment->user_id,
                'content_type' => 'Comment',
                'content_id' => $commentId,
                'reason' => $data['reason'],
                'details' => $data['details'],
                'status' => 'Resolved', 
                'reviewed_by'=> $user->admin_id,
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
                //php artisan queue:work
                //send mail
                $subject="<h1>SEGiSpace Account Blocked</h1>";
                $message = "<h1>Your comment contains prohibited content.</h1>
                            <p>After review, your account [`{$violationUser->email}`] has 
                            been temporarily suspended due to a violation of our platform's 
                            guidelines: [{$data['reason']}]. This action is taken to maintain
                             a safe and healthy community environment.</p>
                            <p>Your account will remain blocked from [`" . now() . "`] until [`{$violationUser->acc_block_until}`]. 
                            During this period, you will not be able to log in or use any platform features.</p>
                            <p>If further violations occur after your account is reinstated, stricter actions may be taken, including permanent suspension.</p>
                            <p>Thank you for your understanding and cooperation. We encourage you to adhere to the platform rules to help maintain a positive community.</p>";
                Mail::to($violationUser->email)->send(new AccBlockMail($subject,$message));
            }
            //send notification to user
            $commentUserId=User::find($comment->user_id);
            $commentUserId->notify(new SendNotification($user, 'commentReport_byAdmin',$comment->content));
            return redirect()->back()->with('success', 'Comment block successfully!');
            });
        }
    }
    //like / unlike post
    public function likePost($postId){
        $user = auth()->user();

        $post=Post::findOrFail($postId);

        $likeExist=Like::where('content_type','Post')
                        ->where('content_id',$postId)
                        ->where('user_id',$user->id)
                        ->first();
        if(!$likeExist){
            //like
            Like::create([
                'user_id' => $user->id,
                'content_type' => 'Post',
                'content_id' => $postId,
            ]);
            //send notification to user
            $postUser=User::find($post->user_id);
            if($post->user_id != $user->id){
                $postUser->notify(new SendNotification($user, 'likePost',[
                    'post_id'=>$postId,
                    'content'=>$post->title,
                ]));
            }
            return back()->with('success', 'Like successfully!');
        }else{
            //unlike
            $likeExist->delete();
            return back()->with('success', 'Unlike successfully!');
        }
        
    }
    //like/unlike comment
    public function likeComment($commentId,$postId){
        $user = auth()->user();

        $comment=Comment::findOrFail($commentId);

        $likeExist=Like::where('content_type','Comment')
                        ->where('content_id',$commentId)
                        ->where('user_id',$user->id)
                        ->first();
        if(!$likeExist){
            //like
            Like::create([
                'user_id' => $user->id,
                'content_type' => 'Comment',
                'content_id' => $commentId,
            ]);
            //send notification to user
            $commentUser=User::find($comment->user_id);
            if($comment->user_id != $user->id){
                $commentUser->notify(new SendNotification($user, 'likeComment',[
                    'comment_id'=>$commentId,
                    'content'=>$comment->content,
                    'post_id'=>$postId,
                ]));
            }
            return back()->with('success', 'Like successfully!');
        }else{
            //unlike
            $likeExist->delete();
            return back()->with('success', 'Unlike successfully!');
        }
        
    }
}
