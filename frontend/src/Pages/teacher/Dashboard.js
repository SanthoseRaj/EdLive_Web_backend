import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ===== Placeholder for icon loading =====
const IconPlaceholder = ({ size = "w-6 h-6" }) => (
  <span
    className={`inline-block ${size} bg-gray-200 rounded-full animate-pulse`}
  ></span>
);

// ===== Dashboard Card Components =====
const DashboardCard = ({
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
        {badgeCount > 0 ? (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full z-10">
            {badgeCount}
          </span>
        ):null}
        {svg ? (
          <img src={svg} alt="icon" className="w-10 h-10" />
        ) : (
          <IconPlaceholder />
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
            <div className="text-[#2E3192] text-sm mt-1">
              {subtitle}
            </div>
          ))}
      </div>
    </div>
  </div>
);

const DashboardCard1 = ({
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
      <div className="relative mb-3 flex items-center justify-center">
        {badgeCount > 0 ? (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full z-10">
            {badgeCount}
          </span>
        ):null}
        {svg ? (
          <img src={svg} alt="icon" className="w-10 h-10" />
        ) : (
          <IconPlaceholder size="w-10 h-10" />
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

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [dashboardCounts, setDashboardCounts] = useState({
    notifications: 0,
    todo: 0,
    attendance: 0,
    payments: 0,
    exams: 0,
    messages: 0,
    library: 0,
    cocurricular: 0,
    achievements: 0,
    quick_notes: 0,
    special_care: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardCounts = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/dashboard/counts`, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const counts = await response.json();
          setDashboardCounts(counts);
        } else {
          console.error('Failed to fetch dashboard counts');
        }
      } catch (error) {
        console.error('Failed to fetch dashboard counts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardCounts();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-12 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="col-span-3 p-4 bg-gray-200 rounded shadow-md h-32 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-[#2E3192] mb-6">Teacher Dashboard</h1>

      <div className="grid grid-cols-12 gap-4">
        {/* Row 1 */}
        <div className="col-span-6">
          <DashboardCard
            svg="/svgs/notification.svg"
            title="Notifications"
            subtitle="PTA meeting on 12, Feb. 2019"
            color="#f9f7a5"
            badgeCount={dashboardCounts.notifications}
          />
        </div>
        <div className="col-span-6">
          <DashboardCard
            svg="/svgs/achievements.svg"
            title="Achievements"
            subtitle="Congratulate your students"
            color="#fcee21"
            badgeCount={dashboardCounts.achievements}
            onClick={() => navigate('/Achievement')}
          />
        </div>

        {/* Row 2 */}
        <div className="col-span-6">
          <DashboardCard
            svg="/svgs/todo.svg"
            title="My to-do list"
            subtitle="Make your own list, set reminder."
            color="#8fd8e5"
            badgeCount={dashboardCounts.todo}
            onClick={() => navigate('/todos')}
          />
        </div>
        <div className="col-span-6">
          <DashboardCard
            svg="/svgs/reports.svg"
            title="Reports"
            subtitle="Progress reports updated"
            color="#ffcccc"
          />
        </div>

        {/* Row 3 */}
        <div className="col-span-3">
          <DashboardCard1
            svg="/svgs/attendance.svg"
            title="Attendance"
            subtitle="Take attendance"
            color="#ffaeae"
            badgeCount={dashboardCounts.attendance}
          />
        </div>
        <div className="col-span-3">
          <DashboardCard1
            svg="/svgs/class_time.svg"
            title="Class & Time"
            subtitle="View schedule"
            color="#fcdbb1"
          />
        </div>
        <div className="col-span-3">
          <DashboardCard1
            svg="/svgs/payments.svg"
            title="Payments"
            subtitle="Fee status"
            color="#c0dd94"
            onClick={() => navigate('/payment')}
            badgeCount={dashboardCounts.payments}
          />
        </div>
        <div className="col-span-3">
          <DashboardCard1
            svg="/svgs/exams.svg"
            title="Exams"
            subtitle="Manage exams"
            color="#aae5c8"
            badgeCount={dashboardCounts.exams}
          />
        </div>

        {/* Row 4 */}
        <div className="col-span-3 row-span-2">
          <DashboardCard1
            svg="/svgs/transport.svg"
            title="Transport"
            subtitle="Bus routes"
            color="#ccccff"
          />
        </div>
        <div className="col-span-3 row-span-2">
          <DashboardCard1
            svg="/svgs/message.svg"
            title="Messages"
            subtitle="Communicate with parents"
            color="#e8b3de"
            badgeCount={dashboardCounts.messages}
          />
        </div>
        <div className="col-span-6">
          <DashboardCard
            svg="/svgs/events.svg"
            title="Events & Holidays"
            subtitle="16, Jan 2019, Pongal (Govt. Holiday)"
            color="#f9afd2"
          />
        </div>
        <div className="col-span-6">
          <DashboardCard
            svg="/svgs/pta.svg"
            title="PTA"
            subtitle="Next Meeting: 22 Sep.2019"
            color="#dbc0b6"
            onClick={() => navigate('/pta')}
          />
        </div>

        {/* Row 5 */}
        <div className="col-span-6">
          <DashboardCard
            svg="/svgs/library.svg"
            title="Library"
            subtitle="Manage resources"
            color="#accfe2"
            badgeCount={dashboardCounts.library}
          />
        </div>
        <div className="col-span-6">
          <DashboardCard
            svg="/svgs/syllabus.svg"
            title="Syllabus"
            subtitle="Curriculum planning"
            color="#a3d3a7"
          />
        </div>
        
        {/* Row 6 */}
        <div className="col-span-6">
          <DashboardCard
            svg="/svgs/special_care.svg"
            title="Special Care"
            subtitle="Students needing support"
            color="#ffd399"
            badgeCount={dashboardCounts.special_care}
          />
        </div>
        <div className="col-span-6">
          <DashboardCard
            svg="/svgs/co_curricular.svg"
            title="Co-curricular Activities"
            subtitle="NCC Camp on 23, Jan.2019"
            color="#dbd88a"
            onClick={() => navigate('/cocurricular')}
            badgeCount={dashboardCounts.cocurricular}
          />
        </div>
        
        {/* Row 7 */}
        <div className="col-span-6">
          <DashboardCard
            svg="/svgs/quick_notes.svg"
            title="Quick Notes"
            subtitle="Note anything important"
            color="#e6e6e6"
            badgeCount={dashboardCounts.quick_notes}
          />
        </div>
        <div className="col-span-6">
          <DashboardCard
            svg="/svgs/resources.svg"
            title="Resources"
            subtitle="Teaching materials"
            color="#d8cad8"
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;