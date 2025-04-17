<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Like extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'user_id',
        'content_type',
        'content_id',
    ];
}
