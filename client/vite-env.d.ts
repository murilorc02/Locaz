    /// <reference types="vite/client" />

    interface ImportMetaEnv {
      readonly VITE_APP_TITLE: string;
      // Add other environment variables as needed, e.g.,
      // readonly VITE_API_URL: string;
    }

    interface ImportMeta {
      readonly env: ImportMetaEnv;
    }