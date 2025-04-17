import { useState,useEffect } from "react";
import { usePage,router } from "@inertiajs/react";
import Alert from 'react-bootstrap/Alert';

function FlashMessage() {
    const { flash } = usePage().props;
    const [flashState, setFlashState] = useState(null);

    useEffect(() => {
        // When the flash in Props updates, sync to the local state
        if (flash.success || flash.error) {
            setFlashState(flash);

            // Automatically clear messages
            const timer = setTimeout(() => {
                setFlashState(null);
                router.reload({ only: ['flash'] });
                //window.location.reload();
            }, 1500);
            
            return () => clearTimeout(timer);
            
        }
    }, [flash]); // Monitor flash changes

    return (
        <div>
            {flashState?.success && <Alert variant="warning"
            style={{
                position: "fixed",
                top: "70px",
                right:"35px",
                width:"300px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.5)",
            }}
            >{flashState.success}</Alert>}
            {flashState?.error && <Alert variant="danger"
            style={{
                position: "fixed",
                top: "70px",
                right:"35px",
                width:"300px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.5)",
            }}
            >{flashState.error}</Alert>}
        </div>
    );
}

export default FlashMessage;
