import { render, screen } from '@testing-library/react';
import { MilestonesGrid } from './MilestonesGrid';
import { DonorMilestone } from '@/hooks/useDonorMilestones';

describe('MilestonesGrid', () => {
  const mockMilestones: DonorMilestone[] = [
    {
      id: 1,
      key: 'first_donation',
      title: 'First Donation',
      description: 'Made your first donation',
      icon: 'Heart',
      achieved: true,
      achieved_at: '2025-01-15T10:00:00Z',
      progress: 1,
      threshold: 1,
    },
    {
      id: 2,
      key: 'total_1000',
      title: 'Generous Supporter',
      description: 'Donated ₱1,000 or more',
      icon: 'Award',
      achieved: false,
      achieved_at: null,
      progress: 500,
      threshold: 1000,
    },
    {
      id: 3,
      key: 'supported_5_campaigns',
      title: 'Community Supporter',
      description: 'Supported 5 different campaigns',
      icon: 'Users',
      achieved: false,
      achieved_at: null,
      progress: 3,
      threshold: 5,
    },
  ];

  it('renders correct number of milestone cards', () => {
    render(<MilestonesGrid milestones={mockMilestones} />);
    
    expect(screen.getByText('First Donation')).toBeInTheDocument();
    expect(screen.getByText('Generous Supporter')).toBeInTheDocument();
    expect(screen.getByText('Community Supporter')).toBeInTheDocument();
  });

  it('shows achieved badge for completed milestones', () => {
    render(<MilestonesGrid milestones={mockMilestones} />);
    
    const achievedBadge = screen.getByText('✅ Achieved');
    expect(achievedBadge).toBeInTheDocument();
  });

  it('shows in progress badge for incomplete milestones', () => {
    render(<MilestonesGrid milestones={mockMilestones} />);
    
    const inProgressBadges = screen.getAllByText('In Progress');
    expect(inProgressBadges).toHaveLength(2);
  });

  it('handles empty state properly', () => {
    render(<MilestonesGrid milestones={[]} />);
    
    expect(screen.getByText('No milestones yet')).toBeInTheDocument();
    expect(screen.getByText(/Start donating to unlock achievements/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<MilestonesGrid milestones={[]} loading={true} />);
    
    // Should show skeleton loaders
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays achievement date for completed milestones', () => {
    render(<MilestonesGrid milestones={mockMilestones} />);
    
    expect(screen.getByText(/Achieved on/i)).toBeInTheDocument();
  });

  it('displays progress information for incomplete milestones', () => {
    render(<MilestonesGrid milestones={mockMilestones} />);
    
    // Check for progress labels
    expect(screen.getByText(/₱500/)).toBeInTheDocument();
    expect(screen.getByText(/3 \/ 5 campaigns/)).toBeInTheDocument();
  });
});
