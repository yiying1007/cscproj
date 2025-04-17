<?php

namespace App\Models;
use App\Models\Chat;
use App\Models\Admin;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    const CREATED_AT = 'createtime';
    const UPDATED_AT = 'last_login_time';

    
    protected $fillable = [
        'nickname',
        'email',
        'password',
        'gender',
        'position',
        'intro',
        'avatar',
        'acc_status',
        'acc_block_until',
        'admin_id',
        
    ];
    public function chats()
    {
        return $this->belongsToMany(Chat::class, 'chat_members', 'user_id', 'chat_id');
    }
    public function chatMembers()
    {
        return $this->belongsToMany(Chat::class, 'chat_members', 'user_id', 'chat_id');
    }
    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id');
    }
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    /*
    protected $hidden = [
        'user_password',
    ];*/

    //laravel default name is email and password,but my table in db set user_email and user password
    //so need change name
    /*
    public function getAuthIdentifierName()
    {
        return 'user_email';
    }

    public function getAuthPassword()
    {
        return $this->user_password;
    }
    
    public function getAuthIdentifier()
    {
        return $this->user_id;  // 返回自定义的 user_id
    }
*/

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    /*
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }*/
}
