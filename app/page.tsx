"use client";

import { useState } from "react";
import { PDFViewer } from "@/components/PDFViewer";
import { PipelineVisualizer, PipelineStep, StepStatus } from "@/components/PipelineVisualizer";
import { UploadZone } from "@/components/UploadZone";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner"; // <--- Import toast
import TextType from "@/components/TextTyping";

// These labels MUST match the 'step' value sent from factory.py
const INITIAL_STEPS: PipelineStep[] = [
  { id: "0", label: "Document Analysis", status: "pending" },
  { id: "1", label: "Day Plan Extraction", status: "pending" },
  { id: "2", label: "Action Plan Extraction", status: "pending" },
  { id: "3", label: "Barrier Mode Analysis", status: "pending" },
  { id: "4", label: "Coordination Action Pattern", status: "pending" },
  { id: "5", label: "Ring & Block Extraction", status: "pending" },
  { id: "6", label: "Phases In Use Extraction", status: "pending" },
  { id: "7", label: "Timing Plan Extraction", status: "pending" },
  { id: "8", label: "Dual Entry Extraction", status: "pending" },
  { id: "9", label: "Recall Information Extraction", status: "pending" },
  { id: "10", label: "Data Serialization", status: "pending" },
];

export default function Home() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState<number | undefined>(undefined);

  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    // Reset steps to empty to show them appearing one by one
    setSteps([]);
    
    toast.info("Starting analysis...", { duration: 2000 }); // Optional: Notify start
    startProcessing(file);
  };

  const handleClearSession = () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(null);
    setSteps([]);
    setIsProcessing(false);
    setCurrentPage(undefined);
    toast.dismiss(); // Dismiss any lingering toasts
  };

  const startProcessing = async (file: File) => {
    setIsProcessing(true);
    
    try {
        const formData = new FormData();
        formData.append("file", file);

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${API_URL}/process-signal-timing`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok || !response.body) {
            throw new Error("Failed to start processing");
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
                         setSteps(prev => {
                             // Mark previous running steps as completed
                             const nextSteps = prev.map(s => 
                                 s.status === "running" ? { ...s, status: "completed" as StepStatus } : s
                             );

                             // Check if this step is already in the list
                             const existingIndex = nextSteps.findIndex(s => s.label === event.step);
                             
                             if (existingIndex !== -1) {
                                 // Update existing step to running
                                 nextSteps[existingIndex] = {
                                     ...nextSteps[existingIndex],
                                     status: "running" as StepStatus,
                                     sources: event.pages ? event.pages.map((p: number) => `Page ${p}`) : nextSteps[existingIndex].sources
                                 };
                             } else {
                                 // Add new step from template
                                 const template = INITIAL_STEPS.find(s => s.label === event.step);
                                 if (template) {
                                     nextSteps.push({
                                         ...template,
                                         status: "running" as StepStatus,
                                         sources: event.pages ? event.pages.map((p: number) => `Page ${p}`) : undefined
                                     });
                                 }
                             }
                             return nextSteps;
                         });
                         
                         // PDF Navigation (Auto)
                         if (event.pages && event.pages.length > 0) {
                             setCurrentPage(event.pages[0]);
                         }

                    } else if (event.type === "step_update") {
                         // Real-time Reasoning Update
                         setSteps(prev => prev.map(s => {
                             if (s.label === event.step) {
                                 return { ...s, reasoning: event.reasoning };
                             }
                             return s;
                         }));

                    } else if (event.type === "result") {
                         const data = event.data;
                         setCurrentPage(undefined); // Reset page highlight
                         
                         // Success Notification
                         toast.success("Analysis Complete!", {
                            description: "Signal timing extracted and CSV generated.",
                            duration: 5000,
                         });

                         setSteps(prev => prev.map(s => {
                             // Mark the final Serialization step as complete with action
                            if (s.label === "Data Serialization") {
                                return {
                                    ...s,
                                    status: "completed",
                                    actionLabel: "Download .CSV",
                                    reasoning: "UTDF CSV generated successfully.",
                                    onAction: () => {
                                        if (data.csv_content) {
                                            const blob = new Blob([data.csv_content], { type: "text/csv" });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement("a");
                                            a.href = url;
                                            a.download = "signal_timing.utdf.csv";
                                            a.click();
                                            toast.success("Download started");
                                        } else {
                                            toast.error("CSV content is missing");
                                        }
                                    }
                                };
                            }
                            // Ensure everything else is marked completed
                            return { ...s, status: "completed" };
                        }));
                    } else if (event.type === "error") {
                        throw new Error(event.error);
                    }
                } catch (e) {
                    console.error("Error parsing event line:", e);
                }
            }
        }
    } catch (error) {
        console.error(error);
        const errMsg = error instanceof Error ? error.message : "Unknown error";
        
        // Error Notification
        toast.error("Processing Failed", {
            description: errMsg,
        });

        setSteps(prev => prev.map(s => s.status === "running" ? { ...s, status: "error" } : s));
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <main className="flex h-screen w-full overflow-hidden font-sans relative bg-white text-zinc-900">
      {/* Left Panel - PDF Viewer */}
      <div className="w-[50%] h-full p-4 pr-2 border-r border-zinc-200">
        <PDFViewer fileUrl={fileUrl} page={currentPage} />
      </div>

      {/* Right Panel - Pipeline & Upload */}
      <div className="w-[50%] h-full flex flex-col p-4 pl-2 relative">
        
        {/* Header / Actions */}
        <div className="flex justify-end mb-4 px-2">
            <button 
            onClick={handleClearSession}
            disabled={isProcessing}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-md hover:bg-zinc-100 transition-colors disabled:opacity-50"
            >
            <RotateCcw className="h-3 w-3" />
            Clear session
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto mb-20 scrollbar-hide px-2">
            {!fileUrl ? (
                <div className="flex h-full flex-col items-center justify-center text-center opacity-70">
                     <TextType 
                        text={["Please upload a PDF to initiate the Agent...", "Ready for Signal Timing Analysis."]}
                        className="text-lg font-medium text-zinc-600"
                        cursorClassName="text-blue-600"
                        typingSpeed={50}
                        pauseDuration={2000}
                     />
                </div>
            ) : (
                <PipelineVisualizer 
                    steps={steps} 
                    onPageClick={(page) => setCurrentPage(page)}
                />
            )}
        </div>

        {/* Bottom Upload Area - Fixed */}
        <div className="absolute bottom-6 left-2 right-4 pt-4 border-t border-zinc-200 bg-white/80 backdrop-blur-sm">
           <UploadZone onFileSelect={handleFileSelect} disabled={isProcessing} />
        </div>
      </div>
    </main>
  );
}