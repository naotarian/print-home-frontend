"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, User, MapPin, Phone, Mail, Camera, CreditCard, CheckCircle, Package, FileImage } from "lucide-react";
import ProgressIndicator from "@/components/ui/progress-indicator";
import { PRINT_HOME_STEPS, STEP_PATHS } from "@/lib/steps";
import { getCartSession, createCheckoutSession } from "@/app/step3/action";

interface ImageMetadata {
  id: string;
  original_filename: string;
  stored_filename: string;
  file_size: number;
  width: number | null;
  height: number | null;
  url: string;
}

interface CartData {
  id: string;
  cart_token: string;
  upload_session_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  postal_code: string;
  prefecture: string;
  city: string;
  address_line1: string;
  address_line2?: string;
  use_same_address: boolean;
  delivery_postal_code?: string;
  delivery_prefecture?: string;
  delivery_city?: string;
  delivery_address_line1?: string;
  delivery_address_line2?: string;
  image_count: number;
  item_amount_ex_tax: number;
  item_tax_amount: number;
  item_amount_inc_tax: number;
  item_tax_rate: number;
  shipping_amount_ex_tax: number;
  shipping_tax_amount: number;
  shipping_amount_inc_tax: number;
  shipping_tax_rate: number;
  total_amount: number;
  upload_session: {
    id: string;
    token: string;
    uploaded_images: ImageMetadata[];
  };
}

