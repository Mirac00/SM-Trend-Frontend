import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Post } from '../../models/PostModel';
import { PostService } from '../../services/PostService';

const TopTrend: React.FC = () => {
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

  const renderFile = (file: Post['files'][0]) => {
    return (
      <div key={file.id} className="mb-3">
        <p><strong>File Name:</strong> {file.fileName}</p>
        <p><strong>File Type:</strong> {file.fileType}</p>
        {file.fileType.startsWith('image/') && (
          <img src={file.fileUrl} alt={file.fileName} className="img-fluid" />
        )}
        {file.fileType.startsWith('video/') && (
          <video controls className="img-fluid">
            <source src={file.fileUrl} type={file.fileType} />
            Your browser does not support the video tag.
          </video>
        )}
        {file.fileType.startsWith('audio/') && (
          <audio controls className="img-fluid">
            <source src={file.fileUrl} type={file.fileType} />
            Your browser does not support the audio tag.
          </audio>
        )}
        {!file.fileType.startsWith('image/') && !file.fileType.startsWith('video/') && !file.fileType.startsWith('audio/') && (
          <a href={file.fileUrl} download={file.fileName}>{file.fileName}</a>
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
                  <li key={post.id}>
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
