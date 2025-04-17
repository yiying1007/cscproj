import { AdminLayout } from '../../../../Layouts/ClientLayout';
import { usePage } from '@inertiajs/react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-bs5';
import CreateUserIdentityModal from './CreateUserIdentityModal';
import DeleteUserIdentityModal from './DeleteUserIdentityModal';
import EditUserIdentityModal from './EditUserIdentityModal';
import ViewDetailModal from './DetailUserIdentityModal';

DataTable.use(DT);

function UserIdentityManagement(){

    const { identity,users,allUsers } = usePage().props;
    
    /*<h5>Welcome,{auth.admin.name}</h5> */
    return(
        <div>
            <AdminLayout>
            
            <div className="controlbar">
                <h5>User Identity Management </h5>
                <CreateUserIdentityModal users={users}/>
            </div>
            <div className="controlbox">
                <div className="container-fluid">
                    <DataTable id="datatable" className="table">
                        <thead>
                            <tr>
                            <th>No</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>User ID</th>
                            <th>Create Time</th>
                            <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {identity.map((identity,index) => {
                            
                            return (
                                <tr key={identity.id}>
                                <td>{index+1}</td>
                                <td>{identity.name}</td>
                                <td>{identity.email}</td>
                                <td>{identity.role}</td>
                                <td>{identity.user_id}</td>
                                <td>{new Date(identity.created_at).toLocaleString()}</td>
                                <td>
                                    <div className='actionStyle'>
                                        <ViewDetailModal identity={identity} />
                                        <EditUserIdentityModal identity={identity} users={users} allUsers={allUsers} />
                                        <DeleteUserIdentityModal identity={identity} />
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

export default UserIdentityManagement; 


