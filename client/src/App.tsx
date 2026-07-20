import { useEffect, useRef, useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ConfigProvider } from "@/lib/config-context";
import { ComPortProvider } from "./Comportcontext"; // ✅ import
import ProtectedRoute from "@/components/protected-route";
import Sidebar from "@/components/sidebar";
import Login from "@/pages/login";
import CameraMonitor from "@/pages/camera-monitor";
import CameraSettings from "@/pages/camera-settings";
import WeighbridgeSettings from "@/pages/weighbridge-settings";
import RoleManagement from "@/pages/role-management";
import PurchaseForm from "@/pages/purchase-form";
import SalesForm from "@/pages/sales-form";
import Reports from "@/pages/reports";
import ImageUpload from "@/pages/image-upload";
import NotFound from "@/pages/not-found";
import SalesReturnForm from "@/pages/sales-return";
import SoldNote from "@/pages/sold-note";
import PurchaseReturn from "@/pages/purchase-return";

import FreightEntry from "./pages/freight-entry";
import FreightVoucher from "./pages/freight-voucher";
import SaleFreightVoucher from "./pages/sale_fright-vouchers"; // ✅ New import
import BankpaymentVoucher from "./pages/Bank-Payment-Vouchers"; // ✅ New import
import CashpaymentVoucher from "./pages/Cash-Payment-Vouchers"; // ✅ New import
import BankreceiptVoucher from "./pages/Bank-Receipt-Vouchers"; // ✅ New import
import CashreceiptVoucher from "./pages/Cash-Receipt-Vouchers"; // ✅ New import
import CashReportPage from "./pages/cash-report";
import BankReportPage from "./pages/bank-reports";

import GetData from "./pages/get-data";
import OfflinePage from "./pages/offline-page";
import ReportPage from "./pages/Reportpage";

function ProtectedApp() {
  // Track sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <ProtectedRoute>
      <Sidebar onToggleCollapse={setIsSidebarCollapsed} />
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-0' : 'lg:ml-64'}`}>
        <Switch>
          <Route path="/" component={CameraMonitor} />
          <Route path="/settings" component={CameraSettings} />
          <Route path="/weighbridge-settings" component={WeighbridgeSettings} />
          <Route path="/role-management" component={RoleManagement} />
          <Route path="/purchase-form" component={PurchaseForm} />
          <Route path="/voucher-entry" component={FreightEntry} />
          <Route path="/voucher-view" component={FreightVoucher} />
          <Route path="/sale_fright-vouchers" component={SaleFreightVoucher} /> {/* ✅ New route */}

          <Route path="/Bank-Payment-Vouchers" component={BankpaymentVoucher} /> {/* ✅ New route */}
          <Route path="/Cash-Payment-Vouchers" component={CashpaymentVoucher} /> {/* ✅ New route */}
          <Route path="/Bank-Receipt-Vouchers" component={BankreceiptVoucher} /> {/* ✅ New route */}
          <Route path="/Cash-Receipt-Vouchers" component={CashreceiptVoucher} /> {/* ✅ New route */}

          <Route path="/get-data" component={GetData} />
          <Route path="/sales-form" component={SalesForm} />
          <Route path="/offline-page" component={OfflinePage} />
          <Route path="/sales-return" component={SalesReturnForm} />
          <Route path="/purchase-return" component={PurchaseReturn} />
          <Route path="/sold-note" component={SoldNote} />
          <Route path="/reports" component={Reports} />
          <Route path="/cash-report" component={CashReportPage} />
          <Route path="/bank-reports" component={BankReportPage} />

          <Route path="/Reportpage" component={ReportPage} />
          <Route path="/image-upload" component={ImageUpload} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route component={ProtectedApp} />
    </Switch>
  );
}

function App() {
  // LOV open state tracking
  const lovOpenForInput = useRef<HTMLElement | null>(null);
  const [lovOpen, setLovOpen] = useState(false);

  // Call this when LOV opens for some input element
  const onLOVOpen = (inputElement: HTMLElement) => {
    lovOpenForInput.current = inputElement;
    setLovOpen(true);
  };

  // Call this when LOV closes
  const onLOVClose = () => {
    lovOpenForInput.current = null;
    setLovOpen(false);
  };

  useEffect(() => {
    const handleEnterKey = (e: KeyboardEvent) => {
      const target = e.target as
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement;

      // Ignore if textarea to allow multiline enter
      if (
        e.key === "Enter" &&
        target.tagName !== "TEXTAREA" &&
        ["INPUT", "SELECT"].includes(target.tagName)
      ) {
        if (lovOpen) {
          e.preventDefault();
          onLOVClose();
          return;
        } else {
          e.preventDefault();

          const focusableElements = Array.from(
            document.querySelectorAll<HTMLElement>(
              'input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled)'
            )
          );

          const index = focusableElements.indexOf(target);
          if (index >= 0 && index < focusableElements.length - 1) {
            focusableElements[index + 1].focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleEnterKey, true);
    return () => document.removeEventListener("keydown", handleEnterKey, true);
  }, [lovOpen]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          {/* ✅ Correct order: ComPortProvider wraps ConfigProvider */}
          <ComPortProvider>
            <ConfigProvider>
              <div className="min-h-screen bg-monitoring-dark">
                <Toaster />
                <Router />
              </div>
            </ConfigProvider>
          </ComPortProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;