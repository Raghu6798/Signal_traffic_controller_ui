
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, FileText, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

export type StepStatus = "pending" | "running" | "completed" | "error";

export interface PipelineStep {
  id: string;
  label: string;
  status: StepStatus;
  sources?: string[]; 
  reasoning?: string | object;
  actionLabel?: string;
  onAction?: () => void;
}


interface PipelineVisualizerProps {
  steps: PipelineStep[];
}

export function PipelineVisualizer({ steps }: PipelineVisualizerProps) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto py-8">


      <div className="space-y-0 relative">
        {steps.map((step, index) => {
            const isCompleted = step.status === "completed";
            const isRunning = step.status === "running";

            return (
            <div key={step.id} className="relative pl-12 pb-8 last:pb-0">
                {/* Vertical Connector Line */}
                {index !== steps.length - 1 && (
                    <div className="absolute left-[23px] top-10 bottom-0 w-[2px] border-l-2 border-dotted border-zinc-700" />
                )}

                {/* Status Icon Indicator */}
                <div className="absolute left-[11px] top-2 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 border-2 border-zinc-800 z-10">
                     {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                     ) : isRunning ? (
                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                     ) : (
                        <Circle className="h-3 w-3 text-zinc-600" />
                     )}
                </div>
                
                {/* Step Content */}
                <StepCard step={step} />
            </div>
            );
        })}
      </div>
    </div>
  );
}


function StepCard({ step }: { step: PipelineStep }) {
    const [isSourceOpen, setIsSourceOpen] = useState(false);
    
    // Reasoning state: Auto-open if running or upon completion (optional preference)
    // Here we use local state but initialize based on props if needed. 
    // Actually, we want it always visible if running. If completed, start collapsed.
    const [isReasoningOpen, setIsReasoningOpen] = useState(false); 
    
    const isCompleted = step.status === "completed";
    const isRunning = step.status === "running";
    const isPending = step.status === "pending";

    // If running, force expand reasoning if it exists (real-time view)
    // We can use a check in the render, or an effect. Render check is simpler.
    const showReasoning = (isRunning && step.reasoning) || (isReasoningOpen && step.reasoning);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                "relative flex flex-col gap-2 rounded-xl border p-4 transition-colors",
                statusStyles(step.status)
            )}
        >
            <div className="flex items-center justify-between">
                <span className={clsx("text-sm font-medium", isPending ? "text-zinc-500" : "text-zinc-200")}>
                    {step.label}
                </span>
            </div>
            
            {/* Reasoning Display */}
            {step.reasoning && (
                <div className="mt-2">
                     {/* Toggle Button only if NOT running (if running, it's auto-shown) */}
                     {!isRunning && (
                        <button 
                            onClick={() => setIsReasoningOpen(!isReasoningOpen)}
                            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors mb-2"
                        >
                            {isReasoningOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                            Reasoning
                        </button>
                     )}
                     
                    <AnimatePresence>
                        {showReasoning && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-black/40 rounded p-3 text-xs text-zinc-300 font-mono whitespace-pre-wrap border border-zinc-800/50">
                                    {/* Handle object or string reasoning */}
                                    {typeof step.reasoning === 'string' 
                                        ? step.reasoning 
                                        : JSON.stringify(step.reasoning, null, 2)}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Sources Expander (Existing) */}
            {step.sources && step.sources.length > 0 && (
                <div className="mt-2">
                    <button 
                        onClick={() => setIsSourceOpen(!isSourceOpen)}
                        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-700 px-2 py-1 rounded bg-zinc-900/50"
                    >
                        {isSourceOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        Sources
                    </button>
                    
                    <AnimatePresence>
                        {isSourceOpen && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mt-2"
                            >
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {step.sources.map((src, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-zinc-900 p-2 rounded border border-zinc-800 text-xs text-zinc-300">
                                            <FileText className="h-3 w-3" />
                                            Source {idx + 1}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Action Button */}
            {isCompleted && step.actionLabel && (
                <div className="mt-3">
                    <button
                        onClick={step.onAction}
                        className="flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
                    >
                        {step.actionLabel}
                    </button>
                </div>
            )}
        </motion.div>
    );
}



function statusStyles(status: StepStatus) {
    switch (status) {
        case "completed":
            return "border-zinc-700 bg-zinc-900 text-zinc-100";
        case "running":
            return "border-blue-500/50 bg-blue-500/10 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.1)]";
        case "error":
            return "border-red-500/50 bg-red-500/10 text-red-100";
        default:
            return "border-zinc-800 bg-zinc-950/50 text-zinc-500";
    }
}
