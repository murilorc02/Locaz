import { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from "../types";
import { users } from "../data/users";
import { useToast } from "../components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole, telephone: string, document: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  let userIdCounter = users.length + 1;

  const login = async (email: string, password: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser) {
      setUser(foundUser);
      toast({
        title: "Login successful",
        description: `Welcome back, ${foundUser.name}!`,
      });
      return;
    }
    
    throw new Error('Invalid email or password');
  };

  const signup = async (name: string, email: string, password: string, role: UserRole, telephone: string, document: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (userExists) {
      throw new Error('User with this email already exists');
    }
    
    // In a real app, this would create a user in the database
    const newUser: User = {
      id: userIdCounter++,
      name,
      email,
      password,
      role,
      avatar: `https://i.pravatar.cc/150?u=${email}`,
      telephone,
      document
    };
    
    // For demo purposes, we'll just set the user
    setUser(newUser);
    toast({
      title: "Account created",
      description: "You have successfully signed up!",
    });
  };

  const logout = () => {
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
