/**
 * Seed script — provisions a demo tenant ("The Village Investment") with the
 * full default role set, an admin user, a sales consultant, a default pipeline,
 * two developers, projects, and a handful of units + leads so the API is
 * explorable immediately after `npm run prisma:seed`.
 *
 *   Admin login:  admin@thevillageinvestment.com / Admin!2345
 *
 * Idempotent: safe to re-run — it upserts by natural keys.
 */
import { PrismaClient, SystemRole, LeadSource, UnitType } from '@prisma/client';
import * as argon2 from 'argon2';
import { DEFAULT_ROLE_PERMISSIONS } from '../src/common/rbac/permissions';

const prisma = new PrismaClient();

const EGP = (major: number): bigint => BigInt(Math.round(major * 100));

function humanize(key: SystemRole): string {
  return key
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

async function main(): Promise<void> {
  const company = await prisma.company.upsert({
    where: { slug: 'the-village' },
    update: {},
    create: {
      name: 'The Village Investment',
      slug: 'the-village',
      baseCurrency: 'EGP',
      timezone: 'Africa/Cairo',
    },
  });
  console.log(`Company: ${company.name} (${company.id})`);

  // Roles (default permission sets)
  for (const [key, permissions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    await prisma.role.upsert({
      where: { companyId_name: { companyId: company.id, name: humanize(key as SystemRole) } },
      update: { permissions },
      create: {
        companyId: company.id,
        key: key as SystemRole,
        name: humanize(key as SystemRole),
        isSystem: true,
        permissions,
      },
    });
  }
  const superAdminRole = await prisma.role.findFirstOrThrow({
    where: { companyId: company.id, key: SystemRole.SUPER_ADMIN },
  });
  const consultantRole = await prisma.role.findFirstOrThrow({
    where: { companyId: company.id, key: SystemRole.PROPERTY_CONSULTANT },
  });

  // Admin user
  const admin = await prisma.user.upsert({
    where: { companyId_email: { companyId: company.id, email: 'admin@thevillageinvestment.com' } },
    update: {},
    create: {
      companyId: company.id,
      email: 'admin@thevillageinvestment.com',
      passwordHash: await argon2.hash('Admin!2345'),
      firstName: 'Village',
      lastName: 'Admin',
      roles: { create: { roleId: superAdminRole.id } },
    },
  });

  const consultant = await prisma.user.upsert({
    where: { companyId_email: { companyId: company.id, email: 'sales@thevillageinvestment.com' } },
    update: {},
    create: {
      companyId: company.id,
      email: 'sales@thevillageinvestment.com',
      passwordHash: await argon2.hash('Sales!2345'),
      firstName: 'Nour',
      lastName: 'Consultant',
      roles: { create: { roleId: consultantRole.id } },
    },
  });
  console.log(`Users: ${admin.email}, ${consultant.email}`);

  // Organizational structure: departments → positions & teams → people.
  const salesDept = await prisma.department.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Sales' } },
    update: {},
    create: { companyId: company.id, name: 'Sales', description: 'Revenue-generating sales teams' },
  });
  const mktDept = await prisma.department.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Marketing' } },
    update: {},
    create: { companyId: company.id, name: 'Marketing', description: 'Demand generation & campaigns' },
  });
  await prisma.department.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Finance' } },
    update: {},
    create: { companyId: company.id, name: 'Finance', description: 'Collections, payouts, commissions' },
  });

  const consultantPosition = await prisma.position.upsert({
    where: { companyId_title: { companyId: company.id, title: 'Property Consultant' } },
    update: {},
    create: { companyId: company.id, title: 'Property Consultant', level: 2, departmentId: salesDept.id },
  });
  await prisma.position.upsert({
    where: { companyId_title: { companyId: company.id, title: 'Sales Manager' } },
    update: {},
    create: { companyId: company.id, title: 'Sales Manager', level: 5, departmentId: salesDept.id },
  });

  const teamA = await prisma.team.upsert({
    where: { companyId_name: { companyId: company.id, name: 'New Cairo Team A' } },
    update: {},
    create: { companyId: company.id, name: 'New Cairo Team A', departmentId: salesDept.id, leaderId: consultant.id },
  });

  await prisma.user.update({
    where: { id: consultant.id },
    data: { departmentId: salesDept.id, positionId: consultantPosition.id, teamId: teamA.id },
  });

  // A few more demo team members spread across roles, so User Management and the
  // Permission Test Report have realistic data to show.
  const roleByKey = async (key: SystemRole) =>
    prisma.role.findFirstOrThrow({ where: { companyId: company.id, key } });
  const demoTeam: { email: string; first: string; last: string; role: SystemRole; dept: string; team?: string }[] = [
    { email: 'manager@thevillageinvestment.com', first: 'Omar', last: 'Khaled', role: SystemRole.SALES_MANAGER, dept: salesDept.id, team: teamA.id },
    { email: 'agent@thevillageinvestment.com', first: 'Fatma', last: 'Sayed', role: SystemRole.SALES_AGENT, dept: salesDept.id, team: teamA.id },
    { email: 'marketing@thevillageinvestment.com', first: 'Layla', last: 'Adham', role: SystemRole.MARKETING_MANAGER, dept: mktDept.id },
    { email: 'finance@thevillageinvestment.com', first: 'Hana', last: 'Mostafa', role: SystemRole.FINANCE, dept: undefined as unknown as string },
  ];
  for (const m of demoTeam) {
    const role = await roleByKey(m.role);
    await prisma.user.upsert({
      where: { companyId_email: { companyId: company.id, email: m.email } },
      update: {},
      create: {
        companyId: company.id,
        email: m.email,
        passwordHash: await argon2.hash('Village!2345'),
        firstName: m.first,
        lastName: m.last,
        departmentId: m.dept ?? undefined,
        teamId: m.team,
        roles: { create: { roleId: role.id } },
      },
    });
  }

  // Default pipeline
  const existingPipeline = await prisma.pipeline.findFirst({
    where: { companyId: company.id, name: 'Primary Sales' },
  });
  if (!existingPipeline) {
    await prisma.pipeline.create({
      data: {
        companyId: company.id,
        name: 'Primary Sales',
        isDefault: true,
        stages: {
          create: [
            { name: 'New', order: 0, probability: 10 },
            { name: 'Qualified', order: 1, probability: 30 },
            { name: 'Meeting', order: 2, probability: 50 },
            { name: 'Reservation', order: 3, probability: 75 },
            { name: 'Won', order: 4, probability: 100, isWon: true },
            { name: 'Lost', order: 5, probability: 0, isLost: true },
          ],
        },
      },
    });
  }

  // Developers + projects + units
  const devData = [
    { name: 'Palm Hills Developments', project: 'Badya', area: '6th of October' },
    { name: 'Mountain View', project: 'iCity', area: 'New Cairo' },
  ];

  for (const d of devData) {
    const developer = await prisma.developer.upsert({
      where: { companyId_slug: { companyId: company.id, slug: d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') } },
      update: {},
      create: {
        companyId: company.id,
        name: d.name,
        slug: d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      },
    });

    const projectSlug = d.project.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const project = await prisma.project.upsert({
      where: { companyId_slug: { companyId: company.id, slug: projectSlug } },
      update: {},
      create: {
        companyId: company.id,
        developerId: developer.id,
        name: d.project,
        slug: projectSlug,
        area: d.area,
        city: 'Greater Cairo',
        status: 'UNDER_CONSTRUCTION',
        amenities: ['Clubhouse', 'Lagoons', 'Retail Strip', 'Sports Fields'],
      },
    });

    for (let i = 1; i <= 3; i++) {
      const code = `${projectSlug.toUpperCase().slice(0, 3)}-${i}00`;
      await prisma.unit.upsert({
        where: { companyId_projectId_code: { companyId: company.id, projectId: project.id, code } },
        update: {},
        create: {
          companyId: company.id,
          projectId: project.id,
          code,
          type: i % 2 === 0 ? UnitType.VILLA : UnitType.APARTMENT,
          bedrooms: 2 + i,
          bathrooms: 2 + i,
          builtUpArea: 120 + i * 40,
          priceMinor: EGP(6_000_000 + i * 1_500_000),
          currency: 'EGP',
          downPaymentPct: 10,
          installmentYears: 8,
        },
      });
    }
  }

  // A couple of demo leads
  const demoLeads = [
    { firstName: 'Ahmed', phone: '+201016000201', source: LeadSource.WEBSITE, interestArea: 'New Cairo' },
    { firstName: 'Sara', phone: '+201234567890', source: LeadSource.FACEBOOK, interestArea: '6th of October' },
  ];
  for (const l of demoLeads) {
    const phoneNormalized = l.phone.replace(/[^\d]/g, '').replace(/^20/, '0');
    const exists = await prisma.lead.findFirst({
      where: { companyId: company.id, phoneNormalized },
    });
    if (!exists) {
      await prisma.lead.create({
        data: {
          companyId: company.id,
          ownerId: consultant.id,
          firstName: l.firstName,
          phone: l.phone,
          phoneNormalized,
          source: l.source,
          interestArea: l.interestArea,
          score: 55,
          temperature: 'WARM',
          currency: 'EGP',
        },
      });
    }
  }

  // Default automation rule: inbound web leads → assign, SLA, follow-up, AI, WhatsApp.
  const existingRule = await prisma.automationRule.findFirst({
    where: { companyId: company.id, name: 'Inbound web leads' },
  });
  if (!existingRule) {
    await prisma.automationRule.create({
      data: {
        companyId: company.id,
        name: 'Inbound web leads',
        trigger: 'LEAD_CAPTURED',
        enabled: true,
        order: 0,
        conditions: {},
        actions: [
          { type: 'ASSIGN_ROUND_ROBIN' },
          { type: 'START_SLA', minutes: 15 },
          { type: 'CREATE_FOLLOW_UP', minutes: 120 },
          { type: 'GENERATE_AI_SUMMARY' },
          { type: 'SEND_WHATSAPP_TEMPLATE', template: 'welcome' },
        ],
      },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
