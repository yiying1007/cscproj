import { useState,useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import Button from 'react-bootstrap/Button';
import Echo from 'laravel-echo';
import Pusher from "pusher-js";


function Notice() {
    const { auth } = usePage().props;
    const [unreadNotifications, setUnreadNotifications] = useState([]);
    const [readNotifications, setReadNotifications] = useState([]);
    const [show, setShow] = useState(false);
    
    // dynamically loading notification data
    /*const fetchNotifications = () => {
        fetch("/User/api/Notifications")
            .then((response) => response.json())
            .then((data) => {
                setUnreadNotifications(data.unreadNotifications || []);
                setReadNotifications(data.readNotifications || []);
            })
            .catch((error) => console.error("Error fetching notifications:", error));
    };

    // Get notification data when the page loads
    useEffect(() => {
        fetchNotifications(); 
    }, [show]);*/

    // Fetch notifications every 5 seconds
    useEffect(() => {
        const fetchNotifications = () => {
            fetch("/User/api/Notifications")
                .then((response) => response.json())
                .then((data) => {
                    setUnreadNotifications(data.unreadNotifications || []);
                    setReadNotifications(data.readNotifications || []);
                })
                .catch((error) => console.error("Error fetching notifications:", error));
        };
        
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5000); 
        return () => clearInterval(interval);
    }, []);

    


    const toggleShow = () => {
        //setShow((prevShow) => !prevShow);
        const newShowState = !show;
        setShow(newShowState);
        // if the display status changes to hidden, the API flag notification is called as read
        if (show) {
            router.post(route('user.markAsRead'), {}, {
                onSuccess: () => console.log('All notifications marked as read'),
                onError: (errors) => console.error(errors),
            });
        }
    };
    
    const noticeAsRead = () => {
        router.post(route('user.markAsRead'), {}, {
            onError: (errors) => console.error(errors),
        });
    }
        
    const clearAll = () => {
        router.delete(route('user.clearAllNotice'), {
            onSuccess: () => {
                console.log('All notifications cleared');
                setUnreadNotifications([]);
                setReadNotifications([]);
            },
            onError: (errors) => console.error(errors),
        });
    };

    //redirect to target page
    const handleNotificationClick = (notification) => {
        //console.log(notification.data.type,notification.data.post_id,notification.data.comment_id);

        if (notification.data.type === 'post_comment' || notification.data.type === 'post_replyComment'|| notification.data.type === 'comment_like'|| notification.data.type === 'post_like') {
            noticeAsRead();
            const postId = notification.data.post_id;
            const commentId = notification.data.comment_id;
            if (postId && commentId) {
                window.location.href = `${window.location.origin}/User/Post/DetailPost/${postId}#comment-${commentId}`;
            }else if(postId){
                window.location.href = `${window.location.origin}/User/Post/DetailPost/${postId}`;
            }else {
                console.error('Missing post_id or comment_id in notification data');
            }
        }
        if (notification.data.type === 'friend_request' || notification.data.type === 'friend_accept') {
            noticeAsRead();
            window.location.href = `${window.location.origin}/User/UserList`;
        }
        if (notification.data.type === 'community_accept' || notification.data.type === 'community_positionChange' || notification.data.type === 'community_inviteMember' || notification.data.type === 'communityMember_removeMember') {
            noticeAsRead();
            const communityId = notification.data.community_id;
            if (communityId) {
                window.location.href = `${window.location.origin}/User/Communities/Profile/${communityId}`;
            }else {
                console.error('Missing communityId in notification data');
            }
        }

        
    };

    return (
                <div className="notification-style">
                    <div className="notification" onClick={toggleShow} >
                        <i className="headerLink bx bxs-bell bx-sm"></i>
                        
                        {unreadNotifications && unreadNotifications.length > 0 && (
                            <span className="badge">{unreadNotifications.length}</span>
                        )}
                    </div>
                    <div className={`notification-listbox ${show ? '' : 'hidden'}`}>
                        
                            <div className="notice-top">
                                <Button variant='link' size="sm" style={{ color:'black'}} onClick={clearAll}>Clear All</Button>
                            </div>
                        
                            {unreadNotifications.length > 0 || readNotifications.length > 0 ? (
                    <>
                        {unreadNotifications.map((notification) => (
                            <div 
                                className="noticebox" 
                                style={{backgroundColor:"#f0bc78a4"}} 
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <p>
                                    <span style={{color:'#543A14',fontWeight:"bold"}}>New </span>{notification.data.message}
                                    <br />
                                    <span style={{fontWeight:"600"}}>{notification.data.content != null &&  <span>: {notification.data.content.length > 65 ? notification.data.content.substring(0, 65) + "..." : notification.data.content}</span>}</span>
                                </p>
                                <p style={{textAlign:"right"}}>{new Date(notification.created_at).toLocaleString()}</p>
                                
                                
                            </div>
                        ))}

                        {readNotifications.map((notification) => (
                            <div 
                                className="noticebox" 
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <p>
                                    {notification.data.message} <br />
                                    <span style={{fontWeight:"600"}}>{notification.data.content != null &&  <span>: {notification.data.content.length > 65 ? notification.data.content.substring(0, 65) + "..." : notification.data.content}</span>}</span>
                                </p>
                                <p style={{textAlign:"right",fontSize:"13px"}}>{new Date(notification.created_at).toLocaleString()}</p>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="noticebox">
                        <h6 className='info-message'>No Notifications</h6>
                    </div>
                )}
                    </div>
                </div>
            
    );
}

export default Notice;
