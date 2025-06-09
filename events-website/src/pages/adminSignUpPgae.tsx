import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { auth } from '../utils/firebase';
import supabase from '../utils/supabase';
import { useNavigate } from 'react-router-dom';

const AdminSignUpScreen = () => {
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("")
  const [lastName, setLastName] = useState<string>("")
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;
       
      if (currentUser) {
        // Insert user profile into Supabase using Firebase UID (not ID token)
        const { data, error } = await supabase
          .from('Users')
          .insert([
            { 
              firebase_uid: currentUser.uid, // Use UID, not ID token
              username: username, 
              email: email, 
              avatar_url: "https://img.freepik.com/free-photo/yellow-ticket-top-view_1101-121.jpg?semt=ais_items_boosted&w=740",
              first_name: firstName,
              last_name: lastName,
              admin: true
            },
          ])
          .select(); // Add select() to get the inserted data
        
        if (error) {
          console.error('Supabase error:', error);
          setError(`Failed to create user profile: ${error.message}`);
          return;
        }
        
        if (data) {
          console.log('User profile created:', data);
          console.log('Firebase user created:', userCredential.user);
          
          // Navigate to home page
          navigate('/home', { replace: true });
        }
      }
      
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Super Secret Admin Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '12px',
            margin: '8px 0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />
        <input
          type="text" // Changed from "username" to "text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          style={{
            width: '100%',
            padding: '12px',
            margin: '8px 0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />
        <input
          type="text" 
          placeholder="fist name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          minLength={1}
          style={{
            width: '100%',
            padding: '12px',
            margin: '8px 0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />
        <input
          type="text" 
          placeholder="last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          minLength={1}
          style={{
            width: '100%',
            padding: '12px',
            margin: '8px 0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={{
            width: '100%',
            padding: '12px',
            margin: '8px 0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />

        {error && (
          <div style={{ color: 'red', margin: '8px 0', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default AdminSignUpScreen;