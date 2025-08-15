// 画像アップロード用のバリデーションロジック

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  size: number;
  name: string;
}

export interface ValidationError {
  type: 'file_type' | 'file_size' | 'file_count' | 'duplicate' | 'corrupted';
  message: string;
  fileName?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  validFiles: File[];
}

export interface ValidationConfig {
  maxImages: number;
  maxFileSize: number; // bytes
  allowedTypes: string[];
  allowedExtensions: string[];
}

// デフォルト設定
export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  maxImages: 20,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  allowedExtensions: ['.jpg', '.jpeg', '.png']
};

/**
 * ファイル配列のバリデーションを実行
 */
export const validateFiles = (
  files: File[], 
  uploadedImages: UploadedImage[], 
  config: ValidationConfig = DEFAULT_VALIDATION_CONFIG
): ValidationResult => {
  const errors: ValidationError[] = [];
  const validFiles: File[] = [];
  
  // 現在のファイル数チェック
  if (uploadedImages.length + files.length > config.maxImages) {
    errors.push({
      type: 'file_count',
      message: `最大${config.maxImages}枚まで選択可能です。現在${uploadedImages.length}枚選択済みです。`
    });
  }
  
  files.forEach((file) => {
    // ファイル形式チェック
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!config.allowedTypes.includes(file.type) && !config.allowedExtensions.includes(fileExtension)) {
      errors.push({
        type: 'file_type',
        message: `${file.name}は対応していない形式です。JPGまたはPNG形式のファイルを選択してください。`,
        fileName: file.name
      });
      return;
    }
    
    // ファイルサイズチェック
    if (file.size > config.maxFileSize) {
      const sizeMB = Math.round(file.size / (1024 * 1024) * 10) / 10;
      const maxSizeMB = Math.round(config.maxFileSize / (1024 * 1024) * 10) / 10;
      errors.push({
        type: 'file_size',
        message: `${file.name}のファイルサイズが大きすぎます（${sizeMB}MB）。${maxSizeMB}MB以下のファイルを選択してください。`,
        fileName: file.name
      });
      return;
    }
    
    // 重複チェック（既存のアップロード済みファイルとの比較）
    const isDuplicate = uploadedImages.some(uploaded => 
      uploaded.name === file.name && uploaded.size === file.size
    );
    if (isDuplicate) {
      errors.push({
        type: 'duplicate',
        message: `${file.name}は既に選択済みです。`,
        fileName: file.name
      });
      return;
    }
    
    // 重複チェック（新しいファイル同士の比較）
    const isDuplicateInNewFiles = validFiles.some(validFile => 
      validFile.name === file.name && validFile.size === file.size
    );
    if (isDuplicateInNewFiles) {
      errors.push({
        type: 'duplicate',
        message: `${file.name}が重複しています。`,
        fileName: file.name
      });
      return;
    }
    
    validFiles.push(file);
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    validFiles: validFiles.slice(0, config.maxImages - uploadedImages.length)
  };
};

/**
 * ファイルが有効な画像かどうかチェック
 */
export const isValidImageFile = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(true);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    
    img.src = url;
  });
};

/**
 * ファイルサイズを人間が読みやすい形式に変換
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * ファイル名から拡張子を取得
 */
export const getFileExtension = (fileName: string): string => {
  return fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
};

/**
 * accept属性用の文字列を生成
 */
export const generateAcceptString = (config: ValidationConfig = DEFAULT_VALIDATION_CONFIG): string => {
  return [...config.allowedTypes, ...config.allowedExtensions].join(',');
};

/**
 * エラーメッセージをタイプ別にフィルタリング
 */
export const filterErrorsByType = (errors: ValidationError[], type: ValidationError['type']): ValidationError[] => {
  return errors.filter(error => error.type === type);
};

/**
 * エラーの要約を生成
 */
export const getErrorSummary = (errors: ValidationError[]): string => {
  if (errors.length === 0) return '';
  
  const errorCounts = errors.reduce((acc, error) => {
    acc[error.type] = (acc[error.type] || 0) + 1;
    return acc;
  }, {} as Record<ValidationError['type'], number>);
  
  const summaryParts: string[] = [];
  
  if (errorCounts.file_type) {
    summaryParts.push(`形式エラー: ${errorCounts.file_type}件`);
  }
  if (errorCounts.file_size) {
    summaryParts.push(`サイズエラー: ${errorCounts.file_size}件`);
  }
  if (errorCounts.duplicate) {
    summaryParts.push(`重複エラー: ${errorCounts.duplicate}件`);
  }
  if (errorCounts.file_count) {
    summaryParts.push(`枚数制限エラー: ${errorCounts.file_count}件`);
  }
  if (errorCounts.corrupted) {
    summaryParts.push(`破損ファイル: ${errorCounts.corrupted}件`);
  }
  
  return summaryParts.join(', ');
};
