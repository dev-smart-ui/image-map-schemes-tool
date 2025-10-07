export const GOOGLE_SHEET = {
  id: process.env.GOOGLE_SPREADSHEET_ID!,
  sheets: {
    floors: "FloorsAndLevels",
    polygons: "Polygons",
  },
    headers: {
    floors: ["floorOrLevel","imageId","imageUrl","widthPx","heightPx","updatedUtc"],
    polygons: ["floorOrLevel","unitId","polygonsJson","updatedUtc"],
  },
};
