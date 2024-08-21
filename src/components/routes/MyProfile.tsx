import React, { useState, useEffect } from 'react';
import { UserService } from '../../services/UserService';
import PostComponent from '../common/PostComponent';
import { User } from '../../models/User';

const MyProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'liked' | 'my'>('liked');

  useEffect(() => {
    const fetchUserProfile = async () => {
      const jwt = localStorage.getItem('jwt');
      if (jwt) {
        const fetchedUser = await UserService.getUserByToken(jwt);
        setUser(fetchedUser);
      }
    };

    fetchUserProfile();
  }, []);

  const handleUpdateProfile = async (updatedUser: Partial<User>) => {
    if (user) {
      await UserService.updateProfile(user.id, updatedUser);
      setUser({ ...user, ...updatedUser });
    }
  };

  return (
    <div className="container mt-3">
      <h2>Mój Profil</h2>
      {user && (
        <div className="profile-section">
          <h3>Aktualizuj swoje dane</h3>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile({ ...user }); }}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
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
      )}

      <div className="posts-section mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>{view === 'liked' ? 'Polubione Posty' : 'Moje Posty'}</h3>
          <button className="btn btn-secondary" onClick={() => setView(view === 'liked' ? 'my' : 'liked')}>
            {view === 'liked' ? 'Moje Posty' : 'Polubione Posty'}
          </button>
        </div>
        <PostComponent filter={{ fileType: '', searchTerm: '' }} userId={user?.id || 0} />
      </div>
    </div>
  );
};

export default MyProfile;
