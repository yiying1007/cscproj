import { UserLayout } from '../../../Layouts/ClientLayout';
import { usePage,Link } from '@inertiajs/react';
import { useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import ExpandableText from '../Components/ExpandableText';


function SearchResult(){

    const { users, searchQuery,communities,posts } = usePage().props;
    const [query, setQuery] = useState(searchQuery || "");
    const [searchTab, setSearchTab] = useState('all');
    const handleSearch = (e) => {
        e.preventDefault();
        window.location.href = route("user.search", { search: query });
      };

    return(
        <UserLayout>
            <div>
                <form onSubmit={handleSearch}>          
                    <div className='searchbar'>
                        <input
                            className='inputSearch'
                            type="text"
                            placeholder="Searching..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button className='actionbtn' type="submit">Search</button>
                    </div>
                </form>
                <hr />
                <div className='index-post-navigation'>
                    <a 
                        onClick={() => setSearchTab('all')}
                        className={searchTab === 'all' ? 'active' : ''}
                    >
                        ALL
                    </a>
                    <a
                        onClick={() => setSearchTab('users')}
                        className={searchTab === 'users' ? 'active' : ''}
                    >
                        Users
                    </a>
                    <a
                        onClick={() => setSearchTab('communities')}
                        className={searchTab === 'communities' ? 'active' : ''}
                    >
                        Communities
                    </a>
                    <a
                        onClick={() => setSearchTab('posts')}
                        className={searchTab === 'posts' ? 'active' : ''}
                    >
                        Posts
                    </a>
                </div>
                <div className='list-container'>
                  {(searchTab === "all" || searchTab === "posts") && (
                  <div>
                    {posts.length > 0 && (
                      posts.map((post) => {
                        const userAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${post.avatar}`;
                        const mediaUrls = JSON.parse(post.media_url || "[]");
                      return(
                        <div key={post.id}>
                          <div className="box-style" style={{display:"grid"}}>
                            
                            <div className='post-body'>
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
                                          </span>
                                      )}&nbsp;
                                      {post.title.length > 100 ? post.title.substring(0, 100) + "..." : post.title}
                                    </h5>
                                </Link>
                              </div>
                              {(post.content !=null || mediaUrls) &&
                              <div className="">
                                {post.content}
                                <div style={{display:"flex",gap:"10px"}}>
                                {mediaUrls.map((media, index) => {
                                  if (media.match(/\.(jpeg|jpg|gif|png)$/)) {
                                    return (
                                      <div key={index} className="image-container">
                                        <img 
                                          src={media} 
                                          alt="post image" 
                                          style={{ cursor: "pointer",width:"100px",height:"100px",objectFit:"cover" }} 
                                        />
                                      </div>
                                    );
                                  }else if (media.match(/\.(mp4|webm|mov|avi)$/)) {
                                    return (
                                      <div key={index} className="video-container">
                                        <video 
                                          src={media} 
                                          controls 
                                          style={{ width:"100px",height:"100px" }} 
                                        />
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
                                        allowFullScreen
                                        style={{ width:"100px",height:"100px" }} 
                                      ></iframe>
                                    );
                                  }
                                  return null;
                                })}
                                </div>
                                </div>
                              }
                            </div>
                            <hr className='post-line' />
                            <div className="post-header" style={{alignItems:"center",marginTop:"0px",marginBottom:"0px",gap:"10px"}}>
                                <img src={userAvatarUrl} className="avatarHeader" style={{border:"0.5px solid  #543A14"}}/>                           
                                <small style={{fontWeight:"500",fontSize:"15px"}}>
                                  {post.nickname} &nbsp;
                                  {new Date(post.created_at).toLocaleString()} &nbsp;
                                  {post.community_name && <span>from {post.community_name}</span>} 
                                </small>
                                <div className='post-header-right'>
                                <i className="bx bxs-like" > {post.like_count}</i>
                                </div>
                            </div>
                          </div>
                          </div>
                            );
                      })
                    )}
                    </div>
                  )}
                  {(searchTab === "all" || searchTab === "users") && 
                  <div>
                    {users.length > 0 && (
                      users.map((user) => (
                      <div key={user.id}>
                        <Link
                          className="box-style"
                          href={route("user.targetUserProfile", user)}
                        >
                        <div className="box-info-left">
                          <img src={`https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${user.avatar}`} className="avatarMedium" />
                        </div>
                        <div className="box-info-center">
                          <h5>{user.nickname} <span className='position-tag'>{user.position}</span></h5>
                        </div>
                        <div className="box-info-right"></div>
                        </Link>
                      </div>
                      ))
                    )}
                  </div>
                  }
                  {(searchTab === "all" || searchTab === "communities") && 
                  <div>
                    {communities.length > 0 && (
                      communities.map((community) => (
                      <div key={community.id}>
                        <Link
                          className="box-style"
                          href={route("user.communityProfile", community)}
                        >
                        <div className="box-info-left">
                          <img src={`https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${community.avatar}`} className="avatarMedium" />
                        </div>
                        <div className="box-info-center">
                        <h5><span>{community.is_private==="Public" ? (<i className='fa fa-globe'>&nbsp;</i>) :(<i className='bx bxs-lock-alt'></i>)} </span>{community.name}&nbsp;<span className="position-tag">{community.type}</span></h5>
                        <span>
                            {(community.description || "").length > 150 
                            ? (community.description || "").substring(0, 150) + "..." 
                            : community.description || ""}
                        </span>
                        </div>
                        <div className="box-info-right"></div>
                        </Link>
                      </div>
                      ))
                    )}
                  </div>
                  }
                  {searchTab === "all" && 
                    <div>
                      {(communities.length === 0 && users.length === 0 && posts.length === 0) && (
                        <div>
                          <h5 className='info-message'>Nothing Results...</h5>
                      </div>
                      )}
                    </div>
                    }
                
                </div>
            </div>
        </UserLayout>

    );
}

export default SearchResult; 


