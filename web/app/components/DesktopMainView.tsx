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
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamIndex, setStreamIndex] = useState(100);
  const [hitlStatus, setHitlStatus] = useState<"idle" | "approved" | "feedback">("idle");
  const [hitlComment, setHitlComment] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "architecture" | "safety" | "training">("all");

  // Reset quiz state when switching term
  useEffect(() => {
    setSelectedOption(null);
    setQuizSubmitted(false);
    setHitlStatus("idle");
    setHitlComment("");
    setIsStreaming(false);
    setStreamIndex(100);
  }, [selectedTerm.id]);

  // Streaming simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStreaming) {
      setStreamIndex(1);
      timer = setInterval(() => {
        setStreamIndex((prev) => {
          if (prev >= 100) {
            setIsStreaming(false);
            return 100;
          }
          return prev + 2;
        });
      }, 45);
    }
    return () => clearInterval(timer);
  }, [isStreaming]);

  const filteredTerms = terms.filter((t) => {
    const matchesSearch =
      t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.simple.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "architecture") return matchesSearch && t.category.toLowerCase().includes("architecture");
    if (activeTab === "safety") return matchesSearch && (t.category.toLowerCase().includes("safety") || t.category.toLowerCase().includes("security"));
    if (activeTab === "training") return matchesSearch && (t.category.toLowerCase().includes("training") || t.category.toLowerCase().includes("infrastructure"));
    return matchesSearch;
  });

  const handleOptionSelect = (index: number) => {
    if (quizSubmitted) return;
    setSelectedOption(index);
    setQuizSubmitted(true);

    if (index === selectedTerm.quiz.correctIndex) {
      onUpdateStats((prev) => ({
        ...prev,
        xp: prev.xp + 25,
        streakDays: prev.streakDays,
        termsMastered: prev.termsMastered + 1,
      }));
    }
  };

  const handleHitlApprove = () => {
    setHitlStatus("approved");
    onUpdateStats((prev) => ({
      ...prev,
      xp: prev.xp + 15,
      credits: prev.credits + 1,
    }));
  };

  const handleHitlFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hitlComment.trim()) return;
    setHitlStatus("feedback");
  };

  const getStreamedText = (fullText: string) => {
    if (!isStreaming) return fullText;
    const charCount = Math.floor((fullText.length * streamIndex) / 100);
    return fullText.slice(0, charCount);
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
              <span className="clay-pill clay-pill-violet text-[11px] py-0.5 px-2">v2.4 Cognitive</span>
            </div>
            <p className="text-xs text-[#51486B] font-medium">Bite-sized AI mental models, verified in production</p>
          </div>
        </div>

        {/* Global Progress Indicators */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-4">
          {/* Safe Mode Badge */}
          <button
            onClick={() => onUpdateStats((prev) => ({ ...prev, safeMode: !prev.safeMode }))}
            className={`clay-pill transition-all ${
              userStats.safeMode ? "clay-pill-mint" : "clay-pill-sunflower opacity-75"
            }`}
            title="Toggle Guardrails & Scope Verification"
          >
            <IconShield className="w-3.5 h-3.5" />
            <span>{userStats.safeMode ? "Safe Mode: Active" : "Safe Mode: Relaxed"}</span>
          </button>

          {/* Streak Badge */}
          <div className="clay-pill clay-pill-peach">
            <IconFlame className="w-3.5 h-3.5 text-[#FF7E62]" />
            <span>{userStats.streakDays} Day Streak</span>
          </div>

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

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Term Explorer & Search */}
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
              {(["all", "architecture", "safety", "training"] as const).map((tab) => (
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

              {filteredTerms.length === 0 && (
                <div className="text-center py-10 px-4 text-[#7A7094]">
                  <IconSearch className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No AI concepts match &quot;{searchQuery}&quot;</p>
                  <p className="text-xs mt-1">Try searching for RAG, Agentic, Safety, or Fine-Tuning</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Right Column: 4-Layer Cognitive Breakdown & Interactive Cards */}
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

              {/* Streaming Toggle Simulation */}
              <button
                onClick={() => setIsStreaming(!isStreaming)}
                className={`clay-btn text-xs py-1.5 px-3.5 ${
                  isStreaming ? "clay-btn-peach" : "clay-btn-secondary"
                }`}
                title="Watch the agent stream its cognitive breakdown in real-time"
              >
                {isStreaming ? (
                  <>
                    <IconPause className="w-3.5 h-3.5" />
                    <span>Streaming Active</span>
                  </>
                ) : (
                  <>
                    <IconPlay className="w-3.5 h-3.5" />
                    <span>Simulate Token Stream</span>
                  </>
                )}
              </button>
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-[#1C1335] tracking-tight">{selectedTerm.term}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-[#7A7094]">Concept ID:</span>
                <code className="text-[11px] font-mono text-[#6B42FD] bg-[#EEE9FE] px-2 py-0.5 rounded-md">
                  {selectedTerm.slug}
                </code>
                <span className="text-xs text-[#059669] font-semibold ml-2">
                  ✓ Guardrail Confidence: {selectedTerm.confidence}%
                </span>
              </div>
            </div>
          </div>

          {/* Core Feature: 4-Layer Breakdown Cards */}
          <div className="grid grid-cols-1 gap-5">
            {/* Layer 1: Simple (ELI5) */}
            <div className="clay-card p-6 border-l-4 border-l-[#6B42FD] relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#EEE9FE] text-[#6B42FD] flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#6B42FD]">
                    Layer 1 • Simple Explanation (ELI5)
                  </h3>
                </div>
                <span className="text-xs text-[#7A7094] font-medium">1-Line Essence</span>
              </div>
              <p className="text-base text-[#1C1335] leading-relaxed font-medium">
                {getStreamedText(selectedTerm.simple)}
                {isStreaming && <span className="streaming-cursor" />}
              </p>
            </div>

            {/* Layer 2: Mental Model */}
            <div className="clay-card p-6 border-l-4 border-l-[#FF7E62] bg-gradient-to-br from-white to-[#FFF9F7] relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#FFF0EB] text-[#FF7E62] flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#FF7E62]">
                    Layer 2 • Mental Model & Analogy
                  </h3>
                </div>
                <div className="clay-pill clay-pill-peach text-[11px]">
                  <IconBrain className="w-3 h-3 text-[#FF7E62]" />
                  <span>Cognitive Anchor</span>
                </div>
              </div>
              <p className="text-base text-[#1C1335] leading-relaxed font-medium mb-3">
                {getStreamedText(selectedTerm.mentalModel.analogy)}
                {isStreaming && <span className="streaming-cursor" />}
              </p>
              <div className="inline-flex items-center gap-2 bg-[#FFF0EB] border border-[#FFD4C8] text-[#C94C31] text-xs font-semibold px-3 py-1.5 rounded-xl">
                <span>Visual Anchor:</span>
                <span className="font-normal italic">&ldquo;{selectedTerm.mentalModel.anchor}&rdquo;</span>
              </div>
            </div>

            {/* Layer 3: Practical Examples */}
            <div className="clay-card p-6 border-l-4 border-l-[#10B981] bg-gradient-to-br from-white to-[#F7FCF9] relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#E7FAF2] text-[#059669] flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#059669]">
                    Layer 3 • Real-World Production Examples
                  </h3>
                </div>
                <div className="clay-pill clay-pill-mint text-[11px]">
                  <IconLightbulb className="w-3 h-3 text-[#059669]" />
                  <span>In Practice</span>
                </div>
              </div>
              <p className="text-base text-[#1C1335] leading-relaxed font-medium">
                {getStreamedText(selectedTerm.examples)}
                {isStreaming && <span className="streaming-cursor" />}
              </p>
            </div>

            {/* Layer 4: Interactive Concept Quiz with AI Feedback */}
            <div className="clay-card p-6 border-l-4 border-l-[#D97706] bg-gradient-to-br from-white to-[#FEFDF9] relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#FEF8E6] text-[#D97706] flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#D97706]">
                    Layer 4 • Active Recall Quiz
                  </h3>
                </div>
                <span className="clay-pill clay-pill-sunflower text-xs font-bold">+25 XP Reward</span>
              </div>

              <div className="mb-4">
                <p className="text-base font-bold text-[#1C1335]">{selectedTerm.quiz.question}</p>
              </div>

              {/* Quiz Options */}
              <div className="grid grid-cols-1 gap-2.5 mb-4">
                {selectedTerm.quiz.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === selectedTerm.quiz.correctIndex;

                  let optionStyle =
                    "bg-white border-[#EEE9FE] hover:border-[#6B42FD] text-[#1C1335]";
                  let badgeStyle = "bg-[#F3EFFB] text-[#6B42FD]";

                  if (quizSubmitted) {
                    if (isCorrect) {
                      optionStyle = "bg-[#E7FAF2] border-[#10B981] text-[#047857]";
                      badgeStyle = "bg-[#10B981] text-white";
                    } else if (isSelected && !isCorrect) {
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
                      disabled={quizSubmitted}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left font-medium text-sm transition-all flex items-start gap-3 ${optionStyle}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${badgeStyle}`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 leading-snug">{option}</span>
                      {quizSubmitted && isCorrect && (
                        <IconCheck className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                      )}
                      {quizSubmitted && isSelected && !isCorrect && (
                        <IconCross className="w-5 h-5 text-[#FF7E62] shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant AI Pedagogical Feedback Card */}
              {quizSubmitted && (
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    selectedOption === selectedTerm.quiz.correctIndex
                      ? "bg-[#E7FAF2] border-[#A7F3D0] text-[#047857]"
                      : "bg-[#FFF0EB] border-[#FFD4C8] text-[#C94C31]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5 font-bold text-sm">
                    {selectedOption === selectedTerm.quiz.correctIndex ? (
                      <>
                        <IconCheck className="w-4 h-4 text-[#10B981]" />
                        <span>Concept Mastered! (+25 XP Added)</span>
                      </>
                    ) : (
                      <>
                        <IconRefresh className="w-4 h-4 text-[#FF7E62]" />
                        <span>Keep Exploring: Here is the nuance</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-[#1C1335]">
                    {selectedTerm.quiz.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Human-in-the-Loop (HITL) Quality Control & Feedback Card */}
          <div className="clay-card p-6 bg-gradient-to-r from-white via-[#FAF7FE] to-white border-dashed border-2 border-[#D8CCFD]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#EEE9FE] text-[#6B42FD] flex items-center justify-center">
                  <IconUserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C1335]">Human-in-the-Loop Review</h3>
                  <p className="text-xs text-[#51486B]">
                    Community curator oversight • {selectedTerm.reviewedDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {hitlStatus === "approved" ? (
                  <span className="clay-pill clay-pill-mint text-xs">
                    <IconCheck className="w-3.5 h-3.5" />
                    <span>Your Approval Recorded (+15 XP)</span>
                  </span>
                ) : (
                  <button
                    onClick={handleHitlApprove}
                    className="clay-btn clay-btn-mint text-xs py-2 px-4 shadow-sm"
                  >
                    <IconCheck className="w-4 h-4" />
                    <span>Approve Mental Model</span>
                  </button>
                )}
              </div>
            </div>

            {hitlStatus !== "approved" && (
              <form onSubmit={handleHitlFeedbackSubmit} className="flex flex-col sm:flex-row gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Propose an alternative real-world analogy or clarify wording..."
                  value={hitlComment}
                  onChange={(e) => setHitlComment(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white border border-[#D8CCFD] text-xs text-[#1C1335] placeholder-[#7A7094] focus:outline-none focus:ring-2 focus:ring-[#6B42FD]"
                />
                <button
                  type="submit"
                  disabled={!hitlComment.trim()}
                  className="clay-btn clay-btn-secondary text-xs py-2 px-4 whitespace-nowrap disabled:opacity-50"
                >
                  <span>Submit Suggestion</span>
                </button>
              </form>
            )}

            {hitlStatus === "feedback" && (
              <div className="mt-3 p-3 rounded-xl bg-[#E7FAF2] text-[#047857] text-xs font-medium flex items-center gap-2">
                <IconCheck className="w-4 h-4" />
                <span>Thank you! Your feedback has been queued for curator aggregation.</span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
