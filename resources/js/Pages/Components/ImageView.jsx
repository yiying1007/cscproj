import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

function ImageView({ imageUrl,cssClass }) {

    //modal zoom image
    const [showModal, setShowModal] = useState(false);
    const [modalImage, setModalImage] = useState("");
    const openModal = (imageUrl) => {
        setModalImage(imageUrl);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalImage("");
    };

    return (
        <>
            <img
                src={imageUrl}
                alt="Image"
                className={cssClass}
                onClick={() => openModal(imageUrl)}
            />

            <Modal show={showModal} onHide={closeModal} >
                <Modal.Header closeButton></Modal.Header>
                    <Modal.Body>
                        <img src={modalImage} alt="Full View" style={{ width: "100%",objectFit:"cover" }} />
                    </Modal.Body>
            </Modal>
        </>
    );
}

export default ImageView;