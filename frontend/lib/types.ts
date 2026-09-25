export type Match = {
  uploaded_page: number;
  uploaded_text: string;
  source_file: string;
  source_page: number;
  source_text: string;
  word_overlap: number;
  semantic_similarity: number;
};

export type CheckResult = {
  message?: string;
  passages_checked?: number;
  reference_passages?: number;
  semantic_model_loaded?: boolean;
  matches: Match[];
};

export type ReferenceUploadResult = {
  already_exists: boolean;
  id: number;
  filename: string;
  passages?: number;
  message?: string;
};