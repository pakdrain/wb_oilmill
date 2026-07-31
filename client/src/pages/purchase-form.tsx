import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeightIndicator from "@/components/weight-indicator";
import WeightDisplayTable from "@/components/weight-display-table";
import VideoStreamFullscreen from "@/components/video-stream-fullscreen";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useComPort } from "@/Comportcontext";



// Optimized debounce hook for better search performance
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Custom hook for optimized search with immediate UI feedback
const useOptimizedSearch = (initialValue: string = "") => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const debouncedSearchValue = useDebounce(searchValue, 200); // Reduced delay for faster response

  return {
    searchValue,
    debouncedSearchValue,
    setSearchValue,
  };
};

const PurchaseForm = React.memo(() => {
  const queryClient = useQueryClient(); // Initialize queryClient
  const [location, setLocation] = useLocation();
  const [type, setType] = useState("");
  const { user } = useAuth();
  const [searchSlipNo, setSearchSlipNo] = useState("");
  const [searchVehicleNo, setSearchVehicleNo] = useState("");

  // Debounce search queries for better performance
  const debouncedSearchSlipNo = useDebounce(searchSlipNo, 300);
  const debouncedSearchVehicleNo = useDebounce(searchVehicleNo, 300);
  const [activeTab, setActiveTab] = useState("purchase");
  const [selectedForm, setSelectedForm] = useState<
    "purchase" | "sales" | "offline"
  >("purchase"); // Controls which form section is shown
  const [isReturnMode, setIsReturnMode] = useState(false);
  const vendorSearch = useOptimizedSearch();
  const bardanaSearch = useOptimizedSearch();
  const itemSearch = useOptimizedSearch();
  const [bardanaSelectOpen, setBardanaSelectOpen] = useState(false);
  const { comPort } = useComPort();
const [activeLOV, setActiveLOV] = useState<"item" | "bardana" | null>(null);
const bardanaSelectRef = useRef<HTMLButtonElement | null>(null);
const [cameFromPrevious, setCameFromPrevious] = useState(false);
const [entries, setEntries] = useState<any[]>([]);
const [isFirstWeightSaved, setIsFirstWeightSaved] = useState(false);
const [disableSaveButton, setDisableSaveButton] = useState(false);

const noOfBagsRef = useRef<HTMLInputElement>(null);
const vendorSelectRef = useRef<any>(null);
const vehicleNoRef = useRef<HTMLInputElement>(null);
const poNoRef = useRef<HTMLInputElement | null>(null);
const weightRef = useRef<HTMLButtonElement | null>(null);
const poQtyRef = useRef<HTMLInputElement | null>(null);

const bagsRef = useRef<HTMLInputElement | null>(null);
const supplierWeightRef = useRef<HTMLInputElement>(null);





  // Deduction/Bag table state
  const [bagTableData, setBagTableData] = useState<any[]>([]);
  const [percentageMode, setPercentageMode] = useState<{
    [key: string]: boolean;
  }>({});

  // Core state variables - MUST be declared early before any functions use them
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingWbId, setEditingWbId] = useState<number | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
const selectRef = useRef<HTMLButtonElement | null>(null);

const [openDropdown, setOpenDropdown] = useState(false);
const [highlightIndex, setHighlightIndex] = useState(0);

  const [onlineMode, setOnlineMode] = useState(() => {
    // Initialize based on URL parameter immediately
    const urlParams = new URLSearchParams(window.location.search);
    const typeMode = urlParams.get("type");
    console.log("Initial state calculation - typeMode:", typeMode);
    console.log("Full URL:", window.location.href);

    if (typeMode === "offline") {
      console.log("Setting initial state to OFFLINE");
      return false;
    } else if (typeMode === "online") {
      console.log("Setting initial state to ONLINE");
      return true;
    }
    // Default to online if no parameter specified
    console.log("No type parameter, defaulting to ONLINE");
    return true;
  });
  const [plateReading, setPlateReading] = useState(false);
  const [igpItems, setIgpItems] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [entryTypes, setEntryTypes] = useState<any[]>([]);
  const [invItems, setInvItems] = useState<any[]>([]);
  const [bardanaTypes, setBardanaTypes] = useState<any[]>([]);
  const [percentageData, setPercentageData] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const vendorSearchInputRef = useRef<HTMLInputElement>(null);

  //auto focus on vendor LOV search bar
  const [vendorSelectOpen, setVendorSelectOpen] = useState(false);

  const [wasOfflineInitially, setWasOfflineInitially] = useState(false);

  






const handleReject = async (wbId: number) => {
  if (!wbId) return;

  try {
    const response = await fetch(`/api/purchases/reject/${wbId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(`Failed to reject: ${errorData.message}`);
      return;
    }

    alert("Entry rejected successfully!");

    // ⚡ Remove rejected record using wb_id
    const queryKey = ["/api/purchase/first-weight-records"];

    queryClient.setQueryData(queryKey, (oldData: any[] = []) =>
      oldData.filter(record => record.wb_id !== wbId)
    );

    // Reset Form
    setFormData(prev => ({
      ...prev,
      wbId: "",
      slipNo: "",
      slipInTime: "",
      slipOutTime: "",
      slipDate: "",
      status: "",
      entryType: "",
      firstWeight: "",
      secondWeight: "",
      netWeight: "",
      bardanaWeight: "",
      grossWeight: "",
      freight: "",
      remarks: "",
      driverName: "",
      companyId: "",
      branchId: "",
      onlineEntry: "",
      offlineEntry: "",
      createdBy: "",
      creationDate: "",
      lastUpdatedBy: "",
      lastUpdatedDate: "",
      manualDcNo: "",
      isPercentageMode: false,
    }));

    window.location.reload();

  } catch (error) {
    console.error("Error rejecting entry:", error);
    alert("Error rejecting entry. Check console.");
  }
};



  useEffect(() => {
    if (vendorSelectOpen) {
      setTimeout(() => {
        vendorSearchInputRef.current?.focus();
      }, 0);
    }
  }, [vendorSelectOpen]);

  //auto focus on bardana LOV search bar
  useEffect(() => {
    if (bardanaSelectOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0); // ensure dropdown render ho chuka ho
    }
  }, [bardanaSelectOpen]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.split("?")[1]);
    const currentType = searchParams.get("type");
    const returnParam = searchParams.get("return");
    console.log("Type param changed:", currentType);
    console.log("Return param:", returnParam);
    setType(currentType ?? "");
    setIsReturnMode(returnParam === "true");
  }, [location]); // 👈 Every time URL changes

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const formType = params.get("form");

    if (formType === "sales") {
      setSelectedForm("sales");
    } else if (formType === "purchase") {
      setSelectedForm("purchase");
    } else if (formType === "offline") {
      setSelectedForm("offline");
    }
  }, [location]);

  // Sales data state - mapped to database columns
  const [salesData, setSalesData] = useState<any[]>(
    Array.from({ length: 8 }, (_, index) => ({
      doId: "", // Will be auto-generated as maximum number
      dcNo: "",
      doNo: "",
      customerName: "", // Maps to customer_name
      vehicleNo: "", // Maps to vehicle_no
      doDate: "", // Maps to do_date (will be null for now)
      itemDescription: "", // Maps to item_description
      dcQty: "",
      doQty: "",
      branch: "",
    }))
  );
  const [nextBagId, setNextBagId] = useState(1);

  // Vendor data state for offline mode
  const [vendorData, setVendorData] = useState<any[]>([]);
  const [vendorsData, setVendorsData] = useState<any[]>([]);

  const handleSalesDataChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newData = [...salesData];
    newData[index] = { ...newData[index], [field]: value };
    setSalesData(newData);
  };

  const handleSalesRowDelete = (index: number) => {
    setSalesData((prevData) => {
      const newData = [...prevData];
      // Clear the row data
      newData[index] = {
        doId: "",
        dcNo: "",
        doNo: "",
        customerName: "",
        vehicleNo: "",
        doDate: "",
        itemDescription: "",
        dcQty: "",
        doQty: "",
        branch: "",
        dcId: "",
        customerId: "",
        itemId: "",
        itemCode: "",
      };
      return newData;
    });
  };

  // ===== ULTRA-HIGH PERFORMANCE DATA FETCHING =====
  // Fetch first weight records with maximum caching
  const { data: firstWeightRecords = [] } = useQuery({
    queryKey: ["/api/purchase/first-weight-records"],
    staleTime: 60 * 60 * 1000, // 1 hour cache for better performance
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: selectedForm !== "offline",
  });

  // Fetch offline records with aggressive caching and conditional loading
  const { data: offlineRecords = [] } = useQuery({
    queryKey: ["/api/purchases/offline"],
    staleTime: 60 * 60 * 1000, // 1 hour cache
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: selectedForm === "offline", // Only fetch when offline tab is active
  });

  // Memoized filtered records with debounced search for better performance
  const filteredRecords = useMemo(() => {
    let records = [];

    if (selectedForm === "offline") {
      records = Array.isArray(offlineRecords) ? offlineRecords : [];
    } else {
      records = Array.isArray(firstWeightRecords) ? firstWeightRecords : [];
    }

    // Use debounced search values
    return records.filter((record: any) => {
      const matchesSlipNo =
        !debouncedSearchSlipNo ||
        (record.slip_no || "")
          .toString()
          .toLowerCase()
          .includes(debouncedSearchSlipNo.toLowerCase());
      const matchesVehicleNo =
        !debouncedSearchVehicleNo ||
        (record.vehicle_no || "")
          .toString()
          .toLowerCase()
          .includes(debouncedSearchVehicleNo.toLowerCase());
      return matchesSlipNo && matchesVehicleNo;
    });
  }, [
    selectedForm,
    offlineRecords,
    firstWeightRecords,
    debouncedSearchSlipNo,
    debouncedSearchVehicleNo,
  ]);

  // Optimized filtered vendors with better performance and case-insensitive search
  const filteredVendors = useMemo(() => {
    if (!vendorsData || vendorsData.length === 0) return [];

    // Pre-process unique vendors only once when vendorsData changes
    const uniqueVendorsMap = new Map();
    vendorsData.forEach((vendor) => {
      const vendorKey = vendor.vendor_name?.toLowerCase() || "";
      if (vendorKey && !uniqueVendorsMap.has(vendorKey)) {
        uniqueVendorsMap.set(vendorKey, vendor);
      }
    });
    const uniqueVendors = Array.from(uniqueVendorsMap.values());

    const query = vendorSearch.debouncedSearchValue.trim().toLowerCase();

    if (!query) {
      // Show only first 5 unique vendors when no search query
      return uniqueVendors.slice(0, 5);
    }

    // Fast case-insensitive search with early termination
    const matches = [];
    for (let i = 0; i < uniqueVendors.length && matches.length < 50; i++) {
      const vendor = uniqueVendors[i];
      const vendorNameLower = (vendor.vendor_name || "").toLowerCase();
      if (vendorNameLower.includes(query)) {
        matches.push(vendor);
      }
    }

    return matches;
  }, [vendorsData, vendorSearch.debouncedSearchValue]);

  // Optimized filtered bardana types with better case-insensitive performance
  const filteredBardanaTypes = useMemo(() => {
    if (!bardanaTypes || bardanaTypes.length === 0) return [];

    const query = bardanaSearch.debouncedSearchValue.trim().toLowerCase();

    if (!query) {
      // Show all bardana types when no search query
      return bardanaTypes;
    }

    // Fast case-insensitive search with early termination
    const matches = [];
    for (let i = 0; i < bardanaTypes.length && matches.length < 50; i++) {
      const bardanaType = bardanaTypes[i];
      const typeNameLower = (bardanaType.type || "").toLowerCase();
      if (typeNameLower.includes(query)) {
        matches.push(bardanaType);
      }
    }

    return matches;
  }, [bardanaTypes, bardanaSearch.debouncedSearchValue]);

  // Optimized filtered inventory items with better case-insensitive performance
  const filteredInvItems = useMemo(() => {
    if (!invItems || invItems.length === 0) return [];

    const query = itemSearch.debouncedSearchValue.trim().toLowerCase();

 if (!query) {
  // Show only first 5 items when no search query
  return invItems.slice(0, 5);
}

    // Fast case-insensitive search with early termination
    const matches = [];
    for (let i = 0; i < invItems.length && matches.length < 50; i++) {
      const item = invItems[i];
      const itemCodeLower = (item.item_code || "").toLowerCase();
      const itemDescLower = (item.item_desc || "").toLowerCase();

      if (itemCodeLower.includes(query) || itemDescLower.includes(query)) {
        matches.push(item);
      }
    }

    return matches;
  }, [invItems, itemSearch.debouncedSearchValue]);




  
  const formatIgpDateDisplay = (isoString: string) => {
    if (!isoString) return "";

    const date = new Date(isoString);

    const day = date.getDate();
    const month = date.getMonth() + 1; // months are 0-based
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const formatDatetimeLocal = useCallback((raw: any) => {
    if (!raw && raw !== 0) return "-";

    // normalize to string
    let s = String(raw).trim();

    // If DB gives "YYYY-MM-DD HH:MM:SS" -> turn into ISO "YYYY-MM-DDTHH:MM:SS"
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(s)) {
      s = s.replace(/\s+/, "T");
    }

    // If DB gives "YYYY-MM-DD" only, keep as is (new Date will parse)
    // If gives "DD-MMM-YY" like "18-Sep-25", try custom parse:
    const shortDateMatch = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/);
    if (shortDateMatch) {
      const d = parseInt(shortDateMatch[1], 10);
      const mStr = shortDateMatch[2].toUpperCase();
      const y = 2000 + parseInt(shortDateMatch[3], 10);
      const months: Record<string, number> = {
        JAN: 0,
        FEB: 1,
        MAR: 2,
        APR: 3,
        MAY: 4,
        JUN: 5,
        JUL: 6,
        AUG: 7,
        SEP: 8,
        OCT: 9,
        NOV: 10,
        DEC: 11,
      };
      const mm = months[mStr] ?? 0;
      s = new Date(y, mm, d).toISOString();
    }

    // Try to create Date
    let date = new Date(s);

    // If still invalid, try replace space->T once more (defensive)
    if (isNaN(date.getTime()) && s.includes(" ")) {
      const tryIso = s.replace(" ", "T");
      date = new Date(tryIso);
    }

    if (isNaN(date.getTime())) return "-";

    // Use en-US to guarantee AM/PM display; set timeZone Karachi
    return date
      .toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true, // AM / PM
        timeZone: "Asia/Karachi",
      })
      .replace(",", ""); // optional: remove comma between date and time
  }, []);

  // const formatISODate = (dateString: string | null): string | null => {
  //   if (!dateString) return null;
  //   const date = new Date(dateString);
  //   return date.toISOString().split("T")[0]; // Only date part
  // };

  // Load existing deduction data when editing
  const loadDeductionData = useCallback(async (wbId: number) => {
    try {
      const response = await fetch(`/api/deduction/${wbId}`);
      if (response.ok) {
        const deductionData = await response.json();
        const formattedData = deductionData.map((item: any) => ({
          bagId: item.bag_id,
          bags: item.bags,
          pb: item.pb,
          percentage: item.percentage,
          weight: item.weight,
          total: item.bags * item.pb,
        }));
        setBagTableData(formattedData);

        // Populate weight and bags fields from first deduction entry
        if (formattedData.length > 0) {
          const firstEntry = formattedData[0];
          setFormData((prev) => ({
            ...prev,
            weight: firstEntry.weight ? String(firstEntry.weight) : "",
            bags: firstEntry.bags ? String(firstEntry.bags) : "",
          }));
        }

        console.log("Loaded existing deduction data:", formattedData);
      }
    } catch (error) {
      console.error("Error loading deduction data:", error);
    }
  }, []);

  // Memoized function to load data by wb_id for editing
const loadDataByWbId = useCallback(
  async (wbId: number) => {
    try {
      console.log("loadDataByWbId called with wbId:", wbId);
      const response = await fetch(`/api/purchase/by-wbid/${wbId}`);
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
      
      if (data && data.master) {
        const master = data.master;
        const details =
          data.details && data.details.length > 0 ? data.details[0] : {};

        console.log("🔍 pur_reg_type from API:", master.pur_reg_type);
        console.log("🔍 entry_type from API:", master.entry_type);

        // Enable edit mode
        setIsEditMode(true);
        setEditingWbId(master.wb_id);

        // ⭐ STRONG CONVERSION - Handle all possible cases
        const getConBoolean = (value: any): boolean => {
          if (value === null || value === undefined || value === '') {
            console.log("❌ con is null/undefined/empty");
            return false;
          }
          
          const strValue = String(value).toUpperCase().trim();
          console.log("🔄 con after conversion:", strValue);
          
          if (strValue === 'Y' || strValue === 'YES' || strValue === 'TRUE' || strValue === '1') {
            console.log("✅ con is TRUE");
            return true;
          }
          
          if (strValue === 'N' || strValue === 'NO' || strValue === 'FALSE' || strValue === '0') {
            console.log("❌ con is FALSE");
            return false;
          }
          
          console.log("⚠️ con default to false");
          return false;
        };

        const conBoolean = getConBoolean(details.con);
        console.log("🎯 FINAL conBoolean:", conBoolean);

        // ✅ DIRECT ASSIGNMENT - No normalization needed
        const purchaseValue = master.pur_reg_type || 'R';
        console.log(`📌 Setting purchase to: "${purchaseValue}"`);

        setFormData((prev) => ({
          ...prev,
   
          slipNo: master.slip_no || "",
          vehicleNo: details.vehicle_no || "",
          firstWeight: master.first_weight ? String(master.first_weight) : "",
          secondWeight: master.second_weight
            ? String(master.second_weight)
            : "",
          netWeight: master.net_weight ?? "",
          bardanaWeight: master.bardana_weight
            ? String(master.bardana_weight)
            : "",
          grossWeight: master.gross_weight ?? "",
          freight: master.freight ? String(master.freight) : "",
          remarks: master.remarks || "",
          driverName: master.driver_name || "",
          
          created_by_name: master.created_by_name || "",
          second_weight_by_name: master.second_weight_by_name || master.created_by_name || "",
          second_weight_by: master.second_weight_by || "",
          
          // ✅ DIRECT ASSIGNMENT - Values match dropdown exactly
          purchase: purchaseValue,
          
          excBags: master.bardana_bag === 'Y' || master.bardana_bag === 'y',
          
          igpCheckbox: conBoolean,
          
          status: master.status || "",
          vendor: details.vendor_name || "",
          vendorId: details.vendor_id ? String(details.vendor_id) : "",
          igpNo: details.igp_no || "", 
          poNo: details.po_no || "",
          poId: details.po_id !== null && details.po_id !== undefined
            ? BigInt(details.po_id)
            : null,
          itemId: details.item_id 
            ? String(details.item_id) 
            : details.item_code || "",
          itemCode: details.item_code || "",
          itemDesc: details.item_desc || "",
          poQty: details.po_qty ? String(details.po_qty) : "",
          igpQty: details.igp_qty ? String(details.igp_qty) : "",
          balanceQty: details.balance_qty ? String(details.balance_qty) : "",
          bardanaType: details.bardana_type || "",
          wtPerBag: details.weight_per_bags
            ? String(details.weight_per_bags)
            : "",
          noOfBags: details.no_of_bags ? String(details.no_of_bags) : "",
          igpDate: details.igp_date || "",
          slipInTime: master.slip_in_time
            ? formatDatetimeLocal(master.slip_in_time)
            : "",
          slipOutTime: master.slip_out_time
            ? formatDatetimeLocal(master.slip_out_time)
            : "",
          entryType: master.entry_type || "PURCHASE",
          branch: master.branch_id ? String(master.branch_id) : "",
          branchId: master.branch_id ? String(master.branch_id) : "",
          igpId: data.master.igp_id || data.details?.[0]?.igp_id || null,
          fromOffline: true,
          supplierWeight: details.supplier_weight
            ? String(details.supplier_weight)
            : "",
          qualityDeduction: details.quality_deduction
            ? String(details.quality_deduction)
            : "",
          weight: bagTableData[0]?.weight
            ? String(bagTableData[0].weight)
            : "",
          bags: bagTableData[0]?.bags ? String(bagTableData[0].bags) : "",
          isFirstWeightSaved: !!master.first_weight,
          isSecondWeightSaved: !!master.second_weight,
        }));

        // ✅ Debug: Check after setting
        setTimeout(() => {
          console.log("📝 After setting formData:");
          console.log("  purchase:", formData.purchase);
          console.log("  igpCheckbox:", formData.igpCheckbox);
          console.log("  pur_reg_type_raw:", master.pur_reg_type);
        }, 100);

        setWasOfflineInitially(master.offline_entry === "Yes");

        if (master.wb_id) {
          loadDeductionData(master.wb_id);
        }

        if (master.offline_entry === "Yes") {
          setOnlineMode(false);
        } else if (master.online_entry === "Yes") {
          setOnlineMode(true);
        }

        // ... rest of code
      }
    } catch (error) {
      console.error("Error loading data by wb_id:", error);
      alert("Failed to load record data");
    }
  },
  [formatDatetimeLocal, loadDeductionData, branches]
);



  // Function to search and load data by slip number
  const searchAndLoadBySlipNo = async () => {
    if (!formData.slipNo || formData.slipNo.trim() === "") {
      alert("Please enter a slip number to search");
      return;
    }

    try {
      setLoading(true);
      console.log("Searching for slip:", formData.slipNo);

      // Search with entry type filtering to only find purchase-related entries
      const response = await fetch(
        `/api/purchase/by-slip/${formData.slipNo.trim()}?entry_type=PURCHASE`
      );

      if (!response.ok) {
        alert(`No PURCHASE record found for slip number ${formData.slipNo}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data && data.master) {
        const master = data.master;
        const entryType = master.entry_type;
        const isOffline = master.offline_entry === "Yes";

        console.log(
          "Found record - Entry Type:",
          entryType,
          "Offline:",
          isOffline
        );

        // Check if this is a purchase-related entry that can be edited in purchase form
        if (entryType === "PURCHASE" || entryType === "PURCHASE_RETURN") {
          // Update online/offline status based on the found record
          setOnlineMode(!isOffline);

          // Determine the correct URL based on entry type and online/offline status
          const modeParam = isOffline ? "offline" : "online";

          if (entryType === "PURCHASE_RETURN") {
            const targetUrl = `/purchase-return?type=${modeParam}&edit=${master.wb_id}`;
            console.log(
              `Found ${entryType} entry (${
                isOffline ? "Offline" : "Online"
              }), redirecting to:`,
              targetUrl
            );
            setLocation(targetUrl);
          } else {
            // For PURCHASE entries, stay on current page and load the data
            await loadDataByWbId(master.wb_id);

            // Update URL to show edit mode with correct type
            const newUrl = `/purchase-form?type=${modeParam}&edit=${master.wb_id}`;
            window.history.replaceState({}, "", newUrl);

            // Exit search mode
            setIsSearchMode(false);
            setLoading(false);
            return;
          }
        } else {
          alert(
            `Found ${entryType} entry for slip ${formData.slipNo}, but this is the Purchase form. Please use the appropriate form for ${entryType} entries.`
          );
        }
      } else {
        alert("Invalid record data found");
      }
    } catch (error) {
      console.error("Error searching for slip:", error);
      alert("Failed to search for slip number");
    } finally {
      setLoading(false);
    }
  };

  // Function to load data by slip number for editing (kept for backward compatibility)
  // const loadDataBySlipNo = async (slipNo: string) => {
  //   try {
  //     console.log(
  //       "Loading slip:",
  //       slipNo,
  //       "with entry type:",
  //       formData.entryType
  //     );
  //     const response = await fetch(
  //       `/api/purchase/by-slip/${slipNo}?entry_type=${formData.entryType}`
  //     );

  //     const data = await response.json();
  //     if (data && data.master) {
  //       const master = data.master;
  //       const details =
  //         data.details && data.details.length > 0 ? data.details[0] : {};

  //       // Enable edit mode
  //       setIsEditMode(true);
  //       setEditingWbId(master.wb_id);

  //       // Load all the form data including detail table data
  //       setFormData((prev) => ({
  //         ...prev,
  //         slipNo: master.slip_no || "",
  //         vehicleNo: details.vehicle_no || "",
  //         firstWeight: master.first_weight ? String(master.first_weight) : "",
  //         secondWeight: master.second_weight
  //           ? String(master.second_weight)
  //           : "",
  //         netWeight: master.net_weight ? String(master.net_weight) : "",
  //         bardanaWeight: master.bardana_weight
  //           ? String(master.bardana_weight)
  //           : "",
  //         grossWeight: master.gross_weight ? String(master.gross_weight) : "",
  //         freight: master.freight ? String(master.freight) : "",
  //         remarks: master.remarks || "",
  //         driverName: master.driver_name || "",
  //         // Detail table data
  //         vendor: details.vendor_name || "",
  //         igpNo: details.igp_no || "",
  //         poNo: details.po_no || "",
  //                     poId: details.po_id,

  //         itemCode: details.item_code || "",
  //         itemDesc: details.item_desc || "",
  //         poQty: details.po_qty ? String(details.po_qty) : "",
  //         igpQty: details.igp_qty ? String(details.igp_qty) : "",
  //         balanceQty: details.balance_qty ? String(details.balance_qty) : "",
  //         bardanaType: details.bardana_type || details.baradana_type || "",
  //         wtPerBag: details.weight_per_bags
  //           ? String(details.weight_per_bags)
  //           : "",
  //         noOfBags: details.no_of_bags ? String(details.no_of_bags) : "",
  //         igpDate: details.igp_date || "",
  //         slipInTime: master.slip_in_time
  //           ? formatDatetimeLocal(master.slip_in_time)
  //           : "",
  //         slipOutTime: master.slip_out_time
  //           ? formatDatetimeLocal(master.slip_out_time)
  //           : "",
  //         entryType: master.entry_type || "PURCHASE",
  //       }));

  //       // Load existing deduction data for this record
  //       if (master.wb_id) {
  //         loadDeductionData(master.wb_id);
  //       }

  //       // Set online/offline status based on database values
  //       if (master.offline_entry === "Yes") {
  //         setOnlineMode(false);
  //       } else if (master.online_entry === "Yes") {
  //         setOnlineMode(true);
  //       }

  //       // Set IGP items after form data is loaded - use saved detail fields
  //       setTimeout(() => {
  //         if (details.po_no || details.item_code || details.item_desc) {
  //           setIgpItems([
  //             {
  //               po_no: details.po_no || "",
  //               item_code: details.item_code || "",
  //               item_desc: details.item_desc || "Saved record data",
  //               po_qty: details.po_qty || "",
  //               igp_qty: details.igp_qty || "",
  //               balance_qty: details.balance_qty || "",
  //             },
  //           ]);
  //           console.log(
  //             "IGP items set from saved detail fields in slip loading"
  //           );
  //         }
  //       }, 100);
  //     }
  //   } catch (error) {
  //     console.error("Error loading data by slip number:", error);
  //     alert("Failed to load record data");
  //   }
  // };

  // Function to cancel edit mode and return to new entry mode
 
 
 
  const cancelEdit = () => {
    setIsEditMode(false);
    setEditingWbId(null);
    setFormData(initialFormData);
  };

const handlePrintReport = async () => {
  if (!formData.slipNo) {
    alert("Please save the record first or load an existing slip to print");
    return;
  }

  if (!editingWbId || Number(editingWbId) === 0) {
    alert("❌Please save the record first or load an existing slip to print");
    return;
  }

  try {
    console.log("Fetching report for wbId:", editingWbId);
    
    const response = await fetch(`/api/form-report/${editingWbId}`);
    const result = await response.json();
    
    console.log("API Response:", result);
    
    if (result.success && result.data) {
      const raw = result.data;

      // ✅ Simple mapping - No wbId
      const apiData = {
        ...raw,
        slipNo:           raw.slip_no || "",
        vehicleNo:        raw.vehicle_no || "",
        firstWeight:      raw.first_weight ? String(raw.first_weight) : "",
        secondWeight:     raw.second_weight ? String(raw.second_weight) : "",
        netWeight:        raw.net_weight ? String(raw.net_weight) : "",
        grossWeight:      raw.gross_weight ? String(raw.gross_weight) : "",
        bardanaWeight:    raw.bardana_weight ? String(raw.bardana_weight) : "",
        noOfBags:         raw.no_of_bags ? String(raw.no_of_bags) : "",
        wtPerBag:         raw.weight_per_bags ? String(raw.weight_per_bags) : "",
        bardanaType:      raw.bardana_type || "",
        itemDesc:         raw.item_desc || "",
        igpNo:            raw.igp_no || "",
        freight:          raw.freight ? String(raw.freight) : "",
        remarks:          raw.remarks || "",
        vendor:           raw.vendor_name || "",
        slipInTime:       raw.slip_in_time || "",
        slipOutTime:      raw.slip_out_time || "",
        entryType:        raw.entry_type || "PURCHASE",
        qualityDeduction: raw.quality_deduction ? String(raw.quality_deduction) : "",
        supplierWeight:   raw.supplier_weight ? String(raw.supplier_weight) : "",
        created_by_name:       raw.created_by_name || "",
        second_weight_by_name: raw.second_weight_by_name || "",
        second_weight_by:      raw.second_weight_by || "",
   
      };

      console.log("✅ Mapped data:", {
        firstWeight: apiData.firstWeight,
        secondWeight: apiData.secondWeight,
        netWeight: apiData.netWeight,
        slipNo: apiData.slipNo,
        vendor: apiData.vendor,
        noOfBags: apiData.noOfBags,
      });
      
      const reportHTML = generateReportHTML(apiData);
      
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow popups to print the report");
        return;
      }
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      printWindow.print();
    } else {
      alert("Error fetching report data: " + (result.message || "Unknown error"));
    }
  } catch (error) {
    console.error("Error printing report:", error);
    alert("Error loading report. Please try again.");
  }
};

