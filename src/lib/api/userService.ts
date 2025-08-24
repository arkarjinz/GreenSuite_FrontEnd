import { UserProfileDto } from '../../types/user';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
// Helper function to get token from localStorage (same as your goal.ts)
const getLocalStorageItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};
export class UserService {
  static async getUserProfile(userId?: string): Promise<UserProfileDto> {
    try {
      const token = getLocalStorageItem('accessToken');
      const endpoint = userId ? `/users/${userId}/profile` : '/users/profile';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if you have JWT token
          'Authorization': `Bearer ${token}` // ✅ UNCOMMENTED & USING YOUR TOKEN
        },
        credentials: 'include', // Include cookies if using session-based auth
      });
// ✅ HANDLE 401 UNAUTHORIZED (same as your goal.ts)
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        throw new Error('Session expired. Please login again.');
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }

      const userData: UserProfileDto = await response.json();
      return userData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  static async updateUserProfile(profileData: Partial<UserProfileDto>): Promise<UserProfileDto> {
    try {
      const token = getLocalStorageItem('accessToken');
      if (!token) {
        throw new Error('User not authenticated. Please login again.');
      }
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${getAuthToken()}`
       'Authorization': `Bearer ${token}` // ✅ UNCOMMENTED
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });
 // ✅ HANDLE 401 UNAUTHORIZED
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        throw new Error('Session expired. Please login again.');
      }
      if (!response.ok) {
        throw new Error(`Failed to update user profile: ${response.statusText}`);
      }

      const updatedUser: UserProfileDto = await response.json();
      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}