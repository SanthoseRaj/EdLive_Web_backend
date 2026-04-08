import React, {
  lazy,
  Suspense,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
const XSvg = lazy(() => import("../../components/svgs/EdLive"));

// Custom hook for navigation state
const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    const updateNavigationState = () => {
      const canBack = window.history.state?.idx > 0;
      const canForward =
        window.history.state?.idx < window.history.length - 1;

      setCanGoBack(canBack);
      setCanGoForward(canForward);
    };

    updateNavigationState();
    window.addEventListener("popstate", updateNavigationState);
    return () => window.removeEventListener("popstate", updateNavigationState);
  }, [location]);

  const goBack = () => {
    if (canGoBack) navigate(-1);
  };

  const goForward = () => {
    if (canGoForward) navigate(1);
  };

  return {
    canGoBack,
    canGoForward,
    goBack,
    goForward,
  };
};

const NavigationButtons = () => {
  const { canGoBack, canGoForward, goBack, goForward } = useNavigation();

  if (!canGoBack && !canGoForward) return null;

  return (
    <div className="flex justify-between items-center mb-4 print:hidden ">
      <div>
        {canGoBack && (
          <button
            onClick={goBack}
            className="btn btn-ghost btn-sm btn-primary flex items-center gap-1"
            title="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
        )}
      </div>
      <div>
        {canGoForward && (
          <button
            onClick={goForward}
            className="btn btn-ghost btn-sm btn-primary flex items-center gap-1"
            title="Go forward"
          >
            Forward
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

const UnderConstruction = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center p-8 max-w-md">
        <svg
          className="w-20 h-20 mx-auto mb-6 text-error"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h2 className="text-2xl font-bold mb-4">Loading Error</h2>
        <p className="mb-6">
          We're having trouble loading this page. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Try Again
        </button>
        <Link to="/" className="btn btn-ghost mt-4">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuItems, setMenuItems] = useState([]);
  const [sidebarItems, setSidebarItems] = useState([]);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageLoadError, setPageLoadError] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const drawerRef = useRef(null);
  const menuRefs = useRef({});
  const hasFetchedData = useRef(false);
  
  const [notifCount, setNotifCount] = useState(1);

  const activeMenuItemClass = "bg-white text-black";
  const hoverMenuItemClass = "hover:bg-white/10";

  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 800;
    setIsMobile(mobile);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [checkMobile]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close expanded menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        expandedMenu &&
        !menuRefs.current[expandedMenu]?.contains(e.target)
      ) {
        setExpandedMenu(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [expandedMenu]);

  const fetchData = useCallback(async () => {
    if (hasFetchedData.current) return;
    hasFetchedData.current = true;

    try {
      setLoading(true);
      setPageLoadError(false);

      const userResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/me`,
        {
          credentials: "include",
        }
      );

      if (!userResponse.ok) throw new Error("Failed to fetch user data");

      const userData = await userResponse.json();
      setUserType(userData.usertype);

      const menuResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/menu?userType=${userData.usertype}`
      );
      if (!menuResponse.ok) throw new Error("Failed to fetch menu data");

      const menuData = await menuResponse.json();

      const mainMenu = menuData
        .filter((item) => item.menuType === "main")
        .sort((a, b) => a.displayOrder - b.displayOrder);

      const sidebarMenu = menuData
        .filter((item) => item.menuType === "sidebar")
        .sort((a, b) => a.displayOrder - b.displayOrder);

      setMenuItems(mainMenu);
      setSidebarItems(sidebarMenu);
    } catch (error) {
      console.error("Error fetching data:", error);
      setPageLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMenuClick = (e, menuId) => {
    e.stopPropagation();
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/logout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (response.ok) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (pageLoadError) {
    return <UnderConstruction />;
  }

  // simple placeholder icon to match the visual layout – you can replace this per item
  const MenuIcon = () => (
    <div className="w-11 h-11 border border-white rounded-md flex items-center justify-center text-xl font-semibold">
      <span className="leading-none">▤</span>
    </div>
  );

  return (
    <div
      className="min-h-screen flex flex-col bg-[#E8B3DE]"
      style={{ height: "100vh" }}
    >
      {/* Header */}
      <header className="bg-base-100 shadow-lg sticky top-0 z-50 h-16 print:hidden w-full">
        <div className="navbar w-full px-4 sm:px-6 lg:px-8">
          <div className="navbar-start">
            <button
              onClick={toggleSidebar}
              className="btn btn-ghost btn-circle mr-2"
              aria-label="Toggle sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {isMobile ? (
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white border-[#2a358e]">
                <span className="text-sm font-bold text-[#2a358e]">ED</span>
              </div>
            ) : (
//               <Link to="/" className="flex items-center p-0 m-0">
//   <Suspense fallback={<div className="w-24 h-8 bg-gray-200 animate-pulse"></div>}>
//     <XSvg className="h-8 w-44 fill-current text-primary" />
//   </Suspense>
// </Link>
<button className="relative  p-0 h-10 w-44 flex items-center" onClick={()=>{navigate('/')}}>
  <img src="/svgs/Edlive.svg" alt="Edlive" />
</button>
            )}
          </div>

          <div className="navbar-end flex items-center gap-3">
  {/* Notification button */}
  <button
    className="relative btn btn-ghost btn-circle p-0"
    aria-label="Notifications"
    onClick={() => {
      // handle click: open notification panel / route / dropdown
      // e.g. navigate('/notifications') or toggle a panel
      navigate('/notifications');
    }}
  >
    {/* bell icon */}
    <img src="/svgs/notificationAlert.svg" alt="icon" className="w-8 h-8" />

    {/* badge if there are notifications */}
    {notifCount > 0 && (
      <span
        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-white
                   bg-[#c81b78] border-2 border-white"
        aria-hidden="true"
      >
        {notifCount > 9 ? "9+" : notifCount}
      </span>
    )}
  </button>

  {/* user dropdown (kept as-is) */}
  <div className="dropdown dropdown-end">
    <button tabIndex={0} className="btn btn-ghost btn-circle">
      <img src="/svgs/userDefault.svg" alt="icon" />
    </button>
    <ul
      tabIndex={0}
      className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-4"
    >
      <li>
        <Link to="/profile">View Profile</Link>
      </li>
      <li>
        <button onClick={handleLogout}>Logout</button>
      </li>
    </ul>
  </div>
</div>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden print:overflow-visible w-full relative">
        {/* SIDE MENU – styled to look like your screenshot */}
        <div
          ref={drawerRef}
          className={`bg-black text-white w-80 flex-shrink-0 print:hidden fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-40 h-full ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Top bar with X close icon */}
            <div className="flex items-center justify-end px-6 py-4">
              <button
                onClick={closeSidebar}
                className="p-1"
                aria-label="Close sidebar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Menu items */}
            <nav className="flex-1 overflow-y-auto px-6 pb-8">
              <ul className="space-y-6">
                {menuItems.map((item) => (
                  <li key={`main-${item.id}`}>
                    {item.subItems?.length > 0 ? (
                      <details
                        ref={(el) => (menuRefs.current[item.id] = el)}
                        open={location.pathname.startsWith(item.path)}
                        className="group"
                      >
                        <summary
                          className={`flex items-center gap-4 cursor-pointer list-none ${hoverMenuItemClass} rounded-lg px-2 py-2`}
                          onClick={(e) => handleMenuClick(e, item.id)}
                        >
                          <MenuIcon />
                          <span className="text-base font-normal">
                            {item.title}
                          </span>
                        </summary>
                        <ul className="ml-14 mt-2 space-y-2 text-sm text-gray-300">
                          {item.subItems.map((subItem) => (
                            <li key={subItem.id}>
                              <Link
                                to={subItem.path}
                                className={`block px-2 py-1 rounded-md ${
                                  location.pathname === subItem.path
                                    ? activeMenuItemClass
                                    : hoverMenuItemClass
                                }`}
                                onClick={closeSidebar}
                              >
                                {subItem.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : (
                      <Link
                        to={item.path}
                        className={`flex items-center gap-4 px-2 py-2 rounded-lg text-base font-normal ${hoverMenuItemClass} ${
                          location.pathname === item.path
                            ? activeMenuItemClass
                            : ""
                        }`}
                        onClick={closeSidebar}
                      >
                        <MenuIcon />
                        <span>{item.title}</span>
                      </Link>
                    )}
                  </li>
                ))}

                {sidebarItems.length > 0 && (
                  <>
                    <li>
                      <div className="h-px bg-white/20 mt-2" />
                    </li>
                    {sidebarItems.map((item) => (
                      <li key={`sidebar-${item.id}`}>
                        {item.subItems?.length > 0 ? (
                          <details
                            ref={(el) => (menuRefs.current[item.id] = el)}
                            open={location.pathname.startsWith(item.path)}
                            className="group"
                          >
                            <summary
                              className={`flex items-center gap-4 cursor-pointer list-none ${hoverMenuItemClass} rounded-lg px-2 py-2`}
                              onClick={(e) => handleMenuClick(e, item.id)}
                            >
                              <MenuIcon />
                              <span className="text-base font-normal">
                                {item.title}
                              </span>
                            </summary>
                            <ul className="ml-14 mt-2 space-y-2 text-sm text-gray-300">
                              {item.subItems.map((subItem) => (
                                <li key={subItem.id}>
                                  <Link
                                    to={subItem.path}
                                    className={`block px-2 py-1 rounded-md ${
                                      location.pathname === subItem.path
                                        ? activeMenuItemClass
                                        : hoverMenuItemClass
                                    }`}
                                    onClick={closeSidebar}
                                  >
                                    {subItem.title}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </details>
                        ) : (
                          <Link
                            to={item.path}
                            className={`flex items-center gap-4 px-2 py-2 rounded-lg text-base font-normal ${hoverMenuItemClass} ${
                              location.pathname === item.path
                                ? activeMenuItemClass
                                : ""
                            }`}
                            onClick={closeSidebar}
                          >
                            <MenuIcon />
                            <span>{item.title}</span>
                          </Link>
                        )}
                      </li>
                    ))}
                  </>
                )}
              </ul>
            </nav>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 print:overflow-visible print:h-auto print:block print:p-0 print:bg-white w-full">
          {/* <NavigationButtons /> */}
          <div className="print:block print:w-full print:h-auto print:overflow-visible bg-white rounded-2xl shadow-2xl border border-gray-200 transform transition-all duration-300 hover:shadow-3d">
            {children}
          </div>
        </main>

        {/* Dark overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={closeSidebar}
          ></div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer items-center p-4 bg-neutral text-neutral-content print:hidden w-full">
        <div className="items-center grid-flow-col">
          <p>© 2025 EdLive - All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
