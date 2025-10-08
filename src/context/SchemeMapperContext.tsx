'use client'

import React, { createContext, ReactNode, useContext, useMemo, useState } from "react"
import { PolyScheme, SchemeMapperContextValue } from "../types/SchemeMapperContext"

const defaultValues: SchemeMapperContextValue = {
  name: 'NONAME',
  image: null,
  points: [],
  polygons: [],
  exportData: {},
  setName: () => {},
  setImage: () => {},
  setPoints: () => {},
  setPolygons: () => {},
}

export const SchemeMapperContext = createContext(defaultValues)

export const SchemeMapperContextProvider = ({ 
  children
}: {
  children: ReactNode
}) => {
  const [name, setName] = useState(defaultValues.name);
  const [image, setImage] = useState(defaultValues.image);
  const [points, setPoints] = useState<number[]>(defaultValues.points);
  const [polygons, setPolygons] = useState<PolyScheme[]>(defaultValues.polygons);

  const exportData = useMemo(() => {
    if (!image || !polygons.length) {
      return defaultValues.exportData
    }

    return {
      name: name || defaultValues.name,
      image: {
        width: image.width,
        height: image.height,
      },
      areas: polygons
    }
  }, [name, image, polygons])

  return (
    <SchemeMapperContext.Provider 
      value={{
        name,
        image,
        points,
        polygons,
        exportData,
        setName,
        setImage,
        setPoints,
        setPolygons
      }}
    >
      {children}
    </SchemeMapperContext.Provider>
  )
}

export const useSchemeMapperContext = () =>
  useContext<SchemeMapperContextValue>(SchemeMapperContext)
