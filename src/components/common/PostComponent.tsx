import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { Post, PostFile } from '../../models/PostModel';
import { FaVolumeUp, FaThumbsUp, FaThumbsDown, FaEdit, FaTrash, FaVideo } from 'react-icons/fa';
import 'react-h5-audio-player/lib/styles.css';
import AudioPlayer from 'react-h5-audio-player';
import ReactPlayer from 'react-player';
import LikeDislikeComponent from './LikeDislikeComponent';
import { PostService } from '../../services/PostService';
import '../../style/PostComponent.css';
import EditPostModal from './EditPostModal';

interface PostComponentProps {
  filter: {
    fileType: string;
    searchTerm: string;
    sortOption: string;
  };
  userId?: number;
  posts?: Post[];
  enableEditDelete?: boolean;
  onPostUpdated?: (updatedPost: Post) => void;
  onPostDeleted?: (postId: number) => void;
}

const PostComponent: React.FC<PostComponentProps> = ({
  filter,
  userId,
  posts: initialPosts,
  enableEditDelete = false,
  onPostUpdated,
  onPostDeleted,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const postsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fileUrls, setFileUrls] = useState<{ [key: number]: string }>({});
  const isLoggedIn = !!window.localStorage.getItem('jwt');

  useEffect(() => {
    Modal.setAppElement('#root');
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsData = filter.fileType || filter.searchTerm
          ? await PostService.getFilteredPosts(filter.fileType, filter.searchTerm)
          : await PostService.getAllPosts();

        let sortedPosts = [...postsData];

        switch (filter.sortOption) {
          case 'latest':
            sortedPosts.sort((a, b) => b.id - a.id);
            break;
          case 'highestRated':
            sortedPosts.sort((a, b) => b.likes - a.likes);
            break;
          case 'lowestRated':
            sortedPosts.sort((a, b) => a.likes - b.likes);
            break;
          case 'alphabetical':
            sortedPosts.sort((a, b) => a.title.localeCompare(b.title));
            break;
          default:
            sortedPosts.sort((a, b) => b.id - a.id);
        }

        setPosts(sortedPosts);
        setTotalPages(Math.ceil(sortedPosts.length / postsPerPage));
        setCurrentPage(1);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    if (!initialPosts) {
      fetchPosts();
    }
  }, [filter, initialPosts, postsPerPage]);

  useEffect(() => {
    if (initialPosts) {
      let sortedPosts = [...initialPosts];

      switch (filter.sortOption) {
        case 'latest':
          sortedPosts.sort((a, b) => b.id - a.id);
          break;
        case 'highestRated':
          sortedPosts.sort((a, b) => b.likes - a.likes);
          break;
        case 'lowestRated':
          sortedPosts.sort((a, b) => a.likes - b.likes);
          break;
        case 'alphabetical':
          sortedPosts.sort((a, b) => a.title.localeCompare(b.title));
          break;
        default:
          sortedPosts.sort((a, b) => b.id - a.id);
      }

      setPosts(sortedPosts);
      setTotalPages(Math.ceil(sortedPosts.length / postsPerPage));
      setCurrentPage(1);
    }
  }, [initialPosts, filter.sortOption, postsPerPage]);

  const displayedPosts = posts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const renderFileThumbnail = (post: Post) => {
    const file = post.files && post.files.length > 0 ? post.files[0] : null;
    if (!file) return null;

    if (file.fileType.startsWith('image/')) {
      const fileUrl = `${PostService.API_URL}/${post.id}/files/${file.id}/thumbnail`;
      return <img src={fileUrl} alt={file.fileName} className="img-thumbnail no-download" />;
    }
    if (file.fileType.startsWith('video/')) {
      return (
        <div className="d-flex justify-content-center align-items-center bg-light rounded" style={{ height: '100px' }}>
          <FaVideo size={50} />
        </div>
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
    const fileUrl = fileUrls[file.id];
    if (!fileUrl) return <p>Ładowanie pliku...</p>;

    if (file.fileType.startsWith('image/')) {
      return <img src={fileUrl} alt={file.fileName} className="img-fluid modal-media" />;
    }
    if (file.fileType.startsWith('video/')) {
      return (
        <div className="video-container">
          <ReactPlayer
            url={fileUrl}
            controls
            width="100%"
            height="100%"
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload',
                },
              },
            }}
          />
        </div>
      );
    }
    if (file.fileType.startsWith('audio/')) {
      return (
        <AudioPlayer
          src={fileUrl}
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
    setFileUrls({});
  };

  useEffect(() => {
    if (selectedPost && selectedPost.files && selectedPost.files.length > 0) {
      selectedPost.files.forEach(async (file) => {
        try {
          const blob = await PostService.getFileContentForView(selectedPost.id, file.id);
          const url = URL.createObjectURL(blob);
          setFileUrls(prevUrls => ({ ...prevUrls, [file.id]: url }));
        } catch (error) {
          console.error('Error fetching file content:', error);
        }
      });
    }
  }, [selectedPost]);

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

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async () => {
    if (selectedPost) {
      try {
        await PostService.deletePost(selectedPost.id);
        setPosts(posts.filter(post => post.id !== selectedPost.id));
        onPostDeleted && onPostDeleted(selectedPost.id);
        closeModal();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts(posts.map(post => (post.id === updatedPost.id ? updatedPost : post)));
    onPostUpdated && onPostUpdated(updatedPost);
    setIsEditModalOpen(false);
    setSelectedPost(updatedPost);
  };

  const handleDownload = async (file: PostFile) => {
    if (!selectedPost) {
      console.error('No selected post.');
      return;
    }
    try {
      const blob = await PostService.getFileContentForDownload(selectedPost.id, file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleLikesUpdated = (newLikes: number, newDislikes: number) => {
    if (selectedPost) {
      setSelectedPost({ ...selectedPost, likes: newLikes, dislikes: newDislikes });
      setPosts(posts.map(post => (post.id === selectedPost.id ? { ...post, likes: newLikes, dislikes: newDislikes } : post)));
    }
  };

  return (
    <div className="container mt-3">
      <div className="row">
        {displayedPosts.map((post) => (
          <div key={post.id} className="col-md-3 mb-3">
            <div
              className="card h-100 post-tile"
              onClick={() => handleTileClick(post)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-body d-flex flex-column align-items-center">
                <h5 className="card-title text-center">{truncateText(post.title, 15)}</h5>
                <p className="card-text text-center">{truncateText(post.content, 30)}</p>
                {renderFileThumbnail(post)}
                <p className="text-muted mt-2">Typ pliku: {post.files && post.files.length > 0 ? post.files[0].fileType : 'Brak plików'}</p>
                {post.files && post.files.length > 0 && (
                  <p className="text-muted">Nazwa pliku: {post.files[0].fileName}</p>
                )}
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

      {selectedPost && (
        <Modal
          isOpen={!!selectedPost}
          onRequestClose={closeModal}
          className="custom-modal-content"
          overlayClassName="custom-modal-overlay"
          contentLabel="Post Modal"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-center">{selectedPost.title}</h5>
              <button type="button" className="btn-close" onClick={closeModal} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-12 mb-3">
                  {selectedPost.files && selectedPost.files.length > 0 ? (
                    selectedPost.files.map((file) => (
                      <div key={file.id} className="mb-2">
                        <p><strong>Nazwa pliku:</strong> {file.fileName}</p>
                        {renderFileInModal(file)}
                      </div>
                    ))
                  ) : (
                    <p>{selectedPost.content}</p>
                  )}
                </div>
                <div className="col-12">
                  <p>{selectedPost.content}</p>
                  <p><strong>Kategoria:</strong> {selectedPost.category}</p>
                  <LikeDislikeComponent
                    postId={selectedPost.id}
                    initialLikes={selectedPost.likes}
                    initialDislikes={selectedPost.dislikes}
                    onLikesUpdated={handleLikesUpdated}
                  />
                  {selectedPost.files && selectedPost.files.length > 0 && (
                    <div className="mt-3">
                      {isLoggedIn ? (
                        <button className="btn btn-primary" onClick={() => handleDownload(selectedPost.files[0])}>
                          Pobierz plik
                        </button>
                      ) : (
                        <p>Aby pobrać plik, zaloguj się</p>
                      )}
                    </div>
                  )}
                  {enableEditDelete && selectedPost.userId === userId && (
                    <div className="mt-3 d-flex justify-content-end">
                      <button className="btn btn-primary me-2" onClick={handleEditClick}>
                        <FaEdit className="me-1" /> Edytuj
                      </button>
                      <button className="btn btn-danger" onClick={handleDeleteClick}>
                        <FaTrash className="me-1" /> Usuń
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {isEditModalOpen && selectedPost && (
        <EditPostModal
          post={selectedPost}
          onClose={() => setIsEditModalOpen(false)}
          onPostUpdated={handlePostUpdated}
        />
      )}
    </div>
  );
};

export default PostComponent;
