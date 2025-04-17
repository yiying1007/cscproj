import { UserLayout } from "../../../../Layouts/ClientLayout";
import { usePage } from '@inertiajs/react';
import EditAvatarModal from './EditAvatarModal';
import { useState,useEffect } from "react";
import PostComponent from "../Post/Post";
import ProfileEdit from "./ProfileEdit";
import ResetPassword from "./ResetPassword";
import VerificationCard from "../PersonalVerificationCard";


function Profile(){

    const { posts, hasMorePosts, auth } = usePage().props;
    const [profileTab, setProfileTab] = useState(localStorage.getItem('profileTab') || "all");
    
    useEffect(() => {
        localStorage.setItem('profileTab', profileTab);
        return () => {
            localStorage.removeItem("profileTab");
        };
    }, [profileTab]);
    return(
        <UserLayout>
        <div className='profile-container'>
            <div className='profile-info-container'>
                <div className="profile-info-border-i">
                <div className='profile-info-left'>
                <EditAvatarModal />
                </div>
                <div className='profile-info-center-i'>
                    <h3>{auth.user.nickname} 
                        {(auth.user.gender != null && auth.user.gender==="Female") && 
                            <i className='gender-icon bx bx-female-sign' style={{color:"#dc3545"}}></i>} 
                        {(auth.user.gender != null && auth.user.gender==="Male") && 
                            <i className='gender-icon bx bx-male-sign' style={{color:"#0d6efd"}}></i>}
                    </h3>
                    <span>{auth.user.intro}</span>
                </div>
                <div className='profile-info-right'>
                </div>
                </div>
            </div>
            <div className='profile-tab-navigation'>
                <a onClick={() => setProfileTab("all")} className={profileTab === "all" ? "active" : ""}>Post</a>
                <a onClick={() => setProfileTab("edit")} className={profileTab === "edit" ? "active" : ""}>Profile Edit</a>
                <a onClick={() => setProfileTab("identity")} className={profileTab === "identity" ? "active" : ""}>SEGi Identity</a>
                    
            </div>
            {profileTab === 'all' && (
                <>
                <PostComponent 
                    postsData={posts} 
                    hasMoreData={hasMorePosts} 
                    fetchUrl="loadMyPosts"
                    filterTypeComponent={true}
                    filterVisibilityComponent={true}
                />
                </>
            )}
            {profileTab === 'edit' && (
                <>
                <ProfileEdit />
                <ResetPassword />
                </>
            )}
            {profileTab === 'identity' && (
                <>
                <VerificationCard id={auth.user.id} />
                </>
            )}

            
        </div>
        </UserLayout>

    );
}

export default Profile; 


