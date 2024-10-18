import { useAuth } from '../app/contexts/AuthContext';

export const useAuthFetch = () => {
  const { refreshToken } = useAuth();

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 401) {
        // Token might be expired, try to refresh
        const newToken = await refreshToken();
        if (newToken) {
          // Retry the request with the new token
          headers['Authorization'] = `Bearer ${newToken}`;
          return fetch(url, { ...options, headers });
        } else {
          throw new Error('Failed to refresh token');
        }
      }

      return response;
    } catch (error) {
      console.error('Error in authFetch:', error);
      throw error;
    }
  };

  return authFetch;
};