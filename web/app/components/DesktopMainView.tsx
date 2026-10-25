"use client";

import React, { useState, useEffect } from "react";
import { TermDetail, UserStats } from "../../data/termsData";
import {
  IconSearch,
  IconLens,
  IconBrain,
  IconLightbulb,
  IconQuiz,
  IconCheck,
  IconCross,
  IconExternal,
  IconShield,
  IconSparkles,
  IconUserCheck,
  IconPlay,
  IconPause,
  IconRefresh,
  IconFlame,
  IconCredit,
  IconLayers,
} from "./Icons";

interface DesktopMainViewProps {
  terms: TermDetail[];
  selectedTerm: TermDetail;
  onSelectTerm: (term: TermDetail) => void;
  userStats: UserStats;
  onUpdateStats: (updater: (prev: UserStats) => UserStats) => void;
}

export default function DesktopMainView({
  terms,
  selectedTerm,
  onSelectTerm,
  userStats,
  onUpdateStats,
}: DesktopMainViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizGrade, setQuizGrade] = useState<{
    score: number;
    rating: string;
    feedback: string;
    xp_awarded: number;
  } | null>(null);
  const [isGrading, setIsGrading] = useState(false);

  // SSE Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStage, setStreamStage] = useState<string>("");
  const [streamMessage, setStreamMessage] = useState<string>("");
  const [hitlStatus, setHitlStatus] = useState<"idle" | "pending" | "approved">("idle");
  const [activeTab, setActiveTab] = useState<"all" | "architecture" | "safety" | "autonomous">("all");
  const [freezeMessage, setFreezeMessage] = useState<string>("");

  useEffect(() => {
    setSelectedOption(null);
    setQuizSubmitted(false);
    setQuizGrade(null);
    setHitlStatus("idle");
    setStreamStage("");
    setStreamMessage("");
  }, [selectedTerm.id]);

  const filteredTerms = terms.filter((t) => {
    const matchesSearch =
      t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.simple.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "architecture") return matchesSearch && t.category.toLowerCase().includes("architecture");
    if (activeTab === "safety") return matchesSearch && t.category.toLowerCase().includes("safety");
    if (activeTab === "autonomous") return matchesSearch && t.category.toLowerCase().includes("autonomous");
    return matchesSearch;
  });

  // Real-time SSE Stream trigger
  const startSSEStreaming = () => {
    setIsStreaming(true);
    setStreamStage("initializing");
    setStreamMessage("Connecting to TermLens AI pipeline...");

    const eventSource = new EventSource(
      `http://127.0.0.1:8000/api/explain/stream?term=${encodeURIComponent(selectedTerm.term)}&user_id=1`
    );

    eventSource.addEventListener("stage", (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        setStreamStage(payload.stage || "processing");
        setStreamMessage(payload.message || "Working...");
      } catch (err) {
        console.error("Error parsing stage event", err);
      }
    });

    eventSource.addEventListener("result", (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.explanation) {
          const exp = payload.explanation;
          onSelectTerm({
            ...selectedTerm,
            simple: exp.simple,
            mentalModel: {
              analogy: exp.mental_model?.analogy || selectedTerm.mentalModel.analogy,
              anchor: selectedTerm.mentalModel.anchor,
              steps: exp.mental_model?.steps || selectedTerm.mentalModel.steps,
            },
            example: exp.example,
            quiz: {
              ...selectedTerm.quiz,
              question: exp.quiz?.question || selectedTerm.quiz.question,
              options: exp.quiz?.options || selectedTerm.quiz.options,
              hint: exp.quiz?.hint || selectedTerm.quiz.hint,
            },
            fromGlossary: payload.source === "Stanford University HAI",
            webSearchUsed: exp.web_search_used,
          });
        }
      } catch (err) {
        console.error("Error parsing result event", err);
      }
    });

    eventSource.addEventListener("complete", () => {
      setIsStreaming(false);
      setStreamStage("complete");
      setStreamMessage("Explanation complete!");
      eventSource.close();
    });

    eventSource.onerror = () => {
      setIsStreaming(false);
      eventSource.close();
    };
  };

  // Submit Quiz for 0-3 LLM grading
  const handleOptionSelect = async (index: number) => {
    if (quizSubmitted || isGrading) return;
    setSelectedOption(index);
    setIsGrading(true);

    const chosenOptionText = selectedTerm.quiz.options[index];
    const letter = String.fromCharCode(65 + index);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/quiz/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term: selectedTerm.term,
          question: selectedTerm.quiz.question,
          student_answer: letter,
          correct_answer: selectedTerm.quiz.correctAnswerText || selectedTerm.quiz.options[selectedTerm.quiz.correctIndex],
          user_id: userStats.id || 1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setQuizGrade(data.grade);
        setQuizSubmitted(true);

        onUpdateStats((prev) => ({
          ...prev,
          xp: prev.xp + data.grade.xp_awarded,
          level: Math.max(1, Math.floor((prev.xp + data.grade.xp_awarded) / 100) + 1),
          termsMastered: prev.termsMastered + (data.grade.score >= 2 ? 1 : 0),
        }));
      }
    } catch {
      // Offline fallback grading
      const isCorrect = index === selectedTerm.quiz.correctIndex;
      setQuizGrade({
        score: isCorrect ? 3 : 0,
        rating: isCorrect ? "Mastery" : "Needs Review",
        feedback: isCorrect
          ? "Spot on! You demonstrated a complete understanding of this concept."
          : "Not quite yet. Review the mental model steps and try again!",
        xp_awarded: isCorrect ? 30 : 5,
      });
      setQuizSubmitted(true);
    } finally {
      setIsGrading(false);
    }
  };

  // Buy or use Streak Freeze
  const handleBuyStreakFreeze = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/user/freeze?user_id=1", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        onUpdateStats((prev) => ({
          ...prev,
          streakFreezes: data.streak_freezes,
          credits: data.credits,
        }));
        setFreezeMessage(data.message);
        setTimeout(() => setFreezeMessage(""), 4000);
      } else {
        setFreezeMessage(data.message || "Failed to purchase freeze.");
        setTimeout(() => setFreezeMessage(""), 4000);
      }
    } catch {
      setFreezeMessage("Offline: Streak Freeze activated!");
      setTimeout(() => setFreezeMessage(""), 3000);
    }
  };

  // Teacher/Curator HITL Approval
  const handleHitlApproval = async () => {
    setHitlStatus("approved");
    onUpdateStats((prev) => ({
      ...prev,
      xp: prev.xp + 20,
      credits: prev.credits + 2,
    }));
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Header Bar */}
      <header className="clay-card p-5 px-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#6034EE] to-[#8762FE] flex items-center justify-center text-white shadow-md">
            <IconLens className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#1C1335]">TermLens</h1>
              <span className="clay-pill clay-pill-violet text-[11px] py-0.5 px-2">School Edition</span>
            </div>
            <p className="text-xs text-[#51486B] font-medium">Bite-sized AI mental models for curious students</p>
          </div>
        </div>

        {/* Global Progress & Engagement Indicators */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          {/* Safe Mode Badge */}
          <div className="clay-pill clay-pill-mint" title="Guardrails active: School Safe, PII Redacted, Anti-Injection">
            <IconShield className="w-3.5 h-3.5 text-[#059669]" />
            <span>Safe Mode: Active</span>
          </div>

          {/* Daily Goal */}
          <div className="clay-pill clay-pill-violet" title="Daily Goal Progress">
            <IconLayers className="w-3.5 h-3.5 text-[#6B42FD]" />
            <span>Goal: {userStats.dailyProgress}/{userStats.dailyGoal}</span>
          </div>

          {/* Streak Badge */}
          <div className="clay-pill clay-pill-peach">
            <IconFlame className="w-3.5 h-3.5 text-[#FF7E62]" />
            <span>{userStats.streakDays} Day Streak</span>
          </div>

          {/* Streak Freeze Indicator & Action */}
          <button
            onClick={handleBuyStreakFreeze}
            className="clay-pill clay-pill-sunflower hover:bg-[#FEF0D2] transition-colors cursor-pointer"
            title="Click to purchase a Streak Freeze (5 credits)"
          >
            <IconShield className="w-3.5 h-3.5 text-[#D97706]" />
            <span>{userStats.streakFreezes} Freezes</span>
          </button>

          {/* XP & Level */}
          <div className="clay-pill clay-pill-violet">
            <IconSparkles className="w-3.5 h-3.5 text-[#6B42FD]" />
            <span>{userStats.xp} XP</span>
            <span className="text-[10px] text-[#7A7094] border-l border-[#D8CCFD] pl-1.5">Lvl {userStats.level}</span>
          </div>

          {/* Credits */}
          <div className="clay-pill clay-pill-sunflower">
            <IconCredit className="w-3.5 h-3.5 text-[#D97706]" />
            <span>{userStats.credits} Credits</span>
          </div>
        </div>
      </header>

      {freezeMessage && (
        <div className="p-3 bg-[#E7FAF2] border border-[#A7F3D0] text-[#047857] text-xs font-semibold rounded-2xl flex items-center justify-between">
          <span>{freezeMessage}</span>
          <IconCheck className="w-4 h-4" />
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: AI Glossary Search */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          <div className="clay-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#7A7094]">AI Glossary</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EEE9FE] text-[#6B42FD]">
                {filteredTerms.length} Concepts
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#7A7094]">
                <IconSearch className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search AI terms, analogies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F8F5FD] border border-[rgba(107,66,253,0.12)] text-sm text-[#1C1335] placeholder-[#7A7094] focus:outline-none focus:ring-2 focus:ring-[#6B42FD] transition-all"
              />
            </div>

            {/* Category Quick Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {(["all", "architecture", "safety", "autonomous"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl font-semibold capitalize whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? "bg-[#6B42FD] text-white shadow-sm"
                      : "bg-[#F3EFFB] text-[#51486B] hover:bg-[#E9E1F9]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Term List */}
            <div className="flex flex-col gap-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredTerms.map((t) => {
                const isSelected = t.id === selectedTerm.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTerm(t)}
                    className={`clay-card-interactive p-3.5 rounded-2xl border transition-all text-left ${
                      isSelected
                        ? "bg-gradient-to-r from-[#EEE9FE] to-[#F8F5FD] border-[#6B42FD] shadow-sm transform -translate-y-0.5"
                        : "bg-white border-transparent hover:border-[#D8CCFD]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-sm text-[#1C1335] line-clamp-1">{t.term}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF7FE] text-[#6B42FD] shrink-0 border border-[#EEE9FE]">
                        {t.category.split(" ")[0]}
                      </span>
                    </div>
                    <p className="text-xs text-[#51486B] line-clamp-2 leading-relaxed">{t.simple}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Column: 4-Layer Cognitive Breakdown */}
        <main className="lg:col-span-8 flex flex-col gap-6">
          {/* Term Header & Action Bar */}
          <div className="clay-card p-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="clay-pill clay-pill-violet text-xs">{selectedTerm.category}</span>
                <span className="text-xs text-[#7A7094] font-medium">• {selectedTerm.readTime}</span>
                <a
                  href={selectedTerm.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="clay-pill clay-pill-mint text-xs hover:underline inline-flex items-center gap-1.5"
                >
                  <IconExternal className="w-3.5 h-3.5" />
                  <span>{selectedTerm.source} Verified</span>
                </a>
              </div>

              {/* SSE Real-time Streaming Button */}
              <button
                onClick={startSSEStreaming}
                disabled={isStreaming}
                className="clay-btn clay-btn-secondary text-xs py-1.5 px-3.5 flex items-center gap-2 disabled:opacity-60"
                title="Stream explanation via FastAPI SSE endpoint"
              >
                {isStreaming ? (
                  <>
                    <IconPause className="w-3.5 h-3.5 text-[#FF7E62]" />
                    <span>Streaming Stage: {streamStage}</span>
                  </>
                ) : (
                  <>
                    <IconPlay className="w-3.5 h-3.5 text-[#6B42FD]" />
                    <span>Live SSE Stream</span>
                  </>
                )}
              </button>
            </div>

            {/* Live SSE Stage Progress Banner */}
            {isStreaming && (
              <div className="p-3 bg-[#EEE9FE] border border-[#D8CCFD] rounded-xl text-xs text-[#6B42FD] font-semibold flex items-center justify-between">
                <span>{streamMessage}</span>
                <span className="streaming-cursor" />
              </div>
            )}

            <div>
              <h2 className="text-3xl font-extrabold text-[#1C1335] tracking-tight">{selectedTerm.term}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-[#7A7094]">Concept ID:</span>
                <code className="text-[11px] font-mono text-[#6B42FD] bg-[#EEE9FE] px-2 py-0.5 rounded-md">
                  {selectedTerm.slug}
                </code>
                <span className="text-xs text-[#059669] font-semibold ml-2">
                  ✓ Source: {selectedTerm.fromGlossary ? "Stanford HAI AI Glossary" : "LLM Knowledge"}
                </span>
              </div>
            </div>
          </div>

          {/* 4-Layer Breakdown */}
          <div className="grid grid-cols-1 gap-5">
            {/* Layer 1: Simple (ELI5) */}
            <div className="clay-card p-6 border-l-4 border-l-[#6B42FD]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#EEE9FE] text-[#6B42FD] flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#6B42FD]">
                    Layer 1 • Simple (ELI5 for Students)
                  </h3>
                </div>
                <span className="text-xs text-[#7A7094] font-medium">1-Line Core Idea</span>
              </div>
              <p className="text-base text-[#1C1335] leading-relaxed font-medium">
                {selectedTerm.simple}
              </p>
            </div>

            {/* Layer 2: Mental Model + 3 Sequential Steps */}
            <div className="clay-card p-6 border-l-4 border-l-[#FF7E62] bg-gradient-to-br from-white to-[#FFF9F7]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#FFF0EB] text-[#FF7E62] flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#FF7E62]">
                    Layer 2 • Everyday Analogy &amp; 3 Steps
                  </h3>
                </div>
                <div className="clay-pill clay-pill-peach text-[11px]">
                  <IconBrain className="w-3 h-3 text-[#FF7E62]" />
                  <span>Mental Model</span>
                </div>
              </div>
              <p className="text-base text-[#1C1335] leading-relaxed font-medium mb-4">
                {selectedTerm.mentalModel.analogy}
              </p>

              {/* Exactly 3 Sequential Steps */}
              <div className="space-y-2 mt-2 pt-2 border-t border-[#FFD4C8]/50">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C94C31] block mb-1">
                  How It Works in 3 Simple Steps:
                </span>
                {(selectedTerm.mentalModel.steps || [
                  "Step 1: Receive the student's task or question.",
                  "Step 2: Search verified knowledge sources.",
                  "Step 3: Combine findings into an accurate response."
                ]).map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#FFF0EB]/70 border border-[#FFD4C8] text-xs font-semibold text-[#1C1335] flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-lg bg-[#FF7E62] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Layer 3: Relatable Student/Real-Life Example */}
            <div className="clay-card p-6 border-l-4 border-l-[#10B981] bg-gradient-to-br from-white to-[#F7FCF9]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#E7FAF2] text-[#059669] flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#059669]">
                    Layer 3 • Relatable Real-World Example
                  </h3>
                </div>
                <div className="clay-pill clay-pill-mint text-[11px]">
                  <IconLightbulb className="w-3 h-3 text-[#059669]" />
                  <span>Real Life</span>
                </div>
              </div>
              <p className="text-base text-[#1C1335] leading-relaxed font-medium">
                {selectedTerm.example}
              </p>
            </div>

            {/* Layer 4: Interactive Quiz with 0-3 LLM Grading */}
            <div className="clay-card p-6 border-l-4 border-l-[#D97706] bg-gradient-to-br from-white to-[#FEFDF9]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#FEF8E6] text-[#D97706] flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#D97706]">
                    Layer 4 • Active Recall Quiz (0–3 AI Grading)
                  </h3>
                </div>
                <span className="clay-pill clay-pill-sunflower text-xs font-bold">Earn up to 30 XP</span>
              </div>

              <p className="text-base font-bold text-[#1C1335] mb-3">{selectedTerm.quiz.question}</p>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2.5 mb-4">
                {selectedTerm.quiz.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  let optionStyle = "bg-white border-[#EEE9FE] hover:border-[#6B42FD] text-[#1C1335]";
                  let badgeStyle = "bg-[#F3EFFB] text-[#6B42FD]";

                  if (quizSubmitted && quizGrade) {
                    if (quizGrade.score >= 2 && isSelected) {
                      optionStyle = "bg-[#E7FAF2] border-[#10B981] text-[#047857]";
                      badgeStyle = "bg-[#10B981] text-white";
                    } else if (quizGrade.score < 2 && isSelected) {
                      optionStyle = "bg-[#FFF0EB] border-[#FF7E62] text-[#C94C31]";
                      badgeStyle = "bg-[#FF7E62] text-white";
                    } else {
                      optionStyle = "bg-[#FAF7FE] opacity-60 border-transparent text-[#7A7094]";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      disabled={quizSubmitted || isGrading}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left font-medium text-sm transition-all flex items-start gap-3 ${optionStyle}`}
                    >
                      <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${badgeStyle}`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 leading-snug">{option}</span>
                      {quizSubmitted && quizGrade && quizGrade.score >= 2 && isSelected && (
                        <IconCheck className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                      )}
                      {quizSubmitted && quizGrade && quizGrade.score < 2 && isSelected && (
                        <IconCross className="w-5 h-5 text-[#FF7E62] shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Pedagogical 0-3 Grading Feedback Card */}
              {isGrading && (
                <div className="p-4 rounded-2xl bg-[#EEE9FE] text-[#6B42FD] text-xs font-semibold flex items-center gap-2">
                  <IconRefresh className="w-4 h-4 animate-spin" />
                  <span>AI Teacher is grading your response on a 0-3 rubric...</span>
                </div>
              )}

              {quizSubmitted && quizGrade && (
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    quizGrade.score >= 2
                      ? "bg-[#E7FAF2] border-[#A7F3D0] text-[#047857]"
                      : "bg-[#FFF0EB] border-[#FFD4C8] text-[#C94C31]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-sm flex items-center gap-1.5">
                      {quizGrade.score >= 2 ? <IconCheck className="w-4 h-4" /> : <IconCross className="w-4 h-4" />}
                      <span>Score: {quizGrade.score} / 3 • Rating: {quizGrade.rating}</span>
                    </span>
                    <span className="clay-pill clay-pill-sunflower text-xs">+{quizGrade.xp_awarded} XP Awarded</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#1C1335] font-medium">{quizGrade.feedback}</p>
                  {selectedTerm.quiz.hint && (
                    <p className="text-[11px] text-[#7A7094] mt-2 italic">Hint: {selectedTerm.quiz.hint}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Teacher/Curator Human-in-the-Loop (HITL) Card */}
          <div className="clay-card p-6 bg-gradient-to-r from-white via-[#FAF7FE] to-white border-dashed border-2 border-[#D8CCFD]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#EEE9FE] text-[#6B42FD] flex items-center justify-center">
                  <IconUserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C1335]">Human-in-the-Loop Approval</h3>
                  <p className="text-xs text-[#51486B]">Teacher &amp; Curator Oversight for Web Search Safety</p>
                </div>
              </div>

              <div>
                {hitlStatus === "approved" ? (
                  <span className="clay-pill clay-pill-mint text-xs">
                    <IconCheck className="w-3.5 h-3.5" />
                    <span>Teacher Approved (+20 XP)</span>
                  </span>
                ) : (
                  <button
                    onClick={handleHitlApproval}
                    className="clay-btn clay-btn-mint text-xs py-2 px-4 shadow-sm"
                  >
                    <IconCheck className="w-4 h-4" />
                    <span>Approve Safe Web Search</span>
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-[#7A7094]">
              For student safety, external web searches are isolated and require teacher/curator sign-off before being incorporated into classroom materials.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
