// SignInUp.tsx
import React, { useState } from 'react';
import { PiSuitcase } from "react-icons/pi";
import { useNavigate } from 'react-router-dom';

interface SignProps {
  inOrUp: string;
}

const Sign: React.FC<SignProps> = ({ inOrUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission behavior
    setErrorMessage(''); // Reset any previous error messages
    //for testing
    //const token = 'dummy-token';
    //localStorage.setItem('token', token);
    //navigate('/home');

    // Basic validation
    if (!email || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    try {
      // Replace with your actual backend URL
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

      const response = await fetch(`${backendUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { token } = data;
        // Store the token securely (consider using HTTP-only cookies for better security)
        localStorage.setItem('token', token);

        // Redirect to a protected route, e.g., '/home' or '/dashboard'
        navigate('/home');
      } else {
        // Handle server-side errors
        setErrorMessage(data.message || 'Login failed. Please try again.');
        console.error('Error during login:')
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <PiSuitcase className="mx-auto h-20 w-auto" size={100} />

          <h2 className="text-center text-2xl font-bold tracking-tight text-cyan-700">
            Sign {inOrUp}
          </h2>
        </div>

        <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm
                             ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2
                             focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                  Password
                </label>
                <div className="text-sm">
                  {inOrUp === "in" && (
                    <a href="#" className="font-semibold text-cyan-700 hover:text-cyan-600">
                      Forgot password?
                    </a>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm
                             ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2
                             focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="text-red-500 text-sm">
                {errorMessage}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm
                           font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline
                           focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign {inOrUp}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Sign;
