import React, { useState, useEffect } from "react";
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
import WeightIndicator from "@/components/weight-indicator";
import VideoStreamFullscreen from "@/components/video-stream-fullscreen";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useComPort } from "@/Comportcontext";

export default function PurchaseReturnForm() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchSlipNo, setSearchSlipNo] = useState("");
  const [searchVehicleNo, setSearchVehicleNo] = useState("");
  const [activeTab, setActiveTab] = useState("purchase");
  const [selectedForm, setSelectedForm] = useState<
    "purchase" | "sales" | "offline"
  >("purchase");
  const [isReturnMode, setIsReturnMode] = useState(true); // Always true for return form

  // Deduction/Bag table state
  const [bagTableData, setBagTableData] = useState<any[]>([]);
  const [percentageMode, setPercentageMode] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const searchParams = new URLSearchParams(location.split("?")[1]);
    const currentType = searchParams.get("type");
    const returnParam = searchParams.get("return");
    console.log("Type param changed:", currentType);
    console.log("Return param:", returnParam);
    setIsReturnMode(true); // Always true for return form
  }, [location]);

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
    })),
  );
  const [nextBagId, setNextBagId] = useState(1);

  const { comPort } = useComPort();

  const handleSalesDataChange = (
    index: number,
    field: string,
    value: string,
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

  // Fetch all purchase return records
  const { data: firstWeightRecords = [] } = useQuery({
    queryKey: [
      "/api/purchase/first-weight-records?entry_type=Purchase%20Return",
    ],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch offline records specifically
  const { data: offlineRecords = [] } = useQuery({
    queryKey: ["/api/purchases/offline"],
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  // Filter records based on search criteria
  const filteredRecords = Array.isArray(firstWeightRecords)
    ? firstWeightRecords.filter((record: any) => {
        const matchesSlipNo =
          !searchSlipNo ||
          (record.slip_no || "")
            .toString()
            .toLowerCase()
            .includes(searchSlipNo.toLowerCase());
        const matchesVehicleNo =
          !searchVehicleNo ||
          (record.vehicle_no || "")
            .toString()
            .toLowerCase()
            .includes(searchVehicleNo.toLowerCase());
        return matchesSlipNo && matchesVehicleNo;
      })
    : [];

  // Print report function
  const handlePrintReport = () => {
    if (!formData.slipNo) {
      alert("Please save the record first or load an existing slip to print");
      return;
    }

    // Create print window with report data
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print the report");
      return;
    }

    const reportHTML = generateReportHTML();
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.print();
  };

  // Generate HTML for the weighbridge report
  const generateReportHTML = () => {
    const currentDate = new Date()
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      })
      .toUpperCase()
      .replace(/\s/g, "-");

    const currentTime = new Date().toLocaleTimeString("en-GB", {
      hour12: false,
    });

    return `
   <!DOCTYPE html>
  <html>
  <head>
    <title>Purchase Return Slip - ${formData.slipNo}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 10px; font-size: 10px; }
      .page-container { height: 150vh; display: flex; flex-direction: column; }

      .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
      .copy-label { font-weight: bold; }
      .print-date { font-size: 10px; }

      .slip-section { 
        border: 2px solid #000; 
        margin-bottom: 10px; 
        padding: 10px; 
        height: 150vh;
        box-sizing: border-box;
      }

      .image-box {
        border: 1px solid #ccc;
        width: 150px;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f8f8f8;
        font-size: 10px;
        font-weight: bold;
        text-align: center;
        overflow: hidden;
        position: relative;
      }

      .image-box img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .company-name { font-size: 14px; font-weight: bold; margin-bottom: 3px; text-align: center; }
      .slip-title { font-size: 12px; font-weight: bold; margin-bottom: 8px; text-align: center; }

      .two-column { display: flex; justify-content: space-between; margin-bottom: 5px; }
      .left-section, .right-section { 
        width: 45%; 
        border: 1px solid #666; 
        padding: 5px; 
        border-radius: 3px;
      }

      .commodity-gross-row {
        display: flex; 
        justify-content: space-between; 
        gap: 20px; 
        margin: 20px 0;
      }

      .section-box {
        flex: 1;
        border: 1px solid #666;
        padding: 10px;
        border-radius: 3px;
        display: flex;
        justify-content: space-between;
        gap: 10px;
      }

      .fields {
        display: grid; 
        row-gap: 6px;
      }

      .fields div {
        display: flex;
        gap: 4px;
      }

      .label {
        font-weight: bold;
        width: 160px;
      }

      .value {
        font-weight: bold;
      }

      .signatures {
        margin-top: 30px;
        margin-bottom: 30px;
        display: flex;
        justify-content: space-between;
        text-align: center;
      }

      .signature-block {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .signature-line {
        border-bottom: 1px solid #000;
        width: 100px;
        margin-bottom: 5px;
      }

      @media print { 
        body { margin: 0; } 
        .slip-section { page-break-inside: avoid; }
        .page-container { page-break-after: auto; }
      }
    </style>
  </head>
  <body>
    <div class="page-container">

      <!-- Head Office Copy -->
      <div class="slip-section">
        <div class="header">
          <div class="copy-label">Head Office Copy - Purchase Return</div>
          <div class="print-date">Print Date: ${currentDate} ${currentTime}</div>
        </div>
        <div class="company-name">MULTAN FEEDS   Mill</div>
        <div style="height: 10px;"></div>
        <div class="slip-title">PURCHASE RETURN SLIP</div>

        <div><b>IGP #</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span class="value">${formData.igpNo || ""}</span></div>

        <div class="two-column">
          <div class="left-section">
            <div style="margin-top: 10px;">W.B # &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${formData.slipNo || ""}</div>
            <div style="margin-top: 10px;">Truck # &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${formData.vehicleNo || ""}</div>
            <div style="margin-top: 10px;">Freight Payment &nbsp;&nbsp;&nbsp;&nbsp; ${formData.freight || ""}</div>
          </div>
          <div class="right-section">
            <div>Party: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>${formData.vendor || ""}</b></div>
            <div style="margin-top: 10px;">Time IN: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${formData.slipInTime ? new Date(formData.slipInTime).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).toUpperCase().replace(/,/, "") : ""}</div>
            <div style="margin-top: 10px;">Time OUT: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${formData.slipOutTime ? new Date(formData.slipOutTime).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).toUpperCase().replace(/,/, "") : ""}</div>
          </div>
        </div>

        <!-- Commodity + Gross Weight Section in One Row -->
        <div class="commodity-gross-row">
          <!-- Commodity Section -->
          <div class="section-box">
            <div class="fields">
              <div><span class="label">COMMODITY</span><span class="value">${formData.itemDesc || ""}</span></div>
              <div><span class="label">QUANTITY</span><span class="value">${formData.noOfBags || ""}</span></div>
              <div><span class="label">BAG CONDITION</span><span class="value">${formData.bagCondition || ""}</span></div>
              <div><span class="label">BAG TYPE</span><span class="value">${formData.bardanaType || ""}</span></div>
              <div><span class="label">AVG. WEIGHT</span><span class="value">${formData.wtPerBag || ""}</span></div>
              <div><span class="label">RETURN REASON</span><span class="value">${formData.returnReason || ""}</span></div>
            </div>
            <div class="image-box">
              <img src="/captured_images/first_weight/slip_${formData.slipNo}.jpg"
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                   alt="First Weight Image" />
              <div style="display: none; color: #666; font-size: 10px;">No Image Available</div>
            </div>
          </div>

          <!-- Gross Weight Section -->
          <div class="section-box">
            <div class="fields">
              <div><span class="label">GROSS WEIGHT</span> ${formData.firstWeight || "0"}</div>
              <div><span class="label">TARE WEIGHT</span> ${formData.secondWeight || "0"}</div>
              <div><span class="label">WITH BARDANA WEIGHT</span> ${formData.grossWeight || "0"}</div>
              <div><span class="label">BARDANA WEIGHT</span> ${formData.bardanaWeight || "0"}</div>
              <div><span class="label">QUALITY DEDUCTION</span> ${formData.qualityDeduction || "0"}</div>
              <div><span class="label">NET WEIGHT</span> ${formData.netWeight || "0"}</div>
            </div>
            <div class="image-box">
              <img src="/captured_images/second_weight/slip_${formData.slipNo}.jpg"
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                   alt="Second Weight Image" />
              <div style="display: none; color: #666; font-size: 10px;">No Image Available</div>
            </div>
          </div>
        </div>

        <!-- Signatures -->
        <div class="signatures">
          <div class="signature-block">
            <div class="signature-line"></div>
            <div>Weight By</div>
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
  </body>
  </html>
`;
  };

  // Function to get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const initialFormData = {
    // Basic slip information
    slipNo: "",
    slipInTime: "",
    slipOutTime: "",
    slipDate: "",
    status: "",
    entryType: "Purchase Return",
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
    po_no: "",
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
    customerId: "",
    customerName: "",
    // Return specific fields
    returnReason: "",
    returnDate: "",
    originalSlipNo: "",
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
    // Missing fields that are referenced in the code
    qualityDed: "",
    weight: "",
    bags: "",
    wbItemPId: "",
    itemId: "",
    poId: "",
    baradanaType: "",
    manualIgpNo: "",
    igpId: "",
    vendorId: "",
    weightPerBags: "",
    dcQty: "",
    supWeightWithoutBardana: "",
    netSupplierWeight: "",
    isPercentageMode: false,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingWbId, setEditingWbId] = useState<number | null>(null);

  const [onlineMode, setOnlineMode] = useState(() => {
    // Initialize based on URL parameter immediately
    const urlParams = new URLSearchParams(window.location.search);
    const typeMode = urlParams.get("type");
    console.log("Initial state calculation - typeMode:", typeMode);
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

  // Auto-calculate formulas when relevant fields change
  useEffect(() => {
    const firstWeight = parseFloat(formData.firstWeight) || 0;
    const secondWeight = parseFloat(formData.secondWeight) || 0;
    const wtPerBag = parseFloat(formData.wtPerBag) || 0;
    const noOfBags = parseFloat(formData.noOfBags) || 0;

    // Bardana Weight = weight per bag * number of bags
    const bardanaWeight = wtPerBag * noOfBags;

    // Gross Weight = First Weight - Second Weight
    const grossWeight = firstWeight - secondWeight;

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const numericFields = [
      "firstWeight",
      "secondWeight",
      "netWeight",
      "bardanaWeight",
      "grossWeight",
      "freight",
      "companyId",
      "branchId",
      "createdBy",
      "lastUpdatedBy",
      "wtPerBag",
      "noOfBags",
    ];

    if (numericFields.includes(name)) {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
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
  };

  const toggleOnlineMode = (isOnline: boolean) => {
    console.log(
      "toggleOnlineMode called with:",
      isOnline,
      "Current onlineMode:",
      onlineMode,
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

  // Handle URL parameters for edit mode and form type
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editWbId = urlParams.get("edit");
    const typeMode = urlParams.get("type");

    console.log("URL parameters:", { editWbId, typeMode });

    // Set online/offline mode based on type parameter
    if (typeMode === "offline") {
      console.log("Setting OFFLINE mode from URL parameter");
      setOnlineMode(false);
    } else if (typeMode === "online") {
      console.log("Setting ONLINE mode from URL parameter");
      setOnlineMode(true);
    }

    // Check if this is a page reload by checking if we have edit mode in sessionStorage
    const wasInEditMode =
      sessionStorage.getItem("purchaseReturnEditMode") === "true";

    // Clear any previous edit mode state from sessionStorage on every page load
    sessionStorage.removeItem("purchaseReturnEditMode");

    // If we were in edit mode and page was reloaded, clear edit parameter and reset to new form
    if (wasInEditMode && editWbId) {
      console.log(
        "Page reload detected while in edit mode, clearing edit parameter and resetting to new form",
      );
      // Clear edit parameter from URL
      urlParams.delete("edit");
      const newUrl = urlParams.toString()
        ? `${window.location.pathname}?${urlParams.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);

      // Reset to new form
      setIsEditMode(false);
      setEditingWbId(null);
      setTimeout(() => {
        resetFormToInitial();
      }, 100);
      return;
    }

    // Check if we should be in edit mode ONLY based on URL parameter (fresh navigation)
    if (editWbId && !wasInEditMode) {
      // Load record for editing by wb_id
      console.log("Edit mode detected from URL parameter, loading data");
      sessionStorage.setItem("purchaseReturnEditMode", "true");
      loadDataByWbId(parseInt(editWbId));
      return; // Exit early to prevent any other initialization
    } else {
      // No edit parameter in URL, always reset to new form
      console.log("No edit parameter in URL, resetting to new form");
      setIsEditMode(false);
      setEditingWbId(null);
      setTimeout(() => {
        resetFormToInitial();
      }, 100);
      return;
    }
  }, [location]);

  useEffect(() => {
    // Fetch next slip number based on return mode with enhanced retry logic
    const entryType = "PURCHASE_RETURN";

    const fetchSlipNumber = async (retryCount = 0) => {
      try {
        // First try to wake up database
        if (retryCount === 0) {
          try {
            await fetch("/api/db/wake");
            console.log("Database wake-up initiated for purchase return form");
          } catch (wakeError) {
            console.log("Database wake-up failed, continuing with slip fetch");
          }
        }

        const response = await fetch(
          `/api/purchases/next-slip?entry_type=${entryType}`,
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const nextSlip = data.nextSlipNo || "1";
        console.log(
          `✅ Fetched next slip number for Purchase Return: ${nextSlip}`,
        );
        setFormData((prev) => ({ ...prev, slipNo: nextSlip }));
      } catch (err: any) {
        console.error(
          `Error fetching next slip number for Purchase Return (attempt ${retryCount + 1}):`,
          err,
        );

        if (retryCount < 2) {
          // Retry after delay
          setTimeout(
            () => fetchSlipNumber(retryCount + 1),
            (retryCount + 1) * 1000,
          );
        } else {
          // Generate a timestamp-based slip number as fallback
          const fallbackSlip = Date.now().toString().slice(-6);
          console.log(
            `Using fallback slip number for Purchase Return: ${fallbackSlip}`,
          );
          setFormData((prev) => ({ ...prev, slipNo: fallbackSlip }));
        }
      }
    };

    // Only fetch slip number if not in edit mode
    const urlParams = new URLSearchParams(window.location.search);
    const editWbId = urlParams.get("edit");

    if (!editWbId && !isEditMode && !editingWbId) {
      fetchSlipNumber();
    }

    // Fetch branches for dropdown
    fetch("/api/branches")
      .then((res) => res.json())
      .then((data: any[]) => {
        const branchData = Array.isArray(data) ? data : [];
        setBranches(branchData);
        console.log("Branches fetched:", data);

        // Set default branch based on logged-in user's branch
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
      })
      .catch((err: any) => {
        console.error("Error fetching branches:", err);
        setBranches([]);
      });

    const now = new Date().toISOString();
    setFormData((prev) => ({
      ...prev,
      slipInTime: now.slice(0, 16),
      creationDate: now,
      lastUpdatedDate: now,
      slipDate: now,
      returnDate: now.slice(0, 16),
    }));
  }, []);

  const captureFirstWeight = async () => {
    try {
      const response = await fetch("/api/weight/data");
      const weightData = await response.json();

      // Update the firstWeight field with current weight reading
      setFormData((prev) => ({
        ...prev,
        firstWeight: weightData.weight,
      }));
    } catch (error) {
      console.error("Error fetching weight data:", error);
      alert("Failed to capture weight reading");
    }
  };

  const captureSecondWeight = async () => {
    try {
      const response = await fetch("/api/weight/data");
      const weightData = await response.json();

      const currentTime = new Date().toISOString();

      // Update the secondWeight field with current weight reading and set slip_out_time
      setFormData((prev) => ({
        ...prev,
        secondWeight: weightData.weight,
        slipOutTime: currentTime.slice(0, 16), // Format for datetime-local input
      }));
    } catch (error) {
      console.error("Error fetching weight data:", error);
      alert("Failed to capture weight reading");
    }
  };


  

  const handleSave = async () => {
    setLoading(true);

    // Validate that first weight is not null/empty when saving
    if (
      !formData.firstWeight ||
      formData.firstWeight.trim() === "" ||
      parseFloat(formData.firstWeight) <= 0
    ) {
      alert("First weight is required and must be greater than 0");
      setLoading(false);
      return;
    }

    if (!formData.vehicleNo || formData.vehicleNo.trim() === "") {
      alert("Vehicle number is required");
      setLoading(false);
      return;
    }

    try {
      // Prepare master data payload
      const masterDataPayload = {
        slip_no: formData.slipNo || null,
        slip_in_time: formatISODate(formData.slipInTime),
        first_weight:
          formData.firstWeight && formData.firstWeight.trim() !== ""
            ? parseFloat(formData.firstWeight)
            : null,
        second_weight:
          formData.secondWeight && formData.secondWeight.trim() !== ""
            ? parseFloat(formData.secondWeight)
            : null,
        net_weight:
          formData.netWeight && formData.netWeight.trim() !== ""
            ? parseFloat(formData.netWeight)
            : null,
        bardana_weight:
          formData.bardanaWeight && formData.bardanaWeight.trim() !== ""
            ? parseFloat(formData.bardanaWeight)
            : null,
        gross_weight:
          formData.grossWeight && formData.grossWeight.trim() !== ""
            ? parseFloat(formData.grossWeight)
            : null,
        freight:
          formData.freight && formData.freight.trim() !== ""
            ? parseFloat(formData.freight)
            : null,
        remarks: formData.remarks || null,
        driver_name: formData.driverName || null,
        company_id:
          formData.companyId &&
          formData.companyId !== "undefined" &&
          formData.companyId.trim() !== ""
            ? parseInt(formData.companyId, 10)
            : null,
        branch_id:
          formData.branchId &&
          formData.branchId !== "undefined" &&
          formData.branchId.trim() !== ""
            ? parseInt(formData.branchId, 10)
            : null,
        online_entry:
          formData.onlineEntry === "Yes" || formData.onlineEntry === true
            ? "Yes"
            : null,
        offline_entry:
          formData.offlineEntry === "Yes" || formData.offlineEntry === true
            ? "Yes"
            : null,
        created_by: user?.userid || null,
        creation_date: formData.creationDate || null,
        last_updated_by: user?.userid || null,
        last_updated_date: new Date().toISOString(),
        manual_dc_no: formData.manualDcNo || null,
        slip_out_time: formatISODate(formData.slipOutTime),
        status: formData.status || null,
        slip_date: formData.slipDate || null,
        return_reason: formData.returnReason || null,
        return_date: formatISODate(formData.returnDate),
        original_slip_no: formData.originalSlipNo || null,
        vendor: formData.vendor || null,
        igp_no: formData.igpNo || null,
        item_desc: formData.itemDesc || null,
        no_of_bags:
          formData.noOfBags && formData.noOfBags.trim() !== ""
            ? parseInt(formData.noOfBags, 10)
            : null,
        wt_per_bag:
          formData.wtPerBag && formData.wtPerBag.trim() !== ""
            ? parseFloat(formData.wtPerBag)
            : null,
        bardana_type: formData.bardanaType || null,
        vehicle_no: formData.vehicleNo || null,
      };

      // Choose endpoint based on edit mode
      const endpoint = isEditMode
        ? `/api/purchase-return/update/${editingWbId}`
        : "/api/purchase-return/save";
      const method = isEditMode ? "PUT" : "POST";

      // Save to backend
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          masterData: masterDataPayload,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to ${isEditMode ? "update" : "save"} purchase return data: ${errorText}`,
        );
      }

      const result = await response.json();
      console.log(
        `Purchase return data ${isEditMode ? "updated" : "saved"} successfully:`,
        result,
      );
      alert(
        `Purchase return data ${isEditMode ? "updated" : "saved"} successfully!`,
      );

      if (isEditMode) {
        // In edit mode, exit edit mode and clear URL parameter
        setIsEditMode(false);
        setEditingWbId(null);
        sessionStorage.removeItem("purchaseReturnEditMode");

        // Clear edit parameter from URL
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.delete("edit");
        const newUrl = urlParams.toString()
          ? `${window.location.pathname}?${urlParams.toString()}`
          : window.location.pathname;
        window.history.replaceState({}, "", newUrl);

        // Reset form to clean state
        await resetFormToInitial();
      } else {
        // For new entries, reset form to clean state
        await resetFormToInitial();
      }
    } catch (error: any) {
      console.error(
        `Error ${isEditMode ? "updating" : "saving"} purchase return data:`,
        error,
      );
      alert(
        `Failed to ${isEditMode ? "update" : "save"} purchase return data: ${error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    // When Clear button is pressed, clear everything except Slip No
    const currentSlipNo = formData.slipNo;
    setFormData({
      ...initialFormData,
      slipNo: currentSlipNo,
    });
    setIsEditMode(false);
    setEditingWbId(null);
  };

  // Function to reset form to clean state
  const resetFormToInitial = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeMode = urlParams.get("type");
    const isOfflineMode = typeMode === "offline";

    // Sync onlineMode state with URL parameter
    if (typeMode === "offline") {
      setOnlineMode(false);
    } else if (typeMode === "online") {
      setOnlineMode(true);
    }

    // Only fetch next slip number if not in edit mode AND not currently editing
    if (!isEditMode && !editingWbId) {
      // Fetch next slip number for Purchase Return entry type
      try {
        const response = await fetch(
          "/api/purchases/next-slip?entry_type=PURCHASE_RETURN",
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Reset form - next slip response:", data);
        const nextSlip = data.nextSlipNo || Date.now().toString().slice(-6);

        setFormData({
          ...initialFormData,
          slipNo: nextSlip,
          slipInTime: new Date().toISOString().slice(0, 16),
          onlineEntry: isOfflineMode ? "No" : "Yes",
          offlineEntry: isOfflineMode ? "Yes" : "No",
          entryType: "Purchase Return",
          creationDate: new Date().toISOString(),
          lastUpdatedDate: new Date().toISOString(),
          slipDate: new Date().toISOString(),
          returnDate: new Date().toISOString().slice(0, 16),
        });
      } catch (error) {
        console.error("Error fetching next slip number:", error);
        // Generate a timestamp-based slip number as fallback
        const fallbackSlip = Date.now().toString().slice(-6);
        setFormData({
          ...initialFormData,
          slipNo: fallbackSlip,
          slipInTime: new Date().toISOString().slice(0, 16),
          onlineEntry: isOfflineMode ? "No" : "Yes",
          offlineEntry: isOfflineMode ? "Yes" : "No",
          entryType: "Purchase Return",
          creationDate: new Date().toISOString(),
          lastUpdatedDate: new Date().toISOString(),
          slipDate: new Date().toISOString(),
          returnDate: new Date().toISOString().slice(0, 16),
        });
      }
    }

    setIsEditMode(false);
    setEditingWbId(null);
  };

  // Function to load data by wb_id for editing
  const loadDataByWbId = async (wbId: number) => {
    console.log(`Loading data for edit mode, wb_id: ${wbId}`);
    setLoading(true);
    setIsEditMode(true);
    setEditingWbId(wbId);
    try {
      const response = await fetch(`/api/purchase-return/${wbId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data for wbId: ${wbId}`);
      }
      const data = await response.json();

      // Ensure the data is properly structured
      if (data && data.masterData) {
        const masterData = data.masterData;

        // Format date strings correctly
        masterData.slipInTime = formatDatetimeLocal(masterData.slip_in_time);
        masterData.slipOutTime = formatDatetimeLocal(masterData.slip_out_time);
        masterData.slipDate = formatDatetimeLocal(masterData.slip_date);
        masterData.returnDate = formatDatetimeLocal(masterData.return_date);

        // Load existing deduction data for this record
        if (master.wb_id) {
          // loadDeductionData(master.wb_id); // Function not implemented yet
        }

        // Get detail data from wb_weighbridge_items_purchase table
        const detailData =
          data.details && data.details.length > 0 ? data.details[0] : {};

        setFormData({
          slipNo: masterData.slip_no || "",
          slipInTime: masterData.slipInTime || "",
          slipOutTime: masterData.slipOutTime || "",
          slipDate: masterData.slipDate || "",
          status: masterData.status || "",
          entryType: masterData.entry_type || "Purchase Return",
          firstWeight: masterData.first_weight
            ? String(masterData.first_weight)
            : "",
          secondWeight: masterData.second_weight
            ? String(masterData.second_weight)
            : "",
          netWeight: masterData.net_weight ? String(masterData.net_weight) : "",
          bardanaWeight: masterData.bardana_weight
            ? String(masterData.bardana_weight)
            : "",
          grossWeight: masterData.gross_weight
            ? String(masterData.gross_weight)
            : "",
          supplierWeight: masterData.supplier_weight
            ? String(masterData.supplier_weight)
            : "",
          supplierWeightMinusBardana: masterData.supplier_weight_minus_bardana
            ? String(masterData.supplier_weight_minus_bardana)
            : "",
          supplierWeightMinusOutWeight:
            masterData.supplier_weight_minus_out_weight
              ? String(masterData.supplier_weight_minus_out_weight)
              : "",
          qualityDeduction: masterData.quality_deduction
            ? String(masterData.quality_deduction)
            : "",
          vehicleNo: masterData.vehicle_no || detailData.vehicle_no || "",
          driverName: masterData.driver_name || "",
          // Load detail fields from wb_weighbridge_items_purchase table
          igpNo: detailData.igp_no || masterData.igp_no || "",
          igpDate: detailData.igp_date || masterData.igp_date || "",
          poNo: detailData.po_no || masterData.po_no || "",
          po_no: detailData.po_no || masterData.po_no || "",
          itemCode: detailData.item_code || masterData.item_code || "",
          itemDesc: detailData.item_desc || masterData.item_desc || "",
          poQty: detailData.po_qty || masterData.po_qty || "",
          igpQty: detailData.igp_qty || masterData.igp_qty || "",
          balanceQty: detailData.balance_qty || masterData.balance_qty || "",
          bardanaType: detailData.bardana_type || masterData.bardana_type || "",
          wtPerBag: detailData.weight_per_bags
            ? String(detailData.weight_per_bags)
            : masterData.wt_per_bag
              ? String(masterData.wt_per_bag)
              : "",
          noOfBags: detailData.no_of_bags
            ? String(detailData.no_of_bags)
            : masterData.no_of_bags
              ? String(masterData.no_of_bags)
              : "",
          bagCondition:
            detailData.bag_condition || masterData.bag_condition || "",
          bardanaTypeId:
            String(detailData.bardana_type_id || masterData.bardana_type_id) ||
            "",
          vendor: detailData.vendor_name || masterData.vendor || "",
          vendorName: detailData.vendor_name || masterData.vendor_name || "",
          customerId:
            String(detailData.customer_id || masterData.customer_id) || "",
          customerName:
            detailData.customer_name || masterData.customer_name || "",
          returnReason: masterData.return_reason || "",
          returnDate: masterData.returnDate || "",
          originalSlipNo: masterData.original_slip_no || "",
          wbId: String(masterData.wb_id) || "",
          companyId: String(masterData.company_id) || "",
          branchId: String(masterData.branch_id) || "",
          branch: String(masterData.branch_id) || "",
          onlineEntry: masterData.online_entry || "Yes",
          offlineEntry: masterData.offline_entry || "No",
          createdBy: String(masterData.created_by) || "",
          creationDate: masterData.creation_date || "",
          lastUpdatedBy: String(masterData.last_updated_by) || "",
          lastUpdatedDate: masterData.last_updated_date || "",
          manualDcNo: masterData.manual_dc_no || "",
          doId: masterData.do_id || "",
          doNo: masterData.do_no || "",
          doDate: masterData.do_date || "",
          freight: masterData.freight ? String(masterData.freight) : "",
          remarks: masterData.remarks || "",
          qualityDed: masterData.quality_ded || "",
          weight: masterData.weight || "",
          bags: masterData.bags || "",
          wbItemPId:
            String(detailData.wb_item_p_id || masterData.wb_item_p_id) || "",
          itemId: String(detailData.item_id || masterData.item_id) || "",
          poId: String(detailData.po_id || masterData.po_id) || "",
          baradanaType:
            detailData.baradana_type || masterData.baradana_type || "",
          manualIgpNo:
            detailData.manual_igp_no || masterData.manual_igp_no || "",
          igpId: String(detailData.igp_id || masterData.igp_id) || "",
          vendorId: String(detailData.vendor_id || masterData.vendor_id) || "",
          weightPerBags:
            detailData.weight_per_bags || masterData.weight_per_bags || "",
          dcQty: detailData.dc_qty || masterData.dc_qty || "",
          supWeightWithoutBardana: masterData.sup_weight_without_bardana || "",
          netSupplierWeight: masterData.net_supplier_weight || "",
          isPercentageMode: masterData.is_percentage_mode || false,
        });
      } else {
        alert("Invalid data format received for editing.");
      }
    } catch (error: any) {
      console.error("Error loading data for editing:", error);
      alert(`Error loading data for editing: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDatetimeLocal = (isoString: string) => {
    if (!isoString) return "";
    return isoString.slice(0, 16);
  };

  const formatISODate = (localString: string) => {
    if (!localString) return null;
    return new Date(localString).toISOString();
  };

  return (
    <div className="h-screen bg-gray-100 p-1 overflow-hidden relative">
      {/* Weight Display Table - Upper Right Side */}
      <div
        className={`absolute ${isEditMode ? "top-40" : "top-20"} right-3 z-50`}
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
            <div className="border-r border-gray-400 p-1">
              <Input
                placeholder="Search Slip No"
                value={searchSlipNo}
                onChange={(e) => setSearchSlipNo(e.target.value)}
                className="h-5 text-xs text-black placeholder:text-gray-500 bg-white border-gray-300"
              />
            </div>
            <div className="border-r border-gray-400 p-1">
              <Input
                placeholder="Search Vehicle"
                value={searchVehicleNo}
                onChange={(e) => setSearchVehicleNo(e.target.value)}
                className="h-5 text-xs text-black placeholder:text-gray-500 bg-white border-gray-300"
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
<div className="max-h-48 overflow-y-auto">
  {filteredRecords && filteredRecords.length > 0 ? (
    filteredRecords.map((record: any, index: number) => (
      <div
        key={index}
        className="grid grid-cols-3 border-b border-gray-400 hover:bg-gray-50"
      >
        {/* Slip No */}
        <button
          className="border-r border-gray-400 p-1 text-center text-xs text-blue-600 flex-1"
          onClick={() => {
            console.log("Clicked record:", record);
            console.log("wb_id:", record.wb_id);
            console.log("entry_type:", record.entry_type);

            if (record.wb_id) {
              const urlParams = new URLSearchParams(window.location.search);
              const typeMode = urlParams.get("type") || "online";

              if (record.entry_type === "PURCHASE") {
                const targetUrl = `/purchase-form?type=${typeMode}&edit=${record.wb_id}`;
                setLocation(targetUrl);
              } else if (record.entry_type === "PURCHASE_RETURN") {
                // Stay on purchase return form and load the data
                urlParams.set("edit", record.wb_id);
                const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
                window.history.replaceState({}, "", newUrl);
                sessionStorage.setItem("purchaseReturnEditMode", "true");
                loadDataByWbId(parseInt(record.wb_id));
              } else if (record.entry_type === "SALE") {
                const targetUrl = `/sales-form?type=${typeMode}&edit=${record.wb_id}`;
                setLocation(targetUrl);
              } else if (
                record.entry_type === "SALE_RETURN" ||
                record.entry_type === "SALES_RETURN"
              ) {
                const targetUrl = `/sales-return?type=${typeMode}&edit=${record.wb_id}`;
                console.log("Navigating to sales return form:", targetUrl);
                window.location.href = targetUrl;
              }
            }
          }}
        >
          {record.slip_no || "---"}
        </button>

        {/* Vehicle No */}
        <div className="border-r border-gray-400 p-1 text-center text-xs text-black flex-1">
          {record.vehicle_no || "---"}
        </div>

        {/* Entry Type */}
        <div className="p-1 text-center text-xs text-blue-600 font-semibold flex-1 truncate">
          {record.entry_type || "PURCHASE"}
        </div>
      </div>
    ))
  ) : (
    <div className="grid grid-cols-3 border-b border-gray-400">
      <div className="border-r border-gray-400 p-1 text-center text-xs text-gray-500 bg-white">
        {searchSlipNo || searchVehicleNo ? "No matches" : "No records"}
      </div>
      <div className="border-r border-gray-400 p-1 text-center text-xs text-gray-500 bg-white">
        ---
      </div>
      <div className="p-1 text-center text-xs text-gray-500 bg-white">---</div>
    </div>
  )}
</div>


          {/* Load Data Button
          <button
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 text-xs"
            onClick={() => window.location.reload()}
          >
            Load Data
          </button> */}
        </div>
      </div>

      {/* Edit Mode Indicator */}
      {isEditMode && (
        <div className="bg-blue-600 text-white p-1 rounded mb-2 text-center text-sm font-medium">
          EDIT MODE: Purchase Return Slip No. {formData.slipNo} (ID:{" "}
          {editingWbId})
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center bg-white border rounded p-1 mb-1">
        <div className="flex gap-1 text-xs">
          <Button
            className="h-7 px-1 text-sm font-medium bg-gray-300 hover:bg-gray-400 text-black"
            onClick={() => {
              // Navigate to purchase form with same type
              const urlParams = new URLSearchParams(window.location.search);
              const typeMode = urlParams.get("type") || "online";
              const targetUrl = `/purchase-form?type=${typeMode}`;
              window.history.pushState({}, "", targetUrl);
              setLocation(targetUrl);
            }}
          >
            Purchase
          </Button>
          <Button
            className="h-7 px-1 text-sm font-medium bg-gray-300 hover:bg-gray-400 text-black"
            onClick={() => {
              // Navigate to sales form with same type
              const urlParams = new URLSearchParams(window.location.search);
              const typeMode = urlParams.get("type") || "online";
              const targetUrl = `/sales-form?type=${typeMode}`;
              window.history.pushState({}, "", targetUrl);
              setLocation(targetUrl);
            }}
          >
            Sale
          </Button>
          <Button
            className="h-7 px-1 text-sm font-medium bg-gray-300 hover:bg-gray-400 text-black"
            onClick={() => {
              // Navigate to sales return form with same type
              const urlParams = new URLSearchParams(window.location.search);
              const typeMode = urlParams.get("type") || "online";
              const targetUrl = `/sales-return?type=${typeMode}`;
              window.history.pushState({}, "", targetUrl);
              setLocation(targetUrl);
            }}
          >
            Sales Return
          </Button>
          <Button className="h-8 px-2 text-sm font-medium bg-orange-700 text-white">
            Purchase Return
          </Button>
          <Button
            className="h-7 px-1 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium"
            onClick={() => setLocation("/edit-record")}
          >
            Edit
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 h-7 px-1 text-sm text-white font-medium"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
          <Button
            className="h-7 px-1 text-sm bg-purple-600 hover:bg-purple-700 text-white font-medium"
            onClick={handlePrintReport}
          >
            Print
          </Button>
          <Button
            className="h-7 px-1 text-sm bg-yellow-500 text-xs"
            onClick={resetForm}
          >
            Clear
          </Button>
        </div>
        <div className="flex items-center gap-1">
        {/* Weight Display - bigger and aligned left */}
        <div className="mr-4 transform scale-110">
          <WeightIndicator comPort={comPort} compact={true} />
        </div>
      
        {/* Buttons */}
        <div className="flex gap-2 ml-28">
          <button
            className={`h-7 px-2 text-sm font-medium rounded transition-colors ${
              onlineMode === true
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-300 hover:bg-gray-400 text-gray-600"
            }`}
            onClick={() => toggleOnlineMode(true)}
          >
            ONLINE
          </button>
      
          <button
            className={`h-7 px-2 text-sm font-medium rounded transition-colors ${
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
      {/* Main Form Layout */}
      <div className="bg-white p-1 rounded border h-[calc(100vh-60px)] overflow-hidden">
        <div className="grid grid-cols-12 gap-1 h-full">
          {/* Left Side - Main Form (Columns 1-8) */}
          <div className="col-span-8">
            {/* Master Table Section */}
            {/* Master Table Section */}
            <div className="bg-blue-50 p-1 rounded border mb-3">
              <div className="grid grid-cols-3 gap-x-2 gap-y-1">
                {/* Column 1 - Left Form Fields */}
                <div className="space-y-1">
                  <div>
                    <Label className="text-xs text-black">Slip No</Label>
                    <Input
                      name="slipNo"
                      value={formData.slipNo}
                      readOnly
                      className="h-7 w-32 text-xs text-black"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-black">
                      Original Slip No
                    </Label>
                    <Input
                      name="originalSlipNo"
                      value={formData.originalSlipNo}
                      onChange={handleChange}
                      className="h-7 w-32 text-xs text-black"
                      placeholder="Original slip"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-black">Vehicle No</Label>
                    <Input
                      name="vehicleNo"
                      value={formData.vehicleNo}
                      onChange={handleChange}
                      className="h-7 w-32 text-xs text-black"
                      placeholder="Vehicle number"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-black">Return Date</Label>
                    <Input
                      type="datetime-local"
                      name="returnDate"
                      value={formData.returnDate}
                      onChange={handleChange}
                      className="h-7 w-32 text-xs text-black"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-black">Return Reason</Label>
                     <Input
                     placeholder="Enter return reason"
                     name="returnReason"
                     value={formData.returnReason}
                     onChange={handleChange}
                     className="text-xs text-black placeholder:text-gray-500 h-[62px] w-[220px]"
                   />
                  </div>
                </div>

                {/* Column 2 - Weight Fields */}
                <div className="space-y-1">
                  <div>
                    <Label className="text-xs text-black">First Weight</Label>
                    <Input
                      name="firstWeight"
                      value={formData.firstWeight}
                      onChange={handleChange}
                      className="h-7 w-32 text-xs text-black"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-black">Second Weight</Label>
                    <Input
                      name="secondWeight"
                      value={formData.secondWeight}
                      onChange={handleChange}
                      className="h-7 w-32 text-xs text-green-600"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-black">Bardana Weight</Label>
                    <Input
                      name="bardanaWeight"
                      value={formData.bardanaWeight}
                      onChange={handleChange}
                      className="h-7 w-32 text-xs text-black"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-black">Gross Weight</Label>
                    <Input
                      name="grossWeight"
                      value={formData.grossWeight}
                      readOnly
                      className="h-7 w-32 text-xs text-black"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-black">Net Weight</Label>
                    <Input
                      name="netWeight"
                      value={formData.netWeight}
                      onChange={handleChange}
                      className="h-7 w-32 text-xs bg-yellow-200 text-black"
                    />
                  </div>
                </div>

                {/* Column 3 - Customer, Branch, Buttons, and Camera */}
                <div className="space-y-1">
                  {/* Customer & Branch Fields */}
                  <div>
                    <Label className="text-xs text-black">Customer</Label>
                    <Input
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      className="h-7 w-32 text-xs text-black"
                      placeholder="Customer name"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-black">Branch</Label>
                    <Select
                      name="branch"
                      value={formData.branch}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          branch: value,
                          branchId: value,
                        }))
                      }
                    >
                      <SelectTrigger className="h-7 w-32 text-xs text-black">
                        <SelectValue
                          placeholder="Select branch"
                          className="text-black"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem
                            key={branch.branch_id}
                            value={branch.branch_id.toString()}
                          >
                            {branch.branch_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Weight Buttons */}
                  <div className="grid grid-cols-2 gap-1 mt-2 ">
                    <Button
                      className="h-7 bg-green-600 text-xs"
                      onClick={captureFirstWeight}
                    >
                      1st WHT
                    </Button>
                    <Button
                      className="h-7 bg-gray-500 text-xs"
                      onClick={captureSecondWeight}
                    >
                      2nd WHT
                    </Button>
                  </div>

                  {/* Camera Section */}
                  <div className="h-28 w-full overflow-hidden mt-1 border rounded">
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

                  {/* Clear / Exit Buttons */}
                  <div className="grid grid-cols-2 gap-1 mt-1 ">
                    <Button
                      className="h-8 bg-yellow-500 text-xs"
                      onClick={resetForm}
                    >
                      Clear
                    </Button>
                    <Button className="h-8 bg-red-500 text-xs">Exit</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Large Label Between Sections */}
            <div className="text-center py-1 mb-1 mt-0">
              <div
                className={`inline-block px-1 py-1 rounded-lg shadow-md ${
                  onlineMode === true
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                <h2 className="text-2xl font-bold tracking-wide">
                  {onlineMode === true
                    ? "Purchase Return Online"
                    : "Purchase Return Offline"}
                </h2>
              </div>
            </div>

            {/* Purchase Return Details Section */}
            <div className="bg-blue-50 p-0.5 rounded border">
              <div className="grid grid-cols-4 gap-1">
                <div>
                  <Label className="text-xs text-black">IGP No</Label>
                  <Input
                    name="igpNo"
                    value={formData.igpNo}
                    onChange={handleChange}
                    className="h-6 w-32 text-xs text-black"
                    placeholder="IGP number"
                  />
                </div>
                <div>
                  <Label className="text-xs text-black">Vendor</Label>
                  <Input
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleChange}
                    className="h-6 w-32 text-xs text-black"
                    placeholder="Vendor name"
                  />
                </div>
                <div>
                  <Label className="text-xs text-black">Item Description</Label>
                  <Input
                    name="itemDesc"
                    value={formData.itemDesc}
                    onChange={handleChange}
                    className="h-6 w-32 text-xs text-black"
                    placeholder="Item description"
                  />
                </div>
                <div>
                  <Label className="text-xs text-black">No of Bags</Label>
                  <Input
                    name="noOfBags"
                    value={formData.noOfBags}
                    onChange={handleChange}
                    className="h-6 w-32 text-xs text-black"
                    placeholder="Number of bags"
                  />
                </div>
                <div>
                  <Label className="text-xs text-black">Weight Per Bag</Label>
                  <Input
                    name="wtPerBag"
                    value={formData.wtPerBag}
                    onChange={handleChange}
                    className="h-6 w-32 text-xs text-black"
                    placeholder="Weight per bag"
                  />
                </div>
                <div>
                  <Label className="text-xs text-black">Bardana Type</Label>
                  <Input
                    name="bardanaType"
                    value={formData.bardanaType}
                    onChange={handleChange}
                    className="h-6 w-32 text-xs text-black"
                    placeholder="Bardana type"
                  />
                </div>
                <div>
                  <Label className="text-xs text-black">Driver Name</Label>
                  <Input
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleChange}
                    className="h-6 w-32 text-xs text-black"
                    placeholder="Driver name"
                  />
                </div>
                <div>
                  <Label className="text-xs text-black">Freight</Label>
                  <Input
                    name="freight"
                    value={formData.freight}
                    onChange={handleChange}
                    className="h-6 w-32 text-xs text-black"
                    placeholder="Freight amount"
                  />
                </div>
              </div>

              <div className="mt-0">
                <Label className="text-xs text-black">Remarks</Label>
                <Textarea
                  placeholder="Add remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  className="h-8
                   w-75 text-xs resize-none text-black placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>
          {/* Right Side - Empty for now */}
          <div className="col-span-4">
            {/* Additional components can be added here if needed */}
          </div>
        </div>
      </div>
    </div>
  );
}