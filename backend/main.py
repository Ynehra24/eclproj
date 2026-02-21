from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
import io
import requests
import random
import json
import re

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE = "https://openrouter.ai/api/v1"

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
FALLBACK_SCENARIOS = [
    "A production API is experiencing latency spikes under load.",
    "A distributed service intermittently fails during peak traffic.",
    "A Kubernetes cluster is restarting pods unexpectedly.",
    "A database query locks rows and delays transactions.",
    "A frontend app freezes after a state update cascade.",
    "An ML model's validation loss is diverging from training loss.",
    "A CI/CD pipeline fails intermittently on the deploy step.",
    "A microservice cannot discover its downstream dependencies.",
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


def fallback_questions(subjects: List[str], count: int) -> List[Question]:
    questions: List[Question] = []
    distributed = distribute_topics(subjects, count)
    indices = list(range(len(FALLBACK_SCENARIOS)))
    random.shuffle(indices)

    for i in range(count):
        si = indices[i % len(indices)]
        options = FALLBACK_OPTION_SETS[si].copy()
        topic = distributed[i] if i < len(distributed) else random.choice(subjects)

        q = Question(
            type="MCQ",
            scenario=f"(Topic: {topic}) You need to optimize the {topic} layer of your application. Which improvement is most appropriate?",
            options=options,
            correctIndex=0,
            hint="Think about reliability, performance, and best practices.",
            reason=f"{options[0]} directly addresses the root cause.",
        )
        _shuffle_mcq_options(q)
        questions.append(q)

    return questions


# -----------------------------
# OpenRouter calls
# -----------------------------
def call_openrouter(subjects: List[str], types: List[str], count: int) -> List[Question]:
    if not OPENROUTER_API_KEY:
        return fallback_questions(subjects, count)

    allowed_types = ["MCQ", "Fill in the Blanks", "Short Answer", "Coding"]
    types = [t for t in (types or []) if t in allowed_types] or ["MCQ"]

    distributed = distribute_topics(subjects, count)

    force_type = types[0] if len(types) == 1 else None

    prompt = (
        "Generate high-quality varied technical questions.\n"
        "CRITICAL INSTRUCTION 1: You must strictly adhere to the exact topics requested below.\n"
        "CRITICAL INSTRUCTION 2: Every single question MUST test COMPLETELY DIFFERENT concepts. If the exact same topic appears multiple times, you must address totally distinct aspects, features, or difficulty levels (e.g. beginner vs advanced) to ensure 5 UNIQUE questions.\n"
        "CRITICAL INSTRUCTION 3: If a topic string combines multiple tools (e.g. 'React and CSS'), the scenario must be a multi-part question intricately blending ALL those tools together.\n"
        "For each question, the scenario, answer, options, or coding requirements MUST be explicitly and deeply about the assigned topic.\n"
        f"Topics (one per question, use them IN THIS EXACT ORDER): {json.dumps(distributed)}\n"
        f"Allowed types: {json.dumps(types)}\n"
        f"Total questions: {count}\n\n"
        "RULE: The 'scenario' string MUST begin with the explicit string '(Topic: <assigned_topic>)' so the system can verify adherence.\n\n"
    )

    if force_type:
        prompt += f'CRITICAL: Every question MUST have "type": "{force_type}".\n\n'

    prompt += (
        "Return ONLY a valid JSON array.\n"
        "No markdown. No explanations.\n"
        "If a question is of type 'Coding', you MUST optionally include a 'language' string field indicating the detected programming language (e.g. 'python', 'typescript', 'javascript', 'sql', 'bash', 'css', 'html').\n"
    )

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    body = {
        "model": "openai/gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.5, # Lowered temperature for stricter adherence
    }

    def _parse_response(raw: str) -> List[Question]:
        content = _strip_code_fences(raw)
        parsed = json.loads(content)

        if isinstance(parsed, dict) and "questions" in parsed:
            parsed = parsed["questions"]

        if not isinstance(parsed, list):
            raise ValueError("Expected JSON array")

        return [Question(**item) for item in parsed]

    try:
        r = requests.post(
            f"{OPENROUTER_BASE}/chat/completions",
            json=body,
            headers=headers,
            timeout=60,
        )
        r.raise_for_status()

        raw_content = r.json()["choices"][0]["message"]["content"]
        questions = dedupe_questions(_parse_response(raw_content))

        # 🔥 HARD FORCE TYPES (NO MATTER WHAT MODEL RETURNS)
        for q in questions:
            q.type = force_type if force_type else random.choice(types)

        # 🔥 If Coding, wipe MCQ fields and guarantee coding fields
        for q in questions:
            if q.type == "Coding":
                q.options = None
                q.correctIndex = None
                q.answer = None

                if not q.language:
                    # Provide a fallback just in case the LLM doesn't supply it
                    q.language = "typescript"

                # Standardize language strings to match frontend IDs
                q.language = q.language.lower().strip()

                if not q.starterCode:
                    q.starterCode = "// implement solution here"

                if not q.requiredTokens:
                    q.requiredTokens = ["function", "return", "await"]

        # 🔥 Shuffle only if MCQ
        for q in questions:
            if q.type == "MCQ" and q.options:
                if q.correctIndex is None or q.correctIndex < 0 or q.correctIndex >= len(q.options):
                    q.correctIndex = 0
                _shuffle_mcq_options(q)

        return questions

    except Exception as e:
        print(f"Generate error: {e}")
        return fallback_questions(subjects, count)




def call_openrouter_topics(pdf_text: str) -> List[str]:
    if not OPENROUTER_API_KEY:
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

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    body = {
        "model": "openai/gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,
    }

    try:
        r = requests.post(
            f"{OPENROUTER_BASE}/chat/completions",
            json=body,
            headers=headers,
            timeout=30,
        )
        r.raise_for_status()

        content = r.json()["choices"][0]["message"]["content"].strip()
        content = _strip_code_fences(content)

        topics = json.loads(content)
        if isinstance(topics, list):
            return [t for t in topics if t in ALL_TOPICS]
    except Exception as e:
        print(f"LLM topic extraction failed: {e}")

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
def generate_scenario(request: GenerateRequest):
    if not request.subjects:
        raise HTTPException(status_code=400, detail="subjects must not be empty")

    count = request.count or 5
    types = request.types if request.types is not None else ["MCQ"]

    print("REQUEST TYPES:", types)

    questions = call_openrouter(request.subjects, types, count)

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

    if len(matched) < 5 and OPENROUTER_API_KEY:
        llm_topics = call_openrouter_topics(text)
        matched = sorted(set(matched) | set(llm_topics))

    if not matched and OPENROUTER_API_KEY:
        matched = call_openrouter_topics(text)

    return {"topics": matched}