const generateReportHTML = (reportData: any) => {
  const currentDate = new Date()
    .toLocaleDateString("en-GB", {
      timeZone: "Asia/Karachi",
      day: "2-digit",
      month: "short",
      year: "2-digit",
    })
    .toUpperCase()
    .replace(/\s/g, "-");

  const currentTime = new Date()
    .toLocaleTimeString("en-GB", {
      timeZone: "Asia/Karachi",
      hour12: true,
    })
    .toUpperCase();

  function formatPKTDateTime(dateStr: any) {
    if (!dateStr) return "";
    const date = new Date(
      new Date(dateStr).toLocaleString("en-US", { timeZone: "Asia/Karachi" })
    );
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const months = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEPT", "OCT", "NOV", "DEC"
    ];
    const month = months[date.getMonth()];
    const time = date
      .toLocaleTimeString("en-GB", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .toUpperCase();
    return `${day}-${month}-${year} ${time}`;
  }

  // ✅ Get Fiscal Year from date
  function getFiscalYear(dateStr: any): number {
    if (!dateStr) {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      return currentMonth >= 7 ? now.getFullYear() + 1 : now.getFullYear();
    }
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return month >= 7 ? year + 1 : year;
  }

  const calculateAvgWeight = () => {
    const netWeight = parseFloat(reportData.netWeight || "0");
    const quantity = parseInt(reportData.noOfBags || "0");
    if (quantity === 0) return "0";
    return (netWeight / quantity).toFixed(2);
  };

  const calculateCustomerNetWeight = () => {
    const qualityded = parseFloat(reportData.quality_deduction) || 0;
    const withBardanaWeight = Math.trunc((parseFloat(reportData.grossWeight) || 0) + (parseFloat(reportData.bardanaWeight) || 0));
    const supplierWeight = parseFloat(reportData.supplierWeight) || withBardanaWeight;
    const minWeight = Math.max(0, Math.min(supplierWeight, withBardanaWeight) - qualityded);
    return minWeight.toLocaleString("en-IN") + " KG";
  };

  const weightByName = reportData.created_by_name || "WRONG";
  
  const secondWeightValue = reportData.secondWeight || reportData.second_weight;
  const secondWeightById = reportData.second_weight_by;
  const secondWeightName = reportData.second_weight_by_name;
  
  const hasSecondWeight = secondWeightValue && parseFloat(secondWeightValue) > 0;
  const hasSecondWeightBy = secondWeightById && secondWeightById !== null && secondWeightById !== "";
  
  let secondWeightByName = "";
  
  if (hasSecondWeight && hasSecondWeightBy) {
    secondWeightByName = secondWeightName || "Not recorded";
  } else {
    secondWeightByName = "";
  }

  // ✅ UPPERCASE entryType - No wbId
  const entryTypeUpper = (reportData.entryType || "PURCHASE").toUpperCase();
  
  // ✅ Get Fiscal Year for image filtering
  const fiscalYear = getFiscalYear(reportData.slipInTime || reportData.createdAt);

  // ✅ Get purRegType from reportData (database column: pur_reg_type)
  const purRegType = reportData.pur_reg_type || reportData.purRegType || reportData.purchase || 'R';

  console.log(
    "First Image API:",
    `/api/images/first-weight/latest-file?slipNo=${reportData.slipNo}&entryType=${entryTypeUpper}&fiscalYear=${fiscalYear}&purRegType=${purRegType}`
  );

  console.log(
    "Second Image API:",
    `/api/images/second-weight/latest-file?slipNo=${reportData.slipNo}&entryType=${entryTypeUpper}&fiscalYear=${fiscalYear}&purRegType=${purRegType}`
  );

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Weighbridge Slip - ${reportData.slipNo}</title>
 <style>
  body {
    font-family: "Times New Roman", Times, serif;
    margin: 6px;
    font-size: 15px;
    font-weight: 600;
  }

  .page-container {
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .copy-label {
    font-weight: bold;
    font-size: 16px;
  }

  .print-date {
    font-size: 13px;
  }

  .slip-section {
    border: 2px solid #000;
    margin-bottom: 6px;
    padding: 10px;
    box-sizing: border-box;
  }

  .image-box {
    border: 1px solid #ccc;
    width: 140px;
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f8f8;
    font-size: 12px;
    font-weight: bold;
    text-align: center;
    overflow: hidden;
    position: relative;
  }

  .image-box img {
    max-width: 140%;
    max-height: 100%;
    object-fit: contain;
    display: block;
  }

  .company-name {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 2px;
    text-align: center;
  }

  .slip-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 6px;
    text-align: center;
  }

  .two-column {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .left-section,
  .right-section {
    width: 48%;
    border: 1px solid #666;
    padding: 8px;
    border-radius: 2px;
  }

  .commodity-gross-row {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    margin: 14px 0;
  }

  .section-box {
    flex: 1;
    border: 1px solid #666;
    padding: 12px;
    border-radius: 2px;
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  .fields {
    display: grid;
    row-gap: 6px;
  }

  .fields div {
    display: flex;
    gap: 3px;
  }

  .label,
  .label1 {
    font-weight: bold;
    display: inline-block;
    width: 150px;
    font-size: 14px;
  }

  .value {
    font-weight: 700;
    font-size: 14px;
  }

  .value1 {
    font-weight: 900;
    font-size: 18px;
  }

  .signatures {
    margin-top: 20px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    text-align: center;
    gap: 20px;
  }

  .signature-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
  }

  .signature-line {
    border-bottom: 1px solid #000;
    width: 95px;
    margin-bottom: 3px;
  }

  @media print {
    body { font-size: 14px; }
    .fields div { gap: 2px; }
    .two-column { gap: 5px; }
  }
</style>
</head>
<body>
  <div class="page-container">
    <div class="slip-section">
      <div class="header">
        <div class="copy-label">Head Office Copy</div>
        <div class="print-date">Print Date: ${currentDate} ${currentTime}</div>
      </div>
      <div class="company-name">Sabirs Vegetable Oils (Pvt.) Ltd.</div>
      <div style="height: 6px;"></div>
      <div class="slip-title">WEIGHBRIDGE SLIP</div>
      <div><b>IGP #</b> &nbsp;&nbsp;&nbsp;<span class="value" style="font-weight: bold; font-size: 20px;">${reportData.igpNo || ""}</span></div>
      <div class="two-column">
        <div class="left-section">
          <div class="fields">
            <div><span class="label">W.B #</span><span class="value1">${reportData.slipNo || ""}</span></div>
            <div><span class="label1">Truck #</span><span class="value1">${reportData.vehicleNo || ""}</span></div>
          </div>
        </div>
        <div class="right-section">
          <div class="fields">
            <div><span class="label1">Party:</span><span class="value1">${reportData.vendor || reportData.customerName || ""}</span></div>
            <div><span class="label">Slip_in_time:</span><span class="value">${reportData.slipInTime ? formatPKTDateTime(reportData.slipInTime) : ""}</span></div>
            <div><span class="label">Slip_out_time:</span><span class="value">${reportData.slipOutTime ? formatPKTDateTime(reportData.slipOutTime) : ""}</span></div>
          </div>
        </div>
      </div>
      <div class="commodity-gross-row">
        <div class="section-box">
          <div class="fields">
            <div><span class="label1">COMMODITY</span><span class="value1">${reportData.itemDesc || ""}</span></div>
            <div><span class="label">QUANTITY</span><span class="value">${reportData.noOfBags || ""}</span></div>
            <div><span class="label">BAG CONDITION</span><span class="value">${reportData.wtPerBag || ""}</span></div>
            <div><span class="label">BAG TYPE</span><span class="value">${reportData.bardanaType || ""}</span></div>
            <div><span class="label">AVG. WEIGHT</span><span class="value">${calculateAvgWeight()}</span></div>
            <div><span class="label">REMARKS</span><span class="value">${reportData.remarks || ""}</span></div>
          </div>
          <!-- ✅ First Weight Image - Fiscal Year + purRegType based -->
          <div class="image-box">
            <img 
              src="/api/images/first-weight/latest-file?slipNo=${reportData.slipNo}&entryType=${entryTypeUpper}&fiscalYear=${fiscalYear}&purRegType=${purRegType}"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" 
              alt="First Weight Image" 
            />
            <div style="display: none; color: #666; font-size: 9px;">No Image Available</div>
          </div>
        </div>
        <div class="section-box">
          <div class="fields">
            <div><span class="label">GROSS WEIGHT</span><span class="value"><strong>${(parseFloat(reportData.firstWeight) || 0).toLocaleString("en-IN")}</strong></span></div>
            <div><span class="label">TARE WEIGHT</span><span class="value"><strong>${(parseFloat(reportData.secondWeight) || 0).toLocaleString("en-IN")}</strong></span></div>
            <div><span class="label">WITH BARDANA WEIGHT</span><span class="value"><strong>${Math.trunc((parseFloat(reportData.grossWeight) || 0) + (parseFloat(reportData.bardanaWeight) || 0)).toLocaleString("en-IN")}</strong></span></div>
            <div><span class="label">BARDANA WEIGHT</span><span class="value">${Math.round(parseFloat(reportData.bardanaWeight) || 0)}</span></div>
            <div><span class="label">QUALITY DEDUCTION</span><span class="value">${reportData.qualityDeduction || "0"}</span></div>
            <div><span class="label">NET WEIGHT</span><span class="value"><strong>${(parseFloat(reportData.netWeight) || 0).toLocaleString("en-IN")}</strong></span></div>
          </div>
          <!-- ✅ Second Weight Image - Fiscal Year + purRegType based -->
          <div class="image-box">
            <img 
              src="/api/images/second-weight/latest-file?slipNo=${reportData.slipNo}&entryType=${entryTypeUpper}&fiscalYear=${fiscalYear}&purRegType=${purRegType}" 
              onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" 
              alt="Second Weight Image" 
            />
            <div style="display: none; color: #666; font-size: 9px;">No Image Available</div>
          </div>
        </div>
      </div>
      
      <!-- Signatures for Head Office Copy -->
      <div class="signatures">
        <div class="signature-block">
          <div style="font-size: 9px; margin-bottom: 1px;">${weightByName}</div>
          <div class="signature-line"></div>
          <div>Weight By</div>
        </div>
        <div class="signature-block">
          <div style="font-size: 9px; margin-bottom: 1px;">${secondWeightByName}</div>
          <div class="signature-line"></div>
          <div>Second Weight By</div>
        </div>
        <div class="signature-block">
          <div class="signature-line"></div>
          <div>Checked By</div>
        </div>
        <div class="signature-block">
          <div class="signature-line"></div>
          <div>Production Manager</div>
        </div>
      </div>
      
      <hr style="border: 1px solid #000; margin: 14px 0;" />
      
      <!-- Feed Mill Copy -->
      <div class="slip">
        <div class="slip-header">
          <div class="header-left">Feed Mill Copy</div>
          <div class="header-center">
            <div class="company-name">Sabirs Vegetable Oils (Pvt.) Ltd.</div>
            <div style="height: 6px;"></div>
            <div class="slip-title">WEIGHBRIDGE SLIP</div>
          </div>
          <div class="header-right"></div>
        </div>
        <div><b>IGP #</b> &nbsp;&nbsp;&nbsp;<span class="value" style="font-weight: bold; font-size: 20px;">${reportData.igpNo || ""}</span></div>
        <div class="two-column">
          <div class="left-section">
            <div class="fields">
              <div><span class="label">W.B #</span><span class="value1">${reportData.slipNo || ""}</span></div>
              <div><span class="label1">Truck #</span><span class="value1">${reportData.vehicleNo || ""}</span></div>
            </div>
          </div>
          <div class="right-section">
            <div class="fields">
              <div><span class="label1">Party:</span><span class="value1">${reportData.vendor || reportData.customerName || ""}</span></div>
              <div><span class="label">Slip_in_time:</span><span class="value">${reportData.slipInTime ? formatPKTDateTime(reportData.slipInTime) : ""}</span></div>
              <div><span class="label">Slip_out_time:</span><span class="value">${reportData.slipOutTime ? formatPKTDateTime(reportData.slipOutTime) : ""}</span></div>
            </div>
          </div>
        </div>
        <div class="commodity-gross-row">
          <div class="section-box">
            <div class="fields">
              <div><span class="label1">COMMODITY</span><span class="value1">${reportData.itemDesc || ""}</span></div>
              <div><span class="label">QUANTITY</span><span class="value">${reportData.noOfBags || ""}</span></div>
              <div><span class="label">BAG CONDITION</span><span class="value">${reportData.wtPerBag || ""}</span></div>
              <div><span class="label">BAG TYPE</span><span class="value">${reportData.bardanaType || ""}</span></div>
              <div><span class="label">AVG. WEIGHT</span><span class="value">${calculateAvgWeight()}</span></div>
              <div><span class="label">REMARKS</span><span class="value">${reportData.remarks || ""}</span></div>
            </div>
            <!-- ✅ First Weight Image - Fiscal Year + purRegType based -->
            <div class="image-box">
              <img 
                src="/api/images/first-weight/latest-file?slipNo=${reportData.slipNo}&entryType=${entryTypeUpper}&fiscalYear=${fiscalYear}&purRegType=${purRegType}" 
                onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" 
                alt="First Weight Image" 
              />
              <div style="display: none; color: #666; font-size: 9px;">No Image Available</div>
            </div>
          </div>
          <div class="section-box">
            <div class="fields">
              <div><span class="label">GROSS WEIGHT</span><span class="value"><strong>${(parseFloat(reportData.firstWeight) || 0).toLocaleString("en-IN")}</strong></span></div>
              <div><span class="label">TARE WEIGHT</span><span class="value"><strong>${(parseFloat(reportData.secondWeight) || 0).toLocaleString("en-IN")}</strong></span></div>
              <div><span class="label">WITH BARDANA WEIGHT</span><span class="value"><strong>${Math.trunc((parseFloat(reportData.grossWeight) || 0) + (parseFloat(reportData.bardanaWeight) || 0)).toLocaleString("en-IN")}</strong></span></div>
              <div><span class="label">BARDANA WEIGHT</span><span class="value">${Math.round(parseFloat(reportData.bardanaWeight) || 0)}</span></div>
              <div><span class="label">QUALITY DEDUCTION</span><span class="value">${reportData.qualityDeduction || "0"}</span></div>
              <div><span class="label">NET WEIGHT</span><span class="value"><strong>${(parseFloat(reportData.netWeight) || 0).toLocaleString("en-IN")}</strong></span></div>
            </div>
            <!-- ✅ Second Weight Image - Fiscal Year + purRegType based -->
            <div class="image-box">
              <img 
                src="/api/images/second-weight/latest-file?slipNo=${reportData.slipNo}&entryType=${entryTypeUpper}&fiscalYear=${fiscalYear}&purRegType=${purRegType}" 
                onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" 
                alt="Second Weight Image" 
              />
              <div style="display: none; color: #666; font-size: 9px;">No Image Available</div>
            </div>
          </div>
        </div>
        
        <!-- Signatures for Feed Mill Copy -->
        <div class="signatures">
          <div class="signature-block">
            <div style="font-size: 9px; margin-bottom: 1px;">${weightByName}</div>
            <div class="signature-line"></div>
            <div>Weight By</div>
          </div>
          <div class="signature-block">
            <div style="font-size: 9px; margin-bottom: 1px;">${secondWeightByName}</div>
            <div class="signature-line"></div>
            <div>Second Weight By</div>
          </div>
          <div class="signature-block">
            <div class="signature-line"></div>
            <div>Checked By</div>
          </div>
          <div class="signature-block">
            <div class="signature-line"></div>
            <div>Production Manager</div>
          </div>
        </div>
        
        <hr style="border: 1px solid #000; margin: 14px 0;" />
        
        <!-- Customer Copy -->
        <div class="slip">
          <div class="slip-header">
            <div class="header-left">Customer Copy</div>
            <div class="header-center">
              <div class="company-name">Sabirs Vegetable Oils (Pvt.) Ltd.</div>
              <div style="height: 6px;"></div>
              <div class="slip-title">WEIGHBRIDGE SLIP</div>
            </div>
            <div><b>IGP #</b> &nbsp;&nbsp;&nbsp;<span class="value" style="font-weight: bold; font-size: 20px;">${reportData.igpNo || ""}</span></div>
            <div class="two-column">
              <div class="left-section">
                <div class="fields">
                  <div><span class="label">W.B #</span><span class="value1">${reportData.slipNo || ""}</span></div>
                </div>
              </div>
              <div class="right-section">
                <div class="fields">
                  <div class="print-date">${reportData.slipOutTime ? `Print Date: ${formatPKTDateTime(reportData.slipOutTime)}` : ""}</div>
                </div>
              </div>
            </div>
            <div class="commodity-gross-row">
              <div class="section-box">
                <div class="fields">
                  <div><span class="label1">Party:</span><span class="value1">${reportData.vendor || reportData.customerName || ""}</span></div>
                  <div><span class="label1">COMMODITY</span><span class="value1">${reportData.itemDesc || ""}</span></div>
                  <div><span class="label1">Truck #</span><span class="value1">${reportData.vehicleNo || ""}</span></div>
                </div>
              </div>
              <div class="section-box">
                <div class="fields">
                  <div><span class="label">QUANTITY</span><span class="value">${reportData.noOfBags || ""}</span></div>
                  <div>
                    <span class="label">NET WEIGHT</span>
                    <div class="flex-1 border-b border-black">_________________________</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Signatures for Customer Copy -->
            <div class="signatures">
              <div class="signature-block">
                <div style="font-size: 9px; margin-bottom: 1px;">${weightByName}</div>
                <div class="signature-line"></div>
                <div>Weight By</div>
              </div>
              <div class="signature-block">
                <div style="font-size: 9px; margin-bottom: 1px;">${secondWeightByName}</div>
                <div class="signature-line"></div>
                <div>Second Weight By</div>
              </div>
              <div class="signature-block">
                <div class="signature-line"></div>
                <div>Checked By</div>
              </div>
              <div class="signature-block">
                <div class="signature-line"></div>
                <div>Production Manager</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
};

  // Navigation functions
  const navigateToFirst = async () => {
    try {
      const response = await fetch("/api/purchase/first-weight-records");
      const records = await response.json();
      if (records.length > 0) {
        const firstRecord = records[records.length - 1]; // Get oldest record
        await loadDataByWbId(firstRecord.wb_id);
      }
    } catch (error) {
      console.error("Error navigating to first record:", error);
    }
  };


  

const navigateToPrev = async () => {
  let currentSlip = parseInt(formData.slipNo);
  let prevSlip = currentSlip - 1;
  let recordFound = false;

  // ✅ Get current purchase type (REGISTER/UNREGISTER/NULL)
  const currentPurchaseType = formData.purchase || 'R';

  try {
    while (prevSlip > 0 && !recordFound) {
      // ✅ Add purRegType filter in API call
      const response = await fetch(`/api/purchase/by-slip/${prevSlip}?purRegType=${currentPurchaseType}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.master) {
          await loadDataByWbId(data.master.wb_id);
          setFormData((prev) => ({ ...prev, slipNo: prevSlip.toString() }));
          setCameFromPrevious(true);
          recordFound = true;
          break;
        } else {
          prevSlip--; // missing → try previous
        }
      } else {
        prevSlip--; // missing → try previous
      }
    }

    // Agar previous record exist nahi → slip 1 pe move
    if (!recordFound) {
      setFormData((prev) => ({ ...prev, slipNo: "1" }));
    }
  } catch (error) {
    console.error("Error navigating to previous record:", error);
  }
};


const navigateToNext = async () => {
  let currentSlip = parseInt(formData.slipNo);
  let nextSlip = currentSlip + 1;
  let recordFound = false;

  // ✅ Get current purchase type (REGISTER/UNREGISTER/NULL)
  const currentPurchaseType = formData.purchase || 'R';

  try {
    while (!recordFound) {
      // ✅ Add purRegType filter in API call
      const response = await fetch(`/api/purchase/by-slip/${nextSlip}?purRegType=${currentPurchaseType}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.master) {
          await loadDataByWbId(data.master.wb_id);
          setFormData((prev) => ({ ...prev, slipNo: nextSlip.toString() }));
          setCameFromPrevious(false);
          recordFound = true;
          break;
        } else {
          nextSlip++; // missing → try next
        }
      } else {
        nextSlip++; // missing → try next
      }
    }

    if (!recordFound) {
      // No next record found, stay on current
      setFormData((prev) => ({ ...prev, slipNo: currentSlip.toString() }));
    }
  } catch (error) {
    console.error("Error navigating to next record:", error);
  }
};




  const navigateToLast = async () => {
    try {
      const response = await fetch("/api/purchase/first-weight-records");
      const records = await response.json();
      if (records.length > 0) {
        const lastRecord = records[0]; // Get newest record
        await loadDataByWbId(lastRecord.wb_id);
      }
    } catch (error) {
      console.error("Error navigating to last record:", error);
    }
  };

  // Function to get current date in YYYY-MM-DD format
  // const getCurrentDate = () => {
  //   const today = new Date();
  //   return today.toISOString().split("T")[0];
  // };



  

const initialFormData = {
    // Basic slip information
    slipNo: "",
    slipInTime: "",
    slipOutTime: "",
    slipDate: "",
    status: "",
    entryType: "PURCHASE",
    // Weight measurements
    firstWeight: "",
    secondWeight: "",
    netWeight: "",
    bardanaWeight: "",
    grossWeight: "",
    supplierWeight: "",
    supplierWeightMinusBardana: "",
    supplierWeightMinusOutWeight: "",
    qualityDeduction: "",
    // Vehicle and driver information
    vehicleNo: "",
    driverName: "",
    // IGP and purchase details
    igpNo: "",
    igpDate: "",
    poNo: "",
    itemCode: "",
    itemDesc: "",
    poQty: "",
    igpQty: "",
    balanceQty: "",
    // Bardana information
    bardanaType: "",
    wtPerBag: "",
    noOfBags: "",
    bagCondition: "",
    bardanaTypeId: "",
    // Vendor information
    vendor: "",
    vendorName: "",
    vendorId: "",
    customerId: "",
    customerName: "",
    // System fields
    wbId: "",
    companyId: "",
    branchId: "",
    branch: "",
    onlineEntry: "Yes",
    offlineEntry: "",
    createdBy: "",
    creationDate: "",
    lastUpdatedBy: "",
    lastUpdatedDate: "",
    manualDcNo: "",
    // Additional fields
    doId: "",
    doNo: "",
    doDate: "",
    freight: "",
    remarks: "",
    qualityDed: "",
    weight: "",
    bags: "",
    wbItemPId: "",
    itemId: "",
    poId: null as bigint | null,
    created_by_name: "",
    second_weight_by_name: "",
    second_weight_by: "",
    baradanaType: "",
    manualIgpNo: "",
    igpId: "",
    weightPerBags: "",
    fromOffline: false,
    dcQty: "",
    supWeightWithoutBardana: "",
    netSupplierWeight: "",
    isPercentageMode: false,
    isFirstWeightSaved: false,
    isSecondWeightSaved: false,
    grossWBD: "Null",
    registerType: "Null",
    purchase: 'R',
    sale: "Null",
    excBags: false,  
    igpCheckbox: false,
  
};
const [formData, setFormData] = useState(initialFormData);



useEffect(() => {
  const secondWeightNum = Number(formData.secondWeight) || 0;
  const firstWeightNum = Number(formData.firstWeight) || 0;

  let shouldDisable = false; // default enable

  // ✅ Logic sirf ONLINE entry ke liye
  if (formData.status === "ONLINE") {

    // Case 1: Agar second weight already saved hai → disable
    if (formData.isSecondWeightSaved) {
      shouldDisable = true;
    }
    // Case 2: Agar first saved hai aur second empty hai → disable
    else if (formData.isFirstWeightSaved && secondWeightNum <= 0) {
      shouldDisable = true;
    }
    // Case 3: Agar first saved hai aur second enter ho gaya → enable
    else if (formData.isFirstWeightSaved && secondWeightNum > 0) {
      shouldDisable = false;
    }

  }

  console.log("Disable check:");
  console.log("Status:", formData.status);
  console.log("First saved:", formData.isFirstWeightSaved);
  console.log("Second saved:", formData.isSecondWeightSaved);
  console.log("Should Disable:", shouldDisable);

  setDisableSaveButton(shouldDisable);

}, [
  formData.firstWeight,
  formData.secondWeight,
  formData.status,
  formData.isFirstWeightSaved,
  formData.isSecondWeightSaved
]);



  // Auto-calculate formulas when relevant fields change
  useEffect(() => {
    const firstWeight = parseFloat(formData.firstWeight) || 0;
    const secondWeight = parseFloat(formData.secondWeight) || 0;
    const wtPerBag = parseFloat(formData.wtPerBag) || 0;
    const noOfBags = parseFloat(formData.noOfBags) || 0;

    // Bardana Weight = weight per bag * number of bags
    const bardanaWeight = Math.round(Number(wtPerBag * noOfBags));

    // Gross Weight = First Weight - Second Weight
    const grossWeight = firstWeight - secondWeight - bardanaWeight;

    // Net Weight = First Weight - Second Weight - Bardana Weight
    const netWeight = grossWeight - bardanaWeight;

    setFormData((prev) => ({
      ...prev,
      bardanaWeight: bardanaWeight > 0 ? bardanaWeight.toFixed(2) : "0.00",
      grossWeight: grossWeight > 0 ? grossWeight.toFixed(2) : "0.00",
      netWeight: netWeight > 0 ? netWeight.toFixed(2) : "0.00",
    }));
  }, [
    formData.firstWeight,
    formData.secondWeight,
    formData.wtPerBag,
    formData.noOfBags,
  ]);

  // Auto-calculate Balance Quantity for offline mode
  useEffect(() => {
    if (!onlineMode) {
      const poQty = parseFloat(formData.poQty) || 0;
      const igpQty = parseFloat(formData.igpQty) || 0;
      const balanceQty = poQty - igpQty;

      setFormData((prev) => ({
        ...prev,
        balanceQty: balanceQty >= 0 ? balanceQty.toFixed(2) : "0.00",
      }));
    }
  }, [formData.poQty, formData.igpQty, onlineMode]);

  const [igpDataFetched, setIgpDataFetched] = useState(false);

  // Remove auto-fetch IGP data in edit mode - use saved table data only

