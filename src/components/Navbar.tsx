
import { Search, Heart, Upload, User, Home, Book } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md border-b-2 border-sandalwood-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-maroon-700 hindi-text">
                किताबसे
              </h1>
              <p className="text-xs text-sandalwood-800 font-english">KitaabSe</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#" className="text-maroon-700 hover:text-maroon-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                <Home size={16} />
                Home
              </a>
              <a href="#" className="text-maroon-600 hover:text-maroon-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                <Book size={16} />
                All Books
              </a>
              <a href="#" className="text-maroon-600 hover:text-maroon-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                <Upload size={16} />
                Upload Book
              </a>
              <a href="#" className="text-maroon-600 hover:text-maroon-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                <Heart size={16} />
                My Library
              </a>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="border-maroon-300 text-maroon-700 hover:bg-maroon-50">
              <User size={16} className="mr-2" />
              Login
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
