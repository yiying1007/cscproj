import { usePage,Link,useForm } from "@inertiajs/react";
import { UserLayout } from "../../../../Layouts/ClientLayout";
import CreateComment from "./CreateComment";
import useInfiniteScroll from "../../Components/useInfiniteScroll";
import { useState,useEffect } from "react";
import { Modal } from "react-bootstrap";
import ReportComponent from "./Report";
import DeleteComponent from "./DeleteModal";
//import Echo from "laravel-echo";

function PostDetail({}) {
    const { auth,postDetail,comments: initialComments, hasMoreComments: initialHasMore,likeCount,isLiked} = usePage().props;

    const { post, processing } = useForm();

    const userAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${postDetail.avatar}`;
    const mediaUrls = JSON.parse(postDetail.media_url || "[]");
    
    //auto load post
    const [comments, setComments] = useState(initialComments);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [page, setPage] = useState(1);
    
    // when scroll at bottom,auto load the post
    const loadMoreComments = async () => {
        try {
            const res = await fetch(`loadMoreComments/${postDetail.id}?page=${page + 1}`,{
                headers: { "Accept": "application/json" }
            });
            const data = await res.json();
            setComments([...comments, ...data.comments]);
            setHasMore(data.hasMore);
            setPage(page + 1);
        } catch (error) {
            console.error("Failed to load more comments", error);
        }
    };
    const { ref, loading } = useInfiniteScroll({ loadMore: loadMoreComments, hasMore });
    
    //scroll to the specified comment
    useEffect(() => {
        // get current url hash
        const hash = window.location.hash;
        if (hash.startsWith("#comment-")) {
            const commentId = hash.replace("#comment-", ""); 
            setTimeout(() => {
                const commentElement = document.getElementById(`comment-${commentId}`);
                if (commentElement) {
                    commentElement.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 500);
        }
    }, [comments]);

    //reply comment
    const [selectedComment, setSelectedComment] = useState(null);

    const handleReplyClick = (comment) => {
        setSelectedComment(selectedComment === comment ? null : comment);
    };


    //modal zoom image
    const [showModal, setShowModal] = useState(false);
    const [modalImage, setModalImage] = useState("");
    const openModal = (imageUrl) => {
        setModalImage(imageUrl);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalImage("");
    };


    //like and unlike post
    const [like, setLike] = useState(isLiked || false);
    
    const handleLike = () => {
        post(route("user.likePost", postDetail.id), {
            preserveScroll:true,
            onSuccess: (res) => {
                if (res?.props?.isLiked !== undefined) {
                    setLike(res.props.isLiked);
                 }
            },
        });
    };

    //like and unlike comment
    const handleCommentLike = (id,postId) => {
        post(route("user.likeComment", {commentId: id, postId: postDetail.id}), {
            preserveScroll:true,
            onSuccess: () => {
                // update like status
                setComments((prevComments) => 
                    prevComments.map((comment) =>
                        comment.id === id 
                            ? { ...comment, isLiked: !comment.isLiked, likeCount: comment.isLiked ? comment.likeCount - 1 : comment.likeCount + 1 } 
                            : comment
                    )
                );
            },
    
        });
    };

    //realtime load comment
    /*
    useEffect(() => {
        const echo = new Echo({
            broadcaster: "pusher",
            key: import.meta.env.VITE_PUSHER_APP_KEY,
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
            forceTLS: true,
        });
    
        echo.channel("comments").listen(".comment.created", (event) => {
            setComments((prevComments) => [event.comment, ...prevComments]); 
        });
        
        return () => {
            echo.disconnect();
        };
    }, []);*/
    

    return (
        <UserLayout>
            <div className="post-detail-container">
                <div className="detail-border">
                    <div className="post-header">
                        <div className="post-header-left">
                            <img src={userAvatarUrl} className="avatarSmall"/>
                        </div>
                        <div className="post-header-center">
                        <Link 
                            className='profile-link' 
                            href={postDetail.user_id === auth.user.id ? 
                                route('user.profile') :
                                route('user.targetUserProfile',postDetail.user_id)} 
                        >
                            <p style={{fontWeight:"500"}}>{postDetail.nickname} </p>
                        </Link>
                            <p>{new Date(postDetail.created_at).toLocaleString()} {postDetail.community_name != null && <Link className='post-detail-btn' href={route('user.communityProfile',postDetail.communities_id)}><span style={{color:"black",fontWeight:"400"}}> from </span>{postDetail.community_name}</Link>}</p>{/*&nbsp;*/}
                        </div>
                        
                        <div>
                        </div>
                    </div>
                    <div className="post-body">
                        <hr className="post-line"/>
                        <h5>{postDetail.title}</h5>
                        <div className="content-text">
                        {(postDetail.content || "").split("\n").map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                        </div>
                        <div className='content-media'>
                        {mediaUrls.map((media, index) => {
                            if (media.match(/\.(jpeg|jpg|gif|png)$/)) {
                                return (
                                    <div key={index} className="image-container">
                                        <img 
                                            onClick={() => openModal(media)}
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
                        <hr />
                        <div style={{display:"flex",justifyContent:"space-around"}}>
                            <div style={{ cursor: "pointer", display: "flex", alignItems: "center" }} onClick={handleLike}>
                                {like ? (
                                    <i className="interactive-icon bx bxs-like" style={{ color: "#fa9501" }}> {likeCount}</i>
                                ) : (
                                    <i className="interactive-icon bx bxs-like"> {likeCount}</i>
                                )}
                            </div>
                            <DeleteComponent postData={postDetail} deleteUrl="user.deleteDetailPost" />
                            <ReportComponent postData={postDetail} postUrl="user.reportPost" />

                        </div>
                    </div>
                </div>
                <div className="detail-border">
                    <CreateComment postDetail={postDetail} />
                    {comments.length === 0 ?(
                        <div className="comment-border" style={{height:"450px",justifyContent:"center"}} >
                            <h5 className='info-message'>Still not comments...</h5>
                        </div>
                    ):(comments.map((comment) => {
                        const commentAvatarUrl = comment.avatar
                            ? `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${comment.avatar}`
                            : `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${comment.user.avatar}`;
                        return(
                            <div key={comment.id} id={`comment-${comment.id}`}>
                            <div className="comment-border"  style={{border:"none",position:"relative"}} >
                                <img src={commentAvatarUrl} className="avatarSmall"/>
                                <div className="post-header-center">
                                    <Link 
                                        className='profile-link' 
                                        href={comment.user_id === auth.user.id 
                                        ? route('user.profile') 
                                        :route('user.targetUserProfile',comment.user_id)} 
                                    >
                                        <p style={{fontWeight:"500"}}>
                                            {comment.nickname ? 
                                                comment.nickname 
                                                : comment.user.nickname
                                            } 
                                        </p>
                                    </Link>
                                    <p>{new Date(comment.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                            
                                <p 
                                    className="comment-text" 
                                    style={{ cursor: "pointer" }}
                                >
                                    {comment.targetUser_id != null && 
                                        <Link 
                                            style={{textDecoration:"none"}} 
                                            href={comment.targetUser_id === auth.user.id 
                                            ? route('user.profile') 
                                            : route('user.targetUserProfile',comment.targetUser_id)
                                            }
                                        >
                                            @{comment.targetUserNickname ?
                                            comment.targetUserNickname
                                            :comment.target_user?.nickname
                                            }
                                            
                                        </Link>
                                    } {comment.content}
                                    

                                </p>
                                <div className="comment-text" style={{display:"flex",alignItems:"baseline",gap:"5px"}}>
                                    <div onClick={() =>handleCommentLike(comment.id,postDetail.id)} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                                    {comment.isLiked ? (
                                            <i className="interactive-icon bx bxs-like" style={{ color: "#fa9501" }}> {comment.likeCount}</i>
                                        ) : (
                                            <i className="interactive-icon bx bxs-like"> {comment.likeCount}</i>
                                        )}
                                    </div>
                                    &nbsp;&nbsp;
                                    <i className='interactive-icon bx bxs-comment-dots' onClick={() => handleReplyClick(comment)}> Reply</i> &nbsp;
                                    <DeleteComponent postData={comment} deleteUrl="user.deleteComment" />
                                    <ReportComponent postData={comment} postUrl="user.reportComment" isDetailPage={true} />
                                </div>
                                {selectedComment === comment && (
                                    <CreateComment postDetail={postDetail} comment={comment} />
                                )}
                            <hr />
                            </div>
                    );
                    })
                    )}
                </div>
                <div ref={ref}></div>
                {loading && 
                <div style={{display:"flex",justifyContent:"center"}}>
                    <i className='interactive-icon bx bx-loader-circle' style={{alignContent:"center",fontWeight:"600"}} >&nbsp;Loading</i>
                </div>
                }
                <Modal show={showModal} onHide={closeModal}>
                    <Modal.Header closeButton></Modal.Header>
                    <Modal.Body>
                        <img src={modalImage} alt="Full View" style={{ width: "100%",height:"600px",objectFit:"cover" }} />
                    </Modal.Body>
                </Modal>

            </div>
            
        </UserLayout>
    );
}

export default PostDetail;