const fetchIgpData = async () => {
    if (!formData.igpNo) {
        alert("Please enter IGP No");
        return null;
    }

    const igpNoClean = formData.igpNo.trim().toUpperCase();

    try {
        console.log(`🔍 Fetching IGP data from external API: ${igpNoClean}`);
        
      const apiUrl = formData.igpCheckbox
  ? `http://portal.sabirsgroup.com:8184/ords/sabroso_ords/wb-om/igp-contract?igp_no=${igpNoClean}`
  : `http://portal.sabirsgroup.com:8184/ords/sabroso_ords/wb-om/live_data?igp_no=${igpNoClean}`;

console.log("🌐 Using API:", apiUrl);
console.log("☑️ IGP Checkbox:", formData.igpCheckbox);

const response = await fetch(apiUrl);
        
        if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        console.log("📥 Raw API Response:", data);
        
        if (data && data.items && data.items.length > 0) {
            const firstItem = data.items[0];

            // ✅ Format IGP Date properly
            let formattedIgpDate = "";
            if (firstItem.igp_date) {
                const igpDateObj = new Date(firstItem.igp_date);
                if (!isNaN(igpDateObj.getTime())) {
                    // Format as YYYY-MM-DD for database
                    formattedIgpDate = igpDateObj.toISOString().split('T')[0];
                }
            }

            // Extract item_id from any possible field name
            let itemIdValue = null;
            
            if (firstItem.item_id !== undefined) {
                itemIdValue = firstItem.item_id;
            } else if (firstItem.itemId !== undefined) {
                itemIdValue = firstItem.itemId;
            } else if (firstItem.itemid !== undefined) {
                itemIdValue = firstItem.itemid;
            } else if (firstItem.material_id !== undefined) {
                itemIdValue = firstItem.material_id;
            } else if (firstItem.product_id !== undefined) {
                itemIdValue = firstItem.product_id;
            }
            
            console.log("✅ Extracted item_id:", itemIdValue);

            const updatedFormData = {
                ...formData,
                driverName: firstItem.driver_name || "",
                vendor: firstItem.vendor_name || "",
                vendorId: firstItem.vendor_id ? String(firstItem.vendor_id) : "",
                vehicleNo: firstItem.vehicle_no || "",
                bardanaType: firstItem.bardanatype || firstItem.bardana_type || "",
                wtPerBag: firstItem.wtperbag ,
                igpId: firstItem.igp_id ? String(firstItem.igp_id) : "",
                itemCode: firstItem.item_code || "",
                itemDesc: firstItem.item_desc || "",
                poNo: firstItem.po_no ? String(firstItem.po_no) : "",
                poId: firstItem.po_id ? BigInt(firstItem.po_id) : null,
                igpQty: firstItem.igp_qty ? String(firstItem.igp_qty) : "",
                balanceQty: firstItem.balance_qty ? String(firstItem.balance_qty) : "",
                onlineEntry: "Yes",
                offlineEntry: "No",
                bardanaTypeId: firstItem.bardana_item_id ? String(firstItem.bardana_item_id) : "",
                itemId: itemIdValue ? String(itemIdValue) : "",
                
                // 🔥 NEW FIELDS TO ADD:
                // 1. Map bardana_qty to noOfBags
                noOfBags: firstItem.bardana_qty ? String(firstItem.bardana_qty) : "",
                
                // 2. Map igp_date to igpDate field (already exists in formData)
                igpDate: formattedIgpDate,
            };

            setFormData(updatedFormData);
            setIgpItems(data.items);
            
            console.log("✅ IGP data fetched successfully with new fields:", {
                itemId: updatedFormData.itemId,
                poId: updatedFormData.poId,
                itemCode: updatedFormData.itemCode,
                noOfBags: updatedFormData.noOfBags,  // From bardana_qty
                igpDate: updatedFormData.igpDate,     // From igp_date
                totalItems: data.items.length
            });
            
            return updatedFormData;
        } else {
            alert("No data found for this IGP No.");
            setIgpItems([]);
            return null;
        }
    } catch (error) {
        console.error("Error fetching IGP data:", error);
        alert("Failed to fetch IGP data. Please check the IGP number and try again.");
        setIgpItems([]);
        return null;
    }
};

  // DC Data Fetching Function for Sales
  // const fetchDcData = async (dcNo: string) => {
  //   if (!dcNo || dcNo.trim() === "") {
  //     alert("Please enter DC No");
  //     return;
  //   }
  //   try {
  //     const response = await fetch(
  //       `http://portal.sabirsgroup.com:8184/ords/sabroso_ords/wb-om/dc_data?dc_no=${dcNo}`
  //     );

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     console.log("DC API Response:", data);

  //     if (data && data.items && data.items.length > 0) {
  //       const items = data.items;

  //       // Update sales data with fetched DC data including hidden columns
  //       const updatedSalesData = items.map((item: any, index: number) => ({
  //         doId: `${index + 1}`, // Auto-generated ID
  //         dcNo: item.dc_no || "",
  //         doNo: item.delivery_order_no ? String(item.delivery_order_no) : "", // Map delivery order number to DO #
  //         customerName: item.customer_name || "",
  //         vehicleNo: item.vehicle_no || "",
  //         doDate: item.dc_date
  //           ? new Date(item.dc_date).toLocaleDateString()
  //           : "",
  //         itemDescription: item.item_desc || "",
  //         dcQty: item.dc_qty ? String(item.dc_qty) : "",
  //         doQty: item.del_qty ? String(item.del_qty) : "",
  //         branch: "", // Keep empty for now
  //         // Hidden columns for database storage
  //         dcId: item.dc_id || "",
  //         customerId: item.customer_id || "",
  //         itemId: item.item_id || "",
  //         itemCode: item.item_code || "",
  //       }));

  //       // Fill remaining rows with empty data if needed
  //       while (updatedSalesData.length < 8) {
  //         updatedSalesData.push({
  //           doId: "",
  //           dcNo: "",
  //           doNo: "",
  //           customerName: "",
  //           vehicleNo: "",
  //           doDate: "",
  //           itemDescription: "",
  //           dcQty: "",
  //           doQty: "",
  //           branch: "",
  //           // Hidden columns for database storage
  //           dcId: "",
  //           customerId: "",
  //           itemId: "",
  //           itemCode: "",
  //         });
  //       }

  //       setSalesData(updatedSalesData);
  //       console.log(
  //         "DC data fetched and populated successfully:",
  //         updatedSalesData
  //       );
  //     } else {
  //       alert("No data found for this DC No.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching DC data:", error);
  //     alert(
  //       "Failed to fetch DC data. Please check the DC number and try again."
  //     );
  //   }
  // };




  
  // // Function to check if vehicle number already exists for today
  // const checkVehicleNumberExists = async (
  //   vehicleNo: string,
  //   excludeWbId?: number,
  // ) => {
  //   if (!vehicleNo || vehicleNo.trim() === "") return false;

  //   try {
  //     const today = new Date().toISOString().split("T")[0];
  //     let url = `/api/purchases/check-vehicle?vehicle_no=${encodeURIComponent(vehicleNo.trim())}&date=${today}`;

  //     if (excludeWbId) {
  //       url += `&exclude_wb_id=${excludeWbId}`;
  //     }

  //     const response = await fetch(url);
  //     const data = await response.json();
  //     return data.exists;
  //   } catch (error) {
  //     console.error("Error checking vehicle number:", error);
  //     return false;
  //   }
  // };

  // // Function to check if vehicle number exists for IGP entries on the same date
  // const checkIGPVehicleNumberExists = async (
  //   vehicleNo: string,
  //   igpNo: string,
  //   excludeWbId?: number,
  // ) => {
  //   if (!vehicleNo || vehicleNo.trim() === "" || !igpNo || igpNo.trim() === "")
  //     return false;

  //   try {
  //     const today = new Date().toISOString().split("T")[0];
  //     let url = `/api/purchases/check-igp-vehicle?vehicle_no=${encodeURIComponent(vehicleNo.trim())}&igp_no=${encodeURIComponent(igpNo.trim())}&date=${today}`;

  //     if (excludeWbId) {
  //       url += `&exclude_wb_id=${excludeWbId}`;
  //     }

  //     const response = await fetch(url);
  //     const data = await response.json();
  //     return data.exists;
  //   } catch (error) {
  //     console.error("Error checking IGP vehicle number:", error);
  //     return false;
  //   }
  // };

  useEffect(() => {
    if (branches.length > 0 && !isEditMode && !formData.branchId) {
      const defaultBranch = branches[0]; // first branch
      setFormData((prev) => ({
        ...prev,
        branchId: defaultBranch.branch_id.toString(),
        branch: defaultBranch.branch_name,
      }));
    }
  }, [branches, isEditMode, formData.branchId]);

  // Function to reset form to clean state
  const resetFormToInitial = (preserveEditMode = false) => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeMode = urlParams.get("type");
    const isOfflineMode = typeMode === "offline";

    // Sync onlineMode state with URL parameter
    if (typeMode === "offline") {
      setOnlineMode(false);
    } else if (typeMode === "online") {
      setOnlineMode(true);
    }

    setFormData({
      ...initialFormData,
      slipInTime: "",
      onlineEntry: isOfflineMode ? "No" : "Yes",
      offlineEntry: isOfflineMode ? "Yes" : "No",
      entryType: "PURCHASE",
      creationDate: getPKTDateTime(),
      lastUpdatedDate: getPKTDateTime(),
      slipDate: getPKTDateTime(),
    });
    setIgpItems([]);
    setIgpDataFetched(false); // Reset IGP data fetched state

    if (!preserveEditMode) {
      setIsEditMode(false);
      setEditingWbId(null);
    }
  };

  // ===== CAMERA DATA SECTION - ULTRA-HIGH PERFORMANCE =====
  // Get camera data with maximum performance optimization
  const { data: camera } = useQuery({
    queryKey: ["/api/cameras/1"],
    enabled: selectedForm === "purchase", // Only fetch when purchase form is active
    staleTime: 60 * 60 * 1000, // 1 hour cache
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: false, // Disable automatic refetching
  });

 const handleDeduction = () => {
  const bags = parseFloat(formData.bags) || 0;
  const weightValue = parseFloat(formData.weight) || 0;
  const grossWeight = parseFloat(formData.grossWeight) || 0;
  const noOfBags = parseFloat(formData.noOfBags) || 1;
  const percentage = parseFloat(formData.qualityDed) || 0;

  const calculatedWeight = formData.isPercentageMode
    ? (grossWeight / noOfBags) * ((bags / 100) * weightValue)
    : weightValue * bags;

  let percentageValue = percentage;
  if (formData.isPercentageMode && formData.weight) {
    const weightStr = formData.weight.toString();
    percentageValue = weightStr.includes("%")
      ? parseFloat(weightStr.replace("%", "")) || 0
      : parseFloat(weightStr) || 0;
  }

  if (bags > 0 && weightValue > 0) {
    const newBagEntry = {
      bagId: nextBagId,
      bags,
      pb: weightValue,
      percentage: percentageValue,
      weight: calculatedWeight,
      total: calculatedWeight,
    };

    setBagTableData((prev) => {
      const updated = [...prev, newBagEntry];

      // 🔥 EXACT same calculation as your Total Row
      const totalSum = updated.reduce(
        (sum, item) => sum + item.total,
        0
      );

 // Update Quality with TOTAL (always whole number)
setFormData((prevForm) => ({
  ...prevForm,
  qualityDeduction: Math.round(totalSum).toString()
}));


      return updated;
    });

    setNextBagId((prev) => prev + 1);
  } else {
    alert("Please enter valid values for Bags and Weight Per Bag");
  }
};


  // Function to remove bag entry
const removeBagEntry = (bagId: number) => {
  setBagTableData((prev) => {
    const updated = prev.filter((item) => item.bagId !== bagId);

    const totalSum = updated.reduce((sum, item) => sum + item.total, 0);

    setFormData((prevForm) => ({
      ...prevForm,
      qualityDeduction: Math.round(totalSum).toString(),
    }));

    return updated;
  });
};

  const updateBagEntry = (bagId: number, field: string, value: string) => {
    setBagTableData((prev) =>
      prev.map((item) =>
        item.bagId === bagId
          ? {
              ...item,
              [field]: field === "weight" ? value : parseFloat(value) || 0,
            }
          : item
      )
    );
  };

  // Function to handle Insert button - save bag data to database
  const handleInsertBagData = async () => {
    if (bagTableData.length === 0) {
      alert("No bag data to insert");
      return;
    }

    const wbId = formData.wbId || editingWbId;
    if (!wbId) {
      alert("Please save the main form first to get WB ID");
      return;
    }

    const wbIdNumber = typeof wbId === "string" ? parseInt(wbId) : wbId;

    try {
      setLoading(true);
      const response = await fetch("/api/deduction/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wbId: wbIdNumber,
          bagTableData: bagTableData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      alert("Deduction data saved successfully!");
      console.log("Deduction data saved:", data);
      setBagTableData([]); // Clear the table after successful insert
      setNextBagId(1); // Reset bag ID counter
    } catch (error) {
      console.error("Error saving deduction data:", error);
      alert("Failed to save deduction data");
    } finally {
      setLoading(false);
    }
  };

  // Function to format numbers with commas (Pakistani style)
  const formatWithCommas = (value: string) => {
    // Remove all non-digit characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, "");

    // Split into integer and decimal parts
    const parts = cleanValue.split(".");
    let integerPart = parts[0];
    const decimalPart = parts[1];

    // Add commas to integer part (Pakistani style: 12,34,567)
    if (integerPart.length > 3) {
      // First, handle the rightmost 3 digits
      const rightPart = integerPart.slice(-3);
      let leftPart = integerPart.slice(0, -3);

      // Add commas every 2 digits from right to left for the remaining part
      const leftPartFormatted = leftPart.replace(/\B(?=(\d{2})+(?!\d))/g, ",");

      integerPart = leftPartFormatted + "," + rightPart;
    }

    // Combine integer and decimal parts
    return decimalPart !== undefined
      ? integerPart + "." + decimalPart
      : integerPart;
  };

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;

      // Prevent editing IGP-fetched fields in online mode when IGP data has been fetched
      // Note: bardanaType is now editable as per requirement
      if (onlineMode && igpDataFetched && !isEditMode) {
        const igpFetchedFields = [
          "vendor",
          "vehicleNo",
          "noOfBags",
          "wtPerBag",
          "igpDate",
        ];
        if (igpFetchedFields.includes(name)) {
          alert("This field cannot be edited after IGP data has been fetched.");
          return;
        }
      }

      // Vehicle number validation removed - allow duplicate vehicle numbers on same day

      const numericFields = [
        "firstWeight",
        "secondWeight",
        "netWeight",
        "bardanaWeight",
        "grossWeight",
        "companyId",
        "branchId",
        "createdBy",
        "lastUpdatedBy",
        "wtPerBag",
        "noOfBags",
      ];

      if (numericFields.includes(name)) {
        // Special handling for freight field to add comma formatting
        if (name === "freight") {
          const formattedValue = formatWithCommas(value);
          setFormData((prev) => ({ ...prev, [name]: formattedValue }));
        } else if (value === "" || /^\d*\.?\d*$/.test(value)) {
          setFormData((prev) => {
            const newData = { ...prev, [name]: value };

            // Auto-calculate bardana weight when wtPerBag or noOfBags changes
            if (name === "wtPerBag" || name === "noOfBags") {
              const wtPerBag =
                parseFloat(name === "wtPerBag" ? value : prev.wtPerBag) || 0;
              const noOfBags =
                parseFloat(name === "noOfBags" ? value : prev.noOfBags) || 0;
              const calculatedBardanaWeight = wtPerBag * noOfBags;
              newData.bardanaWeight =
                calculatedBardanaWeight > 0
                  ? String(calculatedBardanaWeight)
                  : "";
            }

            return newData;
          });
        }
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    },
    [onlineMode, igpDataFetched, isEditMode, formData.bags, formData.wtPerBag]
  );

  const toggleOnlineMode = (isOnline: boolean) => {
    console.log(
      "toggleOnlineMode called with:",
      isOnline,
      "Current onlineMode:",
      onlineMode
    );

    // Update state immediately
    setOnlineMode(isOnline);

    // Update URL to reflect the current mode
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("type", isOnline ? "online" : "offline");
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState({}, "", newUrl);

    // Update form data to reflect the mode change
    setFormData((prev) => ({
      ...prev,
      onlineEntry: isOnline ? "Yes" : "No",
      offlineEntry: isOnline ? "No" : "Yes",
    }));

    console.log("Mode changed to:", isOnline ? "ONLINE" : "OFFLINE");
  };

  // const readLicensePlate = async () => {
  //   setPlateReading(true);
  //   try {
  //     // Get current weight data
  //     const response = await fetch("/api/weight/data");
  //     const weightData = await response.json();

  //     // Update the firstWeight field with current weight reading
  //     setFormData((prev) => ({
  //       ...prev,
  //       firstWeight: weightData.weight,
  //     }));

  //     // Call camera snap manager to capture and read number plate
  //     try {
  //       console.log("Calling camera snap manager for number plate reading...");
  //       const snapResponse = await fetch("/api/cameras/snap-manager", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           wbId: editingWbId || null,
  //         }),
  //       });

  //       const snapResult = await snapResponse.json();
  //       console.log("Camera snap manager response:", snapResult);

  //       if (snapResult.success && snapResult.plateNumber) {
  //         // Update vehicle number in form - ensure it's properly set
  //         const plateNumber = snapResult.plateNumber.trim();
  //         setFormData((prev) => ({
  //           ...prev,
  //           vehicleNo: plateNumber,
  //         }));

  //         console.log("Number plate captured and saved:", plateNumber);

  //         // Show success message with confidence if available
  //         let statusMessage = `Number plate detected: ${plateNumber}`;
  //         if (snapResult.confidence && snapResult.confidence > 0) {
  //           statusMessage += `\nConfidence: ${(snapResult.confidence * 100).toFixed(0)}%`;
  //         }
  //         if (snapResult.method) {
  //           statusMessage += `\nMethod: ${snapResult.method}`;
  //         }

  //         alert(statusMessage);

  //         // Force update the input field if needed
  //         setTimeout(() => {
  //           const vehicleInput = document.querySelector(
  //             'input[name="vehicleNo"]',
  //           ) as HTMLInputElement;
  //           if (vehicleInput) {
  //             vehicleInput.value = plateNumber;
  //             vehicleInput.dispatchEvent(new Event("input", { bubbles: true }));
  //           }
  //         }, 100);
  //       } else {
  //         console.log(
  //           "Plate detection failed:",
  //           snapResult.error || "No plate detected",
  //         );
  //         alert(
  //           `License plate detection failed:\n\nReason: ${snapResult.error || "No valid plate number found in camera view"}\n\nPlease ensure:\n- Vehicle is properly positioned\n- License plate is clearly visible\n- Camera has good lighting\n\nEnter the plate number manually if needed.`,
  //         );
  //       }
  //     } catch (cameraError) {
  //       console.error("Camera snap manager error:", cameraError);

  //       // Generate emergency plate number on frontend error
  //       const now = new Date();
  //       const emergencyPlate = `FE${now.getMinutes().toString().padStart(2, "0")}${now.getSeconds().toString().padStart(2, "0")}`;

  //       setFormData((prev) => ({
  //         ...prev,
  //         vehicleNo: emergencyPlate,
  //       }));

  //       alert(
  //         `Camera system error. Using emergency plate: ${emergencyPlate}\nPlease verify and update if needed.`,
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error fetching weight data:", error);
  //     alert("Failed to capture weight reading");
  //   }
  //   setPlateReading(false);
  // };

  // Function to capture second weight and set slip_out_time
  



  
  // Ultra-optimized data fetching with proper sequencing and caching
  
  
  
  
  useEffect(() => {
    let isMounted = true;

    const loadEssentialData = async () => {
      try {
        // Wake up database first (non-blocking)
        fetch("/api/db/wake").catch(() => {});

        // Load only essential data first
        const branchResponse = await fetch("/api/branches");
        if (branchResponse.ok && isMounted) {
          const branchData = await branchResponse.json();
          setBranches(Array.isArray(branchData) ? branchData : []);
          console.log("Branches fetched:", branchData);

          // Set default branch
          if (
            branchData.length > 0 &&
            (!formData.branchId || formData.branchId === "")
          ) {
            const userBranchId = user?.branchId;
            const defaultBranch = userBranchId
              ? branchData.find((b) => b.branch_id === userBranchId) ||
                branchData[0]
              : branchData[0];
            setFormData((prev) => ({
              ...prev,
              branchId: String(defaultBranch.branch_id),
              branch: String(defaultBranch.branch_id),
              createdBy: String(user?.userid || ""),
            }));
          }
        }

        // Load non-essential data with delays to prevent UI blocking
        setTimeout(async () => {
          if (!isMounted) return;

          try {
            const bardanaResponse = await fetch("/api/bardana-types");
            if (bardanaResponse.ok) {
              const bardanaData = await bardanaResponse.json();
              setBardanaTypes(Array.isArray(bardanaData) ? bardanaData : []);
              console.log("Bardana types loaded:", bardanaData);
            }
          } catch (error) {
            console.error("Error fetching bardana types:", error);
          }
        }, 200);

        setTimeout(async () => {
          if (!isMounted) return;

          try {
            const [entryTypesResponse, invItemsResponse, percentageResponse] =
              await Promise.all([
                fetch("/api/entry-types"),
                fetch("/api/inv-items"),
                fetch("/api/percentage-data"),
              ]);

            if (entryTypesResponse.ok) {
              const entryTypeData = await entryTypesResponse.json();
              setEntryTypes(Array.isArray(entryTypeData) ? entryTypeData : []);
            }

            if (invItemsResponse.ok) {
              const itemsData = await invItemsResponse.json();
              setInvItems(Array.isArray(itemsData) ? itemsData : []);
            }

            if (percentageResponse.ok) {
              const percentageData = await percentageResponse.json();
              setPercentageData(
                Array.isArray(percentageData) ? percentageData : []
              );
            }

            console.log("All data loaded successfully");
          } catch (error) {
            console.error("Error fetching additional data:", error);
          }
        }, 500);
      } catch (error) {
        console.error("Error loading essential data:", error);
      }
    };

    loadEssentialData();

    return () => {
      isMounted = false;
    };
  }, []);

// for item lov
useEffect(() => {
  const handleCtrlLOpen = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();

      if (activeLOV === "item") {
        selectRef.current?.focus();
        selectRef.current?.click();
      } else if (activeLOV === "bardana") {
        bardanaSelectRef.current?.focus();
        bardanaSelectRef.current?.click();
      }
    }
  };

  window.addEventListener("keydown", handleCtrlLOpen);
  return () => window.removeEventListener("keydown", handleCtrlLOpen);
}, [activeLOV]);





//for item lov 
useEffect(() => {
  const handleItemNavigation = (e: KeyboardEvent) => {
    if (!openDropdown || activeLOV !== "item") return;

    if (e.key === "Enter") {
      e.preventDefault();

      const selectedValue = filteredInvItems.find(
        (item) => item.item_code === formData.itemCode
      );

      if (!selectedValue) return;

      const selectedItem = invItems.find(
        (item) => item.item_code === selectedValue.item_code
      );

      setFormData((prev) => ({
        ...prev,
        itemCode: selectedValue.item_code,
        itemDesc: selectedItem?.item_desc || "",
        itemId: selectedItem?.item_id ? String(selectedItem.item_id) : "",
      }));

      setOpenDropdown(false);
    }
  };

  window.addEventListener("keydown", handleItemNavigation);
  return () => window.removeEventListener("keydown", handleItemNavigation);
}, [openDropdown, activeLOV, filteredInvItems, invItems, formData.itemCode]);



  // Update sales data with branch names when branches are loaded and we're in edit mode
  useEffect(() => {
    if (
      branches.length > 0 &&
      isEditMode &&
      formData.branchId &&
      salesData.length > 0
    ) {
      const branchName =
        branches.find(
          (b) => b.branch_id.toString() === formData.branchId?.toString()
        )?.branch_name || "";

      if (branchName && salesData.some((row) => row.branch === "")) {
        setSalesData((prevData) =>
          prevData.map((row) => ({
            ...row,
            branch:
              row.customerName || row.dcNo || row.doNo
                ? branchName
                : row.branch,
          }))
        );
        console.log("Updated sales data with branch names:", branchName);
      }
    }
  }, [branches, isEditMode, formData.branchId, salesData]);




  
  // Handle URL parameters for edit mode and form type
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editWbId = urlParams.get("edit");
    const searchMode = urlParams.get("search");
    const typeMode = urlParams.get("type");

    console.log("URL parameters:", { editWbId, searchMode, typeMode });

    // Set online/offline mode based on type parameter - IMMEDIATE UPDATE
    if (typeMode === "offline") {
      console.log("Setting OFFLINE mode from URL parameter");
      setOnlineMode(false);
    } else if (typeMode === "online") {
      console.log("Setting ONLINE mode from URL parameter");
      setOnlineMode(true);
    }

    // Check if we should be in search mode
    if (searchMode === "true") {
      setIsSearchMode(true);
      setIsEditMode(false);
      setEditingWbId(null);
      setFormData((prev) => ({ ...prev, slipNo: "" }));
      return;
    }

    // Check if we should be in edit mode based on URL parameter
    if (editWbId) {
      // Load record for editing by wb_id
      console.log(
        "Edit mode detected from URL parameter, loading data for wb_id:",
        editWbId
      );
      loadDataByWbId(parseInt(editWbId));
      return; // Exit early to prevent any other initialization
    } else {
      // No edit parameter in URL, reset to new form only if not already in edit mode
      if (isEditMode) {
        console.log(
          "No edit parameter in URL but currently in edit mode, resetting to new form"
        );
        setIsEditMode(false);
        setEditingWbId(null);
        setTimeout(() => {
          resetFormToInitial();
        }, 100);
      } else if (!formData.slipNo || formData.slipNo === "") {
        // Only reset if we don't have form data already
        console.log(
          "No edit parameter and no form data, initializing new form"
        );
        setTimeout(() => {
          resetFormToInitial();
        }, 100);
      }
    }
  }, [location]);

  // Handle page reload detection and edit mode management
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editWbId = urlParams.get("edit");

    // Set a flag when page loads to detect reloads
    const pageLoadTime = Date.now();
    const lastPageLoad = sessionStorage.getItem("purchaseFormPageLoad");
    const wasInEditMode =
      sessionStorage.getItem("purchaseFormEditMode") === "true";

    // Store current page load time
    sessionStorage.setItem("purchaseFormPageLoad", pageLoadTime.toString());

    // If we were in edit mode and this appears to be a page reload (edit param still in URL)
    if (wasInEditMode && editWbId) {
      const timeDiff = lastPageLoad ? pageLoadTime - parseInt(lastPageLoad) : 0;
      // If less than 5 seconds since last page load, likely a reload
      if (timeDiff < 5000) {
        console.log(
          "Page reload detected while in edit mode, clearing edit parameter and resetting to new form"
        );
        // Clear edit parameter from URL
        urlParams.delete("edit");
        const newUrl = urlParams.toString()
          ? `${window.location.pathname}?${urlParams.toString()}`
          : window.location.pathname;
        window.history.replaceState({}, "", newUrl);

        // Clear session storage and reset to new form
        sessionStorage.removeItem("purchaseFormEditMode");
        sessionStorage.removeItem("purchaseFormPageLoad");
        setIsEditMode(false);
        setEditingWbId(null);
        setTimeout(() => {
          resetFormToInitial();
        }, 100);
        return;
      }
    }

    // Check if user navigated to purchase form while in edit mode
    if (!editWbId && wasInEditMode) {
      console.log(
        "Navigation to purchase form detected while in edit mode, clearing edit state"
      );
      sessionStorage.removeItem("purchaseFormEditMode");
      sessionStorage.removeItem("purchaseFormPageLoad");
      setIsEditMode(false);
      setEditingWbId(null);
      resetFormToInitial();
    }
  }, []);

  // Sync form data when onlineMode changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      onlineEntry: onlineMode ? "Yes" : "No",
      offlineEntry: onlineMode ? "No" : "Yes",
    }));
  }, [onlineMode]);

  // Additional effect to handle URL changes for real-time mode switching
  useEffect(() => {
    const handleURLChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const typeMode = urlParams.get("type");

      console.log(
        "URL change detected - typeMode:",
        typeMode,
        "current onlineMode:",
        onlineMode
      );

      if (typeMode === "offline" && onlineMode) {
        console.log("Switching to OFFLINE mode from URL");
        setOnlineMode(false);
      } else if (typeMode === "online" && !onlineMode) {
        console.log("Switching to ONLINE mode from URL");
        setOnlineMode(true);
      } else if (!typeMode && onlineMode === false) {
        // If no type parameter, default to online
        console.log("No type parameter, defaulting to ONLINE mode");
        setOnlineMode(true);
      }
    };

    // Check URL on component mount and location changes
    handleURLChange();
  }, [location]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeMode = urlParams.get("type");

    if (typeMode === "offline") {
      setOnlineMode(false);
    } else if (typeMode === "online") {
      setOnlineMode(true);
    }
  }, [window.location.search]);





