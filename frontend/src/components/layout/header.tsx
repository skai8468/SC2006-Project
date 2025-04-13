import { Home, LogIn, LogOut, Menu, Plus, Search, User, X } from 'lucide-react';
import { useAuth } from '../auth/auth-context';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/theme-toggle';
import axios from 'axios';

export function Header() {
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return; // Don't search if empty

    setIsSearching(true);
    
    try {
      console.log('Searching for:', searchQuery);
      const response = await axios.get('http://127.0.0.1:8000/property/all/', {
        params: { q: searchQuery }
      });
      console.log('Search results:', response.data);
      setSearchResults(response.data);
      
      navigate(`/properties?search=${encodeURIComponent(searchQuery)}`);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold dark:text-white">RentEase</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus = {handleSearchSubmit}
                className="h-10 w-[300px] rounded-md border pl-10 pr-4 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                disabled={isSearching}
              />

              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                </div>
              )}
            </form>
          </div>

          <nav className="hidden md:flex md:items-center md:space-x-6">
            <Link to="/properties" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Properties
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              About
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Contact
            </Link>
            {isAuthenticated && (
              <Link to="/create-listing">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Listing</span>
                </Button>
              </Link>
            )}
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/my-listings">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="flex items-center space-x-2"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="sm" className="flex items-center space-x-2">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
            )}
          </nav>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <form onSubmit={handleSearchSubmit} className="px-2 pb-3 pt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-md border pl-10 pr-4 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                  disabled={isSearching}
                />
                
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
              </div>
            </form>
              <Link
                to="/properties"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Properties
              </Link>
              <Link
                to="/about"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Contact
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/create-listing"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Add Listing</span>
                    </div>
                  </Link>
                  <Link to="/my-listings" className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                    </div>
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center space-x-2">
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </div>
                  </button>
                </>
              )}
              <div className="px-3 py-2">
                <ThemeToggle />
              </div>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>
    </header>
  );
}