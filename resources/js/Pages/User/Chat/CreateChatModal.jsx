import { useForm,usePage } from "@inertiajs/react";
import { Input,Button,Select,Option,InfoMessage,TextArea } from "../../Components/FormComponent";
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';
import { Button as BootstrapButton } from "react-bootstrap";


function CreateChatModal(){
    const { friends } = usePage().props;
    const { post, processing } = useForm();
    const [show, setShow] = useState(false);
    const handleClose = () => {
        setShow(false);
    };
    const handleShow = () => setShow(true);
    // accept member
    const createChat = (id) => {
        post(route("user.createChat", id),{
            onSuccess: () => {
                handleClose(); // close modal
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            },
          });
    };
    
    return(
        <div>
            <BootstrapButton as={BootstrapButton} variant="dark" onClick={handleShow}>
                <i className='bx bxs-message-add'></i>
            </BootstrapButton>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Chat With Friend</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                {friends.length === 0 ? (
                    <div className="box-style" style={{width:"100%",margin:"0px",justifyContent:"center"}}>
                        <h5 className='info-message'>No Friends</h5>
                    </div>
                ) : (
                    friends.map((user) => {
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
                                        createChat(user.id)
                                    }
                                    disabled={processing}>
                                    <i className='bx bxs-message-add'></i>
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






export default CreateChatModal;