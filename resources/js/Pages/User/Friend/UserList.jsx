import { UserLayout } from "../../../../Layouts/ClientLayout";
import FriendRequest from "./FriendRequestList";
import FriendList from "./FriendList";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { usePage } from "@inertiajs/react";
import {useState,useEffect} from 'react';

function User() {
    const { friendRequest } = usePage().props;
    const [friendTab, setFriendTab] = useState(localStorage.getItem('friendTab') || 'myFriend');
    //remember user choose tab status
    useEffect(() => {
        localStorage.setItem('friendTab', friendTab);
    }, [friendTab]);
    return (
      <UserLayout>
        <div className="topStyle">
            <h3 className="titleName">Friend</h3>
        </div>
        <hr />
        <div className='index-navigation-container' style={{gap:"30px"}}>
            <a 
                onClick={() => setFriendTab('request')}
                className={friendTab === 'request' ? 'active' : ''}
                style={{ position: 'relative', display: 'inline-block' }}
            >
                Friend Request
                {friendRequest && friendRequest.length > 0 && (
                    <span className="badge" style={{
                        position: 'absolute',
                        right: '-20px',
                        backgroundColor: 'red',
                        color: 'white',
                        borderRadius: '50%',
                        padding: '2px 5px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        lineHeight: '1',
                    }}>{friendRequest.length}</span>
                )}
            </a>
            <a
                onClick={() => setFriendTab('myFriend')}
                className={friendTab === 'myFriend' ? 'active' : ''}
            >
                My Friends
            </a>
        </div>
        {friendTab === 'request' && (
            <FriendRequest />
        )}
        {friendTab === 'myFriend' && (
            <FriendList />
        )}
        
        
        </UserLayout>
    );
}

export default User;

//<Tab eventKey="userList" title="All User"><UserList /></Tab>