import React, { useState } from 'react';
import Modal from 'react-modal';
import { Post } from '../../models/PostModel';
import { PostService } from '../../services/PostService';
import '../../style/editpostStyle.css';

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onPostUpdated: (updatedPost: Post) => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose, onPostUpdated }) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [category, setCategory] = useState(post.category || '');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [customFileName, setCustomFileName] = useState('');
  const [currentFile, setCurrentFile] = useState(post.files && post.files.length > 0 ? post.files[0] : null);
  const [fileRemoved, setFileRemoved] = useState(false);

  const predefinedCategories = ['Technologia', 'Nauka', 'Sztuka', 'Muzyka', 'Sport'];
  const categories = predefinedCategories.includes(post.category)
    ? predefinedCategories
    : [post.category, ...predefinedCategories];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('Plik jest za duży. Maksymalny rozmiar to 5 MB.');
        return;
      }
      setNewFile(file);
    } else {
      setNewFile(null);
    }
  };

  const handleFileRemove = () => {
    setCurrentFile(null);
    setFileRemoved(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let fileData = undefined;
      if (newFile) {
        const base64Content = await PostService.convertFileToBase64(newFile);
        fileData = {
          fileName: customFileName || newFile.name,
          fileType: newFile.type,
          fileContent: base64Content,
        };
      }

      const updatedPostData = { title, content, category, file: fileData };
      await PostService.updatePost(post.id, updatedPostData);

      const updatedPost = await PostService.getPostById(post.id);
      onPostUpdated(updatedPost);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      className="modal-dialog-centered"
      overlayClassName="modal fade show d-block"
      contentLabel="Edit Post Modal"
    >
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Edytuj Post</h5>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
        </div>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="title" className="form-label" style={{ color: 'black' }}>Tytuł</label>
              <input
                type="text"
                id="title"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="content" className="form-label" style={{ color: 'black' }}>Treść</label>
              <textarea
                id="content"
                className="form-control"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="category" className="form-label" style={{ color: 'black' }}>Kategoria</label>
              <select
                id="category"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Wybierz kategorię</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              {currentFile && !fileRemoved ? (
                <div>
                  <p>Obecny plik: {currentFile.fileName}</p>
                  <button type="button" className="btn btn-danger" onClick={handleFileRemove}>Usuń plik</button>
                </div>
              ) : (
                <div>
                  <label htmlFor="file" className="form-label" style={{ color: 'black' }}>Nowy Plik (max 5 MB)</label>
                  <input
                    type="file"
                    id="file"
                    className="form-control"
                    onChange={handleFileChange}
                  />
                </div>
              )}
              {newFile && (
                <div className="mt-2">
                  <label htmlFor="customFileName" className="form-label" style={{ color: 'black' }}>Nazwa pliku</label>
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
              {newFile && (
                <div className="mb-3">
                  <label className="form-label" style={{ color: 'black' }}>Podgląd pliku</label>
                  {newFile.type.startsWith('image/') && (
                    <img src={URL.createObjectURL(newFile)} alt="Preview" className="img-thumbnail" />
                  )}
                  {newFile.type.startsWith('video/') && (
                    <video controls className="img-thumbnail">
                      <source src={URL.createObjectURL(newFile)} type={newFile.type} />
                    </video>
                  )}
                  {newFile.type.startsWith('audio/') && (
                    <audio controls className="w-100">
                      <source src={URL.createObjectURL(newFile)} type={newFile.type} />
                    </audio>
                  )}
                  {!newFile.type.startsWith('image/') && !newFile.type.startsWith('video/') && !newFile.type.startsWith('audio/') && (
                    <p>{newFile.name}</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Anuluj</button>
            <button type="submit" className="btn btn-primary">Zapisz</button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditPostModal;
