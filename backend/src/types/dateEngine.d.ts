/**
 * Type declarations for the shared dateEngine.js at the project root.
 * This allows TypeScript (NodeNext module resolution) to type-check the import
 * in dateEngine.service.ts without copying the implementation.
 */
declare module '../../dateEngine.js' {
  export function computeDeadline(
    startDate: Date,
    numberOfDays: number,
    dayType: 'calendar' | 'business',
    country?: string,
    state?: string,
  ): Date;
}
