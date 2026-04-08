import React, { lazy, Suspense } from 'react';
import Layout from './Layout';

// Lazy-loaded image component with skeleton fallback
const LazyImage = lazy(() => import('./LazyImage'));

const MenuPage = () => {
    const menuItems = [
        {
          category: 'Appetizers',
          items: [
            { 
              name: 'Bruschetta',
              imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f',
              description: 'Toasted bread with tomatoes, garlic, and basil',
              price: 8.99,
              tags: ['vegetarian']
            },
            { 
              name: 'Calamari',
              imageUrl: 'https://images.unsplash.com/photo-1625943555419-56a2cb596640',
              description: 'Crispy fried squid with marinara sauce',
              price: 12.50,
              tags: ['seafood']
            },
          ]
        },
        {
          category: 'Main Courses',
          items: [
            { 
              name: 'Grilled Salmon',
              imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2',
              description: 'Fresh Atlantic salmon with seasonal vegetables',
              price: 24.99,
              tags: ['seafood', 'gluten free']
            },
            { 
              name: 'Beef Tenderloin',
              imageUrl: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976',
              description: 'Premium cut with red wine reduction',
              price: 29.99,
              tags: ['gluten free']
            },
          ]
        },
        {
          category: 'Desserts',
          items: [
            { 
              name: 'Tiramisu',
              imageUrl: 'https://images.unsplash.com/photo-1624359136358-5a80984d05ae',
              description: 'Classic Italian dessert with coffee and mascarpone',
              price: 7.99,
              tags: ['vegetarian']
            },
            { 
              name: 'Chocolate Lava Cake',
              imageUrl: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2',
              description: 'Warm chocolate cake with vanilla ice cream',
              price: 8.50,
              tags: ['vegetarian']
            },
          ]
        }
    ];

    return (
        <Layout>
            <div className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="min-h-screen bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-5xl font-bold text-center mb-12">Our Menu</h1>
                        
                        {menuItems.map((section, index) => (
                            <div key={index} className="mb-16" id={section.category.toLowerCase().replace(' ', '-')}>
                                <h2 className="text-3xl font-bold mb-8 text-primary">{section.category}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {section.items.map((item, itemIndex) => (
                                        <div key={itemIndex} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                                            <figure>
                                                <Suspense fallback={
                                                    <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                                                }>
                                                    <LazyImage 
                                                        src={item.imageUrl} 
                                                        alt={item.name}
                                                        className="w-full h-48 object-cover"
                                                    />
                                                </Suspense>
                                            </figure>
                                            <div className="card-body">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="card-title text-xl">{item.name}</h3>
                                                    <span className="text-lg font-bold text-secondary">
                                                        ${item.price}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600">{item.description}</p>
                                                <div className="mt-2">
                                                    {item.tags.map((tag, tagIndex) => (
                                                        <span 
                                                            key={tagIndex}
                                                            className={`badge badge-sm mr-2  p-2 ${
                                                                tag === 'vegetarian' ? 'badge-success' :
                                                                tag === 'gluten free' ? 'badge-warning' :
                                                                tag === 'seafood' ? 'badge-info' : ''
                                                            }`}
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MenuPage;