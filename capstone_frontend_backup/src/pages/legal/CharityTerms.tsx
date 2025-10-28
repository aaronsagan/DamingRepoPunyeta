import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CharityTerms() {
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
            <h1 className="text-4xl font-bold mb-2">Terms of Service for Charitable Organizations</h1>
            <p className="text-muted-foreground">Effective Date: October 13, 2025</p>
          </div>

          <div className="prose prose-sm max-w-none space-y-6">
            <p className="text-sm italic text-muted-foreground">
              <strong>Disclaimer:</strong> This is a template based on your project manuscript and not legal advice. 
              It is highly recommended that you consult with a legal professional to ensure these terms are complete, 
              accurate, and comply with all applicable laws in the Republic of the Philippines.
            </p>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Acceptance of Terms</h2>
              <p>
                By creating a Charity account on the Web-Based Donation Management System (the "Platform"), your organization 
                agrees to be bound by these Terms of Service ("Terms"). These Terms govern your access to and use of the 
                Platform as a registered charitable organization.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">The Platform's Role</h2>
              <p>The Platform is an informational hub that provides your organization with tools to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create a public profile to showcase your mission, vision, and impact.</li>
                <li>Post fundraising campaigns with specific goals and progress updates.</li>
                <li>Manually log donations received through your external channels.</li>
                <li>Generate and share transparency reports on fund utilization.</li>
              </ul>
              <p>
                The Platform's goal is to enhance donor trust by providing a centralized space for verified, transparent reporting.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Your Obligations as a Charity</h2>
              <p>By using this Platform, your organization is fully responsible for the following:</p>
              <p><strong>Verification:</strong> You must submit accurate, current, and legitimate legal documents for verification. 
              The System Administrators have the sole discretion to approve or reject your application.</p>
              <p><strong>Content Accuracy:</strong> All information on your profile and campaigns must be truthful and not misleading.</p>
              <p><strong>Manual Donation Logging:</strong> You are solely responsible for accurately and promptly logging all 
              donations received from Donors who use the platform.</p>
              <p><strong>Fund Utilization Reporting:</strong> You must transparently report on how donated funds are used. 
              Failure to maintain transparency may result in removal from the platform.</p>
              <p><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your administrator 
              account credentials.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">User Conduct</h2>
              <p>Your organization agrees not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Platform for any purpose other than charitable fundraising and reporting.</li>
                <li>Falsify donation records or fund usage reports.</li>
                <li>Engage in any activity that could harm the reputation or integrity of the Platform.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Platform Rights and Disclaimers</h2>
              <p>
                We reserve the right to suspend or permanently remove any Charity from the Platform for violating these terms, 
                failing to maintain transparency, or engaging in fraudulent activity. The Platform is provided "as is," and we 
                are not liable for any inability to secure donations.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Governing Law</h2>
              <p>These Terms shall be governed by the laws of the Republic of the Philippines.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Contact</h2>
              <p>
                For questions regarding these Terms, please contact the project proponents via the University of Cabuyao, 
                College of Computing Studies.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
