import axios from 'axios';
import { Post, PostFile } from '../models/PostModel';

const API_URL = 'https://localhost:44352/Posts';

export const PostService = {
  /**
   * Fetch all posts.
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
   * Fetch filtered posts based on file type and search term.
   */
  async getFilteredPosts(fileType: string, searchTerm: string): Promise<Post[]> {
    try {
      const params = { fileType, searchTerm };
      const response = await axios.get<Post[]>(`${API_URL}/filter`, { params });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Get filtered posts error:');
      return [];
    }
  },

  /**
   * Fetch posts created by a specific user.
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
      console.error('Error fetching user posts:', error);
      throw error;
    }
  },

  /**
   * Fetch posts liked by a specific user.
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
      console.error('Error fetching liked posts:', error);
      throw error;
    }
  },

  /**
   * Like a post.
   */
  async likePost(postId: number, userId: number): Promise<void> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('User is not authenticated.');

      await axios.post(
        `${API_URL}/like`,
        { postId, userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      this.handleError(error, 'Like post error:');
    }
  },

  /**
   * Dislike a post.
   */
  async dislikePost(postId: number, userId: number): Promise<void> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('User is not authenticated.');

      await axios.post(
        `${API_URL}/dislike`,
        { postId, userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      this.handleError(error, 'Dislike post error:');
    }
  },

  /**
   * Get the like/dislike status of the current user for a specific post.
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
   * Fetch a single post by its ID.
   */
  async getPostById(postId: number): Promise<Post> {
    try {
      const response = await axios.get<Post>(`${API_URL}/${postId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Get post by ID error:');
      return {} as Post;
    }
  },

  /**
   * Fetch the top liked posts.
   */
  async getTopLikedPosts(): Promise<Post[]> {
    try {
      const response = await axios.get<Post[]>(`${API_URL}/top-liked`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Get top liked posts error:');
      return [];
    }
  },

  /**
   * Create a new post with optional files.
   */
  async createPost(postData: { title: string; content: string; files: File[] }): Promise<Post> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('User is not authenticated.');

      // Convert files to base64
      const filesData = await Promise.all(
        postData.files.map(async (file) => {
          const base64Content = await this.convertFileToBase64(file);
          return {
            fileName: file.name,
            fileType: file.type,
            fileContent: base64Content,
          };
        })
      );

      const response = await axios.post<Post>(
        API_URL,
        {
          title: postData.title,
          content: postData.content,
          files: filesData,
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
   * Update an existing post.
   */
  async updatePost(postId: number, updatedPost: Partial<Post>): Promise<Post> {
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
   * Delete a post.
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
   * Add a file to a post.
   */
  async addFileToPost(postId: number, file: File): Promise<void> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('User is not authenticated.');

      const fileContent = await this.convertFileToBase64(file);

      const postFileRequest = {
        fileName: file.name,
        fileType: file.type,
        fileContent: fileContent,
      };

      await axios.post(
        `${API_URL}/${postId}/files`,
        postFileRequest,
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
   * Remove a file from a post.
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
   * Convert a File object to a base64 string.
   */
  async convertFileToBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the 'data:*/*;base64,' prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },

  /**
   * Retrieve the JWT token from local storage.
   */
  getToken(): string | null {
    const token = localStorage.getItem('jwt');
    if (!token) {
      console.error('User is not authenticated.');
    }
    return token;
  },

  /**
   * Handle errors from Axios requests.
   */
  handleError(error: unknown, message: string): void {
    if (axios.isAxiosError(error)) {
      console.error(message, error.response?.status, error.response?.data);
    } else {
      console.error(message, error);
    }
  },
};
