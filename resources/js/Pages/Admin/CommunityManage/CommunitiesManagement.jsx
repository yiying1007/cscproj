import { AdminLayout } from '../../../../Layouts/ClientLayout';
import { usePage,Link } from '@inertiajs/react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-bs5';
import CreateCommunityModal from './CreateCommunityModal';
import EditCommunityAvatarModal from './EditCommunityAvatarModal';
import EditCommunityModal from './EditCommunityModal';
import DeleteCommunityModal from './DeleteCommunityModal';
import ViewDetailModal from './DetailCommunityModal';
import BlockCommunityModal from './CommunityModal';



DataTable.use(DT);

function MemberManagement(){

    const { communities,users } = usePage().props;
    
    /*<h5>Welcome,{auth.community.name}</h5> */
    return(
        <div>
            <AdminLayout>
            
            <div className="controlbar">
                <h5>Community Management </h5>
                <CreateCommunityModal users={users} />
            </div>
            <div className="controlbox">
                <div className="container-fluid">
                    <DataTable id="datatable" className="table">
                        <thead>
                            <tr>
                            <th>No</th>
                            <th>Avatar</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Leader</th>
                            <th>Visibility</th>
                            <th>Status</th>
                            <th>Create Time</th>
                            <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {communities.map((community,index) => {
                                const leader = users.find(user => user.id === community.created_by);
                            return (
                                <tr key={community.id}>
                                <td>{index+1}</td>
                                <td>
                                    <EditCommunityAvatarModal community={community} />
                                </td>
                                <td>{community.name}</td>
                                <td>{community.type}</td>
                                <td>{leader ? leader.nickname : "Unknown"}</td>
                                <td>{community.is_private}</td>
                                {community.status==="Active"?(<td><span style={{color:"green",fontWeight:"500"}}>{community.status}</span></td>)
                                :(<td><span style={{color:"red",fontWeight:"500"}}>{community.status}</span></td>)
                                }
                                <td>{new Date(community.created_at).toLocaleString()}</td>
                                <td>
                                    <div className='actionStyle'>
                                        <ViewDetailModal community={community} />
                                        <button className="btn btn-sm">
                                            <Link className='btnlink' href={route('admin.memberManagement',{ communityId: community.id })} >
                                                Member
                                            </Link>
                                        </button>
                                        <EditCommunityModal community={community} users={users} />
                                        <BlockCommunityModal community={community} />
                                        <DeleteCommunityModal community={community} />
                                        
                                    </div>
                                    
                                </td>
                                </tr>
                            );
                            })}
                        </tbody>
                    </DataTable>
                </div>
            </div>

            
            
            </AdminLayout>
            
        </div>

    );
}

export default MemberManagement; 


