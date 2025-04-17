import { useForm,usePage } from "@inertiajs/react";
import { Input,Button,Select,Option,InfoMessage } from "../../Components/FormComponent";
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

function EditUserIdentityModal({identity,allUsers,users}){
    const {auth} = usePage().props;
    const currentAdminPosition=auth.admin.position;
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const handleClose = () => {
        setSelectedUser(allUsers.find(user => user.id === identity.user_id) || null);
        setShow(false);
        reset();
        clearErrors();
    };
    const handleShow = () => setShow(true);

    
    const { data, setData, post, processing, errors,reset,clearErrors } = useForm({
        name: identity.name || "",
        email: identity.email || "",
        role: identity.role || "",
        faculty: identity.faculty || "",
        course: identity.course || "",
        user_id: identity.user_id || "",
    });
    
    //select user 
    const [showUserList, setShowUserList] = useState(false); 
    const defaultUser = Array.isArray(allUsers) 
    ? allUsers.find(user => String(user.id) === String(identity.user_id)) 
    : null;

    const [selectedUser, setSelectedUser] = useState(defaultUser);
    const [searchQuery, setSearchQuery] = useState("");
    const handleSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };
    function handleSelectUser(user) {
        setSelectedUser(user); 
        setData('user_id', user.id); 
        setShowUserList(false);
    }
    const filteredUsers = users.filter((user) => user.nickname.toLowerCase().includes(searchQuery) ||
    user.position.toLowerCase().includes(searchQuery));
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('admin.editUserIdentity',identity.id), {
            onSuccess: () => {
                handleClose(); // close modal
            },
          });
    }
    
    
    return(
        <div>
            <button className="btn btn-success btn-sm" onClick={handleShow} disabled={currentAdminPosition==="Admin" && identity.role==="Admin"}>
                Edit
            </button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit User Identity</Modal.Title>
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
                           
                        <Select
                            label="Role"
                            name="role"
                            id="role"
                            value={data.role || ""}
                            onChange={(e) => setData('role', e.target.value)}
                        >
                            <Option label="Select" value="" />
                            <Option label="Student" value="Student" />
                            <Option label="Lecture" value="Lecture" />
                            <Option label="Staff" value="Staff" />
                            <Option label="Admin" value="Admin" />
                            <Option label="Other" value="Other" />
                        </Select>
                        {errors.role && <InfoMessage className="errorMessage" message={errors.role}/>}
                          
                        <Select
                            label="Faculty"
                            name="faculty"
                            id="faculty"
                            value={data.faculty}
                            onChange={(e) => setData('faculty', e.target.value)}        
                        >
                            <Option label="Select" value="" />
                            <Option label="School of Business and Accountancy" value="School of Business and Accountancy" />
                            <Option label="School of Education and Languages" value="School of Education and Languages" />
                            <Option label="School of American Degree Program" value="School of American Degree Program" />
                            <Option label="School of Engineering, Information Technology and Allied Health Sciences" value="School of Engineering, Information Technology and Allied Health Sciences" />
                            <Option label="School of Hospitality & Tourism" value="School of Hospitality & Tourism" />
                            <Option label="Other" value="other" />
                        </Select>
                        {errors.faculty && <InfoMessage className="errorMessage" message={errors.faculty}/>}
                         
                        <Select
                            label="Course"
                            name="course"
                            id="course"
                            value={data.course}
                            onChange={(e) => setData('course', e.target.value)}        
                        >
                            <Option label="Select" value="" />
                            <Option label="Accounting & Finance" value="Accounting & Finance" />
                            <Option label="Allied Health Science" value="Allied Health Science" />
                            <Option label="Business" value="Business" />
                            <Option label="Education" value="Education" />
                            <Option label="Engineering" value="Engineering" />
                            <Option label="Hospitality & Tourism" value="Hospitality & Tourism" />
                            <Option label="Information Technology" value="Information Technology" />
                            <Option label="Postgraduate Studies" value="Postgraduate Studies" />
                            <Option label="Psychology" value="Psychology" />
                        </Select>
                        {errors.course && <InfoMessage className="errorMessage" message={errors.course}/>}
                         
                        <Input 
                            label="User Name"
                            type="text"
                            name="user_id"
                            id="user_id"
                            value={selectedUser ? selectedUser.nickname : "Not Selected"}
                            disabled
                        />
                        {errors.user_id && <InfoMessage className="errorMessage" message={errors.user_id}/>}
                        <button type="button" onClick={() => setShowUserList(true)} className="buttonStyle" >Select User</button>
                        
                        <hr />
                        <Button name="Edit" disabled={processing} />
                    </form>
                </Modal.Body>
            </Modal>

            <Modal show={showUserList} onHide={() => setShowUserList(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Select User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Input 
                        label="Searching..."
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                    {filteredUsers.length === 0 ? (
                        <div className="box-style" style={{width:"460px"}}>
                        <h5 className='info-message'>No Users</h5>
                        </div>
                    ) : (
                        filteredUsers.map((user) => {
                        const userAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${user.avatar}`;

                        return (
                            <div className="list-container" key={user.id}>
                            <div className="box-style " style={{width:"470px"}} >
                                <div className="box-info-left">
                                <img src={userAvatarUrl} className="avatarMedium" alt="Avatar" />
                                </div>
                                <div className="box-info-center">
                                <h5>{user.nickname}</h5>
                                <p>{user.position}</p>
                                </div>
                                <div className="box-info-right">
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleSelectUser(user)}
                                        disabled={currentAdminPosition==="Admin" && user.position==="Admin"}
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

export default EditUserIdentityModal;