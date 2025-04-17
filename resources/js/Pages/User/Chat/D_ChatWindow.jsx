import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateMessage from "./CreateMessage";


function ChatWindow({ activeChat }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        if (activeChat) {
            axios.get(`/User/ChatMessage/${activeChat.id}`)
                .then((res) => {
                    setMessages(res.data.messages || []); // 避免 messages 为空时报错
                })
                .catch((err) => {
                    console.error("Error loading messages:", err);
                    setMessages([]); // 出错时设为空数组
                });
        } else {
            setMessages([]); // 如果没有 activeChat，也要保证 messages 是数组
        }
    }, [activeChat]);

    
    return (
        <div className="w-2/3 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
                {messages && messages.length > 0 ? (
                    messages.map((msg) => (
                        <div key={msg.id} className="p-2">
                            <strong>{msg.sender.nickname|| 'Unknown User'}:</strong> 
                            {msg.content}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No messages</p>
                )}
            </div>
            <div className="p-4 border-t">
                <CreateMessage chat={activeChat?.id}/>
            </div>
        </div>
    );
}
export default ChatWindow;