import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddPostService } from '../../services/AddPostService';

interface AddPostComponentProps {
  onPostAdded: () => void;
}

function AddPostComponent({ onPostAdded }: AddPostComponentProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const token = window.localStorage.getItem('jwt');
  const navigate = useNavigate();

  const resetForm = () => {
    setTitle('');
    setContent('');
  };

  const handleAddPost = async () => {
    if (!token) {
      setErrorMessage('Zaloguj się, aby dodać post.');
      return;
    }

    try {
      await AddPostService.createPost({ title, content }, token);
      resetForm();
      onPostAdded(); // Callback to update the post list
    } catch (error) {
      console.error('Error adding post:', error);
      // Add error handling logic if needed
    }
  };

  return (
    <div className="mb-3 bg-white p-3 border border-2 border-dark rounded">
      <h3>Dodaj post</h3>
      <form>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            Tytuł
          </label>
          <input
            type="text"
            className="form-control"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="content" className="form-label">
            Treść
          </label>
          <textarea
            className="form-control"
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        {errorMessage && <p className="text-danger">{errorMessage}</p>}
        <button type="button" className="btn btn-primary" onClick={handleAddPost}>
          Dodaj
        </button>
      </form>
    </div>
  );
}

export default AddPostComponent;
