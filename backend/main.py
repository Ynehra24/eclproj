from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from dotenv import load_dotenv
from groq import Groq
import os
import io
import random
import json
import re

load_dotenv()
GROQ_API_KEY = os.getenv("GROQAPI_KEY", "")
_groq_client: Optional[Groq] = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Models
# -----------------------------
class Question(BaseModel):
    type: str
    scenario: str
    options: Optional[List[str]] = None
    correctIndex: Optional[int] = None
    answer: Optional[str] = None
    hint: Optional[str] = None
    reason: Optional[str] = None

    # Short Answer (frontend uses these for live evaluation)
    keywords: Optional[List[str]] = None
    rubric: Optional[List[str]] = None

    # Coding (frontend uses these for live evaluation)
    language: Optional[str] = None
    starterCode: Optional[str] = None
    requiredTokens: Optional[List[str]] = None


class GenerateRequest(BaseModel):
    subjects: List[str]
    types: Optional[List[str]] = None
    count: Optional[int] = 5
    difficulty: Optional[str] = "Bachelor"


class ExtractTopicsResponse(BaseModel):
    topics: List[str]


# -----------------------------
# Full catalog — must match frontend SUBJECTS exactly
# -----------------------------
CATALOG: Dict[str, List[str]] = {
    "Frontend": [
        "React","Next.js","TypeScript","JavaScript","CSS","TailwindCSS","Accessibility","Web Performance",
        "State Management","Redux","Zustand","MobX","Testing Library","Jest","Playwright",
        "Animations","Framer Motion","SSR","CSR","Hydration","Code Splitting","Memoization",
        "WebSockets","Service Workers","PWA","i18n","Form Handling","React Query","TanStack Query",
        "Vite","Webpack","Babel","Storybook","Design Systems","Component Architecture","Hooks","Context API",
    ],
    "Backend": [
        "APIs","REST","GraphQL","gRPC","Microservices","Monolith","Caching","Redis","Queues","RabbitMQ",
        "Kafka","Databases","PostgreSQL","MySQL","MongoDB","ORM","Prisma","SQLAlchemy","Auth","OAuth2",
        "JWT","Rate Limiting","Circuit Breaker","Observability","Metrics","Tracing","Logging","Testing",
        "Pagination","Idempotency","Schema Migrations","Multi-tenancy","API Gateway","Service Discovery",
    ],
    "DevOps": [
        "Docker","Kubernetes","Helm","CI/CD","GitHub Actions","Terraform","Ansible","Prometheus","Grafana",
        "ArgoCD","Autoscaling","Blue-Green","Canary","Load Balancing","Nginx","Istio","Linkerd",
        "Secrets","ConfigMaps","RBAC","Ingress","EKS","GKE","AKS","Cost Optimization",
    ],
    "System Design": [
        "Scalability","Availability","Consistency","CAP Theorem","Sharding","Replication","Leader Election",
        "Distributed Caching","CDN","Global Traffic","Failover","Backpressure","Rate Limiting",
        "Event Sourcing","CQRS","Read/Write Splitting","Geo-partitioning","Hot Partitions",
    ],
    "Machine Learning": [
        "Model Training","Data Preprocessing","Feature Engineering","Cross Validation","Regularization",
        "Hyperparameter Tuning","Overfitting","Underfitting","Model Serving","Batch Inference","Streaming Inference",
        "Embeddings","Vector Databases","Evaluation","Drift Detection","A/B Testing","Monitoring","Retraining",
    ],
    "Mobile": [
        "React Native","Swift","Kotlin","Android","iOS","Flutter","Performance","Offline Sync","Push Notifications",
        "Background Tasks","Deep Links","App Store","Play Store","Crash Reporting",
    ],
    "Security": [
        "OWASP","Input Validation","XSS","CSRF","SQL Injection","Secrets Management","Vulnerability Scanning",
        "Penetration Testing","Threat Modeling","Audit Logging","Encryption","TLS","mTLS","SSO",
    ],
    "Data Engineering": [
        "ETL","ELT","Batch Processing","Stream Processing","Spark","Flink","Airflow","dbt","Lakehouse",
        "Delta Lake","Data Quality","Data Lineage","Data Catalog","Parquet","Iceberg","Hudi",
    ],
}

