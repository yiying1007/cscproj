<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Friendships;
use App\Models\Post;
use App\Models\PostType;
use App\Models\Communities;
use App\Models\Comment;
use App\Models\Like;
use Illuminate\Http\Request;
use App\Notifications\SendNotification;
use Illuminate\Support\Facades\DB;

class FriendshipsController extends Controller
{
    
    public function showUserListComponent(){
        $currentUser= auth()->user()->id;
        $users=User::paginate(5);
        // show friend request and sender info
        $friendRequest = Friendships::with('sender:id,nickname,position,avatar')
                        ->where('friend_id', $currentUser)
                        ->where('status', 'Pending')
                        ->get(['user_id', 'friend_id', 'status']);
        // check user_id/friend_id is current user
        $friendIds = Friendships::where(function ($query) use ($currentUser) {
            $query->where('user_id', $currentUser)->orWhere('friend_id', $currentUser);
        })
        ->where('status', 'Accepted')
        ->latest()
        ->get()
        // get friend id
        ->map(function ($friendship) use ($currentUser) {
            return $friendship->user_id === $currentUser ? $friendship->friend_id : $friendship->user_id;
        });
        //get friend info
        $friends = User::whereIn('id', $friendIds)
                ->paginate(6);

        return Inertia('User/Friend/UserList', [
            'users'=> $users,
            'friendRequest'=>$friendRequest,
            'friends' => $friends->items(),
            'hasMoreFriends' => $friends->hasMorePages(),
        ]);
    }
    // load more friends
    public function loadMoreFriends(Request $request)
    {
        $currentUser= auth()->user()->id;
        $page = $request->input('page', 1);
        $perPage = 6; 

        // load more friends
        $friendIds = Friendships::where(function ($query) use ($currentUser) {
            $query->where('user_id', $currentUser)->orWhere('friend_id', $currentUser);
        })
        ->where('status', 'Accepted')
        ->get()
        ->map(function ($friendship) use ($currentUser) {
            return $friendship->user_id === $currentUser ? $friendship->friend_id : $friendship->user_id;
        });
        
        $friends = User::whereIn('id', $friendIds)
                ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'friends' => $friends->items(),
            'hasMoreFriends' => $friends->hasMorePages(),
        ]);
    }

    public function showTargetUserProfileComponent(User $user){
        $currentUser= auth()->user()->id;
        $postTypes=PostType::all();
        //check target user is friend
        $isFriend = Friendships::where(function ($query) use ($currentUser, $user) {
            $query->where('user_id', $currentUser)
                  ->where('friend_id', $user->id);
        })
        ->orWhere(function ($query) use ($currentUser, $user) {
            $query->where('user_id', $user->id)
                  ->where('friend_id', $currentUser);
        })
        ->first();
        $friendStatus = $isFriend ? $isFriend->status : null;

        //show post
        $posts = Post::leftJoin('communities', 'posts.communities_id', '=', 'communities.id') 
                    ->join('users', 'posts.user_id', '=', 'users.id')
                    ->leftJoin('post_types', 'posts.type_id', '=', 'post_types.id')
                    ->where('users.id', $user->id)
                    ->where('posts.status', 'Active')
                    ->where(function ($query) {
                        $query->where('posts.is_private', 'Public')
                            ->orWhere('communities.is_private', 'Public');
                    })
                    ->select('posts.*', 'communities.name as community_name', 'users.nickname', 'users.avatar','post_types.type_name as post_type')
                    ->latest()
                    ->paginate(6);
                   
        
        //like count in each post
        $posts->each(function ($post) use ($currentUser) {
            $post->likeCount = Like::where('content_type','Post')
                                    ->where('content_id', $post->id)
                                    ->count(); 
            $post->isLiked = Like::where('content_type','Post')
                                ->where('content_id', $post->id)
                                ->where('user_id', $currentUser)
                                ->exists(); 
            
        });
        
        return Inertia('User/Friend/TargetUserProfile',[
            'user'=>$user,
            'friendStatus' => $friendStatus,
            'posts'=>$posts->items(),
            'hasMorePosts' => $posts->hasMorePages(),
            'postTypes' => $postTypes,
        ]);
    }
    // load more post
    public function loadMorePosts(Request $request,User $user)
    {
        $currentUser= auth()->user()->id;
        $page = $request->input('page', 1);
        $perPage = 6; 

        // load more posts
        $posts = Post::leftJoin('communities', 'posts.communities_id', '=', 'communities.id') 
                    ->join('users', 'posts.user_id', '=', 'users.id')
                    ->leftJoin('post_types', 'posts.type_id', '=', 'post_types.id')
                    ->where('users.id', $user->id)
                    ->where('posts.status', 'Active')
                    ->where(function ($query) {
                        $query->where('posts.is_private', 'Public')
                            ->orWhere('communities.is_private', 'Public');
                    })
                    ->select('posts.*', 'communities.name as community_name', 'users.nickname', 'users.avatar','post_types.type_name as post_type')
                    ->latest()
                    ->paginate($perPage, ['*'], 'page', $page);
        
        //like count in each post
        $posts->each(function ($post) use ($currentUser) {
            $post->likeCount = Like::where('content_type','Post')
                                    ->where('content_id', $post->id)
                                    ->count(); 
            $post->isLiked = Like::where('content_type','Post')
                                ->where('content_id', $post->id)
                                ->where('user_id', $currentUser)
                                ->exists(); 
            
        }); 
        return response()->json([
            'posts'=>$posts->items(),
            'hasMorePosts' => $posts->hasMorePages(), 
        ]);
    }
    //load more comments
    public function loadMoreComments(Request $request) {
        $postId = $request->query('post_id');
        $page = $request->query('page', 1); 
    
        $comments = Comment::where('post_id', $postId)
                            ->join('users', 'comments.user_id', '=', 'users.id')
                            ->select('comments.*', 'users.nickname', 'users.avatar')
                            ->orderBy('comments.created_at', 'desc')
                            ->paginate(3, ['*'], 'page', $page);
    
        return response()->json([
            'comments' => $comments->items(),
            'hasMoreComments' => $comments->hasMorePages(),
        ]);
    }
    public function sendFriendRequest(Request $request, $targetUserId){
        $sender = auth()->user();
        $targetUser = User::findOrFail($targetUserId);

        // check request is exist
        $existingRequest = Friendships::where(function($query) use ($sender, $targetUser) {
            $query->where('user_id', $sender->id)
                  ->where('friend_id', $targetUser->id);
        })->orWhere(function($query) use ($sender, $targetUser) {
            $query->where('user_id', $targetUser->id)
                  ->where('friend_id', $sender->id);
        })->first();
        
        if ($existingRequest) {
            return redirect()->back()->with('error', 'Friend request already exists.');
        }

        // create request record
        Friendships::create([
            'user_id' => $sender->id,
            'friend_id' => $targetUser->id,
        ]);
        
        // send notification
        $targetUser->notify(new SendNotification($sender, 'friend_request'));
        return redirect()->back()->with('success', 'Friend request send successfully.');
    }

    public function acceptFriendRequest(Request $request,$id)
    {
        $user=auth()->user();
        $friendRequest = DB::table('friendships')
                            ->where('user_id', $id)
                            ->where('friend_id', $user->id)
                            ->where('status', 'Pending')
                            ->first();

        if(!$friendRequest){
            return redirect()->back()->with('error', 'Unauthorized.');
        }
        DB::table('friendships')
            ->where('user_id', $id)
            ->where('friend_id', $user->id)
            ->update(['status' => 'Accepted']);
        
        // send notification
        $sender=User::findOrFail($id); 
        $sender->notify(new SendNotification($user, 'friend_accept'));
        return redirect()->back()->with('success', 'Friend request accepted.');

    }

    public function rejectFriendRequest(Request $request,$id)
    {
        $user=auth()->user();
        $friendRequest = DB::table('friendships')
                            ->where('user_id', $id)
                            ->where('friend_id', $user->id)
                            ->where('status', 'Pending')
                            ->first();
        if(!$friendRequest){
            return redirect()->back()->with('error', 'Unauthorized.');
        }
        DB::table('friendships')
            ->where('user_id', $id)
            ->where('friend_id', $user->id)
            ->delete();
        
        return redirect()->back()->with('success', 'Friend request rejected.');
    }

    // delete friend
    public function deleteTargetFriend(Request $request,$id){
        $userId = auth()->user()->id;
        $targetUser = User::findOrFail($id);
        $friendRecord = DB::table('friendships')
                        ->where(function ($query) use ($userId, $id) {
                            $query->where('user_id', $userId)
                                ->where('friend_id', $id);
                        })
                        ->orWhere(function ($query) use ($userId, $id) {
                            $query->where('user_id', $id)
                                  ->where('friend_id', $userId);
                        })
                        ->where('status', 'Accepted')
                        ->delete();
        if($friendRecord===0){
            return redirect()->back()->with('error', 'No friend relationship found to delete.');
        }
        return redirect()->back()->with('success', 'Friend relationship has been dissolved .');
    }


}
