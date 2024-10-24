import React, { useEffect, useState } from 'react';
import { Player } from 'video-react';
import "video-react/dist/video-react.css"; 
import Modal from 'react-modal';
import { Post, PostFile } from '../../models/PostModel';
import { FaVolumeUp, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import 'react-h5-audio-player/lib/styles.css';
import AudioPlayer from 'react-h5-audio-player';
import LikeDislikeComponent from './LikeDislikeComponent';
import { PostService } from '../../services/PostService';
import '../../style/PostComponent.css';

interface PostComponentProps {
  filter: {
    fileType: string;
    searchTerm: string;
  };
  userId: number;
  posts?: Post[];
}

const PostComponent: React.FC<PostComponentProps> = ({ filter, userId, posts: initialPosts }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const postsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Ustawienie elementu głównego dla modalu
  useEffect(() => {
    Modal.setAppElement('#root');
  }, []);

  useEffect(() => {
    if (!initialPosts) {
      const fetchPosts = async () => {
        try {
          let postsData: Post[] = [];

          if (filter.fileType || filter.searchTerm) {
            postsData = await PostService.getFilteredPosts(filter.fileType, filter.searchTerm);
          } else {
            postsData = await PostService.getAllPosts();
          }

          const sortedPosts = postsData.sort((a, b) => b.id - a.id);
          setPosts(sortedPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage));
          setTotalPages(Math.ceil(sortedPosts.length / postsPerPage));
        } catch (error) {
          console.error('Error fetching posts:', error);
        }
      };

      fetchPosts();
    } else {
      const sortedPosts = initialPosts.sort((a, b) => b.id - a.id);
      setPosts(sortedPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage));
      setTotalPages(Math.ceil(initialPosts.length / postsPerPage));
    }
  }, [filter, currentPage, userId, initialPosts]);

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const renderFileThumbnail = (file?: PostFile) => {
    if (!file) return null;
    if (file.fileType.startsWith('image/')) {
      return <img src={file.fileUrl} alt={file.fileName} className="img-thumbnail no-download" />;
    }
    if (file.fileType.startsWith('video/')) {
      return (
        <video className="img-thumbnail no-download" disablePictureInPicture controlsList="nodownload noremoteplayback">
          <source src={file.fileUrl} type={file.fileType} />
        </video>
      );
    }
    if (file.fileType.startsWith('audio/')) {
      return (
        <div className="d-flex justify-content-center align-items-center bg-light rounded" style={{ height: '100px' }}>
          <FaVolumeUp size={50} />
        </div>
      );
    }
    return <div className="img-thumbnail no-download">{file.fileType}</div>;
  };

  const renderFileInModal = (file?: PostFile) => {
    if (!file) return null;
    if (file.fileType.startsWith('image/')) {
      return <img src={file.fileUrl} alt={file.fileName} className="img-fluid" />;
    }
    if (file.fileType.startsWith('video/')) {
      return (
        <div className="video-container">
          <Player>
            <source src={file.fileUrl} />
          </Player>
        </div>
      );
    }
    if (file.fileType.startsWith('audio/')) {
      return (
        <AudioPlayer
          src={file.fileUrl}
          onPlay={() => console.log("onPlay")}
          className="w-100"
        />
      );
    }
    return <div>{file.fileType}</div>;
  };

  const handleTileClick = (post: Post) => {
    setSelectedPost(post);
  };

  const closeModal = () => {
    setSelectedPost(null);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="container mt-3">
      <div className="row">
        {posts.map((post) => (
          <div key={post.id} className="col-md-3 mb-3">
            <div
              className="card h-100 post-tile"
              onClick={() => handleTileClick(post)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-body d-flex flex-column align-items-center">
                <h5 className="card-title text-center">{truncateText(post.title, 15)}</h5>
                <p className="card-text text-center">{truncateText(post.content, 30)}</p>
                {post.files && post.files.length > 0 && renderFileThumbnail(post.files[0])}
                <p className="text-muted mt-2">Typ pliku: {post.files && post.files.length > 0 ? post.files[0].fileType : 'Brak plików'}</p>
                <div className="d-flex justify-content-center align-items-center mt-2">
                  <FaThumbsUp className={`me-1 ${post.likes > 0 ? 'text-success' : ''}`} /> {post.likes}
                  <FaThumbsDown className={`ms-3 me-1 ${post.dislikes > 0 ? 'text-danger' : ''}`} /> {post.dislikes}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-center mt-3 mb-3">
        <button className="btn btn-secondary mx-2" onClick={goToPreviousPage} disabled={currentPage === 1}>Poprzednia</button>
        <span className="align-self-center mx-2">Strona {currentPage} z {totalPages}</span>
        <button className="btn btn-secondary mx-2" onClick={goToNextPage} disabled={currentPage === totalPages}>Następna</button>
      </div>

      <Modal
        isOpen={!!selectedPost}
        onRequestClose={closeModal}
        className="modal-dialog"
        overlayClassName="modal-overlay"
        contentLabel="Post Modal"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{selectedPost?.title}</h5>
            <button type="button" className="btn-close" onClick={closeModal} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {selectedPost && (
              <div className="row">
                <div className="col-12 mb-3">
                  {selectedPost.files && selectedPost.files.length > 0 ? (
                    renderFileInModal(selectedPost.files[0])
                  ) : (
                    <p>{selectedPost.content}</p>
                  )}
                </div>
                <div className="col-12">
                  <p>{selectedPost.content}</p>
                  <LikeDislikeComponent
                    postId={selectedPost.id}
                    initialLikes={selectedPost.likes}
                    initialDislikes={selectedPost.dislikes}
                    userId={userId}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PostComponent;
