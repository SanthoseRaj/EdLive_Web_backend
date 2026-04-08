import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

const DEFAULT_STATUS_OPTIONS = ["Shortlisted", "Viewed", "Unread"];

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <line x1="16.65" y1="16.65" x2="22" y2="22" />
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="5" x2="20" y2="5" />
    <line x1="8" y1="12" x2="20" y2="12" />
    <line x1="12" y1="19" x2="20" y2="19" />
    <circle cx="6" cy="5" r="1.5" />
    <circle cx="6" cy="12" r="1.5" />
    <circle cx="6" cy="19" r="1.5" />
  </svg>
);

// EdLive match colors
const COLOR = {
  titleBlue: "#204098",
  accentCyan: "#18B0D8",
  badgeRed: "#D02020",
  green: "#2FA84F",
  orange: "#E49738",
};

const statusTone = (status) => {
  const key = String(status || "").toLowerCase();
  if (key.includes("short")) return "shortlisted";
  if (key.includes("view")) return "viewed";
  if (key.includes("interview")) return "interview";
  if (key.includes("unread")) return "unread";
  if (key.includes("accept")) return "accepted";
  if (key.includes("reject") || key.includes("not joined")) return "rejected";
  return "default";
};

const statusPillClass = (tone) => {
  // subtle background + colored text (neat)
  switch (tone) {
    case "shortlisted":
    case "accepted":
      return "bg-[#EAF7EF] text-[#2FA84F] ring-1 ring-[#BFE7CC]";
    case "viewed":
      return "bg-[#FFF4E6] text-[#E49738] ring-1 ring-[#FFD8A8]";
    case "interview":
      return "bg-[#FFF7E0] text-[#D37F00] ring-1 ring-[#FFE08A]";
    case "rejected":
      return "bg-[#FFECEC] text-[#D84545] ring-1 ring-[#FFC6C6]";
    case "unread":
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }
};

