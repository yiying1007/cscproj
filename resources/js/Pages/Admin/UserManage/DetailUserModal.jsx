import { useForm } from "@inertiajs/react";
import { Input,Button,Select,Option,InfoMessage } from "../../Components/FormComponent";
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

function ViewDetailModal({user}){
    
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    
    
    
    return(
        <div>
            <button className="btn btn-primary btn-sm" onClick={handleShow}>
                Detail
            </button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Detail User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5>Detail Account</h5>
                    <div className="detailGrid">
                        <span className="detailLabel">Name</span> 
                        <span className="detailContent">{user.nickname}</span>

                        <span className="detailLabel">Email</span> 
                        <span className="detailContent">{user.email}</span>

                        <span className="detailLabel">Gender</span> 
                        <span className="detailContent">{user.gender || "-"}</span>

                        <span className="detailLabel">Role</span> 
                        <span className="detailContent">{user.position}</span>
                        {user.position === "Admin" && 
                            <>
                            <span className="detailLabel">Admin Name</span> 
                            <span className="detailContent">{user.admin?.name}</span>
                            </>
                        }
                        <span className="detailLabel">Bio</span> 
                        <span className="detailContent">{user.intro || "-"}</span>

                        <span className="detailLabel">Account Status</span> 
                        <span className="detailContent">{user.acc_status}</span>

                        <span className="detailLabel">Account Violation</span> 
                        <span className="detailContent">{user.acc_violation_count}</span>

                        <span className="detailLabel">Block Until</span> 
                        <span className="detailContent">
                            {user.acc_block_until ? new Date(user.acc_block_until).toLocaleString() : "-"}
                        </span>
                    </div>
                    <hr />
                    <h5>Real Name Information</h5>
                    <div className="detailGrid">
                        <span className="detailLabel">Name</span> 
                        <span className="detailContent">{user.name || "-"}</span>

                        <span className="detailLabel">Email</span> 
                        <span className="detailContent">{user.segi_email || "-"}</span>

                        <span className="detailLabel">Role</span> 
                        <span className="detailContent">{user.role || "-"}</span>

                        <span className="detailLabel">Faculty</span> 
                        <span className="detailContent">{user.faculty || "-"}</span>

                        <span className="detailLabel">Course</span> 
                        <span className="detailContent">{user.course || "-"}</span>
                    </div>

                </Modal.Body>
                
            </Modal>

        </div>

    );
}

export default ViewDetailModal;