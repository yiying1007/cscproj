import {useState,useEffect,useRef} from 'react';
import { UserLayout } from "../../../../Layouts/ClientLayout";
import { usePage,Link,useForm } from '@inertiajs/react';
import useInfiniteScroll from '../../Components/useInfiniteScroll';
import CreateChatModal from './CreateChatModal';
import DeleteChatModal from './DeleteChatModal';

function UserChat(){

    const {auth,chatList: initialChatList, hasMoreChats: initialHasMore } = usePage().props;

    // Auto load chats
    const [chatList, setChatList] = useState(initialChatList);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [page, setPage] = useState(1);
    const loadMoreChats = async () => {
        try {
            const res = await fetch(`loadChats?page=${page + 1}`, {
                headers: { "Accept": "application/json" }
            });
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

            const data = await res.json();
            setChatList([...chatList, ...data.chatList]);
            setHasMore(data.hasMore);
            setPage(page + 1);
        } catch (error) {
            console.error("Failed to load more chats", error);
        }
    };
    const { ref, loading } = useInfiniteScroll({ loadMore: loadMoreChats, hasMore });

    return(
        <UserLayout>
            <div className='chat-container'>
                <div className='chat-header'>
                    <div className='chat-header-left'>
                        <h5 className='index-title'>Chat</h5>
                    </div>
                    <div className='chat-header-right'>
                        <CreateChatModal />
                        <DeleteChatModal />
                        
                        
                    </div>
                </div>
                <div className='chat-body'>
                    {chatList.length > 0 ? (
                        chatList.map((chat) => {
                            //get target user 
                            const otherUser = chat.members.find(m => m.user.id !== auth.user.id);
                            const avatarUrl = otherUser ? otherUser.user.avatar : "default-avatar.png"; 
                            //get target user nickname 
                            const chatNicknames = chat.members
                                    .filter(m => m.user.id !== auth.user.id) 
                                    .map(m => m.user.nickname) 
                                    .join(", ");
                            
                            return(
                                <Link
                                    key={chat.id}
                                    href={route('user.showMessage',chat.id)}
                                    className='chat-border'
                                >
                                    <div className="chat-border-left">
                                    <img
                                        src={`https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${avatarUrl}`}
                                        className="avatarSmall"
                                    />
                                    </div>
                                    <div className="chat-border-center">
                                        <span>
                                            {chat.name ? chat.name : chatNicknames}
                                        </span>
                                        {chat.latest_message && (
                                            <small>
                                                {chat.latest_message &&
                                                    chat.latest_message.sender_id===auth.user.id ? 
                                                    "Me" : chatNicknames

                                                }
                                                :
                                                {chat.latest_message && (chat.latest_message.read_at===null && chat.latest_message.sender_id != auth.user.id) && (
                                                    <span className='message-badge'>[ New ] </span>
                                                )}
                                               {chat.latest_message &&
                                                    (chat.latest_message.content
                                                        ? chat.latest_message.content.length > 50
                                                            ? chat.latest_message.content.substring(0, 50) + "..."
                                                            : chat.latest_message.content
                                                        : chat.latest_message.media_url
                                                            ? "media"
                                                            : ""
                                                    )
                                                }

                                            </small>
                                        )}
                                    </div>
                                    
                            </Link>);
                        })
                    ) : (
                        <h5 className='info-message'>No Chats</h5>
                    )}
                </div>
                <div ref={ref}></div>
                    {loading && (
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <i className="interactive-icon bx bx-loader-circle" style={{ fontWeight: "600" }}>
                                &nbsp;Loading
                            </i>
                        </div>
                    )}


            </div>
            
        </UserLayout>
        
    );
}

export default UserChat; 


