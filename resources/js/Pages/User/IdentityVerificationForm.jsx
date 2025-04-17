import {useEffect} from 'react';
import { Input,Button,InfoMessage,Select,Option } from "../Components/FormComponent";
import { UserLayout } from "../../../Layouts/ClientLayout";
import { useForm,usePage } from "@inertiajs/react";

function IdentityVerification(){

    //const { auth } = usePage().props;
    const { data, setData, post, processing, errors,clearErrors,reset } = useForm({
            email: "",
            verifyCode: "",
        });
        
        const sendCode = () => {
            post(route('user.generateVerifyCode'));
        };

        function buttonSubmit(e){
            //prevent auto refresh when click submit
            e.preventDefault();
            //localStorage.setItem("user_email", data.email);
            //use inertia js--useForm--post submit data
            post(route('user.generateVerifyCode')/*, {
                onSuccess: () => {
                    setData("email", localStorage.getItem("user_email")); 
                },
            }*/);
        }
        /*
        useEffect(() => {
            setData("email", localStorage.getItem("user_email") || "");
        }, [usePage().props]);
        */
        function formSubmit(e){
            //prevent auto refresh when click submit
            e.preventDefault();
            //use inertia js--useForm--post submit data
            post(route('user.identityAuthentication'));
        }
    
    const { identity_verifications: verifyCard } = usePage().props;
    //if user verified,show the verify card
    if (verifyCard) {
        return(
            <UserLayout>
                <div className='form-container'>
                <div className="border-form">
                    <h1 className="titleStyle">Personal Verification Card</h1>
                    <hr />
                    <h6>Name : {verifyCard.name}</h6>
                    <h6>Email : {verifyCard.email}</h6>
                    <h6>Role : {verifyCard.role}</h6>
                    <h6>Faculty : {verifyCard.faculty}</h6>
                    <h6>Course : {verifyCard.course}</h6>
                      
                </div>
                </div>
            </UserLayout>
            
    
        );
    }
    //else show verification form
    return(
        <UserLayout>
            <div className='form-container'>
            <div className="border-form">
                <h1 className="titleStyle">Identity Verification</h1>
                <hr />
                <form>
                    
                    <div className="sectionForm">
                        <label className="formLabel">SEGi Email</label>
                        <div className='actionStyle-userClient'>
                            <input className="formInput" type="email" name="email" id="email" onChange={(e) => setData('email', e.target.value)} />
                            <button className='btnCode' disabled={processing} onClick={sendCode}>Send Code</button>
                        </div>
                        {errors.email && <InfoMessage className="errorMessage" message={errors.email}/>}
                    </div>
                    <Input
                        label="Verification Code"
                        type="text"
                        name="verifyCode"
                        id="verifyCode"
                        value={data.verifyCode}/*store data */
                        onChange={(e) => setData('verifyCode', e.target.value)}
                    />
                    {errors.verifyCode && <InfoMessage className="errorMessage" message={errors.verifyCode}/>}

                    <hr />
                    
                    <Button name="Verify" disabled={processing} onClick={formSubmit} />
                    
                </form>
            </div>    
            </div>
        </UserLayout>
        

    );
}

export default IdentityVerification; 


