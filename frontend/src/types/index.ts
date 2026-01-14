export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  category: string;
  previewImages: string[];
  externalLink: string;
  isPublic: boolean;
  metadata?: {
    version?: string;
    year?: number;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
  };
  collaborators?: Array<{
    id: string;
    creator: {
      id: string;
      name: string;
    };
  }>;
}

export interface Rating {
  id: string;
  rating: number;
  feedback?: string;
  ipHash: string;
  createdAt: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  socialLinks: Record<string, string>;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export interface Admin {
  id: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}

export interface Analytics {
  projects: {
    total: number;
    public: number;
    recent: number;
  };
  ratings: {
    total: number;
    average: number;
    recent: number;
  };
  messages: {
    total: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
