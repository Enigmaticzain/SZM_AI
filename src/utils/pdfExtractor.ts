import * as pdfjsLib from 'pdfjs-dist';

let workerInitialized = false;

async function initializeWorker() {
  if (workerInitialized) return;
  
  try {
    // Try local node_modules first (dev environment)
    const response = await fetch('/node_modules/pdfjs-dist/build/pdf.worker.min.js');
    if (response.ok) {
      const workerCode = await response.text();
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
      workerInitialized = true;
      return;
    }
  } catch {
    // Continue to fallback
  }
  
  try {
    // Fallback to HTTPS CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    workerInitialized = true;
  } catch (error) {
    console.error('Failed to initialize PDF worker:', error);
    throw new Error('PDF worker initialization failed');
  }
}

export async function extractTextFromPdf(file: File): Promise<string> {
  await initializeWorker();
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const textChunks: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => {
            if (typeof item.str === 'string') {
              return item.str.trim();
            }
            return '';
          })
          .filter((str: string) => str.length > 0)
          .join(' ');
          
        if (pageText.trim()) {
          textChunks.push(`[Page ${pageNum}]\n${pageText}`);
        }
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${pageNum}:`, pageError);
        textChunks.push(`[Page ${pageNum}]\n[Error extracting text]`);
      }
    }

    const fullText = textChunks.join('\n\n');
    if (!fullText.trim()) {
      throw new Error(`No readable text found in PDF (${pdf.numPages} pages processed)`);
    }
    
    return fullText;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to extract PDF text: ${message}`);
  }
}
