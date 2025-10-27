import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CharityTermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CharityTermsDialog({ open, onOpenChange }: CharityTermsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Terms of Service for Charitable Organizations</DialogTitle>
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
                By creating a Charity account on the Web-Based Donation Management System (the "Platform"), your organization 
                agrees to be bound by these Terms of Service ("Terms"). These Terms govern your access to and use of the 
                Platform as a registered charitable organization.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold">The Platform's Role</h3>
              <p>The Platform is an informational hub that provides your organization with tools to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Create a public profile to showcase your mission, vision, and impact.</li>
                <li>Post fundraising campaigns with specific goals and progress updates.</li>
                <li>Manually log donations received through your external channels.</li>
                <li>Generate and share transparency reports on fund utilization.</li>
              </ul>
              <p>
                The Platform's goal is to enhance donor trust by providing a centralized space for verified, transparent reporting.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold">Your Obligations as a Charity</h3>
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

            <section className="space-y-2">
              <h3 className="text-lg font-bold">User Conduct</h3>
              <p>Your organization agrees not to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use the Platform for any purpose other than charitable fundraising and reporting.</li>
                <li>Falsify donation records or fund usage reports.</li>
                <li>Engage in any activity that could harm the reputation or integrity of the Platform.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold">Platform Rights and Disclaimers</h3>
              <p>
                We reserve the right to suspend or permanently remove any Charity from the Platform for violating these terms, 
                failing to maintain transparency, or engaging in fraudulent activity. The Platform is provided "as is," and we 
                are not liable for any inability to secure donations.
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
