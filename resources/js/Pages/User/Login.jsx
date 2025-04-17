import { Input,Button,InfoMessage } from "../Components/FormComponent";
import { UserLayout } from "../../../Layouts/GuestLayout";
import { Link,useForm } from "@inertiajs/react";

function Login(){

    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
    });
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        post(route('user.login'));
    }

    return(
        <UserLayout>
            <div className="border-form">
                <h1 className="titleStyle">Login Account</h1>
                <hr />
                <form onSubmit={formSubmit}>
                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        id="email"
                        value={data.email}/*store data */
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    {errors.email && <InfoMessage className="errorMessage" message={errors.email}/>}

                    <Input 
                        label="Password"
                        type="password"
                        name="password"
                        id="password"
                        value={data.password}/*store data */
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    {errors.password && <InfoMessage className="errorMessage" message={errors.password}/>}
                    <Link className="linkStyle" style={{ display: "block",textAlign: "right" }} href={route('user.forgotPassword')}>
                        Forgot Password? 
                    </Link>
                    <hr />
                    <Button name="Login" disabled={processing} />
                    <Link className="linkStyle" href={route('user.register')}>
                        No Account ? Register Now
                    </Link>
                </form>
                
            </div>
        </UserLayout>

    );
}

export default Login; 


