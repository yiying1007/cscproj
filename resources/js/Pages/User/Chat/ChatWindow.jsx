import { UserLayout } from "../../../../Layouts/ClientLayout";
import { useState, useEffect,useRef } from "react";
import axios from "axios";
import CreateMessage from "./CreateMessage";
import { Link,usePage,useForm } from "@inertiajs/react";
import Echo from 'laravel-echo';
import { Button } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal';
import { Button as Btn } from "../../Components/FormComponent";
import ReportComponent from "../Post/Report";

function ChatWindow() {
    const {auth,messages: initialMessages = [],targetUser } = usePage().props;
    const { delete:deleteMsg,post,processing } = useForm();
    const [messages, setMessages] = useState(initialMessages);
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    //modal delete
    const [showDelete, setShowDelete] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const handleCloseDelete = () => {
        setShowDelete(false);
        setSelectedMessage(null);
    };
    const handleShowDelete = (message) => {
        setShowDelete(true);
        setSelectedMessage(message);
    };

    //delete all message
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('user.deleteHistoryMessage',targetUser.chat_id), {
            onSuccess: () => {
                handleClose(); // close modal
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            },
          });
    }
    // delete message
    const deleteMessage = () => {
        if(selectedMessage){
          deleteMsg(route("user.deleteMessage",selectedMessage.id),{
            onSuccess: () => {
              handleCloseDelete(); // close modal
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            },
          });
        }
    };

    const avatarUrl = targetUser ? targetUser.user.avatar : "defaultAvatar.png"; 
    useEffect(() => {
        const markMessagesAsRead = async () => {
            try {
                await axios.post("/User/ChatMessage/AsRead", { chat_id: targetUser.chat_id });
            } catch (error) {
                console.error("Failed to mark messages as read:", error);
            }
        };

        markMessagesAsRead();

        const echo = new Echo({
            broadcaster: "pusher",
            key: import.meta.env.VITE_PUSHER_APP_KEY,
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
            forceTLS: true,
            authEndpoint: "/broadcasting/auth",
        });

        const channel = echo.private(`chat.${targetUser.chat_id}`);

        channel.listen(".message.sent", (event) => {
            
            // If the current chat window is the chat_id of the message, mark Read
            if (event.message.chat_id === targetUser.chat_id) {
                markMessagesAsRead();
            }
        });

        return () => {
            channel.stopListening(".message.sent");
        };

    }, [targetUser.chat_id]);

    //media component
    const getMediaComponent = (media, mediaName) => {
        if (!media) return null;
    
        if (media.match(/\.(jpeg|jpg|gif|png)$/)) {
            return (
                <div className="image-container">
                    <img 
                        src={media} 
                        alt="post image" 
                        className="chatImage"
                        style={{ cursor: "pointer" }} 
                    />
                </div>
            );
        } else if (media.match(/\.(mp4|webm|mov|avi)$/)) {
            return (
                <div className="video-container">
                    <video src={media} controls width="100%" />
                </div>
            );
        } else if (media.match(/\.(mpeg|mp3|wav)$/)) {
            return (
                <div className="audio-container">
                    <audio src={media} controls></audio>
                </div>
            );
        } else if (media.match(/\.(pdf|docx|doc|xlsx|pptx)$/)) {
            return (
                <span className="message-file-border">
                    
                    <a 
                    href={media} 
                    download={mediaName} 
                    className="file-download-link"
                    >
                        <i className='bx bxs-download'></i>&nbsp;
                        <span className="file-name"> {mediaName}</span>
                    </a>
                    
                </span>
            );
        }
        return null;
    };

    //real time show message
    useEffect(() => {
        const echo = new Echo({
            broadcaster: "pusher",
            key: import.meta.env.VITE_PUSHER_APP_KEY,
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
            forceTLS: true,
            authEndpoint: "/broadcasting/auth",
        });
    
        const channel = echo.private(`chat.${targetUser.chat_id}`);
    
        channel.listen(".message.sent", (event) => {
            if (!event.message) {
                console.error("Error: Event does not contain 'message'", event);
                return;
            }
    
            setMessages((prevMessages) => [...prevMessages, event.message]);

            if (!event.receiver_is_active) {
                new Notification("New Message", {
                    body: `From ${targetUser.user.nickname}: ${event.message.content}`,
                });
            }
        });
    
        return () => {
            channel.stopListening(".message.sent");
        };
    }, [targetUser]);
    
    
    
    
    //scroll to new message
    const chatBodyRef = useRef(null);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    

    return (
        <UserLayout>
            <div className='chat-window-container'>
                <div className='chat-window-header'>
                    <div className='chat-header-left'>
                        <Link href={route('user.chat')} className='chat-back-btn'>Back</Link>
                    </div>
                    <Link className="chat-header-center" href={route('user.targetUserProfile',targetUser.user_id)}>
                        <img className="avatarHeader" src={`https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${avatarUrl}`} />
                        <h5 className='index-title'>{targetUser.user.nickname}</h5>
                    </Link>
                    <div className='chat-header-right'>
                        <Button onClick={handleShow}><i className='bx bxs-trash'></i></Button>
                    </div>
                </div>
                <div className='chat-window-body' ref={chatBodyRef}>
                    {messages && messages.length > 0 ? (
                        messages.map((msg) => {
                            if (!msg) {
                                console.error("Error: msg is undefined", msg);
                                return null;
                            }
                            const mediaUrl = msg.media_url ? msg.media_url : null;
                            return(
                                <div
                                    key={msg.id}
                                    className={`${msg.sender_id===auth.user.id ? 'message-box-right' : 'message-box-left'}`}
                                >
                                    <div>
                                        {msg.media_url && getMediaComponent(mediaUrl, msg.media_name)}
                                        {msg.content && <span>{msg.content}</span>} 
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between",gap:"10px", alignItems: "center" }}>
                                        <small className="message-chat-date">{new Date(msg.created_at).toLocaleString()}</small>
                                        <ReportComponent postData={msg} postUrl="user.reportChat" chatReportIcon={true} />
                                        {auth.user.id === msg.sender_id && <i className='interactive-icon bx bxs-trash' onClick={() => handleShowDelete(msg)}></i>}
                                    </div>
                                    
                                </div>
                                );
                        })
                    ) : (
                        <></>
                    )}
                </div>
                <div className="chat-window-bottom">
                    <CreateMessage chat={targetUser.chat_id} targetUser={targetUser.user_id} />
                </div>
            </div>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete History Message</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formSubmit}>
                        <h5>Are you sure to delete the history message?</h5>
                        <hr />
                        <Btn name="Delete" disabled={processing} />   
                    </form>
                </Modal.Body>
            </Modal>

            <Modal show={showDelete} onHide={handleCloseDelete}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Message</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5 style={{textAlign:"center"}}>Are you sure to delete this Message from everyone device?</h5>
                    <hr />
                    <Btn name="Delete" type="button"  onClick={deleteMessage} disabled={processing} />                             
                </Modal.Body>
            </Modal>
        </UserLayout>
    );
}
export default ChatWindow;