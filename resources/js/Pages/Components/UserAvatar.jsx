import { usePage,Link } from "@inertiajs/react";

function Avatar() {
    const { auth } = usePage().props;
    const userAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${auth.user.avatar}`;

    return (
        <div className="avatar-dropdown">
            <div>
                <img 
                    src={userAvatarUrl} 
                    className="avatarHeader"
                />
                
            </div>
            <div className="avatar-dropdown-content">
                <div style={{display:"grid",margin:"10px"}}>
                <Link className="dropdownLink" href={route('user.profile')}>
                    Profile
                </Link>
                <Link className="dropdownLink" href={route('user.logout')}>
                    Logout
                </Link>
                </div>
            </div>
            
        </div>
    );
}

export default Avatar;
