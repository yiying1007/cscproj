import { useForm } from "@inertiajs/react";
import { Input,Button,Select,Option,InfoMessage } from "../../Components/FormComponent";
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';

function CreateTypeModal(){
    const [show, setShow] = useState(false);

    const handleClose = () => {
        setShow(false);
        reset();
        clearErrors();
    };
    const handleShow = () => setShow(true);

    const { data, setData, post, processing, errors,reset,clearErrors } = useForm({
        type_name: "",
    });
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('admin.createPostType'), {
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
                    <Modal.Title>Create Type</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formSubmit}>
                        <Input 
                            label="Type Name"
                            type="text"
                            name="type_name"
                            id="type_name"
                            value={data.type_name}/*store data */
                            onChange={(e) => setData('type_name', e.target.value)}/*update data */ 
                        />
                        {errors.type_name && <InfoMessage className="errorMessage" message={errors.type_name}/>}
                        <hr />
                        <Button name="Create" disabled={processing} />
                            
                    </form>

                </Modal.Body>
                
            </Modal>
        </div>
        
    );
}

export default CreateTypeModal;