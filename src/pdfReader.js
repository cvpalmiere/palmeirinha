// ============================================================
// PALMEIRINHA – Leitor de PDF com pdfjs-dist
// ============================================================

export async function extrairTextoPDF(file, onProgress) {
  try {
    const arrayBuffer = await file.arrayBuffer();

    const pdfjsLib = await import('pdfjs-dist');

    // Configurar o worker
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.js',
        import.meta.url
      ).toString();
    } catch (e) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let textoCompleto = '';
    const totalPages = pdf.numPages;

    for (let i = 1; i <= totalPages; i++) {
      if (onProgress) {
        onProgress(Math.round((i / totalPages) * 100));
      }

      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      textoCompleto += pageText + '\n';
    }

    return textoCompleto;

  } catch (error) {
    console.error('Erro ao ler PDF:', error);
    throw new Error(`Falha ao ler o PDF: ${error.message}`);
  }
}