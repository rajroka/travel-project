import axios from "axios";

const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL ?? "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID ?? "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET ?? "";

export async function getPayPalAccessToken(): Promise<string> {
  const res = await axios.post(
    `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      auth: { username: PAYPAL_CLIENT_ID, password: PAYPAL_CLIENT_SECRET },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );
  return res.data.access_token as string;
}

export interface CreatePayPalOrderParams {
  amount: number; // in USD (dollars)
  bookingNumber: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PayPalOrderResult {
  orderId: string;
  approvalUrl: string;
}

export async function createPayPalOrder(
  params: CreatePayPalOrderParams
): Promise<PayPalOrderResult> {
  const accessToken = await getPayPalAccessToken();

  const orderRes = await axios.post(
    `${PAYPAL_BASE_URL}/v2/checkout/orders`,
    {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.bookingNumber,
          amount: { currency_code: "USD", value: params.amount.toFixed(2) },
        },
      ],
      application_context: {
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const orderId: string = orderRes.data.id;
  const approvalUrl: string =
    orderRes.data.links.find((l: { rel: string }) => l.rel === "approve")?.href ?? "";

  return { orderId, approvalUrl };
}

export async function capturePayPalOrder(orderId: string): Promise<Record<string, unknown>> {
  const accessToken = await getPayPalAccessToken();

  const captureRes = await axios.post(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return captureRes.data as Record<string, unknown>;
}
