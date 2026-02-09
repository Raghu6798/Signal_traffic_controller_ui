"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, FileText, CheckCircle2, Circle, Loader2, Terminal } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

export type StepStatus = "pending" | "running" | "completed" | "error";

export interface PipelineStep {
  id: string;
  label: string;
  status: StepStatus;
  sources?: string[]; 
  reasoning?: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface PipelineVisualizerProps {
  steps: PipelineStep[];
  onPageClick: (page: number) => void;
  isProcessing?: boolean;
}

export function PipelineVisualizer({ steps, onPageClick, isProcessing = false }: PipelineVisualizerProps) {
  if (steps.length === 0 && isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center h-64 w-full max-w-xl mx-auto">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
        <span className="text-sm text-muted-foreground animate-pulse">Initializing pipeline...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto py-8">
      <div className="space-y-0 relative">
        {steps.map((step, index) => {
            const isCompleted = step.status === "completed";
            const isRunning = step.status === "running";

            return (
            <div key={step.id} className="relative pl-12 pb-8 last:pb-0">
                {/* Connector Line */}
                {index !== steps.length - 1 && (
                    <div className={clsx(
                        "absolute left-[23px] top-10 bottom-0 w-[2px] border-l-2 transition-colors duration-500",
                        isCompleted ? "border-solid border-green-600" : "border-dotted border-border"
                    )} />
                )}

                {/* Status Icon */}
                <div className={clsx(
                    "absolute left-[11px] top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 z-10 bg-background",
                    isCompleted ? "border-green-500/50" : isRunning ? "border-blue-500" : "border-border"
                )}>
                     {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                     ) : isRunning ? (
                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                     ) : (
                        <Circle className="h-3 w-3 text-muted-foreground" />
                     )}
                </div>
                
                {/* Pass the callback down */}
                <StepCard step={step} onPageClick={onPageClick} />
            </div>
            );
        })}
      </div>
    </div>
  );
}

function StepCard({ step, onPageClick }: { step: PipelineStep; onPageClick: (page: number) => void }) {
    const [isSourceOpen, setIsSourceOpen] = useState(false);
    const [isReasoningManuallyToggled, setIsReasoningManuallyToggled] = useState(false);
    
    const isCompleted = step.status === "completed";
    const isRunning = step.status === "running";
    const isPending = step.status === "pending";

    const showReasoning = isRunning || (isReasoningManuallyToggled && step.reasoning);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                "relative flex flex-col gap-2 rounded-xl border p-4 transition-all duration-300",
                statusStyles(step.status)
            )}
        >
            <div className="flex items-center justify-between">
                <span className={clsx("text-sm font-medium", isPending ? "text-muted-foreground" : "text-foreground")}>
                    {step.label}
                </span>
                
                {/* Source Toggle */}
                <div className="flex gap-2">
                     {step.sources && step.sources.length > 0 && (
                        <button 
                            onClick={() => setIsSourceOpen(!isSourceOpen)}
                            className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Sources {isSourceOpen ? <ChevronDown className="h-1 w-1" /> : <ChevronRight className="h-1 w-1" />}
                        </button>
                    )}
                </div>
            </div>
            
            {/* Reasoning Area */}
            <AnimatePresence>
                {(showReasoning || (step.reasoning && !isRunning)) && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {!isRunning && (
                             <button 
                                onClick={() => setIsReasoningManuallyToggled(!isReasoningManuallyToggled)}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 w-full"
                             >
                                <Terminal className="h-3 w-3" />
                                {isReasoningManuallyToggled ? "Hide Logs" : "Show Analysis Logs"}
                             </button>
                        )}

                        {showReasoning && (
                            <div className="bg-muted rounded-lg p-3 border border-border mt-1 relative">
                                <div className="absolute top-2 right-2">
                                    {isRunning && <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />}
                                </div>
                                <div className="text-xs text-foreground font-mono whitespace-pre-wrap leading-relaxed">
                                    {step.reasoning || "Initializing ..."}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CLICKABLE Sources Area */}
            <AnimatePresence>
                {isSourceOpen && step.sources && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-border mt-2">
                            {step.sources.map((src, idx) => {
                                // Extract number from "Page 5" string
                                const pageNum = parseInt(src.replace(/[^0-9]/g, ''), 10);
                                
                                return (
                                    <button 
                                        key={idx} 
                                        onClick={() => !isNaN(pageNum) && onPageClick(pageNum)}
                                        className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded border border-border text-[10px] text-muted-foreground hover:text-foreground hover:bg-blue-500/10 hover:border-blue-500/50 transition-all cursor-pointer"
                                    >
                                        <FileText className="h-3 w-3" />
                                        {src}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Button */}
            {isCompleted && step.actionLabel && (
                <div className="mt-2 pt-2 border-t border-border">
                    <button
                        onClick={step.onAction}
                        className="w-full flex items-center justify-center gap-2 rounded-md bg-foreground hover:bg-primary-foreground text-background px-3 py-2 text-xs font-semibold transition-colors shadow-sm"
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
            return "border-border bg-card text-foreground";
        case "running":
            return "border-blue-500/30 bg-blue-500/5 text-blue-700 shadow-[0_0_20px_rgba(59,130,246,0.05)] ring-1 ring-blue-500/20";
        case "error":
            return "border-red-500/50 bg-red-500/10 text-red-700";
        default:
            return "border-border bg-muted/30 text-muted-foreground";
    }
}