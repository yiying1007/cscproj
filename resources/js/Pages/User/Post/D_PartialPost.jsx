import { useForm,usePage,Link } from '@inertiajs/react';
import { useEffect, useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import useInfiniteScroll from "../../Components/useInfiniteScroll";
import Modal from "react-bootstrap/Modal";
import { Button,Input,TextArea,InfoMessage,Select,Option } from "../../Components/FormComponent";
import ExpandableText from '../../Components/ExpandableText';

//load more page not function
function PartialPost(){

    const { partialPost: initialPosts, hasMorePosts: initialHasMore,auth,postTypes=[] } = usePage().props;
    //const { delete: deletePost, post, processing } = useForm();
    const { delete: deletePost,data, setData, post,clearErrors, processing, errors, reset } = useForm({
        reason: "",
        details: "",
        review_notes: "",
        acc_block_until: "",
    });
    //auto load post
    const [posts, setPosts] = useState(initialPosts);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [page, setPage] = useState(1);
    //filter post
    const [typeFilter, setTypeFilter] = useState("all");
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

    //modal delete
    const [show, setShow] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const handleClose = () => {
        setShow(false);
        setSelectedPost(null);
    };
    const handleShow = (post) => {
        setShow(true);
        setSelectedPost(post);
    };

    
    // when scroll at bottom,auto load the post
    const loadMorePosts = async () => {
        try {
            const res = await fetch(`loadPartialPosts?page=${page + 1}`,{
                headers: { "Accept": "application/json" }
            });
            const data = await res.json();
            setPosts([...posts, ...data.partialPost]);
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

    const deletePosts = () => {
        if (selectedPost) {
            deletePost(route("user.deletePost", { postId: selectedPost.id }), {
                onSuccess: () => handleClose(),
            });
        }
     };

    const changeVisibility = (id) => {
        post(route("user.changeVisibility", { postId: id }));
     };


    //modal report
    const [reportShow, setReportShow] = useState(false);
    
    const handleReportClose = () => {
        setReportShow(false);
        setSelectedPost(null);
        reset();
        clearErrors();
    };
    const handleReportShow = (post) => {
        setReportShow(true);
        setSelectedPost(post);
    };

    //report post
    function reportSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        if(selectedPost){
            post(route('user.reportPost',selectedPost.id), {
                onSuccess: () => {
                    handleReportClose(); // close modal
                },
            });
        }
        
    }



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
            {/*filter post component*/}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",marginBottom:"10px" }}>
                <h3 className="titleName">Posts</h3>
                <div className="filter-container">
                    <Dropdown>
                        <Dropdown.Toggle variant="dark">Filter Type</Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setTypeFilter("all")} className={typeFilter === "all" ? "active" : ""}>All</Dropdown.Item>
                            {postTypes.length === 0 ? (
                                <Dropdown.Item></Dropdown.Item>
                            ) :(
                                postTypes.map((type) =>{
                                    return(
                                        <Dropdown.Item key={type.id} onClick={() => setTypeFilter(`${type.type_name}`)} className={typeFilter === `${type.type_name}` ? "active" : ""}>{type.type_name}</Dropdown.Item>
                                    );
                                })
                            )}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>

            <div className='post-container'>
            {filteredPosts.length === 0 ? (
            <div className="box-style">
                <p>No Posts</p>
            </div>
            ) : (
                filteredPosts.map((post) => {
                const userAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${post.avatar}`;
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
                                    <p style={{fontWeight:"500"}}>{post.nickname} </p>
                                </Link>
                                <small>{new Date(post.created_at).toLocaleString()} {post.community_name != null && <Link className='post-detail-btn' href={route('user.communityProfile',post.communities_id)}><span style={{color:"black",fontWeight:"400"}}> from </span>{post.community_name}</Link>}</small>
                                
                            </div>
                            <div className="post-header-right">
                            {auth.user.id === post.user_id ? (
                            <Dropdown>
                                <Dropdown.Toggle id="dropdown-basic"></Dropdown.Toggle>                       
                                <Dropdown.Menu>
                                    {post.is_private === "Public" && <Dropdown.Item 
                                        onClick={() =>
                                            changeVisibility(post.id)
                                        }
                                          disabled={processing}
                                    >Set to private</Dropdown.Item>}
                                    {post.is_private === "Private" && <Dropdown.Item 
                                        onClick={() =>
                                            changeVisibility(post.id)
                                        }
                                          disabled={processing}
                                    >Set to Public</Dropdown.Item>}
                                    <Dropdown.Item 
                                        onClick={() => handleShow(post)}>delete</Dropdown.Item>
                                    
                                </Dropdown.Menu>
                            </Dropdown>
                            ):(
                            <Dropdown>
                                <Dropdown.Toggle id="dropdown-basic"></Dropdown.Toggle>                       
                                <Dropdown.Menu>
                                    <Dropdown.Item
                                        onClick={() => handleReportShow(post)}
                                    >Report</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            )}
                            </div>
                        </div>
                        
                        <div className="post-body">
                            <hr className="post-line" />
                            <div className="post-title">
                            <Link className='post-detail-btn' href={route('user.postDetail',post)}><h5>{post.title}</h5></Link>
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
                            <div style={{display:"flex",justifyContent:"space-around"}}>
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
                                
                            </div>
                        </div>
                    </div>
                );
            })
            )}
            </div>
            <div ref={ref}></div>
            {loading && <p>Loading...</p>}
            <Modal show={showModal} onHide={closeModal}>
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <img src={modalImage} alt="Full View" style={{ width: "100%",height:"600px",objectFit:"cover" }} />
                </Modal.Body>
            </Modal>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form >
                        <h5>Are you sure to delete this post?</h5>
                        <hr />
                        <Button name="Delete" onClick={deletePosts} disabled={processing} />
                                
                    </form>

                </Modal.Body>
                
            </Modal>

            <Modal show={reportShow} onHide={handleReportClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Report Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={reportSubmit}>
                     
                    <Select
                        label="Reason"
                        name="reason"
                        id="reason"
                        value={data.reason} /*store data */
                        onChange={(e) => setData('reason', e.target.value)}
                    >
                        <Option label="Select Reason" value="" disabled />
                        <Option label="Inappropriate Content" value="Inappropriate Content" />
                        <Option label="Spam or Scam" value="Spam or Scam" />
                        <Option label="Harassment or Bullying" value="Harassment or Bullying" />
                        <Option label="Intellectual Property Violation" value="Intellectual Property Violation" />
                        <Option label="False Information" value="False Information" />
                        <Option label="Impersonation" value="Impersonation" />
                        <Option label="Disrupting Campus Harmony" value="Disrupting Campus Harmony" />
                        <Option label="Violation of community guidelines" value="Violation of community guidelines" />
                    </Select>
                    {errors.reason && <InfoMessage className="errorMessage" message={errors.reason}/>}
                    <TextArea
                        label="Detail"
                        type="text"
                        name="details"
                        id="details"
                        value={data.details}/*store data */
                        onChange={(e) => setData('details', e.target.value)}
                    />
                    {errors.details && <InfoMessage className="errorMessage" message={errors.details}/>}
                    
                    {auth.user.position==="Admin" && <Input
                        label="Review Note"
                        type="text"
                        name="review_notes"
                        id="review_notes"
                        value={data.review_notes}/*store data */
                        onChange={(e) => setData('review_notes', e.target.value)}
                    />}
                    {errors.review_notes && <InfoMessage className="errorMessage" message={errors.review_notes}/>}

                    {auth.user.position==="Admin" && <Input
                        label="Block Account"
                        type="datetime-local"
                        name="acc_block_until"
                        id="acc_block_until"
                        value={data.acc_block_until}/*store data */
                        onChange={(e) => setData('acc_block_until', e.target.value)}
                    />}
                    {errors.acc_block_until && <InfoMessage className="errorMessage" message={errors.acc_block_until}/>}
                    <hr />
                    <Button name="Report"  disabled={processing} />
                                
                    </form>

                </Modal.Body>
                
            </Modal>
        </>
    );
}

export default PartialPost; 


