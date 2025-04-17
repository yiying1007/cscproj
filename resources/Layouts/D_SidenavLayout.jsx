import { Link } from "@inertiajs/react";



function SidenavLayout({ children }) {
    return (
        <div>
            <div className="sidenav">
                <Link href={route('user.friendList')}>My Friend</Link>
            </div>
            <main className="contentLayout">{children}</main>
        </div>
    );
}
export default SidenavLayout;