import { useSchemeMapperContext } from '@/context/SchemeMapperContext';
import React from 'react'
import { v4 as uuidv4 } from "uuid";
import { Button } from '@/components/ui/buttons/Button';
import { HIGHLIGHT_COLOR } from '../constants';

export const HighlightAdd = () => {
  const {
    image,
    polygons,

    inputHighlightName,
    inputHighlightColor,
    setInputHighlightName,
    setInputHighlightColor,

    setPolygons,
    
    cleanUpHighlightAdd,
  } = useSchemeMapperContext();

  const finishAddHighlight = () => {
    const polygon = [];
    const points = [
      0, 0,
      image.width, 0,
      image.width, image.height,
      0, image.height
    ];
    
    for (let i = 0; i < points.length; i += 2) {
      polygon.push([points[i], points[i + 1]]);
    }

    const newPoly = {
      id: uuidv4().slice(0, 8),
      name: inputHighlightName || 'LAYER',
      shape: "poly",
      coords: points,
      polygon,
      strokeColor: inputHighlightColor || HIGHLIGHT_COLOR,
      fillColor: inputHighlightColor || HIGHLIGHT_COLOR,
      preFillColor: inputHighlightColor || HIGHLIGHT_COLOR,
      type: 'highlight',
      disabled: true,
    };

    setPolygons([newPoly, ...polygons]);

    cleanUpHighlightAdd();
  };

  const cancelHighlight = () => {
    cleanUpHighlightAdd();
  }

  return (
    <div className="sticky top-0 bg-white pb-4">
      <div className="flex flex-wrap justify-between items-start gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm" htmlFor="inputHighlightName">Name:</label>
          <input 
            id="inputHighlightName" 
            type="text" 
            className="bg-[var(--primary-color)] p-2 py-1 text-[14px]" 
            value={inputHighlightName} 
            onChange={e => setInputHighlightName(e.target.value)} 
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm" htmlFor="inputHighlightColor">Color:</label>
          <input 
            id="inputHighlightColor" 
            type="text" 
            className="bg-[var(--primary-color)] p-2 py-1 text-[14px]" 
            value={inputHighlightColor} 
            onChange={e => setInputHighlightColor(e.target.value)} 
          />
        </div>               
      </div>

      <div className="flex items-center gap-2 border-l border-l-2 border-[var(--secondary-color)] mt-4">
        <Button 
          onClick={cancelHighlight}
          type="secondary"
          withIcon
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>

          Cancel
        </Button>

        <Button 
          type="success" 
          onClick={finishAddHighlight}
          withIcon
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>

          Save
        </Button>
      </div>
    </div>
  )
}
