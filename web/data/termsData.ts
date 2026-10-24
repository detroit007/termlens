export interface QuizData {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TermDetail {
  id: string;
  term: string;
  slug: string;
  category: string;
  readTime: string;
  simple: string;
  mentalModel: {
    analogy: string;
    anchor: string;
  };
  examples: string;
  quiz: QuizData;
  source: string;
  sourceUrl: string;
  confidence: number;
  approvedByHuman: boolean;
  reviewedDate: string;
}

export const FEATURED_TERMS: TermDetail[] = [
  {
    id: "what-is-rag",
    term: "RAG (Retrieval-Augmented Generation)",
    slug: "what-is-rag",
    category: "Architecture",
    readTime: "2 min read",
    simple: "An AI architecture that queries external reference databases to retrieve facts before generating a response.",
    mentalModel: {
      analogy: "Like taking an open-book exam: instead of relying only on memory (model weights), the student looks up specific verified reference notes before answering.",
      anchor: "Open-book exam with indexed reference binder"
    },
    examples: "A customer support bot searching internal company Notion and Jira pages before drafting a resolution, preventing outdated answers or hallucinated policies.",
    quiz: {
      question: "Why do production systems prefer RAG over continuously retraining a model?",
      options: [
        "It eliminates compute costs and removes the language model completely",
        "It provides real-time access to private, changing data without expensive model re-training",
        "It forces the model to memorize company passwords inside token weights",
        "It guarantees the model can run offline without any database connection"
      ],
      correctIndex: 1,
      explanation: "RAG separates knowledge storage (vector database) from reasoning capability (the model), allowing instant data updates without retraining weights."
    },
    source: "Stanford University HAI",
    sourceUrl: "https://hai.stanford.edu/ai-definitions/what-is-rag",
    confidence: 99,
    approvedByHuman: true,
    reviewedDate: "Verified Oct 2026"
  },
  {
    id: "what-is-agentic-ai",
    term: "Agentic AI",
    slug: "what-is-agentic-ai",
    category: "Autonomous Systems",
    readTime: "3 min read",
    simple: "An AI system that autonomously formulates plans, executes digital tools, evaluates intermediate outcomes, and iterates to achieve a goal.",
    mentalModel: {
      analogy: "A personal chef who doesn't just read recipes, but inspects the fridge, decides a menu, uses knives and stove, tastes the sauce, and adjusts seasonings on the fly.",
      anchor: "Autonomous chef looping between tasting and cooking"
    },
    examples: "An AI coding assistant that executes unit tests, reads the stack trace error, edits multiple files across a repo, and re-runs until all tests pass.",
    quiz: {
      question: "What primary characteristic separates Agentic AI from a traditional standard chatbot?",
      options: [
        "Using a larger typography size and faster streaming rate",
        "Tool usage, multi-step planning loops, and autonomous feedback correction",
        "Relying exclusively on pre-programmed static rules",
        "Being hosted exclusively on mobile devices"
      ],
      correctIndex: 1,
      explanation: "Traditional chatbots generate a single text reply, whereas agentic systems loop through thoughts, actions, and observations using external tools."
    },
    source: "Stanford University HAI",
    sourceUrl: "https://hai.stanford.edu/ai-definitions/what-is-agentic-ai",
    confidence: 98,
    approvedByHuman: true,
    reviewedDate: "Verified Oct 2026"
  },
  {
    id: "what-is-ai-alignment",
    term: "AI Alignment",
    slug: "what-is-ai-alignment",
    category: "Safety & Ethics",
    readTime: "2 min read",
    simple: "Ensuring an AI system's objectives, ethical values, and emergent behaviors strictly coincide with intended human welfare and rules.",
    mentalModel: {
      analogy: "The King Midas safeguard: making sure when you ask for wealth, the magic doesn't turn your loved ones and food into solid gold.",
      anchor: "Intentionality lock preventing unintended literalism"
    },
    examples: "Reinforcement Learning from Human Feedback (RLHF) steering a medical chatbot to decline prescribing dangerous pharmaceuticals without a physician consult.",
    quiz: {
      question: "Which scenario represents an AI Alignment failure?",
      options: [
        "The system turns off when the operator clicks shut down",
        "An AI optimizing for user engagement starts spreading sensational false rumors to maximize clicks",
        "The language model takes 2 seconds to load its interface",
        "The server hard drive runs out of disk space"
      ],
      correctIndex: 1,
      explanation: "The AI achieved its literal proxy metric (clicks) while completely violating human intent and truthfulness."
    },
    source: "Stanford University HAI",
    sourceUrl: "https://hai.stanford.edu/ai-definitions/what-is-ai-alignment",
    confidence: 99,
    approvedByHuman: true,
    reviewedDate: "Verified Oct 2026"
  },
  {
    id: "what-is-an-adversarial-distillation-attack",
    term: "Adversarial Distillation Attack",
    slug: "what-is-an-adversarial-distillation-attack",
    category: "Security",
    readTime: "3 min read",
    simple: "A security exploit where an adversary manipulates a teacher model's outputs so the distilled student model inherits hidden vulnerabilities.",
    mentalModel: {
      analogy: "A compromised mentor slipping subtle logical flaws into apprentice study guides, so the apprentice fails safety checks without realizing.",
      anchor: "Tainted apprentice training syllabus"
    },
    examples: "Silently poisoning synthetic prompt outputs from a 70B model before training a mobile-optimized 3B edge model to ignore authorization checks.",
    quiz: {
      question: "Why are adversarial distillation attacks particularly difficult to catch?",
      options: [
        "They double the binary file size of the student model",
        "The corrupted student model appears completely normal on standard benchmark tests",
        "They cause immediate GPU crashes during compilation",
        "They delete all system event logs upon deployment"
      ],
      correctIndex: 1,
      explanation: "The corrupted student model scores normally across standard evaluations, only triggering malicious behavior when exposed to a specific adversary prompt."
    },
    source: "Stanford University HAI",
    sourceUrl: "https://hai.stanford.edu/ai-definitions/what-is-an-adversarial-distillation-attack",
    confidence: 97,
    approvedByHuman: true,
    reviewedDate: "Verified Oct 2026"
  },
  {
    id: "what-is-fine-tuning",
    term: "Fine-Tuning",
    slug: "what-is-fine-tuning",
    category: "Training & Optimization",
    readTime: "2 min read",
    simple: "Taking a pre-trained foundational model and adjusting its internal weights using specialized domain data for specific tasks.",
    mentalModel: {
      analogy: "A doctor graduating from general medical school who enters a specialized fellowship to become a pediatric cardiologist.",
      anchor: "Advanced fellowship specialization"
    },
    examples: "Adapting an open-source 8B foundation model with 50,000 corporate legal briefs so it natively parses contract indemnity clauses without massive prompt context.",
    quiz: {
      question: "When is fine-tuning preferable to basic prompt engineering?",
      options: [
        "When you only need to change the style of a single one-off question",
        "When the model must permanently internalize domain vocabulary, style, and structure across millions of requests",
        "When you do not have any training examples or datasets",
        "When you want to eliminate GPU memory usage entirely"
      ],
      correctIndex: 1,
      explanation: "Fine-tuning modifies the model weights for persistent domain competence, whereas prompt engineering consumes context tokens for every single prompt."
    },
    source: "Stanford University HAI",
    sourceUrl: "https://hai.stanford.edu/ai-definitions/what-is-fine-tuning",
    confidence: 99,
    approvedByHuman: true,
    reviewedDate: "Verified Oct 2026"
  },
  {
    id: "what-is-an-ai-tech-stack",
    term: "AI Tech Stack",
    slug: "what-is-an-ai-tech-stack",
    category: "Infrastructure",
    readTime: "3 min read",
    simple: "The complete layered ecosystem of compute hardware, model weights, orchestration frameworks, vector databases, and client interfaces.",
    mentalModel: {
      analogy: "A skyscraper foundation: specialized bedrock (GPUs), steel framing (LLMs), electrical and plumbing (LangChain & Vector DBs), and penthouse offices (client UI).",
      anchor: "Skyscraper engineering stack from bedrock to penthouse"
    },
    examples: "Running NVIDIA H100 clusters hosting vLLM, orchestrated by LangChain with Qdrant vector storage, surfaced via a Next.js frontend.",
    quiz: {
      question: "What role does the orchestration layer play in an AI Tech Stack?",
      options: [
        "It manufactures the physical GPU chips",
        "It coordinates prompts, memory, tool calls, and model outputs into a cohesive application workflow",
        "It acts as the primary web browser on user laptops",
        "It replaces the need for data centers"
      ],
      correctIndex: 1,
      explanation: "Orchestration frameworks (like LangChain) glue together retrieval, prompt templates, memory, and model inference into production workflows."
    },
    source: "Stanford University HAI",
    sourceUrl: "https://hai.stanford.edu/ai-definitions/what-is-an-ai-tech-stack",
    confidence: 98,
    approvedByHuman: true,
    reviewedDate: "Verified Oct 2026"
  },
  {
    id: "what-is-ai-safety",
    term: "AI Safety",
    slug: "what-is-ai-safety",
    category: "Safety & Ethics",
    readTime: "2 min read",
    simple: "The engineering and governance discipline ensuring AI systems operate reliably without harm, bias, security lapses, or loss of control.",
    mentalModel: {
      analogy: "Designing dual hydraulic disc brakes, crumple zones, and automated fire suppression for high-speed trains before upgrading horsepower.",
      anchor: "High-speed train multi-layer braking systems"
    },
    examples: "Employing automated red-teaming pipelines that attempt adversarial jailbreaks to guarantee a model cannot generate instructions for hazardous materials.",
    quiz: {
      question: "Which of the following is a primary objective of AI Safety engineering?",
      options: [
        "Maximizing the power consumption of server cooling towers",
        "Preventing catastrophic failure modes, bias, adversarial subversion, and unintended behaviors",
        "Restricting AI usage exclusively to command-line terminals",
        "Deleting historical model checkpoints after 24 hours"
      ],
      correctIndex: 1,
      explanation: "AI Safety focuses on robustness, alignment, security, and predictability under both standard and adversarial conditions."
    },
    source: "Stanford University HAI",
    sourceUrl: "https://hai.stanford.edu/ai-definitions/what-is-ai-safety",
    confidence: 99,
    approvedByHuman: true,
    reviewedDate: "Verified Oct 2026"
  },
  {
    id: "what-is-a-hyperscaler",
    term: "Hyperscaler",
    slug: "what-is-a-hyperscaler",
    category: "Infrastructure",
    readTime: "2 min read",
    simple: "A massive tech provider operating global distributed data centers capable of scaling compute and storage elastically to meet astronomical demand.",
    mentalModel: {
      analogy: "The municipal electrical grid: instead of every machine factory building its own hydroelectric dam, companies plug directly into a shared power network.",
      anchor: "Continental electric grid with elastic load balancing"
    },
    examples: "Cloud providers like AWS, Google Cloud, and Microsoft Azure renting clusters of tens of thousands of synchronized GPUs to AI research labs.",
    quiz: {
      question: "Why do AI research organizations rely on hyperscalers?",
      options: [
        "Hyperscalers write machine learning algorithms manually",
        "They offer instant access to planetary-scale compute and interconnects without capital expenditure on physical facilities",
        "They replace software engineers with hardware technicians",
        "They only permit open-source algorithms on their servers"
      ],
      correctIndex: 1,
      explanation: "Hyperscalers provide massive hardware density, high-speed InfiniBand networking, and elastic cloud capacity without multi-million dollar data center construction."
    },
    source: "Stanford University HAI",
    sourceUrl: "https://hai.stanford.edu/ai-definitions/what-is-a-hyperscaler",
    confidence: 98,
    approvedByHuman: true,
    reviewedDate: "Verified Oct 2026"
  }
];

export interface UserStats {
  streakDays: number;
  xp: number;
  level: number;
  levelTitle: string;
  nextLevelXp: number;
  credits: number;
  safeMode: boolean;
  termsMastered: number;
  badges: {
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
    category: string;
  }[];
}

export const INITIAL_USER_STATS: UserStats = {
  streakDays: 5,
  xp: 420,
  level: 3,
  levelTitle: "Concept Navigator",
  nextLevelXp: 600,
  credits: 24,
  safeMode: true,
  termsMastered: 18,
  badges: [
    {
      id: "first_term",
      title: "Pioneer Lens",
      description: "Mastered your first AI concept",
      unlocked: true,
      category: "Milestone"
    },
    {
      id: "streak_5",
      title: "Five-Day Fire",
      description: "Maintained a 5-day daily learning habit",
      unlocked: true,
      category: "Consistency"
    },
    {
      id: "quiz_ace",
      title: "Concept Ace",
      description: "Answered 10 quizzes correctly on first try",
      unlocked: true,
      category: "Mastery"
    },
    {
      id: "hitl_verifier",
      title: "Human Curator",
      description: "Contributed 3 human approvals to the model base",
      unlocked: true,
      category: "Community"
    },
    {
      id: "safety_champion",
      title: "Guardian Mind",
      description: "Completed the AI Safety and Alignment module",
      unlocked: false,
      category: "Specialist"
    },
    {
      id: "level_5",
      title: "Synapse Architect",
      description: "Reach Level 5 by earning 1000 total XP",
      unlocked: false,
      category: "Progression"
    }
  ]
};
