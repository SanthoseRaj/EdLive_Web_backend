import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Tab } from "@headlessui/react";
import React from "react";
import axios from "axios";
import { initiateRazorpayPayment, initiateTestUPIPayment } from "../utils/paymentGateway";

// Import tab components
import TeachersTab from "./classes/TeachersTab.js";
import StudentsTab from "./classes/StudentsTab.js";
import TimetableTab from "./classes/TimetableTab.js";
import PaymentsTab from "./classes/PaymentsTab.js";

const PaymentPage = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState("All");
  const [classData, setClassData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Teachers");
  const [fees, setFees] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [newPayment, setNewPayment] = useState({
    name: "",
    description: "",
    amount: "",
  });
  const [selectedDivisions, setSelectedDivisions] = useState([]);
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editingFeeType, setEditingFeeType] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [isEditingFeeType, setIsEditingFeeType] = useState(false);
  const [isEditingAssignment, setIsEditingAssignment] = useState(false);
  const [pendingStudents, setPendingStudents] = useState({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    fee_type_id: "",
    due_date: "",
    academic_year: "2025-2026",
  });
  const [addingPayment, setAddingPayment] = useState(false);
  const [addingAssignment, setAddingAssignment] = useState(false);
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [upiId, setUpiId] = useState("sumandominic@okaxis");
  const [qrCodes, setQrCodes] = useState({});
  // --- Division Modal States ---
const [showDivisionModal, setShowDivisionModal] = useState(false);
const [divisionForm, setDivisionForm] = useState({
  className: "",
  divisionName: "",
  maxStudents: "",
  classTeacher: "",
});
  const [showClassModal, setShowClassModal] = useState(false);
const [classForm, setClassForm] = useState({
  newClassName: "",
  selectedClass: "",
  divisionName: "",
  maxStudents: "",
  classTeacher: "",
});
  const [editMode, setEditMode] = useState(false);
  const [tempDivisions, setTempDivisions] = useState([]);
  const [tempClasses, setTempClasses] = useState([]); // temporary new classes
const [tempClassDivisions, setTempClassDivisions] = useState({}); // map class -> divisions


  // Fetch classes and fee types on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch classes
        const classResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/master/classes`,
          { withCredentials: true }
        );
        setClassData(classResponse.data);
        if (classResponse.data.length > 0)
          setSelectedClass(classResponse.data[0].class);

        // Fetch fee types
        const feeTypesResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/payments/fee-types`,
          { withCredentials: true }
        );
        setFeeTypes(feeTypesResponse.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);


  useEffect(() => {
    // Wait until classData is loaded so we can validate divisions
    if (!classData || classData.length === 0) return;

    const incoming = location?.state || {};
    // support both direct state or a wrapped 'prev' object (your StaffProfileViewEdit uses direct fields)
    const payload = incoming.prev ? incoming.prev : incoming;

    if (!payload) return;

    // If a class was passed, set it
    if (payload.selectedClass) {
      setSelectedClass(payload.selectedClass);
      // compute actual divisions present for that class
      const realDivisions = classData
        .filter((it) => it.class === payload.selectedClass)
        .map((it) => it.section);

      if (Array.isArray(payload.selectedDivisions) && payload.selectedDivisions.length > 0) {
        // keep only divisions that actually exist, fallback to all if none match
        const filtered = payload.selectedDivisions.filter((d) =>
          realDivisions.includes(d)
        );
        setSelectedDivisions(filtered.length > 0 ? filtered : realDivisions);
      } else {
        // if incoming divisions empty, select all divisions for selectedClass
        setSelectedDivisions(realDivisions);
      }
    }

    // If activeTab (Teachers/Students/Time Table/Payments) passed, set the tab
    if (payload.activeTab) {
      setActiveTab(payload.activeTab);
    }
  // run when classData or location.state changes
  }, [classData, location?.state]);


  useEffect(() => {
    if (selectedClass) {
      // Select all divisions by default when class changes
      const divisions = getDivisions();
      setSelectedDivisions(divisions);
    }
  }, [selectedClass]);

  const toggleDivision = (division) => {
    setSelectedDivisions((prev) =>
      prev.includes(division)
        ? prev.filter((d) => d !== division)
        : [...prev, division]
    );
  };

  // Select all divisions
  const selectAllDivisions = () => {
    const divisions = getDivisions();
    setSelectedDivisions(divisions);
  };

  // Clear all divisions selection
  const clearAllDivisions = () => {
    setSelectedDivisions([]);
  };

  const handleSaveDivision = async () => {
  try {
    if (!divisionForm.className || !divisionForm.divisionName) {
      alert("Please enter all required fields");
      return;
    }

    // TODO: Replace with API call to create division
    console.log("New Division Saved:", divisionForm);

    setShowDivisionModal(false);
    setDivisionForm({
      className: "",
      divisionName: "",
      maxStudents: "",
      classTeacher: "",
    });
  } catch (error) {
    console.error("Error saving division:", error);
  }
  };
  const handleAddClass = () => {
  const newClassName = classForm.newClassName.trim();
  if (!newClassName) {
    alert("Please enter a class name");
    return;
  }

  // Prevent duplicate (backend or temporary)
  const existing = [...getClassNames(), ...tempClasses];
  if (existing.includes(newClassName)) {
    alert("Class already exists!");
    return;
  }

  // Add to temp list
  setTempClasses([...tempClasses, newClassName]);
  setClassForm({ ...classForm, newClassName: "" });
};

