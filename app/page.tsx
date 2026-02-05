"use client";

import { useState } from "react";
import { PDFViewer } from "@/components/PDFViewer";
import { PipelineVisualizer, PipelineStep, StepStatus } from "@/components/PipelineVisualizer";
import { UploadZone } from "@/components/UploadZone";

const INITIAL_STEPS: PipelineStep[] = [
  { id: "1", label: "Extracting Sections", status: "pending" },
  { id: "2", label: "Identifying Day & Action Plans", status: "pending" },
  {id:"3",label:"Coordination Pattern Data",status:"pending"},
  { id: "4", label: "Analyzing Barrier/Ring Logic", status: "pending" },
  {id:"5",label:"Extracting Phases in Use",status:"pending"},
  { id: "6", label: "Extracting Timing Data", status: "pending" },
  { id: "7", label: "Generating Final CSV", status: "pending" },
];

export default function Home() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_STEPS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState<number | undefined>(undefined);

  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    startProcessing(file);
  };

  const startProcessing = async (file: File) => {
    setIsProcessing(true);
    setSteps(INITIAL_STEPS.map(s => ({ ...s, status: "pending" })));

    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("http://localhost:8000/process-signal-timing", {
            method: "POST",
            body: formData,
        });

        if (!response.ok || !response.body) {
            throw new Error(response.statusText || "Failed to start processing");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Keep incomplete line

            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const event = JSON.parse(line);
                    
                    if (event.type === "progress") {
                         // Update active step
                         setSteps(prev => prev.map(s => {
                             if (s.label === event.step) {
                                 const updatedStep = { ...s, status: "running" as StepStatus };
                                 // Update sources if provided
                                 if (event.pages && event.pages.length > 0) {
                                     updatedStep.sources = event.pages.map((p: number) => `Page ${p}`);
                                 }
                                 return updatedStep;
                             } else if (s.status === "running" && s.label !== event.step) {
                                 // Mark previous step nicely complete if not already
                                 return { ...s, status: "completed" as StepStatus };
                             }
                             return s;
                         }));
                         
                         // Update PDF Viewer to show relevant pages
                         if (event.pages && event.pages.length > 0 && fileUrl) {
                             setCurrentPage(event.pages[0]);
                         }

                    } else if (event.type === "step_update") {
                         // Update reasoning for the specific step
                         setSteps(prev => prev.map(s => {
                             if (s.label === event.step) {
                                 return { ...s, reasoning: event.reasoning };
                             }
                             return s;
                         }));

                    } else if (event.type === "result") {
                         const data = event.data;
                         console.log("Result:", data);
                         setCurrentPage(undefined); // Reset page highlight
                         
                         // Mark all steps complete
                         setSteps(prev => prev.map((s, idx, arr) => {
                             // Mark final step ("Generating Final CSV") complete if it was running
                            if (s.label === "Generating Final CSV") {
                                return {
                                    ...s,
                                    status: "completed",
                                    actionLabel: data.csv_content ? "Download CSV" : "Download JSON",
                                    onAction: () => {
                                        if (data.csv_content) {
                                            const blob = new Blob([data.csv_content], { type: "text/csv" });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement("a");
                                            a.href = url;
                                            a.download = "signal_timing.utdf.csv";
                                            a.click();
                                            URL.revokeObjectURL(url);
                                        } else {
                                            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement("a");
                                            a.href = url;
                                            a.download = "signal_timing.json";
                                            a.click();
                                            URL.revokeObjectURL(url);
                                        }
                                    }
                                };
                            }
                            // Ensure everything is marked completed
                            return { ...s, status: "completed" };
                        }));
                    } else if (event.type === "error") {
                        throw new Error(event.error);
                    }
                } catch (e) {
                    console.error("Error parsing event", e);
                }
            }
        }

    } catch (error) {
        console.error(error);
        setSteps(prev => prev.map(s => s.status === "running" ? { ...s, status: "error" } : s));
        alert("Error processing file: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
        setIsProcessing(false);
    }
  };

  const handleClearSession = () => {
    setFileUrl(null);
    setSteps(INITIAL_STEPS);
    setIsProcessing(false);
    setCurrentPage(undefined);
  };

  return (
    <main className="flex h-screen w-full bg-[#0a0a0a] text-zinc-200 overflow-hidden font-sans">
      {/* Left Panel - PDF Viewer */}
      <div className="w-[50%] h-full p-4 pr-2 border-r border-zinc-900">
        <PDFViewer fileUrl={fileUrl} page={currentPage} />
      </div>

      {/* Right Panel - Pipeline & Upload */}
      <div className="w-[50%] h-full flex flex-col p-4 pl-2 relative">
        
        {/* Pipeline Visualizer Area - Scrollable if needed */}
        <div className="flex-1 overflow-y-auto mb-20 scrollbar-hide">
            {/* Pass handleClearSession to the visualizer or place button here ? 
                Reference image has it inside the visualizer area at top right.
                I'll put it in the Visualizer component or wrapper. 
                But my Visualizer component has a placeholder for it. 
                Let's actually control it from here or just render it here.
            */}
             <div className="flex justify-end mb-4">
                 <button 
                    onClick={handleClearSession}
                    className="px-3 py-1 text-xs text-zinc-400 hover:text-white border border-zinc-700 rounded hover:bg-zinc-800 transition-colors"
                 >
                    Clear session
                 </button>
            </div>

            <PipelineVisualizer steps={steps} />
        </div>

        {/* Bottom Upload Area - Fixed at bottom */}
        <div className="absolute bottom-6 left-2 right-4 bg-[#0a0a0a] pt-4 border-t border-zinc-900/50">
           <UploadZone onFileSelect={handleFileSelect} disabled={isProcessing} />
        </div>
      </div>
    </main>
  );
}
