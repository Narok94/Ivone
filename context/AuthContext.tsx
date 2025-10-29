import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { User } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

// NOTE: This is a mock authentication system using localStorage.
// Passwords are not encrypted. This is for demonstration purposes only.
interface StoredUser extends User {
    passwordHash: string;
}

interface AuthContextType {
  currentUser: User | null;
  users: User[]; // For admin panel
  login: (username: string, pass: string) => Promise<void>;
  logout: () => void;
  addUser: (username: string, pass: string, gender: 'male' | 'female') => Promise<void>;
  updatePassword: (userId: string, pass: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// FIX: Added 'password' property to satisfy the 'StoredUser' type which extends 'User'.
const defaultAdminUser: StoredUser = {
    id: 'admin-user',
    username: 'admin',
    password: 'admin',
    passwordHash: 'admin',
    role: 'admin',
    gender: 'female',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useLocalStorage<StoredUser[]>('users', [defaultAdminUser]);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect simply manages the loading state on initial app load.
    // The useLocalStorage hook handles the actual data loading.
    setIsLoading(false);
  }, []);

  const login = async (username: string, pass: string) => {
    const user = users.find(u => u.username === username && u.passwordHash === pass);
    if (user) {
        const { passwordHash, ...userToStore } = user;
        setCurrentUser(userToStore);
    } else {
        throw new Error("Invalid credentials");
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };
  
  const addUser = async (username: string, pass: string, gender: 'male' | 'female') => {
    if (users.some(u => u.username === username)) {
        throw new Error("Username already exists");
    }
    // FIX: Added 'password' property to satisfy the 'StoredUser' type which extends 'User'.
    const newUser: StoredUser = {
        id: crypto.randomUUID(),
        username,
        password: pass,
        passwordHash: pass,
        gender,
        role: 'user',
    };
    setUsers(prev => [...prev, newUser]);
  };
  
  const updatePassword = async (userId: string, pass: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: pass, passwordHash: pass } : u));
  };

  const deleteUser = async (userId: string) => {
      if (currentUser?.id === userId) {
          throw new Error("Não é possível excluir o próprio usuário.");
      }
      setUsers(prev => prev.filter(u => u.id !== userId));
  };
  
  // Expose users list without password hashes
  const publicUsers = useMemo(() => {
      if (!currentUser || currentUser.role !== 'admin') return [];
      return users.map(u => {
          const { passwordHash, ...publicUser } = u;
          return publicUser;
      });
  }, [users, currentUser]);


  const value = {
    currentUser,
    users: publicUsers,
    login,
    logout,
    addUser,
    updatePassword,
    deleteUser,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