const handleSaveClass = async () => {
  try {
    // Get only temp-created classes that have divisions
    for (const className of tempClasses) {
      const divisions = tempClassDivisions[className] || [];

      if (divisions.length === 0) {
        alert(`Please add at least one division for class ${className}`);
        return;
      }

      // Save to backend
      for (const section of divisions) {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/master/classes`,
          {
            class: className,
            section: section,
          },
          { withCredentials: true }
        );
      }
    }

    // Also save any new divisions for existing classes
    for (const [className, divisions] of Object.entries(tempClassDivisions)) {
      if (!tempClasses.includes(className)) {
        for (const section of divisions) {
          await axios.post(
            `${process.env.REACT_APP_API_URL}/api/master/classes`,
            {
              class: className,
              section: section,
            },
            { withCredentials: true }
          );
        }
      }
    }

    // Refresh class list
    const classResponse = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/master/classes`,
      { withCredentials: true }
    );
    setClassData(classResponse.data);

    // Clear temporary data
    setTempClasses([]);
    setTempClassDivisions({});
    setClassForm({
      newClassName: "",
      selectedClass: "",
      divisionName: "",
      maxStudents: "",
      classTeacher: "",
    });
    setShowClassModal(false);

    alert("Classes and divisions saved successfully!");
  } catch (error) {
    console.error("Error saving class/division:", error);
    alert("Failed to save class/division");
  }
};


  const DivisionDropdown = () => (
    <div className="relative">
      <button
        className="select select-bordered w-full max-w-xs text-left flex justify-between items-center"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span>
          {selectedDivisions.length === 0
            ? "Select divisions"
            : selectedDivisions.length === getDivisions().length
            ? "All divisions"
            : `${selectedDivisions.length} selected`}
        </span>
        <svg
          className={`h-5 w-5 transition-transform ${
            dropdownOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2 border-b border-gray-200 flex justify-between">
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={selectAllDivisions}
            >
              Select All
            </button>
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={clearAllDivisions}
            >
              Clear All
            </button>
          </div>
          {getDivisions().map((division, index) => (
            <label
              key={index}
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm mr-2"
                checked={selectedDivisions.includes(division)}
                onChange={() => toggleDivision(division)}
              />
              <span>{division}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  // Fetch fee assignments when class or academic year changes
  useEffect(() => {
    if (!selectedClass || selectedDivisions.length === 0) return;

    const fetchFeeAssignments = async () => {
      try {
        // Get the class IDs for selected divisions
        const classIds = classData
          .filter(
            (item) =>
              item.class === selectedClass &&
              selectedDivisions.includes(item.section)
          )
          .map((item) => item.id);

        if (classIds.length === 0) return;

        const classIdsParam = classIds.join(",");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/payments/assignments`,
          {
            params: {
              class_ids: classIdsParam,
              academic_year: academicYear,
            },
            withCredentials: true,
          }
        );

        const feesWithData = response.data.data.map((fee) => ({
          id: fee.id,
          name: fee.fee_name,
          amount: fee.base_amount,
          feetypeid: fee.fee_type_id,
          academicyear: fee.academic_year,
          dueDate: new Date(fee.due_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          rawDueDate: fee.due_date,
          pending: fee.pending_count,
          qrCode: fee.upi_link,
          pendingStudents: fee.pending_students || [],
        }));
        setFees(feesWithData);
      } catch (error) {
        console.error("Failed to fetch fee assignments:", error);
        setError("Failed to load fee data");
      }
    };

    fetchFeeAssignments();
  }, [selectedClass, selectedDivisions, academicYear]);

  const getClassNames = () =>
    [...new Set(classData.map((item) => item.class))].sort();
  const getDivisions = () =>
    !selectedClass
      ? []
      : classData
          .filter((item) => item.class === selectedClass)
          .map((item) => item.section);

  const handleAddPayment = async () => {
    try {
      const { name, description, amount } = newPayment;
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/payments/fee-types`,
        { name, description, amount: parseFloat(amount) },
        { withCredentials: true }
      );

      if (res.data.success) {
        const feeTypesResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/payments/fee-types`,
          { withCredentials: true }
        );
        setFeeTypes(feeTypesResponse.data.data);
        setNewPayment({ name: "", description: "", amount: "" });
        setAddingPayment(false);
      }
    } catch (error) {
      console.error("Failed to add payment:", error);
    }
  };

  const handleAddAssignment = async () => {
    try {
      let classItems = [];
      if (selectedDivision === "All") {
        classItems = classData.filter((item) => item.class === selectedClass);
      } else {
        const classItem = classData.find(
          (item) =>
            item.class === selectedClass && item.section === selectedDivision
        );
        if (classItem) {
          classItems = [classItem];
        }
      }

      if (classItems.length === 0) {
        throw new Error("No matching classes found");
      }

      const assignments = await Promise.all(
        classItems.map(async (classItem) => {
          const res = await axios.post(
            `${process.env.REACT_APP_API_URL}/api/payments/assignments`,
            {
              fee_type_id: parseInt(newAssignment.fee_type_id),
              class_id: classItem.id,
              academic_year: newAssignment.academic_year,
              due_date: newAssignment.due_date,
            },
            { withCredentials: true }
          );
          return res.data.data;
        })
      );

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/payments/assignments/${selectedClass}`,
        {
          params: { academic_year: academicYear },
          withCredentials: true,
        }
      );

      setFees(
        response.data.data.map((fee) => ({
          id: fee.id,
          name: fee.fee_name,
          amount: fee.base_amount,
          dueDate: new Date(fee.due_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          rawDueDate: fee.due_date,
          pending: 0,
        }))
      );

      setNewAssignment({
        fee_type_id: "",
        due_date: "",
        academic_year: "2025-2026",
      });
      setAddingAssignment(false);
    } catch (error) {
      console.error("Failed to add assignment:", error);
      setError("Failed to create fee assignment");
    }
  };

  const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleAcademicYearChange = (e) => {
    setAcademicYear(e.target.value);
  };

  const handleEditFeeType = (feeType) => {
    setEditingFeeType(feeType);
    setNewPayment({
      name: feeType.name,
      description: feeType.description,
      amount: feeType.amount.toString(),
    });
    setIsEditingFeeType(true);
    setAddingPayment(true);
  };

  const handleUpdateFeeType = async () => {
    try {
      const { name, description, amount } = newPayment;
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/payments/fee-types/${editingFeeType.id}`,
        { name, description, amount: parseFloat(amount) },
        { withCredentials: true }
      );

      if (res.data.success) {
        const feeTypesResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/payments/fee-types`,
          { withCredentials: true }
        );
        setFeeTypes(feeTypesResponse.data.data);
        setNewPayment({ name: "", description: "", amount: "" });
        setEditingFeeType(null);
        setIsEditingFeeType(false);
        setAddingPayment(false);
      }
    } catch (error) {
      console.error("Failed to update fee type:", error);
    }
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setNewAssignment({
      fee_type_id: assignment.feetypeid.toString(),
      due_date: assignment.rawDueDate
        ? assignment.rawDueDate.split("T")[0]
        : new Date().toISOString().split("T")[0],
      academic_year: assignment.academicyear,
    });
    setIsEditingAssignment(true);
    setAddingAssignment(true);
  };

  const handleUpdateAssignment = async () => {
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/payments/assignments/${editingAssignment.id}`,
        {
          fee_type_id: parseInt(newAssignment.fee_type_id),
          due_date: newAssignment.due_date,
          academic_year: newAssignment.academic_year,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/payments/assignments`,
          {
            params: {
              class_ids: editingAssignment.class_id,
              academic_year: academicYear,
            },
            withCredentials: true,
          }
        );

        setFees(
          response.data.data.map((fee) => ({
            id: fee.id,
            name: fee.fee_name,
            amount: fee.base_amount,
            dueDate: new Date(fee.due_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            rawDueDate: fee.due_date,
            pending: 0,
          }))
        );

        setNewAssignment({
          fee_type_id: "",
          due_date: "",
          academic_year: "2025-2026",
        });
        setEditingAssignment(null);
        setIsEditingAssignment(false);
        setAddingAssignment(false);
      }
    } catch (error) {
      console.error("Failed to update assignment:", error);
    }
  };

  const handleDeleteFeeType = async (feeTypeId) => {
    try {
      const res = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/payments/fee-types/${feeTypeId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        const feeTypesResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/payments/fee-types`,
          { withCredentials: true }
        );
        setFeeTypes(feeTypesResponse.data.data);
      }
    } catch (error) {
      console.error("Failed to delete fee type:", error);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      const res = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/payments/assignments/${assignmentId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/payments/assignments`,
          {
            params: {
              class_ids: selectedClass,
              academic_year: academicYear,
            },
            withCredentials: true,
          }
        );

        setFees(
          response.data.data.map((fee) => ({
            id: fee.id,
            name: fee.fee_name,
            amount: fee.base_amount,
            dueDate: new Date(fee.due_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            rawDueDate: fee.due_date,
            pending: 0,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to delete assignment:", error);
    }
  };

  const handleTestPayment = async (fee) => {
    setIsProcessingPayment(true);
    try {
      const paymentResult = await initiateTestUPIPayment(
        upiId,
        fee.amount,
        `Payment for ${fee.name} (ID: ${fee.id})`
      );

      if (paymentResult.success) {
        alert(
          `Test payment successful! Transaction ID: ${paymentResult.transactionId}`
        );
      }
    } catch (error) {
      console.error("Payment failed:", error);
      alert(`Payment failed: ${error.message}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleRazorpayPayment = async (fee) => {
    setIsProcessingPayment(true);
    try {
      const options = {
        description: `Fee Payment: ${fee.name}`,
        notes: {
          fee_id: fee.id,
          student_class: selectedClass,
          division: selectedDivision,
        },
      };

      const response = await initiateRazorpayPayment(
        fee.amount,
        "INR",
        options
      );

      const verification = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/payments/verify`,
        {
          razorpay_payment_id: response.razorpay_payment_id,
          fee_id: fee.id,
        },
        { withCredentials: true }
      );

      if (verification.data.success) {
        alert("Payment verified successfully!");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/payments/assignments`,
          {
            params: {
              class_ids: selectedClass,
              academic_year: academicYear,
            },
            withCredentials: true,
          }
        );
        setFees(
          response.data.data.map((fee) => ({
            id: fee.id,
            name: fee.fee_name,
            amount: fee.base_amount,
            dueDate: new Date(fee.due_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            rawDueDate: fee.due_date,
            pending: fee.pending_count,
          }))
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="alert alert-error max-w-md">Error: {error}</div>
      </div>
    );

  // Render active tab component
  const renderActiveTab = () => {
    const tabProps = {
      selectedClass,
      selectedDivisions,
    };

    switch (activeTab) {
      case "Teachers":
        return <TeachersTab key="teachers" {...tabProps} />;
      case "Students":
        return <StudentsTab key="students" {...tabProps} />;
      case "Time Table":
        return <TimetableTab key="payments" {...tabProps} />;
      case "Payments":
        return (
          <PaymentsTab
            key="timetable"
            {...tabProps}
            fees={fees}
            feeTypes={feeTypes}
            newPayment={newPayment}
            setNewPayment={setNewPayment}
            addingPayment={addingPayment}
            setAddingPayment={setAddingPayment}
            isEditingFeeType={isEditingFeeType}
            setIsEditingFeeType={setIsEditingFeeType}
            editingFeeType={editingFeeType}
            setEditingFeeType={setEditingFeeType}
            handleEditFeeType={handleEditFeeType}
            handleUpdateFeeType={handleUpdateFeeType}
            handleAddPayment={handleAddPayment}
            handleDeleteFeeType={handleDeleteFeeType}
            newAssignment={newAssignment}
            setNewAssignment={setNewAssignment}
            addingAssignment={addingAssignment}
            setAddingAssignment={setAddingAssignment}
            isEditingAssignment={isEditingAssignment}
            setIsEditingAssignment={setIsEditingAssignment}
            editingAssignment={editingAssignment}
            setEditingAssignment={setEditingAssignment}
            handleEditAssignment={handleEditAssignment}
            handleUpdateAssignment={handleUpdateAssignment}
            handleAddAssignment={handleAddAssignment}
            handleDeleteAssignment={handleDeleteAssignment}
            handleTestPayment={handleTestPayment}
            handleRazorpayPayment={handleRazorpayPayment}
            isProcessingPayment={isProcessingPayment}
            formatNumberWithCommas={formatNumberWithCommas}
            academicYear={academicYear}
          />
        );
      default:
        return <TeachersTab key="teachers" {...tabProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#EECFF2]">
      <div className="py-6 px-4">
        <div className="container mx-auto flex items-center gap-3">
          <div className="bg-white text-[#6C2CA4] p-2 rounded">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M9 16h6"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#6C2CA4]">Classes</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Section — Class List */}
<div className="bg-white rounded-lg shadow-md p-0 flex flex-col h-full border border-gray-200 overflow-hidden">
  {/* Header */}
  <div className="bg-white px-4 py-3 border-b border-gray-200">
    <h2 className="text-lg font-semibold text-[#6C2CA4]">All classes</h2>
  </div>

  {/* Upload Button */}
  <div className="px-4 py-3 border-b border-gray-200">
    <button
      className="w-full flex items-center justify-center gap-2 bg-[#00a9ec] text-white font-medium hover:bg-[#0090c7] transition-colors p-2 h-10"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4"
        />
      </svg>
      Upload student list
    </button>
  </div>

  {/* Class List */}
  <div className="flex-1 overflow-y-auto">
  {[...getClassNames(), ...tempClasses]
    .sort((a, b) => {
      const isNumA = /^\d+$/.test(a);
      const isNumB = /^\d+$/.test(b);

      if (!isNumA && !isNumB) {
        return a.localeCompare(b, undefined, { sensitivity: "base" });
      }

      if (!isNumA && isNumB) return -1;
      if (isNumA && !isNumB) return 1;

      return Number(a) - Number(b);
    })
    .map((cls, index) => {
      const divisions = classData.filter((item) => item.class === cls);
      const isTemp = tempClasses.includes(cls);

      return (
        <div
          key={index}
          className={`flex justify-between items-center px-4 py-2 text-sm cursor-pointer border-b border-gray-100
            ${
              selectedClass === cls
                ? "bg-[#AEE2F9] text-[#004d6e] font-semibold"
                : "hover:bg-gray-50"
            }
            ${isTemp ? "italic text-[#0090c7]" : ""}`}
          onClick={() => setSelectedClass(cls)}
        >
          <span>{cls}</span>
          <span className="text-gray-500 text-xs">
            {divisions.length > 0
              ? `${divisions.length} division${divisions.length > 1 ? "s" : ""}`
              : isTemp
              ? "unsaved"
              : "0 division"}
          </span>
        </div>
      );
    })}
</div>



  {/* Add New Class */}
  <div className="p-4 border-t border-gray-200 text-center bg-gray-50">
    <button
      onClick={() => setShowClassModal(true)}
      className="flex flex-col items-center text-[#00a9ec] hover:text-[#0090c7] transition-colors mx-auto"
    >
      <div className="border border-[#00a9ec] rounded-full p-2 mb-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
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
      <span className="text-sm font-medium">Add new class</span>
    </button>
  </div>
</div>


        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4">            
            <div className="mt-4 flex flex-col gap-2">
  
  {/* Row 1: Edit & Menu (Aligned Right) */}
  <div className="flex items-center gap-4 justify-end w-full">
    {/* Edit Toggle */}
    <label className="flex items-center gap-2 text-gray-700 font-medium cursor-pointer">
      Edit
      <input
        type="checkbox"
        disabled={activeTab !== "Time Table"}
        className={`toggle align-middle appearance-none w-12 h-6 rounded-full transition-all duration-300
        ${editMode ? "bg-green-500" : "bg-gray-300"}
        ${activeTab !== "Time Table" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        style={{
          backgroundImage: editMode ? "none" : "none",
          position: "relative",
        }}
        checked={editMode}
        onChange={() => {
          if (activeTab === "Time Table") setEditMode(!editMode);
        }}
      />
    </label>

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
          <li><button>Generate PDF</button></li>
          <li><button>Print</button></li>
          <li>
            <button
              onClick={() => {
                setDivisionForm({ ...divisionForm, className: selectedClass });
                setShowDivisionModal(true);
              }}
            >
              Add Division
            </button>
          </li>
          <li><button>Delete Selected Division</button></li>
          <li><button>Delete Selected Class</button></li>
        </ul>
      </div>
    </div>
  </div>

  {/* Row 2: Class Name & Divisions (Labels on top) */}
  <div className="flex flex-wrap gap-4">
    <div>
      <label className="block text-sm font-medium mb-1">Class Name</label>
      <div className="w-full max-w-xs  px-3 py-2 text-gray-700 font-medium">
        {selectedClass || "No class selected"}
      </div>
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-1">
        Divisions ({getDivisions().length})
      </label>
      <DivisionDropdown />
                </div>
                {/* 3. Selected Divisions List (Styled as Rounded Rectangle Chips) */}
  {selectedDivisions.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-1 items-end">
                    
      {selectedDivisions.map((div, index) => (
        <button
          key={index}
          className="border border-gray-300 px-3 py-3 rounded-md text-sm bg-gray-100 hover:bg-white text-gray-700 flex items-center gap-2 shadow-sm transition-all w-fit h-10"
          onClick={() => toggleDivision(div)}
        >
          <span className="font-medium">{div}</span>
          <span className="text-gray-400 hover:text-red-500 font-bold text-xs">✕</span>
        </button>
      ))}
    </div>
  )}
  </div>

</div>

            
            <Tab.Group selectedIndex={
  ["Teachers", "Students", "Time Table", "Payments"].indexOf(activeTab)
} onChange={(index) => {
  const tabs = ["Teachers", "Students", "Time Table", "Payments"];
  setActiveTab(tabs[index]);
}}>
  <Tab.List className="flex gap-6 border-b border-gray-200 text-sm mt-4">
    {["Teachers", "Students", "Time Table", "Payments"].map((tab) => (
      <Tab
        key={tab}
        className={({ selected }) =>
          `pb-2 focus:outline-none ${
            selected
              ? "font-semibold text-[#00a9ec] border-b-2 border-[#00a9ec]"
              : "text-gray-600 hover:text-[#00a9ec]"
          }`
        }
      >
        {tab}
      </Tab>
    ))}
  </Tab.List>

  <Tab.Panels className="bg-white rounded-lg shadow-md p-4 mt-2">
    <Tab.Panel key="teachers">
      <TeachersTab
        selectedClass={selectedClass}
        selectedDivisions={selectedDivisions}
        activeTab={activeTab}
      />
    </Tab.Panel>
    <Tab.Panel key="students">
      <StudentsTab
        selectedClass={selectedClass}
        selectedDivisions={selectedDivisions}
      />
    </Tab.Panel>
    <Tab.Panel key="timetable">
      <TimetableTab
        selectedClass={selectedClass}
        selectedDivisions={selectedDivisions}
        editMode={editMode}
      />
    </Tab.Panel>
    <Tab.Panel key="payments">
      <PaymentsTab
        selectedClass={selectedClass}
        selectedDivisions={selectedDivisions}
        fees={fees}
        feeTypes={feeTypes}
        newPayment={newPayment}
        setNewPayment={setNewPayment}
        addingPayment={addingPayment}
        setAddingPayment={setAddingPayment}
        isEditingFeeType={isEditingFeeType}
        setIsEditingFeeType={setIsEditingFeeType}
        editingFeeType={editingFeeType}
        setEditingFeeType={setEditingFeeType}
        handleEditFeeType={handleEditFeeType}
        handleUpdateFeeType={handleUpdateFeeType}
        handleAddPayment={handleAddPayment}
        handleDeleteFeeType={handleDeleteFeeType}
        newAssignment={newAssignment}
        setNewAssignment={setNewAssignment}
        addingAssignment={addingAssignment}
        setAddingAssignment={setAddingAssignment}
        isEditingAssignment={isEditingAssignment}
        setIsEditingAssignment={setIsEditingAssignment}
        editingAssignment={editingAssignment}
        setEditingAssignment={setEditingAssignment}
        handleEditAssignment={handleEditAssignment}
        handleUpdateAssignment={handleUpdateAssignment}
        handleAddAssignment={handleAddAssignment}
        handleDeleteAssignment={handleDeleteAssignment}
        handleTestPayment={handleTestPayment}
        handleRazorpayPayment={handleRazorpayPayment}
        isProcessingPayment={isProcessingPayment}
        formatNumberWithCommas={formatNumberWithCommas}
        academicYear={academicYear}
      />
    </Tab.Panel>
  </Tab.Panels>
</Tab.Group>

          </div>

          {/* <div className="bg-white rounded-lg shadow-md p-4">
            {renderActiveTab()}
          </div> */}
        </div>
      </div>
      {showDivisionModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
      {/* Close Button */}
      <button
        onClick={() => setShowDivisionModal(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
      >
        ✕
      </button>

      <h2 className="text-2xl font-semibold text-[#6C2CA4] mb-4">
        New Division
      </h2>

      <div className="space-y-4">
        {/* Class selected */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class selected
          </label>
          <input
            type="text"
            value={divisionForm.className}
            disabled
            className="input input-bordered w-full bg-gray-100  h-10"
          />
        </div>

        {/* Division + Max Students Section */}
        {/* Division + Max Students Section */}
<div className="grid grid-cols-[1fr_7rem] gap-4">
  
  {/* Division name */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Division name
    </label>

    <div className="flex gap-2 items-center">
      <input
        type="text"
        value={divisionForm.divisionName}
        onChange={(e) =>
          setDivisionForm({
            ...divisionForm,
            divisionName: e.target.value,
          })
        }
        className="input input-bordered w-24 h-10"
        placeholder="A"
      />

      <button
        onClick={() => {
          const newDiv = divisionForm.divisionName.trim();
          if (
            newDiv &&
            !selectedDivisions.includes(newDiv) &&
            !tempDivisions.includes(newDiv)
          ) {
            setTempDivisions([...tempDivisions, newDiv]);
            setDivisionForm({
              ...divisionForm,
              divisionName: "",
            });
          }
        }}
        className="btn btn-sm bg-[#00a9ec] text-white hover:bg-[#0090c7] h-10"
      >
        Add
      </button>
    </div>

    {/* Chips */}
    <div className="flex flex-wrap gap-2 mt-2">
      {[...selectedDivisions, ...tempDivisions].map((div, idx) => (
        <div
          key={idx}
          className="flex items-center gap-1 border px-3 py-1 rounded-full text-sm bg-gray-100"
        >
          {div}
        </div>
      ))}
    </div>
  </div>

  {/* Max students */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Max. No. of Students
    </label>

    <input
      type="number"
      value={divisionForm.maxStudents}
      onChange={(e) =>
        setDivisionForm({
          ...divisionForm,
          maxStudents: e.target.value,
        })
      }
      className="input input-bordered w-full h-10"
      placeholder="40"
    />
  </div>
</div>


        {/* Class Teacher */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class teacher
          </label>
          <input
            type="text"
            value={divisionForm.classTeacher}
            onChange={(e) =>
              setDivisionForm({
                ...divisionForm,
                classTeacher: e.target.value,
              })
            }
            className="input input-bordered w-full h-10"
            placeholder="Start to type name..."
          />
          <p className="text-xs text-gray-500 mt-1">You can add later</p>
        </div>

        <p className="text-sm text-gray-500">
          Once saved you can select class from the class list and add details.
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setShowDivisionModal(false)}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              try {
                const divisionsToSave = [
                  ...new Set([...selectedDivisions, ...tempDivisions]),
                ];

                if (!divisionForm.className || tempDivisions.length === 0) {
                  alert("Please enter at least one division name");
                  return;
                }

                for (const division of tempDivisions) {
  await axios.post(
    `${process.env.REACT_APP_API_URL}/api/master/classes`,
    {
      class: divisionForm.className,
      section: division,
    },
    { withCredentials: true }
  );
                }
                const classResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/master/classes`,
        { withCredentials: true }
      );
      setClassData(classResponse.data);

                setDivisionForm({
        className: "",
        divisionName: "",
        maxStudents: "",
        classTeacher: "",
      });
      setTempDivisions([]);
      setSelectedDivisions([]);
      setShowDivisionModal(false);

      alert("New division(s) added successfully!");
              } catch (err) {
                console.error("Error saving division:", err);
                alert("Failed to save division.");
              }
            }}
            className="btn bg-[#6C2CA4] text-white hover:bg-[#5b2392]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
)}


      {/* --- Add Class/Division Modal --- */}
{showClassModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-8 relative">
      {/* Close Button */}
      <button
        onClick={() => setShowClassModal(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
      >
        ×
      </button>

      {/* Header */}
      <h2 className="text-2xl font-semibold text-[#6C2CA4] mb-6 border-b pb-2">
        New Class/Division
      </h2>

      {/* Main layout: two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6 border-r pr-6">
          {/* New class name input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New class name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={classForm.newClassName}
                onChange={(e) =>
                  setClassForm({ ...classForm, newClassName: e.target.value })
                }
                className="input input-bordered w-full  h-10"
                placeholder="Enter class name"
              />
              <button
                className="px-3 py-1 bg-[#00a9ec] text-white rounded hover:bg-[#0090c7] text-sm  h-10"
                onClick={handleAddClass}
              >
                Add
              </button>
            </div>
          </div>

          {/* Select class list */}
          <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Select class to add division
  </label>

  <div className="border rounded-md max-h-72 overflow-y-auto">
    {[...getClassNames(), ...tempClasses]
      .sort((a, b) => {
        const isNumA = /^\d+$/.test(a);
        const isNumB = /^\d+$/.test(b);

        // both alphabetic → normal alphabetical sort
        if (!isNumA && !isNumB) {
          return a.localeCompare(b, undefined, { sensitivity: "base" });
        }

        // alphabet first
        if (!isNumA && isNumB) return -1;
        if (isNumA && !isNumB) return 1;

        // both numeric → numeric sort
        return Number(a) - Number(b);
      })
      .map((cls, index) => (
        <div
          key={index}
          className={`px-3 py-2 cursor-pointer ${
            classForm.selectedClass === cls
              ? "bg-[#AEE2F9] text-[#004d6e] font-semibold"
              : "hover:bg-gray-100"
          }`}
          onClick={() =>
            setClassForm({ ...classForm, selectedClass: cls })
          }
        >
          {cls}
        </div>
      ))}
  </div>
</div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Division and Max Students */}
          <div className="flex items-start gap-6">
            {/* Division Section */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Division name
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={classForm.divisionName}
                  onChange={(e) =>
                    setClassForm({ ...classForm, divisionName: e.target.value })
                  }
                  className="input input-bordered w-24  h-10"
                  placeholder="A"
                />
                <button
                  onClick={() => {
  const newDiv = classForm.divisionName.trim();
  if (!newDiv) return;

  // Check if this class already has a division list
  const currentClass = classForm.selectedClass;

  if (!currentClass) {
    alert("Please select a class first");
    return;
  }

  // Get current divisions (existing + temporary)
  const existingDivs = [
    ...(tempClassDivisions[currentClass] || []),
  ];

  // Prevent duplicates
  if (existingDivs.includes(newDiv)) {
    alert("Division already exists!");
    return;
  }

  // Add new division temporarily for that class
  const updated = {
    ...tempClassDivisions,
    [currentClass]: [...existingDivs, newDiv],
  };
  setTempClassDivisions(updated);

  // Reset input
  setClassForm({ ...classForm, divisionName: "" });
}}

                  className="px-3 py-3 bg-[#00a9ec] text-white rounded hover:bg-[#0090c7] text-sm  h-10"
                >
                  Add
                </button>
              </div>

              {/* Division chips */}
              {/* Division chips (existing + temp) */}
<div className="flex flex-wrap gap-2 mt-2">
  {/* Existing divisions from backend */}
  {classData
    .filter((c) => c.class === classForm.selectedClass)
    .map((c, idx) => (
      <div
        key={`exist-${idx}`}
        className="flex items-center gap-1 bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-sm"
      >
        {c.section}
      </div>
    ))}

  {/* Newly added temporary divisions */}
  {(tempClassDivisions[classForm.selectedClass] || []).map((div, idx) => (
    <div
      key={`temp-${idx}`}
      className="flex items-center gap-1 bg-[#E6F4EA] border border-green-400 rounded-full px-3 py-1 text-sm"
    >
      {div}
      <button
        onClick={() => {
          const updated = { ...tempClassDivisions };
          updated[classForm.selectedClass] = updated[
            classForm.selectedClass
          ].filter((d) => d !== div);
          setTempClassDivisions(updated);
        }}
        className="text-gray-500 hover:text-red-600"
      >
        ×
      </button>
    </div>
  ))}
</div>

            </div>

            {/* Max Students */}
            <div className="w-35">
              <label className="block text-sm font-medium text-gray-700 mb-1 whitespace-nowrap">
                Max. No. of Students
              </label>
              <input
                type="number"
                value={classForm.maxStudents}
                onChange={(e) =>
                  setClassForm({ ...classForm, maxStudents: e.target.value })
                }
                className="input input-bordered w-full h-10"
                placeholder="40"
              />
            </div>
          </div>

          {/* Class Teacher */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class teacher
            </label>
            <input
              type="text"
              value={classForm.classTeacher}
              onChange={(e) =>
                setClassForm({ ...classForm, classTeacher: e.target.value })
              }
              className="input input-bordered w-full h-10"
              placeholder="Start to type name..."
            />
            <p className="text-xs text-gray-500 mt-1">You can add later</p>
          </div>

          <p className="text-sm text-gray-500">
            Once saved you can select class from the class list and add details.
          </p>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 mt-8">
        <button
          onClick={() => setShowClassModal(false)}
          className="px-5 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700  h-10"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveClass}
          className="px-5 py-2 rounded bg-[#00a9ec] text-white hover:bg-[#0090c7]  h-10"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}



    </div>
  );
};

export default PaymentPage;