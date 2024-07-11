import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddPostService } from '../../services/AddPostService';
import '../../style/AddPostComponent.css';

interface AddPostComponentProps {
  onPostAdded: () => void;
}

function AddPostComponent({ onPostAdded }: AddPostComponentProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const token = window.localStorage.getItem('jwt');
  const navigate = useNavigate();

  const resetForm = () => {
    setTitle('');
    setContent('');
    setFiles([]);
  };

  const handleAddPost = async () => {
    if (!token) {
      setErrorMessage('Zaloguj się, aby dodać post.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Pole tytuł jest wymagane.');
      return;
    }

    try {
      const fileData = await Promise.all(files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const base64String = arrayBufferToBase64(arrayBuffer);
        return {
          fileName: file.name,
          fileType: file.type,
          fileContent: base64String
        };
      }));

      await AddPostService.createPost({ title, content, files: fileData }, token);
      resetForm();
      onPostAdded();
    } catch (error) {
      console.error('Error adding post:', error);
      setErrorMessage('Error adding post');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  return (
    <div className="mb-3 bg-white p-3 border border-2 border-dark rounded add-post">
      <h3>Dodaj post</h3>
      <form>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Tytuł</label>
          <input
            type="text"
            className="form-control"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="content" className="form-label">Treść</label>
          <textarea
            className="form-control"
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="files" className="form-label">Pliki</label>
          <input
            type="file"
            className="form-control"
            id="files"
            multiple
            onChange={handleFileChange}
          />
        </div>
        {errorMessage && <p className="text-danger">{errorMessage}</p>}
        <button type="button" className="btn btn-primary" onClick={handleAddPost}>Dodaj</button>
      </form>
    </div>
  );
}

export default AddPostComponent;
