import { usePage, useForm } from "@inertiajs/react";
import { useState } from "react";
import { Modal } from "react-bootstrap";
import {Button,Input,TextArea,InfoMessage,Select,Option} from "../../Components/FormComponent";
import { Button as Btn } from "react-bootstrap";


function ReportComponent({postData,postUrl,dropdownIcon=false,chatReportIcon=false}) {
    const { auth } = usePage().props;

    const { data, setData, post,clearErrors, processing, errors, reset } = useForm({
        reason: "",
        details: "",
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
    //report comment
    function reportSubmit(e){
        //prevent auto refresh when click submit
        e.preventDefault();
        //use inertia js--useForm--post submit data
        
            post(route(`${postUrl}`,postData.id), {
                preserveScroll:true,
                onSuccess: () => {
                    handleReportClose(); // close modal
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                },
            });
        
    }
    const handleIconShow = () => {
        if(postData.user_id != auth.user.id && dropdownIcon===false && chatReportIcon===false){
            return(
                <i className={"interactive-icon bx bxs-error "} 
                    onClick={() => handleReportShow(postData)}
                >&nbsp;Report</i>
            );
        }else if(postData.user_id != auth.user.id && dropdownIcon===true){
            return <Btn onClick={() => handleReportShow(postData)}><i className="bx bxs-error"></i> Report</Btn>;
        }else if(postData.sender_id != auth.user.id && chatReportIcon===true){
            return(
                <i className={"msg-icon bx bxs-error "} 
                    onClick={() => handleReportShow(postData)}
                ></i>
            );
        }
    };
    return (
        <>
        {handleIconShow()}
        <Modal show={reportshow} onHide={handleReportClose}>
            <Modal.Header closeButton>
                <Modal.Title>Report</Modal.Title>
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
                        
                    {auth.user.position==="Admin" && <Input
                        label="Review Note"
                        type="text"
                        name="review_notes"
                        id="review_notes"
                        value={data.review_notes}/*store data */
                        onChange={(e) => setData('review_notes', e.target.value)}
                    />}
                    {errors.review_notes && <InfoMessage className="errorMessage" message={errors.review_notes}/>}

                    {auth.user.position==="Admin" && <Input                            label="Block Account"
                        type="datetime-local"
                        name="acc_block_until"
                        id="acc_block_until"
                        value={data.acc_block_until}/*store data */
                        onChange={(e) => setData('acc_block_until', e.target.value)}
                    />}
                    {errors.acc_block_until && <InfoMessage className="errorMessage" message={errors.acc_block_until}/>}
                    <hr />
                    <Button name="Report"  disabled={processing} />
                </form>
            </Modal.Body>
        </Modal>
        
        </>
    );
}

export default ReportComponent;