ALL_TOPICS: List[str] = sorted({t for items in CATALOG.values() for t in items})

_ALIASES: Dict[str, str] = {
    "reactjs": "React", "react.js": "React", "nextjs": "Next.js", "next js": "Next.js",
    "ts": "TypeScript", "js": "JavaScript", "tailwind": "TailwindCSS", "tailwind css": "TailwindCSS",
    "node": "APIs", "nodejs": "APIs", "node.js": "APIs", "express": "APIs", "fastapi": "APIs",
    "flask": "APIs", "django": "APIs", "sql": "Databases", "nosql": "MongoDB",
    "postgres": "PostgreSQL", "postgresql": "PostgreSQL", "mongo": "MongoDB", "mongodb": "MongoDB",
    "k8s": "Kubernetes",
    "ci cd": "CI/CD", "ci/cd": "CI/CD", "github actions": "GitHub Actions", "gh actions": "GitHub Actions",
    "ml": "Model Training", "machine learning": "Model Training", "deep learning": "Model Training",
    "neural network": "Model Training", "neural networks": "Model Training",
    "cnn": "Model Training", "rnn": "Model Training", "transformer": "Model Training",
    "transformers": "Model Training", "llm": "Model Training", "large language model": "Model Training",
    "nlp": "Embeddings", "natural language processing": "Embeddings",
    "server side rendering": "SSR", "client side rendering": "CSR",
    "code splitting": "Code Splitting", "state management": "State Management",
    "api": "APIs", "rest api": "REST", "restful": "REST", "graphql": "GraphQL", "grpc": "gRPC",
    "oauth": "OAuth2", "oauth2": "OAuth2", "json web token": "JWT", "json web tokens": "JWT",
    "rate limit": "Rate Limiting", "rate limiting": "Rate Limiting",
    "circuit breaker": "Circuit Breaker", "microservice": "Microservices",
    "cap theorem": "CAP Theorem", "event sourcing": "Event Sourcing", "event driven": "Event Sourcing",
    "container": "Docker", "containers": "Docker", "containerization": "Docker",
    "infrastructure as code": "Terraform", "iac": "Terraform",
    "load balancer": "Load Balancing", "load balancing": "Load Balancing",
    "message queue": "Queues", "cache": "Caching",
    "service mesh": "Istio", "configmap": "ConfigMaps", "configmaps": "ConfigMaps",
    "role based access": "RBAC", "auto scaling": "Autoscaling",
    "blue green": "Blue-Green", "blue green deployment": "Blue-Green",
    "canary deployment": "Canary", "argo cd": "ArgoCD",
    "leader election": "Leader Election", "distributed caching": "Distributed Caching",
    "global traffic": "Global Traffic", "read write splitting": "Read/Write Splitting",
    "read/write splitting": "Read/Write Splitting",
    "geo partitioning": "Geo-partitioning", "geo-partitioning": "Geo-partitioning",
    "hot partition": "Hot Partitions", "hot partitions": "Hot Partitions",
    "batch processing": "Batch Processing", "stream processing": "Stream Processing",
    "batch inference": "Batch Inference", "streaming inference": "Streaming Inference",
    "data preprocessing": "Data Preprocessing", "data augmentation": "Data Preprocessing",
    "feature engineering": "Feature Engineering", "cross validation": "Cross Validation",
    "hyperparameter": "Hyperparameter Tuning", "hyperparameter tuning": "Hyperparameter Tuning",
    "model serving": "Model Serving", "model deployment": "Model Serving",
    "vector database": "Vector Databases", "vector db": "Vector Databases",
    "drift detection": "Drift Detection", "model monitoring": "Monitoring",
    "a/b testing": "A/B Testing", "ab testing": "A/B Testing",
    "pwa": "PWA", "progressive web app": "PWA",
    "service worker": "Service Workers", "service workers": "Service Workers",
    "websocket": "WebSockets", "websockets": "WebSockets",
    "react hooks": "Hooks", "context api": "Context API",
    "content delivery network": "CDN", "orm": "ORM", "object relational mapping": "ORM",
    "api gateway": "API Gateway", "service discovery": "Service Discovery",
    "schema migration": "Schema Migrations", "schema migrations": "Schema Migrations",
    "database migration": "Schema Migrations",
    "multi tenancy": "Multi-tenancy", "multi-tenancy": "Multi-tenancy",
    "pen testing": "Penetration Testing", "penetration testing": "Penetration Testing",
    "ssl": "TLS", "single sign on": "SSO",
    "secret management": "Secrets Management", "secrets management": "Secrets Management",
    "vulnerability scanning": "Vulnerability Scanning", "threat modeling": "Threat Modeling",
    "audit log": "Audit Logging", "audit logging": "Audit Logging",
    "input validation": "Input Validation",
    "push notification": "Push Notifications", "push notifications": "Push Notifications",
    "offline sync": "Offline Sync",
    "background task": "Background Tasks", "background tasks": "Background Tasks",
    "deep link": "Deep Links", "deep links": "Deep Links", "deep linking": "Deep Links",
    "app store": "App Store", "play store": "Play Store", "crash reporting": "Crash Reporting",
    "model retraining": "Retraining", "model evaluation": "Evaluation",
    "design system": "Design Systems", "design systems": "Design Systems",
    "component architecture": "Component Architecture",
    "a11y": "Accessibility", "internationalization": "i18n",
    "form handling": "Form Handling", "forms": "Form Handling",
    "react query": "React Query", "tanstack query": "TanStack Query",
    "framer motion": "Framer Motion", "animation": "Animations", "animations": "Animations",
    "web performance": "Web Performance", "performance optimization": "Web Performance",
    "usememo": "Memoization", "usecallback": "Memoization", "memo": "Memoization",
    "unit testing": "Testing", "integration testing": "Testing",
    "apache spark": "Spark", "apache flink": "Flink", "apache airflow": "Airflow",
    "data pipeline": "ETL", "data pipelines": "ETL",
    "delta lake": "Delta Lake", "data quality": "Data Quality",
    "data lineage": "Data Lineage", "data catalog": "Data Catalog",
    "dropout": "Regularization", "l1 regularization": "Regularization", "l2 regularization": "Regularization",
    "react native": "React Native",
}

