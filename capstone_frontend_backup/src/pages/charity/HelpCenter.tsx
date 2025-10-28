import { useState } from "react";
import {
  Search,
  HelpCircle,
  MessageCircle,
  Send,
  Upload as UploadIcon,
  DollarSign,
  Megaphone,
  FileText,
  Lock,
  Book,
  Video,
  ExternalLink,
  Star,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Smile,
  Meh,
  Frown,
  Bug,
  Lightbulb,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: any;
  color: string;
  faqs: FAQItem[];
}

export default function HelpCenter() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string>("");
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
    attachment: null as File | null,
  });

  // Feedback Form State
  const [feedbackForm, setFeedbackForm] = useState({
    type: "",
    message: "",
    rating: 0,
    attachment: null as File | null,
  });

  // FAQ Categories
  const faqCategories: FAQCategory[] = [
    {
      id: "donations",
      title: "Donations & Fund Management",
      icon: DollarSign,
      color: "text-green-600",
      faqs: [
        {
          question: "How do I track donations for my campaigns?",
          answer: "Navigate to the Donations page from your dashboard. You'll see all donations organized by campaign, with real-time status updates. Use filters to view by date range, status, or specific campaigns. You can also export donation reports for accounting purposes.",
        },
        {
          question: "What should I do if a donor's transaction isn't confirmed?",
          answer: "Check the Donations page for pending transactions. Review the proof of payment uploaded by the donor. If valid, click the 'Confirm' button. If there's an issue, click 'Reject' and provide a clear reason so the donor can resubmit with correct information.",
        },
        {
          question: "How do I issue a receipt or acknowledgement?",
          answer: "On the Donations page, click the 'View' icon next to any confirmed donation. In the details modal, you'll find a 'Download Receipt' button that generates a PDF receipt with your organization's details and the donation information.",
        },
        {
          question: "Can I accept recurring donations?",
          answer: "Yes! When donors make a donation, they can choose to set it as recurring (weekly, monthly, quarterly, or yearly). You'll see these marked with a 'Recurring' badge in your donations list.",
        },
      ],
    },
    {
      id: "campaigns",
      title: "Campaigns & Updates",
      icon: Megaphone,
      color: "text-blue-600",
      faqs: [
        {
          question: "How do I create or edit a campaign?",
          answer: "Go to the Campaigns page and click 'Create Campaign'. Fill in the title, description, goal amount, and end date. You can add images and select a category. To edit, click the edit icon on any campaign card. Changes are saved immediately.",
        },
        {
          question: "Can I post updates to my supporters?",
          answer: "Absolutely! Visit the Updates page to share news, milestones, and impact stories. You can add text, images, and even create threaded updates. Supporters who follow your organization will be notified of new updates.",
        },
        {
          question: "What's the difference between active, paused, and completed campaigns?",
          answer: "Active campaigns accept donations and appear in search results. Paused campaigns are temporarily hidden but can be reactivated. Completed campaigns have reached their end date or goal and no longer accept donations, but remain visible for transparency.",
        },
        {
          question: "How do I share my campaign?",
          answer: "Each campaign has a 'Share' button that provides a unique link. You can copy this link to share on social media, email, or your website. The link directs donors to your campaign's public page where they can donate directly.",
        },
      ],
    },
    {
      id: "verification",
      title: "Verification & Compliance",
      icon: FileText,
      color: "text-purple-600",
      faqs: [
        {
          question: "What documents are required for verification?",
          answer: "You need to submit: (1) Government registration certificate, (2) Annual audit report or financial statement, (3) Compliance certificate from relevant authorities, and (4) Valid ID of authorized representative. All documents should be in PDF, DOCX, or XLSX format.",
        },
        {
          question: "How long does verification take?",
          answer: "Initial verification typically takes 3-5 business days. Our team reviews all submitted documents for authenticity and compliance. You'll receive email notifications about your verification status. If additional documents are needed, we'll request them through the platform.",
        },
        {
          question: "Where can I upload my compliance reports?",
          answer: "Go to Reports & Compliance → Document Uploads / Audits. Click 'Upload New Document', select the document type, add a description, and upload your file. You can track the status of all submissions and view admin feedback on this page.",
        },
        {
          question: "What happens if my documents are rejected?",
          answer: "You'll receive detailed feedback explaining why. Common reasons include expired documents, unclear scans, or missing information. Simply address the issues mentioned and resubmit updated documents through the same page.",
        },
      ],
    },
    {
      id: "account",
      title: "Account & Security",
      icon: Lock,
      color: "text-red-600",
      faqs: [
        {
          question: "How do I update my profile information?",
          answer: "Click your profile icon → Settings → Account Settings. Here you can update your personal information, organization details, contact information, and preferences. Remember to click 'Save Changes' after making updates.",
        },
        {
          question: "What should I do if I forget my password?",
          answer: "On the login page, click 'Forgot Password'. Enter your registered email address, and we'll send you a password reset link. The link expires in 1 hour for security. If you don't receive the email, check your spam folder.",
        },
        {
          question: "How can I enable two-factor authentication?",
          answer: "Go to Settings → Security & Access Control. Toggle on 'Two-Factor Authentication'. You'll be prompted to set up an authenticator app. Scan the QR code with your app, enter the verification code, and save. You'll need this code each time you log in.",
        },
        {
          question: "How can I delete or deactivate my account?",
          answer: "Go to Settings → Danger Zone. You can choose to deactivate (temporary, reversible) or delete (permanent) your account. Deactivation hides your profile but preserves data. Deletion removes all data after a 30-day grace period. Active campaigns must be closed first.",
        },
      ],
    },
  ];

  // Filter FAQs based on search
  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.faqs.length > 0);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.subject || !contactForm.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    // TODO: Send to backend
    toast.success("✅ Your message has been sent! Our team will respond within 1–2 business days.");
    
    // Reset form
    setContactForm({
      ...contactForm,
      subject: "",
      message: "",
      attachment: null,
    });
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackForm.type || !feedbackForm.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    // TODO: Send to backend
    toast.success("Thank you for your feedback! We appreciate your input.");
    
    // Reset form
    setFeedbackForm({
      type: "",
      message: "",
      rating: 0,
      attachment: null,
    });
  };

  const handleRating = (rating: number) => {
    setFeedbackForm({ ...feedbackForm, rating });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Help Center & Support</h1>
            <p className="text-muted-foreground">
              Find answers, get in touch, and make the most of your charity dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 py-8 space-y-8">
        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          </div>

          {searchQuery && filteredCategories.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No results found for "{searchQuery}". Try different keywords or contact support.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6">
            {(searchQuery ? filteredCategories : faqCategories).map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${category.color}`} />
                      {category.title}
                      <Badge variant="secondary" className="ml-auto">
                        {category.faqs.length} FAQs
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`${category.id}-${index}`}>
                          <AccordionTrigger className="text-left hover:no-underline">
                            <span className="font-medium">{faq.question}</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Contact Support Section */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Contact Support
            </CardTitle>
            <CardDescription>
              Still need help? Reach out to our support team — we'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Full Name *</Label>
                  <Input
                    id="contact-name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email Address *</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-subject">Subject *</Label>
                <Select
                  value={contactForm.subject}
                  onValueChange={(value) => setContactForm({ ...contactForm, subject: value })}
                >
                  <SelectTrigger id="contact-subject">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donations">Donations</SelectItem>
                    <SelectItem value="campaign">Campaign</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="verification">Verification</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-message">Message *</Label>
                <Textarea
                  id="contact-message"
                  placeholder="Describe your issue or question in detail..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-attachment">Attachment (Optional)</Label>
                <Input
                  id="contact-attachment"
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => setContactForm({ ...contactForm, attachment: e.target.files?.[0] || null })}
                />
                <p className="text-xs text-muted-foreground">
                  Upload screenshots or documents (Max 10MB)
                </p>
              </div>

              <Button type="submit" className="w-full md:w-auto">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Feedback / Issue Reporting Section */}
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              Feedback & Issue Reporting
            </CardTitle>
            <CardDescription>
              Help us improve! Report bugs, suggest features, or share your thoughts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback-type">Feedback Type *</Label>
                <Select
                  value={feedbackForm.type}
                  onValueChange={(value) => setFeedbackForm({ ...feedbackForm, type: value })}
                >
                  <SelectTrigger id="feedback-type">
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">
                      <div className="flex items-center gap-2">
                        <Bug className="h-4 w-4" />
                        Bug Report
                      </div>
                    </SelectItem>
                    <SelectItem value="suggestion">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Suggestion
                      </div>
                    </SelectItem>
                    <SelectItem value="comment">General Comment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback-message">Message *</Label>
                <Textarea
                  id="feedback-message"
                  placeholder="Share your feedback..."
                  value={feedbackForm.message}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>How satisfied are you with the platform?</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      type="button"
                      variant={feedbackForm.rating === rating ? "default" : "outline"}
                      size="icon"
                      onClick={() => handleRating(rating)}
                    >
                      <Star className={`h-4 w-4 ${feedbackForm.rating >= rating ? 'fill-current' : ''}`} />
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback-attachment">Screenshot / Attachment (Optional)</Label>
                <Input
                  id="feedback-attachment"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, attachment: e.target.files?.[0] || null })}
                />
              </div>

              <Button type="submit" className="w-full md:w-auto">
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Feedback
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Support Resources Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Book className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Support Resources</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                    <Book className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">User Guide</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete getting started manual
                  </p>
                  <Button variant="link" className="p-0">
                    Read Guide <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                    <Video className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Video Tutorials</h3>
                  <p className="text-sm text-muted-foreground">
                    Step-by-step video guides
                  </p>
                  <Button variant="link" className="p-0">
                    Watch Videos <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold">Policy Documents</h3>
                  <p className="text-sm text-muted-foreground">
                    Privacy Policy & Terms
                  </p>
                  <Button variant="link" className="p-0">
                    View Policies <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold">Reporting Guide</h3>
                  <p className="text-sm text-muted-foreground">
                    Transparency & compliance
                  </p>
                  <Button variant="link" className="p-0">
                    Learn More <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
