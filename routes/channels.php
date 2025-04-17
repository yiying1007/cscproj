<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Chat;

// You can use this file to define all of your event broadcasting channels.
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// This is a public channel, so anyone can access it
Broadcast::channel('comments', function () {
    return true;
});


// This is a private channel, so only authenticated users can access it
Broadcast::channel('chat.{chatId}', function ($user, $chatId) {
    return Chat::where('id', $chatId)->whereHas('users', function ($query) use ($user) {
        $query->where('user_id', $user->id);
    })->exists();
});

