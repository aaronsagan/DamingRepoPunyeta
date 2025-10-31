import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CharityPrivacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Link to="/auth/register/charity">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Registration
          </Button>
        </Link>

        <div className="bg-card rounded-lg shadow-lg p-8 space-y-8">
          <div className="text-center border-b pb-6">
            <h1 className="text-4xl font-bold mb-2">Privacy Policy for Charitable Organizations</h1>
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
                The Web-Based Donation Management System ("we," "us") is committed to protecting the privacy of our partner 
                Charities. This policy outlines how we collect, use, and safeguard your organizational and personal data in 
                compliance with the Data Privacy Act of 2012.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Information We Collect from You</h2>
              <p>To operate the platform and ensure its integrity, we collect several types of information from your organization:</p>
              <p><strong>Administrator's Personal Data:</strong> We collect the name and email address of the authorized 
              Charity Administrator(s) for account management.</p>
              <p><strong>Public Organizational Data:</strong> Information you provide for your public profile, such as your 
              organization's name, mission, campaign details, and impact stories.</p>
              <p><strong>Confidential Verification Documents:</strong> To verify your legitimacy, we require you to upload 
              sensitive legal and registration documents. This data is treated as strictly confidential.</p>
              <p><strong>Donation Records:</strong> You will manually enter information about donations you receive. This may 
              include personal data of donors, for which you are also responsible as a data controller.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">How We Use Your Information</h2>
              <p>Your data is used for the following specific purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Verification:</strong> Your confidential documents are used solely by System Administrators to 
                verify the legal standing and legitimacy of your organization.</li>
                <li><strong>Platform Operation:</strong> Your public data is used to populate your profile and campaign pages 
                for Donors to view.</li>
                <li><strong>Account Management:</strong> Your administrator's contact information is used to manage your account 
                and communicate important notices.</li>
                <li><strong>Transparency:</strong> Donation and fund usage logs are used to generate reports that demonstrate 
                your organization's accountability.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Data Sharing and Disclosure</h2>
              <p>We handle your data with a clear distinction between what is public and what is private:</p>
              <p><strong>Public Information:</strong> Your organizational profile and campaign details are publicly visible 
              to all users.</p>
              <p><strong>Confidential Information:</strong> Your verification documents are strictly confidential and are only 
              accessible to our System Administrators for verification purposes. They will not be shared publicly or with any 
              third party unless required by law.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Data Security</h2>
              <p>
                We implement robust administrative and technical measures, including encryption and strict role-based access 
                controls, to protect your sensitive verification documents and other data from unauthorized access.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Your Rights</h2>
              <p>
                As a data subject, your authorized representative has the right to access, correct, or request the deletion 
                of your organization's data. To exercise these rights, please contact us.
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
