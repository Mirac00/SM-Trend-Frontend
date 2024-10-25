import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Post, PostFile } from '../../models/PostModel';
import { PostService } from '../../services/PostService';
import 'react-h5-audio-player/lib/styles.css';
import AudioPlayer from 'react-h5-audio-player';
import { useAuth } from '../../components/common/AuthContext';

interface TopTrendProps {}

const TopTrend: React.FC<TopTrendProps> = () => {
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const { user } = useAuth(); // Używamy AuthContext

  useEffect(() => {
    const fetchTopPosts = async () => {
      try {
        const posts = await PostService.getTopLikedPosts();
        setTopPosts(posts);
      } catch (error) {
        console.error('Error fetching top liked posts:', error);
      }
    };

    fetchTopPosts();
  }, []);

  const handleDownload = async (postId: number, fileId: number, fileName: string) => {
    try {
      const blob = await PostService.getFileContentForDownload(postId, fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const renderFile = (postId: number, file: PostFile) => {
    if (!file) return null;

    if (file.fileType.startsWith('image/')) {
      return (
        <div key={file.id} className="mb-3">
          <img src={`${PostService.API_URL}/${postId}/files/${file.id}/content`} alt={file.fileName} className="img-fluid" />
          {user ? (
            <button onClick={() => handleDownload(postId, file.id, file.fileName)} className="btn btn-primary mt-2">Pobierz</button>
          ) : (
            <p>Aby pobrać plik, zaloguj się</p>
          )}
        </div>
      );
    }

    if (file.fileType.startsWith('video/')) {
      return (
        <div key={file.id} className="mb-3">
          <video controls className="img-fluid">
            <source src={`${PostService.API_URL}/${postId}/files/${file.id}/content`} type={file.fileType} />
          </video>
          {user ? (
            <button onClick={() => handleDownload(postId, file.id, file.fileName)} className="btn btn-primary mt-2">Pobierz</button>
          ) : (
            <p>Aby pobrać plik, zaloguj się</p>
          )}
        </div>
      );
    }

    if (file.fileType.startsWith('audio/')) {
      return (
        <div key={file.id} className="mb-3">
          <AudioPlayer
            src={`${PostService.API_URL}/${postId}/files/${file.id}/content`}
            onPlay={() => console.log("onPlay")}
          />
          {user ? (
            <button onClick={() => handleDownload(postId, file.id, file.fileName)} className="btn btn-primary mt-2">Pobierz</button>
          ) : (
            <p>Aby pobrać plik, zaloguj się</p>
          )}
        </div>
      );
    }

    // Domyślna obsługa dla nieznanych typów plików
    return (
      <div key={file.id} className="mb-3">
        <p>Nieobsługiwany typ pliku</p>
        {user ? (
          <button onClick={() => handleDownload(postId, file.id, file.fileName)} className="btn btn-primary mt-2">Pobierz</button>
        ) : (
          <p>Aby pobrać plik, zaloguj się</p>
        )}
      </div>
    );
  };

  return (
    <React.Fragment>
      <div className="container mt-3">
        <div className="row">
          <div className="col">
            <h3 className="mb-4 text-center">Top 10 Najbardziej Lajkowanych Postów</h3>
            {topPosts.length === 0 ? (
              <p className="text-center">Brak dostępnych postów</p>
            ) : (
              <ol className="list-group list-group-numbered">
                {topPosts.map((post, index) => (
                  <li key={post.id} className="mb-3 p-3 bg-light border border-dark rounded">
                    <div className="d-flex justify-content-between align-items-center">
                      <h4 className="mb-1">{index + 1}. {post.title}</h4>
                      <div>
                        <span className="badge bg-primary rounded-pill me-2">Lajki: {post.likes}</span>
                        <span className="badge bg-secondary rounded-pill">Dislajki: {post.dislikes}</span>
                      </div>
                    </div>
                    <p>{post.content}</p>
                    <p><strong>Autor:</strong> {post.user.firstName} {post.user.lastName}</p>
                    {post.files && post.files.length > 0 && (
                      <div>
                        <h5>Plik:</h5>
                        <div>
                          {post.files.map((file) => renderFile(post.id, file))}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default TopTrend;
