<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Post extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'communities_id',
        'user_id',
        'title',
        'content',
        'media_url',
        'type_id',
        'is_private',
        'status',
        'event_start_time',
        'event_end_time',
    ];
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
