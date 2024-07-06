import React, { useEffect, useState } from 'react';
import { PostService } from '../../services/PostService';
import { Post, PostFile } from '../../models/PostModel';

function PostComponent() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsData = await PostService.getAllPosts();
        const sortedPosts = postsData.sort((a, b) => b.id - a.id);
        setPosts(sortedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  const renderFile = (file: PostFile) => {
    if (file.fileType.startsWith('image/')) {
      return <img src={file.fileUrl} alt={file.fileName} className="img-fluid" />;
    }
    if (file.fileType.startsWith('video/')) {
      return <video controls className="img-fluid">
        <source src={file.fileUrl} type={file.fileType} />
        Your browser does not support the video tag.
      </video>;
    }
    if (file.fileType.startsWith('audio/')) {
      return <audio controls>
        <source src={file.fileUrl} type={file.fileType} />
        Your browser does not support the audio tag.
      </audio>;
    }
    return <a href={file.fileUrl} download={file.fileName}>{file.fileName}</a>;
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
