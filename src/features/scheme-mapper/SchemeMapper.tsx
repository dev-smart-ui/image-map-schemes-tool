'use client'

import { Divider } from "./Divider";
import { useState } from "react";
import { Polygons } from "./Polygons";
import { Settings } from "./Settings/Settings";
import { useSchemeMapperContext } from "@/context/SchemeMapperContext";
import { Heading } from "./Heading";
import classNames from "classnames";
import styles from './SchemeMapper.module.scss'

export const SchemeMapper = () => {
  const { 
    image,
    isPolyAddMode,
  } = useSchemeMapperContext();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div>
      <Heading />

      { image && (
        <div className="flex gap-3">
          <div className={classNames('w-3/4', {
            [styles.animBorder]: isPolyAddMode
          })}>
            <div className="flex gap-2 justify-center max-h-[60vh] overflow-auto overscroll-contain scrollbar">
              <div className="max-w-full">
                <Polygons
                  hoveredId={hoveredId}
                  setHoveredId={setHoveredId}
                />
              </div>
            </div>
          </div>

          {/* <Divider /> */}

          <Settings
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
          />
        </div>
      )}

    </div>
  )
}
