import { useForm } from "@inertiajs/react";
import { Input,Button,InfoMessage } from "../../Components/FormComponent";
//import MyModal from "../Components/Modal";
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

function EditTypeModal({type}){
    
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const handleClose = () => {
        setShow(false);
        clearErrors();
        reset();
        setData({
            type_name: type.type_name || "",
        });
    };
    const handleShow = () => setShow(true);

    
    const { data, setData, post, processing, errors,clearErrors,reset } = useForm({
        type_name: type.type_name || "",
    });
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('admin.editPostType',type.id), {
            onSuccess: () => {
                handleClose(); // close modal
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            },
          });
    }
    
    
    return(
        <div>
            <button className="btn btn-success btn-sm" onClick={handleShow}>
                Edit
            </button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Type</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formSubmit}>
                        
                        <Input
                            label="Type Name"
                            type="text"
                            name="type_name"
                            id="type_name"
                            value={data.type_name || ""}
                            onChange={(e) => setData('type_name', e.target.value)}
                        />
                        {errors.type_name && <InfoMessage className="errorMessage" message={errors.type_name}/>}
                        
                       
                        <hr />
                        <Button name="Edit" disabled={processing} />
                                
                    </form>

                </Modal.Body>
                
            </Modal>

        </div>

    );
}

export default EditTypeModal;