import os
import json
import math
from pathlib import Path
from typing import List, Tuple
from dotenv import load_dotenv

load_dotenv()

FAISS_INDEX_PATH = os.getenv("FAISS_INDEX_PATH", "./embeddings")
TOP_K = int(os.getenv("TOP_K_RESULTS", 5))
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", 800))

SEED_CAREER_KNOWLEDGE = """
SOFTWARE ENGINEERING CAREER PATH
Entry-level: Junior Developer to Mid-level Developer to Senior Developer to Tech Lead to Engineering Manager.
Key skills: Data Structures, Algorithms, System Design, Git, REST APIs, Cloud AWS GCP Azure.
In-demand languages: Python, JavaScript, TypeScript, Go, Java, Rust.
Certifications: AWS Solutions Architect, Google Cloud Professional, Kubernetes CKA.

DATA SCIENCE AND AI ML PATH
Entry-level: Data Analyst to Data Scientist to ML Engineer to Research Scientist.
Key skills: Python, SQL, Statistics, Machine Learning, Deep Learning, Data Visualization, MLOps.
Frameworks: TensorFlow, PyTorch, scikit-learn, HuggingFace, LangChain.
Free resources: fast.ai, Kaggle, Coursera Andrew Ng ML course, CS50 Harvard.

PRODUCT MANAGEMENT PATH
Entry-level: Associate PM to Product Manager to Senior PM to Director of Product to VP Product.
Key skills: Market research, Agile, User stories, AB testing, Roadmapping, Stakeholder communication.
Tools: Jira, Confluence, Figma, Amplitude, Mixpanel.

RESUME BEST PRACTICES
Use action verbs: Built, Designed, Led, Optimised, Reduced, Increased.
Quantify impact: Reduced API latency by 40 percent beats improved performance.
Tailor keywords to the job description to pass ATS screening.
Keep to 1 page for less than 5 years experience, 2 pages max otherwise.
Highlight GitHub links, personal projects, and open-source contributions.
Education section: degree, institution, GPA if above 3.5, relevant coursework.

INTERVIEW PREPARATION
Technical Interviews: Practice LeetCode Easy to Medium to Hard progression.
Study common system design patterns: load balancers, caches, message queues, databases.
Explain your thought process aloud during interviews.
Behavioural Interviews use STAR method: Situation Task Action Result.
Common questions: Tell me about yourself, Biggest weakness, Conflict with teammate, Why this company.

LEARNING ROADMAPS
Beginner programmer 0 to 6 months: Python basics, OOP, Git, small projects, portfolio.
Web developer 0 to 12 months: HTML CSS, JavaScript, React, Nodejs, databases, deployment.
ML engineer 0 to 18 months: Python, Statistics, ML fundamentals, Deep Learning, MLOps, Kaggle competitions.
Free platforms: freeCodeCamp, Coursera, edX, fastai, The Odin Project, CS50.

NETWORKING AND JOB SEARCH
LinkedIn: complete profile, connect with alumni, engage with posts in your target industry.
Portfolio: personal website with 3 to 5 solid projects with live demos and GitHub repos.
Apply strategy: 60 percent referrals warm outreach, 30 percent targeted applications, 10 percent cold apply.
Follow up: send thank you email within 24 hours of every interview.

SKILL GAP ANALYSIS
Compare current skills against typical job description requirements.
Prioritise: hard blocking skills first, then nice to haves, then soft skills.
Use free resources: freeCodeCamp, Coursera, edX, fastai, The Odin Project, CS50.

COMMON CAREER TRANSITIONS
Developer to ML Engineer: learn Python data libraries, statistics, take Andrew Ng course, do Kaggle competitions.
Non-tech to tech: start with CS50, then pick web or data track, build portfolio projects.
Junior to Senior: focus on system design, mentoring others, leading projects, communication skills.
"""


class SimpleDocument:
    def __init__(self, page_content, metadata=None):
        self.page_content = page_content
        self.metadata = metadata or {}


class VectorStoreService:
    """Pure Python TF-IDF based retriever - no ML libraries needed."""

    def __init__(self):
        self.documents: List[SimpleDocument] = []
        self.tfidf_index = {}
        self.storage_path = Path(FAISS_INDEX_PATH) / "docs.json"

    def load_or_create_index(self):
        if self.storage_path.exists():
            print(f"Loading existing index from {self.storage_path}")
            self._load()
        else:
            print("Building fresh index from seed knowledge")
            self._build_from_seed()

    def _build_from_seed(self):
        chunks = self._chunk_text(SEED_CAREER_KNOWLEDGE, "seed_knowledge")
        self.documents = chunks
        self._build_tfidf()
        self._save()

    def _chunk_text(self, text: str, source: str) -> List[SimpleDocument]:
        words = text.split()
        chunks = []
        size = CHUNK_SIZE // 5  # approximate words per chunk
        for i in range(0, len(words), size):
            chunk = " ".join(words[i:i + size])
            if chunk.strip():
                chunks.append(SimpleDocument(chunk, {"source": source}))
        return chunks

    def _tokenize(self, text: str) -> List[str]:
        return text.lower().split()

    def _build_tfidf(self):
        """Build simple TF-IDF index."""
        self.tfidf_index = {}
        n_docs = len(self.documents)
        for i, doc in enumerate(self.documents):
            tokens = self._tokenize(doc.page_content)
            tf = {}
            for token in tokens:
                tf[token] = tf.get(token, 0) + 1
            for token, count in tf.items():
                if token not in self.tfidf_index:
                    self.tfidf_index[token] = {}
                self.tfidf_index[token][i] = count / len(tokens)

    def _score(self, query: str, doc_idx: int) -> float:
        tokens = self._tokenize(query)
        score = 0.0
        n_docs = len(self.documents)
        for token in tokens:
            if token in self.tfidf_index and doc_idx in self.tfidf_index[token]:
                tf = self.tfidf_index[token][doc_idx]
                df = len(self.tfidf_index[token])
                idf = math.log((n_docs + 1) / (df + 1)) + 1
                score += tf * idf
        return score

    def similarity_search(self, query: str, k: int = TOP_K):
        scores = []
        for i in range(len(self.documents)):
            s = self._score(query, i)
            scores.append((self.documents[i], s))
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:k]

    def add_text(self, text: str, source: str = "manual") -> int:
        chunks = self._chunk_text(text, source)
        self.documents.extend(chunks)
        self._build_tfidf()
        self._save()
        return len(chunks)

    def add_documents_from_file(self, file_path: str) -> int:
        ext = Path(file_path).suffix.lower()
        if ext == ".txt":
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
        elif ext == ".pdf":
            try:
                from pypdf import PdfReader
                reader = PdfReader(file_path)
                text = " ".join(page.extract_text() for page in reader.pages)
            except Exception as e:
                raise ValueError(f"PDF read error: {e}")
        elif ext == ".csv":
            import csv
            rows = []
            with open(file_path, "r", encoding="utf-8") as f:
                reader = csv.reader(f)
                for row in reader:
                    rows.append(", ".join(row))
            text = "\n".join(rows)
        else:
            raise ValueError(f"Unsupported file type: {ext}")

        return self.add_text(text, Path(file_path).name)

    def _save(self):
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        data = [{"content": d.page_content, "metadata": d.metadata} for d in self.documents]
        with open(self.storage_path, "w", encoding="utf-8") as f:
            json.dump(data, f)

    def _load(self):
        with open(self.storage_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.documents = [SimpleDocument(d["content"], d["metadata"]) for d in data]
        self._build_tfidf()