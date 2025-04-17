import { usePage } from "@inertiajs/react";
import { UserLayout } from "../../../Layouts/ClientLayout";


function AnnouncementDetail() {
    const { auth,announcementDetail} = usePage().props;


    return (
        <UserLayout>
            <div className="post-detail-container">
                <div className="detail-border">
                    <div className="post-body">
                    <p>{new Date(announcementDetail.created_at).toLocaleString()}</p> 
                        <h5>{announcementDetail.title}</h5>
                        <hr className="post-line"/>
                        <div className="content-text">
                        {(announcementDetail.content || "").split("\n").map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                        </div>
                    </div>
                </div>
            </div>
            
        </UserLayout>
    );
}

export default AnnouncementDetail;
