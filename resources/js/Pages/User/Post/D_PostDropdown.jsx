import { useForm,usePage,Link } from '@inertiajs/react';
import { useEffect, useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import Modal from "react-bootstrap/Modal";
import { Button } from "../../Components/FormComponent";

function PostDropdown({postDetail}) {
    const { delete: deletePost, post, processing } = useForm();
    
    //modal delete
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

   /* const deletePosts = () => {
        if (selectedPost) {
            deletePost(route("user.deletePost", { postId: selectedPost.id }), {
                onSuccess: () => handleClose(),
            });
        }
     };*/

    const changeVisibility = () => {
        post(route("user.changeVisibility",postDetail.id));
     };

     function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--postDetail submit data
        deletePost(route('user.deletePost',postDetail.id), {
            onSuccess: () => {
                handleClose(); // close modal
            },
          });
    }




    return (
        <>
        <Dropdown>
            <Dropdown.Toggle id="dropdown-basic"></Dropdown.Toggle>                       
            <Dropdown.Menu>
                {postDetail.is_private === "Public" && <Dropdown.Item 
                    onClick={() =>
                        changeVisibility()
                    }
                    disabled={processing}
            >Set to private</Dropdown.Item>}
            {postDetail.is_private === "Private" && <Dropdown.Item 
                onClick={() =>
                changeVisibility()
                }
                disabled={processing}
            >Set to Public</Dropdown.Item>}
            <Dropdown.Item 
                onClick={handleShow}>delete</Dropdown.Item>
                                    
            </Dropdown.Menu>
        </Dropdown>

        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Delete Post</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={formSubmit}>
                    <h5>Are you sure to delete this post?</h5>
                    <hr />
                    <Button name="Delete" disabled={processing} />
                </form>
            </Modal.Body>
        </Modal>
        </>
    );
}

export default PostDropdown;