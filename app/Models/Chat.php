<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Message;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class Chat extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'type',
        'created_by',
    ];
    public function latestMessage()
    {
        return $this->hasOne(Message::class, 'chat_id', 'id')->latest();
    }


    public function members()
    {
        return $this->hasMany(ChatMember::class, 'chat_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'chat_id');
    }
    
    public function users()
    {
        return $this->belongsToMany(User::class, 'chat_members', 'chat_id', 'user_id');
    }

}
