import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import LocationSelector, { LocationData } from "@/components/LocationSelector";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { DonorTermsDialog } from "@/components/legal/DonorTermsDialog";
import { DonorPrivacyDialog } from "@/components/legal/DonorPrivacyDialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { formatNameWithMiddleInitial } from "@/lib/nameUtils";

const STEPS = [
  { id: 1, name: "Personal Information", description: "Tell us about yourself" },
  { id: 2, name: "Location & Address", description: "Where are you based?" },
  { id: 3, name: "Identity Verification", description: "Verify your identity" },
  { id: 4, name: "Security & Submit", description: "Secure your account" },
];

const CAUSES = [
  "Education",
  "Health",
  "Environment",
  "Animal Welfare",
  "Poverty Relief",
  "Disaster Response",
];

export function DonorRegistrationWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    // Step 1
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "" as "Male" | "Female" | "Prefer not to say" | "",
    profile_image: null as File | null,
    // Step 2 - Address
    street_address: "",
    barangay: "",
    city: "",
    province: "",
    region: "",
    full_address: "",
    // Step 3 - Preferences
    cause_preferences: [] as string[],
    pref_email: true,
    pref_sms: false,
    pref_updates: true,
    pref_urgent: true,
    pref_reports: false,
    // Step 4 - Verification
    id_type: "",
    id_number: "",
    id_document: null as File | null,
    selfie_with_id: null as File | null,
    // Step 5 - Security
    password: "",
    password_confirmation: "",
    accept_terms: false,
  });

  useEffect(() => {
    // Load any local draft
    try {
      const draft = localStorage.getItem("donor_reg_draft");
      if (draft) {
        const parsed = JSON.parse(draft);
        setForm((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateStep = (step: number): boolean => {
    const e: Record<string, string> = {};

    if (step === 1) {
      if (!form.first_name.trim()) e.first_name = "Required";
      if (!form.middle_name.trim()) e.middle_name = "Required";
      if (!form.last_name.trim()) e.last_name = "Required";
      if (!form.email.trim()) e.email = "Required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
      if (!form.date_of_birth) e.date_of_birth = "Required";
    }

    if (step === 2) {
      if (!form.street_address) e.street_address = "Required";
      if (!form.region) e.region = "Required";
      if (!form.province) e.province = "Required";
      if (!form.city) e.city = "Required";
      if (!form.barangay) e.barangay = "Required";
    }

    if (step === 3) {
      if (!form.id_type) e.id_type = "Required";
      if (!form.id_document) e.id_document = "Government ID is required";
    }

    if (step === 4) {
      if (!form.password) e.password = "Required";
      else if (form.password.length < 8) e.password = "Min 8 characters";
      if (!form.password_confirmation) e.password_confirmation = "Required";
      else if (form.password !== form.password_confirmation) e.password_confirmation = "Passwords do not match";
      if (!form.accept_terms) e.accept_terms = "You must accept the terms";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = async () => {
    if (!validateStep(currentStep)) return;

    // Save draft to backend (Step 1 mandatory) and localStorage
    if (currentStep === 1) {
      setSaving(true);
      try {
        await authService.saveDonorDraft({
          first_name: form.first_name,
          middle_name: form.middle_name,
          last_name: form.last_name,
          email: form.email,
          phone: form.phone,
          date_of_birth: form.date_of_birth,
          gender: form.gender,
        });
      } catch (err: any) {
        // fallback to local only
      } finally {
        setSaving(false);
        localStorage.setItem("donor_reg_draft", JSON.stringify(form));
      }
    }

    setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const progress = useMemo(() => (currentStep / STEPS.length) * 100, [currentStep]);

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // Upload verification docs first if present
      if (form.id_document || form.selfie_with_id) {
        const fd = new FormData();
        if (form.email) fd.append("email", form.email);
        if (form.id_document) fd.append("id_document", form.id_document);
        if (form.selfie_with_id) fd.append("selfie_with_id", form.selfie_with_id);
        if (form.id_type) fd.append("id_type", form.id_type);
        if (form.id_number) fd.append("id_number", form.id_number);
        await authService.uploadDonorVerification(fd);
      }

      // Final submission
      const submit = new FormData();
      submit.append("first_name", form.first_name);
      if (form.middle_name) submit.append("middle_name", form.middle_name);
      submit.append("last_name", form.last_name);
      submit.append("email", form.email);
      if (form.phone) submit.append("phone", form.phone);
      if (form.date_of_birth) submit.append("date_of_birth", form.date_of_birth);
      if (form.gender) submit.append("gender", form.gender);
      if (form.profile_image) submit.append("profile_image", form.profile_image);
      submit.append("street_address", form.street_address);
      submit.append("barangay", form.barangay);
      submit.append("city", form.city);
      submit.append("province", form.province);
      submit.append("region", form.region);
      if (form.full_address) submit.append("full_address", form.full_address);
      form.cause_preferences.forEach((c) => submit.append("cause_preferences[]", c));
      submit.append("pref_email", String(form.pref_email));
      submit.append("pref_sms", String(form.pref_sms));
      submit.append("pref_updates", String(form.pref_updates));
      submit.append("pref_urgent", String(form.pref_urgent));
      submit.append("pref_reports", String(form.pref_reports));
      submit.append("password", form.password);
      submit.append("password_confirmation", form.password_confirmation);
      submit.append("accept_terms", String(form.accept_terms));

      await authService.submitDonorRegistration(submit);

      toast.success("Registration submitted!", {
        description: "Your account is pending verification.",
      });
      localStorage.removeItem("donor_reg_draft");
      navigate("/auth/login");
    } catch (error: any) {
      if (error?.response?.data?.errors) {
        const apiErrors = error.response.data.errors as Record<string, string[]>;
        const flat: Record<string, string> = {};
        Object.entries(apiErrors).forEach(([k, v]) => (flat[k] = v?.[0] ?? "Invalid"));
        setErrors(flat);
        toast.error("Submission failed", { description: Object.values(flat)[0] });
      } else if (error instanceof Error) {
        toast.error("Submission failed", { description: error.message });
      } else {
        toast.error("Submission failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/auth/register" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to registration options
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create donor account</h1>
          <p className="text-muted-foreground">Complete the steps below to set up your donor profile</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                      currentStep > step.id && "bg-primary text-primary-foreground",
                      currentStep === step.id && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      currentStep < step.id && "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                  </div>
                  <div className="mt-2 text-center hidden md:block">
                    <p className="text-sm font-medium">{step.name}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={cn("h-1 flex-1 mx-2 transition-colors", currentStep > step.id ? "bg-primary" : "bg-muted")} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content */}
        <div className="auth-card">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Personal Information</h2>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name <span className="text-destructive">*</span></Label>
                  <Input id="first_name" value={form.first_name} onChange={(e) => handleChange("first_name", e.target.value)} className={cn(errors.first_name && "border-destructive")} />
                  {errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middle_name">Middle Name <span className="text-destructive">*</span></Label>
                  <Input id="middle_name" value={form.middle_name} onChange={(e) => handleChange("middle_name", e.target.value)} className={cn(errors.middle_name && "border-destructive")} />
                  {errors.middle_name && <p className="text-sm text-destructive">{errors.middle_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name <span className="text-destructive">*</span></Label>
                  <Input id="last_name" value={form.last_name} onChange={(e) => handleChange("last_name", e.target.value)} className={cn(errors.last_name && "border-destructive")} />
                  {errors.last_name && <p className="text-sm text-destructive">{errors.last_name}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} className={cn(errors.email && "border-destructive")} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth <span className="text-destructive">*</span></Label>
                  <Input id="date_of_birth" type="date" value={form.date_of_birth} onChange={(e) => handleChange("date_of_birth", e.target.value)} className={cn(errors.date_of_birth && "border-destructive")} />
                  {errors.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select id="gender" value={form.gender} onChange={(e) => handleChange("gender", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile_image">Profile Picture</Label>
                  <Input id="profile_image" type="file" accept="image/*" onChange={(e) => handleChange("profile_image", e.target.files?.[0] || null)} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-muted-foreground">We will save your info as a draft when you continue.</div>
                <Button onClick={nextStep} className="bg-primary hover:bg-primary/90">
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ArrowRight className="h-4 w-4 mr-2" />} Next
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Location & Address</h2>
              
              {/* LocationSelector Component (includes street address) */}
              <LocationSelector
                value={{
                  street_address: form.street_address,
                  region: form.region,
                  province: form.province,
                  city: form.city,
                  barangay: form.barangay
                }}
                onChange={(location: LocationData) => {
                  setForm(prev => ({
                    ...prev,
                    street_address: location.street_address,
                    region: location.region,
                    province: location.province,
                    city: location.city,
                    barangay: location.barangay
                  }));
                }}
                required={true}
                errors={{
                  street_address: errors.street_address,
                  region: errors.region,
                  province: errors.province,
                  city: errors.city,
                  barangay: errors.barangay
                }}
              />

              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" onClick={prevStep}>Back</Button>
                <Button onClick={nextStep} className="bg-primary hover:bg-primary/90">Next</Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Identity Verification</h2>
              <p className="text-muted-foreground">Upload a valid government ID to verify your identity. This helps ensure the security and trust of our platform.</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id_type">ID Type <span className="text-destructive">*</span></Label>
                  <select id="id_type" value={form.id_type} onChange={(e) => handleChange("id_type", e.target.value)} className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm", errors.id_type && "border-destructive")}> 
                    <option value="">Select</option>
                    <option value="Passport">Passport</option>
                    <option value="Driver's License">Driver's License</option>
                    <option value="National ID">National ID (PhilSys)</option>
                    <option value="SSS/GSIS">SSS/GSIS ID</option>
                    <option value="Voter's ID">Voter's ID</option>
                    <option value="Other">Other Government ID</option>
                  </select>
                  {errors.id_type && <p className="text-sm text-destructive">{errors.id_type}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_number">ID Number (optional)</Label>
                  <Input id="id_number" value={form.id_number} onChange={(e) => handleChange("id_number", e.target.value)} placeholder="e.g., 1234-5678-9012" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_document">Upload Government ID <span className="text-destructive">*</span></Label>
                  <Input id="id_document" type="file" accept="image/*,application/pdf" onChange={(e) => handleChange("id_document", e.target.files?.[0] || null)} className={cn(errors.id_document && "border-destructive")} />
                  {errors.id_document && <p className="text-sm text-destructive">{errors.id_document}</p>}
                  <p className="text-xs text-muted-foreground">Accepted formats: JPG, PNG, PDF (max 5MB)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selfie_with_id">Upload Selfie with ID (optional)</Label>
                  <Input id="selfie_with_id" type="file" accept="image/*" onChange={(e) => handleChange("selfie_with_id", e.target.files?.[0] || null)} />
                  <p className="text-xs text-muted-foreground">Hold your ID next to your face for verification</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" onClick={prevStep}>Back</Button>
                <Button onClick={nextStep} className="bg-primary hover:bg-primary/90">Next</Button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Account Security & Confirmation</h2>
              
              {/* Password Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Create Your Password</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => handleChange("password", e.target.value)} className={cn(errors.password && "border-destructive", "pr-10")} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Confirm Password <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Input id="password_confirmation" type={showConfirmPassword ? "text" : "password"} value={form.password_confirmation} onChange={(e) => handleChange("password_confirmation", e.target.value)} className={cn(errors.password_confirmation && "border-destructive", "pr-10")} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password_confirmation && <p className="text-sm text-destructive">{errors.password_confirmation}</p>}
                  </div>
                  <div className="md:col-span-2"><PasswordStrengthMeter password={form.password} /></div>
                </div>
              </div>

              {/* Review Information */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Review Your Information</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{formatNameWithMiddleInitial(form.first_name, form.middle_name, form.last_name)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{form.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{form.phone || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Gender / DOB</p>
                    <p className="font-medium">{form.gender || "—"} {form.date_of_birth ? `• ${form.date_of_birth}` : ""}</p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-muted-foreground">Address</p>
                    <p className="font-medium">{form.full_address || `${form.street_address}, Brgy. ${form.barangay}, ${form.city}, ${form.province}, ${form.region}, Philippines`}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">ID Verification</p>
                    <p className="font-medium">{form.id_type ? `${form.id_type}${form.id_number ? ` • ${form.id_number}` : ""}` : "—"}</p>
                  </div>
                </div>
              </div>

              {/* Terms and Privacy Policy */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Terms & Conditions</h3>
                <div className="flex items-start space-x-2">
                  <Checkbox id="accept_terms" checked={form.accept_terms} onCheckedChange={(v) => handleChange("accept_terms", v === true)} className={cn(errors.accept_terms && "border-destructive")} />
                  <div className="space-y-1">
                    <Label htmlFor="accept_terms" className="font-normal cursor-pointer">
                      I agree to the {" "}
                      <button type="button" onClick={() => setShowTermsDialog(true)} className="text-primary hover:underline">Terms of Service</button>{" "}
                      and {" "}
                      <button type="button" onClick={() => setShowPrivacyDialog(true)} className="text-primary hover:underline">Privacy Policy</button>
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    {errors.accept_terms && <p className="text-sm text-destructive">{errors.accept_terms}</p>}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" onClick={prevStep}>Back</Button>
                <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>) : "Submit Registration"}
                </Button>
              </div>

              {/* Dialogs */}
              <DonorTermsDialog open={showTermsDialog} onOpenChange={setShowTermsDialog} />
              <DonorPrivacyDialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
