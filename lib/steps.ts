import { type StepConfig } from "@/components/ui/progress-indicator";

// Print Home サービスのステップ設定
export const PRINT_HOME_STEPS: StepConfig[] = [
  {
    id: 'upload',
    title: '画像アップロード',
    description: '最大20枚'
  },
  {
    id: 'customer-info',
    title: 'お客様情報',
    description: '配送先入力'
  },
  {
    id: 'confirmation',
    title: '最終確認',
    description: '内容確認'
  },
  {
    id: 'payment',
    title: '決済',
    description: 'お支払い'
  }
];

// ステップのパス設定
export const STEP_PATHS = {
  STEP1: '/step1',
  STEP2: '/step2',
  STEP3: '/step3',
  STEP4: '/step4',
  HOME: '/'
} as const;

// 現在のパスからステップインデックスを取得
export const getStepIndexFromPath = (path: string): number => {
  switch (path) {
    case STEP_PATHS.STEP1:
      return 0;
    case STEP_PATHS.STEP2:
      return 1;
    case STEP_PATHS.STEP3:
      return 2;
    case STEP_PATHS.STEP4:
      return 3;
    default:
      return 0;
  }
};

// ステップインデックスからパスを取得
export const getPathFromStepIndex = (stepIndex: number): string => {
  switch (stepIndex) {
    case 0:
      return STEP_PATHS.STEP1;
    case 1:
      return STEP_PATHS.STEP2;
    case 2:
      return STEP_PATHS.STEP3;
    case 3:
      return STEP_PATHS.STEP4;
    default:
      return STEP_PATHS.HOME;
  }
};

// 次のステップのパスを取得
export const getNextStepPath = (currentPath: string): string | null => {
  const currentIndex = getStepIndexFromPath(currentPath);
  const nextIndex = currentIndex + 1;
  
  if (nextIndex >= PRINT_HOME_STEPS.length) {
    return null; // 最後のステップの場合
  }
  
  return getPathFromStepIndex(nextIndex);
};

// 前のステップのパスを取得
export const getPreviousStepPath = (currentPath: string): string => {
  const currentIndex = getStepIndexFromPath(currentPath);
  const previousIndex = currentIndex - 1;
  
  if (previousIndex < 0) {
    return STEP_PATHS.HOME; // 最初のステップの場合はホームに戻る
  }
  
  return getPathFromStepIndex(previousIndex);
};
