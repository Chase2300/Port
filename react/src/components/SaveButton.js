import React, { useContext } from 'react';
import { Button, Toast } from 'react-bootstrap';
import { ToastContext } from '../context/ToastContext';

function SaveButton(props) {
  const { handleSave } = props;
  const { showToast, setShowToast, handleToastClose } = useContext(ToastContext);

  const handleSaveWithContext = () => {
    handleSave();
    setShowToast(true);
  };

  return (
    <>
      <Button className="mt-3" variant="primary" onClick={handleSaveWithContext}>
        Save
      </Button>

      <Toast
        onClose={handleToastClose}
        show={showToast}
        delay={3000}
        autohide
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          maxWidth: 100
        }}
      >
        <Toast.Body className="App__settings-save-alert">Post saved</Toast.Body>
      </Toast>
    </>
  );
}

export default SaveButton;