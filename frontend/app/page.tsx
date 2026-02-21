"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

// ==========================================
// TYPE DEFINITIONS
// ==========================================
type Question = {
  type: "MCQ" | "Fill in the Blanks" | "Short Answer" | "Coding";
  scenario: string;
  options?: string[];
  correctIndex?: number;
  answer?: string;
  hint?: string;
  reason?: string;

  // ✅ Short Answer support
  keywords?: string[];
  rubric?: string[];

  // ✅ Coding support (token-based live checks)
  language?: string;
  starterCode?: string;
  requiredTokens?: string[];
};

type BackendPreview = {
  apiLoad: number;
  apiErrors: number;
  cacheHit: number;
  dbConn: number;
  qps: number;
  latency: number;
};

type FrontendPreview = {
  fps: number;
  bundleKB: number;
  hydrationMs: number;
  reRenders: number;
};

type MLPreview = {
  trainLoss: number;
  valLoss: number;
  epoch: number;
  overfitRisk: number;
};

type DevOpsPreview = {
  deployTime: number;
  clusterHealth: number;
  errorRate: number;
  costsPerHr: number;
};

type SysDesignPreview = {
  throughput: number;
  availability: number;
  nodeCount: number;
  bottleneckRisk: number;
};

type MobilePreview = {
  launchTime: number;
  bundleSizeKB: number;
  crashRate: number;
  batteryDrain: number;
};

type SecurityPreview = {
  vulnCount: number;
  encryptionCoverage: number;
  authFailures: number;
  patchAgeDays: number;
};

