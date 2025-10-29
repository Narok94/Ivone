import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (username: string, pass: string) => void;
  logout: () => void;
  addUser: (username: string, pass: string, gender: 'male' | 'female') => void;
  updatePassword: (userId: string, pass: string) => void;
  deleteUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialUsers: User[] = [
    { id: '1', username: 'admin', password: 'admin', role: 'admin', gender: 'male' },
    { id: '2', username: 'ivone', password: 'ivone1234', role: 'user', gender: 'female' },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useLocalStorage<User[]>('users', initialUsers);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  
  const login = useCallback((username: string, pass: string) => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === pass);
    if (user) {
        setCurrentUser(user);
    } else {
        throw new Error('Usuário ou senha inválidos.');
    }
  }, [users, setCurrentUser]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, [setCurrentUser]);
  
  const addUser = useCallback((username: string, pass: string, gender: 'male' | 'female') => {
      if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
          throw new Error('Este nome de usuário já existe.');
      }
      const newUser: User = {
          id: crypto.randomUUID(),
          username,
          password: pass,
          role: 'user',
          gender,
      };
      setUsers(prev => [...prev, newUser]);
  }, [users, setUsers]);
  
  const updatePassword = useCallback((userId: string, pass: string) => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: pass } : u));
  }, [setUsers]);

  const deleteUser = useCallback((userId: string) => {
      const userToDelete = users.find(u => u.id === userId);
      if (userToDelete?.role === 'admin') {
          throw new Error('Não é possível excluir o usuário administrador.');
      }
      setUsers(prev => prev.filter(u => u.id !== userId));
  }, [users, setUsers]);


  const value = {
    currentUser,
    users,
    login,
    logout,
    addUser,
    updatePassword,
    deleteUser,
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