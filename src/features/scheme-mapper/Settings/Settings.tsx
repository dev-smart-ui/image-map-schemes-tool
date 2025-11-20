'use client'

import { useSchemeMapperContext } from "@/context/SchemeMapperContext";
import { Button } from "@/components/ui/buttons/Button";
import { SchemeItem } from "./SchemeItem";
import { PolyAddOrEdit } from "./PolyAddOrEdit";
import { HighlightAdd } from "./HighlightAdd";
import { useMemo } from "react";

export const Settings = ({
  hoveredId,
  setHoveredId
}: {
  hoveredId: string | null,
  setHoveredId: (id: string | null) => void
}) => {
  const { 
    polygons,
    isPolyAddMode,
    isPolyEditMode,
    isHighlightAddMode,
    setIsPolyAddMode,
    setIsHighlightAddMode,
  } = useSchemeMapperContext();

  const isHighlightExists = useMemo(() => {
    return polygons.some(item => item.type == 'highlight')
  }, [polygons])

  return (
    <div className="grow max-h-[60vh] overflow-auto scrollbar">
      { (isPolyAddMode || isPolyEditMode) && (
        <PolyAddOrEdit />
      )}

      { isHighlightAddMode && (
        <HighlightAdd />
      )}

      { !isPolyAddMode && !isPolyEditMode && !isHighlightAddMode && (
        <div className="flex gap-2 mb-4">
          <Button 
            onClick={() => setIsPolyAddMode(true)}
            withIcon
          >            
            Polygon
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>

          </Button>

          { !isHighlightExists && (
            <Button 
              onClick={() => setIsHighlightAddMode(true)}
              type="icon"
              withIcon
            >            
              Highlight
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>

            </Button>
          )}          
        </div>
      )}    

      <div className="flex flex-col-reverse items-start gap-x-6 gap-y-3">
        { polygons.map((poly, i) => (
          <SchemeItem 
            key={poly.id}
            item={poly}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
          />
        )) }
      </div>
    </div>
  )
}
