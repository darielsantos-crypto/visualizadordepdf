import { FileText } from 'lucide-react';
import type { PDFDoc } from '../../types';
import { formatBytes } from '../../utils/helpers';

interface Props {
  doc: PDFDoc;
  active: boolean;
  onClick: () => void;
}

export default function DocItem({ doc, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
        active
          ? 'bg-white text-[#004883] shadow-md'
          : 'text-white/80 hover:bg-white/10 hover:text-white'
      }`}
    >
      <FileText
        className={`mt-0.5 h-5 w-5 shrink-0 ${active ? 'text-[#004883]' : 'text-white/50 group-hover:text-white'}`}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium leading-tight">{doc.cleanName}</span>
        <span className={`mt-0.5 block text-xs ${active ? 'text-[#004883]/60' : 'text-white/40'}`}>
          {formatBytes(doc.size)}
        </span>
      </span>
    </button>
  );
}
