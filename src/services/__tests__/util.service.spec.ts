import { describe, it, expect } from 'vitest';
import { UtilService } from '../util.service';

describe('UtilService', () => {
  it('should generate a unique id of default length 32', () => {
    const id = UtilService.uniqueId();
    expect(id).toBeDefined();
    expect(id.length).toBe(32);
  });

  it('should generate a unique id of specified length', () => {
    const id = UtilService.uniqueId(10);
    expect(id).toBeDefined();
    expect(id.length).toBe(10);
  });

  it('should calculate time spent correctly with single digit seconds', () => {
    const startTime = new Date().getTime() - 65000; // 1 min 5 secs
    const timeSpent = UtilService.getTimeSpentText(startTime);
    expect(timeSpent).toBe('1:05');
  });

  it('should calculate time spent correctly with double digit seconds', () => {
    const startTime = new Date().getTime() - 75000; // 1 min 15 secs
    const timeSpent = UtilService.getTimeSpentText(startTime);
    expect(timeSpent).toBe('1:15');
  });
});
