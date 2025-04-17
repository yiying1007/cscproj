import { useForm,usePage } from "@inertiajs/react";
import { Input,Button,Select,Option,InfoMessage } from "../../Components/FormComponent";
//import MyModal from "../Components/Modal";
import { useState} from 'react';
import Modal from 'react-bootstrap/Modal';

function EditAdminAvatarModal({admin}){
    const { auth } = usePage().props;
    
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const handleClose = () => {
        setShow(false);
        setAvatarPreview(
            `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${admin.avatar}`
        );
        setData('avatar', null);
    };
    const handleShow = () => setShow(true);

    
    const { setData, post, processing,errors } = useForm({
        avatar: admin.avatar,
    });
    const adminAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${admin.avatar}`;
    //handle user avatar 
    const [avatarPreview, setAvatarPreview] = useState(`https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${admin.avatar}`);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // update the value of the avatar field to the file object and view
            setData('avatar', file); 
            setAvatarPreview(URL.createObjectURL(file)); 
        }
    };
    const handleCancelPreview = () => {
        setAvatarPreview(
            `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${admin.avatar}`
        );
        setData('avatar', null);
    };

    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('admin.editAdminAvatar',admin.id), {
            onSuccess: () => {
                // close modal
                handleClose(); 
            },
          });
    }
    
    
    return(
        <div>
            {(auth.admin.position ==="Super Admin" || admin.id===auth.admin.id) && 
            <button onClick={handleShow}>
                <img
                    src={adminAvatarUrl}
                    className="avatarSmall"
                />
            </button>}
            {(auth.admin.position ==="Admin" && admin.id!=auth.admin.id) && 
                <img
                    src={adminAvatarUrl}
                    className="avatarSmall"
                />}
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Admin Avatar</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formSubmit} style={{display:"grid"}}>
                        <img 
                            src={avatarPreview} 
                            alt="Your Avatar" 
                            style={{ width: "100px", height: "100px",justifySelf:"center" }}
                        />
                        {errors.avatar && <InfoMessage className="errorMessage" message={errors.avatar}/>}
                        <div style={{display:'none'}}>
                            <Input 
                                type="file" 
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

export default EditAdminAvatarModal;