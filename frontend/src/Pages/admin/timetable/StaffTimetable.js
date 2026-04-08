import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "";
const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const StaffTimetable = ({
  staffId,
  subjectId,
  periods = [],
  classes = [],
}) => {
  const [rows, setRows] = useState([]);
  const [editRows, setEditRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ================= FETCH ================= */

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/staff/StaffTimeTable/${staffId}`,
        { withCredentials: true }
      );

      const filtered = subjectId
        ? res.data.filter(
            r => String(r.subject) === String(subjectId)
          )
        : res.data;

      setRows(filtered);
      setEditRows(JSON.parse(JSON.stringify(filtered)));
    } catch (err) {
      console.error("Failed to fetch timetable", err);
      setRows([]);
      setEditRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (staffId) fetchTimetable();
  }, [staffId, subjectId]);

  /* ================= HELPERS ================= */

  const getPeriodTime = (periodId) =>
    periods.find(p => String(p.periodid) === String(periodId))?.timein || "---";

  const getClassName = (classId) => {
    const cls =
      classes.find(c => String(c.id) === String(classId)) ||
      classes.find(c => String(c.class_id) === String(classId));

    if (!cls) return classId;

    const className = cls.class_name || cls.class || "";
    const section = cls.section || cls.division || "";

    return  className;
  };

  /* ================= EDIT ACTIONS ================= */

  const handleAddRow = () => {
    setEditRows(prev => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        class_name: "",
        subject: subjectId,
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
      },
    ]);
  };

  const handleCellChange = (rowIndex, field, value) => {
    const updated = [...editRows];
    updated[rowIndex][field] = value || null;
    setEditRows(updated);
  };

  /* ================= SAVE (SAME AS StaffProfileViewEdit) ================= */

  const handleSave = async () => {
    try {
      setSaving(true);

      // 1️⃣ Delete existing timetable rows
      const deleteCalls = rows
        .filter(r => !String(r.id).startsWith("temp"))
        .map(r =>
          axios.delete(
            `${API_URL}/api/staff/timetable/${r.id}`,
            { withCredentials: true }
          )
        );

      await Promise.all(deleteCalls);

      // 2️⃣ Insert updated rows
      const createCalls = editRows.map(r =>
        axios.post(
          `${API_URL}/api/staff/timetable`,
          {
            staff_id: staffId,
            class_id: r.class_name,
            subject_id: r.subject,
            monday: r.monday,
            tuesday: r.tuesday,
            wednesday: r.wednesday,
            thursday: r.thursday,
            friday: r.friday,
            saturday: r.saturday,
            academic_year:
              localStorage.getItem("academicYear") || "2024-2025",
          },
          { withCredentials: true }
        )
      );

      await Promise.all(createCalls);

      setIsEditing(false);
      await fetchTimetable();
      alert("Timetable saved successfully!");
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save timetable");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading timetable…
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white">

      {/* ACTION BAR */}
      <div className="flex justify-end gap-2 mb-3">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
          >
            Edit
          </button>
        ) : (
          <>
            <button
              onClick={handleAddRow}
              className="px-3 py-1 bg-sky-600 text-white text-sm rounded"
            >
              + Add Row
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </>
        )}
      </div>

      {/* TABLE */}
      {editRows.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No timetable assigned
        </div>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Class</th>
              {days.map(d => (
                <th key={d} className="border p-2 capitalize text-center">
                  {d}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {editRows.map((row, rowIndex) => (
              <tr key={row.id}>
                {/* CLASS */}
                <td className="border p-2">
                  {isEditing ? (
                    <select
                      value={row.class_name || ""}
                      onChange={e =>
                        handleCellChange(rowIndex, "class_name", e.target.value)
                      }
                      className="border p-1 text-sm w-full"
                    >
                      <option value="">Select</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.class_name} 
                        </option>
                      ))}
                    </select>
                  ) : (
                    getClassName(row.class_name)
                  )}
                </td>

                {/* PERIODS */}
                {days.map(d => (
                  <td key={d} className="border p-2 text-center">
                    {isEditing ? (
                      <select
                        value={row[d] || ""}
                        onChange={e =>
                          handleCellChange(rowIndex, d, e.target.value)
                        }
                        className="border p-1 text-xs"
                      >
                        <option value="">--</option>
                        {periods.map(p => (
                          <option key={p.periodid} value={p.periodid}>
                            {p.timein}
                          </option>
                        ))}
                      </select>
                    ) : (
                      getPeriodTime(row[d])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StaffTimetable;