useEffect(() => {
    // ✅ Don't fetch if already have slipNo
    if (formData.slipNo) {
        console.log('⚠️ SlipNo already exists, skipping fetch');
        return;
    }

    if (isEditMode || editingWbId || isSearchMode) {
        console.log('📝 Edit/Search mode - skipping fetch');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const editWbId = urlParams.get("edit");
    if (editWbId) {
        return;
    }

    // ✅ Don't fetch if purchase is Null
    if (!formData.purchase || formData.purchase === 'NULL' || formData.purchase === 'Null') {
        console.log('⏳ Purchase type is Null, skipping fetch');
        return;
    }

    console.log(`📌 formData.purchase: "${formData.purchase}"`);

    // Set current time
    const now = new Date().toISOString();
    setFormData((prev) => ({
        ...prev,
        slipInTime: now,
        creationDate: now,
        lastUpdatedDate: now,
        slipDate: now,
    }));

    // ✅ Determine entry_type and pur_reg_type
    let entryType = '';
    let purRegType = '';
    
    if (isReturnMode) {
        entryType = 'PURCHASE_RETURN';
    } else {
        const purchaseValue = formData.purchase?.trim()?.toUpperCase() || '';
        
        if (purchaseValue === 'R') {
            entryType = 'PURCHASE';
            purRegType = 'R';
            console.log('✅ Purchase REGISTER');
        } else if (purchaseValue === 'U') {
            entryType = 'PURCHASE';
            purRegType = 'U';
            console.log('✅ Purchase UNREGISTER');
        } else {
            entryType = 'PURCHASE';
            console.log('✅ Purchase (no type)');
        }
    }

    console.log(`🔍 Final: entryType=${entryType}, purRegType=${purRegType}`);

    const fetchSlipNumber = async (retryCount = 0) => {
        try {
            if (retryCount === 0) {
                fetch("/api/db/wake").catch(() => {});
            }

            // ✅ Build URL with pur_reg_type
            let url = `/api/purchases/next-slip?entry_type=${entryType}`;
            if (purRegType) {
                url += `&pur_reg_type=${purRegType}`;
            }
            
            console.log(`🔍 Fetching from: ${url}`);

            const response = await fetch(url, { 
                signal: AbortSignal.timeout(5000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const slipNo = data.nextSlipNo || "1";
            
            console.log(`✅ Generated Slip No: ${slipNo}`);
            setFormData((prev) => ({ 
                ...prev, 
                slipNo: slipNo 
            }));
            
        } catch (err) {
            console.error('Error fetching slip number:', err);
            
            if (retryCount < 2) {
                setTimeout(() => fetchSlipNumber(retryCount + 1), (retryCount + 1) * 1000);
            } else {
                let fallback;
                if (purRegType === 'R') {
                    fallback = `PR${(Math.floor(Math.random() * 9000) + 1000)}`;
                } else if (purRegType === 'U') {
                    fallback = `PU${(Math.floor(Math.random() * 9000) + 1000)}`;
                } else {
                    fallback = (Math.floor(Math.random() * 9000) + 1000).toString();
                }
                console.log(`⚠️ Using fallback: ${fallback}`);
                setFormData((prev) => ({ 
                    ...prev, 
                    slipNo: fallback 
                }));
            }
        }
    };

    const timer = setTimeout(() => {
        if (!formData.slipNo) {
            console.log(`⏳ Fetching slip number for ${entryType}${purRegType ? ' with pur_reg_type: ' + purRegType : ''}`);
            fetchSlipNumber();
        }
    }, 100);

    return () => clearTimeout(timer);
    
}, [isReturnMode, formData.purchase, isSearchMode, isEditMode, editingWbId]);


const [showOfflineEntries, setShowOfflineEntries] = useState(false);



const resetForm = () => {
  // When Clear button is pressed, clear everything except Slip No
  const currentSlipNo = formData.slipNo;
  setFormData({
    ...initialFormData,
    slipNo: currentSlipNo,
  });
  setIsEditMode(false);
  setEditingWbId(null);
  // Keep current online/offline mode

  // ---- Call the same function logic as Button ----
  if (showOfflineEntries) return; // Disabled state check
  setSelectedForm("purchase"); // Mark as active
  const urlParams = new URLSearchParams(window.location.search);
  const typeMode = urlParams.get("type") || "online";
  const targetUrl = `/purchase-form?type=${typeMode}`;
  sessionStorage.removeItem("purchaseFormEditMode");
  window.location.href = targetUrl;
};





// ✅ Capture First Weight Image - with purchase (purRegType)
const captureFirstWeight = async () => {
  try {
    console.log("🔍 Starting first weight capture...");
    console.log("🔍 FormData:", {
      slipNo: formData.slipNo,
      entryType: formData.entryType,
      purchase: formData.purchase // ✅ purchase se value le rahe hain
    });

    // 1️⃣ Get weight
    const response = await fetch("/api/weight/data");
    const weightData = await response.json();

    setFormData(prev => ({
      ...prev,
      firstWeight: weightData.weight,
    }));

    console.log("✅ First weight captured:", weightData.weight);

    // 2️⃣ Capture image with purchase (purRegType)
    if (formData.slipNo) {
      try {
        const payload = {
          slipNo: formData.slipNo,
          cameraIp: "10.10.10.146",
          cameraPort: 554,
          entryType: formData.entryType || "PURCHASE",
          purRegType: formData.purchase || "R", // ✅ purchase se value
        };
        
        console.log("🔍 Sending capture request:", payload);

        const captureResponse = await fetch("/api/capture/first-weight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (captureResponse.ok) {
          const captureData = await captureResponse.json();
          console.log("✅ Image captured:", captureData);
          alert(`✅ Image captured for slip: ${formData.slipNo} (${formData.purchase || 'R'})`);
        } else {
          const errorData = await captureResponse.json();
          console.error("❌ Backend Error:", errorData);
         // alert(`❌ Failed to capture image: ${errorData.message}`);
        }
      } catch (imageError) {
        console.error("❌ Error capturing image:", imageError);
        // alert("❌ Error capturing image");
      }
    } else {
      console.warn("⚠️ No slip number provided, skipping image capture");
    }
  } catch (error) {
    console.error("❌ Error fetching weight data:", error);
    // alert("Failed to capture first weight reading");
  }
};

// ✅ Capture Second Weight Image - with purchase (purRegType)
const captureSecondWeight = async () => {
  try {
    console.log("🔍 Starting second weight capture...");
    console.log("🔍 FormData:", {
      slipNo: formData.slipNo,
      entryType: formData.entryType,
      purchase: formData.purchase // ✅ purchase se value le rahe hain
    });

    // 1️⃣ Get weight
    const response = await fetch("/api/weight/data");
    const weightData = await response.json();

    setFormData(prev => ({
      ...prev,
      secondWeight: weightData.weight,
    }));

    console.log("✅ Second weight captured:", weightData.weight);

    // 2️⃣ Capture second weight image with purchase (purRegType)
    if (formData.slipNo) {
      try {
        const payload = {
          slipNo: formData.slipNo,
          cameraIp: "10.10.10.146",
          cameraPort: 554,
          entryType: formData.entryType || "PURCHASE",
          purRegType: formData.purchase || "R", // ✅ purchase se value
        };
        
        console.log("🔍 Sending capture request:", payload);

        const captureResponse = await fetch("/api/capture/second-weight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (captureResponse.ok) {
          const captureData = await captureResponse.json();
          console.log("✅ Second weight image captured:", captureData);
          alert(`✅ Second weight image captured for slip: ${formData.slipNo} (${formData.purchase || 'R'})`);
        } else {
          const errorData = await captureResponse.json();
          console.error("❌ Backend Error:", errorData);
          //alert(`❌ Failed to capture image: ${errorData.message}`);
        }
      } catch (imageError) {
        console.error("❌ Error capturing second weight image:", imageError);
       // alert("❌ Error capturing image");
      }
    } else {
      console.warn("⚠️ No slip number provided, skipping image capture");
    }
  } catch (error) {
    console.error("❌ Error fetching weight data:", error);
    // alert("Failed to capture second weight reading");
  }
};

// ==============================
// Auto-calculate weights
const calculateWeights = () => {
  const firstWeight = parseFloat(formData.firstWeight) || 0;
  const secondWeight = parseFloat(formData.secondWeight) || 0;
  const bardanaWeight = parseFloat(formData.bardanaWeight) || 0;
  const supplierWeight = parseFloat(formData.supplierWeight) || 0;
  const qualityDeduction = parseFloat(formData.qualityDeduction) || 0;
  const grossWeight = parseFloat(formData.grossWeight) || 0;

  // ✅ Base net weight (Second Weight - First Weight)
  let baseNetWeight =firstWeight -secondWeight  ;
  
  // ✅ If excBags is checked, subtract bardana weight from net weight
  let netWeightRounded;
  let grossWeightRounded;
  
  if (formData.excBags) {
    netWeightRounded = Math.round(baseNetWeight - bardanaWeight - qualityDeduction);
    grossWeightRounded = Math.round(baseNetWeight - bardanaWeight);
  } else {
    netWeightRounded = Math.round(baseNetWeight - qualityDeduction);
    grossWeightRounded = Math.round(baseNetWeight);
  }

  // ✅ Supplier Weight calculations
  const supplierWeightMinusBardanaRounded = Math.round(supplierWeight - bardanaWeight);
  const supplierWeightMinusOutWeightRounded = Math.round(supplierWeight - (bardanaWeight + grossWeightRounded));

  setFormData((prev) => ({
    ...prev,
    netWeight: netWeightRounded.toString(),
    grossWeight: grossWeightRounded.toString(),
    supplierWeightMinusBardana: supplierWeightMinusBardanaRounded.toString(),
    supplierWeightMinusOutWeight: supplierWeightMinusOutWeightRounded.toString(),
    
    // DB save ke liye numeric values
    netWeightExact: netWeightRounded,
    grossWeightExact: grossWeightRounded,
  }));
};

// ✅ Separate useEffect for Gross W.B.D - Independent of excBags
useEffect(() => {
  const grossWeight = parseFloat(formData.grossWeight) || 0;
  const bardanaWeight = parseFloat(formData.bardanaWeight) || 0;
  const grossWBD = Math.round(grossWeight + bardanaWeight);
  
  setFormData((prev) => ({
    ...prev,
    grossWBD: grossWBD.toString(),
    grossWBDExact: grossWBD,
  }));
}, [formData.grossWeight, formData.bardanaWeight]); // ✅ Only depends on grossWeight and bardanaWeight

// Auto-calculate weights when values change
useEffect(() => {
  calculateWeights();
}, [
  formData.firstWeight,
  formData.secondWeight,
  formData.bardanaWeight,
  formData.supplierWeight,
  formData.qualityDeduction,
  formData.excBags,
  // ✅ Remove formData.grossWeight from here
]);

  
  // Add keyboard event listeners for Ctrl+L and F11
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+L to open LOV of currently focused element
      if (event.ctrlKey && event.key.toLowerCase() === "l") {
        event.preventDefault();

        const activeElement = document.activeElement as HTMLElement;

        if (activeElement) {
          // Check if we're directly on a combobox trigger
          if (activeElement.getAttribute("role") === "combobox") {
            activeElement.click();
            return;
          }

          // Check if we're on an input that's part of a Select component
          const selectTrigger = activeElement.closest(
            '[role="combobox"]'
          ) as HTMLElement;
          if (selectTrigger) {
            selectTrigger.click();
            return;
          }

          // Get input attributes for better targeting
          const inputName = activeElement.getAttribute("name");
          const placeholder =
            activeElement.getAttribute("placeholder")?.toLowerCase() || "";
          const inputId = activeElement.getAttribute("id")?.toLowerCase() || "";

          // Strategy 1: Find LOV in the same container/row/section as the focused input
          const findLOVInContainer = (container: Element) => {
            return container.querySelector('[role="combobox"]') as HTMLElement;
          };

          // Strategy 2: Find LOV by field-specific selectors
          let targetLOV: HTMLElement | null = null;

          // For branch field
          if (
            inputName === "branch" ||
            placeholder.includes("branch") ||
            inputId.includes("branch")
          ) {
            // Look for branch select specifically
            targetLOV =
              (document.querySelector(
                'select[name="branch"] + [role="combobox"]'
              ) as HTMLElement) ||
              (document.querySelector(
                '[data-field="branch"] [role="combobox"]'
              ) as HTMLElement) ||
              findLOVInContainer(
                activeElement.closest(".flex") ||
                  activeElement.closest("div") ||
                  activeElement.parentElement!
              );
          }

          // For bardana/bag type field
          else if (
            inputName === "bardanaType" ||
            placeholder.includes("bardana") ||
            placeholder.includes("bag")
          ) {
            targetLOV =
              (document.querySelector(
                '[name="bardanaType"] + [role="combobox"]'
              ) as HTMLElement) ||
              (document.querySelector(
                '[data-field="bardanaType"] [role="combobox"]'
              ) as HTMLElement) ||
              findLOVInContainer(
                activeElement.closest(".flex") ||
                  activeElement.closest("div") ||
                  activeElement.parentElement!
              );
          }

          // For vendor field
          else if (
            inputName === "vendor" ||
            placeholder.includes("vendor") ||
            placeholder.includes("party")
          ) {
            targetLOV =
              (document.querySelector(
                '[name="vendor"] + [role="combobox"]'
              ) as HTMLElement) ||
              (document.querySelector(
                '[data-field="vendor"] [role="combobox"]'
              ) as HTMLElement) ||
              findLOVInContainer(
                activeElement.closest(".flex") ||
                  activeElement.closest("div") ||
                  activeElement.parentElement!
              );
          }

          // For item description field
          else if (
            inputName === "itemDesc" ||
            placeholder.includes("item") ||
            placeholder.includes("description")
          ) {
            targetLOV =
              (document.querySelector(
                '[name="itemDesc"] + [role="combobox"]'
              ) as HTMLElement) ||
              (document.querySelector(
                '[data-field="itemDesc"] [role="combobox"]'
              ) as HTMLElement) ||
              findLOVInContainer(
                activeElement.closest(".flex") ||
                  activeElement.closest("div") ||
                  activeElement.parentElement!
              );
          }

          // Strategy 3: Look in the immediate parent container
          if (!targetLOV) {
            const parentContainer =
              activeElement.closest(".flex") ||
              activeElement.closest('div[class*="items-center"]') ||
              activeElement.closest('div[class*="gap-"]') ||
              activeElement.parentElement;

            if (parentContainer) {
              targetLOV = findLOVInContainer(parentContainer);
            }
          }

          // Strategy 4: Look for the next/previous sibling that's a combobox
          if (!targetLOV) {
            let sibling = activeElement.nextElementSibling;
            while (sibling && !targetLOV) {
              if (sibling.getAttribute("role") === "combobox") {
                targetLOV = sibling as HTMLElement;
                break;
              }
              targetLOV = sibling.querySelector(
                '[role="combobox"]'
              ) as HTMLElement;
              sibling = sibling.nextElementSibling;
            }

            // Check previous siblings if not found in next siblings
            if (!targetLOV) {
              sibling = activeElement.previousElementSibling;
              while (sibling && !targetLOV) {
                if (sibling.getAttribute("role") === "combobox") {
                  targetLOV = sibling as HTMLElement;
                  break;
                }
                targetLOV = sibling.querySelector(
                  '[role="combobox"]'
                ) as HTMLElement;
                sibling = sibling.previousElementSibling;
              }
            }
          }

          // Strategy 5: Find closest combobox within same row/section (last resort)
          if (!targetLOV) {
            const allComboboxes =
              document.querySelectorAll('[role="combobox"]');
            let closestCombobox: HTMLElement | null = null;
            let minDistance = Infinity;

            allComboboxes.forEach((combo) => {
              const comboElement = combo as HTMLElement;
              const rect1 = activeElement.getBoundingClientRect();
              const rect2 = comboElement.getBoundingClientRect();

              // Calculate distance
              const distance = Math.sqrt(
                Math.pow(rect1.left - rect2.left, 2) +
                  Math.pow(rect1.top - rect2.top, 2)
              );

              // Prefer comboboxes in the same row (similar Y position)
              const sameRow = Math.abs(rect1.top - rect2.top) < 50;
              const adjustedDistance = sameRow ? distance : distance * 2;

              if (adjustedDistance < minDistance && distance < 500) {
                // Within 500px
                minDistance = adjustedDistance;
                closestCombobox = comboElement;
              }
            });

            targetLOV = closestCombobox;
          }

          // Open the target LOV if found
          if (targetLOV) {
            targetLOV.click();
            return;
          }
        }

        console.log(
          "No LOV found for current focus. Please click on a dropdown field first."
        );
      }

      // F11 to open slip search
      if (event.key === "F11") {
        event.preventDefault();
        if (isSearchMode || isEditMode) {
          // If in search mode or edit mode, reset to new form
          resetFormToInitial();
          setIsSearchMode(false);
          setIsEditMode(false);
          setEditingWbId(null);

          // Clear URL parameters and set to new form mode
          const newUrl =
            window.location.pathname +
            "?type=" +
            (onlineMode ? "online" : "offline");
          window.history.replaceState({}, "", newUrl);
        } else {
          // Enter search mode
          const urlParams = new URLSearchParams(window.location.search);
          urlParams.set("search", "true");
          const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
          window.history.replaceState({}, "", newUrl);
          setIsSearchMode(true);
          setFormData((prev) => ({ ...prev, slipNo: "" }));

          // Auto-focus the slip number input after state update
          setTimeout(() => {
            const slipInput = document.querySelector(
              'input[name="slipNo"]'
            ) as HTMLInputElement;
            if (slipInput) {
              slipInput.focus();
              slipInput.select();
            }
          }, 100);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onlineMode, igpDataFetched, isEditMode, isSearchMode]);

  // Optimized vendor data fetching with better conditional loading - fetch all vendors data
  useEffect(() => {
    if (
    
      selectedForm === "purchase" &&
      vendorsData.length === 0
    ) {
      // Use requestIdleCallback for better performance
      const fetchVendorData = async () => {
        try {
          console.log("Fetching all vendor data for offline mode...");

          // Fetch all vendors data from inv_vendors table
          const vendorsResponse = await fetch("/api/vendors");

          if (vendorsResponse.ok) {
            const data = await vendorsResponse.json();
            // Load all vendor data without any limits to show complete database
            const allData = Array.isArray(data) ? data : [];
            setVendorsData(allData);
            console.log(
              "All vendors data loaded:",
              allData.length,
              "items from inv_vendors table"
            );
          }
        } catch (error) {
          console.error("Error fetching vendor data:", error);
          // Set empty array on error to prevent infinite loading
          setVendorsData([]);
        }
      };

      // Use requestIdleCallback if available, otherwise setTimeout
      if (window.requestIdleCallback) {
        window.requestIdleCallback(fetchVendorData);
      } else {
        setTimeout(fetchVendorData, 50);
      }
    }

    // Clear IGP field when switching to offline mode (only if not in edit mode)
    if (!onlineMode && !isEditMode) {
      setFormData((prev) => ({
        ...prev,
        igpNo: "",
      }));
    }
  }, [onlineMode, isEditMode, selectedForm]);

  const saveLock = useRef(false);



// ✅ Fetch purchase data from DB by wbId (for IGP API)
const fetchPurchaseDataForIGP = async (wbId: number) => {
  try {
    const response = await fetch(`/api/purchase/by-wbid/${wbId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch purchase data for wbId: ${wbId}`);
    }
    const data = await response.json();
    return data; // Raw data from DB
  } catch (error: any) {
    console.error("Error fetching purchase data for IGP:", error);
    return null; // Return null if fetch fails
  }
};



  // ✅ Helper: Get PKT formatted string (not UTC)
  const getPKTDateTime = () => {
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" })
    );

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };












  const handleSave = async () => {
    console.log("🟡 handleSave CALLED");
    setLoading(true);



  console.log("🔍 DEBUG - formData.poId:", -  {
    value: formData.poId,
    type: typeof formData.poId,
    isNumber: typeof formData.poId === 'number',
    isString: typeof formData.poId === 'string',
    rawFormData: formData
  });

// Offline → Online conversion: fetch IGP data before saving
let igpIdForSave = formData.igpId;
let fetchedIgpData = null; // Store the complete fetched data

// Offline → Online conversion
if (isEditMode && formData.offlineEntry === "Yes" && formData.igpNo) {
  console.log("🟡 Offline→Online conversion: fetching IGP before save");
  const updatedForm = await fetchIgpData(); // wait for fetch
  
  if (updatedForm?.igpId) {
    igpIdForSave = updatedForm.igpId; // ✅ guaranteed igpId
    fetchedIgpData = updatedForm; // ✅ Store the complete fetched data
    
    console.log("📥 Fetched IGP Data for update:", {
      hasPoId: !!updatedForm.poId,
      poId: updatedForm.poId,
      hasPoNo: !!updatedForm.poNo,
      poNo: updatedForm.poNo,
      fullData: updatedForm
    });
  } else {
    alert("IGP fetch failed, cannot save without IGP ID");
    setLoading(false);
    return;
  }
}

    // Validate first weight
    if (!formData.firstWeight || parseFloat(formData.firstWeight) <= 0) {
      alert("First weight is required and must be greater than 0");
      setLoading(false);
      return;
    }

    if (!formData.vehicleNo || formData.vehicleNo.trim() === "") {
      alert("Vehicle number is required");
      setLoading(false);
      return;
    }


    // Item code validation
if (!formData.itemCode || formData.itemCode.trim() === "") {
  alert("Item code is required");
  setLoading(false);
  return;
}


    // Determine entry type
    let currentEntryType = "PURCHASE";
    if (selectedForm === "sales") {
      currentEntryType = isReturnMode ? "SALE_RETURN" : "SALE";
    } else {
      currentEntryType = isReturnMode ? "PURCHASE_RETURN" : "PURCHASE";
    }

    // Check if record already exists   (code changes for duplicate slip issue)
  let existingRecord = null;

if (isEditMode && editingWbId) {
  try {
    const checkResponse = await fetch(
      `/api/purchase/by-wbid/${editingWbId}`
    );

    if (checkResponse.ok) {
      existingRecord = await checkResponse.json();
      console.log("Found existing record by WB ID:", existingRecord);
    }
  } catch (error) {
    console.log("No existing record found for wb_id:", editingWbId);
  }
}

    // Time handling
    let slipInTime = formData.slipInTime || getPKTDateTime();
    let slipOutTime = formData.slipOutTime || "";

    if (existingRecord) {
      slipInTime = formData.slipInTime || slipInTime;
      if (formData.secondWeight) {
        slipOutTime = getPKTDateTime();
      }
    } else {
      if (formData.secondWeight && !slipOutTime) {
        slipOutTime = getPKTDateTime();
      }
    }

    // ✅ Payload with PKT dates
   const masterPayload = {
      slip_no: formData.slipNo || null,
      slip_in_time: slipInTime || null,
      first_weight: formData.firstWeight
        ? parseFloat(formData.firstWeight)
        : null,
      second_weight: formData.secondWeight
        ? parseFloat(formData.secondWeight)
        : null,
      net_weight: formData.netWeight ? parseFloat(formData.netWeight) : null,
      bardana_weight: Math.round(Number(formData.bardanaWeight)) || null,
      gross_weight: formData.grossWeight
        ? parseFloat(formData.grossWeight)
        : null,
      freight: formData.freight ? parseFloat(formData.freight) : null,
      remarks: formData.remarks || null,
      driver_name: formData.driverName || null,
      company_id: formData.companyId ? parseInt(formData.companyId, 10) : null,
      branch_id: formData.branchId ? parseInt(formData.branchId, 10) : null,
      online_entry: onlineMode ? "Yes" : null,
      offline_entry: onlineMode ? null : "Yes",
      igp_id: igpIdForSave, // ✅ always use the guaranteed igpId
      created_by: user?.userid ? parseInt(user.userid.toString()) : null,
      creation_date: getPKTDateTime(),
      last_updated_by: user?.userid || null,
      last_updated_date: getPKTDateTime(),
      manual_dc_no: formData.manualDcNo || null,
      entry_type: currentEntryType,
      slip_out_time: slipOutTime || null,
      status: onlineMode ? "ONLINE" : "OFFLINE",
      slip_date: getPKTDateTime(),
      
      // ✅ NEW FIELDS ADDED
      pur_reg_type: formData.purchase === "R" ? "R" : 
                    formData.purchase === "U" ? "U" : "Null",
      gross_wbd: (parseFloat(formData.grossWeight) || 0) + (parseFloat(formData.bardanaWeight) || 0),
      supplier_weight: formData.supplierWeight ? parseFloat(formData.supplierWeight) : null,
      quality_deduction: formData.qualityDeduction ? parseFloat(formData.qualityDeduction) : null,
      exc_bags: formData.excBags ? 1 : 0,

         bardana_bag: formData.excBags ? 'Y' : 'N', // ✅ Direct ternary operator
    };

    console.log("📦 Payload sending to API:", masterPayload);

    try {
      let masterResponse: any;
      let savedWbId: number = 0;

      // If we found an existing record or we're in edit mode, update it (code changes for slip no issue)
     if (isEditMode && editingWbId) {
        const updateWbId =
          existingRecord && existingRecord.master
            ? existingRecord.master.wb_id
            : editingWbId;

        if (!updateWbId) {
          throw new Error("No valid wb_id found for update operation");
        }

        // Handle online/offline status updates properly
        if (isEditMode && updateWbId) {
          console.log(
            "Updating online/offline status - onlineMode:",
            onlineMode
          );
        }

        console.log("Updating record with wb_id:", updateWbId);
        console.log("Edit mode:", isEditMode, "editingWbId:", editingWbId);


// Determine which data to use - fetched IGP data has priority
const effectivePoNo = fetchedIgpData?.poNo || formData.poNo;
const effectivePoId = fetchedIgpData?.poId || formData.poId;
const effectiveItemId = fetchedIgpData?.itemId || formData.itemId;


console.log("📝 Final PO Data for save:", {
  effectivePoNo,
  effectivePoId,
  source: fetchedIgpData ? "Fetched IGP" : "Form Data"
});



      const updatePayload = {
  ...masterPayload,

  vehicle_no: formData.vehicleNo || null,
  vendor_name: formData.vendor || null,
  vendor_id: formData.vendorId ? Number(formData.vendorId) : null,
  po_no: effectivePoNo || null,
  po_id: effectivePoId ? Number(effectivePoId) : null,

  igp_no: formData.igpNo || null,
  item_code: formData.itemCode || null,
  item_desc: formData.itemDesc || null,
  item_id: effectiveItemId ? Number(effectiveItemId) : null,
  
  po_qty: formData.poQty &&
    formData.poQty !== "undefined" &&
    formData.poQty.trim() !== ""
    ? parseFloat(formData.poQty)
    : null,
    
  igp_qty: formData.igpQty &&
    formData.igpQty !== "undefined" &&
    formData.igpQty.trim() !== ""
    ? parseFloat(formData.igpQty)
    : null,
    
  balance_qty: formData.balanceQty &&
    formData.balanceQty !== "undefined" &&
    formData.balanceQty.trim() !== ""
    ? parseFloat(formData.balanceQty)
    : null,
    
  igp_date: formData.igpDate || null,
  igp_id: igpIdForSave,
  
  weight_per_bags: formData.wtPerBag &&
    formData.wtPerBag !== "undefined" &&
    formData.wtPerBag.trim() !== ""
    ? parseFloat(formData.wtPerBag)
    : null,
    
  no_of_bags: formData.noOfBags &&
    formData.noOfBags !== "undefined" &&
    formData.noOfBags.trim() !== ""
    ? parseInt(formData.noOfBags)
    : null,
    
  bardana_type: formData.bardanaType || null,

  supplier_weight: formData.supplierWeight !== undefined &&
    formData.supplierWeight !== null &&
    formData.supplierWeight !== "" &&
    formData.supplierWeight !== "undefined"
    ? parseFloat(formData.supplierWeight)
    : null,

  quality_deduction: formData.qualityDeduction !== undefined &&
    formData.qualityDeduction !== null &&
    formData.qualityDeduction !== "" &&
    formData.qualityDeduction !== "undefined"
    ? parseFloat(formData.qualityDeduction)
    : null,

  second_weight_by: user?.userid ? parseInt(user.userid.toString()) : null,
  
  // ⭐ DETAILS TABLE FIELD - Frontend 'igpCheckbox' saves to database 'con' column
  con: formData.igpCheckbox ? 'Y' : 'N',  // ✅ Save to 'con' column
};

        // ... existing code before the fetch call

        console.log("Update payload being sent:", updatePayload);

        // --- First API Call: Update Purchase ---

        // update ki main api hai jo lagi hui hamza
        masterResponse = await fetch(`/api/purchase/update/${updateWbId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        });

        savedWbId = updateWbId;

        // Check if the first API call was successful
        if (masterResponse.ok) {
          console.log(
            "First API call to /api/purchase/update/ was successful. Initiating second API call."

            
          );
            setFormData(prev => ({
    ...prev,
    isFirstWeightSaved: !!formData.firstWeight,
  }));

    setFormData(prev => ({
    ...prev,
    isSecondWeightSaved: !!formData.secondWeight,
  }));

          /// ✅ Parse date from DB or ISO input safely (handles all cases)
          const parseDateTimePKT = (
            value: string | null | undefined
          ): Date | null => {
            if (!value) return null;

            // 1️⃣ Handle DB format "YYYY-MM-DD HH:mm:ss"
            const dbRegex = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
            const dbMatch = value.match(dbRegex);
            if (dbMatch) {
              const [, year, month, day, hour, minute, second] = dbMatch;
              return new Date(
                Number(year),
                Number(month) - 1,
                Number(day),
                Number(hour),
                Number(minute),
                Number(second)
              );
            }

            // 2️⃣ Handle ISO UTC format "YYYY-MM-DDTHH:mm:ss.000Z"
            if (value.includes("T")) {
              // Convert UTC → Pakistan time (Asia/Karachi)
              const utcDate = new Date(value);
              const pktString = utcDate.toLocaleString("en-US", {
                timeZone: "Asia/Karachi",
              });
              return new Date(pktString);
            }

            // 3️⃣ Handle edit-mode "MM/DD/YYYY hh:mm:ss AM/PM"
            const ampmRegex =
              /(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2}) (AM|PM)/i;
            const match = value.match(ampmRegex);
            if (match) {
              let [, month, day, year, hour, minute, second, ampm] = match;
              const h = Number(hour);
              const finalHour =
                ampm.toUpperCase() === "PM" && h < 12
                  ? h + 12
                  : ampm.toUpperCase() === "AM" && h === 12
                  ? 0
                  : h;
              return new Date(
                Number(year),
                Number(month) - 1,
                Number(day),
                finalHour,
                Number(minute),
                Number(second)
              );
            }

            // 4️⃣ fallback
            const d = new Date(value);
            return isNaN(d.getTime()) ? null : d;
          };

          // ✅ Format into Oracle-compatible "DD-MON-YY HH24:MI:SS"
          const formatToOracleDateTimePKT = (
            value: string | null | undefined
          ): string | null => {
            const dateObj = parseDateTimePKT(value);
            if (!dateObj) {
              console.warn("⚠️ No valid date parsed for:", value);
              return null;
            }

            // Force conversion to PKT timezone before formatting
            const pktDate = new Date(
              dateObj.toLocaleString("en-US", { timeZone: "Asia/Karachi" })
            );

            const day = String(pktDate.getDate()).padStart(2, "0");
            const month = pktDate
              .toLocaleString("en-US", { month: "short" })
              .toUpperCase();
            const year = String(pktDate.getFullYear()).slice(-2);
            const hours = String(pktDate.getHours()).padStart(2, "0");
            const minutes = String(pktDate.getMinutes()).padStart(2, "0");
            const seconds = String(pktDate.getSeconds()).padStart(2, "0");

            const result = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
            console.log("🕒 Oracle Format:", result, "| Input:", value);
            return result;
          };

          // ✅ Safely convert numbers
          const safeNumber = (value: any): number => {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? 0 : parsed;
          };

         // ✅ Call IGP API after 2nd weight (edit mode)
// 🔥 DEBUG – check values first
console.log("🔥 Edit Mode Trigger Check", {
  isEditMode,
  onlineEntry: formData.onlineEntry,
  onlineMode,
  secondWeight: formData.secondWeight,
  savedWbId,
  wbIdFromForm: formData.wbId
});


//  // Right before making the API call, add this:
//   console.log("🔍 DEBUG - updatePayload po_id check:", {
//     updatePayloadPoId: updatePayload?.po_id,
//     updatePayloadPoIdType: typeof updatePayload?.po_id,
//     updatePayloadJSON: JSON.stringify(updatePayload, null, 2)
//   });


if (isEditMode && onlineMode) {

  console.log("📡 Preparing to call IGP API for edit mode (2nd weight)...");

  (async () => {
    try {
      // ✅ wbId safe handling
      const wbId = Number(savedWbId ?? formData.wbId);
      if (!wbId || isNaN(wbId)) {
        console.error("❌ Invalid wbId, skipping IGP API call (edit mode).", {
          savedWbId,
          formDataWbId: formData.wbId,
        });
        return;
      }
      console.log("✅ wbId confirmed for IGP:", wbId);

      // 🔹 Step 1: Fetch fresh updated DB data
      const dbData = await fetchPurchaseDataForIGP(wbId);

      if (!dbData) {
        console.error("❌ DB data not available for IGP API call (edit mode).");
        return;
      }

      console.log(
        "📤 IGP API JSON BODY (edit mode, after 2nd weight):",
        JSON.stringify(dbData, null, 2)
      );

      // 🔹 Step 2: Call IGP API
      const igpResp = await fetch(
        "http://portal.sabirsgroup.com:8184/ords/sabroso_ords/wb-om/wb-update-on-igp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dbData),
        }
      );

      const rawText = await igpResp.text();
      console.log("🧾 Raw IGP API response (edit mode):", rawText);

      let igpData;
      try {
        igpData = JSON.parse(rawText);
      } catch {
        console.error("❌ IGP API did not return JSON (edit mode).");
        alert("❌ API response invalid (not JSON)");
        return;
      }

      if (
        igpResp.ok &&
        (igpData.status?.toLowerCase() === "success" ||
          Array.isArray(igpData.items))
      ) {
        console.log("✅ PURCHASE IGP Data Uploaded Successfully (edit mode)", igpData);

        // ✅ SUCCESS POPUP
      //  alert("✅ Edit Mode: Data successfully updated!");
      } else {
        console.error("❌ PURCHASE IGP Upload Failed (edit mode)", igpData);

        // ❌ ERROR POPUP
        alert(
          "❌ Edit Mode: Data update failed!\n" +
          (igpData?.message || "Missing values or API error")
        );
      }
    } catch (err) {
      console.error("🛑 PURCHASE IGP API Error (edit mode):", err);

      const message =
        err instanceof Error ? err.message : "Unknown error occurred";

      // ❌ NETWORK / EXCEPTION POPUP
      alert("🛑 Edit Mode API Error: " + message);
    }
  })();
}


        }

        // ... existing code after the fetch call

        // Auto print slip after slight delay
      setTimeout(async () => {
  try {
    // ✅ Use unified form-report API instead of purchase/by-wbid
    const slipResponse = await fetch(`/api/form-report/${savedWbId}`);
    if (!slipResponse.ok) throw new Error("Failed to fetch purchase slip");
    
    const slipData = await slipResponse.json();
    
    // ✅ Check if API returned success
    if (!slipData.success) {
      throw new Error(slipData.message || "API returned error");
    }
    
    // ✅ Extract data from the correct structure
    const reportData = slipData.data;
    
    // ✅ Build master object (matches what autoPrintSlip expects)
    const master = {
      wb_id: reportData.wb_id,
      vehicle_no: reportData.vehicle_no || "-",
      slip_in_time: reportData.slip_in_time,
      entry_type: reportData.entry_type,
      first_weight: reportData.first_weight,
      second_weight: reportData.second_weight,
      net_weight: reportData.net_weight,
      created_by_name: reportData.created_by_name,
      second_weight_by_name: reportData.second_weight_by_name,
      has_second_weight: reportData.has_second_weight,
      // Include all other fields from API
      ...reportData
    };
    
    // ✅ Get details array
    const details = Array.isArray(reportData.details) ? reportData.details : [];
    
    // ✅ Call autoPrintSlip with unified data
    autoPrintSlip(
      master,
      details,
      user?.userName || "admin"
    );
    
  } catch (err) {
    console.error("Error fetching slip for auto-print:", err);
  }
}, 1000);

        // Set edit mode if updating existing record found by slip number
        if (existingRecord && !isEditMode) {
          setIsEditMode(true);
          setEditingWbId(existingRecord.wb_id);
        }
      } else {
        // Create new record
        masterResponse = await fetch("/api/purchases", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(masterPayload),
        });
      }

      if (!masterResponse.ok) {
        const errorData = await masterResponse.json().catch(() => ({}));
        const errorMessage =
          errorData.details ||
          errorData.error ||
          `HTTP error! status: ${masterResponse.status}`;
        console.error("Server error response:", errorData);
        throw new Error(errorMessage);
      }

      const masterData = await masterResponse.json();
      console.log("Master purchase saved/updated:", masterData);

      // Get the WB_ID from saved master data for new records
      if (!isEditMode) {
        savedWbId = masterData.wb_id;
      } else if (editingWbId) {
        savedWbId = editingWbId;
      } else {
        savedWbId = masterData.wb_id || 0;
      }

      // For Sales entries, save sales data to details table using standard purchase items API
      if (selectedForm === "sales") {
        // Filter valid sales rows (at least one field filled)
        const validSalesRows = salesData.filter(
          (row) =>
            row.customerName ||
            row.vehicleNo ||
            row.itemDescription ||
            row.dcNo ||
            row.doNo
        );

        if (validSalesRows.length > 0) {
          try {
            // Save each sales row as separate items using the standard purchase items API
            for (const row of validSalesRows) {
              const salesItemPayload = {
                wb_id: savedWbId,
                baradana_type: null,
                igp_no: row.dcNo || null, // Map DC # to igp_no field
                vehicle_no: row.vehicleNo || null,
                weight_per_bags: null,
                igp_date: null,
                supplier_weight:
                  formData.supplierWeight !== undefined &&
                  formData.supplierWeight !== null &&
                  formData.supplierWeight !== "" &&
                  formData.supplierWeight !== "undefined"
                    ? parseFloat(formData.supplierWeight)
                    : null,

                quality_deduction:
                  formData.qualityDeduction !== undefined &&
                  formData.qualityDeduction !== null &&
                  formData.qualityDeduction !== "" &&
                  formData.qualityDeduction !== "undefined"
                    ? parseFloat(formData.qualityDeduction)
                    : null,

                no_of_bags: null,
                vendor_name: row.customerName || null, // Map Customer Name to vendor_name field
                bag_condition: null,
                po_no: row.doNo || null, // Map DO # to po_no field
               po_id:
  formData.poId != null // null ya undefined check
    ? Number(formData.poId) // convert to number just in case
    : null,

                item_code: null,
                item_desc: row.itemDescription || null,
                po_qty: row.doQty ? parseFloat(row.doQty) : null, // Map DO Qty to po_qty
                igp_qty: row.dcQty ? parseFloat(row.dcQty) : null, // Map DC Qty to igp_qty
                balance_qty: null,
                customer_name: row.customerName || null, // Additional customer_name field
                do_no: row.doNo || null, // Additional do_no field
                do_qty: row.doQty ? parseFloat(row.doQty) : null, // Additional do_qty field
                dc_qty: row.dcQty ? parseFloat(row.dcQty) : null, // Map DC Qty to dc_qty field
              };

              const salesItemResponse = await fetch("/api/purchase-items", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(salesItemPayload),
              });

              if (salesItemResponse.ok) {
                console.log("Sales item saved to Details table:", row);
              } else {
                console.error(
                  "Failed to save sales item to Details table:",
                  row
                );
              }
            }
            console.log(
              "All sales detail data saved successfully to Details table"
            );
          } catch (salesError) {
            console.error("Error saving sales detail data:", salesError);
          }
        }
      } else {
        const offlineToOnlineConversion =
          isEditMode && formData.offlineEntry === "Yes";

        // Only save items data for new Purchase entries (not for updates)
        if (
          (!isEditMode && !existingRecord) ||
          (offlineToOnlineConversion && !existingRecord)
        ) {
          const firstIgpItem: any = igpItems.length > 0 ? igpItems[0] : {};

          const igpIdForSave = formData.igpId
            ? parseInt(formData.igpId)
            : firstIgpItem?.igp_id
            ? parseInt(firstIgpItem.igp_id)
            : null;


            
const itemsPayload = {
  wb_id: savedWbId!,

  // ✅ Bardana fields
  bardana_type: formData.bardanaType || null,
  bardana_type_id: formData.bardanaTypeId || null,
  
  branch_id: formData.branchId &&
    formData.branchId !== "undefined" &&
    formData.branchId.trim() !== ""
    ? parseInt(formData.branchId, 10)
    : null,
  igp_no: formData.igpNo || null,
  vehicle_no: formData.vehicleNo || null,
  weight_per_bags: formData.wtPerBag
    ? parseFloat(formData.wtPerBag)
    : null,
  igp_date: formData.igpDate || null,
  supplier_weight: formData.supplierWeight
    ? parseFloat(formData.supplierWeight)
    : null,

  sup_weight_wthout_bardana: formData.supplierWeightMinusBardana
    ? (formData.supplierWeightMinusBardana)
    : null,

  net_supplier_weight: formData.supplierWeightMinusOutWeight
    ? parseFloat(formData.supplierWeightMinusOutWeight)
    : null,

  quality_deduction: formData.qualityDeduction
    ? parseFloat(formData.qualityDeduction)
    : null,

  bardana_weight: Math.round(Number(formData.bardanaWeight)),

  no_of_bags: formData.noOfBags ? parseInt(formData.noOfBags) : null,

  vendor_id: firstIgpItem?.vendor_id ||
    formData.vendorId ||
    null,
  vendor_name: firstIgpItem?.vendor_name || formData.vendor || null,

  bag_condition: formData.bagCondition || null,

  po_id: firstIgpItem?.po_id 
    ? Number(firstIgpItem.po_id)
    : formData.poId != null 
      ? Number(formData.poId)
      : null,

  po_no: firstIgpItem?.po_no || formData.poNo || null,

  item_code: firstIgpItem?.item_code || formData.itemCode || null,
  item_desc: firstIgpItem?.item_desc || formData.itemDesc || null,
  created_by: user?.userid ? parseInt(user.userid.toString()) : null,
  last_updated_by: user?.userid || null,
  po_qty: firstIgpItem?.po_qty
    ? parseFloat(firstIgpItem.po_qty)
    : formData.poQty
    ? parseFloat(formData.poQty)
    : null,
  igp_qty: firstIgpItem?.igp_qty
    ? parseFloat(firstIgpItem.igp_qty)
    : formData.igpQty
    ? parseFloat(formData.igpQty)
    : null,
  balance_qty: firstIgpItem?.balance_qty
    ? parseFloat(firstIgpItem.balance_qty)
    : formData.balanceQty
    ? parseFloat(formData.balanceQty)
    : null,
  dc_qty: firstIgpItem?.dc_qty
    ? parseFloat(firstIgpItem.dc_qty)
    : null,

  igp_id: igpIdForSave,
  item_id: firstIgpItem?.item_id
    ? parseInt(firstIgpItem.item_id)
    : formData.itemId
    ? parseInt(formData.itemId)
    : null,
  freight_child: formData.freight ? parseFloat(formData.freight) : null,

  // ⭐ DETAILS TABLE FIELD - Frontend 'igpCheckbox' saves to database 'con' column
  con: formData.igpCheckbox ? 'Y' : 'N',  // ✅ Save to 'con' column
};


          console.log("Items payload being sent:", itemsPayload);

          // Save items data for Purchase entries
          const itemsResponse = await fetch("/api/purchase-items", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(itemsPayload),
          });

          if (!itemsResponse.ok) {
            console.error("Failed to save purchase items");
          }

// ✅ Call IGP API for Purchase only if online entry and new entry
if (!isEditMode && onlineMode === true) {
  console.log("📡 Preparing to call IGP API for new Purchase entry...");

  // 🕐 Delay to ensure DB has committed the data
  setTimeout(async () => {
    // ✅ Prefer savedWbId (from DB), fallback to formData.wbId
    const wbIdToUse = Number(savedWbId || formData.wbId);

    if (!wbIdToUse || wbIdToUse === 0) {
      console.error("❌ Invalid wbId — cannot call IGP API. wbId:", wbIdToUse);
      return;
    }

    console.log("🔍 Using wbId for PURCHASE IGP API:", wbIdToUse);

    try {
      // ✅ Fetch data from DB using wbId
      const dbData = await fetchPurchaseDataForIGP(wbIdToUse);
      if (!dbData) {
        console.error("❌ DB data not available for PURCHASE IGP API call. wbId:", wbIdToUse);
        return;
      }

      console.log("✅ Purchase DB data fetched successfully:", dbData);
      console.log("📥 DB data fetched for PURCHASE IGP API (after save):", dbData);

      // ✅ Prepare IGP API endpoint
      const IGP_API_URL =
        "http://portal.sabirsgroup.com:8184/ords/sabroso_ords/wb-om/wb-update-on-igp";

      // 🧾 Detailed payload preview before sending
      console.log("🌐 Sending PURCHASE IGP payload to API:", IGP_API_URL);
      console.log("📦 PURCHASE Payload being sent:", JSON.stringify(dbData, null, 2));

      // 🔥 Send to IGP API
      const igpResp = await fetch(IGP_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbData),
      });

      const rawText = await igpResp.text();
      console.log("🧾 Raw PURCHASE IGP API response:", rawText);

      let igpData;
      try {
        igpData = JSON.parse(rawText);
      } catch {
        console.warn("⚠️ PURCHASE IGP API did not return JSON. Raw response logged above.");
        return;
      }

    if (
  igpResp.ok &&
  (igpData.status?.toLowerCase() === "success" || Array.isArray(igpData.items))
) {
  console.log("✅ PURCHASE IGP Data Uploaded Successfully. Response:", igpData);

  // ✅ SUCCESS POPUP
 // alert("✅ Data successfully saved!");
} else {
  console.error("❌ PURCHASE IGP Upload Failed. Response:", igpData);

  // ❌ ERROR POPUP
  alert(
    "❌ Data save failed!\n" +
    (igpData?.message || "Missing values or API error")
  );
}
} catch (err) {
  console.error("🛑 PURCHASE IGP API Error:", err);

  const message =
    err instanceof Error ? err.message : "Unknown error occurred";

  // ❌ NETWORK / EXCEPTION POPUP
  alert("🛑 API Error: " + message);
}
}, 1500); // 🕐 Delay 1.5 seconds for DB save
} else {
  console.log("⚙️ Skipping PURCHASE IGP API — either offline or edit mode");
}



          // ------------------------------------------------------------------

          // ✅ Auto slip generate for Purchase (same as Sale/Sale Return)
        if (savedWbId) {
  setTimeout(async () => {
    try {
      // ✅ Use the SAME unified API (form-report) instead of purchase/by-wbid
      const slipResponse = await fetch(`/api/form-report/${savedWbId}`);
      if (!slipResponse.ok) throw new Error("Failed to fetch purchase slip");

      const slipData = await slipResponse.json();
      
      // ✅ Check if API returned success
      if (!slipData.success) {
        throw new Error(slipData.message || "API returned error");
      }
      
      // ✅ Extract data from the correct structure
      const reportData = slipData.data;
      
      // ✅ Build master object from report data (same structure as your autoPrintSlip expects)
      const master = {
        wb_id: reportData.wb_id,
        vehicle_no: reportData.vehicle_no || "-",
        slip_in_time: reportData.slip_in_time || slipInTime || getPKTDateTime(),
        entry_type: reportData.entry_type,
        first_weight: reportData.first_weight,
        second_weight: reportData.second_weight,
        net_weight: reportData.net_weight,
        created_by_name: reportData.created_by_name,
        second_weight_by_name: reportData.second_weight_by_name,
        has_second_weight: reportData.has_second_weight,
        // Include all other fields from reportData
        ...reportData
      };
      
      // ✅ Get details array
      const details = Array.isArray(reportData.details) ? reportData.details : [];

      // ✅ Call autoPrintSlip with the unified data structure
      autoPrintSlip(
        master,
        details,
        user?.userName || "admin"
      );
      
    } catch (err) {
      console.error("Error fetching purchase slip for auto-print:", err);
    }
  }, 1000);
}
        }
      }

      // Automatically capture first weight image (only for new entries with first weight but no second weight)
      // if (formData.firstWeight && !formData.secondWeight) {
      //   try {
      //     console.log(
      //       "Capturing first weight image for slip:",
      //       formData.slipNo
      //     );
      //     const captureResponse = await fetch("/api/capture/first-weight", {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json",
      //       },
      //       body: JSON.stringify({
      //         slipNo: formData.slipNo,
      //         cameraIp: "10.10.10.146",
      //         cameraPort: 554,
      //         entryType: formData.entryType || "PURCHASE", // Add this line
      //       }),
      //     });

      //     if (captureResponse.ok) {
      //       const captureData = await captureResponse.json();
      //       console.log(
      //         "First weight image captured successfully:",
      //         captureData.message
      //       );
      //     } else {
      //       console.log(
      //         "First weight image capture failed, but continuing with form submission"
      //       );
      //     }
      //   } catch (imageError) {
      //     console.log(
      //       "First weight image capture error, but continuing:",
      //       imageError
      //     );
      //   }
      // }

      // // Automatically capture second weight image when both weights are present
      // if (formData.firstWeight && formData.secondWeight) {
      //   try {
      //     console.log(
      //       "Capturing second weight image for slip:",
      //       formData.slipNo
      //     );
      //     const captureResponse = await fetch("/api/capture/second-weight", {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json",
      //       },
      //       body: JSON.stringify({
      //         slipNo: formData.slipNo,
      //         cameraIp: "10.10.10.146",
      //         cameraPort: 554,
      //         entryType: formData.entryType || "PURCHASE", // Add this line
      //       }),
      //     });

      //     if (captureResponse.ok) {
      //       const captureData = await captureResponse.json();
      //       console.log(
      //         "Second weight image captured successfully:",
      //         captureData.message
      //       );
      //     } else {
      //       console.log(
      //         "Second weight image capture failed, but continuing with form submission"
      //       );
      //     }
      //   } catch (imageError) {
      //     console.log(
      //       "Second weight image capture error, but continuing:",
      //       imageError
      //     );
      //   }
      // }

      // Save bag data to deduction table if available
      if (bagTableData.length > 0) {
        try {
          console.log("Saving deduction data for wb_id:", savedWbId);
          const deductionResponse = await fetch("/api/deduction/save", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              wbId: savedWbId!,
              bagTableData: bagTableData,
            }),
          });

          if (deductionResponse.ok) {
            console.log("Deduction data saved successfully to database");
          } else {
            const errorText = await deductionResponse.text();
            console.error("Failed to save deduction data:", errorText);
            alert("Warning: Main data saved but deduction data failed to save");
          }
        } catch (bagError) {
          console.error("Error saving deduction data:", bagError);
          alert("Warning: Main data saved but deduction data failed to save");
        }
      }

      // Save sales data when active tab is sale
      if (activeTab === "sale" && salesData.length > 0) {
        try {
          const validSalesData = salesData.filter(
            (item) =>
              item.doNo ||
              item.customerName ||
              item.vehicleNo ||
              item.itemDescription ||
              item.dcNo
          );

          if (validSalesData.length > 0) {
            console.log("Saving sales data to details table:", validSalesData);

            const salesPayload = {
              salesData: validSalesData.map((item) => ({
                wbId: savedWbId!,
                doId: item.doId || null,
                dcNo: item.dcNo || null,
                doNo: item.doNo || null,
                customerName: item.customerName || null,
                vehicleNo: item.vehicleNo || null,
                doDate: null, // As requested - null for now
                itemDescription: item.itemDescription || null,
                dcQty: item.dcQty ? parseFloat(item.dcQty) : null,
                doQty: item.doQty ? parseFloat(item.doQty) : null,
                branch: item.branch || null,
              })),
              entryType: "SALE",
            };

            const salesResponse = await fetch("/api/sales/save", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(salesPayload),
            });

            if (salesResponse.ok) {
              console.log("Sales detail data saved successfully to database");
            } else {
              const errorText = await salesResponse.text();
              console.error("Failed to save sales detail data:", errorText);
              alert(
                "Warning: Main data saved but sales detail data failed to save"
              );
            }
          }
        } catch (salesError) {
          console.error("Error saving sales data:", salesError);
          alert("Warning: Main data saved but sales data failed to save");
        }
      }

      // // Add real-time updates to display table by invalidating queries after successful save
      // console.log("Sales data saved successfully");
      // alert(
      //   isEditMode
      //     ? "Record updated successfully!"
      //     : "Record saved successfully!",
      // );

      // Invalidate queries to refresh display table immediately
      await queryClient.invalidateQueries({
        queryKey: ["/api/purchase/first-weight-records"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["/api/purchases/offline"],
      });
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save purchase.";
      alert(errorMessage);
      console.error("Save error:", err);
    } finally {
      setLoading(false);
    }

    // Increment slip number for next entry
    const currentSlipNo = parseInt(formData.slipNo);
    const nextSlipNo = (currentSlipNo + 1).toString();

function autoPrintSlip(
  masterData: any,
  salesData: any[],
  currentUserName: string

) {
  // ✅ Helper function to convert string to number
  const toNumber = (value: any): number | null => {
    if (!value) return null;
    const num = typeof value === 'string' ? parseInt(value, 10) : value;
    return isNaN(num) ? null : num;
  };

  // ✅ API se fresh data fetch karne ka function
  const fetchAndPrintReport = async (wbId: number) => {
    try {
      const response = await fetch(`/api/form-report/${wbId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        generateAndPrintReport(result.data);
      } else {
        console.warn("API fetch failed, using local data");
        generateAndPrintReport({
          ...masterData,
          ...(salesData[0] || {}),
          slip_no: formData.slipNo,
          vehicle_no: formData.vehicleNo,
          item_desc: formData.itemDesc,
          no_of_bags: formData.noOfBags,
          first_weight: formData.firstWeight,
          second_weight: formData.secondWeight,
          net_weight: formData.netWeight,
          created_by_name: formData.created_by_name || currentUserName,
          second_weight_by_name: formData.second_weight_by_name || currentUserName
        });
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      generateAndPrintReport({
        ...masterData,
        ...(salesData[0] || {}),
        slip_no: formData.slipNo,
        vehicle_no: formData.vehicleNo,
        item_desc: formData.itemDesc,
        no_of_bags: formData.noOfBags,
        first_weight: formData.firstWeight,
        second_weight: formData.secondWeight,
        net_weight: formData.netWeight,
        created_by_name: formData.created_by_name || currentUserName,
        second_weight_by_name: formData.second_weight_by_name || currentUserName
      });
    }
  };

  

// ✅ Report generate aur print karne ka function
const generateAndPrintReport = (apiData: any) => {
  const currentDate = new Date()
    .toLocaleDateString("en-GB", {
      timeZone: "Asia/Karachi",
      day: "2-digit",
      month: "short",
      year: "2-digit",
    })
    .toUpperCase()
    .replace(/\s/g, "-");

  const currentTime = new Date()
    .toLocaleTimeString("en-GB", {
      timeZone: "Asia/Karachi",
      hour12: true,
    })
    .toUpperCase();

  function formatPKTDateTime(dateStr: any) {
    if (!dateStr) return "";

    const date = new Date(
      new Date(dateStr).toLocaleString("en-US", { timeZone: "Asia/Karachi" })
    );

    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);

    const months = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEPT", "OCT", "NOV", "DEC"
    ];
    const month = months[date.getMonth()];

    const time = date
      .toLocaleTimeString("en-GB", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .toUpperCase();

    return `${day}-${month}-${year} ${time}`;
  }

  // ✅ Get Fiscal Year from date
  function getFiscalYear(dateStr: any): number {
    if (!dateStr) {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      return currentMonth >= 7 ? now.getFullYear() + 1 : now.getFullYear();
    }
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return month >= 7 ? year + 1 : year;
  }

  const calculateAvgWeight = () => {
    const netWeight = parseFloat(apiData.net_weight || apiData.netWeight || "0");
    const quantity = parseInt(apiData.no_of_bags || apiData.noOfBags || "0");
    if (quantity === 0) return "0";
    return (netWeight / quantity).toFixed(2);
  };

  // ✅ Weight By - always shows first weight person
  const weightByName = apiData.created_by_name || currentUserName || "WRONG";
  
  // ✅ Second Weight By - only show if second weight actually exists
  const hasSecondWeight = apiData.second_weight && parseFloat(apiData.second_weight) > 0;
  let secondWeightByName = "";
  
  if (hasSecondWeight) {
    secondWeightByName = apiData.second_weight_by_name || apiData.created_by_name || currentUserName || "Not recorded";
  } else {
    secondWeightByName = "";
  }

  const slipNo = apiData.slip_no || apiData.slipNo || formData.slipNo;
  const igpNo = apiData.igp_no || apiData.igpNo || formData.igpNo;
  const vehicleNo = apiData.vehicle_no || apiData.vehicleNo || formData.vehicleNo;
  const party = apiData.vendor_name || apiData.vendor || formData.vendor || formData.customerName;
  const slipInTime = apiData.slip_in_time || masterData.slip_in_time;
  const slipOutTime = apiData.slip_out_time || masterData.slip_out_time;
  const itemDesc = apiData.item_desc || apiData.itemDesc || formData.itemDesc;
  const noOfBags = apiData.no_of_bags || apiData.noOfBags || formData.noOfBags;
  const wtPerBag = apiData.weight_per_bags || apiData.wtPerBag || formData.wtPerBag;
  const bardanaType = apiData.bardana_type || apiData.bardanaType || formData.bardanaType;
  const remarks = apiData.remarks || formData.remarks;
  const firstWeight = apiData.first_weight || apiData.firstWeight || formData.firstWeight;
  const secondWeight = apiData.second_weight || apiData.secondWeight || formData.secondWeight;
  const grossWeight = apiData.gross_weight || apiData.grossWeight || formData.grossWeight;
  const bardanaWeight = apiData.bardana_weight || apiData.bardanaWeight || formData.bardanaWeight;
  const qualityDeduction = apiData.quality_deduction || apiData.qualityDeduction || formData.qualityDeduction;
  const netWeight = apiData.net_weight || apiData.netWeight || formData.netWeight;
  const supplierWeight = apiData.supplier_weight || apiData.supplierWeight || formData.supplierWeight;
  const entryType = apiData.entry_type || apiData.entryType || formData.entryType || "purchase";

  // ✅ Get purRegType from apiData or formData
  const purRegType = apiData.pur_reg_type || apiData.purRegType || formData.purchase || 'R';
  
  // ✅ Get Fiscal Year
  const fiscalYear = getFiscalYear(slipInTime || apiData.created_at);
  const entryTypeUpper = entryType.toUpperCase();

  const printHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Weighbridge Slip - ${slipNo}</title>
  <style>
    body {
      font-family: "Times New Roman", Times, serif;
      margin: 6px;
      font-size: 15px;
      font-weight: 600;
    }

    .page-container {
      display: flex;
      flex-direction: column;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .copy-label {
      font-weight: bold;
      font-size: 16px;
    }

    .print-date {
      font-size: 13px;
    }

    .slip-section {
      border: 2px solid #000;
      margin-bottom: 6px;
      padding: 10px;
      box-sizing: border-box;
    }

    .image-box {
      border: 1px solid #ccc;
      width: 140px;
      height: 110px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f8f8;
      font-size: 12px;
      font-weight: bold;
      text-align: center;
      overflow: hidden;
      position: relative;
    }

    .image-box img {
      max-width: 140%;
      max-height: 100%;
      object-fit: contain;
      display: block;
    }

    .company-name {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 2px;
      text-align: center;
    }

    .slip-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 6px;
      text-align: center;
    }

    .two-column {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .left-section,
    .right-section {
      width: 48%;
      border: 1px solid #666;
      padding: 8px;
      border-radius: 2px;
    }

    .commodity-gross-row {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      margin: 14px 0;
    }

    .section-box {
      flex: 1;
      border: 1px solid #666;
      padding: 12px;
      border-radius: 2px;
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }

    .fields {
      display: grid;
      row-gap: 6px;
    }

    .fields div {
      display: flex;
      gap: 3px;
    }

    .label,
    .label1 {
      font-weight: bold;
      display: inline-block;
      width: 150px;
      font-size: 14px;
    }

    .value {
      font-weight: 700;
      font-size: 14px;
    }

    .value1 {
      font-weight: 900;
      font-size: 18px;
    }

    .signatures {
      margin-top: 20px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      text-align: center;
      gap: 20px;
    }

    .signature-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }

    .signature-line {
      border-bottom: 1px solid #000;
      width: 95px;
      margin-bottom: 3px;
    }

    @media print {
      body { font-size: 14px; }
      .fields div { gap: 2px; }
      .two-column { gap: 5px; }
    }
  </style>
</head>
<body>
  <div class="page-container">

    <!-- Head Office Copy -->
    <div class="slip-section">
      <div class="header">
        <div class="copy-label">Head Office Copy</div>
        <div class="print-date">Print Date: ${currentDate} ${currentTime}</div>
      </div>
      <div class="company-name">Sabirs Vegetable Oils (Pvt.) Ltd.</div>
      <div style="height: 10px;"></div>
      <div class="slip-title">WEIGHBRIDGE SLIP</div>

      <div><b>IGP #</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span class="value" style="font-weight: bold; font-size: 20px;">${igpNo}</span></div>

      <div class="two-column">
        <div class="left-section">
          <div class="fields">
            <div><span class="label">W.B #</span><span class="value1">${slipNo}</span></div>
            <div><span class="label1">Truck #</span><span class="value1">${vehicleNo}</span></div>
          </div>
        </div>
        <div class="right-section">
          <div class="fields">
            <div><span class="label1">Party:</span><span class="value1">${party}</span></div>
            <div>
              <span class="label">Slip_in_time:</span>
              <span class="value">${slipInTime ? formatPKTDateTime(slipInTime) : "-"}</span>
            </div>
            <div>
              <span class="label">Slip_out_time:</span>
              <span class="value">${slipOutTime ? formatPKTDateTime(slipOutTime) : "-"}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="commodity-gross-row">
        <div class="section-box">
          <div class="fields">
            <div><span class="label1">COMMODITY</span><span class="value1">${itemDesc}</span></div>
            <div><span class="label">QUANTITY</span><span class="value">${noOfBags}</span></div>
            <div><span class="label">BAG CONDITION</span><span class="value">${wtPerBag}</span></div>
            <div><span class="label">BAG TYPE</span><span class="value">${bardanaType}</span></div>
            <div><span class="label">AVG. WEIGHT</span><span class="value">${calculateAvgWeight()}</span></div>
            <div><span class="label">REMARKS</span><span class="value">${remarks}</span></div>
          </div>
          <!-- ✅ First Weight Image - with purRegType -->
          <div class="image-box">
            <img 
              src="/api/images/first-weight/latest-file?slipNo=${slipNo}&entryType=${entryTypeUpper}&fiscalYear=${fiscalYear}&purRegType=${purRegType}"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
              alt="First Weight Image" />
            <div style="display: none; color: #666; font-size: 10px;">No Image Available</div>
          </div>
        </div>

        <div class="section-box">
          <div class="fields">
            <div><span class="label">GROSS WEIGHT</span> <span class="value"><strong>${(parseFloat(firstWeight) || 0).toLocaleString("en-IN")}</strong></span></div>
            <div><span class="label">TARE WEIGHT</span> <span class="value"><strong>${(parseFloat(secondWeight) || 0).toLocaleString("en-IN")}</strong></span></div>
            <div><span class="label">WITH BARDANA WEIGHT</span> <span class="value"><strong>${Math.trunc((parseFloat(grossWeight) || 0) + (parseFloat(bardanaWeight) || 0)).toLocaleString("en-IN")}</strong></span></div>
            <div><span class="label">BARDANA WEIGHT</span> <span class="value">${Math.round(parseFloat(bardanaWeight) || 0)}</span></div>
            <div><span class="label">QUALITY DEDUCTION</span> <span class="value">${qualityDeduction || "0"}</span></div>
            <div><span class="label">NET WEIGHT</span> <span class="value"><strong>${(parseFloat(netWeight) || 0).toLocaleString("en-IN")}</strong></span></div>
          </div>
          <!-- ✅ Second Weight Image - with purRegType -->
          <div class="image-box">
            <img 
              src="/api/images/second-weight/latest-file?slipNo=${slipNo}&entryType=${entryTypeUpper}&fiscalYear=${fiscalYear}&purRegType=${purRegType}"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
              alt="Second Weight Image" />
            <div style="display: none; color: #666; font-size: 10px;">No Image Available</div>
          </div>
        </div>
      </div>

      <!-- Signatures -->
      <div class="signatures">
        <div class="signature-block">
          <div style="font-size: 10px; margin-bottom: 2px;">${weightByName}</div>
          <div class="signature-line"></div>
          <div>Weight By</div>
        </div>
        <div class="signature-block">
          <div style="font-size: 10px; margin-bottom: 2px;">${secondWeightByName}</div>
          <div class="signature-line"></div>
          <div>Second Weight By</div>
        </div>
        <div class="signature-block">
          <div class="signature-line"></div>
          <div>Checked By</div>
        </div>
        <div class="signature-block">
          <div class="signature-line"></div>
          <div>Production Manager</div>
        </div>
      </div>
      
      <hr style="border: 1px solid #000; margin: 20px 0;" />
      
      <!-- Feed Mill Copy -->
      <div class="slip">
        <div class="slip-header">
          <div class="header-left">Feed Mill Copy</div>
          <div class="header-center">
            <div class="company-name">Sabirs Vegetable Oils (Pvt.) Ltd.</div>
            <div style="height: 10px;"></div>
            <div class="slip-title">WEIGHBRIDGE SLIP</div>
          </div>
          <div class="header-right"></div>
        </div>
        <div><b>IGP #</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span class="value" style="font-weight: bold; font-size: 20px;">${igpNo}</span></div>

        <div class="two-column">
          <div class="left-section">
            <div class="fields">
              <div><span class="label">W.B #</span><span class="value1">${slipNo}</span></div>
              <div><span class="label1">Truck #</span><span class="value1">${vehicleNo}</span></div>
            </div>
          </div>
          <div class="right-section">
            <div class="fields">
              <div><span class="label1">Party:</span><span class="value1">${party}</span></div>
              <div><span class="label">Slip_in_time:</span><span class="value">${slipInTime ? formatPKTDateTime(slipInTime) : "-"}</span></div>
              <div><span class="label">Slip_out_time:</span><span class="value">${slipOutTime ? formatPKTDateTime(slipOutTime) : "-"}</span></div>
            </div>
          </div>
        </div>

        <div class="commodity-gross-row">
          <div class="section-box">
            <div class="fields">
              <div><span class="label1">COMMODITY</span><span class="value1">${itemDesc}</span></div>
              <div><span class="label">QUANTITY</span><span class="value">${noOfBags}</span></div>
              <div><span class="label">BAG CONDITION</span><span class="value">${wtPerBag}</span></div>
              <div><span class="label">BAG TYPE</span><span class="value">${bardanaType}</span></div>
              <div><span class="label">AVG. WEIGHT</span><span class="value">${calculateAvgWeight()}</span></div>
              <div><span class="label">REMARKS</span><span class="value">${remarks}</span></div>
            </div>
            <!-- ✅ First Weight Image - with purRegType -->
            <div class="image-box">
              <img 
                src="/api/images/first-weight/latest-file?slipNo=${slipNo}&entryType=${entryTypeUpper}&fiscalYear=${fiscalYear}&purRegType=${purRegType}"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                alt="First Weight Image" />
              <div style="display: none; color: #666; font-size: 10px;">No Image Available</div>
            </div>
          </div>
          <div class="section-box">
            <div class="fields">
              <div><span class="label">GROSS WEIGHT</span> <span class="value"><strong>${(parseFloat(firstWeight) || 0).toLocaleString("en-IN")}</strong></span></div>
              <div><span class="label">TARE WEIGHT</span> <span class="value"><strong>${(parseFloat(secondWeight) || 0).toLocaleString("en-IN")}</strong></span></div>
              <div><span class="label">WITH BARDANA WEIGHT</span> <span class="value"><strong>${Math.trunc((parseFloat(grossWeight) || 0) + (parseFloat(bardanaWeight) || 0)).toLocaleString("en-IN")}</strong></span></div>
              <div><span class="label">BARDANA WEIGHT</span> <span class="value">${Math.round(parseFloat(bardanaWeight) || 0)}</span></div>
              <div><span class="label">QUALITY DEDUCTION</span> <span class="value">${qualityDeduction || "0"}</span></div>
              <div><span class="label">NET WEIGHT</span> <span class="value"><strong>${(parseFloat(netWeight) || 0).toLocaleString("en-IN")}</strong></span></div>
            </div>
            <!-- ✅ Second Weight Image - with purRegType -->
            <div class="image-box">
              <img 
                src="/api/images/second-weight/latest-file?slipNo=${slipNo}&entryType=${entryTypeUpper}&fiscalYear=${fiscalYear}&purRegType=${purRegType}"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                alt="Second Weight Image" />
              <div style="display: none; color: #666; font-size: 10px;">No Image Available</div>
            </div>
          </div>
        </div>

        <div class="signatures">
          <div class="signature-block">
            <div style="font-size: 10px; margin-bottom: 2px;">${weightByName}</div>
            <div class="signature-line"></div>
            <div>Weight By</div>
          </div>
          <div class="signature-block">
            <div style="font-size: 10px; margin-bottom: 2px;">${secondWeightByName}</div>
            <div class="signature-line"></div>
            <div>Second Weight By</div>
          </div>
          <div class="signature-block">
            <div class="signature-line"></div>
            <div>Checked By</div>
          </div>
          <div class="signature-block">
            <div class="signature-line"></div>
            <div>Production Manager</div>
          </div>
        </div>
        
        <hr style="border: 1px solid #000; margin: 20px 0;" />
        
        <!-- Customer Copy -->
        <div class="slip">
          <div class="slip-header">
            <div class="header-left">Customer Copy</div>
            <div class="header-center">
              <div class="company-name">Sabirs Vegetable Oils (Pvt.) Ltd.</div>
              <div style="height: 10px;"></div>
              <div class="slip-title">WEIGHBRIDGE SLIP</div>
            </div>
            <div><b>IGP #</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span class="value" style="font-weight: bold; font-size: 20px;">${igpNo}</span></div>

            <div class="two-column">
              <div class="left-section">
                <div class="fields">
                  <div><span class="label">W.B #</span><span class="value1">${slipNo}</span></div>
                </div>
              </div>
              <div class="right-section">
                <div class="fields">
                  <div class="print-date">${slipOutTime ? formatPKTDateTime(slipOutTime) : "-"}</div>
                </div>
              </div>
            </div>

            <div class="commodity-gross-row">
              <div class="section-box">
                <div class="fields">
                  <div><span class="label1">Party:</span><span class="value1">${party}</span></div>
                  <div><span class="label1">COMMODITY</span><span class="value1">${itemDesc}</span></div>
                  <div><span class="label1">Truck #</span><span class="value1">${vehicleNo}</span></div>
                </div>
              </div>
              <div class="section-box">
                <div class="fields">
                  <div><span class="label">QUANTITY</span><span class="value">${noOfBags}</span></div>
                  <div class="flex items-center gap-1">
                    <span class="label text-xs text-black w-20">NET WEIGHT</span>
                     <div class="flex-1 border-b border-black">_________________________</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="signatures">
              <div class="signature-block">
                <div style="font-size: 10px; margin-bottom: 2px;">${weightByName}</div>
                <div class="signature-line"></div>
                <div>Weight By</div>
              </div>
              <div class="signature-block">
                <div style="font-size: 10px; margin-bottom: 2px;">${secondWeightByName}</div>
                <div class="signature-line"></div>
                <div>Second Weight By</div>
              </div>
              <div class="signature-block">
                <div class="signature-line"></div>
                <div>Checked By</div>
              </div>
              <div class="signature-block">
                <div class="signature-line"></div>
                <div>Production Manager</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.print();
  }
};
  // ✅ Start: API se data fetch karo (with number conversion fix)
  if (isEditMode) {
    alert("Purchase Record updated successfully!");
    setTimeout(() => {
      const wbIdValue = masterData.wb_id || formData.wbId;
      const wbIdNumber = toNumber(wbIdValue);
      
      if (wbIdNumber !== null) {
        fetchAndPrintReport(wbIdNumber);
      } else {
        generateAndPrintReport({
          ...masterData,
          ...(salesData[0] || {}),
          slip_no: formData.slipNo,
          vehicle_no: formData.vehicleNo,
          created_by_name: formData.created_by_name || currentUserName,
          second_weight_by_name: formData.second_weight_by_name || currentUserName
        });
      }
      resetFormToInitial();
    }, 1000);
  } else {
    alert("Purchase data saved successfully!");
    setTimeout(() => {
      const wbIdValue = masterData.wb_id || formData.wbId;
      const wbIdNumber = toNumber(wbIdValue);
      
      if (wbIdNumber !== null) {
        fetchAndPrintReport(wbIdNumber);
      } else {
        generateAndPrintReport({
          ...masterData,
          ...(salesData[0] || {}),
          slip_no: formData.slipNo,
          vehicle_no: formData.vehicleNo,
          created_by_name: formData.created_by_name || currentUserName,
          second_weight_by_name: formData.second_weight_by_name || currentUserName
        });
      }
      resetFormToInitial();
    }, 1000);
  }
}
    // If second weight was entered, refresh to remove from display table
    if (formData.secondWeight && parseFloat(formData.secondWeight) > 0) {
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    }

    // Auto-increment slip number for next entry regardless of mode
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        slipNo: nextSlipNo,
      }));
    }, 4000);
  };

  


