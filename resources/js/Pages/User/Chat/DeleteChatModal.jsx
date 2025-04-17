import { useForm,usePage } from "@inertiajs/react";
import { Input,Button,Select,Option,InfoMessage,TextArea } from "../../Components/FormComponent";
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';
import { Button as BootstrapButton } from "react-bootstrap";


function DeleteChatModal(){
    const { auth,chatList } = usePage().props;
    const { post, processing } = useForm();
    const [show, setShow] = useState(false);
    const handleClose = () => {
        setShow(false);
    };
    const handleShow = () => setShow(true);
    // accept member
    const deleteChat = (id) => {
        post(route("user.deleteChat", id),{
            onSuccess: () => {
                handleClose(); // close modal
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            },
          });
    };
    
    return(
        <div>
            <BootstrapButton as={BootstrapButton} variant="dark" onClick={handleShow}>
                <i className='bx bxs-trash'></i>
            </BootstrapButton>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Chat</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                {chatList.length === 0 ? (
                    <div className="box-style" style={{width:"100%",margin:"0px",justifyContent:"center"}}>
                        <h5 className='info-message'>No Chat</h5>
                    </div>
                ) : (
                    chatList.map((chat) => {
                        const otherUser = chat.members.find(m => m.user.id !== auth.user.id); // 找到对方
                        const avatarUrl = otherUser ? otherUser.user.avatar : "default-avatar.png"; // 取对方头像
                        const chatNicknames = chat.members
                                .filter(m => m.user.id !== auth.user.id) // 排除 auth.user
                                .map(m => m.user.nickname) // 只获取 nickname
                                .join(", ");

                    return (
                        <div key={chat.id}>
                        
                        <div className="box-style" style={{width:"100%",margin:"0px"}}>
                            <div className="box-info-left">
                            <img 
                                src={`https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${avatarUrl}`} 
                                className="avatarMedium" alt="Avatar" 
                            />
                            </div>
                            <div className="box-info-center">
                            <h5>{chat.name ? chat.name : chatNicknames}</h5>
                            </div>
                            <div className="box-info-right">
                                <BootstrapButton 
                                    onClick={() =>
                                        deleteChat(chat.id)
                                    }
                                    disabled={processing}>
                                    <i className='bx bxs-trash'></i>
                                </BootstrapButton>
                            </div>
                        
                        </div>
                        </div>
                    );
                    })
                )}
                </Modal.Body>
                
            </Modal>

            

        </div>
        
    );
}






export default DeleteChatModal;