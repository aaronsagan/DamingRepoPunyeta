import { Heart, Eye, Lightbulb, History, Tag, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface AboutTabProps {
  profileData: any;
  setProfileData: (data: any) => void;
  markAsChanged: () => void;
}

const focusAreas = [
  "Education",
  "Health",
  "Environment",
  "Poverty Relief",
  "Animal Welfare",
  "Disaster Relief",
  "Children & Youth",
  "Elderly Care",
  "Community Development",
  "Arts & Culture",
  "Human Rights",
  "Food Security",
  "Clean Water",
  "Housing",
  "Mental Health",
  "Women's Empowerment"
];

export default function AboutTab({ profileData, setProfileData, markAsChanged }: AboutTabProps) {
  
  const handleChange = (field: string, value: any) => {
    setProfileData((prev: any) => ({ ...prev, [field]: value }));
    markAsChanged();
  };

  const toggleFocusArea = (area: string) => {
    const currentAreas = profileData.focus_areas || [];
    const newAreas = currentAreas.includes(area)
      ? currentAreas.filter((a: string) => a !== area)
      : [...currentAreas, area];
    
    handleChange('focus_areas', newAreas);
  };

  return (
    <div className="space-y-6">
      {/* Mission, Vision & Values */}
      <Card>
        <CardHeader>
          <CardTitle>Mission, Vision & Core Values</CardTitle>
          <CardDescription>Define your organization's purpose and guiding principles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mission" className="flex items-center gap-2 text-base">
              <Heart className="h-5 w-5 text-red-500" />
              Mission Statement
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              What is your organization's primary purpose? What do you aim to achieve?
            </p>
            <Textarea
              id="mission"
              value={profileData.mission}
              onChange={(e) => handleChange('mission', e.target.value)}
              placeholder="Our mission is to..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {profileData.mission?.length || 0}/1000 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vision" className="flex items-center gap-2 text-base">
              <Eye className="h-5 w-5 text-blue-500" />
              Vision Statement
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              What future do you envision? What long-term impact do you want to create?
            </p>
            <Textarea
              id="vision"
              value={profileData.vision}
              onChange={(e) => handleChange('vision', e.target.value)}
              placeholder="We envision a world where..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {profileData.vision?.length || 0}/1000 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="core_values" className="flex items-center gap-2 text-base">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Core Values
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              What principles guide your work? What values are most important to your organization?
            </p>
            <Textarea
              id="core_values"
              value={profileData.core_values}
              onChange={(e) => handleChange('core_values', e.target.value)}
              placeholder="Our core values include integrity, compassion, transparency..."
              rows={5}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {profileData.core_values?.length || 0}/1000 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* History & Background */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            History & Background
          </CardTitle>
          <CardDescription>Share your organization's story and journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground mb-2">
            Tell the story of how your organization started, key milestones you've achieved, and how you've grown over time.
          </p>
          <Textarea
            value={profileData.history}
            onChange={(e) => handleChange('history', e.target.value)}
            placeholder="Our organization was founded in [year] with the goal of... Over the years, we have..."
            rows={8}
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground text-right">
            {profileData.history?.length || 0}/2000 characters
          </p>
        </CardContent>
      </Card>

      {/* Focus Areas & Causes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Focus Areas & Causes
          </CardTitle>
          <CardDescription>
            Select the causes and areas your organization focuses on (helps donors find you)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {focusAreas.map((area) => {
              const isSelected = (profileData.focus_areas || []).includes(area);
              return (
                <Badge
                  key={area}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105"
                  onClick={() => toggleFocusArea(area)}
                >
                  {isSelected && <Check className="h-3 w-3 mr-1" />}
                  {area}
                </Badge>
              );
            })}
          </div>

          {(profileData.focus_areas || []).length > 0 && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm font-medium mb-2">Selected Focus Areas:</p>
              <p className="text-sm text-muted-foreground">
                {(profileData.focus_areas || []).join(", ")}
              </p>
            </div>
          )}

          {(profileData.focus_areas || []).length === 0 && (
            <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground text-center">
                Select at least one focus area to help donors discover your organization
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Impact & Achievements (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle>Impact & Achievements (Optional)</CardTitle>
          <CardDescription>
            Highlight key achievements, awards, or impact metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={profileData.achievements || ''}
            onChange={(e) => handleChange('achievements', e.target.value)}
            placeholder="• Served over 10,000 beneficiaries&#10;• Awarded 'Best NGO 2024' by...&#10;• Successfully completed 50+ projects&#10;• Partnered with 20+ organizations"
            rows={6}
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground text-right mt-2">
            {(profileData.achievements || '')?.length}/1000 characters
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
