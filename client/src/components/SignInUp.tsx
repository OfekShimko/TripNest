
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
    e.preventDefault(); 
    setErrorMessage(''); 

    
    if (!email || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    try {
      const endpoint = inOrUp === 'up' ? '/api/v1/users/signup' : '/api/v1/users/login';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { token } = data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user_email', email);
        localStorage.setItem('userId',data.userId);

        
        navigate('/home');
      } else {
        
        setErrorMessage(data.message || `Sign ${inOrUp} failed. Please try again.`);
        console.error(`Error during sign ${inOrUp}:`, data.message);
      }
    } catch (error) {
      console.error(`Error during sign ${inOrUp}:`, error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <PiSuitcase className="mx-auto h-20 w-auto" size={100} />

          <h2 className="text-center text-2xl font-bold tracking-tight text-cyan-700">
            Sign {inOrUp === 'up' ? 'Up' : 'In'}
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
                  {inOrUp === 'in' && (
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
                Sign {inOrUp === 'up' ? 'Up' : 'In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Sign;

