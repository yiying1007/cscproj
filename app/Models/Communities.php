<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Communities extends Model
{
    protected $fillable = [
        'name',
        'description',
        'type',
        'created_by',
        'is_private',
        'avatar',
        'status',
        
    ];
}
