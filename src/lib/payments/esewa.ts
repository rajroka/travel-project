import crypto from "crypto";

const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "";
const ESEWA_MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE || "";
const ESEWA_BASE_URL =
  process.env.ESEWA_BASE_URL || "https://rc-epay.esewa.com.np"; // sandbox default

export interface EsewaPaymentParams {
  amount: number;
  taxAmount?: number;
  serviceCharge?: number;
  deliveryCharge?: number;
  productCode: string; // booking number
  successUrl: string;
  failureUrl: string;
}

/** Build the form data for eSewa payment initiation */
export function buildEsewaPaymentData(params: EsewaPaymentParams): Record<string, string> {
  const totalAmount =
    params.amount +
    (params.taxAmount || 0) +
    (params.serviceCharge || 0) +
    (params.deliveryCharge || 0);

  const message = `total_amount=${totalAmount},transaction_uuid=${params.productCode},product_code=${ESEWA_MERCHANT_CODE}`;
  const signature = crypto
    .createHmac("sha256", ESEWA_SECRET_KEY)
    .update(message)
    .digest("base64");

  return {
    amount: String(params.amount),
    tax_amount: String(params.taxAmount || 0),
    service_charge: String(params.serviceCharge || 0),
    delivery_charge: String(params.deliveryCharge || 0),
    total_amount: String(totalAmount),
    transaction_uuid: params.productCode,
    product_code: ESEWA_MERCHANT_CODE,
    product_service_charge: "0",
    product_delivery_charge: "0",
    success_url: params.successUrl,
    failure_url: params.failureUrl,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature,
  };
}

/** Verify eSewa payment callback */
export function verifyEsewaSignature(
  totalAmount: number,
  transactionUuid: string,
  signedFieldNames: string,
  signature: string
): boolean {
  const fields = signedFieldNames.split(",");
  const dataMap: Record<string, string> = {
    total_amount: String(totalAmount),
    transaction_uuid: transactionUuid,
    product_code: ESEWA_MERCHANT_CODE,
  };
  const message = fields.map((f) => `${f}=${dataMap[f]}`).join(",");
  const expectedSignature = crypto
    .createHmac("sha256", ESEWA_SECRET_KEY)
    .update(message)
    .digest("base64");
  return signature === expectedSignature;
}

export const ESEWA_PAYMENT_URL = `${ESEWA_BASE_URL}/api/epay/main/v2/form`;
