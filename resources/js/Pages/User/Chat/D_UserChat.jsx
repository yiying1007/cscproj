import {useState,useEffect,useRef} from 'react';
import { UserLayout } from "../../../../Layouts/ClientLayout";
import { usePage } from '@inertiajs/react';
import useInfiniteScroll from '../../Components/useInfiniteScroll';
import CreateMessage from "./CreateMessage";
//import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

function UserChat(){

    const {auth,chatList } = usePage().props;
    const [activeChat, setActiveChat] = useState(null);
    
    return(
        <UserLayout>
            <div className='chat-container'>
                <div className='chat-left-container'>
                    <ChatList chatList={chatList} setActiveChat={setActiveChat} activeChat={activeChat} />
                </div>
                <div className='chat-right-container'>
                    <ChatWindow activeChat={activeChat} />
                </div>

            </div>
            
        </UserLayout>
        
    );
}

export default UserChat; 


