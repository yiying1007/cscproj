import { useForm } from "@inertiajs/react";
import { Input,Button,InfoMessage } from "../../Components/FormComponent";
//import MyModal from "../Components/Modal";
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

function EditAnnouncementModal({a}){
    
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const handleClose = () => {
        setShow(false);
        clearErrors();
        reset();
        setData({
            name: a.name || "",
            email: a.email || "",
            password: "",
        });
    };
    const handleShow = () => setShow(true);

    
    const { data, setData, post, processing, errors,clearErrors,reset } = useForm({
        title: a.title || "",
        content: a.content || "",
        end_time: a.end_time || "",
    });
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('admin.editAnnouncement',a.id), {
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
                    <Modal.Title>Edit Announcement</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formSubmit}>
                        
                    <Input 
                            label="Title"
                            type="text"
                            name="title"
                            id="title"
                            value={data.title || ""}/*store data */
                            onChange={(e) => setData('title', e.target.value)}/*update data */ 
                        />
                        {errors.title && <InfoMessage className="errorMessage" message={errors.title}/>}
                        <Input 
                            label="Content"
                            type="text"
                            name="content"
                            id="content"
                            value={data.content || ""}/*store data */
                            onChange={(e) => setData('content', e.target.value)}/*update data */ 
                        />
                        {errors.content && <InfoMessage className="errorMessage" message={errors.content}/>}
                        <Input  
                            style={{width:"auto"}}                     
                            label="Expiration Time"
                            type="datetime-local"
                            name="end_time"
                            id="end_time"
                            value={data.end_time || ""}
                            onChange={(e) => setData('end_time', e.target.value)}
                        />
                        {errors.end_time && <InfoMessage className="errorMessage" message={errors.end_time}/>}
                        
                       
                        <hr />
                        <Button name="Edit" disabled={processing} />
                                
                    </form>

                </Modal.Body>
                
            </Modal>

        </div>

    );
}

export default EditAnnouncementModal;