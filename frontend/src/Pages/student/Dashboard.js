import React, { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ===== Placeholder for icon loading =====
const IconPlaceholder = ({ size = "w-6 h-6" }) => (
  <span className={`inline-block ${size} bg-gray-200 rounded-full animate-pulse`}></span>
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
        {badgeCount>0 && (
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
          <div className="text-[#2E3192] text-sm mt-1">
            {subtitle}
          </div>
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
      <div className="relative mb-3 flex items-center justify-center">
        {badgeCount>0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full z-10">
            {badgeCount}
          </span>
        )}
        {svg ? (
          <img src={svg} alt="icon" className="w-10 h-10" />
        ) : (
          <Suspense fallback={<IconPlaceholder size="w-10 h-10" />}>
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

// ===== Child Card Component =====
const ChildCard = ({ child, onSelect, badge }) => (
  <div className="flex flex-col items-center mb-8 cursor-pointer" onClick={() => onSelect(child)}>
    <div className="relative">
      <img
        src={`${process.env.REACT_APP_API_URL}${child.profile_img}`}
        alt={child.full_name}
        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
      />
      {badge && (
        <span className="absolute top-1 right-1 bg-pink-600 text-white text-xs px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </div>
    <h2 className="mt-4 text-[#2E3192] font-bold text-lg">{child.full_name}</h2>
    <p className="text-gray-600 text-sm">
      ID No. {child.admission_no} &nbsp; | &nbsp; Class: {child.classname}
    </p>
  </div>
);

// ===== Main Component =====
const DashboardPage = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [childId, setChildId] = useState(localStorage.getItem("childId") || null);
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

  useEffect(() => {
    const fetchDashboardCounts = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/dashboard/counts?studentId=`+childId, {
           method: 'GET',
              credentials: 'include'
        });
        if (response.ok) {
          const counts = await response.json();
          setDashboardCounts(counts);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard counts:', error);
      }
    };
    
    fetchDashboardCounts();
  }, []);

  // Fetch children if no child selected
  useEffect(() => {
    if (!childId) {
      const fetchChildren = async () => {
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/api/student/parents/children`, {
             method: 'GET',
              credentials: 'include'
          });
          if (!res.ok) throw new Error("Failed to fetch children");
          const data = await res.json();
          setChildren(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchChildren();
    }
  }, [childId]);

  // Select child and save
  const handleSelectChild = (child) => {
    localStorage.setItem("childId", child.id);
    localStorage.setItem("classId", child.class_id);
    setChildId(child.id);
  };

  // ========== Case 1: No child selected → Show selection ==========
  if (!childId) {
    if (loading) return <div className="p-4 text-center">Loading...</div>;

    return (
      <div className="max-w-md mx-auto p-4 text-center">

        {children.length > 0 ? (
          children.map((child, i) => (
            <ChildCard key={child.id} child={child} badge={i === 0 ? 4 : null} onSelect={handleSelectChild} />
          ))
        ) : (
          <p className="text-gray-500">No children found.</p>
        )}
      </div>
    );
  }

  // ========== Case 2: Child selected → Show dashboard ==========
  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <DashboardCard svg="/svgs/notification.svg" title="Notifications" subtitle="A note from teacher" color="#F9F7A5" badgeCount={dashboardCounts.notifications} />
        </div>
        <div className="col-span-6">
          <DashboardCard svg="/svgs/achievements.svg" title="Achievements" subtitle="Will appear only if there is any achievement" color="#F7EB7C" badgeCount={dashboardCounts.achievements} onClick={() => navigate('/Achievement')}/>
        </div>
        <div className="col-span-6">
          <DashboardCard svg="/svgs/todo.svg" title="My To-Do List" subtitle="Check your task" color="#8FD8E5" badgeCount={dashboardCounts.todo} onClick={() => navigate('/todos')}/>
        </div>
        <div className="col-span-6">
          <DashboardCard svg="/svgs/food.svg" title="Food" subtitle="You can explore daily menu" color="#FFE0B2"  />
        </div>
        <div className="col-span-3">
          <DashboardCard1 svg="/svgs/attendance.svg" title="Attendance" subtitle="Absent 2 days" color="#FFCCCC" />
        </div>
        <div className="col-span-3">
          <DashboardCard1 svg="/svgs/payments.svg" title="Payments" subtitle={<div><div>Fee Rs. 2500</div><div>Due on 1, Mar. 2018</div></div>} color="#C0DD94" onClick={() => navigate("/payment")} />
        </div>
        <div className="col-span-3">
          <DashboardCard1 svg="/svgs/class_time.svg" title="Time table" color="#E8B3DE" />
        </div>
        <div className="col-span-3">
          <DashboardCard1 svg="/svgs/exams.svg" title="Exams" badgeCount={2} color="#AAE5C8" />
        </div>
        <div className="col-span-6">
          <DashboardCard svg="/svgs/events.svg" title="Events & Holidays" subtitle="16, Jan 2019, Pongal (Govt. Holiday)" color="#F9AFD2" />
        </div>
        <div className="col-span-6">
          <DashboardCard svg="/svgs/reports.svg" title="Reports" badgeCount={1} color="#FFCCCC" />
        </div>
        <div className="col-span-3">
          <DashboardCard1 svg="/svgs/school_bus.svg" title="School bus" subtitle="7:45 AM" color="#ccccff" />
        </div>
        <div className="col-span-3">
          <DashboardCard1 svg="/svgs/message.svg" title="Message" color="#a3d3a7" />
        </div>
        <div className="col-span-6">
          <DashboardCard svg="/svgs/syllabus.svg" title="Syllabus" subtitle="Updated on 1, Jan 2019" color="#91c1bc" />
        </div>
        <div className="col-span-6">
          <DashboardCard svg="/svgs/notification.svg" title="Teachers" subtitle="You can interact with teachers" color="#ffd399" />
        </div>
        <div className="col-span-6">
          <DashboardCard svg="/svgs/co_curricular.svg" title="Co curricular activities" subtitle="NCC Camp on 23, Jan 2019" color="#dbd88a" />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
