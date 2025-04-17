import { Input,Button,InfoMessage } from "../Components/FormComponent";
import { AdminLayout } from "../../../Layouts/GuestLayout";
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
        post(route('admin.login'));
    }

    return(
        <AdminLayout>
            <div className="border-form">
                <h1 className="titleStyle">Login Form</h1>
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
                    <hr />
                    <Button name="Login" disabled={processing} />
                    
                </form>
                
            </div>
        </AdminLayout>

    );
}

export default Login; 


