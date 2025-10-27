import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Upload, Eye, Download, AlertTriangle, Calendar, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { charityService } from "@/services/charity";
import { useAuth } from "@/context/AuthContext";

interface Document {
  id: number;
  doc_type: string;
  file_path: string;
  expires: boolean;
  expiry_date?: string;
  renewal_reminder_sent_at?: string;
  uploaded_at: string;
  is_expired?: boolean;
  is_expiring_soon?: boolean;
  days_until_expiry?: number;
}

interface DocumentStatus {
  documents: Document[];
  expired_count: number;
  expiring_soon_count: number;
  total_expirable_documents: number;
}

export default function CharityDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [hasExpiry, setHasExpiry] = useState(false);

  useEffect(() => {
    if (user?.charity?.id) {
      fetchDocuments();
      fetchDocumentStatus();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      if (!user?.charity?.id) return;
      const data = await charityService.getDocuments(user.charity.id);
      const documentsData = Array.isArray(data) ? data : [];
      setDocuments(documentsData);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast.error("Failed to fetch documents");
      // Keep documents as an empty array on error
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentStatus = async () => {
    try {
      if (!user?.charity?.id) return;
      const data = await charityService.getDocumentStatus(user.charity.id);
      setDocumentStatus(data);
    } catch (error) {
      console.error("Failed to fetch document status:", error);
      // Provide a safe default to avoid undefined access in UI
      setDocumentStatus({
        documents: [],
        expired_count: 0,
        expiring_soon_count: 0,
        total_expirable_documents: 0,
      });
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadType) {
      toast.error("Please select a file and document type");
      return;
    }

    try {
      if (!user?.charity?.id) return;
      await charityService.uploadDocument(
        user.charity.id,
        uploadFile,
        uploadType,
        hasExpiry,
        expiryDate
      );

      toast.success("Document uploaded successfully");
      setIsUploadOpen(false);
      resetUploadForm();
      fetchDocuments();
      fetchDocumentStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload document");
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadType("");
    setExpiryDate("");
    setHasExpiry(false);
  };

  const downloadDocument = async (document: Document) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/storage/${document.file_path}`);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${document.doc_type}.pdf`);
      window.document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Failed to download document");
    }
  };

  const viewDocument = (document: Document) => {
    window.open(`${import.meta.env.VITE_API_URL}/storage/${document.file_path}`, '_blank');
  };

  const getDocumentBadge = (document: Document) => {
    if (document.is_expired) {
      return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
    }
    if (document.is_expiring_soon) {
      return <Badge className="bg-yellow-100 text-yellow-800">Expiring Soon</Badge>;
    }
    if (document.expires) {
      return <Badge className="bg-green-100 text-green-800">Valid</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800">No Expiry</Badge>;
  };

  const formatDocType = (docType: string) => {
    return docType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const documentTypes = [
    "certificate_of_registration",
    "tax_exemption_certificate",
    "financial_report",
    "board_resolution",
    "valid_id",
    "bank_certificate",
    "other_legal_document"
  ];

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
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-muted-foreground">Manage your organization's legal documents</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
              <DialogDescription>
                Upload legal documents for your organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Document Type</label>
                <select 
                  className="w-full mt-1 p-2 border rounded-md"
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                >
                  <option value="">Select document type</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {formatDocType(type)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Document File</label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Accepted formats: PDF, JPG, PNG (Max 10MB)
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasExpiry"
                  checked={hasExpiry}
                  onChange={(e) => setHasExpiry(e.target.checked)}
                />
                <label htmlFor="hasExpiry" className="text-sm font-medium">
                  This document has an expiry date
                </label>
              </div>
              {hasExpiry && (
                <div>
                  <label className="text-sm font-medium">Expiry Date</label>
                  <Input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1"
                  />
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload}>
                  Upload Document
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Document Status Alerts */}
      {documentStatus && (
        <div className="space-y-4">
          {documentStatus.expired_count > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Urgent:</strong> You have {documentStatus.expired_count} expired document(s). 
                Please renew them immediately to maintain your verification status.
              </AlertDescription>
            </Alert>
          )}
          {documentStatus.expiring_soon_count > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Reminder:</strong> You have {documentStatus.expiring_soon_count} document(s) 
                expiring within 30 days. Please prepare renewals.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((document) => (
          <Card key={document.id} className={document.is_expired ? "border-red-200" : document.is_expiring_soon ? "border-yellow-200" : ""}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-base">{formatDocType(document.doc_type)}</CardTitle>
                    <CardDescription className="text-xs">
                      Uploaded {new Date(document.uploaded_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
                {getDocumentBadge(document)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {document.expires && document.expiry_date && (
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Expires: {new Date(document.expiry_date).toLocaleDateString()}</span>
                  </div>
                  {document.days_until_expiry !== undefined && (
                    <p className={`text-xs mt-1 ${document.is_expired ? 'text-red-600' : document.is_expiring_soon ? 'text-yellow-600' : 'text-green-600'}`}>
                      {document.is_expired 
                        ? `Expired ${Math.abs(document.days_until_expiry)} days ago`
                        : `${document.days_until_expiry} days remaining`
                      }
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewDocument(document)}
                  className="flex-1"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadDocument(document)}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {documents.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No documents uploaded yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Upload your legal documents to maintain verification status.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Required Documents Info */}
      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>
            These documents are typically required for charity verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentTypes.map((type) => {
              const hasDocument = documents.some(doc => doc.doc_type === type);
              return (
                <div key={type} className="flex items-center gap-2">
                  {hasDocument ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={`text-sm ${hasDocument ? 'text-green-800' : 'text-muted-foreground'}`}>
                    {formatDocType(type)}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
