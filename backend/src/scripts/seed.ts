import bcrypt from 'bcryptjs';
import { prisma } from '../database/db';
import { ragEngine } from '../rag/ragEngine';

async function seed() {
  console.log('🌱 Starting Enterprise Seed Process for FinOps Assistant...');

  // Clear existing records
  await prisma.systemEvent.deleteMany();
  await prisma.approvalHistory.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.fraudCase.deleteMany();
  await prisma.ticketMessage.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.transactions.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.embedding.deleteMany();
  await prisma.document.deleteMany();
  await prisma.knowledgeBase.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.aIResponse.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('admin123', 10);

  // 1. Create Enterprise Users
  console.log('👤 Seeding Enterprise Users & Roles...');
  const userAdmin = await prisma.user.create({
    data: {
      email: 'alex.finops@enterprise.com',
      passwordHash,
      name: 'Alex Vance',
      role: 'ADMIN',
      department: 'Executive Operations',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const userManager = await prisma.user.create({
    data: {
      email: 'sarah.manager@enterprise.com',
      passwordHash,
      name: 'Sarah Connor',
      role: 'MANAGER',
      department: 'Financial Ops Governance',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  const userFraudAnalyst = await prisma.user.create({
    data: {
      email: 'david.fraud@enterprise.com',
      passwordHash,
      name: 'David Miller',
      role: 'FRAUD_ANALYST',
      department: 'Risk Management',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const userCompliance = await prisma.user.create({
    data: {
      email: 'elena.compliance@enterprise.com',
      passwordHash,
      name: 'Elena Rostova',
      role: 'COMPLIANCE_OFFICER',
      department: 'Regulatory Compliance',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    },
  });

  // 2. Create Enterprise Customers
  console.log('🏢 Seeding Customer Profiles (CRM)...');
  const customer1 = await prisma.customer.create({
    data: {
      customerCode: 'CUST-8910',
      name: 'Acme Corp (John Doe)',
      email: 'john.doe@acme.com',
      phone: '+1-555-0192',
      tier: 'VIP',
      riskScore: 12.5,
      accountStatus: 'ACTIVE',
      totalSpent: 48900.0,
      kycStatus: 'VERIFIED',
      country: 'US',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      customerCode: 'CUST-4421',
      name: 'Michael Scott Paper Co',
      email: 'm.scott@dundermifflin.com',
      phone: '+1-555-0144',
      tier: 'HIGH_RISK',
      riskScore: 84.0,
      accountStatus: 'UNDER_REVIEW',
      totalSpent: 1240.0,
      kycStatus: 'PENDING_DOCS',
      country: 'NG',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      customerCode: 'CUST-9920',
      name: 'Stark Industries',
      email: 'tony@stark.com',
      phone: '+1-555-0800',
      tier: 'CORPORATE',
      riskScore: 5.0,
      accountStatus: 'ACTIVE',
      totalSpent: 245000.0,
      kycStatus: 'VERIFIED',
      country: 'US',
    },
  });

  // 3. Transactions
  console.log('💳 Seeding Transactions & Payment Gateway Records...');
  const tx1 = await prisma.transactions.create({
    data: {
      txCode: 'TXN-88192',
      customerId: customer1.id,
      amount: 750.0,
      currency: 'USD',
      status: 'COMPLETED',
      paymentMethod: 'CREDIT_CARD',
      merchant: 'AWS Cloud Services',
      location: 'New York, US',
      ipAddress: '192.168.1.45',
      deviceId: 'macbook_pro_m2_99',
      riskScore: 15.0,
    },
  });

  const tx2 = await prisma.transactions.create({
    data: {
      txCode: 'TXN-99120',
      customerId: customer2.id,
      amount: 1850.0,
      currency: 'USD',
      status: 'PENDING',
      paymentMethod: 'WIRE',
      merchant: 'FinOps Direct API',
      location: 'Lagos, Nigeria (Proxy)',
      ipAddress: '41.203.65.12',
      deviceId: 'linux_botnet_instance',
      riskScore: 88.0,
    },
  });

  const tx3 = await prisma.transactions.create({
    data: {
      txCode: 'TXN-10044',
      customerId: customer3.id,
      amount: 240.0,
      currency: 'USD',
      status: 'SETTLED',
      paymentMethod: 'APPLE_PAY',
      merchant: 'Stark Cloud Hub',
      location: 'Los Angeles, US',
      ipAddress: '66.249.79.1',
      deviceId: 'iphone_15_pro_max',
      riskScore: 4.0,
    },
  });

  // 4. Fraud Cases
  console.log('🛡️ Seeding Fraud Detection Engine Cases...');
  await prisma.fraudCase.create({
    data: {
      caseCode: 'FRD-5011',
      customerId: customer2.id,
      transactionId: tx2.id,
      riskLevel: 'CRITICAL',
      riskScore: 88.0,
      triggerReason: 'High Velocity Wire Attempt via Tor Proxy + Unrecognized Device Fingerprint',
      geoData: JSON.stringify({ country: 'Nigeria', city: 'Lagos', ip: '41.203.65.12', proxy: true }),
      deviceData: JSON.stringify({ browser: 'HeadlessChrome', os: 'Linux', fingerprint: 'bot_0912' }),
      velocityScore: 92.0,
      status: 'OPEN',
      assignedTo: userFraudAnalyst.name,
    },
  });

  // 5. Compliance & Policy Documents for RAG Engine
  console.log('📚 Indexing Compliance Policies & RAG Knowledge Base...');
  const doc1 = await prisma.document.create({
    data: {
      docCode: 'SOP-REF-01',
      title: 'Standard Operating Procedure: Refund Approvals & Limits',
      category: 'REFUND_POLICY',
      content: 'Under Enterprise Policy SOP-REF-01, refunds under $500 USD with a customer risk score below 35 are eligible for instant autonomous processing by AI Agents. Refunds exceeding $500 USD require explicit Human-in-the-Loop approval by a Financial Operations Manager or VP. Refunds for accounts in HIGH_RISK tier mandate full compliance review regardless of transaction amount.',
      tags: 'refund,policy,approval,limits',
    },
  });

  const doc2 = await prisma.document.create({
    data: {
      docCode: 'RBI-FIN-2024',
      title: 'RBI Regulatory Guideline: Cross-Border & Fraud Holds',
      category: 'RBI_COMPLIANCE',
      content: 'Reserve Bank & Global Financial Directives mandate immediate transaction hold and defensive account restriction upon detecting velocity spikes exceeding 3 high-value wire transfers within 60 seconds from an unverified IP range. Fraud Engine risk scores >80 mandate identity re-verification prior to fund settlement.',
      tags: 'rbi,compliance,fraud,velocity,proxy',
    },
  });

  // Index Documents into Vector Store
  await ragEngine.indexDocument(doc1.id, doc1.title, doc1.category, doc1.content);
  await ragEngine.indexDocument(doc2.id, doc2.title, doc2.category, doc2.content);

  // 6. Tickets & Initial Messages
  console.log('🎟️ Seeding Support Tickets...');
  const ticket1 = await prisma.ticket.create({
    data: {
      ticketCode: 'TCK-1001',
      customerId: customer1.id,
      subject: 'Dispute Duplicate Subscription Charge ($750.00)',
      description: 'Hi Support, I noticed my account was charged $750.00 twice on transaction TXN-88192. Please investigate and issue a refund for the duplicate charge.',
      priority: 'HIGH',
      category: 'REFUND_REQUEST',
      status: 'OPEN',
      urgencyScore: 78.0,
      assignedAgent: 'Supervisor AI Agent',
      messages: {
        create: [
          {
            senderType: 'CUSTOMER',
            senderName: customer1.name,
            message: 'Hi Support, I noticed my account was charged $750.00 twice on transaction TXN-88192. Please investigate and issue a refund for the duplicate charge.',
          },
        ],
      },
    },
  });

  // 7. Approvals
  console.log('⚡ Seeding Human-in-the-Loop Approvals...');
  const approval1 = await prisma.approval.create({
    data: {
      approvalCode: 'APP-70291',
      title: 'Refund Authorization for Ticket TCK-1001 ($750.00)',
      type: 'HIGH_VALUE_REFUND',
      targetId: tx1.id,
      requesterId: userAdmin.id,
      amount: 750.0,
      riskScore: 15.0,
      policyTriggered: 'SOP-REF-01: Amount exceeds $500 auto-approval ceiling',
      status: 'PENDING',
      requiredRole: 'MANAGER',
      aiRecommendation: JSON.stringify({
        actionRecommended: 'PROCESS_REFUND',
        confidence: 0.96,
        reason: 'Customer is VIP tier with zero fraud flags. Transaction is verified genuine.',
      }),
    },
  });

  // 8. Immutable Audit Logs
  console.log('🔐 Seeding Cryptographic Audit Logs...');
  await prisma.auditLog.create({
    data: {
      logCode: 'AUD-9018241',
      agentName: 'Customer Support Agent',
      action: 'TICKET_CLASSIFICATION',
      targetEntity: 'Ticket',
      entityId: ticket1.id,
      reason: 'Summarized dispute ticket, determined urgency score (78/100), retrieved CRM 360 history.',
      evidence: JSON.stringify([{ source: 'Salesforce CRM', content: 'Customer Tier: VIP, Spend: $48,900' }]),
      decision: 'ESCALATE_TO_MULTI_AGENT_INVESTIGATION',
      confidence: 0.98,
      hashSignature: 'a89c7d1e89b21f37e4091a1823901bcf8821948291a27192837192847291a82f',
      humanApproved: false,
    },
  });

  console.log('✅ Enterprise Seed Complete! FinOps Assistant ready for execution.');
}

seed()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
