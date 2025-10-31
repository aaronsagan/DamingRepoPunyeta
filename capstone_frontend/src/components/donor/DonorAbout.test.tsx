import { render, screen } from '@testing-library/react';
import { DonorAbout } from './DonorAbout';
import { DonorProfile } from '@/hooks/useDonorProfile';

// Mock the hooks
jest.mock('@/hooks/useDonorBadges', () => ({
  useDonorBadges: () => ({
    badges: [
      {
        name: 'First Donation',
        description: 'Made your first donation',
        icon: 'Heart',
        earned: true,
      },
    ],
    loading: false,
  }),
}));

describe('DonorAbout', () => {
  const mockProfile: DonorProfile = {
    id: 1,
    name: 'Test Donor',
    email: 'test@example.com',
    avatar_url: null,
    cover_url: null,
    bio: 'This is a test bio about a generous donor.',
    location: 'Manila, Philippines',
    member_since: '2025-01-01',
    total_donated: 5000,
    campaigns_supported_count: 3,
    recent_donations_count: 2,
    liked_campaigns_count: 5,
    achievements_preview: [],
    is_owner: true,
  };

  it('renders all sections with complete data', () => {
    render(<DonorAbout profile={mockProfile} isOwner={true} />);

    // Check for section titles
    expect(screen.getByText('About the Donor')).toBeInTheDocument();
    expect(screen.getByText('Donation Impact')).toBeInTheDocument();
    expect(screen.getByText('Recognition & Badges')).toBeInTheDocument();
    expect(screen.getByText('Member Information')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();

    // Check bio content
    expect(screen.getByText(mockProfile.bio)).toBeInTheDocument();

    // Check impact stats
    expect(screen.getByText('Total Donated')).toBeInTheDocument();
    expect(screen.getByText('Campaigns Supported')).toBeInTheDocument();
    expect(screen.getByText('Liked Campaigns')).toBeInTheDocument();
  });

  it('displays empty state when bio is missing', () => {
    const profileWithoutBio = { ...mockProfile, bio: '' };
    render(<DonorAbout profile={profileWithoutBio} isOwner={true} />);

    expect(screen.getByText(/hasn't written a bio yet/i)).toBeInTheDocument();
  });

  it('shows contact information for owner', () => {
    render(<DonorAbout profile={mockProfile} isOwner={true} />);

    expect(screen.getByText(mockProfile.email!)).toBeInTheDocument();
    expect(screen.getByText(mockProfile.location!)).toBeInTheDocument();
  });

  it('hides email for non-owner', () => {
    render(<DonorAbout profile={mockProfile} isOwner={false} />);

    expect(screen.queryByText(mockProfile.email!)).not.toBeInTheDocument();
  });

  it('displays formatted currency correctly', () => {
    render(<DonorAbout profile={mockProfile} isOwner={true} />);

    expect(screen.getByText(/₱5,000/)).toBeInTheDocument();
  });

  it('shows member since date', () => {
    render(<DonorAbout profile={mockProfile} isOwner={true} />);

    expect(screen.getByText(/January 2025/)).toBeInTheDocument();
  });

  it('displays recent activity count', () => {
    render(<DonorAbout profile={mockProfile} isOwner={true} />);

    expect(screen.getByText(/2 donations/)).toBeInTheDocument();
    expect(screen.getByText(/in the last 30 days/)).toBeInTheDocument();
  });

  it('renders responsive layout', () => {
    const { container } = render(<DonorAbout profile={mockProfile} isOwner={true} />);

    // Check for grid layout classes
    const gridElement = container.querySelector('.lg\\:grid-cols-3');
    expect(gridElement).toBeInTheDocument();
  });
});
