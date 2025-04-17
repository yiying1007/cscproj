import { Input,Button,InfoMessage } from "../Components/FormComponent";
import { UserLayout } from "../../../Layouts/GuestLayout";
import { useForm } from "@inertiajs/react";

function PasswordReset(){

    const { data, setData, post, processing, errors } = useForm({
        verifyCode: "",
        password: "",
        password_confirmation:"",
    });
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('user.passwordReset'));
    }

    return(
        <UserLayout>
            <div className="border-form">
                <h1 className="titleStyle">Password Reset</h1>
                <h1 className="titleStyle">Step 2</h1>
                <hr />
                <form onSubmit={formSubmit}>
                    <Input
                        label="Verification Code"
                        type="text"
                        name="verifyCode"
                        id="verifyCode"
                        value={data.verifyCode}/*store data */
                        onChange={(e) => setData('verifyCode', e.target.value)}
                    />
                    {errors.verifyCode && <InfoMessage className="errorMessage" message={errors.verifyCode}/>}
                    <Input
                        label="New Password"
                        type="password"
                        name="password"
                        id="password"
                        value={data.password}/*store data */
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    {errors.password && <InfoMessage className="errorMessage" message={errors.password}/>}
                    <Input 
                            label="Confirm Password"
                            type="password"
                            name="password_confirmation"
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                        {errors.password_confirmation && <InfoMessage className="errorMessage" message={errors.password_confirmation}/>}
                    <hr />
                    <Button name="Reset" disabled={processing} />
                    
                </form>
                
            </div>
        </UserLayout>

    );
}

export default PasswordReset; 


