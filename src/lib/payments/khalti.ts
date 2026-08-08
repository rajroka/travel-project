import axios from "axios";

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || "";
const KHALTI_BASE_URL =
  process.env.KHALTI_BASE_URL || "https://a.khalti.com/api/v2"; // sandbox

export interface KhaltiInitiateParams {
  amount: number; // in paisa (NPR * 100)
  purchaseOrderId: string; // booking number
  purchaseOrderName: string; // package title
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  returnUrl: string;
  websiteUrl: string;
}

export interface KhaltiInitiateResponse {
  pidx: string;
  paymentUrl: string;
  expiresAt: string;
  expiresIn: number;
}

export async function initiateKhaltiPayment(
  params: KhaltiInitiateParams
): Promise<KhaltiInitiateResponse> {
  const response = await axios.post(
    `${KHALTI_BASE_URL}/epayment/initiate/`,
    {
      return_url: params.returnUrl,
      website_url: params.websiteUrl,
      amount: params.amount,
      purchase_order_id: params.purchaseOrderId,
      purchase_order_name: params.purchaseOrderName,
      customer_info: {
        name: params.customerInfo.name,
        email: params.customerInfo.email,
        phone: params.customerInfo.phone || "",
      },
    },
    {
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return {
    pidx: response.data.pidx,
    paymentUrl: response.data.payment_url,
    expiresAt: response.data.expires_at,
    expiresIn: response.data.expires_in,
  };
}

export async function verifyKhaltiPayment(pidx: string): Promise<Record<string, unknown>> {
  const response = await axios.post(
    `${KHALTI_BASE_URL}/epayment/lookup/`,
    { pidx },
    {
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data as Record<string, unknown>;
}
