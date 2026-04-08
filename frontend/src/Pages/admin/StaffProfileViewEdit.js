import React, { useEffect, useState, lazy, Suspense } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Table } from "react-bootstrap";

// Lazy load components
const Modal = lazy(() => import("./Modal"));
const Section = lazy(() => import("./Section"));

const StaffProfileViewEdit = () => {
  const { _staffid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // previous page state (passed from TeachersTab)
  const prev = location?.state?.prev || null;
  const prevSelectedClass = prev?.selectedClass || null;
  const prevSelectedDivisions = prev?.selectedDivisions || [];
  const prevActiveTab = prev?.activeTab || null;
  const [staffData, setStaffData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [classess, setClassess] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [sameAddress, setSameAddress] = useState(false);
  // New state for tracking pending file uploads
  const [pendingFiles, setPendingFiles] = useState({
    profileImage: null,
    experience: {}, // { index: file }
    education: {}, // { index: file }
    documents: {},
  });
  // Fetch staff data
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("Failed to fetch staff data");
        const data = await response.json();
        setStaffData(data);
        setEditData(JSON.parse(JSON.stringify(data))); // Deep copy for edit data
      } catch (error) {
        console.error("Error fetching staff data:", error);
        setError("Failed to load staff profile");
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [_staffid]);

  // Fetch master data
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        // Fetch periods
        const periodsResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/master/periods`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (periodsResponse.ok) {
          const periodsData = await periodsResponse.json();
          setPeriods(periodsData);
        }

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

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/documents`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.ok) {
          const documentsData = await response.json();
          setDocuments(documentsData);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocuments();
  }, [_staffid]);

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
        } else if (Array.isArray(obj2[key])) {
          // Compare arrays element by element
          compareArrays(obj1[key], obj2[key], currentPath);
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
          // Key was deleted
          changedFields[`${currentPath}__deleted`] = true;
        }
      }
    };

    const compareArrays = (arr1, arr2, path) => {
      if (!Array.isArray(arr1)) {
        // If original doesn't have this array, entire array is new
        changedFields[path] = arr2;
        return;
      }

      const changes = {};
      let hasChanges = false;

      // Track deleted items specifically
      const deletedItems = [];

      // Compare existing elements
      arr2.forEach((item, index) => {
        const itemPath = `${path}[${index}]`;

        if (index < arr1.length) {
          // Compare with existing item
          const itemChanges = compareItem(arr1[index], item, itemPath);
          if (Object.keys(itemChanges).length > 0) {
            Object.assign(changes, itemChanges);
            hasChanges = true;
          }
        } else {
          // New item added
          changes[itemPath] = item;
          hasChanges = true;
        }
      });

      // Check for removed items - identify which specific items were deleted
      if (arr1.length > arr2.length) {
        for (let i = arr2.length; i < arr1.length; i++) {
          const deletedItem = arr1[i];
          // Store the deleted item with its original index and mark it as deleted
          if (deletedItem && deletedItem.id) {
            deletedItems.push({
              id: deletedItem.id,
              index: i,
              __deleted: true,
            });
          } else {
            // If no ID, use the index
            deletedItems.push({
              index: i,
              __deleted: true,
            });
          }
        }

        if (deletedItems.length > 0) {
          changes[`${path}[0].deleted`] = deletedItems;
          hasChanges = true;
        }
      }

      if (hasChanges) {
        Object.assign(changedFields, changes);
      }
    };

    const compareItem = (item1, item2, path) => {
      const itemChanges = {};

      if (
        typeof item2 === "object" &&
        item2 !== null &&
        !Array.isArray(item2)
      ) {
        // Compare object items
        for (const key in item2) {
          const fieldPath = `${path}.${key}`;
          if (item1 && item1[key] !== item2[key]) {
            itemChanges[fieldPath] = item2[key];
          } else if (!item1) {
            // New item
            itemChanges[fieldPath] = item2[key];
          }
        }

        // Check for deleted fields in the object item
        if (item1 && typeof item1 === "object") {
          for (const key in item1) {
            if (!(key in item2)) {
              const fieldPath = `${path}.${key}`;
              itemChanges[`${fieldPath}__deleted`] = true;
            }
          }
        }
      } else {
        // Compare primitive items
        if (item1 !== item2) {
          itemChanges[path] = item2;
        }
      }

      return itemChanges;
    };

    compareObjects(original, edited);
    return changedFields;
  };

  // Validate required fields
  const validateRequiredFields = () => {
    const errors = {};

    // Basic information validation
    if (!editData.staff_id_no?.trim()) {
      errors.staff_id_no = "Staff ID is required";
    }
    if (!editData.full_name?.trim()) {
      errors.full_name = "Full name is required";
    }
    if (!editData.gender) {
      errors.gender = "Gender is required";
    }
    if (!editData.phone?.trim()) {
      errors.phone = "Phone number is required";
    }

    // Personal details validation
    if (!editData.dob) {
      errors.dob = "Date of birth is required";
    }

    // Service information validation
    if (editData.service?.[0] && !editData.service[0].joining_date) {
      errors.joining_date = "Joining date is required";
    }

    // Validate class responsibilities
    if (editData.classResponsibilities) {
      editData.classResponsibilities.forEach((cls, index) => {
        if (cls.class_name && !cls.subject) {
          errors[`classResponsibilities.${index}.subject`] =
            "Subject is required when class is selected";
        }
        if (cls.subject && !cls.class_name) {
          errors[`classResponsibilities.${index}.class_name`] =
            "Class is required when subject is selected";
        }
      });
    }

    // Validate education records
    if (editData.education) {
      editData.education.forEach((edu, index) => {
        if (!edu.degree?.trim()) {
          errors[`education.${index}.degree`] = "Degree is required";
        }
        if (!edu.university?.trim()) {
          errors[`education.${index}.university`] = "Institution is required";
        }
        if (!edu.year) {
          errors[`education.${index}.year`] = "Year of passing is required";
        }
      });
    }

    // Validate experience records
    if (editData.experience) {
      editData.experience.forEach((exp, index) => {
        if (!exp.organization?.trim()) {
          errors[`experience.${index}.organization`] =
            "Organization is required";
        }
        if (!exp.designation?.trim()) {
          errors[`experience.${index}.designation`] = "Designation is required";
        }
        if (!exp.from_date) {
          errors[`experience.${index}.from_date`] = "From date is required";
        }
      });
    }

    // Validate family records
    if (editData.family) {
      editData.family.forEach((member, index) => {
        if (!member.name?.trim()) {
          errors[`family.${index}.name`] = "Name is required";
        }
        if (!member.relation?.trim()) {
          errors[`family.${index}.relation`] = "Relationship is required";
        }
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (isEditing) {
      // If canceling edit, reset edit data and clear validation errors
      setEditData(JSON.parse(JSON.stringify(staffData)));
      setValidationErrors({});
    }
    setIsEditing(!isEditing);
  };

  // Update the handleInputChange function to properly handle nested date fields
  const handleInputChange = (section, field, value, index = null) => {
    setEditData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));

      if (index !== null) {
        // For array fields (education, family, etc.)
        if (!newData[section]) newData[section] = [];
        if (!newData[section][index]) newData[section][index] = {};
        newData[section][index][field] = value;
      } else {
        // For simple fields or nested objects
        if (section.includes(".")) {
          // Handle nested fields like 'service.joining_date'
          const parts = section.split(".");
          let current = newData;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) current[parts[i]] = {};
            current = current[parts[i]];
          }
          current[parts[parts.length - 1]] = value;
        } else {
          // Handle top-level fields - FIX: Direct assignment for top-level fields
          if ( section === "service") {
            // For personal and service sections, they are objects
            if (!newData.service) newData.service = [{}];
  newData.service[0][field] = value;
          } else {
            // For top-level fields like 'dob', 'staff_id_no', etc.
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

  // Handle array item operations
  const handleAddItem = (section, template = {}) => {
    setEditData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      if (!newData[section]) newData[section] = [];
      newData[section].push({ ...template, id: `temp-${Date.now()}` });
      return newData;
    });
  };

  const handleRemoveItem = (section, index) => {
    setEditData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      if (newData[section] && newData[section][index]) {
        newData[section].splice(index, 1);
      }
      return newData;
    });
  };

  // Handle document upload
  const handleDocumentUpload = async () => {
    const currentDoumnets = staffData.documents || [];
    const editDocuments = editData.documents || [];

    for (const currentDoc of currentDoumnets) {
      const stillExists = editDocuments.find((editDoc) => {
        if (editDoc.id && currentDoc.id) {
          return editDoc.id === currentDoc.id;
        }
        return false;
      });
      if (!stillExists && currentDoc.id) {
        // Delete documnet record
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/documents/${currentDoc.id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Failed to delete experience record");
      }
    }

    // Add/Update records
    for (const [index, doc] of editDocuments.entries()) {
      // Check if it's a new record (no ID or temp ID)
      if (
        !doc.id ||
        (typeof doc.id === "string" && doc.id.startsWith("temp-"))
      ) {
        // Always add new records (temp IDs)
        const formData = new FormData();
        formData.append("document_type", doc.document_type || "");

        // Include the file if it exists in pendingFiles
        if (pendingFiles.documents[index]) {
          formData.append("document_path", pendingFiles.documents[index]);
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/documents`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Failed to add documents record");
      } else if (doc.id) {
        // For existing records, check if anything has changed
        const currentdoc = currentDoumnets.find((ce) => ce.id === doc.id);

        if (currentdoc) {
          // Check if data has changed or if there's a new file
          const dataChanged =
            doc.document_type !== currentdoc.document_type ;

          const fileChanged = pendingFiles.documents[index];

          // Only update if something has changed
          if (dataChanged || fileChanged) {
            if (fileChanged) {
              // Update with file upload
              const formData = new FormData();
              formData.append("document_type", exp.document_type || "");
              formData.append("document_path", pendingFiles.documents[index]);

              const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/documents/${doc.id}`,
                {
                  method: "PATCH",
                  body: formData,
                  credentials: "include",
                }
              );

              if (!response.ok)
                throw new Error(
                  "Failed to update experience record with document"
                );
            } else {
              // Update only data (no file change)
              const documentData = {
                document_path: doc.document_path
              };

              const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/documents/${doc.id}`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(documentData),
                  credentials: "include",
                }
              );

              if (!response.ok)
                throw new Error("Failed to update experience record");
            }
          }
          // If nothing changed, skip the update
        }
      }
    }    
  };

  // Handle document delete
  const handleDeleteDocument = async (docId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/documents/${docId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Failed to delete document");

        setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
        alert("Document deleted successfully!");
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Failed to delete document: " + error.message);
      }
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
      profile_image: previewUrl,
    }));

    alert('Profile image selected. Click "Save All Changes" to upload.');
  };

  // Handle document file selection for fields (store file, don't upload)
  const handleDocumentSelectForField = (section, index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      alert("Please select a valid file type (PDF, DOC, DOCX, JPG, PNG)");
      return;
    }

    if (file.size > maxSize) {
      alert("File size must be less than 10MB");
      return;
    }

    // Store file in pendingFiles state
    setPendingFiles((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [index]: file,
      },
    }));

    // Update the UI to show file is selected
    setEditData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      const fileName = file.name;

      if (section === "experience") {
        if (!newData.experience[index]) newData.experience[index] = {};
        newData.experience[index].exp_docs = `pending:${fileName}`;
      } else if (section === "education") {
        if (!newData.education[index]) newData.education[index] = {};
        newData.education[index].certificate = `pending:${fileName}`;
      } else if (section === "documents") {
        if (!newData.documents[index]) newData.documents[index] = {};
        newData.documents[index].document_path = `pending:${fileName}`;
      }

      return newData;
    });

    alert(`Document selected. Click "Save All Changes" to upload.`);
  };

  // Handle document removal
  const handleRemoveDocument = (section, index) => {
    if (window.confirm("Are you sure you want to remove this document?")) {
      // Remove from pending files if exists
      setPendingFiles((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [index]: null,
        },
      }));

      // Update edit data
      setEditData((prev) => {
        const newData = JSON.parse(JSON.stringify(prev));
        if (section === "experience") {
          newData.experience[index].exp_docs = null;
        } else if (section === "education") {
          newData.education[index].certificate = null;
        }else if (section === "documents") {
          newData.education[index].document = null;
        }
        return newData;
      });
    }
  };
  // Handle save all changes
  // Handle save all changes
  // Enhanced handleSaveAll function with change detection
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

      // 2. Update basic information only if changed
      await updateBasicInformation();

      // 3. Update personal information only if changed
      await updatePersonalInformation();

      // 4. Update service information only if changed
      await updateServiceInformation();

      // 5. Handle education records with change detection
      await handleEducationRecords();

      // 6. Handle experience records with change detection
      await handleExperienceRecords();

      // 7. Handle family records with change detection
      await handleFamilyRecords();

      // 8. Handle class responsibilities with change detection
      await handleClassResponsibilities();

      await handleDocumentUpload();

      // Refresh staff data
      await fetchStaffData();

      setIsEditing(false);
      setValidationErrors({});

      // Clear pending files
      setPendingFiles({
        profileImage: null,
        experience: {},
        education: {},
        document:{},
      });

      alert("Staff profile updated successfully!");
    } catch (error) {
      console.error("Error updating staff data:", error);
      alert("Failed to update staff profile: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Enhanced update functions with change detection
  const updateBasicInformation = async () => {
    const basicUpdates = {};

    // Only include fields that have actually changed
    if (editData.staff_id_no !== staffData.staff_id_no)
      basicUpdates.staff_id_no = editData.staff_id_no;
    if (editData.full_name !== staffData.full_name)
      basicUpdates.full_name = editData.full_name;
    if (editData.gender !== staffData.gender)
      basicUpdates.gender = editData.gender;
    if (editData.phone !== staffData.phone) basicUpdates.phone = editData.phone;
    if (editData.alt_phone !== staffData.alt_phone)
      basicUpdates.alt_phone = editData.alt_phone;
    if (editData.current_address !== staffData.current_address)
      basicUpdates.current_address = editData.current_address;
    if (editData.permanent_address !== staffData.permanent_address)
      basicUpdates.permanent_address = editData.permanent_address;

    // Only make API call if there are actual changes
    if (Object.keys(basicUpdates).length > 0) {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/basic`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(basicUpdates),
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to update basic information");
    }
  };

  const updatePersonalInformation = async () => {
    const personalUpdates = {};

    // Only include fields that have actually changed
    if (editData.dob !== staffData.dob) personalUpdates.dob = editData.dob;
    if (editData.age !== staffData.age) personalUpdates.age = editData.age;
    if (editData.blood_group !== staffData.blood_group)
      personalUpdates.blood_group = editData.blood_group;
    if (editData.bankaccno !== staffData.bankaccno)
      personalUpdates.bankaccno = editData.bankaccno;
    if (editData.panno !== staffData.panno)
      personalUpdates.panno = editData.panno;
    if (editData.aadhaar !== staffData.aadhaar)
      personalUpdates.aadhaar = editData.aadhaar;
    if (editData.category !== staffData.category)
      personalUpdates.category = editData.category;
    if (editData.religion !== staffData.religion)
      personalUpdates.religion = editData.religion;
    if (editData.caste !== staffData.caste)
      personalUpdates.caste = editData.caste;

    // Only make API call if there are actual changes
    if (Object.keys(personalUpdates).length > 0) {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/personal`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(personalUpdates),
          credentials: "include",
        }
      );

      if (!response.ok)
        throw new Error("Failed to update personal information");
    }
  };

  const updateServiceInformation = async () => {
    const serviceUpdates = {};
    const currentService = staffData.service?.[0] || {};
    const editService = editData.service?.[0] || {};

    // Only include fields that have actually changed
    if (editService.joining_date !== currentService.joining_date)
      serviceUpdates.joining_date = editService.joining_date;
    if (editService.pf_number !== currentService.pf_number)
      serviceUpdates.pf_number = editService.pf_number;
    if (editService.total_leaves !== currentService.total_leaves)
      serviceUpdates.total_leaves = editService.total_leaves;
    if (editService.used_leaves !== currentService.used_leaves)
      serviceUpdates.used_leaves = editService.used_leaves;

    // Only make API call if there are actual changes
    if (Object.keys(serviceUpdates).length > 0) {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/service`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(serviceUpdates),
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to update service information");
    }
  };

  // Enhanced array handling functions with change detection
  const handleEducationRecords = async () => {
    const currentEducation = staffData.education || [];
    const editEducation = editData.education || [];

    // Find deleted records (records that exist in current but not in edit)
    for (const currentEdu of currentEducation) {
      const stillExists = editEducation.find((editEdu) => {
        if (editEdu.id && currentEdu.id) {
          return editEdu.id === currentEdu.id;
        }
        return false;
      });

      if (!stillExists && currentEdu.id) {
        // Delete education record
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/education/${currentEdu.id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Failed to delete education record");
      }
    }

    // Add/Update records
    for (const [index, edu] of editEducation.entries()) {
      // Check if it's a new record (no ID or temp ID)
      if (
        !edu.id ||
        (typeof edu.id === "string" && edu.id.startsWith("temp-"))
      ) {
        // Always add new records (temp IDs)
        const formData = new FormData();
        formData.append("degree", edu.degree || "");
        formData.append("university", edu.university || "");
        formData.append("year", edu.year || "");

        // Include the file if it exists in pendingFiles
        if (pendingFiles.education[index]) {
          formData.append("certificate", pendingFiles.education[index]);
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/education`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Failed to add education record");
      } else if (edu.id) {
        // For existing records, check if anything has changed
        const currentEdu = currentEducation.find((ce) => ce.id === edu.id);

        if (currentEdu) {
          // Check if data has changed or if there's a new file
          const dataChanged =
            edu.degree !== currentEdu.degree ||
            edu.university !== currentEdu.university ||
            edu.year !== currentEdu.year;

          const fileChanged = pendingFiles.education[index];

          // Only update if something has changed
          if (dataChanged || fileChanged) {
            if (fileChanged) {
              // Update with file upload
              const formData = new FormData();
              formData.append("degree", edu.degree || "");
              formData.append("university", edu.university || "");
              formData.append("year", edu.year || "");
              formData.append("certificate", pendingFiles.education[index]);

              const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/education/${edu.id}`,
                {
                  method: "PATCH",
                  body: formData,
                  credentials: "include",
                }
              );

              if (!response.ok)
                throw new Error(
                  "Failed to update education record with certificate"
                );
            } else {
              // Update only data (no file change)
              const educationData = {
                degree: edu.degree,
                university: edu.university,
                year: edu.year,
              };

              const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/education/${edu.id}`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(educationData),
                  credentials: "include",
                }
              );

              if (!response.ok)
                throw new Error("Failed to update education record");
            }
          }
          // If nothing changed, skip the update
        }
      }
    }
  };

  const handleExperienceRecords = async () => {
    const currentExperience = staffData.experience || [];
    const editExperience = editData.experience || [];

    // Find deleted records
    for (const currentExp of currentExperience) {
      const stillExists = editExperience.find((editExp) => {
        if (editExp.id && currentExp.id) {
          return editExp.id === currentExp.id;
        }
        return false;
      });

      if (!stillExists && currentExp.id) {
        // Delete experience record
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/experience/${currentExp.id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Failed to delete experience record");
      }
    }

    // Add/Update records
    for (const [index, exp] of editExperience.entries()) {
      // Check if it's a new record (no ID or temp ID)
      if (
        !exp.id ||
        (typeof exp.id === "string" && exp.id.startsWith("temp-"))
      ) {
        // Always add new records (temp IDs)
        const formData = new FormData();
        formData.append("organization", exp.organization || "");
        formData.append("designation", exp.designation || "");
        formData.append("from_date", exp.from_date || "");
        formData.append("to_date", exp.to_date || "");

        // Include the file if it exists in pendingFiles
        if (pendingFiles.experience[index]) {
          formData.append("exp_doc", pendingFiles.experience[index]);
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/experience`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Failed to add experience record");
      } else if (exp.id) {
        // For existing records, check if anything has changed
        const currentExp = currentExperience.find((ce) => ce.id === exp.id);

        if (currentExp) {
          // Check if data has changed or if there's a new file
          const dataChanged =
            exp.organization !== currentExp.organization ||
            exp.designation !== currentExp.designation ||
            exp.from_date !== currentExp.from_date ||
            exp.to_date !== currentExp.to_date;

          const fileChanged = pendingFiles.experience[index];

          // Only update if something has changed
          if (dataChanged || fileChanged) {
            if (fileChanged) {
              // Update with file upload
              const formData = new FormData();
              formData.append("organization", exp.organization || "");
              formData.append("designation", exp.designation || "");
              formData.append("from_date", exp.from_date || "");
              formData.append("to_date", exp.to_date || "");
              formData.append("exp_doc", pendingFiles.experience[index]);

              const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/experience/${exp.id}/document`,
                {
                  method: "PATCH",
                  body: formData,
                  credentials: "include",
                }
              );

              if (!response.ok)
                throw new Error(
                  "Failed to update experience record with document"
                );
            } else {
              // Update only data (no file change)
              const experienceData = {
                organization: exp.organization,
                designation: exp.designation,
                from_date: exp.from_date,
                to_date: exp.to_date,
              };

              const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/experience/${exp.id}`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(experienceData),
                  credentials: "include",
                }
              );

              if (!response.ok)
                throw new Error("Failed to update experience record");
            }
          }
          // If nothing changed, skip the update
        }
      }
    }
  };

  // Similar enhancements for other array handling functions (family, classResponsibilities)
  const handleFamilyRecords = async () => {
    const currentFamily = staffData.family || [];
    const editFamily = editData.family || [];

    // Find deleted records
    for (const currentFam of currentFamily) {
      const stillExists = editFamily.find((editFam) => {
        if (editFam.id && currentFam.id) {
          return editFam.id === currentFam.id;
        }
        return false;
      });

      if (!stillExists && currentFam.id) {
        // Delete family member
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/family/${currentFam.id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Failed to delete family member");
      }
    }

    // Add/Update records
    for (const fam of editFamily) {
      const familyData = {
        name: fam.name,
        relation: fam.relationship || fam.relation,
        contact: fam.phone || fam.contact,
      };

      // Check if it's a new record (no ID or temp ID)
      if (
        !fam.id ||
        (typeof fam.id === "string" && fam.id.startsWith("temp-"))
      ) {
        // Always add new records (temp IDs)
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/family`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(familyData),
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Failed to add family member");
      } else if (fam.id) {
        // For existing records, check if anything has changed
        const currentFam = currentFamily.find((cf) => cf.id === fam.id);

        if (currentFam) {
          // Check if data has changed
          const dataChanged =
            fam.name !== currentFam.name ||
            (fam.relationship || fam.relation) !==
              (currentFam.relationship || currentFam.relation) ||
            (fam.phone || fam.contact) !==
              (currentFam.phone || currentFam.contact);

          // Only update if something has changed
          if (dataChanged) {
            const response = await fetch(
              `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/family/${fam.id}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(familyData),
                credentials: "include",
              }
            );

            if (!response.ok) throw new Error("Failed to update family member");
          }
          // If nothing changed, skip the update
        }
      }
    }
  };

  const handleClassResponsibilities = async () => {
    const currentClasses = staffData.classResponsibilities || [];
    const editClasses = editData.classResponsibilities || [];

    // Find deleted records
    for (const currentClass of currentClasses) {
      const stillExists = editClasses.find((editClass) => {
        if (editClass.id && currentClass.id) {
          return editClass.id === currentClass.id;
        }
        return false;
      });

      if (!stillExists && currentClass.id) {
        // Delete timetable entry
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/timetable/${currentClass.id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Failed to delete timetable entry");
      }
    }

    // Add/Update records
    for (const cls of editClasses) {
      const timetableData = {
        class_id: cls.class_name,
        subject_id: cls.subject,
        monday: cls.monday,
        tuesday: cls.tuesday,
        wednesday: cls.wednesday,
        thursday: cls.thursday,
        friday: cls.friday,
        saturday: cls.saturday,
      };

      // Check if it's a new record (no ID or temp ID)
      if (
        !cls.id ||
        (typeof cls.id === "string" && cls.id.startsWith("temp-"))
      ) {
        // Always add new records (temp IDs)
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/timetable`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
      ...timetableData,
      academic_year: localStorage.getItem("academicYear") || "2024-2025",
    }),
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Failed to add timetable entry");
      } else if (cls.id) {
        // For existing records, check if anything has changed
        const currentClass = currentClasses.find((cc) => cc.id === cls.id);

        if (currentClass) {
          // Check if data has changed
          const dataChanged =
            cls.class_name !== currentClass.class_name ||
            cls.subject !== currentClass.subject ||
            cls.monday !== currentClass.monday ||
            cls.tuesday !== currentClass.tuesday ||
            cls.wednesday !== currentClass.wednesday ||
            cls.thursday !== currentClass.thursday ||
            cls.friday !== currentClass.friday ||
            cls.saturday !== currentClass.saturday;

          // Only update if something has changed
          if (dataChanged) {
            const response = await fetch(
              `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/classes/${cls.id}/timetable`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(timetableData),
                credentials: "include",
              }
            );

            if (!response.ok)
              throw new Error("Failed to update timetable entry");
          }
          // If nothing changed, skip the update
        }
      }
    }
  };

  // Upload profile image
  // Upload profile image
  const uploadProfileImage = async (file) => {
    const formData = new FormData();
    formData.append("profileImage", file);

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/image`,
      {
        method: "PATCH",
        body: formData,
        credentials: "include",
      }
    );

    if (!response.ok) throw new Error("Failed to upload profile image");
  };

  // Upload experience documents and return updates
  // Upload experience documents and return updates
  const uploadExperienceDocuments = async () => {
    const updates = {};

    for (const [index, file] of Object.entries(pendingFiles.experience)) {
      if (file) {
        const formData = new FormData();
        formData.append("exp_doc", file);

        try {
          // Get the experience record to find its ID
          const expRecord = editData.experience[index];
          if (!expRecord || !expRecord.id) {
            console.warn(
              `No experience record found at index ${index} or missing ID`
            );
            continue;
          }

          // Use the correct API endpoint with staff ID and experience ID
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/experience/${expRecord.id}/document`,
            {
              method: "PATCH",
              body: formData,
              credentials: "include",
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Failed to upload experience document: ${response.status} ${errorText}`
            );
          }

          const data = await response.json();
          // Map the uploaded file path to the correct experience record
          updates[`experience.${index}.exp_docs`] =
            data.document_path || data.file_path || data.exp_docs;
        } catch (error) {
          console.error("Error uploading experience document:", error);
          throw error;
        }
      }
    }

    return updates;
  };

  // Upload education documents and return updates
  const uploadEducationDocuments = async () => {
    const updates = {};

    for (const [index, file] of Object.entries(pendingFiles.education)) {
      if (file) {
        const formData = new FormData();
        formData.append("certificate", file);

        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/documents_edu`,
            {
              method: "POST",
              body: formData,
              credentials: "include",
            }
          );

          if (!response.ok)
            throw new Error("Failed to upload education document");

          const data = await response.json();
          // Map the uploaded file path to the correct education record
          updates[`education.${index}.certificate`] =
            data.document_path || data.file_path;
        } catch (error) {
          console.error("Error uploading education document:", error);
          throw error;
        }
      }
    }

    return updates;
  };

  const fetchStaffData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Failed to fetch staff data");
      const data = await response.json();
      setStaffData(data);
      setEditData(JSON.parse(JSON.stringify(data)));
    } catch (error) {
      console.error("Error fetching staff data:", error);
      throw error;
    }
  };
  // Prepare update data (your existing findChangedFields logic)
  const prepareUpdateData = () => {
    const changedFields = findChangedFields(staffData, editData);

    // Remove pending file markers from the data since we're handling file uploads separately
    Object.keys(changedFields).forEach((key) => {
      if (
        typeof changedFields[key] === "string" &&
        changedFields[key].startsWith("pending:")
      ) {
        delete changedFields[key];
      }
    });

    return changedFields;
  };
  // Helper functions for display
  const getPeriodDisplay = (periodId) => {
    if (!periodId) return "---";
    const period = periods.find((p) => p.periodid === periodId);
    return period ? `${period.timein}` : "---";
  };

  const getSubjectDisplay = (subjectId) => {
    if (!subjectId) return "---";
    const subject = subjects.find((s) => s.subject_id === subjectId);
    return subject ? `${subject.subject_code}` : "---";
  };

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

  // Helper function to get validation error message
  const getValidationError = (fieldPath) => {
    return validationErrors[fieldPath];
  };

  const handleImageError = (e) => {
      e.target.src = '../profile-picture.jpg';
  };
  if (loading)
    return <div className="text-center p-8">Loading staff profile...</div>;
  if (error) return <div className="text-center p-8 text-error">{error}</div>;
  if (!staffData)
    return <div className="text-center p-8">No staff data found</div>;

  return (
    <div className="p-4 mx-auto rounded-lg bg-white">
      <div className="mb-4 flex items-center justify-between">

  {/* Left: Back button */}
  <button
    onClick={() => {
      if (prev) {
        navigate("/payment", {
          state: {
            selectedClass: prevSelectedClass,
            selectedDivisions: prevSelectedDivisions,
            activeTab: prevActiveTab,
          },
        });
      } else {
        navigate(-1);
      }
    }}
    className="text-sm hover:underline flex items-center gap-2"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
    <span>
      {prevSelectedClass
        ? `Classes, ${prevSelectedClass} › Division ${
            prevSelectedDivisions.length === 0
              ? "All"
              : prevSelectedDivisions.join(", ")
          } › ${prevActiveTab ?? "Teachers"} › ${staffData.full_name}`
        : "Back"}
    </span>
  </button>

  {/* Right: Edit checkbox */}
  <div className="flex items-center gap-2">
    <span className="text-sm font-medium">Edit Mode</span>
    <input
      type="checkbox"
      className="toggle toggle-success"
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
          <li><button>Remove</button></li>
          <li><button>Add proxy</button></li>
          <li><button>Suspend</button></li>
          <li><button>Make long leave</button></li>
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
                    editData.profile_image
                      ? editData.profile_image.startsWith("blob:")
                        ? editData.profile_image
                        : `${process.env.REACT_APP_API_URL}${editData.profile_image}`
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
              <h3 className="text-3xl mb-6 font-semibold">
                {staffData.gender === "Female" ? "Miss." : "Mr."}{" "}
                {staffData.full_name}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="">
                  <div className="form-control">
                    <label className="label block">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        ID Number
                      </span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.staff_id_no || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "basic",
                            "staff_id_no",
                            e.target.value
                          )
                        }
                        className="input input-bordered imput-sm"
                        placeholder="Enter staff ID"
                      />
                    ) : (
                      <div className="mt-1 text-sm font-semibold text-gray-800">{staffData.staff_id_no}</div>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label block">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</span>
                    </label>
                    {isEditing ? (
                      <select
                        value={editData.gender || ""}
                        onChange={(e) =>
                          handleInputChange("basic", "gender", e.target.value)
                        }
                        className="select select-bordered select-sm"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    ) : (
                      <div className="mt-1 text-sm font-semibold text-gray-800 ">{staffData.gender}</div>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label block">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Degrees</span>
                    </label>
                    <div className="mt-1 text-sm font-semibold text-gray-800">{staffData.degree || "---"}</div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="">
                  <div className="form-control">
                    <label className="label block">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.phone || ""}
                        onChange={(e) =>
                          handleInputChange("basic", "phone", e.target.value)
                        }
                        className="input input-bordered imput-sm"
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <div className="mt-1 text-sm font-semibold text-gray-800">{staffData.phone}</div>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label block">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Alternate Phone
                      </span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.alt_phone || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "basic",
                            "alt_phone",
                            e.target.value
                          )
                        }
                        className="input input-bordered imput-sm"
                        placeholder="Enter alternate phone"
                      />
                    ) : (
                      <div className="mt-1 text-sm font-semibold text-gray-800">
                        {staffData.alt_phone || "---"}
                      </div>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label block">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</span>
                    </label>
                    <div className="mt-1 text-sm font-semibold text-primary">{staffData.email}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div
          className={`grid gap-4 mb-8  px-6 ${
            isEditing
              ? "grid-cols-1 md:grid-cols-3 lg:grid-cols-3"
              : "grid-cols-1 md:grid-cols-3 lg:grid-cols-3"
          }`}
        >
          {/* Current Address */}
          <div className="bg-base-100">
  <div className="form-control">
    <label className="label block">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
        Current Address 
        
        {isEditing && (
          <label className="flex items-center gap-2 cursor-pointer text-sm font-normal">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={sameAddress}
              onChange={(e) => {
                const checked = e.target.checked;
                setSameAddress(checked);

                if (checked) {
                  // Copy current address to permanent address
                  setEditData((prev) => ({
                    ...prev,
                    permanent_address:
                      prev.current_address || staffData.current_address,
                  }));
                }
              }}
            />
            <span>Same as Current Address</span>
          </label>
        )}
      </span>
    </label>

    {isEditing ? (
      <textarea
        value={editData.current_address || ""}
        onChange={(e) =>
          handleInputChange("basic", "current_address", e.target.value)
        }
        className="textarea textarea-bordered textarea-sm"
        rows="4"
        placeholder="Enter current address"
      />
    ) : (
      <div className="whitespace-pre-wrap min-h-[100px] mt-1 text-sm font-semibold text-gray-800">
        {staffData.current_address || "---"}
      </div>
    )}
  </div>
</div>

          {/* Same Address Checkbox - Only shown when editing */}
          
            <div className="hidden md:flex justify-center">
              <div className="divider divider-horizontal"></div>
            </div>
          

          {/* Permanent Address */}
          <div className="bg-base-100">
            <div className="form-control">
              <label className="label block">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Permanent Address
                </span>
              </label>
              {isEditing ? (
                <textarea
                  value={editData.permanent_address || ""}
                  onChange={(e) => {
                    handleInputChange(
                      "basic",
                      "permanent_address",
                      e.target.value
                    );
                    // If user manually edits permanent address, uncheck the "same as current" checkbox
                    if (sameAddress) {
                      setSameAddress(false);
                    }
                  }}
                  className="textarea textarea-bordered textarea-sm"
                  rows="4"
                  placeholder="Enter permanent address"
                  disabled={sameAddress} // Disable when checkbox is checked
                />
              ) : (
                <div className="whitespace-pre-wrap min-h-[100px] mt-1 text-sm font-semibold text-gray-800">
                  {staffData.permanent_address || "---"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-base-100 px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
            <div>
              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Date of Birth
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formatDateForInput(editData.dob)}
                    onChange={(e) =>
                      handleInputChange("personal", "dob", e.target.value)
                    }
                    className={`input input-bordered imput-sm ${
                      getValidationError("dob") ? "input-error" : ""
                    }`}
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800">{formatDate(staffData.dob)}</div>
                )}
              </div>

              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Age</span>
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.age || ""}
                    onChange={(e) =>
                      handleInputChange("personal", "age", e.target.value)
                    }
                    className="input input-bordered imput-sm"
                    placeholder="Enter age"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800 ">{staffData.age || "---"}</div>
                )}
              </div>
              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Blood Group</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.blood_group || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "personal",
                        "blood_group",
                        e.target.value
                      )
                    }
                    className="input input-bordered imput-sm"
                    placeholder="Enter blood group"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800">{staffData.blood_group || "---"}</div>
                )}
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="divider divider-horizontal"></div>
            </div>
            <div>
              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Account Number
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.bankaccno || ""}
                    onChange={(e) =>
                      handleInputChange("personal", "bankaccno", e.target.value)
                    }
                    className="input input-bordered imput-sm"
                    placeholder="Enter account number"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800 ">{staffData.bankaccno || "---"}</div>
                )}
              </div>
              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">PAN Number</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.panno || ""}
                    onChange={(e) =>
                      handleInputChange("personal", "panno", e.target.value)
                    }
                    className="input input-bordered imput-sm"
                    placeholder="Enter PAN number"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800 ">{staffData.panno || "---"}</div>
                )}
              </div>

              <div className="form-control">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Aadhaar Number
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.aadhaar || ""}
                    onChange={(e) =>
                      handleInputChange("personal", "aadhaar", e.target.value)
                    }
                    className="input input-bordered imput-sm"
                    placeholder="Enter Aadhaar number"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800 ">{staffData.aadhaar || "---"}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timetable Section */}
        {/* Timetable Section */}
        <Section title="Class responsibilities">
          <div className="overflow-x-auto">
            <Table bordered responsive className="w-full">
              <thead>
                <tr className="bg-base-300">
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Class</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Subject</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Mon</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tue</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Wed</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Thu</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Fri</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Sat</th>
                  {isEditing && <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {editData.classResponsibilities?.map((cls, index) => (
                  <tr key={cls.id || index} className="hover:bg-base-200">
                    <td className="p-3 mt-1 text-sm font-semibold text-gray-800">
                      {isEditing ? (
                        <select
                          value={cls.class_name || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "classResponsibilities",
                              "class_name",
                              e.target.value,
                              index
                            )
                          }
                          className="select select-bordered select-sm"
                        >
                          <option value="">Select Class</option>
                          {classess.map((classe) => (
                            <option
                              key={classe.class_id}
                              value={classe.class_id}
                            >
                              {classe.class_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        getClassDisplay(cls.class_name)
                      )}
                    </td>
                    <td className="p-3 mt-1 text-sm font-semibold text-gray-800">
                      {isEditing ? (
                        <select
                          value={cls.subject || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "classResponsibilities",
                              "subject",
                              e.target.value,
                              index
                            )
                          }
                          className="select select-bordered select-sm"
                        >
                          <option value="">Select Subject</option>
                          {subjects.map((subject) => (
                            <option
                              key={subject.subject_id}
                              value={subject.subject_id}
                            >
                              {subject.subject_code}
                            </option>
                          ))}
                        </select>
                      ) : (
                        getSubjectDisplay(cls.subject)
                      )}
                    </td>
                    {[
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                      "saturday",
                    ].map((day) => (
                      <td key={day} className="p-3 mt-1 text-sm font-semibold text-gray-800">
                        {isEditing ? (
                          <select
                            value={cls[day] || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "classResponsibilities",
                                day,
                                e.target.value,
                                index
                              )
                            }
                            className="select select-bordered select-sm"
                          >
                            <option value="">---</option>
                            {periods.map((period) => {
                              // Check if this period is already allocated for this day in other rows
                              const isAllocated =
                                editData.classResponsibilities?.some(
                                  (otherCls, otherIndex) =>
                                    otherIndex !== index && // Don't check against current row
                                    otherCls[day] === period.periodid && // Same day and period
                                    otherCls[day] !== "" && // Not empty
                                    otherCls[day] !== null // Not null
                                );

                              return (
                                <option
                                  key={period.periodid}
                                  value={period.periodid}
                                  disabled={
                                    isAllocated && cls[day] !== period.periodid
                                  }
                                  className={
                                    isAllocated && cls[day] !== period.periodid
                                      ? "text-gray-400 bg-gray-100"
                                      : ""
                                  }
                                >
                                  {period.timein}
                                  {isAllocated && cls[day] !== period.periodid
                                    ? " (Already allocated)"
                                    : ""}
                                </option>
                              );
                            })}
                          </select>
                        ) : (
                          getPeriodDisplay(cls[day])
                        )}
                      </td>
                    ))}
                    {isEditing && (
                      <td className="p-3 mt-1 text-sm font-semibold text-gray-800">
                        <button
                          onClick={() =>
                            handleRemoveItem("classResponsibilities", index)
                          }
                          className="btn btn-error btn-sm"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {isEditing && (
            <div className="text-center mt-4">
              <button
                onClick={() =>
                  handleAddItem("classResponsibilities", {
                    class_name: "",
                    subject: "",
                    monday: "",
                    tuesday: "",
                    wednesday: "",
                    thursday: "",
                    friday: "",
                    saturday: "",
                  })
                }
                className="btn btn-outline btn-primary"
              >
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Class Responsibility
              </button>
            </div>
          )}

          {(!editData.classResponsibilities ||
            editData.classResponsibilities.length === 0) &&
            !isEditing && (
              <div className="text-center py-8 text-base-content/70">
                No class responsibilities found
              </div>
            )}
        </Section>

        {/* Service Information Section */}
        <Section title="Service Information">
          <div className="bg-base-100 p-6 rounded-lg border border-base-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Joining Date</span>
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formatDateForInput(
                      editData.service?.[0]?.joining_date
                    )}
                    onChange={(e) =>
                      handleInputChange(
                        "service",
                        "joining_date",
                        e.target.value
                      )
                    } // This is correct
                    className={`input input-bordered imput-sm ${
                      getValidationError("dob") ? "input-error" : ""
                    }`}
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800 ">
                    {formatDate(staffData.service?.[0]?.joining_date)}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">PF Number</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.service?.[0]?.pf_number || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "service",
                        "pf_number",
                        e.target.value
                      )
                    }
                    className="input input-bordered imput-sm max-w-xs"
                    placeholder="Enter PF number"
                  />
                ) : (
                  <div>{staffData.service?.[0]?.pf_number || "---"}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="flex flex-col">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Leaves</span>
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.service?.[0]?.total_leaves || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "service",
                        "total_leaves",
                        e.target.value
                      )
                    }
                    className="input input-bordered imput-sm max-w-xs"
                    placeholder="Enter total leaves"
                  />
                ) : (
                  <div>{staffData.service?.[0]?.total_leaves || "0"}</div>
                )}
              </div>

              <div className="flex flex-col">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Used Leaves</span>
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.service?.[0]?.used_leaves || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "service",
                        "used_leaves",
                        e.target.value
                      )
                    }
                    className="input input-bordered imput-sm max-w-xs"
                    placeholder="Enter used leaves"
                  />
                ) : (
                  <div>{staffData.service?.[0]?.used_leaves || "0"}</div>
                )}
              </div>
            </div>
          </div>
        </Section>

        {/* Experience Section */}
        <Section title="Work Experience">
          <div className="overflow-x-auto">
            <Table bordered responsive className="w-full">
              <thead>
                <tr className="bg-base-300">
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Organization</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Designation</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">From Date</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">To Date</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Document</th>
                  {isEditing && <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {editData.experience?.map((exp, index) => (
                  <tr key={exp.id || index} className="hover:bg-base-200">
                    <td className="p-3 mt-1 text-sm font-semibold text-gray-800">
                      {isEditing ? (
                        <input
                          type="text"
                          value={exp.organization || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "experience",
                              "organization",
                              e.target.value,
                              index
                            )
                          }
                          className="input input-bordered input-sm imput-sm"
                          placeholder="Organization name"
                        />
                      ) : (
                        <div>{exp.organization}</div>
                      )}
                    </td>
                    <td className="p-3 mt-1 text-sm font-semibold text-gray-800">
                      {isEditing ? (
                        <input
                          type="text"
                          value={exp.designation || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "experience",
                              "designation",
                              e.target.value,
                              index
                            )
                          }
                          className="input input-bordered input-sm imput-sm"
                          placeholder="Designation"
                        />
                      ) : (
                        <div>{exp.designation}</div>
                      )}
                    </td>
                    <td className="p-3 mt-1 text-sm font-semibold text-gray-800">
                      {isEditing ? (
                        <input
                          type="date"
                          value={formatDateForInput(exp.from_date)}
                          onChange={(e) =>
                            handleInputChange(
                              "experience",
                              "from_date",
                              e.target.value,
                              index
                            )
                          }
                          className="input input-bordered input-sm imput-sm"
                        />
                      ) : (
                        <div>{formatDate(exp.from_date)}</div>
                      )}
                    </td>
                    <td className="p-3 mt-1 text-sm font-semibold text-gray-800">
                      {isEditing ? (
                        <input
                          type="date"
                          value={formatDateForInput(exp.to_date)}
                          onChange={(e) =>
                            handleInputChange(
                              "experience",
                              "to_date",
                              e.target.value,
                              index
                            )
                          }
                          className="input input-bordered input-sm"
                        />
                      ) : (
                        <div>{formatDate(exp.to_date)}</div>
                      )}
                    </td>
                    <td className="p-3 mt-1 text-sm font-semibold text-gray-800">
                      {isEditing ? (
                        <div className="flex flex-col gap-2">
                          {exp.exp_docs &&
                          !exp.exp_docs.startsWith("pending:") ? (
                            <div className="flex items-center gap-2">
                              <a
                                href={`${process.env.REACT_APP_API_URL}${exp.exp_docs}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link link-primary text-sm"
                              >
                                View Document
                              </a>
                              <button
                                onClick={() =>
                                  handleRemoveDocument("experience", index)
                                }
                                className="btn btn-error btn-xs"
                                title="Remove document"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          ) : exp.exp_docs &&
                            exp.exp_docs.startsWith("pending:") ? (
                            <div className="text-success text-sm">
                              ✓ {exp.exp_docs.replace("pending:", "")} (Ready to
                              upload)
                            </div>
                          ) : (
                            <span className="text-base-content/70 text-sm">
                              No document
                            </span>
                          )}
                          <label className="btn btn-outline btn-primary btn-sm">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            Select Document
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) =>
                                handleDocumentSelectForField(
                                  "experience",
                                  index,
                                  e
                                )
                              }
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                          </label>
                        </div>
                      ) : exp.exp_docs ? (
                        <a
                          href={`${process.env.REACT_APP_API_URL}${exp.exp_docs}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-primary text-sm"
                        >
                          View Document
                        </a>
                      ) : (
                        <span className="text-base-content/70">
                          No document
                        </span>
                      )}
                    </td>
                    {isEditing && (
                      <td className="p-3">
                        <button
                          onClick={() => handleRemoveItem("experience", index)}
                          className="btn btn-error btn-sm"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {isEditing && (
            <div className="text-center mt-4">
              <button
                onClick={() =>
                  handleAddItem("experience", {
                    organization: "",
                    designation: "",
                    from_date: "",
                    to_date: "",
                    exp_docs: "",
                  })
                }
                className="btn btn-outline btn-primary"
              >
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Experience
              </button>
            </div>
          )}

          {(!editData.experience || editData.experience.length === 0) &&
            !isEditing && (
              <div className="text-center py-8 text-base-content/70">
                No experience records found
              </div>
            )}
        </Section>

        {/* Education Section */}
        <Section title="Education">
          <div className="overflow-x-auto">
            <Table bordered responsive className="w-full">
              <thead>
                <tr className="bg-base-300">
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Degree</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Institution</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Year of Passing</th>
                  <th className="font-semibold p-3 v">Document</th>
                  {isEditing && <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {editData.education?.map((edu, index) => (
                  <tr key={edu.id || index} className="hover:bg-base-200">
                    <td className="p-3 mt-1 text-sm font-semibold text-gray-800">
                      {isEditing ? (
                        <input
                          type="text"
                          value={edu.degree || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "education",
                              "degree",
                              e.target.value,
                              index
                            )
                          }
                          className="input input-bordered input-sm"
                          placeholder="Degree name"
                        />
                      ) : (
                        <div>{edu.degree}</div>
                      )}
                    </td>
                    <td className="p-3 mt-1 text-sm font-semibold text-gray-800">
                      {isEditing ? (
                        <input
                          type="text"
                          value={edu.university || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "education",
                              "university",
                              e.target.value,
                              index
                            )
                          }
                          className="input input-bordered input-sm"
                          placeholder="Institution name"
                        />
                      ) : (
                        <div>{edu.university}</div>
                      )}
                    </td>
                    <td className="p-3 mt-1 text-sm font-semibold text-gray-800">
                      {isEditing ? (
                        <input
                          type="number"
                          value={edu.year || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "education",
                              "year",
                              e.target.value,
                              index
                            )
                          }
                          className="input input-bordered input-sm"
                          placeholder="Year"
                        />
                      ) : (
                        <div>{edu.year}</div>
                      )}
                    </td>
                    <td className="p-3 mt-1 text-sm font-semibold text-gray-800">
                      {isEditing ? (
                        <div className="flex flex-col gap-2">
                          {edu.certificate &&
                          !edu.certificate.startsWith("pending:") ? (
                            <div className="flex items-center gap-2">
                              <a
                                href={`${process.env.REACT_APP_API_URL}${edu.certificate}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link link-primary text-sm"
                              >
                                View Document
                              </a>
                              <button
                                onClick={() =>
                                  handleRemoveDocument("education", index)
                                }
                                className="btn btn-error btn-xs"
                                title="Remove document"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          ) : edu.certificate &&
                            edu.certificate.startsWith("pending:") ? (
                            <div className="text-success text-sm">
                              ✓ {edu.certificate.replace("pending:", "")} (Ready
                              to upload)
                            </div>
                          ) : (
                            <span className="text-base-content/70 text-sm">
                              No document
                            </span>
                          )}
                          <label className="btn btn-outline btn-primary btn-sm">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            Select Document
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) =>
                                handleDocumentSelectForField(
                                  "education",
                                  index,
                                  e
                                )
                              }
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                          </label>
                        </div>
                      ) : edu.certificate ? (
                        <a
                          href={`${process.env.REACT_APP_API_URL}${edu.certificate}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-primary text-sm"
                        >
                          View Document
                        </a>
                      ) : (
                        <span className="text-base-content/70">
                          No document
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {isEditing && (
            <div className="text-center mt-4">
              <button
                onClick={() =>
                  handleAddItem("education", {
                    degree: "",
                    university: "",
                    year: "",
                    certificate: "",
                  })
                }
                className="btn btn-outline btn-primary"
              >
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Education
              </button>
            </div>
          )}

          {(!editData.education || editData.education.length === 0) &&
            !isEditing && (
              <div className="text-center py-8 text-base-content/70">
                No education records found
              </div>
            )}
        </Section>

        {/* Family Section */}
        <Section title="Family Information">
          <div className="overflow-x-auto">
            <Table bordered responsive className="w-full">
              <thead>
                <tr className="bg-base-300">
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Relationship</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</th>
                  {isEditing && <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {editData.family?.map((member, index) => (
                  <tr key={member.id || index} className="hover:bg-base-200 ">
                    <td className="p-3 mt-1 text-sm font-semibold text-gray-800">
                      {isEditing ? (
                        <input
                          type="text"
                          value={member.name || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "family",
                              "name",
                              e.target.value,
                              index
                            )
                          }
                          className="input input-bordered input-sm"
                          placeholder="Family member name"
                        />
                      ) : (
                        <div>{member.name}</div>
                      )}
                    </td>
                    <td className="p-3 mt-1 text-sm font-semibold text-gray-800">
                      {isEditing ? (
                        <select
                          name="relation"
                          value={member.relation}
                          onChange={(e) =>
                            handleInputChange(
                              "family",
                              "relationship",
                              e.target.value,
                              index
                            )
                          }
                          className="select select-bordered select-sm"
                        >
                          <option value="">Select relationship</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Son">Son</option>
                          <option value="Daughter">Daughter</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <div>{member.relation}</div>
                      )}
                    </td>
                    <td className="p-3 mt-1 text-sm font-semibold text-gray-800">
                      {isEditing ? (
                        <input
                          type="text"
                          value={member.contact || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "family",
                              "contact",
                              e.target.value,
                              index
                            )
                          }
                          className="input input-bordered input-sm"
                          placeholder="Phone number"
                        />
                      ) : (
                        <div>{member.contact}</div>
                      )}
                    </td>
                    {isEditing && (
                      <td className="p-3 mt-1 text-sm font-semibold text-gray-800">
                        <button
                          onClick={() => handleRemoveItem("family", index)}
                          className="btn btn-error btn-sm"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {isEditing && (
            <div className="text-center mt-4">
              <button
                onClick={() =>
                  handleAddItem("family", {
                    name: "",
                    relationship: "",
                    contact: "",
                  })
                }
                className="btn btn-outline btn-primary"
              >
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Family Member
              </button>
            </div>
          )}

          {(!editData.family || editData.family.length === 0) && !isEditing && (
            <div className="text-center py-8 text-base-content/70">
              No family information found
            </div>
          )}
        </Section>

        {/* Documents Section */}
        <Section title="Documents">
          <div className="overflow-x-auto">
    <Table bordered responsive className="w-full">
      <thead>
        <tr className="bg-base-300">
          <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Document Type</th>
          <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Document</th>
          {isEditing && <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {editData.documents?.map((doc, index) => (
          <tr key={doc.id || index} className="hover:bg-base-200">
            <td className="p-3 mt-1 text-sm font-semibold text-gray-800">
              {isEditing ? (
                <select
                  value={doc.document_type || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "documents",
                      "document_type",
                      e.target.value,
                      index
                    )
                  }
                  className="select select-bordered select-sm"
                >
                  <option value="">Select document type</option>
                  <option value="Resume">Resume</option>
                  <option value="Degree Certificate">Degree Certificate</option>
                  <option value="ID Proof">ID Proof</option>
                  <option value="Experience Letter">Experience Letter</option>
                  <option value="Additional Document">Additional Document</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <div>{doc.document_type || "Additional Document"}</div>
              )}
            </td>
            <td className="p-3 mt-1 text-sm font-semibold text-gray-800">
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  {doc.document_path && !doc.document_path.startsWith("pending:") ? (
                    <div className="flex items-center gap-2">
                      <a
                        href={`${process.env.REACT_APP_API_URL}${doc.document_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-primary text-sm"
                      >
                        View Document
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="btn btn-error btn-xs"
                        title="Remove document"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : doc.document_path && doc.document_path.startsWith("pending:") ? (
                    <div className="text-success text-sm">
                      ✓ {doc.document_path.replace("pending:", "")} (Ready to upload)
                    </div>
                  ) : (
                    <span className="text-base-content/70 text-sm">No document</span>
                  )}
                  <label className="btn btn-outline btn-primary btn-sm">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Select Document
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleDocumentSelectForField("documents", index, e)}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </label>
                </div>
              ) : doc.document_path ? (
                <a
                  href={`${process.env.REACT_APP_API_URL}${doc.document_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary text-sm"
                >
                  View Document
                </a>
              ) : (
                <span className="text-base-content/70">No document</span>
              )}
            </td>
            {isEditing && (
              <td className="p-3">
                <button
                  onClick={() => handleRemoveItem("documents", index)}
                  className="btn btn-error btn-sm"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </td>
            )}
          </tr>
        ))}
        
        {/* Show empty row when no documents exist */}
        {(!editData.documents || editData.documents.length === 0) && !isEditing && (
          <tr>
            <td colSpan={isEditing ? 3 : 2} className="text-center py-8 text-base-content/70">
              No documents uploaded yet
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  </div>

  {isEditing && (
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={() => 
          handleAddItem("documents", {
            document_type: "Additional Document",
            document_path: "",
            created_at: new Date().toISOString()
          })
        }
        className="btn btn-outline btn-primary"
      >
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add New Document
      </button>

      {/* <div className="flex gap-2">
        <label className="btn btn-outline btn-primary">
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
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          Upload Additional Document
          <input
            type="file"
            className="hidden"
            onChange={handleDocumentUpload}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
        </label>
      </div> */}
    </div>
  )}

  
        </Section>
        {/* Service Information Section */}
        <Section title="Religion, Caste">
          <div className="bg-base-100 p-6 rounded-lg border border-base-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.category || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "personal",
                        "category",
                        e.target.value
                      )
                    } // This is correct
                    className="input input-bordered imput-sm max-w-xs"
                    placeholder="Enter Category"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-gray-800 ">
                    {staffData.category}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Religion</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.religion || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "personal",
                        "religion",
                        e.target.value
                      )
                    }
                    className="input input-bordered imput-sm max-w-xs"
                    placeholder="Enter Religion"
                  />
                ) : (
                  <div>{staffData.religion || "---"}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="flex flex-col">
                <label className="label block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Caste</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.caste || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "personal",
                        "caste",
                        e.target.value
                      )
                    }
                    className="input input-bordered imput-sm max-w-xs"
                    placeholder="Enter caste"
                  />
                ) : (
                  <div>{staffData.caste || "---"}</div>
                )}
              </div>

              
            </div>
          </div>
        </Section>
        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-4 mt-8 p-6 bg-base-200 rounded-lg">
            <button
              onClick={handleEditToggle}
              className="btn btn-outline btn-error"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Saving...
                </>
              ) : (
                "Save All Changes"
              )}
            </button>
          </div>
        )}
        {/* Modal Components */}
        {activeModal && (
          <Modal
            isOpen={!!activeModal}
            onClose={() => setActiveModal(null)}
            title={activeModal}
          >
            <div className="p-4">
              <p>Modal content for {activeModal}</p>
            </div>
          </Modal>
        )}
      </Suspense>
    </div>
  );
};

export default StaffProfileViewEdit;
