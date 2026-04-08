import React, { useState, useEffect } from 'react';

const LazyImage = ({ src, alt, className }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.onload = () => setImageLoaded(true);
    }, [src]);

    return imageLoaded ? (
        <img src={src} alt={alt} className={className} loading="lazy" />
    ) : (
        <div className={`${className} bg-gray-200 animate-pulse`}></div>
    );
};

export default LazyImage;