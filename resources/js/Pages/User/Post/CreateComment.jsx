import { usePage, useForm } from "@inertiajs/react";
import EmojiPicker from "emoji-picker-react";
import { useState,useRef,useEffect } from "react";
import { Button } from "react-bootstrap";



function CreateComment({postDetail,comment=null}) {
    const { auth } = usePage().props;
    if (!postDetail) {
        console.error("CreateComment: post is undefined!");
        return null; 
    }
    const userAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${auth.user.avatar}`;
    const { data, setData, post: submitPost,clearErrors, processing, errors, reset } = useForm({
        content: "",
        targetUser_id: comment?.user_id || "",
        user_id: auth.user.id,
        post_id:postDetail.id,
        media_files: "",
    });
    
    // emoji
    const inputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const [showPicker, setShowPicker] = useState(false); 

    // insert Emoji to Cursor Position
    const handleEmojiClick = (emojiObject) => {
        console.log("Selected Emoji:", emojiObject);
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
        setShowPicker(false);
    };

    //click to close emoji box
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target) &&
                !event.target.classList.contains("emoji-icon") 
            ) {
                setShowPicker(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    function formSubmit(e) {
        e.preventDefault();
        submitPost(route("user.createComment"),{
            preserveScroll:true,
            onSuccess: () => {
                clearErrors();
                reset();
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            },
        });
    }

    

    return (
        <>
        <form onSubmit={formSubmit}>
        <div className="comment-border" style={{position:"relative"}}>
            
            <img src={userAvatarUrl} className="avatarSmall"/>
            <input 
                ref={inputRef}
                style={{width:"100%", margin:"0px"}} 
                className="inputSearch" 
                type="text"
                name="content"
                id="content"
                placeholder={comment === null ? "Comment..." : `Reply ${comment.nickname ? comment.nickname : comment.target_user?.nickname }` } 
                value={data.content}
                onChange={(e) => setData("content", e.target.value)}
            />
            <i className='emoji-icon bx bxs-smile ' 
                style={{fontSize:"20px"}} 
                onClick={(e) => {
                    e.stopPropagation();
                    setShowPicker(!showPicker);
                }}
            ></i>
            {/* show emoji picker */}
            {showPicker && (
                <div className="emoji-comment-box" ref={emojiPickerRef} >
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
            )}

            {errors.content && <p className="errorMessage">{errors.content}</p>}
            <Button type="submit" style={{height:"40px"}} >Submit</Button>   
        </div>
        </form>
        
        </>
    );
}

export default CreateComment;
