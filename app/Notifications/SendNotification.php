<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SendNotification extends Notification
{
    use Queueable;

    private $sender;
    private $type;
    /**
     * Create a new notification instance.
     */
    public function __construct($sender,$type = 'friend_request', $data = null)
    {
        $this->sender = $sender;
        $this->type = $type; 
        $this->data  = $data ;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // store to db
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        if ($this->type === 'friend_request') {
            return [
                'type' => 'friend_request',
                'message' => "{$this->sender->nickname} sent you a friend request.",
                'sender_id' => $this->sender->id,
            ];
        }
        if ($this->type === 'friend_accept') {
            return [
                'type' => 'friend_accept',
                'message' => "{$this->sender->nickname} accepted your friend request.",
                'sender_id' => $this->sender->id,
            ];
        }
        if ($this->type === 'community_accept') {
            return [
                'type' => 'community_accept',
                'message' => "You have successfully joined the community {$this->data['community_name']}.",
                'sender_id' => $this->sender->id,
                'community_id' => $this->data['community_id'] ?? null,
            ];
        }

        if ($this->type === 'community_positionChange') {
            return [
                'type' => 'community_positionChange',
                'message' => "Your position at {$this->data['community_name']} has changed.",
                'sender_id' => $this->sender->id,
                'community_id' => $this->data['community_id'] ?? null,
            ];
        }

        if ($this->type === 'community_deleted') {
            return [
                'type' => 'community_deleted',
                'message' => "Your community [{$this->data}] has been disbanded.",
                'sender_id' => $this->sender->id,
            ];
        }

        if ($this->type === 'community_deletedByAdmin') {
            return [
                'type' => 'community_deleted',
                'message' => "Your community [{$this->data}] has been disbanded by SEGiSpace Admin.",
                'sender_id' => $this->sender->id,
            ];
        }

        if ($this->type === 'community_inviteMember') {
            return [
                'type' => 'community_inviteMember',
                'message' => "{$this->sender->nickname} added you to the [{$this->data['community_name']}] community.",
                'sender_id' => $this->sender->id,
                'community_id' => $this->data['community_id'] ?? null,
            ];
        }

        if ($this->type === 'communityMember_removeByAdmin') {
            return [
                'type' => 'communityMember_removeMember',
                'message' => " SEGiSpace Admin remove you from [{$this->data['community_name']}] community.",
                'sender_id' => $this->sender->id,
                'community_id' => $this->data['community_id'] ?? null,
            ];
        }
        if ($this->type === 'communityMemberRemoved_byAdmin') {
            return [
                'type' => 'communityMember_removeMember',
                'message' => " SEGiSpace Admin remove your member from [{$this->data['community_name']}] community.",
                'sender_id' => $this->sender->id,
                'community_id' => $this->data['community_id'] ?? null,
            ];
        }
        if ($this->type === 'community_positionChangeByAdmin') {
            return [
                'type' => 'community_positionChange',
                'message' => " SEGiSpace Admin change your member position from [{$this->data['community_name']}] community.",
                'sender_id' => $this->sender->id,
                'community_id' => $this->data['community_id'] ?? null,
            ];
        }
        if ($this->type === 'communityPositionChange_byAdmin') {
            return [
                'type' => 'community_positionChange',
                'message' => " SEGiSpace Admin have changed the member's position from [{$this->data['community_name']}] community.",
                'sender_id' => $this->sender->id,
                'community_id' => $this->data['community_id'] ?? null,
            ];
        }
        if ($this->type === 'communityInviteMember_byAdmin') {
            return [
                'type' => 'community_inviteMember',
                'message' => "SEGiSpace Admin added you to the [{$this->data['community_name']}] community.",
                'sender_id' => $this->sender->id,
                'community_id' => $this->data['community_id'] ?? null,
            ];
        }
        if ($this->type === 'postReport_byAdmin') {
            return [
                'type' => 'post_report',
                'message' => "The post [{$this->data}] is suspected of violating the content and has been blocked.",
                'sender_id' => $this->sender->id,
            ];
        }

        if ($this->type === 'post_comment') {
            return [
                'type' => 'post_comment',
                'message' => "{$this->sender->nickname} commented on your post.",
                'sender_id' => $this->sender->id,
                'post_id' => $this->data['post_id'] ?? null, 
                'comment_id' => $this->data['comment_id'] ?? null, 
                'content' => $this->data['content'] ?? '', 
            ];
        }

        if ($this->type === 'post_replyComment') {
            return [
                'type' => 'post_replyComment',
                'message' => "{$this->sender->nickname} reply on your comment.",
                'sender_id' => $this->sender->id,
                'post_id' => $this->data['post_id'] ?? null, 
                'comment_id' => $this->data['comment_id'] ?? null, 
                'content' => $this->data['content'] ?? '', 
            ];
        }
        
        if ($this->type === 'commentReport_byAdmin') {
            return [
                'type' => 'comment_report',
                'message' => "The comment [{$this->data}] is suspected of violating the content and has been blocked.",
                'sender_id' => $this->sender->id,
            ];
        }

        if ($this->type === 'likePost') {
            return [
                'type' => 'post_like',
                'message' => "Someone likes your post.",
                'sender_id' => $this->sender->id,
                'post_id' => $this->data['post_id'] ?? null, 
                'content' => "[{$this->data['content']}]" ?? '', 
            ];
        }
        if ($this->type === 'likeComment') {
            return [
                'type' => 'comment_like',
                'message' => "Someone likes your comment.",
                'sender_id' => $this->sender->id,
                'content' => "[{$this->data['content']}]" ?? '', 
                'comment_id' => $this->data['comment_id'] ?? null, 
                'post_id' => $this->data['post_id'] ?? null, 
            ];
        }
        if ($this->type === 'community_blockedByAdmin') {
            return [
                'type' => 'community_report',
                'message' => "The community [{$this->data}] alleged violations, the community and related posts has been blocked.",
                'sender_id' => $this->sender->id,
            ];
        }
        if ($this->type === 'chat_message') {
            return [
                'type' => 'chat_message',
                'message' => "You have received new chat messages from {$this->sender->nickname}",
                'sender_id' => $this->sender->id,
            ];
        }

        if ($this->type === 'chatReport_byAdmin') {
            return [
                'type' => 'chat_report',
                'message' => "The chat message [{$this->data}] is suspected of violating the content and has been blocked.",
                'sender_id' => $this->sender->id,
            ];
        }
    }
}
