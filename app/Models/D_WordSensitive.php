<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WordSensitive extends Model
{
    protected $table = 'sensitive_words';

    protected $fillable = [
        'word',
        'type',
    ];
}
