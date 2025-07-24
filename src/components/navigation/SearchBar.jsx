// components/navigation/SearchBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useHotkeys } from '../../hooks/useHotkeys';

export default function SearchBar({ 
  placeholder = "Search...", 
  autoFocus = false, 
  onClose,
  className = "" 
}) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Global search hotkey (Cmd/Ctrl + K)
  useHotkeys(['meta+k', 'ctrl+k'], (e) => {
    e.preventDefault();
    inputRef.current?.focus();
  });

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose?.();
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-md border border-border bg-background pl-10 pr-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        {!query && !isFocused && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hidden sm:block">
            ⌘K
          </div>
        )}
      </div>
    </div>
  );
}
