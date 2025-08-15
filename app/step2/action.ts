// @ts-nocheck
"use server";

import { redirect } from "next/navigation";
import type { CustomerData, AddressData } from "@/lib/customerData";

const API_BASE_URL = process.env.API_BASE_URL || "http://nginx";

/**
 * API呼び出し共通関数
 */
async function makeApiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed to ${url}:`, error);
    throw error;
  }
}

/**
 * 注文作成のリクエストデータ型
 */
interface CreateOrderRequest {
  session_token: string;
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
  notes?: string;
}

/**
 * 注文作成APIのレスポンス型
 */
interface CreateOrderResponse {
  success: boolean;
  order?: {
    id: string;
    order_number: string;
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
    status: string;
    notes?: string;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}

/**
 * カートセッション作成Server Action
 */
export async function createCartSession(
  token: string,
  customerData: CustomerData,
  deliveryData: AddressData | null,
  useSameAddress: boolean
) {
  try {
    // リクエストデータを準備
    const requestData: CreateOrderRequest = {
      session_token: token,
      customer_name: customerData.customer_name,
      customer_email: customerData.customer_email,
      customer_phone: customerData.customer_phone,
      postal_code: customerData.postal_code,
      prefecture: customerData.prefecture,
      city: customerData.city,
      address_line1: customerData.address_line1,
      address_line2: customerData.address_line2 || undefined,
      use_same_address: useSameAddress,
      notes: customerData.notes || undefined,
    };

    // 配送先住所を追加（別住所の場合）
    if (!useSameAddress && deliveryData) {
      requestData.delivery_postal_code = deliveryData.postal_code;
      requestData.delivery_prefecture = deliveryData.prefecture;
      requestData.delivery_city = deliveryData.city;
      requestData.delivery_address_line1 = deliveryData.address_line1;
      requestData.delivery_address_line2 = deliveryData.address_line2 || undefined;
    }

    // API呼び出し
    const result = await makeApiCall('/api/cart/create', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });

    if (result.success && result.cart_token) {
      return {
        success: true,
        cart_token: result.cart_token,
        cart: result.cart,
      };
    } else {
      return {
        success: false,
        error: result.error || "カートセッションの作成に失敗しました",
      };
    }
  } catch (error) {
    console.error("Cart session creation error:", error);
    return {
      success: false,
      error: "カートセッション作成中にエラーが発生しました",
    };
  }
}

/**
 * Step3への遷移Action
 */
export async function redirectToStep3(cartToken: string) {
  redirect(`/step3?cart=${cartToken}`);
}
