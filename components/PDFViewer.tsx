export function PDFViewer({ fileUrl, page }: { fileUrl: string | null; page?: number }) {
  if (!fileUrl) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-zinc-950/50 border border-zinc-900 text-zinc-500">
        <p className="text-lg font-medium">PDF Viewer</p>
        <p className="text-sm">Upload a document to preview</p>
      </div>
    );
  }

  // Append page number to URL for browser PDF viewer navigation
  const pdfSrc = page ? `${fileUrl}#page=${page}` : fileUrl;

  return (
    <div className="h-full w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <iframe
        src={pdfSrc}
        className="h-full w-full"
        title="PDF Preview"
      />
    </div>
  );
}
