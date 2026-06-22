"use client";

import { useEffect } from "react";
import { useFXPulse } from "@/context/FXPulseContext";
import type { AIScope } from "@/lib/types";

/**
 * Sets the AI panel scope when a page mounts so the assistant stays
 * context-aware as the analyst moves around the workspace.
 */
export function PageScope({ scope }: { scope: AIScope }) {
  const { setAIContext } = useFXPulse();
  useEffect(() => {
    setAIContext(scope);
  }, [scope, setAIContext]);
  return null;
}
