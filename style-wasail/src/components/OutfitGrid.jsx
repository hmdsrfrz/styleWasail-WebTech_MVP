// src/components/OutfitGrid.jsx
import { useState, useEffect, useRef } from 'react';
import { motion as Motion } from 'framer-motion';
import Masonry from 'masonry-layout';
import './OutfitGrid.css';
import './MoodboardPrompt.css';
import imagesLoaded from 'imagesloaded';
import OutfitModal from './OutfitModal';
import MoodboardPrompt from './MoodboardPrompt';

// Sample data with additional fields
const outfitData = [
  {
    id: 1,
    mainImage: '/outfits/outfit1.jpg',
    title: 'Summer Casual',
    user: '@fashionista',
    description: 'Perfect for beach outings and casual brunches with friends. Light and airy fabrics.',
    components: [
      { image: '/outfits/shirt1.jpg', type: 'Shirt', description: 'Linen button-down' },
      { image: '/outfits/shorts1.jpg', type: 'Shorts', description: 'Denim cutoffs' },
      { image: '/outfits/shoes1.jpg', type: 'Shoes', description: 'Canvas sneakers' }
    ],
    price: 35,
    size: 1 // size class (1-3)
  },
  {
    id: 2,
    mainImage: '/outfits/outfit1.jpg',
    title: 'Formal Business Attire',
    user: '@officestyle',
    description: 'Professional outfit perfect for important meetings and presentations.',
    components: [
      { image: '/outfits/shirt1.jpg', type: 'Blazer', description: 'Tailored wool blazer' },
      { image: '/outfits/shorts1.jpg', type: 'Pants', description: 'Matching wool slacks' },
      { image: '/outfits/shoes1.jpg', type: 'Shoes', description: 'Leather oxfords' }
    ],
    price: 45,
    size: 2 // medium size
  },
  {
    id: 3,
    mainImage: '/outfits/outfit1.jpg',
    title: 'Evening Gala',
    user: '@nightowl',
    description: 'Elegant evening wear for special occasions. Turn heads with this stunning ensemble.',
    components: [
      { image: '/outfits/shirt1.jpg', type: 'Dress', description: 'Sequined gown' },
      { image: '/outfits/shorts1.jpg', type: 'Accessories', description: 'Crystal earrings' },
      { image: '/outfits/shoes1.jpg', type: 'Shoes', description: 'Silver heels' }
    ],
    price: 65,
    size: 3 // large size
  },
  {
    id: 4,
    mainImage: '/outfits/outfit1.jpg',
    title: 'Vintage Inspired',
    user: '@retrochic',
    description: 'A throwback to the 70s with modern touches.',
    components: [
      { image: '/outfits/shirt1.jpg', type: 'Top', description: 'Paisley blouse' },
      { image: '/outfits/shorts1.jpg', type: 'Pants', description: 'High-waisted flares' },
      { image: '/outfits/shoes1.jpg', type: 'Accessories', description: 'Round sunglasses' }
    ],
    price: 40,
    size: 1
  },
  {
    id: 5,
    mainImage: '/outfits/outfit1.jpg',
    title: 'Athleisure',
    user: '@fitfashion',
    description: 'Comfortable yet stylish outfit for active days.',
    components: [
      { image: '/outfits/shirt1.jpg', type: 'Top', description: 'Performance hoodie' },
      { image: '/outfits/shorts1.jpg', type: 'Bottoms', description: 'Premium leggings' },
      { image: '/outfits/shoes1.jpg', type: 'Shoes', description: 'Running sneakers' }
    ],
    price: 30,
    size: 2
  },
  {
    id: 6,
    mainImage: '/outfits/outfit1.jpg',
    title: 'Winter Wonderland',
    user: '@snowstyle',
    description: 'Stay warm and fashionable during the cold season with this cozy ensemble.',
    components: [
      { image: '/outfits/shirt1.jpg', type: 'Coat', description: 'Wool overcoat' },
      { image: '/outfits/shorts1.jpg', type: 'Sweater', description: 'Cashmere turtleneck' },
      { image: '/outfits/shoes1.jpg', type: 'Boots', description: 'Leather winter boots' }
    ],
    price: 55,
    size: 1
  },
  {
    id: 7,
    mainImage: '/outfits/outfit1.jpg',
    title: 'Festival Ready',
    user: '@musiclover',
    description: 'The perfect outfit for outdoor music festivals and sunny days.',
    components: [
      { image: '/outfits/shirt1.jpg', type: 'Top', description: 'Crochet crop top' },
      { image: '/outfits/shorts1.jpg', type: 'Bottoms', description: 'Frayed denim shorts' },
      { image: '/outfits/shoes1.jpg', type: 'Footwear', description: 'Western boots' }
    ],
    price: 35,
    size: 3
  },
  {
    id: 8,
    mainImage: '/outfits/outfit1.jpg',
    title: 'Minimalist Chic',
    user: '@lessismore',
    description: 'Clean lines and neutral tones for a sophisticated look.',
    components: [
      { image: '/outfits/shirt1.jpg', type: 'Blazer', description: 'Unstructured beige blazer' },
      { image: '/outfits/shorts1.jpg', type: 'Trousers', description: 'Wide-leg pants' },
      { image: '/outfits/shoes1.jpg', type: 'Shoes', description: 'White leather sneakers' }
    ],
    price: 50,
    size: 2
  },
  {
    id: 9,
    mainImage: '/outfits/outfit1.jpg',
    title: 'Urban Streetwear',
    user: '@citystyle',
    description: 'Bold urban fashion for making a statement.',
    components: [
      { image: '/outfits/shirt1.jpg', type: 'Jacket', description: 'Oversized denim jacket' },
      { image: '/outfits/shorts1.jpg', type: 'Pants', description: 'Cargo pants' },
      { image: '/outfits/shoes1.jpg', type: 'Shoes', description: 'High-top sneakers' }
    ],
    price: 45,
    size: 1
  },
  {
    id: 10,
    mainImage: '/outfits/outfit1.jpg',
    title: 'Wedding Guest',
    user: '@elegantchoice',
    description: 'Appropriate and stylish outfit for attending weddings and formal events.',
    components: [
      { image: '/outfits/shirt1.jpg', type: 'Dress', description: 'Floral midi dress' },
      { image: '/outfits/shorts1.jpg', type: 'Accessories', description: 'Pearl clutch' },
      { image: '/outfits/shoes1.jpg', type: 'Shoes', description: 'Strappy heels' }
    ],
    price: 60,
    size: 3
  }
];

