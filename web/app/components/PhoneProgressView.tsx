"use client";

import React, { useState } from "react";
import { UserStats } from "../../data/termsData";
import {
  IconLens,
  IconFlame,
  IconSparkles,
  IconCredit,
  IconBadge,
  IconCheck,
  IconShield,
  IconBrain,
  IconLayers,
} from "./Icons";

interface PhoneProgressViewProps {
  userStats: UserStats;
  onUpdateStats: (updater: (prev: UserStats) => UserStats) => void;
  onNavigateToMain?: () => void;
}

export default function PhoneProgressView({
  userStats,
  onUpdateStats,
  onNavigateToMain,
}: PhoneProgressViewProps) {
  const [dailyClaimed, setDailyClaimed] = useState(false);

  const handleClaimDailyCredits = () => {
    if (dailyClaimed) return;
    setDailyClaimed(true);
    onUpdateStats((prev) => ({
      ...prev,
      credits: prev.credits + 5,
      xp: prev.xp + 20,
    }));
  };

  const daysOfWeek = [
    { day: "M", completed: true },
    { day: "T", completed: true },
    { day: "W", completed: true },
    { day: "T", completed: true },
    { day: "F", completed: true },
    { day: "S", completed: false },
    { day: "S", completed: false },
  ];

  const progressPercent = Math.min(
    100,
    Math.round((userStats.xp / userStats.nextLevelXp) * 100)
  );

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

        {/* Scrollable Progress Content Area */}
        <div className="flex-1 overflow-y-auto px-1 space-y-3.5 pb-16">
          {/* Header Title */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-[#1C1335]">Learning Journey</h2>
              <p className="text-[11px] text-[#7A7094]">Level {userStats.level} • {userStats.levelTitle}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6B42FD] to-[#8762FE] text-white flex items-center justify-center shadow-md">
              <IconSparkles className="w-5 h-5" />
            </div>
          </div>

          {/* 5-Day Streak Card */}
          <div className="clay-card p-4 bg-gradient-to-br from-white to-[#FFF9F7] border border-[#FFD4C8]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#FFF0EB] text-[#FF7E62] flex items-center justify-center">
                  <IconFlame className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-[#1C1335] block">
                    {userStats.streakDays} Day Learning Streak
                  </span>
                  <span className="text-[10px] text-[#7A7094]">Consistency builds intuition</span>
                </div>
              </div>
              <span className="clay-pill clay-pill-peach text-[10px] py-0.5 px-2 font-bold">+50 XP Bonus</span>
            </div>

            {/* Daily Bubble Indicators */}
            <div className="flex items-center justify-between pt-1">
              {daysOfWeek.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                      d.completed
                        ? "bg-[#10B981] text-white shadow-sm"
                        : "bg-[#F4EFFC] text-[#7A7094] border border-[#EEE9FE]"
                    }`}
                  >
                    {d.completed ? <IconCheck className="w-3.5 h-3.5" /> : d.day}
                  </div>
                  <span className="text-[9px] font-semibold text-[#51486B]">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Level Progress & XP Bar */}
          <div className="clay-card p-4 bg-gradient-to-br from-white to-[#FAF7FE]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[#1C1335]">Next: Level 4</span>
                <span className="clay-pill clay-pill-violet text-[9px] py-0.2 px-1.5">Synapse Architect</span>
              </div>
              <span className="text-xs font-bold text-[#6B42FD]">
                {userStats.xp} / {userStats.nextLevelXp} XP
              </span>
            </div>

            <div className="w-full h-3 bg-[#EEE9FE] rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#6B42FD] to-[#10B981] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-[#7A7094] mt-1.5 text-right">
              {userStats.nextLevelXp - userStats.xp} XP to unlock custom multi-turn analogies
            </p>
          </div>

          {/* Daily Credits Claim Action */}
          <div className="clay-card p-3.5 bg-gradient-to-br from-white to-[#FEFDF9] border border-[#FDE68A] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FEF8E6] text-[#D97706] flex items-center justify-center">
                <IconCredit className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-[#1C1335] block">
                  {userStats.credits} Credits Available
                </span>
                <span className="text-[10px] text-[#7A7094]">Use for web search &amp; deep reasoning</span>
              </div>
            </div>

            <button
              onClick={handleClaimDailyCredits}
              disabled={dailyClaimed}
              className={`clay-btn text-[10px] py-1.5 px-3 ${
                dailyClaimed ? "clay-btn-secondary opacity-60" : "clay-btn-peach"
              }`}
            >
              {dailyClaimed ? "Claimed" : "Claim +5"}
            </button>
          </div>

          {/* Concept Mastery Breakdown */}
          <div className="clay-card p-4">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-extrabold text-xs text-[#1C1335] uppercase tracking-wider">
                Concept Mastery ({userStats.termsMastered} Total)
              </h3>
              <IconLayers className="w-3.5 h-3.5 text-[#6B42FD]" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#FAF7FE] border border-[#EEE9FE]">
                <span className="text-[10px] text-[#7A7094] block">Architecture</span>
                <span className="font-extrabold text-[#6B42FD] text-sm">6 Terms</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FFF9F7] border border-[#FFD4C8]">
                <span className="text-[10px] text-[#7A7094] block">Safety &amp; Alignment</span>
                <span className="font-extrabold text-[#FF7E62] text-sm">5 Terms</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7FCF9] border border-[#A7F3D0]">
                <span className="text-[10px] text-[#7A7094] block">Training &amp; Weights</span>
                <span className="font-extrabold text-[#10B981] text-sm">4 Terms</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FEFDF9] border border-[#FDE68A]">
                <span className="text-[10px] text-[#7A7094] block">Infrastructure</span>
                <span className="font-extrabold text-[#D97706] text-sm">3 Terms</span>
              </div>
            </div>
          </div>

          {/* Badges Collection Grid */}
          <div className="clay-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-xs text-[#1C1335] uppercase tracking-wider">
                Earned Badges
              </h3>
              <span className="text-[10px] font-bold text-[#6B42FD]">4 Unlocked</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {userStats.badges.map((b) => (
                <div
                  key={b.id}
                  className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                    b.unlocked
                      ? "bg-white border-[#D8CCFD] shadow-xs"
                      : "bg-[#F4EFFC] opacity-50 border-dashed border-[#D8CCFD]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                        b.unlocked ? "bg-[#EEE9FE] text-[#6B42FD]" : "bg-[#E3DCF5] text-[#7A7094]"
                      }`}
                    >
                      <IconBadge className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[9px] font-semibold text-[#7A7094]">{b.category}</span>
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#1C1335] block">{b.title}</span>
                    <p className="text-[10px] text-[#51486B] leading-tight mt-0.5">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="absolute bottom-3 left-4 right-4 bg-white/90 backdrop-blur-md border border-[rgba(107,66,253,0.15)] rounded-2xl p-2 px-6 flex items-center justify-between text-[#7A7094] shadow-md z-20">
          <button
            onClick={onNavigateToMain}
            className="flex flex-col items-center gap-0.5 hover:text-[#6B42FD] transition-colors"
          >
            <IconLens className="w-4 h-4" />
            <span className="text-[9px] font-bold">Explore</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-[#FF7E62]">
            <IconFlame className="w-4 h-4" />
            <span className="text-[9px] font-bold">Streaks</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-[#6B42FD]">
            <IconSparkles className="w-4 h-4" />
            <span className="text-[9px] font-bold">Progress</span>
          </button>
        </div>
      </div>
    </div>
  );
}
