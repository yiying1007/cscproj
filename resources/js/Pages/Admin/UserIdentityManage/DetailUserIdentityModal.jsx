import { useForm } from "@inertiajs/react";
import { Input,Button,Select,Option,InfoMessage } from "../../Components/FormComponent";
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

function ViewDetailModal({identity}){
    
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
                    <Modal.Title>Detail User Identity</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5>Real Name Information</h5>
                    <div className="detailGrid">
                        <span className="detailLabel">Name</span> 
                        <span className="detailContent">{identity.name}</span>

                        <span className="detailLabel">Segi Email</span> 
                        <span className="detailContent">{identity.email}</span>

                        <span className="detailLabel">Role</span> 
                        <span className="detailContent">{identity.role}</span>

                        <span className="detailLabel">Faculty</span> 
                        <span className="detailContent">{identity.faculty || "-"}</span>

                        <span className="detailLabel">Course</span> 
                        <span className="detailContent">{identity.course || "-"}</span>
                    </div>
                    <h5>Account Information</h5>
                    <div className="detailGrid">
                        <span className="detailLabel">Nickname</span> 
                        <span className="detailContent">{identity.nickname}</span>

                        <span className="detailLabel">Email</span> 
                        <span className="detailContent">{identity.acc_email || "-"}</span>

                        <span className="detailLabel">Gender</span> 
                        <span className="detailContent">{identity.gender || "-"}</span>

                        <span className="detailLabel">Account Status</span> 
                        <span className="detailContent">{identity.acc_status || "-"}</span>
                    </div>
                </Modal.Body>
                
            </Modal>

        </div>

    );
}

export default ViewDetailModal;