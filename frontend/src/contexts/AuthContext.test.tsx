import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import axios from 'axios';
import { AuthProvider, useAuth } from './AuthContext';
import api from '../services/api';

vi.mock('axios');
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
}));

const TestComponent = () => {
  const { user, token, loading, login, logout, updateUser, refreshUser } = useAuth();

  if (loading) return <div data-testid="loading">Loading...</div>;

  return (
    <div>
      <span data-testid="user-name">{user ? user.name : 'No User'}</span>
      <span data-testid="token-val">{token || 'No Token'}</span>
      <button onClick={() => login('test-token', {
        id: '123',
        name: 'Logged User',
        email: 'test@example.com',
        carbonGoal: 300,
        greenCoins: 10,
        streak: 1,
        badges: []
      })} data-testid="login-btn">Login</button>
      <button onClick={logout} data-testid="logout-btn">Logout</button>
      <button onClick={() => updateUser({ name: 'Updated User Name' })} data-testid="update-btn">Update</button>
      <button onClick={refreshUser} data-testid="refresh-btn">Refresh</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should fallback to offline mock user if backend health check fails', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network error'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('Vixit (Offline)');
    expect(screen.getByTestId('token-val')).toHaveTextContent('dummy-jwt-token');
  });

  it('should logout and set empty user if backend is online but no storage is set', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: { status: 'healthy' } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('No User');
    expect(screen.getByTestId('token-val')).toHaveTextContent('No Token');
  });

  it('should login and set credentials in state and localStorage', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: { status: 'healthy' } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    const loginBtn = screen.getByTestId('login-btn');
    act(() => {
      loginBtn.click();
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('Logged User');
    expect(screen.getByTestId('token-val')).toHaveTextContent('test-token');
    expect(localStorage.getItem('token')).toBe('test-token');
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(
      expect.objectContaining({ name: 'Logged User' })
    );
  });

  it('should update user state and store changes in localStorage', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: { status: 'healthy' } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    // Login first
    act(() => {
      screen.getByTestId('login-btn').click();
    });

    // Update
    act(() => {
      screen.getByTestId('update-btn').click();
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('Updated User Name');
    expect(JSON.parse(localStorage.getItem('user')!).name).toBe('Updated User Name');
  });

  it('should refresh user from backend profile API', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: { status: 'healthy' } });
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        id: '123',
        name: 'Refreshed User Name',
        email: 'test@example.com',
        carbonGoal: 300,
        greenCoins: 100,
        streak: 2,
        badges: []
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    // Login first
    act(() => {
      screen.getByTestId('login-btn').click();
    });

    // Refresh
    await act(async () => {
      screen.getByTestId('refresh-btn').click();
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('Refreshed User Name');
    expect(JSON.parse(localStorage.getItem('user')!).greenCoins).toBe(100);
  });
});