# -----------------------------
# Utilities
# -----------------------------
def distribute_topics(topics: List[str], count: int) -> List[str]:
    if not topics:
        return []

    topics = list(topics)
    random.shuffle(topics)

    if len(topics) <= count:
        result: List[str] = []
        idx = 0
        while len(result) < count:
            result.append(topics[idx % len(topics)])
            idx += 1
        return result
    else:
        # If there are more topics than questions requested, group them.
        buckets: List[List[str]] = [[] for _ in range(count)]
        for i, t in enumerate(topics):
            buckets[i % count].append(t)
        return [" and ".join(b) for b in buckets]


def dedupe_questions(questions: List[Question]) -> List[Question]:
    seen = set()
    unique: List[Question] = []
    for q in questions:
        key = q.scenario.strip().lower()
        if key not in seen:
            seen.add(key)
            unique.append(q)
    return unique


def _normalize_ws(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "")).strip()


def _mcq_options_fingerprint(q: Question) -> Optional[str]:
    if not q.options:
        return None
    normed = sorted(_normalize_ws(o).lower() for o in q.options if o and o.strip())
    return "|".join(normed) if normed else None


def _has_duplicate_option_sets(questions: List[Question]) -> bool:
    seen: set = set()
    for q in questions:
        if (q.type or "").strip().upper() != "MCQ":
            continue
        fp = _mcq_options_fingerprint(q)
        if not fp:
            continue
        if fp in seen:
            return True
        seen.add(fp)
    return False