type DataEngPreview = {
  pipelineLatency: number;
  dataFreshness: number;
  throughput: number;
  dataQualityScore: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

// ==========================================
// MAIN ENTRY POINT
// ==========================================
export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [initialTopics, setInitialTopics] = useState<string[]>([]);

  const handleStart = (topics: string[]) => {
    setInitialTopics(topics);
    setShowIntro(false);
  };

  return (
    <div className={`${inter.variable} font-sans`}>
      <AnimatePresence mode="wait">
        {showIntro
          ? <IntroScreen key="intro" onStart={handleStart} />
          : <MainApp key="main" initialTopics={initialTopics} />}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// INTRO SCREEN COMPONENT
// ==========================================
function IntroScreen({ onStart }: { onStart: (topics: string[]) => void }) {
  const [query, setQuery] = useState("");
  const [inputFocused, setInputFocused] = useState(false);

  // Flat catalog mirroring the backend CATALOG — used for client-side matching
  const CATALOG_ITEMS: string[] = [
    "React", "Next.js", "TypeScript", "JavaScript", "CSS", "TailwindCSS", "Accessibility", "Web Performance",
    "State Management", "Redux", "Zustand", "MobX", "Testing Library", "Jest", "Playwright",
    "Animations", "Framer Motion", "SSR", "CSR", "Hydration", "Code Splitting", "Memoization",
    "WebSockets", "Service Workers", "PWA", "i18n", "Form Handling", "React Query", "TanStack Query",
    "Vite", "Webpack", "Babel", "Storybook", "Design Systems", "Component Architecture", "Hooks", "Context API",
    "APIs", "REST", "GraphQL", "gRPC", "Microservices", "Monolith", "Caching", "Redis", "Queues", "RabbitMQ",
    "Kafka", "Databases", "PostgreSQL", "MySQL", "MongoDB", "ORM", "Prisma", "SQLAlchemy", "Auth", "OAuth2",
    "JWT", "Rate Limiting", "Circuit Breaker", "Observability", "Metrics", "Tracing", "Logging", "Testing",
    "Pagination", "Idempotency", "Schema Migrations", "Multi-tenancy", "API Gateway", "Service Discovery",
    "Docker", "Kubernetes", "Helm", "CI/CD", "GitHub Actions", "Terraform", "Ansible", "Prometheus", "Grafana",
    "ArgoCD", "Autoscaling", "Blue-Green", "Canary", "Load Balancing", "Nginx", "Istio", "Linkerd",
    "Secrets", "ConfigMaps", "RBAC", "Ingress", "EKS", "GKE", "AKS", "Cost Optimization",
    "Scalability", "Availability", "Consistency", "CAP Theorem", "Sharding", "Replication", "Leader Election",
    "Distributed Caching", "CDN", "Global Traffic", "Failover", "Backpressure", "Event Sourcing", "CQRS",
    "Read/Write Splitting", "Geo-partitioning", "Hot Partitions",
    "Model Training", "Data Preprocessing", "Feature Engineering", "Cross Validation", "Regularization",
    "Hyperparameter Tuning", "Overfitting", "Underfitting", "Model Serving", "Batch Inference",
    "Streaming Inference", "Embeddings", "Vector Databases", "Evaluation", "Drift Detection",
    "A/B Testing", "Monitoring", "Retraining",
    "React Native", "Swift", "Kotlin", "Android", "iOS", "Flutter", "Performance", "Offline Sync",
    "Push Notifications", "Background Tasks", "Deep Links", "App Store", "Play Store", "Crash Reporting",
    "OWASP", "Input Validation", "XSS", "CSRF", "SQL Injection", "Secrets Management",
    "Vulnerability Scanning", "Penetration Testing", "Threat Modeling", "Audit Logging",
    "Encryption", "TLS", "mTLS", "SSO",
    "ETL", "ELT", "Batch Processing", "Stream Processing", "Spark", "Flink", "Airflow", "dbt", "Lakehouse",
    "Delta Lake", "Data Quality", "Data Lineage", "Data Catalog", "Parquet", "Iceberg", "Hudi",
  ];

  const matchTopics = (text: string): string[] => {
    if (!text.trim()) return [];
    const lower = text.toLowerCase();
    return CATALOG_ITEMS.filter(item => lower.includes(item.toLowerCase()));
  };

  const handleSubmit = () => {
    const matched = matchTopics(query);
    onStart(matched);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  const suggestions = query.length > 1 ? matchTopics(query).slice(0, 6) : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute w-[700px] h-[700px] bg-orange-500/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-orange-600/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="flex flex-col items-center gap-10 relative z-10 w-full max-w-xl px-6">
        {/* Logo */}
        <motion.img
          src="/ECL_LOGO_Sage.png"
          alt="SAGE Logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-48 md:w-64 drop-shadow-2xl"
        />

        {/* Headline */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-100 mb-2">
            What do you want to learn?
          </h1>
          <p className="text-neutral-400 text-sm md:text-base">
            Type a topic, skill, or technology — SAGE will find the right questions.
          </p>
        </motion.div>

        {/* Input */}
        <motion.div
          className="w-full relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28 }}
        >
          <div
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200 ${inputFocused
              ? "border-orange-500/60 bg-neutral-900 shadow-[0_0_32px_rgba(249,115,22,0.12)]"
              : "border-neutral-800 bg-neutral-900/80"
              }`}
          >
            {/* Search icon */}
            <svg className="w-5 h-5 text-neutral-500 shrink-0" fill="none" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="m20 20-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>

            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="e.g. React hooks, Docker, PostgreSQL…"
              className="flex-1 bg-transparent text-neutral-100 placeholder-neutral-500 text-base outline-none"
            />

            {/* Submit arrow button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              onClick={handleSubmit}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 transition shadow-md shadow-orange-500/30"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          </div>

          {/* Live topic suggestions */}
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute top-full mt-2 left-0 right-0 flex flex-wrap gap-2 px-1"
            >
              {suggestions.map(s => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/15 text-orange-300 border border-orange-500/20"
                >
                  {s}
                </span>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Skip link */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => onStart([])}
          className="text-sm text-neutral-500 hover:text-neutral-300 transition underline underline-offset-4"
        >
          Skip — I&apos;ll pick topics manually
        </motion.button>
      </div>
    </motion.div>
  );
}

// ==========================================
// UTILS & CONSTANTS
// ==========================================
const topicDefaultLanguage = (topic: string) => {
  switch (topic) {
    case "backend":
      return "python"; // FastAPI in your workspace
    case "frontend":
      return "typescript"; // Next.js/TS
    case "ml":
      return "python";
    case "devops":
      return "bash";
    case "mobile":
      return "typescript";  // React Native
    case "dataeng":
      return "sql";
    default:
      return "typescript";
  }
};

const LANGUAGE_OPTIONS = [
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "sql", label: "SQL" },
  { id: "bash", label: "Bash" },
] as const;

// ==========================================
// MAIN APPLICATION COMPONENT
// ==========================================
function MainApp({ initialTopics = [] }: { initialTopics?: string[] }) {
  // --------- Hardcoded Topics Data ---------
  const SUBJECTS: { name: string; items: string[] }[] = [
    {
      name: "Frontend",
      items: [
        "React",
        "Next.js",
        "TypeScript",
        "JavaScript",
        "CSS",
        "TailwindCSS",
        "Accessibility",
        "Web Performance",
        "State Management",
        "Redux",
        "Zustand",
        "MobX",
        "Testing Library",
        "Jest",
        "Playwright",
        "Animations",
        "Framer Motion",
        "SSR",
        "CSR",
        "Hydration",
        "Code Splitting",
        "Memoization",
        "WebSockets",
        "Service Workers",
        "PWA",
        "i18n",
        "Form Handling",
        "React Query",
        "TanStack Query",
        "Vite",
        "Webpack",
        "Babel",
        "Storybook",
        "Design Systems",
        "Component Architecture",
        "Hooks",
        "Context API",
      ],
    },
    {
      name: "Backend",
      items: [
        "APIs",
        "REST",
        "GraphQL",
        "gRPC",
        "Microservices",
        "Monolith",
        "Caching",
        "Redis",
        "Queues",
        "RabbitMQ",
        "Kafka",
        "Databases",
        "PostgreSQL",
        "MySQL",
        "MongoDB",
        "ORM",
        "Prisma",
        "SQLAlchemy",
        "Auth",
        "OAuth2",
        "JWT",
        "Rate Limiting",
        "Circuit Breaker",
        "Observability",
        "Metrics",
        "Tracing",
        "Logging",
        "Testing",
        "Pagination",
        "Idempotency",
        "Schema Migrations",
        "Multi-tenancy",
        "API Gateway",
        "Service Discovery",
      ],
    },
    {
      name: "DevOps",
      items: [
        "Docker",
        "Kubernetes",
        "Helm",
        "CI/CD",
        "GitHub Actions",
        "Terraform",
        "Ansible",
        "Prometheus",
        "Grafana",
        "ArgoCD",
        "Autoscaling",
        "Blue-Green",
        "Canary",
        "Load Balancing",
        "Nginx",
        "Istio",
        "Linkerd",
        "Secrets",
        "ConfigMaps",
        "RBAC",
        "Ingress",
        "EKS",
        "GKE",
        "AKS",
        "Cost Optimization",
      ],
    },
    {
      name: "System Design",
      items: [
        "Scalability",
        "Availability",
        "Consistency",
        "CAP Theorem",
        "Sharding",
        "Replication",
        "Leader Election",
        "Distributed Caching",
        "CDN",
        "Global Traffic",
        "Failover",
        "Backpressure",
        "Rate Limiting",
        "Event Sourcing",
        "CQRS",
        "Read/Write Splitting",
        "Geo-partitioning",
        "Hot Partitions",
      ],
    },
    {
      name: "Machine Learning",
      items: [
        "Model Training",
        "Data Preprocessing",
        "Feature Engineering",
        "Cross Validation",
        "Regularization",
        "Hyperparameter Tuning",
        "Overfitting",
        "Underfitting",
        "Model Serving",
        "Batch Inference",
        "Streaming Inference",
        "Embeddings",
        "Vector Databases",
        "Evaluation",
        "Drift Detection",
        "A/B Testing",
        "Monitoring",
        "Retraining",
      ],
    },
    {
      name: "Mobile",
      items: [
        "React Native",
        "Swift",
        "Kotlin",
        "Android",
        "iOS",
        "Flutter",
        "Performance",
        "Offline Sync",
        "Push Notifications",
        "Background Tasks",
        "Deep Links",
        "App Store",
        "Play Store",
        "Crash Reporting",
      ],
    },
    {
      name: "Security",
      items: [
        "OWASP",
        "Input Validation",
        "XSS",
        "CSRF",
        "SQL Injection",
        "Secrets Management",
        "Vulnerability Scanning",
        "Penetration Testing",
        "Threat Modeling",
        "Audit Logging",
        "Encryption",
        "TLS",
        "mTLS",
        "SSO",
      ],
    },
    {
      name: "Data Engineering",
      items: [
        "ETL",
        "ELT",
        "Batch Processing",
        "Stream Processing",
        "Spark",
        "Flink",
        "Airflow",
        "dbt",
        "Lakehouse",
        "Delta Lake",
        "Data Quality",
        "Data Lineage",
        "Data Catalog",
        "Parquet",
        "Iceberg",
        "Hudi",
      ],
    },
  ];

  // --------- Core Application State ---------
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialTopics);
  const [openSections, setOpenSections] = useState<string[]>(
    (() => {
      // Pre-open sections that contain any of the initial topics
      if (!initialTopics.length) return [];
      return [
        { name: "Frontend", items: ["React", "Next.js", "TypeScript", "JavaScript", "CSS", "TailwindCSS", "Accessibility", "Web Performance", "State Management", "Redux", "Zustand", "MobX", "Testing Library", "Jest", "Playwright", "Animations", "Framer Motion", "SSR", "CSR", "Hydration", "Code Splitting", "Memoization", "WebSockets", "Service Workers", "PWA", "i18n", "Form Handling", "React Query", "TanStack Query", "Vite", "Webpack", "Babel", "Storybook", "Design Systems", "Component Architecture", "Hooks", "Context API"] },
        { name: "Backend", items: ["APIs", "REST", "GraphQL", "gRPC", "Microservices", "Monolith", "Caching", "Redis", "Queues", "RabbitMQ", "Kafka", "Databases", "PostgreSQL", "MySQL", "MongoDB", "ORM", "Prisma", "SQLAlchemy", "Auth", "OAuth2", "JWT", "Rate Limiting", "Circuit Breaker", "Observability", "Metrics", "Tracing", "Logging", "Testing", "Pagination", "Idempotency", "Schema Migrations", "Multi-tenancy", "API Gateway", "Service Discovery"] },
        { name: "DevOps", items: ["Docker", "Kubernetes", "Helm", "CI/CD", "GitHub Actions", "Terraform", "Ansible", "Prometheus", "Grafana", "ArgoCD", "Autoscaling", "Blue-Green", "Canary", "Load Balancing", "Nginx", "Istio", "Linkerd", "Secrets", "ConfigMaps", "RBAC", "Ingress", "EKS", "GKE", "AKS", "Cost Optimization"] },
        { name: "System Design", items: ["Scalability", "Availability", "Consistency", "CAP Theorem", "Sharding", "Replication", "Leader Election", "Distributed Caching", "CDN", "Global Traffic", "Failover", "Backpressure", "Rate Limiting", "Event Sourcing", "CQRS", "Read/Write Splitting", "Geo-partitioning", "Hot Partitions"] },
        { name: "Machine Learning", items: ["Model Training", "Data Preprocessing", "Feature Engineering", "Cross Validation", "Regularization", "Hyperparameter Tuning", "Overfitting", "Underfitting", "Model Serving", "Batch Inference", "Streaming Inference", "Embeddings", "Vector Databases", "Evaluation", "Drift Detection", "A/B Testing", "Monitoring", "Retraining"] },
        { name: "Mobile", items: ["React Native", "Swift", "Kotlin", "Android", "iOS", "Flutter", "Performance", "Offline Sync", "Push Notifications", "Background Tasks", "Deep Links", "App Store", "Play Store", "Crash Reporting"] },
        { name: "Security", items: ["OWASP", "Input Validation", "XSS", "CSRF", "SQL Injection", "Secrets Management", "Vulnerability Scanning", "Penetration Testing", "Threat Modeling", "Audit Logging", "Encryption", "TLS", "mTLS", "SSO"] },
        { name: "Data Engineering", items: ["ETL", "ELT", "Batch Processing", "Stream Processing", "Spark", "Flink", "Airflow", "dbt", "Lakehouse", "Delta Lake", "Data Quality", "Data Lineage", "Data Catalog", "Parquet", "Iceberg", "Hudi"] },
      ].filter(s => s.items.some(i => initialTopics.includes(i))).map(s => s.name);
    })()
  );
  const [questionTypes, setQuestionTypes] = useState<string[]>(["MCQ"]);
  const [difficulty, setDifficulty] = useState<string>("Bachelor");
  const [attemptsLeft, setAttemptsLeft] = useState(2);
  const [lastWrongIndex, setLastWrongIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ status: "idle" | "correct" | "wrong"; hint?: string }>({ status: "idle" });
  const [blankInput, setBlankInput] = useState("");

  const [shortAnswer, setShortAnswer] = useState("");
  const [shortLineOk, setShortLineOk] = useState<boolean[]>([false, false, false, false]);
  const [shortScore01, setShortScore01] = useState(0);

  const [code, setCode] = useState("");
  const [codeMatched, setCodeMatched] = useState<string[]>([]);
  const [codeMissing, setCodeMissing] = useState<string[]>([]);
  const [codeScore01, setCodeScore01] = useState(0);
  const [codeLanguage, setCodeLanguage] = useState<string>("typescript");
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [languageTouched, setLanguageTouched] = useState(false);

  // ---------- Idle timer ----------
  const [idleSeconds, setIdleSeconds] = useState(0);
  const lastCodeRef = useRef(code);
  const idleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---------- Incident popup ----------
  const [showIncidentPopup, setShowIncidentPopup] = useState(false);

  const activeType = questionTypes[0];


  const [backend, setBackend] = useState<BackendPreview>({
    apiLoad: 0.45,
    apiErrors: 0.015,
    cacheHit: 0.4,
    dbConn: 40,
    qps: 150,
    latency: 50,
  });
  const [frontend, setFrontend] = useState<FrontendPreview>({ fps: 55, bundleKB: 420, hydrationMs: 180, reRenders: 3 });
  const [ml, setML] = useState<MLPreview>({ trainLoss: 0.62, valLoss: 0.78, epoch: 3, overfitRisk: 0.35 });
  const [devops, setDevOps] = useState<DevOpsPreview>({ deployTime: 45, clusterHealth: 0.95, errorRate: 0.02, costsPerHr: 12.5 });
  const [sysdesign, setSysDesign] = useState<SysDesignPreview>({ throughput: 1200, availability: 0.999, nodeCount: 5, bottleneckRisk: 0.4 });
  const [mobile, setMobile] = useState<MobilePreview>({ launchTime: 2.1, bundleSizeKB: 8500, crashRate: 0.012, batteryDrain: 0.25 });
  const [security, setSecurity] = useState<SecurityPreview>({ vulnCount: 8, encryptionCoverage: 0.85, authFailures: 0.04, patchAgeDays: 14 });
  const [dataeng, setDataEng] = useState<DataEngPreview>({ pipelineLatency: 120, dataFreshness: 10, throughput: 5000, dataQualityScore: 0.88 });

  const previewControlsInit = {
    backendTraffic: 1,
    enableCache: false,
    useReadReplicas: false,
    enableCodeSplit: false,
    enableMemo: false,
    mlReg: false,
    mlAug: false,
    devOpsAutoScaling: false,
    sysDesignSharding: false,
    mobileOfflineSync: false,
    secMtls: false,
    dataEngStreaming: false,
  };
  const [previewControls, setPreviewControls] = useState(previewControlsInit);

  // --------- Refs & Layout State ---------
  // Track previous values so we can highlight changes (orange)
  const prevBackendRef = useRef<BackendPreview>(backend);
  const prevFrontendRef = useRef<FrontendPreview>(frontend);
  const prevMLRef = useRef<MLPreview>(ml);
  const prevDevOpsRef = useRef<DevOpsPreview>(devops);
  const prevSysDesignRef = useRef<SysDesignPreview>(sysdesign);
  const prevMobileRef = useRef<MobilePreview>(mobile);
  const prevSecurityRef = useRef<SecurityPreview>(security);
  const prevDataEngRef = useRef<DataEngPreview>(dataeng);

  useEffect(() => { prevBackendRef.current = backend; }, [backend]);
  useEffect(() => { prevFrontendRef.current = frontend; }, [frontend]);
  useEffect(() => { prevMLRef.current = ml; }, [ml]);
  useEffect(() => { prevDevOpsRef.current = devops; }, [devops]);
  useEffect(() => { prevSysDesignRef.current = sysdesign; }, [sysdesign]);
  useEffect(() => { prevMobileRef.current = mobile; }, [mobile]);
  useEffect(() => { prevSecurityRef.current = security; }, [security]);
  useEffect(() => { prevDataEngRef.current = dataeng; }, [dataeng]);

  // Resizable split between question and preview
  const [leftPct, setLeftPct] = useState(58);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };
  const onDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.min(78, Math.max(30, (x / rect.width) * 100));
    setLeftPct(Math.round(pct));
  };
  const endDrag = () => {
    setDragging(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  // --------- Topic Selection Handlers ---------
  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) => (prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]));
  };
  const toggleSection = (section: string) => {
    setOpenSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]));
  };
  const toggleQuestionType = (type: string) => {
    // Make it exclusive (radio behavior)
    setQuestionTypes([type]);

    // Clear previous questions so UI resets cleanly
    setQuestions([]);
    setCurrentIdx(0);
    resetQuestionState();
  };

  // --------- Reset State Helper ---------
  // freshQuestions: pass the newly-fetched array so we can read language
  // before React has re-rendered with the new `questions` state.
  const resetQuestionState = (idx?: number, freshQuestions?: Question[]) => {
    const targetIdx = idx !== undefined ? idx : currentIdx;
    const pool = freshQuestions ?? questions;
    const targetQ = pool[targetIdx];

    setAttemptsLeft(2);
    setLastWrongIndex(null);
    setFeedback({ status: "idle" });
    setBlankInput("");

    setShortAnswer("");
    setShortLineOk([false, false, false, false]);
    setShortScore01(0);

    setCode(targetQ?.starterCode || "");
    setCodeMatched([]);
    setCodeMissing([]);
    setCodeScore01(0);

    // Always reset languageTouched so autodetect runs fresh for each question
    setLanguageTouched(false);

    // Apply language from the question if available
    if (targetQ?.language) {
      setCodeLanguage(targetQ.language.trim().toLowerCase());
    }
  };

  // --------- Preview Value Selectors ---------
  const currentTopic = useMemo(() => {
    // 1. First, try to extract the organic topic assigned to the CURRENT question by the LLM
    let activeTopicNames: string[] = selectedSubjects;

    if (questions[currentIdx]?.scenario) {
      const match = questions[currentIdx].scenario.match(/\(Topic:\s*(.*?)\)/i);
      if (match && match[1]) {
        // Splitting by ' and ' to handle grouped multi-part topics
        activeTopicNames = match[1].split(/\s+and\s+/i).map(t => t.trim());
      }
    }

    const hasBackend = activeTopicNames.some((s) =>
      SUBJECTS.find(sub => sub.name === "Backend")?.items.includes(s) ||
      ["APIs", "Databases", "Caching", "Redis", "Kafka"].includes(s)
    );

    const hasFrontend = activeTopicNames.some((s) =>
      SUBJECTS.find(sub => sub.name === "Frontend")?.items.includes(s) ||
      ["React", "CSS", "Web Performance", "SSR", "Hydration"].includes(s)
    );

    const hasML = activeTopicNames.some((s) =>
      SUBJECTS.find(sub => sub.name === "Machine Learning")?.items.includes(s) ||
      ["Model Training", "Regularization", "Evaluation"].includes(s)
    );

    const hasDevOps = activeTopicNames.some((s) => SUBJECTS.find(sub => sub.name === "DevOps")?.items.includes(s));
    const hasSysDesign = activeTopicNames.some((s) => SUBJECTS.find(sub => sub.name === "System Design")?.items.includes(s));
    const hasMobile = activeTopicNames.some((s) => SUBJECTS.find(sub => sub.name === "Mobile")?.items.includes(s));
    const hasSecurity = activeTopicNames.some((s) => SUBJECTS.find(sub => sub.name === "Security")?.items.includes(s));
    const hasDataEng = activeTopicNames.some((s) => SUBJECTS.find(sub => sub.name === "Data Engineering")?.items.includes(s));

    if (hasBackend) return "backend";
    if (hasFrontend) return "frontend";
    if (hasML) return "ml";
    if (hasDevOps) return "devops";
    if (hasSysDesign) return "sysdesign";
    if (hasMobile) return "mobile";
    if (hasSecurity) return "security";
    if (hasDataEng) return "dataeng";

    return "generic";
  }, [selectedSubjects, questions, currentIdx]);

  useEffect(() => {
    // React directly to the new `currentTopic` instead of recalculating via `selectedSubjects`
    if (currentTopic === "backend") {
      setBackend({
        apiLoad: 0.5,
        apiErrors: 0.02,
        cacheHit: previewControls.enableCache ? 0.45 : 0.2,
        dbConn: previewControls.useReadReplicas ? 50 : 60,
        qps: 180,
        latency: previewControls.useReadReplicas ? 48 : 62,
      });
    } else if (currentTopic === "frontend") {
      setFrontend({
        fps: 58,
        bundleKB: previewControls.enableCodeSplit ? 360 : 520,
        hydrationMs: previewControls.enableMemo ? 160 : 220,
        reRenders: previewControls.enableMemo ? 2 : 5,
      });
    } else if (currentTopic === "ml") {
      setML({
        trainLoss: 0.55,
        valLoss: previewControls.mlReg ? 0.62 : 0.78,
        epoch: 1,
        overfitRisk: previewControls.mlReg ? 0.25 : 0.45,
      });
    } else if (currentTopic === "devops") {
      setDevOps({
        deployTime: 45,
        clusterHealth: previewControls.devOpsAutoScaling ? 0.98 : 0.85,
        errorRate: 0.01,
        costsPerHr: previewControls.devOpsAutoScaling ? 18.5 : 12.0,
      });
    } else if (currentTopic === "sysdesign") {
      setSysDesign({
        throughput: previewControls.sysDesignSharding ? 5000 : 1500,
        availability: 0.999,
        nodeCount: previewControls.sysDesignSharding ? 12 : 3,
        bottleneckRisk: previewControls.sysDesignSharding ? 0.1 : 0.6,
      });
    } else if (currentTopic === "mobile") {
      setMobile({
        launchTime: 1.8,
        bundleSizeKB: 6500,
        crashRate: previewControls.mobileOfflineSync ? 0.01 : 0.05,
        batteryDrain: 0.15,
      });
    } else if (currentTopic === "security") {
      setSecurity({
        vulnCount: 2,
        encryptionCoverage: previewControls.secMtls ? 1.0 : 0.6,
        authFailures: 0.02,
        patchAgeDays: 5,
      });
    } else if (currentTopic === "dataeng") {
      setDataEng({
        pipelineLatency: previewControls.dataEngStreaming ? 5 : 120,
        dataFreshness: previewControls.dataEngStreaming ? 1 : 15,
        throughput: previewControls.dataEngStreaming ? 25000 : 5000,
        dataQualityScore: 0.92,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentTopic, previewControls.enableCache, previewControls.useReadReplicas,
    previewControls.enableCodeSplit, previewControls.enableMemo, previewControls.mlReg,
    previewControls.devOpsAutoScaling, previewControls.sysDesignSharding, previewControls.mobileOfflineSync,
    previewControls.secMtls, previewControls.dataEngStreaming
  ]);

  // --------- Scenario Generation (API Call) ---------
  const generateScenario = async () => {
    if (selectedSubjects.length === 0) {
      setQuestions([]);
      setCurrentIdx(0);
      resetQuestionState();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjects: selectedSubjects,
          types: questionTypes.filter((t) =>
            ["MCQ", "Fill in the Blanks", "Short Answer", "Coding"].includes(t)
          ),
          count: 5,
          difficulty: difficulty,
        }),
      });

      const data = await response.json();

      const rawQs = Array.isArray(data.questions) ? data.questions : [];

      const qs: Question[] = rawQs.map((q: any) => {
        // Enforce the selected question type to prevent the API 
        // from defaulting to MCQ when a different type was requested.
        const forcedType = questionTypes[0] as Question["type"];
        return {
          ...q,
          type: forcedType,
        };
      });

      setQuestions(qs);
      setCurrentIdx(0);
      resetQuestionState(0, qs);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([]);
      setCurrentIdx(0);
      resetQuestionState(0, []);
    }

    setLoading(false);
  };


  const current = questions[currentIdx];

  // --------- Code Editor Effects ---------
  useEffect(() => {
    if (!current || current.type !== "Coding") return;

    // Prefill code only when current question changes or is first loaded
    if (!code || code.trim() === "" || code === "// implement solution here") {
      setCode(current.starterCode || "// implement solution here");
    }
    // Infer language from question or topic, unless user manually changed it
    const inferred = (current.language || "").trim().toLowerCase() || topicDefaultLanguage(currentTopic);
    setCodeLanguage((prev) => (languageTouched ? prev : inferred));

    setLanguageMenuOpen(false);
    // Reset idle timer when question changes
    setIdleSeconds(0);
    lastCodeRef.current = code;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, current?.type]);

  // --------- Idle Timer ---------
  useEffect(() => {
    if (!current || current.type !== "Coding") return;
    if (feedback.status === "correct" || (feedback.status === "wrong" && attemptsLeft <= 0)) return;

    if (idleIntervalRef.current) clearInterval(idleIntervalRef.current);
    idleIntervalRef.current = setInterval(() => {
      if (code !== lastCodeRef.current) {
        // User typed — reset idle counter
        lastCodeRef.current = code;
        setIdleSeconds(0);
      } else {
        setIdleSeconds(prev => {
          const next = prev + 1;
          // Every 8 seconds of idle, degrade stats for Veteran / Working Professional
          if (next % 8 === 0) {
            const shouldDegrade = difficulty === "Veteran" || difficulty === "Working Professional";
            if (shouldDegrade) applyOutcome("wrongHint");
          }
          return next;
        });
      }
    }, 1000);

    return () => { if (idleIntervalRef.current) clearInterval(idleIntervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, code, feedback.status, attemptsLeft, difficulty]);

  useEffect(() => {
    if (!current || current.type !== "Coding") return;

    const req = (current.requiredTokens || [])
      .map((t) => t.trim())
      .filter(Boolean);

    const src = code || "";

    const matched: string[] = [];
    const missing: string[] = [];

    for (const t of req) {
      if (src.toLowerCase().includes(t.toLowerCase())) {
        matched.push(t);
      } else {
        missing.push(t);
      }
    }

    const score = req.length ? matched.length / req.length : 0;

    setCodeMatched(matched);
    setCodeMissing(missing);
    setCodeScore01(score);
  }, [code, current]);


  // --------- Score & Outcome Handler ---------
  // Updates the preview metrics based on whether the user's answer was correct or wrong.
  const applyOutcome = (kind: "correct" | "wrongHint" | "wrongFinal") => {
    const hasBackend = currentTopic === "backend";
    const hasFrontend = currentTopic === "frontend";
    const hasML = currentTopic === "ml";

    if (hasBackend) {
      setBackend((b) => {
        const loadDelta = kind === "correct" ? -0.08 : kind === "wrongHint" ? 0.06 : 0.12;
        const errDelta = kind === "correct" ? -0.01 : kind === "wrongHint" ? 0.008 : 0.015;
        const cacheDelta = previewControls.enableCache ? (kind === "correct" ? 0.12 : kind === "wrongFinal" ? -0.18 : -0.08) : 0;
        const connDelta = previewControls.useReadReplicas ? (kind === "correct" ? -8 : 10) : kind === "correct" ? -4 : 12;
        const qpsDelta = kind === "correct" ? 25 : -20;
        const latDelta = kind === "correct" ? -10 : kind === "wrongHint" ? 8 : 18;
        return {
          apiLoad: Math.min(1, Math.max(0.05, b.apiLoad + loadDelta * previewControls.backendTraffic)),
          apiErrors: Math.min(0.35, Math.max(0, b.apiErrors + errDelta)),
          cacheHit: Math.min(0.98, Math.max(0.02, b.cacheHit + cacheDelta)),
          dbConn: Math.min(260, Math.max(8, b.dbConn + connDelta)),
          qps: Math.min(500, Math.max(10, b.qps + qpsDelta)),
          latency: Math.min(300, Math.max(10, b.latency + latDelta)),
        };
      });
    }

    if (hasFrontend) {
      setFrontend((f) => {
        const fpsDelta = kind === "correct" ? 6 : kind === "wrongHint" ? -4 : -8;
        const bundleDelta = kind === "correct" ? -40 : kind === "wrongHint" ? 30 : 60;
        const hydrateDelta = kind === "correct" ? -25 : kind === "wrongFinal" ? 40 : 18;
        const renderDelta = kind === "correct" ? -1 : kind === "wrongFinal" ? 2 : 1;
        return {
          fps: Math.min(120, Math.max(20, f.fps + fpsDelta)),
          bundleKB: Math.max(120, f.bundleKB + (previewControls.enableCodeSplit ? bundleDelta : bundleDelta / 2)),
          hydrationMs: Math.min(800, Math.max(40, f.hydrationMs + (previewControls.enableMemo ? hydrateDelta : hydrateDelta / 2))),
          reRenders: Math.min(20, Math.max(0, f.reRenders + renderDelta)),
        };
      });
    }

    if (hasML) {
      setML((m) => {
        const tl = kind === "correct" ? -0.06 : 0.04;
        const vl = kind === "correct" ? -0.05 : 0.06;
        const of = kind === "correct" ? -0.06 : kind === "wrongFinal" ? 0.12 : 0.08;
        return {
          trainLoss: Math.max(0.01, m.trainLoss + tl),
          valLoss: Math.max(0.01, m.valLoss + (previewControls.mlReg ? vl / 2 : vl)),
          epoch: m.epoch + (kind === "correct" ? 1 : 0),
          overfitRisk: Math.min(1, Math.max(0, m.overfitRisk + of)),
        };
      });
    }

    if ((currentTopic as any) === "devops") {
      setDevOps((d) => {
        const deployDelta = kind === "correct" ? -5 : kind === "wrongFinal" ? 15 : 8;
        const healthDelta = kind === "correct" ? 0.05 : kind === "wrongFinal" ? -0.1 : -0.04;
        const errDelta = kind === "correct" ? -0.01 : kind === "wrongFinal" ? 0.03 : 0.01;
        const costDelta = previewControls.devOpsAutoScaling ? (kind === "correct" ? -2 : 5) : (kind === "correct" ? -1 : 8);
        return {
          deployTime: Math.min(300, Math.max(10, d.deployTime + deployDelta)),
          clusterHealth: Math.min(1.0, Math.max(0.1, d.clusterHealth + healthDelta)),
          errorRate: Math.min(0.5, Math.max(0.001, d.errorRate + errDelta)),
          costsPerHr: Math.min(100, Math.max(5, d.costsPerHr + costDelta))
        };
      });
    }

    if ((currentTopic as any) === "sysdesign") {
      setSysDesign((s) => {
        const tputDelta = previewControls.sysDesignSharding ? (kind === "correct" ? 500 : -800) : (kind === "correct" ? 200 : -400);
        const availDelta = kind === "correct" ? 0.001 : kind === "wrongFinal" ? -0.05 : -0.01;
        const nodeDelta = previewControls.sysDesignSharding ? (kind === "correct" ? 1 : 2) : 0;
        const riskDelta = kind === "correct" ? -0.05 : kind === "wrongFinal" ? 0.2 : 0.08;
        return {
          throughput: Math.min(50000, Math.max(100, s.throughput + tputDelta)),
          availability: Math.min(0.9999, Math.max(0.8, s.availability + availDelta)),
          nodeCount: Math.min(100, Math.max(1, s.nodeCount + nodeDelta)),
          bottleneckRisk: Math.min(1.0, Math.max(0.01, s.bottleneckRisk + riskDelta))
        };
      });
    }

    if ((currentTopic as any) === "mobile") {
      setMobile((m) => {
        const launchDelta = kind === "correct" ? -0.3 : kind === "wrongFinal" ? 0.8 : 0.4;
        const bundleDelta = kind === "correct" ? -200 : kind === "wrongFinal" ? 1500 : 500;
        const crashDelta = kind === "correct" ? -0.005 : kind === "wrongFinal" ? 0.02 : 0.01;
        const batDelta = previewControls.mobileOfflineSync ? (kind === "correct" ? -0.02 : 0.05) : (kind === "correct" ? -0.01 : 0.08);
        return {
          launchTime: Math.min(10.0, Math.max(0.5, m.launchTime + launchDelta)),
          bundleSizeKB: Math.min(50000, Math.max(1000, m.bundleSizeKB + bundleDelta)),
          crashRate: Math.min(0.2, Math.max(0.001, m.crashRate + crashDelta)),
          batteryDrain: Math.min(0.8, Math.max(0.05, m.batteryDrain + batDelta))
        };
      });
    }

    if ((currentTopic as any) === "security") {
      setSecurity((s) => {
        const vulnDelta = kind === "correct" ? -1 : kind === "wrongFinal" ? 3 : 1;
        const encDelta = previewControls.secMtls ? (kind === "correct" ? 0.05 : -0.1) : (kind === "correct" ? 0.02 : -0.15);
        const authDelta = kind === "correct" ? -0.01 : kind === "wrongFinal" ? 0.05 : 0.02;
        const patchDelta = kind === "correct" ? -1 : kind === "wrongFinal" ? 5 : 2;
        return {
          vulnCount: Math.min(50, Math.max(0, s.vulnCount + vulnDelta)),
          encryptionCoverage: Math.min(1.0, Math.max(0.1, s.encryptionCoverage + encDelta)),
          authFailures: Math.min(0.5, Math.max(0.001, s.authFailures + authDelta)),
          patchAgeDays: Math.min(100, Math.max(0, s.patchAgeDays + patchDelta))
        };
      });
    }

    if ((currentTopic as any) === "dataeng") {
      setDataEng((d) => {
        const latDelta = previewControls.dataEngStreaming ? (kind === "correct" ? -1 : 5) : (kind === "correct" ? -10 : 30);
        const freshDelta = previewControls.dataEngStreaming ? (kind === "correct" ? -0.2 : 1) : (kind === "correct" ? -2 : 5);
        const tputDelta = kind === "correct" ? 1000 : kind === "wrongFinal" ? -3000 : -1000;
        const scoreDelta = kind === "correct" ? 0.02 : kind === "wrongFinal" ? -0.08 : -0.03;
        return {
          pipelineLatency: Math.min(1000, Math.max(1, d.pipelineLatency + latDelta)),
          dataFreshness: Math.min(1440, Math.max(0.5, d.dataFreshness + freshDelta)),
          throughput: Math.min(100000, Math.max(100, d.throughput + tputDelta)),
          dataQualityScore: Math.min(1.0, Math.max(0.1, d.dataQualityScore + scoreDelta))
        };
      });
    }
  };

  // --------- MCQ Handler ---------
  const onSelectOption = (idx: number) => {
    if (!current || current.type !== "MCQ") return;
    if (attemptsLeft <= 0 || feedback.status === "correct") return;
    const correct = current.correctIndex ?? 0;
    if (idx === correct) {
      setFeedback({ status: "correct", hint: "Good choice. Preview metrics improved." });
      setLastWrongIndex(null);
      applyOutcome("correct");
    } else {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);
      setLastWrongIndex(idx);
      if (remaining <= 0) {
        setFeedback({
          status: "wrong",
          hint: `Correct: ${current.options?.[correct]}\nReason: ${current.reason || "Best fits the scenario constraints."}`,
        });
        applyOutcome("wrongFinal");
      } else {
        setFeedback({ status: "wrong", hint: current.hint || "Re-read the scenario and identify key constraints." });
        applyOutcome("wrongHint");
      }
    }
  };

  // --------- Fill in the Blanks Handler ---------
  const onSubmitBlank = () => {
    if (!current || current.type !== "Fill in the Blanks") return;
    if (attemptsLeft <= 0 || feedback.status === "correct") return;

    const expected = (current.answer || "").trim();
    const got = blankInput.trim();

    const isCorrect = got.toLowerCase() === expected.toLowerCase();

    if (isCorrect) {
      setFeedback({
        status: "correct",
        hint: `You entered: ${got}\nResult: Correct.\n\nReason: ${current.reason || ""}`,
      });
      applyOutcome("correct");
    } else {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);
      if (remaining <= 0) {
        setFeedback({
          status: "wrong",
          hint: `You entered: ${got}\nExpected: ${expected}\n\nReason: ${current.reason || ""}`,
        });
        applyOutcome("wrongFinal");
      } else {
        setFeedback({
          status: "wrong",
          hint: `You entered: ${got}\nResult: Not quite.\nHint: ${current.hint || ""}`,
        });
        applyOutcome("wrongHint");
      }
    }
  };

  useEffect(() => {
    if (!current || current.type !== "Short Answer") return;

    const kws = (current.keywords || []).map((k) => k.toLowerCase()).filter(Boolean);
    const lines = shortAnswer.split("\n").slice(0, 4);

    const nextLineOk = [false, false, false, false];
    let hits = 0;

    for (let i = 0; i < 4; i++) {
      const line = (lines[i] || "").toLowerCase();
      if (!line.trim()) continue;

      const lineHits = kws.filter((k) => line.includes(k)).length;
      if (lineHits > 0) nextLineOk[i] = true;
      hits += lineHits;
    }

    const denom = Math.max(1, kws.length);
    const score01 = Math.min(1, hits / denom);

    setShortLineOk(nextLineOk);
    setShortScore01(score01);
  }, [shortAnswer, current]);

  // --------- Short Answer Handler ---------
  const onSubmitShortAnswer = () => {
    if (!current || current.type !== "Short Answer") return;
    if (attemptsLeft <= 0 || feedback.status === "correct") return;

    const ok = shortScore01 >= 0.6;

    if (ok) {
      setFeedback({
        status: "correct",
        hint: `Looks good.\n\nRubric:\n- ${(current.rubric || []).join("\n- ")}`,
      });
      applyOutcome("correct");
    } else {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);
      if (remaining <= 0) {
        setFeedback({
          status: "wrong",
          hint: `Missing key points.\nExpected keywords: ${(current.keywords || []).join(", ")}\n\nRubric:\n- ${(current.rubric || []).join(
            "\n- "
          )}`,
        });
        applyOutcome("wrongFinal");
      } else {
        setFeedback({
          status: "wrong",
          hint: `Try to include: ${(current.keywords || []).slice(0, 6).join(", ")}\n(Answer max 4 lines)`,
        });
        applyOutcome("wrongHint");
      }
    }
  };

  // ✅ Coding: live token checks + drive preview
  useEffect(() => {
    if (!current || current.type !== "Coding") return;

    const req = (current.requiredTokens || []).map((t) => t.trim()).filter(Boolean);
    const src = code || "";

    const matched: string[] = [];
    const missing: string[] = [];

    for (const t of req) {
      if (src.toLowerCase().includes(t.toLowerCase())) matched.push(t);
      else missing.push(t);
    }

    const s01 = req.length ? matched.length / req.length : 0;

    setCodeMatched(matched);
    setCodeMissing(missing);
    setCodeScore01(s01);

    // keep it gentle: only improve when strong signal, otherwise "wrongHint"
    if (s01 >= 0.85) applyOutcome("correct");
    else applyOutcome("wrongHint");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, current]);

  // --------- Navigation Handlers ---------
  const gotoPrev = () => {
    if (currentIdx > 0) {
      const next = currentIdx - 1;
      setCurrentIdx(next);
      resetQuestionState(next);
    }
  };
  const gotoNext = () => {
    if (currentIdx < questions.length - 1) {
      const next = currentIdx + 1;
      setCurrentIdx(next);
      resetQuestionState(next);
    }
  };

  // (PDF upload removed)

  const Checkbox = ({ label }: { label: string }) => {
    const checked = selectedSubjects.includes(label);
    return (
      <div onClick={() => toggleSubject(label)} className="flex items-center gap-3 cursor-pointer group select-none">
        <div
          className={`w-5 h-5 flex items-center justify-center rounded-md border transition-all duration-200 ${checked ? "bg-orange-500 border-orange-500 scale-105" : "border-neutral-700 group-hover:border-neutral-600"
            }`}
        >
          <svg
            className={`w-3 h-3 text-white transition-all duration-200 ${checked ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className={`transition ${checked ? "text-orange-400" : "text-neutral-300 group-hover:text-neutral-100"} font-medium`}>
          {label}
        </span>
      </div>
    );
  };

  const Controls = () => {
    const hasBackend = selectedSubjects.some((s) => ["APIs", "Databases", "Caching", "Redis", "Kafka"].includes(s));
    const hasFrontend = selectedSubjects.some((s) => ["React", "CSS", "Web Performance", "SSR", "Hydration"].includes(s));
    const hasML = selectedSubjects.some((s) => ["Model Training", "Regularization", "Evaluation"].includes(s));
    if (!questions.length) return null;

    return (
      <div className="space-y-3">
        {hasBackend && (
          <div className="rounded-xl p-3 border border-neutral-800 bg-neutral-950/60">
            <p className="text-[11px] uppercase tracking-wide text-neutral-400 mb-2">Backend Controls</p>
            <div className="flex flex-wrap items-center gap-3 min-w-0">
              <label className="text-sm text-neutral-300">Traffic</label>
              <select
                value={previewControls.backendTraffic}
                onChange={(e) => setPreviewControls((c) => ({ ...c, backendTraffic: Number(e.target.value) }))}
                className="bg-neutral-900 border border-neutral-700 rounded-md px-2 py-1 text-sm"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
              </select>

              <label className="text-sm text-neutral-300 ml-2">Cache</label>
              <input
                type="checkbox"
                checked={previewControls.enableCache}
                onChange={(e) => setPreviewControls((c) => ({ ...c, enableCache: e.target.checked }))}
              />

              <label className="text-sm text-neutral-300 ml-2">Replicas</label>
              <input
                type="checkbox"
                checked={previewControls.useReadReplicas}
                onChange={(e) => setPreviewControls((c) => ({ ...c, useReadReplicas: e.target.checked }))}
              />
            </div>
          </div>
        )}

        {hasFrontend && (
          <div className="rounded-xl p-3 border border-neutral-800 bg-neutral-950/60">
            <p className="text-[11px] uppercase tracking-wide text-neutral-400 mb-2">Frontend Controls</p>
            <div className="flex flex-wrap items-center gap-3 min-w-0">
              <label className="text-sm text-neutral-300">Code Split</label>
              <input
                type="checkbox"
                checked={previewControls.enableCodeSplit}
                onChange={(e) => setPreviewControls((c) => ({ ...c, enableCodeSplit: e.target.checked }))}
              />
              <label className="text-sm text-neutral-300 ml-2">Memo</label>
              <input
                type="checkbox"
                checked={previewControls.enableMemo}
                onChange={(e) => setPreviewControls((c) => ({ ...c, enableMemo: e.target.checked }))}
              />
            </div>
          </div>
        )}

        {hasML && (
          <div className="rounded-xl p-3 border border-neutral-800 bg-neutral-950/60">
            <p className="text-[11px] uppercase tracking-wide text-neutral-400 mb-2">ML Controls</p>
            <div className="flex flex-wrap items-center gap-3 min-w-0">
              <label className="text-sm text-neutral-300">Regularization</label>
              <input
                type="checkbox"
                checked={previewControls.mlReg}
                onChange={(e) => setPreviewControls((c) => ({ ...c, mlReg: e.target.checked }))}
              />
              <label className="text-sm text-neutral-300 ml-2">Aug</label>
              <input
                type="checkbox"
                checked={previewControls.mlAug}
                onChange={(e) => setPreviewControls((c) => ({ ...c, mlAug: e.target.checked }))}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // --------- Live Preview UI ----------
  // idleHeat drives white→yellow→orange→red color progression on stat values
  const idleHeat = (() => {
    if (idleSeconds >= 24) return "red";
    if (idleSeconds >= 16) return "orange";
    if (idleSeconds >= 8) return "yellow";
    return "none";
  })();

  const Stat = ({
    label,
    value,
    unit,
    good,
    changed,
    danger,
  }: {
    label: string;
    value: string | number;
    unit?: string;
    good?: boolean;
    changed?: boolean;
    danger?: boolean;
  }) => {
    // Idle heat overrides normal good/changed colour — only when not already danger
    const heatClass =
      danger ? "text-red-200"
        : idleHeat === "red" ? "text-red-300"
          : idleHeat === "orange" ? "text-orange-300"
            : idleHeat === "yellow" ? "text-yellow-200"
              : changed ? "text-orange-300"
                : good ? "text-emerald-300"
                  : "text-neutral-200";

    const ringClass = danger
      ? "ring-1 ring-red-600/40 border-red-700/40"
      : idleHeat === "red" ? "border-red-700/30"
        : idleHeat === "orange" ? "border-orange-700/30"
          : idleHeat === "yellow" ? "border-yellow-700/20"
            : "border-neutral-800";

    return (
      <div className={`flex items-center justify-between gap-3 rounded-xl border bg-neutral-950/60 px-3 py-2 transition-colors duration-700 ${ringClass}`}>
        <div className="text-xs uppercase tracking-wide text-neutral-400">{label}</div>
        <div className={`text-sm font-semibold transition-colors duration-700 ${heatClass}`}>
          {value}
          {unit ? <span className="text-neutral-400 font-medium ml-1">{unit}</span> : null}
        </div>
      </div>
    );
  };

  const LivePreview = () => {
    if (!questions.length) {
      return <div className="text-sm text-neutral-500">Preview appears after you generate questions.</div>;
    }

    // Only treat as "final wrong" after the second wrong attempt (attemptsLeft hits 0)
    const wrongFinal = feedback.status === "wrong" && attemptsLeft <= 0;

    const prevBackend = prevBackendRef.current;
    const prevFrontend = prevFrontendRef.current;
    const prevML = prevMLRef.current;

    return (
      <div className="relative h-full min-h-[420px]">
        {currentTopic === "backend" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wide text-neutral-400 font-medium">Backend Metrics</div>
              <div className="text-xs text-neutral-500">
                Traffic x{previewControls.backendTraffic} • Cache {previewControls.enableCache ? "On" : "Off"} • Replicas{" "}
                {previewControls.useReadReplicas ? "On" : "Off"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Stat
                label="API Load"
                value={(backend.apiLoad * 100).toFixed(0)}
                unit="%"
                good={backend.apiLoad < 0.6}
                changed={backend.apiLoad !== prevBackend.apiLoad}
                danger={wrongFinal && backend.apiLoad > prevBackend.apiLoad}
              />
              <Stat
                label="Error Rate"
                value={(backend.apiErrors * 100).toFixed(2)}
                unit="%"
                good={backend.apiErrors < 0.03}
                changed={backend.apiErrors !== prevBackend.apiErrors}
                danger={wrongFinal && backend.apiErrors > prevBackend.apiErrors}
              />
              <Stat
                label="Cache Hit"
                value={(backend.cacheHit * 100).toFixed(0)}
                unit="%"
                good={backend.cacheHit > 0.5}
                changed={backend.cacheHit !== prevBackend.cacheHit}
                danger={wrongFinal && backend.cacheHit < prevBackend.cacheHit}
              />
              <Stat
                label="DB Conns"
                value={backend.dbConn}
                good={backend.dbConn < 80}
                changed={backend.dbConn !== prevBackend.dbConn}
                danger={wrongFinal && backend.dbConn > prevBackend.dbConn}
              />
              <Stat
                label="QPS"
                value={backend.qps}
                good={backend.qps > 120}
                changed={backend.qps !== prevBackend.qps}
                danger={wrongFinal && backend.qps < prevBackend.qps}
              />
              <Stat
                label="Latency"
                value={backend.latency}
                unit="ms"
                good={backend.latency < 80}
                changed={backend.latency !== prevBackend.latency}
                danger={wrongFinal && backend.latency > prevBackend.latency}
              />
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-3">
              <div className="text-xs uppercase tracking-wide text-neutral-400 mb-2">Live Errors</div>
              {wrongFinal ? (
                <ul className="text-sm text-red-200 space-y-1 list-disc pl-5">
                  <li>Increased 5xx responses under load.</li>
                  <li>Cache stampede causing DB connection spikes.</li>
                  <li>p95 latency breach detected.</li>
                </ul>
              ) : feedback.status === "wrong" ? (
                <div className="text-sm text-red-200">Warning: metrics trending worse. Try the other option.</div>
              ) : (
                <div className="text-sm text-neutral-400">No incidents detected.</div>
              )}
            </div>
          </div>
        )}

        {currentTopic === "frontend" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wide text-neutral-400 font-medium">Frontend Metrics</div>
              <div className="text-xs text-neutral-500">
                Code split {previewControls.enableCodeSplit ? "On" : "Off"} • Memo {previewControls.enableMemo ? "On" : "Off"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Stat
                label="FPS"
                value={Math.round(frontend.fps)}
                good={frontend.fps >= 55}
                changed={frontend.fps !== prevFrontend.fps}
                danger={wrongFinal && frontend.fps < prevFrontend.fps}
              />
              <Stat
                label="Bundle"
                value={Math.round(frontend.bundleKB)}
                unit="KB"
                good={frontend.bundleKB < 420}
                changed={frontend.bundleKB !== prevFrontend.bundleKB}
                danger={wrongFinal && frontend.bundleKB > prevFrontend.bundleKB}
              />
              <Stat
                label="Hydration"
                value={Math.round(frontend.hydrationMs)}
                unit="ms"
                good={frontend.hydrationMs < 200}
                changed={frontend.hydrationMs !== prevFrontend.hydrationMs}
                danger={wrongFinal && frontend.hydrationMs > prevFrontend.hydrationMs}
              />
              <Stat
                label="Re-renders"
                value={frontend.reRenders}
                good={frontend.reRenders <= 3}
                changed={frontend.reRenders !== prevFrontend.reRenders}
                danger={wrongFinal && frontend.reRenders > prevFrontend.reRenders}
              />
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-3">
              <div className="text-xs uppercase tracking-wide text-neutral-400 mb-2">Live Errors</div>
              {wrongFinal ? (
                <ul className="text-sm text-red-200 space-y-1 list-disc pl-5">
                  <li>Layout shift increased (CLS regression).</li>
                  <li>Hydration mismatch warning triggered.</li>
                  <li>Unnecessary re-renders detected in hot path.</li>
                </ul>
              ) : feedback.status === "wrong" ? (
                <div className="text-sm text-red-200">Warning: performance regressed. Try a different mitigation.</div>
              ) : (
                <div className="text-sm text-neutral-400">Preview stable. No warnings.</div>
              )}
            </div>
          </div>
        )}

        {currentTopic === "ml" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wide text-neutral-400 font-medium">ML Training</div>
              <div className="text-xs text-neutral-500">
                Regularization {previewControls.mlReg ? "On" : "Off"} • Aug {previewControls.mlAug ? "On" : "Off"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Stat
                label="Train loss"
                value={ml.trainLoss.toFixed(2)}
                good={ml.trainLoss < 0.6}
                changed={ml.trainLoss !== prevML.trainLoss}
                danger={wrongFinal && ml.trainLoss > prevML.trainLoss}
              />
              <Stat
                label="Val loss"
                value={ml.valLoss.toFixed(2)}
                good={ml.valLoss < 0.75}
                changed={ml.valLoss !== prevML.valLoss}
                danger={wrongFinal && ml.valLoss > prevML.valLoss}
              />
              <Stat label="Epoch" value={ml.epoch} good changed={ml.epoch !== prevML.epoch} danger={false} />
              <Stat
                label="Overfit risk"
                value={(ml.overfitRisk * 100).toFixed(0)}
                unit="%"
                good={ml.overfitRisk < 0.4}
                changed={ml.overfitRisk !== prevML.overfitRisk}
                danger={wrongFinal && ml.overfitRisk > prevML.overfitRisk}
              />
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-3">
              <div className="text-xs uppercase tracking-wide text-neutral-400 mb-2">Live Errors</div>
              {wrongFinal ? (
                <ul className="text-sm text-red-200 space-y-1 list-disc pl-5">
                  <li>Validation loss diverging from training loss.</li>
                  <li>Overfitting risk alert triggered.</li>
                  <li>Data drift suspicion (feature distribution shift).</li>
                </ul>
              ) : feedback.status === "wrong" ? (
                <div className="text-sm text-red-200">Warning: generalization worsened. Try a stronger regularization choice.</div>
              ) : (
                <div className="text-sm text-neutral-400">Training stable. No alerts.</div>
              )}
            </div>
          </div>
        )}

        {/* --- New Missing Topics --- */}

        {currentTopic === "devops" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wide text-neutral-400 font-medium">DevOps Metrics</div>
              <div className="text-xs text-neutral-500">Auto-Scaling {previewControls.devOpsAutoScaling ? "On" : "Off"}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Stat label="Deploy Time" value={devops.deployTime} unit="s" good={devops.deployTime < 60} changed={devops.deployTime !== prevDevOpsRef.current.deployTime} danger={wrongFinal && devops.deployTime > prevDevOpsRef.current.deployTime} />
              <Stat label="Cluster Health" value={(devops.clusterHealth * 100).toFixed(1)} unit="%" good={devops.clusterHealth > 0.9} changed={devops.clusterHealth !== prevDevOpsRef.current.clusterHealth} danger={wrongFinal && devops.clusterHealth < prevDevOpsRef.current.clusterHealth} />
              <Stat label="Error Rate" value={(devops.errorRate * 100).toFixed(2)} unit="%" good={devops.errorRate < 0.05} changed={devops.errorRate !== prevDevOpsRef.current.errorRate} danger={wrongFinal && devops.errorRate > prevDevOpsRef.current.errorRate} />
              <Stat label="Cost" value={devops.costsPerHr.toFixed(2)} unit="$/hr" good={devops.costsPerHr < 20} changed={devops.costsPerHr !== prevDevOpsRef.current.costsPerHr} danger={wrongFinal && devops.costsPerHr > prevDevOpsRef.current.costsPerHr} />
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-3">
              <div className="text-xs uppercase tracking-wide text-neutral-400 mb-2">Live Errors</div>
              {wrongFinal ? (
                <ul className="text-sm text-red-200 space-y-1 list-disc pl-5">
                  <li>Pipeline deployment frozen.</li>
                  <li>OOMKilled events spiraling.</li>
                  <li>Cost explosion detected.</li>
                </ul>
              ) : feedback.status === "wrong" ? (
                <div className="text-sm text-red-200">Warning: Deployment at risk. Consider a safer architectural pattern.</div>
              ) : (
                <div className="text-sm text-neutral-400">System green.</div>
              )}
            </div>
          </div>
        )}

        {currentTopic === "sysdesign" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wide text-neutral-400 font-medium">Sys Design Metrics</div>
              <div className="text-xs text-neutral-500">Sharding {previewControls.sysDesignSharding ? "On" : "Off"}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Stat label="Throughput" value={sysdesign.throughput} unit="req/s" good={sysdesign.throughput > 2000} changed={sysdesign.throughput !== prevSysDesignRef.current.throughput} danger={wrongFinal && sysdesign.throughput < prevSysDesignRef.current.throughput} />
              <Stat label="Availability" value={(sysdesign.availability * 100).toFixed(2)} unit="%" good={sysdesign.availability > 0.99} changed={sysdesign.availability !== prevSysDesignRef.current.availability} danger={wrongFinal && sysdesign.availability < prevSysDesignRef.current.availability} />
              <Stat label="Nodes" value={sysdesign.nodeCount} good={sysdesign.nodeCount < 10} changed={sysdesign.nodeCount !== prevSysDesignRef.current.nodeCount} danger={wrongFinal && sysdesign.nodeCount > prevSysDesignRef.current.nodeCount} />
              <Stat label="Bottleneck Risk" value={(sysdesign.bottleneckRisk * 100).toFixed(0)} unit="%" good={sysdesign.bottleneckRisk < 0.3} changed={sysdesign.bottleneckRisk !== prevSysDesignRef.current.bottleneckRisk} danger={wrongFinal && sysdesign.bottleneckRisk > prevSysDesignRef.current.bottleneckRisk} />
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-3">
              <div className="text-xs uppercase tracking-wide text-neutral-400 mb-2">Live Errors</div>
              {wrongFinal ? (
                <ul className="text-sm text-red-200 space-y-1 list-disc pl-5">
                  <li>Single point of failure triggered outages.</li>
                  <li>Split-brain scenario in distributed cluster.</li>
                </ul>
              ) : feedback.status === "wrong" ? (
                <div className="text-sm text-red-200">Warning: Availability dropping. Try scaling strategies.</div>
              ) : (
                <div className="text-sm text-neutral-400">System robust.</div>
              )}
            </div>
          </div>
        )}

        {currentTopic === "mobile" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wide text-neutral-400 font-medium">Mobile Metrics</div>
              <div className="text-xs text-neutral-500">Offline Sync {previewControls.mobileOfflineSync ? "On" : "Off"}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Stat label="Launch Time" value={mobile.launchTime.toFixed(1)} unit="s" good={mobile.launchTime < 3.0} changed={mobile.launchTime !== prevMobileRef.current.launchTime} danger={wrongFinal && mobile.launchTime > prevMobileRef.current.launchTime} />
              <Stat label="Bundle Size" value={mobile.bundleSizeKB} unit="KB" good={mobile.bundleSizeKB < 10000} changed={mobile.bundleSizeKB !== prevMobileRef.current.bundleSizeKB} danger={wrongFinal && mobile.bundleSizeKB > prevMobileRef.current.bundleSizeKB} />
              <Stat label="Crash Rate" value={(mobile.crashRate * 100).toFixed(2)} unit="%" good={mobile.crashRate < 0.02} changed={mobile.crashRate !== prevMobileRef.current.crashRate} danger={wrongFinal && mobile.crashRate > prevMobileRef.current.crashRate} />
              <Stat label="Battery Drain" value={(mobile.batteryDrain * 100).toFixed(0)} unit="%" good={mobile.batteryDrain < 0.2} changed={mobile.batteryDrain !== prevMobileRef.current.batteryDrain} danger={wrongFinal && mobile.batteryDrain > prevMobileRef.current.batteryDrain} />
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-3">
              <div className="text-xs uppercase tracking-wide text-neutral-400 mb-2">Live Errors</div>
              {wrongFinal ? (
                <ul className="text-sm text-red-200 space-y-1 list-disc pl-5">
                  <li>ANR (App Not Responding) spikes.</li>
                  <li>Background process drain detected.</li>
                </ul>
              ) : feedback.status === "wrong" ? (
                <div className="text-sm text-red-200">Warning: Performance hurting UX. Try a lighter weight approach.</div>
              ) : (
                <div className="text-sm text-neutral-400">App stable.</div>
              )}
            </div>
          </div>
        )}

        {currentTopic === "security" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wide text-neutral-400 font-medium">Security Metrics</div>
              <div className="text-xs text-neutral-500">mTLS {previewControls.secMtls ? "On" : "Off"}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Stat label="Vulns" value={security.vulnCount} good={security.vulnCount === 0} changed={security.vulnCount !== prevSecurityRef.current.vulnCount} danger={wrongFinal && security.vulnCount > prevSecurityRef.current.vulnCount} />
              <Stat label="Encryption" value={(security.encryptionCoverage * 100).toFixed(0)} unit="%" good={security.encryptionCoverage > 0.9} changed={security.encryptionCoverage !== prevSecurityRef.current.encryptionCoverage} danger={wrongFinal && security.encryptionCoverage < prevSecurityRef.current.encryptionCoverage} />
              <Stat label="Auth Fails" value={(security.authFailures * 100).toFixed(2)} unit="%" good={security.authFailures < 0.05} changed={security.authFailures !== prevSecurityRef.current.authFailures} danger={wrongFinal && security.authFailures > prevSecurityRef.current.authFailures} />
              <Stat label="Patch Age" value={security.patchAgeDays} unit="days" good={security.patchAgeDays < 7} changed={security.patchAgeDays !== prevSecurityRef.current.patchAgeDays} danger={wrongFinal && security.patchAgeDays > prevSecurityRef.current.patchAgeDays} />
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-3">
              <div className="text-xs uppercase tracking-wide text-neutral-400 mb-2">Live Errors</div>
              {wrongFinal ? (
                <ul className="text-sm text-red-200 space-y-1 list-disc pl-5">
                  <li>Critical zero-day exposed.</li>
                  <li>Unauthorized data exfiltration detected.</li>
                </ul>
              ) : feedback.status === "wrong" ? (
                <div className="text-sm text-red-200">Warning: Attack surface expanded. Try securing endpoints.</div>
              ) : (
                <div className="text-sm text-neutral-400">Posture strong.</div>
              )}
            </div>
          </div>
        )}

        {currentTopic === "dataeng" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wide text-neutral-400 font-medium">Data Eng Metrics</div>
              <div className="text-xs text-neutral-500">Streaming {previewControls.dataEngStreaming ? "On" : "Off"}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Stat label="Latency" value={dataeng.pipelineLatency} unit="s" good={dataeng.pipelineLatency < 60} changed={dataeng.pipelineLatency !== prevDataEngRef.current.pipelineLatency} danger={wrongFinal && dataeng.pipelineLatency > prevDataEngRef.current.pipelineLatency} />
              <Stat label="Freshness" value={dataeng.dataFreshness} unit="m" good={dataeng.dataFreshness < 15} changed={dataeng.dataFreshness !== prevDataEngRef.current.dataFreshness} danger={wrongFinal && dataeng.dataFreshness > prevDataEngRef.current.dataFreshness} />
              <Stat label="Throughput" value={dataeng.throughput} unit="evt/s" good={dataeng.throughput > 10000} changed={dataeng.throughput !== prevDataEngRef.current.throughput} danger={wrongFinal && dataeng.throughput < prevDataEngRef.current.throughput} />
              <Stat label="Quality" value={(dataeng.dataQualityScore * 100).toFixed(0)} unit="%" good={dataeng.dataQualityScore > 0.95} changed={dataeng.dataQualityScore !== prevDataEngRef.current.dataQualityScore} danger={wrongFinal && dataeng.dataQualityScore < prevDataEngRef.current.dataQualityScore} />
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-3">
              <div className="text-xs uppercase tracking-wide text-neutral-400 mb-2">Live Errors</div>
              {wrongFinal ? (
                <ul className="text-sm text-red-200 space-y-1 list-disc pl-5">
                  <li>Pipeline deadlock detected.</li>
                  <li>Schema validation failure in ingestion.</li>
                </ul>
              ) : feedback.status === "wrong" ? (
                <div className="text-sm text-red-200">Warning: Data freshness decaying. Needs optimization.</div>
              ) : (
                <div className="text-sm text-neutral-400">Pipeline flowing smoothly.</div>
              )}
            </div>
          </div>
        )}

        {/* --- End New Missing Topics --- */}

        {currentTopic === "generic" && (
          <div className="space-y-3">
            <div className="text-sm text-neutral-400">Pick a Frontend/Backend/ML/DevOps/Mobile/Security/System Design/DataEng topic to get a richer preview.</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="h-16 border-b border-neutral-900 bg-neutral-950/70 backdrop-blur flex items-center px-6">
        <div className="flex items-center gap-3">
          <img src="/ECL_LOGO_Sage.png" className="w-7 h-7 rounded-sm" alt="SAGE" />
          <span className="font-semibold text-xl tracking-wide">SAGE</span>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        <aside className="w-80 border-r border-neutral-900 p-5 flex flex-col gap-5 overflow-y-auto">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Question Types</p>
            <div className="flex flex-wrap gap-2">
              {["MCQ", "Fill in the Blanks", "Short Answer", "Coding"].map((type) => {
                const selected = questionTypes.includes(type);
                return (
                  <motion.button
                    key={type}
                    whileTap={{ scale: 0.94 }}
                    whileHover={{ scale: 1.04 }}
                    onClick={() => toggleQuestionType(type)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition ${selected
                      ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20"
                      : "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                      }`}
                  >
                    {type}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="mt-2">
            <p className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Difficulty</p>
            <div className="relative">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full appearance-none bg-neutral-900 border border-neutral-800 text-neutral-200 text-sm rounded-xl pl-3 pr-9 py-2.5 outline-none focus:border-neutral-600 transition cursor-pointer"
              >
                <option value="Middle School">Middle School</option>
                <option value="High School">High School</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Working Professional">Working Professional</option>
                <option value="Veteran">Veteran</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={generateScenario}
            className="bg-orange-500 hover:bg-orange-600 transition rounded-2xl py-2 font-semibold shadow-md hover:shadow-lg tracking-wide"
          >
            {loading ? "Generating..." : "Generate Questions"}
          </motion.button>

          <div className="space-y-3 text-sm">
            {SUBJECTS.map((section) => {
              const isOpen = openSections.includes(section.name);
              return (
                <motion.div
                  key={section.name}
                  layout
                  transition={{ duration: 0.35 }}
                  className="bg-neutral-900 rounded-xl p-3 border border-neutral-800"
                >
                  <button
                    onClick={() => toggleSection(section.name)}
                    aria-expanded={isOpen}
                    aria-controls={`section-${section.name}`}
                    className="w-full flex justify-between items-center font-medium"
                  >
                    <span className="text-neutral-200">{section.name}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-lg text-neutral-400"
                    >
                      +
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key={`${section.name}-content`}
                        id={`section-${section.name}`}
                        initial={{ height: 0, opacity: 0, paddingTop: 0 }}
                        animate={{ height: "auto", opacity: 1, paddingTop: 8 }}
                        exit={{ height: 0, opacity: 0, paddingTop: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2">
                          {section.items.map((item) => (
                            <Checkbox key={item} label={item} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Controls moved to preview panel (right) */}
        </aside>

        <div className="flex-1 p-8">
          {questions.length > 0 ? (
            <div
              ref={containerRef}
              className="flex w-full h-full gap-0 items-stretch min-w-0"
              onMouseMove={onDrag}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
            >
              {/* Left pane */}
              <div style={{ width: `${leftPct}%` }} className="min-w-[320px] pr-6 min-w-0">
                {current ? (
                  <motion.div
                    key={`question-${currentIdx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-neutral-900 p-6 rounded-2xl shadow-lg w-full border border-neutral-800"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <motion.button
                        whileHover={{ scale: currentIdx > 0 ? 1.03 : 1 }}
                        whileTap={{ scale: currentIdx > 0 ? 0.97 : 1 }}
                        onClick={gotoPrev}
                        disabled={currentIdx === 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium ${currentIdx === 0 ? "border-neutral-900 text-neutral-600" : "border-neutral-800 hover:border-neutral-700"
                          }`}
                      >
                        <span className="text-lg">←</span>
                        <span className="text-sm">Prev</span>
                      </motion.button>

                      <span className="text-neutral-400 text-sm">
                        Question {currentIdx + 1} of {questions.length || 0}
                      </span>

                      <motion.button
                        whileHover={{ scale: currentIdx < questions.length - 1 ? 1.03 : 1 }}
                        whileTap={{ scale: currentIdx < questions.length - 1 ? 0.97 : 1 }}
                        onClick={gotoNext}
                        disabled={currentIdx >= questions.length - 1}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium ${currentIdx >= questions.length - 1
                          ? "border-neutral-900 text-neutral-600"
                          : "border-neutral-800 hover:border-neutral-700"
                          }`}
                      >
                        <span className="text-sm">Next</span>
                        <span className="text-lg">→</span>
                      </motion.button>
                    </div>

                    <div className="space-y-6">
                      <div className="prose prose-invert max-w-none">
                        <p className="text-[17px] leading-relaxed text-neutral-200">{current.scenario}</p>
                      </div>

                      {/* ---------------- MCQ UI ---------------- */}
                      {current?.type === "MCQ" && current.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
                          {current.options.map((opt, idx) => {
                            const disabled = attemptsLeft <= 0 || feedback.status === "correct";
                            const isCorrect = feedback.status === "correct" && idx === current.correctIndex;
                            const isLastWrong = attemptsLeft <= 0 && lastWrongIndex === idx && feedback.status === "wrong";
                            const base =
                              "px-4 py-3 rounded-2xl border transition focus:outline-none focus:ring-2 text-sm font-medium min-w-0";
                            const variant = isCorrect
                              ? "bg-emerald-300/15 border-emerald-300 text-emerald-200 focus:ring-emerald-400"
                              : isLastWrong
                                ? "bg-red-300/15 border-red-300 text-red-200 focus:ring-red-400"
                                : "bg-neutral-800 border-neutral-800 hover:border-neutral-700 focus:ring-orange-500";
                            return (
                              <motion.button
                                key={idx}
                                whileHover={!disabled ? { scale: 1.02 } : undefined}
                                whileTap={!disabled ? { scale: 0.98 } : undefined}
                                onClick={() => !disabled && onSelectOption(idx)}
                                disabled={disabled}
                                title={opt}
                                className={`${base} ${variant} break-words text-left whitespace-normal`}
                              >
                                <span className="block line-clamp-3">{opt}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      )}

                      {/* ---------------- Fill in the Blanks UI ---------------- */}
                      {current?.type === "Fill in the Blanks" && (
                        <div className="flex items-center gap-3">
                          <input
                            value={blankInput}
                            onChange={(e) => setBlankInput(e.target.value)}
                            placeholder="Type your answer"
                            className="flex-1 px-4 py-2 rounded-2xl bg-neutral-800 border border-neutral-800 focus:border-neutral-700 focus:outline-none font-medium placeholder:text-neutral-500"
                            disabled={attemptsLeft <= 0 || feedback.status === "correct"}
                          />
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={onSubmitBlank}
                            disabled={attemptsLeft <= 0 || feedback.status === "correct"}
                            className="px-4 py-2 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-800 font-semibold"
                          >
                            Submit
                          </motion.button>
                        </div>
                      )}

                      {/* ---------------- Short Answer UI ---------------- */}
                      {current?.type === "Short Answer" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-xs uppercase tracking-wide text-neutral-500">Short answer (max 4 lines)</div>
                            <div className="text-xs text-neutral-400">Score: {(shortScore01 * 100).toFixed(0)}%</div>
                          </div>

                          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/50 p-3 space-y-2">
                            <textarea
                              value={shortAnswer}
                              onChange={(e) => {
                                const next = e.target.value;
                                setShortAnswer(next.split("\n").slice(0, 4).join("\n"));
                              }}
                              rows={4}
                              placeholder="Answer in up to 4 lines…"
                              className="w-full resize-none bg-neutral-900/40 border border-neutral-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neutral-700"
                              disabled={attemptsLeft <= 0 || feedback.status === "correct"}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {Array.from({ length: 4 }).map((_, i) => {
                                const ok = shortLineOk[i];
                                return (
                                  <div
                                    key={i}
                                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${ok ? "border-emerald-700/40 bg-emerald-500/10" : "border-red-700/30 bg-red-500/10"
                                      }`}
                                  >
                                    <span className="text-neutral-300">Line {i + 1}</span>
                                    <span className={`font-semibold ${ok ? "text-emerald-200" : "text-red-200"}`}>{ok ? "✔" : "✖"}</span>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="flex items-center justify-end">
                              <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={onSubmitShortAnswer}
                                disabled={attemptsLeft <= 0 || feedback.status === "correct"}
                                className="px-4 py-2 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-800 font-semibold"
                              >
                                Submit
                              </motion.button>
                            </div>
                          </div>

                          {!!current.keywords?.length && (
                            <div className="text-xs text-neutral-500">
                              Looking for: <span className="text-neutral-300">{current.keywords.join(", ")}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ---------------- Coding Editor UI ---------------- */}
                      {current?.type === "Coding" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="text-xs uppercase tracking-wide text-neutral-500">Code Editor</div>
                              {attemptsLeft <= 0 && feedback.status === "wrong" && (
                                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold uppercase tracking-widest">
                                  Correct Solution
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="text-xs text-neutral-400">{(codeScore01 * 100).toFixed(0)}%</div>

                              <div className="relative">
                                <motion.button
                                  type="button"
                                  whileTap={{ scale: 0.98 }}
                                  whileHover={{ scale: 1.02 }}
                                  onClick={() => setLanguageMenuOpen((v) => !v)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:border-neutral-700 text-xs text-neutral-200"
                                  aria-haspopup="listbox"
                                  aria-expanded={languageMenuOpen}
                                >
                                  <span className="text-neutral-400">Lang</span>
                                  <span className="font-semibold">{codeLanguage}</span>
                                  <span className="text-neutral-500">▾</span>
                                </motion.button>

                                <AnimatePresence>
                                  {languageMenuOpen && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                      transition={{ duration: 0.14 }}
                                      className="absolute right-0 mt-2 w-44 rounded-2xl border border-neutral-800 bg-neutral-950 shadow-xl overflow-hidden z-10"
                                      role="listbox"
                                    >
                                      {LANGUAGE_OPTIONS.map((opt) => {
                                        const active = opt.id === codeLanguage;
                                        return (
                                          <button
                                            key={opt.id}
                                            type="button"
                                            className={`w-full text-left px-3 py-2 text-xs transition ${active ? "bg-orange-500/15 text-orange-200" : "text-neutral-200 hover:bg-neutral-900"
                                              }`}
                                            onClick={() => {
                                              setCodeLanguage(opt.id);
                                              setLanguageTouched(true);
                                              setLanguageMenuOpen(false);
                                            }}
                                          >
                                            {opt.label}
                                          </button>
                                        );
                                      })}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/50 p-3">
                            <textarea
                              value={code}
                              onChange={(e) => setCode(e.target.value)}
                              spellCheck={false}
                              className={`w-full h-80 font-mono text-[13px] leading-relaxed resize-none bg-neutral-900/40 border border-neutral-800 rounded-xl px-3 py-2 focus:outline-none focus:border-neutral-700
                                ${attemptsLeft <= 0 && feedback.status === "wrong" ? "text-emerald-300/80" : "text-neutral-200"}
                              `}
                              placeholder={current.starterCode || "Write code here…"}
                              disabled={attemptsLeft <= 0 || feedback.status === "correct"}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-3 min-w-0">
                              <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Matched</div>
                              <div className="flex flex-wrap gap-1.5 min-w-0">
                                {codeMatched.length
                                  ? codeMatched.map(t => (
                                    <span key={t} className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 text-xs font-mono truncate max-w-[120px]">{t}</span>
                                  ))
                                  : <span className="text-sm text-neutral-500">—</span>}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-3 min-w-0">
                              <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Missing</div>
                              <div className="flex flex-wrap gap-1.5 min-w-0">
                                {codeMissing.length
                                  ? codeMissing.map(t => (
                                    <span key={t} className="inline-block px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/20 text-xs font-mono truncate max-w-[120px]">{t}</span>
                                  ))
                                  : <span className="text-sm text-neutral-500">—</span>}
                              </div>
                            </div>
                          </div>

                          {/* Idle timer display */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                                <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                              </svg>
                              {idleSeconds > 0
                                ? <span className={idleSeconds >= 8 && (difficulty === "Veteran" || difficulty === "Working Professional") ? "text-red-400" : "text-neutral-500"}>
                                  Idle: {idleSeconds}s{(difficulty === "Veteran" || difficulty === "Working Professional") && idleSeconds >= 8 ? " — system degrading" : ""}
                                </span>
                                : <span>Timer active</span>}
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                if (codeScore01 >= 0.85) {
                                  setFeedback({
                                    status: "correct",
                                    hint: "Solution looks structurally correct. Preview improved.",
                                  });
                                  applyOutcome("correct");
                                  setShowIncidentPopup(false);
                                } else {
                                  const remaining = attemptsLeft - 1;
                                  setAttemptsLeft(remaining);
                                  setShowIncidentPopup(true);

                                  if (remaining <= 0) {
                                    if (current.answer) {
                                      setCode(current.answer);
                                    } else {
                                      setCode(`// No solution provided by backend.\n// Debug data:\n${JSON.stringify(current, null, 2)}`);
                                    }
                                    setFeedback({
                                      status: "wrong",
                                      hint: current.reason || `Final Attempt Exhausted. Correct solution shown above.\nMissing tokens: ${codeMissing.join(", ")}`,
                                    });
                                    applyOutcome("wrongFinal");
                                  } else {
                                    setFeedback({
                                      status: "wrong",
                                      hint: current.hint || `Hint: Try to include more required tokens like: ${codeMissing.slice(0, 2).join(", ")}`,
                                    });
                                    applyOutcome("wrongHint");
                                  }
                                }
                              }}
                              disabled={attemptsLeft <= 0 || feedback.status === "correct"}
                              className="px-4 py-2 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-800 font-semibold"
                            >
                              Submit
                            </motion.button>
                          </div>

                          <div className="text-xs text-neutral-500">Preview updates live as you type. </div>
                        </div>
                      )}


                      <div className="flex flex-col gap-3 text-sm">
                        <div className="flex items-center justify-between text-neutral-300">
                          <span className="font-medium">Attempts left: {attemptsLeft}</span>
                          {feedback.status === "correct" && <span className="text-emerald-300 font-semibold">Correct!</span>}
                        </div>

                        {feedback.hint && (
                          <div className={`rounded-2xl p-4 text-sm whitespace-pre-line border bg-neutral-900/60
                            ${attemptsLeft <= 0 && feedback.status === "wrong" ? "border-emerald-500/30 text-emerald-100" : "border-neutral-800 text-neutral-200"}
                          `}>
                            {attemptsLeft <= 0 && feedback.status === "wrong" && (
                              <div className="text-emerald-300 font-bold uppercase tracking-widest text-[10px] mb-2 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 inline-block">
                                Explanation
                              </div>
                            )}
                            <div className="leading-relaxed">
                              {feedback.hint}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-neutral-500">{loading ? "Generating…" : "Generate questions to begin."}</div>
                )}
              </div>

              {/* Splitter */}
              <div
                onMouseDown={startDrag}
                className={`w-1 mx-3 h-full cursor-col-resize rounded bg-neutral-800 hover:bg-neutral-700 ${dragging ? "bg-emerald-700" : ""}`}
              />

              {/* Right pane */}
              <div style={{ width: `${100 - leftPct}%` }} className="min-w-[320px] min-w-0 relative">
                {(() => {
                  const wrongFinal = feedback.status === "wrong" && attemptsLeft <= 0;
                  const previewOutline = wrongFinal ? "ring-2 ring-red-600/60" : "ring-1 ring-neutral-800/0";

                  // Topic-aware incident popup data
                  const incidentConfig: Record<string, { title: string; icon: string; rows: { label: string; value: string; bad?: boolean }[] }> = {
                    backend: {
                      title: "Production DB Error Log",
                      icon: "🗄️",
                      rows: [
                        { label: "Error", value: "FATAL: query timeout (>30s)", bad: true },
                        { label: "Table", value: "orders (locked)", bad: true },
                        { label: "Connections", value: `${Math.floor(Math.random() * 80 + 180)}/200`, bad: true },
                        { label: "Rollback", value: "initiated", bad: true },
                        { label: "Last txn", value: new Date().toLocaleTimeString() },
                      ],
                    },
                    frontend: {
                      title: "UI Runtime Exception",
                      icon: "💻",
                      rows: [
                        { label: "Error", value: "TypeError: Cannot read property", bad: true },
                        { label: "Component", value: "<DataTable> line 47", bad: true },
                        { label: "Re-renders", value: "∞ (infinite loop)", bad: true },
                        { label: "FPS", value: "4 fps", bad: true },
                        { label: "Hydration", value: "MISMATCH", bad: true },
                      ],
                    },
                    ml: {
                      title: "Training Run Crashed",
                      icon: "🧠",
                      rows: [
                        { label: "Error", value: "NaN loss at epoch 3", bad: true },
                        { label: "Val loss", value: "diverging (∞)", bad: true },
                        { label: "GPU OOM", value: "CUDA out of memory", bad: true },
                        { label: "Checkpoint", value: "not saved", bad: true },
                        { label: "Status", value: "ABORTED" },
                      ],
                    },
                    devops: {
                      title: "Pipeline Failure",
                      icon: "⚙️",
                      rows: [
                        { label: "Stage", value: "deploy (step 4/5)", bad: true },
                        { label: "Exit code", value: "1 — CrashLoopBackOff", bad: true },
                        { label: "Pods", value: "0/3 running", bad: true },
                        { label: "Rollback", value: "in progress" },
                        { label: "ETA", value: "~4 min" },
                      ],
                    },
                    sysdesign: {
                      title: "System Outage Alert",
                      icon: "🌐",
                      rows: [
                        { label: "Status", value: "PARTIAL OUTAGE", bad: true },
                        { label: "Affected", value: "us-east-1, eu-west-1", bad: true },
                        { label: "Latency", value: "p99 > 12s", bad: true },
                        { label: "Error rate", value: "48%", bad: true },
                        { label: "On-call", value: "paged" },
                      ],
                    },
                    mobile: {
                      title: "App Crash Report",
                      icon: "📱",
                      rows: [
                        { label: "Crash", value: "ANR in MainActivity", bad: true },
                        { label: "Affected", value: "Android 12+ (34%)", bad: true },
                        { label: "Crash rate", value: "8.2%", bad: true },
                        { label: "OOM", value: "detected (heap)", bad: true },
                        { label: "Store", value: "Review flagged" },
                      ],
                    },
                    security: {
                      title: "Security Incident",
                      icon: "🔐",
                      rows: [
                        { label: "Alert", value: "Unauthorized access attempt", bad: true },
                        { label: "Vector", value: "Unvalidated input (XSS)", bad: true },
                        { label: "Affected", value: "user sessions (all)", bad: true },
                        { label: "Auth fails", value: "1,204 in 60s", bad: true },
                        { label: "Action", value: "SIEM alerted" },
                      ],
                    },
                    dataeng: {
                      title: "Pipeline Dead-lock",
                      icon: "📊",
                      rows: [
                        { label: "Stage", value: "transform (stuck)", bad: true },
                        { label: "Backlog", value: "14.2M events queued", bad: true },
                        { label: "Freshness", value: "2h 18m behind SLA", bad: true },
                        { label: "Schema", value: "validation failed", bad: true },
                        { label: "Alert", value: "PagerDuty fired" },
                      ],
                    },
                    generic: {
                      title: "System Error",
                      icon: "⚠️",
                      rows: [
                        { label: "Status", value: "ERROR", bad: true },
                        { label: "Code", value: "500 Internal", bad: true },
                        { label: "Message", value: "Unexpected failure", bad: true },
                        { label: "Trace", value: "see logs", bad: true },
                        { label: "Recovery", value: "manual required" },
                      ],
                    },
                  };

                  const inc = incidentConfig[currentTopic] ?? incidentConfig.generic;

                  return (
                    <>
                      {/* Incident popup — full-screen fixed modal, instant appearance */}
                      {showIncidentPopup && current?.type === "Coding" && feedback.status === "wrong" && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                          <div className="w-full max-w-md mx-4 bg-neutral-950 border border-red-600/50 rounded-2xl shadow-2xl shadow-red-900/30 overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-red-600/20 bg-red-950/20">
                              <div className="flex items-center gap-2.5">
                                <span className="text-xl">{inc.icon}</span>
                                <div>
                                  <div className="text-xs font-bold uppercase tracking-widest text-red-400">{inc.title}</div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                                    <span className="text-[10px] text-red-400 uppercase tracking-widest">INCIDENT ACTIVE</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Log rows */}
                            <div className="px-5 py-4 space-y-2 font-mono text-xs">
                              {inc.rows.map((row, i) => (
                                <div key={i} className="flex items-center justify-between gap-4 py-1 border-b border-neutral-800/50 last:border-0">
                                  <span className="text-neutral-500">{row.label}</span>
                                  <span className={row.bad ? "text-red-300 font-semibold" : "text-neutral-300"}>{row.value}</span>
                                </div>
                              ))}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 px-5 pb-5">
                              <button
                                onClick={() => setShowIncidentPopup(false)}
                                className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 text-sm font-medium hover:bg-neutral-800 transition"
                              >
                                Dismiss
                              </button>
                              <button
                                onClick={() => {
                                  setShowIncidentPopup(false);
                                  gotoNext();
                                }}
                                disabled={currentIdx >= questions.length - 1}
                                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white text-sm font-semibold transition"
                              >
                                Next Question →
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className={`bg-neutral-900 p-5 rounded-2xl shadow-lg h-full border border-neutral-800 min-w-0 ${previewOutline}`}>
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <h3 className="text-xs uppercase tracking-wide text-neutral-400 font-medium">Live Preview</h3>
                          {wrongFinal ? <span className="text-xs text-red-300">Final wrong attempt</span> : null}
                        </div>

                        {/* Control panel on the right (above preview) */}
                        <div className="mb-4">
                          <Controls />
                        </div>

                        <LivePreview />
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="text-neutral-500">{loading ? "Generating…" : "Generate questions to begin."}</div>
          )}
        </div>
      </div>
    </div>
  );
}