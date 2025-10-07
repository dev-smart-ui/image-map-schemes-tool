'use client'

import { v4 as uuidv4 } from "uuid";
import { useRef } from "react";
import config from './config.json';
import { useSchemeMapperContext } from "@/context/SchemeMapperContext";
import { PolyScheme } from "@/types/SchemeMapperContext";
import { Button } from "@/components/ui/buttons/Button";

const POINTS_MIN = config.points_min || 3;
const DEFAULT_FILL = config.default_fill_color || 'rgba(255,0,0,0.3)';
const DEFAULT_PRE_FILL = config.default_pre_fill_color || 'rgba(255,0,0,0.5)';
const DEFAULT_STROKE = config.default_stroke_color || '#000';

export const Settings = ({
  isAddNew,
  setIsAddNew,
  hoveredId,
  setHoveredId
}: {
  isAddNew: boolean,
  setIsAddNew: (state: boolean) => void,
  hoveredId: string | null,
  setHoveredId: (id: string | null) => void
}) => {
  const { 
    points, 
    polygons,
    setPoints,
    setPolygons,
  } = useSchemeMapperContext();
  const inputPolyName = useRef<HTMLInputElement>(null);
  const inputPolyPreFill = useRef<HTMLInputElement>(null);
  const inputPolyFill = useRef<HTMLInputElement>(null);
  const inputStroke = useRef<HTMLInputElement>(null);

  const finishPolygon = () => {
    if (points.length < POINTS_MIN * 2) return;

    const polygon = [];
    for (let i = 0; i < points.length; i += 2) {
      polygon.push([points[i], points[i + 1]]);
    }

    const newPoly = {
      id: uuidv4().slice(0, 8),
      name: inputPolyName?.current?.value || 'NONAME',
      shape: "poly",
      coords: points,
      polygon,
      strokeColor: inputStroke?.current?.value || DEFAULT_STROKE,
      fillColor: inputPolyFill?.current?.value || DEFAULT_FILL,
      preFillColor: inputPolyPreFill?.current?.value || DEFAULT_PRE_FILL,
    };

    setPolygons([...polygons, newPoly]);
    setPoints([]);

    if (inputPolyName.current) {
      inputPolyName.current.value = '';
    }

    if (inputPolyFill.current) {
      inputPolyFill.current.value = '';
    }

    if (inputPolyPreFill.current) {
      inputPolyPreFill.current.value = '';
    }

    setIsAddNew(false)
  };

  const cancelPolygon = () => {
    if (inputPolyName.current) {
      inputPolyName.current.value = '';
    }

    if (inputPolyFill.current) {
      inputPolyFill.current.value = '';
    }

    if (inputPolyPreFill.current) {
      inputPolyPreFill.current.value = '';
    }

    setPoints([]);
    setIsAddNew(false)
  }

  const onRemoveClickHandler = (id: string) => {
    if (!id) return

    setPolygons(polygons.filter(poly => poly.id !== id))
  }

  return (
    <div className="">
      { isAddNew && (
        <div className="flex items-end min-h-[70px]">
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="inputPolyName">Name:</label>
              <input id="inputPolyName" ref={inputPolyName} type="text" className="bg-[var(--primary-color)] p-2 text-[14px]" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="inputPolyFill">Fill color:</label>
              <input id="inputPolyFill" ref={inputPolyFill} type="text" className="bg-[var(--primary-color)] p-2 text-[14px]" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="inputPolyPreFill">Pre fill color:</label>
              <input id="inputPolyPreFill" ref={inputPolyPreFill} type="text" className="bg-[var(--primary-color)] p-2 text-[14px]" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="inputStroke">Stroke color:</label>
              <input id="inputStroke" ref={inputStroke} type="text" className="bg-[var(--primary-color)] p-2 text-[14px]" />
            </div>
          </div>

          <div className="flex items-center gap-4 border-l border-l-2 border-[var(--secondary-color)] ml-8 pl-8">
            <Button 
              onClick={cancelPolygon}
              type="secondary"
              withIcon
            >
              Cancel
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </Button>

            <Button 
              type="success" 
              onClick={finishPolygon}
              disabled={points.length < POINTS_MIN * 2}
              withIcon
            >
              Save
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </Button>
          </div>
        </div>
      )}

      { !isAddNew && (
        <div className="min-h-[70px]">
          <Button 
            onClick={() => setIsAddNew(true)}
            withIcon
          >            
            Add polygon
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>

          </Button>
        </div>
      )}

      <div className="mt-4 flex flex-col items-start gap-x-6 gap-y-3">
        { polygons.map((poly, i) => (
          <PolyItem 
            key={poly.id}
            poly={poly}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
            onRemoveClickHandler={onRemoveClickHandler}
          />
        )) }
      </div>
    </div>
  )
}

const PolyItem = ({
  poly,
  hoveredId,
  setHoveredId,
  onRemoveClickHandler
}: {
  poly: PolyScheme,
  hoveredId: string | null,
  setHoveredId: (id: string | null) => void
  onRemoveClickHandler: (id: string) => void
}) => {
  return (
    <div 
      className="inline-flex gap-6 items-start p-2 duration-200 overflow-hidden"
      key={poly.id}
      onMouseEnter={() => setHoveredId(poly.id)}
      onMouseLeave={() => setHoveredId(null)}
      style={{ boxShadow: poly.id === hoveredId ? '0 0 10px black' : 'none' }}
    >
      <div 
        className="min-w-5 min-h-5 bg-[var(--primary-color)] rounded-full self-center"
      />

      <div className="text-[12px]">
        <p className="font-bold">ID:</p>
        <p className="opacity-70 mt-1">{poly.id}</p>
      </div>

      <div className="text-[12px]">
        <p className="font-bold">Name:</p>
        <p className="opacity-70 mt-1">{poly.name}</p>
      </div>

      <div className="text-[12px]">
        <p className="font-bold">Fill:</p>
        <p className="opacity-70 mt-1 w-[15px] h-[15px] mx-auto" style={{ background: poly.fillColor} } />
      </div>

      <div className="text-[12px]">
        <p className="font-bold">Pre fill:</p>
        <p className="opacity-70 mt-1 w-[15px] h-[15px] mx-auto" style={{ background: poly.preFillColor} } />
      </div>

      <div className="text-[12px]">
        <p className="font-bold">Stroke:</p>
        <p className="opacity-70 mt-1 w-[15px] h-[15px] mx-auto" style={{ background: poly.strokeColor} } />
      </div>

      <Button 
        onClick={() => onRemoveClickHandler(poly.id)}
        className="self-center"
        type="icon"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>                    
      </Button>
    </div>
  )
}
