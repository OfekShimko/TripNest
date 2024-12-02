// Navbar.tsx
import { NavLink, useNavigate } from 'react-router-dom';
import { PiSuitcase } from "react-icons/pi";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import profilePic from '../assets/images/yana.png';

const Navbar = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'bg-black text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'
      : 'text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2';

  const navigate = useNavigate();

  const handleSignOut = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    // Redirect to sign-in page
    navigate('/');
  };

  return (
    <nav className='bg-cyan-600 border-b border-cyan-700'>
      <div className='mx-auto max-w-7xl px-2 sm:px-6 lg:px-8'>
        <div className='flex h-20 items-center justify-between'>
          <div className='flex flex-1 items-center justify-center md:items-stretch md:justify-start'>
            <NavLink className='flex flex-shrink-0 items-center mr-4' to='/home'>
              <PiSuitcase className='mr-3' size={40} />
              <span className='hidden md:block text-white text-2xl font-bold'>
                TripNest
              </span>
            </NavLink>
            <div className='md:ml-auto'>
              <div className='flex space-x-2'>
                <NavLink to='/home' className={linkClass}>
                  Home
                </NavLink>
                <NavLink to='/trips' className={linkClass}>
                  Trips
                </NavLink>
                <NavLink to='/activities' className={linkClass}>
                  Activities
                </NavLink>
                <Menu as="div" className="relative ml-3">
                  <div>
                    <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 ">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <img
                        alt="User Profile"
                        src={profilePic}
                        className="w-10 h-10 rounded-full"
                      />
                    </MenuButton>
                  </div>
                  <MenuItems
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none"
                  >
                    <MenuItem
                      as="a"
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100"
                    >
                      Your Profile
                    </MenuItem>
                    <MenuItem
                      as="button"
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100"
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
