"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AIScope, ChatMessage } from "@/lib/types";
import {
  DEFAULT_COMPARE_IDS,
  DEFAULT_PORTFOLIO_IDS,
  INTRO_MESSAGE,
  getAssistantReply,
  getEAById,
  makeUserMessage,
} from "@/lib/mockData";

const MAX_COMPARE = 4;

interface FXPulseState {
  selectedEAId: string | null;
  compareEAIds: string[];
  portfolioDraftEAIds: string[];
  portfolioAllocations: Record<string, number>;
  aiPanelOpen: boolean;
  activeAIContext: AIScope;
  messages: ChatMessage[];
  searchQuery: string;

  setSearchQuery: (q: string) => void;
  selectEA: (id: string | null) => void;
  askAI: (id?: string | null) => void;

  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  toggleCompare: (id: string) => void;
  isComparing: (id: string) => boolean;
  clearCompare: () => void;

  addToPortfolioDraft: (id: string) => void;
  removeFromPortfolioDraft: (id: string) => void;
  isInPortfolio: (id: string) => boolean;
  setAllocation: (id: string, weight: number) => void;

  setAIContext: (scope: AIScope) => void;
  toggleAIPanel: () => void;
  setAIPanelOpen: (open: boolean) => void;

  sendMessage: (text: string) => void;
}

const FXPulseContext = createContext<FXPulseState | null>(null);

function evenAllocations(ids: string[]): Record<string, number> {
  if (ids.length === 0) return {};
  const base = Math.floor(100 / ids.length);
  const rec: Record<string, number> = {};
  ids.forEach((id, i) => {
    rec[id] = i === ids.length - 1 ? 100 - base * (ids.length - 1) : base;
  });
  return rec;
}

export function FXPulseProvider({ children }: { children: ReactNode }) {
  const [selectedEAId, setSelectedEAId] = useState<string | null>(null);
  const [compareEAIds, setCompareEAIds] = useState<string[]>([
    ...DEFAULT_COMPARE_IDS,
  ]);
  const [portfolioDraftEAIds, setPortfolioDraftEAIds] = useState<string[]>([
    ...DEFAULT_PORTFOLIO_IDS,
  ]);
  const [portfolioAllocations, setPortfolioAllocations] = useState<
    Record<string, number>
  >({ "london-breakout": 60, "trend-rider-pro": 40 });
  // Starts closed so mobile never loads with the drawer covering content;
  // AppShell opens it on desktop after mount via matchMedia.
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [activeAIContext, setActiveAIContext] =
    useState<AIScope>("Vault Overview");
  const [messages, setMessages] = useState<ChatMessage[]>([INTRO_MESSAGE]);
  const [searchQuery, setSearchQuery] = useState("");

  const selectEA = useCallback((id: string | null) => {
    setSelectedEAId(id);
    setActiveAIContext(id ? "EA" : "Vault Overview");
  }, []);

  const askAI = useCallback((id?: string | null) => {
    if (id !== undefined) {
      setSelectedEAId(id);
      setActiveAIContext(id ? "EA" : "Vault Overview");
    }
    setAiPanelOpen(true);
  }, []);

  const addToCompare = useCallback((id: string) => {
    setCompareEAIds((prev) =>
      prev.includes(id) || prev.length >= MAX_COMPARE ? prev : [...prev, id],
    );
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    setCompareEAIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const toggleCompare = useCallback((id: string) => {
    setCompareEAIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= MAX_COMPARE
          ? prev
          : [...prev, id],
    );
  }, []);

  const isComparing = useCallback(
    (id: string) => compareEAIds.includes(id),
    [compareEAIds],
  );

  const clearCompare = useCallback(() => setCompareEAIds([]), []);

  const addToPortfolioDraft = useCallback((id: string) => {
    setPortfolioDraftEAIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      setPortfolioAllocations(evenAllocations(next));
      return next;
    });
  }, []);

  const removeFromPortfolioDraft = useCallback((id: string) => {
    setPortfolioDraftEAIds((prev) => {
      const next = prev.filter((x) => x !== id);
      setPortfolioAllocations((alloc) => {
        const copy = { ...alloc };
        delete copy[id];
        return copy;
      });
      return next;
    });
  }, []);

  const isInPortfolio = useCallback(
    (id: string) => portfolioDraftEAIds.includes(id),
    [portfolioDraftEAIds],
  );

  const setAllocation = useCallback((id: string, weight: number) => {
    setPortfolioAllocations((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.min(100, Math.round(weight))),
    }));
  }, []);

  const setAIContext = useCallback((scope: AIScope) => {
    setActiveAIContext(scope);
  }, []);

  const toggleAIPanel = useCallback(() => setAiPanelOpen((o) => !o), []);
  const setAIPanelOpen = useCallback((open: boolean) => setAiPanelOpen(open), []);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const ea = getEAById(selectedEAId);
      const userMsg = makeUserMessage(trimmed);
      const reply = getAssistantReply(trimmed, {
        scope: ea ? "EA" : "Vault Overview",
        ea,
      });
      setMessages((prev) => [...prev, userMsg, reply]);
    },
    [selectedEAId],
  );

  const value = useMemo<FXPulseState>(
    () => ({
      selectedEAId,
      compareEAIds,
      portfolioDraftEAIds,
      portfolioAllocations,
      aiPanelOpen,
      activeAIContext,
      messages,
      searchQuery,
      setSearchQuery,
      selectEA,
      askAI,
      addToCompare,
      removeFromCompare,
      toggleCompare,
      isComparing,
      clearCompare,
      addToPortfolioDraft,
      removeFromPortfolioDraft,
      isInPortfolio,
      setAllocation,
      setAIContext,
      toggleAIPanel,
      setAIPanelOpen,
      sendMessage,
    }),
    [
      selectedEAId,
      compareEAIds,
      portfolioDraftEAIds,
      portfolioAllocations,
      aiPanelOpen,
      activeAIContext,
      messages,
      searchQuery,
      setSearchQuery,
      selectEA,
      askAI,
      addToCompare,
      removeFromCompare,
      toggleCompare,
      isComparing,
      clearCompare,
      addToPortfolioDraft,
      removeFromPortfolioDraft,
      isInPortfolio,
      setAllocation,
      setAIContext,
      toggleAIPanel,
      setAIPanelOpen,
      sendMessage,
    ],
  );

  return (
    <FXPulseContext.Provider value={value}>{children}</FXPulseContext.Provider>
  );
}

export function useFXPulse(): FXPulseState {
  const ctx = useContext(FXPulseContext);
  if (!ctx) {
    throw new Error("useFXPulse must be used within FXPulseProvider");
  }
  return ctx;
}
