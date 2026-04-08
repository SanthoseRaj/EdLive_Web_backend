import { NavLink } from "react-router-dom";

const tabs = [
  { label: "Overview", to: "/admission" },
  { label: "Start admission", to: "/admission/start" },
  { label: "New Requests", to: "/admission/new", countKey: "new" },
  { label: "Accepted", to: "/admission/accepted", countKey: "accepted" },
  { label: "Rejected/Not joined", to: "/admission/rejected", countKey: "rejected" },
];

const AdmissionTabs = ({ counts = {} }) => {
  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-10">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === "/admission"}
            className={({ isActive }) =>
              [
                "inline-flex items-center gap-2 text-[15px] font-medium leading-none transition-colors",
                isActive ? "text-[#18B0D8]" : "text-[#111827] hover:text-[#18B0D8]",
              ].join(" ")
            }
          >
            {tab.label}

            {tab.countKey && counts[tab.countKey] !== undefined ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D02020] px-2 text-[12px] font-bold leading-none text-white">
                {counts[tab.countKey]}
              </span>
            ) : null}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default AdmissionTabs;
