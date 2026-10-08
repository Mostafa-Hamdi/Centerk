'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/Input';
import { ar } from '@/i18n/ar';

interface SearchInputProps {
  value: string;
  /** Called 400ms after typing stops (server-side search). */
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** Debounced search box that stays in sync with the URL value. */
export function SearchInput({
  value,
  onSearch,
  placeholder = ar.list.searchPlaceholder,
  className,
}: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const debounced = useDebouncedCallback(onSearch, 400);

  // External changes (back button, "clear all") win over the local draft.
  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <div className={className}>
      <Input
        type="search"
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          debounced(event.target.value.trim());
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        startAdornment={<Search aria-hidden />}
        endAdornment={
          draft ? (
            <button
              type="button"
              onClick={() => {
                setDraft('');
                debounced.cancel();
                onSearch('');
              }}
              aria-label={ar.list.clearSearch}
              className="flex size-10 items-center justify-center rounded-sm text-muted hover:bg-primary-tint hover:text-ink"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : null
        }
        className="[&::-webkit-search-cancel-button]:hidden"
      />
    </div>
  );
}
