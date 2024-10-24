import React, { useState } from 'react';
import Modal from 'react-modal';
import { Post, PostFile } from '../../models/PostModel';
import { PostService } from '../../services/PostService';

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onPostUpdated: (updatedPost: Post) => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose, onPostUpdated }) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [files, setFiles] = useState<PostFile[]>(post.files || []);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFiles(Array.from(e.target.files));
    }
  };

  const handleFileRemove = (fileId: number) => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Aktualizacja posta bez plików
      await PostService.updatePost(post.id, { title, content });

      // Usunięcie plików z posta
      const filesToRemove = post.files.filter(f => !files.find(file => file.id === f.id));
      for (const file of filesToRemove) {
        await PostService.removeFileFromPost(post.id, file.id);
      }

      // Dodanie nowych plików
      for (const file of newFiles) {
        await PostService.addFileToPost(post.id, file);
      }

      // Pobranie zaktualizowanego posta
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
      className="modal-dialog"
      overlayClassName="modal-overlay"
      contentLabel="Edit Post Modal"
    >
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Edytuj Post</h5>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Tytuł</label>
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
              <label htmlFor="content" className="form-label">Treść</label>
              <textarea
                id="content"
                className="form-control"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Aktualne pliki:</label>
              {files.length > 0 ? (
                files.map(file => (
                  <div key={file.id} className="d-flex align-items-center mb-2">
                    <span>{file.fileName}</span>
                    <button type="button" className="btn btn-danger btn-sm ms-2" onClick={() => handleFileRemove(file.id)}>
                      Usuń
                    </button>
                  </div>
                ))
              ) : (
                <p>Brak plików</p>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="files" className="form-label">Dodaj nowe pliki:</label>
              <input
                type="file"
                id="files"
                className="form-control"
                multiple
                onChange={handleFileChange}
              />
            </div>
            <div className="d-flex justify-content-end">
              <button type="button" className="btn btn-secondary me-2" onClick={onClose}>Anuluj</button>
              <button type="submit" className="btn btn-primary">Zapisz</button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default EditPostModal;
