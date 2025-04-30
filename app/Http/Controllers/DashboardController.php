<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Communities;
use App\Models\CommunityMembers;
use App\Models\IdentityVerification;
use App\Models\Friendships;
use App\Models\Post;
use App\Models\Like;
use App\Models\Comment;
use App\Models\PostType;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function showDashboardComponent()
    { 
        // User 
        $totalUsers=User::count();
        // Community 
        $totalCommunities=Post::count();
        // Post 
        $totalPosts=Post::count();
        // Detect DB driver
        $driver = DB::getDriverName();

        // Monthly post counts
        if ($driver === 'pgsql') {
            $monthlyPostCounts = Post::select(
                DB::raw("date_trunc('month', created_at) as date"),
                DB::raw("COUNT(*) as post_count")
            )
            ->groupBy('date')
            ->orderBy('date', 'DESC')
            ->get()
            ->map(function ($item) {
                $date = Carbon::parse($item->date);
                return [
                    'year' => $date->year,
                    'month' => $date->month,
                    'post_count' => $item->post_count,
                ];
            });

            $monthlyUserCounts = User::select(
                DB::raw("date_trunc('month', createtime) as date"),
                DB::raw("COUNT(*) as user_count")
            )
            ->groupBy('date')
            ->orderBy('date', 'DESC')
            ->get()
            ->map(function ($item) {
                $date = Carbon::parse($item->date);
                return [
                    'year' => $date->year,
                    'month' => $date->month,
                    'user_count' => $item->user_count,
                ];
            });
        } else {
            // Assume MySQL
            // Monthly post counts for chart
            $monthlyPostCounts = Post::select(
                DB::raw('EXTRACT(YEAR FROM created_at) as year'),
                DB::raw('EXTRACT(MONTH FROM created_at) as month'),
                DB::raw('COUNT(*) as post_count')
            )
            ->groupByRaw('EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)')
            ->orderByRaw('EXTRACT(YEAR FROM created_at) DESC, EXTRACT(MONTH FROM created_at) ASC')
            ->get();
            // Monthly post counts for chart
            $monthlyUserCounts = User::select(
                DB::raw('EXTRACT(YEAR FROM createtime) as year'),
                DB::raw('EXTRACT(MONTH FROM createtime) as month'),
                DB::raw('COUNT(*) as user_count')
            )
            ->groupByRaw('EXTRACT(YEAR FROM createtime), EXTRACT(MONTH FROM createtime)')
            ->orderByRaw('EXTRACT(YEAR FROM createtime) DESC, EXTRACT(MONTH FROM createtime) ASC')
            ->get()
            ->toArray();
        }
        //top 5 communities
        $topCommunities = Communities::select('communities.name', 'communities.type',
            DB::raw('COUNT(DISTINCT community_members.user_id) as member_count'),
            DB::raw('COUNT(DISTINCT posts.id) as post_count')
        )
        ->leftJoin('community_members', 'communities.id', '=', 'community_members.communities_id')
        ->leftJoin('posts', 'communities.id', '=', 'posts.communities_id')
        ->groupBy('communities.id', 'communities.name')
        ->orderByDesc('member_count','post_count')
        ->limit(5)
        ->get();

        //top 5 posts
        $hotPosts = Post::select('posts.id', 'posts.title',
            DB::raw('COUNT(DISTINCT likes.id) as like_count'),
            DB::raw('COUNT(DISTINCT comments.id) as comment_count')
        )
        ->leftJoin('likes', function ($join) {
            $join->on('posts.id', '=', 'likes.content_id')
                 ->where('likes.content_type', 'Post');
        })
        ->leftJoin('comments', 'posts.id', '=', 'comments.post_id')
        ->whereDate('posts.created_at', Carbon::now('Asia/Kuala_Lumpur')->toDateString())
        ->groupBy('posts.id', 'posts.title')
        ->orderByDesc(DB::raw('COUNT(DISTINCT likes.id) + COUNT(DISTINCT comments.id)')) 
        ->limit(5)
        ->get();

        return Inertia::render('Admin/Dashboard', [
            'totalUsers' => $totalUsers,
            'totalCommunities' => $totalCommunities,
            'totalPosts' => $totalPosts,
            'monthlyPostCounts' => $monthlyPostCounts,
            'monthlyUserCounts' => $monthlyUserCounts,
            'topCommunities' => $topCommunities,
            'hotPosts' => $hotPosts,
        ]);
    }

}
