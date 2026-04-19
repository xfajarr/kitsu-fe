import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GoalsScreen } from './GoalsScreen';

const mocks = vi.hoisted(() => ({
  invalidateQueries: vi.fn().mockResolvedValue(undefined),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  sendTransaction: vi.fn(),
  useGoals: vi.fn(),
  usePublicGoals: vi.fn(),
  useCreateGoal: vi.fn(),
  useConfigureGoal: vi.fn(),
  useDepositGoal: vi.fn(),
  useClaimGoal: vi.fn(),
  useSyncGoal: vi.fn(),
  useUnwindGoal: vi.fn(),
  useUser: vi.fn(),
  useWallet: vi.fn(),
}));

vi.mock('@/hooks/queries', () => ({
  useGoals: () => mocks.useGoals(),
  usePublicGoals: () => mocks.usePublicGoals(),
  useCreateGoal: () => mocks.useCreateGoal(),
  useConfigureGoal: () => mocks.useConfigureGoal(),
  useDepositGoal: () => mocks.useDepositGoal(),
  useClaimGoal: () => mocks.useClaimGoal(),
  useSyncGoal: () => mocks.useSyncGoal(),
  useUnwindGoal: () => mocks.useUnwindGoal(),
  useUser: () => mocks.useUser(),
}));

vi.mock('@/hooks/useWallet', () => ({
  useWallet: () => mocks.useWallet(),
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }),
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

function createMutation<T>(result: T) {
  return {
    mutateAsync: vi.fn().mockResolvedValue(result),
    isPending: false,
  };
}

describe('GoalsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useUser.mockReturnValue({ data: { id: 'user-1' } });
    mocks.useWallet.mockReturnValue({ connected: true, address: 'wallet-1', sendTransaction: mocks.sendTransaction });
    mocks.useGoals.mockReturnValue({ data: [], isLoading: false });
    mocks.usePublicGoals.mockReturnValue({ data: [], isLoading: false });
    mocks.useCreateGoal.mockReturnValue(createMutation({
      goal: { id: 'goal-1' },
      txParams: { messages: [{ address: 'factory-1', amount: '100000000', payload: 'deploy-goal' }] },
      configureAfterDeploy: true,
    }));
    mocks.useConfigureGoal.mockReturnValue(createMutation({
      txParams: { messages: [{ address: 'goal-vault-1', amount: '50000000', payload: 'configure-goal' }] },
    }));
    mocks.useDepositGoal.mockReturnValue(createMutation({
      txParams: { messages: [{ address: 'goal-vault-1', amount: '10000000000', payload: 'deposit-goal' }] },
    }));
    mocks.useClaimGoal.mockReturnValue(createMutation({
      txParams: { messages: [{ address: 'goal-vault-1', amount: '50000000', payload: 'claim-goal' }] },
    }));
    mocks.useSyncGoal.mockReturnValue(createMutation({
      amount: '1.25000000',
      txParams: { messages: [{ address: 'goal-vault-1', amount: '50000000', payload: 'sync-goal' }] },
    }));
    mocks.useUnwindGoal.mockReturnValue(createMutation({
      amount: '5.00000000',
      txParams: { messages: [{ address: 'goal-vault-1', amount: '50000000', payload: 'unwind-goal' }] },
    }));
    mocks.sendTransaction.mockResolvedValue({ boc: 'signed-boc' });
  });

  it('creates a goal via factory deployment then runs post-deploy configuration', async () => {
    render(<GoalsScreen />);

    fireEvent.click(screen.getByRole('button', { name: /new/i }));
    fireEvent.change(screen.getByPlaceholderText('e.g. New Laptop'), { target: { value: 'Emergency Fund' } });
    fireEvent.click(screen.getByRole('button', { name: /create goal \(100 ton\)/i }));

    await waitFor(() => {
      expect(mocks.sendTransaction).toHaveBeenNthCalledWith(1, {
        validUntil: expect.any(Number),
        messages: [{ address: 'factory-1', amount: '100000000', payload: 'deploy-goal' }],
      });
      expect(mocks.sendTransaction).toHaveBeenNthCalledWith(2, {
        validUntil: expect.any(Number),
        messages: [{ address: 'goal-vault-1', amount: '50000000', payload: 'configure-goal' }],
      });
    });
  });

  it('lets users deposit into a public goal from Explore tab', async () => {
    mocks.usePublicGoals.mockReturnValue({
      data: [
        {
          id: 'goal-2',
          userId: 'user-2',
          title: 'Public Vacation',
          description: null,
          emoji: '🏖️',
          visibility: 'public',
          strategy: 'tonstakers',
          contractAddress: 'goal-vault-2',
          targetTon: '20.00000000',
          currentTon: '5.00000000',
          currentUsd: '25.00',
          targetUsd: '100.00',
          principalTon: '4.00000000',
          yieldTon: '1.00000000',
          canClaim: false,
          dueDate: null,
          isArchived: false,
          createdAt: '2026-04-20T00:00:00.000Z',
        },
      ],
      isLoading: false,
    });

    const depositGoal = createMutation({
      txParams: { messages: [{ address: 'goal-vault-2', amount: '10000000000', payload: 'deposit-goal' }] },
    });
    mocks.useDepositGoal.mockReturnValue(depositGoal);

    render(<GoalsScreen />);

    fireEvent.click(screen.getByRole('button', { name: /explore/i }));
    fireEvent.click(screen.getByText('Public Vacation'));
    fireEvent.click(screen.getByRole('button', { name: /deposit 10 ton/i }));

    await waitFor(() => {
      expect(depositGoal.mutateAsync).toHaveBeenCalledWith({ id: 'goal-2', amountTon: '10.00000000' });
      expect(mocks.sendTransaction).toHaveBeenCalledWith({
        validUntil: expect.any(Number),
        messages: [{ address: 'goal-vault-2', amount: '10000000000', payload: 'deposit-goal' }],
      });
    });
  });

  it('shows owner sync and unstake actions for TonStakers goals', async () => {
    const syncGoal = createMutation({
      amount: '1.25000000',
      txParams: { messages: [{ address: 'goal-vault-1', amount: '50000000', payload: 'sync-goal' }] },
    });
    mocks.useSyncGoal.mockReturnValue(syncGoal);

    mocks.useGoals.mockReturnValue({
      data: [
        {
          id: 'goal-1',
          userId: 'user-1',
          title: 'Emergency Fund',
          description: null,
          emoji: '🎯',
          visibility: 'public',
          strategy: 'tonstakers',
          contractAddress: 'goal-vault-1',
          targetTon: '20.00000000',
          currentTon: '12.00000000',
          currentUsd: '60.00',
          targetUsd: '100.00',
          principalTon: '10.00000000',
          yieldTon: '2.00000000',
          syncYieldTon: '1.25000000',
          tsTonBalance: '10.00000000',
          canUnwind: true,
          canClaim: false,
          dueDate: null,
          isArchived: false,
          createdAt: '2026-04-20T00:00:00.000Z',
        },
      ],
      isLoading: false,
    });

    render(<GoalsScreen />);

    fireEvent.click(screen.getByText('Emergency Fund'));
    fireEvent.click(screen.getByText(/sync yield/i));

    await waitFor(() => {
      expect(syncGoal.mutateAsync).toHaveBeenCalledWith('goal-1');
      expect(mocks.sendTransaction).toHaveBeenCalledWith({
        validUntil: expect.any(Number),
        messages: [{ address: 'goal-vault-1', amount: '50000000', payload: 'sync-goal' }],
      });
    });
  });
});
