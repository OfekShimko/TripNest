import { NavLink, useNavigate } from 'react-router-dom';
import { PiSuitcase } from "react-icons/pi";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { FaRegUserCircle } from "react-icons/fa";
import { useEffect, useState } from 'react';

const Navbar = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'bg-black text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'
      : 'text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2';

  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user_email');
    navigate('/');
  };

  
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleToggleDarkMode = () => {
    setIsDark((prev) => !prev);
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      try {
        const response = await fetch('/api/v1//users');
        if (response.ok) {
          const usersList = await response.json();
          const user = usersList.find((u: { id: string }) => u.id === userId);
          if (user) {
            setUsername(user.username);
          }
        } else {
          console.error('Failed to fetch users.');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <nav className="bg-cyan-600 border-b border-cyan-700 dark:bg-gray-800 dark:border-gray-700">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
            <NavLink className="flex flex-shrink-0 items-center mr-4" to="/home">
              <PiSuitcase className="mr-3" size={40} />
              <span className="hidden md:block text-white text-2xl font-bold dark:text-gray-200">
                TripNest
              </span>
            </NavLink>
            <div className="md:ml-auto">
              <div className="flex space-x-2 items-center">
                <NavLink to="/home" className={linkClass}>
                  Home
                </NavLink>
                <NavLink to="/trips" className={linkClass}>
                  Trips
                </NavLink>
                <NavLink to="/activities" className={linkClass}>
                  Activities
                </NavLink>

                
                <button
                  type="button"
                  onClick={handleToggleDarkMode}
                  className="ml-2 p-2 rounded-md text-white hover:bg-gray-900 dark:hover:bg-gray-600"
                >
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>

                
                <Menu as="div" className="relative ml-3">
                  <div>
                    <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <FaRegUserCircle size={40} color="white" />
                    </MenuButton>
                  </div>

                
                  <MenuItems
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right 
                               rounded-md bg-white dark:bg-gray-700 
                               py-1 shadow-lg ring-1 ring-black/5 
                               focus:outline-none"
                  >
                    {username && (
                      <MenuItem
                        as="div"
                        className="block w-full px-4 py-2 text-sm 
                                   text-gray-700 dark:text-gray-200"
                      >
                        Signed in as <strong>{username}</strong>
                      </MenuItem>
                    )}
                    <MenuItem
                      as="button"
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm 
                                 text-gray-700 dark:text-gray-200
                                 hover:bg-gray-100 dark:hover:bg-gray-600
                                 focus:bg-gray-100 dark:focus:bg-gray-600"
                    >
                      Sign out
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
