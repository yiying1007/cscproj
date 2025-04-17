import { useState } from "react";
import { usePage, Link } from "@inertiajs/react";
import Dropdown from "react-bootstrap/Dropdown";
import useInfiniteScroll from "../../Components/useInfiniteScroll";

function MyCommunities() {
    const { myCommunities: initialMyCommunities = [], hasMoreMyCommunities: initialHasMore } = usePage().props;
    const [myCommunities, setMyCommunities] = useState(initialMyCommunities);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [page, setPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState("all");
    const [privacyFilter, setPrivacyFilter] = useState("all");

    const loadMoreMyCommunities = async () => {
        try {
            const res = await fetch(`/loadMyCommunities?page=${page + 1}`);
            const data = await res.json();

            setMyCommunities([...myCommunities, ...data.myCommunities]);
            setHasMore(data.hasMore);
            setPage(page + 1);
        } catch (error) {
            console.error("Failed to load more myCommunities", error);
        }
    };

    const { ref, loading } = useInfiniteScroll({ loadMore: loadMoreMyCommunities, hasMore });

    const filteredCommunities = myCommunities.filter((community) => {
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
                            <Dropdown.Item onClick={() => setTypeFilter("all")} className={typeFilter === "all" ? "active" : ""}>All</Dropdown.Item>
                            <Dropdown.Item onClick={() => setTypeFilter("Official")} className={typeFilter === "Official" ? "active" : ""}>Official</Dropdown.Item>
                            <Dropdown.Item onClick={() => setTypeFilter("Club")} className={typeFilter === "Club" ? "active" : ""}>Club</Dropdown.Item>
                            <Dropdown.Item onClick={() => setTypeFilter("Normal")} className={typeFilter === "Normal" ? "active" : ""}>Normal</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown>
                        <Dropdown.Toggle variant="dark">Filter Visibility</Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setPrivacyFilter("all")} className={privacyFilter === "all" ? "active" : ""}>All</Dropdown.Item>
                            <Dropdown.Item onClick={() => setPrivacyFilter("Public")} className={privacyFilter === "Public" ? "active" : ""}>Public</Dropdown.Item>
                            <Dropdown.Item onClick={() => setPrivacyFilter("Private")} className={privacyFilter === "Private" ? "active" : ""}>Private</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
            <div className="list-container">
            {filteredCommunities.length === 0 ? (
                <h5 className='info-message'>No Communities</h5>
            ) : (
                filteredCommunities.map((community) => {
                    const communityAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${community.avatar}`;
                    return (
                        <div key={community.id}>
                            <Link className="box-style" href={route("user.communityProfile", community)}>
                                <div className="box-info-left">
                                    <img src={communityAvatarUrl} className="avatarMedium" />
                                </div>
                                <div className="box-info-center">
                                <h5><span>{community.is_private==="Public" ? (<i className='fa fa-globe'>&nbsp;</i>) :(<i className='bx bxs-lock-alt'></i>)} </span>{community.name}&nbsp;<span className="position-tag">{community.type}</span></h5>
                                <span className="box-center-text">
                                    {(community.description || "").length > 150 
                                        ? (community.description || "").substring(0, 150) + "..." 
                                        : community.description || ""}
                                </span>
                                <span className="mobile-box-center-text">
                                    {(community.description || "").length > 50 
                                        ? (community.description || "").substring(0, 50) + "..." 
                                        : community.description || ""}
                                </span>
                                </div>
                                <div className="box-info-right"></div>
                            </Link>
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
        </div>
    );
}

export default MyCommunities;
