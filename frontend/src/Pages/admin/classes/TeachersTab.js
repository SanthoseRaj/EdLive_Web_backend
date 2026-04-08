import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TeachersTab = ({ selectedClass, selectedDivisions, activeTab  }) => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDivisionsForTeacher, setSelectedDivisionsForTeacher] = useState([]);
  const [selectedTeacherDetails, setSelectedTeacherDetails] = useState(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherTimetable, setTeacherTimetable] = useState([]);
  const [classData, setClassData] = useState([]);
  const [periodsData, setPeriodsData] = useState([]);  
    const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDivisions.length > 0) {
      fetchTeachers();
    }
  }, [selectedClass, selectedDivisions]);

  useEffect(() => {
    if (showAddTeacher) {
      fetchAvailableTeachers();
    }
  }, [showAddTeacher]);

  const fetchMasterData = async () => {
    try {
      const classesResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/master/classes`,
        { withCredentials: true }
      );
      setClassData(classesResponse.data || []);

      const subjectsResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/master/subjects`,
        { withCredentials: true }
      );
      setSubjects(subjectsResponse.data || []);

      const periodsResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/master/periods`,
        { withCredentials: true }
      );
      setPeriodsData(periodsResponse.data || []);
    } catch (err) {
      console.error("Failed to fetch master data:", err);
    }
  };

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const classIds = await getClassIds();
      if (classIds.length === 0) {
        setTeachers([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/staff/teachers/class`,
        {
          params: {
            class_ids: classIds.join(","),
          },
          withCredentials: true,
        }
      );
      setTeachers(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
      setError("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTeachers = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/staff/Staff`,
        { withCredentials: true }
      );
      setAvailableTeachers(response.data || []);
    } catch (err) {
      console.error("Failed to fetch available teachers:", err);
    }
  };

  const fetchTeacherTimetable = async (staffId) => {
    try {
      const academicYear = localStorage.getItem("academicYear") || "2024-2025";
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/staff/Staff/${staffId}/timetable/${academicYear}`,
        { withCredentials: true }
      );
      // if needed process response.data here
    } catch (err) {
      console.error("Failed to fetch teacher timetable:", err);
      setTeacherTimetable([]);
    }
  };

  const processTimetableData = async (timetableData) => {
    if (!timetableData || timetableData.length === 0) return [];

    // Create lookup maps with defensiveness (id vs class_id)
    const classMap = new Map();
    classData.forEach(cls => {
      // support both shapes: { id, class_name } or { class_id, class_name }
      const id = cls.id ?? cls.class_id;
      classMap.set(id, cls.class_name || `${cls.class} ${cls.section || ""}`.trim());
    });

    const subjectMap = new Map();
    subjects.forEach(subject => {
      const sid = subject.subject_id ?? subject.id ?? subject.id;
      subjectMap.set(sid, subject.subject_name || subject.name);
    });

    const periodMap = new Map();
    periodsData.forEach(period => {
      const pid = period.periodid ?? period.id;
      periodMap.set(pid, {
        start_time: period.timein,
        end_time: period.timeout
      });
    });

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const entries = [];

    timetableData.forEach(item => {
      const classSection = classMap.get(item.class_name) || classMap.get(item.class_id) || `Class ${item.class_name || item.class_id || ''}`;
      const subjectName = subjectMap.get(item.subject) || subjectMap.get(item.subject_id) || `Subject ${item.subject || item.subject_id || ''}`;

      days.forEach(day => {
        if (item[day]) {
          const periodInfo = periodMap.get(item[day]);
          entries.push({
            day: day.charAt(0).toUpperCase() + day.slice(1),
            period_number: item[day],
            period_time: periodInfo ? `${periodInfo.start_time} - ${periodInfo.end_time}` : "",
            start_time: periodInfo?.start_time || "",
            end_time: periodInfo?.end_time || "",
            class_section: classSection,
            subject_name: subjectName
          });
        }
      });
    });

    return entries;
  };

  const getClassIds = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/master/classes`,
        { withCredentials: true }
      );
      const classes = response.data || [];
      return classes
        .filter(
          (item) =>
            (item.class === selectedClass || item.class_name === selectedClass) &&
            selectedDivisions.includes(item.section)
        )
        .map((item) => item.id ?? item.class_id)
        .filter(Boolean);
    } catch (err) {
      console.error("Failed to fetch class IDs:", err);
      return [];
    }
  };

  const handleAddTeacher = async () => {
    if (!selectedTeacher || !selectedSubject || selectedDivisionsForTeacher.length === 0) {
      alert("Please select teacher, subject, and at least one division");
      return;
    }

    try {
      const classIds = await getClassIds();
      const filteredClassIds = classIds.filter(id =>
        selectedDivisionsForTeacher.includes(id.toString()) || selectedDivisionsForTeacher.includes(id)
      );

      await Promise.all(
        filteredClassIds.map(async (classId) => {
          await axios.post(
            `${process.env.REACT_APP_API_URL}/api/staff/teachers/assign`,
            {
              staff_id: selectedTeacher,
              class_id: classId,
              subject_id: selectedSubject,
            },
            { withCredentials: true }
          );
        })
      );

      await fetchTeachers();
      setSelectedTeacher("");
      setSelectedSubject("");
      setSelectedDivisionsForTeacher([]);
      setShowAddTeacher(false);
      alert("Teacher assigned successfully!");
    } catch (err) {
      console.error("Failed to assign teacher:", err);
      alert("Failed to assign teacher");
    }
  };

  const handleRemoveTeacher = async (assignmentId) => {
    if (!confirm("Are you sure you want to remove this teacher?")) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/staff/teachers/assign/${assignmentId}`,
        { withCredentials: true }
      );
      await fetchTeachers();
      alert("Teacher removed successfully!");
    } catch (err) {
      console.error("Failed to remove teacher:", err);
      alert("Failed to remove teacher");
    }
  };

  const toggleDivisionForTeacher = (division) => {
    setSelectedDivisionsForTeacher(prev =>
      prev.includes(division) ? prev.filter(d => d !== division) : [...prev, division]
    );
  };

  const handleTeacherCardClick = async (teacher) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/staff/Staff/${teacher.staff_id}`,
        { withCredentials: true }
      );
      setSelectedTeacherDetails(response.data);
      await fetchTeacherTimetable(teacher.staff_id);

      // process classResponsibilities if present
      const processedTimetable = await processTimetableData(response.data.classResponsibilities || []);
      setTeacherTimetable(processedTimetable);
      setShowTeacherModal(true);
    } catch (err) {
      console.error("Failed to fetch teacher details:", err);
      alert("Failed to load teacher details");
    }
  };

  const getClassDisplay = (classId) => {
    if (!classId) return "---";
    const classe = classData.find((c) => (c.class_id ?? c.id) === classId || c.id === classId);
    return classe ? `${classe.class_name ?? `${classe.class} ${classe.section || ""}`.trim()}` : "---";
  };

  const formatTimetableData = () => {
    const groupedData = {};
    teacherTimetable.forEach(item => {
      const key = `${item.class_section}-${item.subject_name}`;
      if (!groupedData[key]) groupedData[key] = { class_section: item.class_section, subject_name: item.subject_name, days: {} };
      if (!groupedData[key].days[item.day]) groupedData[key].days[item.day] = [];
      groupedData[key].days[item.day].push({ period: item.period_number, time: item.start_time });
    });

    return Object.values(groupedData).map(item => ({
      class_section: item.class_section,
      subject_name: item.subject_name,
      monday: formatDayPeriods(item.days.Monday),
      tuesday: formatDayPeriods(item.days.Tuesday),
      wednesday: formatDayPeriods(item.days.Wednesday),
      thursday: formatDayPeriods(item.days.Thursday),
      friday: formatDayPeriods(item.days.Friday),
      saturday: formatDayPeriods(item.days.Saturday)
    }));
  };

  const formatDayPeriods = (periods) => {
    if (!periods || periods.length === 0) return "---";
    return periods.sort((a, b) => a.period - b.period).map(p => p.time).join(', ');
  };

  const handleImageError = (e) => {
    e.target.src = './profile-picture.jpg';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  const formattedTimetable = formatTimetableData();

  return (
    <div className="space-y-6">
       {/* ---------- SEARCH BAR + NAV ARROWS ---------- */}
    <div className="flex items-center justify-between mb-4 px-1">
      
      
      {/* SEARCH BAR */}
      <div className="flex-1 mx-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Type Teacher name, ID Number OR mobile number"
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">
          Teachers for {selectedClass} {selectedDivisions.length > 0 && `(${selectedDivisions.join(", ")})`}
        </h3>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Add Teacher Card - Always First */}
         <div 
          className="border-2 border-dashed border-gray-300 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center "
          onClick={() => setShowAddTeacher(!showAddTeacher)}
        >
          <div className="text-center">
            <button className="flex flex-col items-center text-[#00a9ec] hover:text-[#0090c7] focus:outline-none mx-auto">
              <div className="border border-[#00a9ec] rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <span className="mt-1 text-sm font-medium">Add Teacher</span>
            </button>
                      
            {/* <p className="text-sm text-gray-500 mt-1">Assign new teacher to class</p> */}
          </div>
        </div>

        {/* Teacher Cards */}
        {teachers.length === 0 ? (
          <div className="col-span-3 flex items-center justify-center py-8 text-gray-500">
            No teachers assigned to this class yet.
          </div>
        ) : (
          teachers.map((teacher) => (
            <div 
              key={teacher.assignment_id || teacher.staff_id} 
              className="border rounded-lg bg-white shadow-sm hover:shadow-md p-2 transition-shadow duration-200 cursor-pointer"
              onClick={() => handleTeacherCardClick(teacher)}
            >
              <div className="flex flex-col h-full">
                {/* Teacher Profile Image and Basic Info - Horizontal Layout */}
                <div className="flex items-start space-x-3 mb-3">
                  {/* Image on the left - Larger size */}
                  <div className="avatar flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center overflow-hidden">
                      {teacher.profile_image ? (
                        <img
                          src={`${process.env.REACT_APP_API_URL}${teacher.profile_image}`}
                          alt={teacher.full_name}
                          className="w-full h-full rounded-xl object-cover"
                          onError={handleImageError}
                        />
                      ) : (
                        <img
                          src="./profile-picture.jpg"
                          alt="No image"
                          className="w-full h-full rounded-xl object-cover"
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Content on the right */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base text-gray-800 mb-1">{teacher.full_name}</h4>
                    
                    {/* Subject */}
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        {teacher.subject_name}
                      </p>
                    </div>
                    
                    {/* Divisions */}
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                         {teacher.section}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Click hint */}
                {/* <div className="mt-auto pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 text-center">Click for details</p>
                </div> */}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Teacher Details Modal */}
      {/* Teacher Details Modal */}
{showTeacherModal && selectedTeacherDetails && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative animate-fadeIn">
      
      {/* Close button */}
      <button
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition"
        onClick={() => setShowTeacherModal(false)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b">
        <h2 className="text-2xl font-semibold text-[#6C2CA4]">Teacher Details</h2>
      </div>

      {/* Body */}
      <div className="px-8 py-6 space-y-8">

        {/* Teacher Info */}
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
              <img
                src={
                  selectedTeacherDetails.profile_image
                    ? `${process.env.REACT_APP_API_URL}${selectedTeacherDetails.profile_image}`
                    : "./profile-picture.jpg"
                }
                onError={(e) => (e.target.src = "./profile-picture.jpg")}
                alt={selectedTeacherDetails.full_name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-1">
              {selectedTeacherDetails.full_name}
            </h3>
            <p className="text-gray-600 text-sm mb-1">
              <span className="font-medium">Mob.</span>{" "}
              {selectedTeacherDetails.phone || "Not provided"}
            </p>
            <p className="text-gray-600 text-sm mb-3">
              <span className="font-medium">E-mail:</span>{" "}
              {selectedTeacherDetails.email || "Not provided"}
            </p>
            <p className="text-gray-700 font-medium">
              Assigned teaching Hours this week:{" "}
              <span className="text-gray-900">
                {selectedTeacherDetails.assigned_hours || "23 hrs 30 min"}
              </span>
            </p>
          </div>
        </div>

        {/* Class Responsibilities */}
        <div>
          <h4 className="text-lg font-semibold text-[#6C2CA4] mb-4">
            Class responsibilities
          </h4>

          {/* Table */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-3 py-2 border-r font-semibold">Class</th>
                  <th className="text-left px-3 py-2 border-r font-semibold">Subject</th>
                  <th className="text-left px-3 py-2 border-r font-semibold">Mon.</th>
                  <th className="text-left px-3 py-2 border-r font-semibold">Tue.</th>
                  <th className="text-left px-3 py-2 border-r font-semibold">Wed.</th>
                  <th className="text-left px-3 py-2 border-r font-semibold">Thu.</th>
                  <th className="text-left px-3 py-2 border-r font-semibold">Fri.</th>
                  <th className="text-left px-3 py-2 font-semibold">Sat.</th>
                </tr>
              </thead>
              <tbody>
  {formattedTimetable.length > 0 ? (
    formattedTimetable.map((t, i) => {
      const isClassTeacher =
        getClassDisplay(selectedTeacherDetails.class_id) &&
        t.class_section === getClassDisplay(selectedTeacherDetails.class_id);

      return (
        <tr key={`${t.class_section}-${t.subject_name}-${i}`} className="hover:bg-gray-50">
          <td className="border-t px-3 py-2 font-medium text-gray-800 flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isClassTeacher ? "bg-[#1890FF]" : ""
              }`}
            ></div>
            <span>{t.class_section}</span>
          </td>
          <td className="border-t px-3 py-2 text-gray-700">{t.subject_name}</td>
          <td className="border-t px-3 py-2">{t.monday}</td>
          <td className="border-t px-3 py-2">{t.tuesday}</td>
          <td className="border-t px-3 py-2">{t.wednesday}</td>
          <td className="border-t px-3 py-2">{t.thursday}</td>
          <td className="border-t px-3 py-2">{t.friday}</td>
          <td className="border-t px-3 py-2">{t.saturday}</td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="8" className="text-center py-4 text-gray-500 border-t">
        No timetable assigned
      </td>
    </tr>
  )}
</tbody>

            </table>
          </div>

          {/* Class teacher info */}
          {selectedTeacherDetails.class_id && (
            <div className="mt-4 flex items-center space-x-2 text-sm text-[#1890FF] font-medium">
              <div className="w-2 h-2 bg-[#1890FF] rounded-full"></div>
              <span>
                Class teacher for{" "}
                {getClassDisplay(selectedTeacherDetails.class_id)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t flex justify-between items-center">
        <button
          onClick={() => setShowTeacherModal(false)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
        >
          Close
        </button>
        <button
          className="text-[#1890FF] text-sm hover:underline"
          onClick={() =>
            navigate(`/staffview/${selectedTeacherDetails.id}`, {
              state: {
                prev: {
                  selectedClass: selectedClass ?? null,
                  selectedDivisions: selectedDivisions ?? [],
                  activeTab: activeTab ?? "Teachers",
                },
              },
            })
          }
        >
          More details &gt;
        </button>
      </div>
    </div>
  </div>
)}


      {/* Add Teacher Modal/Form */}
      {showAddTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-lg">Add Teacher to Selected Classes</h4>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowAddTeacher(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Teacher Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Teacher</label>
                <select
                  className="select select-bordered w-full"
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                >
                  <option value="">Choose a teacher</option>
                  {availableTeachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name} ({teacher.position})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Subject</label>
                <select
                  className="select select-bordered w-full"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">Choose a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.subject_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Division Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Divisions</label>
                <div className="flex flex-wrap gap-2">
                  {selectedDivisions.map((division, index) => (
                    <label key={`div-${division}`} className="flex items-center space-x-2 bg-white px-3 py-2 rounded border">
                      <input
                        type="checkbox"
                        checked={selectedDivisionsForTeacher.includes(division)}
                        onChange={() => toggleDivisionForTeacher(division)}
                        className="checkbox checkbox-primary checkbox-sm"
                      />
                      <span>{division}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  className="btn btn-ghost flex-1"
                  onClick={() => setShowAddTeacher(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary flex-1"
                  onClick={handleAddTeacher}
                  disabled={!selectedTeacher || !selectedSubject || selectedDivisionsForTeacher.length === 0}
                >
                  Assign Teacher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersTab;