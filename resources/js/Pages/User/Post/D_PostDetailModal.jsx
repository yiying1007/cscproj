import { usePage,Link } from "@inertiajs/react";
import { useState } from "react";
import Modal from 'react-bootstrap/Modal';
import CreateComment from "./CreateComment";


function DetailPost({post}) {
    const { auth } = usePage().props;
    const userAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${auth.user.avatar}`;
    const mediaUrls = JSON.parse(post.media_url || "[]");
    
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);

    return (
        <>
            <i className='post-detail-btn bx bxs-comment-detail' onClick={() => setShow(true)} > Comment</i>
            

            <Modal show={show} onHide={() => setShow(false)} fullscreen>
                <Modal.Header closeButton>
                    <Modal.Title>Post Detail</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="post-detail-container" >
                    <div className="detail-border">
                        <div className="detail-content">
                        <div className="post-header">
                            <div className="post-header-left">
                                <img src={userAvatarUrl} className="avatarSmall"/>
                            </div>
                            <div className="post-header-center">
                                <p style={{fontWeight:"500"}}>{post.nickname} </p>
                                <p>{new Date(post.created_at).toLocaleString()}</p>{/*&nbsp;*/}
                                {post.community_name != null && <Link className='position-tag' href={route('user.communityProfile',post.communities_id)}>{post.community_name}</Link>} 
                            </div>
                        </div>
                        <div className="post-body">
                            <hr className="post-line" />
                            <div className="post-title">
                                <h5>{post.title}</h5>
                            </div>
                            <hr className="post-line"/>
                            <div className="post-content">
                                <div className="content-text">
                                    <p>{post.content}</p>
                                </div>
                                <div className='content-media'>
                                    {mediaUrls.map((media, index) => {
                                            if (media.match(/\.(jpeg|jpg|gif|png)$/)) {
                                                return (
                                                    <div key={index} className="image-container">
                                                        <img 
                                                            src={media} 
                                                            alt="post image" 
                                                            width="200"  
                                                            style={{ cursor: "pointer" }} 
                                                        />
                                                    </div>
                                                );
                                            }else if (media.match(/\.(mp4|webm|mov|avi)$/)) {
                                                return (
                                                    <div key={index} className="video-container">
                                                        <video src={media} controls width="100%" />
                                                    </div>
                                                );
                                            }else if (media.match(/\.(mpeg|wav|mp3)$/)) {
                                                return (
                                                    <div key={index} className="audio-container">
                                                        <audio src={media} controls></audio>
                                                    </div>
                                                );
                                            }else if (media.includes("youtube.com") || media.includes("youtu.be")) {
                                                const videoId = media.split("v=")[1]?.split("&")[0] || media.split("/").pop();
                                                return (
                                                    <div key={index} className="youtube-container">
                                                        <iframe
                                                            src={`https://www.youtube.com/embed/${videoId}`}
                                                            title="YouTube video"
                                                            allowFullScreen
                                                            width="100%"
                                                            height="315"
                                                        ></iframe>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    <div className="detail-border">
                        <div className="detail-content">
                            <CreateComment post={post} />
                            {/*show comment list
                                --when user click comment content box,show the <CreateComment post={post} comment={comment}/>
                             */}
                            <ul>
                                {post.comments.map((comment) => (
                                    <li key={comment.id}>
                                        <img src={`https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${comment.avatar}`} className="avatarSmall" />
                                        <p><strong>{comment.nickname}:</strong> {comment.content}</p>
                                    </li>
                                ))}
                            </ul>

                        </div>
                    </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default DetailPost;
