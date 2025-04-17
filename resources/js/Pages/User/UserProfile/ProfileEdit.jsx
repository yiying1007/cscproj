import React,{useState} from 'react';
import { ProfileInput,Button,InfoMessage,ProfileSelect,Option } from "../../Components/FormComponent";
import { UserLayout } from "../../../../Layouts/ClientLayout";
import { Link,useForm,usePage } from "@inertiajs/react";

function ProfileEdit(){

    const { auth } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        nickname: auth.user.nickname,
        gender: auth.user.gender,
        intro: auth.user.intro,
    });
    

    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('user.profileEdit'));
    }
    
    return(
        <>
        <div className="profile-card">
            <h4>Profile Edit</h4>
            <hr />
            <form onSubmit={formSubmit}>
                    
                    <ProfileInput
                        label="Nickname"
                        type="text"
                        name="nickname"
                        id="nickname"
                        //placeholder={auth.user.nickname}
                        value={data.nickname}/*store data */
                        onChange={(e) => setData('nickname', e.target.value)}
                    />
                    {errors.nickname && <InfoMessage className="errorMessage" message={errors.nickname}/>}
                    <ProfileInput
                        label="Role"
                        type="text"
                        name="position"
                        id="position"
                        value={auth.user.position}
                        disabled
                    />
                    <ProfileSelect
                        label="Gender"
                        name="gender"
                        id="gender"
                        //placeholder={auth.user.nickname}
                        value={data.gender}/*store data */
                        onChange={(e) => setData('gender', e.target.value)}
                        
                    >
                        <Option label="Unknown" value="" />
                        <Option label="Female" value="Female" />
                        <Option label="Male" value="Male" />
                    </ProfileSelect>
                    {errors.gender && <InfoMessage className="errorMessage" message={errors.gender}/>}
                    
                    <ProfileInput
                        label="Bio"
                        type="text"
                        name="intro"
                        id="intro"
                        //placeholder={auth.user.nickname}
                        value={data.intro}/*store data */
                        onChange={(e) => setData('intro', e.target.value)}
                    />
                    {errors.intro && <InfoMessage className="errorMessage" message={errors.intro}/>}
                    
                    <hr />
                    <Button name="Edit" disabled={processing} />
                    
                </form>
        </div>
            </>

    );
}

export default ProfileEdit; 


