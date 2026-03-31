"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  ChevronLeft, FileText, CheckCircle, Clock, AlertCircle, 
  Download, ExternalLink, MoreVertical, Search, Filter, 
  MapPin, Settings, Loader2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadAndRecordDocument } from "@/lib/s3-actions";
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

  const filtered = documents.filter(doc => 
    doc.intersection?.toLowerCase().includes(search.toLowerCase()) ||
    doc.fileName.toLowerCase().includes(search.toLowerCase())
  );

  async function handleFileSelect(file: File) {
    if (file.size > 10 * 1024 * 1024) return toast.error("File is too large (max 10MB)");
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", project.id);
    formData.append("intersection", file.name.split('.')[0]);

    try {
      const result = await uploadAndRecordDocument(formData);
      
      if (result.success) {
        toast.success("PDF uploaded and analysis started!");
        // Refresh the page data (in a real app, use a listener or polling)
        window.location.reload(); 
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed. Check your S3 credentials in .env.local.");
    } finally {
      setIsUploading(false);
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
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-white/50">
              <Loader2 className="size-3 animate-spin text-white" />
              Uploading and analyzing timing sheet...
            </div>
          )}
        </div>
      </motion.div>

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
                {/* Uploading Skeleton Item */}
                {isUploading && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white/[0.02] animate-pulse">
                     <div className="flex items-center gap-4 flex-1 min-w-0">
                       <Skeleton className="size-10 rounded-xl shrink-0" />
                       <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-48 rounded-md" />
                          <Skeleton className="h-3 w-32 rounded-md opacity-40" />
                       </div>
                     </div>
                     <div className="flex gap-6 px-4">
                        <Skeleton className="h-4 w-12 rounded-md opacity-20" />
                        <Skeleton className="h-4 w-12 rounded-md opacity-20" />
                     </div>
                     <div className="flex gap-2">
                        <Skeleton className="size-9 rounded-xl opacity-20" />
                        <Skeleton className="size-9 rounded-xl opacity-20" />
                     </div>
                  </div>
                )}

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
