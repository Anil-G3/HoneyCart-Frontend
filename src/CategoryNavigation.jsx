import React from 'react';

export function CategoryNavigation({ onCategoryClick, activeCategory }) {
  const categories = [
    'Mobiles', 'Laptops', 'TVs', 'Shirts', 'Pants', 'Footwears',
    'Watches', 'Perfumes', 'Audio Devices', 'Gaming', 'Home Appliances', 'Electronic Accessories',
  ];

  return (
    <nav className="category-navigation">
      <ul className="category-list">
        {categories.map((category, index) => (
          <li
            key={index}
            className={`category-item ${activeCategory === category ? 'active' : ''}`}
            onClick={() => onCategoryClick(category)}
          >
            {category}
          </li>
        ))}
      </ul>
    </nav>
  );
}