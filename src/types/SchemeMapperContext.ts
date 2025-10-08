

export type SchemeMapperContextValue = {
  name: string,
  image: any,
  points: number[],
  polygons: PolyScheme[],
  exportData: ExportDataScheme | {},
  setName: (name: string) => void,
  setImage: (image: any) => void,
  setPoints: (points: number[]) => void,
  setPolygons: (polygons: PolyScheme[]) => void,
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
}

export type ExportDataScheme = {
  name: string,
  image: {
    width: string,
    height: string,
  },
  areas: PolyScheme[]
}
