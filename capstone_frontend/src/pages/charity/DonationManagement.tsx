/**
 * Donation Management Page
 * 
 * Main entry point for the comprehensive donation management system.
 * This file serves as a wrapper that imports the modular DonationsPage component.
 * 
 * The modular architecture includes:
 * - DonationsPage: Main layout and state management
 * - DonationsTable: Advanced table with sorting, filtering, pagination
 * - DonationFilters: Search and filter controls
 * - DonationDetailsModal: View and manage individual donations
 * - DonationStatsSidebar: KPIs, charts, and quick actions
 * - ReconciliationModal: Match donations with bank transactions
 * - ExportMenu: Export and bulk action controls
 */

import DonationsPage from "@/components/charity/donations/DonationsPage";

export default function DonationManagement() {
  return <DonationsPage />;
}
