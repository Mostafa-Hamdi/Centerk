'use client';

import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronDown, Loader2, Search } from 'lucide-react';
import { useId, useMemo, useState, type KeyboardEvent } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';
import { inputClasses } from './Input';
import type { SelectOption } from './Select';

interface ComboboxProps {
  value: string | undefined;
  onValueChange: (value: string | undefined) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  /** Server-side search: called (debounced 300ms) with the query; render results via `options`. */
  onSearch?: (query: string) => void;
  loading?: boolean;
  /** Label of the selected value when it isn't in the current `options` page. */
  selectedLabel?: string;
  id?: string;
  disabled?: boolean;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

/** Arabic-aware normalization for client-side filtering. */
const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[ً-ْ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');

/**
 * Searchable select (ARIA combobox + listbox) for long or server-searched lists:
 * students, groups, guardians. Keyboard: ↑/↓ to move, Enter to pick, Esc to close.
 */
export function Combobox({
  value,
  onValueChange,
  options,
  placeholder,
  onSearch,
  loading,
  selectedLabel,
  id,
  disabled,
  ...aria
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const search = useDebouncedCallback((next: string) => onSearch?.(next), 300);

  const visible = useMemo(() => {
    if (onSearch) return options; // server already filtered
    const needle = normalize(query.trim());
    return needle ? options.filter((option) => normalize(option.label).includes(needle)) : options;
  }, [options, query, onSearch]);

  const current = options.find((option) => option.value === value)?.label ?? selectedLabel;

  const pick = (next: string) => {
    onValueChange(next === value ? undefined : next);
    setOpen(false);
    setQuery('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((index) => (index + step + visible.length) % Math.max(visible.length, 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = visible[active];
      if (option) pick(option.value);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        id={id}
        disabled={disabled}
        {...aria}
        className={cn(
          inputClasses,
          'flex items-center justify-between gap-2 text-start',
          !current && 'text-muted/70',
        )}
      >
        <span className="truncate">
          {current ?? (placeholder ? ar.list.pickPlaceholder(placeholder) : null)}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted" aria-hidden />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-(--radix-popover-trigger-width) min-w-64 animate-rise overflow-hidden rounded-lg border border-line bg-surface shadow-lift"
        >
          <div className="flex items-center gap-2 border-b border-line px-3">
            {loading ? (
              <Loader2 className="size-4 animate-spin text-muted" aria-hidden />
            ) : (
              <Search className="size-4 text-muted" aria-hidden />
            )}
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
                search(event.target.value.trim());
              }}
              onKeyDown={onKeyDown}
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={visible[active] ? `${listId}-${active}` : undefined}
              aria-label={placeholder ?? ar.common.search}
              placeholder={ar.common.search}
              className="h-12 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
            />
          </div>
          <ul id={listId} role="listbox" className="max-h-64 overflow-y-auto p-1.5">
            {visible.length ? (
              visible.map((option, index) => (
                <li
                  key={option.value}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={option.value === value}
                  onPointerMove={() => setActive(index)}
                  onClick={() => pick(option.value)}
                  className={cn(
                    'flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-sm px-3 text-sm',
                    index === active ? 'bg-primary-tint text-primary' : 'text-ink',
                    option.value === value && 'font-semibold',
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {option.value === value ? (
                    <Check className="size-4 shrink-0" aria-hidden />
                  ) : null}
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-sm text-muted">
                {loading ? ar.common.loading : ar.common.noResults}
              </li>
            )}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
