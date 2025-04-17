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
        //receive search
        $search = $request->input('search', '');
        $users = [];
        $communities = []; 
        $posts = []; 
        //$users = [];
        if ($search) {
            $users = User::query()
                ->where('id', '!=', $currentUser)
                ->where(function ($query) use ($search) {
                    $query->where('nickname', 'like', "%{$search}%")
                          ->orWhere('position', 'like', "%{$search}%");
                })
                ->latest()
                ->get();
            $communities=Communities::query()
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('type', 'like', "%{$search}%")
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
                        ->where(function ($query) use ($search) {
                            $query->where('posts.title', 'like', "%{$search}%")
                                  ->orWhere('posts.content', 'like', "%{$search}%");
                        })
                        ->select('posts.*', 'users.nickname', 'users.avatar', 'communities.name as community_name',
                                DB::raw('COUNT(likes.id) as like_count'))
                        ->groupBy('posts.id', 'users.nickname', 'users.avatar', 'communities.name') // 由于 COUNT 聚合函数，需要 groupBy
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
