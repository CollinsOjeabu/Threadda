/**
 * Extract plain text from a PDF in the browser (library upload flow).
 *
 * Security notes (pdfjs-dist 6.x):
 * - PDF JavaScript only runs through the viewer's scripting layer
 *   (`enableScripting` on PDFViewer / AnnotationLayer). We never load the
 *   viewer or render annotations — text extraction only — so embedded
 *   scripts are never executed (GHSA-hq66-cqwq-w95j needs that layer).
 * - v6 removed `isEvalSupported`; font parsing no longer uses eval.
 * - XFA forms are explicitly off; we don't need them for text.
 */
export async function extractPdfText(file: File): Promise<string> {
  // Dynamically import pdfjs-dist to prevent loading it during server-side rendering/prerendering
  const pdfjsLib = await import('pdfjs-dist')

  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString()

  const data = new Uint8Array(await file.arrayBuffer())
  const loadingTask = pdfjsLib.getDocument({ data, enableXfa: false })

  try {
    const pdf = await loadingTask.promise
    const textParts: string[] = []

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
      textParts.push(pageText)
    }

    return textParts.join('\n\n').trim()
  } finally {
    // Tears down the document and its worker (PDFDocumentProxy.destroy was removed in v6).
    await loadingTask.destroy()
  }
}
