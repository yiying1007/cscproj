import { useState,useRef } from "react";
import { usePage,useForm } from "@inertiajs/react";
import { Input,Button } from "./FormComponent";

function AvatarUpload() {
    const { auth } = usePage().props;
    const { setData, post, processing, errors } = useForm({
        avatar: auth.user.avatar,
    });
    const [avatarPreview, setAvatarPreview] = useState(auth.user.avatar ? `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${auth.user.avatar}` : 'https://fypcscproject.s3.ap-southeast-1.amazonaws.com/defaultAvatar.png');

    // 处理头像文件上传和预览
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('avatar', file); // 更新 avatar 字段的值为文件对象
            setAvatarPreview(URL.createObjectURL(file)); // 预览上传的文件
        }
    };
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('user.avatarEdit'));
    }

    return (
        <form onSubmit={formSubmit}>
        <div>
            <img 
                src={avatarPreview} 
                alt="Your Avatar" 
                style={{ width: "100px", height: "100px",justifySelf:"center" }}
            />
            <div style={{display:'none'}}>
                <Input 
                    type="file" 
                    id="avatar" 
                    name="avatar" 
                    onChange={handleAvatarChange}
                />
            </div>
            <button className="buttonStyle" type="button" onClick={() => document.getElementById('avatar').click()}>Upload Avatar</button>
            <Button name="Save Avatar" disabled={processing} onClick={formSubmit} />
        </div>
        </form>
    );
}

export default AvatarUpload;
