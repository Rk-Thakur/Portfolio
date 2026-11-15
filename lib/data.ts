// All site content lives here. Edit this file to update the portfolio.

export const profile = {
  name: 'Ranjan Kumar Thakur',
  short: 'Ranjan Thakur',
  initials: 'RT',
  title: 'Software & Mobile Application Engineer',
  email: 'ranjant401@gmail.com',
  phone: '+1 (917) 498-7261',
  phoneHref: 'tel:+19174987261',
  location: 'Troy, Alabama, USA',
  github: 'https://github.com/Rk-Thakur/',
  githubHandle: 'Rk-Thakur',
  linkedin: 'https://www.linkedin.com/in/thakurranjan/',
  linkedinHandle: 'in/thakurranjan',
  roles: [
    'Mobile Engineer — Flutter · iOS · Android',
    'Software Engineer — Python · FastAPI',
    'Associate Lead — 3 consumer apps',
    'Release engineer — Fastlane + GitHub Actions',
    'Real-time systems — SignalR · WebSockets',
  ],
};

export const stats = [
  { value: 40, suffix: '%', label: 'Faster feature delivery via monorepo', decimals: 0 },
  { value: 70, suffix: '%', label: 'Less manual release effort', decimals: 0 },
  { value: 10, suffix: 'k+', label: 'Active users on real-time sync', decimals: 0 },
  { value: 4.5, suffix: '★', label: 'App Store & Google Play rating', decimals: 1 },
];

export const strengths = [
  { area: 'Mobile', text: 'Flutter apps with native Swift and Kotlin bridges, offline support and accessibility built in.' },
  { area: 'Architecture', text: 'Clean architecture and Melos monorepos that let one team ship 3 apps from a shared codebase.' },
  { area: 'Quality', text: 'Test coverage taken from near zero to 80%+, and 30%+ faster load times through profiling.' },
  { area: 'Backend & data', text: 'Dockerized FastAPI services, ETL pipelines, and ML with XGBoost and BERT.' },
  { area: 'Delivery', text: 'CI/CD with code signing and staged rollouts that cut release effort by 70% and build failures by 60%.' },
];

export const marquee = [
  'Flutter', 'Dart', 'Firebase', 'Swift', 'Kotlin', 'BLoC', 'Riverpod', 'FastAPI', 'Python',
  'Docker', 'GitHub Actions', 'Fastlane', 'GraphQL', 'SignalR', 'PostgreSQL', 'Azure', 'AWS',
];

export type SkillGroup = {
  title: string;
  icon: 'code' | 'mobile' | 'arch' | 'server' | 'cloud' | 'shield' | 'db' | 'brain' | 'tool';
  items: string[];
};

export const skills: SkillGroup[] = [
  { title: 'Languages', icon: 'code', items: ['Dart', 'Python', 'Swift', 'Kotlin', 'Java', 'JavaScript', 'SQL', 'C', 'Bash'] },
  { title: 'Mobile', icon: 'mobile', items: ['Flutter', 'iOS (Swift)', 'Android (Kotlin / Java)', 'Cross-Platform Development', 'Swift Platform Channels', 'Kotlin Interop', 'Firebase', 'Push Notifications', 'Offline Support', 'Responsive Layouts', 'Third-Party SDKs', 'App Store & Google Play Publishing', 'Accessibility Standards'] },
  { title: 'State & Architecture', icon: 'arch', items: ['BLoC', 'Riverpod', 'Provider', 'Clean Architecture', 'Monorepo (Melos)', 'Shared Packages', 'Modular Design', 'OOP', 'Agile'] },
  { title: 'Backend & APIs', icon: 'server', items: ['FastAPI', 'Microservices', 'REST', 'GraphQL', 'WebSockets', 'SignalR', 'OAuth2 Authentication', 'Third-Party APIs', 'DartFrog', 'Serverpod'] },
  { title: 'Cloud & DevOps', icon: 'cloud', items: ['CI/CD Pipelines', 'Fastlane', 'GitHub Actions', 'Azure DevOps', 'Firebase App Distribution', 'Docker', 'Docker Compose', 'AWS (EC2, S3, IAM)', 'Azure', 'Firebase / GCP', 'Automated Code Signing', 'Staged Rollouts'] },
  { title: 'Testing & Quality', icon: 'shield', items: ['Unit Testing', 'Widget Testing', 'Integration Testing', 'JUnit', 'XCTest', 'SonarQube', 'Crashlytics', 'Sentry', 'Debugging', 'Performance Profiling', 'Memory Optimization'] },
  { title: 'Databases & Data', icon: 'db', items: ['PostgreSQL', 'Firebase Firestore', 'SQL', 'NoSQL', 'Oracle PL/SQL', 'ETL Pipelines', 'Data Transformation', 'Data Cleaning'] },
  { title: 'AI / ML', icon: 'brain', items: ['Pandas', 'Scikit-learn', 'XGBoost', 'TF-IDF', 'BERT', 'Data Preprocessing', 'Model Training', 'Tkinter GUIs'] },
  { title: 'Tools & Open Source', icon: 'tool', items: ['Android Studio', 'Xcode', 'Flutter DevTools', 'Git & GitHub', 'pub.dev Packages', 'Dart CLI Tools', 'Bash Scripting'] },
];

