import { useForm,usePage } from "@inertiajs/react";
import { Input,Button,Select,Option,InfoMessage } from "../Components/FormComponent";
//import MyModal from "../Components/Modal";
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

function DeleteAdminLogModal({adminLogs}){
    const { auth } = usePage().props;
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    
    const { delete:deleteAdminLogs,processing } = useForm();
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //deleteUser('admin.deleteUser',user.id);
        //use inertia js--useForm--post submit data
        deleteAdminLogs(route('admin.deleteAdminLogs',adminLogs.id), {
            onSuccess: () => {
                handleClose(); // close modal
            },
          });
    }
    
    
    return(
        <div>
            <button className="btn btn-danger btn-sm" onClick={handleShow} disabled={auth.admin.position ==="Admin"}>
                Delete
            </button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Admin Log</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formSubmit}>
                        
                        <h5>Are you sure to delete this log?</h5>
                        <hr />
                        <Button name="Delete" disabled={processing} />
                                
                    </form>

                </Modal.Body>
                
            </Modal>

        </div>

    );
}

export default DeleteAdminLogModal;