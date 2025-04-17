<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FriendNotifications
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    public $sender;
    public $receiverId;
    public $type;
    public $message;
    /**
     * Create a new event instance.
     */
    public function __construct(User $sender, int $receiverId, string $type, string $message)
    {
        $this->sender = $sender;
        $this->receiverId = $receiverId;
        $this->type = $type;
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->receiverId),
        ];
    }
    // get data to broadcast
    public function broadcastWith()
    {
        return [
            'sender_id' => $this->sender->id,
            'message' => $this->message,
            'type' => $this->type,
        ];
    }
}
