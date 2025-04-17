<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class resetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public $subjectText;
    public $messageText;

    /**
     * Create a new message instance.
     */
    public function __construct($subject, $message)
    {
        $this->subjectText = $subject;
        $this->messageText = $message;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'SEGiSpace Password Verification Code',
        );
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this
            ->subject($this->subjectText) 
            ->html($this->messageText);
    }
}
