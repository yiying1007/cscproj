import { usePage, useForm } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import Button from "react-bootstrap/Button";

function FriendRequest() {
  const { delete: rejectRequest, post, processing } = useForm();
  const { friendRequest } = usePage().props;

  // accept friend
  const acceptFriendRequest = (user_id) => {
    post(route("user.acceptFriendRequest", { id: user_id }));
 };

  // reject friend
  const rejectFriendRequest = (user_id) => {
    rejectRequest(route("user.rejectFriendRequest",{ id: user_id }));
  };

  return (
    <div className="list-container">
        
        {friendRequest.length === 0 ? (
          <h5 className='info-message'>No Friend Request</h5>
        ) : (
          friendRequest.map((request) => {
            const userAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${request.sender.avatar}`;
            const user = request.sender;

            return (
              <div key={`${request.user_id}-${request.friend_id}`}>
                <div className="box-style">
                  <div className="box-info-left">
                    <img src={userAvatarUrl} className="avatarMedium" />
                  </div>
                  <div className="box-info-center" >
                    <Link 
                      className='profile-link' 
                      href={route("user.targetUserProfile", user)}
                    >
                    <h5>{user.nickname}</h5>
                    </Link>
                    <p>{user.position}</p>
                  </div>
                  <div className="box-info-right actionStyle-userClient">
                    <Button
                      variant="dark"
                      onClick={() =>
                        acceptFriendRequest(request.user_id)
                      }
                      disabled={processing}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="dark"
                      onClick={() =>
                        rejectFriendRequest(request.user_id)
                      }
                      disabled={processing}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}

    </div>
  );
}

export default FriendRequest;
