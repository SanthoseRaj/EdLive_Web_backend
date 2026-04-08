import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import StaffTimetable from "./timetable/StaffTimetable.js";

// Define the API URL
const API_URL = process.env.REACT_APP_API_URL || "";

const SubjectsTeachers = () => {
  const navigate = useNavigate();
  
  // ================== DATA STATE ==================
  const [subjects, setSubjects] = useState([]); 
  const [allocations, setAllocations] = useState([]); 
  const [loading, setLoading] = useState(false);

  // Master Data
  const [periods, setPeriods] = useState([]);
  const [classes, setClasses] = useState([]);
  const [staffList, setStaffList] = useState([]);

  // ================== UI STATE ==================
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [activeSubjectName, setActiveSubjectName] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal States
  const [selectedTeacherForEdit, setSelectedTeacherForEdit] = useState(null);
  const [showViewEditModal, setShowViewEditModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  
  

  // ================== EFFECTS ==================

  // 1. Fetch Master Data
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [subRes, periodRes, classRes, staffRes] = await Promise.all([
          axios.get(`${API_URL}/api/master/subjects`, { withCredentials: true }),
          axios.get(`${API_URL}/api/master/periods`, { withCredentials: true }),
          axios.get(`${API_URL}/api/master/classes`, { withCredentials: true }),
          axios.get(`${API_URL}/api/master/staff`, { withCredentials: true })
        ]);
        
        setSubjects(subRes.data);
        setPeriods(periodRes.data);
        setClasses(classRes.data);
        setStaffList(staffRes.data);

        if (subRes.data.length > 0) {
          const firstSub = subRes.data[0];
          setActiveSubjectId(firstSub.subject_id);
          setActiveSubjectName(firstSub.subject_name);
        }
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };
    fetchMasters();
  }, []);

  // 2. Fetch Allocations
  const fetchAllocations = async () => {
      if (!activeSubjectId) return;
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/master/allocations?subject_id=${activeSubjectId}`, { 
          withCredentials: true 
        });
        setAllocations(response.data);
      } catch (error) {
        console.error("Error fetching allocations:", error);
        setAllocations([]);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchAllocations();
  }, [activeSubjectId]);

  // ================== HANDLERS ==================

  const handleSubjectClick = (sub) => {
    setActiveSubjectId(sub.subject_id);
    setActiveSubjectName(sub.subject_name);
    setShowViewEditModal(false);
  };

  const handleTeacherClick = (teacher) => {
    const staffObj = staffList.find(s => s.full_name === teacher.name);
    if(staffObj) {
        setSelectedTeacherForEdit({ 
            ...teacher, 
            id: staffObj.id 
        });
        setShowViewEditModal(true);
    }
  };

  const handleAddSubject = (createdSubject) => {
  const normalizedSubject = {
    subject_id: createdSubject.subject_id,

    // if API already gives formatted name, use it
    subject_name:
      createdSubject.subject_name.includes("-")
        ? createdSubject.subject_name
        : `${createdSubject.subject_code || createdSubject.subject_name} - ${createdSubject.subject_name}`,

    // ensure subject_code always exists
    subject_code:
      createdSubject.subject_code ||
      createdSubject.subject_name
  };

  setSubjects(prev => [...prev, normalizedSubject]);
  setActiveSubjectId(normalizedSubject.subject_id);
  setActiveSubjectName(normalizedSubject.subject_name);
};


  const handleAddTeacher = async (payloads) => {
      try {
          // payloads is an array of row objects (packed)
          const promises = payloads.map(payload => {
              const apiPayload = {
                  staff_id: payload.staff_id,
                  class_id: payload.class_id,
                  subject_id: activeSubjectId,
                  monday: payload.grid.Monday || null,
                  tuesday: payload.grid.Tuesday || null,
                  wednesday: payload.grid.Wednesday || null,
                  thursday: payload.grid.Thursday || null,
                  friday: payload.grid.Friday || null,
                  saturday: payload.grid.Saturday || null
              };
              return axios.post(`${API_URL}/api/staff/timetable`, apiPayload, { withCredentials: true });
          });

          await Promise.all(promises);
          
          fetchAllocations();
          setShowAddTeacherModal(false);
      } catch (error) {
          console.error("Error creating allocation:", error);
          alert("Failed to add teacher allocation.");
      }
  };

  const handleTimetableUpdateSuccess = () => {
      setShowViewEditModal(false);
      fetchAllocations();
  };

  // ================== DATA PROCESSING ==================
  const teacherList = Object.values(allocations.reduce((acc, item) => {
    const name = item.teacher_name;
    if (!acc[name]) {
      acc[name] = { name, degree: item.degree || "N/A", classSet: new Set() };
    }
    if (item.class) acc[name].classSet.add(item.class);
    return acc;
  }, {})).map(teacher => ({
    name: teacher.name,
    degree: teacher.degree,
    classes: Array.from(teacher.classSet).sort().join(", ")
  }));

  const filteredTeachers = teacherList.filter((teacher) =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#8fb7b2] p-5 min-h-screen font-sans">
      <div className="text-sm cursor-pointer mb-2" onClick={() => navigate(-1)}>&lt; Back</div>
      <div className="text-2xl font-bold text-[#243c96] flex items-center gap-3 mb-4">Subjects & Teachers</div>

      <div className="flex gap-4">
        {/* LEFT PANEL */}
        <div className={`w-[250px] bg-white rounded p-2 transition ${showViewEditModal ? "blur-sm opacity-60 pointer-events-none select-none" : ""}`}>
          <div className="px-3 mb-2 text-lg text-[#243c96]">Subjects</div>
          {editMode && (
             <div className="flex items-center gap-2 px-3 py-2 cursor-pointer group" onClick={() => setShowAddSubjectModal(true)}>
               <div className="w-5 h-5 flex items-center justify-center rounded-full border border-sky-400 text-sky-500 text-xs transition group-hover:bg-sky-500 group-hover:text-white">+</div>
               <span className="text-sky-500 text-xs font-medium">Add new subject</span>
             </div>
          )}
          <div className="max-h-[70vh] overflow-y-auto">
            {subjects.map((sub, i) => (
  <div
    key={sub.subject_id || i}
    onClick={() => handleSubjectClick(sub)}
    className={`px-3 py-2 text-sm cursor-pointer border-b border-gray-200 ${
      activeSubjectId === sub.subject_id
        ? "bg-sky-100 font-semibold"
        : "hover:bg-gray-100"
    }`}
  >
    <div className="font-medium text-gray-800">
      {sub.subject_code}
    </div>
    <div className="text-xs text-gray-500">
      {sub.subject_name}
    </div>
  </div>
))}

          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 bg-white rounded p-3">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="text-2xl text-[#243c96]">Teachers of {activeSubjectName}</div>
              <div className="text-sm text-gray-500 ml-3">{teacherList.length}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-base text-gray-700">Edit</span>
              <div onClick={() => setEditMode(!editMode)} className={`w-9 h-5 flex items-center rounded-full p-1 cursor-pointer transition ${editMode ? "bg-blue-500" : "bg-gray-300"}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${editMode ? "translate-x-4" : ""}`} />
              </div>
            </div>
          </div>

          <div className="relative mb-3">
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full border border-gray-300 p-2 pr-8 text-xs outline-none focus:ring-1 focus:ring-blue-400" placeholder="Type name, degree OR class..." />
          </div>

          {loading ? <div className="p-5 text-gray-500">Loading allocations...</div> : (
            <div className="flex gap-3 flex-wrap">
              {editMode && (
                <div onClick={() => setShowAddTeacherModal(true)} className="w-[130px] h-[80px] bg-gray-50 border border-gray-300 rounded p-2 text-[11px] text-center cursor-pointer hover:bg-gray-100 flex flex-col items-center justify-center gap-1 group transition">
                  <div className="w-6 h-6 flex items-center justify-center rounded-full border border-sky-400 text-sky-500 text-sm transition group-hover:bg-sky-500 group-hover:text-white">+</div>
                  <div className="leading-tight"><span className="text-sky-500 font-medium">Add teacher</span><br /><span className="text-gray-500">From teaching staff list</span></div>
                </div>
              )}
              {filteredTeachers.map((teacher, i) => (
                <div key={i} onClick={() => handleTeacherClick(teacher)} className="w-[120px] h-[70px] bg-gray-100 rounded p-1 text-[11px] text-center cursor-pointer hover:bg-gray-200 transition">
                  <div className="font-medium truncate">{teacher.name}</div>
                  <div className="truncate text-xs text-gray-500">{teacher.degree}</div>
                  <div className="truncate font-semibold text-gray-600">{teacher.classes}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showViewEditModal && selectedTeacherForEdit && (
  <ViewEditTeacherModal 
  teacher={selectedTeacherForEdit}
  activeSubjectId={activeSubjectId}
  activeSubjectName={activeSubjectName}
  periods={periods}
  subjects={subjects}          // ✅ CORRECT
  classes={classes}
  onClose={() => setShowViewEditModal(false)}
  onUpdate={handleTimetableUpdateSuccess}
/>
)}


      {showAddSubjectModal && <AddSubjectModal onClose={() => setShowAddSubjectModal(false)} onAdd={handleAddSubject} />}
      
      {showAddTeacherModal && (
        <AddTeacherModal 
            activeSubjectId={activeSubjectId}
            activeSubjectName={activeSubjectName} 
            allClasses={classes}
            allStaff={staffList}
            allPeriods={periods}
            onClose={() => setShowAddTeacherModal(false)} 
            onAdd={handleAddTeacher} 
        />
      )}
    </div>
  );
};

// ==========================================
// VIEW / EDIT TEACHER MODAL (Aggregate Matrix)
// ==========================================
const ViewEditTeacherModal = ({ 
  teacher,
  activeSubjectId,
  activeSubjectName,
  periods,
  subjects,        // ✅ ADD
  classes,         // ✅ ADD
  onClose,
  onUpdate
}) => {
    // Structure: { class_id: { classDetails, matrix: { Monday: [1, 2], Tuesday: [] }, db_ids: [101, 102] } }
    const [classGrids, setClassGrids] = useState([]); 
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const apiDayKeys = {
        Monday: "monday_period_id", Tuesday: "tuesday_period_id", Wednesday: "wednesday_period_id",
        Thursday: "thursday_period_id", Friday: "friday_period_id", Saturday: "saturday_period_id"
  };
  const [cellError, setCellError] = useState("");

    useEffect(() => {
        const fetchTeacherTimetable = async () => {
            if(!teacher.id) return;
          try {
            const academic_year = localStorage.getItem("academicYear") || "2024-2025";
                const response = await axios.get(`${API_URL}/api/staff/staff/${teacher.id}/timetable/${academic_year}`, { withCredentials: true });
                const rows = response.data;
                
                const subjectRows = rows.filter(
  r => String(r.subject_id) === String(activeSubjectId)
);

const classMap = {};

subjectRows.forEach(row => {
  const cId = row.class_id;

  if (!classMap[cId]) {
    classMap[cId] = {
      class_id: cId,
      className: row.class,
      rows: []   // 👈 IMPORTANT
    };
  }

  classMap[cId].rows.push({
    db_id: row.id,
    matrix: {
      Monday: row.monday,
      Tuesday: row.tuesday,
      Wednesday: row.wednesday,
      Thursday: row.thursday,
      Friday: row.friday,
      Saturday: row.saturday
    }
  });
});

setClassGrids(Object.values(classMap));
            } catch (error) {
                console.error("Error fetching detail timetable", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTeacherTimetable();
    }, [teacher.id, activeSubjectId]);

    const handleCellClick = async (gridIndex, day, periodId) => {
  if (!isEditing) return;

  const grid = classGrids[gridIndex];
  const existing = grid.matrix[day].includes(periodId);

  setCellError("");

  // ✅ REMOVE EXISTING PERIOD
  if (existing) {
    try {
      // find the exact timetable row id to delete
      const rowId = grid.db_ids[0]; // already tracked in your code

      await axios.delete(
        `${API_URL}/api/staff/timetable/${rowId}`,
        { withCredentials: true }
      );

      // update UI only after success
      setClassGrids(prev => {
        const copy = [...prev];
        copy[gridIndex].matrix[day] =
          copy[gridIndex].matrix[day].filter(p => p !== periodId);
        return copy;
      });

    } catch (err) {
      setCellError("Failed to remove timetable. Please try again.");
    }

    return;
  }

  // ➕ ADD NEW PERIOD
  try {
    await axios.post(
      `${API_URL}/api/staff/staff/${teacher.id}/timetable`,
      {
        staff_id: teacher.id,
        class_id: grid.class_id,
        subject_id: activeSubjectId,
        [day.toLowerCase()]: periodId
      },
      { withCredentials: true }
    );

    setClassGrids(prev => {
      const copy = [...prev];
      copy[gridIndex].matrix[day].push(periodId);
      return copy;
    });

  } catch (err) {
    if (err.response?.status === 409) {
      setCellError(
        "This period is already allocated to another teacher for this class."
      );
    } else {
      setCellError("Failed to add timetable.");
    }
  }
};


    const handleSave = async () => {
        try {
            // STRATEGY: 
            // 1. Delete all old rows for these classes (using db_ids we tracked)
            // 2. Pack the new matrix state into minimal rows
            // 3. Insert new rows
            // Note: Since we don't have a batch delete/update, we loop.
            
            const promises = [];

            // 1. Delete Old
            classGrids.forEach(grid => {
                grid.db_ids.forEach(dbId => {
                    promises.push(axios.delete(`${API_URL}/api/staff/timetable/${dbId}`, { withCredentials: true }));
                });
            });

            // Wait for deletions
            await Promise.all(promises);

            // 2. Create New Payloads (Packing Algorithm)
            const createPromises = [];
            
            classGrids.forEach(grid => {
                // Packing: We need to convert { Mon: [1,2], Tue: [3] } into rows
                // Row 1: Mon=1, Tue=3
                // Row 2: Mon=2, Tue=null
                
                // Determine max depth (max number of periods in any single day)
                let maxRows = 0;
                days.forEach(day => {
                    maxRows = Math.max(maxRows, grid.matrix[day].length);
                });

                for(let i=0; i<maxRows; i++) {
                    const rowPayload = {
                        staff_id: teacher.id,
                        class_id: grid.class_id,
                        subject_id: activeSubjectId,
                        monday: grid.matrix.Monday[i] || null,
                        tuesday: grid.matrix.Tuesday[i] || null,
                        wednesday: grid.matrix.Wednesday[i] || null,
                        thursday: grid.matrix.Thursday[i] || null,
                        friday: grid.matrix.Friday[i] || null,
                        saturday: grid.matrix.Saturday[i] || null
                    };
                    createPromises.push(axios.post(`${API_URL}/api/staff/timetable`, rowPayload, { withCredentials: true }));
                }
            });

            await Promise.all(createPromises);
            onUpdate();
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save changes. Some operations may have partially succeeded.");
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white w-[900px] max-h-[90vh] overflow-y-auto rounded-lg shadow-lg p-6 flex flex-col">
                <div className="flex justify-between items-start border-b pb-4 mb-4">
                    <div>
                        <div className="text-2xl font-bold text-[#243c96]">{teacher.name}</div>
                        <div className="text-sm text-gray-600">Subject: <span className="font-semibold text-black">{activeSubjectName}</span></div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">Close</button>
                        <button 
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            className={`px-4 py-2 text-sm rounded text-white shadow-sm transition ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-500 hover:bg-blue-600'}`}
                        >
                            {isEditing ? "Save Changes" : "Edit"}
                        </button>
                    </div>
                </div>

                {loading ? <div className="p-10 text-center text-gray-500">Loading schedule...</div> : (
                    <StaffTimetable
                    staffId={teacher.id}
                    subjectId={activeSubjectId}
                    periods={periods}
                    classes={classes}
                  />
                )}
            </div>
        </div>,
        document.body
    );
};

