import React from 'react';

function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto bg-[#141414] rounded-lg p-8 border border-[#2c2c2c]">
        <h1 className="text-3xl font-bold mb-6 text-center">Terms and Conditions</h1>
        <p className="text-[#b3b3b3] mb-4">
          Welcome to <span className="text-blue-500">Digital Cinema</span>. By using our platform, you agree to the following terms and conditions. Please read them carefully.
        </p>

        <h2 className="text-2xl font-semibold mb-4">1. Definitions</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Admin:</strong> The administrator responsible for managing all operations, content, and users on the platform.</li>
          <li><strong>Seller:</strong> Registered contributors who upload movies or content, ensuring compliance with our guidelines.</li>
          <li><strong>User:</strong> Individuals registered to browse and stream movies on Digital Cinema.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">2. Account Registration</h2>
        <p className="text-[#b3b3b3]">
          All users, sellers, and admins must create an account to access the platform. Users must provide accurate and up-to-date information. Failure to do so may result in account suspension or termination.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">3. Content Upload Guidelines (For Sellers)</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Sellers are responsible for uploading valid and legal content only.</li>
          <li>Any content found to be in violation of intellectual property laws or containing inappropriate material will be removed, and the seller's account may be suspended.</li>
          <li>Sellers must ensure the quality of uploaded movies meets platform standards.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">4. Content Management (Admin)</h2>
        <p className="text-[#b3b3b3]">
          The Admin holds the right to approve, reject, or remove any content uploaded to Digital Cinema. The Admin may also suspend or terminate accounts found to be violating these terms.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">5. User Conduct</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Users must use Digital Cinema for lawful purposes only.</li>
          <li>Sharing login credentials or attempting unauthorized access is strictly prohibited.</li>
          <li>Users must not download or distribute content without authorization.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">6. Payment and Subscriptions</h2>
        <p className="text-[#b3b3b3]">
          Digital Cinema may offer subscription-based services. All payments are non-refundable. Users must ensure timely payment to avoid disruption in service.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">7. Liability</h2>
        <p className="text-[#b3b3b3]">
          Digital Cinema is not responsible for any damages resulting from the use or inability to use the platform. Sellers are solely responsible for the content they upload.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">8. Termination</h2>
        <p className="text-[#b3b3b3]">
          We reserve the right to suspend or terminate any account violating these terms without prior notice.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">9. Changes to Terms</h2>
        <p className="text-[#b3b3b3]">
          Digital Cinema reserves the right to update these terms at any time. Users will be notified of significant changes via email or announcements on the platform.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">10. Contact Us</h2>
        <p className="text-[#b3b3b3]">
          If you have any questions about these terms, please contact our support team at 
          <a href="haseebsajid25100@gmail.com" className="text-blue-500 hover:underline"> haseebsajid25100@gmail.com</a>.
        </p>

        <p className="text-center text-[#b3b3b3] mt-6">
          By using Digital Cinema, you agree to these terms and conditions. Enjoy your experience!
        </p>
      </div>
    </div>
  );
}

export default TermsAndConditions;
