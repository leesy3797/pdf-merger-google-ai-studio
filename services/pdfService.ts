import { PDFDocument } from 'pdf-lib';
import { PDFFile } from '../types';

export const mergePdfs = async (files: PDFFile[]): Promise<Blob> => {
  try {
    const mergedPdf = await PDFDocument.create();

    for (const pdfFile of files) {
      const fileBuffer = await pdfFile.file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    }

    const mergedPdfBytes = await mergedPdf.save();
    return new Blob([mergedPdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error merging PDFs:', error);
    throw new Error('PDF 병합 중 오류가 발생했습니다. 파일이 손상되지 않았는지 확인해주세요.');
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};