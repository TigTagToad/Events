import React, { useState, useEffect} from 'react'
import type { FormEvent } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/authContext'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../utils/firebase'
import Loading from '../components/SpinnerLoader'

const SignInScreen: React.FC = () => {
    const { userLoggedIn } = useAuth()

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [isSigningIn, setIsSigningIn] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true)
   
    useEffect(() => {

        setTimeout(() => setLoading(false), 330)
    }, [])
    if (loading) {
        return <Loading/>
    }

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isSigningIn) {
        setIsSigningIn(true)
        setErrorMessage('')  
        try {                
            await signInWithEmailAndPassword(auth, email, password)
            // Context will automatically update via Firebase listener
        } catch (error: any) {           
            setErrorMessage(error.message)  
            setIsSigningIn(false)         
        }
    }
    }



    if (userLoggedIn) {
        
        return <Navigate to="/home" replace />
    }

    return (
        
            <div className="container d-flex justify-content-center align-items-start py-5">
                <div className='card shadow p-4 w-100'>

                <div>
                    <h3>Welcome Back</h3>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="input-group mb-3">
                        
                        <div className="input-group-append">
                            <span className="input-group-text" id="basic-addon1"
                            aria-label="Login Email Address">Email</span>
                        </div>
                        <input
                            className='form-control'
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="input-group mb-3">
                        <div className="input-group-append">
                            <span className="input-group-text" id="basic-addon1" aria-label="Login Password">Password</span>
                        </div>
                        <input
                            className='form-control'
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {errorMessage && (
                        <span>{errorMessage}</span>
                    )}

                    <button
                        className='m-3'
                        type="submit"
                        disabled={isSigningIn}
                    >
                        {isSigningIn ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
                <>
                </>
                <p>
                    Don't have an account?{' '}
                    <Link to="/signup">Sign up</Link>
                </p>
                </div>


            </div>
    
    )
}

export default SignInScreen