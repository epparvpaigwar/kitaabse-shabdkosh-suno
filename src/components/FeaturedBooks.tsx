
import BookCard from "./BookCard";

const FeaturedBooks = () => {
  const featuredBooks = [
    {
      title: "गोदान",
      author: "मुंशी प्रेमचंद",
      language: "Hindi",
      likes: 1247,
      isLiked: false
    },
    {
      title: "पूस की रात",
      author: "मुंशी प्रेमचंद", 
      language: "Hindi",
      likes: 856,
      isLiked: true
    },
    {
      title: "गबन",
      author: "मुंशी प्रेमचंद",
      language: "Hindi", 
      likes: 923,
      isLiked: false
    },
    {
      title: "चंद्रकांता",
      author: "देवकी नंदन खत्री",
      language: "Hindi",
      likes: 734,
      isLiked: false
    },
    {
      title: "तितली",
      author: "जैनेन्द्र कुमार",
      language: "Hindi",
      likes: 612,
      isLiked: true
    },
    {
      title: "राग दरबारी",
      author: "श्रीलाल शुक्ल",
      language: "Hindi",
      likes: 891,
      isLiked: false
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-maroon-800 hindi-text mb-4">
            लोकप्रिय पुस्तकें
          </h2>
          <div className="w-24 h-1 bg-vintage-gold mx-auto mb-4"></div>
          <p className="text-lg text-sandalwood-700 max-w-2xl mx-auto">
            Top Liked Books - Discover the most beloved classics of Hindi literature
          </p>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredBooks.map((book, index) => (
            <BookCard
              key={index}
              title={book.title}
              author={book.author}
              language={book.language}
              likes={book.likes}
              isLiked={book.isLiked}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="btn-secondary">
            View All Books
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBooks;
