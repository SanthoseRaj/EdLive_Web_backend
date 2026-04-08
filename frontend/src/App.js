import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChakraProvider } from '@chakra-ui/react';
import LoadingSpinner from "./components/common/LoadingSpinner";
import { ErrorProvider } from './components/common/ErrorContext';
import TodoPage from './Pages/teacher/TodoPage.js';

// Lazy-loaded components for different user types
const HomePage = lazy(() => import('./Pages/home/HomePage'));
const LoginPage = lazy(() => import('./Pages/auth/login/LoginPage'));
const SignUpPage = lazy(() => import('./Pages/auth/signup/SignUpPage'));
const MenuPage = lazy(() => import("./components/common/Menu.js"));
const Layout = lazy(() => import('./components/common/Layout.js'));

// Add NotFoundPage to lazy imports
const NotFoundPage = lazy(() => import('./Pages/common/NotFoundPage.js'));

// Admin components
const UserList = lazy(() => import('./Pages/admin/userList.js'));
const StaffList = lazy(() => import('./Pages/admin/staffList.js'));
const StaffManagement = lazy(() => import('./Pages/admin/staffManagement.js'));
//const StaffProfile = lazy(() => import('./Pages/admin/staffView.js'));
const StaffProfile = lazy(() => import('./Pages/admin/StaffProfileViewEdit.js'));
//const StudentProfile = lazy(() => import('./Pages/admin/studentview.js'));
const StudentProfile = lazy(() => import('./Pages/admin/StudentProfileViewEdit.js'));
const Master = lazy(() => import('./Pages/admin/Master.js'));
const Settings = lazy(() => import('./Pages/admin/settingView.js'));
const Achievement = lazy(() => import('./Pages/admin/AchievementPage.js'));
const Payment = lazy(() => import('./Pages/admin/PaymentPage.js'));
const Library = lazy(() => import('./Pages/admin/AdminLibrary.js'));
const Food = lazy(() => import('./Pages/admin/FoodManagementPage.js'));
const ChildList = lazy(() => import('./Pages/admin/StudentChildren.js'));
const Transport = lazy(() => import('./Pages/admin/TransportManagementPage.js'));
const Notification = lazy(() => import('./Pages/admin/NotificationPage.js'));
const AdminTodo = lazy(() => import('./Pages/admin/TodoPage.js'));
const AdminPTA = lazy(() => import('./Pages/admin/AdminPTAPage.js'));
const AdminCoCurricular = lazy(() => import('./Pages/admin/CoCurricularPage.js'));
const AdminEventsHolidays = lazy(() => import('./Pages/admin/AdminEventsHolidaysPage.js'));
const AdminMessage = lazy(() => import('./Pages/admin/AdminMessagePage.js'));
const AdminPerformance = lazy(() => import('./Pages/admin/Performance.js'));
const AdminTeacherSubject = lazy(() => import('./Pages/admin/SubjectsTeachers.js'));
const AdminEvents = lazy(() => import('./Pages/admin/EventsPage.js'));

//Admission

import AdmissionLayout from './Pages/admin/admission/AdmissionLayout.jsx';
import Overview from './Pages/admin/admission/Overview.jsx';
import StartAdmission from './Pages/admin/admission/StartAdmission.jsx';
import NewRequests from './Pages/admin/admission/NewRequests.jsx';
import Accepted from './Pages/admin/admission/Accepted.jsx';
import Rejected from './Pages/admin/admission/Rejected.jsx';
//import AdmissionForm from './Pages/admin/admission/AdmissionForm.jsx';
import ApplicationDetail from './Pages/admin/admission/ApplicationDetail.jsx';

// Teacher components (example - you'll need to create these)
const TeacherDashboard = lazy(() => import('./Pages/teacher/Dashboard.js'));
const TeacherStudentView = lazy(() => import('./Pages/teacher/studentview.js'));
const TeacherAchievements = lazy(() => import('./Pages/teacher/AchievementPage.js'));
const TeacherTodo = lazy(() => import('./Pages/teacher/TodoPage.js'));
const TeacherCoCurricular = lazy(() => import('./Pages/teacher/CoCurricularPage.js'));
const TeacherPTA = lazy(() => import('./Pages/teacher/TeacherPTAPage.js'));

