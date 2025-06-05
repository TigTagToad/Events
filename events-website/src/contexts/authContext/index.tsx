import React, { useContext, useState, useEffect, type ReactNode } from "react";
import { auth } from "../../utils/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import supabase from "../../utils/supabase";

// Define user profile from Supabase
interface UserProfile {
  firebase_uid: string;
  email: string;
  username?: string;
  avatar_url?: string;
}

// Define the shape of our context value
interface AuthContextType {
  userLoggedIn: boolean;
  isEmailUser: boolean;
  currentUser: User | null;
  userProfile: UserProfile | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  refreshUserProfile: () => Promise<void>;
  logout: () => Promise<void>; // Add logout function
}

// Define props for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [isEmailUser, setIsEmailUser] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to fetch user profile from Supabase
  const fetchUserProfile = async (firebaseUid: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('Users')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - user profile doesn't exist
          console.log('No user profile found for Firebase UID:', firebaseUid);
          return null;
        }
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Function to create user profile in Supabase
  const createUserProfile = async (user: User): Promise<UserProfile | null> => {
    try {
      const profileData = {
        firebase_uid: user.uid,
        email: user.email!,
        username: user.displayName || null,
        avatar_url: user.photoURL || null,
      };

      const { data, error } = await supabase
        .from('Users')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      console.log('Created new user profile:', data);
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  };

  // Function to refresh user profile (can be called from components)
  const refreshUserProfile = async (): Promise<void> => {
    if (currentUser) {
      const profile = await fetchUserProfile(currentUser.uid);
      setUserProfile(profile);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      // Firebase auth state change will automatically trigger initializeUser(null)
      // which will clear the user state
    } catch (error) {
      console.error('Error signing out:', error);
      throw error; // Re-throw so components can handle the error if needed
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  async function initializeUser(user: User | null) {
    if (user) {
      setCurrentUser(user);

      // Check if provider is email and password login
      const isEmail = user.providerData.some(
        (provider) => provider.providerId === "password"
      );
      setIsEmailUser(isEmail);

      // Fetch user profile from Supabase
      let profile = await fetchUserProfile(user.uid);
      
      // If no profile exists, create one
      if (!profile && user.email) {
        profile = await createUserProfile(user);
      }

      setUserProfile(profile);
      setUserLoggedIn(true);
    } else {
      setCurrentUser(null);
      setUserProfile(null);
      setUserLoggedIn(false);
      setIsEmailUser(false);
    }

    setLoading(false);
  }

  const value: AuthContextType = {
    userLoggedIn,
    isEmailUser,
    currentUser,
    userProfile,
    setCurrentUser,
    refreshUserProfile,
    logout, // Add logout to context value
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}