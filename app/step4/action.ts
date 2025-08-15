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
 * 決済成功処理Server Action
 */
export async function processPaymentSuccess(sessionId: string, cartToken: string) {
  try {
    const result = await makeApiCall('/api/payment/success', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        cart_token: cartToken,
      }),
    });

    if (result.success && result.order) {
      return {
        success: true,
        order: result.order,
        session_id: result.session_id,
      };
    } else {
      return {
        success: false,
        error: result.error || "決済処理に失敗しました",
      };
    }
  } catch (error) {
    console.error("Payment success processing error:", error);
    return {
      success: false,
      error: "決済処理中にエラーが発生しました",
    };
  }
}

/**
 * Thanksページへの遷移Action
 */
export async function redirectToThanks(orderNumber: string) {
  redirect(`/thanks?order=${orderNumber}`);
}
