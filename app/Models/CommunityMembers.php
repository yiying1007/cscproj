<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommunityMembers extends Model
{
    protected $fillable = [
        'communities_id',
        'user_id',
        'position',
        'status', 
    ];
}
