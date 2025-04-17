import { UserHeader,AdminHeader,UserSmallHeader } from "../js/Pages/Components/Header";
import { Ul,Li } from "../js/Pages/Components/Sidebar";
import { useState } from "react";
import FlashMessage from "../js/Pages/Components/MessageComponent";

function UserLayout({ children }) {
    return (
        <div className="client-body-container">
            <UserHeader />
            <UserSmallHeader />
            <FlashMessage />
            <main className='body-container'>{children}</main> 
        </div>
    );
}

function AdminLayout({ children }) {

    const [isUserOpen, setIsUserOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isPostOpen, setIsPostOpen] = useState(false);
    const [isAdminOpen, setIsAdminOpen] = useState(false);

    return (
        <div className="client-body-container">
            <AdminHeader />
            <div style={{display:"flex",gap:"20px"}}>
            <div className="sidebar">
                <Ul>
                    <Li 
                        href={route('admin.dashboard')}
                        listName="Dashboard"
                    />
                    <Li onClick={() => setIsUserOpen(!isUserOpen)} listName={`User ${isUserOpen ? "▲" : " ▼"}`}></Li>
                    {isUserOpen && (
                        <>
                       <Li 
                            href={route('admin.userManagement')}
                            listName="User Management"
                        />
                        <Li 
                            href={route('admin.userIdentityManagement')}
                            listName="User Identity Management"
                        />
                        </>
                    )}
                    <Li onClick={() => setIsPostOpen(!isPostOpen)} listName={`Post ${isPostOpen ? "▲" : " ▼"}`}></Li>
                    {isPostOpen && (
                        <>
                        <Li 
                            href={route('admin.postManagement')}
                            listName="Post Management"
                        />
                        <Li 
                            href={route('admin.postTypeManagement')}
                            listName="Post Type Management"
                        />
                        </>
                    )}    
                    <Li 
                        href={route('admin.communitiesManagement')}
                        listName="Communities Management"
                    />
                    <Li 
                        href={route('admin.announcementManagement')}
                        listName="Announcement Management"
                    />
                    <Li onClick={() => setIsReportOpen(!isReportOpen)} listName={`Report Management ${isReportOpen ? "▲" : " ▼"}`}></Li>
                    {isReportOpen && (
                        <>
                        <Li 
                            href={route('admin.postReportManagement')}
                            listName="Post Report"
                        />
                        <Li 
                            href={route('admin.commentReportManagement')}
                            listName="Comment Report"
                        />
                        <Li 
                            href={route('admin.communityReportManagement')}
                            listName="Community Report"
                        />
                        <Li 
                            href={route('admin.chatReportManagement')}
                            listName="Chat Report"
                        />
                        </>
                    )}
                    <Li onClick={() => setIsAdminOpen(!isAdminOpen)} listName={`Admin ${isAdminOpen ? "▲" : " ▼"}`}></Li>
                    {isAdminOpen && (
                        <>
                        <Li 
                            href={route('admin.adminManagement')}
                            listName="Admin Management"
                        />
                        <Li 
                            href={route('admin.adminLogsManagement')}
                            listName="Admin Logs Management"
                        />
                        </>
                    )}  
                        
                        
                    </Ul>
                </div> 
                <main className='admin-body-container'>
                    <FlashMessage />
                    {children}
                </main>
            </div>
            
        </div>
    );
}

export {AdminLayout,UserLayout};