export interface PageLayout {
  pageNumber: number;
  fabricJSON: Record<string, unknown>;
  thumbnail?: string;
}

export interface EditorState {
  activeCanvasIndex: number | null;
  selectedElement: unknown | null;
  currentSpread: number;
  totalPages: number;
}
