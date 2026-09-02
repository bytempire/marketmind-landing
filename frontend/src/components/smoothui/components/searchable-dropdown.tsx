"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

const ROTATION_ANGLE_OPEN = 180;

export interface SearchableDropdownItem {
  description?: string;
  icon?: ReactNode;
  id: string | number;
  label: string;
}

export interface SearchableDropdownProps {
  className?: string;
  emptyMessage?: string;
  items: SearchableDropdownItem[];
  label: string;
  onChange?: (item: SearchableDropdownItem) => void;
  placeholder?: string;
  /** Controlled selected item id; null/undefined shows label */
  value?: string | number | null;
}

export default function SearchableDropdown({
  label,
  items,
  onChange,
  placeholder = "Search...",
  emptyMessage = "No results found",
  className = "",
  value,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] =
    useState<SearchableDropdownItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedItem = useMemo(() => {
    if (value === undefined) return internalSelected;
    if (value === null || value === "") return null;
    return items.find((item) => String(item.id) === String(value)) ?? null;
  }, [value, items, internalSelected]);

  const filteredItems = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return items;
    const query = trimmedQuery.toLowerCase();
    return items.filter((item) => {
      const itemLabel = item.label.toLowerCase();
      const description = item.description?.toLowerCase();
      return itemLabel.includes(query) || Boolean(description?.includes(query));
    });
  }, [items, searchQuery]);

  const handleItemSelect = useCallback(
    (item: SearchableDropdownItem) => {
      if (value === undefined) setInternalSelected(item);
      setIsOpen(false);
      setSearchQuery("");
      setFocusedIndex(-1);
      onChange?.(item);
    },
    [onChange, value],
  );

  const handleClearSearch = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (!prev && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 4,
          left: rect.left,
          width: Math.max(rect.width, 220),
        });
        window.setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (prev) setSearchQuery("");
      return next;
    });
  }, []);

  useEffect(() => {
    if (!(isOpen && buttonRef.current)) return;
    const updatePosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 220),
      });
    };
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        portalRef.current &&
        !portalRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) {
        if (
          (event.key === "Enter" || event.key === " ") &&
          document.activeElement === buttonRef.current
        ) {
          event.preventDefault();
          handleToggle();
        }
        return;
      }

      if (event.key === "Escape") {
        setIsOpen(false);
        setSearchQuery("");
        setFocusedIndex(-1);
        buttonRef.current?.focus();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : 0,
        );
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredItems.length - 1,
        );
      } else if (event.key === "Enter" && focusedIndex >= 0) {
        event.preventDefault();
        const item = filteredItems[focusedIndex];
        if (item) handleItemSelect(item);
      } else if (event.key === "Home") {
        event.preventDefault();
        setFocusedIndex(0);
      } else if (event.key === "End") {
        event.preventDefault();
        setFocusedIndex(filteredItems.length - 1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, focusedIndex, handleItemSelect, handleToggle]);

  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchQuery]);

  const dropdownContent = (
    <AnimatePresence>
      {isOpen ? (
        <div ref={portalRef}>
          <motion.div
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scaleY: 1 }
            }
            className="fixed z-50 origin-top overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]/95 shadow-lg backdrop-blur-md"
            exit={
              shouldReduceMotion
                ? { opacity: 0, transition: { duration: 0 } }
                : {
                    opacity: 0,
                    y: -10,
                    scaleY: 0.8,
                    transition: { duration: 0.15 },
                  }
            }
            initial={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 0, y: -10, scaleY: 0.8 }
            }
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
            }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    type: "spring" as const,
                    stiffness: 400,
                    damping: 30,
                    mass: 0.8,
                  }
            }
          >
            <div className="relative border-b border-[var(--border)] p-2">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  aria-autocomplete="list"
                  aria-controls="cabinet-dropdown-items"
                  aria-expanded={isOpen}
                  aria-label="Поиск"
                  className="w-full rounded-md border border-[var(--border)] bg-transparent py-2 pr-8 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setFocusedIndex(-1);
                  }}
                  placeholder={placeholder}
                  ref={inputRef}
                  role="combobox"
                  type="text"
                  value={searchQuery}
                />
                <AnimatePresence>
                  {searchQuery ? (
                    <motion.button
                      animate={{ opacity: 1 }}
                      aria-label="Очистить поиск"
                      className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0 }}
                      onClick={handleClearSearch}
                      type="button"
                    >
                      <X aria-hidden="true" className="h-4 w-4" />
                    </motion.button>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

            <ul
              aria-label="Варианты"
              className="max-h-60 overflow-y-auto py-2"
              id="cabinet-dropdown-items"
            >
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <li
                    aria-selected={
                      selectedItem?.id === item.id || index === focusedIndex
                    }
                    className="block"
                    key={item.id}
                    role="option"
                  >
                    <button
                      aria-label={`${item.label}${item.description ? `, ${item.description}` : ""}`}
                      className={cn(
                        "flex min-h-10 w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--muted)] focus-visible:bg-[var(--muted)] focus-visible:outline-none",
                        selectedItem?.id === item.id &&
                          "font-medium text-[var(--primary)]",
                        index === focusedIndex && "bg-[var(--muted)]",
                      )}
                      onClick={() => handleItemSelect(item)}
                      onMouseEnter={() => setFocusedIndex(index)}
                      type="button"
                    >
                      {item.icon ? (
                        <span className="mr-3 shrink-0 text-[var(--muted-foreground)]">
                          {item.icon}
                        </span>
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <span className="block truncate">{item.label}</span>
                        {item.description ? (
                          <span className="block truncate text-xs text-[var(--muted-foreground)]">
                            {item.description}
                          </span>
                        ) : null}
                      </div>
                      {selectedItem?.id === item.id ? (
                        <svg
                          aria-hidden="true"
                          className="ml-2 h-4 w-4 shrink-0 text-[var(--primary)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M5 13l4 4L19 7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      ) : null}
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                  {emptyMessage}
                </li>
              )}
            </ul>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <>
      <div className={cn("relative block w-full", className)} ref={dropdownRef}>
        <button
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={
            selectedItem ? `${label}: ${selectedItem.label}` : label
          }
          className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-transparent px-3 text-left text-sm transition-colors hover:bg-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          onClick={handleToggle}
          ref={buttonRef}
          type="button"
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            {selectedItem?.icon ? (
              <span className="shrink-0 text-[var(--muted-foreground)]">
                {selectedItem.icon}
              </span>
            ) : null}
            <span className="truncate">
              {selectedItem ? selectedItem.label : label}
            </span>
          </span>
          <motion.div
            animate={{ rotate: isOpen ? ROTATION_ANGLE_OPEN : 0 }}
            className="shrink-0"
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: "spring" as const, stiffness: 400, damping: 25 }
            }
          >
            <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" />
          </motion.div>
        </button>
      </div>
      {mounted ? createPortal(dropdownContent, document.body) : null}
    </>
  );
}
