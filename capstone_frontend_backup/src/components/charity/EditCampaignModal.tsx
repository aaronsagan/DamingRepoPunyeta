import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { campaignService } from "@/services/campaigns";
import { buildApiUrl, getAuthToken } from "@/lib/api";
import { Wallet, MapPin, Users, X } from "lucide-react";
import LocationSelector, { LocationData } from "@/components/LocationSelector";
import { BENEFICIARY_CATEGORIES, getBeneficiaryLabel } from "@/constants/beneficiaryCategories";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

interface EditCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: any; // The campaign to edit
  onSuccess?: () => void;
}

export function EditCampaignModal({ open, onOpenChange, campaign, onSuccess }: EditCampaignModalProps) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    problem: "",
    solution: "",
    outcome: "",
    beneficiary_category: [] as string[],
    targetAmount: "",
    donationType: "one_time" as "one_time" | "recurring",
    campaignType: "other" as "education" | "feeding_program" | "medical" | "disaster_relief" | "environment" | "animal_welfare" | "other",
    status: "draft" as "draft" | "published" | "closed" | "archived",
    startDate: "",
    endDate: "",
    street_address: "",
    barangay: "",
    city: "",
    province: "",
    region: "",
    full_address: "",
    image: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [availableChannels, setAvailableChannels] = useState<any[]>([]);
  const [selectedChannelIds, setSelectedChannelIds] = useState<number[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [beneficiaryPopoverOpen, setBeneficiaryPopoverOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Load campaign data when modal opens
  useEffect(() => {
    if (open && campaign) {
      loadCampaignData();
      fetchChannels();
      fetchCampaignChannels();
    }
  }, [open, campaign]);

  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

  const loadCampaignData = async () => {
    try {
      // Fetch full campaign details including all fields
      const fullCampaign = await campaignService.getCampaign(campaign.id);
      
      setForm({
        title: fullCampaign.title || "",
        description: fullCampaign.description || "",
        problem: fullCampaign.problem || "",
        solution: fullCampaign.solution || "",
        outcome: fullCampaign.expected_outcome || fullCampaign.outcome || "",
        beneficiary_category: Array.isArray(fullCampaign.beneficiary_category) 
          ? fullCampaign.beneficiary_category 
          : [],
        targetAmount: fullCampaign.target_amount?.toString() || "",
        donationType: fullCampaign.donation_type || "one_time",
        campaignType: fullCampaign.campaign_type || "other",
        status: fullCampaign.status || "draft",
        startDate: formatDateForInput(fullCampaign.start_date || ""),
        endDate: formatDateForInput(fullCampaign.end_date || fullCampaign.deadline_at || ""),
        street_address: fullCampaign.street_address || "",
        barangay: fullCampaign.barangay || "",
        city: fullCampaign.city || "",
        province: fullCampaign.province || "",
        region: fullCampaign.region || "",
        full_address: fullCampaign.full_address || "",
        image: null,
      });
    } catch (error) {
      console.error("Error loading campaign data:", error);
    }
  };

  const fetchChannels = async () => {
    try {
      setLoadingChannels(true);
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(buildApiUrl("/charity/donation-channels"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableChannels(data || []);
      }
    } catch (error) {
      console.error("Error fetching donation channels:", error);
    } finally {
      setLoadingChannels(false);
    }
  };

  const fetchCampaignChannels = async () => {
    try {
      const response = await fetch(buildApiUrl(`/campaigns/${campaign.id}/donation-channels`));
      if (response.ok) {
        const channels = await response.json();
        setSelectedChannelIds(channels.map((ch: any) => ch.id));
      }
    } catch (error) {
      console.error("Error fetching campaign channels:", error);
    }
  };

  const toggleChannel = (channelId: number) => {
    setSelectedChannelIds((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleLocationChange = (locationData: LocationData) => {
    setForm(prev => ({
      ...prev,
      region: locationData.region || "",
      province: locationData.province || "",
      city: locationData.city || "",
      barangay: locationData.barangay || "",
      full_address: locationData.fullAddress || "",
    }));
    if (errors.region || errors.province || errors.city || errors.barangay) {
      setErrors(prev => ({
        ...prev,
        region: "",
        province: "",
        city: "",
        barangay: ""
      }));
    }
  };

  const handleBeneficiaryCategoryToggle = (category: string) => {
    setForm((prev) => ({
      ...prev,
      beneficiary_category: prev.beneficiary_category.includes(category)
        ? prev.beneficiary_category.filter((c) => c !== category)
        : [...prev.beneficiary_category, category],
    }));
    if (errors.beneficiary_category) {
      setErrors((prev) => ({ ...prev, beneficiary_category: "" }));
    }
  };

  const removeBeneficiaryCategory = (category: string) => {
    setForm((prev) => ({
      ...prev,
      beneficiary_category: prev.beneficiary_category.filter((c) => c !== category),
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "About this campaign is required";
    if (!form.problem || form.problem.trim().length < 50) e.problem = "Problem must be at least 50 characters";
    if (!form.solution || form.solution.trim().length < 50) e.solution = "Solution must be at least 50 characters";
    if (form.outcome && (form.outcome.trim().length < 30 || form.outcome.trim().length > 300)) e.outcome = "Expected Outcome must be 30–300 characters";
    if (!form.targetAmount || Number(form.targetAmount) <= 0) e.targetAmount = "Target amount must be greater than 0";
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) e.endDate = "End date must be after start date";
    
    if (form.beneficiary_category.length === 0) e.beneficiary_category = "Please select at least one beneficiary category";
    
    if (!form.region || !form.region.trim()) e.region = "Region is required";
    if (!form.province || !form.province.trim()) e.province = "Province is required";
    if (!form.city || !form.city.trim()) e.city = "City is required";
    if (!form.barangay || !form.barangay.trim()) e.barangay = "Barangay is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast({ title: "Validation Error", description: "Please fill in all required fields correctly.", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);

      const campaignData: any = {
        title: form.title,
        description: form.description,
        problem: form.problem,
        solution: form.solution,
        outcome: form.outcome,
        beneficiary_category: form.beneficiary_category,
        target_amount: parseFloat(form.targetAmount),
        donation_type: form.donationType,
        campaign_type: form.campaignType,
        status: form.status,
        start_date: form.startDate || undefined,
        end_date: form.endDate || undefined,
        deadline_at: form.endDate || undefined,
        region: form.region,
        province: form.province,
        city: form.city,
        barangay: form.barangay,
        cover_image: form.image || undefined
      };

      console.log('Updating campaign with data:', campaignData);
      
      await campaignService.updateCampaign(campaign.id, campaignData);

      // Update donation channels if changed
      if (selectedChannelIds.length > 0) {
        const token = getAuthToken();
        if (token) {
          try {
            await fetch(buildApiUrl(`/campaigns/${campaign.id}/donation-channels/attach`), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ channel_ids: selectedChannelIds }),
            });
          } catch (attachError) {
            console.error("Error updating channels:", attachError);
          }
        }
      }

      toast({ title: "Success", description: "Campaign updated successfully" });
      onOpenChange(false);
      onSuccess && onSuccess();
    } catch (err: any) {
      console.error("Campaign update error:", err);
      toast({ 
        title: "Error", 
        description: err.response?.data?.message || "Failed to update campaign", 
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
          <DialogDescription>Update your campaign details - Step {step} of 4</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">About This Campaign *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaignType">Campaign Type *</Label>
                  <Select value={form.campaignType} onValueChange={(value: any) => setForm({ ...form, campaignType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="feeding_program">Feeding Program</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
                      <SelectItem value="disaster_relief">Disaster Relief</SelectItem>
                      <SelectItem value="environment">Environment</SelectItem>
                      <SelectItem value="animal_welfare">Animal Welfare</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={form.status} onValueChange={(value: any) => setForm({ ...form, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="donationType">Donation Type *</Label>
                  <Select value={form.donationType} onValueChange={(value: any) => setForm({ ...form, donationType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">One-Time</SelectItem>
                      <SelectItem value="recurring">Recurring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Amount (₱) *</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    value={form.targetAmount}
                    onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                    className={errors.targetAmount ? "border-red-500" : ""}
                  />
                  {errors.targetAmount && <p className="text-sm text-red-500">{errors.targetAmount}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date / Deadline</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className={errors.endDate ? "border-red-500" : ""}
                  />
                  {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Campaign Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                />
              </div>
            </div>
          )}

          {/* Step 2: Problem, Solution, Outcome */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Campaign Details</h3>

              <div className="space-y-2">
                <Label htmlFor="problem">The Problem (min 50 characters) *</Label>
                <Textarea
                  id="problem"
                  value={form.problem}
                  onChange={(e) => setForm({ ...form, problem: e.target.value })}
                  rows={4}
                  placeholder="Describe the problem or need this campaign addresses..."
                  className={errors.problem ? "border-red-500" : ""}
                />
                <p className="text-xs text-muted-foreground">{form.problem.length} / 50 minimum</p>
                {errors.problem && <p className="text-sm text-red-500">{errors.problem}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="solution">The Solution (min 50 characters) *</Label>
                <Textarea
                  id="solution"
                  value={form.solution}
                  onChange={(e) => setForm({ ...form, solution: e.target.value })}
                  rows={4}
                  placeholder="Describe how this campaign will solve the problem..."
                  className={errors.solution ? "border-red-500" : ""}
                />
                <p className="text-xs text-muted-foreground">{form.solution.length} / 50 minimum</p>
                {errors.solution && <p className="text-sm text-red-500">{errors.solution}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="outcome">Expected Outcome (30-300 characters)</Label>
                <Textarea
                  id="outcome"
                  value={form.outcome}
                  onChange={(e) => setForm({ ...form, outcome: e.target.value })}
                  rows={3}
                  placeholder="What do you hope to achieve with this campaign?..."
                  className={errors.outcome ? "border-red-500" : ""}
                />
                <p className="text-xs text-muted-foreground">{form.outcome.length} / 30-300 characters</p>
                {errors.outcome && <p className="text-sm text-red-500">{errors.outcome}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Location & Beneficiaries */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Beneficiaries
              </h3>

              <div className="space-y-2">
                <Label>Campaign Location *</Label>
                <LocationSelector
                  value={{
                    region: form.region,
                    province: form.province,
                    city: form.city,
                    barangay: form.barangay,
                    fullAddress: form.full_address,
                  }}
                  onChange={handleLocationChange}
                  error={errors.region || errors.province || errors.city || errors.barangay}
                />
                {(errors.region || errors.province || errors.city || errors.barangay) && (
                  <p className="text-sm text-red-500">
                    {errors.region || errors.province || errors.city || errors.barangay}
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Beneficiary Categories *
                </Label>
                <Popover open={beneficiaryPopoverOpen} onOpenChange={setBeneficiaryPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {form.beneficiary_category.length > 0 ? `${form.beneficiary_category.length} selected` : "Select beneficiary categories"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search categories..." />
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {BENEFICIARY_CATEGORIES.map((category) => (
                          <CommandItem
                            key={category.value}
                            onSelect={() => handleBeneficiaryCategoryToggle(category.value)}
                          >
                            <Checkbox
                              checked={form.beneficiary_category.includes(category.value)}
                              className="mr-2"
                            />
                            <span>{getBeneficiaryLabel(category.value)}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {form.beneficiary_category.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.beneficiary_category.map((category) => (
                      <Badge key={category} variant="secondary" className="gap-1">
                        {getBeneficiaryLabel(category)}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeBeneficiaryCategory(category)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
                {errors.beneficiary_category && (
                  <p className="text-sm text-red-500">{errors.beneficiary_category}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Donation Channels */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Donation Channels
              </h3>
              <p className="text-sm text-muted-foreground">
                Select which payment methods donors can use for this campaign
              </p>

              {loadingChannels ? (
                <div className="text-center py-4">Loading channels...</div>
              ) : availableChannels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No donation channels available.</p>
                  <p className="text-sm mt-2">Add donation channels in your dashboard first.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableChannels.map((channel) => (
                    <div
                      key={channel.id}
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedChannelIds.includes(channel.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => toggleChannel(channel.id)}
                    >
                      <Checkbox
                        checked={selectedChannelIds.includes(channel.id)}
                        onCheckedChange={() => toggleChannel(channel.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{channel.label}</p>
                        <p className="text-sm text-muted-foreground capitalize">{channel.type}</p>
                        <p className="text-xs text-muted-foreground mt-1">{channel.account_number}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between gap-2">
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={submitting}>
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)}>Next</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Updating..." : "Update Campaign"}
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
