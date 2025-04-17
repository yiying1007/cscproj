import {useState,useEffect,useRef} from 'react';
import { UserLayout } from '../../../Layouts/ClientLayout';
import { usePage,Link } from '@inertiajs/react';
import { Dropdown } from 'react-bootstrap';
import {Button} from 'react-bootstrap';
import AnnouncementDetail from './AnnouncementDetail';
import useInfiniteScroll from '../Components/useInfiniteScroll';

function HomeIndex(){

    const { auth,communityRecommends,friendRecommends,publicPosts: initialPosts, hasMorePublicPosts: initialHasMore,announcements = [] } = usePage().props;
    
    //auto load post
    const [posts, setPosts] = useState(initialPosts);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [page, setPage] = useState(1);

    const loadMorePosts = async () => {
        try {
            const res = await fetch(`loadHomePosts?page=${page + 1}`,{
                headers: { "Accept": "application/json" }
            });
            const data = await res.json();
            setPosts([...posts, ...data.publicPosts]);
            setHasMore(data.hasMore);
            setPage(page + 1);
        } catch (error) {
            console.error("Failed to load more posts", error);
        }
    };
    const { ref, loading } = useInfiniteScroll({ loadMore: loadMorePosts, hasMore });
    
    //next button 
    const ongoingEventListRef = useRef(null);
    const upcomingEventListRef = useRef(null);
    const friendEventListRef = useRef(null);
    const communityEventListRef = useRef(null);

    const scrollEventList = (ref, scrollOffset) => {
        if (ref.current) {
            ref.current.scrollBy({
                left: scrollOffset,
                behavior: "smooth"
            });
        }
    };
    const [showAnnoucementAll, setAnnoucementShowAll] = useState(false);
    const [showOngoingAll, setOngoingShowAll] = useState(false);
    const [showUpComingAll, setUpcommingShowAll] = useState(false);
    const [showCommunitiesAll, setCommunitiesShowAll] = useState(false);
    const [showFriendRecommendAll, setFriendRecommendShowAll] = useState(false);
    const maxVisible = 3;
    return(
        <>
        <div className='index-label-container'>
        <h5 className='index-title'>SEGi Announcements</h5>
        {announcements.length > maxVisible && (
            <a className='index-showbtn' onClick={() => setAnnoucementShowAll(!showAnnoucementAll)}>
                {showAnnoucementAll ? "Show Less" : "Show More"}
            </a>
        )}
        </div>
        <div className='index-announcement-container'>
        
            {announcements.length === 0 ? (
            <>
                <div className='index-announcement-border'>
                        <a>No announcements</a>
                    </div>
            </>
            ) : (
                announcements
                .slice(0, showAnnoucementAll ? announcements.length : maxVisible)
                .map((a) =>{
                    return(
                    <div className='index-announcement-border' key={a.id}>
                        <i className="bi bi-megaphone-fill"></i>       
                        <a href={route('user.announcementDetail',a)}>
                            {a.title.length > 40 ? a.title.substring(0, 40) + "..." : a.title}
                        </a>
                        <span>{new Date(a.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    );
                })
            )}
        </div>
        <div className='index-big-device'>
        <h5 className='index-title'>Recent Events</h5>
        <div className='index-event-container'>
            <h6><i className='bx bx-calendar-event'></i> Ongoing Events</h6>

            <div className='index-scroll-control'>
                {/* left button */}
                <i className="bi bi-caret-left-fill" onClick={() => scrollEventList(ongoingEventListRef,-200)}></i>

                <div className="index-event-list" ref={ongoingEventListRef}>
                    {posts.some(post => post.post_type === "Event" &&
                        new Date(post.event_start_time) <= new Date() &&
                        new Date(post.event_end_time) > new Date()) ? (
                            
                        posts.map((post) => {
                            const mediaUrls = JSON.parse(post.media_url || "[]");
                            if (new Date(post.event_start_time) <= new Date() && new Date(post.event_end_time) > new Date()) {
                                return (
                                    <Link href={route('user.postDetail', post)} className="index-event-border" key={post.id}>
                                        {mediaUrls.length > 0 ? (
                                            (() => {
                                                const media = mediaUrls[0]; 
                                                if (media.match(/\.(jpeg|jpg|gif|png)$/)) {
                                                    return <img src={media} alt="post image" />;
                                                } else if (media.match(/\.(mp4|webm|mov|avi)$/)) {
                                                    return <video src={media} controls width="100%" />;
                                                } else if (media.match(/\.(mpeg|mp3|wav)$/)) {
                                                    return <audio src={media} controls></audio>;
                                                } else if (media.includes("youtube.com") || media.includes("youtu.be")) {
                                                    const videoId = media.split("v=")[1]?.split("&")[0] || media.split("/").pop();
                                                    return (
                                                        <iframe
                                                            src={`https://www.youtube.com/embed/${videoId}`}
                                                            title="YouTube video"
                                                            height="120"
                                                            allowFullScreen
                                                        ></iframe>
                                                    );
                                                }
                                                return null;
                                            })()
                                        ) : (
                                            <img src="https://fypcscproject.s3.ap-southeast-1.amazonaws.com/otherImage/ongoing.png" alt="default" />
                                        )}
                                        <small className='event-date-tag'>until {new Date(post.event_end_time).toLocaleDateString()}</small>
                                        <span>{post.title.length > 30 ? post.title.substring(0, 30) + "..." : post.title}</span>
                                    </Link>
                                );
                            }
                            return null;
                        })
                    ) : (
                        <h6 className='info-message'>No Events</h6>
                    )}
                </div>

                {/* right btn */}
                <i className="bi bi-caret-right-fill" onClick={() => scrollEventList(ongoingEventListRef,200)}></i>
            </div>

            <div ref={ref}></div>
            {loading && (
                <div style={{display:"flex",justifyContent:"center"}}>
                    <i className='interactive-icon bx bx-loader-circle' style={{alignContent:"center",fontWeight:"600"}} >&nbsp;Loading</i>
                </div>
            )}


            {/*upcoming event */}
            <h6><i className='bx bx-calendar-event'></i> Upcoming Events</h6>

            <div className='index-scroll-control'>
                {/* left button */}
                <i className="bi bi-caret-left-fill" onClick={() => scrollEventList(upcomingEventListRef,-200)}></i>

                <div className="index-event-list" ref={upcomingEventListRef}>
                    {posts.some(post => post.post_type === "Event" &&
                        new Date(post.event_start_time) > new Date()) ? (
                        posts.map((post) => {
                            const mediaUrls = JSON.parse(post.media_url || "[]");
                            if (new Date(post.event_start_time) > new Date()) {
                                return (
                                    <Link href={route('user.postDetail', post)} className="index-event-border" key={post.id}>
                                        {mediaUrls.length > 0 ? (
                                            (() => {
                                                const media = mediaUrls[0]; 
                                                if (media.match(/\.(jpeg|jpg|gif|png)$/)) {
                                                    return <img src={media} alt="post image" />;
                                                } else if (media.match(/\.(mp4|webm|mov|avi)$/)) {
                                                    return <video src={media} controls width="100%" />;
                                                } else if (media.match(/\.(mpeg|mp3|wav)$/)) {
                                                    return <audio src={media} controls></audio>;
                                                } else if (media.includes("youtube.com") || media.includes("youtu.be")) {
                                                    const videoId = media.split("v=")[1]?.split("&")[0] || media.split("/").pop();
                                                    return (
                                                        <iframe
                                                            src={`https://www.youtube.com/embed/${videoId}`}
                                                            title="YouTube video"
                                                            height="120"
                                                            allowFullScreen
                                                        ></iframe>
                                                    );
                                                }
                                                return null;
                                            })()
                                        ) : (
                                            <img src="https://fypcscproject.s3.ap-southeast-1.amazonaws.com/otherImage/upcoming.png" alt="default" />
                                        )}
                                        <small className='event-date-tag'>start {new Date(post.event_start_time).toLocaleDateString()}</small>
                                        <span>{post.title.length > 30 ? post.title.substring(0, 30) + "..." : post.title}</span>
                                    </Link>
                                );
                            }
                            return null;
                        })
                    ) : (
                        <h6 className='info-message'>No Events</h6>
                    )}
                </div>

                {/* right btn */}
                <i className="bi bi-caret-right-fill" onClick={() => scrollEventList(upcomingEventListRef,200)}></i>
            </div>

            <div ref={ref}></div>
            {loading && (
                <div style={{display:"flex",justifyContent:"center"}}>
                    <i className='interactive-icon bx bx-loader-circle' style={{alignContent:"center",fontWeight:"600"}} >&nbsp;Loading</i>
                </div>
            )}
        </div>
        {/*Community */}
        <h5 className='index-title'>Community Top 10</h5>
        <div className='index-event-container'>
            <h6><i className='bx bxs-crown'></i> The Hottest Community</h6>

            <div className='index-scroll-control'>
                {/* left button */}
                <i className="bi bi-caret-left-fill" onClick={() => scrollEventList(communityEventListRef,-200)}></i>

                <div className="index-event-list" ref={communityEventListRef}>
                {communityRecommends && communityRecommends.length > 0 ? (
                    communityRecommends.map((community) => {
                        const communityUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${community.avatar}`;
                        return (
                            <Link href={route("user.communityProfile", community)} className="index-event-border" key={community.id}>
                                <img src={communityUrl} />
                                <span>{community.name.length > 30 ? community.name.substring(0, 30) + "..." : community.name}</span>
                                &nbsp;<small className='event-date-tag'>{community.type}</small>
                            </Link>
                        );
                    })
                ) : (
                    <h6 className='info-message'>No community recommendations available</h6>
                )}

                </div>

                {/* right btn */}
                <i className="bi bi-caret-right-fill" onClick={() => scrollEventList(communityEventListRef,200)}></i>
            </div>

        </div>
        {/*friend */}
        <h5 className='index-title'>Friend Recommend</h5>
        <div className='index-event-container'>
            <h6><i className="bi bi-people-fill"></i> People you may know</h6>

            <div className='index-scroll-control'>
                {/* left button */}
                <i className="bi bi-caret-left-fill" onClick={() => scrollEventList(friendEventListRef,-200)}></i>

                <div className="index-event-list" ref={friendEventListRef}>
                {friendRecommends && friendRecommends.length > 0 ? (
                    friendRecommends.map((user) => {
                        const avatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${user.avatar}`;
                        return (
                            <Link href={route("user.targetUserProfile", user)} className="index-event-border" key={user.id}>
                                <img src={avatarUrl} />
                                <span>{user.nickname.length > 30 ? user.nickname.substring(0, 30) + "..." : user.nickname}
                                </span><br />
                                {user.course ? (
                                    <small>[{user.course && user.course.length > 30 ? user.course.substring(0, 30) + "..." : user.course}]</small>
                                ):(
                                    <></>
                                )
                                }
                            </Link>
                        );
                    })
                ) : (
                    <h6 className='info-message'>No friend recommendations available</h6>
                    
                )}

                </div>

                {/* right btn */}
                <i className="bi bi-caret-right-fill" onClick={() => scrollEventList(friendEventListRef,200)}></i>
            </div>
        </div>
        </div>
        {/*mobile */}
        <div className='index-mobile'>
            <div className='index-label-container'>
                <h5 className='index-title'>Recent Events</h5>
            </div>
            <div className='index-announcement-container'>
                <h6><i className='bx bx-calendar-event'></i> Ongoing Events</h6>
                {posts.some(post => post.post_type === "Event" &&
                        new Date(post.event_start_time) <= new Date() &&
                        new Date(post.event_end_time) > new Date()) ? (
                            
                        posts.map((post) => {
                            if (new Date(post.event_start_time) <= new Date() && new Date(post.event_end_time) > new Date()) {
                                return (
                                    <div className='index-announcement-border' key={post.id}>
                                        <small className='event-date-tag'>until {new Date(post.event_end_time).toLocaleDateString()}</small>
                                        <a href={route('user.postDetail',post)}>
                                            {post.title.length > 40 ? post.title.substring(0, 40) + "..." : post.title}
                                        </a>
                                    </div>
                                );
                            }
                            return null;
                        })
                    ) : (
                        <h6 className='info-message'>No Events</h6>
                )}
            </div>
            <div className='index-announcement-container'>
                <h6><i className='bx bx-calendar-event'></i> Upcoming Events</h6>
                {posts.some(post => post.post_type === "Event" &&
                    new Date(post.event_start_time) > new Date())  ? (
                            
                    posts.map((post) => {
                        if (new Date(post.event_start_time) <= new Date() && new Date(post.event_end_time) > new Date()) {
                            return (
                                <div className='index-announcement-border' key={post.id}>
                                    <small className='event-date-tag'>until {new Date(post.event_end_time).toLocaleDateString()}</small>
                                    <a href={route('user.postDetail',post)}>
                                        {post.title.length > 40 ? post.title.substring(0, 40) + "..." : post.title}
                                    </a>
                                </div>
                            );
                        }
                        return null;
                    })
                    ) : (
                        <h6 className='info-message'>No Events</h6>
                )}
            </div>
            <div className='index-label-container'>
                <h5 className='index-title'>Community Top 10</h5>
            </div>
            <div className='index-announcement-container'>
                <h6><i className='bi bi-caret-left-fill'></i> The Hottest Community</h6>
                {communityRecommends && communityRecommends.length > 0 ? (
                    communityRecommends.map((community) => {
                        const communityUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${community.avatar}`;
                        return (
                            <div className='index-announcement-border' style={{gap:"10px"}} key={community.id}>
                                <div>
                                    <img className='avatarSmall' src={communityUrl} />
                                </div>
                                <div>
                                    <a href={route('user.communityProfile',community)}>
                                        {community.name.length > 30 ? community.name.substring(0, 30) + "..." : community.name}
                                    </a><br />
                                    <small>[{community.type}]</small>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <h6 className='info-message'>No community recommendations available</h6>
                )}
            </div>
            <div className='index-label-container'>
                <h5 className='index-title'>Friend Recommend</h5>
            </div>
            <div className='index-announcement-container'>
                <h6><i className='bi bi-people-fill'></i> People you may know</h6>
                {friendRecommends && friendRecommends.length > 0 ? (
                    friendRecommends.map((user) => {
                        const avatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${user.avatar}`;
                        return (
                            <div className='index-announcement-border' style={{gap:"10px"}} key={user.id}>
                                <div>
                                    <img className='avatarSmall' src={avatarUrl} />
                                
                                </div>
                                <div>
                                    <a href={route('user.targetUserProfile',user)}>
                                        {user.nickname.length > 30 ? user.nickname.substring(0, 30) + "..." : user.nickname}
                                    </a><br />
                                    {user.course ? (
                                        <small>[{user.course && user.course.length > 30 ? user.course.substring(0, 30) + "..." : user.course}]</small>
                                    ):(
                                        <></>
                                    )}
                                </div>
                                </div>
                        );
                    })
                ) : (
                    <h6 className='info-message'>No friend recommendations available</h6>
                )}
            </div>
        </div>
        </>
    );
}

export default HomeIndex; 


