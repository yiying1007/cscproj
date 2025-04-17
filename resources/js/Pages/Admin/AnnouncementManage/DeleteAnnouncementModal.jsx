import { useForm } from "@inertiajs/react";
import { Button } from "../../Components/FormComponent";
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

function DeleteAnnouncementModal({a}){
    
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    
    const { delete:deleteAnnouncement,processing } = useForm();
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        deleteAnnouncement(route('admin.deleteAnnouncement',a.id), {
            onSuccess: () => {
                handleClose(); // close modal
            },
          });
    }
    
    
    return(
        <div>
            <button className="btn btn-danger btn-sm" onClick={handleShow}>
                Delete
            </button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Announcement</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formSubmit}>
                        
                        <h5>Are you sure to delete this announcement?</h5>
                        <hr />
                        <Button name="Delete" disabled={processing} />
                                
                    </form>

                </Modal.Body>
                
            </Modal>

        </div>

    );
}

export default DeleteAnnouncementModal;