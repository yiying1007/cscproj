import { UserLayout } from '../../../../Layouts/ClientLayout';
import { usePage,useForm,Link } from '@inertiajs/react';
import { useState,useEffect } from "react";
import Dropdown from 'react-bootstrap/Dropdown';
import { Button as BootstrapButton } from "react-bootstrap";
import { Button } from "../../Components/FormComponent";
import EditAvatarModal from './EditAvatarModal';
import Modal from 'react-bootstrap/Modal';
import CreatePost from '../Post/CreatePost';
import PostComponent from '../Post/Post';
import ReportComponent from '../Post/Report';
import CommunityEdit from './CommunityEdit';
import CommunityMember from './CommunityMember';


function CommunityProfile(){

    const { posts,hasMorePosts,community,isMember={},isLeader,leader,memberCount } = usePage().props;
    const communityAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${community.avatar}`;
    const [communityProfileTab, setCommunityProfileTab] = useState(localStorage.getItem('communityProfileTab') || "all");
    const leaderAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${leader.avatar}`;

    useEffect(() => {
        localStorage.setItem('communityProfileTab', communityProfileTab);
        return () => {
            localStorage.removeItem("communityProfileTab");
        };
    }, [communityProfileTab]);

    const { delete: exitCommunity,post, processing } = useForm();
    const { delete: deleteCommunity } = useForm();
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    //second modal
    const [exitShow, setExitShow] = useState(false);
    const handleExitClose = () => setExitShow(false);
    const handleExitShow = () => setExitShow(true);

    const joinCommunity = () => {
        post(route('user.joinCommunity', community.id));
    };

    const sendCommunityRequest = () => {
        post(route('user.sendCommunityRequest', community.id));
    };
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        deleteCommunity(route('user.deleteCommunity',community.id), {
            onSuccess: () => {
                handleClose(); // close modal
            },
          });
    }
    function formExitSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        exitCommunity(route('user.exitCommunity',community.id), {
            onSuccess: () => {
                handleExitClose(); // close modal
                setTimeout(() => {
                    window.location.reload();
                  }, 1500);
            },
          });
    }
    const actionAvatar=()=>{
        if(isMember){
        if(isMember.position ==='Admin' || isMember.position ==='Leader'){
            return(<EditAvatarModal community={community} />);
        }
        }
        return(<img src={communityAvatarUrl} className='avatarProfile' />);
    }

    const actionButton = () => {
        if (isLeader) return null;
        if(isMember){
            if (isMember.status ==='Accepted') return <BootstrapButton variant="dark" onClick={handleExitShow}><i className='bx bxs-exit'></i> Exit</BootstrapButton>;
            if (isMember.status ==='Pending') return <BootstrapButton variant="dark" disabled><i className='fa fa-clock-o'></i> Pending</BootstrapButton>;
        }
        if (community.is_private === "Public") return <BootstrapButton variant="dark" onClick={joinCommunity} disabled={processing}> <i className="bi bi-hand-index"></i>Join</BootstrapButton>;
        return <BootstrapButton variant="dark" onClick={sendCommunityRequest} disabled={processing}><i className="bi bi-hand-index"></i> Apply</BootstrapButton>;
    };

    return(
        <UserLayout>
        <div className='profile-container'>
            <div className='profile-info-container'>
            <div className="profile-info-border">
                <div className='profile-info-left'>
                        {actionAvatar()}
                </div>
                <div className='profile-info-center'>
                    <h3 style={{alignItems:"center",display:"flex"}}>
                        {community.name}&nbsp;
                        <span className='position-tag'>{community.type}</span>
                    </h3>
                    <h6>{community.is_private==="Public" ? <i className='fa fa-globe'></i> : <i className='bx bxs-lock-alt'></i>} | {memberCount} Members
                        
                    </h6>
                    <span>{community.description ?? "Still no description..."}</span>
                    <Link className='profile-link' href={route("user.targetUserProfile", leader)}>
                        <img src={leaderAvatarUrl} className='avatarHeader' />
                    </Link>
                </div>
                <div className='profile-info-right'>
                    {actionButton()}
                    {isMember && isMember.position ==='Leader' && <BootstrapButton onClick={handleShow} ><i className='bx bxs-trash'></i> Delete</BootstrapButton>}
                    {(isMember && isMember.position !='Leader' || !isMember) && <ReportComponent postData={community} postUrl="user.reportCommunity" dropdownIcon={true} />}
                </div>
                </div>

            </div>

            <div className='profile-tab-navigation'>
                <a onClick={() => setCommunityProfileTab("all")} className={communityProfileTab === "all" ? "active" : ""}>Post</a>
                {isMember && (isMember.position ==='Admin' || isMember.position ==='Leader') &&
                    <a onClick={() => setCommunityProfileTab("edit")} className={communityProfileTab === "edit" ? "active" : ""}>Setting</a>
                }
                <a onClick={() => setCommunityProfileTab("member")} className={communityProfileTab === "member" ? "active" : ""}>Member</a> 
            </div>
            {communityProfileTab === 'all' && (
                <>
                {isMember && isMember.status==="Accepted" &&
                <>
                    <CreatePost community={community} />
                    <PostComponent 
                        postsData={posts} 
                        hasMoreData={hasMorePosts} 
                        fetchUrl={`loadCommunityPosts/${community.id}`}
                        filterTypeComponent={true}
                        displayCommunityName={false}
                    />
                </>
                }
                {(!isMember && community.is_private==="Public") &&
                    <PostComponent 
                        postsData={posts} 
                        hasMoreData={hasMorePosts} 
                        fetchUrl={`loadCommunityPosts/${community.id}`}
                        filterTypeComponent={true}
                    />
                }
                {((!isMember || isMember.status !="Accepted") && community.is_private==="Private") &&
                    <>
                        <h5 className='info-message'>You are not yet a community member</h5>
                    </>
                }
                </>
            )}

            {communityProfileTab === 'edit' && (
                <>
                <CommunityEdit community={community} />
                </>
            )}
            {communityProfileTab === 'member' && (
                <>
                <CommunityMember communityId={community.id}/>
                </>
            )}
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Community</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formSubmit}>
                        
                        <h5>Are you sure to delete this community?</h5>
                        <hr />
                        <Button name="Delete" disabled={processing} />
                                
                    </form>

                </Modal.Body>
                
            </Modal>

            <Modal show={exitShow} onHide={handleExitClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Exit Community</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formExitSubmit}>
                        
                        <h5>Are you sure to exit this community?</h5>
                        <hr />
                        <Button name="Exit" disabled={processing} />
                                
                    </form>

                </Modal.Body>
                
            </Modal>

            
        </div>
        </UserLayout>

    );
}

export default CommunityProfile; 


