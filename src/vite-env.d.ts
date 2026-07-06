/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BRAIN_API: string;
  readonly VITE_WORKSPACE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
