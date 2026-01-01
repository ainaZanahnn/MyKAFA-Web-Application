/** @format */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { AuthProvider } from "./components/auth/AuthProvider";
import AuthSlider from "./components/auth/AuthSlider";


import { AdminLayout } from "@/layout/admin-layout";
import Dashboard from "@/pages/admin/dashboard";
import Announcements from "@/pages/admin/announcements";
import { LearningModuleManagement } from "@/pages/admin/kafamodule";
import Upkk from "@/pages/admin/upkk";
import User from "@/pages/admin/user";
import { Activities } from "@/pages/admin/aktivities";
import ManageQuiz from "@/pages/admin/manageQuiz";

import { Layout as StudentLayout } from "@/layout/student-layout";
import StudentDashboard from "@/pages/student/dashboard";
import StudentAnnouncements from "@/pages/student/announcement";
import { LearningKafa } from "@/pages/student/Kafalearning";
import UpkkPY from "@/pages/student/upkkPastYear";
//import { ActivitySelector as InteractiveActivities } from "@/pages/student/interactiveactivities";

import { Layout as GuardianLayout } from "@/layout/guardian-layout";
import ProfileStudent from "@/pages/student/profile";
import GuardianDashboard from "@/pages/guardian/dashboard";
import ProfileAccount from "@/pages/guardian/profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // important for styles

function App() {
  


  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthSlider />} />
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="kafamodule" element={<LearningModuleManagement />} />
            <Route path="upkk" element={<Upkk />} />
            <Route path="aktivities" element={<Activities />} />
            <Route path="user" element={<User />} />
            <Route path="manageQuiz" element={<ManageQuiz />} />
          </Route>
          {/* Student routes */}
          <Route path="/student" element={<StudentLayout />}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="announcement" element={<StudentAnnouncements />} />
            <Route path="kafalearning" element={<LearningKafa />} />
            <Route path="upkkPastYear" element={<UpkkPY />} />
            <Route path="profile" element={<ProfileStudent />} />
          </Route>
          {/* Guardian routes */}
          <Route path="/guardian" element={<GuardianLayout />}>
            <Route path="dashboard" element={<GuardianDashboard />} />
            <Route path="profile" element={<ProfileAccount />} />
          </Route>
        </Routes>

        <ToastContainer
          position="top-center"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