def _has_internal_duplicate_options(q: Question) -> bool:
    if not q.options:
        return False
    normed = [_normalize_ws(o).lower() for o in q.options if o and o.strip()]
    return len(normed) != len(set(normed))


def _strip_code_fences(s: str) -> str:
    s = (s or "").strip()
    if s.startswith("```"):
        s = s.split("\n", 1)[-1]
        if s.strip().endswith("```"):
            s = s.strip()[:-3]
    return s.strip()


def _shuffle_mcq_options(q: Question) -> None:
    if (q.type or "").strip().upper() != "MCQ":
        return
    if not q.options or len(q.options) < 2:
        return

    ci = q.correctIndex if q.correctIndex is not None else 0
    if ci < 0 or ci >= len(q.options):
        ci = 0

    correct_text = q.options[ci]
    random.shuffle(q.options)

    try:
        q.correctIndex = q.options.index(correct_text)
    except ValueError:
        q.correctIndex = 0


def match_topics_from_text(text: str) -> List[str]:
    text_lower = text.lower()
    matched: set = set()

    for topic in ALL_TOPICS:
        if len(topic) <= 3:
            if re.search(r"\b" + re.escape(topic) + r"\b", text, re.IGNORECASE):
                matched.add(topic)
        else:
            if topic.lower() in text_lower:
                matched.add(topic)

    for alias, canonical in _ALIASES.items():
        if len(alias) <= 3:
            if re.search(r"\b" + re.escape(alias) + r"\b", text_lower):
                matched.add(canonical)
        else:
            if alias in text_lower:
                matched.add(canonical)

    return sorted(matched)


# -----------------------------
# Fallback Questions
# -----------------------------
FALLBACK_SCENARIO_TEMPLATES = [
    "(Topic: {topic}) You need to optimize the {topic} layer of your application. Which improvement is most appropriate?",
    "(Topic: {topic}) A recent deployment involving {topic} caused a regression. How do you resolve it?",
    "(Topic: {topic}) You are tasked with scaling the {topic} infrastructure. What is the best approach?",
    "(Topic: {topic}) Security vulnerabilities were found in the {topic} implementation. How should they be mitigated?",
    "(Topic: {topic}) The development team is struggling with {topic} maintainability. What architectural pattern helps?",
    "(Topic: {topic}) {topic} is consuming too much memory/CPU. What is the standard optimization technique?",
    "(Topic: {topic}) Integration tests for {topic} are flaky. What is the most likely root cause?",
    "(Topic: {topic}) A new team member asks for the best practice when configuring {topic}. What do you recommend?"
]

FALLBACK_OPTION_SETS = [
    ["Add a caching layer with TTL", "Disable all logging", "Ignore the issue", "Increase retries blindly"],
    ["Introduce circuit breakers", "Remove health checks", "Add more servers without investigation", "Hard-code timeouts"],
    ["Check resource limits and liveness probes", "Delete and recreate the cluster", "Ignore pod restarts", "Disable autoscaling"],
    ["Add proper indexing and reduce lock scope", "Remove all transactions", "Increase connection pool to 10000", "Switch to a NoSQL database blindly"],
    ["Profile re-renders and memoize hot paths", "Remove all state management", "Add more useEffect hooks", "Disable React strict mode"],
    ["Add regularization and early stopping", "Train for more epochs without changes", "Remove the validation set", "Increase model size dramatically"],
    ["Add retry logic with idempotency checks", "Remove the deploy step", "Skip tests to speed up the pipeline", "Run deploys only manually"],
    ["Implement service discovery with health checks", "Hard-code all service URLs", "Remove inter-service communication", "Restart all services simultaneously"],
]


