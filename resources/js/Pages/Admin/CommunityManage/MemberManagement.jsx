import { AdminLayout } from '../../../../Layouts/ClientLayout';
import { usePage,useForm } from '@inertiajs/react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-bs5';
import Dropdown from 'react-bootstrap/Dropdown';
import AddMemberModal from './AddMemberModal';
import { Modal } from 'react-bootstrap';
import { useState } from 'react';
import { Button } from '../../Components/FormComponent';

DataTable.use(DT);

function CommunityManagement(){

    const { community,users,members } = usePage().props;
    // delete member
    const { delete: deleteMember, post, processing } = useForm();
    
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

    // leave member
    const leaveMember = () => {
        if(selectedMember){
            deleteMember(route("admin.deleteMember",{ memberId: selectedMember.id,communityId: selectedMember.communities_id }),{
                onSuccess: () => {
                handleClose(); // close modal
                },
            });
        }
    };
    // change leader 
    const changeLeader = () => {
        if(selectedMember){
            post(route("admin.setToLeader",{ memberId: selectedMember.id,communityId: selectedMember.communities_id }),{
                onSuccess: () => {
                handleCloseLeader(); // close modal
                },
            });
        }
    };
    
    // set member to admin
    const setMemberToAdmin = (id,communities_id) => {
        post(route("admin.setMemberToAdmin", { memberId: id,communityId:communities_id }));
    };
    // set member to admin
    const setAdminToMember = (id,communities_id) => {
        post(route("admin.setAdminToMember", { memberId: id,communityId:communities_id }));
    };
    // set member to leader
    const setToLeader = (id,communities_id) => {
        post(route("admin.setToLeader", { memberId: id,communityId:communities_id }));
    };
    
    const actionDropdown=(member)=>{
        return(
            <Dropdown className="dropdown-style" >
                <Dropdown.Toggle variant="dark" id="dropdown-basic"></Dropdown.Toggle>
                {(member.member_position==="Admin"|| member.member_position==="Member") &&
                <Dropdown.Menu>
                    <Dropdown.Item 
                        onClick={() => handleShowLeader(member)} 
                    >
                        Set To Leader
                    </Dropdown.Item>
                    {member.member_position==="Member" &&
                    <Dropdown.Item 
                        onClick={() =>
                            setMemberToAdmin(member.id,member.communities_id)
                        }
                        disabled={processing}
                    >
                        Set To Admin
                    </Dropdown.Item> ||
                    <Dropdown.Item 
                        onClick={() =>
                            setAdminToMember(member.id,member.communities_id)
                        }
                        disabled={processing}
                    >
                        Set To Member
                    </Dropdown.Item>
                    }
                    <Dropdown.Item
                        onClick={() => handleShow(member)} 
                    >
                        Leave Club
                    </Dropdown.Item>
                    
                    
                </Dropdown.Menu>
                }
            </Dropdown>
        );
      }
    /*<h5>Welcome,{auth.community.name}</h5> */
    return(
        <div>
            <AdminLayout>
            
            <div className="controlbar">
                <h5>Member Management {community.name}</h5>
                <AddMemberModal communityId={community.id} />
            </div>
            <div className="controlbox">
                <div className="container-fluid">
                    <DataTable id="datatable" className="table">
                        <thead>
                            <tr>
                            <th>No</th>
                            <th>Avatar</th>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Position</th>
                            <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member,index) => {
                                const userAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${member.avatar}`;
                            return (
                                <tr key={member.id}>
                                <td>{index+1}</td>
                                <td>
                                    <img
                                        src={userAvatarUrl}
                                        className="avatarSmall"
                                    />
                                </td>
                                <td>{member.nickname}</td>
                                <td>{member.user_position}</td>
                                <td>{member.member_position}</td>
                                <td>
                                    <div className='actionStyle'>
                                        {actionDropdown(member)}
                                    </div>
                                    
                                </td>
                                </tr>
                            );
                            })}
                        </tbody>
                    </DataTable>
                </div>
            </div>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                <Modal.Title>Remove Member</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <h5 style={{textAlign:"center"}}>Are you sure to remove this member?</h5>
                <hr />
                <Button name="Remove" type="button" onClick={leaveMember} disabled={processing} />                             
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
            
            </AdminLayout>
            
        </div>

    );
}

export default CommunityManagement; 


