import { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Info,
  Calendar,
  User,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface AuditDocument {
  id: number;
  fileName: string;
  documentType: string;
  description: string;
  submissionDate: string;
  status: 'pending' | 'approved' | 'needs_revision' | 'rejected';
  reviewedBy?: string;
  feedback?: string;
  filePath: string;
}

export default function DocumentUploads() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<AuditDocument[]>([]);
  
  // Upload form state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [description, setDescription] = useState("");
  
  // Feedback modal state
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<AuditDocument | null>(null);
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    // TODO: Replace with actual API call
    const mockDocuments: AuditDocument[] = [
      {
        id: 1,
        fileName: "Annual_Audit_2024.pdf",
        documentType: "Annual Audit Report",
        description: "Annual financial audit for fiscal year 2024",
        submissionDate: "2024-10-01",
        status: "approved",
        reviewedBy: "Admin John Doe",
        feedback: "All documents are in order. Approved for compliance.",
        filePath: "/uploads/audit_2024.pdf",
      },
      {
        id: 2,
        fileName: "Financial_Statement_Q3.xlsx",
        documentType: "Financial Statement",
        description: "Q3 2024 financial statement",
        submissionDate: "2024-10-10",
        status: "pending",
        filePath: "/uploads/financial_q3.xlsx",
      },
      {
        id: 3,
        fileName: "Compliance_Certificate.pdf",
        documentType: "Compliance Certificate",
        description: "Annual compliance certificate from regulatory body",
        submissionDate: "2024-09-15",
        status: "needs_revision",
        reviewedBy: "Admin Jane Smith",
        feedback: "Please update the certificate with the latest registration number and resubmit.",
        filePath: "/uploads/compliance_cert.pdf",
      },
    ];
    setDocuments(mockDocuments);
  };

  const handleUpload = () => {
    if (!uploadFile || !documentType || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(uploadFile.type)) {
      toast.error("Only PDF, DOCX, and XLSX files are allowed");
      return;
    }

    // Validate file size (10MB)
    if (uploadFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // TODO: Implement actual upload to backend
    const newDocument: AuditDocument = {
      id: documents.length + 1,
      fileName: uploadFile.name,
      documentType,
      description,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      filePath: `/uploads/${uploadFile.name}`,
    };

    setDocuments([newDocument, ...documents]);
    toast.success("Document uploaded successfully");
    
    // Reset form
    setUploadFile(null);
    setDocumentType("");
    setDescription("");
    setIsUploadOpen(false);
  };

  const handleViewFeedback = (doc: AuditDocument) => {
    setSelectedDocument(doc);
    setIsFeedbackOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      setDocuments(documents.filter(d => d.id !== id));
      toast.success("Document deleted successfully");
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.documentType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesType = typeFilter === "all" || doc.documentType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate statistics
  const stats = {
    total: documents.length,
    approved: documents.filter(d => d.status === 'approved').length,
    pending: documents.filter(d => d.status === 'pending').length,
    needsRevision: documents.filter(d => d.status === 'needs_revision').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'needs_revision':
        return (
          <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Needs Revision
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-foreground mb-2">Document Uploads & Audit Submissions</h1>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-5 w-5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Submit and track your organization's compliance and audit documents including annual reports, financial statements, and certificates.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-muted-foreground">
                Submit and track your organization's compliance and audit documents
              </p>
            </div>
            <Button onClick={() => setIsUploadOpen(true)} size="lg">
              <Upload className="h-4 w-4 mr-2" />
              Upload New Document
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 py-6 space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Submitted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">All documents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <p className="text-xs text-muted-foreground mt-1">Verified documents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Needs Revision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.needsRevision}</div>
              <p className="text-xs text-muted-foreground mt-1">Requires action</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by file name or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="needs_revision">Needs Revision</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Annual Audit Report">Annual Audit Report</SelectItem>
                  <SelectItem value="Financial Statement">Financial Statement</SelectItem>
                  <SelectItem value="Compliance Certificate">Compliance Certificate</SelectItem>
                  <SelectItem value="Government Registration">Government Registration</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submission History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Submission History
            </CardTitle>
            <CardDescription>
              View and manage all your submitted documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg">No documents found</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {documents.length === 0
                    ? "Upload your first compliance document to get started"
                    : "No documents match your current filters"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reviewed By</TableHead>
                      <TableHead>Feedback</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {doc.fileName}
                          </div>
                        </TableCell>
                        <TableCell>{doc.documentType}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {new Date(doc.submissionDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell>
                          {doc.reviewedBy ? (
                            <div className="flex items-center gap-1 text-sm">
                              <User className="h-3 w-3 text-muted-foreground" />
                              {doc.reviewedBy}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {doc.feedback ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewFeedback(doc)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" title="View">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Download">
                              <Download className="h-4 w-4" />
                            </Button>
                            {doc.status === 'needs_revision' && (
                              <Button variant="ghost" size="icon" title="Edit">
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete"
                              onClick={() => handleDelete(doc.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload New Document</DialogTitle>
            <DialogDescription>
              Submit a compliance or audit document for review
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Document Type */}
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type *</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Annual Audit Report">Annual Audit Report</SelectItem>
                  <SelectItem value="Financial Statement">Financial Statement</SelectItem>
                  <SelectItem value="Compliance Certificate">Compliance Certificate</SelectItem>
                  <SelectItem value="Government Registration">Government Registration</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description / Notes *</Label>
              <Textarea
                id="description"
                placeholder="Provide a brief description of the document..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">Upload File *</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.docx,.xlsx"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">
                Accepted formats: PDF, DOCX, XLSX (Max 10MB)
              </p>
            </div>

            {uploadFile && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{uploadFile.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload}>
              <Upload className="h-4 w-4 mr-2" />
              Submit Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Modal */}
      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Document Feedback</DialogTitle>
            <DialogDescription>
              Review feedback from the administrator
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4 py-4">
              {/* Document Info */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">File Name:</span>
                  <span className="text-sm">{selectedDocument.fileName}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Document Type:</span>
                  <span className="text-sm">{selectedDocument.documentType}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Submission Date:</span>
                  <span className="text-sm">
                    {new Date(selectedDocument.submissionDate).toLocaleDateString()}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  {getStatusBadge(selectedDocument.status)}
                </div>
                {selectedDocument.reviewedBy && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Reviewed By:</span>
                      <span className="text-sm">{selectedDocument.reviewedBy}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Admin Feedback */}
              <div className="space-y-2">
                <Label>Admin Comments / Feedback</Label>
                <div className="p-4 bg-background border rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedDocument.feedback || "No feedback provided yet."}
                  </p>
                </div>
              </div>

              {/* Re-upload option for revisions */}
              {selectedDocument.status === 'needs_revision' && (
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-orange-900 dark:text-orange-100">
                        Revision Required
                      </h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                        Please address the feedback above and upload a revised version of the document.
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Revised Document
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFeedbackOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
