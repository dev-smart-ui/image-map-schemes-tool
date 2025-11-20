'use client'

import React, { createContext, ReactNode, useContext, useMemo, useState } from "react"
import { PolyScheme, SchemeMapperContextValue } from "../types/SchemeMapperContext"
import { DEFAULT_FILL, DEFAULT_PRE_FILL, DEFAULT_STROKE, HIGHLIGHT_COLOR } from "@/features/scheme-mapper/constants"

const defaultValues: SchemeMapperContextValue = {
  name: '',
  image: null, // { url: string; width: number; height: number } | null
  imageUrl: '',
  points: [],
  polygons: [],
  exportData: {}, // write object in to Google Sheets

  isPolyAddMode: false,
  isPolyEditMode: false,
  isHighlightAddMode: false,

  inputPolyName: '',
  inputPolyPreFill: DEFAULT_PRE_FILL,
  inputPolyFill: DEFAULT_FILL,
  inputStroke: DEFAULT_STROKE,
  isPrevColorsActive: false,
  isTransparentOptionActive: false,
  polygonToEdit: '',

  inputHighlightName: '',
  inputHighlightColor: HIGHLIGHT_COLOR,

  setName: () => {},
  setImage: () => {},
  setImageUrl: () => {},
  setPoints: () => {},
  setPolygons: () => {},

  setIsPolyAddMode: () => {},
  setIsPolyEditMode: () => {},
  cleanUpPolyAddOrEdit: () => {},

  setIsHighlightAddMode: () => {},
  cleanUpHighlightAdd: () => {},

  setInputPolyName: () => {},
  setInputPolyPreFill: () => {},
  setInputPolyFill: () => {},
  setInputStroke: () => {},
  setIsPrevColorsActive: () => {},
  setIsTransparentOptionActive: () => {},
  setPolygonToEdit: () => {},

  setInputHighlightName: () => {},
  setInputHighlightColor: () => {},
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

  const [isPolyAddMode, setIsPolyAddMode] = useState(defaultValues.isPolyAddMode);
  const [isPolyEditMode, setIsPolyEditMode] = useState(defaultValues.isPolyEditMode);
  const [isHighlightAddMode, setIsHighlightAddMode] = useState(defaultValues.isHighlightAddMode);

  // poly add or edit settings
  const [inputPolyName, setInputPolyName] = useState(defaultValues.inputPolyName);
  const [inputPolyPreFill, setInputPolyPreFill] = useState(defaultValues.inputPolyPreFill);
  const [inputPolyFill, setInputPolyFill] = useState(defaultValues.inputPolyFill);
  const [inputStroke, setInputStroke] = useState(defaultValues.inputStroke);
  
  const [isPrevColorsActive, setIsPrevColorsActive] = useState<boolean>(defaultValues.isPrevColorsActive);
  const [isTransparentOptionActive, setIsTransparentOptionActive] = useState<boolean>(defaultValues.isTransparentOptionActive);
  const [polygonToEdit, setPolygonToEdit] = useState(defaultValues.polygonToEdit);

  const [inputHighlightName, setInputHighlightName] = useState(defaultValues.inputHighlightName);
  const [inputHighlightColor, setInputHighlightColor] = useState(defaultValues.inputHighlightColor);

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
  }, [name, image, polygons]);

  const cleanUpPolyAddOrEdit = () => {
    setInputPolyName(defaultValues.inputPolyName);    
    setInputPolyFill(defaultValues.inputPolyFill);
    setInputPolyPreFill(defaultValues.inputPolyPreFill);
    setInputStroke(defaultValues.inputStroke);
    setIsPrevColorsActive(false);
    setIsTransparentOptionActive(false);
    
    setPolygonToEdit(defaultValues.polygonToEdit);
    setIsPolyAddMode(defaultValues.isPolyAddMode);
    setIsPolyEditMode(defaultValues.isPolyEditMode);
  };

  const cleanUpHighlightAdd = () => {
    setInputHighlightName(defaultValues.inputHighlightName);    
    setInputHighlightColor(defaultValues.inputHighlightColor);

    setIsHighlightAddMode(defaultValues.isHighlightAddMode);
  };

  return (
    <SchemeMapperContext.Provider
      value={{
        name,
        image,
        imageUrl,
        points,
        polygons,
        exportData,

        isPolyAddMode,
        isPolyEditMode,
        isHighlightAddMode,
        
        inputPolyName,
        inputPolyPreFill,
        inputPolyFill,
        inputStroke,
        isPrevColorsActive,
        isTransparentOptionActive,
        polygonToEdit,

        inputHighlightName,
        inputHighlightColor,

        setName,
        setImage,
        setPoints,
        setPolygons,
        setImageUrl,

        setIsPolyAddMode,
        setIsPolyEditMode,
        cleanUpPolyAddOrEdit,

        setIsHighlightAddMode,
        cleanUpHighlightAdd,

        setInputPolyName,
        setInputPolyPreFill,
        setInputPolyFill,
        setInputStroke,
        setIsPrevColorsActive,
        setIsTransparentOptionActive,
        setPolygonToEdit,

        setInputHighlightName,
        setInputHighlightColor,
      }}
    >
      {children}
    </SchemeMapperContext.Provider>
  )
}

export const useSchemeMapperContext = () =>
  useContext<SchemeMapperContextValue>(SchemeMapperContext)
