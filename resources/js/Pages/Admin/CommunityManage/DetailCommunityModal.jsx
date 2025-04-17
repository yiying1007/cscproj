import { useForm } from "@inertiajs/react";
import { Input,TextArea,Button,Select,Option,InfoMessage } from "../../Components/FormComponent";
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

function ViewDetailModal({community}){
    
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    
    
    
    return(
        <div>
            <button className="btn btn-primary btn-sm" onClick={handleShow}>
                View
            </button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Detail Community</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="detailGrid">
                        <span className="detailLabel">Name</span> 
                        <span className="detailContent">{community.name || "-"}</span>

                        <span className="detailLabel">Leader</span> 
                        <span className="detailContent">{community.nickname || "-"}</span>

                        <span className="detailLabel">Description</span> 
                        <span className="detailContent">{community.description || "-"}</span>

                        <span className="detailLabel">Type</span> 
                        <span className="detailContent">{community.type}</span>

                        <span className="detailLabel">Visibility</span> 
                        <span className="detailContent">{community.is_private}</span>

                        <span className="detailLabel">Community Status</span> 
                        <span className="detailContent">{community.status}</span>
                    </div>
                </Modal.Body>
                
            </Modal>

        </div>

    );
}

export default ViewDetailModal;