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
  }
  