import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting DevLearn database seeding...');

  const demoEmail = 'demo@devlearn.io';
  const demoPassword = 'Password123!';
  const hashedPassword = await argon2.hash(demoPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // Clean up any existing demo/admin user data
  await prisma.user.deleteMany({
    where: { email: { in: [demoEmail, 'admin@devlearn.io'] } },
  });

  // 1. Create Superadmin User
  const adminPassword = 'Admin123!';
  const hashedAdminPassword = await argon2.hash(adminPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const adminUser = await (prisma.user as any).create({
    data: {
      email: 'admin@devlearn.io',
      passwordHash: hashedAdminPassword,
      name: 'System Administrator',
      role: 'SUPERADMIN',
      status: 'ACTIVE',
      isEmailVerified: true,
      settings: {
        create: {
          dailyGoalMinutes: 120,
          timezone: 'UTC',
          theme: 'dark',
        },
      },
    },
  });

  console.log(`🛡️ Created Admin User: ${adminUser.email} (Password: ${adminPassword}, Role: SUPERADMIN)`);

  // 2. Create Demo User
  const user = await (prisma.user as any).create({
    data: {
      email: demoEmail,
      passwordHash: hashedPassword,
      name: 'Alex Rivera',
      role: 'USER',
      status: 'ACTIVE',
      isEmailVerified: true,
      settings: {
        create: {
          dailyGoalMinutes: 60,
          timezone: 'UTC',
          theme: 'dark',
        },
      },
    },
  });

  console.log(`👤 Created Demo User: ${user.email} (Password: ${demoPassword})`);

  // 2. Create Subjects
  const subjectDistSystems = await prisma.subject.create({
    data: {
      userId: user.id,
      name: 'Distributed Systems',
      description: 'Consensus algorithms, replication, partition tolerance, and RPCs.',
      colorToken: '#3B82F6',
    },
  });

  const subjectGo = await prisma.subject.create({
    data: {
      userId: user.id,
      name: 'Go & Concurrency',
      description: 'Goroutines, channels, memory models, and systems programming.',
      colorToken: '#06B6D4',
    },
  });

  const subjectPostgres = await prisma.subject.create({
    data: {
      userId: user.id,
      name: 'Database Internals',
      description: 'B-trees, WAL logs, MVCC, and query execution planning.',
      colorToken: '#8B5CF6',
    },
  });

  const subjectFrontend = await prisma.subject.create({
    data: {
      userId: user.id,
      name: 'Frontend Architecture',
      description: 'Modern React 19, Next.js App Router, and monochrome design systems.',
      colorToken: '#10B981',
    },
  });

  console.log('📚 Created 4 Core Subjects');

  // 3. Create Courses
  const courseMit = await prisma.course.create({
    data: {
      userId: user.id,
      subjectId: subjectDistSystems.id,
      title: 'MIT 6.824: Distributed Systems',
      platform: 'MIT OCW',
      url: 'https://pdos.csail.mit.edu/6.824/',
      description: 'Lectures on MapReduce, Raft consensus, ZooKeeper, and Spanner.',
      totalDurationMinutes: 720,
    },
  });

  const courseDdia = await prisma.course.create({
    data: {
      userId: user.id,
      subjectId: subjectPostgres.id,
      title: 'Designing Data-Intensive Applications',
      platform: 'Book',
      description: 'Martin Kleppmann textbook covering reliable, scalable, and maintainable systems.',
      totalDurationMinutes: 1200,
    },
  });

  console.log('🎓 Created 2 Curriculum Tracks');

  // 4. Create Tasks
  const taskRaft = await prisma.task.create({
    data: {
      userId: user.id,
      subjectId: subjectDistSystems.id,
      title: 'Implement Raft Leader Election & Heartbeats in Go',
      description: 'Complete Lab 2A of MIT 6.824 with passing test suite.',
      isCompleted: true,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  const taskSpanner = await prisma.task.create({
    data: {
      userId: user.id,
      subjectId: subjectDistSystems.id,
      title: 'Read Google Spanner TrueTime Architecture Paper',
      description: 'Take detailed notes on atomic clocks and GPS synchronized timestamps.',
      isCompleted: true,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.task.create({
    data: {
      userId: user.id,
      subjectId: subjectPostgres.id,
      title: 'Benchmark PostgreSQL B-Tree vs BRIN index for time-series',
      description: 'Generate 10M rows test table and measure index creation time and query disk I/O.',
      isCompleted: false,
    },
  });

  await prisma.task.create({
    data: {
      userId: user.id,
      subjectId: subjectGo.id,
      title: 'Build zero-allocation lock-free ring buffer in Go',
      description: 'Use atomic pointers and benchmark against buffered channels.',
      isCompleted: false,
    },
  });

  console.log('✅ Created 4 Structured Tasks');

  // 5. Create Goals
  await prisma.goal.create({
    data: {
      userId: user.id,
      subjectId: subjectDistSystems.id,
      title: 'Master Distributed Consensus & Fault Tolerance',
      description: 'Complete MIT 6.824 labs 1 through 4 and read all 6 core consensus papers.',
      targetMinutes: 2400, // 40 hours
      status: 'IN_PROGRESS',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.goal.create({
    data: {
      userId: user.id,
      subjectId: subjectPostgres.id,
      title: 'Deep Dive into Database Storage Engines',
      description: 'Understand LSM trees vs B+ trees, write-ahead logging, and ACID transaction isolation.',
      targetMinutes: 1800, // 30 hours
      status: 'IN_PROGRESS',
      startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('🎯 Created 2 Milestone Goals');

  // 6. Create Resources
  await prisma.resource.createMany({
    data: [
      {
        userId: user.id,
        title: 'In Search of an Understandable Consensus Algorithm (Raft Paper)',
        url: 'https://raft.github.io/raft.pdf',
        type: 'url',
      },
      {
        userId: user.id,
        title: 'The Internals of PostgreSQL (Hironobu SUZUKI)',
        url: 'https://www.interdb.jp/pg/',
        type: 'url',
      },
      {
        userId: user.id,
        title: 'The Go Memory Model Official Specification',
        url: 'https://go.dev/ref/mem',
        type: 'url',
      },
    ],
  });

  console.log('🔖 Created 3 Learning Bookmarks');

  // 7. Generate 45 Days of Historical Learning Sessions & Contribution Days
  const now = new Date();
  const sessionConfigs = [
    {
      subjectId: subjectDistSystems.id,
      courseId: courseMit.id,
      taskId: taskRaft.id,
      topic: 'Raft Lab 2A - Leader Election & Split Votes',
      durationMinutes: 90,
      learnedNotes: 'Implemented randomized election timeouts (150-300ms) to avoid split votes.',
      generalNotes: 'Passed 2A test suite with 0 race condition warnings.',
    },
    {
      subjectId: subjectPostgres.id,
      courseId: courseDdia.id,
      topic: 'DDIA Chapter 3 - Storage and Retrieval',
      durationMinutes: 60,
      learnedNotes: 'Analyzed SSTables and Log-Structured Merge-trees (LSM-trees) vs B-Trees.',
      generalNotes: 'LSM-trees typically have higher write throughput due to sequential writes.',
    },
    {
      subjectId: subjectGo.id,
      topic: 'Go Concurrency - Select Statement & Nil Channels',
      durationMinutes: 45,
      learnedNotes: 'Sending or receiving on a nil channel blocks forever, useful for disabling cases in select.',
      generalNotes: 'Great for graceful shutdown patterns.',
    },
    {
      subjectId: subjectFrontend.id,
      topic: 'React 19 Server Actions & Optimistic Updates',
      durationMinutes: 75,
      learnedNotes: 'Explored useOptimistic and useActionState hooks for zero-latency UI responses.',
      generalNotes: 'Great UX for instant to-do toggle states.',
    },
    {
      subjectId: subjectDistSystems.id,
      courseId: courseMit.id,
      taskId: taskSpanner.id,
      topic: 'Google Spanner TrueTime API',
      durationMinutes: 120,
      learnedNotes: 'TrueTime guarantees linearizability across globally distributed datacenters with uncertainty bound [earliest, latest].',
      generalNotes: 'Commit-wait ensures that timestamps are strictly monotonic.',
    },
  ];

  const dailyMinutesMap: Record<string, { minutes: number; count: number }> = {};

  // Spread sessions across the past 45 days (with high consistency for streaks)
  for (let i = 44; i >= 0; i--) {
    // Skip occasional days for realistic pattern
    if (i % 9 === 0) continue;

    const sessionDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = sessionDate.toISOString().slice(0, 10);
    const config = sessionConfigs[i % sessionConfigs.length];

    // Log Learning Session
    await prisma.learningSession.create({
      data: {
        userId: user.id,
        subjectId: config.subjectId,
        courseId: config.courseId || null,
        taskId: config.taskId || null,
        durationMinutes: config.durationMinutes,
        date: sessionDate,
        topic: config.topic,
        learnedNotes: config.learnedNotes,
        generalNotes: config.generalNotes,
      },
    });

    if (!dailyMinutesMap[dateStr]) {
      dailyMinutesMap[dateStr] = { minutes: 0, count: 0 };
    }
    dailyMinutesMap[dateStr].minutes += config.durationMinutes;
    dailyMinutesMap[dateStr].count += 1;
  }

  // Populate ContributionDay records
  for (const [dateStr, info] of Object.entries(dailyMinutesMap)) {
    let level = 0;
    if (info.minutes >= 120) level = 4;
    else if (info.minutes >= 60) level = 3;
    else if (info.minutes >= 30) level = 2;
    else if (info.minutes > 0) level = 1;

    await prisma.contributionDay.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: dateStr,
        },
      },
      update: {
        totalMinutes: info.minutes,
        level,
      },
      create: {
        userId: user.id,
        date: dateStr,
        totalMinutes: info.minutes,
        level,
      },
    });
  }

  console.log(`🔥 Generated 40+ Learning Sessions and synced 365-day Contribution Activity!`);
  console.log('====================================================');
  console.log('🎉 Seeding completed successfully!');
  console.log(`Demo Credentials:`);
  console.log(`Email:    ${demoEmail}`);
  console.log(`Password: ${demoPassword}`);
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
