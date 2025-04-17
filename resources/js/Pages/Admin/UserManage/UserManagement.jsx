import { AdminLayout } from '../../../../Layouts/ClientLayout';
import { usePage } from '@inertiajs/react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-bs5';
import CreateUserModal from './CreateUserModal';
import DeleteUserModal from './DeleteUserModal';
import EditUserModal from './EditUserModal';
import EditUserAvatarModal from './EditUserAvatarModal';
import ViewDetailModal from './DetailUserModal';


DataTable.use(DT);

function UserManagement(){

    const { users,admins,allAdmins } = usePage().props;
    
    /*<h5>Welcome,{auth.admin.name}</h5> */
    return(
        <div>
            <AdminLayout>
            
            <div className="controlbar">
                <h5>User Management </h5>
                <CreateUserModal admins={admins}/>
            </div>
            <div className="controlbox">
                <div className="container-fluid">
                    <DataTable id="datatable" className="table">
                        <thead>
                            <tr>
                            <th>No</th>
                            <th>Avatar</th>
                            <th>NickName</th>
                            <th>Email</th>
                            <th>Gender</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Create Time</th>
                            <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user,index) => {
                            //const userAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${user.avatar}`;
                            const statusStyles = {
                                Active: { color: "green", fontWeight: "500" },
                                Block: { color: "red", fontWeight: "500" },
                                Pending: { color: "orange", fontWeight: "500" },
                            };
                            return (
                                <tr key={user.id}>
                                <td>{index+1}</td>
                                <td>
                                    <EditUserAvatarModal user={user} />
                                </td>
                                <td>{user.nickname}</td>
                                <td>{user.email}</td>
                                <td>{user.gender}</td>
                                <td>{user.position}</td>
                                <td>
                                    <span style={statusStyles[user.acc_status] || { color: "black", fontWeight: "500" }}>
                                        {user.acc_status}
                                    </span>
                                </td>
                                <td>{new Date(user.createtime).toLocaleString()}</td>
                                <td>
                                    <div className='actionStyle'>
                                        
                                        <ViewDetailModal user={user} />
                                        <EditUserModal user={user} allAdmins={allAdmins} />
                                        <DeleteUserModal user={user} />
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

export default UserManagement; 


