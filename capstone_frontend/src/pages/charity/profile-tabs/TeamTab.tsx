import { useState } from "react";
import { Users, Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface TeamMember {
  id?: number;
  name: string;
  role: string;
  bio: string;
  profile_image?: string;
  is_public: boolean;
}

interface TeamTabProps {
  teamMembers: TeamMember[];
  setTeamMembers: (members: TeamMember[]) => void;
  markAsChanged: () => void;
}

export default function TeamTab({ teamMembers, setTeamMembers, markAsChanged }: TeamTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberForm, setMemberForm] = useState<TeamMember>({
    name: "",
    role: "",
    bio: "",
    is_public: true,
  });

  const handleOpenDialog = (member?: TeamMember) => {
    if (member) {
      setEditingMember(member);
      setMemberForm(member);
    } else {
      setEditingMember(null);
      setMemberForm({
        name: "",
        role: "",
        bio: "",
        is_public: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMember(null);
    setMemberForm({
      name: "",
      role: "",
      bio: "",
      is_public: true,
    });
  };

  const handleSaveMember = () => {
    if (!memberForm.name.trim() || !memberForm.role.trim()) {
      toast.error("Name and role are required");
      return;
    }

    if (editingMember) {
      // Update existing member
      setTeamMembers(
        teamMembers.map((m) =>
          m.id === editingMember.id ? { ...memberForm, id: editingMember.id } : m
        )
      );
      toast.success("Team member updated");
    } else {
      // Add new member
      setTeamMembers([...teamMembers, { ...memberForm, id: Date.now() }]);
      toast.success("Team member added");
    }

    markAsChanged();
    handleCloseDialog();
  };

  const handleDeleteMember = (id: number) => {
    if (window.confirm("Are you sure you want to remove this team member?")) {
      setTeamMembers(teamMembers.filter((m) => m.id !== id));
      toast.success("Team member removed");
      markAsChanged();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Team & Leadership
              </CardTitle>
              <CardDescription>
                Showcase your team members and leadership to build trust with donors
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your team members to showcase your organization's leadership
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Team Member
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
                <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <Avatar className="h-20 w-20 ring-4 ring-primary/10">
                        <AvatarImage src={member.profile_image} />
                        <AvatarFallback className="text-xl bg-primary/10 text-primary">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 w-full">
                        <h4 className="font-semibold text-lg">{member.name}</h4>
                        <p className="text-sm text-primary font-medium">{member.role}</p>
                        
                        {member.bio && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                            {member.bio}
                          </p>
                        )}

                        <div className="flex items-center justify-center gap-2 mt-3">
                          <Badge
                            variant={member.is_public ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {member.is_public ? (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Public
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Private
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleOpenDialog(member)}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteMember(member.id!)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Member Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Edit Team Member" : "Add Team Member"}
            </DialogTitle>
            <DialogDescription>
              {editingMember
                ? "Update the team member's information"
                : "Add a new member to your organization's team"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="member-name">Full Name *</Label>
                <Input
                  id="member-name"
                  value={memberForm.name}
                  onChange={(e) =>
                    setMemberForm({ ...memberForm, name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="member-role">Role / Position *</Label>
                <Input
                  id="member-role"
                  value={memberForm.role}
                  onChange={(e) =>
                    setMemberForm({ ...memberForm, role: e.target.value })
                  }
                  placeholder="Executive Director"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-bio">Bio / Description</Label>
              <Textarea
                id="member-bio"
                value={memberForm.bio}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, bio: e.target.value })
                }
                placeholder="Brief description about this team member, their background, and role in the organization..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {memberForm.bio.length}/500 characters
              </p>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="is-public" className="text-base">
                  Show on Public Profile
                </Label>
                <p className="text-sm text-muted-foreground">
                  Make this team member visible to donors and visitors
                </p>
              </div>
              <Switch
                id="is-public"
                checked={memberForm.is_public}
                onCheckedChange={(checked) =>
                  setMemberForm({ ...memberForm, is_public: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveMember}>
              {editingMember ? "Update Member" : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
