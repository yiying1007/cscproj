import { AdminLayout } from '../../../../Layouts/ClientLayout';
import { usePage } from '@inertiajs/react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-bs5';
import EditAdminAvatarModal from './EditAdminAvatarModal';
import CreateAdminModal from './CreateAdminModal';
import EditAdminModal from './EditAdminModal';
import DeleteAdminModal from './DeleteAdminModal';

DataTable.use(DT);

function AdminManagement(){

    const { admins,auth } = usePage().props;
    
    /*<h5>Welcome,{auth.admin.name}</h5> */
    return(
        <div>
            <AdminLayout>
            
            <div className="controlbar">
                <h5>Admin Management </h5>
                {auth.admin.position==="Super Admin" && <CreateAdminModal />}
            </div>
            <div className="controlbox">
                <div className="container-fluid">
                    <DataTable id="datatable" className="table">
                        <thead>
                            <tr>
                            <th>No</th>
                            <th>Avatar</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Gender</th>
                            <th>Position</th>
                            <th>Create Time</th>
                            <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map((admin,index) => {
                        
                            return (
                                <tr key={admin.id}>
                                <td>{index+1}</td>
                                <td>
                                    <EditAdminAvatarModal admin={admin} />
                                </td>
                                <td>{admin.name}</td>
                                <td>{admin.email}</td>
                                <td>{admin.gender}</td>
                                <td>{admin.position}</td>
                                <td>{new Date(admin.created_at).toLocaleString()}</td>
                                <td>
                                    <div className='actionStyle'>
                                        <EditAdminModal admin={admin} />
                                        <DeleteAdminModal admin={admin} />
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

export default AdminManagement; 


