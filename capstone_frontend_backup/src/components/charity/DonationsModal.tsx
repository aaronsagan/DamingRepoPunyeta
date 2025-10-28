import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { campaignService } from "@/services/campaigns";
import { donationsService } from "@/services/donations";

interface Donation {
  id: number;
  donorName: string;
  donorEmail: string;
  amount: number;
  date: string;
  status: "pending" | "completed" | "rejected";
  transactionId: string;
  proofImage?: string;
  rejectionReason?: string;
}

interface DonationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: number;
  campaignTitle: string;
}

export function DonationsModal({
  open,
  onOpenChange,
  campaignId,
  campaignTitle,
}: DonationsModalProps) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [proofImageUrl, setProofImageUrl] = useState<string | null>(null);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadDonations();
    }
  }, [open, campaignId]);

  useEffect(() => {
    filterDonations();
  }, [donations, search, statusFilter]);

  const loadDonations = async () => {
    try {
      setLoading(true);
      
      // Fetch donations from backend
      const response = await campaignService.getCampaignDonations(campaignId);
      
      // Map backend donations to frontend format
      const mappedDonations: Donation[] = (response.data || []).map((donation: any) => ({
        id: donation.id,
        donorName: donation.is_anonymous 
          ? "Anonymous Donor" 
          : (donation.donor?.name || "Unknown Donor"),
        donorEmail: donation.donor?.email || "",
        amount: donation.amount,
        date: donation.donated_at || donation.created_at,
        status: donation.status,
        transactionId: donation.external_ref || donation.receipt_no || `TXN-${donation.id}`,
        proofImage: donation.proof_path,
        rejectionReason: donation.rejection_reason,
      }));

      setDonations(mappedDonations);
    } catch (error: any) {
      // Silently handle 404 - endpoint may not exist yet
      if (error?.response?.status === 404) {
        setDonations([]);
      } else {
        // Only log and show toast for real errors
        console.error("Failed to load donations:", error);
        toast({
          title: "Error",
          description: "Failed to load donations",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const filterDonations = () => {
    let filtered = donations;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.donorName.toLowerCase().includes(searchLower) ||
          d.transactionId.toLowerCase().includes(searchLower) ||
          d.donorEmail.toLowerCase().includes(searchLower)
      );
    }

    setFilteredDonations(filtered);
  };

  const handleViewProof = (donation: Donation) => {
    if (donation.proofImage) {
      setProofImageUrl(
        `${import.meta.env.VITE_API_URL}/storage/${donation.proofImage}`
      );
    } else {
      setProofImageUrl(null);
    }
    setSelectedDonation(donation);
    setShowProofDialog(true);
  };

  const handleConfirm = async (donationId: number) => {
    try {
      setActionLoading(true);
      
      // Update donation status via backend
      await donationsService.updateDonationStatus(donationId, "completed");
      
      // Update local state
      setDonations(
        donations.map((d) =>
          d.id === donationId ? { ...d, status: "completed" as const } : d
        )
      );
      
      toast({
        title: "Success",
        description: "Donation confirmed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm donation",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = (donation: Donation) => {
    setSelectedDonation(donation);
    setRejectionReason("");
    setShowRejectDialog(true);
  };

  const confirmReject = async () => {
    if (!selectedDonation || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(true);
      
      // Update donation status via backend
      await donationsService.updateDonationStatus(
        selectedDonation.id,
        "rejected",
        rejectionReason
      );
      
      // Update local state
      setDonations(
        donations.map((d) =>
          d.id === selectedDonation.id
            ? { ...d, status: "rejected" as const, rejectionReason }
            : d
        )
      );
      
      toast({
        title: "Success",
        description: "Donation rejected",
      });
      
      setShowRejectDialog(false);
      setSelectedDonation(null);
      setRejectionReason("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject donation",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = (format: "csv" | "pdf") => {
    // TODO: Implement export functionality
    toast({
      title: "Export",
      description: `Exporting donations as ${format.toUpperCase()}...`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: Donation["status"]) => {
    const config = {
      pending: {
        label: "Pending",
        className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-500/20",
        icon: <Clock className="h-3 w-3 mr-1" />,
      },
      completed: {
        label: "Completed",
        className: "bg-green-500/10 text-green-700 dark:text-green-500 border-green-500/20",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      rejected: {
        label: "Rejected",
        className: "bg-red-500/10 text-red-700 dark:text-red-500 border-red-500/20",
        icon: <XCircle className="h-3 w-3 mr-1" />,
      },
    };

    const { label, className, icon } = config[status];

    return (
      <Badge variant="outline" className={className}>
        {icon}
        {label}
      </Badge>
    );
  };

  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  const completedAmount = donations
    .filter((d) => d.status === "completed")
    .reduce((sum, d) => sum + d.amount, 0);
  const pendingCount = donations.filter((d) => d.status === "pending").length;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">Donations for: {campaignTitle}</DialogTitle>
            <DialogDescription>
              Manage and review all donations for this campaign
            </DialogDescription>
          </DialogHeader>

          {/* Summary Metrics */}
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Total Received</span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                {formatCurrency(completedAmount)}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">Total Donations</span>
              </div>
              <p className="text-2xl font-bold">{donations.length}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Pending Review</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                {pendingCount}
              </p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by donor name or transaction ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => handleExport("csv")}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Donations Table */}
          <div className="flex-1 overflow-auto border rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredDonations.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {search || statusFilter !== "all"
                  ? "No donations match your filters"
                  : "No donations yet"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{donation.donorName}</p>
                          <p className="text-sm text-muted-foreground">
                            {donation.donorEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(donation.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(donation.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(donation.status)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {donation.transactionId}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewProof(donation)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {donation.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                                onClick={() => handleConfirm(donation.id)}
                                disabled={actionLoading}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirm
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                onClick={() => handleReject(donation)}
                                disabled={actionLoading}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filteredDonations.length} of {donations.length} donations
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Proof Dialog */}
      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Donation Details</DialogTitle>
            <DialogDescription>
              {selectedDonation?.donorName} - {selectedDonation && formatCurrency(selectedDonation.amount)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {proofImageUrl ? (
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={proofImageUrl}
                  alt="Proof of payment"
                  className="w-full h-auto"
                />
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-12 text-center text-muted-foreground">
                <p>No proof of payment uploaded</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Transaction ID</p>
                <p className="font-mono">{selectedDonation?.transactionId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date</p>
                <p>{selectedDonation && new Date(selectedDonation.date).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <div className="mt-1">
                  {selectedDonation && getStatusBadge(selectedDonation.status)}
                </div>
              </div>
              {selectedDonation?.rejectionReason && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Rejection Reason</p>
                  <p className="text-red-600">{selectedDonation.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Donation?</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this donation. The donor will be
              notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="e.g., Invalid proof of payment, unclear image..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              disabled={actionLoading || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Donation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
