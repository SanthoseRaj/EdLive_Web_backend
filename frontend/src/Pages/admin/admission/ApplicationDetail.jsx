import {
  Link,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { applicationsById, applicationsWithDetails } from "../../../data/applications.js";
import AdmissionForm from "./AdmissionForm.jsx";

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backTo = location.state?.from || "/admission/new";

  const { applications = applicationsWithDetails, setApplications } =
    useOutletContext() || {};

  const savedData = JSON.parse(
    localStorage.getItem("admissionFormData") || "{}"
  );
  const hasLocalApplicant = savedData.applicationNo === id;

  const baseApplicant = applicationsById[id] || applicationsWithDetails[0];
  const applicant = hasLocalApplicant
    ? { ...baseApplicant, ...savedData }
    : baseApplicant;

  const updateStatusAndGo = (newStatus, destination) => {
    if (setApplications) {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      );
    }
    navigate(destination, { replace: true });
  };

  return (
    <div>
      <div className="mx-auto max-w-[1200px] rounded-xl bg-white px-6 pb-6 pt-5 shadow-sm ring-1 ring-slate-200">
        {/* Back */}
        <div className="mb-3 flex items-center gap-2 text-[14px] font-normal text-[#111827]">
          <span aria-hidden="true">&lt;</span>
          <Link to="/" className="transition hover:text-[#18B0D8]">
            Back
          </Link>
        </div>

        {/* Title */}
        <h1 className="mb-6 text-[40px] font-extrabold leading-none text-[#204098]">
          All about admission
        </h1>

        {/* Applicant header */}
       <div className="mt-2 flex flex-wrap items-end justify-between gap-6">
  <div>
    <div className="text-[44px] font-bold leading-none text-[#2c4db8]">
      {applicant.id}
    </div>

    {/* spacing added here */}
    <div className="mt-2 text-[13px] font-medium text-slate-500">
      Syllabus – <strong>{applicant.syllabus}</strong>
    </div>
  </div>

  <div className="text-right">
    <div className="text-[12px] font-medium text-slate-400">
      Applied on
    </div>
    <div className="mt-1 text-[14px] font-semibold text-slate-900">
      {applicant.appliedOn}
    </div>
  </div>
</div>


        {/* Form */}
        <div className="mt-6">
          <AdmissionForm
            hideEntryToggle
            initialData={applicant}
            showActions={false}
          />
        </div>

        {/* Actions */}
        <div className="mt-4 flex justify-end gap-3">
          <button
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#FFE8E8] px-4 text-[14px] font-semibold text-[#D84545] ring-1 ring-[#FFC6C6] transition hover:bg-[#FFECEC]"
            onClick={() =>
              updateStatusAndGo("Rejected", "/admission/rejected")
            }
          >
            Reject
          </button>

          <button
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-[14px] font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={() =>
              updateStatusAndGo("Shortlisted", backTo || "/admission/new")
            }
          >
            Shortlist
          </button>

          <button
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#2FA84F] px-4 text-[14px] font-semibold text-white shadow-sm transition hover:brightness-95"
            onClick={() =>
              updateStatusAndGo("Accepted", "/admission/accepted")
            }
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
