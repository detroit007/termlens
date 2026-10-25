export interface QuizData {
  question: string;
  options: string[];
  correctIndex: number;
  correctAnswerText: string;
  hint?: string;
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
    steps: string[];
  };
  example: string;
  quiz: QuizData;
  source: string;
  sourceUrl: string;
  fromGlossary: boolean;
  webSearchUsed: boolean;
  hitlApproved: boolean;
  confidence: number;
  reviewedDate: string;
}

export interface UserStats {
  id?: number;
  username?: string;
  streakDays: number;
  streakFreezes: number;
  xp: number;
  level: number;
  levelTitle: string;
  nextLevelXp: number;
  credits: number;
  dailyGoal: number;
  dailyProgress: number;
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

export const FEATURED_TERMS: TermDetail[] = [
  {
    id: "what-is-rag",
    term: "RAG (Retrieval-Augmented Generation)",
    slug: "what-is-rag",
    category: "Architecture",
    readTime: "2 min read",
    simple: "RAG is an AI helper that looks up facts in a school library before writing an answer.",
    mentalModel: {
      analogy: "Like taking an open-book test with an encyclopedia on your desk.",
      anchor: "Open-book library research",
      steps: [
        "Step 1: Read the student's question carefully.",
        "Step 2: Search the library index for the most relevant reference page.",
        "Step 3: Combine the book notes with your own words to write a clear answer."
      ]
    },
    example: "A homework help bot checking science textbook chapters before answering biology questions.",
    quiz: {
      question: "What does a RAG system do before generating an answer?",
      options: [
        "A: Searches external documents for up-to-date facts",
        "B: Shuts down the computer",
        "C: Deletes the student's question",
        "D: Plays a video game"
      ],
      correctIndex: 0,
      correctAnswerText: "A",
      hint: "Think about looking up reference notes before answering.",
      explanation: "RAG retrieves information from external documents before generating a response, preventing outdated facts."
    },
    source: "Stanford University HAI",
    sourceUrl: "https://hai.stanford.edu/ai-definitions/what-is-rag",
    fromGlossary: true,
    webSearchUsed: false,
    hitlApproved: false,
    confidence: 99,
    reviewedDate: "Verified Oct 2026"
  },
  {
    id: "what-is-agentic-ai",
    term: "Agentic AI",
    slug: "what-is-agentic-ai",
    category: "Autonomous Systems",
    readTime: "3 min read",
    simple: "Agentic AI is like an autonomous chef who can plan a recipe, use kitchen tools, taste the soup, and fix the seasoning.",
    mentalModel: {
      analogy: "A personal chef who doesn't just read recipes, but cooks, tastes, and adjusts seasonings on the fly.",
      anchor: "Autonomous chef looping between tasting and cooking",
      steps: [
        "Step 1: Set a clear goal (e.g., make a balanced dinner).",
        "Step 2: Use tools like knives and stoves to take intermediate actions.",
        "Step 3: Taste the result, learn from feedback, and adjust until finished."
      ]
    },
    example: "An AI coding helper that runs unit tests, reads the error messages, edits code, and re-tests until everything works.",
    quiz: {
      question: "What main capability separates Agentic AI from a regular chatbot?",
      options: [
        "A: Using a larger font on the screen",
        "B: Tool usage, multi-step planning loops, and feedback correction",
        "C: Running exclusively on battery power",
        "D: Never making any mistakes"
      ],
      correctIndex: 1,
      correctAnswerText: "B",
      hint: "Think about using tools and adjusting based on feedback.",
      explanation: "Agentic systems don't just output a single reply; they loop through thoughts, actions, and observations using tools."
    },
    source: "Stanford University HAI",
    sourceUrl: "https://hai.stanford.edu/ai-definitions/what-is-agentic-ai",
    fromGlossary: true,
    webSearchUsed: false,
    hitlApproved: false,
    confidence: 98,
    reviewedDate: "Verified Oct 2026"
  },
  {
    id: "what-is-ai-safety",
    term: "AI Safety",
    slug: "what-is-ai-safety",
    category: "Safety & Ethics",
    readTime: "2 min read",
    simple: "AI Safety is designing guardrails and emergency brakes so smart machines stay helpful and never cause harm.",
    mentalModel: {
      analogy: "Designing seatbelts, airbags, and anti-lock brakes for high-speed trains before speeding up the engine.",
      anchor: "High-speed train safety and braking systems",
      steps: [
        "Step 1: Identify potential hazards or accidents before the train leaves the station.",
        "Step 2: Install multiple independent safety switches and automatic speed limiters.",
        "Step 3: Keep a human conductor in the loop with emergency override controls."
      ]
    },
    example: "Putting guardrails on school chatbots to ensure they only answer homework questions and block inappropriate topics.",
    quiz: {
      question: "Why do engineers test AI Safety before deploying powerful models?",
      options: [
        "A: To make the model consume more electricity",
        "B: To prevent harmful behavior, bias, and unexpected mistakes",
        "C: To slow down the internet on purpose",
        "D: To hide the software from teachers"
      ],
      correctIndex: 1,
      correctAnswerText: "B",
      hint: "Think about protecting students from harm.",
      explanation: "Safety testing ensures models act reliably and safely even in unusual or unexpected situations."
    },
    source: "Stanford University HAI",
    sourceUrl: "https://hai.stanford.edu/ai-definitions/what-is-ai-safety",
    fromGlossary: true,
    webSearchUsed: false,
    hitlApproved: false,
    confidence: 99,
    reviewedDate: "Verified Oct 2026"
  }
];

export const INITIAL_USER_STATS: UserStats = {
  id: 1,
  username: "student1",
  streakDays: 3,
  streakFreezes: 1,
  xp: 120,
  level: 2,
  levelTitle: "Concept Explorer",
  nextLevelXp: 200,
  credits: 25,
  dailyGoal: 3,
  dailyProgress: 1,
  safeMode: true,
  termsMastered: 8,
  badges: [
    {
      id: "first_step",
      title: "First Spark",
      description: "Explored your first AI concept with TermLens",
      unlocked: true,
      category: "Milestone"
    },
    {
      id: "streak_3",
      title: "Three-Day Fire",
      description: "Kept your learning streak alive for 3 days",
      unlocked: true,
      category: "Consistency"
    },
    {
      id: "quiz_ace",
      title: "Mastery Ace",
      description: "Scored a perfect 3/3 on an AI concept quiz",
      unlocked: false,
      category: "Mastery"
    },
    {
      id: "daily_champion",
      title: "Daily Champion",
      description: "Achieved your daily study goal",
      unlocked: false,
      category: "Dedication"
    },
    {
      id: "curator_ally",
      title: "Curator Ally",
      description: "Submitted an educational review for external search",
      unlocked: false,
      category: "Community"
    }
  ]
};
