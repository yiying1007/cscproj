import { UserLayout } from "../../../../Layouts/ClientLayout";
import {useState,useEffect} from 'react';
import CampusCommunities from "./CampusCommunities";
import MyCommunities from "./MyCommunities";
import CreateCommunityModal from "./CreateCommunityModal";

function Communities() {
    const [communityTab, setCommunityTab] = useState(localStorage.getItem('communityTab') || 'myCommunities');
    //remember user choose tab status
    useEffect(() => {
        localStorage.setItem('communityTab', communityTab);
        return () => {
            localStorage.removeItem('communityTab');
        };
    }, [communityTab]);
    return (
      <UserLayout>
        <div className="topStyle">
            <h3 className="titleName">Communities</h3>
            <CreateCommunityModal />
        </div>
        <hr />
        <div className='index-navigation-container'>
            <a 
                onClick={() => setCommunityTab('communities')}
                className={communityTab === 'communities' ? 'active' : ''}
            >
                All Communities
            </a>
            <a
                onClick={() => setCommunityTab('myCommunities')}
                className={communityTab === 'myCommunities' ? 'active' : ''}
            >
                My Communities
            </a>
        </div>
        {communityTab === 'communities' && (
            <CampusCommunities />
        )}
        {communityTab === 'myCommunities' && (
            <MyCommunities />
        )}
        </UserLayout>
    );
}

export default Communities;
