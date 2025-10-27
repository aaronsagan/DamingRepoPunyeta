import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Organization Profile - Redirect Component
 * 
 * This component redirects to the new comprehensive Organization Profile Management system
 * Location: /charity/organization/manage
 * 
 * New features include:
 * - Banner & Logo Upload with preview
 * - 6-Tab Interface (Overview, About, Team, Media, Campaigns, Settings)
 * - Team Member Management with add/edit/delete
 * - Media Gallery with upload and lightbox
 * - Campaign Overview with stats
 * - Account Settings & Security with danger zone
 */
export default function OrganizationProfile() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new comprehensive management page
    navigate('/charity/organization/manage', { replace: true });
  }, [navigate]);

  return null;
}
