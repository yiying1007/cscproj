<?php

namespace App\Models;

use App\Models\User;
use App\Models\Chat;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class Message extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'chat_id',
        'sender_id',
        'content',
        'media_url',
        'media_name',
        'read_at',
        'status',
        
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function chat()
    {
        return $this->belongsTo(Chat::class, 'chat_id');
    }
}
