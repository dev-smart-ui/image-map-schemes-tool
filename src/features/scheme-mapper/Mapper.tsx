import { useSchemeMapperContext } from '@/context/SchemeMapperContext';
import React from 'react';
import ImageMapper from 'react-img-mapper';

export const Mapper = () => {
  const { 
    image, 
    polygons,
  } = useSchemeMapperContext();

  if (!image) return <></>

  return (
    <div className="flex justify-center image-mapper">
      <ImageMapper 
        width={image.width}            
        height={image.height} 
        src={image.src} 
        name={'map'} 
        areas={polygons}
        ref={null} 
      />
    </div>
  )
};
