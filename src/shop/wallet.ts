/**
 * Wrapper for the onchainos CLI wallet commands.
 * Handles exit code 2 (confirming response) pattern.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface WalletStatus {
  loggedIn: boolean;
  address: string | null;
  error: string | null;
}

export interface PaymentResult {
  success: boolean;
  txHash: string | null;
  message: string;
  needsConfirmation: boolean;
  confirmationText: string | null;
}

/** Check if the user is logged into onchainos wallet. */
export async function checkWalletStatus(): Promise<WalletStatus> {
  try {
    const { stdout } = await execFileAsync('onchainos', ['wallet', 'status'], { timeout: 15000 });
    const data = JSON.parse(stdout);
    const loggedIn = data.loggedIn === true || data.status === 'logged_in';
    const address = data.evmAddress || data.address || null;
    return { loggedIn, address, error: null };
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      return { loggedIn: false, address: null, error: 'onchainos CLI not found. Please install it first.' };
    }
    // Try to parse stdout from error
    const execErr = err as { stdout?: string; stderr?: string };
    if (execErr.stdout) {
      try {
        const data = JSON.parse(execErr.stdout);
        return { loggedIn: false, address: null, error: data.message || 'Not logged in' };
      } catch { /* ignore parse error */ }
    }
    return { loggedIn: false, address: null, error: execErr.stderr || (err instanceof Error ? err.message : 'Unknown error') };
  }
}

/**
 * Send a payment via onchainos wallet send.
 * Handles exit code 2 (confirming response) by returning needsConfirmation.
 */
export async function sendPayment(
  amount: string,
  recipient: string,
  chain: string,
  tokenContract?: string,
  force?: boolean,
): Promise<PaymentResult> {
  const args = [
    'wallet', 'send',
    '--readable-amount', amount,
    '--recipient', recipient,
    '--chain', chain,
  ];
  if (tokenContract) {
    args.push('--contract-token', tokenContract);
  }
  if (force) {
    args.push('--force');
  }

  try {
    const { stdout } = await execFileAsync('onchainos', args, { timeout: 30000 });
    const data = JSON.parse(stdout);

    if (data.txHash || data.orderId) {
      return {
        success: true,
        txHash: data.txHash || data.orderId,
        message: data.message || 'Payment sent successfully!',
        needsConfirmation: false,
        confirmationText: null,
      };
    }

    return {
      success: true,
      txHash: null,
      message: data.message || 'Payment completed.',
      needsConfirmation: false,
      confirmationText: null,
    };
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      return {
        success: false,
        txHash: null,
        message: 'onchainos CLI not found. Please install it first.',
        needsConfirmation: false,
        confirmationText: null,
      };
    }

    const execErr = err as { code?: number; stdout?: string; stderr?: string };

    // Exit code 2 = confirming response
    if (execErr.code === 2 && execErr.stdout) {
      try {
        const data = JSON.parse(execErr.stdout);
        if (data.confirming) {
          return {
            success: false,
            txHash: null,
            message: data.message || 'Confirmation required.',
            needsConfirmation: true,
            confirmationText: execErr.stdout,
          };
        }
      } catch { /* fall through */ }
      return {
        success: false,
        txHash: null,
        message: 'Confirmation required.',
        needsConfirmation: true,
        confirmationText: execErr.stdout,
      };
    }

    // Parse error from stdout or stderr
    let errorMsg = 'Payment failed.';
    if (execErr.stdout) {
      try {
        const data = JSON.parse(execErr.stdout);
        errorMsg = data.message || data.error || errorMsg;
      } catch {
        errorMsg = execErr.stdout;
      }
    } else if (execErr.stderr) {
      errorMsg = execErr.stderr;
    } else if (err instanceof Error) {
      errorMsg = err.message;
    }

    return {
      success: false,
      txHash: null,
      message: errorMsg,
      needsConfirmation: false,
      confirmationText: null,
    };
  }
}
