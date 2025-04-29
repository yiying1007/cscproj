import { useForm,usePage,Link } from '@inertiajs/react';
import { useEffect, useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import useInfiniteScroll from "../../Components/useInfiniteScroll";
import Modal from "react-bootstrap/Modal";
import { Button,Input,TextArea,InfoMessage,Select,Option } from "../../Components/FormComponent";
import ExpandableText from '../../Components/ExpandableText';
import ReportComponent from "./Report";
import DeleteComponent from "./DeleteModal";
import CreatePost from './CreatePost';


//load more page not function
function PostByType({postsData = [], hasMoreData = false,fetchUrl,filterTypeComponent=false,filterVisibilityComponent=false}){

    const { auth,postTypes=[] } = usePage().props;
    const { post, processing } = useForm();
    //auto load post
    const [posts, setPosts] = useState(postsData);
    const [hasMore, setHasMore] = useState(hasMoreData);
    const [page, setPage] = useState(1);

    //filter post
    const [typeFilter, setTypeFilter] = useState(localStorage.getItem('typeFilter') || "all");
    
    useEffect(() => {
        localStorage.setItem('typeFilter', typeFilter);
        return () => {
            localStorage.removeItem('typeFilter');
        }
    }, [typeFilter]);


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

    
    // when scroll at bottom,auto load the post
    const loadMorePosts = async () => {
        try {
            const res = await fetch(`${fetchUrl}?page=${page + 1}&type=${typeFilter}`,{
                headers: { "Accept": "application/json" }
            });
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            const data = await res.json();
            setPosts([...posts, ...data.posts]);
            setHasMore(data.hasMore);
            setPage(page + 1);
        } catch (error) {
            console.error("Failed to load more posts", error);
        }
    };
    const { ref, loading } = useInfiniteScroll({ loadMore: loadMorePosts, hasMore });
    
    // filter by type 
    const filteredPosts = posts.filter((post) => {
        const matchesType = typeFilter === "all" || post.post_type === typeFilter;

        return matchesType;
        
    });


    const changeVisibility = (id) => {
        post(route("user.changeVisibility", { postId: id }),{
            onSuccess: () =>{
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            },
        });
     };


    //like and unlike post
    const handleLike = (id) => {
        post(route("user.likePost", id), {
            preserveScroll:true,
            onSuccess: () => {
                // update like status
                setPosts((prevPosts) => 
                    prevPosts.map((post) =>
                        post.id === id 
                            ? { ...post, isLiked: !post.isLiked, likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1 } 
                            : post
                    )
                );
            },
    
        });
    };

    
    return(
        <>
        <div className='index-post-list'>
            <div className='index-center'>
                <div className='index-post-navigation'>
                    <a onClick={() => setTypeFilter("all")} className={typeFilter === "all" ? "active" : ""}>Latest</a>
                    {postTypes.length === 0 ? (
                        <a></a>
                    ) : (
                        postTypes.map((type) => {
                            return (
                                <a key={type.id} onClick={() => setTypeFilter(`${type.type_name}`)} className={typeFilter === `${type.type_name}` ? "active" : ""}>
                                    {type.type_name}
                                </a>
                            );
                        })
                    )}  
                </div>
                <CreatePost />
            {filteredPosts.length === 0 ? (
                <h5 className='info-message'>No Posts</h5>
                
            ) : (
                filteredPosts.map((post) => {
                const userAvatarUrl = post.avatar
                    ? `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${post.avatar}`
                    : `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${auth.user.avatar}`;
                
                const mediaUrls = JSON.parse(post.media_url || "[]");
                return (
                    <div className="post-border" key={post.id}>
                        
                        <div className="post-header">
                            <div className="post-header-left">
                                <img src={userAvatarUrl} className="avatarSmall"/>
                            </div>
                            <div className="post-header-center">
                                <Link 
                                    className='profile-link' 
                                    href={post.user_id === auth.user.id ? 
                                        route('user.profile') :
                                        route('user.targetUserProfile',post.user_id)} 
                                >
                                    <p style={{fontWeight:"500"}}>
                                        {post.nickname} &nbsp; 
                                        {post.member_position && (post.member_position === "Leader" || post.member_position === "Admin") && (
                                            <span className='position-tag'>{post.member_position}</span>
                                        )}
                                    </p>
                                </Link>
                                <p style={{fontSize:"15px"}}><span>{post.is_private==="Public" ? (<i className='fa fa-globe'>&nbsp;</i>) :(<i className='bx bxs-lock-alt'>&nbsp;</i>)}</span>{new Date(post.created_at).toLocaleString()}</p>
                                <p style={{fontSize:"15px"}}>
                                    {post.community_name != null && 
                                    <Link className='post-detail-btn' href={route('user.communityProfile',post.communities_id)}>
                                        <span style={{color:"black",fontWeight:"400"}}> from </span>
                                        {post.community_name.length > 15 
                                        ? post.community_name.slice(0, 10) + "..." 
                                        : post.community_name}
                                    </Link>}
                                </p>
                                
                            </div>
                            <div className="post-header-right">
                            {auth.user.id === post.user_id &&
                            <Dropdown>
                                <Dropdown.Toggle id="dropdown-basic"></Dropdown.Toggle>                       
                                <Dropdown.Menu>
                                    {post.is_private === "Public" && 
                                    <Dropdown.Item 
                                        onClick={() =>
                                            changeVisibility(post.id)
                                        }
                                          disabled={processing}
                                    ><i className='bx bxs-lock-alt' style={{color:"#543A14"}}> Private</i>
                                    </Dropdown.Item>}
                                    {post.is_private === "Private" && 
                                    <Dropdown.Item 
                                        onClick={() =>
                                            changeVisibility(post.id)
                                        }
                                          disabled={processing}
                                    ><i className='bx bxs-lock-open-alt' style={{color:"#543A14"}}> Public</i>
                                    </Dropdown.Item>}
                                </Dropdown.Menu>
                            </Dropdown>}
                            
                            </div>
                        </div>
                        
                        <div className="post-body">
                            <hr className="post-line" />
                            <div className="post-title">
                            <Link className='post-detail-btn' href={route('user.postDetail',post)}>
                                <h5>
                                    {(post.event_start_time || post.event_end_time) && (
                                        <span className="position-tag">
                                            <i className="bi bi-fire"></i>
                                        &nbsp;
                                        {post.event_start_time ? new Date(post.event_start_time).toLocaleDateString() : ''} 
                                        {post.event_end_time && ' Until '}
                                        {post.event_end_time ? new Date(post.event_end_time).toLocaleDateString() : ''}
                                    </span>)}&nbsp;
                                    {post.title}
                                </h5>
                            </Link>
                            </div>
                            <hr className="post-line"/>
                            <div className="post-content">
                                <div className="content-text">
                                    <ExpandableText text={post.content} />
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
                                
                            </div>
                            <hr />
                            <div style={{display:"flex",justifyContent:"space-around",alignItems:"center"}}>
                                <div style={{ cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() =>handleLike(post.id)}>
                                    {post.isLiked ? (
                                        <i className="interactive-icon bx bxs-like" style={{ color: "#fa9501" }}> {post.likeCount}</i>
                                    ) : (
                                        <i className="interactive-icon bx bxs-like"> {post.likeCount}</i>
                                    )}
                                </div>
                                <div>
                                    <Link className='post-detail-btn' href={route('user.postDetail',post)}><i className='bx bxs-comment-detail'> Comment</i></Link>
                                    
                                </div>
                                <DeleteComponent postData={post} deleteUrl="user.deletePost" />
                                <ReportComponent postData={post} postUrl="user.reportPost" />
                            </div>
                        </div>
                    </div>
                );
            })
            )}
            <div ref={ref}></div>
            {loading && 
            <div style={{display:"flex",justifyContent:"center"}}>
                <i className='interactive-icon bx bx-loader-circle' style={{alignContent:"center",fontWeight:"600"}} >&nbsp;Loading</i>
            </div>
            }
            </div>
            

            
            <Modal show={showModal} onHide={closeModal} >
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <img src={modalImage} alt="Full View" style={{ width: "100%",objectFit:"cover" }} />
                </Modal.Body>
            </Modal>

           
        </div>
        </>
    );
}

export default PostByType; 


