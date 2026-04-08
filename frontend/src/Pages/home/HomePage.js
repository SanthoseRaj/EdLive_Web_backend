import React, { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ===== Lazy loading for icons =====
const HiOutlineBell = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineBell,
  }))
);
const HiOutlineClipboardDocumentList = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineClipboardDocumentList,
  }))
);
const HiOutlineUserPlus = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineUserPlus,
  }))
);
const HiOutlineCurrencyDollar = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineCurrencyDollar,
  }))
);
const HiOutlineCalendar = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineCalendar,
  }))
);
const HiOutlineTrophy = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineTrophy,
  }))
);
const HiOutlineDocumentText = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineDocumentText,
  }))
);
const HiOutlineBookOpen = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineBookOpen,
  }))
);
const HiOutlineChatBubbleLeftEllipsis = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineChatBubbleLeftEllipsis,
  }))
);
const HiOutlineWrenchScrewdriver = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineWrenchScrewdriver,
  }))
);
const HiOutlineUserGroup = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineUserGroup,
  }))
);
const HiOutlineTruck = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineTruck,
  }))
);
const HiBuildingLibrary = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiBuildingLibrary,
  }))
);
const HiOutlineShieldCheck = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineShieldCheck,
  }))
);
const HiOutlineUsers = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineUsers,
  }))
);

// ===== Placeholder for icon loading =====
const IconPlaceholder = ({ size = "w-6 h-6" }) => (
  <span
    className={`inline-block ${size} bg-gray-200 rounded-full animate-pulse`}
  ></span>
);

// ===== Dashboard Card Components =====
const DashboardCard = ({
  icon: Icon,
  svg,
  title,
  subtitle,
  color,
  badgeCount,
  onClick,
}) => (
  <div
    className={`p-4 rounded shadow-md cursor-pointer hover:shadow-lg transition-all h-full`}
    style={{ backgroundColor: color }}
    onClick={onClick}
  >
    <div className="flex items-start gap-4">
      {/* Icon / SVG + Badge */}
      <div className="relative w-10 h-10 flex items-center justify-center">
        {badgeCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full z-10">
            {badgeCount}
          </span>
        )}
        {svg ? (
          <img src={svg} alt="icon" className="w-10 h-10" />
        ) : (
          <Suspense fallback={<IconPlaceholder />}>
            <Icon className="w-10 h-10 text-[#2E3192]" />
          </Suspense>
        )}
      </div>

      {/* Texts */}
      <div className="flex-1">
        <h2 className="text-[#2E3192] text-base font-semibold leading-tight">
          {title}
        </h2>
        {/* Subtitle — string → <p>, JSX → <div> */}
        {subtitle &&
          (typeof subtitle === "string" ? (
            <p className="text-[#2E3192] text-sm mt-1">{subtitle}</p>
          ) : (
            <div className="text-[#2E3192] text-sm mt-1">{subtitle}</div>
          ))}
      </div>
    </div>
  </div>
);

