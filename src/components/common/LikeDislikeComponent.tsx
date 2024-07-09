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
    try {
      await PostService.likePost(postId, userId);
      await updateLikesAndDislikes();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDislike = async () => {
    try {
      await PostService.dislikePost(postId, userId);
      await updateLikesAndDislikes();
    } catch (error) {
      console.error('Error disliking post:', error);
    }
  };

  return (
    <div>
      <button onClick={handleLike} className="btn btn-success me-2">Like ({likes})</button>
      <button onClick={handleDislike} className="btn btn-danger">Dislike ({dislikes})</button>
    </div>
  );
};

export default LikeDislikeComponent;
