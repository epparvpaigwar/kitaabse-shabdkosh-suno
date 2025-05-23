
import { Book, Heart, Upload, Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-maroon-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Literary Quote Banner */}
        <div className="text-center mb-12 p-8 bg-maroon-800 rounded-lg">
          <p className="text-xl md:text-2xl hindi-text italic mb-2">
            कहानियाँ जो दिल को छू जाएँ, अब आवाज़ में
          </p>
          <p className="text-sandalwood-200 text-sm">
            Stories that touch the heart, now in voice
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <h3 className="text-2xl font-bold hindi-text mb-2">किताबसे</h3>
              <p className="text-sandalwood-200 text-sm mb-4">KitaabSe</p>
            </div>
            <p className="text-sandalwood-200 mb-6 leading-relaxed">
              Experience the richness of Hindi literature through our AI-powered audiobook platform. 
              Upload your favorite books and listen to timeless classics in crystal-clear audio.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-sandalwood-200 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-sandalwood-200 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-sandalwood-200 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sandalwood-200 hover:text-white transition-colors flex items-center gap-2">
                  <Book size={16} />
                  All Books
                </a>
              </li>
              <li>
                <a href="#" className="text-sandalwood-200 hover:text-white transition-colors flex items-center gap-2">
                  <Upload size={16} />
                  Upload Book
                </a>
              </li>
              <li>
                <a href="#" className="text-sandalwood-200 hover:text-white transition-colors flex items-center gap-2">
                  <Heart size={16} />
                  My Library
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sandalwood-200 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sandalwood-200 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-sandalwood-200 hover:text-white transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-sandalwood-200 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-maroon-700 mt-8 pt-8 text-center">
          <p className="text-sandalwood-200 text-sm">
            © 2024 KitaabSe. All rights reserved. Made with ❤️ for Hindi literature lovers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
