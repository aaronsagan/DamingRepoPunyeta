import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Search, Filter, Calendar } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface AdminActionLog {
  id: number;
  admin: {
    id: number;
    name: string;
    email: string;
  };
  action_type: string;
  target_type?: string;
  target_id?: number;
  details?: any;
  notes?: string;
  ip_address?: string;
  created_at: string;
}

export default function AdminActionLogs() {
  const [logs, setLogs] = useState<AdminActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [actionTypeFilter, targetTypeFilter, startDate, endDate, searchTerm]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (actionTypeFilter !== "all") params.append("action_type", actionTypeFilter);
      if (targetTypeFilter !== "all") params.append("target_type", targetTypeFilter);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (searchTerm) params.append("search", searchTerm);

      const response = await axios.get(`/api/admin/action-logs?${params.toString()}`);
      setLogs(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch action logs:", error);
      toast.error("Failed to fetch action logs");
      setLogs([]); // Ensure logs is always an array
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (actionTypeFilter !== "all") params.append("action_type", actionTypeFilter);
      if (targetTypeFilter !== "all") params.append("target_type", targetTypeFilter);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const response = await axios.get(`/api/admin/action-logs/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `admin_logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Logs exported successfully");
    } catch (error) {
      toast.error("Failed to export logs");
    }
  };

  const formatActionType = (actionType: string) => {
    return actionType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionBadge = (actionType: string) => {
    const colors = {
      approve_charity: "bg-green-100 text-green-800",
      reject_charity: "bg-red-100 text-red-800",
      suspend_user: "bg-yellow-100 text-yellow-800",
      activate_user: "bg-blue-100 text-blue-800",
      review_report: "bg-purple-100 text-purple-800",
      delete_user: "bg-red-100 text-red-800",
      other: "bg-gray-100 text-gray-800",
    };

    const color = colors[actionType as keyof typeof colors] || colors.other;
    
    return (
      <Badge className={color}>
        {formatActionType(actionType)}
      </Badge>
    );
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
          <h1 className="text-3xl font-bold">Admin Action Logs</h1>
          <p className="text-muted-foreground">Audit trail of all administrative actions</p>
        </div>
        <Button onClick={exportLogs} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="approve_charity">Approve Charity</SelectItem>
                <SelectItem value="reject_charity">Reject Charity</SelectItem>
                <SelectItem value="suspend_user">Suspend User</SelectItem>
                <SelectItem value="activate_user">Activate User</SelectItem>
                <SelectItem value="review_report">Review Report</SelectItem>
                <SelectItem value="delete_user">Delete User</SelectItem>
              </SelectContent>
            </Select>
            <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Target Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Charity">Charity</SelectItem>
                <SelectItem value="Report">Report</SelectItem>
                <SelectItem value="Campaign">Campaign</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Action Logs ({(logs || []).length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(logs || []).map((log) => (
              <div key={log.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getActionBadge(log.action_type)}
                      <span className="text-sm text-muted-foreground">
                        by {log.admin.name}
                      </span>
                    </div>
                    {log.target_type && (
                      <p className="text-sm">
                        <span className="font-medium">Target:</span> {log.target_type} #{log.target_id}
                      </p>
                    )}
                    {log.notes && (
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {log.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{new Date(log.created_at).toLocaleString()}</p>
                    {log.ip_address && <p>IP: {log.ip_address}</p>}
                  </div>
                </div>
                {log.details && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-blue-600 hover:underline">
                      View Details
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
            {(logs || []).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No action logs found matching your filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
