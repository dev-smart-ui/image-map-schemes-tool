import { useSchemeMapperContext } from '@/context/SchemeMapperContext';
import React, { useEffect, useRef, useState } from 'react';
import ImageMapper from 'react-img-mapper';

export const Mapper = () => {
  const { 
    image, 
    polygons,
  } = useSchemeMapperContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [parentWidth, setParentWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) setParentWidth(containerRef.current.offsetWidth);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, [image]);

  if (!image) return <></>

  return (
    <div ref={containerRef} className="flex justify-center image-mapper">
      <ImageMapper 
        width={image.width}            
        height={image.height} 
        src={image.src} 
        name={'map'} 
        areas={polygons}
        ref={null} 
        responsive={true}
        parentWidth={parentWidth}
      />
    </div>
  )
};
