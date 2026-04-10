import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CRMProvider } from "@/context/CRMContext";
import AppShell from "@/components/layout/AppShell";
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
import PackagesCatalog from "@/pages/PackagesCatalog";
import MedicinesList from "@/pages/MedicinesList";
import RejoinsList from "@/pages/RejoinsList";
import CreateRejoin from "@/pages/CreateRejoin";
import LookupsAdmin from "@/pages/LookupsAdmin";
import TrashManagement from "@/pages/TrashManagement";
import MoreMenu from "@/pages/MoreMenu";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CRMProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leads" element={<LeadsList />} />
              <Route path="/follow-ups" element={<FollowUpsList />} />
              <Route path="/more" element={<MoreMenu />} />
              <Route path="/enrollments" element={<EnrollmentsList />} />
              <Route path="/packages" element={<PackagesCatalog />} />
              <Route path="/medicines" element={<MedicinesList />} />
              <Route path="/rejoins" element={<RejoinsList />} />
            </Route>
            <Route path="/leads/new" element={<LeadForm />} />
            <Route path="/leads/:id" element={<LeadDetail />} />
            <Route path="/leads/:id/edit" element={<LeadEdit />} />
            <Route path="/follow-ups/new/:leadId" element={<ScheduleFollowUp />} />
            <Route path="/enrollments/new" element={<CreateEnrollment />} />
            <Route path="/enrollments/:id" element={<EnrollmentDetail />} />
            <Route path="/bills/new" element={<CreateBill />} />
            <Route path="/rejoins/new" element={<CreateRejoin />} />
            <Route path="/settings/lookups" element={<LookupsAdmin />} />
            <Route path="/trash" element={<TrashManagement />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CRMProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
