import React, { useEffect, useState } from 'react';
import { PostService } from '../../services/PostService';
import { Post, PostFile } from '../../models/PostModel';
import LikeDislikeComponent from './LikeDislikeComponent';

interface PostComponentProps {
  filter: {
    fileType: string;
    searchTerm: string;
  };
  userId: number; // Dodane pole UserId
}

function PostComponent({ filter, userId }: PostComponentProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('jwt')); // Dodane sprawdzenie logowania

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsData = await PostService.getFilteredPosts(filter.fileType, filter.searchTerm);
        const sortedPosts = postsData.sort((a, b) => b.id - a.id);
        setPosts(sortedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [filter]);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('jwt'));
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const renderFile = (file: PostFile) => {
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
          <p>Unsupported file type</p>
        )}
        {isLoggedIn && (
          <a href={file.fileUrl} download={file.fileName} className="btn btn-primary mt-2">Download</a>
        )}
      </div>
    );
  };

  return (
    <div className="container mt-3">
      {posts.map((post) => (
        <div key={post.id} className="mb-3 bg-white p-3 border border-2 border-dark rounded">
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <p>Author: {post.user.firstName} {post.user.lastName}</p>
          <LikeDislikeComponent postId={post.id} initialLikes={post.likes} initialDislikes={post.dislikes} userId={userId} />
          {post.files && post.files.length > 0 && (
            <div>
              <h5>Files:</h5>
              <div>
                {post.files.map((file) => (
                  <div key={file.id} className="mb-2">
                    {renderFile(file)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default PostComponent;
