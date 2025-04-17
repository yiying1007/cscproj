import { useForm } from "@inertiajs/react";
import { Input,TextArea,Button,Select,Option,InfoMessage } from "../../Components/FormComponent";
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';

function CreateWordModal(){
    const [show, setShow] = useState(false);

    const handleClose = () => {
        setShow(false);
        reset();
        clearErrors();
    };
    const handleShow = () => setShow(true);

    const { data, setData, post, processing, errors,reset,clearErrors } = useForm({
        word: "",
        type: "",
    });
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('admin.createWord'), {
            onSuccess: () => {
              handleClose(); 
            },
          });
    }

    return(
        <div>
            <button className="btn btn-primary btn-sm" onClick={handleShow}>
                Create
            </button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Sensitive Word</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formSubmit}>
                        <Input 
                            label="Word"
                            type="text"
                            name="word"
                            id="word"
                            value={data.word}/*store data */
                            onChange={(e) => setData('word', e.target.value)}/*update data */ 
                        />
                        {errors.word && <InfoMessage className="errorMessage" message={errors.word}/>}
                        <Input 
                            label="Type"
                            type="text"
                            name="type"
                            id="type"
                            value={data.type}/*store data */
                            onChange={(e) => setData('type', e.target.value)}/*update data */ 
                        />
                        {errors.type && <InfoMessage className="errorMessage" message={errors.type}/>}
                        <hr />
                        <Button name="Create" disabled={processing} />
                            
                    </form>

                </Modal.Body>
                
            </Modal>
        </div>
        
    );
}

export default CreateWordModal;