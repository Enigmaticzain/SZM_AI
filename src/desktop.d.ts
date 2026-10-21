interface DesktopTrainingFile {
  name: string;
  path: string;
  size: number;
  mimeType: string;
  content: string;
}

interface DesktopExportResult {
  canceled: boolean;
  path?: string;
}

interface DesktopApi {
  isDesktop: boolean;
  platform: string;
  versions: {
    chrome: string;
    electron: string;
    node: string;
  };
  pickTrainingFiles: () => Promise<DesktopTrainingFile[]>;
  exportKnowledgeBase: (
    data: string,
    suggestedName: string
  ) => Promise<DesktopExportResult>;
}

declare global {
  interface Window {
    desktop?: DesktopApi;
  }
}

export {};
