import { randomBytes } from 'crypto';

export const generateVerificationToken = (): string => {
  // Generate a random 32-byte hex string
  return randomBytes(32).toString('hex');
}; 