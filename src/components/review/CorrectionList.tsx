// src/components/review/CorrectionList.tsx

import { useMemo, useState } from "react";
import type {
  CorrectionCategory,
  CorrectionState,
  CorrectionSubmission,
} from "../../lib/review/types";
import { Badge } from "../ui/Badge";
import {
  CATEGORY_LABELS,
  STATE_LABELS,
  STATE_VARIANTS,
  URGENCY_LABELS,
  URGENCY_ORDER,
  URGENCY_VARIANTS,
  formatDate,
  getCategoryDef,
  type UrgencyLevel,
} from "./correctionMeta";

type StateFilter = "all" | CorrectionState;
type CategoryFilter = "all" | CorrectionCategory;
type UrgencyFilter = "all" | UrgencyLevel;
type SortKey = "targetPage" | "category" | "state" | "urgency" | "createdAt";
type SortDir = "asc" | "desc";

const CORRECTION_STATES: CorrectionState[] = [
  "new",
  "under_review",
  "applied",
  "rejected",
  "disputed",
  "archived",
  "withdrawn",
];

const URGENCY_LEVELS: UrgencyLevel[] = ["immediate", "high", "normal"];

interface CorrectionListProps {
  corrections: CorrectionSubmission[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

/** Accessible, labelled <select> used by the filter bar. */
function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
  allLabel,
  optionLabels,
}: {
  label: string;
  value: T | "all";
  onChange: (value: T | "all") => void;
  options: T[];
  allLabel: string;
  optionLabels?: Partial<Record<T, string>>;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-charcoal/70">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T | "all")}
        className="bg-bone border border-border/70 rounded-md px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-trust/50 min-h-[36px]"
      >
        <option value="all">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels?.[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Sortable column header button. */
function SortButton({
  label,
  sortKey,
  active,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  active: boolean;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      aria-label={`Sort by ${label}`}
      className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wide text-charcoal/60 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 rounded-sm"
    >
      {label}
      <span aria-hidden="true">{active ? (dir === "asc" ? "↑" : "↓") : "↕"}</span>
    </button>
  );
}

/**
 * Admin correction queue: filterable (state / category / urgency) and sortable
 * list of correction submissions. Urgent items carry priority badges. Selecting
 * a row calls `onSelect` with the correction id.
 */
export function CorrectionList({
  corrections,
  selectedId,
  onSelect,
}: CorrectionListProps) {
  const [stateFilter, setStateFilter] = useState<StateFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    const sorted = [...corrections].sort((a, b) => {
      const dirMult = sortDir === "asc" ? 1 : -1;
      let result = 0;
      switch (sortKey) {
        case "createdAt":
          result = a.createdAt.localeCompare(b.createdAt);
          break;
        case "targetPage":
          result = a.targetPage.localeCompare(b.targetPage);
          break;
        case "category":
          result = CATEGORY_LABELS[a.category].localeCompare(CATEGORY_LABELS[b.category]);
          break;
        case "state":
          result = STATE_LABELS[a.state].localeCompare(STATE_LABELS[b.state]);
          break;
        case "urgency":
          result =
            URGENCY_ORDER[getCategoryDef(a.category).urgency] -
            URGENCY_ORDER[getCategoryDef(b.category).urgency];
          break;
      }
      if (result === 0) result = a.createdAt.localeCompare(b.createdAt);
      return result * dirMult;
    });

    return sorted.filter((correction) => {
      if (stateFilter !== "all" && correction.state !== stateFilter) return false;
      if (categoryFilter !== "all" && correction.category !== categoryFilter) return false;
      if (
        urgencyFilter !== "all" &&
        getCategoryDef(correction.category).urgency !== urgencyFilter
      ) {
        return false;
      }
      return true;
    });
  }, [corrections, sortKey, sortDir, stateFilter, categoryFilter, urgencyFilter]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const ariaSortFor = (key: SortKey): "ascending" | "descending" | "none" =>
    sortKey === key ? (sortDir === "asc" ? "ascending" : "descending") : "none";

  return (
    <div className="space-y-4" data-testid="correction-list">
      <div className="flex flex-wrap gap-3 items-end">
        <FilterSelect
          label="State"
          value={stateFilter}
          onChange={setStateFilter}
          options={CORRECTION_STATES}
          allLabel="All states"
          optionLabels={STATE_LABELS}
        />
        <FilterSelect
          label="Category"
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={Object.keys(CATEGORY_LABELS) as CorrectionCategory[]}
          allLabel="All categories"
          optionLabels={CATEGORY_LABELS}
        />
        <FilterSelect
          label="Urgency"
          value={urgencyFilter}
          onChange={setUrgencyFilter}
          options={URGENCY_LEVELS}
          allLabel="All urgencies"
          optionLabels={URGENCY_LABELS}
        />
      </div>

      <p className="font-mono text-xs text-charcoal/50">
        Showing {filtered.length} of {corrections.length} corrections
      </p>

      <div className="border border-border/60 rounded-lg bg-paper overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink/5">
            <tr>
              <th
                scope="col"
                aria-sort={ariaSortFor("targetPage")}
                className="px-3 py-2 text-left"
              >
                <SortButton label="Target" sortKey="targetPage" active={sortKey === "targetPage"} dir={sortDir} onSort={handleSort} />
              </th>
              <th
                scope="col"
                aria-sort={ariaSortFor("category")}
                className="px-3 py-2 text-left"
              >
                <SortButton label="Category" sortKey="category" active={sortKey === "category"} dir={sortDir} onSort={handleSort} />
              </th>
              <th
                scope="col"
                aria-sort={ariaSortFor("state")}
                className="px-3 py-2 text-left"
              >
                <SortButton label="State" sortKey="state" active={sortKey === "state"} dir={sortDir} onSort={handleSort} />
              </th>
              <th
                scope="col"
                aria-sort={ariaSortFor("urgency")}
                className="px-3 py-2 text-left"
              >
                <SortButton label="Urgency" sortKey="urgency" active={sortKey === "urgency"} dir={sortDir} onSort={handleSort} />
              </th>
              <th
                scope="col"
                aria-sort={ariaSortFor("createdAt")}
                className="px-3 py-2 text-left"
              >
                <SortButton label="Created" sortKey="createdAt" active={sortKey === "createdAt"} dir={sortDir} onSort={handleSort} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60" data-testid="correction-list-rows">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-charcoal/50 italic">
                  No corrections match the current filters.
                </td>
              </tr>
            )}
            {filtered.map((correction) => {
              const def = getCategoryDef(correction.category);
              const selected = correction.id === selectedId;
              return (
                <tr
                  key={correction.id}
                  onClick={() => onSelect(correction.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(correction.id);
                    }
                  }}
                  tabIndex={0}
                  aria-selected={selected}
                  data-testid={`correction-row-${correction.id}`}
                  className={`cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-trust/50 ${
                    selected ? "bg-trust/10" : "hover:bg-ink/5"
                  }`}
                >
                  <td className="px-3 py-2.5 font-mono text-xs text-trust">
                    {correction.targetPage}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant="neutral">{def.label}</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant={STATE_VARIANTS[correction.state]}>
                      {STATE_LABELS[correction.state]}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant={URGENCY_VARIANTS[def.urgency]}>
                      {URGENCY_LABELS[def.urgency]}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-charcoal/60">
                    {formatDate(correction.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
