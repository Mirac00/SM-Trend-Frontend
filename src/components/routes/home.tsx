import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import PostComponent from '../common/PostComponent';
import AddPostComponent from '../common/AddPostComponent';
import FilterComponent from '../common/FilterComponent';
import { useAuth } from '../../components/common/AuthContext';

/**
 * Komponent reprezentujący stronę główną aplikacji.
 * Pozwala na dodawanie nowych postów i wyświetlanie istniejących.
 */
function Home() {
  const [updatePosts, setUpdatePosts] = useState(false);
  const [filter, setFilter] = useState({ fileType: '', searchTerm: '' });
  const { user } = useAuth();

  /**
   * Obsługa dodania nowego posta.
   */
  const handlePostAdded = () => {
    setUpdatePosts(!updatePosts);
  };

  /**
   * Obsługa zmiany filtra.
   */
  const handleFilterChange = (filter: { fileType: string; searchTerm: string }) => {
    setFilter(filter);
  };

  return (
    <React.Fragment>
      <div className="container mt-3">
        <div className="grid">
          <div className="row">
            <div className="col">
              {user && <AddPostComponent onPostAdded={handlePostAdded} />}
              <FilterComponent onFilterChange={handleFilterChange} />
              <PostComponent key={updatePosts ? 'updatePostsKey' : null} filter={filter} userId={user?.id} />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Home;
