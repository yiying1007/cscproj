import { useForm } from "@inertiajs/react";
import { Input,Button,InfoMessage } from "../../Components/FormComponent";
//import MyModal from "../Components/Modal";
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

function EditWordModal({sensitiveWord}){
    
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const handleClose = () => {
        setShow(false);
        clearErrors();
        reset();
    };
    const handleShow = () => setShow(true);

    
    const { data, setData, post, processing, errors,clearErrors,reset } = useForm({
        word: sensitiveWord.word || "",
        type: sensitiveWord.type || "",
    });
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('admin.editWord',sensitiveWord.id), {
            onSuccess: () => {
                handleClose(); // close modal
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
                    <Modal.Title>Edit Sensitive Word</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formSubmit}>
                        
                    <Input 
                            label="Word"
                            type="text"
                            name="word"
                            id="word"
                            value={data.word || ""}/*store data */
                            onChange={(e) => setData('word', e.target.value)}/*update data */ 
                        />
                        {errors.word && <InfoMessage className="errorMessage" message={errors.word}/>}
                        <Input 
                            label="Type"
                            type="text"
                            name="type"
                            id="type"
                            value={data.type || ""}/*store data */
                            onChange={(e) => setData('type', e.target.value)}/*update data */ 
                        />
                        {errors.type && <InfoMessage className="errorMessage" message={errors.type}/>}
                        
                        
                        <hr />
                        <Button name="Edit" disabled={processing} />
                                
                    </form>

                </Modal.Body>
                
            </Modal>

        </div>

    );
}

export default EditWordModal;