import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const TimetableTab = ({ selectedClass, selectedDivisions, editMode }) => {
  const [timetable, setTimetable] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ========= TOOLTIP ========= */
  const [hoveredRaw, setHoveredRaw] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);
  const tooltipRef = useRef(null);

  /* ========= MODAL ========= */
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  /* ========= MASTER ========= */
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  /* ========= INIT ========= */
  useEffect(() => {
    fetchPeriods();
    fetchSubjects();
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDivisions.length && periods.length) {
      fetchTimetable();
    }
  }, [selectedClass, selectedDivisions, periods]);

  /* ========= TOOLTIP POS ========= */
  useEffect(() => {
    if (!hoveredRaw) {
      setTooltipPos(null);
      return;
    }

    const rect = tooltipRef.current?.getBoundingClientRect();
    const offset = 12;
    let left = hoveredRaw.x + offset;
    let top = hoveredRaw.y + offset;

    if (rect) {
      if (left + rect.width > window.innerWidth)
        left = hoveredRaw.x - rect.width - offset;
      if (top + rect.height > window.innerHeight)
        top = hoveredRaw.y - rect.height - offset;
    }

    setTooltipPos({ left, top });
  }, [hoveredRaw]);

  /* ========= FETCH ========= */
  const fetchPeriods = async () => {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/master/periods`,
      { withCredentials: true }
    );
    setPeriods(res.data.sort((a, b) => a.periodid - b.periodid));
  };

  const fetchSubjects = async () => {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/master/subjects`,
      { withCredentials: true }
    );
    setSubjects(res.data);
  };

  const fetchTeachers = async () => {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/staff/Staff`,
      { withCredentials: true }
    );
    setTeachers(res.data.filter((t) => t.position === "Teacher"));
  };

  const fetchTimetable = async () => {
    setLoading(true);

    const classRes = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/master/classes`,
      { withCredentials: true }
    );

    const classIds = classRes.data
      .filter(
        (c) =>
          c.class === selectedClass &&
          selectedDivisions.includes(c.section)
      )
      .map((c) => c.id);

    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/staff/Staff/classes/timetable`,
      {
        params: {
          classIds: classIds.join(","),
          academicYear: localStorage.getItem("academicYear"),
        },
        withCredentials: true,
      }
    );

    setTimetable(formatTimetable(res.data, classRes.data, classIds));
    setLoading(false);
  };

  /* ========= FORMAT ========= */
  const formatTimetable = (data, classData, classIds) =>
    classIds.map((classId) => {
      const cls = classData.find((c) => c.id === classId);
      const rows = data.filter((d) => d.class_id === classId);

      const grid = {};
      days.forEach((day) => {
        grid[day] = periods.map((p) => {
          const match = rows.find(
            (r) =>
              r.day_name?.toLowerCase() === day &&
              r.period_id === p.periodid
          );
          return {
            id: match?.id,
            period: p.periodid,
            subject_id: match?.subject_id || "",
            subject_name: match?.subject_name || "",
            teacher_id: match?.teacher_id || "",
            teacher_name: match?.full_name || "",
          };

        });
      });

      return {
        className: cls.class,
        division: cls.section,
        timetable: grid,
      };
    });

  /* ========= SLOT CLICK ========= */
  const handleSlotClick = (cell, meta) => {
    if (!editMode) return;

    setSelectedSlot({
      ...cell,
      ...meta,
      mode: cell.subject ? "edit" : "add",
    });
    setSlotModalOpen(true);
  };

  /* ========= SAVE ========= */
  const saveSlot = async () => {
    const payload = {
      class: selectedSlot.className,
      section: selectedSlot.division,
      day: selectedSlot.day,
      period_id: selectedSlot.period,
      subject: selectedSlot.subject,
      teacher: selectedSlot.teacher,
      academicYear: localStorage.getItem("academicYear"),
    };

    if (selectedSlot.mode === "add") {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/staff/timetable`,
        payload,
        { withCredentials: true }
      );
    } else {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/staff/timetable/${selectedSlot.id}`,
        payload,
        { withCredentials: true }
      );
    }

    setSlotModalOpen(false);
    fetchTimetable();
  };

  /* ========= RENDER ========= */
  if (loading)
    return <div className="loading loading-spinner loading-lg mx-auto" />;

  return (
    <div className="space-y-4 relative">
      {timetable.map((div, i) => (
        <div key={i} className="border rounded overflow-hidden">
          <div className="bg-gray-200 px-4 py-2 font-semibold">
            {div.className} {div.division}
          </div>

          <table className="table w-full">
            <thead>
              <tr>
                <th>Day</th>
                {periods.map((p) => (
                  <th key={p.periodid}>{p.timein}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {days.map((day) => (
                <tr key={day}>
                  <td className="capitalize font-semibold">{day}</td>

                  {div.timetable[day].map((cell, idx) => (
                    <td
                      key={idx}
                      onMouseMove={(e) =>
                        setHoveredRaw({
                          x: e.clientX,
                          y: e.clientY,
                          data: { ...cell, day },
                        })
                      }
                      onMouseLeave={() => setHoveredRaw(null)}
                      onClick={() =>
                        handleSlotClick(cell, {
                          day,
                          className: div.className,
                          division: div.division,
                        })
                      }
                      className={`cursor-pointer border text-center
                        ${editMode ? "hover:bg-yellow-50" : ""}
                        ${cell.subject ? "bg-blue-50" : ""}`}
                    >
                      <div className="font-semibold">
                        {cell.subject || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {cell.teacher}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* ===== TOOLTIP ===== */}
      {hoveredRaw && tooltipPos && hoveredRaw.data.subject && (
        <div
          ref={tooltipRef}
          style={tooltipPos}
          className="fixed z-[9999] bg-black text-white text-xs rounded px-3 py-2 shadow"
        >
          <div><b>{hoveredRaw.data.subject}</b></div>
          <div>{hoveredRaw.data.teacher}</div>
          <div className="capitalize">{hoveredRaw.data.day}</div>
        </div>
      )}

      {/* ===== MODAL ===== */}
      {slotModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex justify-center items-start pt-16">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5">
            <h3 className="font-bold mb-3">
              {selectedSlot.mode === "add" ? "Add Timetable" : "Edit Timetable"}
            </h3>

            <select
              className="select select-bordered w-full mb-3"
              value={selectedSlot.subject}
              onChange={(e) =>
                setSelectedSlot((p) => ({
                  ...p,
                  subject: e.target.value,
                }))
              }
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.subject_id}>
                  {s.subject_name}
                </option>
              ))}
            </select>

            <select
              className="select select-bordered w-full mb-4"
              value={selectedSlot.teacher}
              onChange={(e) =>
                setSelectedSlot((p) => ({
                  ...p,
                  teacher: e.target.value,
                }))
              }
            >
              <option value="">Select Teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => setSlotModalOpen(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveSlot}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableTab;
