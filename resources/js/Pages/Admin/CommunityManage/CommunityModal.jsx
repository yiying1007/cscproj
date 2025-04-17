import { useForm } from "@inertiajs/react";
import { Input,Button,InfoMessage,Select,Option,TextArea } from "../../Components/FormComponent";
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';




function BlockCommunityModal({community}) {

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
        
            post(route('admin.blockCommunity', community.id), {
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
        <button className="btn btn-success btn-sm" onClick={handleReportShow} disabled={community.status === "Block"}>Block</button>
        
        
        <Modal show={reportshow} onHide={handleReportClose}>
            <Modal.Header closeButton>
                <Modal.Title>Block Community</Modal.Title>
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


export default BlockCommunityModal;