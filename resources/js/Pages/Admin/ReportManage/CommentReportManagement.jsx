import { AdminLayout } from '../../../../Layouts/ClientLayout';
import { usePage } from '@inertiajs/react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-bs5';
import { ReportModal,DeleteModal } from './CommentActionModal';
DataTable.use(DT);

function CommentReportManagement(){

    const { auth,commentReports } = usePage().props;
    
    return(
        <div>
            <AdminLayout>
            
            <div className="controlbar">
                <h5>Comment Report Management </h5>
                
            </div>
            <div className="controlbox">
                <div className="container-fluid">
                    <DataTable id="datatable" className="table">
                        <thead>
                            <tr>
                            <th>No</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Review By</th>
                            <th>Date</th>
                            <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {commentReports.map((report,index) => {
                        
                            return (
                                <tr key={report.id}>
                                <td>{index+1}</td>
                                <td>{report.reason}</td>
                                {report.status==="Pending"?(<td><span style={{color:"orange",fontWeight:"500"}}>{report.status}</span></td>)
                                :report.status==="Resolved"?(<td><span style={{color:"green",fontWeight:"500"}}>{report.status}</span></td>)
                                :(<td><span style={{color:"red",fontWeight:"500"}}>{report.status}</span></td>)
                                }
                                <td>{report.admin_name}</td>
                                <td>{new Date(report.created_at).toLocaleString()}</td>
                                <td>
                                    <div className='actionStyle'>
                                        <ReportModal report={report} />
                                        {auth.admin.position==="Super Admin" && <DeleteModal report={report} />}
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

export default CommentReportManagement; 


