import { prisma } from '../../database/prisma.js';

export class ExportService {
  async exportJson(userId: string) {
    const [user, settings, subjects, tasks, sessions, goals, contributions] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, name: true, createdAt: true },
        }),
        prisma.userSettings.findUnique({ where: { userId } }),
        prisma.subject.findMany({ where: { userId } }),
        prisma.task.findMany({ where: { userId } }),
        prisma.learningSession.findMany({
          where: { userId },
          include: { subject: true, task: true },
        }),
        prisma.goal.findMany({ where: { userId } }),
        prisma.contributionDay.findMany({ where: { userId } }),
      ]);

    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user,
      settings,
      subjects,
      tasks,
      learningSessions: sessions,
      goals,
      contributionDays: contributions,
    };
  }

  async exportCsv(userId: string): Promise<string> {
    const sessions = await prisma.learningSession.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      include: { subject: true },
    });

    const headers = [
      'ID',
      'Date',
      'Subject',
      'Duration (Minutes)',
      'Topic',
      'What Learned',
      'General Notes',
      'Created At',
    ];

    const escapeCsv = (str: string | null | undefined) => {
      if (!str) return '""';
      const clean = str.replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = sessions.map((s: any) => [
      escapeCsv(s.id),
      escapeCsv(s.date.toISOString().slice(0, 10)),
      escapeCsv(s.subject.name),
      s.durationMinutes,
      escapeCsv(s.topic),
      escapeCsv(s.learnedNotes),
      escapeCsv(s.generalNotes),
      escapeCsv(s.createdAt.toISOString()),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
    return csvContent;
  }
}

export const exportService = new ExportService();
