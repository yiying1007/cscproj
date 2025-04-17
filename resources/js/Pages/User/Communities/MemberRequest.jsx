import { usePage, useForm } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import Button from "react-bootstrap/Button";
import ViewDetailModal from "./DetailUserModal";


function MemberRequest() {
  const { delete: rejectRequest, post, processing } = useForm();
  const { memberRequest } = usePage().props;

  // accept member
  const acceptMemberRequest = (user_id,communities_id) => {
    post(route("user.acceptMemberRequest", { memberId: user_id,communityId:communities_id }));
 };
 // reject member
 const rejectMemberRequest = (user_id,communities_id) => {
    rejectRequest(route("user.rejectMemberRequest",{ memberId: user_id,communityId:communities_id }));
  };

  return (
    <div className="list-container">
        <h3 className="titleName">Member Request</h3>
        {memberRequest.length === 0 ? (
            <h5 className='info-message'>No Member Request</h5>
          
        ) : (
          memberRequest.map((request) => {
            const userAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${request.avatar}`;

            return (
              <div key={`${request.user_id}-${request.communities_id}`}>
                <div className="box-style">
                    <div className="box-info-left">
                        <img src={userAvatarUrl} className="avatarMedium" />
                    </div>
                    <div className="box-info-center" >
                      <Link
                      className="profile-link" 
                        href={route("user.targetUserProfile", request)}>
                        <h5>{request.nickname}</h5>
                      </Link>
                      <p>{request.position}</p>
                  </div>
                  <div className="box-info-right actionStyle-userClient">
                  <ViewDetailModal request={request} />
                    <Button
                      variant="dark"
                      onClick={() =>
                        acceptMemberRequest(request.user_id,request.communities_id)
                      }
                      disabled={processing}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="dark"
                      onClick={() =>
                        rejectMemberRequest(request.user_id,request.communities_id)
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

export default MemberRequest;
