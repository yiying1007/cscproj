import { AdminLayout } from '../../../../Layouts/ClientLayout';
import { usePage } from '@inertiajs/react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-bs5';
import CreateWordModal from './CreateWordModal';
import DeleteWordModal from './DeleteWordModal';
import EditWordModal from './EditWordModal';


DataTable.use(DT);

function WordSensitiveManagement(){

    const { sensitiveWords=[] } = usePage().props;

    
    return(
        <div>
            <AdminLayout>
            
            <div className="controlbar">
                <h5>Sensitive Word Management </h5>
                <CreateWordModal />
            </div>
            <div className="controlbox">
                <div className="container-fluid">
                    <DataTable id="datatable" className="table">
                        <thead>
                            <tr>
                            <th>No</th>
                            <th>Type</th>
                            <th>Word</th>
                            <th>Create Time</th>
                            <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sensitiveWords.map((sensitiveWord,index) => {
                        
                            return (
                                <tr key={sensitiveWord.id}>
                                <td>{index+1}</td>
                                <td>{sensitiveWord.type}</td>
                                <td>{sensitiveWord.word.length > 20 ? sensitiveWord.word.substring(0, 30) + "..." : sensitiveWord.word}</td>
                                <td>{new Date(sensitiveWord.created_at).toLocaleString()}</td>
                                <td>
                                    <div className='actionStyle'>
                                        <EditWordModal sensitiveWord={sensitiveWord} />
                                        <DeleteWordModal sensitiveWord={sensitiveWord} />
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

export default WordSensitiveManagement; 


