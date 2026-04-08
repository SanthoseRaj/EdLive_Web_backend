import { useMemo, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import AdmissionTabs from "../../../components/admission/AdmissionTabs.jsx";
import { applicationsWithDetails } from "../../../data/applications.js";

const AdmissionLayout = () => {
  const location = useLocation();
  const isApplicationDetail = location.pathname.includes("/admission/application/");
  const [applications, setApplications] = useState(applicationsWithDetails);

  const counts = useMemo(() => {
    return applications.reduce(
      (acc, app) => {
        if (!["Accepted", "Rejected", "Not joined"].includes(app.status)) acc.new += 1;
        if (app.status === "Accepted") acc.accepted += 1;
        if (["Rejected", "Not joined"].includes(app.status)) acc.rejected += 1;
        return acc;
      },
      { new: 0, accepted: 0, rejected: 0 }
    );
  }, [applications]);

  if (isApplicationDetail) return <Outlet context={{ applications, setApplications }} />;

  return (
    <div className="mx-auto max-w-[1200px] rounded-xl bg-white px-6 pb-6 pt-5">
      {/* Back (screenshot போல light) */}
      <div className="mb-3 flex items-center gap-2 text-[14px] font-normal text-[#111827]">
        <span aria-hidden="true">&lt;</span>
        <Link to="/" className="hover:text-[#18B0D8]">
          Back
        </Link>
      </div>

      {/* Title (screenshot blue) */}
      <h1 className="mb-9 text-[40px] font-extrabold leading-none text-[#204098]">
        All about admission
      </h1>

      {/* Tabs */}
      <AdmissionTabs counts={counts} />

      {/* Page content */}
      <div className="mt-6">
        <Outlet context={{ applications, setApplications }} />
      </div>
    </div>
  );
};

export default AdmissionLayout;
