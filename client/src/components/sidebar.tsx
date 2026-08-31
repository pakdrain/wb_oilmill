import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Home,
  Settings,
  Video,
  Menu,
  X,
  Scale,
  FileText,
  LogOut,
  User,
  BarChart3,
  Upload,
  ShoppingCart,
  RotateCcw,
  Network,
  ChevronDown,
  ChevronRight,
  Users,
  Download,
  Truck,
  Receipt,
  CreditCard,
  Banknote,
} from "lucide-react";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

// Add prop interface
interface SidebarProps {
  onToggleCollapse?: (collapsed: boolean) => void;
}

const getNavigation = (isAdmin: boolean) => {
  const baseNavigation = [
    { name: "Home", href: "/", icon: Home },
    {
      name: "Purchase Form",
      icon: FileText,
      hasSubItems: true,
      subItems: [
        {
          name: "Purchase Online",
          href: "/purchase-form?type=online",
          icon: FileText,
        },
        {
          name: "Purchase Offline",
          href: "/purchase-form?type=offline",
          icon: FileText,
        },
      ],
    },
    {
      name: "Sale Form",
      icon: ShoppingCart,
      hasSubItems: true,
      subItems: [
        {
          name: "Sales Online",
          href: "/sales-form?type=online",
          icon: ShoppingCart,
        },
        {
          name: "Sales Offline",
          href: "/sales-form?type=offline",
          icon: ShoppingCart,
        },
      ],
    },
    // {
    //   name: "Freight Voucher",
    //   href: "/voucher-view",
    //   icon: FileText,
    // },
    // {
    //   name: "Transaction",
    //   icon: ShoppingCart,
    //   hasSubItems: true,
    //   subItems: [
    //     {
    //       name: "Feed Freight Voucher",
    //       href: "/cash-receipt-vouchers?type=FFCPV",
    //       icon: Receipt,
    //     },
    //     {
    //       name: "Cash Receipt Vouchers",
    //       href: "/cash-receipt-vouchers?type=MCRV",
    //       icon: Banknote,
    //     },
    //     {
    //       name: "Cash Payment Vouchers",
    //       href: "/cash-receipt-vouchers?type=MCPV",
    //       icon: Banknote,
    //     },
    //     {
    //       name: "Bank Payment Vouchers",
    //       href: "/cash-receipt-vouchers?type=MBPV",
    //       icon: CreditCard,
    //     },
    //     {
    //       name: "Bank Receipt Vouchers",
    //       href: "/cash-receipt-vouchers?type=MBRV",
    //       icon: CreditCard,
    //     },
    //   ],
    // },
    { name: "Get Data", href: "/get-data", icon: Download },
    // {
    //   name: "Sale Return",
    //   href: "/sales-return",
    //   icon: RotateCcw,
    // },
    //{ name: "Sold Note", href: "/sold-note", icon: Network },
    { name: "Offline Entries", href: "/offline-page", icon: WifiOff },
    { name: "Reports", href: "/reports", icon: BarChart3 },
   // { name: "CashReports", href: "/cash-report", icon: BarChart3 },
   // { name: "BankReports", href: "/bank-reports", icon: BarChart3 },
    { name: "General Report", href: "/reportpage", icon: BarChart3 },
    // { name: "Camera Settings", href: "/settings", icon: Settings },
    // {
    //   name: "Weighbridge Settings",
    //   href: "/weighbridge-settings",
    //   icon: Scale,
    // },
  ];

   // ✅ Only add admin-only items if user is admin
if (isAdmin) {
  baseNavigation.push(
    { name: "Camera Settings", href: "/settings", icon: Settings },
    { name: "Weighbridge Settings", href: "/weighbridge-settings", icon: Scale },
    { name: "Role", href: "/role-management", icon: Users }
  );
}

  return baseNavigation;
};

// Create a context to share sidebar state
export const SidebarContext = React.createContext({
  isCollapsed: false,
  setIsCollapsed: (collapsed: boolean) => {},
});