function Step3Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cartToken = searchParams.get("cart");

  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!cartToken) {
      setError("カート情報が見つかりません");
      setLoading(false);
      return;
    }

    async function fetchCart() {
      try {
        const result = await getCartSession(cartToken!);
        if (result.success && result.cart) {
          setCart(result.cart);
        } else {
          setError(result.error || "カート情報の取得に失敗しました");
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        setError("カート情報取得エラー: " + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchCart();
  }, [cartToken]);

  const handleBack = () => {
    if (cart) {
      router.push(`${STEP_PATHS.STEP2}?token=${cart.upload_session.token}`);
    }
  };

  const handleNext = async () => {
    if (!cart || !isConfirmed) return;

    setIsSubmitting(true);

    try {
      const result = await createCheckoutSession(cart.cart_token);
      if (result.success && result.checkout_url) {
        window.location.href = result.checkout_url;
      } else {
        setError(result.error || "決済セッションの作成に失敗しました");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError("決済処理中にエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">注文内容を確認中...</p>
        </div>
      </div>
    );
  }

  if (error || !cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">エラーが発生しました</h2>
            <p className="text-red-700 mb-4">{error || "カート情報が見つかりません"}</p>
            <Button 
              onClick={() => router.push(STEP_PATHS.HOME)}
              variant="outline"
            >
              ホームに戻る
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
              onClick={handleBack}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900">最終確認</h1>
              <p className="text-xs text-gray-500">Step 3 / 4</p>
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
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Step2に戻る
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900">Step 3</h1>
              <p className="text-sm text-gray-600">{PRINT_HOME_STEPS[2].title}</p>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Progress Indicator - Responsive */}
      <div className="bg-white border-b border-gray-100">
        <div className="md:hidden">
          <ProgressIndicator steps={PRINT_HOME_STEPS} currentStep={2} variant="mobile" />
        </div>
        <div className="hidden md:block">
          <ProgressIndicator steps={PRINT_HOME_STEPS} currentStep={2} variant="default" />
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <main className="px-4 py-6 space-y-6 md:mx-auto md:max-w-4xl md:py-8">
        {/* Mobile Order Summary Card - only visible on mobile */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 md:hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5" />
              ご注文内容
            </h3>
            <span className="text-lg font-bold text-blue-600">{cart.image_count}枚</span>
          </div>
          
          {/* Price Breakdown */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">写真プリント（{cart.image_count}枚）</span>
              <span className="font-medium">{formatPrice(cart.item_amount_inc_tax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">配送料</span>
              <span className="font-medium">{formatPrice(cart.shipping_amount_inc_tax)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-lg text-blue-900">
              <span>合計（税込）</span>
              <span>{formatPrice(cart.total_amount)}</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            ※税率{cart.item_tax_rate}%が含まれています
          </div>
        </div>

        {/* Desktop Title Section - only visible on desktop */}
        <div className="text-center hidden md:block">
          <h2 className="text-2xl font-bold text-gray-900">注文内容をご確認ください</h2>
          <p className="mt-2 text-gray-600">
            内容に間違いがないかご確認の上、決済にお進みください
          </p>
        </div>

        {/* Images Section - Responsive */}
        <Card className="md:shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 md:hidden" />
              <FileImage className="h-5 w-5 hidden md:block" />
              アップロード写真 ({cart.image_count}枚)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile 3-column grid / Desktop 5-column grid */}
            <div className="grid grid-cols-3 gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 md:gap-4">
              {cart.upload_session.uploaded_images.map((image, index) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.original_filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded md:top-2 md:left-2 md:text-sm md:px-2 md:py-1">
                    {index + 1}
                  </div>
                  <div className="mt-1 text-xs text-gray-600 truncate md:mt-2 md:text-sm">
                    {image.original_filename}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
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
                <dt className="text-sm font-medium text-gray-500">お名前</dt>
                <dd className="text-sm text-gray-900">{cart.customer_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  メールアドレス
                </dt>
                <dd className="text-sm text-gray-900 break-all">{cart.customer_email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  電話番号
                </dt>
                <dd className="text-sm text-gray-900">{cart.customer_phone}</dd>
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
                <h4 className="text-sm font-medium text-gray-700 mb-2">請求先住所</h4>
                <div className="text-sm text-gray-900 space-y-1">
                  <div>〒{cart.postal_code}</div>
                  <div>{cart.prefecture}{cart.city}</div>
                  <div>{cart.address_line1}</div>
                  {cart.address_line2 && <div>{cart.address_line2}</div>}
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">配送先住所</h4>
                {cart.use_same_address ? (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    請求先住所と同じ
                  </div>
                ) : (
                  <div className="text-sm text-gray-900 space-y-1">
                    <div>〒{cart.delivery_postal_code}</div>
                    <div>{cart.delivery_prefecture}{cart.delivery_city}</div>
                    <div>{cart.delivery_address_line1}</div>
                    {cart.delivery_address_line2 && <div>{cart.delivery_address_line2}</div>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Desktop Order Summary - only visible on desktop */}
        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              料金詳細
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>写真プリント（{cart.image_count}枚）</span>
                <span>{formatPrice(cart.item_amount_inc_tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>配送料</span>
                <span>{formatPrice(cart.shipping_amount_inc_tax)}</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-lg font-bold">
                <span>合計（税込）</span>
                <span>{formatPrice(cart.total_amount)}</span>
              </div>
              <div className="text-sm text-gray-500">
                ※税率{cart.item_tax_rate}%が含まれています
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Checkbox - Responsive */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="confirm"
              checked={isConfirmed}
              onCheckedChange={(checked) => setIsConfirmed(checked === true)}
              className="mt-1"
            />
            <div className="flex-1">
              <label htmlFor="confirm" className="text-sm font-medium text-blue-900 cursor-pointer md:text-base">
                上記の注文内容で間違いありません
              </label>
              <p className="text-xs text-blue-700 mt-1 md:text-sm">
                チェックを入れると決済画面に進みます。内容に間違いがないかご確認ください。
              </p>
            </div>
          </div>
        </div>

        {/* Payment Info - Responsive */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 md:p-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2 md:text-base">
            <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
            お支払いについて
          </h4>
          <ul className="text-xs text-gray-600 space-y-1 md:text-sm md:space-y-2">
            <li>• クレジットカード決済（Stripe）</li>
            <li>• 決済完了後、印刷・配送を開始します</li>
            <li>• 配送は通常3-5営業日でお届けします</li>
            <li>• 領収書はメールで送信されます</li>
          </ul>
        </div>

        {/* Desktop Navigation - only visible on desktop */}
        <div className="hidden md:flex justify-between items-center pt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4" />
            修正する
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isConfirmed || isSubmitting}
            className="flex items-center gap-2"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                決済画面へ...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                決済へ進む
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
            onClick={handleBack}
            className="flex-1 h-12"
            disabled={isSubmitting}
          >
            修正する
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isConfirmed || isSubmitting}
            className="flex-1 h-12 text-base font-medium"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                決済画面へ...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                決済へ進む
              </>
            )}
          </Button>
        </div>
        
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            {isConfirmed ? "決済画面（Stripe）に移動します" : "内容をご確認の上、チェックを入れてください"}
          </p>
        </div>
      </div>

      {/* Mobile Bottom Padding - only for mobile */}
      <div className="h-24 md:hidden" />
    </div>
  );
}

export default function Step3() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <Step3Content />
    </Suspense>
  );
}