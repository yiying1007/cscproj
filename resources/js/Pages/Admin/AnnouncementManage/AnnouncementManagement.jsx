import { AdminLayout } from '../../../../Layouts/ClientLayout';
import { usePage } from '@inertiajs/react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-bs5';
import CreateAnnouncementModal from './CreateAnnouncementModal';
import EditAnnouncementModal from './EditAnnouncementModal';
import DeleteAnnouncementModal from './DeleteAnnouncementModal';
import { Modal } from 'react-bootstrap';
import { useState } from 'react';

DataTable.use(DT);

function AnnouncementManagement(){

    const { announcements=[] } = usePage().props;
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);


    const handleShow = (announcement) => {
        setSelectedAnnouncement(announcement);
        setShow(true);
    };

    const handleClose = () => {
        setShow(false);
        setSelectedAnnouncement(null);
    };
    
    return(
        <div>
            <AdminLayout>
            
            <div className="controlbar">
                <h5>Announcement Management </h5>
                <CreateAnnouncementModal />
            </div>
            <div className="controlbox">
                <div className="container-fluid">
                    <DataTable id="datatable" className="table">
                        <thead>
                            <tr>
                            <th>No</th>
                            <th>Admin Name</th>
                            <th>Title</th>
                            <th>Content</th>
                            <th>Expiration Time</th>
                            <th>Create Time</th>
                            <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {announcements.map((a,index) => {
                        
                            return (
                                <tr key={a.id}>
                                <td>{index+1}</td>
                                <td>{a.name}</td>
                                <td>{a.title.length > 20 ? a.title.substring(0, 30) + "..." : a.title}</td>
                                <td>
                                    {a.content && a.content.length > 20 ? a.content.substring(0, 20) + "..." : a.content}
                                    
                                </td>
                                <td>{a.end_time ? new Date(a.end_time).toLocaleString() : "-"}</td>
                                <td>{new Date(a.created_at).toLocaleString()}</td>
                                <td>
                                    <div className='actionStyle'>
                                    <button onClick={() => handleShow(a)} className="btn btn-primary btn-sm">
                                        View
                                    </button>
                                        <EditAnnouncementModal a={a} />
                                        <DeleteAnnouncementModal a={a} />
                                    </div>
                                </td>
                                </tr>
                            );
                            })}
                        </tbody>
                    </DataTable>
                </div>
            </div>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Full Announcement</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedAnnouncement && (
                        <div className="detailGrid">
                            <span className="detailLabel">Title</span> 
                            <span className="detailContent">{selectedAnnouncement.title}</span>

                            <span className="detailLabel">Content</span> 
                            <span className="detailContent">{selectedAnnouncement.content}</span>

                            <span className="detailLabel">Expiration Time</span> 
                            <span className="detailContent">{selectedAnnouncement.end_time ? new Date(selectedAnnouncement.end_time).toLocaleString() : "-"}</span>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
            
            
            </AdminLayout>
            
        </div>

    );
}

export default AnnouncementManagement; 


