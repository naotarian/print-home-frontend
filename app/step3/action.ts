// @ts-nocheck
"use server";

import { redirect } from "next/navigation";

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
 * カートセッション取得Server Action
 */
export async function getCartSession(cartToken: string) {
  try {
    const result = await makeApiCall(`/api/cart/${cartToken}`);

    if (result.success && result.cart) {
      return {
        success: true,
        cart: result.cart,
      };
    } else {
      return {
        success: false,
        error: result.error || "カートセッションの取得に失敗しました",
      };
    }
  } catch (error) {
    console.error("Cart session fetch error:", error);
    return {
      success: false,
      error: "カートセッション取得中にエラーが発生しました",
    };
  }
}

/**
 * Stripe Checkout Session作成Server Action
 */
export async function createCheckoutSession(cartToken: string) {
  try {
    const result = await makeApiCall('/api/payment/checkout/create', {
      method: 'POST',
      body: JSON.stringify({
        cart_token: cartToken,
      }),
    });

    if (result.success && result.checkout_url) {
      return {
        success: true,
        checkout_url: result.checkout_url,
        session_id: result.session_id,
      };
    } else {
      return {
        success: false,
        error: result.error || "決済セッションの作成に失敗しました",
      };
    }
  } catch (error) {
    console.error("Checkout session creation error:", error);
    return {
      success: false,
      error: "決済セッション作成中にエラーが発生しました",
    };
  }
}

/**
 * Step4への遷移Action
 */
export async function redirectToStep4(cartToken: string) {
  redirect(`/step4?cart=${cartToken}`);
}
