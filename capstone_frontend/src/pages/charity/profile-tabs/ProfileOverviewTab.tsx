import { Camera, Upload, Mail, Phone, MapPin, Globe, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileOverviewTabProps {
  profileData: any;
  setProfileData: (data: any) => void;
  markAsChanged: () => void;
}

const socialPlatforms = [
  { name: "Facebook", icon: Facebook, placeholder: "https://facebook.com/yourpage" },
  { name: "Twitter", icon: Twitter, placeholder: "https://twitter.com/yourhandle" },
  { name: "Instagram", icon: Instagram, placeholder: "https://instagram.com/yourprofile" },
  { name: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/company/yourcompany" },
];

export default function ProfileOverviewTab({ profileData, setProfileData, markAsChanged }: ProfileOverviewTabProps) {
  
  const handleChange = (field: string, value: any) => {
    setProfileData((prev: any) => ({ ...prev, [field]: value }));
    markAsChanged();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Logo must be less than 2MB");
        return;
      }
      setProfileData((prev: any) => ({
        ...prev,
        logo: file,
        logoPreview: URL.createObjectURL(file)
      }));
      markAsChanged();
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Banner must be less than 5MB");
        return;
      }
      setProfileData((prev: any) => ({
        ...prev,
        banner: file,
        bannerPreview: URL.createObjectURL(file)
      }));
      markAsChanged();
    }
  };

  const handleSocialLinkChange = (platform: string, url: string) => {
    setProfileData((prev: any) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform.toLowerCase()]: url
      }
    }));
    markAsChanged();
  };

  return (
    <div className="space-y-6">
      {/* Banner & Logo Section */}
      <Card>
        <CardHeader>
          <CardTitle>Banner & Logo</CardTitle>
          <CardDescription>Your organization's visual identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Banner */}
          <div className="space-y-3">
            <Label>Cover Banner</Label>
            <div className="relative h-48 rounded-lg overflow-hidden bg-muted border-2 border-dashed">
              {profileData.bannerPreview ? (
                <img 
                  src={profileData.bannerPreview} 
                  alt="Banner" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Upload a banner image</p>
                    <p className="text-xs">Recommended: 1200x400px, Max 5MB</p>
                  </div>
                </div>
              )}
              <input
                type="file"
                id="banner-upload"
                accept="image/*"
                className="hidden"
                onChange={handleBannerUpload}
              />
              <label htmlFor="banner-upload">
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-3 right-3 shadow-lg"
                  asChild
                >
                  <span className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Change Banner
                  </span>
                </Button>
              </label>
            </div>
          </div>

          {/* Logo */}
          <div className="space-y-3">
            <Label>Organization Logo</Label>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={profileData.logoPreview || undefined} />
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                    {profileData.name?.charAt(0) || 'O'}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <label htmlFor="logo-upload">
                  <div className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center cursor-pointer shadow-lg transition-colors">
                    <Camera className="h-5 w-5 text-primary-foreground" />
                  </div>
                </label>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Upload Logo</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  JPG, PNG or GIF. Max size 2MB. Recommended: 400x400px square
                </p>
                <label htmlFor="logo-upload">
                  <Button variant="outline" asChild>
                    <span className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Your organization's core details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name *</Label>
            <Input
              id="name"
              value={profileData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Your Organization Name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline / Mission Statement</Label>
            <Input
              id="tagline"
              value={profileData.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              placeholder="A short, inspiring tagline (e.g., 'Building a better tomorrow')"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground text-right">
              {profileData.tagline?.length || 0}/100 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short Description</Label>
            <Textarea
              id="description"
              value={profileData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief overview of your organization (shown on your profile card)"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {profileData.description?.length || 0}/500 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>How people can reach your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contact@organization.org"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={profileData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+63 912 345 6789"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Physical Address
            </Label>
            <Textarea
              id="address"
              value={profileData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Street Address, City, Province, Country"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Website URL
            </Label>
            <Input
              id="website"
              type="url"
              value={profileData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://yourorganization.org"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
          <CardDescription>Connect your social media profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {socialPlatforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <div key={platform.name} className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <Input
                    value={profileData.social_links?.[platform.name.toLowerCase()] || ''}
                    onChange={(e) => handleSocialLinkChange(platform.name, e.target.value)}
                    placeholder={platform.placeholder}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
