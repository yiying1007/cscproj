import { usePage } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import { useState } from "react";
import useInfiniteScroll from "../../Components/useInfiniteScroll";

function FriendList() {
  
  const { friends: initialFriends, hasMoreFriends: initialHasMore } = usePage().props;
  const [friends, setFriends] = useState(initialFriends);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);

  // when scroll at bottom,auto load the community
  const loadMoreFriends = async () => {
    try {
        const res = await fetch(`UserList/loadFriends?page=${page + 1}`,{
            headers: { "Accept": "application/json" }
        });
        const data = await res.json();
        setFriends([...friends, ...data.friends]);
        setHasMore(data.hasMore);
        setPage(page + 1);
      } catch (error) {
          console.error("Failed to load more friends", error);
      }
  };
  const { ref, loading } = useInfiniteScroll({ loadMore: loadMoreFriends, hasMore });


  return (
    <div>
      
      <div className="list-container">
        {friends.length === 0 ? (
            <h5 className='info-message'>No Friends</h5>
        ) : (
            friends.map((user) => {
            const userAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${user.avatar}`;

            return (
                <div key={user.id}>
                  <Link
                    className="box-style"
                    href={route("user.targetUserProfile", user)}
                  >
                    <div className="box-info-left">
                      <img src={userAvatarUrl} className="avatarMedium" />
                    </div>
                    <div className="box-info-center">
                      <h5>{user.nickname}</h5>
                      <p>{user.position}</p>
                    </div>
                    <div className="box-info-right"></div>
                  </Link>
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
    </div>
  );
}

export default FriendList;
