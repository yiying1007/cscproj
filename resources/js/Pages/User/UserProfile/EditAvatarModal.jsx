import { useForm,usePage } from "@inertiajs/react";
import { Input,Button,InfoMessage } from "../../Components/FormComponent";
//import MyModal from "../Components/Modal";
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

function EditAvatarModal(){
    
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const { auth } = usePage().props;
    const { setData, post, processing,errors } = useForm({
        avatar: auth.user.avatar,
    });
    const userAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${auth.user.avatar}`;
    //handle user avatar 
    const [avatarPreview, setAvatarPreview] = useState(`https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${auth.user.avatar}`);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('avatar', file); // 更新 avatar 字段的值为文件对象
            setAvatarPreview(URL.createObjectURL(file)); // 预览上传的文件
        }
    };
    const handleCancelPreview = () => {
        setAvatarPreview(
            `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${auth.user.avatar}`
        );
        setData('avatar', null); // 清除待上传的文件
    };
    

    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('user.avatarEdit'), {
            onSuccess: () => {
                handleClose(); // close modal
            },
          });
    }
    
    
    return(
        <div>
            <button onClick={handleShow}>
                <img src={userAvatarUrl} className='avatarProfile' />
            </button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Avatar</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formSubmit} style={{display:"grid"}}>
                        <img 
                            src={avatarPreview} 
                            alt="Your Avatar" 
                            style={{ width: "100px", height: "100px",justifySelf:"center",objectFit:"cover" }}
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

export default EditAvatarModal;