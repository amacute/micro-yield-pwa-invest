import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, Menu } from 'lucide-react';

export const Navbar: FC = () => {
  return (
    <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex ml-2 md:mr-24">
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
                MicroYield
              </span>
            </Link>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            >
              <Bell className="w-6 h-6" />
            </button>
            <div className="flex items-center ml-3">
              <button
                type="button"
                className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
              >
                <User className="w-8 h-8 rounded-full p-1 bg-gray-200 dark:bg-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
