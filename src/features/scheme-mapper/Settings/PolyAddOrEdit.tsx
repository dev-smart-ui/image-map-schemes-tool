import { useSchemeMapperContext } from '@/context/SchemeMapperContext';
import React, { useState } from 'react'
import { v4 as uuidv4 } from "uuid";
import { PolyScheme } from '@/types/SchemeMapperContext';
import { Button } from '@/components/ui/buttons/Button';
import { POINTS_MIN, DEFAULT_STROKE, DEFAULT_FILL, DEFAULT_PRE_FILL, TRANSPARENT_OPTION_COLOR } from '../constants';
import { PopoverColorPicker } from '@/components/PopoverColorPicker';

export const PolyAddOrEdit = () => {
  const { 
    points, 
    polygons,

    inputPolyName,
    inputPolyPreFill,
    inputPolyFill,
    inputStroke,
    isPrevColorsActive,
    isTransparentOptionActive,
    polygonToEdit,

    setPoints,
    setPolygons,

    cleanUpPolyAddOrEdit,

    setInputPolyName,
    setInputPolyPreFill,
    setInputPolyFill,
    setInputStroke,
    setIsPrevColorsActive,
    setIsTransparentOptionActive,
  } = useSchemeMapperContext();

  const finishAddPolygon = () => {
    if (points.length < POINTS_MIN * 2) return;

    const polygon = [];
    for (let i = 0; i < points.length; i += 2) {
      polygon.push([points[i], points[i + 1]]);
    }

    const newPoly = {
      id: uuidv4().slice(0, 8),
      name: inputPolyName || 'NONAME',
      shape: "poly",
      coords: points,
      polygon,
      strokeColor: inputStroke || DEFAULT_STROKE,
      fillColor: inputPolyFill || DEFAULT_FILL,
      preFillColor: inputPolyPreFill || DEFAULT_PRE_FILL,
      type: 'polygon',
    };

    setPolygons([...polygons, newPoly]);
    setPoints([]);

    cleanUpPolyAddOrEdit();
  };

  const finishEditPolygon = () => {
    if (!polygonToEdit) return

    const polyChanges = {
      name: inputPolyName || 'NONAME',
      strokeColor: inputStroke || DEFAULT_STROKE,
      fillColor: inputPolyFill || DEFAULT_FILL,
      preFillColor: inputPolyPreFill || DEFAULT_PRE_FILL,
    };

    const updatedPolygons = polygons.map((polygon: PolyScheme) =>
      polygon.id === polygonToEdit
        ? { ...polygon, ...polyChanges }
        : polygon
    )

    setPolygons(updatedPolygons);

    cleanUpPolyAddOrEdit();
  }

  const cancelPolygon = () => {
    setPoints([]);

    cleanUpPolyAddOrEdit();
  }

  const onPrevColorsClickHandler = () => {
    const lastPolygon = [...polygons].reverse()[0];

    setIsPrevColorsActive(!isPrevColorsActive);
    setIsTransparentOptionActive(false);

    setInputPolyFill(!isPrevColorsActive ?lastPolygon.fillColor : '');
    setInputPolyPreFill(!isPrevColorsActive ?lastPolygon.preFillColor : '');
    setInputStroke(!isPrevColorsActive ?lastPolygon.strokeColor : '');
  }

  const onTransparentOptionClickHandler = () => {
    setIsTransparentOptionActive(!isTransparentOptionActive);
    setIsPrevColorsActive(false);

    setInputPolyFill(!isTransparentOptionActive ? TRANSPARENT_OPTION_COLOR : '');
    setInputPolyPreFill(!isTransparentOptionActive ? TRANSPARENT_OPTION_COLOR : '');
    setInputStroke(!isTransparentOptionActive ? TRANSPARENT_OPTION_COLOR : '');
  }

  return (
    <div className="sticky top-0 bg-white pb-4 z-10">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm" htmlFor="inputPolyName">Name:</label>
          <input 
            id="inputPolyName" 
            type="text" 
            className="bg-[var(--primary-color)] p-2 py-1 text-[14px]" 
            value={inputPolyName} 
            onChange={e => setInputPolyName(e.target.value)} 
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <label className="text-sm" htmlFor="inputPolyFill">Fill color:</label>
            <PopoverColorPicker color={inputPolyFill} onChange={setInputPolyFill} />
          </div>
          <input 
            id="inputPolyFill" 
            type="text" 
            className="bg-[var(--primary-color)] p-2 py-1 text-[14px]" 
            value={inputPolyFill} 
            onChange={e => setInputPolyFill(e.target.value)} 
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <label className="text-sm" htmlFor="inputPolyPreFill">Pre fill color:</label>
            <PopoverColorPicker color={inputPolyPreFill} onChange={setInputPolyPreFill} />
          </div>
          <input 
            id="inputPolyPreFill" 
            type="text" 
            className="bg-[var(--primary-color)] p-2 py-1 text-[14px]" 
            value={inputPolyPreFill} 
            onChange={e => setInputPolyPreFill(e.target.value)} 
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <label className="text-sm" htmlFor="inputStroke">Stroke color:</label>
            <PopoverColorPicker color={inputStroke} onChange={setInputStroke} />
          </div>
          <input 
            id="inputStroke" 
            type="text" 
            className="bg-[var(--primary-color)] p-2 py-1 text-[14px]" 
            value={inputStroke} 
            onChange={e => setInputStroke(e.target.value)} 
          />
        </div>
        <div className='w-full flex flex-col gap-1'>
          { !!polygons.length && !polygonToEdit && (
            <div className="flex gap-2">
              <label className="cursor-pointer text-sm" htmlFor="inputPrevColors">Use prev</label>
              <input 
                id="inputPrevColors" 
                type="checkbox" 
                className="bg-[var(--primary-color)] p-2 py-1 text-[14px] cursor-pointer" 
                checked={isPrevColorsActive}
                onChange={onPrevColorsClickHandler}
              />
            </div>
          )}

          <div className="flex gap-2">
            <label className="cursor-pointer text-sm" htmlFor="inputTransparentOption">Use transparent</label>
            <input 
              id="inputTransparentOption" 
              type="checkbox" 
              className="bg-[var(--primary-color)] p-2 py-1 text-[14px] cursor-pointer" 
              checked={isTransparentOptionActive}
              onChange={onTransparentOptionClickHandler}
            />
          </div> 
        </div>
               
      </div>

      <div className="flex items-center gap-2 border-l border-l-2 border-[var(--secondary-color)] mt-4">
        <Button 
          onClick={cancelPolygon}
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
          onClick={polygonToEdit ? finishEditPolygon : finishAddPolygon}
          disabled={!polygonToEdit ? points.length < POINTS_MIN * 2 : false}
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
