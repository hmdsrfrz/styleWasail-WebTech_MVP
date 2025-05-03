// src/components/OutfitGrid.jsx
import { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import Masonry from 'masonry-layout';
import './OutfitGrid.css';
import imagesLoaded from 'imagesloaded';
import OutfitModal from './OutfitModal'; // We'll create this next

const outfitData = [
  {
    id: 1,
    mainImage: '/outfits/outfit1.jpg',
    title: 'Summer Casual',
    user: '@fashionista',
    description: 'Perfect for beach outings and brunches',
    components: [
      { image: '/outfits/shirt1.jpg', type: 'Shirt', description: 'Linen button-down' },
      { image: '/outfits/shorts1.jpg', type: 'Shorts', description: 'Denim cutoffs' },
      { image: '/outfits/shoes1.jpg', type: 'Shoes', description: 'Canvas sneakers' }
    ],
    price: 35
  },
  {
    id: 1,
    mainImage: '/outfits/outfit1.jpg',
    title: 'Summer Casual',
    user: '@fashionista',
    description: 'Perfect for beach outings and brunches',
    components: [
      { image: '/outfits/shirt1.jpg', type: 'Shirt', description: 'Linen button-down' },
      { image: '/outfits/shorts1.jpg', type: 'Shorts', description: 'Denim cutoffs' },
      { image: '/outfits/shoes1.jpg', type: 'Shoes', description: 'Canvas sneakers' }
    ],
    price: 35
  },
  {
    id: 1,
    mainImage: '/outfits/outfit1.jpg',
    title: 'Summer Casual',
    user: '@fashionista',
    description: 'Perfect for beach outings and brunches',
    components: [
      { image: '/outfits/shirt1.jpg', type: 'Shirt', description: 'Linen button-down' },
      { image: '/outfits/shorts1.jpg', type: 'Shorts', description: 'Denim cutoffs' },
      { image: '/outfits/shoes1.jpg', type: 'Shoes', description: 'Canvas sneakers' }
    ],
    price: 35
  },
  {
    id: 1,
    mainImage: '/outfits/outfit1.jpg',
    title: 'Summer Casual',
    user: '@fashionista',
    description: 'Perfect for beach outings and brunches',
    components: [
      { image: '/outfits/shirt1.jpg', type: 'Shirt', description: 'Linen button-down' },
      { image: '/outfits/shorts1.jpg', type: 'Shorts', description: 'Denim cutoffs' },
      { image: '/outfits/shoes1.jpg', type: 'Shoes', description: 'Canvas sneakers' }
    ],
    price: 35
  },
  {
    id: 1,
    mainImage: '/outfits/outfit1.jpg',
    title: 'Summer Casual',
    user: '@fashionista',
    description: 'Perfect for beach outings and brunches',
    components: [
      { image: '/outfits/shirt1.jpg', type: 'Shirt', description: 'Linen button-down' },
      { image: '/outfits/shorts1.jpg', type: 'Shorts', description: 'Denim cutoffs' },
      { image: '/outfits/shoes1.jpg', type: 'Shoes', description: 'Canvas sneakers' }
    ],
    price: 35
  },
  {
    id: 1,
    mainImage: '/outfits/outfit1.jpg',
    title: 'Summer Casual',
    user: '@fashionista',
    description: 'Perfect for beach outings and brunches',
    components: [
      { image: '/outfits/shirt1.jpg', type: 'Shirt', description: 'Linen button-down' },
      { image: '/outfits/shorts1.jpg', type: 'Shorts', description: 'Denim cutoffs' },
      { image: '/outfits/shoes1.jpg', type: 'Shoes', description: 'Canvas sneakers' }
    ],
    price: 35
  },
  {
    id: 1,
    mainImage: '/outfits/outfit1.jpg',
    title: 'Summer Casual',
    user: '@fashionista',
    description: 'Perfect for beach outings and brunches',
    components: [
      { image: '/outfits/shirt1.jpg', type: 'Shirt', description: 'Linen button-down' },
      { image: '/outfits/shorts1.jpg', type: 'Shorts', description: 'Denim cutoffs' },
      { image: '/outfits/shoes1.jpg', type: 'Shoes', description: 'Canvas sneakers' }
    ],
    price: 35
  },
  {
    id: 1,
    mainImage: '/outfits/outfit1.jpg',
    title: 'Summer Casual',
    user: '@fashionista',
    description: 'Perfect for beach outings and brunches',
    components: [
      { image: '/outfits/shirt1.jpg', type: 'Shirt', description: 'Linen button-down' },
      { image: '/outfits/shorts1.jpg', type: 'Shorts', description: 'Denim cutoffs' },
      { image: '/outfits/shoes1.jpg', type: 'Shoes', description: 'Canvas sneakers' }
    ],
    price: 35
  },
  {
    id: 1,
    mainImage: '/outfits/outfit1.jpg',
    title: 'Summer Casual',
    user: '@fashionista',
    description: 'Perfect for beach outings and brunches',
    components: [
      { image: '/outfits/shirt1.jpg', type: 'Shirt', description: 'Linen button-down' },
      { image: '/outfits/shorts1.jpg', type: 'Shorts', description: 'Denim cutoffs' },
      { image: '/outfits/shoes1.jpg', type: 'Shoes', description: 'Canvas sneakers' }
    ],
    price: 35
  },
  {
    id: 1,
    mainImage: '/outfits/outfit1.jpg',
    title: 'Summer Casual',
    user: '@fashionista',
    description: 'Perfect for beach outings and brunches',
    components: [
      { image: '/outfits/shirt1.jpg', type: 'Shirt', description: 'Linen button-down' },
      { image: '/outfits/shorts1.jpg', type: 'Shorts', description: 'Denim cutoffs' },
      { image: '/outfits/shorts1.jpg', type: 'Shorts', description: 'Denim cutoffs' },
      { image: '/outfits/shorts1.jpg', type: 'Shorts', description: 'Denim cutoffs' },
      
      { image: '/outfits/shoes1.jpg', type: 'Shoes', description: 'Canvas sneakers' }
    ],
    price: 35
  },
  
  // Add more outfits...
];

export default function OutfitGrid() {
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [activeComponent, setActiveComponent] = useState(0);

  // Initialize Masonry when component mounts
  useEffect(() => {
    const grid = document.querySelector('.outfit-grid');
    if (grid) {
      const imgLoad = imagesLoaded(grid);
      imgLoad.on('done', () => {
        new Masonry(grid, {
          itemSelector: '.outfit-card',
          columnWidth: '.grid-sizer',
          percentPosition: true,
          gutter: 20
        });
      });
    }
  }, []);

  return (
    <div className="outfit-container">
      {/* Masonry Grid */}
      <div className="outfit-grid">
        <div className="grid-sizer"></div>
        {outfitData.map((outfit) => (
          <Motion.div
            key={outfit.id}
            className="outfit-card"
            whileHover={{ scale: 1.03 }}
            onClick={() => {
              setSelectedOutfit(outfit);
              setActiveComponent(0);
            }}
          >
            <div className="card-image-container">
              <img src={outfit.mainImage} alt={outfit.title} />
            </div>
            <div className="card-info">
              <h3>{outfit.title}</h3>
              <p>by {outfit.user}</p>
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
    </div>
  );
}