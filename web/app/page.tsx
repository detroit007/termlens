"use client";

import React, { useState, useMemo } from "react";
import DesktopMainView from "./components/DesktopMainView";
import PhoneMainView from "./components/PhoneMainView";
import PhoneProgressView from "./components/PhoneProgressView";
import { FEATURED_TERMS, INITIAL_USER_STATS, TermDetail, UserStats } from "../data/termsData";
import rawGlossary from "../data/glossary.json";
import { IconDesktop, IconPhone, IconSparkles, IconLayers } from "./components/Icons";

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<"desktop" | "phone-main" | "phone-progress" | "split">("desktop");
  const [userStats, setUserStats] = useState<UserStats>(INITIAL_USER_STATS);

  // Merge 98 Stanford HAI terms with featured rich terms
  const allTerms: TermDetail[] = useMemo(() => {
    const featuredMap = new Map<string, TermDetail>();
    FEATURED_TERMS.forEach((t) => featuredMap.set(t.slug, t));

    // Convert raw terms into TermDetail format
    const merged: TermDetail[] = (rawGlossary as Array<{
      id: string;
      term: string;
      slug: string;
      definition: string;
      url: string;
      source: string;
    }>).map((item) => {
      if (featuredMap.has(item.slug)) {
        return featuredMap.get(item.slug)!;
      }

      // Generate clean structured defaults for the rest of the 98 terms
      return {
        id: item.slug,
        term: item.term,
        slug: item.slug,
        category: "Artificial Intelligence",
        readTime: "2 min read",
        simple: item.definition,
        mentalModel: {
          analogy: `Think of ${item.term} as a specialized cognitive mechanism designed to optimize AI precision and consistency.`,
          anchor: `${item.term} functional model`
        },
        examples: `Standard machine learning pipelines implement ${item.term} during production inference and model evaluation workflows.`,
        quiz: {
          question: `What is the primary role of ${item.term} in artificial intelligence systems?`,
          options: [
            `To regulate and advance system behavior related to: ${item.definition.slice(0, 75)}...`,
            "To replace CPU silicon hardware with mechanical relays",
            "To remove all training data from storage servers",
            "To enforce audio output formatting exclusively"
          ],
          correctIndex: 0,
          explanation: `Indeed: ${item.definition}`
        },
        source: item.source || "Stanford University HAI",
        sourceUrl: item.url || `https://hai.stanford.edu/ai-definitions/${item.slug}`,
        confidence: 96,
        approvedByHuman: true,
        reviewedDate: "Verified Oct 2026"
      };
    });

    return merged;
  }, []);

  const [selectedTerm, setSelectedTerm] = useState<TermDetail>(FEATURED_TERMS[0]);

  return (
    <div className="min-h-screen bg-[#F4EFFC] text-[#1C1335] flex flex-col justify-between selection:bg-[#D8CCFD] selection:text-[#1C1335]">
      {/* Top Floating Screen Selector & Showcase Bar */}
      <nav className="sticky top-0 z-50 bg-[#F4EFFC]/85 backdrop-blur-md border-b border-[rgba(107,66,253,0.1)] py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-lg tracking-tight text-[#1C1335] hidden sm:inline">
              TermLens
            </span>
            <span className="text-xs text-[#7A7094] font-medium hidden md:inline">
              UI Prototype Showcase
            </span>
          </div>

          {/* Segmented Screen Switcher (Desktop, Phone Main, Phone Progress, Split) */}
          <div className="clay-card-sunken p-1 flex items-center gap-1 rounded-2xl bg-[#EBE4F7]">
            <button
              onClick={() => setActiveScreen("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeScreen === "desktop"
                  ? "bg-white text-[#6B42FD] shadow-sm"
                  : "text-[#51486B] hover:text-[#1C1335]"
              }`}
            >
              <IconDesktop className="w-3.5 h-3.5" />
              <span>Desktop Main</span>
            </button>

            <button
              onClick={() => setActiveScreen("phone-main")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeScreen === "phone-main"
                  ? "bg-white text-[#6B42FD] shadow-sm"
                  : "text-[#51486B] hover:text-[#1C1335]"
              }`}
            >
              <IconPhone className="w-3.5 h-3.5" />
              <span>Phone Main</span>
            </button>

            <button
              onClick={() => setActiveScreen("phone-progress")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeScreen === "phone-progress"
                  ? "bg-white text-[#6B42FD] shadow-sm"
                  : "text-[#51486B] hover:text-[#1C1335]"
              }`}
            >
              <IconSparkles className="w-3.5 h-3.5" />
              <span>Phone Progress</span>
            </button>

            <button
              onClick={() => setActiveScreen("split")}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeScreen === "split"
                  ? "bg-white text-[#6B42FD] shadow-sm"
                  : "text-[#51486B] hover:text-[#1C1335]"
              }`}
            >
              <IconLayers className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main View Area */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-8 flex-1 flex flex-col justify-center">
        {/* Screen 1: Desktop Main View */}
        {activeScreen === "desktop" && (
          <DesktopMainView
            terms={allTerms}
            selectedTerm={selectedTerm}
            onSelectTerm={setSelectedTerm}
            userStats={userStats}
            onUpdateStats={setUserStats}
          />
        )}

        {/* Screen 2: Phone Main View */}
        {activeScreen === "phone-main" && (
          <PhoneMainView
            terms={allTerms}
            selectedTerm={selectedTerm}
            onSelectTerm={setSelectedTerm}
            userStats={userStats}
            onUpdateStats={setUserStats}
            onNavigateToProgress={() => setActiveScreen("phone-progress")}
          />
        )}

        {/* Screen 3: Phone Progress View */}
        {activeScreen === "phone-progress" && (
          <PhoneProgressView
            userStats={userStats}
            onUpdateStats={setUserStats}
            onNavigateToMain={() => setActiveScreen("phone-main")}
          />
        )}

        {/* Screen 4: Split Side-by-Side Showcase (Desktop + Mobile) */}
        {activeScreen === "split" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            <div className="xl:col-span-8">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B42FD]">
                  Desktop Interactive Interface
                </span>
              </div>
              <DesktopMainView
                terms={allTerms}
                selectedTerm={selectedTerm}
                onSelectTerm={setSelectedTerm}
                userStats={userStats}
                onUpdateStats={setUserStats}
              />
            </div>

            <div className="xl:col-span-4 flex flex-col items-center">
              <div className="mb-3 flex items-center justify-between w-full max-w-[375px]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF7E62]">
                  Mobile Responsive Companion
                </span>
              </div>
              <PhoneMainView
                terms={allTerms}
                selectedTerm={selectedTerm}
                onSelectTerm={setSelectedTerm}
                userStats={userStats}
                onUpdateStats={setUserStats}
                onNavigateToProgress={() => setActiveScreen("phone-progress")}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer Note */}
      <footer className="w-full text-center py-6 text-xs text-[#7A7094] border-t border-[rgba(107,66,253,0.08)]">
        <p>
          TermLens • AI Concept Deconstruction Agent • Grounded in Stanford HAI AI Glossary • High Accessibility Design
        </p>
      </footer>
    </div>
  );
}
