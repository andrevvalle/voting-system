import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import React from 'react';
import { getActivePolls } from '../../lib/api';
import Polls from '../polls';

jest.mock('../../lib/api', () => ({
  getActivePolls: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../components/Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('../../components/Footer', () => () => <div data-testid="mock-footer">Footer</div>);

describe('Polls Page', () => {
  const mockPolls = [
    {
      id: '1',
      name: 'Test Poll 1',
      description: 'Description for test poll 1',
      isActive: true,
      participants: [
        { id: '1', name: 'Participant 1' },
        { id: '2', name: 'Participant 2' },
      ],
    },
    {
      id: '2',
      name: 'Test Poll 2',
      description: 'Description for test poll 2',
      isActive: false,
      participants: [
        { id: '3', name: 'Participant 3' },
        { id: '4', name: 'Participant 4' },
      ],
    },
  ];

  const mockMeta = {
    currentPage: 1,
    totalPages: 2,
    totalItems: 12,
    itemsPerPage: 9,
    hasNextPage: true,
    hasPrevPage: false,
  };

  const mockRouter = {
    query: { page: '1', limit: '9', filterActive: 'false' },
    pathname: '/polls',
    push: jest.fn(),
    isReady: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    useRouter.mockReturnValue(mockRouter);
    getActivePolls.mockResolvedValue({
      polls: mockPolls,
      meta: mockMeta,
    });
  });

  test('renders loading state initially', () => {
    useRouter.mockReturnValue({ ...mockRouter, isReady: false });
    
    render(<Polls />);
    
    expect(screen.getByText('Loading polls...')).toBeInTheDocument();
  });

  test('renders polls when data is loaded', async () => {
    render(<Polls />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Poll 1')).toBeInTheDocument();
      expect(screen.getByText('Test Poll 2')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Description for test poll 1')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toBeInTheDocument();
    
    expect(screen.getByText('Participant 1')).toBeInTheDocument();
    expect(screen.getByText('Participant 2')).toBeInTheDocument();
    expect(screen.getByText('Participant 3')).toBeInTheDocument();
    expect(screen.getByText('Participant 4')).toBeInTheDocument();
  });

  test('renders error state when API call fails', async () => {
    getActivePolls.mockRejectedValue(new Error('API Error'));
    
    const originalError = console.error;
    console.error = jest.fn();
    
    render(<Polls />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load polls')).toBeInTheDocument();
    });
    
    console.error = originalError;
  });

  test('calls API with correct parameters from URL query', async () => {
    useRouter.mockReturnValue({
      ...mockRouter,
      query: { page: '2', limit: '6', filterActive: 'true' },
    });
    
    render(<Polls />);
    
    await waitFor(() => {
      expect(getActivePolls).toHaveBeenCalledWith('2', '6', 'true');
    });
  });

  test('pagination works correctly', async () => {
    render(<Polls />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Poll 1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Next'));
    
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/polls',
      query: { ...mockRouter.query, page: 2 },
    });
    
    fireEvent.click(screen.getByText('2'));
    
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/polls',
      query: { ...mockRouter.query, page: 2 },
    });
  });
  
  test('filter toggle works correctly', async () => {
    render(<Polls />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Poll 1')).toBeInTheDocument();
    });
    
    const filterButton = screen.getByText('Ver todos');
    fireEvent.click(filterButton);
    
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/polls',
      query: { ...mockRouter.query, filterActive: 'true', page: 1 },
    });
  });

  test('renders empty state when no polls are available', async () => {
    getActivePolls.mockResolvedValue({
      polls: [],
      meta: { ...mockMeta, totalItems: 0, totalPages: 0 },
    });
    
    render(<Polls />);
    
    await waitFor(() => {
      expect(screen.getByText('No paredão available with the current filters.')).toBeInTheDocument();
    });
  });

  test('empty state shows "see all" button when filtering by active', async () => {
    useRouter.mockReturnValue({
      ...mockRouter,
      query: { ...mockRouter.query, filterActive: 'true' },
    });
    
    getActivePolls.mockResolvedValue({
      polls: [],
      meta: { ...mockMeta, totalItems: 0, totalPages: 0 },
    });
    
    render(<Polls />);
    
    await waitFor(() => {
      expect(screen.getByText('Ver todos os paredões')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Ver todos os paredões'));
    
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/polls',
      query: { ...mockRouter.query, filterActive: 'false', page: 1 },
    });
  });
});