import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import PostComponent from '../common/PostComponent';
import AddPostComponent from '../common/AddPostComponent';

/**
 * Komponent reprezentujący stronę główną aplikacji.
 * Pozwala na dodawanie nowych postów i wyświetlanie istniejących.
 */
function Home() {
  const [updatePosts, setUpdatePosts] = useState(false);

  /**
   * Obsługa dodania nowego posta.
   */
  const handlePostAdded = () => {
    setUpdatePosts(!updatePosts);
  };

  return (
    <React.Fragment>
      <div className="container mt-3">
        <div className="grid">
          <div className="row">
            <div className="col">
              <AddPostComponent onPostAdded={handlePostAdded} />
              <PostComponent key={updatePosts ? 'updatePostsKey' : null} />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Home;
