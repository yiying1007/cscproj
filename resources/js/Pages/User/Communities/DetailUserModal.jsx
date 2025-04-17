import { useForm } from "@inertiajs/react";
import { Input } from "../../Components/FormComponent";
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from "react-bootstrap/Button";

function ViewDetailModal({request}){
    
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const userAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${request.avatar}`;
    
    
    return(
        <div>
            <Button variant="dark" onClick={handleShow}>
                Detail
            </Button>
            <Modal show={show} onHide={handleClose}>
                <Modal.Body>
                    <div className="cardDetail">
                        <h3>User Detail</h3>
                        <hr />
                        <p><img src={userAvatarUrl} className="avatarCard" /></p>
                        <p>{request.nickname}</p>
                        <p>{request.position}</p>
                        <p>{request.faculty}</p>
                        <p>{request.course}</p>
                        <hr />

                    </div>
                </Modal.Body>
                
            </Modal>

        </div>

    );
}

export default ViewDetailModal;