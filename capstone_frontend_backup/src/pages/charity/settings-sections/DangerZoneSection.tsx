import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Trash2, Power } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function DangerZoneSection() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleDeactivate = async () => {
    try {
      // TODO: API call to deactivate
      toast.success("Account deactivated successfully");
      setIsDeactivateDialogOpen(false);
      logout();
      navigate('/');
    } catch (error) {
      toast.error("Failed to deactivate account");
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    try {
      // TODO: API call to delete
      toast.success("Account deleted permanently");
      setIsDeleteDialogOpen(false);
      logout();
      navigate('/');
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-destructive">Danger Zone</h2>
        <p className="text-muted-foreground">Irreversible actions that affect your account</p>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          These actions are permanent and cannot be undone. Please proceed with extreme caution.
        </AlertDescription>
      </Alert>

      {/* Deactivate Account */}
      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <Power className="h-5 w-5" />
            Deactivate Organization
          </CardTitle>
          <CardDescription>
            Temporarily disable your account and hide your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-950/20">
            <div className="space-y-3">
              <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                What happens when you deactivate?
              </h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-2 list-disc list-inside">
                <li>Your profile will be hidden from public view</li>
                <li>Active campaigns will be paused</li>
                <li>Donors won't be able to donate to your campaigns</li>
                <li>All data will be preserved</li>
                <li>You can reactivate anytime by logging in</li>
              </ul>
              <div className="pt-3">
                <Button
                  variant="outline"
                  className="border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40"
                  onClick={() => setIsDeactivateDialogOpen(true)}
                >
                  <Power className="h-4 w-4 mr-2" />
                  Deactivate Organization
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Delete Account Permanently
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
            <div className="space-y-3">
              <h4 className="font-semibold text-destructive">
                This action cannot be reversed!
              </h4>
              <p className="text-sm text-destructive/80">
                Once you delete your account, there is no going back. All your data will be permanently erased from our servers.
              </p>
              <ul className="text-sm text-destructive/70 space-y-2 list-disc list-inside">
                <li>All campaigns will be permanently deleted</li>
                <li>Donation history will be removed</li>
                <li>Team members will lose access</li>
                <li>All media and documents will be erased</li>
                <li>Your organization profile will be deleted</li>
                <li>This action is irreversible</li>
              </ul>
              <div className="pt-3">
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account Permanently
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deactivate Dialog */}
      <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-amber-600 dark:text-amber-400">
              Deactivate Organization
            </DialogTitle>
            <DialogDescription>
              Your account will be temporarily disabled. You can reactivate it by logging in again.
            </DialogDescription>
          </DialogHeader>
          <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              Your profile will be hidden and campaigns paused, but all data will be preserved.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeactivateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              className="border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40"
              onClick={handleDeactivate}
            >
              Deactivate Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Delete Account Permanently
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              All campaigns, donations, team members, and data will be permanently erased.
            </AlertDescription>
          </Alert>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">
                Type <span className="font-bold">DELETE</span> to confirm
              </Label>
              <Input
                id="delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteConfirmText !== "DELETE"}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
