

export type SchemeMapperContextValue = {
  name: string,
  image: any,
  imageUrl: string,
  points: number[],
  polygons: PolyScheme[],
  exportData: ExportDataScheme | {},

  isPolyAddMode: boolean,
  isPolyEditMode: boolean,
  isHighlightAddMode: boolean,

  inputPolyName: string,
  inputPolyPreFill: string,
  inputPolyFill: string,
  inputStroke: string,
  isPrevColorsActive: boolean,
  isTransparentOptionActive: boolean,
  polygonToEdit: string,

  inputHighlightName: string,
  inputHighlightColor: string,

  setName: (name: string) => void,
  setImage: (image: any) => void,
  setPoints: (points: number[]) => void,
  setPolygons: (polygons: PolyScheme[]) => void,
  setImageUrl: (url: string) => void,

  setIsPolyAddMode: (status: boolean) => void,
  setIsPolyEditMode: (status: boolean) => void,
  cleanUpPolyAddOrEdit: () => void,

  setIsHighlightAddMode: (status: boolean) => void,
  cleanUpHighlightAdd: () => void,

  setInputPolyName: (name: string) => void,
  setInputPolyPreFill: (color: string) => void,
  setInputPolyFill: (color: string) => void,
  setInputStroke: (color: string) => void,
  setIsPrevColorsActive: (status: boolean) => void,
  setIsTransparentOptionActive: (status: boolean) => void,
  setPolygonToEdit: (poly: string) => void,

  setInputHighlightName: (name: string) => void,
  setInputHighlightColor: (color: string) => void,
}

export type PolyScheme = {
  id: string,
  name: string,
  shape: string,
  coords: number[],
  polygon: number[][],
  strokeColor: string,
  fillColor: string,
  preFillColor: string,
  type: string,
}

export type ExportDataScheme = {
  name: string,
  image: {
    width: string,
    height: string,
  },
  areas: PolyScheme[]
}
