<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class ChatMember extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'chat_id',
        'user_id',
        'position',
        'message_status',
        'message_status_updated',
    ];

    public function chat()
    {
        return $this->belongsTo(Chat::class, 'chat_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
