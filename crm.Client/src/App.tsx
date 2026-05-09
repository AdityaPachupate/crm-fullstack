import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createIndexedDBPersister } from "@/lib/persistence";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CRMProvider } from "@/context/CRMContext";
import AppShell from "@/components/layout/AppShell";
import BottomNav from "@/components/layout/BottomNav";
import Dashboard from "@/pages/Dashboard";
import LeadsList from "@/pages/LeadsList";
import LeadForm from "@/pages/LeadForm";
import LeadDetail from "@/pages/LeadDetail";
import LeadEdit from "@/pages/LeadEdit";
import FollowUpsList from "@/pages/FollowUpsList";
import ScheduleFollowUp from "@/pages/ScheduleFollowUp";
import EnrollmentsList from "@/pages/EnrollmentsList";
import CreateEnrollment from "@/pages/CreateEnrollment";
import EnrollmentDetail from "@/pages/EnrollmentDetail";
import CreateBill from "@/pages/CreateBill";
import BillsList from "@/pages/BillsList";
import PackagesCatalog from "@/pages/PackagesCatalog";
import MedicinesList from "@/pages/MedicinesList";
import RejoinsList from "@/pages/RejoinsList";
import CreateRejoin from "@/pages/CreateRejoin";
import LookupsAdmin from "@/pages/LookupsAdmin";
import TrashManagement from "@/pages/TrashManagement";
import MoreMenu from "@/pages/MoreMenu";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

/**
 * We set a high gcTime (formerly cacheTime) to ensure that the persistent 
 * storage actually keeps the data for a long duration.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
      staleTime: 1000 * 60 * 5, // 5 minutes by default
    },
  },
});

const persister = createIndexedDBPersister();

const ConditionalBottomNav = () => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return null;
  return <BottomNav />;
};

const App = () => (
  <PersistQueryClientProvider 
    client={queryClient} 
    persistOptions={{ persister }}
    onSuccess={() => {
      console.log('✅ Cache persistence restored successfully');
    }}
  >
    <TooltipProvider>
      <CRMProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/leads" element={<LeadsList />} />
                <Route path="/follow-ups" element={<FollowUpsList />} />
                <Route path="/more" element={<MoreMenu />} />
                <Route path="/enrollments" element={<EnrollmentsList />} />
                <Route path="/packages" element={<PackagesCatalog />} />
                <Route path="/medicines" element={<MedicinesList />} />
                <Route path="/rejoins" element={<RejoinsList />} />
                <Route path="/bills" element={<BillsList />} />
              </Route>

              {/* Other routes also need protection */}
              <Route path="/leads/new" element={<ProtectedRoute><LeadForm /></ProtectedRoute>} />
              <Route path="/leads/:id" element={<ProtectedRoute><LeadDetail /></ProtectedRoute>} />
              <Route path="/leads/:id/edit" element={<ProtectedRoute><LeadEdit /></ProtectedRoute>} />
              <Route path="/follow-ups/new/:leadId" element={<ProtectedRoute><ScheduleFollowUp /></ProtectedRoute>} />
              <Route path="/enrollments/new" element={<ProtectedRoute><CreateEnrollment /></ProtectedRoute>} />
              <Route path="/enrollments/:id" element={<ProtectedRoute><EnrollmentDetail /></ProtectedRoute>} />
              <Route path="/bills/new" element={<ProtectedRoute><CreateBill /></ProtectedRoute>} />
              <Route path="/rejoins/new" element={<ProtectedRoute><CreateRejoin /></ProtectedRoute>} />
              <Route path="/settings/lookups" element={<ProtectedRoute><LookupsAdmin /></ProtectedRoute>} />
              <Route path="/trash" element={<ProtectedRoute><TrashManagement /></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ConditionalBottomNav />
          </AuthProvider>
        </BrowserRouter>
      </CRMProvider>
    </TooltipProvider>
  </PersistQueryClientProvider>
);

export default App;
