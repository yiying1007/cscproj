import { useForm,usePage } from '@inertiajs/react';
import Button from 'react-bootstrap/Button';
import { ProfileInput } from '../../Components/FormComponent';

function AboutUser(){
    const { user } = usePage().props;
    
    return(
        <div className='profile-card'>
            <h4>About User</h4>
            <hr />
            <ProfileInput label="Email" value={user.email || ""} disabled />
            <ProfileInput label="Role" value={user.position || ""} disabled />
        </div>
    );
}

export default AboutUser; 


