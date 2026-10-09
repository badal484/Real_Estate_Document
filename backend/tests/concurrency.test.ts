import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { PrismaClient } from '@prisma/client';

const app = createApp();
const prisma = new PrismaClient();

describe('Phase 34 Concurrency & Race Condition Safeguards', () => {
  const testEmail = `concurrent.buyer.${Date.now()}@example.com`;
  const webhookEventId = `evt-concurrent-10-${Date.now()}`;
  let org: any;
  let token: string;
  let deal: any;
  let task: any;

  beforeAll(async () => {
    process.env.WEBHOOK_SECRET = '';
    org = await prisma.organization.create({ data: { name: 'Concurrency Test Org' } });
    const jwtSecret = process.env['JWT_SECRET'] || 'development-fallback-secret-2026';
    token = jwt.sign({ id: 'user-conc', email: 'conc@test.com', organizationId: org.id }, jwtSecret);

    deal = await prisma.deal.create({
      data: {
        organizationId: org.id,
        propertyAddress: '333 Concurrent St',
        buyerName: 'Concurrent Buyer',
        status: 'ACTIVE',
      },
    });

    task = await prisma.transactionTask.create({
      data: {
        dealId: deal.id,
        organizationId: org.id,
        title: 'Concurrent Task',
        status: 'PENDING',
        dueDate: new Date(),
      },
    });
  });

  afterAll(async () => {
    await prisma.transactionTask.deleteMany({ where: { organizationId: org.id } });
    await prisma.deal.deleteMany({ where: { organizationId: org.id } });
    await prisma.organization.delete({ where: { id: org.id } });
    await prisma.lead.deleteMany({ where: { email: testEmail } });
    await prisma.webhookEvent.deleteMany({ where: { externalEventId: webhookEventId } });
    await prisma.$disconnect();
  });

  it('1. 5 simultaneous inbound lead requests result in exactly 1 lead record', async () => {
    const payload = {
      fullName: 'Concurrent Buyer Test',
      email: testEmail,
      enquiryText: 'Looking for a 2 bedroom condo under $600k',
      organizationId: org.id,
    };

    // Fire 5 concurrent requests simultaneously
    const responses = await Promise.all([
      request(app).post('/api/leads/inbound').send(payload),
      request(app).post('/api/leads/inbound').send(payload),
      request(app).post('/api/leads/inbound').send(payload),
      request(app).post('/api/leads/inbound').send(payload),
      request(app).post('/api/leads/inbound').send(payload),
    ]);

    responses.forEach((res) => {
      expect(res.status).toBe(201);
    });

    // Query DB for created leads matching testEmail
    const dbLeads = await prisma.lead.findMany({
      where: { email: testEmail },
    });

    expect(dbLeads.length).toBe(1);
  }, 15000);

  it('2. 10 simultaneous identical webhook deliveries result in exactly 1 persisted webhook event', async () => {
    const payload = {
      eventId: webhookEventId,
      fromName: '10x Webhook Test',
      from: '10x@example.com',
      body: 'Testing 10 simultaneous webhook arrivals',
    };

    const reqs = Array.from({ length: 10 }).map(() =>
      request(app).post('/api/inbound/email').send(payload)
    );

    const responses = await Promise.all(reqs);

    responses.forEach((res) => {
      expect([200, 202]).toContain(res.status);
    });

    const events = await prisma.webhookEvent.findMany({
      where: { externalEventId: webhookEventId },
    });

    expect(events.length).toBe(1);
  });

  it('3. Multiple simultaneous task status updates handle state mutation without corrupting data', async () => {
    const statuses = ['IN_PROGRESS', 'COMPLETED', 'PENDING', 'CANCELLED', 'IN_PROGRESS'];

    const reqs = statuses.map((status) =>
      request(app)
        .patch(`/api/deals/${deal.id}/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status })
    );

    const responses = await Promise.all(reqs);

    responses.forEach((res) => {
      expect(res.status).toBe(200);
    });

    const updatedTask = await prisma.transactionTask.findUnique({ where: { id: task.id } });
    expect(updatedTask).toBeDefined();
    expect(statuses).toContain(updatedTask?.status);
  });
});
