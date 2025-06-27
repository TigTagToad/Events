import React, { useContext, useState, useEffect, type ReactNode } from "react";
import { auth } from "../../utils/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import supabase from "../../utils/supabase";
import Loading from "../../components/SpinnerLoader";

// Define user profile structure as stored in Supabase database
interface UserProfile {
  firebase_uid: string;    // Links to Firebase user ID
  email: string;           // User's email address
  username?: string;       // Optional username
  avatar_url?: string;  // Optional profile picture URL
  admin?: string; 
  first_name: string;
  last_name: string
}

// Define the shape of our context value - what data/functions the context provides
interface AuthContextType {
  userLoggedIn: boolean;   // Simple boolean flag for logged in state
  currentUser: User | null; // Firebase User object or null if not logged in
  userProfile: UserProfile | null; // Supabase user profile data or null
  loading: boolean;        // Loading state during auth initialization
  
  // React.Dispatch is TypeScript's type for the setter function returned by useState
  // React.SetStateAction<T> means it can accept either:
  // 1. A direct value of type T (User | null)
  // 2. A function that receives the current state and returns the new state
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  
  refreshUserProfile: () => Promise<void>; // Function to refresh user profile from database
  logout: () => Promise<void>;             // Function to log out the user
}

// Define props that the AuthProvider component accepts
interface AuthProviderProps {
  children: ReactNode; // ReactNode = any valid React child (JSX, string, number, etc.)
}

// Create the React context with undefined as default value
// This forces us to check if context exists before using it
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Custom hook to access the auth context
// This provides a clean way for components to access auth state and functions
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext); // Get the context value
  
  // If context is undefined, it means useAuth was called outside of AuthProvider
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context; // Return the context value (guaranteed to be defined)
}

// The main AuthProvider component that wraps the app and provides auth state
export function AuthProvider({ children }: AuthProviderProps) {
  // State for the current Firebase user (null when not logged in)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // State for the user profile data from Supabase database
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Simple boolean flag for whether user is logged in
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  
  // Loading state - true during initial auth check, false once we know auth status
  const [loading, setLoading] = useState<boolean>(true);

  // Function to fetch user profile from Supabase database
  const fetchUserProfile = async (firebaseUid: string): Promise<UserProfile | null> => {
    try {
      // Query Supabase 'Users' table for a user with matching firebase_uid
      const { data, error } = await supabase
        .from('Users')           // Table name
        .select('*')             // Select all columns
        .eq('firebase_uid', firebaseUid) // WHERE firebase_uid = firebaseUid
        .single();               // Expect exactly one result

      if (error) {
        // PGRST116 is Supabase's error code for "no rows returned"
        if (error.code === 'PGRST116') {
          console.log('No user profile found for Firebase UID:', firebaseUid);
          return null; // User exists in Firebase but not in Supabase yet
        }
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data; // Return the user profile data
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Function to create a new user profile in Supabase when user first signs up
  const createUserProfile = async (user: User): Promise<UserProfile | null> => {
    try {
      // Prepare profile data from Firebase user object
      const profileData = {
        firebase_uid: user.uid,                    // Firebase user ID (required)
        email: user.email!,                       // Email (! means we're sure it exists)
        username: user.displayName || null,       // Display name or null if not set
        avatar_url: user.photoURL || null,        // Profile photo URL or null
      };

      // Insert new profile into Supabase and return the created record
      const { data, error } = await supabase
        .from('Users')           // Table name
        .insert(profileData)     // Insert the profile data
        .select()                // Return the inserted data
        .single();               // Expect exactly one result

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      console.log('Created new user profile:', data);
      return data; // Return the newly created profile
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  };

  // Function to refresh user profile from database
  // This can be called by components when they need fresh profile data
  const refreshUserProfile = async (): Promise<void> => {
    if (currentUser) { // Only refresh if user is logged in
      const profile = await fetchUserProfile(currentUser.uid);
      setUserProfile(profile); // Update the profile state
    }
  };

  // Function to log out the current user
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth); // Firebase sign out
      // Note: Firebase auth state change will automatically trigger initializeUser(null)
      // which will clear all the user state (currentUser, userProfile, userLoggedIn)
    } catch (error) {
      console.error('Error signing out:', error);
      throw error; // Re-throw so components can handle the error if needed
    }
  };

  // useEffect runs once when component mounts
  useEffect(() => {
    // onAuthStateChanged listens for Firebase auth state changes
    // It fires when: user logs in, logs out, or when app starts (to restore previous session)
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    
    // Return cleanup function to unsubscribe when component unmounts
    return unsubscribe;
  }, []); // Empty dependency array = run once on mount

  // This function is called whenever Firebase auth state changes
  // user parameter: Firebase User object if logged in, null if logged out
  async function initializeUser(user: User | null) {
    try {
      if (user) {
        // User is logged in
        setCurrentUser(user); // Store Firebase user object

        // Fetch user profile from Supabase database
        let profile = await fetchUserProfile(user.uid);
        
        // If no profile exists in Supabase, create one
        // This happens when user signs up for the first time
        if (!profile && user.email) {
          profile = await createUserProfile(user);
        }

        setUserProfile(profile);   // Store profile data (may still be null if creation failed)
        setUserLoggedIn(true);     // Set logged in flag to true
      } else {
        // User is logged out - clear all auth state
        setCurrentUser(null);
        setUserProfile(null);
        setUserLoggedIn(false);
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      // Always set loading to false, regardless of success or failure
      // This ensures the loading screen disappears even if there are errors
      setLoading(false);
    }
  }

  // Create the context value object that will be provided to all child components
  const value: AuthContextType = {
    userLoggedIn,        // Boolean flag for auth status
    currentUser,         // Firebase User object
    userProfile,         // Supabase profile data
    loading,             // Loading state
    setCurrentUser,      // Setter function for currentUser state
    refreshUserProfile,  // Function to refresh profile from database
    logout,              // Function to log out user
  };

  // Return the context provider that wraps the app
  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        // Show loading screen while checking auth status
        <div className="auth-loading">
          <Loading/>
        </div>
      ) : (
        // Once loading is complete, render the child components
        children
      )}
    </AuthContext.Provider>
  );
}