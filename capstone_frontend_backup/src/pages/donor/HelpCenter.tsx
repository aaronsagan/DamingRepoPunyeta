import { useState } from "react";
import { Search, HelpCircle, Mail, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Donations Category
  {
    category: "Donations",
    question: "How do I make a donation?",
    answer: "To make a donation, navigate to the 'Charities' page, select a charity or campaign you'd like to support, and click the 'Donate Now' button. You'll be guided through a secure payment process where you can choose your donation amount and payment method."
  },
  {
    category: "Donations",
    question: "What payment methods are accepted?",
    answer: "We accept various payment methods including credit/debit cards, bank transfers, and digital wallets. All transactions are processed securely through our payment partners."
  },
  {
    category: "Donations",
    question: "Can I set up recurring donations?",
    answer: "Yes! When making a donation, you can choose to make it recurring. You can set the frequency (monthly, quarterly, or annually) and manage or cancel recurring donations from your Donation History page."
  },
  {
    category: "Donations",
    question: "How do I get a receipt for my donation?",
    answer: "Receipts are automatically generated for completed donations. You can download them from your 'My Donations' page by clicking on the donation and selecting 'Download Receipt'."
  },
  {
    category: "Donations",
    question: "Can I donate anonymously?",
    answer: "Yes, you can choose to make your donation anonymous during the donation process. Your name will not be displayed publicly, though the charity will still receive your contact information for receipt purposes."
  },

  // Accounts Category
  {
    category: "Accounts",
    question: "How do I create an account?",
    answer: "Click the 'Register' button on the homepage, select 'Donor', and fill in your details. You'll receive a verification email to activate your account."
  },
  {
    category: "Accounts",
    question: "I forgot my password. How do I reset it?",
    answer: "Click 'Forgot Password' on the login page, enter your email address, and you'll receive a password reset link. Follow the instructions in the email to create a new password."
  },
  {
    category: "Accounts",
    question: "How do I update my profile information?",
    answer: "Go to your profile dropdown (top-right corner) and select 'Account Settings'. From there, you can update your personal information, profile picture, and preferences."
  },
  {
    category: "Accounts",
    question: "Can I change my email address?",
    answer: "For security reasons, email addresses cannot be changed directly. Please contact our support team if you need to update your email address."
  },
  {
    category: "Accounts",
    question: "How do I delete my account?",
    answer: "Go to Account Settings > Danger Zone. Please note that deleting your account is permanent and will remove all your donation history and data."
  },

  // Security Category
  {
    category: "Security",
    question: "Is my payment information secure?",
    answer: "Yes, all payment information is encrypted and processed through secure, PCI-compliant payment gateways. We never store your complete credit card information on our servers."
  },
  {
    category: "Security",
    question: "How do I enable two-factor authentication?",
    answer: "Two-factor authentication (2FA) is coming soon! Once available, you'll be able to enable it from Account Settings > Security."
  },
  {
    category: "Security",
    question: "What should I do if I suspect unauthorized access?",
    answer: "Immediately change your password and contact our support team. You can also review your active sessions in Account Settings > Security."
  },
  {
    category: "Security",
    question: "How often should I change my password?",
    answer: "We recommend changing your password every 3-6 months. Always use a strong, unique password that combines letters, numbers, and special characters."
  },

  // Charities & Campaigns
  {
    category: "Charities",
    question: "How are charities verified?",
    answer: "All charities undergo a thorough verification process including document verification, background checks, and compliance reviews before being approved on our platform."
  },
  {
    category: "Charities",
    question: "Can I follow my favorite charities?",
    answer: "Yes! Click the 'Follow' button on any charity's profile page to receive updates about their campaigns and activities."
  },
  {
    category: "Charities",
    question: "How can I see the impact of my donations?",
    answer: "Visit your 'My Profile' page to see your impact overview, including total donated, campaigns supported, and charities helped. You can also view detailed breakdowns in 'My Donations'."
  },
  {
    category: "Charities",
    question: "What happens if a campaign doesn't reach its goal?",
    answer: "Donations are still transferred to the charity to support their cause, even if the campaign goal isn't fully met. The charity will use the funds for the stated purpose."
  },

  // General
  {
    category: "General",
    question: "How do I contact support?",
    answer: "You can contact our support team by clicking the 'Contact Support' button below, or by emailing support@charityhub.com. We typically respond within 24 hours."
  },
  {
    category: "General",
    question: "Is there a mobile app?",
    answer: "Currently, CharityHub is available as a responsive web application that works on all devices. A dedicated mobile app is in development."
  },
  {
    category: "General",
    question: "Can I volunteer with charities through this platform?",
    answer: "While our platform primarily focuses on donations, many charities post volunteer opportunities in their updates. Check individual charity profiles for volunteer information."
  }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(faqData.map(item => item.category)));

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Donations": "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900",
      "Accounts": "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900",
      "Security": "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900",
      "Charities": "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900",
      "General": "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
    };
    return colors[category] || colors["General"];
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Find answers to common questions and get the help you need
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        {/* Category Filters */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="rounded-full"
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full ${selectedCategory === category ? '' : getCategoryColor(category)}`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              {filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'} found
              {selectedCategory && ` in ${selectedCategory}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No questions found matching your search.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-start gap-3 pr-4">
                        <Badge variant="outline" className={`${getCategoryColor(faq.category)} mt-1 flex-shrink-0`}>
                          {faq.category}
                        </Badge>
                        <span className="font-medium">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pl-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* Contact Support Section */}
        <Card className="bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle>Still Need Help?</CardTitle>
            <CardDescription>Our support team is here to assist you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email Support</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Get help via email. We typically respond within 24 hours.
                      </p>
                      <Button variant="outline" size="sm">
                        support@charityhub.com
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Live Chat</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Chat with our support team in real-time.
                      </p>
                      <Button size="sm">
                        Start Chat
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
