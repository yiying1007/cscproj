<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\User;

class Comment extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'post_id',
        'user_id',
        'targetUser_id',
        'content',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    
    public function targetUser()
    {
        return $this->belongsTo(User::class, 'targetUser_id');
    }
}
