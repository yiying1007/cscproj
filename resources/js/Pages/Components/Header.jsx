import { usePage,Link } from "@inertiajs/react";
import Notice from "./Notice";
import Avatar from "./UserAvatar";
import { useEffect,useState } from "react";



function GuestHeader(){
    return(
        <header className="client-header-color">
            <div className="header-container">
                <div className="header-left">
                    <Link className="headerLink" style={{display:"flex",alignItems:"end"}} href={route('user.welcome')}>
                        <img src="https://fypcscproject.s3.ap-southeast-1.amazonaws.com/otherImage/logosegi.png" style={{width:"40px"}} />
                        <h5>SEGiSpace</h5>
                    </Link>
                </div>
                
                <div className="header-right">
                    <Link className="headerLink" href={route('user.login')}>
                        Login
                    </Link>
                    <Link className="headerLink" href={route('user.register')}>
                        Register
                    </Link>
                </div>
            </div>
        </header>
    );
}

function GuestBottom(){
    return(
        <header className="client-header-color">
                    <Link className="headerLink" style={{display:"flex",alignItems:"end"}} href={route('admin.login')}>
                        <img src="https://fypcscproject.s3.ap-southeast-1.amazonaws.com/otherImage/logosegi.png" style={{width:"40px"}} />
                        <h6>SEGiSpace Admin panel</h6>
                    </Link>
                
        </header>
    );
}

function AdminGuestHeader(){
    return(
        <header className="client-header-color">
            <div className="header-container">
                <div className="header-left" style={{display:"flex",alignItems:"end"}}>
                    <img src="https://fypcscproject.s3.ap-southeast-1.amazonaws.com/otherImage/logosegi.png" style={{width:"40px"}} />
                    <h5> SEGiSpace</h5>
                </div>
            </div>
        </header>
    );
}
function AdminHeader(){
    return(
        <header className="client-header-color">
            <div className="header-container">
                <div className="header-left" style={{display:"flex",alignItems:"end"}}>
                    <img src="https://fypcscproject.s3.ap-southeast-1.amazonaws.com/otherImage/logosegi.png" style={{width:"40px"}} />
                    <h5>SEGiSpace</h5>
                </div>
                <div className="header-right">
                    <Link className="headerLink" href={route('admin.logout')} >
                        Logout
                    </Link>
                </div>
            </div>
        </header>
    );
}

function UserHeader(){
    //const { unreadMessage = [], notifications = [] } = usePage().props;
    const [unreadMessage, setUnreadMessage] = useState([]);
    const [show, setShow] = useState(false);
    const { auth } = usePage().props;
    // Fetch notifications every 5 seconds
    useEffect(() => {
        const fetchMessage = () => {
            fetch('/User/api/UnreadMessageNotice')
                .then((response) => response.json())
                .then((data) => {
                    setUnreadMessage(data.unreadMessage || []);
                })
                .catch((error) => console.error("Error fetching message:", error));
        };
        
        fetchMessage();
        const interval = setInterval(fetchMessage, 5000); 
        return () => clearInterval(interval);
    }, []);


    return(
        <header className="tabletLaptopnHeader client-header-color">
            <div className="header-container">
                <div className="header-left">
                <Link className="headerLink" style={{display:"flex",alignItems:"end"}} href={route('user.index')}>
                    <img src="https://fypcscproject.s3.ap-southeast-1.amazonaws.com/otherImage/logosegi.png" style={{width:"40px"}} />
                    <h5>SEGiSpace</h5>
                </Link>
                </div>
                <div className="header-right">
                    <div className="iconStyle">
                        <Link href={route('user.search')} >
                            <i className='headerLink bx bx-search bx-sm'></i>
                        </Link>
                    </div>
                    <div className="iconStyle" style={{position:"relative"}}>
                        <Link href={route('user.chat')} >
                            <i className='headerLink bx bxs-chat'></i>
                        </Link>
                        {unreadMessage && unreadMessage.length > 0 && (
                            <span className="badge">{unreadMessage.length}</span>
                        )}
                    </div>
                    <div className="iconStyle">
                        <Link href={route('user.communities')}  >
                            <i className='headerLink fa fa-group' style={{display:"flex",justifyContent:"center",lineHeight:"33px"}}></i>
                        </Link>
                    </div>
                    <div className="iconStyle">
                        <Link href={route('user.userList')} >
                            <i className='headerLink bx bxs-group bx-sm'></i>
                        </Link>
                    </div>
                    <div className="iconStyle">
                        <Notice />
                    </div>
                    <div className="header-avatar-container">
                        <Avatar />
                        <h6>{auth.user.nickname.length > 10 ? auth.user.nickname.substring(0, 10) + "..." : auth.user.nickname}</h6>
                    </div>
                </div>
            </div>
        </header>
   
    );
}

function UserSmallHeader(){
    const { auth } = usePage().props;
    const userAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${auth.user.avatar}`;
    const [unreadMessage, setUnreadMessage] = useState([]);
    const [show, setShow] = useState(false);
    useEffect(() => {
        const fetchMessage = () => {
            fetch('/User/api/UnreadMessageNotice')
                .then((response) => response.json())
                .then((data) => {
                    setUnreadMessage(data.unreadMessage || []);
                })
                .catch((error) => console.error("Error fetching message:", error));
        };
        
        fetchMessage();
        const interval = setInterval(fetchMessage, 5000); 
        return () => clearInterval(interval);
    }, []);
    
    return(
        <header className="mobileHeader client-header-color">
            <div className="header-container" >
                <div className="header-left">
                <Link className="headerLink" href={route('user.index')}>
                    <img src="https://fypcscproject.s3.ap-southeast-1.amazonaws.com/otherImage/logosegi.png" style={{width:"40px"}} />
                </Link>
                </div>
                <div className="header-right">
                    <div className="iconStyle">
                        <Link href={route('user.search')} >
                            <i className='headerLink bx bx-search bx-sm'></i>
                        </Link>
                    </div>
                    <div className="iconStyle" style={{position:"relative"}}>
                        <Link href={route('user.chat')} >
                            <i className='headerLink bx bxs-chat'></i>
                        </Link>
                        {unreadMessage && unreadMessage.length > 0 && (
                            <span className="badge">{unreadMessage.length}</span>
                        )}
                    </div>
                    <div className="iconStyle">
                        <Link href={route('user.communities')}  >
                            <i className='headerLink fa fa-group' style={{display:"flex",justifyContent:"center",lineHeight:"33px"}}></i>
                        </Link>
                    </div>
                    <div className="iconStyle">
                        <Link href={route('user.userList')} >
                            <i className='headerLink bx bxs-group bx-sm'></i>
                        </Link>
                    </div>
                    <div className="iconStyle">
                        <Notice />
                    </div>
                    <div className="avatar-dropdown">        
                        <img 
                            src={userAvatarUrl} 
                            className="avatarHeader"
                        />
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
                </div>
            </div>
        </header>
    );
}

export {GuestHeader,AdminGuestHeader,AdminHeader,UserHeader,UserSmallHeader,GuestBottom};