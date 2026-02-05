# Signal UI
Frontend for Signal Phase Timing factory services.

## Overview
This is a Next.js application that provides a visualized pipeline interface for processing Signal Timing Sheets (PDFs). It matches the reference design provided.

## Features
- **PDF Viewer**: Preview uploaded PDF documents.
- **Pipeline Visualizer**: Step-by-step visualization of the extraction and analysis process (mimicking `factory.py` logic).
- **Interactive UI**: Drag and drop upload, status indicators, and collapsible source views.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
   (Ensure `lucide-react`, `framer-motion`, `clsx`, `tailwind-merge` are installed)

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure
- `app/page.tsx`: The main dashboard page.
- `components/`: Reusable UI components.
  - `PDFViewer.tsx`: Left panel PDF display.
  - `PipelineVisualizer.tsx`: Right panel process tracker.
  - `UploadZone.tsx`: File upload component.