// ... AddSubjectModal ...
const AddSubjectModal = ({ onClose, onAdd }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    subject_code: "",
    subject_name: "",
    short_name: "",
    category: "Core",
    grade_levels: [],
    credit_value: 1.0,
    weekly_periods: 5,
    is_active: true
  });

  const gradeOptions = [1,2,3,4,5,6,7,8,9,10,11,12];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const toggleGrade = (grade) => {
    setForm(prev => ({
      ...prev,
      grade_levels: prev.grade_levels.includes(grade)
        ? prev.grade_levels.filter(g => g !== grade)
        : [...prev.grade_levels, grade]
    }));
  };

  const handleSubmit = async () => {
    if (!form.subject_code || !form.subject_name) {
      alert("Subject Code & Name are required");
      return;
    }

    try {
      setSaving(true);
      const res = await axios.post(
        `${API_URL}/api/master/subjects`,
        form,
        { withCredentials: true }
      );

      onAdd(res.data);   // push new subject to list
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add subject");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[600px] rounded-lg shadow-lg p-6">
        <div className="text-xl font-semibold text-[#243c96] mb-4">
          Add New Subject
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <input
            name="subject_code"
            placeholder="Subject Code"
            value={form.subject_code}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            name="subject_name"
            placeholder="Subject Name"
            value={form.subject_name}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            name="short_name"
            placeholder="Short Name"
            value={form.short_name}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option>Core</option>
            <option>Elective</option>
            <option>Language</option>
            <option>Science</option>
            <option>Arts</option>
            <option>Humanities</option>
            <option>Physical Education</option>
            <option>Vocational</option>
          </select>

          <input
            type="number"
            name="credit_value"
            placeholder="Credit Value"
            value={form.credit_value}
            step="0.5"
            min="0.5"
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            type="number"
            name="weekly_periods"
            placeholder="Weekly Periods"
            value={form.weekly_periods}
            min="1"
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        {/* Grade Levels */}
        <div className="mt-4">
          <div className="text-sm font-semibold mb-2">Grade Levels</div>
          <div className="flex flex-wrap gap-3">
            {gradeOptions.map(g => (
              <label key={g} className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={form.grade_levels.includes(g)}
                  onChange={() => toggleGrade(g)}
                />
                Grade {g}
              </label>
            ))}
          </div>
        </div>

        {/* Active */}
        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
          />
          <span className="text-sm">Active</span>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};


// ... AddTeacherModal (With Matrix & Existing Check) ...
const AddTeacherModal = ({
  activeSubjectId,
  activeSubjectName,
  allClasses,
  allStaff,
  allPeriods,
  onClose,
  onAdd
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState("");

  return createPortal(
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[900px] max-h-[90vh] overflow-y-auto rounded-lg shadow-lg p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-xl font-semibold text-[#243c96]">
              Add Teacher Allocation
            </div>
            <div className="text-sm text-gray-500">
              Subject: <span className="font-medium">{activeSubjectName}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>

        {/* TEACHER SELECT */}
        <div className="mb-4">
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
            Teacher
          </label>
          <select
            value={selectedStaffId}
            onChange={e => setSelectedStaffId(e.target.value)}
            className="w-full border p-2 rounded outline-none focus:ring-1 focus:ring-[#243c96]"
          >
            <option value="">Select Teacher</option>
            {allStaff.map(s => (
              <option key={s.id} value={s.id}>
                {s.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* TIMETABLE (same as View Teacher) */}
        {selectedStaffId ? (
          <StaffTimetable
            staffId={selectedStaffId}
            subjectId={activeSubjectId}
            periods={allPeriods}
            classes={allClasses}
          />
        ) : (
          <div className="p-6 text-center text-gray-500 border rounded">
            Select a teacher to assign timetable
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};


export default SubjectsTeachers;