export const languages = ['Dart', 'Python', 'Swift', 'Kotlin', 'Java', 'JavaScript', 'SQL', 'C', 'Bash'];

export type Job = {
  role: string; company: string; sub: string; date: string; location: string;
  points: string[]; tags: string[];
  /** Self-directed work (styled differently from paid roles) */
  independent?: boolean;
  /** Project slugs to link to their case-study pages */
  projects?: string[];
};

// **text** renders as bold
export const experience: Job[] = [
  {
    role: 'Software Engineer', company: 'Independent Projects', sub: 'Alongside M.S. in Computer Science, Troy University',
    date: 'Jan 2025 — Present', location: 'Troy, Alabama, USA', independent: true,
    points: [
      'Built an **AI Resume Tailoring System**: Python FastAPI microservices on PostgreSQL that match resumes to job descriptions with **TF-IDF and BERT**, fully containerized with Docker.',
      'Designed a **Pill Tracking System** backend with secure authentication and Dockerized REST services.',
      'Built an **Olympic Medal Predictor** with end-to-end Pandas ETL, a trained machine-learning model and a Tkinter interface.',
      'Published open-source Dart tooling on **pub.dev**: a CLI that strips debug prints from Flutter codebases, and a Bash + Melos script that sets up a production-ready Flutter monorepo.',
      'Keep sharpening mobile and backend skills while completing graduate coursework in Computer Science.',
    ],
    tags: ['FastAPI', 'PostgreSQL', 'BERT', 'Docker', 'Dart', 'pub.dev', 'ML'],
    projects: ['ai-resume-tailoring', 'pill-tracking-system', 'olympic-medal-predictor', 'remove-print-cli', 'flutter-monorepo-script'],
  },
  {
    role: 'Associate Lead Software Engineer', company: 'Technofex Nepal', sub: 'Lead Flutter Developer · 3 consumer-facing apps',
    date: 'Sep 2023 — Dec 2024', location: 'Kathmandu, Nepal',
    points: [
      'Architected a **multi-app Flutter monorepo** with shared packages, enforced clean architecture and Melos tooling, cutting feature delivery time by **40%** and code duplication by 30%.',
      'Built end-to-end **CI/CD pipelines** with Fastlane, GitHub Actions, Azure DevOps and Firebase App Distribution, including automated signing and staged rollouts, removing **70%** of manual release effort.',
      'Improved app load times and memory efficiency by **30%+** by profiling with Flutter DevTools and fixing widget rebuild cycles and memory allocations in production.',
      'Raised test coverage from near zero to **80%+** across core modules with unit, widget and integration tests, which reduced regressions between releases.',
      'Containerized Python FastAPI services with Docker and Docker Compose for Azure, and maintained Python/SQL ETL pipelines for the analytics team.',
    ],
    tags: ['Flutter', 'Melos', 'Fastlane', 'GitHub Actions', 'FastAPI', 'Docker', 'Azure'],
  },
  {
    role: 'Mid-Level Software Engineer', company: 'Cloudyfox Nepal', sub: 'Flutter Developer · 5 enterprise clients',
    date: 'Aug 2022 — Aug 2023', location: 'Kathmandu, Nepal',
    points: [
      'Implemented **SignalR and WebSocket** layers that made real-time data sync more reliable for **10,000+ active users**, with failures tracked in Sentry and Crashlytics.',
      'Shipped modular production features with BLoC and OOP across iOS and Android, speeding up feature delivery by **25%**.',
      'Set up CI/CD with automated test and debugging gates, which cut build failures by **60%**.',
      'Owned the production release process and kept **4.5+ store ratings** on Google Play and the App Store by resolving crash reports and improving accessibility and responsive layouts.',
      'Integrated REST, GraphQL and third-party SDKs; wrote Swift platform channels and Kotlin interop where native capabilities were needed.',
    ],
    tags: ['BLoC', 'SignalR', 'GraphQL', 'Swift', 'Kotlin', 'Sentry'],
  },
  {
    role: 'Junior Software Engineer', company: 'TechNow', sub: 'Flutter Developer · Intern → Junior',
    date: 'Dec 2021 — May 2022', location: 'Kathmandu, Nepal',
    points: [
      'Published **2 production apps** to the App Store and Google Play within a 6-month internship, handling submission, testing and release inside Agile sprints.',
      'Built Flutter UI components in Dart and supported Android (Java) development; integrated REST/JSON APIs and wrote tests with JUnit and XCTest.',
    ],
    tags: ['Flutter', 'Android (Java)', 'Xcode', 'REST'],
  },
];