export default function Sidebar({ onToggleCollapse }: SidebarProps = {}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [setLocation] = useLocation();
  const { user, logout } = useAuth();
  const sidebarRef = useRef(null);

  // Load sidebar state from localStorage
  useEffect(() => {
    const storedExpandedItem = localStorage.getItem("expandedItem");
    if (storedExpandedItem) {
      setExpandedItem(storedExpandedItem);
    }

    const storedSidebarState = localStorage.getItem("sidebarCollapsed");
    if (storedSidebarState) {
      const collapsed = storedSidebarState === "true";
      setIsCollapsed(collapsed);
      
      // Notify parent component
      if (onToggleCollapse) {
        onToggleCollapse(collapsed);
      }
      
      // Update body class
      if (collapsed) {
        document.body.classList.add("sidebar-collapsed");
      } else {
        document.body.classList.remove("sidebar-collapsed");
      }
    }
  }, [onToggleCollapse]);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isCollapsed.toString());
  }, [isCollapsed]);

  useEffect(() => {
    if (expandedItem !== null) {
      localStorage.setItem("expandedItem", expandedItem);
    }
  }, [expandedItem]);

  const isActive = (href: string) => {
    try {
      const currentUrl = new URL(window.location.href);
      const targetUrl = new URL(href, window.location.origin);
      return (
        currentUrl.pathname === targetUrl.pathname &&
        currentUrl.search === targetUrl.search
      );
    } catch {
      return false;
    }
  };

  const isAdmin = user?.userName === "admin" || user?.userid === 1;
  const navigation = getNavigation(isAdmin);

  const toggleExpanded = (itemName: string) => {
    setExpandedItem((prev) => (prev === itemName ? null : itemName));
  };

  const handleNavigation = (href: string) => {
    if (href !== window.location.pathname + window.location.search) {
      window.location.href = href;
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      // Mobile behavior
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      // Desktop behavior - toggle collapse
      const newCollapsedState = !isCollapsed;
      setIsCollapsed(newCollapsedState);
      
      // Notify parent component
      if (onToggleCollapse) {
        onToggleCollapse(newCollapsedState);
      }
      
      // Update body class for CSS adjustments
      if (newCollapsedState) {
        document.body.classList.add("sidebar-collapsed");
      } else {
        document.body.classList.remove("sidebar-collapsed");
      }
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      } else {
        setIsCollapsed(false);
        document.body.classList.remove("sidebar-collapsed");
        
        // Notify parent component
        if (onToggleCollapse) {
          onToggleCollapse(false);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onToggleCollapse]);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-monitoring-slate border-monitoring-gray text-white hover:bg-monitoring-gray"
        >
          {isMobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-monitoring-slate border-r border-monitoring-gray transform transition-all duration-300 ease-in-out",
          // Mobile behavior
          isMobileMenuOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full lg:translate-x-0",
          // Desktop behavior
          !isCollapsed ? "lg:w-64" : "lg:w-0 lg:border-r-0"
        )}
      >
        <div
          className={cn(
            "flex flex-col h-full transition-opacity duration-300",
            isCollapsed ? "opacity-0 lg:pointer-events-none" : "opacity-100"
          )}
          style={{ width: "256px" }}
        >
          {/* Header with Close Button */}
          <div className="flex items-center justify-between py-2 px-3 border-b border-monitoring-gray">
            <h1 className="text-lg font-bold text-white truncate">
              Weighbridge System
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="text-white hover:bg-monitoring-gray hover:text-white p-1 h-8 w-8 flex-shrink-0"
              aria-label={isCollapsed ? "Open sidebar" : "Close sidebar"}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-0 overflow-y-auto">
            {navigation.map((item) => {
              if (item.hasSubItems) {
                const isExpanded = expandedItem === item.name;
                const hasActiveSubItem = item.subItems?.some((subItem) =>
                  isActive(subItem.href)
                );

                return (
                  <div key={item.name} className="space-y-1">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between text-left h-9 px-2 text-sm",
                        hasActiveSubItem
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "text-gray-300 hover:bg-monitoring-gray hover:text-white"
                      )}
                      onClick={() => toggleExpanded(item.name)}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>

                    {isExpanded && (
                      <div className="ml-2 space-y-1">
                        {item.subItems?.map((subItem) => {
                          const isSubActive = isActive(subItem.href);

                          return (
                            <Button
                              key={subItem.name}
                              variant="ghost"
                              className={cn(
                                "w-full justify-start text-left h-8 px-2 ml-2 text-sm",
                                isSubActive
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : "text-gray-400 hover:bg-monitoring-gray/70 hover:text-white"
                              )}
                              onClick={() => handleNavigation(subItem.href)}
                            >
                              <subItem.icon className="mr-2 h-4 w-4" />
                              {subItem.name}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              } else {
                const isItemActive = isActive(item.href ?? "");

                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left h-9 px-3 text-sm",
                      isItemActive
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-gray-300 hover:bg-monitoring-gray hover:text-white"
                    )}
                    onClick={() => handleNavigation(item.href ?? "")}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Button>
                );
              }
            })}
          </nav>

          {/* User Info and Logout */}
          <div className="p-2 border-t border-monitoring-gray mt-auto">
            <div className="flex items-center space-x-3 px-1 mb-1">
              <div className="flex items-center justify-center w-8 h-8 bg-monitoring-blue rounded-full">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.userName || "User"}
                </p>
                <p className="text-xs text-gray-400">Authenticated</p>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-left h-8 px-2 text-sm text-gray-300 hover:bg-red-600 hover:text-white"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar toggle button when collapsed on desktop */}
      {isCollapsed && (
        <div className="hidden lg:block fixed top-4 left-4 z-40">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsCollapsed(false);
              document.body.classList.remove("sidebar-collapsed");
              
              // Notify parent component
              if (onToggleCollapse) {
                onToggleCollapse(false);
              }
            }}
            className="bg-monitoring-slate border-monitoring-gray text-white hover:bg-monitoring-gray"
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}