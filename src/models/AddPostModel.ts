import { PostFileRequest } from './PostFileModel';

export interface AddPostRequest {
  title: string;
  content: string;
  category: string; // Dodane pole kategorii
  file?: PostFileRequest; // Zmienione z files? na file?
}
