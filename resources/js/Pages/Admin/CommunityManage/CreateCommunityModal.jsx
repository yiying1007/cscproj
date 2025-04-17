import { useForm } from "@inertiajs/react";
import { Input,Button,Select,Option,InfoMessage,TextArea } from "../../Components/FormComponent";
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';

function CreateCommunityModal({users}){
    const [show, setShow] = useState(false);
    const [showUserList, setShowUserList] = useState(false); 
    const [selectedLeader, setSelectedLeader] = useState(null);
    //const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const handleClose = () => {
        setShow(false);
        setSelectedLeader(null);
        reset();
        clearErrors();
    };
    const handleShow = () => setShow(true);

    const { data, setData, post, processing, errors,reset,clearErrors } = useForm({
        name: "",
        description: "",
        type: "",
        created_by:"",
        is_private: "",
    });
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('admin.createCommunity'), {
            onSuccess: () => {
              handleClose(); 
              reset();
            },
          });
    }
    const handleSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };
    

    function handleSelectUser(user) {
        setSelectedLeader(user); 
        setData('created_by', user.id); 
        setShowUserList(false);
    }
    const filteredUsers = users.filter((user) => user.nickname.toLowerCase().includes(searchQuery) ||
    user.position.toLowerCase().includes(searchQuery));

    return(
        <div>
            <button className="btn btn-primary btn-sm" onClick={handleShow}>
                Create
            </button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Community</Modal.Title>
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
                        <TextArea
                            label="Description"
                            type="text"
                            name="description"
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        {errors.description && <InfoMessage className="errorMessage" message={errors.description}/>}

                        <Select
                            label="Type"
                            name="type"
                            id="type"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}     
                        >
                            <Option label="Select" value="Select" />
                            <Option label="Official" value="Official" />
                            <Option label="Club" value="Club" />
                            <Option label="Normal" value="Normal" />
                        </Select>
                        {errors.type && <InfoMessage className="errorMessage" message={errors.type}/>}
                            
                        <Select
                            label="Visibility"
                            name="is_private"
                            id="is_private"
                            value={data.is_private}
                            onChange={(e) => setData('is_private', e.target.value)}        
                        >
                            <Option label="Select" value="Select" />
                            <Option label="Public" value="Public" />
                            <Option label="Private" value="Private" />
                        </Select>
                        {errors.is_private && <InfoMessage className="errorMessage" message={errors.is_private}/>}
                        
                        <Input 
                            label="Community Leader"
                            type="text"
                            name="created_by"
                            id="created_by"
                            value={selectedLeader ? selectedLeader.nickname : "Not Selected"}
                            disabled
                        />
                        {errors.created_by && <InfoMessage className="errorMessage" message={errors.created_by}/>}
                        <button type="button" onClick={() => setShowUserList(true)} className="buttonStyle" >Select User</button>

                        <hr />
                        <Button name="Create" disabled={processing} />
                            
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
                            <div className="box-style " style={{width:"470px"}}>
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






export default CreateCommunityModal;