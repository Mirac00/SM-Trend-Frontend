import { PostFile } from './PostFileModel';

export interface Post {
  id: number;
  title: string;
  content: string;
  userId: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
  files: PostFile[];
  likes: number; // Dodane pole dla like'ów
  dislikes: number; // Dodane pole dla dislike'ów
}

export type { PostFile };
