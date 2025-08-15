"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ArrowRight, User, MapPin, Phone, Mail, Image as ImageIcon, Package, CreditCard } from "lucide-react";
import ProgressIndicator from "@/components/ui/progress-indicator";
import { PRINT_HOME_STEPS, STEP_PATHS } from "@/lib/steps";
import { getSessionImages } from "@/app/step1/action";
import { createCartSession, redirectToStep3 } from "@/app/step2/action";
import { 
  type CustomerData, 
  type AddressData,
  PREFECTURES, 
  loadCustomerData, 
  saveCustomerData, 
  validateCustomerData,
  validateAddress 
} from "@/lib/customerData";

// getSessionImages から返される画像の型定義
interface SessionImageData {
  id: string;
  original_filename: string;
  stored_filename: string;
  file_size: number;
  width: number | null;
  height: number | null;
  url: string;
}

function Step2Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [images, setImages] = useState<SessionImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData>(loadCustomerData());
  const [formErrors, setFormErrors] = useState<Partial<CustomerData>>({});
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [deliveryData, setDeliveryData] = useState<AddressData>({
    postal_code: "",
    prefecture: "",
    city: "",
    address_line1: "",
    address_line2: "",
  });
  const [deliveryErrors, setDeliveryErrors] = useState<Partial<AddressData>>({});
  const [isTestMode, setIsTestMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // テストデータ
  const testCustomerData: CustomerData = {
    customer_name: "田中太郎",
    customer_email: "test@example.com",
    customer_phone: "090-1234-5678",
    postal_code: "123-4567",
    prefecture: "東京都",
    city: "渋谷区",
    address_line1: "神宮前1-2-3",
    address_line2: "テストマンション101号",
    notes: "",
  };

  useEffect(() => {
    if (!token) {
      setError("セッション情報が不正です。最初からやり直してください。");
      setLoading(false);
      return;
    }

    async function fetchImages() {
      try {
        const result = await getSessionImages(token!);
        if (result.success && result.images) {
          setImages(result.images as unknown as SessionImageData[]);
        } else {
          setError(result.error || "画像データの取得に失敗しました");
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        setError("画像データ取得エラー: " + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, [token]);

  const handleInputChange = (field: keyof CustomerData, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDeliveryChange = (field: keyof AddressData, value: string) => {
    setDeliveryData(prev => ({ ...prev, [field]: value }));
    if (deliveryErrors[field]) {
      setDeliveryErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFieldBlur = (field: keyof CustomerData) => {
    const validationResult = validateCustomerData({ ...customerData, [field]: customerData[field] });
    if (!validationResult.isValid && validationResult.errors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: validationResult.errors[field] }));
    }
  };

  const handleDeliveryFieldBlur = (field: keyof AddressData) => {
    const validationResult = validateAddress({ ...deliveryData, [field]: deliveryData[field] });
    if (!validationResult.isValid && validationResult.errors[field]) {
      setDeliveryErrors(prev => ({ ...prev, [field]: validationResult.errors[field] }));
    }
  };

  const fillTestData = () => {
    setCustomerData(testCustomerData);
    setFormErrors({});
  };

  const clearTestData = () => {
    setCustomerData(loadCustomerData());
    setFormErrors({});
  };

  useEffect(() => {
    if (isTestMode) {
      fillTestData();
    } else {
      clearTestData();
    }
  }, [isTestMode]);

  const handleSubmit = async () => {
    if (!token) return;

    setIsSubmitting(true);

    // バリデーション
    const customerValidationResult = validateCustomerData(customerData);
    const hasCustomerErrors = !customerValidationResult.isValid;

    let deliveryValidationResult = { isValid: true, errors: {} as Partial<AddressData> };
    if (!useSameAddress) {
      deliveryValidationResult = validateAddress(deliveryData);
    }
    const hasDeliveryErrors = !deliveryValidationResult.isValid;

    if (hasCustomerErrors || hasDeliveryErrors) {
      setFormErrors(customerValidationResult.errors);
      setDeliveryErrors(deliveryValidationResult.errors);
      setIsSubmitting(false);
      return;
    }

    // データ保存
    saveCustomerData(customerData);

    let redirectToken = '';
    
    try {
      const deliveryAddress = useSameAddress 
        ? {
            postal_code: customerData.postal_code,
            prefecture: customerData.prefecture,
            city: customerData.city,
            address_line1: customerData.address_line1,
            address_line2: customerData.address_line2,
          }
        : deliveryData;

      const result = await createCartSession(token, customerData, deliveryAddress, useSameAddress);

      if (result.success && result.cart_token) {
        redirectToken = result.cart_token;
      } else {
        setError(result.error || "注文情報の作成に失敗しました");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setError("送信中にエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
    
    // try...catchブロックの外でredirectを実行
    if (redirectToken) {
      await redirectToStep3(redirectToken);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">画像データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">エラーが発生しました</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <Button 
              onClick={() => router.push(STEP_PATHS.STEP1)}
              variant="outline"
            >
              Step1に戻る
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - only visible on mobile */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 md:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`${STEP_PATHS.STEP1}?token=${token}`)}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900">お客様情報入力</h1>
              <p className="text-xs text-gray-500">Step 2 / 4</p>
            </div>
            <div className="w-9" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Desktop Header - only visible on desktop */}
      <header className="bg-white border-b border-gray-200 hidden md:block">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => router.push(`${STEP_PATHS.STEP1}?token=${token}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Step1に戻る
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900">Step 2</h1>
              <p className="text-sm text-gray-600">{PRINT_HOME_STEPS[1].title}</p>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Progress Indicator - Responsive */}
      <div className="bg-white border-b border-gray-100">
        <div className="md:hidden">
          <ProgressIndicator steps={PRINT_HOME_STEPS} currentStep={1} variant="mobile" />
        </div>
        <div className="hidden md:block">
          <ProgressIndicator steps={PRINT_HOME_STEPS} currentStep={1} variant="default" />
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <main className="px-4 py-6 space-y-6 md:mx-auto md:max-w-4xl md:py-8">
        {/* Mobile Order Summary Card - only visible on mobile */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 md:hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Package className="h-4 w-4" />
              注文内容
            </h3>
            <span className="text-lg font-bold text-blue-600">{images.length}枚</span>
          </div>
          
          {/* Image Preview Grid - Mobile 4 columns */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {images.slice(0, 8).map((img) => (
              <div key={img.id} className="aspect-square bg-gray-100 rounded overflow-hidden">
                <img
                  src={img.url}
                  alt={img.original_filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
            {images.length > 8 && (
              <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
                <span className="text-xs text-gray-500">+{images.length - 8}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>写真プリント料金</span>
            <span>{images.length}枚 × ¥25 = ¥{images.length * 25}</span>
          </div>
        </div>

        {/* Desktop Title Section - only visible on desktop */}
        <div className="text-center hidden md:block">
          <h2 className="text-2xl font-bold text-gray-900">お客様情報を入力してください</h2>
          <p className="mt-2 text-gray-600">
            選択された{images.length}枚の写真をプリントします
          </p>
        </div>

        {/* Test Mode Toggle */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-yellow-800 md:text-base">テストモード</h4>
              <p className="text-xs text-yellow-700 md:text-sm">開発用のテストデータを使用</p>
            </div>
            <Switch
              checked={isTestMode}
              onCheckedChange={setIsTestMode}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Desktop Layout: Left Side (Images) + Right Side (Form) - only visible on desktop */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-8">
          {/* Left Side - Image Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  アップロード画像 ({images.length}枚)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((img) => (
                    <div key={img.id} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={img.url}
                          alt={img.original_filename}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="mt-2 text-xs text-gray-600 truncate">
                        {img.original_filename}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Price Summary */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">料金詳細</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-blue-800">
                      <span>写真プリント（{images.length}枚）</span>
                      <span>¥{images.length * 25}</span>
                    </div>
                    <div className="flex justify-between text-blue-800">
                      <span>配送料</span>
                      <span>¥350</span>
                    </div>
                    <div className="border-t border-blue-200 pt-2 flex justify-between font-medium text-blue-900">
                      <span>合計（税込）</span>
                      <span>¥{Math.ceil((images.length * 25 + 350) * 1.1)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Customer Form */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  お客様情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="customer_name" className="mb-2 block text-sm font-medium text-gray-700">
                    お名前 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customer_name"
                    placeholder="田中太郎"
                    value={customerData.customer_name}
                    onChange={(e) => handleInputChange("customer_name", e.target.value)}
                    onBlur={() => handleFieldBlur("customer_name")}
                    className={formErrors.customer_name ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                  {formErrors.customer_name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.customer_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customer_email" className="mb-2 block text-sm font-medium text-gray-700">
                    メールアドレス <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customer_email"
                    type="email"
                    placeholder="example@email.com"
                    value={customerData.customer_email}
                    onChange={(e) => handleInputChange("customer_email", e.target.value)}
                    onBlur={() => handleFieldBlur("customer_email")}
                    className={formErrors.customer_email ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                  {formErrors.customer_email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.customer_email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customer_phone" className="mb-2 block text-sm font-medium text-gray-700">
                    電話番号 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customer_phone"
                    type="tel"
                    placeholder="090-1234-5678"
                    value={customerData.customer_phone}
                    onChange={(e) => handleInputChange("customer_phone", e.target.value)}
                    onBlur={() => handleFieldBlur("customer_phone")}
                    className={formErrors.customer_phone ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                  {formErrors.customer_phone && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.customer_phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  住所情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Billing Address */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">請求先住所</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="postal_code" className="mb-2 block text-sm font-medium text-gray-700">
                          郵便番号 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="postal_code"
                          placeholder="123-4567"
                          value={customerData.postal_code}
                          onChange={(e) => handleInputChange("postal_code", e.target.value)}
                          onBlur={() => handleFieldBlur("postal_code")}
                          className={formErrors.postal_code ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                        />
                        {formErrors.postal_code && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.postal_code}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="prefecture" className="mb-2 block text-sm font-medium text-gray-700">
                          都道府県 <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                          value={customerData.prefecture} 
                          onValueChange={(v) => {
                            handleInputChange("prefecture", v);
                            handleFieldBlur("prefecture");
                          }}
                        >
                          <SelectTrigger 
                            id="prefecture"
                            className={formErrors.prefecture ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                          >
                            <SelectValue placeholder="選択してください" />
                          </SelectTrigger>
                          <SelectContent position="popper" side="bottom" sideOffset={4}>
                            <div className="max-h-[200px] overflow-y-auto">
                              {PREFECTURES.map((pref) => (
                                <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                              ))}
                            </div>
                          </SelectContent>
                        </Select>
                        {formErrors.prefecture && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.prefecture}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="city" className="mb-2 block text-sm font-medium text-gray-700">
                        市区町村 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        placeholder="渋谷区"
                        value={customerData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        onBlur={() => handleFieldBlur("city")}
                        className={formErrors.city ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                      />
                      {formErrors.city && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="address_line1" className="mb-2 block text-sm font-medium text-gray-700">
                        住所1 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="address_line1"
                        placeholder="神宮前1-2-3"
                        value={customerData.address_line1}
                        onChange={(e) => handleInputChange("address_line1", e.target.value)}
                        onBlur={() => handleFieldBlur("address_line1")}
                        className={formErrors.address_line1 ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                      />
                      {formErrors.address_line1 && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.address_line1}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="address_line2" className="mb-2 block text-sm font-medium text-gray-700">
                        住所2（建物名・部屋番号）
                      </Label>
                      <Input
                        id="address_line2"
                        placeholder="マンション名 101号"
                        value={customerData.address_line2}
                        onChange={(e) => handleInputChange("address_line2", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">配送先住所</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="use-same-address"
                        checked={useSameAddress}
                        onCheckedChange={(checked) => setUseSameAddress(checked === true)}
                      />
                      <Label htmlFor="use-same-address" className="text-sm">
                        請求先住所と同じ
                      </Label>
                    </div>

                    {!useSameAddress && (
                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="delivery_postal_code" className="mb-2 block text-sm font-medium text-gray-700">
                              郵便番号 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="delivery_postal_code"
                              placeholder="123-4567"
                              value={deliveryData.postal_code}
                              onChange={(e) => handleDeliveryChange("postal_code", e.target.value)}
                              onBlur={() => handleDeliveryFieldBlur("postal_code")}
                              className={deliveryErrors.postal_code ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                            />
                            {deliveryErrors.postal_code && (
                              <p className="text-red-500 text-sm mt-1">{deliveryErrors.postal_code}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="delivery_prefecture" className="mb-2 block text-sm font-medium text-gray-700">
                              都道府県 <span className="text-red-500">*</span>
                            </Label>
                            <Select 
                              value={deliveryData.prefecture} 
                              onValueChange={(v) => {
                                handleDeliveryChange("prefecture", v);
                                handleDeliveryFieldBlur("prefecture");
                              }}
                            >
                              <SelectTrigger 
                                id="delivery_prefecture"
                                className={deliveryErrors.prefecture ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                              >
                                <SelectValue placeholder="選択してください" />
                              </SelectTrigger>
                              <SelectContent position="popper" side="bottom" sideOffset={4}>
                                <div className="max-h-[200px] overflow-y-auto">
                                  {PREFECTURES.map((pref) => (
                                    <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                                  ))}
                                </div>
                              </SelectContent>
                            </Select>
                            {deliveryErrors.prefecture && (
                              <p className="text-red-500 text-sm mt-1">{deliveryErrors.prefecture}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="delivery_city" className="mb-2 block text-sm font-medium text-gray-700">
                            市区町村 <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="delivery_city"
                            placeholder="渋谷区"
                            value={deliveryData.city}
                            onChange={(e) => handleDeliveryChange("city", e.target.value)}
                            onBlur={() => handleDeliveryFieldBlur("city")}
                            className={deliveryErrors.city ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                          />
                          {deliveryErrors.city && (
                            <p className="text-red-500 text-sm mt-1">{deliveryErrors.city}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="delivery_address_line1" className="mb-2 block text-sm font-medium text-gray-700">
                            住所1 <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="delivery_address_line1"
                            placeholder="神宮前1-2-3"
                            value={deliveryData.address_line1}
                            onChange={(e) => handleDeliveryChange("address_line1", e.target.value)}
                            onBlur={() => handleDeliveryFieldBlur("address_line1")}
                            className={deliveryErrors.address_line1 ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                          />
                          {deliveryErrors.address_line1 && (
                            <p className="text-red-500 text-sm mt-1">{deliveryErrors.address_line1}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="delivery_address_line2" className="mb-2 block text-sm font-medium text-gray-700">
                            住所2（建物名・部屋番号）
                          </Label>
                          <Input
                            id="delivery_address_line2"
                            placeholder="マンション名 101号"
                            value={deliveryData.address_line2}
                            onChange={(e) => handleDeliveryChange("address_line2", e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Customer Information - only visible on mobile */}
        <div className="space-y-6 md:hidden">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                お客様情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer_name_mobile" className="mb-2 block text-sm font-medium text-gray-700">
                  お名前 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customer_name_mobile"
                  placeholder="田中太郎"
                  value={customerData.customer_name}
                  onChange={(e) => handleInputChange("customer_name", e.target.value)}
                  onBlur={() => handleFieldBlur("customer_name")}
                  className={formErrors.customer_name ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {formErrors.customer_name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.customer_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="customer_email_mobile" className="mb-2 block text-sm font-medium text-gray-700">
                  メールアドレス <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customer_email_mobile"
                  type="email"
                  placeholder="example@email.com"
                  value={customerData.customer_email}
                  onChange={(e) => handleInputChange("customer_email", e.target.value)}
                  onBlur={() => handleFieldBlur("customer_email")}
                  className={formErrors.customer_email ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {formErrors.customer_email && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.customer_email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="customer_phone_mobile" className="mb-2 block text-sm font-medium text-gray-700">
                  電話番号 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customer_phone_mobile"
                  type="tel"
                  placeholder="090-1234-5678"
                  value={customerData.customer_phone}
                  onChange={(e) => handleInputChange("customer_phone", e.target.value)}
                  onBlur={() => handleFieldBlur("customer_phone")}
                  className={formErrors.customer_phone ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {formErrors.customer_phone && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.customer_phone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                請求先住所
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="postal_code_mobile" className="mb-2 block text-sm font-medium text-gray-700">
                    郵便番号 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="postal_code_mobile"
                    placeholder="123-4567"
                    value={customerData.postal_code}
                    onChange={(e) => handleInputChange("postal_code", e.target.value)}
                    onBlur={() => handleFieldBlur("postal_code")}
                    className={formErrors.postal_code ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                  {formErrors.postal_code && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.postal_code}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="prefecture_mobile" className="mb-2 block text-sm font-medium text-gray-700">
                    都道府県 <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={customerData.prefecture} 
                    onValueChange={(v) => {
                      handleInputChange("prefecture", v);
                      handleFieldBlur("prefecture");
                    }}
                  >
                    <SelectTrigger 
                      id="prefecture_mobile"
                      className={formErrors.prefecture ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                    >
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom" sideOffset={4}>
                      <div className="max-h-[200px] overflow-y-auto">
                        {PREFECTURES.map((pref) => (
                          <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                  {formErrors.prefecture && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.prefecture}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="city_mobile" className="mb-2 block text-sm font-medium text-gray-700">
                  市区町村 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city_mobile"
                  placeholder="渋谷区"
                  value={customerData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  onBlur={() => handleFieldBlur("city")}
                  className={formErrors.city ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {formErrors.city && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address_line1_mobile" className="mb-2 block text-sm font-medium text-gray-700">
                  住所1 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address_line1_mobile"
                  placeholder="神宮前1-2-3"
                  value={customerData.address_line1}
                  onChange={(e) => handleInputChange("address_line1", e.target.value)}
                  onBlur={() => handleFieldBlur("address_line1")}
                  className={formErrors.address_line1 ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {formErrors.address_line1 && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.address_line1}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address_line2_mobile" className="mb-2 block text-sm font-medium text-gray-700">
                  住所2（建物名・部屋番号）
                </Label>
                <Input
                  id="address_line2_mobile"
                  placeholder="マンション名 101号"
                  value={customerData.address_line2}
                  onChange={(e) => handleInputChange("address_line2", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                配送先住所
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-same-address-mobile"
                  checked={useSameAddress}
                  onCheckedChange={(checked) => setUseSameAddress(checked === true)}
                />
                <Label htmlFor="use-same-address-mobile" className="text-sm">
                  請求先住所と同じ
                </Label>
              </div>

              {!useSameAddress && (
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="delivery_postal_code_mobile" className="mb-2 block text-sm font-medium text-gray-700">
                        郵便番号 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="delivery_postal_code_mobile"
                        placeholder="123-4567"
                        value={deliveryData.postal_code}
                        onChange={(e) => handleDeliveryChange("postal_code", e.target.value)}
                        onBlur={() => handleDeliveryFieldBlur("postal_code")}
                        className={deliveryErrors.postal_code ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                      />
                      {deliveryErrors.postal_code && (
                        <p className="text-red-500 text-sm mt-1">{deliveryErrors.postal_code}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="delivery_prefecture_mobile" className="mb-2 block text-sm font-medium text-gray-700">
                        都道府県 <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={deliveryData.prefecture} 
                        onValueChange={(v) => {
                          handleDeliveryChange("prefecture", v);
                          handleDeliveryFieldBlur("prefecture");
                        }}
                      >
                        <SelectTrigger 
                          id="delivery_prefecture_mobile"
                          className={deliveryErrors.prefecture ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                        >
                          <SelectValue placeholder="選択" />
                        </SelectTrigger>
                        <SelectContent position="popper" side="bottom" sideOffset={4}>
                          <div className="max-h-[200px] overflow-y-auto">
                            {PREFECTURES.map((pref) => (
                              <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                      {deliveryErrors.prefecture && (
                        <p className="text-red-500 text-sm mt-1">{deliveryErrors.prefecture}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="delivery_city_mobile" className="mb-2 block text-sm font-medium text-gray-700">
                      市区町村 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="delivery_city_mobile"
                      placeholder="渋谷区"
                      value={deliveryData.city}
                      onChange={(e) => handleDeliveryChange("city", e.target.value)}
                      onBlur={() => handleDeliveryFieldBlur("city")}
                      className={deliveryErrors.city ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                    />
                    {deliveryErrors.city && (
                      <p className="text-red-500 text-sm mt-1">{deliveryErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="delivery_address_line1_mobile" className="mb-2 block text-sm font-medium text-gray-700">
                      住所1 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="delivery_address_line1_mobile"
                      placeholder="神宮前1-2-3"
                      value={deliveryData.address_line1}
                      onChange={(e) => handleDeliveryChange("address_line1", e.target.value)}
                      onBlur={() => handleDeliveryFieldBlur("address_line1")}
                      className={deliveryErrors.address_line1 ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                    />
                    {deliveryErrors.address_line1 && (
                      <p className="text-red-500 text-sm mt-1">{deliveryErrors.address_line1}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="delivery_address_line2_mobile" className="mb-2 block text-sm font-medium text-gray-700">
                      住所2（建物名・部屋番号）
                    </Label>
                    <Input
                      id="delivery_address_line2_mobile"
                      placeholder="マンション名 101号"
                      value={deliveryData.address_line2}
                      onChange={(e) => handleDeliveryChange("address_line2", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mobile Order Summary */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              注文内容の確認
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-blue-800">
                <span>写真プリント（{images.length}枚）</span>
                <span>¥{images.length * 25}</span>
              </div>
              <div className="flex justify-between text-blue-800">
                <span>配送料</span>
                <span>¥350</span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex justify-between font-medium text-blue-900">
                <span>合計（税込）</span>
                <span>¥{Math.ceil((images.length * 25 + 350) * 1.1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Navigation - only visible on desktop */}
        <div className="hidden md:flex justify-between items-center pt-6">
          <Button
            variant="outline"
            onClick={() => router.push(`${STEP_PATHS.STEP1}?token=${token}`)}
            className="flex items-center gap-2"
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                処理中...
              </>
            ) : (
              <>
                確認画面へ
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </main>

      {/* Mobile Bottom Action Bar - only visible on mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-bottom md:hidden">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`${STEP_PATHS.STEP1}?token=${token}`)}
            className="flex-1 h-12"
            disabled={isSubmitting}
          >
            戻る
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 h-12 text-base font-medium"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                処理中...
              </>
            ) : (
              <>
                確認画面へ
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
        
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            次のステップで最終確認と決済を行います
          </p>
        </div>
      </div>

      {/* Mobile Bottom Padding - only for mobile */}
      <div className="h-24 md:hidden" />
    </div>
  );
}

export default function Step2() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <Step2Content />
    </Suspense>
  );
}