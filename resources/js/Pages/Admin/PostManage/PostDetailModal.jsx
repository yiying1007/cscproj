import { useForm } from "@inertiajs/react";
import { Input,Button,InfoMessage,Select,Option,TextArea } from "../../Components/FormComponent";
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

function PostDetailModal({post}) {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    
    const mediaUrls = JSON.parse(post.media_url || "[]");
    return (
        <div>
            <button className="btn btn-success btn-sm"  onClick={handleShow}>
                Detail
            </button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Post Detail</Modal.Title>
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

function BlockPostModal({posts}) {

    const { data, setData, post,clearErrors, processing, errors, reset } = useForm({
        reason:"",
        details:"",
        review_notes: "",
        acc_block_until: "",
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
        
            post(route('admin.blockPost',posts.id), {
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
        <button className="btn btn-success btn-sm" onClick={handleReportShow} disabled={posts.status === "Block"}>Block</button>
        
        
        <Modal show={reportshow} onHide={handleReportClose}>
            <Modal.Header closeButton>
                <Modal.Title>Block Post</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={reportSubmit}>
                    <Select
                        label="Reason"
                        name="reason"
                        id="reason"
                        value={data.reason} /*store data */
                        onChange={(e) => setData('reason', e.target.value)}
                    >
                        <Option label="Select Reason" value="" disabled />
                        <Option label="Inappropriate Content" value="Inappropriate Content" />
                        <Option label="Spam or Scam" value="Spam or Scam" />
                        <Option label="Harassment or Bullying" value="Harassment or Bullying" />
                        <Option label="Intellectual Property Violation" value="Intellectual Property Violation" />
                        <Option label="False Information" value="False Information" />
                        <Option label="Impersonation" value="Impersonation" />                            <Option label="Disrupting Campus Harmony" value="Disrupting Campus Harmony" />
                        <Option label="Violation of community guidelines" value="Violation of community guidelines" />
                    </Select>
                    {errors.reason && <InfoMessage className="errorMessage" message={errors.reason}/>}
                    <TextArea
                        label="Detail"
                        type="text"
                        name="details"
                        id="details"
                        value={data.details}/*store data */
                        onChange={(e) => setData('details', e.target.value)}                        />
                    {errors.details && <InfoMessage className="errorMessage" message={errors.details}/>}
                        
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


export {PostDetailModal,BlockPostModal};