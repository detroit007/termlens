"use client";

import React, { useState } from "react";
import { TermDetail, UserStats } from "../../data/termsData";
import {
  IconLens,
  IconBrain,
  IconLightbulb,
  IconQuiz,
  IconCheck,
  IconCross,
  IconShield,
  IconFlame,
  IconCredit,
  IconExternal,
  IconUserCheck,
  IconSparkles,
} from "./Icons";

interface PhoneMainViewProps {
  terms: TermDetail[];
  selectedTerm: TermDetail;
  onSelectTerm: (term: TermDetail) => void;
  userStats: UserStats;
  onUpdateStats: (updater: (prev: UserStats) => UserStats) => void;
  onNavigateToProgress?: () => void;
}

export default function PhoneMainView({
  terms,
  selectedTerm,
  onSelectTerm,
  userStats,
  onUpdateStats,
  onNavigateToProgress,
}: PhoneMainViewProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [approved, setApproved] = useState(false);

  const handleSelectOption = (idx: number) => {
    if (quizSubmitted) return;
    setSelectedOption(idx);
    setQuizSubmitted(true);
    if (idx === selectedTerm.quiz.correctIndex) {
      onUpdateStats((prev) => ({
        ...prev,
        xp: prev.xp + 25,
        termsMastered: prev.termsMastered + 1,
      }));
    }
  };

  const handleApprove = () => {
    setApproved(true);
    onUpdateStats((prev) => ({
      ...prev,
      xp: prev.xp + 15,
      credits: prev.credits + 1,
    }));
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Phone Hardware Mockup Frame */}
      <div className="w-[375px] max-w-full min-h-[780px] bg-[#FFFFFF] rounded-[48px] p-4 shadow-[0_24px_64px_-16px_rgba(107,66,253,0.28),0_12px_28px_-6px_rgba(28,19,53,0.12),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-4px_8px_rgba(107,66,253,0.1)] border-[8px] border-[#F0EBFB] flex flex-col justify-between relative overflow-hidden">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-[#1C1335] rounded-full z-20 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#352758] mr-2" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
        </div>

        {/* Mobile Status Bar */}
        <div className="flex items-center justify-between pt-5 px-3 text-[11px] font-bold text-[#51486B] z-10 mb-2">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <div className="w-5 h-2.5 rounded-sm border border-[#51486B] p-0.5 flex items-center">
              <div className="h-full w-3 bg-[#10B981] rounded-xs" />
            </div>
          </div>
        </div>

        {/* Scrollable Mobile Content Area */}
        <div className="flex-1 overflow-y-auto px-1 space-y-3.5 pb-16">
          {/* Mobile Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#6B42FD] text-white flex items-center justify-center shadow-sm">
                <IconLens className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-[#1C1335]">TermLens</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="clay-pill clay-pill-peach text-[10px] py-0.5 px-2">
                <IconFlame className="w-3 h-3 text-[#FF7E62]" />
                <span>{userStats.streakDays}d</span>
              </span>
              <span className="clay-pill clay-pill-sunflower text-[10px] py-0.5 px-2">
                <IconCredit className="w-3 h-3 text-[#D97706]" />
                <span>{userStats.credits}</span>
              </span>
            </div>
          </div>

          {/* Quick Concept Horizontal Scroller */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {terms.slice(0, 6).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  onSelectTerm(t);
                  setSelectedOption(null);
                  setQuizSubmitted(false);
                  setApproved(false);
                }}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap text-[11px] transition-all ${
                  t.id === selectedTerm.id
                    ? "bg-[#6B42FD] text-white shadow-sm"
                    : "bg-[#F4EFFC] text-[#51486B]"
                }`}
              >
                {t.term.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Main Term Header Card */}
          <div className="clay-card p-4 bg-gradient-to-br from-white to-[#FAF7FE]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="clay-pill clay-pill-violet text-[10px] py-0.5 px-2">{selectedTerm.category}</span>
              <span className="clay-pill clay-pill-mint text-[10px] py-0.5 px-2">
                <IconShield className="w-3 h-3 text-[#059669]" />
                <span>Verified HAI</span>
              </span>
            </div>
            <h2 className="text-xl font-black text-[#1C1335] leading-snug">{selectedTerm.term}</h2>
            <p className="text-[11px] text-[#7A7094] mt-0.5">{selectedTerm.readTime}</p>
          </div>

          {/* Layer 1: Simple (ELI5) */}
          <div className="clay-card p-4 border-l-4 border-l-[#6B42FD]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B42FD]">
                1 • Simple (ELI5)
              </span>
              <span className="text-[10px] text-[#7A7094]">1-Line</span>
            </div>
            <p className="text-xs text-[#1C1335] leading-relaxed font-medium">{selectedTerm.simple}</p>
          </div>

          {/* Layer 2: Mental Model */}
          <div className="clay-card p-4 border-l-4 border-l-[#FF7E62] bg-[#FFFBF9]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7E62]">
                2 • Mental Model
              </span>
              <span className="clay-pill clay-pill-peach text-[9px] py-0.5 px-1.5">
                <IconBrain className="w-2.5 h-2.5 text-[#FF7E62]" />
                <span>Analogy</span>
              </span>
            </div>
            <p className="text-xs text-[#1C1335] leading-relaxed font-medium mb-2">
              {selectedTerm.mentalModel.analogy}
            </p>
            <div className="bg-[#FFF0EB] text-[#C94C31] text-[10px] font-semibold px-2 py-1 rounded-lg">
              Anchor: &ldquo;{selectedTerm.mentalModel.anchor}&rdquo;
            </div>
          </div>

          {/* Layer 3: Examples */}
          <div className="clay-card p-4 border-l-4 border-l-[#10B981] bg-[#FAFCFA]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669]">
                3 • Production Example
              </span>
              <IconLightbulb className="w-3.5 h-3.5 text-[#059669]" />
            </div>
            <p className="text-xs text-[#1C1335] leading-relaxed font-medium">{selectedTerm.examples}</p>
          </div>

          {/* Layer 4: Mobile Quiz */}
          <div className="clay-card p-4 border-l-4 border-l-[#D97706] bg-[#FEFDF9]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97706]">
                4 • Recall Quiz
              </span>
              <span className="clay-pill clay-pill-sunflower text-[9px] py-0.5 px-2">+25 XP</span>
            </div>
            <p className="text-xs font-bold text-[#1C1335] mb-2.5">{selectedTerm.quiz.question}</p>

            <div className="space-y-1.5">
              {selectedTerm.quiz.options.map((opt, i) => {
                const isCorrect = i === selectedTerm.quiz.correctIndex;
                const isSelected = selectedOption === i;

                let btnStyle = "bg-white border-[#EEE9FE] text-[#1C1335]";
                if (quizSubmitted) {
                  if (isCorrect) btnStyle = "bg-[#E7FAF2] border-[#10B981] text-[#047857]";
                  else if (isSelected) btnStyle = "bg-[#FFF0EB] border-[#FF7E62] text-[#C94C31]";
                  else btnStyle = "opacity-50 bg-[#FAF7FE] border-transparent text-[#7A7094]";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(i)}
                    disabled={quizSubmitted}
                    className={`w-full p-2.5 rounded-xl border text-left text-[11px] font-medium transition-all flex items-start gap-2 ${btnStyle}`}
                  >
                    <span className="font-bold text-[10px] w-4 h-4 rounded bg-[#F3EFFB] text-[#6B42FD] flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="leading-tight flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>

            {quizSubmitted && (
              <div
                className={`mt-2.5 p-2.5 rounded-xl text-[11px] leading-relaxed ${
                  selectedOption === selectedTerm.quiz.correctIndex
                    ? "bg-[#E7FAF2] text-[#047857]"
                    : "bg-[#FFF0EB] text-[#C94C31]"
                }`}
              >
                <span className="font-bold block mb-0.5">
                  {selectedOption === selectedTerm.quiz.correctIndex ? "Correct! (+25 XP)" : "Nuance Explanation:"}
                </span>
                {selectedTerm.quiz.explanation}
              </div>
            )}
          </div>

          {/* HITL Quick Approval */}
          <div className="clay-card p-3 bg-[#FAF7FE] border border-[#D8CCFD] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconUserCheck className="w-4 h-4 text-[#6B42FD]" />
              <span className="text-[11px] font-bold text-[#1C1335]">
                {approved ? "Review Recorded" : "Human Approval"}
              </span>
            </div>
            {!approved ? (
              <button onClick={handleApprove} className="clay-btn clay-btn-mint text-[10px] py-1 px-3">
                <IconCheck className="w-3 h-3" />
                <span>Approve</span>
              </button>
            ) : (
              <span className="text-[10px] font-bold text-[#059669]">Verified (+15 XP)</span>
            )}
          </div>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="absolute bottom-3 left-4 right-4 bg-white/90 backdrop-blur-md border border-[rgba(107,66,253,0.15)] rounded-2xl p-2 px-6 flex items-center justify-between text-[#7A7094] shadow-md z-20">
          <button className="flex flex-col items-center gap-0.5 text-[#6B42FD]">
            <IconLens className="w-4 h-4" />
            <span className="text-[9px] font-bold">Explore</span>
          </button>
          <button
            onClick={onNavigateToProgress}
            className="flex flex-col items-center gap-0.5 hover:text-[#6B42FD] transition-colors"
          >
            <IconFlame className="w-4 h-4" />
            <span className="text-[9px] font-bold">Streaks</span>
          </button>
          <button
            onClick={onNavigateToProgress}
            className="flex flex-col items-center gap-0.5 hover:text-[#6B42FD] transition-colors"
          >
            <IconSparkles className="w-4 h-4" />
            <span className="text-[9px] font-bold">Progress</span>
          </button>
        </div>
      </div>
    </div>
  );
}
