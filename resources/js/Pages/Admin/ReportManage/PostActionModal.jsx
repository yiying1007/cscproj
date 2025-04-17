import { useForm } from "@inertiajs/react";
import { Input,Button,InfoMessage } from "../../Components/FormComponent";
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

function PostModal({post}) {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    
    const mediaUrls = JSON.parse(post.media_url || "[]");
    return (
        <div>
            <button className="btn btn-success btn-sm" style={{fontWeight:"600"}} onClick={handleShow}>
                Post Detail
            </button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="detailGrid">
                        <span className="detailLabel">Post Title</span> 
                        <span className="detailContent">{post.title || "-"}</span>

                        <span className="detailLabel">Post Content</span> 
                        <span className="detailContent">{post.content || "-"}</span>

                        <span className="detailLabel">Post Media</span> 
                        <span className="detailContent">
                            <div className='content-media image-grid-container'>
                            {mediaUrls.map((media, index) => {
                                if (media.match(/\.(jpeg|jpg|gif|png)$/)) {
                                    return (
                                            <img 
                                                key={index}
                                                src={media} 
                                                alt="post image" 
                                                width="200" 
                                                onClick={() => openModal(media)} 
                                                style={{ cursor: "pointer" }} 
                                            />
                                        
                                    );
                                    }else if (media.match(/\.(mp4|webm|mov|avi)$/)) {
                                        return (
                                            <div key={index} className="video-container">
                                                <video src={media} controls width="100%" />
                                            </div>
                                        );
                                    }else if (media.match(/\.(mpeg|mp3|wav)$/)) {
                                        return (
                                            <div key={index} className="audio-container">
                                                <audio src={media} controls></audio>
                                            </div>
                                        );
                                    }else if (media.includes("youtube.com") || media.includes("youtu.be")) {
                                        const videoId = media.split("v=")[1]?.split("&")[0] || media.split("/").pop();
                                        return (
                                            <iframe
                                                key={index}
                                                src={`https://www.youtube.com/embed/${videoId}`}
                                                title="YouTube video"
                                                height="315"
                                                allowFullScreen
                                            ></iframe>
                                        );
                                    }
                                    return null;
                                })}
                                </div>
                        </span>

                        
                    </div>

                </Modal.Body>
                
            </Modal>

        </div>
    );
}
function UserModal({user}){
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return(
        <div>
            <button className="btn btn-success btn-sm" style={{fontWeight:"600"}} onClick={handleShow}>
                User Detail
            </button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="detailGrid">
                        <span className="detailLabel">User Name</span> 
                        <span className="detailContent">{user.user_name}</span>

                        <span className="detailLabel">User Role</span> 
                        <span className="detailContent">{user.position}</span>

                        <span className="detailLabel">SEGi Email</span> 
                        <span className="detailContent">{user.segi_email}</span>

                        <span className="detailLabel">Course Taken</span> 
                        <span className="detailContent">{user.course}</span>

                        <span className="detailLabel">User Acc Status</span> 
                        <span className="detailContent" style={{color:user.acc_status === "Active" ? "green" : "red",fontWeight:"500"}}>{user.acc_status}</span>

                        <span className="detailLabel">Number of Violations</span> 
                        <span className="detailContent" style={{fontWeight:"500"}}>{user.acc_violation_count}</span>
              

                    </div>
                </Modal.Body>
                
            </Modal>

        </div>

    );
}
function AcceptReportModal({report}) {

    const { data, setData, post,clearErrors, processing, errors, reset } = useForm({
        review_notes: "",
        acc_block_until: "",
        status:"Resolved",
    });
    
    //modal report
    const [reportshow, setReportShow] = useState(false);
    const handleReportClose = () => {
        setReportShow(false);
        reset();
        clearErrors();
    };
    const handleReportShow = () => {
        setReportShow(true);
    };
    
    function reportSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        
            post(route('admin.handleReport',{report:report.id,contentType:report.content_id}), {
                onSuccess: () => {
                    handleReportClose(); // close modal
                    /*setTimeout(() => {
                        window.location.reload();
                    }, 1500);*/
                },
            });
        
        
    }

    return (
        <>
        <Button name="Accept Report" onClick={handleReportShow} />
        
        
        <Modal show={reportshow} onHide={handleReportClose}>
            <Modal.Header closeButton>
                <Modal.Title>Block Post</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={reportSubmit}>
                        
                    <Input
                        label="Review Note (Option)"
                        type="text"
                        name="review_notes"
                        id="review_notes"
                        value={data.review_notes}/*store data */
                        onChange={(e) => setData('review_notes', e.target.value)}
                    />
                    {errors.review_notes && <InfoMessage className="errorMessage" message={errors.review_notes}/>}

                    <Input                            
                        label="Block User Account (Option)"
                        type="datetime-local"
                        name="acc_block_until"
                        id="acc_block_until"
                        value={data.acc_block_until}/*store data */
                        onChange={(e) => setData('acc_block_until', e.target.value)}
                    />
                    {errors.acc_block_until && <InfoMessage className="errorMessage" message={errors.acc_block_until}/>}
                    <hr />
                    <Button name="Accept"  disabled={processing} />
                    
                </form>
            </Modal.Body>
        </Modal>
        
        </>
    );
}
function RejectReportModal({report}) {

    const { data, setData, post,clearErrors, processing, errors, reset } = useForm({
        status:"Rejected",
        review_notes: "",
    });
    
    //modal report
    const [reportshow, setReportShow] = useState(false);
    const handleReportClose = () => {
        setReportShow(false);
        reset();
        clearErrors();
    };
    
    const handleReportShow = () => {
        setReportShow(true);
    };
    
    function reportSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        
            post(route('admin.handleReport',{report:report.id,contentType:report.content_id}), {
                onSuccess: () => {
                    handleReportClose(); // close modal
                    /*setTimeout(() => {
                        window.location.reload();
                    }, 1500);*/
                },
            });
        
        
    }

    return (
        <>
        <Button name="Reject Report" onClick={handleReportShow} />
                
        
        <Modal show={reportshow} onHide={handleReportClose}>
            <Modal.Header closeButton>
                <Modal.Title>Reject Report</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={reportSubmit}>
                    <Input
                        label="Review Note (Option)"
                        type="text"
                        name="review_notes"
                        id="review_notes"
                        value={data.review_notes}/*store data */
                        onChange={(e) => setData('review_notes', e.target.value)}
                    />
                    {errors.review_notes && <InfoMessage className="errorMessage" message={errors.review_notes}/>}
                    <hr />
                    <Button name="Reject"  disabled={processing} />
                </form>
            </Modal.Body>
        </Modal>
        
        </>
    );
}
function ReportModal({report}){
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return(
        <div>
            <button className="btn btn-success btn-sm" onClick={handleShow}>
                Open
            </button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Report</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="detailGrid">
                        <span className="detailLabel">Report Reason</span> 
                        <span className="detailContent">{report.reason || "-"}</span>

                        <span className="detailLabel">Report Detail</span> 
                        <span className="detailContent">{report.details || "-"}</span>

                        <span className="detailLabel">Report Status</span> 
                        {report.status==="Pending"?(<span className="detailContent" style={{color:"orange",fontWeight:"500"}}>{report.status}</span>)
                        :report.status==="Resolved"?(<span className="detailContent" style={{color:"green",fontWeight:"500"}}>{report.status}</span>)
                        :(<span className="detailContent" style={{color:"red",fontWeight:"500"}}>{report.status}</span>)
                        }

                        <span className="detailLabel">Detail</span> 
                        <span className="detailContent" style={{display:"flex",gap:"20px"}}><PostModal post={report} /><UserModal user={report} /></span>
                        
                        {report.status!="Pending" &&
                        <>
                            <span className="detailLabel">Reviewed By</span> 
                            <span className="detailContent">{report.admin_name}</span>

                            <span className="detailLabel">Review Note</span> 
                            <span className="detailContent">{report.review_notes || "-"}</span>

                            <span className="detailLabel">Reviewed Date</span> 
                            <span className="detailContent">{new Date(report.updated_at).toLocaleString()}</span>
                        </>
                        }
                        
                    </div>
                    {report.status==="Pending" &&
                        <div>
                            <hr />
                            <span className="" style={{display:"flex",gap:"20px",justifyContent:"end"}}>
                                <AcceptReportModal report={report} />
                                <RejectReportModal report={report} />
                            </span>

                        </div>
                        }
                </Modal.Body>
                
            </Modal>

        </div>

    );
}
function DeleteModal({report}){
    
    //Modal OPEN/CLOSE
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    
    const { delete:deleteReport,processing } = useForm();
    
    function formSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        deleteReport(route('admin.deleteReport',report.id), {
            onSuccess: () => {
                handleClose(); // close modal
            },
          });
    }
    
    
    return(
        <div>
            <button className="btn btn-danger btn-sm" onClick={handleShow}>
                Delete
            </button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Report</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formSubmit}>
                        
                        <h5>Are you sure to delete this record?</h5>
                        <hr />
                        <Button name="Delete" disabled={processing} />
                                
                    </form>

                </Modal.Body>
                
            </Modal>

        </div>

    );
}
export {ReportModal,DeleteModal};