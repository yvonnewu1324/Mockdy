/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_NOTION_API_KEY?: string;
  readonly VITE_NOTION_DATABASE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

