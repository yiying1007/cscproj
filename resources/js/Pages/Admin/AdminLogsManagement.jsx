import { AdminLayout } from '../../../Layouts/clientLayout';
import { usePage } from '@inertiajs/react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-bs5';
import DeleteAdminLogModal from './DeleteAdminLogModal';

DataTable.use(DT);

function AdminLogsManagement(){

    const { adminLogs } = usePage().props;
    const options = {
        // Sort by the fifth column (Date) in descending order
        order: [[4, 'desc']], 
    };
    
    return(
        <div>
            <AdminLayout>
            
            <div className="controlbar">
                <h5>Admin Logs Management </h5>
                
            </div>
            <div className="controlbox">
                <div className="container-fluid">
                    <DataTable id="datatable"  options={options} className='table'>
                        <thead>
                            <tr>
                            <th>No</th>
                            <th>Admin ID</th>
                            <th>Action Type</th>
                            <th>Detail</th>
                            <th>Date</th>
                            <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {adminLogs.map((adminLogs, index) => {
                            
                            return (
                                <tr key={adminLogs.id}>
                                    <td >{index + 1}</td>
                                    <td>{adminLogs.admin_id}</td>
                                    <td>{adminLogs.action}</td>
                                    <td>{adminLogs.details}</td>
                                    <td>{new Date(adminLogs.created_at).toLocaleString()}</td>
                                    <td>
                                        <div className='actionStyle'>
                                            <DeleteAdminLogModal adminLogs={adminLogs} />
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

export default AdminLogsManagement; 


