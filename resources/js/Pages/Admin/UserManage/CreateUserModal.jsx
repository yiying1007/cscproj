import { useForm,usePage } from "@inertiajs/react";
import { Input,Button,Select,Option,InfoMessage } from "../../Components/FormComponent";
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';


function CreateUserModal({admins}){
    const {auth} = usePage().props;
    const currentAdminPosition=auth.admin.position;

    //handle position state 
    const [selectedPosition, setSelectedPosition] = useState("");

    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const handleClose = () => {
        setShow(false);
        clearErrors();
        reset();
        setSelectedAdmin(null); 
    };
    const handleShow = () => setShow(true);

    const { data, setData, post, processing, errors,clearErrors,reset } = useForm({
        nickname: "",
        email: "",
        password: "",
        password_confirmation: "",
        gender: "",
        position: "",
        intro: "",
        admin_id: "",
    });
    //manage admin list
    const [showAdminList, setShowAdminList] = useState(false); 
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    function handleSelectAdmin(admin) {
        setSelectedAdmin(admin); 
        setData('admin_id', admin.id); 
        setShowAdminList(false);
    }
    const filteredAdmins = admins.filter((admin) => admin.name.toLowerCase().includes(searchQuery));


    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('admin.createUser'), {
            onSuccess: () => {
                handleClose(); 
                reset();
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
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
                    <Modal.Title>Create User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formSubmit}>
                        <Input 
                            label="Nickname"
                            type="text"
                            name="nickname"
                            id="nickname"
                            value={data.nickname}/*store data */
                            onChange={(e) => setData('nickname', e.target.value)}/*update data */ 
                        />
                        {errors.nickname && <InfoMessage className="errorMessage" message={errors.nickname}/>}
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
                            <Option label="Unknown" value="" />
                            <Option label="Female" value="Female" />
                            <Option label="Male" value="Male" />
                        </Select>
                        {errors.gender && <InfoMessage className="errorMessage" message={errors.gender}/>}
                            
                        <Select
                            label="Role"
                            name="position"
                            id="position"
                            value={data.position}
                            onChange={(e) => {
                                setData('position', e.target.value); 
                                setSelectedPosition(e.target.value);
                            }}        
                        >
                            <Option label="Unknown" value="Unknown" />
                            <Option label="Student" value="Student" />
                            <Option label="Lecture" value="Lecture" />
                            <Option label="Staff" value="Staff" />
                            <Option label="Admin" value="Admin" disabled={currentAdminPosition==="Admin"} />
                            <Option label="Other" value="Other" />
                        </Select>
                        {errors.position && <InfoMessage className="errorMessage" message={errors.position}/>}
                            
                        <Input
                            label="Bio"
                            type="text"
                            name="intro"
                            id="intro"
                            value={data.intro}
                            onChange={(e) => setData('intro', e.target.value)}
                        />
                        {errors.intro && <InfoMessage className="errorMessage" message={errors.intro}/>}
                            
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
                        
                        { (currentAdminPosition==="Super Admin" && selectedPosition === "Admin" ) &&
                            <div>
                                <Input 
                                    label="Associate Admin"
                                    type="text"
                                    name="admin_id"
                                    id="admin_id"
                                    value={selectedAdmin ? selectedAdmin.name : "Not Selected"}
                                    disabled
                                />
                                {errors.admin_id && <InfoMessage className="errorMessage" message={errors.admin_id}/>}
                                <button type="button" onClick={() => setShowAdminList(true)} className="buttonStyle" >Select Admin</button>
                            </div>
                        }
                        <hr />
                        <Button name="Create" disabled={processing} />
                            
                    </form>

                </Modal.Body>
                
            </Modal>

            {/*Select Admin Modal*/}
            <Modal show={showAdminList} onHide={() => setShowAdminList(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Select Admin</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Input 
                        label="Searching..."
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                    {filteredAdmins.length === 0 ? (
                        <div className="box-style" style={{width:"460px"}}>
                        <h5 className='info-message'>No Admins</h5>
                        </div>
                    ) : (
                        filteredAdmins.map((admin) => {
                        const adminAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${admin.avatar}`;

                        return (
                            <div className="list-container" key={admin.id}>
                            <div className="box-style " style={{width:"470px"}}>
                                <div className="box-info-left">
                                <img src={adminAvatarUrl} className="avatarMedium" alt="Avatar" />
                                </div>
                                <div className="box-info-center">
                                <h5>{admin.name}</h5>
                                </div>
                                <div className="box-info-right">
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleSelectAdmin(admin)}
                                    >
                                    Select
                                    </button>
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

export default CreateUserModal;