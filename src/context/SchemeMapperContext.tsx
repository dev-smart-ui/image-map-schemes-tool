'use client'

import React, { createContext, ReactNode, useContext, useState } from "react"
import { PolyScheme, SchemeMapperContextValue } from "../types/SchemeMapperContext"

const defaultValues: SchemeMapperContextValue = {
  image: null,
  points: [],
  polygons: [],
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
  const [image, setImage] = useState(defaultValues.image);
  const [points, setPoints] = useState<number[]>(defaultValues.points);
  const [polygons, setPolygons] = useState<PolyScheme[]>(defaultValues.polygons);

  return (
    <SchemeMapperContext.Provider 
      value={{
        image,
        points,
        polygons,
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
