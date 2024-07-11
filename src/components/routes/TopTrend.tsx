import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Post } from '../../models/PostModel';
import { PostService } from '../../services/PostService';
import { FaVolumeUp } from 'react-icons/fa'; // Import icon
import { Player } from 'video-react';
import 'video-react/dist/video-react.css'; // Import video-react styles
import 'react-h5-audio-player/lib/styles.css'; // Import styles for the audio player
import AudioPlayer from 'react-h5-audio-player';

interface TopTrendProps {}

const TopTrend: React.FC<TopTrendProps> = () => {
  const [topPosts, setTopPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchTopPosts = async () => {
      try {
        const posts = await PostService.getTopLikedPosts();
        setTopPosts(posts);
      } catch (error) {
        console.error('Error fetching top liked posts:', error);
      }
    };

    fetchTopPosts();
  }, []);

  const isLoggedIn = !!localStorage.getItem('jwt'); // Check if user is logged in

  const renderFile = (file: Post['files'][0]) => {
    if (!file) return null;

    if (file.fileType.startsWith('image/')) {
      return (
        <div key={file.id} className="mb-3">
          <p><strong>File Name:</strong> {file.fileName}</p>
          <p><strong>File Type:</strong> {file.fileType}</p>
          <img src={file.fileUrl} alt={file.fileName} className="img-fluid" />
          {!file.fileType.startsWith('image/') && (
            isLoggedIn ? (
              <a href={file.fileUrl} download={file.fileName} className="btn btn-primary">Download</a>
            ) : (
              <p>You must be logged in to download files.</p>
            )
          )}
        </div>
      );
    }

    if (file.fileType.startsWith('video/')) {
      return (
        <div key={file.id} className="mb-3">
          <p><strong>File Name:</strong> {file.fileName}</p>
          <p><strong>File Type:</strong> {file.fileType}</p>
          <div className="video-container">
            <Player>
              <source src={file.fileUrl} />
            </Player>
          </div>
          {!file.fileType.startsWith('video/') && (
            isLoggedIn ? (
              <a href={file.fileUrl} download={file.fileName} className="btn btn-primary">Download</a>
            ) : (
              <p>You must be logged in to download files.</p>
            )
          )}
        </div>
      );
    }

    if (file.fileType.startsWith('audio/')) {
      return (
        <div key={file.id} className="mb-3">
          <p><strong>File Name:</strong> {file.fileName}</p>
          <p><strong>File Type:</strong> {file.fileType}</p>
          <div className="audio-container">
            <AudioPlayer
              src={file.fileUrl}
              onPlay={() => console.log("onPlay")}
              // other props here
            />
          </div>
          {!file.fileType.startsWith('audio/') && (
            isLoggedIn ? (
              <a href={file.fileUrl} download={file.fileName} className="btn btn-primary">Download</a>
            ) : (
              <p>You must be logged in to download files.</p>
            )
          )}
        </div>
      );
    }

    // Default case if file type is not recognized
    return (
      <div key={file.id} className="mb-3">
        <p><strong>File Name:</strong> {file.fileName}</p>
        <p><strong>File Type:</strong> {file.fileType}</p>
        <p>File type not supported</p>
        {!file.fileType.startsWith('image/') && !file.fileType.startsWith('video/') && !file.fileType.startsWith('audio/') && (
          isLoggedIn ? (
            <a href={file.fileUrl} download={file.fileName} className="btn btn-primary">Download</a>
          ) : (
            <p>You must be logged in to download files.</p>
          )
        )}
      </div>
    );
  };

  return (
    <React.Fragment>
      <div className="container mt-3">
        <div className="row">
          <div className="col">
            <h3 className="mb-4 text-center">Top 10 Most Liked Posts</h3>
            {topPosts.length === 0 ? (
              <p className="text-center">No posts available</p>
            ) : (
              <ol className="list-group list-group-numbered">
                {topPosts.map((post, index) => (
                  <li key={post.id} className="mb-3 p-3 bg-light border border-dark rounded">
                    <div className="d-flex justify-content-between align-items-center">
                      <h4 className="mb-1">{index + 1}. {post.title}</h4>
                      <div>
                        <span className="badge bg-primary rounded-pill me-2">Likes: {post.likes}</span>
                        <span className="badge bg-secondary rounded-pill">Dislikes: {post.dislikes}</span>
                      </div>
                    </div>
                    <p>{post.content}</p>
                    <p><strong>Author:</strong> {post.user.firstName} {post.user.lastName}</p>
                    {post.files && post.files.length > 0 && (
                      <div>
                        <h5>Files:</h5>
                        <div>
                          {post.files.map((file) => renderFile(file))}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default TopTrend;
