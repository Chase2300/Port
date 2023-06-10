import React, { useState, useEffect } from 'react';
import useStorage from './hooks/localStorage';
import Form from 'react-bootstrap/Form';
import SaveButton from './components/SaveButton';
import './App.css';

function App() {
  const { storage, saveToStorage } = useStorage();
  const [title, setTitle] = useState(storage.title || "Title");
  const [text, setText] = useState(storage.text || "Some post text");
  const [headerText, setHeaderText] = useState(storage.headerText || "Header");
  const [checked, setChecked] = useState(storage.checked || false);
  const [checkedImg, setCheckedImg] = useState(storage.checkedImg || false);
  const [images, setImages] = useState(storage.images || []);
  const [showToast, setShowToast] = useState(false);

  const handleCheckboxChange = (event) => {
    setChecked(event.target.checked);
  };
  const handleCheckboxChangeImg = (event) => {
    setCheckedImg(event.target.checked);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const filteredFiles = files.filter((file) => file.type.startsWith("image/"));

    filteredFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result;
        setImages((prevImages) => {
          return [...prevImages, imageUrl];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = () => {
    saveToStorage('title', title);
    saveToStorage('text', text);
    saveToStorage('headerText', headerText);
    saveToStorage('checked', checked);
    saveToStorage('checkedImg', checkedImg);
    saveToStorage('images', JSON.stringify(images));
    setShowToast(true);
  };

  useEffect(() => {
    const storedImages = storage.images;
    if (storedImages) {
      setImages(JSON.parse(storedImages));
    }
  }, []);

  return (

    <div className="App">

      <section className="App__settings">
        <Form >
          <Form.Group className="mb-3">
            <h2>
              Settings
            </h2>

            <Form.Control type="text" value={title} onChange={(e) => { setTitle(e.target.value) }} />
            <br />
            <Form.Control as="textarea" value={text} onChange={(e) => { setText(e.target.value) }} />
            <br />

            <Form.Check
              type="switch"
              id="custom-switch-header"
              label="Header"
              checked={checked}
              onChange={handleCheckboxChange} />
            {checked && <Form.Control type="text" value={headerText} onChange={(e) => { setHeaderText(e.target.value) }} />}
            <br />

            <Form.Check
              type="switch"
              id="custom-switch-image"
              label="Image"
              checked={checkedImg}
              onChange={handleCheckboxChangeImg} />
            {checkedImg &&

              <div className="App__settings-dropzone"
                onDragOver={handleDragOver}
                onDrop={handleDrop}>
                <span className="App__settings-dropzone_text">Drop File Here</span>
              </div>

            }
            <SaveButton handleSave={handleSave} />
          </Form.Group>
        </Form>
      </section>

      <section className="App__preview">

        <div className="App__preview-container border">
          <div className="App__preview-custom-header">
            {checked && <p className='border-bottom'>{headerText}</p>}
          </div>

          <div className="App__preview-content">
            <h2>{title}</h2>

            {checkedImg && Array.isArray(images) && images.length > 0 && (
              <div className="App__preview-content_image">
                {images.map((imageUrl, index) => (
                  <img key={index} src={imageUrl} alt={`Image ${index + 1}`} />
                ))}
              </div>
            )}

            <p>{text}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
export default App;
