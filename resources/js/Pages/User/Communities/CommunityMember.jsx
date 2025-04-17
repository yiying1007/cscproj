import Member from "./Member";
import MemberRequest from "./MemberRequest";
import { useState,useEffect } from "react";
import { usePage } from "@inertiajs/react";
import InviteMemberModal from "./InviteMemberModal";


function CommunityMember() {
    const { memberRequest,isMember={} } = usePage().props;
    
    
    // get target tab,if not default tab
    let savedTab = localStorage.getItem("memberTab") || "member";
    //is position is member and try to access tab request,back default tab member
    if (isMember && (isMember.position !='Admin' || isMember.position !='Leader') && savedTab === "memberRequest") {
        savedTab = "member";
    }
    const [memberTab, setMemberTab] = useState(savedTab);
    useEffect(() => {
        localStorage.setItem("memberTab", memberTab);
        return () => {
            localStorage.removeItem("memberTab");
        };
    }, [memberTab]);
    

    return (
        <>
        <div className='index-post-navigation' style={{gap:"30px",borderRadius:"10px"}}>
                {isMember && (isMember.position ==='Admin' || isMember.position ==='Leader') && (
                    <a 
                        onClick={() => setMemberTab("memberRequest")} 
                        className={memberTab === "memberRequest" ? "active" : ""}
                        style={{ position: 'relative', display: 'inline-block' }}>
                        Member Request
                        {memberRequest && memberRequest.length > 0 && (
                            <span className="badge" style={{
                                position: 'absolute',
                                right: '-20px',
                                backgroundColor: 'red',
                                color: 'white',
                                borderRadius: '50%',
                                padding: '2px 5px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                lineHeight: '1',
                            }}>{memberRequest.length}</span>
                        )}
                    </a>
                )}
                <a onClick={() => setMemberTab("member")} className={memberTab === "member" ? "active" : ""}>Members</a>
            </div>
            {memberTab === "member" && (
                <Member />
            )}
            {memberTab === "memberRequest" && (
                <MemberRequest />
            )}

            
            
        </>
    );
}

export default CommunityMember;

