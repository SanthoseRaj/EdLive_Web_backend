import React, { useEffect, useState, lazy, Suspense, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Table } from "react-bootstrap";

// Lazy load components
const Modal = lazy(() => import("./Modal"));
const Section = lazy(() => import("./Section"));
const FaArrowLeft = lazy(() =>
  import("react-icons/fa").then((module) => ({ default: module.FaArrowLeft }))
);

const StudentProfileViewEdit = () => {
  const { _studentid } = useParams();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [classess, setClassess] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const location = useLocation();
  const prevState = location.state?.prev || null;
  const [siblings, setSiblings] = useState([]);
  const [showSiblingTooltip, setShowSiblingTooltip] = useState(false);
  const siblingTooltipRef = useRef(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [termGrades, setTermGrades] = useState([]);
  const [coCurricular, setCoCurricular] = useState({});
  // New state for tracking pending file uploads
  const [pendingFiles, setPendingFiles] = useState({
    profileImage: null,
  });

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/student/students/${_studentid}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("Failed to fetch student data");
        const data = await response.json();
        setStudentData(data);
        setEditData(JSON.parse(JSON.stringify(data))); // Deep copy for edit data
      } catch (error) {
        console.error("Error fetching student data:", error);
        setError("Failed to load student profile");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [_studentid]);
  useEffect(() => {
    const fetchSiblings = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/student/relations/${_studentid}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        // Only siblings (ignore teachers)
        const siblingList = data.filter((item) => item.type === "Sibling");

        setSiblings(siblingList);
      } catch (err) {
        console.error("Failed to fetch siblings", err);
      }
    };

    fetchSiblings();
  }, [_studentid]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        siblingTooltipRef.current &&
        !siblingTooltipRef.current.contains(event.target)
      ) {
        setShowSiblingTooltip(false);
      }
    };

    if (showSiblingTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSiblingTooltip]);

  // Fetch master data
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        // Fetch classes
        const classesResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/master/classes`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (classesResponse.ok) {
          const classesData = await classesResponse.json();
          setClassess(classesData);
        }

        // Fetch subjects
        const subjectsResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/master/subjects`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (subjectsResponse.ok) {
          const subjectsData = await subjectsResponse.json();
          setSubjects(subjectsData);
        }
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };

    fetchMasterData();
  }, []);

  useEffect(() => {
    const fetchAttendanceSummary = async () => {
      try {
        const startDate = getAcademicYearStart();
        const endDate = new Date().toISOString().split("T")[0];

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/attendance/studentMonthly?studentId=${_studentid}&startDate=${startDate}&endDate=${endDate}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) return;

        const data = await response.json();
        setAttendanceSummary(data);
      } catch (err) {
        console.error("Failed to fetch attendance summary", err);
      }
    };

    fetchAttendanceSummary();
  }, [_studentid]);

  useEffect(() => {
    const fetchAndGroupTermGrades = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/exams/results/student/${_studentid}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) return;

        const result = await response.json();
        const termResults = result?.data?.termResults || [];

        // ✅ Group by term + overall_grade
        const groupedMap = new Map();

        termResults.forEach((item) => {
          const key = `${item.term}-${item.overall_grade}`;

          if (!groupedMap.has(key)) {
            groupedMap.set(key, {
              term: item.term,
              overall_grade: item.overall_grade,
            });
          }
        });

        setTermGrades(Array.from(groupedMap.values()));
      } catch (error) {
        console.error("Failed to fetch & group term grades", error);
      }
    };

    fetchAndGroupTermGrades();
  }, [_studentid]);

  useEffect(() => {
    const fetchCoCurricularActivities = async () => {
      try {
        const academicYear = localStorage.getItem("academicYear") || null;

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/co-curricular/student-activities?studentId=${_studentid}&academicYear=${academicYear}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        // ✅ Group by category
        const grouped = {};

        data.forEach((item) => {
          if (!grouped[item.category_name]) {
            grouped[item.category_name] = [];
          }
          grouped[item.category_name].push(item.activity_name);
        });

        setCoCurricular(grouped);
      } catch (err) {
        console.error("Failed to fetch co-curricular activities", err);
      }
    };

    fetchCoCurricularActivities();
  }, [_studentid]);

  // Deep comparison function to find changed fields
  const findChangedFields = (original, edited) => {
    const changedFields = {};

    const compareObjects = (obj1, obj2, path = "") => {
      for (const key in obj2) {
        const currentPath = path ? `${path}.${key}` : key;

        if (
          typeof obj2[key] === "object" &&
          obj2[key] !== null &&
          !Array.isArray(obj2[key])
        ) {
          // Recursively compare nested objects
          if (!obj1[key] || typeof obj1[key] !== "object") {
            changedFields[currentPath] = obj2[key];
          } else {
            compareObjects(obj1[key], obj2[key], currentPath);
          }
        } else {
          // Compare primitive values
          if (obj1[key] !== obj2[key]) {
            changedFields[currentPath] = obj2[key];
          }
        }
      }

      // Check for deleted keys in original object
      for (const key in obj1) {
        const currentPath = path ? `${path}.${key}` : key;
        if (!(key in obj2)) {
          changedFields[`${currentPath}__deleted`] = true;
        }
      }
    };

    compareObjects(original, edited);
    return changedFields;
  };

  // Validate required fields
  const validateRequiredFields = () => {
    const errors = {};

    // Basic information validation
    if (!editData.student_id?.trim()) {
      errors.student_id = "Student ID is required";
    }
    if (!editData.admission_no?.trim()) {
      errors.admission_no = "Admission number is required";
    }
    if (!editData.full_name?.trim()) {
      errors.full_name = "Full name is required";
    }
    if (!editData.class_id) {
      errors.class_id = "Class is required";
    }

    // Basic info validation
    if (!editData.basic_info?.gender) {
      errors["basic_info.gender"] = "Gender is required";
    }
    if (!editData.basic_info?.date_of_birth) {
      errors["basic_info.date_of_birth"] = "Date of birth is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (isEditing) {
      // If canceling edit, reset edit data and clear validation errors
      setEditData(JSON.parse(JSON.stringify(studentData)));
      setValidationErrors({});
    }
    setIsEditing(!isEditing);
  };

  // Handle input changes for edit mode
  const handleInputChange = (section, field, value, index = null) => {
    setEditData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));

      if (index !== null) {
        // For array fields
        if (!newData[section]) newData[section] = [];
        if (!newData[section][index]) newData[section][index] = {};
        newData[section][index][field] = value;
      } else {
        // For simple fields or nested objects
        if (section.includes(".")) {
          // Handle nested fields like 'basic_info.gender'
          const parts = section.split(".");
          let current = newData;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) current[parts[i]] = {};
            current = current[parts[i]];
          }
          current[parts[parts.length - 1]] = value;
        } else {
          // Handle top-level fields
          if (
            section === "basic_info" ||
            section === "performance" ||
            section === "health" ||
            section === "school" ||
            section === "parent" ||
            section === "caste"
          ) {
            // For section objects
            if (!newData[section]) newData[section] = {};
            newData[section][field] = value;
          } else {
            // For top-level fields like 'student_id', 'admission_no', etc.
            newData[field] = value;
          }
        }
      }

      return newData;
    });

    // Clear validation error for this field when user starts typing
    const errorKey =
      index !== null ? `${section}.${index}.${field}` : `${section}.${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleProfileImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Create preview URL and store file
    const previewUrl = URL.createObjectURL(file);
    setPendingFiles((prev) => ({
      ...prev,
      profileImage: file,
    }));

    // Update edit data with preview (temporary)
    setEditData((prev) => ({
      ...prev,
      profile_img: previewUrl,
    }));

    alert('Profile image selected. Click "Save All Changes" to upload.');
  };

  const getAcademicYearStart = () => {
    const today = new Date();
    const year =
      today.getMonth() >= 5 // June = 5 (0-based)
        ? today.getFullYear()
        : today.getFullYear() - 1;

    return `${year}-06-01`; // YYYY-06-01
  };
  // Handle save all changes with change detection
  const handleSaveAll = async () => {
    // Validate required fields first
    if (!validateRequiredFields()) {
      alert("Please fix all validation errors before saving.");
      return;
    }

    try {
      setSaving(true);

      // 1. Upload profile image if selected AND changed
      if (pendingFiles.profileImage) {
        await uploadProfileImage(pendingFiles.profileImage);
      }

      // 2. Update basic student information only if changed
      await updateBasicStudentInformation();

      // 3. Update basic info only if changed
      await updateBasicInfo();

      // 4. Update performance only if changed
      await updatePerformance();

      // 5. Update health only if changed
      await updateHealth();

      // 6. Update school info only if changed
      await updateSchoolInfo();

      // 7. Update parent info only if changed
      await updateParentInfo();

      // 8. Update caste info only if changed
      await updateCasteInfo();

      // Refresh student data
      await fetchStudentData();

      setIsEditing(false);
      setValidationErrors({});

      // Clear pending files
      setPendingFiles({
        profileImage: null,
      });

      alert("Student profile updated successfully!");
    } catch (error) {
      console.error("Error updating student data:", error);
      alert("Failed to update student profile: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Enhanced update functions with change detection
  const updateBasicStudentInformation = async () => {
    const basicUpdates = {};

    // Only include fields that have actually changed
    if (editData.student_id !== studentData.student_id)
      basicUpdates.student_id = editData.student_id;
    if (editData.admission_no !== studentData.admission_no)
      basicUpdates.admission_no = editData.admission_no;
    if (editData.full_name !== studentData.full_name)
      basicUpdates.full_name = editData.full_name;
    if (editData.class_id !== studentData.class_id)
      basicUpdates.class_id = editData.class_id;

    // Only make API call if there are actual changes
    if (Object.keys(basicUpdates).length > 0) {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/student/students/${_studentid}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(basicUpdates),
          credentials: "include",
        }
      );

      if (!response.ok)
        throw new Error("Failed to update basic student information");
    }
  };

  const updateBasicInfo = async () => {
    const basicInfoUpdates = {};

    // Only include fields that have actually changed
    const currentBasicInfo = studentData.basic_info || {};
    const editBasicInfo = editData.basic_info || {};

    if (editBasicInfo.gender !== currentBasicInfo.gender)
      basicInfoUpdates.gender = editBasicInfo.gender;
    if (editBasicInfo.date_of_birth !== currentBasicInfo.date_of_birth)
      basicInfoUpdates.date_of_birth = editBasicInfo.date_of_birth;
    if (editBasicInfo.blood_group !== currentBasicInfo.blood_group)
      basicInfoUpdates.blood_group = editBasicInfo.blood_group;
    if (editBasicInfo.contact_number !== currentBasicInfo.contact_number)
      basicInfoUpdates.contact_number = editBasicInfo.contact_number;

    // Only make API call if there are actual changes
    if (Object.keys(basicInfoUpdates).length > 0) {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/student/students/${_studentid}/basic`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(basicInfoUpdates),
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to update basic information");
    }
  };

  const updatePerformance = async () => {
    const performanceUpdates = {};

    const currentPerformance = studentData.performance || {};
    const editPerformance = editData.performance || {};

    if (editPerformance.overall_grade !== currentPerformance.overall_grade)
      performanceUpdates.overall_grade = editPerformance.overall_grade;
    if (
      editPerformance.attendance_percentage !==
      currentPerformance.attendance_percentage
    )
      performanceUpdates.attendance_percentage =
        editPerformance.attendance_percentage;
    if (editPerformance.remarks !== currentPerformance.remarks)
      performanceUpdates.remarks = editPerformance.remarks;

    if (Object.keys(performanceUpdates).length > 0) {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/student/students/${_studentid}/performance`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(performanceUpdates),
          credentials: "include",
        }
      );

      if (!response.ok)
        throw new Error("Failed to update performance information");
    }
  };

  const updateHealth = async () => {
    const healthUpdates = {};

    const currentHealth = studentData.health || {};
    const editHealth = editData.health || {};

    if (editHealth.height !== currentHealth.height)
      healthUpdates.height = editHealth.height;
    if (editHealth.weight !== currentHealth.weight)
      healthUpdates.weight = editHealth.weight;
    if (editHealth.vision_left !== currentHealth.vision_left)
      healthUpdates.vision_left = editHealth.vision_left;
    if (editHealth.vision_right !== currentHealth.vision_right)
      healthUpdates.vision_right = editHealth.vision_right;
    if (editHealth.disability !== currentHealth.disability)
      healthUpdates.disability = editHealth.disability;
    if (editHealth.disability_details !== currentHealth.disability_details)
      healthUpdates.disability_details = editHealth.disability_details;
    if (editHealth.disease !== currentHealth.disease)
      healthUpdates.disease = editHealth.disease;
    if (editHealth.disease_details !== currentHealth.disease_details)
      healthUpdates.disease_details = editHealth.disease_details;
    if (editHealth.immunisation !== currentHealth.immunisation)
      healthUpdates.immunisation = editHealth.immunisation;

    if (Object.keys(healthUpdates).length > 0) {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/student/students/${_studentid}/health`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(healthUpdates),
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to update health information");
    }
  };

  const updateSchoolInfo = async () => {
    const schoolUpdates = {};

    const currentSchool = studentData.school || {};
    const editSchool = editData.school || {};

    if (editSchool.admission_date !== currentSchool.admission_date)
      schoolUpdates.admission_date = editSchool.admission_date;
    if (editSchool.current_class !== currentSchool.current_class)
      schoolUpdates.current_class = editSchool.current_class;
    if (editSchool.section !== currentSchool.section)
      schoolUpdates.section = editSchool.section;
    if (editSchool.roll_number !== currentSchool.roll_number)
      schoolUpdates.roll_number = editSchool.roll_number;
    if (editSchool.class_joined !== currentSchool.class_joined)
      schoolUpdates.class_joined = editSchool.class_joined;
    if (editSchool.prev_school !== currentSchool.prev_school)
      schoolUpdates.prev_school = editSchool.prev_school;

    if (Object.keys(schoolUpdates).length > 0) {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/student/students/${_studentid}/school`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(schoolUpdates),
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to update school information");
    }
  };

  const updateParentInfo = async () => {
    const parentUpdates = {};

    const currentParent = studentData.parent || {};
    const editParent = editData.parent || {};

    if (editParent.guardian_same !== currentParent.guardian_same)
      parentUpdates.guardian_same = editParent.guardian_same;
    if (editParent.father_name !== currentParent.father_name)
      parentUpdates.father_name = editParent.father_name;
    if (editParent.father_occupation !== currentParent.father_occupation)
      parentUpdates.father_occupation = editParent.father_occupation;
    if (editParent.father_contact !== currentParent.father_contact)
      parentUpdates.father_contact = editParent.father_contact;
    
    if (editParent.father_age !== currentParent.father_age)
      parentUpdates.father_age = editParent.father_age;
    if (editParent.father_email !== currentParent.father_email)
      parentUpdates.father_email = editParent.father_email;
    if (editParent.father_address !== currentParent.father_address)
      parentUpdates.father_address = editParent.father_address;
    
    if (editParent.mother_name !== currentParent.mother_name)
      parentUpdates.mother_name = editParent.mother_name;
    if (editParent.mother_occupation !== currentParent.mother_occupation)
      parentUpdates.mother_occupation = editParent.mother_occupation;
    if (editParent.mother_contact !== currentParent.mother_contact)
      parentUpdates.mother_contact = editParent.mother_contact;
    
    if (editParent.mother_age !== currentParent.mother_age)
      parentUpdates.mother_age = editParent.mother_age;
    if (editParent.mother_email !== currentParent.mother_email)
      parentUpdates.mother_email = editParent.mother_email;
    if (editParent.mother_address !== currentParent.mother_address)
      parentUpdates.mother_address = editParent.mother_address;
    
    if (editParent.guardian_name !== currentParent.guardian_name)
      parentUpdates.guardian_name = editParent.guardian_name;
    if (editParent.guardian_occupation !== currentParent.guardian_occupation)
      parentUpdates.guardian_occupation = editParent.guardian_occupation;
    if (editParent.guardian_contact !== currentParent.guardian_contact)
      parentUpdates.guardian_contact = editParent.guardian_contact;

    if (editParent.guardian_same !== currentParent.guardian_same)
      parentUpdates.guardian_same = editParent.guardian_same;
    if (editParent.guardian_age !== currentParent.guardian_age)
      parentUpdates.guardian_age = editParent.guardian_age;
    if (editParent.guardian_email !== currentParent.guardian_email)
      parentUpdates.guardian_email = editParent.guardian_email;
    if (editParent.guardian_address !== currentParent.guardian_address)
      parentUpdates.guardian_address = editParent.guardian_address;

    if (Object.keys(parentUpdates).length > 0) {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/student/students/${_studentid}/parent`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parentUpdates),
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to update parent information");
    }
  };

  const updateCasteInfo = async () => {
    const casteUpdates = {};

    const currentCaste = studentData.caste || {};
    const editCaste = editData.caste || {};

    if (editCaste.religion !== currentCaste.religion)
      casteUpdates.religion = editCaste.religion;
    if (editCaste.caste !== currentCaste.caste)
      casteUpdates.caste = editCaste.caste;
    if (editCaste.sub_caste !== currentCaste.sub_caste)
      casteUpdates.sub_caste = editCaste.sub_caste;

    if (Object.keys(casteUpdates).length > 0) {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/student/students/${_studentid}/caste`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(casteUpdates),
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to update caste information");
    }
  };

  // Upload profile image
  const uploadProfileImage = async (file) => {
    const formData = new FormData();
    formData.append("StudentprofileImage", file);

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/student/students/${_studentid}/image`,
      {
        method: "PATCH",
        body: formData,
        credentials: "include",
      }
    );

    if (!response.ok) throw new Error("Failed to upload profile image");
  };

  const fetchStudentData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/student/students/${_studentid}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Failed to fetch student data");
      const data = await response.json();
      setStudentData(data);
      setEditData(JSON.parse(JSON.stringify(data)));
    } catch (error) {
      console.error("Error fetching student data:", error);
      throw error;
    }
  };

  // Helper functions for display
  const getClassDisplay = (classId) => {
    if (!classId) return "---";
    const classe = classess.find((c) => c.class_id === classId);
    return classe ? `${classe.class_name}` : "---";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return "Invalid Date";
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "Invalid Date";
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return "";
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };
  const calculateAge = (dob) => {
    if (!dob) return "---";

    const birthDate = new Date(dob);
    if (isNaN(birthDate)) return "---";

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  // Helper function to get validation error message
  const getValidationError = (fieldPath) => {
    return validationErrors[fieldPath];
  };
  const handleImageError = (e) => {
    e.target.src = "../profile-picture.jpg";
  };

  if (loading)
    return <div className="text-center p-8">Loading student profile...</div>;
  if (error) return <div className="text-center p-8 text-error">{error}</div>;
  if (!studentData)
    return <div className="text-center p-8">No student data found</div>;

  return (
    <div className="p-4 mx-auto rounded-lg bg-white">
      <div className="mb-4 flex items-center justify-between">
        {/* Left: Navigation Button */}
        <button
          onClick={() => {
            if (prevState) {
              navigate("/payment", {
                state: {
                  selectedClass: prevState.selectedClass,
                  selectedDivisions: prevState.selectedDivisions,
                  activeTab: prevState.activeTab,
                },
              });
            } else {
              navigate(-1);
            }
          }}
          className="text-sm hover:underline flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>
            {prevState?.selectedClass
              ? `Classes, ${prevState.selectedClass} › Division ${
                  prevState.selectedDivisions?.length === 0
                    ? "All"
                    : prevState.selectedDivisions.join(", ")
                } › ${prevState.activeTab ?? "Students"} › ${
                  studentData.full_name
                }`
              : "Back"}
          </span>
        </button>

        {/* Right: Edit checkbox */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Edit Mode</span>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={isEditing}
            onChange={handleEditToggle}
          />
          {/* Three-dot menu */}
          <div className="relative">
            <div className="dropdown dropdown-end">
              <button
                tabIndex={0}
                className="w-5 h-5 text-gray-700 group-hover:text-[#00a9ec] active:text-[#00a9ec] transition-colors duration-200  appearance-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-gray-700 group-hover:text-[#00a9ec] transition-colors duration-200"
                >
                  <circle cx="5" cy="12" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="19" cy="12" r="1.5" />
                </svg>
              </button>

              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-white rounded-md w-52 border"
              >
                <li>
                  <button>Remove</button>
                </li>
                <li>
                  <button>Add proxy</button>
                </li>
                <li>
                  <button>Suspend</button>
                </li>
                <li>
                  <button>Make long leave</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Suspense
        fallback={<div className="text-center p-8">Loading components...</div>}
      >
        {/* Basic Information Section */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Profile Image */}
          <div className="w-full lg:w-1/4">
            <div className="relative group">
              <div className="w-48 h-48 mx-auto">
                <img
                  src={
                    editData.profile_img
                      ? editData.profile_img.startsWith("blob:")
                        ? editData.profile_img
                        : `${process.env.REACT_APP_API_URL}${editData.profile_img}`
                      : `${process.env.REACT_APP_API_URL}/uploads/profile-images/profile-picture.jpg`
                  }
                  alt="Profile"
                  className="w-full h-full object-cover rounded-lg border-4 border-base-300 shadow-lg"
                  onError={handleImageError}
                />
                {pendingFiles.profileImage && (
                  <div className="absolute top-2 right-2 badge badge-primary badge-sm">
                    New
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="mt-4 text-center">
                  <div className="inline-flex flex-col items-center p-4 border-2 border-dashed border-base-300 rounded-2xl shadow-md bg-base-100">
                    <label className="btn btn-outline btn-sm cursor-pointer">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {pendingFiles.profileImage
                        ? "Change Photo"
                        : "Select Photo"}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleProfileImageSelect}
                      />
                    </label>
                    {pendingFiles.profileImage && (
                      <div className="mt-2 text-xs text-success">
                        Photo selected: {pendingFiles.profileImage.name}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Basic Details */}
          <div className="w-full lg:w-3/4">
            <div className="bg-base-100 px-6">
              <h3 className="text-3xl font-semibold mb-6">
                {studentData.basic_info?.gender === "Female" ? "Miss." : "Mr."}{" "}
                {studentData.full_name}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-1">
                {/* Left Column */}
                <div className="">
                  <div className="form-control">
                    <label className="label block">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        ID No
                      </span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.student_id || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "basic",
                            "student_id",
                            e.target.value
                          )
                        }
                        className={`input input-bordered input-sm ${
                          getValidationError("student_id") ? "input-error" : ""
                        }`}
                        placeholder="Enter student ID"
                      />
                    ) : (
                      <div className="mt-1 text-sm font-semibold text-gray-800">
                        {studentData.student_id}
                      </div>
                    )}
                    {getValidationError("student_id") && (
                      <div className="text-error text-sm mt-1">
                        {getValidationError("student_id")}
                      </div>
                    )}
                  </div>
                  <div className="form-control">
                    <label className="label block">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Admission No
                      </span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.admission_no || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "basic",
                            "admission_no",
                            e.target.value
                          )
                        }
                        className={`input input-bordered input-sm ${
                          getValidationError("admission_no")
                            ? "input-error"
                            : ""
                        }`}
                        placeholder="Enter admission number"
                      />
                    ) : (
                      <div className="mt-1 text-sm font-semibold text-gray-800">
                        {studentData.admission_no}
                      </div>
                    )}
                    {getValidationError("admission_no") && (
                      <div className="text-error text-sm mt-1">
                        {getValidationError("admission_no")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="">
                  <div className="form-control">
                    <label className="label block">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Class
                      </span>
                    </label>
                    {isEditing ? (
                      <select
                        value={editData.class_id || ""}
                        onChange={(e) =>
                          handleInputChange("basic", "class_id", e.target.value)
                        }
                        className={`select select-bordered input-sm ${
                          getValidationError("class_id") ? "select-error" : ""
                        }`}
                      >
                        <option value="">Select Class</option>
                        {classess.map((classe) => (
                          <option key={classe.class_id} value={classe.class_id}>
                            {classe.class_name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="mt-1 text-sm font-semibold text-gray-800">
                        {getClassDisplay(studentData.class_id)}
                      </div>
                    )}
                    {getValidationError("class_id") && (
                      <div className="text-error text-sm mt-1">
                        {getValidationError("class_id")}
                      </div>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label block">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Full Name
                      </span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.full_name || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "basic",
                            "full_name",
                            e.target.value
                          )
                        }
                        className={`input input-bordered input-sm ${
                          getValidationError("full_name") ? "input-error" : ""
                        }`}
                        placeholder="Enter full name"
                      />
                    ) : (
                      <div className="mt-1 text-sm font-semibold text-gray-800">
                        {studentData.full_name}
                      </div>
                    )}
                    {getValidationError("full_name") && (
                      <div className="text-error text-sm mt-1">
                        {getValidationError("full_name")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information Details */}
        <Section title="Personal Details">
          <div className="bg-base-100 p-6 rounded-lg border border-base-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Blood Group
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.basic_info?.blood_group || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "basic_info",
                          "blood_group",
                          e.target.value
                        )
                      }
                      className="input input-bordered input-sm"
                      placeholder="Enter blood group"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {studentData.basic_info?.blood_group || "---"}
                    </div>
                  )}
                </div>
                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Date of Birth
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formatDateForInput(
                        editData.basic_info?.date_of_birth
                      )}
                      onChange={(e) =>
                        handleInputChange(
                          "basic_info",
                          "date_of_birth",
                          e.target.value
                        )
                      }
                      className={`input input-bordered input-sm ${
                        getValidationError("basic_info.date_of_birth")
                          ? "input-error"
                          : ""
                      }`}
                    />
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {formatDate(studentData.basic_info?.date_of_birth)}
                    </div>
                  )}
                  {getValidationError("basic_info.date_of_birth") && (
                    <div className="text-error text-sm mt-1">
                      {getValidationError("basic_info.date_of_birth")}
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Age
                    </span>
                  </label>
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {calculateAge(
                      isEditing
                        ? editData.basic_info?.date_of_birth
                        : studentData.basic_info?.date_of_birth
                    )}{" "}
                    years
                  </div>
                </div>
              </div>
              <div className="hidden md:flex justify-center">
                <div className="divider divider-horizontal"></div>
              </div>
              <div>
                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Gender
                    </span>
                  </label>
                  {isEditing ? (
                    <select
                      value={editData.basic_info?.gender || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "basic_info",
                          "gender",
                          e.target.value
                        )
                      }
                      className={`select select-bordered input-sm ${
                        getValidationError("basic_info.gender")
                          ? "select-error"
                          : ""
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {studentData.basic_info?.gender}
                    </div>
                  )}
                  {getValidationError("basic_info.gender") && (
                    <div className="text-error text-sm mt-1">
                      {getValidationError("basic_info.gender")}
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Contact Number
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.basic_info?.contact_number || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "basic_info",
                          "contact_number",
                          e.target.value
                        )
                      }
                      className="input input-bordered input-sm"
                      placeholder="Enter contact number"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {studentData.basic_info?.contact_number || "---"}
                    </div>
                  )}
                </div>
                <div className="form-control relative" ref={siblingTooltipRef}>
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Siblings
                    </span>
                  </label>

                  <div className="mt-1 text-sm font-semibold text-gray-800 cursor-pointer">
                    <span
                      className="badge badge-outline badge-sm  p-2"
                      onClick={() => setShowSiblingTooltip((prev) => !prev)}
                    >
                      {siblings.length} Sibling
                      {siblings.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Tooltip */}
                  {showSiblingTooltip && siblings.length > 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-white border border-gray-300 rounded-md shadow-lg p-3 w-56">
                      <div className="text-xs font-semibold text-gray-600 mb-2">
                        Siblings
                      </div>
                      <ul className="space-y-1">
                        {siblings.map((sib) => (
                          <li
                            key={sib.id}
                            className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1"
                            onClick={() => {
                              setShowSiblingTooltip(false);
                              navigate(`/studentview/${sib.id}`);
                            }}
                          >
                            • {sib.full_name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Performance Section */}
        <Section title="Performance">
          <div className="bg-base-100 p-6 rounded-lg border border-base-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Exams
                  </span>
                </label>

                <div className="mt-1 text-sm font-semibold text-blue-600 flex flex-wrap items-center gap-2">
                  {termGrades.length > 0 ? (
                    termGrades.map((item, index) => (
                      <span
                        key={`${item.term}-${index}`}
                        className="flex items-center gap-2"
                      >
                        <span>
                          {item.term} ({item.overall_grade})
                        </span>

                        {index < termGrades.length - 1 && (
                          <span className="text-gray-400">|</span>
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">---</span>
                  )}
                </div>
              </div>

              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Attendance
                  </span>
                </label>

                <div className="mt-1 text-sm font-semibold text-blue-600">
                  {attendanceSummary ? (
                    <>
                      {attendanceSummary.percentage}%{" "}
                      <span className="text-gray-500 font-normal">
                        (from 1 Jun - Today)
                      </span>
                    </>
                  ) : (
                    "---"
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {Object.keys(coCurricular).map((category) => (
                <div key={category} className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {category}
                    </span>
                  </label>

                  <div className="mt-1 text-sm font-semibold text-blue-600">
                    {coCurricular[category].join(", ")}
                  </div>
                </div>
              ))}
            </div>
            {/* <div className="mt-6">
              <label className="label block">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Remarks</span>
              </label>
              {isEditing ? (
                <textarea
                  value={editData.performance?.remarks || ""}
                  onChange={(e) =>
                    handleInputChange("performance", "remarks", e.target.value)
                  }
                  className="textarea textarea-bordered w-full"
                  rows="3"
                  placeholder="Enter performance remarks"
                />
              ) : (
                <div className="p-3 bg-base-200 rounded-lg min-h-[80px]">
                  {studentData.performance?.remarks || "No remarks available"}
                </div>
              )}
            </div> */}
          </div>
        </Section>

        {/* Health Information */}
        <Section title="Health Information">
          <div className="bg-base-100 p-6 rounded-lg border border-base-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Height (cm)
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.health?.height_cm || ""}
                    onChange={(e) =>
                      handleInputChange("health", "height_cm", e.target.value)
                    }
                    className="input input-bordered input-sm"
                    placeholder="Enter height"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {studentData.health?.height_cm || "---"}
                  </div>
                )}
              </div>

              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Weight (kg)
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.health?.weight_kg || ""}
                    onChange={(e) =>
                      handleInputChange("health", "weight_kg", e.target.value)
                    }
                    className="input input-bordered input-sm"
                    placeholder="Enter weight"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {studentData.health?.weight_kg || "---"}
                  </div>
                )}
              </div>

              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Vision (Left)
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.health?.vision_left || ""}
                    onChange={(e) =>
                      handleInputChange("health", "vision_left", e.target.value)
                    }
                    className="input input-bordered input-sm"
                    placeholder="Enter left vision"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {studentData.health?.vision_left || "---"}
                  </div>
                )}
              </div>

              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Vision (Right)
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.health?.vision_right || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "health",
                        "vision_right",
                        e.target.value
                      )
                    }
                    className="input input-bordered input-sm"
                    placeholder="Enter right vision"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {studentData.health?.vision_right || "---"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
  {/* Question + Toggle inline */}
                <div className="flex items-center gap-3">
                  <div>
    <span className="text-sm font-medium text-gray-700">
      Any kind of disabilities?
                    </span>
                    <div className="text-xs text-gray-500">(like Hearing/Visual Impairments, Deaf-Blindness, etc.)</div>
</div>
    {isEditing ? (
      <input
        type="checkbox"
        className="toggle toggle-success toggle-sm"
        checked={editData.health?.disability === true}
        onChange={(e) =>
          handleInputChange("health", "disability", e.target.checked)
        }
      />
    ) : (
      <span className="text-sm font-semibold">
        {studentData.health?.disability ? "Yes" : "No"}
      </span>
    )}
  </div>

  {/* Details BELOW */}
  {(isEditing
    ? editData.health?.disability === true
    : studentData.health?.disability === true) && (
    <div >
      {isEditing ? (
        <input
          type="text"
          className="input input-bordered input-sm"
          value={editData.health?.disability_details || ""}
          onChange={(e) =>
            handleInputChange(
              "health",
              "disability_details",
              e.target.value
            )
          }
          placeholder="Enter disability details"
        />
      ) : (
        <div className="text-sm text-gray-700">
          {studentData.health?.disability_details || "---"}
        </div>
      )}
    </div>
  )}
</div>



              <div className="space-y-2">
  <div className="flex items-center gap-3">
    <div>
      <span className="text-sm font-medium text-gray-700">
        Any existing disease?
      </span>
      <div className="text-xs text-gray-500">
        (like asthma, dust allergy etc.)
      </div>
    </div>

    {isEditing ? (
      <input
        type="checkbox"
        className="toggle toggle-success toggle-sm"
        checked={editData.health?.disease === true}
        onChange={(e) =>
          handleInputChange("health", "disease", e.target.checked)
        }
      />
    ) : (
      <span className="text-sm font-semibold">
        {studentData.health?.disease ? "Yes" : "No"}
      </span>
    )}
  </div>

  {(isEditing
    ? editData.health?.disease === true
    : studentData.health?.disease === true) && (
    <div >
                    {isEditing ? (
                      <input
          type="text"
          className="input input-bordered input-sm"
          value={editData.health?.disease_details || ""}
          onChange={(e) =>
            handleInputChange(
              "health",
              "disease_details",
              e.target.value
            )
          }
          placeholder="Enter disease details"
        />
      ) : (
        <div className="text-sm text-gray-700">
          {studentData.health?.disease_details || "---"}
        </div>
      )}
    </div>
  )}
</div>



              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Immunisation
                  </span>
                </label>
                {isEditing ? (
                  <select
                    value={editData.health?.immunisation || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "health",
                        "immunisation",
                        e.target.value
                      )
                    }
                    className="select select-bordered input-sm"
                  >
                    <option value="">Select</option>
                    <option value="Complete">Complete</option>
                    <option value="Incomplete">Incomplete</option>
                  </select>
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {studentData.health?.immunisation || "---"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Section>

        {/* School Information */}
        <Section title="School Information">
          <div className="bg-base-100 p-6 rounded-lg border border-base-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Joining date
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formatDateForInput(editData.school?.admission_date)}
                    onChange={(e) =>
                      handleInputChange(
                        "school",
                        "admission_date",
                        e.target.value
                      )
                    }
                    className="input input-bordered input-sm"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {formatDate(studentData.school?.admission_date)}
                  </div>
                )}
              </div>

              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Current Class
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.school?.current_class || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "school",
                        "current_class",
                        e.target.value
                      )
                    }
                    className="input input-bordered input-sm"
                    placeholder="Enter current class"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {studentData.school?.current_class || "---"}
                  </div>
                )}
              </div>

              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Section
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.school?.section || ""}
                    onChange={(e) =>
                      handleInputChange("school", "section", e.target.value)
                    }
                    className="input input-bordered input-sm"
                    placeholder="Enter section"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {studentData.school?.section || "---"}
                  </div>
                )}
              </div>

              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Roll Number
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.school?.roll_number || ""}
                    onChange={(e) =>
                      handleInputChange("school", "roll_number", e.target.value)
                    }
                    className="input input-bordered input-sm"
                    placeholder="Enter roll number"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {studentData.school?.roll_number || "---"}
                  </div>
                )}
              </div>

              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Class Joined
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.school?.class_joined || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "school",
                        "class_joined",
                        e.target.value
                      )
                    }
                    className="input input-bordered input-sm"
                    placeholder="Enter class joined"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {studentData.school?.class_joined || "---"}
                  </div>
                )}
              </div>

              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Previous School
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.school?.prev_school || ""}
                    onChange={(e) =>
                      handleInputChange("school", "prev_school", e.target.value)
                    }
                    className="input input-bordered input-sm"
                    placeholder="Enter previous school"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {studentData.school?.prev_school || "---"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Section>

        {/* Parent/Guardian Information */}
        <Section title="Parent/Guardian Information">
          <div className="bg-base-100 p-6 rounded-lg border border-base-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Father Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-primary">
                  Father Information
                </h4>
                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Name
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.parent?.father_name || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "parent",
                          "father_name",
                          e.target.value
                        )
                      }
                      className="input input-bordered input-sm"
                      placeholder="Enter father's name"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {studentData.parent?.father_name || "---"}
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Age
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formatDateForInput(
                        editData.parent?.father_age 
                        )}
                      onChange={(e) =>
                        handleInputChange(
                          "parent",
                          "father_age",
                          e.target.value
                        )
                      }
                      className={`input input-bordered input-sm ${getValidationError("parent.father_age")
                          ? "input-error"
                          : ""
                        }`}
                      placeholder="Enter father's Age"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {calculateAge(studentData.parent?.father_age) || "---"}
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Mobile
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.parent?.father_contact || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "parent",
                          "father_contact",
                          e.target.value
                        )
                      }
                      className="input input-bordered input-sm"
                      placeholder="Enter father's mobile number"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {studentData.parent?.father_contact || "---"}
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Email
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.parent?.father_contact || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "parent",
                          "father_email",
                          e.target.value
                        )
                      }
                      className="input input-bordered input-sm"
                      placeholder="Enter father's email"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {studentData.parent?.father_email || "---"}
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Occupation
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.parent?.father_occupation || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "parent",
                          "father_occupation",
                          e.target.value
                        )
                      }
                      className="input input-bordered input-sm"
                      placeholder="Enter father's occupation"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {studentData.parent?.father_occupation || "---"}
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Address
                    </span>
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.parent?.father_address || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "parent",
                          "father_address",
                          e.target.value
                        )
                      }
                      className="textarea textarea-bordered textarea-sm"
                      placeholder="Enter father's contact"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800 min-h-[80px] whitespace-pre-line">
                      {studentData.parent?.father_address || "---"}
                    </div>
                  )}
                </div>
              </div>

              {/* Mother Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-primary">
                  Mother Information
                </h4>
                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Name
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.parent?.mother_name || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "parent",
                          "mother_name",
                          e.target.value
                        )
                      }
                      className="input input-bordered input-sm"
                      placeholder="Enter mother's name"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {studentData.parent?.mother_name || "---"}
                    </div>
                  )}
                </div>
                
                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Age
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formatDateForInput(
                        editData.parent?.mother_age 
                        )}
                      onChange={(e) =>
                        handleInputChange(
                          "parent",
                          "mother_age",
                          e.target.value
                        )
                      }
                      className={`input input-bordered input-sm ${getValidationError("parent.father_age")
                          ? "input-error"
                          : ""
                        }`}
                      placeholder="Enter mother's Age"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {calculateAge(studentData.parent?.mother_age) || "---"}
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Mobile
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.parent?.mother_contact || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "parent",
                          "mother_contact",
                          e.target.value
                        )
                      }
                      className="input input-bordered input-sm"
                      placeholder="Enter mother's mobile number"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {studentData.parent?.mother_contact || "---"}
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Email
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.parent?.mother_email || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "parent",
                          "mother_email",
                          e.target.value
                        )
                      }
                      className="input input-bordered input-sm"
                      placeholder="Enter mother's email"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {studentData.parent?.mother_email || "---"}
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Occupation
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.parent?.mother_occupation || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "parent",
                          "mother_occupation",
                          e.target.value
                        )
                      }
                      className="input input-bordered input-sm"
                      placeholder="Enter mother's occupation"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {studentData.parent?.mother_occupation || "---"}
                    </div>
                  )}
                </div>

                
                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Address
                    </span>
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.parent?.mother_address || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "parent",
                          "mother_address",
                          e.target.value
                        )
                      }
                      className="textarea textarea-bordered textarea-sm"
                      placeholder="Enter mother's contact"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800 min-h-[80px] whitespace-pre-line">
                      {studentData.parent?.mother_address || "---"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            {/* Guardian Same as Parent – Single Line */}


            <div className="mt-8">
              <h4 className="text-lg font-semibold text-primary mb-4">
                Guardian Information
              </h4>
              <div className="space-y-2">
  <div className="flex items-center gap-3">
    <span className="text-sm font-medium text-gray-700">
      Guardian Same as Parent
    </span>

    {isEditing ? (
      <input
        type="checkbox"
        className="toggle toggle-success toggle-sm"
        checked={editData.parent?.guardian_same === true}
        onChange={(e) =>
          handleInputChange("parent", "guardian_same", e.target.checked)
        }
      />
    ) : (
      <span className="text-sm font-semibold">
        {studentData.parent?.guardian_same ? "Yes" : "No"}
      </span>
    )}
  </div>
</div>
{(isEditing
  ? editData.parent?.guardian_same === true
  : studentData.parent?.guardian_same === true) && (
  <div className="mt-4 space-y-2 text-sm text-gray-700">
    <div>
      <strong>Guardian:</strong> Father / Mother (Same as Parent)
    </div>
    <div className="text-gray-500">
      Guardian details are same as parent information shown above.
    </div>
  </div>
)}

{(isEditing
  ? editData.parent?.guardian_same === false
  : studentData.parent?.guardian_same === false) && (
  
    <div className="space-y-4">
                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Name
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.parent?.guardian_name || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "parent",
                          "guardian_name",
                          e.target.value
                        )
                      }
                      className="input input-bordered input-sm "
                      placeholder="Enter guardian's name"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {studentData.parent?.guardian_name || "---"}
                    </div>
                  )}
                </div>
                
                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Age
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formatDateForInput(
                        editData.parent?.guardian_age 
                        )}
                      onChange={(e) =>
                        handleInputChange(
                          "parent",
                          "guardian_age",
                          e.target.value
                        )
                      }
                      className={`input input-bordered input-sm ${getValidationError("parent.father_age")
                          ? "input-error"
                          : ""
                        }`}
                      placeholder="Enter guardian's Age"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {calculateAge(studentData.parent?.guardian_age) || "---"}
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Mobile
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.parent?.guardian_contact || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "parent",
                          "guardian_contact",
                          e.target.value
                        )
                      }
                      className="input input-bordered input-sm"
                      placeholder="Enter guardian's mobile number"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {studentData.parent?.guardian_contact || "---"}
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Email
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.parent?.guardian_email || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "parent",
                          "guardian_email",
                          e.target.value
                        )
                      }
                      className="input input-bordered input-sm"
                      placeholder="Enter guardian's email"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {studentData.parent?.guardian_email || "---"}
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Occupation
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.parent?.guardian_occupation || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "parent",
                          "guardian_occupation",
                          e.target.value
                        )
                      }
                      className="input input-bordered input-sm"
                      placeholder="Enter guardian's occupation"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {studentData.parent?.guardian_occupation || "---"}
                    </div>
                  )}
                </div>

                
                <div className="form-control">
                  <label className="label block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Address
                    </span>
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.parent?.guardian_address || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "parent",
                          "guardian_address",
                          e.target.value
                        )
                      }
                      className="textarea textarea-bordered textarea-sm"
                      placeholder="Enter guardian's contact"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-gray-800 min-h-[80px] whitespace-pre-line">
                      {studentData.parent?.guardian_address || "---"}
                    </div>
                  )}
                </div>
              </div>
)}

              
            </div>
          </div>
        </Section>

        {/* Caste Information */}
        <Section title="Caste Information">
          <div className="bg-base-100 p-6 rounded-lg border border-base-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Religion
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.caste?.religion || ""}
                    onChange={(e) =>
                      handleInputChange("caste", "religion", e.target.value)
                    }
                    className="input input-bordered input-sm"
                    placeholder="Enter religion"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {studentData.caste?.religion || "---"}
                  </div>
                )}
              </div>

              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Caste
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.caste?.caste || ""}
                    onChange={(e) =>
                      handleInputChange("caste", "caste", e.target.value)
                    }
                    className="input input-bordered input-sm"
                    placeholder="Enter caste"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {studentData.caste?.caste || "---"}
                  </div>
                )}
              </div>

              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Sub Caste
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.caste?.sub_caste || ""}
                    onChange={(e) =>
                      handleInputChange("caste", "sub_caste", e.target.value)
                    }
                    className="input input-bordered input-sm"
                    placeholder="Enter sub caste"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {studentData.caste?.sub_caste || "---"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Section>

        {/* Save All Changes Button */}
        {isEditing && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="btn btn-primary btn-lg shadow-lg"
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save All Changes
                </>
              )}
            </button>
          </div>
        )}
      </Suspense>
    </div>
  );
};

export default StudentProfileViewEdit;
