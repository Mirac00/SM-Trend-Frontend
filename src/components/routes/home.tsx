import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import PostComponent from '../common/PostComponent';
import AddPostComponent from '../common/AddPostComponent';
import FilterComponent from '../common/FilterComponent';
import { useAuth } from '../../components/common/AuthContext';
import '../../style/homeStyle.css';
import AnimatedBanner from '../common/AnimatedBaner';

/**
 * Komponent reprezentujący stronę główną aplikacji.
 * Pozwala na dodawanie nowych postów i wyświetlanie istniejących.
 */
function Home() {
  const [updatePosts, setUpdatePosts] = useState(false);
  const [filter, setFilter] = useState({ fileType: '', searchTerm: '', sortOption: 'latest' });
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
  const handleFilterChange = (newFilter: { fileType: string; searchTerm: string; sortOption: string }) => {
    setFilter(newFilter);
  };

  return (
    <React.Fragment>
      <div className="container mt-3 home-container">
        {/* Filtr na desktopie pozycjonowany absolutnie, a na mobile pod AddPostComponent */}
        <div className="filter-column d-none d-md-block">
          <FilterComponent onFilterChange={handleFilterChange} />
        </div>

        <div className="row main-content">
          <div className="col-12 mb-3">
            {user ? (
              <AddPostComponent onPostAdded={handlePostAdded} />
            ) : (
              <AnimatedBanner />
            )}
          </div>

          {/* Filtr na wersji mobilnej */}
          <div className="col-12 d-md-none mb-3">
            <FilterComponent onFilterChange={handleFilterChange} />
          </div>

          {/* Lista postów */}
          <div className="col-12">
            <PostComponent
              key={updatePosts ? 'updatePostsKey' : null}
              filter={filter}
              userId={user?.id}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Home;
