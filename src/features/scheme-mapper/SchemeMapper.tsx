'use client'

import { Divider } from "./Divider";
import { useState } from "react";
import { Polygons } from "./Polygons";
import { Settings } from "./Settings";
import { useSchemeMapperContext } from "@/context/SchemeMapperContext";
import { Heading } from "./Heading";
import classNames from "classnames";
import styles from './SchemeMapper.module.scss'

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
          <div className={classNames('', {
            [styles.animBorder]: isAddNew
          })}>
            <div className="flex gap-2 justify-center max-h-[60vh] overflow-auto overscroll-contain">
              <div className="max-w-full">
                <Polygons 
                  isAddNew={isAddNew}
                  hoveredId={hoveredId}
                  setHoveredId={setHoveredId}
                />
              </div>
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
