"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, CreditCard, ArrowRight, Home } from "lucide-react";
import { processPaymentSuccess, redirectToThanks } from "@/app/step4/action";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
}

function Step4Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const cartToken = searchParams.get("cart_token");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 決済成功処理
  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (!sessionId || !cartToken) {
        setError("決済情報が不足しています");
        setLoading(false);
        return;
      }

      try {
        const result = await processPaymentSuccess(sessionId, cartToken);
        if (result.success && result.order) {
          setOrder(result.order as unknown as Order);
        } else {
          setError(result.error || "決済処理に失敗しました");
        }
      } catch (err) {
        console.error("決済処理エラー:", err);
        setError("決済処理中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [sessionId, cartToken]);

  // Thanksページへ遷移
  const handleGoToThanks = async () => {
    if (!order?.order_number) {
      setError("注文番号が見つかりません");
      return;
    }

    setIsProcessing(true);
    let orderNumber = '';
    
    try {
      orderNumber = order.order_number;
    } catch (err) {
      console.error("ページ遷移エラー:", err);
      setError("ページの遷移でエラーが発生しました");
    } finally {
      setIsProcessing(false);
    }
    
    // try...catchブロックの外でredirectを実行
    if (orderNumber) {
      await redirectToThanks(orderNumber);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">決済処理を確認しています...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              決済エラー
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-red-600">{error}</p>
              <Button onClick={() => router.push("/")}>
                <Home className="h-4 w-4 mr-2" />
                ホームに戻る
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              決済完了
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-6">
              <div>
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  決済が正常に完了しました！
                </p>
                <p className="text-sm text-gray-600">
                  ご注文いただきありがとうございます。
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">注文番号:</span>
                  <span className="font-mono">{order.order_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">お名前:</span>
                  <span>{order.customer_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">金額:</span>
                  <span className="font-semibold">¥{order.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ステータス:</span>
                  <span className="text-green-600">決済完了</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleGoToThanks}
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? "処理中..." : (
                    <>
                      完了ページへ
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/")}
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  ホームに戻る
                </Button>
              </div>

              <div className="text-xs text-gray-500 border-t pt-4">
                <p>確認メールを {order.customer_email} に送信いたします。</p>
                <p>商品は数日以内に配送予定です。</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

export default function Step4() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <Step4Content />
    </Suspense>
  );
}