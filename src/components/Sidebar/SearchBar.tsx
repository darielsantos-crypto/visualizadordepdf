import { Search } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder }: Props) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" aria-hidden />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Buscar documentos…'}
        aria-label="Buscar documentos"
        className="w-full rounded-lg border border-white/15 bg-white/10 py-2 pl-9 pr-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-white/40 focus:bg-white/15"
      />
    </div>
  );
}
