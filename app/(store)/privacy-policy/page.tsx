export const metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <div className="container-app max-w-2xl py-12 prose prose-sm">
      <h1 className="text-2xl font-bold text-ink-900">Privacy Policy</h1>
      <div className="mt-4 space-y-4 text-sm text-ink-600">
        <p>We collect the information you provide at checkout — name, phone number, email, and address — solely to process and deliver your order.</p>
        <p>We do not sell or share your personal information with third parties, except delivery partners as required to fulfill your order.</p>
        <p>Your data is stored securely and is not used for any purpose beyond order processing, customer support, and improving our service.</p>
        <p>For any privacy-related questions, please contact us using the details on our Contact page.</p>
      </div>
    </div>
  );
}
