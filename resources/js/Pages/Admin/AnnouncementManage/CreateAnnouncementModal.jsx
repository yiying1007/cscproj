import { useForm } from "@inertiajs/react";
import { Input,TextArea,Button,Select,Option,InfoMessage } from "../../Components/FormComponent";
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';

function CreateAnnouncementModal(){
    const [show, setShow] = useState(false);

    const handleClose = () => {
        setShow(false);
        reset();
        clearErrors();
    };
    const handleShow = () => setShow(true);

    const { data, setData, post, processing, errors,reset,clearErrors } = useForm({
        title: "",
        content: "",
        end_time: "",
    });
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('admin.createAnnouncement'), {
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
                    <Modal.Title>Create Announcement</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formSubmit}>
                        <Input 
                            label="Title"
                            type="text"
                            name="title"
                            id="title"
                            value={data.title}/*store data */
                            onChange={(e) => setData('title', e.target.value)}/*update data */ 
                        />
                        {errors.title && <InfoMessage className="errorMessage" message={errors.title}/>}
                        <TextArea 
                            label="Content"
                            type="text"
                            name="content"
                            id="content"
                            value={data.content}/*store data */
                            onChange={(e) => setData('content', e.target.value)}/*update data */ 
                        />
                        {errors.content && <InfoMessage className="errorMessage" message={errors.content}/>}
                        <Input    
                            style={{width:"auto"}}                     
                            label="Expiration Time"
                            type="datetime-local"
                            name="end_time"
                            id="end_time"
                            value={data.end_time}
                            onChange={(e) => setData('end_time', e.target.value)}
                        />
                        {errors.end_time && <InfoMessage className="errorMessage" message={errors.end_time}/>}
                        <hr />
                        <Button name="Create" disabled={processing} />
                            
                    </form>

                </Modal.Body>
                
            </Modal>
        </div>
        
    );
}

export default CreateAnnouncementModal;