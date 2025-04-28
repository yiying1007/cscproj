<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Communities;
use App\Models\Post;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $currentUser = auth()->user()->id;
        $search = $request->input('search', '');
        $users = [];
        $communities = []; 
        $posts = []; 

        $likeOperator = DB::getDriverName() === 'pgsql' ? 'ilike' : 'like'; // 🛠 动态判断

        if ($search) {
            $users = User::query()
                ->where('id', '!=', $currentUser)
                ->where(function ($query) use ($search, $likeOperator) {
                    $query->where('nickname', $likeOperator, "%{$search}%")
                          ->orWhere('position', $likeOperator, "%{$search}%");
                })
                ->latest()
                ->get();

            $communities = Communities::query()
                        ->where('name', $likeOperator, "%{$search}%")
                        ->orWhere('type', $likeOperator, "%{$search}%")
                        ->latest()
                        ->get();

            $posts = Post::query()
                        ->leftJoin('users', 'posts.user_id', '=', 'users.id')
                        ->leftJoin('communities', 'posts.communities_id', '=', 'communities.id')
                        ->leftJoin('likes', function ($join) {
                            $join->on('likes.content_id', '=', 'posts.id')
                                 ->where('likes.content_type', 'Post');
                        })
                        ->where('posts.user_id', '!=', $currentUser) 
                        ->where('posts.is_private', 'Public') 
                        ->where(function ($query) {
                            $query->whereNull('posts.communities_id') 
                                  ->orWhere('communities.is_private', 'Public'); 
                        })
                        ->where(function ($query) use ($search, $likeOperator) {
                            $query->where('posts.title', $likeOperator, "%{$search}%")
                                  ->orWhere('posts.content', $likeOperator, "%{$search}%");
                        })
                        ->select('posts.*', 'users.nickname', 'users.avatar', 'communities.name as community_name',
                                DB::raw('COUNT(likes.id) as like_count'))
                        ->groupBy('posts.id', 'users.nickname', 'users.avatar', 'communities.name')
                        ->orderByDesc('like_count')
                        ->latest()
                        ->get()
                        ->map(function ($post) {
                            $post->content = Str::limit($post->content, 100, '...');
                            return $post;
                        });
        }
        return Inertia('User/SearchResults', [
            'users' => $users,
            'communities' => $communities,
            'posts' => $posts,
            'searchQuery' => $search,
        ]);
    }

}
