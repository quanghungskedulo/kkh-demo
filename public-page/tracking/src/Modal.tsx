import {  ReactNode, useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";

function CustomModal(config: {
  show: boolean
  title: string
  okButton: string
  closeButton: string
  children?: ReactNode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  closeButtonAction: any
}) {
  
  const [showModal, setShowModal] = useState(false);

  const handleCloseModal = () => setShowModal(false);

  useEffect(() => {
    setShowModal(config.show)
  }, [config.show]);

  return (
    <>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header>
          <Modal.Title>{config.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        
          {config.children}

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {config.closeButton}
          </Button>
          <Button variant="custom" onClick={config.closeButtonAction}>
            {config.okButton}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default CustomModal;
