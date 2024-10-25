import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importujemy useNavigate
import { UserService } from '../../services/UserService';
import { PostService } from '../../services/PostService';
import PostComponent from '../common/PostComponent';
import { User } from '../../models/User';
import { Post } from '../../models/PostModel';
import { useAuth } from '../../components/common/AuthContext';

const MyProfile: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [view, setView] = useState<'liked' | 'my'>('my');
  const { user, setUser } = useAuth(); // Używamy AuthContext
  const navigate = useNavigate(); // Inicjalizujemy useNavigate

  useEffect(() => {
    if (!user) {
      // Jeśli user jest null (wylogowany), przekieruj na stronę główną
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
        try {
          let fetchedPosts: Post[] = [];
          if (view === 'liked') {
            fetchedPosts = await PostService.getLikedPostsByUser(user.id);
          } else {
            fetchedPosts = await PostService.getPostsByUser(user.id);
          }
          setPosts(fetchedPosts);
        } catch (error) {
          console.error('Error fetching posts:', error);
        }
      }
    };

    fetchPosts();
  }, [user, view]);

  const handleUpdateProfile = async (updatedUser: Partial<User>) => {
    if (user) {
      await UserService.updateProfile(user.id, updatedUser);
      setUser({ ...user, ...updatedUser });
    }
  };

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts(posts.map(post => (post.id === updatedPost.id ? updatedPost : post)));
  };

  const handlePostDeleted = (postId: number) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  if (!user) {
    // Możemy zwrócić null lub loader, ale dzięki useEffect użytkownik zostanie przekierowany
    return null;
  }

  return (
    <div className="container mt-3">
      <h2>Mój Profil</h2>
      <div className="profile-section">
        <h3>Aktualizuj swoje dane</h3>
        <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile({ ...user }); }}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Nazwa użytkownika</label>
            <input
              type="text"
              id="username"
              className="form-control"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="firstName" className="form-label">Imię</label>
            <input
              type="text"
              id="firstName"
              className="form-control"
              value={user.firstName}
              onChange={(e) => setUser({ ...user, firstName: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="lastName" className="form-label">Nazwisko</label>
            <input
              type="text"
              id="lastName"
              className="form-control"
              value={user.lastName}
              onChange={(e) => setUser({ ...user, lastName: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Hasło</label>
            <input
              type="password"
              id="password"
              className="form-control"
              autoComplete="current-password"
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary">Aktualizuj</button>
        </form>
      </div>

      <div className="posts-section mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>{view === 'liked' ? 'Polubione Posty' : 'Moje Posty'}</h3>
          <button className="btn btn-secondary" onClick={() => setView(view === 'liked' ? 'my' : 'liked')}>
            {view === 'liked' ? 'Moje Posty' : 'Polubione Posty'}
          </button>
        </div>
        <PostComponent
          filter={{ fileType: '', searchTerm: '' }}
          userId={user.id}
          posts={posts}
          enableEditDelete={view === 'my'}
          onPostUpdated={handlePostUpdated}
          onPostDeleted={handlePostDeleted}
        />
      </div>
    </div>
  );
};

export default MyProfile;
