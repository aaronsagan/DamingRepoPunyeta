import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DonorTermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DonorTermsDialog({ open, onOpenChange }: DonorTermsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Terms of Service for Donors</DialogTitle>
          <p className="text-sm text-muted-foreground">Effective Date: October 13, 2025</p>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <p className="text-xs italic text-muted-foreground">
              <strong>Disclaimer:</strong> This is a template based on your project manuscript and not legal advice. 
              It is highly recommended that you consult with a legal professional to ensure these terms are complete, 
              accurate, and comply with all applicable laws in the Republic of the Philippines.
            </p>

            <section className="space-y-2">
              <h3 className="text-lg font-bold">Acceptance of Terms</h3>
              <p>
                Welcome! By creating a Donor account or using this Web-Based Donation Management System (the "Platform"), 
                you agree to be bound by these Terms of Service ("Terms"). These Terms apply specifically to your role as 
                a Donor. If you do not agree, please do not use the Platform.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold">The Platform's Role</h3>
              <p>
                Our Platform is an informational hub designed to connect you with charitable organizations ("Charities") 
                that have undergone our verification process. Our service allows you to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
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

            <section className="space-y-2">
              <h3 className="text-lg font-bold">Your Responsibilities as a Donor</h3>
              <p><strong>Due Diligence:</strong> While we verify the legal status of Charities, you are responsible for 
              conducting your own research to ensure you are comfortable supporting a specific organization or campaign.</p>
              <p><strong>External Transactions:</strong> You acknowledge that when you donate, you are using a third-party 
              service, and the transaction is subject to that service's terms. This Platform is not a party to your transaction.</p>
              <p><strong>Accurate Information:</strong> You agree to provide accurate information when creating and maintaining 
              your account.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold">User Conduct</h3>
              <p>You agree not to use the Platform to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Engage in any fraudulent or unlawful activities.</li>
                <li>Misrepresent your identity or affiliation.</li>
                <li>Interfere with the Platform's operations or security.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold">Limitation of Liability</h3>
              <p>
                The Platform is provided "as is." We are not liable for any issues, disputes, or financial losses arising 
                from your donations made through external channels. Any dispute regarding a donation must be resolved directly 
                with the Charity. We do not endorse any specific Charity and are not responsible for how they use the funds 
                they receive.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold">Governing Law</h3>
              <p>These Terms shall be governed by the laws of the Republic of the Philippines.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold">Contact</h3>
              <p>
                For questions regarding these Terms, please contact the project proponents via the University of Cabuyao, 
                College of Computing Studies.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
