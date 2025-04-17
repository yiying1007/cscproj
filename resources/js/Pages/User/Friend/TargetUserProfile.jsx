import { UserLayout } from '../../../../Layouts/ClientLayout';
import { useForm,usePage } from '@inertiajs/react';
import Button from 'react-bootstrap/Button';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import PostComponent from '../Post/Post';
import { useEffect,useState } from 'react';
import VerificationCard from '../PersonalVerificationCard';
import AboutUser from './AboutUser';

function TargetUserProfile(){
    const { posts,hasMorePosts,user,friendStatus } = usePage().props;
    const { delete: deleteFriend,post, processing } = useForm();

    const userAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${user.avatar}`;
    
    const [targetProfileTab, setTargetProfileTab] = useState(localStorage.getItem('targetProfileTab') || "all");
    
    useEffect(() => {
        localStorage.setItem('targetProfileTab', targetProfileTab);
        return () => {
            localStorage.removeItem("targetProfileTab");
        };
    }, [targetProfileTab]);

    const sendFriendRequest = () => {
        post(route('user.sendFriendRequest', user.id));
    };

    const deleteTargetFriend = () => {
        deleteFriend(route('user.deleteTargetFriend', user.id));
    };

    const createChat = () => {
        post(route('user.createChat', user.id));
    };
    
    return(
        <UserLayout>
        <div className='profile-container'>
            <div className='profile-info-container'>
                <div className='profile-info-border'>
                <div className='profile-info-left'>
                    <img src={userAvatarUrl} className='avatarProfile' />
                </div>
                <div className='profile-info-center'>
                    <h3>{user.nickname} {(user.gender != null && user.gender==="Female") && <i className='gender-icon bx bx-female-sign' style={{color:"#dc3545"}}></i>} {(user.gender != null && user.gender==="Male") && <i className='gender-icon bx bx-male-sign' style={{color:"#0d6efd"}}></i>} </h3>
                    <p>{user.intro ?? "This user is very aloof and did not leave a personal signature."}</p>
                </div>
                <div className='profile-info-right'>
                {friendStatus === 'Accepted' ? (
                    <Button variant="dark" onClick={deleteTargetFriend} disabled={processing}>
                        <i className="fa fa-user-times"></i>
                    </Button>
                ) : friendStatus === 'Pending' ? (
                    <Button variant="dark" disabled>
                        <i className="fa fa-user-plus"></i>
                    </Button>
                ) : (
                    <Button variant="dark" onClick={sendFriendRequest} disabled={processing}>
                        <i className="fa fa-user-plus"></i>
                    </Button>
                )}
                <Button variant="dark" onClick={createChat}  disabled={processing}>
                <i className="bi bi-send-fill"></i>
                    </Button>
                </div>
                </div>
            </div>
            <div className='profile-tab-navigation'>
                <a onClick={() => setTargetProfileTab("all")} className={targetProfileTab === "all" ? "active" : ""}>Post</a>
                <a onClick={() => setTargetProfileTab("about")} className={targetProfileTab === "about" ? "active" : ""}>About</a>
                    
            </div>
            {targetProfileTab === 'all' && (
                <>
                <PostComponent 
                    postsData={posts} 
                    hasMoreData={hasMorePosts} 
                    fetchUrl={`loadTargerUserPosts/${user.id}`}
                    filterTypeComponent={true}
                />
                </>
            )}
            {targetProfileTab === 'about' && (
                <>
                <AboutUser />
                <VerificationCard id={user.id} />
                </>
            )}
            
        </div>
        </UserLayout>
    );
}

export default TargetUserProfile; 


