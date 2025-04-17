import { usePage, useForm } from "@inertiajs/react";
import { useState } from "react";

function LikePost({ p }) {
    //const { auth,isLiked,likeCount } = usePage().props;
    const { post:sendPost, processing } = useForm();

    // 确保 post.isLiked 存在，避免 undefined 报错
    const [like, setLike] = useState(isLiked || false);

    // 处理点赞/取消点赞
    const handleLike = () => {
        sendPost(route("user.likePost", post.id), {
            onSuccess: (res) => {
                if (res?.props?.isLiked !== undefined) {
                    setLike(res.props.isLiked);
                }
            },
        });
    };
    
    return (
        <div style={{ cursor: "pointer", display: "flex", alignItems: "center" }} onClick={handleLike}>
            {like ? (
                <i className="interactive-icon bx bxs-like" style={{ color: "#fa9501" }}> {likeCount}</i>
            ) : (
                <i className="interactive-icon bx bxs-like"> {likeCount}</i>
            )}
        </div>
    );
}

export default LikePost;