def fallback_questions(subjects: List[str], count: int, force_type: Optional[str] = None, difficulty: str = "Bachelor") -> List[Question]:
    questions: List[Question] = []
    distributed = distribute_topics(subjects, count)
    indices = list(range(len(FALLBACK_SCENARIO_TEMPLATES)))
    random.shuffle(indices)

    for i in range(count):
        si = indices[i % len(indices)]
        options = FALLBACK_OPTION_SETS[si].copy()
        topic = distributed[i] if i < len(distributed) else random.choice(subjects)
        
        scenario_text = FALLBACK_SCENARIO_TEMPLATES[si % len(FALLBACK_SCENARIO_TEMPLATES)].format(topic=topic)

        if force_type == "Coding":
            q = Question(
                type="Coding",
                scenario=f"({difficulty} Level | Topic: {topic}) Implement feature variant #{i+1} by writing a function named `process_{topic.lower().replace(' ', '_')}_v{i+1}` that takes a parameter `config_data` and returns `True`. \n\nExpected Variables: \n- `config_data`\n- `status_flag`",
                options=None,
                correctIndex=None,
                hint="Make sure to define the function, use the required variables, and return True.",
                reason="This is the standard approach for this feature, ensuring all required variables are used.",
                answer=f"def process_{topic.lower().replace(' ', '_')}_v{i+1}(config_data):\n    status_flag = True\n    return status_flag",
                starterCode=f"def process_{topic.lower().replace(' ', '_')}_v{i+1}(config_data):\n    # Implement here\n    pass",
                requiredTokens=["def", "return", "config_data", "status_flag"],
                language="python"
            )
        else:
            q = Question(
                type="MCQ",
                scenario=scenario_text,
                options=options,
                correctIndex=0,
                hint="Think about reliability, performance, and best practices.",
                reason=f"{options[0]} directly addresses the root cause.",
            )
            _shuffle_mcq_options(q)
            
        questions.append(q)

    return questions


# -----------------------------
# Groq calls
# -----------------------------
def _groq_complete(prompt: str, temperature: float = 1.0, max_tokens: int = 8192) -> str:
    """Call Groq with streaming and return the full assembled response string."""
    if _groq_client is None:
        raise RuntimeError("Groq client not initialised — check GROQAPI_KEY in .env")

    stream = _groq_client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        max_completion_tokens=max_tokens,
        top_p=1,
        reasoning_effort="medium",
        stream=True,
        stop=None,
    )

    chunks = []
    for chunk in stream:
        delta = chunk.choices[0].delta
        if delta and delta.content:
            chunks.append(delta.content)
    return "".join(chunks)


