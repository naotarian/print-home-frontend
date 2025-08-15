// 顧客データの型定義
export interface CustomerData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  postal_code: string;
  prefecture: string;
  city: string;
  address_line1: string;
  address_line2: string;
  notes: string;
}

// 初期値
export const INITIAL_CUSTOMER_DATA: CustomerData = {
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  postal_code: "",
  prefecture: "",
  city: "",
  address_line1: "",
  address_line2: "",
  notes: ""
};

// localStorageキー
const CUSTOMER_DATA_KEY = "print_home_customer_data";

/**
 * 顧客データをlocalStorageに保存
 */
export const saveCustomerData = (data: CustomerData): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CUSTOMER_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save customer data:", error);
    }
  }
};

/**
 * localStorageから顧客データを取得
 */
export const loadCustomerData = (): CustomerData => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(CUSTOMER_DATA_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        // 新しいフィールドがある場合のマージ
        return { ...INITIAL_CUSTOMER_DATA, ...data };
      }
    } catch (error) {
      console.error("Failed to load customer data:", error);
    }
  }
  return INITIAL_CUSTOMER_DATA;
};

/**
 * localStorageから顧客データを削除
 */
export const clearCustomerData = (): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(CUSTOMER_DATA_KEY);
    } catch (error) {
      console.error("Failed to clear customer data:", error);
    }
  }
};

/**
 * 都道府県リスト
 */
export const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

/**
 * より厳密な電話番号バリデーション（日本の携帯電話・固定電話）
 */
export const validatePhoneNumber = (phone: string): boolean => {
  // ハイフンや空白を除去
  const cleanPhone = phone.replace(/[-\s]/g, '');
  
  // 携帯電話（090, 080, 070 + 8桁）
  const mobilePattern = /^(090|080|070)\d{8}$/;
  // 固定電話（03, 06等 + 市外局番込みで10桁または11桁）
  const landlinePattern = /^0\d{9,10}$/;
  
  return mobilePattern.test(cleanPhone) || landlinePattern.test(cleanPhone);
};

/**
 * より厳密なメールアドレスバリデーション
 */
export const validateEmail = (email: string): boolean => {
  // RFC 5322準拠の簡略版
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailPattern.test(email) && email.length <= 254;
};

/**
 * 郵便番号バリデーション
 */
export const validatePostalCode = (postalCode: string): boolean => {
  const cleanCode = postalCode.replace(/[-\s]/g, '');
  return /^\d{7}$/.test(cleanCode);
};

/**
 * 住所データの型定義（共通化用）
 */
export interface AddressData {
  postal_code: string;
  prefecture: string;
  city: string;
  address_line1: string;
  address_line2?: string;
}

/**
 * 住所データのバリデーション（顧客情報・配送先共通）
 */
export const validateAddress = (data: AddressData): { 
  isValid: boolean; 
  errors: Partial<AddressData> 
} => {
  const errors: Partial<AddressData> = {};

  if (!data.postal_code.trim()) {
    errors.postal_code = "郵便番号は必須です";
  } else if (!validatePostalCode(data.postal_code)) {
    errors.postal_code = "郵便番号の形式が正しくありません（例：123-4567）";
  }

  if (!data.prefecture) {
    errors.prefecture = "都道府県を選択してください";
  }

  if (!data.city.trim()) {
    errors.city = "市区町村は必須です";
  } else if (data.city.length > 100) {
    errors.city = "市区町村は100文字以内で入力してください";
  }

  if (!data.address_line1.trim()) {
    errors.address_line1 = "住所は必須です";
  } else if (data.address_line1.length > 200) {
    errors.address_line1 = "住所は200文字以内で入力してください";
  }

  if (data.address_line2 && data.address_line2.length > 200) {
    errors.address_line2 = "建物名・部屋番号は200文字以内で入力してください";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * 顧客データのバリデーション
 */
export const validateCustomerData = (data: CustomerData): { 
  isValid: boolean; 
  errors: Partial<CustomerData> 
} => {
  const errors: Partial<CustomerData> = {};

  // 名前のバリデーション
  if (!data.customer_name.trim()) {
    errors.customer_name = "お名前は必須です";
  } else if (data.customer_name.length > 100) {
    errors.customer_name = "お名前は100文字以内で入力してください";
  }

  // メールアドレスのバリデーション
  if (!data.customer_email.trim()) {
    errors.customer_email = "メールアドレスは必須です";
  } else if (!validateEmail(data.customer_email)) {
    errors.customer_email = "メールアドレスの形式が正しくありません";
  }

  // 電話番号のバリデーション
  if (!data.customer_phone.trim()) {
    errors.customer_phone = "電話番号は必須です";
  } else if (!validatePhoneNumber(data.customer_phone)) {
    errors.customer_phone = "電話番号の形式が正しくありません（例：090-1234-5678）";
  }

  // 住所のバリデーション
  const addressValidation = validateAddress({
    postal_code: data.postal_code,
    prefecture: data.prefecture,
    city: data.city,
    address_line1: data.address_line1,
    address_line2: data.address_line2
  });

  // 住所エラーをマージ
  Object.assign(errors, addressValidation.errors);

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
