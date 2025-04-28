import { useForm,usePage } from "@inertiajs/react";
import { Input,Button,Select,Option,InfoMessage } from "../../Components/FormComponent";
//import MyModal from "../Components/Modal";
import { useState,useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';

function EditUserModal({user,allAdmins}){
    const {auth,admins} = usePage().props;
    const currentAdminPosition=auth.admin.position;
    //handle position state 
    const [selectedPosition, setSelectedPosition] = useState(user.position ||"");
    //handle 
    const [selectedStatus, setSelectedStatus] = useState(user.acc_status);

    useEffect(() => {
        if (selectedPosition !== "Admin") {
            setData('admin_id', "");
            setSelectedAdmin(null);
        }
    }, [selectedPosition]);

    useEffect(() => {
        if (selectedStatus !== "Block") {
            setData('blockReason', '');
            setData('acc_block_until', '');
        }else if(selectedStatus !== "Inactive"){
            setData('blockReason', '');
        }
    }, [selectedStatus]);
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const handleClose = () => {
        setShow(false);
        reset();
        clearErrors();
        setData({
            nickname: user.nickname || "",
            email: user.email || "",
            password: "",
            gender: user.gender || "",
            position: user.position || "Unknown",
            intro: user.intro || "",
            admin_id:user.admin_id || "",
            acc_status: user.acc_status,
            blockReason:"",
            acc_block_until:user.acc_block_until || "",
        });
    };
    const handleShow = () => setShow(true);

    
    const { data, setData, post, processing, errors,clearErrors,reset } = useForm({
        nickname: user.nickname || "",
        email: user.email || "",
        password: "",
        gender: user.gender || "",
        position: user.position || "Unknown",
        intro: user.intro || "",
        admin_id:user.admin_id || "",
        acc_status: user.acc_status,
        blockReason:"",
        acc_block_until:user.acc_block_until || "",
    });

    //manage admin list
    const [showAdminList, setShowAdminList] = useState(false); 
    const defaultAdmin = Array.isArray(allAdmins) 
    ? allAdmins.find(admin => String(admin.id) === String(user.admin_id)) 
    : null;
    const [selectedAdmin, setSelectedAdmin] = useState(defaultAdmin);
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
        post(route('admin.editUser',user.id), {
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
            <button className="btn btn-success btn-sm" onClick={handleShow} disabled={currentAdminPosition==="Admin" && user.position==="Admin"} >
                Edit
            </button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formSubmit}>
                        
                        <Input
                            label="Nickname"
                            type="text"
                            name="nickname"
                            id="nickname"
                            value={data.nickname || ""}
                            onChange={(e) => setData('nickname', e.target.value)}
                        />
                        {errors.nickname && <InfoMessage className="errorMessage" message={errors.nickname}/>}
                        
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
                            value={data.gender || ""}/*store data */
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
                            value={data.position || ""}
                            onChange={(e) => {
                                setData('position', e.target.value); 
                                setSelectedPosition(e.target.value);
                            }}
                        >
                            <Option label="Unknown" value="" />
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
                            value={data.intro || ""}/*store data */
                            onChange={(e) => setData('intro', e.target.value)}
                        />
                        {errors.intro && <InfoMessage className="errorMessage" message={errors.intro}/>}
                        
                        <Select
                            label="Status"
                            name="acc_status"
                            id="acc_status"
                            value={data.acc_status}/*store data */
                            onChange={(e) => {
                                setData('acc_status', e.target.value); 
                                setSelectedStatus(e.target.value);
                            }}
                        >
                            <Option label="Active" value="Active" />
                            <Option label="Block" value="Block" />
                            <Option label="Inactive" value="Inactive" />
                        </Select>
                        {errors.acc_status && <InfoMessage className="errorMessage" message={errors.acc_status}/>}
                        { (selectedStatus === "Block") &&
                            <div>
                                <Input
                                    label="Reason"
                                    type="text"
                                    name="blockReason"
                                    id="blockReason"
                                    value={data.blockReason}/*store data */
                                    onChange={(e) => setData('blockReason', e.target.value)}
                                />
                                {errors.blockReason && <InfoMessage className="errorMessage" message={errors.blockReason}/>}

                                <Input                            
                                    label="Block User Account"
                                    type="datetime-local"
                                    name="acc_block_until"
                                    id="acc_block_until"
                                    value={data.acc_block_until}/*store data */
                                    onChange={(e) => setData('acc_block_until', e.target.value)}
                                />
                                {errors.acc_block_until && <InfoMessage className="errorMessage" message={errors.acc_block_until}/>}
                            </div>
                        }
                        { (selectedStatus === "Inactive") &&
                            <div>
                                <Input
                                    label="Reason"
                                    type="text"
                                    name="blockReason"
                                    id="blockReason"
                                    value={data.blockReason}/*store data */
                                    onChange={(e) => setData('blockReason', e.target.value)}
                                />
                                {errors.blockReason && <InfoMessage className="errorMessage" message={errors.blockReason}/>}
                            </div>
                        }
                        { (currentAdminPosition==="Super Admin" && selectedPosition === "Admin") &&
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
                        <Button name="Edit" disabled={processing} />
                                
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

export default EditUserModal;