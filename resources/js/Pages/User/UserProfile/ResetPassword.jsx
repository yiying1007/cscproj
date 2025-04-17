import { ProfileInput,Button,InfoMessage } from "../../Components/FormComponent";
import { UserLayout } from "../../../../Layouts/ClientLayout";
import { useForm } from "@inertiajs/react";
import FlashMessage from "../../Components/MessageComponent";

function ResetPassword(){

    const { data, setData, post, processing, errors,clearErrors,reset } = useForm({
        password: "",
        newPassword: "",
        password_confirmation:"",
    });
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('user.resetPassword'),{
            preserveScroll:true,
            onSuccess: () =>{
                reset();
                clearErrors;
            },
        });
    }

    return(
        <div className="profile-card">
            <h4>Password Reset</h4>
            <hr />
            <form onSubmit={formSubmit}>
                <ProfileInput
                    label="Old Password"
                    type="password"
                    name="password"
                    id="password"
                    value={data.password}/*store data */
                    onChange={(e) => setData('password', e.target.value)}
                />
                {errors.password && <InfoMessage className="errorMessage" message={errors.password}/>}
                <ProfileInput
                    label="New Password"
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    value={data.newPassword}/*store data */
                    onChange={(e) => setData('newPassword', e.target.value)}
                />
                {errors.newPassword && <InfoMessage className="errorMessage" message={errors.newPassword}/>}
                <ProfileInput 
                    label="Confirm Password"
                    type="password"
                    name="password_confirmation"
                    id="password_confirmation"
                    value={data.password_confirmation}                        onChange={(e) => setData('password_confirmation', e.target.value)}
                />
                {errors.password_confirmation && <InfoMessage className="errorMessage" message={errors.password_confirmation}/>}
                <hr />
                <Button name="Reset" disabled={processing} />
            </form>
        </div>

    );
}

export default ResetPassword; 


