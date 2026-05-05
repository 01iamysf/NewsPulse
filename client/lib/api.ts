const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string; confirmPassword: string }) =>
      fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => fetchAPI('/auth/logout', { method: 'POST' }),
    me: () => fetchAPI('/auth/me'),
  },

  news: {
    list: (params?: { page?: number; limit?: number; category?: string; search?: string; author?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.category) searchParams.set('category', params.category);
      if (params?.search) searchParams.set('search', params.search);
      if (params?.author) searchParams.set('author', params.author);
      const query = searchParams.toString();
      return fetchAPI(`/news${query ? `?${query}` : ''}`);
    },
    get: (id: string) => fetchAPI(`/news/${id}`),
    create: (data: any) => fetchAPI('/news', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/news/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/news/${id}`, { method: 'DELETE' }),
    breaking: () => fetchAPI('/news/breaking'),
    featured: () => fetchAPI('/news/featured'),
    popular: (limit?: number) => fetchAPI(`/news/popular${limit ? `?limit=${limit}` : ''}`),
    trending: (limit?: number) => fetchAPI(`/news/trending${limit ? `?limit=${limit}` : ''}`),
    subscriptions: (params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      const query = searchParams.toString();
      return fetchAPI(`/news/subscriptions${query ? `?${query}` : ''}`);
    },
    like: (id: string) => fetchAPI(`/news/${id}/like`, { method: 'POST' }),
    stats: () => fetchAPI('/news/stats/admin'),
  },

  users: {
    me: () => fetchAPI('/users/me'),
    get: (id: string) => fetchAPI(`/users/${id}`),
    updateProfile: (data: any) => fetchAPI('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
    subscribe: (creatorId: string) => fetchAPI(`/users/subscribe/${creatorId}`, { method: 'POST' }),
    checkSubscription: (creatorId: string) => fetchAPI(`/users/check-subscription/${creatorId}`),
    getSubscribers: (id: string, params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      const query = searchParams.toString();
      return fetchAPI(`/users/${id}/subscribers${query ? `?${query}` : ''}`);
    },
    getSubscribing: (id: string, params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      const query = searchParams.toString();
      return fetchAPI(`/users/${id}/subscribing${query ? `?${query}` : ''}`);
    },
    getArticles: (id: string, params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      const query = searchParams.toString();
      return fetchAPI(`/users/${id}/articles${query ? `?${query}` : ''}`);
    },
    bookmarks: () => fetchAPI('/users/bookmarks'),
    toggleBookmark: (newsId: string) => fetchAPI(`/users/bookmarks/${newsId}`, { method: 'POST' }),
    earningsStats: () => fetchAPI('/users/earnings/stats'),
    enableMonetization: () => fetchAPI('/users/monetization/enable', { method: 'POST' }),
    list: (params?: { page?: number; limit?: number; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return fetchAPI(`/users${query ? `?${query}` : ''}`);
    },
    topCreators: (limit?: number) => fetchAPI(`/users/top-creators${limit ? `?limit=${limit}` : ''}`),
    adminList: (params?: { page?: number; limit?: number; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.search) searchParams.set('search', params.search);
      return fetchAPI(`/users/admin/list?${searchParams.toString()}`);
    },
    updateStatus: (id: string, isActive: boolean) =>
      fetchAPI(`/users/admin/${id}/status`, { method: 'PUT', body: JSON.stringify({ isActive }) }),
  },

  earnings: {
    request: (data: { amount: number; paymentMethod: string }) =>
      fetchAPI('/earnings/request', { method: 'POST', body: JSON.stringify(data) }),
    history: (params?: { page?: number; limit?: number; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.status) searchParams.set('status', params.status);
      const query = searchParams.toString();
      return fetchAPI(`/earnings/history${query ? `?${query}` : ''}`);
    },
    summary: () => fetchAPI('/earnings/summary'),
    adminList: (params?: { page?: number; limit?: number; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.status) searchParams.set('status', params.status);
      return fetchAPI(`/earnings?${searchParams.toString()}`);
    },
    updateStatus: (id: string, data: { status: string; transactionId?: string; notes?: string }) =>
      fetchAPI(`/earnings/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  
  ads: {
    list: () => fetchAPI('/ads'),
    random: () => fetchAPI('/ads/random'),
    create: (data: any) => fetchAPI('/ads', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/ads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/ads/${id}`, { method: 'DELETE' }),
    trackClick: (id: string) => fetchAPI(`/ads/click/${id}`),
  },
};

export type User = {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profile: {
    bio: string;
    avatar: string;
    coverImage: string;
    location: string;
    website: string;
    socialLinks: {
      twitter: string;
      facebook: string;
      instagram: string;
      linkedin: string;
    };
  };
  stats: {
    followersCount: number;
    followingCount: number;
    totalLikesReceived: number;
    totalViewsReceived: number;
    articlesPublished: number;
  };
  monetization: {
    isEnabled: boolean;
    isEligible: boolean;
    totalEarnings: number;
    pendingEarnings: number;
    withdrawnAmount: number;
    monetizationEnabledAt: string | null;
  };
  paymentInfo: {
    paypalEmail: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  };
  createdAt: string;
};

export type News = {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  tags: string[];
  isBreaking: boolean;
  isPremium: boolean;
  views: number;
  likesCount: number;
  author: User;
  createdAt: string;
  isLiked?: boolean;
  isLocked?: boolean;
};

export type Ad = {
  _id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  cpm: number;
  stats: {
    views: number;
    clicks: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
