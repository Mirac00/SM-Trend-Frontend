import axios from 'axios';
import { Post, PostFile } from '../models/PostModel';

const API_URL = 'https://localhost:44352/Posts';

export const PostService = {
  API_URL: API_URL,

  /**
   * Pobierz wszystkie posty.
   */
  async getAllPosts(): Promise<Post[]> {
    try {
      const response = await axios.get<Post[]>(API_URL);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Get all posts error:');
      return [];
    }
  },

  /**
   * Pobierz przefiltrowane posty na podstawie typu pliku i wyszukiwanego terminu.
   */
  async getFilteredPosts(fileType: string, searchTerm: string): Promise<Post[]> {
    try {
      const params = {
        fileType: fileType || '',
        searchTerm: searchTerm || '',
      };
      const response = await axios.get<Post[]>(`${API_URL}/filtered`, { params });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Get filtered posts error:');
      throw error;
    }
  },

  /**
   * Pobierz posty utworzone przez określonego użytkownika.
   */
  async getPostsByUser(userId: number): Promise<Post[]> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('User is not authenticated');
      }

      const response = await axios.get<Post[]>(`${API_URL}/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      this.handleError(error, 'Get posts by user error:');
      throw error;
    }
  },

  /**
   * Pobierz posty polubione przez określonego użytkownika.
   */
  async getLikedPostsByUser(userId: number): Promise<Post[]> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('User is not authenticated');
      }

      const response = await axios.get<Post[]>(`${API_URL}/liked/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      this.handleError(error, 'Get liked posts by user error:');
      throw error;
    }
  },

  /**
   * Pobierz pojedynczy post po ID.
   */
  async getPostById(postId: number): Promise<Post> {
    try {
      const response = await axios.get<Post>(`${API_URL}/${postId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Get post by ID error:');
      throw error;
    }
  },

  /**
   * Pobierz miniaturkę pliku (obraz) dla danego posta i pliku.
   */
  async getFileThumbnail(postId: number, fileId: number): Promise<string> {
    try {
      const response = await axios.get(`${API_URL}/${postId}/files/${fileId}/thumbnail`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(response.data);
      return url;
    } catch (error) {
      this.handleError(error, 'Get file thumbnail error:');
      throw error;
    }
  },

  /**
   * Pobierz zawartość pliku do wyświetlenia (bez pobierania).
   */
  async getFileContentForView(postId: number, fileId: number): Promise<Blob> {
    try {
      const response = await axios.get(`${API_URL}/${postId}/files/${fileId}/content`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Get file content for view error:');
      throw error;
    }
  },

  /**
   * Pobierz zawartość pliku do pobrania.
   */
  async getFileContentForDownload(postId: number, fileId: number): Promise<Blob> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('User is not authenticated');
      }
  
      const response = await axios.get(`${API_URL}/${postId}/files/${fileId}/download`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Get file content for download error:');
      throw error;
    }
  },
  

  /**
   * Polub post.
   */
  async likePost(postId: number): Promise<void> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('User is not authenticated.');

      await axios.post(
        `${API_URL}/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      this.handleError(error, 'Like post error:');
      throw error;
    }
  },

  /**
   * Odrzuć post.
   */
  async dislikePost(postId: number): Promise<void> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('User is not authenticated.');

      await axios.post(
        `${API_URL}/${postId}/dislike`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      this.handleError(error, 'Dislike post error:');
      throw error;
    }
  },

  /**
   * Pobierz status polubienia użytkownika dla danego posta.
   */
  async getUserLikeStatus(postId: number): Promise<'like' | 'dislike' | null> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('User is not authenticated.');

      const response = await axios.get<{ isLike: boolean | null }>(`${API_URL}/${postId}/like-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.isLike === null) {
        return null;
      } else if (response.data.isLike) {
        return 'like';
      } else {
        return 'dislike';
      }
    } catch (error) {
      this.handleError(error, 'Get user like status error:');
      return null;
    }
  },

  /**
   * Utwórz nowy post z opcjonalnym plikiem.
   */
  async createPost(postData: { title: string; content: string; category: string; file?: File }): Promise<Post> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('User is not authenticated.');

      let fileData = undefined;
      if (postData.file) {
        const base64Content = await this.convertFileToBase64(postData.file);
        fileData = {
          fileName: postData.file.name,
          fileType: postData.file.type,
          fileContent: base64Content,
        };
      }

      const response = await axios.post<Post>(
        API_URL,
        {
          title: postData.title,
          content: postData.content,
          category: postData.category,
          file: fileData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      this.handleError(error, 'Create post error:');
      throw error;
    }
  },

  /**
   * Zaktualizuj istniejący post.
   */
  async updatePost(postId: number, updatedPost: { title: string; content: string; category: string; file?: { fileName: string; fileType: string; fileContent: string } }): Promise<Post> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('User is not authenticated.');

      const response = await axios.put<Post>(
        `${API_URL}/${postId}`,
        updatedPost,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Update post error:');
      throw error;
    }
  },

  /**
   * Usuń post.
   */
  async deletePost(postId: number): Promise<void> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('User is not authenticated.');

      await axios.delete(`${API_URL}/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      this.handleError(error, 'Delete post error:');
      throw error;
    }
  },

  /**
   * Dodaj plik do istniejącego posta.
   */
  async addFileToPost(postId: number, file: File): Promise<void> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('User is not authenticated.');

      const base64Content = await this.convertFileToBase64(file);
      const fileData = {
        fileName: file.name,
        fileType: file.type,
        fileContent: base64Content,
      };

      await axios.post(
        `${API_URL}/${postId}/files`,
        fileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      this.handleError(error, 'Add file to post error:');
      throw error;
    }
  },

  /**
   * Usuń plik z posta.
   */
  async removeFileFromPost(postId: number, fileId: number): Promise<void> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('User is not authenticated.');

      await axios.delete(`${API_URL}/${postId}/files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      this.handleError(error, 'Remove file from post error:');
      throw error;
    }
  },

  /**
   * Pobierz top 10 najbardziej lubianych postów.
   */
  async getTopLikedPosts(): Promise<Post[]> {
    try {
        const response = await axios.get<Post[]>(`${API_URL}/top-liked`);
        return response.data;
    } catch (error) {
        this.handleError(error, 'Get top liked posts error:');
        throw error;
    }
},


  /**
   * Konwertuj obiekt File na base64.
   */
  async convertFileToBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Usunięcie prefiksu 'data:*/*;base64,'
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },

  /**
   * Pobierz token JWT z localStorage.
   */
  getToken(): string | null {
    return localStorage.getItem('jwt');
  },

  /**
   * Obsłuż błędy z żądań Axios.
   */
  handleError(error: unknown, message: string): void {
    if (axios.isAxiosError(error)) {
      console.error(message, error.response?.status, error.response?.data);
    } else {
      console.error(message, error);
    }
  },
};
