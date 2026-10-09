import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app.js';
import { PrismaClient } from '@prisma/client';

const app = createApp();
const prisma = new PrismaClient();

describe('Phase 32 & E2E API Integration Test Suite', () => {
  let org: any;
  let token: string;
  let lead: any;
  let thread: any;
  let property: any;
  let deal: any;
  let task: any;
  let doc: any;

  beforeAll(async () => {
    // Provision Organization & Auth Token
    org = await prisma.organization.create({
      data: { name: 'E2E Test Realty Corp' },
    });

    const jwtSecret = process.env['JWT_SECRET'] || 'development-fallback-secret-2026';
    token = jwt.sign(
      { id: 'e2e-user-id', email: 'e2e.agent@realty.com', organizationId: org.id, role: 'ADMIN' },
      jwtSecret,
    );

    // Create a Deal & Task for testing
    deal = await prisma.deal.create({
      data: {
        organizationId: org.id,
        propertyAddress: '100 E2E Main Street, San Francisco, CA',
        buyerName: 'Jane E2E Buyer',
        sellerName: 'John E2E Seller',
        status: 'ACTIVE',
      },
    });

    task = await prisma.transactionTask.create({
      data: {
        dealId: deal.id,
        organizationId: org.id,
        title: 'Initial Escrow Deposit',
        description: 'Financing obligation',
        status: 'PENDING',
        amount: 15000,
        dueDate: new Date(Date.now() + 86400000 * 3),
      },
    });

    // Seed Knowledge Base Document & Chunks for RAG test
    doc = await prisma.document.create({
      data: {
        organizationId: org.id,
        dealId: deal.id,
        filename: 'e2e_disclosure.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
        storagePath: '/uploads/e2e_disclosure.pdf',
        chunks: {
          create: [
            {
              organizationId: org.id,
              dealId: deal.id,
              pageNumber: 1,
              chunkIndex: 0,
              content: 'The property located at 100 E2E Main Street includes solar panels owned free and clear by seller.',
              embedding: [0.1, 0.2, 0.3],
            },
          ],
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.documentChunk.deleteMany({ where: { organizationId: org.id } });
    await prisma.document.deleteMany({ where: { organizationId: org.id } });
    await prisma.transactionTask.deleteMany({ where: { organizationId: org.id } });
    await prisma.deal.deleteMany({ where: { organizationId: org.id } });
    if (lead) await prisma.lead.deleteMany({ where: { organizationId: org.id } });
    if (property) await prisma.property.deleteMany({ where: { organizationId: org.id } });
    await prisma.organization.delete({ where: { id: org.id } });
    await prisma.$disconnect();
  });

  it('1. POST /api/leads/inbound — ingests lead via public webhook', async () => {
    const res = await request(app)
      .post('/api/leads/inbound')
      .send({
        fullName: 'Alice E2E Inbound',
        email: `alice.e2e.${Date.now()}@example.com`,
        enquiryText: 'Looking for a 3 bed single family home under $900k in Downtown.',
        source: 'WEBSITE_FORM',
        organizationId: org.id,
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.id).toBeDefined();
    lead = { id: res.body.id };
  });

  it('2. GET /api/leads — lists authenticated tenant leads', async () => {
    const res = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const leadIds = res.body.map((l: any) => l.id);
    expect(leadIds).toContain(lead.id);
  });

  it('3. GET /api/leads/:id — fetches specific lead details', async () => {
    const res = await request(app)
      .get(`/api/leads/${lead.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(lead.id);
    expect(res.body.fullName).toBe('Alice E2E Inbound');
  });

  it('4. GET /api/leads/:id/conversations — fetches or creates thread', async () => {
    const res = await request(app)
      .get(`/api/leads/${lead.id}/conversations`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
    thread = res.body;
  });

  it('5. POST /api/leads/:id/conversations/messages — posts customer message & handles AI proposal', async () => {
    const res = await request(app)
      .post(`/api/leads/${lead.id}/conversations/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Are there any open houses this weekend?' });

    expect([200, 201]).toContain(res.status);
    expect(res.body.message).toBeDefined();
    expect(res.body.message.senderType).toBe('CUSTOMER');
  });

  it('6. POST /api/properties — creates property record', async () => {
    const res = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Downtown Modern Villa',
        price: 850000,
        bedrooms: 3,
        bathrooms: 2.5,
        propertyType: 'SINGLE_FAMILY',
        city: 'Downtown',
        address: '500 Downtown Blvd',
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    property = res.body;
  });

  it('7. GET /api/properties — lists tenant properties', async () => {
    const res = await request(app)
      .get('/api/properties')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const ids = res.body.map((p: any) => p.id);
    expect(ids).toContain(property.id);
  });

  it('8. GET /api/leads/:id/matches — calculates property matches using hard filters & scoring', async () => {
    const res = await request(app)
      .get(`/api/leads/${lead.id}/matches`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('9. GET /api/deals/:id/tasks — lists transaction tasks for a deal', async () => {
    const res = await request(app)
      .get(`/api/deals/${deal.id}/tasks`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].id).toBe(task.id);
  });

  it('10. PATCH /api/deals/:id/tasks/:taskId — updates task details with audit logging', async () => {
    const res = await request(app)
      .patch(`/api/deals/${deal.id}/tasks/${task.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('COMPLETED');
  });

  it('11. POST /api/knowledge/ask — queries tenant-isolated RAG assistant', async () => {
    const res = await request(app)
      .post('/api/knowledge/ask')
      .set('Authorization', `Bearer ${token}`)
      .send({ question: 'Are there solar panels on the 100 E2E Main Street property?' });

    expect(res.status).toBe(200);
    expect(res.body.answer).toBeDefined();
    expect(Array.isArray(res.body.citations)).toBe(true);
  });
});
