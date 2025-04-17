import { useForm,usePage } from "@inertiajs/react";
import { Input,Button,Select,Option,InfoMessage,TextArea } from "../../Components/FormComponent";
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';
import { Button as BootstrapButton } from "react-bootstrap";
import Form from 'react-bootstrap/Form';


function AddMemberModal({communityId}){
    const { users } = usePage().props;
    const { post, processing } = useForm();
    const [show, setShow] = useState(false);
    const handleShow = () => setShow(true);
    const handleClose = () => {
        setShow(false);
    };
    //search users
    const [searchQuery, setSearchQuery] = useState("");
    const handleSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };
    //search by name and position
    const filteredUsers = users.filter((user) => user.nickname.toLowerCase().includes(searchQuery) ||
    user.position.toLowerCase().includes(searchQuery));

    // add member
    const addMember = (id,communityId) => {
        post(route("admin.addMember", { userId: id,communityId:communityId }));
    };
    
    return(
        <div>
            <BootstrapButton as={BootstrapButton} variant="dark" onClick={handleShow}>Add Member</BootstrapButton>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Member</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input 
                        className="inputSearch" style={{margin:"0px",width:"100%"}}
                        placeholder="Searching..."
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                    <hr />
                    {filteredUsers.length === 0 ? (
                        <div className="box-style" style={{width:"100%",margin:"0px",justifyContent:"center"}}>
                            <h5 className='info-message'>No Users</h5>
                        </div>
                    ) : (
                        filteredUsers.map((user) => {
                        const userAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${user.avatar}`;
                        return (
                            <div key={user.id}>
                            <div className="box-style" style={{width:"100%",margin:"0px"}}>
                                <div className="box-info-left">
                                <img src={userAvatarUrl} className="avatarMedium" alt="Avatar" />
                                </div>
                                <div className="box-info-center">
                                <h5>{user.nickname}</h5>
                                <p>{user.position}</p>
                                </div>
                                
                                <div className="box-info-right">
                                    <BootstrapButton 
                                        onClick={() =>
                                            addMember(user.id,communityId)
                                        }
                                        disabled={processing}>
                                        Invite
                                    </BootstrapButton>
                                </div>
                            </div>
                            </div>
                        );
                        })
                    )}
                </Modal.Body>
                
            </Modal>

            

        </div>
        
    );
}






export default AddMemberModal;