export default function OutfitGrid() {
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [activeComponent, setActiveComponent] = useState(0);
  const [masonryInstance, setMasonryInstance] = useState(null);
  const [likedOutfits, setLikedOutfits] = useState({});
  const [moodboardPrompt, setMoodboardPrompt] = useState({ isOpen: false, outfitId: null, outfitTitle: '' });
  
  const gridRef = useRef(null);

  // Initialize Masonry when component mounts
  useEffect(() => {
    if (!gridRef.current) return;
    
    const grid = gridRef.current;
    const imgLoad = imagesLoaded(grid);
    
    imgLoad.on('done', () => {
      const masonry = new Masonry(grid, {
        itemSelector: '.outfit-card',
        columnWidth: '.grid-sizer',
        percentPosition: true,
        gutter: 20,
        transitionDuration: '0.2s' // Smoother transitions
      });
      
      setMasonryInstance(masonry);
    });
    
    return () => {
      if (masonryInstance) {
        masonryInstance.destroy();
      }
    };
  }, []);

  // Re-layout masonry grid when window resizes
  useEffect(() => {
    const handleResize = () => {
      if (masonryInstance) {
        masonryInstance.layout();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [masonryInstance]);

  const handleHeartClick = (e, outfitId, outfitTitle) => {
    e.stopPropagation(); // Prevent opening the outfit modal
    
    setLikedOutfits(prev => {
      const newLiked = {...prev};
      newLiked[outfitId] = !prev[outfitId];
      
      // If the outfit was just liked, open the moodboard prompt
      if (newLiked[outfitId]) {
        setMoodboardPrompt({
          isOpen: true,
          outfitId,
          outfitTitle
        });
      }
      
      return newLiked;
    });
  };

  const closeMoodboardPrompt = () => {
    setMoodboardPrompt({ isOpen: false, outfitId: null, outfitTitle: '' });
  };

  return (
    <div className="outfit-container">
      {/* Masonry Grid */}
      <div className="outfit-grid" ref={gridRef}>
        <div className="grid-sizer"></div>
        {outfitData.map((outfit) => (
          <Motion.div
            key={outfit.id}
            className={`outfit-card size-${outfit.size}`}
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setSelectedOutfit(outfit);
              setActiveComponent(0);
            }}
          >
            <div className="card-image-container">
              <img src={outfit.mainImage} alt={outfit.title} />
              <Motion.button
                className={`heart-button ${likedOutfits[outfit.id] ? 'active' : ''}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => handleHeartClick(e, outfit.id, outfit.title)}
              >
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
              </Motion.button>
            </div>
            <div className="card-info">
              <h3>{outfit.title}</h3>
              <p className="description">{outfit.description}</p>
              <p className="username">by {outfit.user}</p>
            </div>
          </Motion.div>
        ))}
      </div>

      {/* Modal for selected outfit */}
      {selectedOutfit && (
        <OutfitModal 
          outfit={selectedOutfit}
          activeComponent={activeComponent}
          setActiveComponent={setActiveComponent}
          onClose={() => setSelectedOutfit(null)}
        />
      )}

      {/* Moodboard Prompt */}
      <MoodboardPrompt 
        isOpen={moodboardPrompt.isOpen}
        onClose={closeMoodboardPrompt}
        outfitId={moodboardPrompt.outfitId}
        outfitTitle={moodboardPrompt.outfitTitle}
      />
    </div>
  );
}