export type ProjectCat = 'mobile' | 'backend' | 'oss';
export type Project = {
  slug: string; title: string; badge: string; icon: string; cat: ProjectCat;
  summary: string; highlights: string[]; tags: string[];
};

export const projects: Project[] = [
  {
    slug: 'kiibank', title: 'KiiBank — Mobile Banking', badge: 'FinTech', icon: '🏦', cat: 'mobile',
    summary: 'Cross-platform banking app with OAuth2 authentication, real-time transfers over REST, and responsive dashboards.',
    highlights: [
      'Built in Flutter and Dart with OAuth2 authentication and real-time transfers through RESTful APIs.',
      'BLoC state management with responsive dashboards.',
      'Unit, widget and integration tests to keep production quality high and make debugging easier.',
      'Fastlane and Firebase App Distribution automate CI/CD and deploy releases to Google Play and the App Store.',
    ],
    tags: ['Flutter', 'BLoC', 'OAuth2', 'REST', 'Fastlane'],
  },
  {
    slug: 'kmag', title: 'KMAG — Magazine App', badge: 'Media', icon: '📰', cat: 'mobile',
    summary: 'Flutter magazine app using Firestore as a CMS, with Riverpod, push notifications and offline reading.',
    highlights: [
      'Firebase Firestore acts as the content management system.',
      'Riverpod state management, push notifications and offline reading support.',
      'GitHub Actions and Fastlane publish builds to Firebase App Distribution, the App Store and Google Play.',
      'Integration tests validate content sync across iOS and Android.',
    ],
    tags: ['Flutter', 'Riverpod', 'Firestore', 'GitHub Actions'],
  },
  {
    slug: 'trueme', title: 'TrueMe — Meditation & Audio', badge: 'Wellness', icon: '🎧', cat: 'mobile',
    summary: 'Audio playback, playlist management and background listening, tuned for low memory use on iOS and Android.',
    highlights: [
      'Audio playback, playlist management and background listening built with Flutter.',
      'Optimized for low memory usage and smooth performance across iOS and Android.',
    ],
    tags: ['Flutter', 'Audio', 'Performance'],
  },
  {
    slug: 'ai-resume-tailoring', title: 'AI Resume Tailoring System', badge: 'AI / NLP', icon: '🧠', cat: 'backend',
    summary: 'Python FastAPI microservices on PostgreSQL that use TF-IDF and BERT to tailor resumes to job descriptions.',
    highlights: [
      'Python FastAPI microservices backed by PostgreSQL.',
      'Data-processing pipelines using TF-IDF and BERT.',
      'All services containerized with Docker.',
    ],
    tags: ['FastAPI', 'PostgreSQL', 'BERT', 'Docker'],
  },
  {
    slug: 'olympic-medal-predictor', title: 'Olympic Medal Predictor', badge: 'ML', icon: '🏅', cat: 'backend',
    summary: 'End-to-end Python ETL, a trained machine-learning model, and a Tkinter GUI for medal predictions.',
    highlights: [
      'End-to-end ETL pipelines in Python and Pandas for extraction, cleaning and transformation.',
      'Trained a machine-learning model on the prepared data.',
      'Tkinter GUI for making medal predictions.',
    ],
    tags: ['Python', 'Pandas', 'Scikit-learn', 'Tkinter'],
  },
  {
    slug: 'pill-tracking-system', title: 'Pill Tracking System', badge: 'Health', icon: '💊', cat: 'backend',
    summary: 'REST backend with secure authentication and Dockerized services for tracking medication.',
    highlights: ['Designed the REST backend.', 'Dockerized services.', 'Secure authentication.'],
    tags: ['REST', 'Auth', 'Docker'],
  },
  {
    slug: 'remove-print-cli', title: 'Remove Print CLI', badge: 'Open Source', icon: '🧹', cat: 'oss',
    summary: 'Dart CLI on pub.dev that finds and removes debug print/log statements from Flutter codebases.',
    highlights: [
      'Published on pub.dev with documentation and versioning.',
      'Detects and removes debug print and log statements from Flutter codebases before release.',
    ],
    tags: ['Dart', 'CLI', 'pub.dev'],
  },
  {
    slug: 'flutter-monorepo-script', title: 'Flutter Monorepo Setup Script', badge: 'Tooling', icon: '🧱', cat: 'oss',
    summary: 'Bash + Melos script that scaffolds a production-ready Flutter monorepo in one command.',
    highlights: [
      'Scaffolds a production-ready Flutter monorepo with shared packages.',
      'Consistent tooling across packages through Melos.',
    ],
    tags: ['Bash', 'Melos', 'Flutter'],
  },
];

