import { GuestHeader,AdminGuestHeader,GuestBottom } from "../js/Pages/Components/Header";
import FlashMessage from "../js/Pages/Components/MessageComponent";

function AdminLayout({ children }) {
    return (
        <div className="guest-container"> 
            <AdminGuestHeader /> 
            <FlashMessage />
            <main className="form-container">{children}</main> 
        </div>
    );
}

function UserLayout({ children }) {
    return (
        <div className="guest-container">
            <GuestHeader /> 
            <FlashMessage />
            <main className="guest-body-container">{children}</main>
        </div>
    );
}
function UserWelcomeLayout({ children }) {
    return (
        <div className="guest-container">
            <GuestHeader /> 
            <FlashMessage />
            <main>{children}</main>
            <GuestBottom /> 
        </div>
    );
}
export {AdminLayout,UserLayout,UserWelcomeLayout};