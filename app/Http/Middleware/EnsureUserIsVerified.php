<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use App\Models\IdentityVerification;

class EnsureUserIsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if(Auth::check()){
            $user = Auth::user();
            $verificationRecord = IdentityVerification::where('user_id', $user->id)->first();
            if (!$verificationRecord) {
                return redirect()->route('user.identityVerification')
                    ->with('error', 'You must complete identity verification to access this page.');
            }
            
        }
        return $next($request);
    }
}
