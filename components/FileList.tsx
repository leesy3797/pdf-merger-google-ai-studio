import React from 'react';
import { FileText, X, ArrowUp, ArrowDown } from 'lucide-react';
import { PDFFile } from '../types';
import { formatFileSize } from '../services/pdfService';

interface FileListProps {
  files: PDFFile[];
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export const FileList: React.FC<FileListProps> = ({ files, onRemove, onMoveUp, onMoveDown }) => {
  if (files.length === 0) return null;

  return (
    <div className="w-full space-y-3 mt-6">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-1">
        선택된 파일 ({files.length})
      </h3>
      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-4 overflow-hidden">
              <div className="flex-shrink-0 w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                <FileText size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 pl-4">
              <button
                onClick={() => onMoveUp(index)}
                disabled={index === 0}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                title="위로 이동"
              >
                <ArrowUp size={18} />
              </button>
              <button
                onClick={() => onMoveDown(index)}
                disabled={index === files.length - 1}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                title="아래로 이동"
              >
                <ArrowDown size={18} />
              </button>
              <div className="w-px h-6 bg-slate-200 mx-1"></div>
              <button
                onClick={() => onRemove(file.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="제거"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};