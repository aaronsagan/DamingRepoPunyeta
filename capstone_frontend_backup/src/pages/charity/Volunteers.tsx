import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users, Phone, Mail, MapPin, Calendar, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { charityService } from "@/services/charity";
import { useAuth } from "@/context/AuthContext";

interface Volunteer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  skills?: string;
  experience?: string;
  status: string;
  availability?: any;
  joined_at: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  campaign?: {
    id: number;
    title: string;
  };
}

interface Campaign {
  id: number;
  title: string;
}

export default function CharityVolunteers() {
  const { user } = useAuth();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "field_worker",
    skills: "",
    experience: "",
    campaign_id: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  useEffect(() => {
    if (user?.charity?.id) {
      fetchVolunteers();
      fetchCampaigns();
    }
  }, [user, statusFilter, roleFilter, searchTerm]);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (roleFilter !== "all") params.role = roleFilter;
      if (searchTerm) params.search = searchTerm;

      if (!user?.charity?.id) return;
      const response = await charityService.getVolunteers(user.charity.id, params);
      const data = response?.data ?? response; // service returns raw data
      setVolunteers(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      toast.error("Failed to fetch volunteers");
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      if (!user?.charity?.id) return;
      const res = await charityService.getCharityCampaigns(user.charity.id);
      const data = res?.data ?? res;
      setCampaigns(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (!user?.charity?.id) return;
      await charityService.createVolunteer(user.charity.id, formData);
      toast.success("Volunteer added successfully");
      setIsCreateOpen(false);
      resetForm();
      fetchVolunteers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add volunteer");
    }
  };

  const handleEdit = async () => {
    if (!selectedVolunteer) return;

    try {
      if (!user?.charity?.id) return;
      await charityService.updateVolunteer(user.charity.id, selectedVolunteer.id, formData);
      toast.success("Volunteer updated successfully");
      setIsEditOpen(false);
      resetForm();
      fetchVolunteers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update volunteer");
    }
  };

  const handleDelete = async (volunteer: Volunteer) => {
    if (!confirm(`Are you sure you want to remove ${volunteer.name}?`)) return;

    try {
      if (!user?.charity?.id) return;
      await charityService.deleteVolunteer(user.charity.id, volunteer.id);
      toast.success("Volunteer removed successfully");
      fetchVolunteers();
    } catch (error) {
      toast.error("Failed to remove volunteer");
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditDialog = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setFormData({
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer.phone || "",
      address: volunteer.address || "",
      role: volunteer.role,
      skills: volunteer.skills || "",
      experience: volunteer.experience || "",
      campaign_id: volunteer.campaign?.id?.toString() || "",
      emergency_contact_name: volunteer.emergency_contact_name || "",
      emergency_contact_phone: volunteer.emergency_contact_phone || "",
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      role: "field_worker",
      skills: "",
      experience: "",
      campaign_id: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
    });
    setSelectedVolunteer(null);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      on_leave: "bg-yellow-100 text-yellow-800",
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const formatRole = (role: string) => {
    return role.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Volunteer Management</h1>
          <p className="text-muted-foreground">Manage your organization's volunteers</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Volunteer
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search volunteers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="field_worker">Field Worker</SelectItem>
                <SelectItem value="coordinator">Coordinator</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
                <SelectItem value="medical_staff">Medical Staff</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="fundraiser">Fundraiser</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="photographer">Photographer</SelectItem>
                <SelectItem value="translator">Translator</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Volunteers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(volunteers || []).map((volunteer) => (
          <Card key={volunteer.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{volunteer.name}</CardTitle>
                  <CardDescription>{formatRole(volunteer.role)}</CardDescription>
                </div>
                {getStatusBadge(volunteer.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{volunteer.email}</span>
                </div>
                {volunteer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{volunteer.phone}</span>
                  </div>
                )}
                {volunteer.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{volunteer.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(volunteer.joined_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              {volunteer.campaign && (
                <div className="text-sm">
                  <span className="font-medium">Campaign:</span> {volunteer.campaign.title}
                </div>
              )}

              {volunteer.skills && (
                <div className="text-sm">
                  <span className="font-medium">Skills:</span>
                  <p className="text-muted-foreground mt-1">{volunteer.skills}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(volunteer)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(volunteer)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(volunteers?.length ?? 0) === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No volunteers found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add your first volunteer to get started with team management.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Volunteer Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Volunteer</DialogTitle>
            <DialogDescription>
              Register a new volunteer for your organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role *</label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="field_worker">Field Worker</SelectItem>
                    <SelectItem value="coordinator">Coordinator</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="medical_staff">Medical Staff</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="fundraiser">Fundraiser</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="photographer">Photographer</SelectItem>
                    <SelectItem value="translator">Translator</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Campaign (Optional)</label>
              <Select value={formData.campaign_id} onValueChange={(value) => setFormData({ ...formData, campaign_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign to campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific campaign</SelectItem>
                  {(campaigns || []).map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id.toString()}>
                      {campaign.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Skills</label>
              <Textarea
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="List relevant skills and expertise"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Experience</label>
              <Textarea
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="Previous volunteer or relevant experience"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Emergency Contact Name</label>
                <Input
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  placeholder="Emergency contact name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Emergency Contact Phone</label>
                <Input
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                  placeholder="Emergency contact phone"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>
                Add Volunteer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Volunteer Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Volunteer</DialogTitle>
            <DialogDescription>
              Update volunteer information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role *</label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="field_worker">Field Worker</SelectItem>
                    <SelectItem value="coordinator">Coordinator</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="medical_staff">Medical Staff</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="fundraiser">Fundraiser</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="photographer">Photographer</SelectItem>
                    <SelectItem value="translator">Translator</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Campaign (Optional)</label>
              <Select value={formData.campaign_id} onValueChange={(value) => setFormData({ ...formData, campaign_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign to campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific campaign</SelectItem>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id.toString()}>
                      {campaign.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Skills</label>
              <Textarea
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="List relevant skills and expertise"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Experience</label>
              <Textarea
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="Previous volunteer or relevant experience"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Emergency Contact Name</label>
                <Input
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  placeholder="Emergency contact name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Emergency Contact Phone</label>
                <Input
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                  placeholder="Emergency contact phone"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>
                Update Volunteer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
