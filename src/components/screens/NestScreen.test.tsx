import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NestScreen } from './NestScreen';

const mocks = vi.hoisted(() => ({
  invalidateQueries: vi.fn().mockResolvedValue(undefined),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  sendTransaction: vi.fn(),
  useDens: vi.fn(),
  useMyDens: vi.fn(),
  useJoinDen: vi.fn(),
  useConfirmJoinDen: vi.fn(),
  useLeaveDen: vi.fn(),
  useCreateDen: vi.fn(),
  useUser: vi.fn(),
  useWallet: vi.fn(),
}));

vi.mock('@/hooks/queries', () => ({
  useDens: () => mocks.useDens(),
  useMyDens: () => mocks.useMyDens(),
  useJoinDen: () => mocks.useJoinDen(),
  useConfirmJoinDen: () => mocks.useConfirmJoinDen(),
  useLeaveDen: () => mocks.useLeaveDen(),
  useCreateDen: () => mocks.useCreateDen(),
  useUser: () => mocks.useUser(),
}));

vi.mock('@/hooks/useWallet', () => ({
  useWallet: () => mocks.useWallet(),
}));

vi.mock('@/App', () => ({
  queryClient: {
    invalidateQueries: mocks.invalidateQueries,
  },
}));

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

describe('NestScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useUser.mockReturnValue({
      data: { id: 'admin-user', isAdmin: true },
    });
    mocks.useWallet.mockReturnValue({
      connected: true,
      address: 'wallet-1',
      sendTransaction: mocks.sendTransaction,
    });
    mocks.useDens.mockReturnValue({ data: [], isLoading: false });
    mocks.useMyDens.mockReturnValue({ data: [], isLoading: false });
    mocks.useJoinDen.mockReturnValue(createMutation({
      deposit: {
        confirmationToken: 'token-1',
        txParams: { messages: [{ address: 'vault-1', amount: '25000000000', payload: 'deposit-payload' }] },
      },
    }));
    mocks.useConfirmJoinDen.mockReturnValue(createMutation({ ok: true }));
    mocks.useLeaveDen.mockReturnValue(createMutation({
      txParams: { messages: [{ address: 'vault-1', amount: '50000000', payload: 'withdraw-payload' }] },
    }));
    mocks.useCreateDen.mockReturnValue(createMutation({
      txParams: {
        messages: [
          { address: 'vault-1', amount: '100000000', stateInit: 'state-init' },
          { address: 'vault-1', amount: '50000000', payload: 'configure-payload' },
        ],
      },
    }));
    mocks.sendTransaction.mockResolvedValue({ boc: 'signed-boc' });
  });

  it('sends deploy plus configure messages when admin creates a Nest', async () => {
    render(<NestScreen />);

    fireEvent.click(screen.getByRole('button', { name: /create nest/i }));
    fireEvent.change(screen.getByPlaceholderText('e.g. Kitsu Core Vault'), {
      target: { value: 'Kitsu Core Nest' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: /create nest/i })[1]);

    await waitFor(() => {
      expect(mocks.sendTransaction).toHaveBeenCalledWith({
        validUntil: expect.any(Number),
        messages: [
          { address: 'vault-1', amount: '100000000', stateInit: 'state-init' },
          { address: 'vault-1', amount: '50000000', payload: 'configure-payload' },
        ],
      });
    });
  });

  it('prepares deposit, submits wallet tx, confirms backend, and shows yield', async () => {
    mocks.useDens.mockReturnValue({
      data: [
        {
          id: 'den-1',
          ownerId: 'owner-1',
          name: 'Alpha Nest',
          emoji: '🏠',
          isPublic: true,
          strategy: 'steady',
          contractAddress: 'vault-1',
          apr: '4.80',
          totalDeposited: '10.00000000',
          vaultValueTon: '12.50000000',
          totalYieldTon: '2.50000000',
          memberCount: 3,
          createdAt: '2026-04-20T00:00:00.000Z',
          myDepositTon: '5.00000000',
          myCurrentTon: '6.50000000',
          myYieldTon: '1.50000000',
          canWithdraw: true,
        },
      ],
      isLoading: false,
    });

    const joinDen = createMutation({
      deposit: {
        confirmationToken: 'token-1',
        txParams: { messages: [{ address: 'vault-1', amount: '25000000000', payload: 'deposit-payload' }] },
      },
    });
    const confirmJoinDen = createMutation({ ok: true });
    mocks.useJoinDen.mockReturnValue(joinDen);
    mocks.useConfirmJoinDen.mockReturnValue(confirmJoinDen);

    render(<NestScreen />);

    expect(screen.getByText(/vault yield \+2.50 ton/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Alpha Nest'));
    fireEvent.click(screen.getByRole('button', { name: /save 25 ton/i }));

    await waitFor(() => {
      expect(joinDen.mutateAsync).toHaveBeenCalledWith({
        denId: 'den-1',
        amountTon: '25.00000000',
      });
      expect(mocks.sendTransaction).toHaveBeenCalledWith({
        validUntil: expect.any(Number),
        messages: [{ address: 'vault-1', amount: '25000000000', payload: 'deposit-payload' }],
      });
      expect(confirmJoinDen.mutateAsync).toHaveBeenCalledWith({
        denId: 'den-1',
        confirmationToken: 'token-1',
        txBoc: 'signed-boc',
      });
    });

    expect(mocks.invalidateQueries).toHaveBeenCalledTimes(3);
    expect(mocks.toastSuccess).toHaveBeenCalled();
  });

  it('withdraws using backend-built tx params from My Nest tab', async () => {
    mocks.useMyDens.mockReturnValue({
      data: [
        {
          id: 'den-1',
          ownerId: 'owner-1',
          name: 'Alpha Nest',
          emoji: '🏠',
          isPublic: true,
          strategy: 'steady',
          contractAddress: 'vault-1',
          apr: '4.80',
          totalDeposited: '10.00000000',
          vaultValueTon: '12.50000000',
          totalYieldTon: '2.50000000',
          memberCount: 3,
          createdAt: '2026-04-20T00:00:00.000Z',
          myDepositTon: '5.00000000',
          myCurrentTon: '6.50000000',
          myYieldTon: '1.50000000',
          mySharesTon: '5.00000000',
          canWithdraw: true,
        },
      ],
      isLoading: false,
    });

    const leaveDen = createMutation({
      txParams: { messages: [{ address: 'vault-1', amount: '50000000', payload: 'withdraw-payload' }] },
    });
    mocks.useLeaveDen.mockReturnValue(leaveDen);

    render(<NestScreen />);

    fireEvent.click(screen.getByRole('button', { name: /my nest/i }));
    expect(screen.getByText(/yield \+1.50 ton/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Alpha Nest'));
    fireEvent.click(screen.getByRole('button', { name: /withdraw 6.50 ton/i }));

    await waitFor(() => {
      expect(leaveDen.mutateAsync).toHaveBeenCalledWith('den-1');
      expect(mocks.sendTransaction).toHaveBeenCalledWith({
        validUntil: expect.any(Number),
        messages: [{ address: 'vault-1', amount: '50000000', payload: 'withdraw-payload' }],
      });
    });

    expect(mocks.invalidateQueries).toHaveBeenCalledTimes(3);
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Withdraw request sent');
  });
});