def call_openrouter(subjects: List[str], types: List[str], count: int, difficulty: str = "Bachelor") -> List[Question]:
    """Generate questions via Groq (was OpenRouter)."""
    force_type = types[0] if types and len(types) == 1 else None

    if not GROQ_API_KEY:
        return fallback_questions(subjects, count, force_type, difficulty)

    allowed_types = ["MCQ", "Fill in the Blanks", "Short Answer", "Coding"]
    types = [t for t in (types or []) if t in allowed_types] or ["MCQ"]

    distributed = distribute_topics(subjects, count)

    force_type = types[0] if len(types) == 1 else None

    prompt = (
        "Generate high-quality varied technical questions.\n"
        "CRITICAL INSTRUCTION 1: You must strictly adhere to the exact topics requested below.\n"
        "CRITICAL INSTRUCTION 2: Every single question in the generated array MUST be entirely UNIQUE and test COMPLETELY DIFFERENT concepts. If the exact same topic appears multiple times, you MUST ask for totally distinct features or implementations so no two questions overlap.\n"
        "CRITICAL INSTRUCTION 3: If a topic string combines multiple tools (e.g. 'React and CSS'), the scenario must be a multi-part question intricately blending ALL those tools together.\n"
        f"CRITICAL INSTRUCTION 4: Scale the complexity and algorithmic depth of the coding tasks to explicitly target a '{difficulty}' difficulty level. A Middle School task should be very simple and fundamental, while a Veteran task should be highly complex and architecture-focused.\n"
        "For each question, the scenario, answer, options, or coding requirements MUST be explicitly and deeply about the assigned topic.\n"
        f"Topics (one per question, use them IN THIS EXACT ORDER): {json.dumps(distributed)}\n"
        f"Allowed types: {json.dumps(types)}\n"
        f"Total questions: {count}\n\n"
        "RULE 1: The 'scenario' string MUST begin with the explicit string '(Topic: <assigned_topic>)' so the system can verify adherence.\n"
        "RULE 2: For 'Coding' type questions, DO NOT ask generic math algorithms (like 'sum of numbers' or 'fibonacci') UNLESS the topic explicitly demands it. The code task MUST be deeply and specifically relevant to the exact topic.\n"
        "RULE 3: For 'Coding' type questions, DO NOT create a realistic or situational story. Directly and explicitly state the EXACT feature, function, or component the user needs to implement. Example: 'Implement a function named `fetchUserData` that makes an API call using React Query and returns the data...'\n"
        "RULE 4: For 'Coding' type questions, the `scenario` plain text MUST explicitly list the exact variable names, function names, and/or parameters the user is expected to use in their implementation. This ensures they know how their logic will be checked.\n"
        "RULE 5: ALL generated coding questions MUST ask for different logical features. Never repeat the same coding requirement twice in one generation sequence.\n\n"
    )

    if force_type:
        prompt += f'CRITICAL: Every question MUST have "type": "{force_type}".\n\n'

    prompt += (
        "Return ONLY a valid JSON array.\n"
        "No markdown. No explanations.\n"
        "For 'Coding' type questions, you MUST include:\n"
        "1) 'starterCode': A brief template/stub for the user (e.g., function definition).\n"
        "2) 'answer': THE FULL, CORRECT, WORKING CODE SOLUTION that solves the scenario.\n"
        "3) 'hint': A distinct nudge for the user if they miss it.\n"
        "4) 'reason': A high-level explanation of the code's approach.\n"
        "5) 'requiredTokens': A JSON array of 4-6 critical strings (keywords, method names, variable names) that MUST be present in a correct solution for validation.\n"
        "6) 'language': The language identifier (e.g. 'python', 'typescript', 'javascript', 'sql', 'bash').\n"
    )

    def _parse_response(raw: str) -> List[Question]:
        content = _strip_code_fences(raw)
        parsed = json.loads(content)
        if isinstance(parsed, dict) and "questions" in parsed:
            parsed = parsed["questions"]
        if not isinstance(parsed, list):
            raise ValueError("Expected JSON array")
        return [Question(**item) for item in parsed]

    try:
        raw_content = _groq_complete(prompt, temperature=1.0, max_tokens=8192)
        questions = dedupe_questions(_parse_response(raw_content))

        # 🔥 HARD FORCE TYPES (NO MATTER WHAT MODEL RETURNS)
        for q in questions:
            q.type = force_type if force_type else random.choice(types)

        # 🔥 If Coding, wipe MCQ fields and guarantee coding fields
        for q in questions:
            if q.type == "Coding":
                q.options = None
                q.correctIndex = None

                if not q.language:
                    q.language = "typescript"

                q.language = q.language.lower().strip()

                if not q.starterCode:
                    q.starterCode = "// implement solution here\n"

                if not q.requiredTokens:
                    q.requiredTokens = ["function", "return"]

                if not q.answer:
                    q.answer = "// The AI did not provide a complete solution for this question."
                else:
                    q.answer = _strip_code_fences(q.answer)

        # 🔥 Shuffle only if MCQ
        for q in questions:
            if q.type == "MCQ" and q.options:
                if q.correctIndex is None or q.correctIndex < 0 or q.correctIndex >= len(q.options):
                    q.correctIndex = 0
                _shuffle_mcq_options(q)

        return questions

    except Exception as e:
        import traceback
        print(f"Generate error: {e}")
        traceback.print_exc()
        return fallback_questions(subjects, count, force_type, difficulty)