const DashboardCard1 = ({
  icon: Icon,
  svg,
  title,
  subtitle,
  color,
  badgeCount,
  onClick,
}) => (
  <div
    className={`p-4 rounded shadow-md cursor-pointer hover:shadow-lg transition-all h-full`}
    style={{ backgroundColor: color }}
    onClick={onClick}
  >
    <div className="flex flex-col items-center relative justify-center">
      <div className="relative w-10 h-10 flex items-center justify-center">
        {badgeCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full z-10">
            {badgeCount}
          </span>
        )}
        {svg ? (
          <img src={svg} alt="icon" className="w-10 h-10" />
        ) : (
          <Suspense fallback={<IconPlaceholder />}>
            <Icon className="w-10 h-10 text-[#2E3192]" />
          </Suspense>
        )}
      </div>

      <h2 className="text-[#2E3192] text-base font-semibold text-center">
        {title}
      </h2>
      {/* Subtitle — string → <p>, JSX → <div> */}
      {subtitle &&
        (typeof subtitle === "string" ? (
          <p className="text-[#2E3192] text-sm text-center mt-1">{subtitle}</p>
        ) : (
          <div className="text-[#2E3192] text-sm text-center mt-1">
            {subtitle}
          </div>
        ))}
    </div>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [dashboardCounts, setDashboardCounts] = useState({
    notifications: 0,
    todo: 0,
    admission: 0,
    payments: 0,
    staff: 0,
    performance: 0,
    events: 0,
    messages: 0,
    transport: 0,
    library: 0,
    subjects: 0,
    lab: 0,
    administration: 0,
    pta: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAdminSubMenu, setShowAdminSubMenu] = useState(false);

  useEffect(() => {
    const fetchDashboardCounts = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/dashboard/counts`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const counts = await response.json();
          setDashboardCounts(counts);
        } else {
          console.error("Failed to fetch dashboard counts");
        }
      } catch (error) {
        console.error("Failed to fetch dashboard counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardCounts();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-[#2E3192] mb-6">
          Admin Dashboard
        </h1>
        <div className="grid grid-cols-12 gap-4">
          {Array.from({ length: 14 }).map((_, index) => (
            <div
              key={index}
              className="col-span-3 p-4 bg-gray-200 rounded shadow-md h-32 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-[#2E3192] mb-6">
        Admin Dashboard
      </h1>
{showAdminSubMenu && (
  <div className="mb-6">
    <button
      onClick={() => setShowAdminSubMenu(false)}
      className="flex items-center gap-2 text-[#2E3192] font-semibold hover:underline"
    >
      ⬅ Back
    </button>
  </div>
)}
      {!showAdminSubMenu ? (
        <div className="grid grid-cols-12 gap-4">
          {/* Row 1 */}
          <div className="col-span-6">
            <DashboardCard
              svg="/svgs/notification01_icon.svg"
              title="Notifications"
              subtitle="Staff meeting on 12th June 2019"
              color="#F9F7A5"
              badgeCount={dashboardCounts.notifications}
              onClick={() => navigate("/notifications")}
            />
          </div>
          <div className="col-span-6">
            <DashboardCard
              svg="/svgs/achievements.svg"
              title="Achievements"
              subtitle="Announce an achievement"
              color="#FCEE21"
              badgeCount={dashboardCounts.achievements}
              onClick={() => navigate("/Achievement")}
            />
          </div>

          {/* Row 2 */}
          <div className="col-span-6">
            <DashboardCard
              svg="/svgs/myTodoList_icon.svg"
              title="My to-do list"
              subtitle="Call PTA meeting"
              color="#8FD8E5"
              badgeCount={dashboardCounts.todo}              
              onClick={() => navigate("/todos")}
            />
          </div>
          <div className="col-span-6">
            <DashboardCard
              svg="/svgs/report_icon.svg"
              title="Records/documents"
              subtitle="View all academic files"
              color="#CCC39A"
            />
          </div>

          {/* Row 3 */}
          <div className="col-span-3">
            <DashboardCard1
              icon={HiOutlineUserPlus}
              title="Users"
              subtitle="2000 Applications"
              color="#FFAEAE"
              badgeCount={dashboardCounts.admission}
              onClick={() => navigate("/userlist")}
            />
          </div>
          <div className="col-span-3">
            <DashboardCard1
              svg="/svgs/classes_icon.svg"
              title="Classes"
              subtitle="20 pending payments"
              color="#E8B3DE"
              onClick={() => navigate("/payment")}
              badgeCount={dashboardCounts.payments}
            />
          </div>
          <div className="col-span-3">
            <DashboardCard1
              svg="/svgs/staff_icon.svg"
              title="Staff"
              subtitle="4 staff on leave"
              color="#C0DD94"
              onClick={() => navigate("/stafflist")}
              badgeCount={dashboardCounts.staff}
            />
          </div>
          <div className="col-span-3">
            <DashboardCard1
              svg="/svgs/performance_icon.svg"
              title="Performance"
              subtitle="SSLC: 100%"
              color="#FCDBB1"
              badgeCount={dashboardCounts.performance}
              onClick={() => navigate("/performance")}
            />
          </div>

          {/* Row 4 */}
          <div className="col-span-3 row-span-2">
            <DashboardCard1
              svg="/svgs/transport_icon.svg"
              title="Transport"
              subtitle="35 Buses, 4 routes"
              color="#CCCCFF"
              badgeCount={dashboardCounts.transport}
              onClick={() => navigate("/transport")}
            />
          </div>
          <div className="col-span-3 row-span-2">
            <DashboardCard1
              svg="/svgs/library_icon.svg"
              title="Library"
              subtitle="1 request"
              color="#AAE5C8"
              badgeCount={dashboardCounts.library}
              onClick={() => navigate("/library")}
            />
          </div>
          <div className="col-span-6">
            <DashboardCard
              svg="/svgs/events_icon.svg"
              title="Events & Holidays"
              subtitle="16, Jan 2019, Pongal (Govt. Holiday)"
              color="#F9AFD2"
              badgeCount={dashboardCounts.events}              
              onClick={() => navigate("/enventholidays")}
            />
          </div>
          <div className="col-span-6">
            <DashboardCard
              svg="/svgs/message_icon.svg"
              title="Message board"
              subtitle="Send messages and updates"
              color="#FFCCCC"
              badgeCount={dashboardCounts.messages}
              onClick={() => navigate("/message")}
            />
          </div>

          {/* Row 5 */}
          <div className="col-span-6">
            <DashboardCard
              svg="/svgs/syllabus_icon.svg"
              title="Subjects and teachers"
              subtitle="Syllabus, teachers' contacts"
              color="#91C1BC"
              onClick={() => navigate("/teachersubject")}
              
            />
          </div>
          <div className="col-span-6">
            <DashboardCard
              svg="/svgs/lab_icon.svg"
              title="Lab"
              subtitle="3 equipments added"
              color="#FFD399"
              badgeCount={dashboardCounts.lab}
            />
          </div>

          <div className="col-span-6">
            <DashboardCard
              svg="/svgs/food.svg"
              title="Food"
              subtitle="You can explore daily menu"
              color="#FFE0B2"
              onClick={() => navigate("/food")}
            />
          </div>
          <div className="col-span-6">
            <DashboardCard
              svg="/svgs/co_curricular.svg"
              title="Co curricular activities"
              subtitle="NCC Camp on 23, Jan 2019"
              color="#dbd88a"
              onClick={() => navigate("/cocurricular")}
            />
          </div>
          {/* Row 6 */}
          <div className="col-span-6">
            <DashboardCard
              svg="/svgs/administration_icon.svg"
              title="Administration"
              subtitle="Access all"
              color="#DBD88A"
              badgeCount={dashboardCounts.administration}
              onClick={() => setShowAdminSubMenu(true)}
            />
          </div>
          <div className="col-span-6">
            <DashboardCard
              svg="/svgs/pta_icon.svg"
              title="PTA"
              subtitle="Progress report updated"
              color="#D6B4A3"
              badgeCount={dashboardCounts.pta}
              onClick={() => navigate("/pta")}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          {/* Admission */}
          <div className="col-span-6">
            <DashboardCard
              svg="/svgs/admission_icon.svg"
              title="Admission"
              subtitle="Student admissions & applications"
              color="#FFAEAE"
              onClick={() => navigate("/admission")}
            />
          </div>

          {/* Master */}
          <div className="col-span-6">
            <DashboardCard
              svg="/svgs/administration_icon.svg"
              title="Master"
              subtitle="Academic & system master data"
              color="#DBD88A"
              onClick={() => navigate("/master")}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
