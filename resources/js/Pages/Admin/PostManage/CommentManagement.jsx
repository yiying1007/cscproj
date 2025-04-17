import { AdminLayout } from '../../../../Layouts/ClientLayout';
import { usePage } from '@inertiajs/react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-bs5';
import BlockCommentModal from './CommentModal';

DataTable.use(DT);

function CommentManagement(){

    const { comments } = usePage().props;
    
    return(
        <div>
            <AdminLayout>
            
            <div className="controlbar">
                <h5>Comment Management </h5>
                
            </div>
            <div className="controlbox">
                <div className="container-fluid">
                    <DataTable id="datatable" className="table">
                        <thead>
                            <tr>
                            <th>No</th>
                            <th>Comment</th>
                            <th>Status</th>
                            <th>Create Time</th>
                            <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comments.map((comment,index) => {
                        
                            return (
                                <tr key={comment.id}>
                                <td>{index+1}</td>
                                <td>{comment.content}</td>
                                {comment.status==="Active"?(<td><span style={{color:"green",fontWeight:"500"}}>{comment.status}</span></td>)
                                :(<td><span style={{color:"red",fontWeight:"500"}}>{comment.status}</span></td>)
                                }
                                <td>{new Date(comment.created_at).toLocaleString()}</td>
                                <td>
                                    <div className='actionStyle'>
                                        <BlockCommentModal comment={comment} />
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

export default CommentManagement; 


