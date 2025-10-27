
import { Loader2 } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

interface AnalyzeButtonProps {
  isPending: boolean;
  isDisabled: boolean;
}

export const AnalyzeButton = ({
  isPending,
  isDisabled,
}: AnalyzeButtonProps) => {
  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={cn(
        "relative inline-flex overflow-hidden rounded-xl p-px",
        "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50",
        isDisabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
      <span
        className={cn(
          "inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-slate-950/90 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm",
          "hover:bg-slate-950/80"
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          "Analyze Charts"
        )}
      </span>
    </button>
  );
};
