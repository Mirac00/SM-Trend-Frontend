// src/components/common/MyProfile.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/common/AuthContext'; // Upewnij się, że ścieżka jest poprawna
import { PostService } from '../../services/PostService';
import { UserService } from '../../services/UserService';
import PostComponent from '../common/PostComponent';
import { Post } from '../../models/PostModel';
import { User } from '../../models/User';
import { useNavigate } from 'react-router-dom'; // Import hooka useNavigate

const MyProfile: React.FC = () => {
  const { user, setUser } = useAuth(); // Korzystanie z AuthContext
  const [posts, setPosts] = useState<Post[]>([]);
  const [view, setView] = useState<'liked' | 'my'>('my'); // Domyślny widok na 'my'
  const [filter, setFilter] = useState({ fileType: '', searchTerm: '', sortOption: 'latest' }); // Dodany sortOption
  const navigate = useNavigate(); // Inicjalizacja useNavigate

  // Lokalny stan dla formularza aktualizacji profilu
  const [updatedUsername, setUpdatedUsername] = useState(user?.username || '');
  const [updatedFirstName, setUpdatedFirstName] = useState(user?.firstName || '');
  const [updatedLastName, setUpdatedLastName] = useState(user?.lastName || '');
  const [updatedPassword, setUpdatedPassword] = useState('');

  useEffect(() => {
    if (!user) {
      // Jeśli użytkownik nie jest zalogowany, przekieruj na stronę główną
      navigate('/');
    } else {
      // Inicjalizacja lokalnych stanów po zalogowaniu
      setUpdatedUsername(user.username);
      setUpdatedFirstName(user.firstName);
      setUpdatedLastName(user.lastName);
      setUpdatedPassword('');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
        try {
          let fetchedPosts: Post[] = [];
          if (view === 'liked') {
            // Pobierz polubione posty użytkownika
            fetchedPosts = await PostService.getLikedPostsByUser(user.id);
          } else {
            // Pobierz posty stworzone przez użytkownika
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
      try {
        await UserService.updateProfile(user.id, updatedUser);
        // Aktualizacja stanu użytkownika w kontekście
        setUser({ ...user, ...updatedUser });
        alert('Profil został zaktualizowany pomyślnie!');
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Wystąpił błąd podczas aktualizacji profilu.');
      }
    }
  };

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts(posts.map(post => (post.id === updatedPost.id ? updatedPost : post)));
  };

  const handlePostDeleted = (postId: number) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  if (!user) {
    // Opcjonalnie: możesz zwrócić null lub loader podczas przekierowywania
    return null;
  }

  return (
    <div className="container mt-3">
      <h2 className="mt-2 text-success">Mój Profil</h2>
      <div className="profile-section">
        <h3>Aktualizuj swoje dane</h3>
        <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile({
          username: updatedUsername,
          firstName: updatedFirstName,
          lastName: updatedLastName,
          password: updatedPassword
        }); }}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              className="form-control"
              value={updatedUsername}
              onChange={(e) => setUpdatedUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="firstName" className="form-label">Imię</label>
            <input
              type="text"
              id="firstName"
              className="form-control"
              value={updatedFirstName}
              onChange={(e) => setUpdatedFirstName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="lastName" className="form-label">Nazwisko</label>
            <input
              type="text"
              id="lastName"
              className="form-control"
              value={updatedLastName}
              onChange={(e) => setUpdatedLastName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Hasło</label>
            <input
              type="password"
              id="password"
              className="form-control"
              autoComplete="current-password"
              value={updatedPassword}
              onChange={(e) => setUpdatedPassword(e.target.value)}
              placeholder="Nowe hasło"
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
        {/* Przekazujemy nowe propsy do PostComponent */}
        <PostComponent
          filter={filter}
          userId={user.id}
          posts={posts}
          enableEditDelete={view === 'my'} // Umożliwiamy edycję i usuwanie tylko w widoku 'my'
          onPostUpdated={handlePostUpdated}
          onPostDeleted={handlePostDeleted}
        />
      </div>
    </div>
  );
};

export default MyProfile;
