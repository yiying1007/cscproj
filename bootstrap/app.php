<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\User;
use App\Http\Middleware\Admin;
use App\Http\Middleware\EnsureUserIsVerified;
use App\Http\Middleware\VerifiedUser;
use App\Http\Middleware\VerifiedAdmin;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
        $middleware->web(append: [
            HandleInertiaRequests::class,
            
        ]);
        $middleware->alias([
            'admin'=> Admin::class,
            'auth'=>User::class,
            'verified'=>EnsureUserIsVerified::class,
            'verifiedUser'=>VerifiedUser::class,
            'verifiedAdmin'=>VerifiedAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
