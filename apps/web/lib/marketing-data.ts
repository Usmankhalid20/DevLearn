export interface FaqItem {
  question: string;
  answer: string;
}

export interface StepItem {
  number: string;
  title: string;
  description: string;
  details: string;
}

export interface AudienceItem {
  role: string;
  tagline: string;
  iconName: 'GraduationCap' | 'Code2' | 'Compass';
  questions: string[];
}

export interface PreviewSubject {
  name: string;
  time: string;
  percentage: number;
}

export const WORKFLOW_STEPS: StepItem[] = [
  {
    number: '01',
    title: 'Decide What to Learn',
    description: 'Create dynamic subjects, goals, or planned tasks for the day.',
    details: 'Subjects are user-defined (e.g. Distributed Systems, Rust, LeetCode, SQL) — nothing is hard-coded.',
  },
  {
    number: '02',
    title: 'Track the Learning',
    description: 'Use the live focus stopwatch or log completed session duration manually.',
    details: 'Separate actual focused minutes from planning checkboxes to accurately measure time.',
  },
  {
    number: '03',
    title: 'Capture Context (Optional)',
    description: 'Attach optional notes, topics, course modules, or documentation links.',
    details: 'Keep it minimal by default (just subject + time) or enrich sessions with notes when needed.',
  },
  {
    number: '04',
    title: 'Review & Consistency',
    description: 'Watch your internal learning heatmap, streak counters, and subject breakdowns update in real time.',
    details: 'Gain complete visibility into your consistency over weeks and months.',
  },
];

export const AUDIENCE_PERSONAS: AudienceItem[] = [
  {
    role: 'Students & Academics',
    tagline: 'Stay on top of coursework, exams, and project milestones.',
    iconName: 'GraduationCap',
    questions: [
      'Did I study today?',
      'How much time did I spend on algorithms vs database theory?',
      'Am I maintaining a consistent weekly study habit?',
    ],
  },
  {
    role: 'Engineers & Developers',
    tagline: 'Balance skill development, architecture reading, and coding practice.',
    iconName: 'Code2',
    questions: [
      'How many hours am I dedicating to backend engineering?',
      'Am I balancing system design and problem solving?',
      'Which new frameworks or tools am I actively practicing?',
    ],
  },
  {
    role: 'Self-Directed Learners',
    tagline: 'Turn unstructured exploration into measurable progress.',
    iconName: 'Compass',
    questions: [
      'What did I actually accomplish across all my saved resources this month?',
      'Am I following through on long-term self-paced roadmaps?',
      'Where is my learning time going?',
    ],
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is DevLearn?',
    answer:
      'DevLearn is a personal learning-progress platform for students, developers, and self-learners. It transforms scattered study sessions across videos, documentation, articles, and courses into a clear record of time, completed tasks, and measurable consistency.',
  },
  {
    question: 'Is DevLearn just another Todo app?',
    answer:
      'No. Tasks represent intended work, while learning sessions represent actual focused time spent. DevLearn separates planning from execution, ensuring your streaks and progress reflect verified learning duration rather than arbitrary checked boxes.',
  },
  {
    question: 'Do I need to add a topic every time?',
    answer:
      'No. Topics, notes, and resources are completely optional. You can log a quick session with just a subject and duration (e.g. "Redis — 45 minutes"), or add deep notes and references when you need detail.',
  },
  {
    question: 'Do I need to connect YouTube or external APIs?',
    answer:
      'No. DevLearn works out-of-the-box without requiring any third-party API keys, YouTube OAuth, or external accounts. You can optionally paste any reference URL for your own records.',
  },
  {
    question: 'Is GitHub required for the contribution graph?',
    answer:
      'No. The contribution calendar is generated entirely from your internal DevLearn learning activity minutes. It provides a familiar 52-week activity visualization without needing GitHub commit data.',
  },
  {
    question: 'Can I track any subject?',
    answer:
      'Yes. Subjects are completely user-defined and dynamic. You can track Distributed Systems, LeetCode, Rust, Compilers, DevOps, SQL, or any custom skill you are learning.',
  },
  {
    question: 'Can I use a live timer as well as manual entry?',
    answer:
      'Yes. DevLearn includes a live interactive focus timer with background persistence, as well as a quick manual log dialog for recording past study sessions.',
  },
  {
    question: 'Is my learning data private?',
    answer:
      'Yes. Your study history, notes, tasks, and analytics are private and scoped strictly to your authenticated account.',
  },
];

export const PREVIEW_SUBJECTS: PreviewSubject[] = [
  { name: 'Distributed Systems', time: '1h 45m', percentage: 42 },
  { name: 'PostgreSQL & SQL', time: '1h 15m', percentage: 30 },
  { name: 'Redis Architecture', time: '45m', percentage: 18 },
  { name: 'DevOps & Docker', time: '25m', percentage: 10 },
];
