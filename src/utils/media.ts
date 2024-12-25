export const isImage = (fileType: string | null) => {
  if (!fileType) return false;
  return fileType.startsWith('image/');
};

export const UploadProvider = {
  CLD: 'CLD',
  AZURE: 'AZURE',
  LOCAL: 'LOCAL',
} as const;
