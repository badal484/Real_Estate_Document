import { computeMatchesForLead, createProperty } from '../src/services/propertyMatch.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Property Match Service', () => {
  let testLeadId: string;
  let prop1Id: string;
  let prop2Id: string;

  beforeAll(async () => {
    // 1. Create test lead with budget ceiling of $700,000 and 3 min bedrooms
    const lead = await prisma.lead.create({
      data: {
        fullName: 'Match Test Buyer',
        email: `match.buyer.${Date.now()}@example.com`,
        status: 'NEW',
        priority: 'HIGH',
        requirements: {
          create: {
            minBudget: 400000,
            maxBudget: 700000,
            preferredLocations: ['Downtown', 'Westside'],
            propertyType: 'CONDO',
            minBedrooms: 3,
            maxBedrooms: 4,
          },
        },
      },
    });
    testLeadId = lead.id;

    // 2. Create qualifying property (Under budget, 3 beds, Downtown)
    const prop1 = await createProperty({
      title: 'Modern Downtown Penthouse',
      address: '100 Main St',
      city: 'Downtown',
      price: 650000,
      bedrooms: 3,
      bathrooms: 2,
      propertyType: 'CONDO',
      status: 'AVAILABLE',
    });
    prop1Id = prop1.id;

    // 3. Create non-qualifying property (Over budget - $850,000)
    const prop2 = await createProperty({
      title: 'Luxury Mansion',
      address: '500 Hilltop Rd',
      city: 'Downtown',
      price: 850000,
      bedrooms: 4,
      bathrooms: 4,
      propertyType: 'CONDO',
      status: 'AVAILABLE',
    });
    prop2Id = prop2.id;
  });

  afterAll(async () => {
    if (testLeadId) await prisma.lead.delete({ where: { id: testLeadId } }).catch(() => {});
    if (prop1Id) await prisma.property.delete({ where: { id: prop1Id } }).catch(() => {});
    if (prop2Id) await prisma.property.delete({ where: { id: prop2Id } }).catch(() => {});
  });

  it('filters out properties that violate hard budget ceilings', async () => {
    const matches = await computeMatchesForLead(testLeadId);

    // Over budget property (prop2: $850k) MUST be excluded by SQL hard filter!
    const matchedPropIds = matches.map((m) => m.property.id);
    expect(matchedPropIds).toContain(prop1Id);
    expect(matchedPropIds).not.toContain(prop2Id);
  });

  it('computes match scores and provides explicit match explanations', async () => {
    const matches = await computeMatchesForLead(testLeadId);
    const topMatch = matches.find((m) => m.property.id === prop1Id);

    expect(topMatch).toBeDefined();
    expect(topMatch?.matchScore).toBeGreaterThan(0.7);
    expect(topMatch?.matchReason).toContain('Price ($650,000) is within maximum budget ceiling');
    expect(topMatch?.matchReason).toContain('Located in preferred area (Downtown)');
  });
});
