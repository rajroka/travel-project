export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Privacy Policy</h1>
      <div className="prose prose-gray max-w-none space-y-6 text-gray-600 leading-7">
        <p>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <h2 className="text-xl font-semibold text-gray-800">1. Information We Collect</h2>
        <p>We collect information you provide directly, such as your name, email address, phone number, and passport details when making a booking. We also collect usage data and cookies to improve our services.</p>

        <h2 className="text-xl font-semibold text-gray-800">2. How We Use Your Information</h2>
        <p>Your information is used to process bookings, send confirmation emails, improve our services, and communicate with you about your trips. We do not sell your personal data to third parties.</p>

        <h2 className="text-xl font-semibold text-gray-800">3. Data Storage</h2>
        <p>Your data is stored securely on encrypted servers. We retain your information for as long as your account is active or as needed to provide services. You may request deletion of your data at any time.</p>

        <h2 className="text-xl font-semibold text-gray-800">4. Cookies</h2>
        <p>We use cookies to maintain your session and preferences. You can disable cookies in your browser settings, though some features may not function correctly without them.</p>

        <h2 className="text-xl font-semibold text-gray-800">5. Third-Party Services</h2>
        <p>We use Stripe for payment processing and Google for OAuth authentication. These services have their own privacy policies. We also use ImageKit for image storage.</p>

        <h2 className="text-xl font-semibold text-gray-800">6. Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal data. To exercise these rights, please contact us via the Contact page. We will respond within 30 days.</p>

        <h2 className="text-xl font-semibold text-gray-800">7. Contact</h2>
        <p>For questions about this Privacy Policy, please contact us via the Contact page.</p>
      </div>
    </div>
  );
}