def call_openrouter_topics(pdf_text: str) -> List[str]:
    """Extract topics from PDF text via Groq (was OpenRouter)."""
    if not GROQ_API_KEY:
        return match_topics_from_text(pdf_text)

    truncated = pdf_text[:8000]
    topics_json = json.dumps(ALL_TOPICS)

    prompt = (
        "You are a topic extraction assistant.\n"
        "Identify which topics from the provided list are discussed or relevant.\n\n"
        "RULES:\n"
        "1) ONLY return topics from the list.\n"
        "2) Return ONLY a JSON array of strings.\n"
        "3) Strings must match EXACT spelling/casing from the list.\n\n"
        f"AVAILABLE TOPICS:\n{topics_json}\n\n"
        f"DOCUMENT TEXT:\n{truncated}\n"
    )

    try:
        content = _groq_complete(prompt, temperature=0.1, max_tokens=2048)
        content = _strip_code_fences(content.strip())
        topics = json.loads(content)
        if isinstance(topics, list):
            return [t for t in topics if t in ALL_TOPICS]
    except Exception as e:
        print(f"Groq topic extraction failed: {e}")

    return match_topics_from_text(pdf_text)


# -----------------------------
# PDF Text Extraction (multiple fallbacks + OCR)
# -----------------------------
def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    try:
        from pdfminer.high_level import extract_text as pdfminer_extract
        text = pdfminer_extract(io.BytesIO(pdf_bytes))
        if text and text.strip():
            return text.strip()
    except Exception:
        pass

    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(io.BytesIO(pdf_bytes))
        out = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                out.append(page_text)
        text = "\n".join(out)
        if text.strip():
            return text.strip()
    except Exception:
        pass

    try:
        import fitz  # type: ignore
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        out = []
        for page in doc:
            out.append(page.get_text())
        doc.close()
        text = "\n".join(out)
        if text.strip():
            return text.strip()
    except Exception:
        pass

    try:
        import pdfplumber  # type: ignore
        out = []
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    out.append(page_text)
        text = "\n".join(out)
        if text.strip():
            return text.strip()
    except Exception:
        pass

    try:
        import fitz  # type: ignore
        import pytesseract  # type: ignore
        from PIL import Image  # type: ignore

        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        out = []
        max_pages = min(len(doc), 8)

        for i in range(max_pages):
            page = doc[i]
            pix = page.get_pixmap(dpi=200)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            ocr_text = pytesseract.image_to_string(img)
            if ocr_text and ocr_text.strip():
                out.append(ocr_text)

        doc.close()

        text = "\n".join(out)
        if text.strip():
            return text.strip()
    except Exception as e:
        print(f"OCR extraction failed: {e}")

    return ""


# -----------------------------
# Routes
# -----------------------------
@app.get("/")
def root():
    return {"message": "Backend is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/generate")
def generate_questions(req: GenerateRequest):
    if not req.subjects:
        raise HTTPException(status_code=400, detail="subjects must not be empty")

    count = req.count or 5
    types = req.types if req.types is not None else ["MCQ"]

    print("REQUEST TYPES:", types)

    questions = call_openrouter(req.subjects, types, count, req.difficulty)

    return {"questions": [q.dict() for q in questions]}

@app.post("/extract-topics", response_model=ExtractTopicsResponse)
async def extract_topics(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files supported")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    text = extract_text_from_pdf_bytes(content)
    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail=(
                "Could not extract text from the PDF. "
                "If it's scanned, enable OCR: brew install tesseract; pip install pymupdf pillow pytesseract."
            ),
        )

    matched = match_topics_from_text(text)

    if len(matched) < 5 and GROQ_API_KEY:
        llm_topics = call_openrouter_topics(text)
        matched = sorted(set(matched) | set(llm_topics))

    if not matched and GROQ_API_KEY:
        matched = call_openrouter_topics(text)

    return {"topics": matched}