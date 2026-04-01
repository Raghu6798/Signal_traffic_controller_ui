"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  ChevronLeft, FileText, CheckCircle, Clock, AlertCircle, 
  Download, ExternalLink, MoreVertical, Search, Filter, 
  MapPin, Settings, Loader2, Upload
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadAndRecordDocument } from "@/lib/s3-actions";
import { saveExtractionResult } from "@/lib/actions"; // Make sure to add this in lib/actions.ts!
import { PipelineVisualizer, PipelineStep, StepStatus } from "@/components/PipelineVisualizer";
import { toast } from "sonner";

// Types
type DocumentStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
type Document = {
  id: string;
  intersection?: string | null;
  fileName: string;
  status: DocumentStatus;
  createdAt: string | Date;
  s3UrlPdf: string;
  s3UrlCsv?: string | null;
  extractedData?: {
    cycleLength?: number | null;
    offset?: number | null;
  } | null;
};

type ProjectProps = {
  id: string;
  name: string;
  description?: string | null;
  documents: Document[];
};

// These MUST match the 'step' strings sent from your Python backend exactly
const INITIAL_STEPS: PipelineStep[] = [
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

// Status Pill
function StatusBadge({ status }: { status: DocumentStatus }) {
  const styles: Record<DocumentStatus, string> = {
    PENDING:    "bg-white/5 text-foreground/40 border-white/10",
    PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse",
    COMPLETED:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    FAILED:     "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${styles[status]}`}>
      {status === "PROCESSING" && <Loader2 className="size-2.5 mr-1 animate-spin" />}
      {status}
    </span>
  );
}

export function ProjectDetailClient({ project, user }: { project: ProjectProps, user: any }) {
  const [documents, setDocuments] = useState<Document[]>(project.documents);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState("");
  
  // Pipeline State
  const [activeSteps, setActiveSteps] = useState<PipelineStep[]>(INITIAL_STEPS);
  const [processingDocId, setProcessingDocId] = useState<string | null>(null);

  const filtered = documents.filter(doc => 
    doc.intersection?.toLowerCase().includes(search.toLowerCase()) ||
    doc.fileName.toLowerCase().includes(search.toLowerCase())
  );

  async function handleFileSelect(file: File) {
    if (file.size > 10 * 1024 * 1024) return toast.error("File is too large (max 10MB)");
    
    setIsUploading(true);
    setActiveSteps(INITIAL_STEPS); // Reset visualizer
    
    try {
      // 1. Upload to S3 & Create DB Record (PENDING)
      const s3FormData = new FormData();
      s3FormData.append("file", file);
      s3FormData.append("projectId", project.id);
      s3FormData.append("intersection", file.name.split('.')[0]);

      toast.info("Uploading PDF to secure storage...");
      const { documentId, success } = await uploadAndRecordDocument(s3FormData);
      
      if (!success) throw new Error("Database recording failed");
      setProcessingDocId(documentId);
      toast.success("Upload complete. Starting AI extraction...");

      // 2. Send to FastAPI Backend
      const pyFormData = new FormData();
      pyFormData.append("file", file);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(API_URL, {
        method: "POST",
        body: pyFormData,
      })

      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to AI processing engine.");
      }

      // 3. Read the NDJSON Stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete chunk in buffer

        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const event = JSON.parse(line);

            if (event.type === "progress") {
              setActiveSteps(prev => {
                const stepExists = prev.some(s => s.label === event.step);
                if (stepExists) {
                  return prev.map(s => s.label === event.step ? { 
                    ...s, 
                    status: "running" as StepStatus,
                    sources: event.pages ? event.pages.map((p: number) => `Page ${p}`) : s.sources
                  } : s);
                } else {
                  const nextStepDef = INITIAL_STEPS.find(s => s.label === event.step);
                  if (!nextStepDef) return prev;
                  const completedPrev = prev.map(s => ({ ...s, status: "completed" as StepStatus }));
                  return [...completedPrev, { ...nextStepDef, status: "running" as StepStatus }];
                }
              });
            } 
            else if (event.type === "step_update") {
              // Real-time Reasoning Logs
              setActiveSteps(prev => prev.map(s => 
                s.label === event.step ? { ...s, reasoning: event.reasoning } : s
              ));
            } 
            else if (event.type === "result") {
              // Processing Finished!
              setActiveSteps(prev => prev.map(s => ({ ...s, status: "completed" as StepStatus })));
              
              // 4. Save Extracted Data to PostgreSQL
              await saveExtractionResult(documentId, event.data);
              
              toast.success("UTDF extraction complete!", {
                description: "Data saved to project successfully."
              });
              
              // Short delay to let the user see the "completed" state, then refresh
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            } 
            else if (event.type === "error") {
              throw new Error(event.error);
            }
          } catch (e) {
            console.error("Error parsing stream line:", e);
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message || "AI Extraction failed.");
      setActiveSteps(prev => prev.map(s => s.status === "running" ? { ...s, status: "error" as StepStatus } : s));
      
      // If it fails, we should ideally mark the DB document as FAILED
      // This would require a separate server action or API call
    } finally {
      setIsUploading(false);
      // We don't clear processingDocId immediately so the user can see errors
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-4">
          <Link href="/projects" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group">
            <ChevronLeft className="size-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to projects
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {project.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{project.description ?? "No description provided."}</p>
          </div>
        </div>

        <div className="w-full md:w-80 shrink-0">
          <UploadZone onFileSelect={handleFileSelect} disabled={isUploading} />
          {isUploading && (
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-blue-400">
              <Loader2 className="size-3 animate-spin" />
              Processing document with AI...
            </div>
          )}
        </div>
      </motion.div>

      {/* Live Pipeline Visualizer (Shown when uploading/processing) */}
      <AnimatePresence>
        {(isUploading || processingDocId) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6 shadow-inner">
              <div className="flex items-center gap-2 mb-6 border-b border-blue-500/20 pb-4">
                <div className="size-8 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
                  <Zap className="size-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-400">Live AI Extraction</h3>
                  <p className="text-xs text-blue-400/60">Mistral OCR & Gemini 2.5 Pro are parsing the document</p>
                </div>
              </div>
              
              <PipelineVisualizer 
                steps={activeSteps} 
                onPageClick={(page) => console.log("Navigate to page", page)}
                isProcessing={isUploading}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-white transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by intersection or filename…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
          </div>
          <button className="px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted flex items-center gap-2 transition-all">
            <Filter className="size-4" /> Filters
          </button>
        </div>

        {/* Documents Table */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-24 text-center space-y-4"
              >
                <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                  <FileText className="size-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg">No documents yet</p>
                  <p className="text-sm text-muted-foreground">Upload your first signal timing PDF to start the OCR extraction.</p>
                </div>
              </motion.div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((doc, i) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 hover:bg-accent/40 transition-all group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="size-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                        <FileText className="size-5 text-violet-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-foreground truncate">{doc.intersection ?? doc.fileName}</h3>
                          <StatusBadge status={doc.status} />
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          <span className="truncate">{doc.fileName}</span>
                          <span>•</span>
                          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Extraction preview Cycle/Offset */}
                    <div className="flex items-center gap-6 sm:px-4">
                      {doc.extractedData && (
                        <div className="flex gap-6">
                           <div className="flex flex-col gap-0.5">
                             <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Cycle</span>
                             <span className="text-xs font-semibold text-foreground">{doc.extractedData.cycleLength ?? "--"}s</span>
                           </div>
                           <div className="flex flex-col gap-0.5">
                             <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Offset</span>
                             <span className="text-xs font-semibold text-foreground">{doc.extractedData.offset ?? "--"}s</span>
                           </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="size-9 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-muted transition-all"
                        title="Download UTDF CSV"
                        disabled={!doc.s3UrlCsv}
                      >
                        <Download className={`size-4 ${doc.s3UrlCsv ? "text-emerald-500" : "text-muted-foreground opacity-50"}`} />
                      </button>
                      <Link 
                        href={`/projects/${project.id}/documents/${doc.id}`}
                        className="size-9 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-muted transition-all"
                        title="View Full Extraction"
                      >
                        <ExternalLink className="size-4 text-muted-foreground" />
                      </Link>
                      <button className="size-9 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-muted transition-all">
                        <MoreVertical className="size-4 text-muted-foreground" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// UploadZone Component
function UploadZone({ onFileSelect, disabled }: { onFileSelect: (f: File) => void; disabled: boolean }) {
  const [isDrag, setIsDrag] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div 
      className={`relative rounded-2xl border-2 border-dashed transition-all p-4 text-center cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-3 ${isDrag ? 'border-blue-500 bg-blue-500/10 shadow-inner' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
      onDragLeave={() => setIsDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDrag(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type === "application/pdf") onFileSelect(file);
        else toast.error("Please upload a valid PDF file");
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        accept="application/pdf"
        className="hidden" 
        ref={fileInputRef} 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            if (file.type === "application/pdf") onFileSelect(file);
            else toast.error("Please upload a valid PDF file");
          }
          if (e.target) e.target.value = '';
        }} 
      />
      <div className="size-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-inner">
        <Upload className="size-5" />
      </div>
      <div>
        <p className="text-sm font-bold text-white mb-0.5">Upload Timing PDF</p>
        <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Drag & drop or Click</p>
      </div>
    </div>
  );
}