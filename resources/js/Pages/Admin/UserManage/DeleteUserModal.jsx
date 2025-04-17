import { useForm,usePage } from "@inertiajs/react";
import { Button } from "../../Components/FormComponent";
//import MyModal from "../Components/Modal";
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

function DeleteUserModal({user}){
    const {auth} = usePage().props;
    const currentAdminPosition=auth.admin.position;
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    
    const { delete:deleteUser,processing } = useForm();
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //deleteUser('admin.deleteUser',user.id);
        //use inertia js--useForm--post submit data
        deleteUser(route('admin.deleteUser',user.id), {
            onSuccess: () => {
                handleClose(); // close modal
            },
          });
    }
    
    
    return(
        <div>
            <button className="btn btn-danger btn-sm" onClick={handleShow} disabled={currentAdminPosition==="Admin" && user.position==="Admin"}>
                Delete
            </button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formSubmit}>
                        
                        <h5>Are you sure to delete this user?</h5>
                        <hr />
                        <Button name="Delete" disabled={processing} />
                                
                    </form>

                </Modal.Body>
                
            </Modal>

        </div>

    );
}

export default DeleteUserModal;