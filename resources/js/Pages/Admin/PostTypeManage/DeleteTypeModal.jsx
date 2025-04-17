import { useForm } from "@inertiajs/react";
import { Button } from "../../Components/FormComponent";
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

function DeleteTypeModal({type}){
    
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    
    const { delete:deleteType,processing } = useForm();
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        deleteType(route('admin.deletePostType',type.id), {
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
                    <Modal.Title>Delete Type</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formSubmit}>
                        
                        <h5>Are you sure to delete this type?</h5>
                        <hr />
                        <Button name="Delete" disabled={processing} />
                                
                    </form>

                </Modal.Body>
                
            </Modal>

        </div>

    );
}

export default DeleteTypeModal;