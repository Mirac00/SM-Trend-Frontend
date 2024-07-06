export interface PostFile {
  id: number;
  fileName: string;
  fileType: string;
  fileUrl: string; // Dodane pole na URL pliku
  postId: number;
}

  
  export interface PostFileRequest {
    fileName: string;
    fileType: string;
    fileContent: string; // Base64 encoded content
  }
  