import { useState } from "react";
import { usePage, Link } from "@inertiajs/react";
import Dropdown from 'react-bootstrap/Dropdown';
import useInfiniteScroll from "../../Components/useInfiniteScroll";

function CampusCommunities() {
    const { communities: initialCommunities, hasMoreCommunities: initialHasMore } = usePage().props;
    const [communities, setCommunities] = useState(initialCommunities);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [page, setPage] = useState(1);

    const [typeFilter, setTypeFilter] = useState("all");
    const [privacyFilter, setPrivacyFilter] = useState("all");
    
    // when scroll at bottom,auto load the community
    const loadMoreCommunities = async () => {
        try {
            const res = await fetch(`loadCommunities?page=${page + 1}`,{
                headers: { "Accept": "application/json" }
            });
            const data = await res.json();
            setCommunities([...communities, ...data.communities]);
            setHasMore(data.hasMore);
            setPage(page + 1);
        } catch (error) {
            console.error("Failed to load more communities", error);
        }
    };
    const { ref, loading } = useInfiniteScroll({ loadMore: loadMoreCommunities, hasMore });
    
    // filter community
    const filteredCommunities = communities.filter((community) => {
        const matchesPrivacy = privacyFilter === "all" || community.is_private === privacyFilter;
        const matchesType = typeFilter === "all" || community.type === typeFilter;
        return matchesPrivacy && matchesType;
    });

    return (
        <div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h3 className="titleName"></h3>
                <div className="filter-container">
                    <Dropdown>
                        <Dropdown.Toggle variant="dark">Filter Type</Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setTypeFilter("All")}>All</Dropdown.Item>
                            <Dropdown.Item onClick={() => setTypeFilter("Official")}>Official</Dropdown.Item>
                            <Dropdown.Item onClick={() => setTypeFilter("Club")}>Club</Dropdown.Item>
                            <Dropdown.Item onClick={() => setTypeFilter("Normal")}>Normal</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown>
                        <Dropdown.Toggle variant="dark">Filter Visibility</Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setPrivacyFilter("All")}>All</Dropdown.Item>
                            <Dropdown.Item onClick={() => setPrivacyFilter("Public")}>Public</Dropdown.Item>
                            <Dropdown.Item onClick={() => setPrivacyFilter("Private")}>Private</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
            <div className="list-container">
            {filteredCommunities.length === 0 ? (
                <h5 className='info-message'>No Communities</h5>
            ) : (
                filteredCommunities.map((community) => (
                    <div key={community.id}>
                        <Link className="box-style" href={route("user.communityProfile", community)}>
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
                        </Link>
                    </div>
                ))
            )}

            <div ref={ref}></div>
            {loading && 
            <div style={{display:"flex",justifyContent:"center"}}>
                <i className='interactive-icon bx bx-loader-circle' style={{alignContent:"center",fontWeight:"600"}} >&nbsp;Loading</i>
            </div>
            }
            </div>
        </div>
    );
}

export default CampusCommunities;

/*
<div className='index-post-navigation'>
                <a>Type :</a>
                <a onClick={() => setTypeFilter("all")} className={typeFilter === "all" ? "active" : ""}>All</a>
                <a onClick={() => setTypeFilter("Official")} className={typeFilter === "Official" ? "active" : ""}>Official</a>
                <a onClick={() => setTypeFilter("Club")} className={typeFilter === "Club" ? "active" : ""}>Club</a>
                <a onClick={() => setTypeFilter("Normal")} className={typeFilter === "Normal" ? "active" : ""}>Common</a>
            </div>
            <div className='index-post-navigation'>
                <a>Visibility :</a>
                <a onClick={() => setPrivacyFilter("all")} className={privacyFilter === "all" ? "active" : ""}>All</a>
                <a onClick={() => setPrivacyFilter("Public")} className={privacyFilter === "Public" ? "active" : ""}>Public</a>
                <a onClick={() => setPrivacyFilter("Private")} className={privacyFilter === "Private" ? "active" : ""}>Private</a>
            </div>
*/