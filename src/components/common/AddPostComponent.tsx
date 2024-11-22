import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddPostService } from '../../services/AddPostService';
import '../../style/AddPostComponent.css';
import { useAuth } from '../../components/common/AuthContext';

interface AddPostComponentProps {
  onPostAdded: () => void;
}

function AddPostComponent({ onPostAdded }: AddPostComponentProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [customFileName, setCustomFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth(); // Pobierz użytkownika z kontekstu
  const isLoggedIn = !!user;

  const categories = [
    'Edukacyjne', 'Rozrywkowe', 'Inspirujące', 'Promocyjne',
    'Użytkowników (UGC)', 'Kulturalne', 'Wizualne',
    'Personalne / Zakulisowe', 'Interaktywne', 'Aktualności / Informacyjne'
  ];

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('');
    setFile(null);
    setCustomFileName('');
  };

  const handleAddPost = async () => {
    if (!isLoggedIn || !user) {
      setErrorMessage('Zaloguj się, aby dodać post.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Pole tytuł jest wymagane.');
      return;
    }

    if (!category.trim()) {
      setErrorMessage('Pole kategoria jest wymagane.');
      return;
    }

    try {
      const fileData = file ? await processFile(file) : undefined;
      await AddPostService.createPost({ title, content, category, file: fileData }, user.token);
      resetForm();
      onPostAdded();
    } catch (error) {
      console.error('Error adding post:', error);
      setErrorMessage('Wystąpił błąd podczas dodawania posta.');
    }
  };

  const processFile = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const base64String = arrayBufferToBase64(arrayBuffer);

    // Generowanie domyślnej nazwy pliku na podstawie typu
    const defaultFileName = customFileName || getDefaultFileName(file);

    return {
      fileName: defaultFileName,
      fileType: file.type,
      fileContent: base64String,
    };
  };

  const getDefaultFileName = (file: File): string => {
    if (file.type.startsWith('image/')) {
      return 'Tytuł_obraz';
    }
    if (file.type.startsWith('video/')) {
      return 'Tytuł_wideo';
    }
    if (file.type.startsWith('audio/')) {
      return 'Tytuł_audio';
    }
    return 'Tytuł_plik';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
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
          <label htmlFor="category" className="form-label">Kategoria</label>
          <select
            id="category"
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">-- Wybierz kategorię --</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="file" className="form-label">Plik</label>
          <input
            type="file"
            className="form-control"
            id="file"
            onChange={handleFileChange}
          />
        </div>
        {file && (
          <div className="mb-3">
            <label htmlFor="customFileName" className="form-label">Nazwa pliku</label>
            <input
              type="text"
              className="form-control"
              id="customFileName"
              placeholder="Podaj nazwę pliku"
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
            />
          </div>
        )}
        {file && (
          <div className="mb-3">
            <label className="form-label">Podgląd pliku</label>
            {file.type.startsWith('image/') && (
              <img src={URL.createObjectURL(file)} alt="Preview" className="img-thumbnail" />
            )}
            {file.type.startsWith('video/') && (
              <video controls className="img-thumbnail">
                <source src={URL.createObjectURL(file)} type={file.type} />
              </video>
            )}
            {file.type.startsWith('audio/') && (
              <audio controls className="w-100">
                <source src={URL.createObjectURL(file)} type={file.type} />
              </audio>
            )}
            {!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/') && (
              <p>{file.name}</p>
            )}
          </div>
        )}
        {errorMessage && <p className="text-danger">{errorMessage}</p>}
        <button type="button" className="btn btn-primary" onClick={handleAddPost}>Dodaj</button>
      </form>
    </div>
  );
}

export default AddPostComponent;
