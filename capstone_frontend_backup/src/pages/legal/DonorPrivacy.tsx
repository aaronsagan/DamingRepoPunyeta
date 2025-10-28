import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DonorPrivacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Link to="/auth/register/donor">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Registration
          </Button>
        </Link>

        <div className="bg-card rounded-lg shadow-lg p-8 space-y-8">
          <div className="text-center border-b pb-6">
            <h1 className="text-4xl font-bold mb-2">Privacy Policy for Donors</h1>
            <p className="text-muted-foreground">Effective Date: October 13, 2025</p>
          </div>

          <div className="prose prose-sm max-w-none space-y-6">
            <p className="text-sm italic text-muted-foreground">
              <strong>Disclaimer:</strong> This template is for informational purposes and is not a substitute for legal advice. 
              Consult a legal professional to ensure compliance with the Data Privacy Act of 2012 (R.A. 10173) of the Philippines.
            </p>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Our Commitment to Your Privacy</h2>
              <p>
                The Web-Based Donation Management System ("we," "us") is committed to protecting the privacy of our Donors. 
                This policy details how we collect, use, and safeguard your personal information in compliance with the Data 
                Privacy Act of 2012.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Information We Collect from You</h2>
              <p>As a Donor, we collect a limited amount of information necessary to operate your account:</p>
              <p><strong>Personal Data:</strong> When you register, we collect your name and email address.</p>
              <p><strong>Donation History:</strong> While you can view your donation history on the platform, please note 
              that the details of your donations (amount, date) are manually logged into the system by the Charity you 
              supported, not by us.</p>
              <p>
                We do not collect or store any financial information, such as credit card numbers, bank account details, 
                or e-wallet credentials, as all transactions occur outside of our platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">How We Use Your Information</h2>
              <p>Your information is used exclusively to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create, secure, and maintain your Donor account.</li>
                <li>Allow you to track your donation history as logged by Charities.</li>
                <li>Communicate important notices about the platform.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Data Sharing and Disclosure</h2>
              <p>We are committed to confidentiality.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your personal information (name, email) is not sold, rented, or shared with third parties for marketing purposes.</li>
                <li>A Charity you donate to will see your name (unless you choose an anonymous option during the external 
                donation process) in order to log the donation. This is part of the direct relationship between you and the Charity.</li>
                <li>We may disclose information if required by law.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Data Security</h2>
              <p>
                We implement technical and administrative security measures, such as role-based access control and data 
                encryption, to protect your information from unauthorized access.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Your Rights</h2>
              <p>
                As a data subject under the Data Privacy Act, you have the right to access, correct, or request the deletion 
                of your personal data. To exercise these rights, please contact us.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Contact Us</h2>
              <p>
                For any privacy-related questions, please contact the project proponents via the University of Cabuyao, 
                College of Computing Studies.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
