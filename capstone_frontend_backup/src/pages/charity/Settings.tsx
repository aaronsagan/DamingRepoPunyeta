import { useState } from "react";
import { Settings as SettingsIcon, User, Lock, Bell, Link2, Eye, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Import setting sections
import AccountSettingsSection from "./settings-sections/AccountSettingsSection";
import SecuritySection from "./settings-sections/SecuritySection";
import NotificationSection from "./settings-sections/NotificationSection";
import IntegrationSection from "./settings-sections/IntegrationSection";
import PrivacySection from "./settings-sections/PrivacySection";
import DangerZoneSection from "./settings-sections/DangerZoneSection";

type SettingsSection = "account" | "security" | "notifications" | "integrations" | "privacy" | "danger";

export default function Settings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("account");

  const sections = [
    { id: "account" as const, label: "Account Settings", icon: User },
    { id: "security" as const, label: "Security & Access", icon: Lock },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "integrations" as const, label: "Integrations", icon: Link2 },
    { id: "privacy" as const, label: "Privacy & Data", icon: Eye },
    { id: "danger" as const, label: "Danger Zone", icon: AlertTriangle },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "account":
        return <AccountSettingsSection />;
      case "security":
        return <SecuritySection />;
      case "notifications":
        return <NotificationSection />;
      case "integrations":
        return <IntegrationSection />;
      case "privacy":
        return <PrivacySection />;
      case "danger":
        return <DangerZoneSection />;
      default:
        return <AccountSettingsSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your charity account preferences</p>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <Card className="lg:col-span-1 h-fit sticky top-20">
            <nav className="p-2 space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                const isDanger = section.id === "danger";

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? isDanger
                          ? "bg-destructive/10 text-destructive"
                          : "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </Card>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
