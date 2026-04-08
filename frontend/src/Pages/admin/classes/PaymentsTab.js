import React, { useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
import { initiateRazorpayPayment, initiateTestUPIPayment } from "../../utils/paymentGateway";

const PaymentsTab = ({
  selectedClass,
  selectedDivisions,
  fees,
  feeTypes,
  newPayment,
  setNewPayment,
  addingPayment,
  setAddingPayment,
  isEditingFeeType,
  setIsEditingFeeType,
    editingFeeType,
  setEditingFeeType,
  handleEditFeeType,
  handleUpdateFeeType,
  handleAddPayment,
  handleDeleteFeeType,
  newAssignment,
  setNewAssignment,
  addingAssignment,
  setAddingAssignment,
  isEditingAssignment,
  setIsEditingAssignment,
    editingAssignment,
  setEditingAssignment,
  handleEditAssignment,
  handleUpdateAssignment,
  handleAddAssignment,
  handleDeleteAssignment,
  handleTestPayment,
  handleRazorpayPayment,
  isProcessingPayment,
  formatNumberWithCommas,
  academicYear
}) => {
  const [upiId] = useState("sumandominic@okaxis");

  const generateUPIUrl = (fee) => {
    return `upi://pay?pa=${upiId}&pn=School Name&am=${fee.amount}&tn=Payment for ${fee.name} (ID: ${fee.id})&cu=INR`;
  };

  const PendingStudentsTooltip = ({ students }) => {
    if (!students || students.length === 0) return null;

    return (
      <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <h4 className="font-medium text-sm mb-2">Pending Students:</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="font-semibold">Name</div>
          <div className="font-semibold">Admission No</div>
          {students.map((student) => (
            <React.Fragment key={`student-${student.admission_no}`}>
              <div>{student.full_name}</div>
              <div>{student.admission_no}</div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Fee Types Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-3">Fee Types</h3>
        <div className="space-y-2">
          {feeTypes.map((feeType) => (
            <div
              key={feeType.id}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <h4 className="font-medium">{feeType.name}</h4>
                <p className="text-sm text-gray-600">
                  {feeType.description}
                </p>
                <p className="text-sm font-bold">
                  ₹{formatNumberWithCommas(feeType.amount)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => handleEditFeeType(feeType)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-error btn-outline"
                  onClick={() => handleDeleteFeeType(feeType.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Fee Type Form */}
        {addingPayment ? (
          <div className="mt-4 space-y-2">
            <h3 className="font-medium">
              {isEditingFeeType ? "Edit Fee Type" : "Add New Fee Type"}
            </h3>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Payment name"
              value={newPayment.name}
              onChange={(e) =>
                setNewPayment({ ...newPayment, name: e.target.value })
              }
            />
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Description"
              value={newPayment.description}
              onChange={(e) =>
                setNewPayment({
                  ...newPayment,
                  description: e.target.value,
                })
              }
            ></textarea>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Amount"
              value={
                newPayment.amount
                  ? formatNumberWithCommas(newPayment.amount)
                  : ""
              }
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, "");
                setNewPayment({ ...newPayment, amount: rawValue });
              }}
            />
            <div className="flex gap-2">
              <button
                className="btn btn-primary"
                onClick={
                  isEditingFeeType
                    ? handleUpdateFeeType
                    : handleAddPayment
                }
              >
                {isEditingFeeType ? "Update" : "Save"}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setAddingPayment(false);
                  setIsEditingFeeType(false);
                  setEditingFeeType(null);
                  setNewPayment({
                    name: "",
                    description: "",
                    amount: "",
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="mt-4 text-[#00a9ec] flex items-center gap-2"
            onClick={() => setAddingPayment(true)}
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add a payment
          </button>
        )}
      </div>

      {/* Fee Assignments Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-3">
          Fee Assignments
        </h3>
        <div className="space-y-3">
          {fees.map((fee) => (
            <div
              key={fee.id}
              className="border rounded p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-medium">{fee.name}</h4>
                  <div className="text-sm text-gray-600 mb-2">
                    <span>Due date: {fee.dueDate}</span>
                  </div>
                  <div className="font-bold text-lg">
                    ₹{formatNumberWithCommas(fee.amount)}
                  </div>
                </div>
                <div className="ml-4">
                  <div className="p-2 bg-white border rounded">
                    <QRCode
                      value={fee.qrCode || generateUPIUrl(fee)}
                      size={120}
                      level="H"
                    />
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <p className="text-gray-600 text-center mb-2">
                    Scan to pay via
                  </p>
                  <div className="flex justify-center gap-2 mb-3">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                      GPay
                    </span>
                    <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-1 rounded">
                      Paytm
                    </span>
                    <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded">
                      PhonePe
                    </span>
                  </div>

                  {/* Payment Buttons Container */}
                  <div className="flex flex-col gap-2 w-full">
                    {/* Test UPI Payment Button */}
                    <button
                      className="btn btn-primary btn-sm w-full"
                      onClick={() => handleTestPayment(fee)}
                      disabled={isProcessingPayment}
                    >
                      {isProcessingPayment ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        "Test UPI Payment"
                      )}
                    </button>

                    {/* Razorpay Payment Button */}
                    <button
                      className="btn btn-secondary btn-sm w-full"
                      onClick={() => handleRazorpayPayment(fee)}
                      disabled={isProcessingPayment}
                    >
                      {isProcessingPayment ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        "Pay with Card/UPI"
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 flex justify-between mb-2">
                <div className="relative group">
                  <span
                    className={
                      fee.pending > 0
                        ? "text-blue-600 cursor-pointer"
                        : ""
                    }
                  >
                    Pending payments:{" "}
                    <span
                      className={
                        fee.pending > 0 ? "text-blue-600" : ""
                      }
                    >
                      {fee.pending}
                      {fee.pending > 0 && (
                        <>
                          <Link
                            to={`/payments/view?class=${selectedClass}&section=${selectedDivisions}&fee_id=${fee.id}`}
                            className="ml-1 underline"
                          >
                            (View)
                          </Link>
                          <div className="absolute hidden group-hover:block">
                            <PendingStudentsTooltip
                              students={fee.pendingStudents}
                            />
                          </div>
                        </>
                      )}
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => handleEditAssignment(fee)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-error btn-outline"
                  onClick={() => handleDeleteAssignment(fee.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Assignment Form */}
        {addingAssignment ? (
          <div className="mt-6 space-y-2">
            <h3 className="font-medium">
              {isEditingAssignment
                ? "Edit Fee Assignment"
                : "Assign Fee to Class"}
            </h3>
            <select
              className="select select-bordered w-full"
              value={newAssignment.fee_type_id}
              onChange={(e) =>
                setNewAssignment({
                  ...newAssignment,
                  fee_type_id: e.target.value,
                })
              }
            >
              <option value="">Select Fee Type</option>
              {feeTypes.map((feeType) => (
                <option key={feeType.id} value={feeType.id}>
                  {feeType.name} (₹
                  {formatNumberWithCommas(feeType.amount)})
                </option>
              ))}
            </select>
            <input
              type="date"
              className="input input-bordered w-full"
              placeholder="Due Date"
              value={newAssignment.due_date}
              onChange={(e) =>
                setNewAssignment({
                  ...newAssignment,
                  due_date: e.target.value,
                })
              }
            />
            <select
              className="select select-bordered w-full"
              value={newAssignment.academic_year}
              onChange={(e) =>
                setNewAssignment({
                  ...newAssignment,
                  academic_year: e.target.value,
                })
              }
            >
              <option value="2022-2023">2022-2023</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
            </select>
            <div className="flex gap-2">
              <button
                className="btn btn-primary"
                onClick={
                  isEditingAssignment
                    ? handleUpdateAssignment
                    : handleAddAssignment
                }
              >
                {isEditingAssignment ? "Update" : "Assign"}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setAddingAssignment(false);
                  setIsEditingAssignment(false);
                  setEditingAssignment(null);
                  setNewAssignment({
                    fee_type_id: "",
                    due_date: "",
                    academic_year: "2025-2026",
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="mt-4 text-[#00a9ec] flex items-center gap-2"
            onClick={() => setAddingAssignment(true)}
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Assign fee to class
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentsTab;