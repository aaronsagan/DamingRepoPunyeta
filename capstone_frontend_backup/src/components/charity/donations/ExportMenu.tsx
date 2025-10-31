import { Download, FileSpreadsheet, FileText, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportMenuProps {
  onExport: (format: 'csv' | 'excel' | 'pdf') => void;
  selectedCount: number;
  onBulkAction: (action: 'confirm' | 'reject' | 'export') => void;
}

export default function ExportMenu({
  onExport,
  selectedCount,
  onBulkAction,
}: ExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export & Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onExport('csv')}>
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport('excel')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport('pdf')}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>

        {selectedCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>
              Bulk Actions ({selectedCount} selected)
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onBulkAction('confirm')}>
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Confirm Selected
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkAction('reject')}>
              <XCircle className="h-4 w-4 mr-2 text-destructive" />
              Reject Selected
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkAction('export')}>
              <Download className="h-4 w-4 mr-2" />
              Export Selected
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
