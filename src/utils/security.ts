/**
 * PROBAHO CRM Security & Cryptographic Password Policy Engine
 * 
 * Enforces strict enterprise-grade security rules for root Master Accounts:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one numerical digit (0-9)
 * - At least one special character (!@#$%^&*...)
 * 
 * Provides flexible showroom PIN / password policies for Staff accounts as configured by Master.
 */

export interface PasswordValidationResult {
  isValid: boolean;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  score: number; // 0 - 5
  strengthLabel: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  strengthColor: string;
  errors: string[];
}

export function validateMasterPassword(password: string): PasswordValidationResult {
  const p = password || '';
  const hasMinLength = p.length >= 8;
  const hasUppercase = /[A-Z]/.test(p);
  const hasLowercase = /[a-z]/.test(p);
  const hasNumber = /[0-9]/.test(p);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(p);

  const errors: string[] = [];
  if (!hasMinLength) errors.push('Minimum 8 characters required');
  if (!hasUppercase) errors.push('At least one uppercase letter (A-Z) required');
  if (!hasLowercase) errors.push('At least one lowercase letter (a-z) required');
  if (!hasNumber) errors.push('At least one number (0-9) required');
  if (!hasSpecial) errors.push('At least one special character (!@#$%...) required');

  let score = 0;
  if (hasMinLength) score++;
  if (hasUppercase) score++;
  if (hasLowercase) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  let strengthLabel: PasswordValidationResult['strengthLabel'] = 'Very Weak';
  let strengthColor = '#EF4444'; // Red

  if (score === 5) {
    strengthLabel = 'Very Strong';
    strengthColor = '#10B981'; // Green
  } else if (score === 4) {
    strengthLabel = 'Strong';
    strengthColor = '#6366F1'; // Indigo
  } else if (score === 3) {
    strengthLabel = 'Medium';
    strengthColor = '#F59E0B'; // Amber
  } else if (score === 2) {
    strengthLabel = 'Weak';
    strengthColor = '#FB923C'; // Orange
  }

  return {
    isValid: score === 5,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
    score,
    strengthLabel,
    strengthColor,
    errors
  };
}

export function validateStaffPassword(password: string): { isValid: boolean; message?: string } {
  const p = (password || '').trim();
  if (p.length < 4) {
    return {
      isValid: false,
      message: 'Staff password or PIN must be at least 4 characters long.'
    };
  }
  return { isValid: true };
}
