'use client'

import React, { createContext, ReactNode, useContext, useMemo, useState } from "react"
import { PolyScheme, SchemeMapperContextValue } from "../types/SchemeMapperContext"

const defaultValues: SchemeMapperContextValue = {
  name: '',
  image: null, // { url: string; width: number; height: number } | null
  imageUrl: '',
  points: [],
  polygons: [],
  exportData: {}, // объект для записи в Google Sheets
  setName: () => {},
  setImage: () => {},
  setImageUrl: () => {},
  setPoints: () => {},
  setPolygons: () => {},
}

export const SchemeMapperContext = createContext(defaultValues)

export const SchemeMapperContextProvider = ({ 
  children
}: {
  children: ReactNode
}) => {
  const [name, setName] = useState(defaultValues.name)
  const [image, setImage] = useState<{ url: string; width: number; height: number } | null>(defaultValues.image)
  const [points, setPoints] = useState<number[]>(defaultValues.points)
  const [polygons, setPolygons] = useState<PolyScheme[]>(defaultValues.polygons);
  const [imageUrl, setImageUrl] = useState(defaultValues.imageUrl);

  const exportData = useMemo(() => {
    if (!image || !polygons.length) return defaultValues.exportData

    return {
      name: name || 'NONAME',
      image: {
        url: imageUrl,
        width: image.width,
        height: image.height,
      },
      areas: polygons,
    }
  }, [name, image, polygons])

  return (
    <SchemeMapperContext.Provider
      value={{
        name,
        image,
        imageUrl,
        points,
        polygons,
        exportData,
        setName,
        setImage,
        setPoints,
        setPolygons,
        setImageUrl,
      }}
    >
      {children}
    </SchemeMapperContext.Provider>
  )
}

export const useSchemeMapperContext = () =>
  useContext<SchemeMapperContextValue>(SchemeMapperContext)
