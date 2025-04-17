import { usePage } from "@inertiajs/react";
import Dropdown from 'react-bootstrap/Dropdown';
import { useState } from "react";
import Modal from 'react-bootstrap/Modal';

function PostModal({post}) {
    console.log(post.title);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    
    const userAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${post.avatar}`;
    const mediaUrls = JSON.parse(post.media_url || "[]");
    return (
        <div>
            <button className="btn btn-success btn-sm" onClick={handleShow}>
                View
            </button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="detailGrid">
                        <span className="detailLabel">User Nickname</span> 
                        <span className="detailContent">{post.nickname || "-"}</span>

                        <span className="detailLabel">User Role</span> 
                        <span className="detailContent">{post.position || "-"}</span>

                        <span className="detailLabel">Post Title</span> 
                        <span className="detailContent">{post.title || "-"}</span>

                        <span className="detailLabel">Post Content</span> 
                        <span className="detailContent">{post.content || "-"}</span>

                        <span className="detailLabel">Post Media</span> 
                        <span className="detailContent">
                            <div className='content-media'>
                            {mediaUrls.map((media, index) => {
                                if (media.match(/\.(jpeg|jpg|gif|png)$/)) {
                                    return (
                                        <div key={index} className="image-container">
                                            <img 
                                                src={media} 
                                                alt="post image" 
                                                width="200" 
                                                onClick={() => openModal(media)} 
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
                                    }else if (media.match(/\.(mpeg|mp3|wav)$/)) {
                                        return (
                                            <div key={index} className="audio-container">
                                                <audio src={media} controls></audio>
                                            </div>
                                        );
                                    }else if (media.includes("youtube.com") || media.includes("youtu.be")) {
                                        const videoId = media.split("v=")[1]?.split("&")[0] || media.split("/").pop();
                                        return (
                                            <iframe
                                                key={index}
                                                src={`https://www.youtube.com/embed/${videoId}`}
                                                title="YouTube video"
                                                height="315"
                                                allowFullScreen
                                            ></iframe>
                                        );
                                    }
                                    return null;
                                })}
                                </div>
                        </span>

                        
                    </div>

                </Modal.Body>
                
            </Modal>

        </div>
    );
}

export default PostModal;
