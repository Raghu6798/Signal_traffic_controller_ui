import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ChevronLeft, FileText, Download, Activity, Code, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default async function DocumentExtractionPage({ params }: { params: Promise<{ projectId: string; documentId: string }> }) {
  const resolvedParams = await params;
  const { projectId, documentId } = resolvedParams;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");

  const doc = await prisma.signalDocument.findUnique({
    where: { id: documentId, projectId },
    include: {
      extractedData: true,
      project: true
    }
  });

  if (!doc) notFound();

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-4">
          <Link href={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors group">
            <ChevronLeft className="size-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to {doc.project.name}
          </Link>
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-2xl">
              <FileText className="size-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {doc.intersection ?? doc.fileName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-white/40">
                <span>{doc.fileName}</span>
                <span>•</span>
                <span>{new Date(doc.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={doc.s3UrlPdf}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all flex items-center gap-2"
          >
            <ExternalLink className="size-4" /> View Original PDF
          </a>
          <button 
            disabled={!doc.s3UrlCsv}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-white/90 text-black text-sm font-bold transition-all disabled:opacity-50 disabled:hover:bg-white flex items-center gap-2"
          >
            <Download className="size-4" /> Download UTDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Parsed Macros */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="size-5 text-blue-400" /> Key Parameters
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Cycle Length</span>
              <span className="text-2xl font-black text-white">{doc.extractedData?.cycleLength ?? "--"}<span className="text-sm font-medium text-white/50 ml-1">s</span></span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Offset</span>
              <span className="text-2xl font-black text-white">{doc.extractedData?.offset ?? "--"}<span className="text-sm font-medium text-white/50 ml-1">s</span></span>
            </div>
            <div className="col-span-2 p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Controller Mode</span>
              <span className="text-lg font-bold text-white truncate">
                {doc.extractedData?.isBarrierMode ? "Barrier Phase Ring" : "Standard Sequence"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Raw JSON Extraction */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Code className="size-5 text-purple-400" /> AI Diagnostic JSON
          </h2>
          
          <div className="rounded-2xl border border-white/10 bg-[#060B18] overflow-hidden">
            <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-400/20" />
                <div className="size-3 rounded-full bg-amber-400/20" />
                <div className="size-3 rounded-full bg-emerald-400/20" />
              </div>
              <span className="text-xs font-mono text-white/30 ml-2">extraction_payload.json</span>
            </div>
            <div className="p-5 overflow-x-auto max-h-[600px] overflow-y-auto">
              <pre className="text-sm font-mono text-purple-200">
                {doc.extractedData?.rawJson 
                  ? JSON.stringify(doc.extractedData.rawJson, null, 2)
                  : "// Processing document or payload unavailable"}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
