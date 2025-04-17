<?php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class UnreadMessageNotification implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $unreadMessage;
    public $userId;

    public function __construct($userId, $unreadMessage)
    {
        $this->userId = $userId;
        $this->unreadMessage = $unreadMessage;
    }

    public function broadcastOn()
    {

        return new PrivateChannel('user.' . $this->userId);
    }

    public function broadcastWith()
    {
        \Log::info("Broadcasting message: ", ['unreadMessage' => $this->unreadMessage]);

        return [
            'unreadMessage' => $this->unreadMessage,
        ];
    }
    public function broadcastAs()
    {
        return 'UnreadMessageNotification';
    }

    

}