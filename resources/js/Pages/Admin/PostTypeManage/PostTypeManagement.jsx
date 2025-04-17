import { AdminLayout } from '../../../../Layouts/ClientLayout';
import { usePage } from '@inertiajs/react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-bs5';
import CreateTypeModal from './CreateTypeModal';
import EditTypeModal from './EditTypeModal';
import DeleteTypeModal from './DeleteTypeModal';

DataTable.use(DT);

function PostTypeManagement(){

    const { types } = usePage().props;
    
    return(
        <div>
            <AdminLayout>
            
            <div className="controlbar">
                <h5>Post Types Management </h5>
                <CreateTypeModal />
            </div>
            <div className="controlbox">
                <div className="container-fluid">
                    <DataTable id="datatable" className="table">
                        <thead>
                            <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Last Updated</th>
                            <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {types.map((type) => {
                        
                            return (
                                <tr key={type.id}>
                                <td>{type.id}</td>
                                <td>{type.type_name}</td>
                                <td>{new Date(type.updated_at).toLocaleString()}</td>
                                <td>
                                    <div className='actionStyle'>
                                        <EditTypeModal type={type} />
                                        <DeleteTypeModal type={type} />
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

export default PostTypeManagement; 