useEffect(() => {
  const handleKeyDown = (event:any) => {
    if (event.altKey && event.key.toLowerCase() === "s") {
      event.preventDefault();
      handleSave();   // sirf yeh call hoga
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [handleSave]);







  // const handleSaveItems = async () => {
  //   setLoading(true);
  //   const payload = {
  //     wb_item_p_id: formData.wbItemPId
  //       ? parseInt(formData.wbItemPId, 10)
  //       : null,
  //     wb_id: formData.wbId ? parseInt(formData.wbId, 10) : null,
  //     manual_dc_no: formData.manualDcNo || null,
  //     do_id: formData.doId ? parseInt(formData.doId, 10) : null,
  //     do_no: formData.doNo || null,
  //     customer_id: formData.customerId
  //       ? parseInt(formData.customerId, 10)
  //       : null,
  //     customer_name: formData.customerName || null,
  //     vehicle_no: formData.vehicleNo || null,
  //     do_date: formData.doDate || null,
  //     item_id: formData.itemId ? parseInt(formData.itemId, 10) : null,
  //     item_code: formData.itemCode || null,
  //     item_desc: formData.itemDesc || null,
  //     created_by: formData.createdBy ? parseInt(formData.createdBy, 10) : null,
  //     creation_date: formData.creationDate || null,
  //     last_updated_by: formData.lastUpdatedBy
  //       ? parseInt(formData.lastUpdatedBy, 10)
  //       : null,
  //     last_updated_date: formData.lastUpdatedDate || null,
  //     po_id: formData.poId ? parseInt(formData.poId, 10) : null,
  //     po_no: formData.po_no || null,
  //     po_qty: formData.poQty ? parseFloat(formData.poQty) : null,
  //     igp_qty: formData.igpQty ? parseFloat(formData.igpQty) : null,
  //     balance_qty: formData.balanceQty ? parseFloat(formData.balanceQty) : null,
  //     baradana_type: formData.baradanaType || null,
  //     igp_no: formData.igpNo || null,
  //     manual_igp_no: formData.manualIgpNo || null,
  //     igp_id: formData.igpId ? parseInt(formData.igpId, 10) : null,
  //     vendor_id: formData.vendorId ? parseInt(formData.vendorId, 10) : null,
  //     vendor_name: formData.vendorName || null,
  //     no_of_bags: formData.noOfBags ? parseFloat(formData.noOfBags) : null,
  //     weight_per_bags: formData.wtPerBag ? parseFloat(formData.wtPerBag) : null,
  //     bardana_weight: formData.bardanaWeight
  //       ? parseFloat(formData.bardanaWeight)
  //       : null,
  //     igp_date: formData.igpDate || null,
  //     quality_deduction: formData.qualityDeduction
  //       ? parseFloat(formData.qualityDeduction)
  //       : null,
  //     supplier_weight: formData.supplierWeight
  //       ? parseFloat(formData.supplierWeight)
  //       : null,
  //     sup_weight_wthout_bardana: formData.supplierWeightMinusBardana
  //       ? parseFloat(formData.supplierWeightMinusBardana)
  //       : null,
  //     net_supplier_weight: formData.supplierWeightMinusOutWeight
  //       ? parseFloat(formData.supplierWeightMinusOutWeight)
  //       : null,
  //     bag_condition: formData.bagCondition || null,
  //     bardana_type_id: formData.bardanaTypeId
  //       ? parseInt(formData.bardanaTypeId, 10)
  //       : null,
  //   };

  //   try {
  //     const response = await fetch("/api/purchase-items", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     alert("Purchase items saved successfully!");
  //     console.log("Items saved:", data);
  //   } catch (err) {
  //     alert("Failed to save purchase items.");
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const isPurchaseOffline = true;

useEffect(() => {
  if (formData.weight && percentageData.length > 0) {
    setFormData((prev) => ({
      ...prev,
      weight: prev.weight?.trim() || "",
    }));
  }
}, [percentageData]);



useEffect(() => {
  if (vendorSelectOpen) {
    setTimeout(() => {
      vendorSearchInputRef.current?.focus();
    }, 0);
  }
}, [vendorSearch.searchValue, vendorSelectOpen]);



useEffect(() => {
  if (openDropdown) {
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  }
}, [itemSearch.searchValue, openDropdown]);




const isSaveDisabled =
  formData.status === "ONLINE" &&
  Number(formData.isFirstWeightSaved)> 0 &&
  Number(formData.isSecondWeightSaved ) > 0;


  return (
    <div className="h-screen bg-gray-100 p-1 overflow-hidden relative">
      {/* Weight Display Table - Upper Right Side */}
      <div
        className={`absolute ${isEditMode ? "top-40" : "top-20"} right-2 z-50`}
      >
        <div className="bg-white border-2 border-gray-400 rounded-md shadow-lg w-[350px] mb-6">
          {/* Header Row */}
          <div className="grid grid-cols-3 border-b border-gray-400">
            <div className="bg-gray-200 border-r border-gray-400 p-1 text-center text-sm font-semibold text-black">
              Slip No
            </div>
            <div className="bg-gray-200 border-r border-gray-400 p-1 text-center text-sm font-semibold text-black">
              Vehicle No
            </div>
            <div className="bg-gray-200 p-1 text-center text-sm font-semibold text-black">
              Entry Type
            </div>
          </div>
          {/* Search Row - positioned under headers */}
          <div className="grid grid-cols-3 border-b border-gray-400 bg-blue-50">
<div className="border-r border-gray-400 p-2 w-29">
  <Input
    placeholder="Search Slip No"
    value={searchSlipNo}
    onChange={(e) => setSearchSlipNo(e.target.value)}
    className="h-8 text-sm text-black placeholder:text-gray-500 bg-white border-gray-300"
  />
</div>








<div className="border-r border-gray-400 p-2 w-30">
  <Input
    placeholder="Search Vehicle"
    value={searchVehicleNo}
    onChange={(e) => setSearchVehicleNo(e.target.value)}
    className="h-8 text-sm text-black placeholder:text-gray-500 bg-white border-gray-300"
  />
</div>

            <div className="p-1">
              <Button
                onClick={() => {
                  setSearchSlipNo("");
                  setSearchVehicleNo("");
                }}
                className="h-5 text-xs bg-gray-500 hover:bg-gray-600 text-white w-full"
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Data Rows - showing filtered records */}
          <div className="max-h-56 overflow-y-auto">
            {filteredRecords && filteredRecords.length > 0 ? (
              filteredRecords.map((record: any, index: number) => (
                <div
                  key={index}
                  className="grid border-b border-gray-400 hover:bg-gray-50 text-xs"
                  style={{ gridTemplateColumns: "116px 115px 1fr" }} // Custom widths
                >
                  {/* Slip No */}
                  <button
className="border-r border-gray-400 p-1 text-center text-blue-600 truncate w-full h-14 text-lg font-bold flex items-center justify-center"
                    onClick={() => {
                      console.log("Clicked record:", record);
                      console.log("wb_id:", record.wb_id);
                      console.log("entry_type:", record.entry_type);
                      console.log("offline_entry:", record.offline_entry);

                      if (record.wb_id) {
                        const isOfflineEntry = record.offline_entry === "Yes";
                        const modeParam = isOfflineEntry ? "offline" : "online";

                        if (record.entry_type === "SALE") {
                          setLocation(
                            `/sales-form?type=${modeParam}&edit=${record.wb_id}`
                          );
                        } else if (
                          record.entry_type === "SALE_RETURN" ||
                          record.entry_type === "SALES_RETURN"
                        ) {
                          setLocation(
                            `/sales-return?type=${modeParam}&edit=${record.wb_id}`
                          );
                        } else if (record.entry_type === "PURCHASE_RETURN") {
                          setLocation(
                            `/purchase-return?type=${modeParam}&edit=${record.wb_id}`
                          );
                        } else if (record.entry_type === "SOLDNOTE") {
                          setLocation(
                            `/sold-note?type=${modeParam}&edit=${record.wb_id}`
                          );
                        } else {
                          loadDataByWbId(record.wb_id);
                        }
                      }
                    }}
                  >
                    {record.slip_no || "---"}
                  </button>

                  {/* Vehicle No */}
<div className="border-r border-gray-400 p-3 text-center text-black truncate w-full h-14 text-lg flex items-center justify-center">
  {record.vehicle_no || "---"}
</div>


                  {/* Entry Type */}
                  <div className="p-1 text-center text-blue-600 font-semibold truncate w-full">
                    {record.entry_type || "PURCHASE"}
                  </div>

                  
                </div>
              ))
            ) : (
              <div
                className="grid border-b border-gray-400 text-xs"
                style={{ gridTemplateColumns: "115px 116px 1fr" }}
              >
                <div className="border-r border-gray-400 p-1 text-center text-gray-500 bg-white">
                  {searchSlipNo || searchVehicleNo
                    ? "No matches"
                    : "No records"}
                </div>
                <div className="border-r border-gray-400 p-1 text-center text-gray-500 bg-white">
                  ---
                </div>
                <div className="p-1 text-center text-gray-500 bg-white">
                  ---
                </div>
              </div>
            )}
          </div>

          {/* Load Data Button */}
          {/* <button
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 text-xs"
            onClick={() => window.location.reload()}
          >
            Load Data
          </button> */}
        </div>
      </div>

      {/* Bag Details Table - Below Weight Display Table (hide when Sales form is active) */}
      {selectedForm === "purchase" && (
        <div
          className={`absolute ${
            isEditMode ? "top-[35rem]" : "bottom-[10rem]"
          } right-3 z-50`}
        >
          <div className="bg-gray border-2 border-gray-400 rounded-sm shadow-lg w-[350px] ">
            {/* Header Row */}
            <div className="grid grid-cols-6 border-b border-gray-400">
              <div className="bg-gray-200 border-r border-gray-400 p-1 text-center text-xs font-semibold text-black">
                Bag ID
              </div>
              <div className="bg-gray-200 border-r border-gray-400 p-1 text-center text-xs font-semibold text-black">
                Bags
              </div>
              <div className="bg-gray-200 border-r border-gray-400 p-1 text-center text-xs font-semibold text-black">
                P/B
              </div>
              <div className="bg-gray-200 border-r border-gray-400 p-1 text-center text-xs font-semibold text-black">
                %age
              </div>
              <div className="bg-gray-200 border-r border-gray-400 p-1 text-center text-xs font-semibold text-black">
                Weight
              </div>
               <div className="bg-gray-200 p-1 text-center text-xs font-semibold text-black">
                  ✖
              </div>
            </div>

            {/* Dynamic Data Rows */}
            <div className="max-h-32 overflow-y-auto">
              {bagTableData.length === 0 ? (
                <div className="grid grid-cols-6 border-b border-gray-300">
                  <div className="col-span-6 p-1 text-center text-xs text-gray-500">
                    No bag data available. Click Deduction+ to add data.
                  </div>
                </div>
              ) : (
                bagTableData.map((item, index) => (
                  <div
                    key={item.bagId}
                    className="grid grid-cols-6 border-b border-gray-300"
                  >
                    <div className="border-r border-gray-300 p-1 text-center text-xs text-black">
                      {String(item.bagId).padStart(3, "0")}
                    </div>
                    <div className="border-r border-gray-300 p-1 text-center text-xs text-black">
                      {item.bags}
                    </div>
                    <div className="border-r border-gray-300 p-1 text-center text-xs text-black">
                      {Number(item.pb ?? 0).toFixed(1)}
                    </div>
                    <div className="border-r border-gray-300 p-1 text-center text-xs text-black">
                      {Number(item.percentage ?? 0).toFixed(1)}
                    </div>

                    <div className="border-r border-gray-300 p-1">
                      <div className="w-full text-center text-xs text-black">
                        {Number(item.weight || 0).toFixed(2)}
                      </div>
                    </div>
                    <div className="p-1 text-center flex flex-col items-center gap-1">
                      {/* <input
                        type="checkbox"
                        checked={percentageMode[item.bagId] || false}
                        onChange={(e) =>
                          setPercentageMode((prev) => ({
                            ...prev,
                            [item.bagId]: e.target.checked,
                          }))
                        }
                        className="w-3 h-3"
                        title="Percentage mode"
                      /> */}
                      <button
                        className="text-red-600 hover:text-red-800 font-bold text-sm"
                        onClick={() => removeBagEntry(item.bagId)}
                         disabled={loading || disableSaveButton}  
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total Field */}
            <div className="border-t-2 border-gray-400 bg-gray-100 p-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-black">Total:</span>
                <Input
                  value={bagTableData
                    .reduce((sum, item) => sum + item.total, 0)
                    .toFixed(1)}
                  className="h-5 text-xs w-16 text-center font-bold text-blue-700 bg-white border-gray-300"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mode Indicator */}
      {isEditMode && (
        <div className="bg-blue-600 text-white p-1 rounded mb-2 text-center text-sm font-medium">
          EDIT MODE: Slip No. {formData.slipNo} (ID: {editingWbId})
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center bg-white border rounded p-1 mb-1">
        <div className="flex gap-2 text-xs">
        {/* Purchase */}
<Button
  className={`ml-16 h-8 px-1 text-sm font-medium border border-black ${
    selectedForm === "purchase"
      ? "bg-blue-700 text-white" // Active state
      : "bg-white text-black " // Inactive state
  }`}
  onClick={(e) => {
    e.preventDefault();
    setSelectedForm("purchase"); // Mark as active
    const urlParams = new URLSearchParams(window.location.search);
    const typeMode = urlParams.get("type") || "online";
    const targetUrl = `/purchase-form?type=${typeMode}`;
    window.history.pushState({}, "", targetUrl);
    setLocation(targetUrl); // SPA navigation
  }}
>
  Purchase
</Button>


{/* Sales */}
<Button
  className="h-8 px-1 text-sm font-medium bg-white text-black border border-black hover:bg-gray-100"
  onClick={(e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const typeMode = urlParams.get("type") || "online";
    const targetUrl = `/sales-form?type=${typeMode}`;
    sessionStorage.removeItem("purchaseFormEditMode");
    sessionStorage.removeItem("salesFormEditMode");
    setLocation(targetUrl);
  }}
>
  Sales
</Button>

{/* Sales Return */}
{/* <Button
  className="h-7 px-1 text-sm font-medium bg-white text-black border border-black hover:bg-gray-100"
  onClick={() => {
    // 🔒 ALWAYS FORCE OFFLINE FOR SALE RETURN
    const targetUrl = `/sales-return?type=offline`;
    window.location.href = targetUrl;
  }}
>
  Sales Return
</Button> */}

{/* Sold Note */}
{/* <Button
  className="h-7 px-1 text-sm font-medium bg-white text-black border border-black hover:bg-gray-100"
  onClick={() => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeMode = urlParams.get("type") || "online";
    const targetUrl = `/sold-note?type=${typeMode}`;
    window.location.href = targetUrl;
  }}
>
  Sold Note
</Button> */}

          {/* <Button
            className={`h-7 px-1 text-sm font-medium ${
              selectedForm === "offline"
                ? "bg-yellow-600 text-white"
                : "bg-amber-600 hover:bg-amber-700 text-white"
            }`}
            onClick={(e) => {
              e.preventDefault();
              setSelectedForm("offline");
            }}
          >
            Offline
          </Button>
          <Button
            className="h-7 px-1 text-sm bg-purple-600 hover:bg-purple-700 text-white font-medium"
            onClick={navigateToFirst}
          >
            First
          </Button> */}
          <Button
            className="h-8 px-1 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium"
            onClick={navigateToPrev}
          >
            Prev
          </Button>
          <Button
            className="h-8 px-1 text-sm bg-cyan-600 hover:bg-cyan-700 text-white font-medium"
            onClick={navigateToNext}
          >
            Next
          </Button>
          {/* <Button
            className="h-7 px-1 text-sm bg-teal-600 hover:bg-teal-700 text-white font-medium"
            onClick={navigateToLast}
          >
            Last
          </Button> */}
      <div className="flex gap-5">
  <Button
    type="button"
    className="bg-green-600 hover:bg-green-700 h-10 w-40 px-4 text-sm text-white font-medium"
    onClick={() => {
      console.log("🟢 Save button clicked");
      handleSave();
    }}
    disabled={loading || isSaveDisabled}
  >
    {loading ? "Saving..." : "Save"}
  </Button>

  <Button
    className="h-8 px-1 text-sm bg-orange-600 hover:bg-orange-700 text-white font-medium"
    onClick={handlePrintReport}
  >
    Print
  </Button>
</div>


 {/* {isEditMode && (
            <Button
              className="h-7 px-1 text-sm bg-red-600 hover:bg-red-700 text-white font-medium"
              onClick={cancelEdit}
            >
              Cancel
            </Button>
          )} */}
          {/* <Button
            className="h-7 px-1 text-sm bg-gray-600 hover:bg-gray-700 text-white font-medium"
            onClick={() => {
              if (isSearchMode || isEditMode) {
                // If in search mode or edit mode, reset to new form
                resetFormToInitial();
                setIsSearchMode(false);
                setIsEditMode(false);
                setEditingWbId(null);

                // Clear URL parameters and set to new form mode
                const newUrl =
                  window.location.pathname +
                  "?type=" +
                  (onlineMode ? "online" : "offline");
                window.history.replaceState({}, "", newUrl);
              } else {
                // Enter search mode
                const urlParams = new URLSearchParams(window.location.search);
                urlParams.set("search", "true");
                const newUrl = `${
                  window.location.pathname
                }?${urlParams.toString()}`;
                window.history.replaceState({}, "", newUrl);
                setIsSearchMode(true);
                setFormData((prev) => ({ ...prev, slipNo: "" }));
              }
            }}
          >
            {isSearchMode || isEditMode ? "New" : "Edit"}
          </Button> */}

  <Button
  className={`h-8 px-2 text-sm font-medium text-white ${
    onlineMode && formData.firstWeight && formData.secondWeight
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-blue-600 hover:bg-blue-700"
  }`}
  onClick={() => handleReject(editingWbId as number)}

   disabled={Boolean(
    onlineMode &&
    formData.firstWeight &&
    formData.secondWeight
  )}
>
  Rej
</Button>





        </div>

        
          <div className="flex items-center gap-3">
          {/* Weight Display - bigger and aligned left */}
          <div className="mr-[-5rem] transform scale-150">
            <WeightIndicator comPort={comPort} compact={true} />
          </div>

          {/* Buttons */}
          <div className="flex gap-1 ml-28">
            <button
              className={`h-8 px-2 text-sm font-medium rounded transition-colors ${
                onlineMode === true
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-300 hover:bg-gray-400 text-gray-600"
              }`}
              onClick={() => toggleOnlineMode(true)}
            >
              ONLINE
            </button>

            <button
              className={`h-8 px-2 text-sm font-medium rounded transition-colors ${
                onlineMode === false
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gray-300 hover:bg-gray-400 text-gray-600"
              }`}
              onClick={() => toggleOnlineMode(false)}
            >
              OFFLINE
            </button>
          </div>
        </div>
      </div>
      {/* Main Form Layout - 100% visible without scrolling */}
      <div className="bg-white p-1 rounded border h-[calc(100vh-30px)] overflow-hidden">
        <div className="grid grid-cols-12 gap-1 h-full">
          {/* Left Side - Main Form (Columns 1-8) */}
          <div className="col-span-8">
            {/* Master Table Section */}
          <div className="bg-gray-300 rounded border mb-2 w-full">
  <div className="grid grid-cols-9 gap-1 p-2">
    {/* Column 1 - Left Form Fields */}
    <div className="col-span-3 flex flex-col gap-2">
      
      {/* Slip No - Top Left */}
      <div className="flex items-center gap-1">
        <Label className="text-xs text-black w-16">Slip No</Label>
        {isSearchMode ? (
          <div className="flex gap-1 flex-1">
            <Input
              name="slipNo"
              value={formData.slipNo}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  searchAndLoadBySlipNo();
                }
              }}
              placeholder="Enter slip number to search"
              className="h-7 text-xs text-black flex-1"
            />
            <Button
              onClick={searchAndLoadBySlipNo}
              className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              {loading ? "..." : "Search"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1 flex-1">
            <Input
              name="slipNo"
              value={formData.slipNo}
              readOnly
              className="h-7 text-xs text-black flex-1 max-w-32 cursor-not-allowed 
                !border !border-gray-400 rounded px-1 
                focus:!border-black"
            />
            
            {/* Reload Button - Status ONLINE check */}
            {formData.status === 'ONLINE' && (
              <button
                onClick={async () => {
                  try {
                    const wbId = editingWbId;
                    const entryType = formData.entryType || 'PURCHASE';

                    if (!wbId || Number(wbId) === 0) {
                      alert(`❌ wbId missing — record properly load nahi hua`);
                      return;
                    }

                    console.log(`🔄 Reloading ${entryType} record ${wbId}...`);

                    const dbData = await fetchPurchaseDataForIGP(Number(wbId));

                    if (!dbData) {
                      alert(`❌ Record not found`);
                      return;
                    }

                    const response = await fetch(
                      "http://portal.sabirsgroup.com:8184/ords/sabroso_ords/wb-om/wb-update-on-igp",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(dbData),
                      }
                    );

                    const text = await response.text();

                    if (response.ok) {
                      alert(`✅ ${entryType} record ${wbId} successfully reloaded!`);
                      if (formData.slipNo) {
                        await searchAndLoadBySlipNo();
                      }
                    } else {
                      alert(`❌ Reload failed: ${text.substring(0, 200)}`);
                    }
                  } catch (error: any) {
                    console.error("Reload error:", error);
                    alert(`❌ Failed to reload: ${error.message}`);
                  }
                }}
                className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1"
              >
                🔄
              </button>
            )}
          </div>
        )}
      </div>

      {/* Slip Date */}
      <div className="flex items-center gap-1">
        <Label className="text-xs text-black w-16">Slip Date</Label>
        <Input
          type="date"
          name="slipDate"
          value={new Date().toISOString().split('T')[0]}
          className="h-7 text-xs text-black flex-1 max-w-32 
            !border !border-gray-400 rounded px-1 
            focus:!border-black bg-gray-50"
          readOnly
        />
      </div>

      {/* Net Weight */}
      <div className="flex items-center gap-1">
        <Label className="text-xs text-black w-16">Net Weight</Label>
        <Input
          name="netWeight"
          value={formData.netWeight}
          onChange={handleChange}
          readOnly
          className="h-7 text-xs bg-yellow-200 text-black flex-1 max-w-32 cursor-not-allowed 
            !border !border-gray-400 rounded px-1 
            focus:!border-black"
        />
      </div>

      {/* Freight */}
      <div className="flex items-center gap-1">
        <Label className="text-xs text-black w-16">Freight</Label>
        <Input
          autoComplete="off"
          name="freight"
          value={formData.freight}
          onChange={handleChange}
          className="h-7 text-xs text-black flex-1 max-w-32 cursor-not-allowed 
            !border !border-gray-400 rounded px-1 
            focus:!border-black"
          readOnly={
            formData.isFirstWeightSaved === true && 
            formData.isSecondWeightSaved === true && 
            String(formData.status).trim().toUpperCase() === "ONLINE"
          }
        />
      </div>

      {/* Supplier Weight */}
      <div className="flex items-center gap-1">
        <Label className="text-xs text-black w-16">Supp. Weight</Label>
        <Input
         // type="number"
          //placeholder="Enter weight"
          name="supplierWeight"
          value={formData.supplierWeight || ''}
          onChange={handleChange}
          className="h-7 text-xs text-black placeholder:text-gray-500 flex-1 max-w-32
            !border !border-gray-400 rounded px-1 
            focus:!border-black"
        />
      </div>

      {/* Remarks */}
      <div className="flex items-start gap-1">
        <Label className="text-xs text-black w-16 mt-1">Remarks</Label>
        <Textarea
        //  placeholder="Add remarks"
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          className="h-12 min-h-[50px] max-h-[40px] text-xs resize-none text-black placeholder:text-gray-500 flex-1 max-w-48 
            !border !border-gray-400 rounded px-1 
            focus:!border-black"
          readOnly={
            formData.isFirstWeightSaved === true && 
            formData.isSecondWeightSaved === true && 
            String(formData.status).trim().toUpperCase() === "ONLINE"
          }
        />
      </div>

    </div>

    {/* Column 2 - Weight Fields */}
    <div className="col-span-3 flex flex-col gap-2">
      {/* First Weight */}
      <div className="flex items-center gap-1">
        <Label className="text-xs text-black w-20">First Weight</Label>
        <Input
          autoComplete="off"
          name="firstWeight"
          value={formData.firstWeight}
          onChange={handleChange}
          readOnly
          className={`h-7 text-xs flex-1 max-w-32 text-black 
            !border !border-gray-400 rounded px-1 
            focus:!border-black
            ${isEditMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
        />
      </div>

      {/* Second Weight */}
      <div className="flex items-center gap-1">
        <Label className="text-xs text-black w-20">Second Weight</Label>
        <Input
          autoComplete="off"
          name="secondWeight"
          value={formData.secondWeight}
          onChange={handleChange}
          readOnly
          className={`h-7 text-xs flex-1 max-w-32 text-black 
            !border !border-gray-400 rounded px-1 
            focus:!border-black
            ${isEditMode && formData.secondWeight ? "bg-gray-100 cursor-not-allowed" : ""}`}
        />
      </div>


  {/* Gross W.B.D - NEW FIELD */}
  <div className="flex items-center gap-1">
    <Label className="text-xs text-black w-20">Gross W.B.D</Label>
    <Input
      name="grossWBD"
      value={formData.grossWBD || ''}
      onChange={handleChange}
     // placeholder="Enter Gross W.B.D"
      className="h-7 text-xs text-black placeholder:text-gray-500 flex-1 max-w-32 
        !border !border-gray-400 rounded px-1 
        focus:!border-black"
      readOnly={
        formData.isFirstWeightSaved === true && 
        formData.isSecondWeightSaved === true && 
        String(formData.status).trim().toUpperCase() === "ONLINE"
      }
    />
  </div>


      {/* Bardana Weight */}
      <div className="flex items-center gap-1">
        <Label className="text-xs text-black w-20">Bardana Weight</Label>
        <Input
          autoComplete="off"
          name="bardanaWeight"
          value={Math.round(parseFloat(formData.bardanaWeight) || 0)}
          onChange={handleChange}
          readOnly
          className={`h-7 text-xs text-black flex-1 max-w-32 
            !border !border-gray-400 rounded px-1 
            focus:!border-black
            ${isEditMode ? "bg-gray-100" : ""}`}
        />
      </div>

      {/* Gross Weight */}
      <div className="flex items-center gap-1">
        <Label className="text-xs text-black w-20">Gross Weight</Label>
        <Input
          name="grossWeight"
          value={formData.grossWeight}
          readOnly
          className="h-7 text-xs text-black flex-1 max-w-32 
            !border !border-gray-400 rounded px-1 
            focus:!border-black"
        />
      </div>


     <div className="flex items-center gap-1">
  <Label className="text-xs text-black w-20">Reg Type</Label>
  <select
    name="registerType"
    value={formData.registerType || ''}
    onChange={handleChange}
    className="h-5 text-xs text-black flex-1 max-w-24
      !border !border-gray-400 rounded px-1 
      focus:!border-black bg-white"
    disabled={
      // Agar Purchase field ka koi bhi value select hai toh disable
      formData.purchase !== undefined && formData.purchase !== null
    }
  >
    <option value="R">Register</option>
    <option value="U">Unregister</option>
   
  </select>
</div>

{/* Purchase Title & Exc.Bags */}
<div className="flex items-center gap-1">
  <Label className="text-xs text-black w-20">Purchase</Label>
  <select
    name="purchase"
    value={formData.purchase || 'R'}
    onChange={(e) => {
      const value = e.target.value;
      console.log(`🔄 Purchase changed to: "${value}"`);
       console.log(`📅 Current slipDate:`, formData.slipDate);
      
      setFormData(prev => ({
        ...prev,
        purchase: value,
        slipNo: '' // ✅ Clear slipNo to fetch new one
      }));
    }}
    className="h-5 text-xs text-black flex-1 max-w-24
      !border !border-gray-400 rounded px-1 
      focus:!border-black bg-white"
  >
    <option value="R">REGISTER</option>
   {/* // <option value="U">UNREGISTER</option> */}
   
  </select>
  
  {/* Exc.Bags Checkbox */}
  <div className="flex items-center gap-1 ml-2">
    <input
      type="checkbox"
      id="excBags"
      name="excBags"
      checked={formData.excBags || false}
      onChange={(e) => {
        setFormData(prev => ({
          ...prev,
          excBags: e.target.checked
        }));
      }}
      className="h-4 w-4 accent-green-600 cursor-pointer"
      disabled={
        formData.isFirstWeightSaved === true && 
        formData.isSecondWeightSaved === true && 
        String(formData.status).trim().toUpperCase() === "ONLINE"
      }
    />
    <Label htmlFor="excBags" className="text-xs text-black cursor-pointer">
      Exc.Bags
    </Label>
  </div>
</div>

      {/* Branch
      <div className="flex items-center gap-1">
        <Label className="text-xs text-black w-20">Branch</Label>
        {isEditMode ? (
          <Input
            value={
              branches.find(
                (b) => b.branch_id.toString() === formData.branchId?.toString()
              )?.branch_name || formData.branch || ""
            }
            readOnly
            className="h-7 text-xs text-black flex-1 max-w-32
              !border !border-gray-400 rounded px-1 
              focus:!border-black"
          />
        ) : (
          <Select
            name="branch"
            value={formData.branchId}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                branchId: value,
                branch: branches.find((b) => b.branch_id.toString() === value)?.branch_name || "",
              }))
            }
          >
            <SelectTrigger className="h-7 text-xs text-black flex-1 max-w-32 
              !border !border-gray-400 rounded px-1 
              focus:!border-black">
              <SelectValue placeholder="Select branch" className="text-black" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.branch_id} value={branch.branch_id.toString()}>
                  {branch.branch_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div> */}
    </div>

    {/* Column 3 - Driver & Camera */}
    <div className="col-span-3 flex flex-col justify-between">
      <div className="flex flex-col gap-1.5">


           {/* Branch */}
      <div className="flex items-center gap-1">
        <Label className="text-xs text-black w-20">Branch</Label>
        {isEditMode ? (
          <Input
            value={
              branches.find(
                (b) => b.branch_id.toString() === formData.branchId?.toString()
              )?.branch_name || formData.branch || ""
            }
            readOnly
            className="h-7 text-xs text-black flex-1 max-w-32
              !border !border-gray-400 rounded px-1 
              focus:!border-black"
          />
        ) : (
          <Select
            name="branch"
            value={formData.branchId}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                branchId: value,
                branch: branches.find((b) => b.branch_id.toString() === value)?.branch_name || "",
              }))
            }
          >
            <SelectTrigger className="h-7 text-xs text-black flex-1 max-w-32 
              !border !border-gray-400 rounded px-1 
              focus:!border-black">
              <SelectValue placeholder="Select branch" className="text-black" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.branch_id} value={branch.branch_id.toString()}>
                  {branch.branch_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>


        {/* Driver Name */}
        <div className="flex items-center gap-1">
          <Label className="text-xs text-black w-20">Driver Name</Label>
          <Input
            autoComplete="off"
           // placeholder="Enter driver name"
            name="driverName"
            value={formData.driverName}
            onChange={handleChange}
            className="text-black flex-1 max-w-32 h-7 
              !border !border-gray-400 rounded px-1 
              focus:!border-black"
          />
        </div>
      </div>

      {/* Buttons & Camera */}
      <div className="flex flex-col gap-1 mt-1">
        {/* First & Second Weight Buttons */}
        <div className="grid grid-cols-2 gap-1">
          <Button
            className={`h-7 text-xs ${
              formData.isFirstWeightSaved ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
            onClick={captureFirstWeight}
            disabled={formData.isFirstWeightSaved}
          >
            1st WHT
          </Button>

        <Button
    className={`h-7 text-xs ${
        formData.isSecondWeightSaved || 
        (isEditMode && formData.secondWeight && parseFloat(formData.secondWeight) > 0) ||
        (!isEditMode && !formData.isFirstWeightSaved)
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
    }`}
    onClick={captureSecondWeight}
    disabled={
        formData.isSecondWeightSaved || 
        (isEditMode && formData.secondWeight && parseFloat(formData.secondWeight) > 0) ||
        (!isEditMode && !formData.isFirstWeightSaved)
    }
>
    2nd WHT
</Button>
        </div>

        {/* Camera Feed */}
        <div className="h-28 w-full overflow-hidden rounded border">
          <VideoStreamFullscreen
            camera={{
              id: 1,
              name: "Camera 01",
              ip: "10.10.10.146",
              port: 554,
            }}
            isConnected={true}
            isStreaming={true}
          />
        </div>

        {/* Clear & Exit Buttons */}
        <div className="grid grid-cols-2 gap-1">
          <Button className="h-7 bg-yellow-500 text-xs" onClick={resetForm}>
            Clear
          </Button>
          <Button className="h-7 bg-red-500 text-xs">Exit</Button>
        </div>
      </div>
    </div>
  </div>
</div>
            {/* Large Label Between Sections */}
            <div className="text-center py-0 mb-2">
              <div
                className={`inline-block px-1 py-1 rounded-lg shadow-md ${
                  onlineMode === true
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                    : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                }`}
              >
                <h2 className="text-2xl font-bold tracking-wide">
                  {isReturnMode
                    ? onlineMode === true
                      ? selectedForm === "sales"
                        ? "Sale Return Online"
                        : "Purchase Return Online"
                      : selectedForm === "sales"
                      ? "Sale Return Offline"
                      : "Purchase Return Offline"
                    : onlineMode === true
                    ? selectedForm === "sales"
                      ? "Sale Online"
                      : "Purchase Online"
                    : selectedForm === "sales"
                    ? "Sale Offline"
                    : "Purchase Offline"}
                </h2>
              </div>
            </div>

            {/* Top buttons row - above details section */}
            <div className="flex gap-1">
              <Button
                className={`h-6 text-xs px-1 ${
                  selectedForm === "purchase"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-black"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedForm("purchase");
                }}
              >
                Purchase
              </Button>

              <Button
                className={`h-6 text-xs px-1 ${
                  selectedForm === "sales"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-black"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  // Navigate to sales form
                  const urlParams = new URLSearchParams(window.location.search);
                  const typeMode = urlParams.get("type") || "online";
                  const targetUrl = `/sales-form?type=${typeMode}`;
                  sessionStorage.removeItem("purchaseFormEditMode");
                  sessionStorage.removeItem("salesFormEditMode");
                  setLocation(targetUrl);
                }}
              >
                Sales
              </Button>

              <Button
                className={`h-6 text-xs px-1 ${
                  selectedForm === "offline"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-black"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedForm("offline");
                }}
              >
                Offline
              </Button>
            </div>


          
            {/* Details Section */}
           <div className="bg-gray-300 p-1 rounded border">
  {/* Show Purchase Form when selectedForm is 'purchase' */}
  {selectedForm === "purchase" && (
    <div className="mt-1">
      <div className="grid grid-cols-3 gap-1 text-xs">
        {/* First Column */}
        <div className="flex flex-col gap-1.5">
          {/* Bardana Type */}
                <div className="flex items-center gap-1">
  <span className="text-xs text-black w-20">Bardana Type</span>

  <Select
    name="bardanaType"
    value={formData.bardanaType || ""}
    onValueChange={(value) => {
      const selectedBardana = bardanaTypes.find(
        (item) => item.type === value
      );

      setFormData((prev) => ({
        ...prev,
        bardanaType: value,
        bardanaTypeId: selectedBardana?.data_config_id || null,
        wtPerBag:
          selectedBardana?.data_config_segment1 || prev.wtPerBag,
      }));

      setTimeout(() => {
        const noOfBagsInput = document.querySelector(
          'input[name="noOfBags"]'
        ) as HTMLInputElement;
        if (noOfBagsInput) {
          noOfBagsInput.focus();
          noOfBagsInput.select();
        }
      }, 50);
    }}
    open={bardanaSelectOpen}
    onOpenChange={setBardanaSelectOpen}
  >
    <SelectTrigger
      ref={bardanaSelectRef}
     className="h-7 text-xs text-black w-36 
           !border !border-gray-400 rounded px-1 
           focus:!border-black"
      onFocus={() => setActiveLOV("bardana")}
    >
      <SelectValue
        placeholder="Select bardana type (Ctrl+L)"
        className="text-black"
      >
        {formData.bardanaType || "Select bardana type (Ctrl+L)"}
      </SelectValue>
    </SelectTrigger>

    <SelectContent>
      <div className="px-1 py-1 sticky top-0 bg-white z-10 border-b">
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Search Bardana Type..."
          value={bardanaSearch.searchValue}
          onChange={(e) =>
            bardanaSearch.setSearchValue(e.target.value)
          }
          onMouseDown={(e) => e.stopPropagation()}
          className="h-7 text-sm border-gray-300 px-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {filteredBardanaTypes.map((bardanaType) => (
        <SelectItem
          key={bardanaType.data_config_id}
          value={bardanaType.type}
          className="  py-1 
  cursor-pointer
  focus:bg-blue-500 
  focus:text-white
  data-[highlighted]:bg-blue-500 
  data-[highlighted]:text-white"
        >
          <div className="flex flex-col">
            <div className="font-medium text-sm">
              {bardanaType.type}
            </div>
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

          {/* Wt per Bag */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-black w-20">Wt per Bag</span>
            <Input
              name="wtPerBag"
              value={formData.wtPerBag}
              onChange={handleChange}
              readOnly={false} // always editable
             className="h-7 text-xs text-black w-36 
           !border !border-gray-400 rounded px-1 
           focus:!border-black"
      readOnly={
  formData.isFirstWeightSaved === true && 
  formData.isSecondWeightSaved === true && 
  String(formData.status).trim().toUpperCase() === "ONLINE"
}
            />
          </div>


         {/* No of Bags */}
<div className="flex items-center gap-1">
  <span className="text-xs text-black w-20">No of Bags</span>
  <Input
    autoComplete="off"
    name="noOfBags"
    value={formData.noOfBags}
    onChange={handleChange}
    onKeyDown={(e) => {
      // When Enter is pressed in No of Bags, move to Vendor field
      if (e.key === "Enter") {
        e.preventDefault();
        // For offline mode, focus on Vendor select trigger
        if (!onlineMode && !igpDataFetched) {
          setTimeout(() => {
            // Open the vendor dropdown
            setVendorSelectOpen(true);
            // Focus on vendor search input
            setTimeout(() => {
              const vendorSearchInput = document.querySelector(
                '[placeholder*="Search Vendor"]'
              ) as HTMLInputElement;
              if (vendorSearchInput) {
                vendorSearchInput.focus();
              }
            }, 100);
          }, 50);
        }
      }
    }}
    readOnly={onlineMode && igpDataFetched && !isEditMode}
  className={`h-7 text-xs text-black w-36 
  !border !border-gray-400 rounded px-1 
  focus:!border-black
  ${
    onlineMode && igpDataFetched && !isEditMode
      ? "bg-gray-100 cursor-not-allowed"
      : ""
  }
`}
      readOnly={
  formData.isFirstWeightSaved === true && 
  formData.isSecondWeightSaved === true && 
  String(formData.status).trim().toUpperCase() === "ONLINE"
}
  />
</div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-black w-20">Bardana Weight</span>
            <Input
              autoComplete="off"
              name="bardanaWeight"
              value={
                formData.bardanaWeight
                  ? Math.round(Number(formData.bardanaWeight))
                  : ""
              }
              onChange={handleChange}
              readOnly={true} // ✅ hamesha read-only
             className="h-7 text-xs text-black w-36 
           !border !border-gray-400 rounded px-1 
           focus:!border-black 
           bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Quality */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-black w-20">Quality</span>
            <Input
              autoComplete="off"
              name="qualityDeduction"
              value={formData.qualityDeduction}
              onChange={handleChange}
              readOnly={true}
              className="h-7 text-xs text-black w-36 
           !border !border-gray-400 rounded px-1 
           focus:!border-black 
           bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Second Column */}
        <div className="flex flex-col gap-1.5">
          {/* IGP No */}
              <div className="flex items-center gap-1">
  <span className="text-xs text-black w-20">IGP No</span>
  <Input
    autoComplete="off"
    name="igpNo"
    value={formData.igpNo}
    onChange={handleChange}
    onKeyDown={(e) => {
      const canEdit =
        // new online entry
        (onlineMode && !isEditMode) ||
        // offline entry originally offline → now switched online
        (isEditMode && wasOfflineInitially && onlineMode);

      if (!canEdit) return;

      if (e.key === "Enter") {
        e.preventDefault();
      }

      if (e.key === "Enter" || e.key === "Tab") {
        setFormData((prev) => ({
          ...prev,
          igpNo: prev.igpNo.trim().toUpperCase(),
        }));
        fetchIgpData();
      }
    }}
    className={`h-7 text-xs flex-1 max-w-32
      !border !border-gray-400 rounded px-1 
      focus:!border-black
      ${
        (onlineMode && !isEditMode) ||
        (isEditMode && wasOfflineInitially && onlineMode)
          ? "text-black"
          : "text-gray-500 bg-gray-100 cursor-not-allowed"
      }`}
    placeholder={
      (onlineMode && !isEditMode) ||
      (isEditMode && wasOfflineInitially && onlineMode)
        ? "Press Enter / Tab to fetch"
        : "Not editable"
    }
    readOnly={
      !(
        (onlineMode && !isEditMode) ||
        (isEditMode && wasOfflineInitially && onlineMode)
      )
    }
  />
  
  {/* Simple Checkbox - No Label */}
  <input
    type="checkbox"
    name="igpCheckbox"
    checked={formData.igpCheckbox || false}
    onChange={(e) => {
      setFormData(prev => ({
        ...prev,
        igpCheckbox: e.target.checked
      }));
    }}
    className="h-4 w-4 accent-green-600 cursor-pointer ml-1"
    disabled={
      formData.isFirstWeightSaved === true && 
      formData.isSecondWeightSaved === true && 
      String(formData.status).trim().toUpperCase() === "ONLINE"
    }
  />
</div>
      {/* IGP Date */}
<div className="flex items-center gap-1">
  <span className="text-xs text-black w-20">IGP Date</span>
  <Input
    name="igpDate"
    value={formData.igpDate ? formatIgpDateDisplay(formData.igpDate) : ""}
    onChange={handleChange}
    readOnly={true}
    className="h-7 text-xs text-black w-36 
      !border !border-gray-400 rounded px-1 
      focus:!border-black 
      bg-gray-100 cursor-not-allowed"
    placeholder="IGP Date"
  />
</div>



         {/* Vendor */}
<div className="flex items-center gap-2 w-full">
  <span className="text-xs text-black w-22 shrink-0">
    Vendor
  </span>

  <div className="relative flex-1">
    <Input
      type="text"
      value={formData.vendor || ""}
      onChange={(e) => {
        const value = e.target.value;
        const selectedVendor = vendorsData.find(
          (vendor) => vendor.vendor_name === value
        );
        setFormData((prev) => ({
          ...prev,
          vendor: value,
          vendorId: selectedVendor
            ? selectedVendor.vendor_id.toString()
            : "",
        }));
      }}
      placeholder="Type or select vendor..."
      className="h-7 text-xs text-black w-full pr-8 border border-gray-400 rounded px-1"
    />

    <div className="absolute top-0 right-0 h-full">
      <Select
        name="vendor"
        value={formData.vendor || ""}
        open={vendorSelectOpen}
        onOpenChange={(open) => {
          setVendorSelectOpen(open);
        }}
        onValueChange={(value) => {
          const selectedVendor = vendorsData.find(
            (vendor) => vendor.vendor_name === value
          );
          setFormData((prev) => ({
            ...prev,
            vendor: value,
            vendorId: selectedVendor
              ? selectedVendor.vendor_id.toString()
              : prev.vendorId,
          }));

          setTimeout(() => {
            const vehicleNoInput = document.querySelector(
              'input[name="vehicleNo"]'
            ) as HTMLInputElement;
            vehicleNoInput?.focus();
            vehicleNoInput?.select();
          }, 50);
        }}
      >
        <SelectTrigger className="h-7 w-8 px-0 border-l border-gray-400 rounded-l-none rounded-r flex items-center justify-center">
          ▼
        </SelectTrigger>

        <SelectContent className="max-h-60 overflow-y-auto">
          <div className="px-1 py-1 sticky top-0 bg-white z-10 border-b">
            <Input
              ref={vendorSearchInputRef}
              type="text"
              placeholder="Search Vendor..."
              value={vendorSearch.searchValue}
              onChange={(e) => vendorSearch.setSearchValue(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              className="h-7 text-sm border-gray-300 px-1"
              autoComplete="off"
            />
          </div>

          {vendorsData.length === 0 ? (
            <div className="px-1 py-1 text-xs text-gray-500">
              Loading vendors...
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="px-1 py-1 text-xs text-gray-500">
              No vendors found matching "{vendorSearch.searchValue}"
            </div>
          ) : (
            filteredVendors.map((vendor) => (
              <SelectItem
                key={vendor.vendor_id}
                value={vendor.vendor_name}
                className="cursor-pointer data-[highlighted]:bg-blue-500 data-[highlighted]:text-white"
              >
                {vendor.vendor_name}
              </SelectItem>
            ))
          )}

          {formData.vendor &&
            !vendorsData.some((v) => v.vendor_name === formData.vendor) && (
              <SelectItem
                key={`fetched-${formData.vendor}`}
                value={formData.vendor}
              >
                {formData.vendor}
              </SelectItem>
            )}
        </SelectContent>
      </Select>
    </div>
  </div>
</div>


         {/* Vehicle No */}
<div className="flex items-center gap-1">
  <span className="text-xs text-black w-20">Vehicle No</span>
  <div className="flex gap-1 w-36">
    <Input
      autoComplete="off"
      name="vehicleNo"
      value={formData.vehicleNo}
      onChange={handleChange}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();

          if (formData.firstWeight && formData.firstWeight.trim() !== "") {
            // Agar first weight hai → supplierWeight pe focus
            supplierWeightRef.current?.focus();
          } else {
            // Agar first weight nahi hai → PO No pe focus
            poNoRef.current?.focus();
          }
        }
      }}
     className={`h-7 text-xs text-black w-full 
  !border !border-gray-400 rounded px-1 
  focus:!border-black
  ${
    onlineMode && igpDataFetched && !isEditMode
      ? "bg-gray-100 cursor-not-allowed"
      : ""
  }
`}
      readOnly={
  formData.isFirstWeightSaved === true && 
  formData.isSecondWeightSaved === true && 
  String(formData.status).trim().toUpperCase() === "ONLINE"
}
      

    />
  </div>
</div>

          {/* Weight */}
          
        </div>

        {/* Third Column */}
        <div className="space-y-2">
          {/* Supplier Weight */}
         <div className="flex items-center gap-1.5">
  <span className="text-xs text-black w-20">Supplier Weight</span>
  <Input
    autoComplete="off"
    ref={supplierWeightRef}
    name="supplierWeight"
    value={formData.supplierWeight}
    onChange={handleChange}
    className="h-7 text-xs text-black w-32 
           !border !border-gray-400 rounded px-1 
           focus:!border-black"
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault(); // prevent default tab/enter behavior
        weightRef.current?.focus(); // move cursor to weight field
      }
    }}
         readOnly={
  formData.isFirstWeightSaved === true && 
  formData.isSecondWeightSaved === true && 
  String(formData.status).trim().toUpperCase() === "ONLINE"
}
  />
</div>


          {/* Supplier Weight - Bardana */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-black w-20">Supp Wt - Bardana</span>
            <Input
              autoComplete="off"
              name="supplierWeightMinusBardana"
              value={formData.supplierWeightMinusBardana}
              readOnly
             className="h-7 text-xs text-gray-400 bg-gray-100 w-32 
           !border !border-gray-400 rounded px-1 
           focus:!border-black"
            />
          </div>

          {/* Supplier Weight - Out Weight */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-black w-20">Supp Wt - Out Wt</span>
            <Input
              autoComplete="off"
              name="supplierWeightMinusOutWeight"
              value={formData.supplierWeightMinusOutWeight}
              readOnly
             className="h-7 text-xs text-gray-400 bg-gray-100 w-32 
           !border !border-gray-400 rounded px-1 
           focus:!border-black"
            />
          </div>

          {/* Bardana ID - Hidden but keeping functionality */}
          <div className="flex items-center gap-1" style={{ display: "none" }}>
            <span className="text-xs text-black w-20">Bardana ID</span>
            <Input
              name="bardanaTypeId"
              value={formData.bardanaTypeId || ""}
              onChange={handleChange} // optional, agar user edit nahi karega to remove bhi kar sakte ho
              className="h-7 text-xs text-black w-40"
            />
          </div>

          {/* Vendor ID - Hidden but keeping functionality */}
          <div className="flex items-center gap-1" style={{ display: "none" }}>
            <span className="text-xs text-black w-20">Vendor ID</span>
            <Input
              name="vendorId"
              value={formData.vendorId}
              onChange={handleChange}
              className="h-7 text-xs text-black w-40"
            />
          </div>

          {/* IGP ID - Hidden but keeping functionality */}
          <div className="flex items-center gap-1" style={{ display: "none" }}>
            <span className="text-xs text-black w-20">IGP ID</span>
            <Input
              name="igpId"
              value={formData.igpId}
              onChange={handleChange}
              className="h-7 text-xs text-black w-40"
            />
          </div>

          {/* Item ID - Hidden but keeping functionality */}
          <div className="flex items-center gap-1" style={{ display: "none" }}>
            <span className="text-xs text-black w-20">Item ID</span>
            <Input
              name="itemId"
              value={formData.itemId}
              onChange={handleChange}
              className="h-7 text-xs text-black w-40"
            />
          </div>


          <div className="flex items-center gap-1">
            <span className="text-xs text-black w-16">Weight</span>
            <div className="flex gap-1 w-36">
              {/* Select should ALWAYS show */}
             <Select
  name="weight"
  value={formData.weight}
  onValueChange={(value) => {
    setFormData((prev) => ({ ...prev, weight: value }));

    
     // 👇 direct next field focus
    setTimeout(() => {
      bagsRef.current?.focus();
    }, 50);
  }}
>

                <SelectTrigger ref={weightRef} className="h-7 text-xs text-black flex-1 
           !border !border-gray-400 rounded px-1 
           focus:!border-black">
  <SelectValue placeholder="Select weight" className="text-black" />
</SelectTrigger>


                <SelectContent>
                  {percentageData.length > 0 ? (
                    percentageData.map((item, index) => (
                      <SelectItem
                        key={index}
                        value={item.data_config_desc || `value-${index}`}
                          className="
    cursor-pointer
    data-[highlighted]:bg-blue-500
    data-[highlighted]:text-white
  "
                      >
                        {item.data_config_desc || `Value ${index}`}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>
                      No data available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              {/* Bags Input */}
           <Input
             autoComplete="off"
  ref={bagsRef}
  name="bags"
  value={formData.bags}
  onChange={handleChange}
  className="h-7 text-xs text-black w-20 
           !border !border-gray-400 rounded px-1 
           focus:!border-black"
  placeholder="Bags"
/>

              {/* Checkbox (no effect on weight field now) */}
              <div className="flex items-center gap-0.5">
                <label className="flex items-center gap-0.5 relative z-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPercentageMode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isPercentageMode: e.target.checked,
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-xs text-black">%</span>
                </label>
              </div>
            </div>
          </div>

          {/* Deduction Button */}
          <div className="mt-2 flex justify-center">
            <Button
              className="h-8 px-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDeduction}
    disabled={loading || disableSaveButton}

            >
              Deduction+
            </Button>
          </div>
        </div>
      </div>

      {/* Compact Table with IGP Data - aligned with master form */}
      <div
        className="border rounded text-xs h-[calc(100%-200px)] overflow-auto mt-4 ml-4"
        style={{ width: "calc(100% - 1.8rem)" }}
      >
        <table className="w-full text-center font-bold text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="border p-1 text-xs text-black">Po No</th>
              <th className="border p-1 text-xs text-black">Item Code</th>
              <th className="border p-1 text-xs text-black">Item Description</th>
              <th className="border p-1 text-xs text-black">PO Quantity</th>
              <th className="border p-1 text-xs text-black">IGP Quantity</th>
              <th className="border p-1 text-xs text-black">Balance Quantity</th>
            </tr>
          </thead>
          <tbody>
            {igpItems.length > 0 ? (
              igpItems.map((item: any, index: number) => {
                const poQty = parseFloat(item.po_qty) || 0;
                const igpQty = parseFloat(item.igp_qty) || 0;
                const balanceQty = poQty - igpQty;

                // Check if we're in edit mode for this row
                const isEditingRow = isEditMode;

                return (
                  <tr key={index}>
                    {/* PO No - editable in edit mode */}
                    <td className="border p-1 h-4 text-xs text-black">
                      {isEditingRow ? (
                      <Input
                        autoComplete="off"
  ref={poNoRef}
  name="poNo"
  value={formData.poNo}
  onChange={handleChange}
  className="h-7 text-xs text-black w-full"
/>

                      ) : (
                        item.po_no || ""
                      )}
                    </td>

                    {/* Item Code - editable dropdown in edit mode */}
                  <td className="border p-1 h-4 text-xs text-black">
                      {isEditingRow ? (
                        <Select
                          name="itemCode"
                          value={formData.itemCode || item.item_code || ""} // ✅ Both sources se value lo
                           disabled={
        formData.isFirstWeightSaved === true && 
        formData.isSecondWeightSaved === true && 
        String(formData.status).trim().toUpperCase() === "ONLINE"
      }
                          onOpenChange={(open) => setOpenDropdown(open)}
                          onValueChange={(value) => {
                            const selectedItem = invItems.find(
                              (item) => item.item_code === value
                            );
                            setFormData((prev) => ({
                              ...prev,
                              itemCode: value || "",
                              itemDesc: selectedItem?.item_desc || "",
                              itemId: selectedItem?.item_id
                                ? String(selectedItem.item_id)
                                : "",
                            }));
                          }}
                        >
                          <SelectTrigger
                            ref={selectRef}
                            className="h-4 text-xs text-black w-full border-none bg-transparent"
                            onFocus={() => setActiveLOV("item")}
                          >
                            <SelectValue
                              placeholder="Select item code"
                              className="text-black"
                            >
                              {/* ✅ Custom display for existing value */}
                              {formData.itemCode || item.item_code || "Select item code"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <div className="px-2 py-1 sticky top-0 bg-white z-10 border-b">
                              <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search Item Code or Name..."
                                value={itemSearch.searchValue}
                                onChange={(e) => itemSearch.setSearchValue(e.target.value)}
                                onMouseDown={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                                className="h-8 text-sm border-gray-300 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                autoComplete="off"
                              />
                            </div>
                            {invItems.length === 0 ? (
                              <div className="px-2 py-1 text-xs text-gray-500">
                                Loading items...
                              </div>
                            ) : filteredInvItems.length === 0 ? (
                              <div className="px-2 py-1 text-xs text-gray-500">
                                No items found matching "{itemSearch.searchValue}"
                              </div>
                            ) : (
                              <>
                                {/* ✅ First option: Current selected item (if exists) */}
                                {(formData.itemCode || item.item_code) && (
                                  <div className="px-2 py-1 text-xs text-blue-600 bg-blue-50 border-b">
                                    Current: {formData.itemCode || item.item_code}
                                  </div>
                                )}

                                {/* All other items */}
                                {filteredInvItems.map((itemOption, index) => (
                                  <SelectItem
                                    key={itemOption.item_id}
                                    value={itemOption.item_code}
                                   className="
    cursor-pointer
    hover:bg-blue-500
    hover:text-white
    focus:bg-blue-500
    focus:text-white
  "
>
                                    {itemOption.item_code} - {itemOption.item_desc}
                                  </SelectItem>
                                ))}
                              </>
                            )}
                            {invItems.length > 0 && (
                              <div className="px-2 py-1 text-xs text-gray-500 border-t">
                                {itemSearch.searchValue
                                  ? `Showing ${filteredInvItems.length} matches`
                                  : `Showing ${filteredInvItems.length} of ${invItems.length} items (search to see all)`}
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      ) : (
                        item.item_code || "" // Read-only mode mein existing value show karein
                      )}
                    </td>

                    {/* Item Description - editable in edit mode */}
                    <td className="border p-1 h-4 text-xs text-black">
                      {isEditingRow ? (
                        <Input
                          name="itemDesc"
                          value={formData.itemDesc}
                          onChange={handleChange}
                          className="h-4 text-xs text-black w-full border-none bg-transparent"
                          placeholder="Auto-filled from Item Code"
                                readOnly={
  formData.isFirstWeightSaved === true && 
  formData.isSecondWeightSaved === true && 
  String(formData.status).trim().toUpperCase() === "ONLINE"
}
                        />
                      ) : (
                        item.item_desc || ""
                      )}
                    </td>

                    {/* PO Quantity - editable in edit mode */}
                    <td className="border p-1 h-4 text-xs text-black">
                      {isEditingRow ? (
                        <Input
                          name="poQty"
                          value={formData.poQty}
                          onChange={handleChange}
                          className="h-4 text-xs text-black w-full border-none bg-transparent"
                          placeholder="PO Qty"
                         // type="number"
                        />
                      ) : (
                        poQty.toFixed(2)
                      )}
                    </td>

                    {/* IGP Quantity - editable in edit mode */}
                    <td className="border p-1 h-4 text-xs text-black">
                      {isEditingRow ? (
                        <Input
                          autoComplete="off"
                          name="igpQty"
                          value={formData.igpQty}
                          onChange={handleChange}
                          className="h-4 text-xs text-black w-full border-none bg-transparent"
                          placeholder="IGP Qty"
                          //type="number"
                        />
                      ) : (
                        igpQty.toFixed(2)
                      )}
                    </td>

                    {/* Balance Quantity - editable in edit mode */}
                    <td className="border p-1 h-4 text-xs text-black">
                      {isEditingRow ? (
                        <Input
                          autoComplete="off"
                          name="balanceQty"
                          value={formData.balanceQty}
                          onChange={handleChange}
                          className="h-4 text-xs text-black w-full border-none bg-transparent"
                          placeholder="Balance"
                         // type="number"
                        />
                      ) : (
                        balanceQty.toFixed(2)
                      )}
                    </td>
                  </tr>
                );
              })
            ) : onlineMode ? (
              <tr>
                <td className="border p-1 h-4 text-xs text-black" colSpan={6}>
                  {isEditMode ? "Loading saved record data..." : "No IGP data available"}
                </td>
              </tr>
            ) : (
              // This is for NEW entry (not edit mode)
              <tr>
                <td className="border p-1 h-4 text-xs text-black">
                 <Input
                   autoComplete="off"
  ref={poNoRef}
  name="poNo"
  value={formData.poNo}
  onChange={handleChange}
  className="h-7 text-xs text-black w-full"
/>

                </td>


                
  <td className="border p-1 h-4 text-xs text-black">
                  <Select
                    name="itemCode"
                    value={formData.itemCode}
                    onOpenChange={(open) => setOpenDropdown(open)}
                 onValueChange={(value) => {
  const selectedItem = invItems.find(
    (item) => item.item_code === value
  );

  setFormData((prev) => ({
    ...prev,
    itemCode: value || "",
    itemDesc: selectedItem?.item_desc || "",
    itemId: selectedItem?.item_id
      ? String(selectedItem.item_id)
      : "",
  }));

  // ✅ Proper focus shift after dropdown fully closes
  requestAnimationFrame(() => {
    setTimeout(() => {
      poQtyRef.current?.focus();
    }, 50);
  });
}}


                  >
                    <SelectTrigger
                      ref={selectRef}
                      className="h-4 text-xs text-black w-full border-none bg-transparent"
                      onFocus={() => setActiveLOV("item")}
                    >
                      <SelectValue
                        placeholder="Select item code"
                        className="text-black"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1 sticky top-0 bg-white z-10 border-b">
                        <Input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Search Item Code or Name..."
                          value={itemSearch.searchValue}
                          onChange={(e) => itemSearch.setSearchValue(e.target.value)}
                          onMouseDown={(e) => e.stopPropagation()}
                         onKeyDown={(e) => {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") {
    e.stopPropagation();
  }
}}
                          className="h-8 text-sm border-gray-300 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          autoComplete="off"
                        />
                      </div>
                      {invItems.length === 0 ? (
                        <div className="px-2 py-1 text-xs text-gray-500">
                          Loading items...
                        </div>
                      ) : filteredInvItems.length === 0 ? (
                        <div className="px-2 py-1 text-xs text-gray-500">
                          No items found matching "{itemSearch.searchValue}"
                        </div>
                      ) : (
                        filteredInvItems.map((item, index) => (
                          <SelectItem
                            key={item.item_id}
                            value={item.item_code}
                            className="
    cursor-pointer
    hover:bg-blue-500
    hover:text-white
    focus:bg-blue-500
    focus:text-white
  "
>
                            {item.item_code} - {item.item_desc}
                          </SelectItem>
                        ))
                      )}
                      {invItems.length > 0 && (
                        <div className="px-2 py-1 text-xs text-gray-500 border-t">
                          {itemSearch.searchValue
                            ? `Showing ${filteredInvItems.length} matches`
                            : `Showing ${filteredInvItems.length} of ${invItems.length} items (search to see all)`}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </td>

                <td className="border p-1 h-4 text-xs text-black">
                  <Input
                    name="itemDesc"
                    value={formData.itemDesc}
                    onChange={handleChange}
                    className="h-4 text-xs text-black w-full border-none bg-transparent"
                    placeholder="Auto-filled from Item Code"
                  />
                </td>
                <td className="border p-1 h-4 text-xs text-black">
                 <Input
                   autoComplete="off"
  ref={poQtyRef}
  name="poQty"
  value={formData.poQty}
  onChange={handleChange}
  className="h-4 text-xs text-black w-full"
/>

                </td>
                <td className="border p-1 h-4 text-xs text-black">
                  <Input
                    autoComplete="off"
                    name="igpQty"
                    value={formData.igpQty}
                    onChange={handleChange}
                    className="h-4 text-xs text-black w-full border-none bg-transparent"
                    placeholder="IGP Qty"
                    //type="number"
                  />
                </td>
                <td className="border p-1 h-4 text-xs text-black">
                  <Input
                    name="balanceQty"
                    value={formData.balanceQty}
                    onChange={handleChange}
                    className="h-4 text-xs text-black w-full border-none bg-transparent"
                    placeholder="Balance"
                  //  type="number"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )}

  {/* Show Sales Form when selectedForm is 'sales' */}
  {selectedForm === "sales" && (
    <div className="h-full flex flex-col">
      {/* Sales form content will go here */}
      <div className="text-center p-4">
        <p>Sales form functionality coming soon</p>
      </div>
    </div>
  )}

  {/* Show Offline Form when selectedForm is 'offline' */}
  {selectedForm === "offline" && (
    <div className="h-full flex flex-col" style={{ maxWidth: "100%", width: "100%" }}>
      <div
        className="bg-white p-4 rounded border"
        style={{ maxWidth: "100%", width: "100%" }}
      >
        <h3 className="text-lg font-semibold mb-4 text-black">
          Purchase Offline Entries
        </h3>

        {/* Optimized offline entries table with limited results */}
        <div
          className="overflow-auto"
          style={{ maxHeight: "600px", height: "600px" }}
        >
          <table className="w-full text-sm border-collapse border border-black">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left border border-black text-black">
                  Slip No
                </th>
                <th className="px-3 py-2 text-left border border-black text-black">
                  Slip Date
                </th>
                <th className="px-3 py-2 text-left border border-black text-black">
                  Entry Type
                </th>
                <th className="px-3 py-2 text-left border border-black text-black">
                  First Weight
                </th>
                <th className="px-3 py-2 text-left border border-black text-black">
                  Second Weight
                </th>
                <th className="px-3 py-2 text-left border border-black text-black">
                  Vehicle No
                </th>
                <th className="px-3 py-2 text-left border border-black text-black">
                  Company Name
                </th>
                <th className="px-3 py-2 text-left border border-black text-black">
                  Manual Trans #
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(offlineRecords) && offlineRecords.length > 0 ? (
                offlineRecords.slice(0, 5).map((record: any) => (
                  <OfflineRecordRow key={record.wb_id} record={record} />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-black border border-black"
                  >
                    No offline records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>{" "}
          {offlineRecords.length > 5 && (
            <div className="text-center py-2 text-gray-600 text-sm">
              Showing 5 of {offlineRecords.length} records. Use search to find specific
              entries.
            </div>
          )}
        </div>
      </div>
    </div>
  )}
</div>

            {/* Right Side - Weight Display and Bag Table (Columns 9-12) */}
            <div className="col-span-4">
              {/* This section will contain the right side components */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Memoized offline record row component for better performance
const OfflineRecordRow = React.memo(({ record }: { record: any }) => {
  const handleClick = useCallback(() => {
    console.log("Clicked offline record:", record);
    console.log("wb_id:", record.wb_id);
    console.log("entry_type:", record.entry_type);
    console.log("offline_entry:", record.offline_entry);

    if (record.wb_id) {
      const isOfflineEntry = record.offline_entry === "Yes";
      const modeParam = isOfflineEntry ? "offline" : "online";

      // Navigate based on entry type
      if (record.entry_type === "SALE") {
        const targetUrl = `/sales-form?type=${modeParam}&edit=${record.wb_id}`;
        console.log("Navigating to sales form:", targetUrl);
        window.location.href = targetUrl;
      } else if (record.entry_type === "SALE_RETURN") {
        const targetUrl = `/sales-return?type=${modeParam}&edit=${record.wb_id}`;
        console.log("Navigating to sales return form:", targetUrl);
        window.location.href = targetUrl;
      } else if (record.entry_type === "PURCHASE_RETURN") {
        const targetUrl = `/purchase-return?type=${modeParam}&edit=${record.wb_id}`;
        console.log("Navigating to purchase return form:", targetUrl);
        window.location.href = targetUrl;
      } else {
        const targetUrl = `/purchase-form?form=purchase&type=${modeParam}&edit=${record.wb_id}`;
        console.log("Navigating to purchase form:", targetUrl);
        window.location.href = targetUrl;
      }
    }
  }, [record]);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-3 py-2 border border-black text-black">
        <button
          className="text-blue-600 hover:text-blue-800 font-medium underline"
          onClick={handleClick}
        >
          {record.slip_no}
        </button>
      </td>
      <td className="px-3 py-2 border border-black text-black">
        {record.slip_in_time
          ? new Date(record.slip_in_time).toLocaleDateString()
          : "---"}
      </td>
      <td className="px-3 py-2 border border-black text-black">
        {record.entry_type || "PURCHASE"}
      </td>
      <td className="px-3 py-2 border border-black text-black">
        {record.first_weight || "---"}
      </td>
      <td className="px-3 py-2 border border-black text-black">
        {record.second_weight || "---"}
      </td>
      <td className="px-3 py-2 border border-black text-black">
        {record.vehicle_no || "---"}
      </td>
      <td className="px-3 py-2 border border-black text-black">
        {record.vendor_name || "---"}
      </td>
      <td className="px-3 py-2 border border-black text-black">---</td>
    </tr>
  );
});

PurchaseForm.displayName = "PurchaseForm";
OfflineRecordRow.displayName = "OfflineRecordRow";

export default PurchaseForm;
