export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Terms of Service</h1>
      <div className="prose prose-gray max-w-none space-y-6 text-gray-600 leading-7">
        <p>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <h2 className="text-xl font-semibold text-gray-800">1. Acceptance of Terms</h2>
        <p>By accessing and using our Smart Tourism Management System, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>

        <h2 className="text-xl font-semibold text-gray-800">2. Use of Services</h2>
        <p>You may use our services only for lawful purposes and in accordance with these Terms. You agree not to use the service in any way that violates applicable local, national, or international laws or regulations.</p>

        <h2 className="text-xl font-semibold text-gray-800">3. Bookings and Payments</h2>
        <p>All bookings are subject to availability and confirmation by our staff. Payments are processed securely via Stripe. We reserve the right to cancel bookings in exceptional circumstances, in which case a full refund will be issued.</p>

        <h2 className="text-xl font-semibold text-gray-800">4. Cancellation Policy</h2>
        <p>Cancellations made 14 or more days before the travel date are eligible for a full refund. Cancellations within 7–13 days receive a 50% refund. No refunds are provided for cancellations within 7 days of the travel date.</p>

        <h2 className="text-xl font-semibold text-gray-800">5. Liability</h2>
        <p>We are not liable for any indirect, incidental, or consequential damages arising from your use of our services. Our maximum liability is limited to the amount paid for the specific booking in question.</p>

        <h2 className="text-xl font-semibold text-gray-800">6. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated date. Continued use of the service constitutes acceptance of the revised terms.</p>

        <h2 className="text-xl font-semibold text-gray-800">7. Contact</h2>
        <p>For questions about these Terms, please contact us via the Contact page.</p>
      </div>
    </div>
  );
}
