import { usePage, useForm } from "@inertiajs/react";
import Form from 'react-bootstrap/Form';
import { Button } from "react-bootstrap";
import { useState,useRef } from "react";
import Modal from 'react-bootstrap/Modal';
import { InfoMessage } from "../../Components/FormComponent";
import EmojiPicker from "emoji-picker-react";


function CreatePost({community=null}) {
    const { auth,postTypes=[] } = usePage().props;
    const userAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${auth.user.avatar}`;
    const [selectedEvent, setSelectedEvent] = useState("");
    const { data, setData, post,clearErrors, processing, errors, reset } = useForm({
        title: "",
        content: "",
        is_private: "Public",
        media_files: [],
        youtube_link: "",
        type_name:"",
        communities_id: community?.id || "",
        type_id: "",
        event_start_time:"",
        event_end_time:"",
    });
    
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const handleClose = () => {
        setShow(false),
        //empty file preview
        setPreviewFiles([]);
        //empty file error message
        setFileError("");
        //empty error message
        clearErrors();
        //empty input data
        reset();
    };
    const handleShow = () => setShow(true);

    // emoji
        const textAreaRef = useRef(null);
        const titleRef = useRef(null); 
        const [focusedField, setFocusedField] = useState("content"); 

        const [showPicker, setShowPicker] = useState(false); 
    
        // insert Emoji to Cursor Position
        const handleEmojiClick = (emojiObject) => {
            const emoji = emojiObject.emoji;
            
            let input = null;
            let currentValue = "";
            let setValue = () => {};
        
            if (focusedField === "title" && titleRef.current) {
                input = titleRef.current;
                currentValue = data.title;
                setValue = (val) => setData("title", val);
            } else if (textAreaRef.current) {
                input = textAreaRef.current;
                currentValue = data.content;
                setValue = (val) => setData("content", val);
            }
        
            if (!input) return;
        
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const newText = currentValue.substring(0, start) + emoji + currentValue.substring(end);
        
            setValue(newText);
        
            // reset cursor
            setTimeout(() => {
                input.selectionStart = input.selectionEnd = start + emoji.length;
                input.focus();
            }, 0);
        };
        
        
    //manage error message state
    const [fileError, setFileError] = useState("");
    const [youtubeError, setYoutubeError] = useState("");

    //manage file priview state
    const [previewFiles, setPreviewFiles] = useState([]); 

    //handle file 
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        //set file limit
        const maxSize = 20 * 1024 * 1024; 
        //set file type allow
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/webm", "video/mov", "video/avi", "audio/mpeg", "audio/wav"];
        let validFiles = [];
        let previews = [];
        let errorMessage = "";
        
        //validate and store file to array
        for (let file of files) {
            //show error message for bigger file
            if (file.size > maxSize) {
                errorMessage="File size not support bigger than 20MB!";
            }else if(!allowedTypes.includes(file.type)){
                errorMessage = "Only JPG, PNG, GIF image, MP3/MPEG/WAV audio and MP4, WEBM, MOV, AVI video are allowed";
            }else {
                validFiles.push(file);
                previews.push({
                    url: URL.createObjectURL(file),
                    type: file.type.startsWith("video") ? "video" 
                        : file.type.startsWith("audio") ? "audio" 
                        : "image",
                });
            }
        }
        setFileError(errorMessage);

        //store and show preveiw file
        if (validFiles.length > 0) {
            
            setData("media_files",validFiles); 
            setPreviewFiles(previews); 
            setYoutubeError("");
            setFileError("");
        }
    };
    //delete image preview
    const handleRemoveImage = (index) => {
        const updatedPreview = previewFiles.filter((_, i) => i !== index);
        const updatedFiles = data.media_files.filter((_, i) => i !== index);
        setPreviewFiles(updatedPreview);
        setData("media_files", updatedFiles);
    };

    //extract youtube video ID
    const extractYouTubeVideoId = (url) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };
    //handle link
    const handleYouTubeChange = (e) => {
        const url = e.target.value;
        setData("youtube_link", url);
        setYoutubeError("");
        //parse youtube video ID
        const videoId = extractYouTubeVideoId(url);
        if (videoId) {
            setPreviewFiles([{ url: `https://www.youtube.com/embed/${videoId}`, type: "youtube" }]);
        } else {
            setPreviewFiles([]);
            if (url.length > 0) {
                setYoutubeError("Invalid YouTube link!");
            }
        }
    };
    
    function formSubmit(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append("communities_id", data.communities_id);
        formData.append("title", data.title);
        formData.append("content", data.content);
        formData.append("is_private", data.is_private);
        formData.append("youtube_link", data.youtube_link);
        
        data.media_files.forEach(file => {
            formData.append("media_files[]", file);
        });

        post(route("user.createPost"), { 
            data: formData,
            onSuccess: () => {
                handleClose();
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
              },
         });
    }


    return (
        <>
        
        <div className="post-modal-btn">
            <img src={userAvatarUrl} className="avatarSmall"/>
            <input style={{width:"100%"}} className="inputSearch" placeholder="Post..." onClick={handleShow} />            
        </div>
        <div className="index-postbtn-container" onClick={handleShow}>
            <i className="bi bi-pencil-square" ></i>
        </div>
        
        <Modal backdrop="static" show={show} onHide={handleClose}>
            <Modal.Body>
                <div className="post-create-container">
                <div className="post-create-border">
                    <form onSubmit={formSubmit} encType="multipart/form-data">
                        <div className="post-create-header">
                            <h4>Create Post</h4>
                            <div className="actionStyle-userClient">
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                            <Button type="submit" disabled={processing}>Create</Button>
                            </div>
                        </div>
                        <div className="post-create-body">
                            <div className="post-title">
                                <input
                                    ref={titleRef}
                                    onFocus={() => setFocusedField("title")}
                                    className="post-input-style"
                                    type="text"
                                    placeholder="Title"
                                    value={data.title}
                                    onChange={(e) => setData("title", e.target.value)}
                                />
                                {errors.title && <p className="errorMessage">{errors.title}</p>}
                            </div>
                            <hr className="post-line" style={{ width: "100%" }} />
                            <div className="post-content">
                                <textarea
                                    ref={textAreaRef}
                                    onFocus={() => setFocusedField("content")}
                                    className="post-input-style"
                                    placeholder="Content"
                                    value={data.content}
                                    onChange={(e) => setData("content", e.target.value)}
                                />
                                {errors.content && <p className="errorMessage">{errors.content}</p>}
                            </div>

                            <div className="content-media">
                                {previewFiles.map((file, index) => (
                                    <div key={index}>
                                        {file.type === "video" ? (
                                            <div style={{position:"relative"}}>
                                            <video src={file.url} controls width="100%" />
                                            <button
                                                    className="actionbtn"
                                                    style={{position:"absolute",right:"0"}}
                                                    type="button" 
                                                    onClick={() => handleRemoveImage(index)}>
                                                    X
                                                </button>
                                            </div>
                                        ) : file.type === "youtube" ? (
                                            <iframe 
                                                src={file.url} 
                                                title="YouTube video" 
                                                allowFullScreen
                                                width="100%" 
                                                height="315"
                                            ></iframe>
                                        ):file.type === "audio" ? (
                                            <div className="audio-container" style={{display:"flex",alignItems:"center"}}>
                                                <audio src={file.url} controls></audio>
                                                <button
                                                    className="actionbtn"
                                                    
                                                    type="button" 
                                                    onClick={() => handleRemoveImage(index)}>
                                                    X
                                                </button>
                                            </div>
                                        ):(
                                            <div className="image-preview" style={{position:"relative"}}>
                                                <img className="image" src={file.url} alt="preview" style={{height:"200px"}}/>
                                                <button
                                                    className="actionbtn"
                                                    style={{position:"absolute",right:"0"}}
                                                    type="button" 
                                                    onClick={() => handleRemoveImage(index)}>
                                                    X
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div style={{display:'none'}}>
                                <input
                                    name="file"
                                    id="file"
                                    type="file"
                                    multiple
                                    accept="image/*,video/*,audio/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            {fileError && <p className="errorMessage">{fileError}</p>}
                            {errors.media_files && <p className="errorMessage">{errors.media_files}</p>}
                            {Object.keys(errors).map((key) => {
                            if (key.startsWith("media_files.")) {
                                return (
                                <p key={key} className="errorMessage">
                                    {errors[key]}
                                </p>
                                );
                            }
                            return null;
                            })}
                            {youtubeError && <p className="errorMessage">{youtubeError}</p>}
                            <hr />
                            <div className="actionStyle-userClient">
                                <i className='emoji-icon bx bxs-smile ' style={{fontSize:"20px"}} onClick={() => setShowPicker(!showPicker)}></i>
                                {/* show emoji picker */}
                                {showPicker && (
                                    <div className="post-emoji-picker" style={{position: "absolute",left:"0",top:"250px",marginLeft:"20px"}}>
                                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                                    </div>
                                )}
                                <button 
                                    className="uploadButton"
                                    type="button" 
                                    onClick={() => document.getElementById('file').click()}
                                >
                                    <i className='bx bx-upload'></i> Upload
                                </button>

                                <Form.Select
                                    style={{width:"20%"}}
                                    size="sm"
                                    value={data.is_private}
                                    onChange={(e) => setData("is_private", e.target.value)}
                                >
                                    <option value="Public">Public</option>
                                    <option value="Private">Private</option>
                                </Form.Select>

                                <Form.Select
                                    style={{ width: "25%" }}
                                    size="sm"
                                    value={data.type_id}
                                    onChange={(e) => {
                                        const selectedTypeId = e.target.value;
                                        setData("type_id", selectedTypeId);

                                        // handle type name
                                        const selectedType = postTypes.find(type => type.id == selectedTypeId);
                                        const typeName = selectedType ? selectedType.type_name : "";
                                        setData("type_name", typeName);
                                        setSelectedEvent(typeName);
                                        //
                                        setData("event_start_time", "");
                                        setData("event_end_time", "");
                                    }}
                                >
                                    <option value="">Type</option>
                                    {postTypes.length === 0 ? (
                                        <option value="">No post types</option>
                                    ) : (
                                        postTypes.map((type) => (
                                            <option key={type.id} value={type.id}>{type.type_name}</option>
                                        ))
                                    )}
                                </Form.Select>
                            </div>
                            {selectedEvent === "Event"  &&
                                <div style={{display:"flex",marginTop:"10px",gap:"10px"}} >
                                    <input  
                                        className="uploadButton"  
                                        style={{width:"auto"}}                     
                                        label="Event Start Time"
                                        type="datetime-local"
                                        name="event_start_time"
                                        id="event_start_time"
                                        value={data.event_start_time}/*store data */
                                        onChange={(e) => setData('event_start_time', e.target.value)}
                                    />
                                    
                                    <input  
                                        className="uploadButton"  
                                        style={{width:"auto"}}                     
                                        label="Event End Time"
                                        type="datetime-local"
                                        name="event_end_time"
                                        id="event_end_time"
                                        value={data.event_end_time}/*store data */
                                        onChange={(e) => setData('event_end_time', e.target.value)}
                                    />                                        
                                </div>
                            } 
                            {errors.event_start_time && <InfoMessage className="errorMessage" message={errors.event_start_time}/>}
                            {errors.event_end_time && <InfoMessage className="errorMessage" message={errors.event_end_time}/>}
                            <input
                                className="post-input-style"
                                style={{marginTop:"10px",marginBottom:"10px"}}
                                type="text"
                                placeholder="Paste YouTube Link..."
                                value={data.youtube_link}
                                onChange={handleYouTubeChange}
                            />
                            <span style={{fontSize:"12px"}}>*Only JPG, PNG, GIF image, MP3/MPEG/WAV audio and MP4, WEBM, MOV, AVI video are allowed</span>
                        </div>
                    </form>
                </div>
                </div>
            </Modal.Body>
        </Modal>
        </>
    );
}

export default CreatePost;
