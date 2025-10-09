export const GOOGLE_SHEET = {
  id: process.env.GOOGLE_SPREADSHEET_ID!,
  sheets: {
    schemes: "Schemes",
  },
  headers: {
    schemes: ["name", "url", "json"],
  },
};
