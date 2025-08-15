"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, Mail, Package, Calendar } from "lucide-react";

function ThanksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-2xl px-4 py-16">
        <Card>
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              ご注文ありがとうございました！
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Print Homeをご利用いただき、誠にありがとうございます。
              </p>
              <p className="text-gray-600">
                ご注文の処理が完了いたしました。
              </p>
            </div>

            {orderNumber && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">注文番号:</span>
                  <span className="font-mono text-sm font-semibold">{orderNumber}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">確認メール送信</h3>
                  <p className="text-sm text-gray-600">
                    ご登録いただいたメールアドレスに注文確認メールを送信いたします。
                    メールが届かない場合は、迷惑メールフォルダもご確認ください。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">印刷・発送</h3>
                  <p className="text-sm text-gray-600">
                    ご注文いただいた写真を高品質で印刷し、ご指定の住所にお届けいたします。
                    発送準備が整い次第、発送通知メールをお送りします。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">お届け予定</h3>
                  <p className="text-sm text-gray-600">
                    通常、ご注文から3-5営業日以内にお届けいたします。
                    （沖縄・離島地域は追加で1-2日かかる場合があります）
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  ご質問やお困りのことがございましたら、お気軽にお問い合わせください。
                </p>
                <Button 
                  onClick={() => router.push("/")}
                  className="w-full sm:w-auto"
                >
                  <Home className="h-4 w-4 mr-2" />
                  ホームに戻る
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function Thanks() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <ThanksContent />
    </Suspense>
  );
}
