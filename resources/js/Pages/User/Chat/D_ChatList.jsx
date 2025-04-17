import { usePage } from "@inertiajs/react";

function ChatList({ chatList=[], setActiveChat, activeChat }) {
    const {auth } = usePage().props;
    return (
        <div className="chat-list">
            <div className="chat-header">
                <h5>Messages</h5>
                <hr />
            </div>
            {chatList.length > 0 ? (
                chatList.map((chat) => {
                    const chatNicknames = chat.members
                            .filter(m => m.user.id !== auth.user.id) // 排除 auth.user
                            .map(m => m.user.nickname) // 只获取 nickname
                            .join(", ");
                    return(
                        <div
                            key={chat.id}
                            onClick={() => setActiveChat(chat)}
                            className={`chat-border ${
                                activeChat?.id === chat.id ? "bg-blue-300" : "hover:bg-gray-200"
                            }`}
                        >
                            <div className="chat-border-left">
                                <img src={`https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${chat.members.avatar}`} alt="" />
                            </div>
                            <div className="chat-border-right"></div>
                        <h3 className="font-semibold">{chat.name
                                        ? chat.name
                                        : chatNicknames}</h3>
                        {chat.latestMessage && (
                            <p className="text-sm text-gray-600">{chat.latestMessage.content}</p>
                        )}
                    </div>);
                })
            ) : (
                <p className="p-4 text-gray-500">No active chats</p>
            )}
        </div>
    );
}
export default ChatList;
