'use client'

import { Divider } from "./Divider";
import { useState } from "react";
import { Mapper } from "./Mapper";
import { Polygons } from "./Polygons";
import { Settings } from "./Settings";
import { useSchemeMapperContext } from "@/context/SchemeMapperContext";
import { Heading } from "./Heading";

export const SchemeMapper = () => {
  const { 
    image,
  } = useSchemeMapperContext();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isAddNew, setIsAddNew] = useState(false);

  return (
    <div className="py-3">
      <Heading />

      { image && (
        <div>
          <div className="flex gap-2 justify-center max-h-[60vh] overflow-auto">
            <div>
              <Polygons 
                isAddNew={isAddNew}
                hoveredId={hoveredId}
                setHoveredId={setHoveredId}
              />
            </div>
          </div>

          <Divider />

          <Settings
            isAddNew={isAddNew}
            setIsAddNew={setIsAddNew}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
          />
        </div>
      )}

    </div>
  )
}
