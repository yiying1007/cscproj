import { useForm,usePage } from "@inertiajs/react";
import { InfoMessage } from "../../Components/FormComponent";
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';
import { Button } from "react-bootstrap";
import { Form } from "react-bootstrap";


function CreateCommunityModal(){
    const { auth } = usePage().props;
    const [show, setShow] = useState(false);
    const handleClose = () => {
        setShow(false);
        reset();
        clearErrors();
    };
    const handleShow = () => setShow(true);
    
    const { data, setData, post, processing, errors,clearErrors,reset } = useForm({
        name: "",
        description: "",
        type: "Normal",
        is_private: "Public",
    });
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('user.createCommunity'), {
            onSuccess: () => {
              handleClose(); 
              setTimeout(() => {
                window.location.reload();
            }, 1500);
            },
          });
    }
    
    return(
        <div>
            <Button  variant="dark" onClick={handleShow}>Create</Button>
            <Modal backdrop="static" show={show} onHide={handleClose}>
            <Modal.Body>
                <div className="post-create-container">
                <div className="post-create-border">
                    <form onSubmit={formSubmit}>
                        <div className="post-create-header">
                            <h4>Create Community</h4>
                            <div className="actionStyle-userClient">
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                            <Button type="submit" disabled={processing}>Create</Button>
                            </div>
                        </div>
                        <div className="post-create-body">
                            <div className="post-title">
                                <input
                                    className="post-input-style"
                                    type="text"
                                    placeholder="name"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                />
                                {errors.name && <p className="errorMessage">{errors.name}</p>}
                            </div>
                            <hr className="post-line" style={{ width: "100%" }} />
                            <div className="post-content">
                                <textarea
                                    className="post-input-style"
                                    type="text"
                                    placeholder="description"
                                    value={data.description}
                                    onChange={(e) => setData("description", e.target.value)}
                                />
                                {errors.description && <p className="errorMessage">{errors.description}</p>}
                            </div>
                            <hr />
                            {errors.type && <InfoMessage className="errorMessage" message={errors.type}/>}
                            {errors.is_private && <InfoMessage className="errorMessage" message={errors.is_private}/>}
                            <div className="actionStyle-userClient">
                                <Form.Select
                                    style={{width:"20%"}}
                                    size="sm"
                                    value={data.is_private}
                                    onChange={(e) => setData("is_private", e.target.value)}
                                >
                                    <option value="Public">Public</option>
                                    <option value="Private">Private</option>
                                </Form.Select>

                                <Form.Select
                                    style={{width:"25%"}}
                                    size="sm"
                                    value={data.type}
                                    onChange={(e) => setData("type", e.target.value)}
                                >
                                    <option value="Normal">Normal</option>
                                    <option value="Club"disabled={auth.user.position === "Student"}>Club</option>
                                    <option value="Official" disabled={auth.user.position != "Admin"}>Official</option>
                                </Form.Select>
                            </div>
                        </div>
                    </form>
                </div>
                </div>
            </Modal.Body>
        </Modal>

        </div>
        
    );
}






export default CreateCommunityModal;