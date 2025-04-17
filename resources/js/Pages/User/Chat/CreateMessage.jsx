import { usePage, useForm } from "@inertiajs/react";
import EmojiPicker from "emoji-picker-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "react-bootstrap";

function CreateMessage({ chat,targetUser }) {
    const { auth } = usePage().props;
    const { data, setData, post: submitPost, clearErrors, processing, errors, reset } = useForm({
        content: "",
        chat_id: chat,
        sender_id: auth.user.id,
        media_files: null,
        targetUserId: targetUser,
    });
    // emoji
    const inputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const [showPicker, setShowPicker] = useState(false);

    // insert Emoji to Cursor Position
    const handleEmojiClick = (emojiObject) => {
        if (!inputRef.current) return;

        const input = inputRef.current;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const textBefore = data.content.substring(0, start);
        const textAfter = data.content.substring(end);

        // insert emoji at cursor position
        const newText = textBefore + emojiObject.emoji + textAfter;
        setData("content", newText);

        // reset cursor position
        setTimeout(() => {
            input.selectionStart = input.selectionEnd = start + emojiObject.emoji.length;
            input.focus();
        }, 0);
    };

    //click to close emoji box
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target) &&
                event.target.className !== "emoji-icon"
            ) {
                setShowPicker(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    //manage error message state
    const [fileError, setFileError] = useState("");

    //manage file preview state
    const [previewFile, setPreviewFile] = useState(null);

    //handle file upload (限制一个文件)
    const handleFileChange = (e) => {
        const file = e.target.files[0]; // 只取第一个文件
        if (!file) return;

        //set file limit
        const maxSize = 100 * 1024 * 1024;
        //set file type allow
        const allowedTypes = [
            "image/jpeg", "image/png", "image/gif",
            "video/mp4", "video/webm", "video/mov", "video/avi",
            "audio/mpeg", "audio/wav",
            "application/pdf", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ];

        if (file.size > maxSize) {
            setFileError("File size not supported! Max 20MB.");
            return;
        } else if (!allowedTypes.includes(file.type)) {
            setFileError("Invalid file type! Only images, videos, audio, PDFs, and docs are allowed.");
            return;
        }

        setFileError("");
        setData("media_files", file); // 存储单个文件
        setPreviewFile({
            url: URL.createObjectURL(file),
            type: file.type.startsWith("video") ? "video"
                : file.type.startsWith("audio") ? "audio"
                : file.type.startsWith("application") ? "document"
                : "image",
        });
    };

    // delete file preview
    const handleRemoveFile = () => {
        setPreviewFile(null);
        setData("media_files", null);
    };

    function formSubmit(e) {
        e.preventDefault();
        const formData = new FormData();
        if (data.media_files) {
            formData.append("media_files", data.media_files);
        }
        submitPost(route("user.sendMessage"), {
            preserveScroll: true,
            onSuccess: () => {
                clearErrors();
                reset();
                setPreviewFile(null);
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            },
        });
    }

    return (
        <form onSubmit={formSubmit} style={{ width: "100%" }}>
            <div className="message-sent-border" style={{ position: "relative" }}>
                <input
                    ref={inputRef}
                    className="msg-input"
                    type="text"
                    name="content"
                    id="content"
                    value={data.content}
                    onChange={(e) => setData("content", e.target.value)}
                />
                <i className='emoji-icon bx bxs-smile'
                    style={{ fontSize: "20px" }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowPicker(!showPicker);
                    }}>
                </i>
                {/* show emoji picker */}
                {showPicker && (
                    <div className="emoji-msg-box" ref={emojiPickerRef}>
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                )}

                {errors.content && <p className="errorMessage">{errors.content}</p>}

                {/* 文件预览 */}
                {previewFile && (
                    <div className="media-preview-box">
                        <div>
                            {previewFile.type === "video" ? (
                                <div className="message-media-preview">
                                    <video src={previewFile.url} controls   />
                                    <button
                                        className="actionbtn"
                                        style={{ position: "absolute", left: "0"}}
                                        type="button"
                                        onClick={handleRemoveFile}>
                                        X
                                    </button>
                                </div>
                            ) : previewFile.type === "audio" ? (
                                <div className="audio-container" style={{ display: "flex", alignItems: "center" }}>
                                    <audio src={previewFile.url} controls></audio>
                                    <button className="actionbtn" type="button" onClick={handleRemoveFile}>X</button>
                                </div>
                            ) : previewFile.type === "document" ? (
                                <div className="document-preview">
                                    <p>{data.media_files?.name}</p>
                                    <button className="actionbtn" type="button" onClick={handleRemoveFile}>X</button>
                                </div>
                            ) : (
                                <div className="message-media-preview">
                                    <img className="image" src={previewFile.url} alt="preview" style={{ height: "200px" }} />
                                    <button 
                                        className="actionbtn" 
                                        type="button" 
                                        onClick={handleRemoveFile}
                                        style={{ position: "absolute", left: "0"}}
                                    >X</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                

                <input
                    name="file"
                    id="file"
                    type="file"
                    accept="image/*,video/*,audio/*,application/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />
                {fileError && <p className="errorMessage">{fileError}</p>}
                
                <div className="actionStyle-userClient">
                    <i onClick={() => document.getElementById('file').click()} className='chat-icon bi bi-paperclip'></i> 
                    
                    <Button type="submit" style={{ height: "40px" }}>Submit</Button>
                </div>
            </div>
        </form>
    );
}

export default CreateMessage;
