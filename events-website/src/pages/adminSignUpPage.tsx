import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { auth } from '../utils/firebase';
import supabase from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import useAdminCheck from '../Hooks/useAdminCheck'
import Loading from '../components/SpinnerLoader';

const AdminSignUpScreen = () => {
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const { isAdmin, loading: adminLoading } = useAdminCheck()
  const navigate = useNavigate();
 
  useEffect(() => {
    setTimeout(() => setPageLoading(false), 330);
  }, []);

  if (pageLoading) return <Loading />;
  if (adminLoading) return <Loading />;
  if (!isAdmin) {
    return (
      <div className="container mt-5">
        <h3>Access Denied</h3>
        <p>You must be an admin to access this page.</p>
      </div>
    );
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;

      if (currentUser) {
        const { data, error } = await supabase
          .from('Users')
          .insert([
            {
              firebase_uid: currentUser.uid,
              username: username,
              email: email,
              avatar_url: "https://img.freepik.com/free-photo/yellow-ticket-top-view_1101-121.jpg?semt=ais_items_boosted&w=740",
              first_name: firstName,
              last_name: lastName,
              admin: true
            }
          ])
          .select();

        if (error) {
          console.error('Supabase error:', error);
          setError(`Failed to create user profile: ${error.message}`);
          return;
        }

        if (data) {
          console.log('Admin user profile created:', data);
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
    <div className="container d-flex justify-content-center align-items-start py-5">
      <div className='card shadow p-4 w-100'>

      <h2>Admin Account Registration</h2>
      <form onSubmit={handleSignUp}>
        <div className="input-group mb-3">
          <div className="input-group-append">
            <span className="input-group-text" id="basic-addon1" aria-label="Email Address">Email</span>
          </div>
          <input
            className="form-control"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group mb-3">
          <div className="input-group-append">
            <span className="input-group-text" id="basic-addon1" aria-label="Username">Username</span>
          </div>
          <input
            className="form-control"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
          />
        </div>

        <div className="input-group mb-3">
          <div className="input-group-append">
            <span className="input-group-text" id="basic-addon1" aria-label="First Name">First Name</span>
          </div>
          <input
            className="form-control"
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            minLength={1}
          />
        </div>

        <div className="input-group mb-3">
          <div className="input-group-append">
            <span className="input-group-text" id="basic-addon1" aria-label="Last Name">Last Name</span>
          </div>
          <input
            className="form-control"
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            minLength={1}
          />
        </div>

        <div className="input-group mb-3">
          <div className="input-group-append">
            <span className="input-group-text" id="basic-addon1" aria-label="Password">Password</span>
          </div>
          <input
            className="form-control"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {error && (
          <div style={{ color: 'red', margin: '8px 0', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`btn ${loading ? 'btn-secondary' : 'btn-primary'} w-100`}
          style={{ cursor: loading ? 'not-allowed' : 'pointer', backgroundColor: '#C5EDCA', color: '#000', borderColor: '#C5EDCA' }}
        >
          {loading ? 'Creating Admin Account...' : 'Sign Up as Admin'}
        </button>
      </form>

      </div>
    </div>
  );
};

export default AdminSignUpScreen;
