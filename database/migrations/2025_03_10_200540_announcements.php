<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('admins', function (Blueprint $table) {
            $table->id('id');
            $table->string('name')->unique(); 
            $table->string('email')->unique();
            $table->string('password'); 
            $table->enum('gender', ['Female', 'Male'])->nullable(); 
            $table->enum('position', ['Admin','Super Admin'])->default('Admin'); 
            $table->string('avatar')->default('avatar/defaultAdmin.png');
            $table->timestamps();
            $table->string('verification_code')->nullable();

        });

        Schema::create('users', function (Blueprint $table) {
            $table->id('id');
            $table->string('nickname')->unique();
            $table->string('email')->unique(); 
            $table->string('password'); 
            $table->enum('gender', ['Female', 'Male'])->nullable(); 
            $table->enum('position', ['Student', 'Lecture','Admin','Staff','Other'])->nullable(); 
            $table->string('intro')->nullable()->default('This user is very aloof and did not leave a personal signature'); 
            $table->string('avatar')->nullable()->default('avatar/defaultAvatar.png');
            $table->timestamp('createtime')->default(DB::raw('CURRENT_TIMESTAMP')); 
            $table->timestamp('last_login_time'); 
            $table->enum('acc_status', ['Active', 'Block', 'Inactive'])->default('Active');
            $table->datetime('acc_block_until')->nullable();
            $table->string('verification_code')->nullable();
            $table->unsignedInteger('acc_violation_count')->default(0);
            $table->foreignId('admin_id')->nullable()->constrained('admins')->nullOnDelete();

        });

        Schema::create('identity_verifications', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('email')->unique();
            $table->enum('role', ['Student', 'Lecture','Admin','Staff','Other']);
            $table->enum('course',['Accounting & Finance', 'Allied Health Science', 'Business', 'Education', 'Engineering', 'Hospitality & Tourism', 'Information Technology', 'Postgraduate Studies', 'Psychology'])->nullable();
            $table->enum('faculty', ['School of Business and Accountancy', 'School of Education and Languages','School of American Degree Program','School of Engineering, Information Technology and Allied Health Sciences','School of Hospitality & Tourism','Other'])->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); 
            $table->timestamps();
        });

        Schema::create('friendships', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('friend_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['Pending', 'Accepted', 'Rejected'])->default('Pending');
            $table->timestamps();
            $table->primary(['user_id', 'friend_id']);
        });

        Schema::create('chats', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->enum('type', ['Private', 'Group'])->default('Private');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('chat_members', function (Blueprint $table) {
            $table->foreignId('chat_id')->constrained('chats')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('messageStatus', ['Active', 'Inactive'])->default('Active');
            $table->enum('position', ['Member', 'Admin'])->default('Member'); // 群聊时的角色
            $table->datetime('message_status_updated')->nullable();
            $table->timestamps();
            $table->primary(['chat_id', 'user_id']);
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained('chats')->onDelete('cascade');
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade'); // 发送者
            $table->text('content')->nullable(); 
            $table->string('media_url')->nullable(); 
            $table->string('media_name')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->enum('status', ['Active', 'Block'])->default('Active');
            $table->timestamps();
        });
        
        Schema::create('communities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['Official', 'Club','Normal'])->default('Normal');
            $table->foreignId('created_by')->constrained('users');
            $table->enum('is_private', ['Public', 'Private'])->default('Public');
            $table->string('avatar')->default('avatar/defaultCommunity.png');
            $table->enum('status', ['Active', 'Block'])->default('Active');
            $table->timestamps();
        });

        Schema::create('community_members', function (Blueprint $table) {
            $table->foreignId('communities_id')->constrained('communities')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('position', ['Member', 'Admin','Leader'])->default('Member');
            $table->enum('status', ['Pending', 'Accepted', 'Rejected'])->default('Accepted');
            $table->timestamps();
            $table->primary(['communities_id', 'user_id']);
        });

        Schema::create('post_types', function (Blueprint $table) {
            $table->id();
            $table->string('type_name')->unique();
            $table->timestamps();
        });

        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('communities_id')->nullable()->constrained('communities')->nullOnDelete();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->longText('content')->nullable();
            $table->longText('media_url')->nullable();
            $table->foreignId('type_id')->nullable()->constrained('post_types')->nullOnDelete();
            $table->datetime('event_start_time')->nullable();
            $table->enum('is_private', ['Public', 'Private'])->default('Public');
            $table->boolean('is_top')->default(false);
            $table->enum('status', ['Active', 'Block'])->default('Active');
            $table->timestamps();
        });

        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('admins')->onDelete('cascade');
            $table->string('title');
            $table->longText('content')->nullable();
            $table->longText('media_url')->nullable();
            $table->datetime('end_time')->nullable();
            $table->timestamps();
        });

        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('posts')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('targetUser_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('content');
            $table->longText('media_url')->nullable();
            $table->enum('status', ['Active', 'Block'])->default('Active');
            $table->timestamps();
        });

        Schema::create('likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('content_type', ['Post', 'Comment']);
            $table->foreignId('content_id');
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('content_type', ['Post', 'Comment', 'Community','Chat']);
            $table->foreignId('content_id');
            $table->text('reason');
            $table->text('details')->nullable();
            $table->enum('status', ['Pending', 'Resolved', 'Rejected'])->default('Pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('admins')->onDelete('cascade');
            $table->text('review_notes')->nullable();
            $table->timestamps();
        });

        Schema::create('admin_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('admins')->nullOnDelete();
            $table->string('action');
            $table->text('details')->nullable();
            $table->timestamps();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('guard')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });


        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });

        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
        });

        Schema::create('job_batches', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('total_jobs');
            $table->integer('pending_jobs');
            $table->integer('failed_jobs');
            $table->longText('failed_job_ids');
            $table->mediumText('options')->nullable();
            $table->integer('cancelled_at')->nullable();
            $table->integer('created_at');
            $table->integer('finished_at')->nullable();
        });

        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('failed_jobs');
        Schema::dropIfExists('job_batches');
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('cache');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('admin_logs');
        Schema::dropIfExists('reports');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('likes');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('post_types');
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('community_members');
        Schema::dropIfExists('communities');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('chat_members');
        Schema::dropIfExists('chats');
        Schema::dropIfExists('friendships');
        Schema::dropIfExists('identity_verifications');
        Schema::dropIfExists('users');
        Schema::dropIfExists('admins');
    }
};
