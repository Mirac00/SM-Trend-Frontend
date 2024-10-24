import React, { useState, useEffect } from 'react';
import { PostService } from '../../services/PostService';

interface LikeDislikeComponentProps {
  postId: number;
  initialLikes: number;
  initialDislikes: number;
  userId: number;
}

const LikeDislikeComponent: React.FC<LikeDislikeComponentProps> = ({ postId, initialLikes, initialDislikes, userId }) => {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userLikeStatus, setUserLikeStatus] = useState<'like' | 'dislike' | null>(null);
  const [isNotLoggedIn, setIsNotLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      setIsNotLoggedIn(false);
      fetchUserLikeStatus();
    } else {
      setIsNotLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('jwt');
      if (token) {
        setIsNotLoggedIn(false);
        fetchUserLikeStatus();
      } else {
        setIsNotLoggedIn(true);
        setUserLikeStatus(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const fetchUserLikeStatus = async () => {
    try {
      const status = await PostService.getUserLikeStatus(postId);
      setUserLikeStatus(status);
    } catch (error) {
      console.error('Error fetching user like status:', error);
    }
  };

  const updateLikesAndDislikes = async () => {
    try {
      const updatedPost = await PostService.getPostById(postId);
      setLikes(updatedPost.likes);
      setDislikes(updatedPost.dislikes);
    } catch (error) {
      console.error('Error updating likes and dislikes:', error);
    }
  };

  const handleLike = async () => {
    if (isNotLoggedIn) return;
    try {
      await PostService.likePost(postId, userId);
      await updateLikesAndDislikes();
      // Aktualizacja statusu
      if (userLikeStatus === 'like') {
        setUserLikeStatus(null);
      } else {
        setUserLikeStatus('like');
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        setIsNotLoggedIn(true);
      } else {
        console.error('Error liking post:', error);
      }
    }
  };

  const handleDislike = async () => {
    if (isNotLoggedIn) return;
    try {
      await PostService.dislikePost(postId, userId);
      await updateLikesAndDislikes();
      // Aktualizacja statusu
      if (userLikeStatus === 'dislike') {
        setUserLikeStatus(null);
      } else {
        setUserLikeStatus('dislike');
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        setIsNotLoggedIn(true);
      } else {
        console.error('Error disliking post:', error);
      }
    }
  };

  return (
    <div>
      {isNotLoggedIn && (
        <div className="alert alert-warning" role="alert">
          Aby ocenić, zaloguj się.
        </div>
      )}
      <button
        onClick={handleLike}
        className={`btn me-2 ${userLikeStatus === 'like' ? 'btn-success' : 'btn-outline-success'}`}
      >
        Like ({likes})
      </button>
      <button
        onClick={handleDislike}
        className={`btn ${userLikeStatus === 'dislike' ? 'btn-danger' : 'btn-outline-danger'}`}
      >
        Dislike ({dislikes})
      </button>
    </div>
  );
};

export default LikeDislikeComponent;
