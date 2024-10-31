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
  const { user } = useAuth();

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
          <img src={`${PostService.API_URL}/${postId}/files/${file.id}/content`} alt={file.fileName} className="img-fluid rounded" />
          {user ? (
            <button onClick={() => handleDownload(postId, file.id, file.fileName)} className="btn btn-outline-light mt-2">Pobierz</button>
          ) : (
            <p className="text-warning">Aby pobrać plik, zaloguj się</p>
          )}
        </div>
      );
    }

    if (file.fileType.startsWith('video/')) {
      return (
        <div key={file.id} className="mb-3">
          <video controls className="img-fluid rounded">
            <source src={`${PostService.API_URL}/${postId}/files/${file.id}/content`} type={file.fileType} />
          </video>
          {user ? (
            <button onClick={() => handleDownload(postId, file.id, file.fileName)} className="btn btn-outline-light mt-2">Pobierz</button>
          ) : (
            <p className="text-warning">Aby pobrać plik, zaloguj się</p>
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
            <button onClick={() => handleDownload(postId, file.id, file.fileName)} className="btn btn-outline-light mt-2">Pobierz</button>
          ) : (
            <p className="text-warning">Aby pobrać plik, zaloguj się</p>
          )}
        </div>
      );
    }

    return (
      <div key={file.id} className="mb-3">
        <p>Nieobsługiwany typ pliku</p>
        {user ? (
          <button onClick={() => handleDownload(postId, file.id, file.fileName)} className="btn btn-outline-light mt-2">Pobierz</button>
        ) : (
          <p className="text-warning">Aby pobrać plik, zaloguj się</p>
        )}
      </div>
    );
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="text-center mb-5">
        <h1 className="text-light mb-4" style={{ textShadow: '0px 0px 10px gold, 0px 0px 20px gold', animation: 'shine 2s infinite alternate' }}>Top Trend</h1>
        <div className="row g-4 justify-content-center">
          {topPosts[0] && (
            <div className="col-12 col-lg-6">
              <div className="card h-100 text-light bg-dark rounded-4 p-3" style={{ boxShadow: 'inset 0 0 30px gold, 0 0 20px gold', animation: 'shine 2s infinite alternate' }}>
                <h4 className="card-title text-warning text-center">1. {topPosts[0].title}</h4>
                <p className="card-text text-center">{topPosts[0].content}</p>
                <p className="text-center"><strong>Autor:</strong> {topPosts[0].user.firstName} {topPosts[0].user.lastName}</p>
                <p className="text-center"><strong>Kategoria:</strong> {topPosts[0].category}</p>
                <div className="d-flex justify-content-center mt-2 mb-2">
                  <span className="badge bg-success me-2">Lajki: {topPosts[0].likes}</span>
                  <span className="badge bg-danger">Dislajki: {topPosts[0].dislikes}</span>
                </div>
                {topPosts[0].files && topPosts[0].files.map(file => renderFile(topPosts[0].id, file))}
              </div>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-warning text-center mb-4">Złoto</h2>
      <div className="row g-4">
        {topPosts.slice(1, 4).map((post, index) => (
          <div key={post.id} className="col-md-4">
            <div className="card h-100 text-light bg-dark rounded-4 p-3" style={{ boxShadow: 'inset 0 0 20px gold' }}>
              <h4 className="card-title text-warning text-center">{index + 2}. {post.title}</h4>
              <p className="card-text text-center">{post.content}</p>
              <p className="text-center"><strong>Autor:</strong> {post.user.firstName} {post.user.lastName}</p>
              <p className="text-center"><strong>Kategoria:</strong> {post.category}</p>
              <div className="d-flex justify-content-center mt-2 mb-2">
                <span className="badge bg-success me-2">Lajki: {post.likes}</span>
                <span className="badge bg-danger">Dislajki: {post.dislikes}</span>
              </div>
              {post.files && post.files.map(file => renderFile(post.id, file))}
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-light text-center my-4" style={{ color: '#C0C0C0' }}>Srebro</h2>
      <div className="row g-4">
        {topPosts.slice(4, 7).map((post, index) => (
          <div key={post.id} className="col-md-4">
            <div className="card h-100 text-light bg-dark rounded-4 p-3" style={{ boxShadow: 'inset 0 0 20px silver' }}>
              <h4 className="card-title text-light text-center">{index + 5}. {post.title}</h4>
              <p className="card-text text-center">{post.content}</p>
              <p className="text-center"><strong>Autor:</strong> {post.user.firstName} {post.user.lastName}</p>
              <p className="text-center"><strong>Kategoria:</strong> {post.category}</p>
              <div className="d-flex justify-content-center mt-2 mb-2">
                <span className="badge bg-success me-2">Lajki: {post.likes}</span>
                <span className="badge bg-danger">Dislajki: {post.dislikes}</span>
              </div>
              {post.files && post.files.map(file => renderFile(post.id, file))}
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-light text-center my-4" style={{ color: '#CD7F32' }}>Brąz</h2>
      <div className="row g-4">
        {topPosts.slice(7, 10).map((post, index) => (
          <div key={post.id} className="col-md-4">
            <div className="card h-100 text-light bg-dark rounded-4 p-3" style={{ boxShadow: 'inset 0 0 20px #CD7F32' }}>
              <h4 className="card-title text-light text-center">{index + 8}. {post.title}</h4>
              <p className="card-text text-center">{post.content}</p>
              <p className="text-center"><strong>Autor:</strong> {post.user.firstName} {post.user.lastName}</p>
              <p className="text-center"><strong>Kategoria:</strong> {post.category}</p>
              <div className="d-flex justify-content-center mt-2 mb-2">
                <span className="badge bg-success me-2">Lajki: {post.likes}</span>
                <span className="badge bg-danger">Dislajki: {post.dislikes}</span>
              </div>
              {post.files && post.files.map(file => renderFile(post.id, file))}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes shine {
          0% { text-shadow: 0 0 10px gold, 0 0 20px gold, 0 0 30px gold; }
          100% { text-shadow: 0 0 20px gold, 0 0 30px gold, 0 0 40px gold; }
        }
      `}</style>
    </div>
  );
};

export default TopTrend;
