import { useForm,usePage } from "@inertiajs/react";
import { Input,Button,Select,Option,InfoMessage } from "../../Components/FormComponent";
//import MyModal from "../Components/Modal";
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

function EditAdminModal({admin}){
    const { auth } = usePage().props;
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const handleClose = () => {
        setShow(false);
        setData({
            name: admin.name || "",
            email: admin.email || "",
            password: "",
            gender: admin.gender || "",
            position: admin.position || "",
        });
    };
    const handleShow = () => setShow(true);

    
    const { data, setData, post, processing, errors } = useForm({
        name: admin.name || "",
        email: admin.email || "",
        password: "",
        gender: admin.gender || "",
        position: admin.position || "",
    });
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('admin.editAdmin',admin.id), {
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
            <button className="btn btn-success btn-sm" onClick={handleShow} disabled={auth.admin.position ==="Admin" && admin.id!=auth.admin.id}>
                Edit
            </button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Admin</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formSubmit}>
                        
                        <Input
                            label="Name"
                            type="text"
                            name="name"
                            id="name"
                            value={data.name || ""}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && <InfoMessage className="errorMessage" message={errors.name}/>}
                        
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            id="email"
                            value={data.email || ""}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && <InfoMessage className="errorMessage" message={errors.email}/>}
                        
                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            id="password"
                            value={data.password || ""}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        {errors.password && <InfoMessage className="errorMessage" message={errors.password}/>}

                        <Select
                            label="Gender"
                            name="gender"
                            id="gender"
                            value={data.gender || ""}
                            onChange={(e) => setData('gender', e.target.value)}
                        >
                            <Option label="Select" value="" />
                            <Option label="Female" value="Female" />
                            <Option label="Male" value="Male" />
                        </Select>
                        {errors.gender && <InfoMessage className="errorMessage" message={errors.gender}/>}
                            
                        {auth.admin.position ==="Super Admin" &&
                        <Select
                            label="Position"
                            name="position"
                            id="position"
                            value={data.position || ""}
                            onChange={(e) => setData('position', e.target.value)}
                        >
                            <Option label="Select" value="" />
                            <Option label="Super Admin" value="Super Admin" />
                            <Option label="Admin" value="Admin" />
                        </Select>
                        }
                        {errors.position && <InfoMessage className="errorMessage" message={errors.position}/>}
                            
                        
                        <hr />
                        <Button name="Edit" disabled={processing} />
                                
                    </form>

                </Modal.Body>
                
            </Modal>

        </div>

    );
}

export default EditAdminModal;