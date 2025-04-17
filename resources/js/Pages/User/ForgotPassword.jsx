import { Input,Button,InfoMessage } from "../Components/FormComponent";
import { UserLayout } from "../../../Layouts/GuestLayout";
import { Link,useForm } from "@inertiajs/react";

function ForgotPassword(){

    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('user.forgotPassword'));
    }

    return(
        <UserLayout>
            <div className="border-form">
                <h1 className="titleStyle">Password Reset</h1>
                <h1 className="titleStyle">Step 1</h1>
                <hr />
                <form onSubmit={formSubmit}>
                    <Input
                        label="Enter your Email"
                        type="email"
                        name="email"
                        id="email"
                        value={data.email}/*store data */
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    {errors.email && <InfoMessage className="errorMessage" message={errors.email}/>}
                    
                    <hr />
                    <Button name="Continue" disabled={processing} />
                    
                </form>
                
            </div>
        </UserLayout>

    );
}

export default ForgotPassword; 


