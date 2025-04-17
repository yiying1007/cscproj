import { usePage, useForm,router } from "@inertiajs/react";
import { useState } from "react";
import { Modal } from "react-bootstrap";
import {Button} from "../../Components/FormComponent";



function DeleteComponent({postData,deleteUrl}) {
    const { auth } = usePage().props;

    const { delete: deleteData, processing } = useForm();
    
    //modal delete
    const [show, setShow] = useState(false);
    const handleClose = () => {
        setShow(false);
    };
    const handleShow = () => {
        setShow(true);
    };

    const deletedData = () => {
        
        deleteData(route(`${deleteUrl}`, postData.id), {
            preserveScroll:true,
            onSuccess: () => {
                handleClose();
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        });
    };

    return (
        <>
        {postData.user_id === auth.user.id && <i className='interactive-icon bx bxs-trash' onClick={() => handleShow(postData)}> Delete</i>}
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Delete</Modal.Title>                
            </Modal.Header>
            <Modal.Body>
                <form>     
                    <h5>Are you sure to delete ?</h5>
                    <hr />
                    <Button name="Delete" onClick={deletedData} disabled={processing} />                
                </form>
            </Modal.Body>
        </Modal>
        </>
    );
}

export default DeleteComponent;
