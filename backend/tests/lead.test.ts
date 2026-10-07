import { normalizeEmail, normalizePhone, calculateLeadPriority } from '../src/services/lead.service.js';

describe('Lead Service Helpers', () => {
  describe('normalizeEmail', () => {
    it('normalizes uppercase and whitespace in email', () => {
      expect(normalizeEmail('  JOHN.DOE@Example.com  ')).toBe('john.doe@example.com');
    });

    it('returns null for invalid email string', () => {
      expect(normalizeEmail('invalid-email')).toBeNull();
      expect(normalizeEmail(null)).toBeNull();
    });
  });

  describe('normalizePhone', () => {
    it('strips non-digit characters from phone number', () => {
      expect(normalizePhone('+1 (555) 019-2831')).toBe('15550192831');
    });

    it('returns null for short phone number', () => {
      expect(normalizePhone('123')).toBeNull();
      expect(normalizePhone(null)).toBeNull();
    });
  });

  describe('calculateLeadPriority', () => {
    it('calculates URGENT priority for immediate timeline', () => {
      const priority = calculateLeadPriority({ possessionTimeline: '30_DAYS', maxBudget: 500000 });
      expect(priority).toBe('URGENT');
    });

    it('calculates HIGH priority for high budget', () => {
      const priority = calculateLeadPriority({ possessionTimeline: '90_DAYS', maxBudget: 850000 });
      expect(priority).toBe('HIGH');
    });

    it('calculates MEDIUM priority when phone or budget is present', () => {
      const priority = calculateLeadPriority({ hasPhone: true });
      expect(priority).toBe('MEDIUM');
    });

    it('defaults to LOW priority when no urgency triggers', () => {
      const priority = calculateLeadPriority({});
      expect(priority).toBe('LOW');
    });
  });
});
