// env.d.ts (в корне проекта или в src/)
declare namespace NodeJS {
  interface ProcessEnv {
    GOOGLE_CLIENT_EMAIL: string;
    GOOGLE_PRIVATE_KEY: string;
    GOOGLE_IMPERSONATE_SUBJECT?: string;
    GOOGLE_ROOT_FOLDER_ID?: string;
  }
}