// Student components (example - you'll need to create these)
const StudentDashboard = lazy(() => import('./Pages/student/Dashboard.js'));
const StudentAchievements = lazy(() => import('./Pages/student/Achievements.js'));
const StudentTodo = lazy(() => import('./Pages/student/TodoPage.js'));

// Librarian components
const LibrarianDashboard = lazy(() => import('./Pages/admin/AdminLibrary.js'));

// Food Admin Components
const FoodAdminDashboard = lazy(() => import('./Pages/admin/FoodManagementPage.js'));

// Transport Admin Component


const TransportAdminDashboard = lazy(() => import('./Pages/admin/TransportManagementPage.js'));

const App = () => {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className='h-screen flex justify-center items-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  // Protected route wrapper with role-based access
  const ProtectedRoute = ({ children, requiredRole = null }) => {
    if (!authUser) return <Navigate to='/login' />;
    
    // Check if specific role is required and user has it
    if (requiredRole && authUser.usertype !== requiredRole) {
      return <Navigate to='/' />;
    }
    
    return <Layout>{children}</Layout>;
  };

  // Public route wrapper
  const PublicRoute = ({ children }) => {
    if (authUser) return <Navigate to='/' />;
    return children;
  };

  // Role-based component selector
  const RoleBasedComponent = ({ routePath }) => {
    switch (routePath) {
      case '/':
        // Home page based on user type
        switch (authUser?.usertype) {
          case 'Staff Admin':
            return <HomePage />;
          case 'Teacher':
            return <TeacherDashboard />;
          case 'Student':
            return <StudentDashboard />;
          case 'Librarian':
            return <LibrarianDashboard />;
          case 'Food Admin':
            return <FoodAdminDashboard />;
          case 'Driver Admin':
            return <TransportAdminDashboard />;
          default:
            return <NotFoundPage  />;
        }
      
      case '/studentview/:_studentid':
        // Student view based on user type
        switch (authUser?.usertype) {
          case 'Staff Admin':
            return <StudentProfile />;
          case 'Teacher':
            return <TeacherStudentView />;
          case 'Student':
            // Students might view their own profile differently
            return <StudentDashboard />;
          default:
            return <NotFoundPage  />;
        }
      case '/student-children/:userId':
        switch (authUser?.usertype) {
          case 'Staff Admin':
            <ChildList />
          default:
            <NotFoundPage />
        }
      case '/achievement':
        // Achievement page based on user type
        switch (authUser?.usertype) {
          case 'Staff Admin':
            return <Achievement />;
          case 'Teacher':
            // Teacher view of achievements (you'll need to create this)
            return <TeacherAchievements />;
          case 'Student':
            return <StudentAchievements />;
          default:
            return <NotFoundPage  />;
        }
       case '/cocurricular':
        // Achievement page based on user type
        switch (authUser?.usertype) {
          case 'Staff Admin':
            return <AdminCoCurricular />;
          case 'Teacher':
            // Teacher view of achievements (you'll need to create this)
            return <TeacherCoCurricular />;
          case 'Student':
            return <StudentAchievements />;
          default:
            return <NotFoundPage  />;
        }

        case '/enventholidays':
        // Achievement page based on user type
        switch (authUser?.usertype) {
          case 'Staff Admin':
            return <AdminEventsHolidays />;
          default:
            return <NotFoundPage  />;
        }

        case '/message':
        // Achievement page based on user type
        switch (authUser?.usertype) {
          case 'Staff Admin':
            return <AdminMessage />;
          default:
            return <NotFoundPage  />;
        }

         case '/performance':
        // Achievement page based on user type
        switch (authUser?.usertype) {
          case 'Staff Admin':
            return <AdminPerformance />;
          default:
            return <NotFoundPage  />;
        }

        case '/teachersubject':
        // Achievement page based on user type
        switch (authUser?.usertype) {
          case 'Staff Admin':
            return <AdminTeacherSubject />;
          default:
            return <NotFoundPage  />;
        }

        case '/events':
        // Achievement page based on user type
        switch (authUser?.usertype) {
          case 'Staff Admin':
            return <AdminEvents />;
          default:
            return <NotFoundPage  />;
        }

        case '/pta':
        // Achievement page based on user type
        switch (authUser?.usertype) {
          case 'Staff Admin':
            return <AdminPTA />;
          case 'Teacher':
            // Teacher view of achievements (you'll need to create this)
            return <TeacherPTA />;
          case 'Student':
            return <StudentAchievements />;
          default:
            return <NotFoundPage  />;
        }
        case '/todos':
        // Todo page based on user type
        switch (authUser?.usertype) {
          case 'Staff Admin':
            return <AdminTodo />;
          case 'Teacher':
            // Teacher view of achievements (you'll need to create this)
            return <TeacherTodo />;
          case 'Student':
            return <StudentTodo />;
          default:
            return <NotFoundPage  />;
        }
        case '/library':
        // Todo page based on user type
        switch (authUser?.usertype) {
          case 'Staff Admin':
            return <Library />;
          case 'Teacher':
            // Teacher view of achievements (you'll need to create this)
            return <Library />;
          case 'Student':
            return <Library />;
          default:
            return <NotFoundPage  />;
        }
        case '/food':
        // Todo page based on user type
        switch (authUser?.usertype) {
          case 'Staff Admin':
            return <Food />;
          case 'Teacher':
            // Teacher view of achievements (you'll need to create this)
            return <Food />;
          case 'Student':
            return <Food />;
          default:
            return <NotFoundPage  />;
        }

        case '/transport':
        // Todo page based on user type
        switch (authUser?.usertype) {
          case 'Staff Admin':
            return <Transport />;
          case 'Teacher':
            // Teacher view of achievements (you'll need to create this)
            return <Transport />;
          case 'Student':
            return <Transport />;
          default:
            return <NotFoundPage  />;
        }

        case '/notifications':
        // Home page based on user type
        switch (authUser?.usertype) {
          case 'Staff Admin':
            return <Notification />;
          case 'Teacher':
            return <Notification />;
          case 'Student':
            return <Notification />;
          case 'Librarian':
            return <Notification />;
          case 'Food Admin':
            return <Notification />;
          case 'Driver Admin':
            return <Notification />;
          default:
            return <NotFoundPage  />;
        }
      // Add more route-specific logic as needed
      
      default:
        // Default component for routes without specific role handling
        return <div>Page not found</div>;
    }
  };

  return (
    <ChakraProvider>
      <ErrorProvider>
        <div className='mx-auto'>
          <Suspense fallback={
            <div className='h-screen flex justify-center items-center'>
              <LoadingSpinner size='lg' />
            </div>
          }>
            <Routes>
              {/* Protected Routes with role-based components */}
              <Route 
                path='/' 
                element={
                  <ProtectedRoute>
                    <RoleBasedComponent routePath='/' />
                  </ProtectedRoute>
                } 
              />
              
              <Route path='/UserList' element={
                <ProtectedRoute requiredRole='Staff Admin'>
                  <UserList />
                </ProtectedRoute>
              } />

              {/* ===================== ADMISSION MODULE ===================== */}
<Route
  path="/admission"
  element={
    <ProtectedRoute requiredRole="Staff Admin">
      <AdmissionLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<Overview />} />
  <Route path="overview" element={<Overview />} />
  <Route path="start" element={<StartAdmission />} />
  <Route path="new" element={<NewRequests />} />
  <Route path="accepted" element={<Accepted />} />
  <Route path="rejected" element={<Rejected />} />
  <Route path="application/:id" element={<ApplicationDetail />} />
</Route>
{/* ============================================================ */}


              <Route path='/StaffList' element={
                <ProtectedRoute requiredRole='Staff Admin'>
                  <StaffList />
                </ProtectedRoute>
              } />
              
              <Route path='/Master' element={
                <ProtectedRoute requiredRole='Staff Admin'>
                  <Master />
                </ProtectedRoute>
              } />
              
              <Route path='/classmaster' element={
                <ProtectedRoute requiredRole='Staff Admin'>
                  <Master />
                </ProtectedRoute>
              } />
              <Route path='/master' element={
                <ProtectedRoute requiredRole='Staff Admin'>
                  <Master />
                </ProtectedRoute>
              } />
              <Route path='/subjectmaster' element={
                <ProtectedRoute requiredRole='Staff Admin'>
                  <Master />
                </ProtectedRoute>
              } />
              
              <Route path='/periodmaster' element={
                <ProtectedRoute requiredRole='Staff Admin'>
                  <Master />
                </ProtectedRoute>
              } />
              
              <Route path='/staff' element={
                <ProtectedRoute requiredRole='Staff Admin'>
                  <StaffManagement />
                </ProtectedRoute>
              } />
              
              <Route path='/staffview/:_staffid' element={
                <ProtectedRoute requiredRole='Staff Admin'>
                  <StaffProfile />
                </ProtectedRoute>
              } />

              <Route path='/student-children/:userId' element={
                <ProtectedRoute requiredRole='Staff Admin'>
                  <ChildList />
                </ProtectedRoute>
              } />
              
              <Route path='/studentview/:_studentid' element={
                <ProtectedRoute>
                  <RoleBasedComponent routePath='/studentview/:_studentid' />
                </ProtectedRoute>
              } />
              
              <Route path='/settings' element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />

              <Route path='/achievement' element={
                <ProtectedRoute>
                  <RoleBasedComponent routePath='/achievement' />
                </ProtectedRoute>
              } />
              <Route path='/library' element={
                <ProtectedRoute>
                  <RoleBasedComponent routePath='/library' />
                </ProtectedRoute>
              } />
               <Route path='/food' element={
                <ProtectedRoute>
                  <RoleBasedComponent routePath='/food' />
                </ProtectedRoute>
              } />
              <Route path='/transport' element={
                <ProtectedRoute>
                  <RoleBasedComponent routePath='/transport' />
                </ProtectedRoute>
              } />
              <Route path='/todos' element={
                <ProtectedRoute>
                  <RoleBasedComponent routePath='/todos' />
                </ProtectedRoute>
              } />
              <Route path='/cocurricular' element={
                <ProtectedRoute>
                  <RoleBasedComponent routePath='/cocurricular' />
                </ProtectedRoute>
              } />
              <Route path='/pta' element={
                <ProtectedRoute>
                  <RoleBasedComponent routePath='/pta' />
                </ProtectedRoute>
              } />

              <Route path='/enventholidays' element={
                <ProtectedRoute>
                  <RoleBasedComponent routePath='/enventholidays' />
                </ProtectedRoute>
              } />

              <Route path='/message' element={
                <ProtectedRoute>
                  <RoleBasedComponent routePath='/message' />
                </ProtectedRoute>
              } />

              <Route path='/performance' element={
                <ProtectedRoute>
                  <RoleBasedComponent routePath='/performance' />
                </ProtectedRoute>
              } />
              

              <Route path='/teachersubject' element={
                <ProtectedRoute>
                  <RoleBasedComponent routePath='/teachersubject' />
                </ProtectedRoute>
              } />

              <Route path='/events' element={
                <ProtectedRoute>
                  <RoleBasedComponent routePath='/events' />
                </ProtectedRoute>
              } />

              <Route path='/notifications' element={
                <ProtectedRoute>
                  <RoleBasedComponent routePath='/notifications' />
                </ProtectedRoute>
              } />
              
              <Route path='/payment' element={
                <ProtectedRoute requiredRole='Staff Admin'>
                  <Payment />
                </ProtectedRoute>
              } />

              <Route path="/menu" element={
                <ProtectedRoute>
                  <MenuPage />
                </ProtectedRoute>
              } />

              {/* Public Routes */}
              <Route path='/login' element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path='/signup' element={<PublicRoute><SignUpPage /></PublicRoute>} />

              {/* Catch-all route - Show NotFoundPage */}
              <Route path='*' element={
                authUser ? (
                  <ProtectedRoute>
                    <NotFoundPage />
                  </ProtectedRoute>
                ) : (
                  <Navigate to='/login' />
                )
              } />
            </Routes>
          </Suspense>
        </div>
      </ErrorProvider>
    </ChakraProvider>
  );
};

export default App;