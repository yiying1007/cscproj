import { AdminLayout } from '../../../../Layouts/ClientLayout';
import { usePage } from '@inertiajs/react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-bs5';
import { useState } from 'react';

DataTable.use(DT);

function ChatManagement(){

    const { messages=[] } = usePage().props;
    
    
    return(
        <div>
            <AdminLayout>
            
            <div className="controlbar">
                <h5>Chat Management </h5>
            </div>
            <div className="controlbox">
                <div className="container-fluid">
                    <DataTable id="datatable" className="table">
                        <thead>
                            <tr>
                            <th>No</th>
                            <th>User Name</th>
                            <th>Message</th>
                            <th>status</th>
                            <th>Create Time</th>
                            <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.map((message,index) => {
                        
                            return (
                                <tr key={message.id}>
                                <td>{index+1}</td>
                                <td>{message.sender?.nickname}</td>
                                <td>
                                    {message.content && message.content.length > 20 ? message.content.substring(0, 20) + "..." : message.content}
                                </td>
                                {message.status==="Active"?(<td><span style={{color:"green",fontWeight:"500"}}>{message.status}</span></td>)
                                :(<td><span style={{color:"red",fontWeight:"500"}}>{message.status}</span></td>)
                                }
                                <td>{new Date(message.created_at).toLocaleString()}</td>
                                <td>
                                    <div className='actionStyle'>
                                    
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

export default ChatManagement; 


