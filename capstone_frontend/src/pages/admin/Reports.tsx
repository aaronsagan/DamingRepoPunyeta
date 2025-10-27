import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Eye, CheckCircle, XCircle, Clock, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface Report {
  id: number;
  reporter: {
    id: number;
    name: string;
    email: string;
  };
  reporter_role: string;
  reported_entity_type: string;
  reported_entity_id: number;
  reason: string;
  description: string;
  evidence_path?: string;
  status: string;
  admin_notes?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  action_taken?: string;
  created_at: string;
}

interface ReportStatistics {
  total: number;
  pending: number;
  under_review: number;
  resolved: number;
  dismissed: number;
  by_reason: Array<{ reason: string; count: number }>;
  recent: Report[];
}

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [statistics, setStatistics] = useState<ReportStatistics | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");

  // Review form state
  const [reviewStatus, setReviewStatus] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchReports();
    fetchStatistics();
  }, [statusFilter, entityTypeFilter, reasonFilter, searchTerm]);

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (entityTypeFilter !== "all") params.append("entity_type", entityTypeFilter);
      if (reasonFilter !== "all") params.append("reason", reasonFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await axios.get(`/api/admin/reports?${params.toString()}`);
      setReports(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      toast.error("Failed to fetch reports");
      setReports([]); // Ensure reports is always an array
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get("/api/admin/reports/statistics");
      setStatistics(response.data);
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    }
  };

  const handleViewDetails = async (report: Report) => {
    try {
      const response = await axios.get(`/api/admin/reports/${report.id}`);
      setSelectedReport(response.data.report);
      setIsDetailsOpen(true);
    } catch (error) {
      toast.error("Failed to fetch report details");
    }
  };

  const handleReviewReport = (report: Report) => {
    setSelectedReport(report);
    setReviewStatus("");
    setActionTaken("");
    setAdminNotes("");
    setIsReviewOpen(true);
  };

  const submitReview = async () => {
    if (!selectedReport || !reviewStatus) {
      toast.error("Please select a status");
      return;
    }

    try {
      await axios.patch(`/api/admin/reports/${selectedReport.id}/review`, {
        status: reviewStatus,
        action_taken: actionTaken,
        admin_notes: adminNotes,
      });

      toast.success("Report reviewed successfully");
      setIsReviewOpen(false);
      fetchReports();
      fetchStatistics();
    } catch (error) {
      toast.error("Failed to review report");
    }
  };

  const deleteReport = async (reportId: number) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      await axios.delete(`/api/admin/reports/${reportId}`);
      toast.success("Report deleted successfully");
      fetchReports();
      fetchStatistics();
    } catch (error) {
      toast.error("Failed to delete report");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "destructive",
      under_review: "default",
      resolved: "default",
      dismissed: "secondary",
    } as const;

    const colors = {
      pending: "bg-red-100 text-red-800",
      under_review: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      dismissed: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const formatReason = (reason: string) => {
    return reason.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
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
          <h1 className="text-3xl font-bold">Reports Management</h1>
          <p className="text-muted-foreground">Review and manage user reports</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statistics.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{statistics.under_review}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.resolved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Dismissed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{statistics.dismissed}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="charity">Charity</SelectItem>
                <SelectItem value="campaign">Campaign</SelectItem>
                <SelectItem value="donation">Donation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={reasonFilter} onValueChange={setReasonFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reasons</SelectItem>
                <SelectItem value="fraud">Fraud</SelectItem>
                <SelectItem value="fake_proof">Fake Proof</SelectItem>
                <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                <SelectItem value="scam">Scam</SelectItem>
                <SelectItem value="fake_charity">Fake Charity</SelectItem>
                <SelectItem value="misuse_of_funds">Misuse of Funds</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Reports ({(reports || []).length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(reports || []).map((report) => (
              <div key={report.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="font-medium">Report #{report.id}</span>
                      {getStatusBadge(report.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reported by: {report.reporter.name} ({report.reporter_role})
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Reason:</span> {formatReason(report.reason)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Entity:</span> {report.reported_entity_type} #{report.reported_entity_id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(report)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {report.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleReviewReport(report)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteReport(report.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
                <p className="text-sm bg-gray-50 p-2 rounded">
                  {report.description}
                </p>
                <div className="text-xs text-muted-foreground">
                  Submitted: {new Date(report.created_at).toLocaleString()}
                </div>
              </div>
            ))}
            {(reports || []).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No reports found matching your filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Full details of report #{selectedReport?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Reporter</label>
                  <p className="text-sm">{selectedReport.reporter.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedReport.reporter.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedReport.description}</p>
              </div>
              {selectedReport.evidence_path && (
                <div>
                  <label className="text-sm font-medium">Evidence</label>
                  <p className="text-sm mt-1">
                    <a 
                      href={`/storage/${selectedReport.evidence_path}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Evidence File
                    </a>
                  </p>
                </div>
              )}
              {selectedReport.admin_notes && (
                <div>
                  <label className="text-sm font-medium">Admin Notes</label>
                  <p className="text-sm mt-1 p-2 bg-blue-50 rounded">{selectedReport.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Report Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Report</DialogTitle>
            <DialogDescription>
              Take action on report #{selectedReport?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={reviewStatus} onValueChange={setReviewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Action Taken</label>
              <Select value={actionTaken} onValueChange={setActionTaken}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Action</SelectItem>
                  <SelectItem value="warned">Warned User</SelectItem>
                  <SelectItem value="suspended">Suspended Account</SelectItem>
                  <SelectItem value="deleted">Deleted Content</SelectItem>
                  <SelectItem value="contacted">Contacted User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Admin Notes</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about your review and action taken..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsReviewOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitReview}>
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
