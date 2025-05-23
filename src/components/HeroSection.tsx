
import { Search } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-maroon-300 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-sandalwood-400 rotate-45"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-maroon-200 rounded-full"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Main Hindi Heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-maroon-800 hindi-text mb-4 animate-fade-in">
          हिन्दी साहित्य की गूंज
        </h1>
        <div className="w-32 h-1 bg-vintage-gold mx-auto mb-6"></div>
        <h2 className="text-xl md:text-2xl text-maroon-700 hindi-text mb-8 animate-fade-in">
          अब सुनिए अपनी भाषा में
        </h2>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-sandalwood-800 hindi-text mb-12 max-w-3xl mx-auto leading-relaxed">
          गोदान, पूस की रात, गबन और अन्य क्लासिक कहानियाँ — अब श्रवण करें किताबसे।
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sandalwood-600" size={24} />
            <input 
              type="text" 
              placeholder="Search for books, authors, or stories..."
              className="search-bar pl-14"
            />
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-primary">
            Explore Books
          </button>
          <button className="btn-secondary">
            Upload Your Book
          </button>
        </div>

        {/* Literary Quote */}
        <div className="mt-16 p-6 bg-white/50 rounded-lg border border-sandalwood-200 backdrop-blur-sm">
          <p className="literary-quote text-center">
            "साहित्य जन-समूह के हृदय का विकास है"
          </p>
          <p className="text-sm text-sandalwood-700 mt-2">— आचार्य महावीर प्रसाद द्विवेदी</p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
