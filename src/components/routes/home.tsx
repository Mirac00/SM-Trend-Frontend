import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import PostComponent from '../common/PostComponent';
import AddPostComponent from '../common/AddPostComponent';
import FilterComponent from '../common/FilterComponent';
import { useAuth } from '../../components/common/AuthContext';
import '../../style/homeStyle.css';

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
        <div className="row">
          {/* Kolumna filtra, widoczna tylko na desktopie */}
          <div className="col-md-3 d-none d-md-block filter-column">
            <FilterComponent onFilterChange={handleFilterChange} />
          </div>

          {/* Główna kolumna postów */}
          <div className="col-12 col-md-9 main-column">
            {/* Dodaj post lub komunikat dla niezalogowanych */}
            <div className="mb-3">
              {user ? (
                <AddPostComponent onPostAdded={handlePostAdded} />
              ) : (
                <h1 className="text-center">Zaloguj się, aby dodać post / Reklama</h1>
              )}
            </div>

            {/* Filtry na wersji mobilnej, pod AddPostComponent */}
            <div className="d-md-none mb-3">
              <FilterComponent onFilterChange={handleFilterChange} />
            </div>

            {/* Lista postów */}
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
