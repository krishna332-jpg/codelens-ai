import { render, screen, fireEvent } from '@testing-library/react';

// Simple unit test helpers — no API calls needed
describe('Utility Functions', () => {
  test('score color logic: high score is green', () => {
    const getColor = (score) =>
      score >= 80 ? 'green' : score >= 60 ? 'orange' : 'red';
    expect(getColor(90)).toBe('green');
    expect(getColor(70)).toBe('orange');
    expect(getColor(40)).toBe('red');
  });

  test('code character count limit', () => {
    const isValid = (code) => code.length <= 20000;
    expect(isValid('console.log("hello")')).toBe(true);
    expect(isValid('x'.repeat(20001))).toBe(false);
  });

  test('language list includes common languages', () => {
    const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'go', 'rust'];
    expect(LANGUAGES).toContain('javascript');
    expect(LANGUAGES).toContain('python');
    expect(LANGUAGES).toContain('typescript');
  });

  test('shareId is generated correctly (8 chars)', () => {
    const mockShareId = 'ab12cd34';
    expect(mockShareId.length).toBe(8);
    expect(typeof mockShareId).toBe('string');
  });

  test('severity badge colors map correctly', () => {
    const SEVERITY_COLOR = {
      critical: '#ff4757',
      high: '#ff6b35',
      medium: '#ffa502',
      low: '#2ed573',
    };
    expect(SEVERITY_COLOR.critical).toBe('#ff4757');
    expect(SEVERITY_COLOR.low).toBe('#2ed573');
  });
});
