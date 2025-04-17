<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class AdminLogs extends Model
{
    protected $fillable = [
        'admin_id',
        'action',
        'details',
        'created_at',
    ];
}
