import { Input,Button,InfoMessage } from "../Components/FormComponent";
import { UserLayout } from "../../../Layouts/GuestLayout";
import { Link,useForm } from "@inertiajs/react";


function Register(){

    const { data, setData, post, processing, errors } = useForm({
        nickname: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('user.register'));
    }


    return(
        <UserLayout>
            <div className="border-form">
                <h1 className="titleStyle">Register Account</h1>
                <hr />
                    
                <form onSubmit={formSubmit}>
                    <Input 
                        label="Nickname"
                        type="text"
                        name="nickname"
                        id="nickname"
                        value={data.nickname}/*store data */
                        onChange={(e) => setData('nickname', e.target.value)}/*update data */ 
                    />
                    {errors.nickname && <InfoMessage className="errorMessage" message={errors.nickname}/>}
                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        id="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    {errors.email && <InfoMessage className="errorMessage" message={errors.email}/>}                        <Input 
                        label="Password"
                        type="password"
                        name="password"
                        id="password"                            value={data.password}
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
                    <Button name="Register" disabled={processing}/>
                    <Link className="linkStyle" href={route('user.login')}>
                        Already Have Account? Login   
                    </Link>
                </form>                   
            </div>
        </UserLayout>
    );
}



export default Register;