const RequestsTable = ({
  rows,
  highlightId,
  showFilter,
  onStatusChange,
  fromPath = "/admission/new",
  statusOptions: statusOptionsProp = DEFAULT_STATUS_OPTIONS,
  readOnlyStatus = false,
}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const statusOptions = useMemo(
    () => (statusOptionsProp && statusOptionsProp.length ? statusOptionsProp : DEFAULT_STATUS_OPTIONS),
    [statusOptionsProp]
  );

  const classOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        rows
          .map((r) => (r.classLevel !== undefined && r.classLevel !== null ? String(r.classLevel) : null))
          .filter(Boolean)
      )
    );
    return unique.sort((a, b) => Number(a) - Number(b));
  }, [rows]);

  const [searchTerm, setSearchTerm] = useState("");
  const [rowStatus, setRowStatus] = useState(() =>
    rows.map((r) => ({ id: r.id, value: r.status || "Unread" }))
  );
  const [selectedClass, setSelectedClass] = useState("all");
  const [filters, setFilters] = useState({
    all: true,
    shortlisted: true,
    viewed: true,
    unread: true,
    male: true,
    female: true,
  });

  const filterRef = useRef(null);

  const updateStatus = (rowId, value) => {
    setRowStatus((prev) => prev.map((item) => (item.id === rowId ? { ...item, value } : item)));
    if (onStatusChange) {
      const row = rows.find((r) => r.id === rowId);
      if (!row) return;
      onStatusChange(row.id, value, "");
    }
  };

  useEffect(() => {
    const onClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggleFilter = (key) => {
    if (key === "all") {
      const next = !filters.all;
      setFilters({
        all: next,
        shortlisted: next,
        viewed: next,
        unread: next,
        male: next,
        female: next,
      });
      return;
    }
    setFilters((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const allSelected = next.shortlisted && next.viewed && next.unread && next.male && next.female;
      return { ...next, all: allSelected };
    });
  };

  const filteredRows = rows.filter((row) => {
    const classKey = row.classLevel !== undefined && row.classLevel !== null ? String(row.classLevel) : "";
    const statusKey = (row.status || "").toLowerCase();
    const genderKey = (row.gender || "").toLowerCase();

    const classSelected = selectedClass === "all" || classKey === selectedClass;

    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      term.length === 0 ||
      (row.name || "").toLowerCase().includes(term) ||
      classKey.toLowerCase().includes(term) ||
      (String(row.id || "")).toLowerCase().includes(term);

    const statusSelected =
      (filters.shortlisted && statusKey.includes("short")) ||
      (filters.viewed && statusKey.includes("view")) ||
      (filters.unread && statusKey.includes("unread")) ||
      (!["shortlisted", "viewed", "unread"].some((s) => statusKey.includes(s)));

    const genderSelected =
      (filters.male && (genderKey === "m" || genderKey === "male")) ||
      (filters.female && (genderKey === "f" || genderKey === "female")) ||
      (genderKey !== "m" && genderKey !== "f" && genderKey !== "male" && genderKey !== "female");

    return matchesSearch && classSelected && statusSelected && genderSelected;
  });

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
        <div className="mr-auto text-[14px] font-semibold text-slate-600">
          {rows.length} applications
        </div>

        {/* Class select */}
        <select
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] font-medium text-slate-700 outline-none transition focus:border-[#18B0D8] focus:ring-2 focus:ring-[#18B0D8]/25"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="all">For all class</option>
          {classOptions.map((cls) => (
            <option key={cls} value={cls}>{`Class ${cls}`}</option>
          ))}
        </select>

        {/* Search input */}
        <div className="relative">
          <input
            className="h-10 w-[320px] rounded-lg border border-slate-200 bg-white px-3 pr-10 text-[14px] text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-[#18B0D8] focus:ring-2 focus:ring-[#18B0D8]/25"
            placeholder="Search by Name, class, application number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              title="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <CloseIcon />
            </button>
          ) : null}
        </div>

        {/* Search button */}
        <button
          type="button"
          title="Search"
          className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
        >
          <SearchIcon />
        </button>

        {/* Filter */}
        {showFilter ? (
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              title="Filter"
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
            >
              <FilterIcon />
            </button>

            {filterOpen ? (
              <div className="absolute right-0 top-12 z-20 w-[240px] rounded-xl bg-white p-3 shadow-xl ring-1 ring-slate-200">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-slate-50">
                  <input type="checkbox" checked={filters.all} onChange={() => toggleFilter("all")} />
                  <span className="text-[14px] font-medium text-slate-700">Select all</span>
                </label>

                <div className="my-2 h-px bg-slate-200" />

                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={filters.shortlisted}
                    onChange={() => toggleFilter("shortlisted")}
                  />
                  <span className="text-[14px] text-slate-700">Short listed</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-slate-50">
                  <input type="checkbox" checked={filters.viewed} onChange={() => toggleFilter("viewed")} />
                  <span className="text-[14px] text-slate-700">Viewed</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-slate-50">
                  <input type="checkbox" checked={filters.unread} onChange={() => toggleFilter("unread")} />
                  <span className="text-[14px] text-slate-700">Unread</span>
                </label>

                <div className="my-2 h-px bg-slate-200" />

                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-slate-50">
                  <input type="checkbox" checked={filters.male} onChange={() => toggleFilter("male")} />
                  <span className="text-[14px] text-slate-700">Male applicant</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-slate-50">
                  <input type="checkbox" checked={filters.female} onChange={() => toggleFilter("female")} />
                  <span className="text-[14px] text-slate-700">Female applicant</span>
                </label>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-left">
              {["No.", "Student's name", "Gender", "Class", "Applied date", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-[13px] font-semibold text-slate-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((row) => {
              const current = rowStatus.find((item) => item.id === row.id) || { value: row.status || "Unread" };
              const displayStatus = current.value || row.status || "Unread";

              const tone = statusTone(displayStatus);
              const pill = statusPillClass(tone);

              return (
                <tr
                  key={row.id}
                  className={[
                    "border-t border-slate-200/70",
                    "hover:bg-slate-50/60",
                    row.id === highlightId ? "bg-[#EAF6FB]" : "",
                  ].join(" ")}
                >
                  <td className="px-4 py-3 text-[14px] text-slate-700">{row.id}</td>

                  <td className="px-4 py-3 text-[14px] font-bold">
                    <Link
                      to={`/admission/application/${row.id}`}
                      state={{ from: fromPath }}
                      className="text-[#204098] hover:text-[#18B0D8]"
                    >
                      {row.name}
                    </Link>
                  </td>

                  <td className="px-4 py-3 text-[14px] text-slate-700">{row.gender}</td>
                  <td className="px-4 py-3 text-[14px] text-slate-700">{row.classLevel}</td>
                  <td className="px-4 py-3 text-[14px] text-slate-700">{row.applied}</td>

                  <td className="px-4 py-3">
                    {readOnlyStatus ? (
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-[13px] font-semibold ${pill}`}>
                        {displayStatus}
                      </span>
                    ) : (
                      <select
                        className={[
                          "h-9 min-w-[160px] rounded-full bg-white px-3 text-[13px] font-semibold outline-none",
                          pill,
                          "focus:ring-2 focus:ring-[#18B0D8]/25",
                        ].join(" ")}
                        value={current.value || "Unread"}
                        onChange={(e) => updateStatus(row.id, e.target.value)}
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredRows.length === 0 ? (
          <div className="px-4 py-10 text-center text-[14px] font-medium text-slate-500">
            No applications found.
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RequestsTable;
