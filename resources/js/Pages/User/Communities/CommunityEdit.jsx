import React from 'react';
import { ProfileInput,Button,InfoMessage,ProfileSelect,Option,ProfileTextArea } from "../../Components/FormComponent";
import { useForm,usePage } from "@inertiajs/react";

function CommunityEdit({community}){

    const { auth } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        name: community.name || "",
        description: community.description || "",
        type: community.type || "",
        is_private: community.is_private || "",
    });
    
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('user.editCommunity',community.id));
    }
    
    return(
        <div className="profile-card">
            <h4 >Community Edit</h4>
            <hr />
            <form onSubmit={formSubmit}>
                <ProfileInput 
                    label="Name"
                    type="text"
                    name="name"
                    id="name"
                    value={data.name || ""}/*store data */
                    onChange={(e) => setData('name', e.target.value)}/*update data */ 
                />
                {errors.name && <InfoMessage className="errorMessage" message={errors.name}/>}
                <ProfileTextArea
                    label="Description"
                    type="text"
                    name="description"
                    id="description"
                    value={data.description || ""}
                    onChange={(e) => setData('description', e.target.value)}
                />
                {errors.description && <InfoMessage className="errorMessage" message={errors.description}/>}
                <ProfileSelect
                    label="Type"
                    name="type"
                    id="type"
                    value={data.type || "Normal"}
                    onChange={(e) => setData('type', e.target.value)}     
                >
                    <Option label="Official" value="Official" disabled={auth.user.position != "Admin"}/>
                    <Option label="Club" value="Club" disabled={auth.user.position === "Student"} />
                    <Option label="Normal" value="Normal" />
                </ProfileSelect>
                {errors.type && <InfoMessage className="errorMessage" message={errors.type}/>}       
                <ProfileSelect
                    label="Visibility"
                    name="is_private"
                    id="is_private"
                    value={data.is_private || ""}
                    onChange={(e) => setData('is_private', e.target.value)}        
                >
                    <Option label="Public" value="Public" />
                    <Option label="Private" value="Private" />
                </ProfileSelect>
                {errors.is_private && <InfoMessage className="errorMessage" message={errors.is_private}/>}   
                <hr />
                <Button name="Edit" disabled={processing} />
                        
            </form>
        </div>    
    );
}

export default CommunityEdit; 