export const education = [
  { date: 'Aug 2025 — Present', degree: 'M.S., Computer Science', school: 'Troy University', loc: 'Troy, Alabama, USA' },
  { date: '2018 — 2023', degree: 'B.Sc., Information Management', school: 'Orchid International College', loc: 'Kathmandu, Nepal · GPA 3.54' },
  { date: 'Higher Secondary', degree: 'Science, Computer Science', school: 'Liverpool International College', loc: 'Kathmandu, Nepal' },
];

export const palettes = [
  { id: 'midnight', name: 'Midnight', note: 'Cyan · Indigo', a: '#22d3ee', b: '#6366f1', c: '#0b0f17', light: false },
  { id: 'paper', name: 'Paper', note: 'Ink · Signal orange', a: '#ff4d00', b: '#0c0a09', c: '#fafaf9', light: true },
  { id: 'sand', name: 'Sand', note: 'Terracotta · Clay', a: '#c2410c', b: '#7c5c3b', c: '#f3ede3', light: true },
  { id: 'forest', name: 'Forest', note: 'Lime · Mint', a: '#a3e635', b: '#34d399', c: '#0c1210', light: false },
  { id: 'dusk', name: 'Dusk', note: 'Lavender · Rose', a: '#c4b5fd', b: '#f9a8d4', c: '#120f1a', light: false },
  { id: 'coral', name: 'Coral', note: 'Coral · Sun · Deep sea', a: '#ff7f6b', b: '#ffd166', c: '#0a1a24', light: false },
] as const;
