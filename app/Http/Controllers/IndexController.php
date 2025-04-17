<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Friendships;
use App\Models\IdentityVerification;
use App\Models\Communities;
use App\Models\CommunityMembers;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Like;
use App\Models\PostType;
use App\Models\Admin;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;

class IndexController extends Controller
{
    public function showIndexComponent(){
        $user = auth()->user();
        $userId = Auth::id();
        //announcement component
        $announcements=Announcement::where(function ($query) {
            $query->whereNull('end_time')  
                  ->orWhere('end_time', '>=', Carbon::now());
        })
        ->latest()
        ->get();
        
        
        $postTypes=PostType::all();

        //public all posts
        $publicPosts = Post::leftJoin('users', 'posts.user_id', '=', 'users.id')
        ->leftJoin('post_types', 'posts.type_id', '=', 'post_types.id')
        ->leftJoin('communities', 'posts.communities_id', '=', 'communities.id')
        ->leftJoin('community_members', function ($join) use ($userId) {
            $join->on('posts.communities_id', '=', 'community_members.communities_id')
                 ->where('community_members.user_id', '=', $userId)
                 ->where('community_members.status', 'Accepted');
        })
        ->where(function ($query) use ($userId) {
            $query->where('posts.is_private', 'Public')
                  ->where(function ($subQuery) use ($userId) {
                      $subQuery->whereNull('communities.is_private') 
                               ->orWhere('communities.is_private', 'Public') 
                               ->orWhereNotNull('community_members.user_id'); 
                  });
        })
        ->where('posts.status', 'Active')
        ->select('posts.*', 'users.nickname', 'users.avatar', 'communities.name as community_name', 'post_types.type_name as post_type')
        ->latest()
        ->paginate(6);

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

        //show user post,friend post and community member post
        $partialPost = Post::leftJoin('users', 'posts.user_id', '=', 'users.id')
        ->leftJoin('post_types', 'posts.type_id', '=', 'post_types.id')
        ->leftJoin('communities', 'posts.communities_id', '=', 'communities.id')
        ->leftJoin('community_members', function ($join) use ($userId) {
            $join->on('posts.communities_id', '=', 'community_members.communities_id')
                 ->where('community_members.user_id', '=', $userId);
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
        ->paginate(6);
        //like
        $partialPost->each(function ($post) use ($userId) {
            $post->likeCount = Like::where('content_type','Post')
                                    ->where('content_id', $post->id)
                                    ->count(); 
            $post->isLiked = Like::where('content_type','Post')
                                ->where('content_id', $post->id)
                                ->where('user_id', $userId)
                                ->exists(); 
            
        });

        //recommend community
        $membersCount = Communities::leftJoin('community_members', 'communities.id', '=', 'community_members.communities_id')
            ->select('communities.id', DB::raw('COUNT(community_members.communities_id) as member_count'))
            ->groupBy('communities.id');

        $postsCount = Communities::leftJoin('posts', 'communities.id', '=', 'posts.communities_id')
            ->select('communities.id', DB::raw('COUNT(posts.id) as post_count'))
            ->groupBy('communities.id');

        $communityRecommends = Communities::leftJoinSub($membersCount, 'member_ranking', function ($join) {
                $join->on('communities.id', '=', 'member_ranking.id');
            })
            ->leftJoinSub($postsCount, 'post_ranking', function ($join) {
                $join->on('communities.id', '=', 'post_ranking.id');
            })
            ->select(
                'communities.*',
                DB::raw('COALESCE(member_ranking.member_count, 0) + COALESCE(post_ranking.post_count, 0) as total_score')
            )
            ->orderByDesc('total_score')
            ->limit(10)
            ->get();


        //friend recommend
        $facultyCourse = IdentityVerification::where('user_id', $userId)
            ->select('faculty', 'course')
            ->first(); 

        if (!$facultyCourse) {
            return []; 
        }
        $friendIds = Friendships::where('user_id', $userId)
            ->orWhere('friend_id', $userId)
            ->pluck('friend_id')
            ->toArray();
        $friendIds[] = $userId;
        $friendRecommends = User::leftJoin('identity_verifications', 'identity_verifications.user_id', '=', 'users.id')
            ->where(function ($query) use ($facultyCourse) {
                $query->where('identity_verifications.course', $facultyCourse->course)
                    ->orWhere('identity_verifications.faculty', $facultyCourse->faculty);
            }) 
            ->where('users.position',$user->position)
            ->whereNotIn('users.id', $friendIds)
            ->select('users.*','identity_verifications.course') 
            ->limit(15)
            ->get();


        $ongoingEvents  = Post::leftJoin('post_types', 'posts.type_id', '=', 'post_types.id')
        ->leftJoin('communities', 'posts.communities_id', '=', 'communities.id')
        ->leftJoin('community_members', function ($join) use ($userId) {
            $join->on('posts.communities_id', '=', 'community_members.communities_id')
                 ->where('community_members.user_id', '=', $userId)
                 ->where('community_members.status', 'Accepted');
        })
        ->where(function ($query) use ($userId) {
            $query->where('posts.is_private', 'Public')
                  ->where(function ($subQuery) use ($userId) {
                      $subQuery->whereNull('communities.is_private') 
                               ->orWhere('communities.is_private', 'Public') 
                               ->orWhereNotNull('community_members.user_id'); 
                  });
        })
        ->where('posts.status', 'Active')
        ->where('post_types.type_name', 'Event')
        ->where('posts.event_start_time', '<=', now()) 
        ->where('posts.event_end_time', '>', now())     
        ->orderBy('posts.event_end_time', 'asc')      
        ->select('posts.id',
                'posts.title', 
                'posts.event_start_time', 
                'posts.event_end_time',
                'posts.media_url')
        ->get();

        $upcomingEvents= Post::leftJoin('post_types', 'posts.type_id', '=', 'post_types.id')
        ->leftJoin('communities', 'posts.communities_id', '=', 'communities.id')
        ->leftJoin('community_members', function ($join) use ($userId) {
            $join->on('posts.communities_id', '=', 'community_members.communities_id')
                 ->where('community_members.user_id', '=', $userId)
                 ->where('community_members.status', 'Accepted');
        })
        ->where(function ($query) use ($userId) {
            $query->where('posts.is_private', 'Public')
                  ->where(function ($subQuery) use ($userId) {
                      $subQuery->whereNull('communities.is_private') 
                               ->orWhere('communities.is_private', 'Public') 
                               ->orWhereNotNull('community_members.user_id'); 
                  });
        })
        ->where('posts.status', 'Active')
        ->where('post_types.type_name', 'Event')
        ->where('posts.event_start_time', '>', now())   
        ->orderBy('posts.event_start_time', 'asc')      
        ->select('posts.*')
        ->get();

        



        return Inertia('User/Index',[
            'announcements'=>$announcements,
            'publicPosts' => $publicPosts->items(), 
            'hasMorePublicPosts' => $publicPosts->hasMorePages(),
            'partialPost'=>$partialPost->items(),
            'hasMorePosts' => $partialPost->hasMorePages(), 
            'friendRecommends'=>$friendRecommends,
            'communityRecommends'=>$communityRecommends,
            'postTypes'=>$postTypes,
            'ongoingEvents'=>$ongoingEvents,
            'upcomingEvents '=>$upcomingEvents ,
        ]);
    }
    public function showAnnouncementDetailComponent(Announcement $announcement){
        
        $announcementDetail = Announcement::where('id',$announcement->id)
        ->latest()
        ->first(); 
        
        return Inertia('User/AnnouncementDetail',[
            'announcementDetail'=>$announcementDetail,
        ]);
    }
    // load more posts
    public function loadMorePosts(Request $request)
    {
        $userId = Auth::id();
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
}
