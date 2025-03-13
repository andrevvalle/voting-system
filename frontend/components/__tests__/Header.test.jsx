import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import React from 'react';
import Header from '../Header';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('Header Component', () => {
  beforeEach(() => {
    useRouter.mockImplementation(() => ({
      pathname: '/'
    }));
  });

  test('renders logo and navigation links', () => {
    render(<Header />);
    
    expect(screen.getByText('Sistema de Votação')).toBeInTheDocument();
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Votações')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  test('applies active class to current route link - Home page', () => {
    useRouter.mockImplementation(() => ({
      pathname: '/'
    }));
    
    render(<Header />);
    
    const homeLink = screen.getByText('Home').closest('a');
    const pollsLink = screen.getByText('Votações').closest('a');
    const adminLink = screen.getByText('Admin').closest('a');
    
    expect(homeLink.className).toContain('active');
    expect(pollsLink.className).not.toContain('active');
    expect(adminLink.className).not.toContain('active');
  });

  test('applies active class to current route link - Polls page', () => {
    useRouter.mockImplementation(() => ({
      pathname: '/polls'
    }));
    
    render(<Header />);
    
    const homeLink = screen.getByText('Home').closest('a');
    const pollsLink = screen.getByText('Votações').closest('a');
    const adminLink = screen.getByText('Admin').closest('a');
    
    expect(homeLink.className).not.toContain('active');
    expect(pollsLink.className).toContain('active');
    expect(adminLink.className).not.toContain('active');
  });

  test('applies active class to current route link - Admin page', () => {
    useRouter.mockImplementation(() => ({
      pathname: '/admin'
    }));
    
    render(<Header />);
    
    const homeLink = screen.getByText('Home').closest('a');
    const pollsLink = screen.getByText('Votações').closest('a');
    const adminLink = screen.getByText('Admin').closest('a');
    
    expect(homeLink.className).not.toContain('active');
    expect(pollsLink.className).not.toContain('active');
    expect(adminLink.className).toContain('active');
  });

  test('contains all required navigation items', () => {
    render(<Header />);
    
    const navItems = screen.getAllByRole('listitem');
    
    expect(navItems).toHaveLength(3);
  });

  test('all links have the correct hrefs', () => {
    render(<Header />);
    
    const homeLink = screen.getByText('Home').closest('a');
    const pollsLink = screen.getByText('Votações').closest('a');
    const adminLink = screen.getByText('Admin').closest('a');
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(pollsLink).toHaveAttribute('href', '/polls');
    expect(adminLink).toHaveAttribute('href', '/admin');
  });
});