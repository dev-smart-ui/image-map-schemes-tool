

export type SchemeMapperContextValue = {
  image: any,
  points: number[],
  polygons: PolyScheme[],
  setImage: (image: any) => void,
  setPoints: (points: number[]) => void,
  setPolygons: (polygons: PolyScheme[]) => void,
}

export type PolyScheme = {
  id: string,
  name: string,
  shape:string,
  coords: number[],
  polygon: number[][],
  strokeColor: string,
  fillColor: string,
  preFillColor: string,
}
