import { PostFile } from './PostFileModel';

export interface Post {
  id: number;
  title: string;
  content: string;
  category: string; // Dodane pole kategorii
  userId: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
  files: PostFile[];
  likes: number;
  dislikes: number;
}

export type { PostFile };
