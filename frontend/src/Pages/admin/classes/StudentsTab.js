import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const StudentsTab = ({ selectedClass, selectedDivisions }) => {
  const [divisionData, setDivisionData] = useState({});  
    const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
const scrollRef = React.useRef(null);

const scrollLeft = () => {
  if (scrollRef.current) scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
};

const scrollRight = () => {
  if (scrollRef.current) scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
};

  useEffect(() => {
    if (!selectedClass || selectedDivisions.length === 0) {
      setDivisionData({});
      setLoading(false);
      return;
    }

    const fetchDivisionStudents = async () => {
      try {
        setLoading(true);
        const classRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/master/classes`,
          { withCredentials: true }
        );

        const classData = classRes.data.filter(
          (c) =>
            c.class === selectedClass && selectedDivisions.includes(c.section)
        );

        // Fetch students for each class/division
        const results = await Promise.all(
          classData.map(async (div) => {
            try {
              const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/student/class/${div.id}`,
                { withCredentials: true }
              );
              return {
                division: div.section,
                teacher: div.class_teacher_name || "—",
                students: res.data || [],
              };
            } catch {
              return {
                division: div.section,
                teacher: div.class_teacher_name || "—",
                students: [],
              };
            }
          })
        );

        const formattedData = {};
        results.forEach((r) => {
          formattedData[r.division] = r;
        });

        setDivisionData(formattedData);
      } catch (err) {
        console.error("Failed to load students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDivisionStudents();
  }, [selectedClass, selectedDivisions]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="loading loading-spinner loading-md text-[#6C2CA4]"></span>
      </div>
    );

  return (
    <div className="p-4">
      {/* <div className="flex items-center gap-2 mb-4">
        <h3 className="font-bold text-2xl text-[#6C2CA4]">
          {selectedClass} - Students
        </h3>
      </div> */}
      {/* ---------- SEARCH BAR + NAV ARROWS ---------- */}
    <div className="flex items-center justify-between mb-4 px-1">
      
      
      {/* SEARCH BAR */}
      <div className="flex-1 mx-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Type student name, ID Number OR mobile number"
            className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C2CA4]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 right-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      
    </div>
<div className="relative">
  {/* LEFT ARROW - top aligned */}
<button
  onClick={scrollLeft}
  className="absolute left-[-22px] top-0 z-20 w-8 h-8 rounded-full bg-white border shadow-sm flex items-center justify-center text-gray-600 hover:text-gray-800"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
    fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round"
      strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
</button>

{/* RIGHT ARROW - top aligned */}
<button
  onClick={scrollRight}
  className="absolute right-[-22px] top-0 z-20 w-8 h-8 rounded-full bg-white border shadow-sm flex items-center justify-center text-gray-600 hover:text-gray-800"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
    fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round"
      strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
</button>
      <div className="flex overflow-hidden gap-4 px-4" ref={scrollRef}>
        {selectedDivisions.map((division) => {
          const divInfo = divisionData[division];

          return (
            <div
              key={division}
              className="min-w-[250px] bg-white border border-gray-300 rounded-md p-3 shadow-sm flex-shrink-0"
            >
              <div className="border-b border-gray-200 pb-2 mb-2">
                <h4 className="font-semibold text-[#6C2CA4]">
                  Division {division}{" "}
                  {divInfo?.students?.length
                    ? `${divInfo.students.length} students`
                    : ""}
                </h4>
                <p className="text-sm text-gray-600">
                  C.T:{" "}
                  <span className="text-[#0077cc] font-medium">
                    {divInfo?.teacher || "Not Assigned"}
                  </span>
                </p>
              </div>

              <div className="h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {divInfo?.students?.length > 0 ? (
                  divInfo.students.map((s, idx) => (
                    <div
                      key={s.id}
                      className={`flex items-center gap-2 py-1 px-2 text-sm rounded ${
                        idx % 2 === 0 ? "bg-gray-50" : ""
                      } hover:bg-[#E8F3FF]`}
                    >
                      <span className="text-gray-600 w-6">{idx + 1}.</span>
                      <span
                        className="flex-1 truncate text-gray-800 cursor-pointer hover:text-blue-600"
                        onClick={() =>
  navigate(`/studentview/${s.id}`, {
    state: {
      prev: {
        selectedClass: selectedClass ?? null,
        selectedDivisions: selectedDivisions ?? [],
        activeTab: "Students",
      },
    },
  })
}
                      >
                        {s.full_name}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-center py-8 text-sm">
                    Nothing to show
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
        </div>
    </div>
  );
};

export default StudentsTab;
