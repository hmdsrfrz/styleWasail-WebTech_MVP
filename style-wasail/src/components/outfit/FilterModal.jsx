import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import './FilterModal.css';

// Use the same tags as defined in CreateOutfitModal
const AVAILABLE_TAGS = {
  seasons: ['Summer', 'Winter', 'Spring', 'Fall'],
  styles: ['Casual', 'Formal', 'Office', 'Party', 'Rock', 'Vintage', 'Streetwear'],
  occasions: ['Work', 'Party', 'Wedding', 'Beach', 'Travel', 'Sports'],
  components: ['Outfit', 'Top', 'Bottom', 'Shoes', 'Accessories']
};

const LOCATIONS = {
  'Major Cities': [
    'Islamabad', 'Karachi', 'Lahore', 'Peshawar', 'Quetta',
    'Faisalabad', 'Multan', 'Hyderabad', 'Rawalpindi', 'Gujranwala'
  ],
  'Universities': [
    'LUMS - Lahore', 'NUST - Islamabad', 'FAST - Multiple Cities',
    'COMSATS - Multiple Cities', 'UET - Lahore', 'IBA - Karachi',
    'GIKI - Topi', 'NED - Karachi', 'PIEAS - Islamabad',
    'UCP - Lahore', 'BZU - Multan', 'Punjab University - Lahore',
    'Karachi University', 'Peshawar University',
    'Quaid-i-Azam University - Islamabad'
  ]
};

export default function FilterModal({ isOpen, onClose, onFilter, selectedTags = [] }) {
  const [localSelectedTags, setLocalSelectedTags] = useState(selectedTags);

  const handleTagClick = (tag) => {
    setLocalSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleClearAll = () => {
    setLocalSelectedTags([]);
  };

  const handleApply = () => {
    onFilter(localSelectedTags);
  };

  if (!isOpen) return null;

  return (
    <div className="filter-modal-overlay" onClick={onClose}>
      <Motion.div 
        className="filter-modal-content"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Filter Outfits</h2>

        {/* Categories */}
        {Object.entries(AVAILABLE_TAGS).map(([category, tags]) => (
          <div key={category} className="filter-category">
            <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
            <div className="tags-container">
              {tags.map(tag => (
                <button
                  key={tag}
                  className={`filter-tag ${localSelectedTags.includes(tag) ? 'selected' : ''}`}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Locations */}
        {Object.entries(LOCATIONS).map(([category, locations]) => (
          <div key={category} className="filter-category">
            <h3>{category}</h3>
            <div className="tags-container">
              {locations.map(location => (
                <button
                  key={location}
                  className={`filter-tag ${localSelectedTags.includes(location) ? 'selected' : ''}`}
                  onClick={() => handleTagClick(location)}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="filter-actions">
          <button className="clear-button" onClick={handleClearAll}>
            Clear All
          </button>
          <button className="apply-button" onClick={handleApply}>
            Apply Filters
          </button>
        </div>
      </Motion.div>
    </div>
  );
} 