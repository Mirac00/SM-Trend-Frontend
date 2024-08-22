import React, { useEffect, useState } from 'react';
import { Player } from 'video-react';
import "video-react/dist/video-react.css"; 
import Modal from 'react-modal';
import { Post, PostFile } from '../../models/PostModel';
import '../../style/PostComponent.css';
import { FaVolumeUp, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import 'react-h5-audio-player/lib/styles.css';
import AudioPlayer from 'react-h5-audio-player';
import LikeDislikeComponent from './LikeDislikeComponent'; // Dodanie brakującego importu
import { PostService } from '../../services/PostService'; // Import PostService

interface PostComponentProps {
  filter: {
    fileType: string;
    searchTerm: string;
  };
  userId: number;
  posts?: Post[]; // Pozwalamy na opcjonalne przekazanie postów
}

const PostComponent: React.FC<PostComponentProps> = ({ filter, userId, posts: initialPosts }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const postsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!initialPosts) {
      const fetchPosts = async () => {
        try {
          let postsData: Post[] = [];

          // Fetch posts based on the filter or fetch all if no filter is applied
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
      // Jeśli `initialPosts` są przekazane, użyj ich i oblicz ilość stron
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
        <div className="audio-thumbnail">
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
        <div className="audio-container">
          <AudioPlayer
            src={file.fileUrl}
            onPlay={() => console.log("onPlay")}
          />
        </div>
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
              className="post-tile p-3 border rounded shadow-sm"
              onClick={() => handleTileClick(post)}
              style={{ cursor: 'pointer' }}
            >
              <h3 className="post-title">{truncateText(post.title, 15)}</h3>
              <p className="post-content">{truncateText(post.content, 30)}</p>
              {post.files && post.files.length > 0 && renderFileThumbnail(post.files[0])}
              <p className="file-type">File Type: {post.files && post.files.length > 0 ? post.files[0].fileType : 'Brak plików'}</p>
              <div className="likes-dislikes">
                <FaThumbsUp className="like-icon" /> {post.likes}<FaThumbsDown className="dislike-icon" /> {post.dislikes}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination-container d-flex justify-content-center mt-3 mb-3">
        <button className="btn btn-secondary mx-2" onClick={goToPreviousPage} disabled={currentPage === 1}>Poprzednia</button>
        <span className="align-self-center mx-2">Strona {currentPage} z {totalPages}</span>
        <button className="btn btn-secondary mx-2" onClick={goToNextPage} disabled={currentPage === totalPages}>Następna</button>
      </div>

      <Modal isOpen={!!selectedPost} onRequestClose={closeModal} className="post-modal" overlayClassName="modal-overlay">
        <div className="modal-content">
          <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}>&times;</button>
          {selectedPost && (
            <div className="row">
              <div className="col-md-7">
                <h3>{selectedPost.title}</h3>
                {selectedPost.files && selectedPost.files.length > 0 ? (
                  renderFileInModal(selectedPost.files[0])
                ) : (
                  <p>{selectedPost.content}</p>
                )}
              </div>
              <div className="col-md-5 d-flex flex-column justify-content-center">
                <p>{selectedPost.content}</p>
                <LikeDislikeComponent postId={selectedPost.id} initialLikes={selectedPost.likes} initialDislikes={selectedPost.dislikes} userId={userId} />
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PostComponent;
