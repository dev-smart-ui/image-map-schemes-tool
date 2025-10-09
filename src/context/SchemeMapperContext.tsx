'use client'

import React, { createContext, ReactNode, useContext, useMemo, useState } from "react"
import { PolyScheme, SchemeMapperContextValue } from "../types/SchemeMapperContext"

const defaultValues: SchemeMapperContextValue = {
  name: 'NONAME',
  image: null, // { url: string; width: number; height: number } | null
  points: [],
  polygons: [],
  exportData: {}, // объект для записи в Google Sheets
  setName: () => {},
  setImage: () => {},
  setPoints: () => {},
  setPolygons: () => {},
}

export const SchemeMapperContext = createContext(defaultValues)

export const SchemeMapperContextProvider = ({ children }: { children: ReactNode }) => {
  const [name, setName] = useState(defaultValues.name)
  const [image, setImage] = useState<{ url: string; width: number; height: number } | null>(defaultValues.image)
  const [points, setPoints] = useState<number[]>(defaultValues.points)
  const [polygons, setPolygons] = useState<PolyScheme[]>(defaultValues.polygons)

  // Формируем payload строго по схеме:
  // {
  //   name,
  //   url: image.url,
  //   json: {
  //     name,
  //     image: { url, width, height },
  //     areas: polygons
  //   }
  // }
  const exportData = useMemo(() => {
    if (!image || !polygons.length) return defaultValues.exportData

    return {
      name: name || defaultValues.name,
      url: image.url,
      json: {
        name: name || defaultValues.name,
        image: {
          url: image.url,
          width: image.width,
          height: image.height,
        },
        areas: polygons,
      },
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
        setPolygons,
      }}
    >
      {children}
    </SchemeMapperContext.Provider>
  )
}

export const useSchemeMapperContext = () =>
  useContext<SchemeMapperContextValue>(SchemeMapperContext)
