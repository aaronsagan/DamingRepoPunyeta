import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DonorTerms() {
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
            <h1 className="text-4xl font-bold mb-2">Terms of Service for Donors</h1>
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
                Welcome! By creating a Donor account or using this Web-Based Donation Management System (the "Platform"), 
                you agree to be bound by these Terms of Service ("Terms"). These Terms apply specifically to your role as 
                a Donor. If you do not agree, please do not use the Platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">The Platform's Role</h2>
              <p>
                Our Platform is an informational hub designed to connect you with charitable organizations ("Charities") 
                that have undergone our verification process. Our service allows you to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Browse a directory of verified Charities.</li>
                <li>View detailed profiles, active campaigns, and impact stories.</li>
                <li>Access transparency reports showing how Charities utilize funds.</li>
              </ul>
              <p className="font-semibold">
                Crucial Point: This Platform does not process payments. We only display the official, external donation 
                channels provided by the Charity (e.g., GCash, PayPal, bank accounts). All transactions are conducted 
                directly between you and the Charity.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Your Responsibilities as a Donor</h2>
              <p><strong>Due Diligence:</strong> While we verify the legal status of Charities, you are responsible for 
              conducting your own research to ensure you are comfortable supporting a specific organization or campaign.</p>
              <p><strong>External Transactions:</strong> You acknowledge that when you donate, you are using a third-party 
              service, and the transaction is subject to that service's terms. This Platform is not a party to your transaction.</p>
              <p><strong>Accurate Information:</strong> You agree to provide accurate information when creating and maintaining 
              your account.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">User Conduct</h2>
              <p>You agree not to use the Platform to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Engage in any fraudulent or unlawful activities.</li>
                <li>Misrepresent your identity or affiliation.</li>
                <li>Interfere with the Platform's operations or security.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Limitation of Liability</h2>
              <p>
                The Platform is provided "as is." We are not liable for any issues, disputes, or financial losses arising 
                from your donations made through external channels. Any dispute regarding a donation must be resolved directly 
                with the Charity. We do not endorse any specific Charity and are not responsible for how they use the funds 
                they receive.
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
