import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DonorPrivacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DonorPrivacyDialog({ open, onOpenChange }: DonorPrivacyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Privacy Policy for Donors</DialogTitle>
          <p className="text-sm text-muted-foreground">Effective Date: October 13, 2025</p>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <p className="text-xs italic text-muted-foreground">
              <strong>Disclaimer:</strong> This template is for informational purposes and is not a substitute for legal advice. 
              Consult a legal professional to ensure compliance with the Data Privacy Act of 2012 (R.A. 10173) of the Philippines.
            </p>

            <section className="space-y-2">
              <h3 className="text-lg font-bold">Our Commitment to Your Privacy</h3>
              <p>
                The Web-Based Donation Management System ("we," "us") is committed to protecting the privacy of our Donors. 
                This policy details how we collect, use, and safeguard your personal information in compliance with the Data 
                Privacy Act of 2012.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold">Information We Collect from You</h3>
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

            <section className="space-y-2">
              <h3 className="text-lg font-bold">How We Use Your Information</h3>
              <p>Your information is used exclusively to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Create, secure, and maintain your Donor account.</li>
                <li>Allow you to track your donation history as logged by Charities.</li>
                <li>Communicate important notices about the platform.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold">Data Sharing and Disclosure</h3>
              <p>We are committed to confidentiality.</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your personal information (name, email) is not sold, rented, or shared with third parties for marketing purposes.</li>
                <li>A Charity you donate to will see your name (unless you choose an anonymous option during the external 
                donation process) in order to log the donation. This is part of the direct relationship between you and the Charity.</li>
                <li>We may disclose information if required by law.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold">Data Security</h3>
              <p>
                We implement technical and administrative security measures, such as role-based access control and data 
                encryption, to protect your information from unauthorized access.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold">Your Rights</h3>
              <p>
                As a data subject under the Data Privacy Act, you have the right to access, correct, or request the deletion 
                of your personal data. To exercise these rights, please contact us.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold">Contact Us</h3>
              <p>
                For any privacy-related questions, please contact the project proponents via the University of Cabuyao, 
                College of Computing Studies.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
