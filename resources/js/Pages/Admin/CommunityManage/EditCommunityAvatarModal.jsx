import { useForm } from "@inertiajs/react";
import { Input,Button,Select,Option,InfoMessage } from "../../Components/FormComponent";
//import MyModal from "../Components/Modal";
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import ImageView from "../../Components/ImageView";


function EditCommunityAvatarModal({community}){
    
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const handleClose = () => {
        setShow(false);
        clearErrors();
        setFileError("");
    };
    const handleShow = () => {
        handleCancelPreview();
        setShow(true);
    };

    
    const { setData, post, processing,errors,clearErrors } = useForm({
        avatar: community.avatar,
    });
    const communityAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${community.avatar}`;
    //handle user avatar 
    const [avatarPreview, setAvatarPreview] = useState(`https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${community.avatar}`);
    //manage error message state
    const [fileError, setFileError] = useState("");

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        const allowedTypes = ["image/jpg","image/jpeg", "image/png", "image/gif"];
        let validFiles = true;
        let errorMessage = "";
        //check if file is valid
        if (file) {
            if (!allowedTypes.includes(file.type)) {
                validFiles = false;
                errorMessage = "Only JPG, PNG, GIF images are allowed.";
            } 
        }
        setFileError(errorMessage);
        //if file is valid, set data and preview
        if (validFiles === true) {
            // update the value of the avatar field to the file object and view
            setData('avatar', file); 
            setAvatarPreview(URL.createObjectURL(file));
        }
    };
    const handleCancelPreview = () => {
        setAvatarPreview(
            `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${community.avatar}`
        );
        setData('avatar', null);
    };

    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('admin.editCommunityAvatar',community.id), {
            onSuccess: () => {
                // close modal
                handleClose(); 
            },
          });
    }
    
    
    return(
        <div>
            <button onClick={handleShow}>
                <img
                    src={communityAvatarUrl}
                    className="avatarSmall"
                />
            </button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Admin Avatar</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formSubmit} style={{display:"grid"}}>
                        <ImageView imageUrl={avatarPreview} cssClass="avatarPreview"/>
                        {fileError && <p className="errorMessage">{fileError}</p>}
                        {errors.avatar && <InfoMessage className="errorMessage" message={errors.avatar}/>}
                        <div style={{display:'none'}}>
                            <Input 
                                type="file" 
                                accept="image/*"
                                id="avatar" 
                                name="avatar" 
                                onChange={handleAvatarChange}
                            />
                        </div>
                        <div className="actionStyle">
                            <button className="buttonStyle" type="button" onClick={() => document.getElementById('avatar').click()}>Upload Avatar</button>
                            <button className="buttonStyle" type="button" onClick={handleCancelPreview}>Cancel Preview</button>
                        </div>

                        
                        <hr />
                        <Button name="Edit" disabled={processing} />
                                
                    </form>

                </Modal.Body>
                
            </Modal>

        </div>

    );
}

export default EditCommunityAvatarModal;