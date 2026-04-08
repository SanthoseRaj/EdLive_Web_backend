import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Performance = () => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "";

  // --- State: View & Date ---
  const [view, setView] = useState("monthly");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0]
  });

  // --- State: Class & Division Data ---
  const [masterClasses, setMasterClasses] = useState([]);
  const [uniqueClasses, setUniqueClasses] = useState([]);
  const [sectionMap, setSectionMap] = useState({});
  
  // --- State: Selection ---
  const [selectedClass, setSelectedClass] = useState(""); 
  const [selectedSections, setSelectedSections] = useState([]);
  const [isDivisionDropdownOpen, setIsDivisionDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // --- State: Stats & UI ---
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [stats, setStats] = useState({
    exam: { average: 0, total: 0 },
    attendance: { percentage: 0, total_sessions: 0 },
    activities: { count: 0, percentage: 0 }
  });

  // --- 1. Fetch Class Master Data ---
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/master/classes`, { 
          withCredentials: true 
        });
        const data = response.data;

        setMasterClasses(data);

        // Extract Unique Classes
        const uClasses = [...new Set(data.map(item => item.class))].sort((a, b) => a - b);
        setUniqueClasses(uClasses);

        // Map Classes to Sections
        const sMap = {};
        data.forEach(item => {
          if (!sMap[item.class]) {
            sMap[item.class] = [];
          }
          sMap[item.class].push({ section: item.section, id: item.id || item.class_id });
        });
        setSectionMap(sMap);

        if (uClasses.length > 0) {
            setSelectedClass(uClasses[0]);
        }

      } catch (error) {
        console.error("Failed to fetch class master data", error);
        setErrorMsg("Failed to load class data.");
      }
    };

    fetchMasterData();
  }, [API_URL]);

  // --- 2. Handle Click Outside Dropdown ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDivisionDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Helpers ---
  const getDateParams = () => {
    let startDate, endDate;
    if (view === "monthly") {
      const y = currentDate.getFullYear();
      const m = currentDate.getMonth();
      startDate = new Date(y, m, 1).toISOString().split("T")[0];
      endDate = new Date(y, m + 1, 0).toISOString().split("T")[0];
    } else if (view === "yearly") {
      startDate = `${currentYear}-01-01`;
      endDate = `${currentYear}-12-31`;
    } else {
      startDate = dateRange.from;
      endDate = dateRange.to;
    }
    return { startDate, endDate };
  };

  const getDisplayDate = () => {
    if (view === "monthly") return currentDate.toLocaleString("default", { month: "short", year: "numeric" });
    if (view === "yearly") return currentYear.toString();
    return "";
  };

  const handlePrev = () => {
    if (view === "monthly") setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    else if (view === "yearly") setCurrentYear((prev) => prev - 1);
  };

  const handleNext = () => {
    if (view === "monthly") setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    else if (view === "yearly") setCurrentYear((prev) => prev + 1);
  };

  const toggleSection = (sectionObj) => {
    const exists = selectedSections.find(s => s.id === sectionObj.id);
    if (exists) {
      setSelectedSections(selectedSections.filter(s => s.id !== sectionObj.id));
    } else {
      setSelectedSections([...selectedSections, sectionObj]);
    }
  };

  const isAllSelected = () => {
    if (!selectedClass || !sectionMap[selectedClass]) return false;
    return selectedSections.length === sectionMap[selectedClass].length;
  };

  const toggleAllSections = () => {
    if (isAllSelected()) {
      setSelectedSections([]);
    } else {
      setSelectedSections(sectionMap[selectedClass]);
    }
  };

  // --- 3. API Fetching for Stats ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { startDate, endDate } = getDateParams();
      const params = { startDate, endDate };

      if (selectedClass) {
        if (selectedSections.length === 0 || isAllSelected()) {
           params.className = selectedClass;
        } else {
           params.classId = selectedSections.map(s => s.id).join(','); 
        }
      }

      console.log("Fetching Stats with params:", params);

      try {
        const results = await Promise.allSettled([
          axios.get(`${API_URL}/api/exams/stats/admin`, { 
            params, 
            withCredentials: true 
          }),
          axios.get(`${API_URL}/api/attendance/stats/admin`, { 
            params, 
            withCredentials: true 
          }),
          axios.get(`${API_URL}/api/co-curricular/stats/admin`, { 
            params, 
            withCredentials: true 
          })
        ]);

        const [examRes, attRes, actRes] = results;

        // --- EXAM DATA HANDLING ---
        let newExamStats = { average: 0, total: 0 };
        if (examRes.status === 'fulfilled') {
            const data = examRes.value.data;
            const statsData = data.data || data; 
            newExamStats = {
                average: Number(statsData.average_percentage || 0).toFixed(0),
                total: statsData.total_exams_evaluated || 0
            };
        } else {
            console.error("Exam API Failed:", examRes.reason);
        }

        // --- ATTENDANCE DATA HANDLING ---
        let newAttStats = { percentage: 0, total_sessions: 0 };
        if (attRes.status === 'fulfilled') {
            const data = attRes.value.data;
            newAttStats = {
                percentage: Number(data.percentage || 0).toFixed(0),
                total_sessions: data.total_sessions || 0
            };
        } else {
             console.error("Attendance API Failed:", attRes.reason);
        }

        // --- CO-CURRICULAR DATA HANDLING ---
        let newActStats = { count: 0, percentage: 0 };
        if (actRes.status === 'fulfilled') {
            const data = actRes.value.data;
            newActStats = {
                count: data.participating_count || 0,
                percentage: Number(data.participation_percentage || 0).toFixed(0)
            };
        } else {
             console.error("Activity API Failed:", actRes.reason);
        }

        setStats({
          exam: newExamStats,
          attendance: newAttStats,
          activities: newActStats
        });

      } catch (error) {
        console.error("Unexpected error in dashboard:", error);
        setErrorMsg("Error fetching data. Check connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [view, currentDate, currentYear, dateRange, selectedClass, selectedSections, API_URL]);


  return (
    <div className="min-h-screen bg-[#FCDBB1] p-6 font-sans">
      
      {/* --- ERROR MESSAGE BANNER --- */}
      {errorMsg && (
        <div className="mb-4 rounded-md bg-red-100 p-4 text-red-700 border border-red-300 flex justify-between items-center">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-[#1f3c88] hover:underline"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          Back
        </button>
        
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#2f3e9e] text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          </div>
          <h1 className="text-2xl font-bold text-[#2f3e9e]">Performance</h1>
        </div>
      </div>

      {/* --- MAIN CARD --- */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        
        {/* --- CONTROLS ROW --- */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          
          {/* View Selectors */}
          <div className="flex flex-wrap gap-6">
            {[
              { id: "monthly", label: "Monthly view" },
              { id: "yearly", label: "Yearly View" },
              { id: "period", label: "Specific time period" }
            ].map((opt) => (
              <label key={opt.id} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 select-none">
                <input
                  type="radio"
                  name="view"
                  className="accent-[#2f3e9e]"
                  checked={view === opt.id}
                  onChange={() => setView(opt.id)}
                />
                {opt.label}
              </label>
            ))}
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-4">
            
            {view === "period" ? (
              // Specific Date Range
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">From</span>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={dateRange.from}
                      onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                      className="rounded border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-[#2f3e9e]" 
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">to</span>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={dateRange.to}
                      onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                      className="rounded border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-[#2f3e9e]" 
                    />
                  </div>
                </div>
              </>
            ) : (
              // Month/Year Navigation
              <div className="flex items-center gap-3 rounded-full bg-gray-50 px-2 py-1 select-none">
                <button 
                  onClick={handlePrev}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1f3c88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                
                <span className="min-w-[100px] text-center font-bold text-[#1f3c88]">
                  {getDisplayDate()}
                </span>
                
                <button 
                  onClick={handleNext}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                >
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1f3c88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- OVERVIEW CARDS --- */}
        <div className="mb-2 text-sm font-medium text-gray-500">Overview of school performance</div>
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          
          {/* Card 1: Exams */}
          <div className="rounded-lg bg-[#b7d88a] p-6 text-center shadow-sm">
            <h3 className="mb-1 text-xs text-gray-700">Exams</h3>
            <div className="my-2 text-4xl font-bold text-[#1f3c88]">
              {loading ? "..." : `${stats.exam.average}%`}
            </div>
            <p className="text-xs text-gray-700">Success</p>
          </div>

          {/* Card 2: Attendance */}
          <div className="rounded-lg bg-[#b7d88a] p-6 text-center shadow-sm">
            <h3 className="mb-1 text-xs text-gray-700">Average Attendance</h3>
            <div className="my-2 text-4xl font-bold text-[#1f3c88]">
              {loading ? "..." : `${stats.attendance.percentage}%`}
            </div>
            <p className="text-xs text-gray-700">a day</p>
          </div>

          {/* Card 3: Co-curricular */}
          <div className="rounded-lg bg-[#efc07a] p-6 text-center shadow-sm">
            <h3 className="mb-1 text-xs text-gray-700">Co-curricular activities</h3>
            <div className="my-2 text-4xl font-bold text-[#1f3c88]">
               {loading ? "..." : `${stats.activities.percentage}%`}
            </div>
            <p className="text-xs text-gray-700">Participation</p>
          </div>
        </div>

        {/* --- CLASS FILTERS --- */}
        <div className="mb-2 text-lg font-medium text-[#1f3c88]">Classwise Performance</div>
        <div className="mb-6 flex flex-wrap gap-8">
          
          {/* Class Select */}
          <div>
            <label className="mb-1 block text-xs text-gray-500">Select a class</label>
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSections([]); 
                }}
                className="w-[100px] appearance-none rounded border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-[#1f3c88]"
              >
                 {uniqueClasses.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>

          {/* Multi-Select Division */}
          <div className="relative" ref={dropdownRef}>
            <label className="mb-1 block text-xs text-gray-500">
                Divisions {selectedClass && `(${sectionMap[selectedClass]?.length || 0})`}
            </label>
            
            {/* Trigger Box */}
            <div 
                onClick={() => !(!selectedClass) && setIsDivisionDropdownOpen(!isDivisionDropdownOpen)}
                className={`min-h-[34px] min-w-[150px] cursor-pointer rounded border bg-white px-2 py-1 text-sm transition-colors ${
                    !selectedClass ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'border-gray-300 hover:border-[#1f3c88]'
                }`}
            >
                <div className="flex flex-wrap items-center gap-1.5">
                    {(selectedSections.length === 0 && !isAllSelected()) && (
                        <span className="text-gray-400 text-xs py-0.5">All Divisions</span>
                    )}

                    {isAllSelected() && sectionMap[selectedClass]?.length > 0 && (
                         <span className="inline-flex items-center gap-1 rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                            All
                            <div 
                                onClick={(e) => { e.stopPropagation(); setSelectedSections([]); }}
                                className="cursor-pointer hover:text-red-500 ml-1"
                            >×</div>
                        </span>
                    )}

                    {!isAllSelected() && selectedSections.map((sec) => (
                        <span key={sec.id} className="inline-flex items-center gap-1 rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                            {sec.section}
                            <div 
                                onClick={(e) => { e.stopPropagation(); toggleSection(sec); }}
                                className="cursor-pointer hover:text-red-500 ml-1"
                            >×</div>
                        </span>
                    ))}
                </div>
            </div>

            {/* Dropdown Menu */}
            {isDivisionDropdownOpen && selectedClass && (
                <div className="absolute left-0 top-full z-10 mt-1 w-[200px] rounded border border-gray-200 bg-white p-2 shadow-lg">
                    <div 
                        className="flex cursor-pointer items-center gap-2 rounded p-1.5 hover:bg-gray-50"
                        onClick={toggleAllSections}
                    >
                        <input 
                            type="checkbox" 
                            checked={isAllSelected()} 
                            readOnly
                            className="accent-[#1f3c88]"
                        />
                        <span className="text-sm text-gray-700">Select All</span>
                    </div>
                    
                    <div className="my-1 h-[1px] bg-gray-100"></div>

                    {sectionMap[selectedClass]?.map((sec) => (
                        <div 
                            key={sec.id} 
                            className="flex cursor-pointer items-center gap-2 rounded p-1.5 hover:bg-gray-50"
                            onClick={() => toggleSection(sec)}
                        >
                            <input 
                                type="checkbox" 
                                checked={selectedSections.some(s => s.id === sec.id)} 
                                readOnly
                                className="accent-[#1f3c88]"
                            />
                            <span className="text-sm text-gray-700">Section {sec.section}</span>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>

        {/* --- DETAIL PANELS --- */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          
          <div className="border border-gray-200 bg-gray-50">
            <div className="bg-[#b7d88a] px-4 py-3 text-sm text-gray-800">
              Exams <span className="font-bold text-[#1f3c88]">{stats.exam.average}%</span> Success
            </div>
            <div className="h-[250px] overflow-y-auto bg-white p-3">
               <div className="mb-4 text-xs text-gray-500">Term exam Average: <span className="font-bold text-[#1da1f2]">{stats.exam.average}%</span></div>
            </div>
          </div>

          <div className="border border-gray-200 bg-gray-50">
            <div className="bg-[#b7d88a] px-4 py-3 text-sm text-gray-800">
              Avg. Attendance <span className="font-bold text-[#1f3c88]">{stats.attendance.percentage}%</span> a day
            </div>
            <div className="h-[250px] overflow-y-auto bg-white p-3">
               <div className="mb-4 text-xs text-gray-500">Total Sessions: {stats.attendance.total_sessions}</div>
            </div>
          </div>

          <div className="border border-gray-200 bg-gray-50">
            <div className="bg-[#b7d88a] px-4 py-3 text-sm text-gray-800">
              Co curricular <span className="font-bold text-[#1f3c88]">{stats.activities.percentage}%</span> Participation
            </div>
            <div className="h-[250px] overflow-y-auto bg-white p-3">
               <div className="mb-4 text-xs text-gray-500">Active Students: {stats.activities.count}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Performance;