import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CreditCard, Home as HomeIcon, Truck, Clock, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-yellow-50 to-amber-100 px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
            <span className="block">思い出を</span>
            <span className="block text-primary">自宅にお届け</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg md:text-xl">
            スマホの写真を選んで送るだけ。高品質なプリント写真が最短翌日にご自宅に届きます。
          </p>
          
          {/* Hero Image Placeholder */}
          <div className="mx-auto mt-8 aspect-video w-full max-w-2xl overflow-hidden rounded-2xl bg-gray-200 shadow-xl">
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-yellow-200 to-amber-200">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-primary sm:h-16 sm:w-16" />
                <p className="mt-2 text-sm text-gray-600 sm:text-base">ここに写真のプレビューが表示されます</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link href="/step1">
              <Button size="lg" className="w-full sm:w-auto" variant="default">
                <Upload className="h-4 w-4" />
                今すぐ写真をアップロード
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Star className="h-4 w-4" />
              サービス詳細
            </Button>
          </div>
        </div>
      </section>

      {/* Print Homeとは Section */}
      <section className="px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
              Print Homeとは
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base text-gray-600 sm:text-lg">
              スマートフォンに眠る大切な思い出を、美しいプリント写真として自宅にお届けするサービスです。
            </p>
          </div>
          
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 bg-yellow-50 text-center">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Upload className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg sm:text-xl">簡単アップロード</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base">
                  最大20枚まで一度にアップロード可能。直感的な操作で誰でも簡単に利用できます。
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-amber-50 text-center">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-600 text-white">
                  <Star className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg sm:text-xl">高品質プリント</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base">
                  プロ仕様の印刷機で、色鮮やかで長期保存にも適した高品質な写真をお届けします。
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-orange-50 text-center sm:col-span-2 lg:col-span-1">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-600 text-white">
                  <Truck className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg sm:text-xl">スピード配送</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base">
                  ご注文から最短翌日にお届け。大切な思い出をすぐに手に取ることができます。
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ご利用の流れ Section */}
      <section className="bg-gray-50 px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
              ご利用の流れ
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
              たった3つのステップで、思い出の写真がご自宅に届きます
            </p>
          </div>
          
          <div className="mt-12 space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                  画像をアップロード
                </h3>
                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                  スマホから最大20枚まで写真を選択してアップロード
                </p>
                
                {/* Step Image Placeholder */}
                <div className="mt-4 aspect-square w-full max-w-xs overflow-hidden rounded-lg bg-yellow-100">
                  <div className="flex h-full items-center justify-center">
                    <Upload className="h-12 w-12 text-primary" />
                  </div>
                </div>
              </div>
              
              {/* Arrow (hidden on mobile) */}
              <div className="absolute right-0 top-8 hidden lg:block">
                <div className="h-0.5 w-8 bg-gray-300"></div>
                <div className="absolute -right-1 -top-1 h-2 w-2 rotate-45 border-r border-t border-gray-300"></div>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-600 text-white">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                  お客様情報入力
                </h3>
                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                  配送先住所とお客様情報を入力
                </p>
                
                {/* Step Image Placeholder */}
                <div className="mt-4 aspect-square w-full max-w-xs overflow-hidden rounded-lg bg-amber-100">
                  <div className="flex h-full items-center justify-center">
                    <HomeIcon className="h-12 w-12 text-amber-600" />
                  </div>
                </div>
              </div>
              
              {/* Arrow (hidden on mobile) */}
              <div className="absolute right-0 top-8 hidden lg:block">
                <div className="h-0.5 w-8 bg-gray-300"></div>
                <div className="absolute -right-1 -top-1 h-2 w-2 rotate-45 border-r border-t border-gray-300"></div>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-600 text-white">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                決済
              </h3>
              <p className="mt-2 text-sm text-gray-600 sm:text-base">
                安全な決済システムでお支払い完了
              </p>
              
              {/* Step Image Placeholder */}
              <div className="mt-4 aspect-square w-full max-w-xs overflow-hidden rounded-lg bg-orange-100">
                <div className="flex h-full items-center justify-center">
                  <CreditCard className="h-12 w-12 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 配送情報 Section */}
      <section className="px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
            配送について
          </h2>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <Card className="border border-gray-200">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">通常配送料</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary sm:text-3xl">¥350</div>
                <CardDescription className="mt-2">
                  本州・四国・九州への配送料
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <Truck className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle className="text-lg">離島・沖縄</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600 sm:text-3xl">¥850</div>
                <CardDescription className="mt-2">
                  沖縄・離島への配送料（+¥500）
                </CardDescription>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-600 sm:text-base">
            <Clock className="h-4 w-4" />
            <span>最短翌日お届け（一部地域を除く）</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-yellow-300 to-amber-400 px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            今すぐ始めてみませんか？
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-yellow-100 sm:text-lg">
            スマホに眠る思い出を、美しいプリント写真として手に取ってみてください
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link href="/step1">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                <Upload className="h-4 w-4" />
                写真をアップロードする
              </Button>
            </Link>
            <Button variant="default" size="lg">
              <Star className="h-4 w-4" />
              料金プランを見る
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Print Home</h3>
            <p className="mt-2 text-sm text-gray-600">
              思い出を美しいプリントでお届けします
            </p>
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-6 text-center">
            <p className="text-xs text-gray-500 sm:text-sm">
              © 2024 Print Home. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
