import { useState } from "react";
import { useForm,usePage, router, Link } from "@inertiajs/react";
import Dropdown from 'react-bootstrap/Dropdown';
import useInfiniteScroll from "../../Components/useInfiniteScroll";
import { Modal } from "react-bootstrap";
import { Button } from "../../Components/FormComponent";
import InviteMemberModal from "./InviteMemberModal";


function Member() {
  const { members: initialMembers, hasMoreMembers: initialHasMore, community, auth,isMember,communityIsPublic } = usePage().props;
  const [members, setMembers] = useState(initialMembers);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  
  //modal delete
  const [show, setShow] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const handleClose = () => {
      setShow(false);
      setSelectedMember(null);
  };
  const handleShow = (member) => {
      setShow(true);
      setSelectedMember(member);
  };
  //modal leader
  const [showLeader, setShowLeader] = useState(false);
  const handleCloseLeader = () => {
      setShowLeader(false);
      setSelectedMember(null);
  };
  const handleShowLeader = (member) => {
      setShowLeader(true);
      setSelectedMember(member);
  };
  // when scroll at bottom,auto load the community
  const loadMoreMembers = async () => {
    if (!community.id) {
      console.error("communityId is undefined, skipping fetch.");
      return;
  }
    try {
        const res = await fetch(`/User/Communities/Profile/Member/loadMembers/${community.id}?page=${page + 1}`,{
            headers: { "Accept": "application/json" }
        });
        const data = await res.json();
        setMembers([...members, ...data.members]);
        setHasMore(data.hasMore);
        setPage(page + 1);
      } catch (error) {
          console.error("Failed to load more members", error);
      }
  };
  const { ref, loading } = useInfiniteScroll({ loadMore: loadMoreMembers, hasMore });

  // delete member
  const { delete: deleteMember, post, processing } = useForm();
  
  //get current user community position
  const currentUser = initialMembers.find(member => member.id === auth.user.id);
  const userMemberPosition = currentUser ? currentUser.member_position : null;

  // leave member
  const leaveMember = () => {
    if(selectedMember){
      deleteMember(route("user.deleteCommunityMember",{ memberId: selectedMember.id,communityId: selectedMember.communities_id }),{
        onSuccess: () => {
          handleClose(); // close modal
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        },
      });
    }
  };
  // change leader 
  const changeLeader = () => {
    if(selectedMember){
        post(route("user.setToLeader",{ memberId: selectedMember.id,communityId: selectedMember.communities_id }),{
            onSuccess: () => {
            handleCloseLeader(); // close modal
            setTimeout(() => {
              window.location.reload();
            }, 1500);
            },
        });
    }
  };
  // set member to admin
  const setMemberToAdmin = (user_id,communities_id) => {
    post(route("user.setMemberToAdmin", { memberId: user_id,communityId:communities_id }),{
      onSuccess: () => {
        setMembers((prevMembers) => 
          prevMembers.map(member => 
            member.id === user_id ? { ...member, member_position: "Admin" } : member
          )
        );
      },
    });
  };
  // set member to admin
  const setAdminToMember = (user_id,communities_id) => {
    post(route("user.setAdminToMember", { memberId: user_id,communityId:communities_id }),{
      onSuccess: () => {
        setMembers((prevMembers) => 
          prevMembers.map(member => 
            member.id === user_id ? { ...member, member_position: "Member" } : member
          )
        );
    },
    });
  };

  //leader function
  const actionLeaderDropdown=(member)=>{
      if(userMemberPosition==="Leader"){
        return(
            <Dropdown className="dropdown-style" >
                <Dropdown.Toggle variant="dark" id="dropdown-basic"></Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item 
                        onClick={() => handleShow(member)}
                    >
                        Leave Club
                    </Dropdown.Item>
                    {member.member_position === "Member" && 
                        <Dropdown.Item 
                            onClick={() =>
                              setMemberToAdmin(member.id,member.communities_id)
                            }
                            disabled={processing}
                        >
                            Set to Admin
                        </Dropdown.Item>
                    }
                    {member.member_position === "Admin" &&
                        <Dropdown.Item 
                          onClick={() =>
                            setAdminToMember(member.id,member.communities_id)
                          }
                          disabled={processing}
                        >
                            Set to Member
                        </Dropdown.Item>
                    }
                    {(member.member_position === "Admin" || member.member_position === "Member") &&
                        <Dropdown.Item 
                          onClick={() => handleShowLeader(member)}
                        >
                            Set to Leader
                        </Dropdown.Item>
                    }
                </Dropdown.Menu>
            </Dropdown>
        );
      }
  }
  //admin function
  const actionAdminDropdown=(member)=>{
    if(userMemberPosition==="Admin"){
      return(
          <Dropdown className="dropdown-style" >
              <Dropdown.Toggle variant="dark" id="dropdown-basic"></Dropdown.Toggle>
              <Dropdown.Menu>
                  <Dropdown.Item 
                      onClick={() => handleShow(member)}
                  >
                      Leave Club
                  </Dropdown.Item>
              </Dropdown.Menu>
          </Dropdown>
      );
    }
  }
  return (
    <div className="list-container">
      <div className="topStyle">
          <h3 className="titleName">All Member</h3>
          {(isMember && (isMember.position ==='Admin' || isMember.position ==='Leader')) && <InviteMemberModal />}
          {isMember && (isMember.position ==='Member' && communityIsPublic==="Public")&& <InviteMemberModal />}
      </div>
      {members.length === 0 ? (
        <h5 className='info-message'>No Members</h5>
      ) : (
        members.map((member) => {
          const userAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${member.avatar}`;

          return (
            <div key={member.id}>
              
              <div className="box-style">
                <div className="box-info-left">
                  <img src={userAvatarUrl} className="avatarMedium" alt="Avatar" />
                </div>
                <Link
                className="profile-link"
                href={
                  member.id === auth.user.id 
                    ? route("user.profile") 
                    : route("user.targetUserProfile", member)
                }
              >
                <div className="box-info-center">
                  <h5>{member.nickname} 
                      {(member.member_position === "Admin" || member.member_position === "Leader") && 
                        <span className="position-card">&nbsp; [{member.member_position}]</span>
                      }
                  </h5>
                  <p>{member.user_position}</p>
                </div>
                </Link>
                <div className="box-info-right">
                    {(member.member_position === "Admin" || member.member_position === "Member") && actionLeaderDropdown(member)}
                    {(member.member_position === "Member") && actionAdminDropdown(member)}
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
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Remove Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5 style={{textAlign:"center"}}>Are you sure to remove this member?</h5>
          <hr />
          <Button name="Remove" type="button" style={{float:"right"}} onClick={leaveMember} disabled={processing} />                             
        </Modal.Body>
      </Modal>
      <Modal show={showLeader} onHide={handleCloseLeader}>
          <Modal.Header closeButton>
            <Modal.Title>Change Leader</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h5 style={{textAlign:"center"}}>Are you sure to change this member to leader?</h5>
            <hr />
            <Button name="Set To Leader" type="button"  onClick={changeLeader} disabled={processing} />                             
          </Modal.Body>
      </Modal>
    </div>
  );
}

export default Member;
