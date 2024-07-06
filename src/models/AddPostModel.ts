import { PostFileRequest } from './PostFileModel';

export interface AddPostRequest {
  title: string;
  content: string;
  files?: PostFileRequest[]; // Dodane pole
}
