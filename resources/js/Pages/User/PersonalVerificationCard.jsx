import { ProfileInput } from "../Components/FormComponent";
import { UserLayout } from "../../../Layouts/ClientLayout";
import { usePage } from "@inertiajs/react";
import { useEffect,useState } from "react";

function VerificationCard({id}){
    //const { verifyCard } = usePage().props;
    const [verifyCard, setVerifyCard] = useState(null);
    const [show, setShow] = useState(false);
    // dynamically loading notification data
    const fetchMessage = () => {
         fetch(`/User/PersonalVerificationCard/${id}`)
            .then((response) => response.json())
            .then((data) => {
                setVerifyCard(data.verifyCard || {});
            })
            .catch((error) => console.error("Error fetching message:", error));
    };
    // Get notification data when the page loads
    useEffect(() => {
        if (id) {
            fetchMessage();
        }
    }, [id,show]);

    if (!verifyCard) {
        return <h5 className='info-message'><i className="fa-li fa fa-spinner fa-spin"></i></h5>;
    }
    return(
            <div className="profile-card">
                <h4>SEGi Verification Card</h4>
                <hr />
                <ProfileInput label="Name" value={verifyCard.name || ""} disabled />
                <ProfileInput label="SEGi Email" value={verifyCard.email || ""} disabled />
                <ProfileInput label="Role" value={verifyCard.role || ""} disabled />
                <ProfileInput label="Faculty" value={verifyCard.faculty || ""} disabled />
                <ProfileInput label="Course" value={verifyCard.course || ""} disabled />
                  
            </div>
        

    );
}


export default VerificationCard; 


