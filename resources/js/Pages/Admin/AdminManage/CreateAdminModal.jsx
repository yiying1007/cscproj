import { useForm } from "@inertiajs/react";
import { Input,Button,Select,Option,InfoMessage } from "../../Components/FormComponent";
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';

function CreateAdminModal(){
    const [show, setShow] = useState(false);

    const handleClose = () => {
        setShow(false);
        setData({
            name: "",
            email: "",
            password: "",
            password_confirmation:"",
            gender: "",
            position: "",
        });
    };
    const handleShow = () => setShow(true);

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation:"",
        gender: "",
        position: "",
    });
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('admin.createAdmin'), {
            onSuccess: () => {
              handleClose(); 
              setData({
                name: "",
                email: "",
                password: "",
                password_confirmation:"",
                gender: "",
                position: "",
            });
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
                    <Modal.Title>Create Admin</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formSubmit}>
                        <Input 
                            label="Name"
                            type="text"
                            name="name"
                            id="name"
                            value={data.name}/*store data */
                            onChange={(e) => setData('name', e.target.value)}/*update data */ 
                        />
                        {errors.name && <InfoMessage className="errorMessage" message={errors.name}/>}
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            id="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && <InfoMessage className="errorMessage" message={errors.email}/>}

                        <Select
                            label="Gender"
                            name="gender"
                            id="gender"
                            value={data.gender}
                            onChange={(e) => setData('gender', e.target.value)}     
                        >
                            <Option label="Select" value="" />
                            <Option label="Female" value="Female" />
                            <Option label="Male" value="Male" />
                        </Select>
                        {errors.gender && <InfoMessage className="errorMessage" message={errors.gender}/>}
                            
                        <Select
                            label="Position"
                            name="position"
                            id="position"
                            value={data.position}
                            onChange={(e) => setData('position', e.target.value)}        
                        >
                            <Option label="Select" value="Select" />
                            <Option label="Super Admin" value="Super Admin" />
                            <Option label="Admin" value="Admin" />
                        </Select>
                        {errors.position && <InfoMessage className="errorMessage" message={errors.position}/>}
                           
                        <Input 
                            label="Password"
                            type="password"
                            name="password"
                            id="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        {errors.password && <InfoMessage className="errorMessage" message={errors.password}/>}

                        <Input 
                            label="Confirm Password"
                            type="password"
                            name="password_confirmation"
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                        {errors.password_confirmation && <InfoMessage className="errorMessage" message={errors.password_confirmation}/>}

                        <hr />
                        <Button name="Create" disabled={processing} />
                            
                    </form>

                </Modal.Body>
                
            </Modal>
        </div>
        
    );
}

export default CreateAdminModal;