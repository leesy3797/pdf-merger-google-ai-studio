import React, { useState, useCallback } from 'react';
import { UploadArea } from './components/UploadArea';
import { FileList } from './components/FileList';
import { PDFFile, MergeState, GeminiState } from './types';
import { mergePdfs } from './services/pdfService';
import { generateSmartFilename } from './services/geminiService';
import { Sparkles, FileStack, Download, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [mergeState, setMergeState] = useState<MergeState>({
    isMerging: false,
    error: null,
    resultUrl: null,
    downloadName: 'merged_document.pdf'
  });
  const [geminiState, setGeminiState] = useState<GeminiState>({
    isGeneratingName: false,
    error: null
  });

  const handleFilesSelected = (selectedFiles: File[]) => {
    const newFiles: PDFFile[] = selectedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      size: file.size
    }));
    setFiles(prev => [...prev, ...newFiles]);
    setMergeState(prev => ({ ...prev, resultUrl: null, error: null }));
  };

  const handleRemove = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setMergeState(prev => ({ ...prev, resultUrl: null }));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFiles(prev => {
      const newFiles = [...prev];
      [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      return newFiles;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles(prev => {
      const newFiles = [...prev];
      [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]];
      return newFiles;
    });
  };

  const handleSmartName = async () => {
    if (files.length === 0) return;
    setGeminiState({ isGeneratingName: true, error: null });
    
    try {
      const suggestedName = await generateSmartFilename(files.map(f => f.name));
      setMergeState(prev => ({ ...prev, downloadName: suggestedName }));
    } catch (e) {
      setGeminiState({ isGeneratingName: false, error: "이름 생성 중 오류가 발생했습니다." });
    } finally {
      setGeminiState(prev => ({ ...prev, isGeneratingName: false }));
    }
  };

  const handleMerge = async () => {
    if (files.length === 0) return;
    setMergeState(prev => ({ ...prev, isMerging: true, error: null, resultUrl: null }));

    try {
      const blob = await mergePdfs(files);
      const url = URL.createObjectURL(blob);
      setMergeState(prev => ({ ...prev, resultUrl: url }));
    } catch (e: any) {
      setMergeState(prev => ({ ...prev, error: e.message || '오류가 발생했습니다.' }));
    } finally {
      setMergeState(prev => ({ ...prev, isMerging: false }));
    }
  };

  const handleReset = () => {
    setFiles([]);
    setMergeState({
      isMerging: false,
      error: null,
      resultUrl: null,
      downloadName: 'merged_document.pdf'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4">
            <FileStack className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Smart PDF Merger</h1>
          <p className="mt-2 text-slate-500">
            여러 PDF 파일을 하나로 쉽고 빠르게 병합하세요.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <div className="p-6 sm:p-8">
            <UploadArea onFilesSelected={handleFilesSelected} />
            
            <FileList 
              files={files} 
              onRemove={handleRemove}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />

            {files.length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-100 space-y-6">
                
                {/* Filename Input Section */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">
                    파일 이름 설정
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={mergeState.downloadName}
                      onChange={(e) => setMergeState(prev => ({...prev, downloadName: e.target.value}))}
                      className="flex-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 bg-slate-50"
                    />
                    <button
                      onClick={handleSmartName}
                      disabled={geminiState.isGeneratingName}
                      className="inline-flex items-center px-4 py-2.5 border border-indigo-200 shadow-sm text-sm font-medium rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                    >
                      {geminiState.isGeneratingName ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI 자동 작명
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    Gemini AI가 파일 내용을 분석하여 적절한 이름을 추천해드립니다.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {!mergeState.resultUrl ? (
                    <button
                      onClick={handleMerge}
                      disabled={mergeState.isMerging}
                      className="flex-1 flex justify-center items-center py-3.5 px-6 border border-transparent rounded-xl shadow-lg shadow-indigo-200 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {mergeState.isMerging ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          PDF 병합 중...
                        </>
                      ) : (
                        'PDF 병합하기'
                      )}
                    </button>
                  ) : (
                    <a
                      href={mergeState.resultUrl}
                      download={mergeState.downloadName}
                      className="flex-1 flex justify-center items-center py-3.5 px-6 border border-transparent rounded-xl shadow-lg shadow-green-200 text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      다운로드
                    </a>
                  )}
                  
                  <button
                    onClick={handleReset}
                    className="flex justify-center items-center py-3.5 px-6 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    초기화
                  </button>
                </div>
              </div>
            )}
            
            {/* Error Message */}
            {mergeState.error && (
              <div className="mt-4 p-4 bg-red-50 rounded-xl flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-red-700">{mergeState.error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-8">
          모든 파일은 브라우저 내에서 안전하게 처리되며 서버로 전송되지 않습니다.
        </p>
      </div>
    </div>
  );
};

export default App;