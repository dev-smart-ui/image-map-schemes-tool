import { Button } from '@/components/ui/buttons/Button'
import { useSchemeMapperContext } from '@/context/SchemeMapperContext'
import { PolyScheme } from '@/types/SchemeMapperContext'
import React from 'react'
import { TRANSPARENT_OPTION_COLOR } from '../constants'
import classNames from 'classnames'

export const SchemeItem = ({
  item,
  hoveredId,
  setHoveredId,
}: {
  item: PolyScheme,
  hoveredId: string | null,
  setHoveredId: (id: string | null) => void
}) => {
  const { 
    polygons,

    setPolygons,
    setIsPolyEditMode,
    setInputPolyName,
    setInputPolyPreFill,
    setInputPolyFill,
    setInputStroke,
    setPolygonToEdit,
  } = useSchemeMapperContext();

  const onRemoveClickHandler = (id: string) => {
    if (!id) return

    setPolygons(polygons.filter(poly => poly.id !== id))
  }

  const onEditClickHandler = (id: string) => {
    if (!id) return

    const polygon = polygons.find(p => p.id == id);

    if (!polygon) {
      console.warn(`-- Can't edit trigger: no find polygon id ${id}`);
      return      
    }    

    setPolygonToEdit(id);
    
    setInputPolyName(polygon.name);
    setInputPolyPreFill(polygon.preFillColor);
    setInputPolyFill(polygon.fillColor);
    setInputStroke(polygon.strokeColor);

    setIsPolyEditMode(true);
  }

  return (
    <div 
      className="flex gap-3 border border-[grey] rounded-md items-start w-full p-2 duration-200 overflow-hidden"
      key={item.id}
      onMouseEnter={() => setHoveredId(item.id)}
      onMouseLeave={() => setHoveredId(null)}
      style={{ boxShadow: item.id === hoveredId ? '0 0 10px grey' : 'none' }}
    >
      <div 
        className={classNames('min-w-5 min-h-5 rounded-full self-center text-xs flex justify-center items-center', {
          'bg-[var(--accent-color)] text-white': item.type == 'polygon',
          'bg-[var(--accent-light-color)]': item.type == 'highlight',
        })}
      >
        { item.type == 'polygon' && 'P'}
        { item.type == 'highlight' && 'H'}
      </div>

      {/* <div className="text-[12px]">
        <p className="font-bold">ID:</p>
        <p className="opacity-70 mt-1">{poly.id}</p>
      </div> */}

      <div className="text-[12px]">
        <p className="font-bold">Name</p>
        <p className="opacity-70 mt-1">{item.name}</p>
      </div>

      { item.type == 'polygon' && (
        <>
          <div className="text-[12px]">
            <p className="font-bold">Fill</p>
            <p className="opacity-70 mt-1 w-[15px] h-[15px] mx-auto text-center" style={{ background: item.fillColor} }>
              { item.fillColor == TRANSPARENT_OPTION_COLOR ? 'T' : ''}
            </p>
          </div>

          <div className="text-[12px]">
            <p className="font-bold">Pre</p>
            <p className="opacity-70 mt-1 w-[15px] h-[15px] mx-auto text-center" style={{ background: item.preFillColor} }>
              { item.fillColor == TRANSPARENT_OPTION_COLOR ? 'T' : ''}
            </p>
          </div>

          <div className="text-[12px]">
            <p className="font-bold">Stroke</p>
            <p className="opacity-70 mt-1 w-[15px] h-[15px] mx-auto text-center" style={{ background: item.strokeColor} }>
              { item.fillColor == TRANSPARENT_OPTION_COLOR ? 'T' : ''}
            </p>
          </div>
        </>
      )}

      { item.type == 'highlight' && (
        <>
          <div className="text-[12px]">
            <p className="font-bold">Color</p>
            <p className="opacity-70 mt-1 w-[15px] h-[15px] mx-auto text-center" style={{ background: item.fillColor} } />
          </div>
        </>
      )}

      

      <div className="self-center flex gap-2 ml-auto">
        {/* <Button
          type="icon"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>                  
        </Button> */}

        { item.type != 'highlight' && (
          <Button
            type="icon"
            onClick={() => onEditClickHandler(item.id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>                 
          </Button>
        )}        

        <Button 
          onClick={() => onRemoveClickHandler(item.id)}
          type="icon"
          className="!bg-[red] !text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>                    
        </Button>
      </div>
    </div>
  )
}
