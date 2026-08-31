"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft01Icon, Download01Icon, PrinterIcon } from "hugeicons-react";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  issueDate: string;
  totalAmount: number;
  subtotal: number;
  tax: number;
  discount: number;
  status: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  payment: { paymentMethod: string; transactionId?: string; paymentDate?: string };
  booking: { bookingNumber: string; travelDate: string; numberOfTravelers: number };
  user: { firstName?: string; lastName?: string; name?: string; email: string };
}

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/invoices/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => { if (j.success) setInvoice(j.data.invoice); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Actions (hidden when printing) */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href="/dashboard/payments" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft01Icon size={16} /> Back to payments
        </Link>
        {invoice && (
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <PrinterIcon size={15} /> Print
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              <Download01Icon size={15} /> Download PDF
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-100" />)}
        </div>
      ) : !invoice ? (
        <p className="text-gray-500">Invoice not found.</p>
      ) : (
        <div ref={printRef} className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm print:shadow-none print:border-0">
          {/* Invoice header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <Image src="/Nepal.png" alt="nepaltravels" width={36} height={36} className="rounded-xl object-contain" />
                <span className="font-bold text-gray-900">nepaltravels</span>
              </div>
              <p className="text-sm text-gray-500">Smart Tourism Pvt. Ltd.</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">INVOICE</p>
              <p className="text-sm text-gray-500 mt-1">#{invoice.invoiceNumber}</p>
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                invoice.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}>
                {invoice.status}
              </span>
            </div>
          </div>

          {/* Billed to / details */}
          <div className="grid grid-cols-2 gap-8 mb-8 border-t border-b border-gray-100 py-6">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Billed To</p>
              <p className="font-semibold text-gray-900">
                {invoice.user?.name ?? `${invoice.user?.firstName ?? ""} ${invoice.user?.lastName ?? ""}`.trim()}
              </p>
              <p className="text-sm text-gray-500">{invoice.user?.email}</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Invoice Details</p>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex gap-2">
                  <span className="text-gray-400 w-20">Issued:</span>
                  {new Date(invoice.issueDate).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-400 w-20">Booking:</span>
                  #{invoice.booking?.bookingNumber}
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-400 w-20">Method:</span>
                  <span className="capitalize">{invoice.payment?.paymentMethod}</span>
                </div>
                {invoice.payment?.transactionId && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-20">Txn ID:</span>
                    <span className="font-mono text-xs">{invoice.payment.transactionId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line items */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="pb-3 text-left">Description</th>
                <th className="pb-3 text-center">Qty</th>
                <th className="pb-3 text-right">Unit Price</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoice.items.map((item, i) => (
                <tr key={i}>
                  <td className="py-3 text-gray-700">{item.description}</td>
                  <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-3 text-right text-gray-600">${item.unitPrice}</td>
                  <td className="py-3 text-right font-semibold text-gray-900">${item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="ml-auto w-64 space-y-2 border-t border-gray-200 pt-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${invoice.subtotal}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${invoice.discount}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${invoice.tax}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
              <span>Total</span>
              <span className="text-lg text-blue-700">${invoice.totalAmount}</span>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
            Thank you for choosing nepaltravels. We hope you have an amazing trip!
          </div>
        </div>
      )}
    </div>
  );
}
