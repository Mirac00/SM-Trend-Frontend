export interface PostFile {
  id: number;
  fileName: string;
  fileType: string;
  fileUrl: string;
  postId: number;
}

export interface PostFileRequest {
  fileName: string;
  fileType: string;
  fileContent: string;
}
