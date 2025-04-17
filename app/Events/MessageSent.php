<?php

namespace App\Events;

use App\Models\Message;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use App\Notifications\SendNotification;


class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $receiver;
    /**
     * Create a new event instance.
     */
    public function __construct(Message $message)
    {
        $this->message = $message;
        /*
        // Get the recipient of the chat
        $this->receiver = User::where('id', '!=', $message->sender_id)
                              ->whereHas('chatMembers', function ($query) use ($message) {
                                  $query->where('chat_id', $message->chat_id);
                              })
                              ->first();
        // unactive,send notification
        if ($this->receiver && !$this->receiver->is_active) {
            $this->receiver->notify(new SendNotification($message->sender, 'chat_message'));
        }*/
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn()
    {
        \Log::info("Broadcasting message: ", ['message' => $this->message]);
        return new PrivateChannel("chat.{$this->message->chat_id}");
    }
    public function broadcastWith()
    {
        return [
            'message' => [
                'id' => $this->message->id,
                'chat_id' => $this->message->chat_id,
                'sender_id' => $this->message->sender_id,
                'content' => $this->message->content,
                'media_url' => $this->message->media_url,
                'media_name' => $this->message->media_name,
                'created_at' => $this->message->created_at->toDateTimeString(),
            ],
            'receiver_is_active' => $this->receiver ? $this->receiver->is_active : false,
        ];
    }


    public function broadcastAs()
    {
        return 'message.sent';
    }
}
