import React, { useEffect, useState } from 'react';
import { PostService } from '../../services/PostService';
import { Post, PostFile } from '../../models/PostModel';

interface PostComponentProps {
  filter: {
    fileType: string;
    searchTerm: string;
  };
}

function PostComponent({ filter }: PostComponentProps) {
  const [posts, setPosts] = useState<Post[]>([]);

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

  const renderFile = (file: PostFile) => {
    return (
      <div>
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
          <audio controls>
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
    <div className="container mt-3">
      {posts.map((post) => (
        <div key={post.id} className="mb-3 bg-white p-3 border border-2 border-dark rounded">
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <p>Author: {post.user.firstName} {post.user.lastName}</p>
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
