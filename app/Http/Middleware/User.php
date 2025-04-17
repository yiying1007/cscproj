<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class User
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if(!Auth::guard('web')->check()){
            return redirect()->route('user.welcome');
        }
        $user = Auth::guard('web')->user();

    
        if ($user->acc_status === 'Block') {
            Auth::guard('web')->logout();
            return redirect()->route('user.welcome')->with('error', 'Your account has been blocked.');
        }
        return $next($request);
    }
}
