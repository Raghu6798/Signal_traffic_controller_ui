export function PDFViewer({ fileUrl, page }: { fileUrl: string | null; page?: number }) {
  if (!fileUrl) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-muted/20 border border-border text-muted-foreground">
        <p className="text-lg font-medium">PDF Viewer</p>
        <p className="text-sm">Upload a document to preview</p>
      </div>
    );
  }

  // Append page number to URL for browser PDF viewer navigation
  const pdfSrc = page ? `${fileUrl}#page=${page}` : fileUrl;

  return (
    <div className="h-full w-full overflow-hidden rounded-xl border border-border bg-card">
      <iframe
        key={pdfSrc}
        src={pdfSrc}
        className="h-full w-full"
        title="PDF Preview"
      />
    </div>
  );
}
