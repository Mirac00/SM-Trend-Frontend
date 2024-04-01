import React, { useEffect, useState } from 'react';
import { PostService } from '../../services/PostService';
import { Post } from '../../models/PostModel';

function PostComponent() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsData = await PostService.getAllPosts();
        // Sortowanie postów od najnowszego do najstarszego na podstawie id
        const sortedPosts = postsData.sort((a, b) => b.id - a.id);
        setPosts(sortedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <React.Fragment>
      <div className="container mt-3">
        <div className="gird">
          <div className="row">
            <div className="col">
              {posts.map((post) => (
                <div key={post.id} className="mb-3 bg-white p-3 border border-2 border-dark rounded">
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>
                  <p>
                    Author: {post.user.firstName} {post.user.lastName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default PostComponent;
