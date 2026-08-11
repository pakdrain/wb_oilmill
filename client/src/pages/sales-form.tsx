import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Plus,
  Scale,
  Download,
  Upload,
  Eye,
  Save,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import WeightIndicator from "@/components/weight-indicator";
import { useConfig } from "@/lib/config-context";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import VideoStreamFullscreen from "@/components/video-stream-fullscreen";
import { format } from "date-fns";
import { useComPort } from "@/Comportcontext";
import axios from "axios";




export default function SalesForm() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchSlipNo, setSearchSlipNo] = useState("");
  const [searchVehicleNo, setSearchVehicleNo] = useState("");
  const customerSearchInputRef = useRef<HTMLInputElement>(null);
  const itemSearchInputRef = useRef<HTMLInputElement>(null);
const nextFieldRef = useRef<HTMLInputElement>(null); // <-- create the ref for the next input
const [selectedForm, setSelectedForm] = useState<"purchase" | "sales" | "salesReturn" | "soldNote">("sales");
const [cameFromPrevious, setCameFromPrevious] = useState(false);
const [fieldHighlighted, setFieldHighlighted] = useState(false);
// Inside your component
const [isCustomerSelected, setIsCustomerSelected] = useState(false);
const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
const [openCustomerLovRowIndex, setOpenCustomerLovRowIndex] = useState<number | null>(null);
const [highlightedCustomerIndex, setHighlightedCustomerIndex] = useState(-1);
const [focusedCustomerRowIndex, setFocusedCustomerRowIndex] = useState<number | null>(null);
const [openBranchLovRowIndex, setOpenBranchLovRowIndex] = useState<number | null>(null);
const [openItemLovRowIndex, setOpenItemLovRowIndex] = useState<number | null>(null);
const [disableSaveButton, setDisableSaveButton] = useState(false);
const customerLovRef = useRef<HTMLDivElement>(null);

const [bardanaTypes, setBardanaTypes] = useState<any[]>([]);
const [bardanaSelectOpen, setBardanaSelectOpen] = useState(false); // ✅ boolean
const [bardanaSelectedRow, setBardanaSelectedRow] = useState<number | null>(null); // ✅ track row
const [bardanaSearch, setBardanaSearch] = useState({
  searchValue: '',
  debouncedSearchValue: ''
});
// At the top of your component
const [details, setdetails] = useState<
  { customerName: string; customerId: number | null }[]
>(
  Array.from({ length: 8 }, () => ({
    customerName: "",
    customerId: null,
  }))
);

   // ✅ Helper function to check if reg_type is NULL
    const isRegTypeNull = () => {
        const regType = formData.reg_type || formData.regType || '';
        return !regType || 
               regType === 'N' || 
               regType === 'Null' || 
               regType === 'NULL' || 
               regType === '';
    };

   


    
// Sale form mein yeh debug add karein
// Sale form mein yeh useEffect add karein
useEffect(() => {
  const fetchBardanaTypes = async () => {
    try {
      console.log('🔄 Fetching bardana types from /api/bardana-types...');
      const response = await fetch('/api/bardana-types');
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Bardana types fetched:', data);
        setBardanaTypes(Array.isArray(data) ? data : []);
      } else {
        console.warn('⚠️ API failed with status:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching bardana types:', error);
    }
  };
  
  fetchBardanaTypes();
}, []);

// Bardana search debounce
useEffect(() => {
  const timer = setTimeout(() => {
    setBardanaSearch(prev => ({
      ...prev,
      debouncedSearchValue: prev.searchValue
    }));
  }, 300);

  return () => clearTimeout(timer);
}, [bardanaSearch.searchValue]);

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


  // Sales data state - mapped to database columns
const [salesData, setSalesData] = useState<any[]>(
  Array.from({ length: 8 }, () => ({
    doId: "",
    dcNo: "",
    doNo: "",
    customerId: "",
    customerName: "",
    vehicleNo: "",
    doDate: "",
    itemDescription: "",
    dcQty: "",
    doQty: "",
    branch: "",
    freight: "",

    bardanaType: "",
    bardanaTypeId: "",
    wtPerBag: "",
    bardanaWeight: "",
  }))
);

// Non-empty rows filter
const nonEmptyRows = salesData.filter(
  (row) =>
    row.dcNo ||
    row.doNo ||
    row.customerId || // ✅ include this too
    row.customerName ||
    row.vehicleNo ||
    row.itemDescription ||
    row.dcQty ||
    row.doQty
);



 

// ------------------------------------------------------------------
// ✅ FETCH REPORT DATA
const fetchReportData = async (wbId: number) => {
  try {
    const response = await fetch(`/api/form-report/${wbId}`);
    const result = await response.json();

    if (result.success && result.data) {
      const raw = result.data;

      console.log("🔍 raw.vehicle_no:", raw.vehicle_no);
      console.log("🔍 raw.details[0]?.vehicle_no:", raw.details?.[0]?.vehicle_no);

      console.log("🔍 RAW DATA from API:", {
        reg_type: raw.reg_type,
        pur_reg_type: raw.pur_reg_type,
        entry_type: raw.entry_type,
        slip_no: raw.slip_no,
        first_weight: raw.first_weight,
        second_weight: raw.second_weight,
        item_id: raw.item_id,
      });

      // ✅ SALE -> reg_type, PURCHASE -> pur_reg_type
      const isSale = raw.entry_type === "SALE" || raw.entry_type === "SALE_RETURN";
      const regType = isSale ? (raw.reg_type ?? "R") : (raw.pur_reg_type ?? "R");

      console.log("✅ Selected RegType:", regType);
      console.log("✅ Entry Type:", raw.entry_type);
      console.log("✅ Slip No:", raw.slip_no);

      return {
        ...raw,
        slipNo: raw.slip_no || "",
        vehicleNo: raw.vehicle_no || raw.details?.[0]?.vehicle_no || "",
        firstWeight: raw.first_weight ? String(raw.first_weight) : "",
        secondWeight: raw.second_weight ? String(raw.second_weight) : "",
        netWeight: raw.net_weight ? String(raw.net_weight) : "",
        grossWeight: raw.gross_weight ? String(raw.gross_weight) : "",
        bardanaWeight: raw.bardana_weight ? String(raw.bardana_weight) : "",
        noOfBags: raw.no_of_bags ? String(raw.no_of_bags) : "",
        wtPerBag: raw.weight_per_bags ? String(raw.weight_per_bags) : "",
        bardanaType: raw.bardana_type || "",
        itemDesc: raw.item_desc || "",
        igpNo: raw.igp_no || "",
        freight: raw.freight ? String(raw.freight) : "",
        remarks: raw.remarks || "",
        vendor: raw.vendor_name || "",
        slipInTime: raw.slip_in_time || "",
        slipOutTime: raw.slip_out_time || "",
        entryType: raw.entry_type || "SALE",
        qualityDeduction: raw.quality_deduction ? String(raw.quality_deduction) : "",
        supplierWeight: raw.supplier_weight ? String(raw.supplier_weight) : "",
        created_by_name: raw.created_by_name || "",
        second_weight_by_name: raw.second_weight_by_name || "",
        second_weight_by: raw.second_weight_by || "",
        reg_type: raw.reg_type,
        pur_reg_type: raw.pur_reg_type,
        item_id: raw.item_id,
        regType,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching report data:", error);
    return null;
  }
};

// ✅ PREPARE PRINT WINDOW - FIXED with innerHTML
const preparePrintWindow = (htmlContent: string, title: string) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to print the report");
    return null;
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8" />
        <style>
          .print-btn-container { position: fixed; top: 10px; right: 10px; z-index: 9999; }
          .print-btn { padding: 10px 18px; font-size: 15px; font-weight: bold; cursor: pointer; }
          @media print { .print-btn-container { display: none; } }
        </style>
      </head>
      <body>
        <div class="print-btn-container">
          <button class="print-btn" onclick="window.print()">Print</button>
        </div>
        <div id="report-content"></div>
      </body>
    </html>
  `);
  
  // ✅ Use innerHTML to preserve & characters
  const contentDiv = printWindow.document.getElementById('report-content');
  if (contentDiv) {
    contentDiv.innerHTML = htmlContent;
  }
  
  printWindow.document.close();
  return printWindow;
};

// ✅ GET FISCAL YEAR
const getFiscalYear = (dateStr: string | null): number => {
  if (!dateStr) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    return currentMonth >= 7 ? now.getFullYear() + 1 : now.getFullYear();
  }
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return month >= 7 ? year + 1 : year;
};

// ✅ BUILD IMAGE URL - with &amp; for HTML encoding
const buildImageUrl = (type: 'first' | 'second', apiData: any) => {
  const slipNo = apiData?.slipNo || apiData?.slip_no || '';
  const entryType = apiData?.entryType || apiData?.entry_type || 'SALE';
  const regType = apiData?.regType || 'R';
  const fiscalYear = getFiscalYear(apiData?.slipInTime || apiData?.slip_in_time || null);

  const baseUrl = type === 'first'
    ? '/api/images/first-weight/latest-file'
    : '/api/images/second-weight/latest-file';

  const isPurchase = entryType === 'PURCHASE' || entryType === 'PURCHASE_RETURN';
  const paramName = isPurchase ? 'purRegType' : 'reg_type';

  // ✅ For HTML rendering, use &amp; instead of &
  const url = `${baseUrl}?slipNo=${encodeURIComponent(slipNo)}&amp;entryType=${encodeURIComponent(entryType)}&amp;fiscalYear=${encodeURIComponent(String(fiscalYear))}&amp;${paramName}=${encodeURIComponent(regType)}`;

  console.log(`✅ ${type} IMAGE URL (HTML ENCODED):`, url);
  return url;
};


// ✅ HANDLE PRINT REPORT
const handlePrintReport = async () => {
  if (!formData.slipNo) {
    alert("Please save the record first or load an existing slip to print");
    return;
  }

  if (!editingWbId || Number(editingWbId) === 0) {
    alert("❌ Please save the record first or load an existing slip to print");
    return;
  }

  const apiData = await fetchReportData(Number(editingWbId));

  if (!apiData) {
    alert("❌ Report data fetch nahi hua — please try again");
    return;
  }

  console.log("🔍 API DATA:", {
    regType: apiData.regType,
    entryType: apiData.entryType,
    slipNo: apiData.slipNo,
    firstWeight: apiData.firstWeight,
    secondWeight: apiData.secondWeight,
    netWeight: apiData.netWeight,
    gross_w_b_d: apiData.gross_w_b_d,
    details: apiData.details,
  });

  const hasFirstWeight = apiData.firstWeight && parseFloat(apiData.firstWeight) > 0;
  const hasSecondWeight = apiData.secondWeight && parseFloat(apiData.secondWeight) > 0;

  console.log("🔍 hasFirstWeight:", hasFirstWeight);
  console.log("🔍 hasSecondWeight:", hasSecondWeight);

  // ✅ Direct URLs
  const firstImgUrl = buildImageUrl('first', apiData);
  const secondImgUrl = buildImageUrl('second', apiData);

  console.log("🔍 FIRST IMAGE URL:", firstImgUrl);
  console.log("🔍 SECOND IMAGE URL:", secondImgUrl);

  const dbRows = (apiData.details || [])
    .filter((row: any) =>
      row.dc_no || row.do_no || row.customer_name ||
      row.item_code || row.item_desc || row.dc_qty
    )
    .map((row: any) => ({
      dcNo: row.dc_no || "",
      doNo: row.do_no || "",
      customerName: row.customer_name || "",
      vehicleNo: row.vehicle_no || "",
      itemCode: row.item_code || "",
      itemDescription: row.item_desc || "",
      dcQty: row.dc_qty ? String(row.dc_qty) : "",
      doQty: row.do_qty ? String(row.do_qty) : "",
      itemId: row.item_id || null,  // ✅ Added item_id
    }))
    ;
    

  const vehicleNo = apiData.vehicleNo || apiData.vehicle_no || "";

  // ✅ Check if any detail row has specific item_id
  const specificItemIds = ["0501020004", "0501020001", "0501020005"]; // ✅ Add more item_ids as needed
  
  // ✅ Check if ANY row in details has these item_ids
  const hasSpecificItem = (apiData.details || []).some((row: any) => {
    const itemId = row.item_code;
    return specificItemIds.includes(itemId);
  });

  console.log("🔍 Has Specific Item (6517, 5877, 4307):", hasSpecificItem);

  let netWeightForReport = "";

  if (hasSpecificItem) {
    // ✅ If specific item exists, use grossWeight (not netWeight)
    netWeightForReport = apiData.grossWeight || "";
    console.log( "📊 Specific item found - Using grossWeight for Net Weight:", netWeightForReport);
  } else {
    // ✅ If no specific item, use netWeight
     netWeightForReport = apiData.gross_w_b_d ? String(apiData.gross_w_b_d) : "";
    console.log("📊 No specific item - Using netWeight for Net Weight:", netWeightForReport);
  }

  // ✅ Update apiData with the correct netWeight for report
  const updatedApiData = {
    ...apiData,
    netWeight: netWeightForReport,
  };

  console.log("✅ Updated apiData for report:", {
    hasSpecificItem,
    original_netWeight: apiData.netWeight,
    original_grossWeight: apiData.grossWeight,
    final_netWeight: netWeightForReport,
    item_id : apiData.item_id,
  });

  // ✅ CONDITION: If both weights exist -> generateReportHTML (Full Weighbridge Slip)
  if (hasFirstWeight && hasSecondWeight) {
    const reportHTML = generateReportHTML(
      "second",
      apiData.slipInTime || "",
      apiData.slipOutTime || "",
      vehicleNo,
      updatedApiData,
      dbRows
    );
    preparePrintWindow(reportHTML, "Weighbridge Report");
  } 
  // ✅ CONDITION: If only first weight exists -> generateNewReportHTML (Feeds Dispatch Order)
  else if (hasFirstWeight) {
    const reportHTML = generateNewReportHTML(
      apiData.slipInTime || "",
      apiData.slipOutTime || "",
      vehicleNo,
      updatedApiData,
      dbRows
    );
    preparePrintWindow(reportHTML, "Feeds Dispatch Order");
  } 
  // ✅ No weight data
  else {
    alert("No weight data available to print.");
  }
};

const generateReportHTML = (
  weightType: "first" | "second",
  slipInTime: string,
  slipOutTime: string | null,
  vehicleNo: string,
  apiData: any = null,
  dbRows: any[] = []
) => {
  const currentDate = new Date()
    .toLocaleDateString("en-GB", { timeZone: "Asia/Karachi", day: "2-digit", month: "short", year: "2-digit" })
    .toUpperCase().replace(/\s/g, "-");

  const currentTime = new Date()
    .toLocaleTimeString("en-GB", { timeZone: "Asia/Karachi", hour12: true })
    .toUpperCase();

  function formatPKTDateTime(dateStr: string | Date): string {
    if (!dateStr) return "";
    const date = new Date(new Date(dateStr).toLocaleString("en-US", { timeZone: "Asia/Karachi" }));
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEPT", "OCT", "NOV", "DEC"];
    const month = months[date.getMonth()];
    const time = date.toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }).toUpperCase();
    return `${day}-${month}-${year} ${time}`;
  }

  // ✅ Use mapped fields
  const weightByName = apiData?.created_by_name || "";
  const hasSecondWeight = apiData?.secondWeight && parseFloat(apiData.secondWeight) > 0;
  const hasSecondWeightById = !!apiData?.second_weight_by;
  const secondWeightByName = (hasSecondWeight && hasSecondWeightById) ? (apiData?.second_weight_by_name || "") : "";
  const firstWeight = apiData?.firstWeight || "";
  const secondWeight = apiData?.secondWeight || "";
  const netWeight = apiData?.netWeight || "";

  // ✅ Build URLs with &amp; for HTML encoding
  const entryTypeUpper = (apiData?.entryType || apiData?.entry_type || 'SALE').toUpperCase();
  const fiscalYear = getFiscalYear(apiData?.slipInTime || apiData?.slip_in_time || null);
  const regType = apiData?.regType || 'R';
  const slipNo = apiData?.slipNo || apiData?.slip_no || '';

  const isPurchase = entryTypeUpper === 'PURCHASE' || entryTypeUpper === 'PURCHASE_RETURN';
  const paramName = isPurchase ? 'purRegType' : 'reg_type';

  const firstImg = `/api/images/first-weight/latest-file?slipNo=${encodeURIComponent(slipNo)}&amp;entryType=${encodeURIComponent(entryTypeUpper)}&amp;fiscalYear=${encodeURIComponent(String(fiscalYear))}&amp;${paramName}=${encodeURIComponent(regType)}`;
  const secondImg = `/api/images/second-weight/latest-file?slipNo=${encodeURIComponent(slipNo)}&amp;entryType=${encodeURIComponent(entryTypeUpper)}&amp;fiscalYear=${encodeURIComponent(String(fiscalYear))}&amp;${paramName}=${encodeURIComponent(regType)}`;

  const displaySlipInTime = slipInTime ? formatPKTDateTime(slipInTime) : "";
  const displaySlipOutTime = slipOutTime ? formatPKTDateTime(slipOutTime) : "";

  // ✅ Customer copy — DC wise grouping (only DC, Party, Qty)
  const groupedByDC: { [key: string]: any[] } = {};
  dbRows.forEach(row => {
    const dcNo = row.dcNo || 'No DC';
    if (!groupedByDC[dcNo]) groupedByDC[dcNo] = [];
    groupedByDC[dcNo].push(row);
  });

  let customerCopyTablesHTML = '';
  Object.keys(groupedByDC).forEach(dcNo => {
    const rows = groupedByDC[dcNo];
    customerCopyTablesHTML += `
      <div style="margin-bottom: 10px; page-break-inside: avoid;">
        <table class="table">
          <thead>
            <tr><th>DC #</th><th>Party Name</th><th>Qty</th></tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                <td>${row.dcNo || ""}</td>
                <td>${row.customerName || ""}</td>
                <td>${row.dcQty || ""}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  });

  // ✅ Office Copy Table
  const officeCopyTableHTML = `
    <table class="table">
      <thead>
        <tr><th>DC #</th><th>Party Name</th><th>Commodity</th><th>Bag Condition</th><th>Bag Type</th><th>Qty</th></tr>
      </thead>
      <tbody>
        ${dbRows.map(row => `
          <tr>
            <td>${row.dcNo || ""}</td>
            <td>${row.customerName || ""}</td>
            <td>${row.itemDescription || row.itemCode || ""}</td>
            <td>${apiData?.wtPerBag || ""}</td>
            <td>${apiData?.bardanaType || ""}</td>
            <td>${row.dcQty || ""}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  const signaturesHTML = `
    <div class="signatures">
      <div class="signature-block">
        <div class="signature-container">
          <span class="signature-label">Weight By:</span>
          <span class="signature-line"><span class="signature-name">${weightByName}</span></span>
        </div>
      </div>
      <div class="signature-block">
        <div class="signature-container">
          <span class="signature-label">Second Weight By:</span>
          <span class="signature-line"><span class="signature-name">${secondWeightByName}</span></span>
        </div>
      </div>
      <div class="signature-block">
        <div class="signature-container">
          <span class="signature-label">Checked By:</span>
          <span class="signature-line"><span class="signature-name"></span></span>
        </div>
      </div>
      <div class="signature-block">
        <div class="signature-container">
          <span class="signature-label">Production Manager:</span>
          <span class="signature-line"><span class="signature-name"></span></span>
        </div>
      </div>
    </div>
  `;

  // ✅ Generate Office/Mill Copy
  const generateOfficeCopyHTML = (copyType: 'Office' | 'Mill', tablesHTML: string) => {
    return `
      <div class="print-date">Print Date: ${currentDate} ${currentTime}</div>
      <div class="title">Sabirs Vegetable Oils (Pvt.) Ltd.</div>
      <div class="title">SALE SLIP</div>
      <div class="copy-label">${copyType} Copy</div>
      <div style="display: flex; justify-content: space-between; border: 1px solid black; border-left: 1px solid black; height: 120px;">
        <table class="info-table" style="width: 33.33%; border-right: 1px solid black;">
          <tr>
            <td class="label-cell">Slip No:</td>
            <td class="value-cell"><span class="slip-no-value">${apiData?.slipNo || ""}</span></td>
            <td class="image-cell" rowspan="3" style="width: 40%;">
              <div class="image-box-tall" style="height: 120px;">
                <img src="${firstImg}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
                <div style="display: none; font-size: 8px; color: #666;">No Img</div>
              </div>
            </td>
          </tr>
          <tr><td class="label-cell">Time In:</td><td class="value-cell">${displaySlipInTime}</td></tr>
          <tr><td class="label-cell">Time Out:</td><td class="value-cell">${displaySlipOutTime}</td></tr>
        </table>
        <div class="center-wrapper" style="width: 18%; display: flex; align-items: center; justify-content: center; border-right: 1px solid black; height: 100%;">
          <div class="center-box" style="height: 60%; width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; border: none; padding: 2px 4px;">
            <div class="truck-label" style="font-size: 12px; font-weight: 900; border-bottom: 1px solid black; width: 100%; text-align: center; padding-bottom: 2px; margin-bottom: 2px;">Truck #</div>
            <span class="vehicle-no" style="font-size: 12px; font-weight: 900; text-align: center; width: 100%;">${vehicleNo || apiData?.vehicleNo || ""}</span>
          </div>
        </div>
        <table class="info-table" style="width: 42%; border-right: 1px solid black;">
          <tr>
            <td class="label-cell">Gross Weight:</td>
            <td class="value-cell weight-value">${secondWeight ? parseFloat(secondWeight).toLocaleString("en-IN") : ""}</td>
            <td class="image-cell" rowspan="3" style="width: 35%;">
              <div class="image-box-tall" style="height: 120px;">
                <img src="${secondImg}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
                <div style="display: none; font-size: 8px; color: #666;">No Img</div>
              </div>
            </td>
          </tr>
          <tr><td class="label-cell">Tare Weight:</td><td class="value-cell weight-value">${firstWeight ? parseFloat(firstWeight).toLocaleString("en-IN") : ""}</td></tr>
          <tr><td class="label-cell">Net Weight:</td><td class="value-cell weight-value">
          
          ${netWeight ? parseFloat(netWeight).toLocaleString("en-IN") : ""}</td></tr>
        </table>
      </div>
      
      <!-- ✅ Space between top box and DC table -->
      <div style="height: 10px;"></div>
      
      ${tablesHTML}
      
      <div class="totals">
        <div>Remarks: ${apiData?.remarks || ""}</div>
      </div>
      
      ${signaturesHTML}
    `;
  };

  // ✅ Generate Customer Copy
  const generateCustomerCopyHTML = () => {
    return `
      <div class="print-date">Print Date: ${currentDate} ${currentTime}</div>
      <div class="title">Sabirs Vegetable Oils (Pvt.) Ltd.</div>
      <div class="title">SALE SLIP</div>
      <div class="copy-label">Customer Copy</div>
      <div style="display: flex; justify-content: space-between; border: 1px solid black; border-left: 1px solid black; height: 90px;">
        <table class="info-table" style="width: 33.33%; border-right: 1px solid black;">
          <tr>
            <td class="label-cell">Slip No:</td>
            <td class="value-cell"><span class="slip-no-value">${apiData?.slipNo || ""}</span></td>
          </tr>
          <tr><td class="label-cell">Time In:</td><td class="value-cell">${displaySlipInTime}</td></tr>
          <tr><td class="label-cell">Time Out:</td><td class="value-cell">${displaySlipOutTime}</td></tr>
        </table>
        <div class="center-wrapper" style="width: 33.33%; display: flex; align-items: center; justify-content: center; border-right: 1px solid black; height: 100%;">
          <div class="center-box" style="height: 100%; width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; border: none; padding: 4px 6px;">
            <div class="truck-label" style="font-size: 12px; font-weight: 900; border-bottom: 1px solid black; width: 100%; text-align: center; padding-bottom: 3px; margin-bottom: 3px;">Truck #</div>
            <span class="vehicle-no" style="font-size: 14px; font-weight: 900; text-align: center; width: 100%;">${vehicleNo || apiData?.vehicleNo || ""}</span>
          </div>
        </div>
        <table class="info-table" style="width: 33.33%; border-right: 1px solid black;">
          <tr>
            <td class="label-cell">Net Weight:</td>
            <td class="value-cell">
              <div style="border-bottom: 2px solid black; width: 100%; height: 30px;">&nbsp;</div>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- ✅ Space between top box and DC table -->
      <div style="height: 10px;"></div>
      
      ${customerCopyTablesHTML}
      
      <!-- ✅ Seals Vertical -->
      <div style="display: flex; justify-content: space-around; margin-top: 10px; border: 1px solid black; padding: 6px;">
        <div style="text-align: center; font-weight: bold; font-size: 10px;">
          <div>Seal 1</div>
          <div style="border-bottom: 1px solid black; width: 50px; margin: 2px auto; height: 12px;"></div>
        </div>
        <div style="text-align: center; font-weight: bold; font-size: 10px;">
          <div>Seal 2</div>
          <div style="border-bottom: 1px solid black; width: 50px; margin: 2px auto; height: 12px;"></div>
        </div>
        <div style="text-align: center; font-weight: bold; font-size: 10px;">
          <div>Seal 3</div>
          <div style="border-bottom: 1px solid black; width: 50px; margin: 2px auto; height: 12px;"></div>
        </div>
        <div style="text-align: center; font-weight: bold; font-size: 10px;">
          <div>Seal 4</div>
          <div style="border-bottom: 1px solid black; width: 50px; margin: 2px auto; height: 12px;"></div>
        </div>
        <div style="text-align: center; font-weight: bold; font-size: 10px;">
          <div>Seal 5</div>
          <div style="border-bottom: 1px solid black; width: 50px; margin: 2px auto; height: 12px;"></div>
        </div>
        <div style="text-align: center; font-weight: bold; font-size: 10px;">
          <div>Seal 6</div>
          <div style="border-bottom: 1px solid black; width: 50px; margin: 2px auto; height: 12px;"></div>
        </div>
        <div style="text-align: center; font-weight: bold; font-size: 10px;">
          <div>Seal 7</div>
          <div style="border-bottom: 1px solid black; width: 50px; margin: 2px auto; height: 12px;"></div>
        </div>
        <div style="text-align: center; font-weight: bold; font-size: 10px;">
          <div>Seal 8</div>
          <div style="border-bottom: 1px solid black; width: 50px; margin: 2px auto; height: 12px;"></div>
        </div>
      </div>
      
      <!-- ✅ Urdu Note -->
      <div style="text-align: right; direction: rtl; margin-top: 6px; font-size: 12px; font-weight: bold; padding: 0 10px;">
        <span style="font-weight: bold;">نوٹ:</span> گاڑی کا <span style="font-weight: bold;">سیل نمبر</span> اچھی طرح چیک کرنے کے بعد ہی گاڑی اَن لوڈ کریں۔
      </div>
      
      ${signaturesHTML}
    `;
  };

  const officeCopyHTML = generateOfficeCopyHTML('Office', officeCopyTableHTML);
  const millCopyHTML = generateOfficeCopyHTML('Mill', officeCopyTableHTML);
  const customerCopyHTML = generateCustomerCopyHTML();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Weighbridge Slip</title>
  <style>
    body { font-family:'Times New Roman', Times, serif; font-size: 20px; margin: 8px; padding: 0; }
    .container { border: 1px solid black; padding: 8px; height: auto; box-sizing: border-box; }
    
    /* ✅ Copy spacing - more space between Office and Mill */
    .copy-section { 
      margin-bottom: 80px; 
      page-break-inside: avoid; 
    }
    
    /* ✅ Extra spacing between Office and Mill specifically */
    .office-mill-spacing {
      margin-bottom: 100px;
    }
    
    .title { text-align: center; font-weight: 900; margin-bottom: 2px; font-size: 18px; }
    .copy-label { text-align: left; font-weight: 900; margin-bottom: 2px; font-size: 12px; }
    .info-table { border-collapse: collapse; width: 100%; height: 100%; }
    .info-table td { border-bottom: 1px solid black; padding: 0px 0px; line-height: 0.8; }
    .print-date { text-align: right; font-size: 10px; font-weight: 900; }
    .label-cell { width: 20%; font-weight: 900; font-size: 11px; padding-left: 1px; }
    .value-cell { width: 40%; font-weight: 900; font-size: 14px; padding-right: 1px; }
    .weight-value { font-weight: 900; font-size: 16px; }
    .slip-no-value { font-weight: 900; font-size: 15px !important; }
    .image-cell { width: 40%; border-left: 1px solid black; text-align: center; }
    .image-box-tall { height: 120px; display: flex; justify-content: center; align-items: center; border: 1px solid black; overflow: hidden; }
    .image-box-tall img { max-height: 100%; max-width: 100%; object-fit: contain; }
    .center-box { border: none; }
    .truck-label { font-weight: 900; font-size: 12px; border-bottom: 1px solid black; width: 100%; text-align: center; padding-bottom: 2px; margin-bottom: 2px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 4px; }
    .table th, .table td { border: 1px solid black; padding: 3px 4px; text-align: left; font-size: 12px; font-weight: 900; }
    .signatures { display: flex; justify-content: space-between; margin-top: 45px; gap: 8px; }
    .signature-block { flex: 1; font-size: 10px; text-align: center; }
    .signature-label { display: inline-block; font-size: 10px; font-weight: 900; }
    .signature-line { display: inline-block; border-bottom: 1px solid black; width: 80px; position: relative; }
    .signature-name { font-size: 8px; font-weight: 900; color: #444; position: absolute; top: -12px; left: 50%; transform: translateX(-50%); white-space: nowrap; }
    .signature-container { display: flex; align-items: center; justify-content: center; gap: 2px; }
    .totals { display: flex; justify-content: space-between; margin-top: 4px; font-weight: 900; font-size: 12px; }
    .vehicle-no { font-weight: 900; font-size: 12px; }
    hr.dashed { border: 1px dashed #aaa; margin: 20px 0; }
  </style>
</head>
<body>
<div class="container">
  <!-- Office Copy -->
  <div class="copy-section">
    ${officeCopyHTML}
  </div>
  
  <hr class="dashed" />
  
  <!-- Mill Copy -->
  <div class="copy-section">
    ${millCopyHTML}
  </div>
  
  <hr class="dashed" />
  
  <!-- Customer Copy -->
  <div class="copy-section">
    ${customerCopyHTML}
  </div>
</div>
</body>
</html>`;
};


// ✅ GENERATE NEW REPORT HTML (Feeds Dispatch Order)
const generateNewReportHTML = (
  slipInTime: string,
  slipOutTime: string | null,
  vehicleNo: any,
  apiData: any = null,
  dbRows: any[] = []
) => {
  const currentDate = new Date()
    .toLocaleDateString("en-GB", { timeZone: "Asia/Karachi", day: "2-digit", month: "short", year: "2-digit" })
    .toUpperCase().replace(/\s/g, "-");

  const currentTime = new Date()
    .toLocaleTimeString("en-GB", { timeZone: "Asia/Karachi", hour12: true })
    .toUpperCase();

  function formatPKTDateTime(dateStr: string | Date): string {
    if (!dateStr) return "";
    const date = new Date(new Date(dateStr).toLocaleString("en-US", { timeZone: "Asia/Karachi" }));
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEPT", "OCT", "NOV", "DEC"];
    const month = months[date.getMonth()];
    const time = date.toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }).toUpperCase();
    return `${day}-${month}-${year} ${time}`;
  }

  const formatFreightWithCommas = (value: string | number) => {
    if (!value) return "";
    const stringValue = value.toString();
    const cleanValue = stringValue.replace(/[^\d.]/g, "");
    const parts = cleanValue.split(".");
    let integerPart = parts[0];
    const decimalPart = parts[1];
    if (integerPart.length > 3) {
      const rightPart = integerPart.slice(-3);
      const leftPartFormatted = integerPart.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
      integerPart = leftPartFormatted + "," + rightPart;
    }
    return decimalPart !== undefined ? integerPart + "." + decimalPart : integerPart;
  };

  const weightByName = apiData?.created_by_name || "";
  const firstWeight = apiData?.firstWeight || "";
  const secondWeight = apiData?.secondWeight || "";
  const netWeight = apiData?.netWeight || "";
  const slipNo = apiData?.slipNo || apiData?.slip_no || '';

  // ✅ Build URLs with &amp; for HTML encoding
  const entryTypeUpper = (apiData?.entryType || apiData?.entry_type || 'PURCHASE').toUpperCase();
  const fiscalYear = getFiscalYear(apiData?.slipInTime || apiData?.slip_in_time || null);
  const regType = apiData?.regType || 'R';

  const firstImg = `/api/images/first-weight/latest-file?slipNo=${encodeURIComponent(slipNo)}&amp;entryType=${encodeURIComponent(entryTypeUpper)}&amp;fiscalYear=${encodeURIComponent(String(fiscalYear))}&amp;reg_type=${encodeURIComponent(regType)}`;
  const secondImg = `/api/images/second-weight/latest-file?slipNo=${encodeURIComponent(slipNo)}&amp;entryType=${encodeURIComponent(entryTypeUpper)}&amp;fiscalYear=${encodeURIComponent(String(fiscalYear))}&amp;reg_type=${encodeURIComponent(regType)}`;

  const displaySlipInTime = slipInTime ? formatPKTDateTime(slipInTime) : "";
  const displaySlipOutTime = slipOutTime ? formatPKTDateTime(slipOutTime) : "";
  const grandTotal = dbRows.reduce((acc, row) => acc + (parseFloat(row.dcQty) || 0), 0);

  const signaturesHTML = `
    <div class="signatures">
      <div class="signature-block">
        <div class="signature-container">
          <span class="signature-label">Weight By:</span>
          <span class="signature-line"><span class="signature-name">${weightByName}</span></span>
        </div>
      </div>
      <div class="signature-block">
        <div class="signature-container">
          <span class="signature-label">Checked By:</span>
          <span class="signature-line"><span class="signature-name"></span></span>
        </div>
      </div>
    </div>
  `;

  // ✅ Office Copy Table
  const officeCopyTableHTML = `
    <table class="table">
      <thead>
        <tr><th>DC #</th><th>Party Name</th><th>Commodity</th><th>Bag Condition</th><th>Bag Type</th><th>Qty</th></tr>
      </thead>
      <tbody>
        ${dbRows.map(row => `
          <tr>
            <td>${row.dcNo || ""}</td>
            <td>${row.customerName || ""}</td>
            <td>${row.itemDescription || row.itemCode || ""}</td>
            <td>${apiData?.wtPerBag || ""}</td>
            <td>${apiData?.bardanaType || ""}</td>
            <td>${row.dcQty || ""}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  // ✅ Customer Copy Table (same as Office Copy Table)
  const customerCopyTableHTML = `
    <table class="table">
      <thead>
        <tr><th>DC #</th><th>Party Name</th><th>Commodity</th><th>Bag Condition</th><th>Bag Type</th><th>Qty</th></tr>
      </thead>
      <tbody>
        ${dbRows.map(row => `
          <tr>
            <td>${row.dcNo || ""}</td>
            <td>${row.customerName || ""}</td>
            <td>${row.itemDescription || row.itemCode || ""}</td>
            <td>${apiData?.wtPerBag || ""}</td>
            <td>${apiData?.bardanaType || ""}</td>
            <td>${row.dcQty || ""}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Feeds Loading Order</title>
  <style>
    body { font-family:'Times New Roman', Times, serif; font-size: 20px; margin: 10px; padding: 0; }
    .container { border: 1px solid black; padding: 20px; height: auto; box-sizing: border-box; }
    .title { text-align: center; font-weight: bold; margin-bottom: 3px; font-size: 20px; }
    .copy-label { text-align: left; font-weight: bold; margin-bottom: 2px; font-size: 14px; }
    .info-table { border-collapse: collapse; width: 100%; }
    .info-table td { border-bottom: 1px solid black; padding: 0px 0px; line-height: 0.9; }
    .print-date { text-align: right; font-size: 11px; font-weight: bold; }
    .label-cell { width: 20%; font-weight: bold; font-size: 12px; padding-left: 1px; }
    .value-cell { width: 40%; font-weight: bold; font-size: 15px; padding-right: 1px; }
    .slip-no-value { font-weight: 900; font-size: 17px !important; }
    
    /* ✅ Image box - BARA */
    .image-cell { width: 35%; border-left: 1px solid black; text-align: center; }
    .image-box-tall { height: 130px; display: flex; justify-content: center; align-items: center; border: 1px solid black; overflow: hidden; }
    .image-box-tall img { max-height: 100%; max-width: 100%; object-fit: contain; }
    
    .center-box { border: 1px solid black; text-align: center; font-weight: bold; width: 100%; height: 90px; display: flex; flex-direction: column; justify-content: center; box-sizing: border-box; padding: 6px 8px; }
    .truck-label { font-weight: normal; font-size: 12px; border-bottom: 1px solid black; margin-bottom: 3px; padding-bottom: 2px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 6px; margin-bottom: 6px; }
    .table th, .table td { border: 1px solid black; padding: 4px 5px; text-align: left; font-size: 14px; font-weight: bold; }
    .signatures { display: flex; justify-content: space-between; margin-top: 15px; gap: 10px; }
    .signature-block { flex: 1; font-size: 12px; text-align: center; }
    .signature-label { display: inline-block; font-size: 12px; font-weight: bold; }
    .signature-line { display: inline-block; border-bottom: 1px solid black; width: 100px; position: relative; }
    .signature-name { font-size: 9px; font-weight: bold; color: #444; position: absolute; top: -15px; left: 50%; transform: translateX(-50%); white-space: nowrap; }
    .signature-container { display: flex; align-items: center; justify-content: center; gap: 3px; }
    .totals { display: flex; justify-content: flex-end; margin-top: 6px; font-weight: bold; font-size: 14px; }
    .vehicle-no { font-weight: 900; font-size: 17px; }
    
    /* ✅ More space between Office and Customer copies */
    hr.dashed { border: 2px dashed #aaa; margin: 150px 0; }
    .copy-spacing { margin-bottom: 120px; }
  </style>
</head>
<body>
<div class="container">
  <!-- OFFICE COPY -->
  <div class="copy-spacing">
    <div class="print-date">Print Date: ${currentDate} ${currentTime}</div>
    <div class="title">Sabirs Vegetable Oils (Pvt.) Ltd.</div>
    <div class="title">ORDER SLIP</div>
    <div class="copy-label">Office Copy</div>
    <div style="display: flex; justify-content: space-between; border: 1px solid black; border-left: 1px solid black; height: 130px;">
      <table class="info-table" style="width: 33.33%; border-right: 1px solid black;">
        <tr>
          <td class="label-cell">Slip No:</td>
          <td class="value-cell"><span class="slip-no-value">${apiData?.slipNo || ""}</span></td>
          <td class="image-cell" rowspan="3" style="width: 35%;">
            <div class="image-box-tall" style="height: 130px;">
              <img src="${firstImg}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
              <div style="display: none; font-size: 8px; color: #666;">No Img</div>
            </div>
          </td>
        </tr>
        <tr><td class="label-cell">Time In:</td><td class="value-cell">${displaySlipInTime}</td></tr>
      </table>
      <div class="center-wrapper" style="width: 28%; display: flex; align-items: center; justify-content: center; border-right: 1px solid black; height: 100%;">
        <div class="center-box" style="height: 70%; width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; border: none; padding: 2px 4px;">
          <div class="truck-label" style="font-size: 12px; font-weight: 900; border-bottom: 1px solid black; width: 100%; text-align: center; padding-bottom: 2px; margin-bottom: 2px;">Truck #</div>
          <span class="vehicle-no" style="font-size: 14px; font-weight: 900; text-align: center; width: 100%;">${vehicleNo || apiData?.vehicleNo || "N/A"}</span>
        </div>
      </div>
      <table class="info-table" style="width: 37%; border-right: 1px solid black;">
        <tr>
          <td class="label-cell">First Weight:</td>
          <td class="value-cell">${firstWeight ? parseFloat(firstWeight).toLocaleString("en-IN") : ""}</td>
          <td class="image-cell" rowspan="3" style="width: 35%;">
            <div class="image-box-tall" style="height: 130px;">
              <img src="${secondImg}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
              <div style="display: none; font-size: 8px; color: #666;">No Img</div>
            </div>
          </td>
        </tr>
      </table>
    </div>

    ${officeCopyTableHTML}

    <div class="totals">
      <div>Grand Total: ${grandTotal.toLocaleString('en-IN')}</div>
    </div>
    ${signaturesHTML}
  </div>
  
  <hr class="dashed" />

  <!-- CUSTOMER COPY (No Images) -->
  <div class="copy-spacing">
    <div class="print-date">Print Date: ${currentDate} ${currentTime}</div>
    <div class="title">Sabirs Vegetable Oils (Pvt.) Ltd.</div>
    <div class="title">ORDER SLIP</div>
    <div class="copy-label">Customer Copy</div>
    <div style="display: flex; justify-content: space-between; border: 1px solid black; border-left: 1px solid black; height: 90px;">
      <table class="info-table" style="width: 33.33%; border-right: 1px solid black;">
        <tr>
          <td class="label-cell">Slip No:</td>
          <td class="value-cell"><span class="slip-no-value">${apiData?.slipNo || ""}</span></td>
        </tr>
        <tr><td class="label-cell">Time In:</td><td class="value-cell">${displaySlipInTime}</td></tr>
      </table>
      <div class="center-wrapper" style="width: 33.33%; display: flex; align-items: center; justify-content: center; border-right: 1px solid black; height: 100%;">
        <div class="center-box" style="height: 100%; width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; border: none; padding: 4px 6px;">
          <div class="truck-label" style="font-size: 12px; font-weight: 900; border-bottom: 1px solid black; width: 100%; text-align: center; padding-bottom: 3px; margin-bottom: 3px;">Truck #</div>
          <span class="vehicle-no" style="font-size: 14px; font-weight: 900; text-align: center; width: 100%;">${vehicleNo || apiData?.vehicleNo || "N/A"}</span>
        </div>
      </div>
      <table class="info-table" style="width: 33.33%; border-right: 1px solid black;">
        <tr><td class="label-cell">First Weight:</td><td class="value-cell">${firstWeight ? parseFloat(firstWeight).toLocaleString("en-IN") : ""}</td></tr>
      </table>
    </div>

    ${customerCopyTableHTML}

    <div class="totals">
      <div>Grand Total: ${grandTotal.toLocaleString('en-IN')}</div>
    </div>
    ${signaturesHTML}
  </div>
</div>
</body>
</html>
`;
};

const handleSalesDataChange = (
  index: number,
  field: string | string[],
  value: any | any[]
) => {
  setSalesData(prev => {
    const newData = [...prev];
    const updatedRow = { ...newData[index] };

    if (Array.isArray(field) && Array.isArray(value)) {
      field.forEach((f, i) => {
        updatedRow[f] = value[i];
      });
    } else if (typeof field === "string") {
      updatedRow[field] = value;
    }

    newData[index] = updatedRow;
    return newData;
  });
};


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


const handleSalesRowDelete = (index: number) => {
  // Get the freight value of the row being deleted
  const deletedFreight = parseFloat(salesData[index]?.freight?.toString() || "0") || 0;
  
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
      freight: "",
    };
    return newData;
  });
  
  // Update the master freight total by subtracting the deleted row's freight
  if (deletedFreight > 0) {
    setFormData(prev => {
      const currentFreight = parseFloat(prev.freight || "0") || 0;
      const newFreightTotal = Math.max(0, currentFreight - deletedFreight);
      
      return {
        ...prev,
        freight: String(newFreightTotal)
      };
    });
  }
};




  // const handleSalesRowDelete = (index: number) => {
    
  //   setSalesData((prevData) => {
  //     const newData = [...prevData];
  //     // Clear the row data
  //     newData[index] = {
  //       doId: "",
  //       dcNo: "",
  //       doNo: "",
  //       customerName: "",
  //       vehicleNo: "",
  //       doDate: "",
  //       itemDescription: "",
  //       dcQty: "",
  //       doQty: "",
  //       branch: "",
  //       dcId: "",
  //       customerId: "",
  //       itemId: "",
  //       itemCode: "",
  //       freight: "",
  //     };
  //     return newData;
  //   });
  // };


  
  const { comPort } = useComPort();

  // ===== HIGHLY OPTIMIZED DATA FETCHING - MAXIMUM PERFORMANCE =====
  // Fetch first weight records with aggressive caching for performance
  const { data: firstWeightRecords = [] } = useQuery({
    queryKey: ["/api/purchase/first-weight-records"],
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });

  // Fetch offline records with aggressive caching
  const { data: offlineRecords = [] } = useQuery({
    queryKey: ["/api/purchases/offline"],
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // State for showing offline entries
  const [showOfflineEntries, setShowOfflineEntries] = useState(false);

  // Filter records based on search criteria and form type
  const filteredRecords = (() => {
    let records = [];

    if (showOfflineEntries) {
      // Show offline records when offline tab is selected
      records = Array.isArray(offlineRecords) ? offlineRecords : [];
    } else {
      // Show all first weight records for other tabs
      records = Array.isArray(firstWeightRecords) ? firstWeightRecords : [];
    }

    return records.filter((record: any) => {
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
    });
  })();

// Function to load data by wb_id for editing
const loadDataByWbId = async (wbId: number) => {
  try {
    console.log("loadDataByWbId called with wbId:", wbId);
    const response = await fetch(`/api/sales/by-wbid/${wbId}`);
    console.log("Response status:", response.status);
    const data = await response.json();
    console.log("Response data:", data);
    
    if (data && data.master) {
      const master = data.master;
      const details =
        data.details && data.details.length > 0 ? data.details[0] : {};

      // ⭐ Debug: Check values from DB
      console.log("🔍 Values from DB:", {
        reg_type: master.reg_type,
        bardana_bag: master.bardana_bag,
        master_bardana_weight: master.bardana_weight,
        bardana_type: details.bardana_type,
        weight_per_bags: details.weight_per_bags,
        details_bardana_weight: details.bardana_weight,
        no_of_bags: details.no_of_bags,
        con: details.con,
      });

      // Enable edit mode
      setIsEditMode(true);
      setEditingWbId(master.wb_id);
      console.log("✅ Edit mode enabled for wb_id:", master.wb_id);

      // ⭐ Convert values to boolean
      const regTypeValue = master.reg_type || "Null";
      const excBagsValue = master.bardana_bag === 'Y' || master.bardana_bag === 'y';
      const conValue = details.con === 'Y' || details.con === 'y' || details.con === 'YES';

      console.log("🔄 Converted values:", {
        regType: regTypeValue,
        excBags: excBagsValue,
        con: conValue,
      });

      console.log("🔍 DEBUG - details object:", details);
      console.log("🔍 DEBUG - bardana_type:", details.bardana_type);
      console.log("🔍 DEBUG - weight_per_bags:", details.weight_per_bags);
      console.log("🔍 DEBUG - full data:", data);

      // Load all the form data including detail table data
      setFormData((prev) => ({
        ...prev,
        slipNo: master.slip_no || "",
        vehicleNo:
          master.entry_type === "OFFLINE"
            ? details.vehicle_no || ""
            : master.vehicle_no || details.vehicle_no || "",
        firstWeight: master.first_weight ? String(master.first_weight) : "",
        secondWeight: master.second_weight
          ? String(master.second_weight)
          : "",
        netWeight: master.net_weight ? String(master.net_weight) : "",
        
        // ✅ MASTER TABLE BARDANA WEIGHT - Renamed to masterBardanaWeight
        masterBardanaWeight: master.bardana_weight
          ? String(master.bardana_weight)
          : "",
        
        grossWeight: master.gross_weight ? String(master.gross_weight) : "",
        freight: master.freight ? String(master.freight) : "",
        remarks: master.remarks || "",
        driverName: master.driver_name || "",
        
        // ✅ Weight by names (for edit mode)
        created_by_name: master.created_by_name || "",
        second_weight_by_name: master.second_weight_by_name || master.created_by_name || "",
        second_weight_by: master.second_weight_by || "",

        // ⭐ MASTER TABLE FIELDS
        reg_type: master.reg_type || "R",
        excBags: excBagsValue,

        // ⭐ DETAILS TABLE FIELDS
        bardanaType: details.bardana_type || "",
        wtPerBag: details.weight_per_bags ? String(details.weight_per_bags) : "",
        
        // ✅ DETAILS TABLE BARDANA WEIGHT - Keep as bardanaWeight
        bardanaWeight: details.bardana_weight ? String(details.bardana_weight) : "",
        
        noOfBags: details.no_of_bags ? String(details.no_of_bags) : "",
        igpCheckbox: conValue,

        status: master.status || "",
        vendor: details.vendor_name || "",
        igpNo: details.igp_no || "",
        poNo: details.po_no || "",
        itemCode: details.item_code || "",
        itemDesc: details.item_desc || "",
        poQty: details.po_qty ? String(details.po_qty) : "",
        igpQty: details.igp_qty ? String(details.igp_qty) : "",
        balanceQty: details.balance_qty ? String(details.balance_qty) : "",
        freightChild: details.freight_child || "",
        igpDate: details.igp_date || "",
        slipInTime: master.slip_in_time
          ? formatDatetimeLocal(master.slip_in_time)
          : "",
        slipOutTime: master.slip_out_time
          ? formatDatetimeLocal(master.slip_out_time)
          : "",
        entryType: master.entry_type || "SALE",
        branch: master.branch_id ? String(master.branch_id) : "",
        branchId: master.branch_id ? String(master.branch_id) : "",
        
        // ✅ NEW FIELDS FOR BUTTON DISABLE LOGIC
        isFirstWeightSaved: !!master.first_weight,
        isSecondWeightSaved: !!master.second_weight,
      }));

      // ✅ Debug: Check after setting
      setTimeout(() => {
        console.log("📝 After setting formData:", {
          regType: formData.reg_type,
          excBags: formData.excBags,
          masterBardanaWeight: formData.masterBardanaWeight,
          bardanaType: formData.bardanaType,
          wtPerBag: formData.wtPerBag,
          bardanaWeight: formData.bardanaWeight,
          noOfBags: formData.noOfBags,
        });
      }, 100);

      // 🔥 Set Save Disable Condition
      setDisableSaveButton(
        master.status === "ONLINE" &&
        !!master.first_weight &&
        !!master.second_weight
      );
      
      // Set online/offline status based on database values
      console.log(
        "Database entry mode - offline_entry:",
        master.offline_entry,
        "online_entry:",
        master.online_entry
      );

      if (master.offline_entry === "Yes") {
        console.log("Setting offline mode for sale entry");
        setOnlineMode(false);

        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set("type", "offline");
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState({}, "", newUrl);
      } else if (master.online_entry === "Yes") {
        console.log("Setting online mode for sale entry");
        setOnlineMode(true);

        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set("type", "online");
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState({}, "", newUrl);
      }

      // Load sales data from details
      if (data.details && data.details.length > 0) {
        const salesRows = data.details.map((detail: any, index: number) => {
          const branchName =
            branches.find((b) => b.branch_id === master.branch_id)
              ?.branch_name || "";

          return {
            doId: String(index + 1),
            dcNo: detail.manual_dc_no || detail.igp_no || "",
            doNo: detail.do_no || detail.po_no || "",
            customerName: detail.customer_name || detail.vendor_name || "",
            vehicleNo: detail.vehicle_no || "",
            doDate: detail.do_date || detail.igp_date || "",
            itemDescription: detail.item_desc || "",
            dcQty: detail.dc_qty
              ? String(detail.dc_qty)
              : detail.igp_qty
              ? String(detail.igp_qty)
              : "",
            doQty: detail.do_qty
              ? String(detail.do_qty)
              : detail.po_qty
              ? String(detail.po_qty)
              : "",
            branch: branchName,
            dcId: detail.dc_id || "",
            customerId: detail.customer_id || "",
            itemId: detail.item_id || "",
            itemCode: detail.item_code || "",
            // ✅ FIX: Add bardana fields to each row
            bardanaType: detail.bardana_type || details.bardana_type || "",
            wtPerBag: detail.weight_per_bags 
              ? String(detail.weight_per_bags) 
              : details.weight_per_bags 
                ? String(details.weight_per_bags) 
                : "",
            bardanaWeight: detail.bardana_weight 
              ? String(detail.bardana_weight) 
              : details.bardana_weight 
                ? String(details.bardana_weight) 
                : "",
            noOfBags: detail.no_of_bags 
              ? String(detail.no_of_bags) 
              : details.no_of_bags 
                ? String(details.no_of_bags) 
                : "",
            bardanaTypeId: detail.bardana_type_id || details.bardana_type_id || null,
            freight: detail.freight_child || detail.freight || "",
          };
        });

        // Ensure 8 rows - also add bardana fields to empty rows
        while (salesRows.length < 8) {
          salesRows.push({
            doId: "",
            dcId: "",
            dcNo: "",
            doNo: "",
            customerName: "",
            vehicleNo: "",
            doDate: "",
            itemDescription: "",
            dcQty: "",
            doQty: "",
            branch: "",
            customerId: "",
            itemId: "",
            itemCode: "",
            bardanaType: "",
            wtPerBag: "",
            bardanaWeight: "",
            noOfBags: "",
            bardanaTypeId: null,
            freight: "",
          });
        }

        setSalesData(salesRows);
        console.log("✅ Sales data loaded in edit mode with bardana fields:", salesRows);

        // 🔹 Update details state for customer LOV
        const detailsRows = salesRows.map((row: any) => ({
          customerName: row.customerName || "",
          customerId: row.customerId || "",
        }));
        setdetails(detailsRows);
        console.log("✅ Details for customer LOV updated:", detailsRows);

      } else {
        // No detail data found, reset to empty table with bardana fields
        setSalesData(
          Array.from({ length: 8 }, (_, index) => ({
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
            bardanaType: "",
            wtPerBag: "",
            bardanaWeight: "",
            noOfBags: "",
            bardanaTypeId: null,
            freight: "",
          }))
        );
        console.log("No sales detail data found, using empty table");
      }
    }
  } catch (error) {
    console.error("Error loading data by wbId:", error);
    alert("Failed to load record data");
  }
};

  // // Function to get current date in YYYY-MM-DD format
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
  entryType: "SALE",

  // Weight measurements
  firstWeight: "",
  secondWeight: "",
  netWeight: "",
  bardanaWeight: "",
  masterBardanaWeight: "",
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
  created_by_name: "",        
  second_weight_by_name: "", 
  second_weight_by: "",       

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
  freightChild: "", 
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
  totalFeedBags: "",
  vendorId: "",
  weightPerBags: "",
  dcQty: "",
  supWeightWithoutBardana: "",
  netSupplierWeight: "",
  isPercentageMode: false,
  isFirstWeightSaved: false,  
  isSecondWeightSaved: false,   
  excBags: false, 
  regType: "NULL",
  reg_type: "NULL",     
  grossWBD: "",          
  purchase: "NULL",     
  sale: ""         
};




  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingWbId, setEditingWbId] = useState<number | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);

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
  const [branches, setBranches] = useState<any[]>([]);
  const [entryTypes, setEntryTypes] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [itemSearchQuery, setItemSearchQuery] = useState("");
const [selectedBranch, setSelectedBranch] = useState<number | null>(null);




 // ✅ 1st Weight Button
    const isFirstWeightDisabled = formData.isFirstWeightSaved || isRegTypeNull();

const filteredCustomers = useMemo(() => {
  if (!customers || customers.length === 0) {
    //console.log("❌ No customers available");
    return [];
  }

  const query = customerSearchQuery.trim().toLowerCase();
  console.log("🔍 Search query:", query);
  console.log("📊 Total customers:", customers.length);

  if (!query || query === "") {
    console.log("✅ Showing first 5 customers");
    return customers.slice(0, 5);
  }

  // Fast case-insensitive search with early termination
  const matches = [];
  for (let i = 0; i < customers.length && matches.length < 50; i++) {
    const customer = customers[i];
    
    // 🔥 FIX: Check BOTH name AND customer_name
    const customerNameLower = (
      customer.name || 
      customer.customer_name || 
      customer.full_name ||
      ""
    ).toLowerCase();
    
    console.log(`Customer ${i}:`, customerNameLower, "includes?", query, customerNameLower.includes(query));
    
    if (customerNameLower.includes(query)) {
      console.log("✅ MATCH found!");
      matches.push(customer);
    }
  }

  console.log(`✅ Found ${matches.length} matching customers`);
  return matches;
}, [customers, customerSearchQuery]);






  // Optimized filtered items with better case-insensitive performance
  const filteredItems = useMemo(() => {
    if (!items || items.length === 0) return [];

    const query = itemSearchQuery.trim().toLowerCase();

    if (!query) {
      // Show only first 10 items when no search query
      return items.slice(0, 10);
    }

    // Fast case-insensitive search with early termination
    const matches = [];
    for (let i = 0; i < items.length && matches.length < 50; i++) {
      const item = items[i];
      const itemCodeLower = (item.code || "").toLowerCase();
      const itemDescLower = (item.description || "").toLowerCase();

      if (itemCodeLower.includes(query) || itemDescLower.includes(query)) {
        matches.push(item);
      }
    }

    return matches;
  }, [items, itemSearchQuery]);
  const { cameraIp, cameraPort } = useConfig();


useEffect(() => {
  const firstWeight = parseFloat(formData.firstWeight) || 0;
  const secondWeight = parseFloat(formData.secondWeight) || 0;
  
  // ✅ Use masterBardanaWeight and round it properly
  const bardanaWeightRaw = parseFloat(formData.masterBardanaWeight) || 0;
  const bardanaWeight = Math.round(bardanaWeightRaw); // ✅ Round to nearest integer

  console.log("🔍 DEBUG - Weights Calculation:", {
    firstWeight,
    secondWeight,
    masterBardanaWeight_raw: formData.masterBardanaWeight,
    bardanaWeightRaw,
    bardanaWeight_rounded: bardanaWeight,
  });

  // ✅ Gross Weight = (Second Weight - First Weight) - Bardana Weight
  const grossWeight = (secondWeight - firstWeight) - bardanaWeight;
  const grossWeightRounded = Math.round(grossWeight);

  // ✅ Net Weight = Gross Weight (same as gross weight after bardana subtraction)
  const netWeightRounded = Math.round(grossWeight);

  // ✅ Gross WBD - No change (Second Weight - First Weight)
  const grossWBD = Math.round(secondWeight - firstWeight);

  setFormData((prev) => ({
    ...prev,
    grossWeight: grossWeightRounded.toString(),
    netWeight: netWeightRounded.toString(),
    grossWBD: grossWBD.toString(),
  }));

  console.log("🔄 Weights Calculated:", {
    firstWeight,
    secondWeight,
    bardanaWeight,
    grossWeight: grossWeightRounded,
    netWeight: netWeightRounded,
    grossWBD: grossWBD,
  });

}, [
  formData.firstWeight,
  formData.secondWeight,
  formData.masterBardanaWeight,
]);


useEffect(() => {
  // calculate total DC Qty from salesData
  const totalDcQty = salesData.reduce(
    (sum, row) => sum + (parseFloat(row.dcQty) || 0),
    0
  );

  const netWeight = parseFloat(formData.netWeight);

  if (!isNaN(netWeight) && totalDcQty > 0) {
    setFormData(prev => ({
      ...prev,
      weightPerBags: (netWeight / totalDcQty).toFixed(2),
    }));
  } else {
    setFormData(prev => ({
      ...prev,
      weightPerBags: "",
    }));
  }
}, [formData.netWeight, salesData]); // salesData change hone par bhi recalc




 // Calculate Total Weight Diff
const totalWeightDiff = useMemo(() => {
  const netWeight = parseFloat(formData.netWeight) || 0;

  // 🔹 Sum of all DC Qty in table
  const totalDcQty = salesData.reduce(
    (sum, row) => sum + (parseFloat(row.dcQty) || 0),
    0
  );

  // 🔹 Formula: (dcQty * 50) - netWeight
  return netWeight - (totalDcQty * 50)  ;

}, [formData.netWeight, salesData]);



// // Calculate Total Weight Diff
// const totalWeightDiff = useMemo(() => {
//    const firstWeight = parseFloat(formData.firstWeight) || 0;
//    const secondWeight = parseFloat(formData.secondWeight) || 0;

//   // 🔹 Sum of all DC Qty in table
//   const totalDcQty = salesData.reduce(
//     (sum, row) => sum + (parseFloat(row.dcQty) || 0),
//     0
//   );

//   // 🔹 Formula: (dcQty * 50) - netWeight
//   return firstWeight + (totalDcQty * 50) - secondWeight;

// }, [formData.netWeight, salesData]);




  
interface SalesRow {
  // Basic Fields
  doId: string;
  dcNo: string;
  doNo: string;
  customerName: string;
  vehicleNo: string;
  doDate: string;
  itemDescription: string;
  dcQty: string;
  doQty: string;
  branch: string;
  
  // Optional Fields
  branchId?: string | number;
  dcId?: string;
  customerId?: number | null;
  itemId?: string;
  itemCode?: string;
  freight?: string | number;
  isFetched?: boolean;
  
  // ✅ Bardana Fields
  bardanaType?: string;
  wtPerBag?: string;
  bardanaWeight?: string;
  noOfBags?: string;
  bardanaTypeId?: number | null;
}



// --------------------------------------
const fetchDcData = async (dcNo: string, rowIndex: number) => {
  if (!dcNo || dcNo.trim() === "") {
    alert("Please enter DC No");
    return;
  }

  // ✅ Check if branch is selected (branchId for DB)
  if (!formData.branchId) {
    alert("Please select a branch first");
    return;
  }

  try {
    // ✅ Get reg_type from formData
    const regType = formData.reg_type || 'R';
    
    // ✅ API call with branch ID AND reg_type (for backend filtering)
    const apiUrl = `http://portal.sabirsgroup.com:8184/ords/sabroso_ords/wb-om/dc_data?dc_no=${dcNo}&branch=${formData.branchId}&reg_type=${regType}`;
    console.log("Fetching URL with Branch ID and Reg Type:", apiUrl);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("DC API Response:", data);

    if (data?.items?.length > 0) {
      
      // ✅ Get branch NAME from branches array using branchId
      const selectedBranch = branches.find(
        (b) => b.branch_id.toString() === formData.branchId?.toString()
      );
      
      const branchName = selectedBranch?.branch_name || "";
      const branchIdForDB = formData.branchId;

      console.log("Branch Name for display:", branchName);
      console.log("Branch ID for DB:", branchIdForDB);
      console.log("Reg Type for API:", regType);

      // ✅ Store existing bardana values before updating
      const existingBardanaType = salesData[rowIndex]?.bardanaType || '';
      const existingWtPerBag = salesData[rowIndex]?.wtPerBag || '';
      const existingBardanaWeight = salesData[rowIndex]?.bardanaWeight || '';
      const existingNoOfBags = salesData[rowIndex]?.noOfBags || '';

      console.log("📦 Existing bardana values:", {
        bardanaType: existingBardanaType,
        wtPerBag: existingWtPerBag,
        bardanaWeight: existingBardanaWeight,
        noOfBags: existingNoOfBags,
      });

      // Prepare new entries for salesData
      const newEntries: SalesRow[] = data.items.map((item: any, index: number) => {
        const freightValue = parseFloat(item.freight || item.freight_amount || "0");
        
        // ✅ FIX: dcQty ko handle karo - 0 bhi aaye toh set ho
        const dcQty = item.dc_qty !== undefined && item.dc_qty !== null && item.dc_qty !== ''
          ? String(item.dc_qty)
          : "";
        
        // ✅ FIX: del_qty ko handle karo - 0 bhi aaye toh set ho
        const doQty = item.del_qty !== undefined && item.del_qty !== null && item.del_qty !== ''
          ? String(item.del_qty)
          : "";
        
        // ✅ Preserve existing bardana values for the first row only
        const isFirstRow = index === 0;
        
        return {
          doId: item.do_id || "",
          dcNo: item.dc_no || "",
          doNo: item.delivery_order_no ? String(item.delivery_order_no) : "",
          customerName: item.customer_name || "",
          vehicleNo: item.vehicle_no || "",
          doDate: item.dc_date
            ? new Date(item.dc_date).toISOString().split("T")[0]
            : "",
          itemDescription: item.item_desc || "",
          dcQty: dcQty,
          doQty: doQty,
          branch: branchName,
          branchId: branchIdForDB,
          dcId: item.dc_id || "",
          customerId: item.customer_id != null ? Number(item.customer_id) : null,
          itemId: item.item_id || "",
          itemCode: item.item_code || "",
          freight: freightValue,
          isFetched: true,
          regType: regType,
          // ✅ Preserve existing bardana values
          bardanaType: isFirstRow ? existingBardanaType : '',
          wtPerBag: isFirstRow ? existingWtPerBag : '',
          bardanaWeight: isFirstRow ? existingBardanaWeight : '',
          noOfBags: isFirstRow ? existingNoOfBags : '',
        };
      });

      // Prepare details entries
      const newDetailsEntries = data.items.map((item: any) => {
        const freightValue = parseFloat(item.freight || item.freight_amount || "0");
        
        const dcQty = item.dc_qty !== undefined && item.dc_qty !== null && item.dc_qty !== ''
          ? String(item.dc_qty)
          : "";
        
        const doQty = item.del_qty !== undefined && item.del_qty !== null && item.del_qty !== ''
          ? String(item.del_qty)
          : "";
        
        return {
          customerName: item.customer_name || "",
          customerId: item.customer_id != null ? Number(item.customer_id) : null,
          itemCode: item.item_code || "",
          itemDescription: item.item_desc || "",
          dcQty: dcQty,
          doQty: doQty,
          uom: "",
          rate: "",
          amount: "",
          doId: item.do_id || "",
          doNo: item.delivery_order_no ? String(item.delivery_order_no) : "",
          vehicleNo: item.vehicle_no || "",
          doDate: item.dc_date
            ? new Date(item.dc_date).toISOString().split("T")[0]
            : "",
          dcId: item.dc_id || "",
          itemId: item.item_id || "",
          branchId: branchIdForDB,
          dcNo: item.dc_no || "",
          branch: branchName,
          freight: freightValue,
          regType: regType,
        };
      });

      // Update sales data array
      setSalesData((prev: SalesRow[]) => {
        const updated = [...prev];
        newEntries.forEach((entry, index) => {
          // ✅ Merge existing data with new data (preserve bardana fields)
          const existingRow = updated[rowIndex + index] || {};
          updated[rowIndex + index] = {
            ...existingRow,
            ...entry,
            // ✅ Explicitly preserve bardana fields from existing row
            bardanaType: existingRow.bardanaType || entry.bardanaType || '',
            wtPerBag: existingRow.wtPerBag || entry.wtPerBag || '',
            bardanaWeight: existingRow.bardanaWeight || entry.bardanaWeight || '',
            noOfBags: existingRow.noOfBags || entry.noOfBags || '',
          };
        });
        return updated;
      });

      // Update details array
      setdetails((prev) => {
        const updated = [...prev];
        newDetailsEntries.forEach((entry: any, index: any) => {
          updated[rowIndex + index] = {
            ...updated[rowIndex + index],
            customerName: entry.customerName,
            customerId: entry.customerId,
            itemCode: entry.itemCode,
            itemDescription: entry.itemDescription,
            dcQty: entry.dcQty,
            doQty: entry.doQty,
            doId: entry.doId,
            doNo: entry.doNo,
            vehicleNo: entry.vehicleNo,
            doDate: entry.doDate,
            dcId: entry.dcId,
            itemId: entry.itemId,
            branchId: entry.branchId,
            dcNo: entry.dcNo,
            branch: entry.branch,
            freight: entry.freight,
            regType: entry.regType,
          };
        });
        return updated;
      });

      // Calculate TOTAL freight
      const totalFreightFromDC =
        parseFloat(data.items?.[0]?.freight || data.items?.[0]?.freight_amount || "0") || 0;

      // Update master freight
      setFormData((prev) => {
        return {
          ...prev,
          dcQty: newEntries[0]?.dcQty || prev.dcQty,
          netWeight: prev.netWeight || "",
          freight: String(totalFreightFromDC)
        };
      });

      saveFreightToLocalStorage(dcNo, totalFreightFromDC);

    } else {
      alert(`No data found for DC No: ${dcNo}`);
    }
  } catch (error) {
    console.error("Error fetching DC data:", error);
    alert("Failed to fetch DC data. Please check the DC number and try again.");
  }
};



// 🔹 Helper function to save freight to localStorage
const saveFreightToLocalStorage = (dcNo: string, freight: number) => {
  try {
    const savedFreightData = JSON.parse(localStorage.getItem('dcFreightData') || '{}');
    savedFreightData[dcNo] = freight;
    localStorage.setItem('dcFreightData', JSON.stringify(savedFreightData));
  } catch (error) {
    console.error("Error saving freight to localStorage:", error);
  }
};

// 🔹 Function to load saved freight from localStorage (call on component mount)
const loadSavedFreight = () => {
  try {
    const savedFreightData = JSON.parse(localStorage.getItem('dcFreightData') || '{}');
    const totalFreight = Object.values(savedFreightData).reduce((sum: number, val: any) => {
      return sum + (parseFloat(val) || 0);
    }, 0);
    
    setFormData(prev => ({
      ...prev,
      freight: String(totalFreight)
    }));
  } catch (error) {
    console.error("Error loading saved freight:", error);
  }
};


// --------------------------------------------


  // Function to search and load data by slip number
  const searchAndLoadBySlipNo = async () => {
    if (!formData.slipNo || formData.slipNo.trim() === "") {
      alert("Please enter a slip number to search");
      return;
    }

    try {
      setLoading(true);
      console.log("Searching for slip:", formData.slipNo);

      // Search with entry type filtering to only find sale-related entries
      const response = await fetch(
        `/api/sales/by-slip/${formData.slipNo.trim()}?entry_type=SALE`
      );

      if (!response.ok) {
        alert(`No SALE record found for slip number ${formData.slipNo}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data && data.master) {
        const master = data.master;
        const entryType = master.entry_type;
        const isOffline = master.offline_entry === "Yes";

        console.log(
          "Found SALE record - Entry Type:",
          entryType,
          "Offline:",
          isOffline
        );

        // Check if this is a sale-related entry that can be edited in sales form
        if (entryType === "SALE" || entryType === "SALE_RETURN") {
          // Update online/offline status based on the found record
          setOnlineMode(!isOffline);

          // Determine the correct URL based on entry type and online/offline status
          const modeParam = isOffline ? "offline" : "online";

          if (entryType === "SALE_RETURN") {
            const targetUrl = `/sales-return?type=${modeParam}&edit=${master.wb_id}`;
            console.log(
              `Found ${entryType} entry (${
                isOffline ? "Offline" : "Online"
              }), redirecting to:`,
              targetUrl
            );
            setLocation(targetUrl);
          } else {
            // For SALE entries, stay on current page and load the data
            await loadDataByWbId(master.wb_id);

            // Update URL to show edit mode with correct type
            const newUrl = `/sales-form?type=${modeParam}&edit=${master.wb_id}`;
            window.history.replaceState({}, "", newUrl);

            // Exit search mode
            setIsSearchMode(false);
            setLoading(false);
            return;
          }
        } else {
          alert(
            `Found ${entryType} entry for slip ${formData.slipNo}, but this is the Sales form. Please use the appropriate form for ${entryType} entries.`
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

  // Function to cancel edit mode and return to new entry mode
  const cancelEdit = () => {
    setIsEditMode(false);
    setEditingWbId(null);
    resetFormToInitial();
  };

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

  //vehicle no in offline entry auto generate slip
  useEffect(() => {
    if (formData.offlineEntry === "Yes") {
      const firstVehicleNo = salesData
        .find((row) => row.vehicleNo?.trim())
        ?.vehicleNo?.trim();
      if (firstVehicleNo) {
        setFormData((prev) => ({
          ...prev,
          vehicleNo: firstVehicleNo,
        }));
      }
    }
  }, [salesData, formData.offlineEntry]);

  // Function to reset form to clean state
  const resetFormToInitial = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeMode = urlParams.get("type");
    const isOfflineMode = typeMode === "offline";

    // Sync onlineMode state with URL parameter
    setOnlineMode(typeMode === "online");

    // 🔹 Step 1: Immediately blank reset (master form)
    setFormData({
      ...initialFormData,
      slipNo: "", // temporary blank, API se update hoga
      slipInTime: "",
      onlineEntry: isOfflineMode ? "No" : "Yes",
      offlineEntry: isOfflineMode ? "Yes" : "No",
      entryType: "SALE",
      creationDate: getPKTDateTime(),
      lastUpdatedDate: getPKTDateTime(),
      slipDate: getPKTDateTime(),
      createdBy: user?.userid || "",
      vehicleNo: "",
        netWeight: formData.netWeight,  // preserve
  dcQty: formData.dcQty,          // preserve
    });

    // 🔹 Step 2: Exit edit mode immediately
    setIsEditMode(false);
    setEditingWbId(null);

    // 🔹 Step 3: Reset sales data table (always reset)
    setSalesData(
      Array.from({ length: 8 }, () => ({
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
      }))
    );

    // 🔹 🔥 Step 3.1: RESET DETAILS (THIS WAS MISSING)
setdetails(
  Array.from({ length: 8 }, () => ({
    customerName: "",
    customerId: null,
  }))
);

// 🔹 Also reset LOV-related flags
setIsCustomerSelected(false);
setOpenCustomerLovRowIndex(null);
setFocusedCustomerRowIndex(null);
setCustomerSearchQuery("");
setHighlightedCustomerIndex(-1);

    // 🔹 Step 4: Fetch next slip number asynchronously
    // fetch("/api/purchases/next-slip?entry_type=SALE")
    //   .then((res) => {
    //     if (!res.ok) throw new Error("Failed to fetch next slip number");
    //     return res.json();
    //   })
    //   .then((data) => {
    //     setFormData((prev) => ({
    //       ...prev,
    //       slipNo: data.nextSlipNo,
    //       vehicleNo: isOfflineMode ? salesData[0]?.vehicleNo || "" : "",
    //     }));
    //   })
    //   .catch((err) => {
    //     console.error("Error fetching next slip number:", err);
    //     alert("Failed to fetch next slip number. Please try again.");
    //   });
  };

  // Get camera data
  const { data: camera } = useQuery({
    queryKey: ["/api/cameras/1"],
    enabled: true,
  });

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

  // const formatISODate = (localString: string) => {
  //   if (!localString) return null;
  //   return new Date(localString).toISOString();
  // };

const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
    // ✅ Yeh block reg_type ko handle karega
    setFormData((prev) => {
      // ✅ Ensure reg_type ki value NULL na ho
      let newValue = value;
      
      // ✅ Agar reg_type empty hai toh REGISTER set karein
      if (name === 'reg_type' && (!value || value === '')) {
        newValue = 'R';
      }
      
      // ✅ Purchase ya sale empty ho toh NULL set karein
      if ((name === 'purchase' || name === 'sale') && (!value || value === '')) {
        newValue = 'NULL';
      }
      
      // ✅ Agar reg_type change ho raha hai toh regType bhi sync karein
      if (name === 'reg_type') {
        return { 
          ...prev, 
          reg_type: newValue,
          regType: newValue,        // Sync with old field
          registerType: newValue    // Sync with old field
        };
      }
      
      return { ...prev, [name]: newValue };
    });
  }
};



  const toggleOnlineMode = (isOnline: boolean) => {
    console.log(
      "toggleOnlineMode called with:",
      isOnline,
      "Current onlineMode:",
      onlineMode
    );

    // Only update if mode actually changes
    if (onlineMode !== isOnline) {
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
    }
  };

  const readLicensePlate = async () => {
    setPlateReading(true);
    try {
      console.log("Starting license plate recognition...");
      const response = await fetch("/api/cameras/read-plate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cameraId: 1 }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("OCR Response:", result);

        if (result.success && result.plateNumber) {
          setFormData((prev) => ({ ...prev, vehicleNo: result.plateNumber }));
          console.log(
            "License plate detected:",
            result.plateNumber,
            "Method:",
            result.method
          );

          // Show success message with method info
          const methodText =
            result.method === "camera_anpr_api"
              ? "Camera ANPR"
              : "Computer Vision OCR";
          alert(
            `License plate detected: ${
              result.plateNumber
            }\nMethod: ${methodText}\nConfidence: ${(
              result.confidence * 100
            ).toFixed(0)}%`
          );
        } else {
          console.log("No license plate detected:", result.error);
          alert(
            `License plate recognition failed:\n${result.error}\n\nPlease ensure:\n- Camera is connected and accessible\n- Vehicle with license plate is visible in camera view\n- Camera has clear view of the license plate`
          );
        }
      } else {
        const errorText = await response.text();
        console.error("API error:", errorText);
        alert("Failed to process camera image");
      }
    } catch (error) {
      console.error("Error reading license plate:", error);
      alert("Error connecting to camera system");
    }
    setPlateReading(false);
  };


   // ✅ Check if DC No exists in salesData (memoized)
   // ✅ Check if DC No exists in salesData (memoized) - FOR NUMBER
const hasDcNoInSalesData = useMemo(() => {
    if (!onlineMode) return true;
    return salesData.some((row) => {
        const dcNo = row?.dcNo;
        // ✅ dcNo is number, check if it exists and > 0
        return dcNo && dcNo > 0;
    });
}, [salesData, onlineMode]);


   // ✅ Save button disable condition
    const isSaveDisabled = useMemo(() => {
        if (loading || disableSaveButton) {
            return true;
        }
        if (onlineMode && !hasDcNoInSalesData) {
            return true;
        }
        return false;
    }, [loading, disableSaveButton, onlineMode, hasDcNoInSalesData]);


  // ===== MAXIMUM PERFORMANCE STATIC DATA FETCHING =====
  // Fetch entry types, branches, customers, and items with aggressive caching
  const { data: entryTypesData = [] } = useQuery({
    queryKey: ["/api/entry-types"],
    staleTime: 60 * 60 * 1000, // Cache for 1 hour (static data)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const { data: branchesData = [] } = useQuery({
    queryKey: ["/api/branches"],
    staleTime: 60 * 60 * 1000, // Cache for 1 hour (static data)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

 const { data: customersData = [] } = useQuery({
    queryKey: ["/api/customers", formData.branchId],
    queryFn: async ({ queryKey }) => {
        const [, branchId] = queryKey;
        
        if (!branchId) {
            console.log("No branchId, returning empty");
            return [];
        }
        
        console.log("Fetching customers for branch:", branchId);
        
        try {
            const response = await fetch("/api/customers");
            const result = await response.json();
            
            if (result.success) {
                console.log("Customers found:", result.data?.length);
                return result.data || [];
            }
            return [];
        } catch (error) {
            console.error("Error:", error);
            return [];
        }
    },
    enabled: !onlineMode && !!formData.branchId,
    staleTime: 30 * 60 * 1000,
});

  const { data: itemsData = [] } = useQuery({
    queryKey: ["/api/items"],
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: !onlineMode, // Only fetch when in offline mode
  });

  // Update state when data changes
  useEffect(() => {
    if (entryTypesData) setEntryTypes(entryTypesData);
  }, [entryTypesData]);

  useEffect(() => {
    if (branchesData) setBranches(branchesData);
  }, [branchesData]);

 useEffect(() => {
    if (customersData) setCustomers(customersData);
  }, [customersData]);


 useEffect(() => {
  if (itemsData && Array.isArray(itemsData)) {
    // Transform items data to match expected format
    const transformedItems = itemsData.map(item => ({
      id: item.item_id,
      description: item.item_desc,
      item_desc: item.item_desc,  // Keep original for compatibility
      code: item.item_code,
      item_code: item.item_code,  // Keep original for compatibility
      gl_asset_id: item.gl_asset_id
    }));
    //console.log("✅ Transformed items:", transformedItems.length);
    setItems(transformedItems);
  }
}, [itemsData]);


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

  // Sync form data when onlineMode changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      onlineEntry: onlineMode ? "Yes" : "No",
      offlineEntry: onlineMode ? "No" : "Yes",
    }));
  }, [onlineMode]);

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
     //   console.log("Updated sales data with branch names:", branchName);
      }
    }
  }, [branches, isEditMode, formData.branchId, salesData]);

  // Additional effect to handle URL changes for real-time mode switching
  useEffect(() => {
    const handleURLChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const typeMode = urlParams.get("type");

      if (typeMode === "offline" && onlineMode) {
        setOnlineMode(false);
      } else if (typeMode === "online" && !onlineMode) {
        setOnlineMode(true);
      }
    };

    // Check URL on component mount and location changes
    handleURLChange();
  }, [location, onlineMode]);





useEffect(() => {
    // ✅ Don't fetch if already have slipNo
    if (formData.slipNo) {
        console.log('⚠️ SlipNo already exists, skipping fetch');
        return;
    }

    if (isEditMode || editingWbId) {
        console.log('📝 Edit mode - skipping fetch');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const editWbId = urlParams.get("edit");
    if (editWbId) {
        return;
    }

    if (isSearchMode) {
        return;
    }

    // ✅ Don't fetch if reg_type is NULL
    if (!formData.reg_type || formData.reg_type === 'NULL' || formData.reg_type === 'Null') {
        console.log('⏳ Reg Type is Null, skipping fetch');
        return;
    }

    console.log(`📌 formData.reg_type: "${formData.reg_type}"`);

    // Set current time
    const now = new Date().toISOString();
    setFormData((prev) => ({
        ...prev,
        slipInTime: now,
        creationDate: now,
        lastUpdatedDate: now,
        slipDate: now,
    }));

    // ✅ entry_type is always 'SALE'
    const entryType = 'SALE';
    const regType = formData.reg_type?.trim()?.toUpperCase() || 'R';

    console.log(`🔍 Fetching slip number for entry_type: ${entryType}, reg_type: ${regType}`);

    const fetchSlipNumber = async (retryCount = 0) => {
        try {
            if (retryCount === 0) {
                fetch("/api/db/wake").catch(() => {});
            }

            console.log(`🔍 Fetching next slip number for ${entryType} with reg_type: ${regType}`);

            // ✅ Send entry_type=SALE and reg_type
            const response = await fetch(
                `/api/purchases/next-slip?entry_type=${entryType}&reg_type=${regType}`,
                { timeout: 5000 }
            );

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
                const fallback = (Math.floor(Math.random() * 9000) + 1000).toString();
                console.log(`⚠️ Using fallback: ${fallback}`);
                setFormData((prev) => ({ 
                    ...prev, 
                    slipNo: fallback 
                }));
            }
        }
    };

    if (!formData.slipNo) {
        console.log(`⏳ Fetching slip number for ${entryType} with reg_type: ${regType}`);
        setTimeout(() => fetchSlipNumber(), 100);
    }
    
}, [formData.reg_type, isSearchMode, isEditMode, editingWbId, formData.slipNo]);






    // Fetch branches for dropdown
//     fetch("/api/branches")
//       .then((res) => res.json())
//       .then((data: any[]) => {
//         setBranches(data);
//         console.log("Branches fetched:", data);

//         // Always set default branch based on logged-in user's branch
//         if (data.length > 0) {
//           const userBranchId = user?.branchId;
//           const defaultBranch = userBranchId
//             ? data.find((b) => b.branch_id === userBranchId) || data[0]
//             : data[0];
//           setFormData((prev) => ({
//   ...prev,
//   branchId: String(defaultBranch.branch_id),
//   branch: String(defaultBranch.branch_id),
//   createdBy: String(user?.userid || ""),
// }));
//         }
//       })
//       .catch((err: any) => {
//         console.error("Error fetching branches:", err);
//       });

//     const now = new Date().toISOString();
//     setFormData((prev) => ({
//       ...prev,
//       slipInTime: formatDatetimeLocal(now),
//       creationDate: now,
//       lastUpdatedDate: now,
//       slipDate: now,
//     }));
//   }, []);

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
  setSelectedForm("sales"); // Mark as active
  const urlParams = new URLSearchParams(window.location.search);
  const typeMode = urlParams.get("type") || "online";
  const targetUrl = `/sales-form?type=${typeMode}`;
  sessionStorage.removeItem("salesFormEditMode");
  window.location.href = targetUrl;
};

  
  
const captureFirstWeight = async () => {
  try {
    // 1️⃣ Get current weight
    const response = await fetch("/api/weight/data");
    const weightData = await response.json();

    // 2️⃣ Update firstWeight in form state
    setFormData(prev => ({
      ...prev,
      firstWeight: weightData.weight,
    }));

    console.log("✅ First weight captured:", weightData.weight);

    // 3️⃣ Capture first weight image if slip number exists
    if (formData.slipNo) {
      try {
        // ✅ Get reg_type from formData (REGISTER/UNREGISTER)
        const regType = formData.reg_type || 'R';
        const entryType = formData.entryType || 'SALE';

      //  console.log(`📸 Capturing first weight image for slip: ${formData.slipNo} (${regType})`);

        const captureResponse = await fetch("/api/capture/first-weight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slipNo: formData.slipNo,
            cameraIp: "10.10.10.146",
            cameraPort: 554,
            entryType: entryType,
            reg_type: regType, // ✅ Added reg_type parameter
            
          }),
        });

        if (captureResponse.ok) {
          const captureData = await captureResponse.json();
          console.log("✅ Image captured successfully:", captureData);
          alert(`✅ Image captured for slip: ${formData.slipNo} (${regType})`);
        } else {
          const errorData = await captureResponse.json();
          console.error("❌ Backend Error:", errorData);
         // alert(`❌ Failed to capture image: ${errorData.message || 'Unknown error'}`);
        }
      } catch (imageError) {
        console.error("❌ Error capturing/updating first weight image:", imageError);
       // alert("❌ Error capturing image. Please try again.");
      }
    } else {
      console.warn("⚠️ No slip number provided, skipping image capture");
    }
  } catch (error) {
    console.error("❌ Error fetching weight data:", error);
   // alert("Failed to capture first weight reading");
  }
};

const captureSecondWeight = async () => {
  try {
    // 1️⃣ Get current weight
    const response = await fetch("/api/weight/data");
    const weightData = await response.json();

    const currentTime = new Date().toISOString();

    // 2️⃣ Update secondWeight and slipOutTime in form state
    setFormData(prev => ({
      ...prev,
      secondWeight: weightData.weight,
      slipOutTime: currentTime.slice(0, 16), // datetime-local format
    }));

    console.log("✅ Second weight captured:", weightData.weight);

    // 3️⃣ Capture second weight image if slip number exists
    if (formData.slipNo) {
      try {
        // ✅ Get reg_type from formData (REGISTER/UNREGISTER)
        const regType = formData.reg_type || 'R';
        const entryType = formData.entryType || 'SALE';

     //   console.log(`📸 Capturing second weight image for slip: ${formData.slipNo} (${regType})`);

        const captureResponse = await fetch("/api/capture/second-weight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slipNo: formData.slipNo,
            cameraIp: "10.10.10.146",
            cameraPort: 554,
            entryType: entryType,
            reg_type: regType, // ✅ Added reg_type parameter
           
          }),
        });

        if (captureResponse.ok) {
          const captureData = await captureResponse.json();
          console.log("✅ Second weight image captured successfully:", captureData);
          alert(`✅ Second weight image captured for slip: ${formData.slipNo} (${regType})`);
        } else {
          const errorData = await captureResponse.json();
          console.error("❌ Backend Error:", errorData);
          // alert(`❌ Failed to capture image: ${errorData.message || 'Unknown error'}`);
        }
      } catch (imageError) {
        console.error("❌ Error capturing/updating second weight image:", imageError);
        // alert("❌ Error capturing image. Please try again.");
      }
    } else {
      console.warn("⚠️ No slip number provided, skipping image capture");
    }
  } catch (error) {
    console.error("❌ Error fetching weight data:", error);
    // alert("Failed to capture second weight reading");
  }
};


  const currentSlipNo = formData.slipNo;


  // ✅ Fetch sale data from DB by wbId (for IGP API)
const fetchSaleDataForIGP = async (wbId: number) => {
  try {
    const response = await fetch(`/api/sales/by-wbid/${wbId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch sale data for wbId: ${wbId}`);
    }
    const data = await response.json();
    return data; // Raw data from DB
  } catch (error: any) {
    console.error("Error fetching sale data for IGP:", error);
    return null; // Return null if fetch fails
  }
};


  // ✅ Helper: PKT datetime string (Asia/Karachi)
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





function autoPrintSlip(
  masterData: any,
  salesData: any[],
  currentUserName: string,
  apiData: any
) {
  // ✅ masterData se check karo — formData se nahi
  const hasFirstWeight = masterData.first_weight && parseFloat(masterData.first_weight) > 0;
  const hasSecondWeight = masterData.second_weight && parseFloat(masterData.second_weight) > 0;

  console.log("🔍 autoPrintSlip - hasFirstWeight:", hasFirstWeight);
  console.log("🔍 autoPrintSlip - hasSecondWeight:", hasSecondWeight);

  if (!hasFirstWeight) {
    console.log("No weight data available to print.");
    return;
  }

  // ✅ salesData ko dbRows format mein convert karo
  const dbRows = (salesData || [])
    .filter((row: any) =>
      row.dc_no || row.do_no || row.customer_name ||
      row.item_code || row.item_desc || row.dc_qty ||
      row.igp_no || row.vendor_name
    )
    .map((row: any) => ({
      dcNo:            row.dc_no || row.igp_no || "",
      doNo:            row.do_no || row.po_no || "",
      customerName:    row.customer_name || row.vendor_name || "",
      vehicleNo:       row.vehicle_no || "",
      itemCode:        row.item_code || "",
      itemDescription: row.item_desc || "",
      dcQty:           row.dc_qty ? String(row.dc_qty) : (row.igp_qty ? String(row.igp_qty) : ""),
      doQty:           row.do_qty ? String(row.do_qty) : (row.po_qty ? String(row.po_qty) : ""),
      itemId:          row.item_id || null,  // ✅ Added item_id
    }));

  // ✅ vehicle_no masterData se lo, nahi mila to dbRows se
  const vehicleNo = masterData.vehicle_no || dbRows[0]?.vehicleNo || "";
  console.log("🚚 Vehicle number for printing:", vehicleNo);
  console.log("📋 dbRows for print:", dbRows);

  const masterSlipInTime = masterData.slip_in_time || getPKTDateTime();
  const masterSlipOutTime = masterData.slip_out_time || null;

  // ✅ IMPORTANT: apiData ko masterData se properly map karo
  const mappedApiData = {
    ...apiData,
    // ✅ Fields from masterData
    slipNo: masterData.slip_no || apiData?.slipNo || "",
    slip_in_time: masterData.slip_in_time || apiData?.slip_in_time || "",
    slip_out_time: masterData.slip_out_time || apiData?.slip_out_time || "",
    vehicle_no: masterData.vehicle_no || apiData?.vehicle_no || "",
    firstWeight: masterData.first_weight || apiData?.firstWeight || "",
    secondWeight: masterData.second_weight || apiData?.secondWeight || "",
    netWeight: masterData.net_weight || apiData?.netWeight || "",
    grossWeight: masterData.gross_weight || apiData?.grossWeight || "",
    gross_w_b_d: masterData.gross_w_b_d || apiData?.gross_w_b_d || "",  // ✅ Added gross_w_b_d
    bardanaWeight: masterData.bardana_weight || apiData?.bardanaWeight || "",
    noOfBags: masterData.no_of_bags || apiData?.noOfBags || "",
    wtPerBag: masterData.weight_per_bags || apiData?.wtPerBag || "",
    bardanaType: masterData.bardana_type || apiData?.bardanaType || "",
    itemDesc: masterData.item_desc || apiData?.itemDesc || "",
    igpNo: masterData.igp_no || apiData?.igpNo || "",
    freight: masterData.freight || apiData?.freight || "",
    remarks: masterData.remarks || apiData?.remarks || "",
    vendor: masterData.vendor_name || apiData?.vendor || "",
    entryType: masterData.entry_type || apiData?.entryType || "SALE",
    qualityDeduction: masterData.quality_deduction || apiData?.qualityDeduction || "",
    supplierWeight: masterData.supplier_weight || apiData?.supplierWeight || "",
    created_by_name: masterData.created_by_name || apiData?.created_by_name || "",
    second_weight_by_name: masterData.second_weight_by_name || apiData?.second_weight_by_name || "",
    second_weight_by: masterData.second_weight_by || apiData?.second_weight_by || "",
    reg_type: masterData.reg_type || apiData?.reg_type || "R",
    pur_reg_type: masterData.pur_reg_type || apiData?.pur_reg_type || "R",
    regType: masterData.reg_type || apiData?.regType || "R",
    details: salesData || apiData?.details || [],
  };

  // ✅ Check if any detail row has specific item_id
  const specificItemIds = [6517, 5877, 4307];
  
  // ✅ Check if ANY row in details has these item_ids
  const hasSpecificItem = (salesData || []).some((row: any) => {
    const itemId = parseInt(row.item_id);
    return specificItemIds.includes(itemId);
  });

  console.log("🔍 autoPrintSlip - Has Specific Item (6517, 5877, 4307):", hasSpecificItem);

  let netWeightForReport = "";

  if (hasSpecificItem) {
    // ✅ If specific item exists, use grossWeight
    netWeightForReport = mappedApiData.grossWeight || "";
    console.log("📊 Specific item found - Using grossWeight for Net Weight:", netWeightForReport);
  } else {
    // ✅ If no specific item, use gross_w_b_d
    netWeightForReport = mappedApiData.gross_w_b_d ? String(mappedApiData.gross_w_b_d) : "";
    console.log("📊 No specific item - Using gross_w_b_d for Net Weight:", netWeightForReport);
  }

  // ✅ Update mappedApiData with the correct netWeight
  const updatedApiData = {
    ...mappedApiData,
    netWeight: netWeightForReport,
  };

  console.log("✅ Updated apiData for autoPrint:", {
    hasSpecificItem,
    original_netWeight: mappedApiData.netWeight,
    original_grossWeight: mappedApiData.grossWeight,
    original_gross_w_b_d: mappedApiData.gross_w_b_d,
    final_netWeight: netWeightForReport,
  });

  console.log("✅ Mapped apiData for print:", {
    slipNo: updatedApiData.slipNo,
    itemDesc: updatedApiData.itemDesc,
    wtPerBag: updatedApiData.wtPerBag,
    bardanaType: updatedApiData.bardanaType,
    noOfBags: updatedApiData.noOfBags,
    firstWeight: updatedApiData.firstWeight,
    secondWeight: updatedApiData.secondWeight,
    netWeight: updatedApiData.netWeight,
  });

  // ✅ CONDITION: If both weights exist → generateReportHTML (Full Weighbridge Slip)
  if (hasFirstWeight && hasSecondWeight) {
    console.log("✅ Both weights exist - Printing Full Weighbridge Slip");
    const reportHTML = generateReportHTML(
      "second",
      masterSlipInTime,
      masterSlipOutTime,
      vehicleNo,
      updatedApiData,  // ✅ Use updated data
      dbRows
    );
    preparePrintWindow(reportHTML, "Weighbridge Report");
  } 
  // ✅ CONDITION: If only first weight exists → generateNewReportHTML (Feeds Dispatch Order)
  else if (hasFirstWeight) {
    console.log("✅ Only first weight exists - Printing Feeds Dispatch Order");
    const reportHTML = generateNewReportHTML(
      masterSlipInTime,
      null,
      vehicleNo,
      updatedApiData,  // ✅ Use updated data
      dbRows
    );
    preparePrintWindow(reportHTML, "Feeds Dispatch Order");
  }
}
  





const handleSave = async () => {
  setLoading(true);

  // ✅ Validate first weight
  if (
    !formData.firstWeight ||
    formData.firstWeight.trim() === "" ||
    parseFloat(formData.firstWeight) <= 0
  ) {
    alert("First weight is required and must be greater than 0");
    setLoading(false);
    return;
  }


 

  // ✅ Vehicle number resolve
  let finalVehicleNo = "";
  const vehicleNoFromDetails = salesData
    .find((row) => row.vehicleNo?.trim())
    ?.vehicleNo?.trim();
  finalVehicleNo = vehicleNoFromDetails || formData.vehicleNo?.trim() || "";

  if (!finalVehicleNo || finalVehicleNo === "") {
    alert("Vehicle number is required");
    setLoading(false);
    return;
  }

  // ✅ Store vehicle number locally before saving
  if (finalVehicleNo) {
    try {
      localStorage.setItem('lastVehicleNo', finalVehicleNo);
      console.log("✅ Vehicle number saved locally:", finalVehicleNo);
    } catch (e) {
      console.log("⚠️ Could not save vehicle number locally:", e);
    }
  }

  

  // ✅ Force PKT time handling
  const slipInTime =  getPKTDateTime();

  console.log("formData.slipInTime =", formData.slipInTime);
console.log("getPKTDateTime() =", getPKTDateTime());
console.log("slipInTime =", slipInTime);

  // ✅ Automatically set slipOutTime when 2nd weight is entered
  const slipOutTime =
    formData.secondWeight && parseFloat(formData.secondWeight) > 0
      ? getPKTDateTime()
      : formData.slipOutTime || null;

  // ✅ Weight diff check
// if (  
//     formData.firstWeight &&
//     formData.secondWeight &&
//     formData.netWeight &&
//     parseFloat(formData.firstWeight) > 0 &&
//     parseFloat(formData.secondWeight) > 0 &&
//     parseFloat(formData.netWeight) > 0
//   ) {
//     if (((totalWeightDiff) > 30) || ((totalWeightDiff) < -30)) {
//       alert(
//         `Total Weight Difference (${totalWeightDiff.toFixed(
//           2
//         )}) is outside acceptable range of ±30. Entry cannot be saved.`
//       );
//       setLoading(false);
//       return;
//     }
//   }

  try {
    let savedWbId: number;



    // ye main update ka payload hai  hamza

    if (isEditMode && editingWbId) {
      // 🔄 UPDATE MODE
      console.log("Updating existing sales record with wb_id:", editingWbId);

const updatePayload = {
  // ⭐ Basic Fields
  slip_no: formData.slipNo || null,
  slip_in_time: slipInTime,
  slip_out_time: slipOutTime,
  
  // ⭐ Weight Fields
  first_weight: formData.firstWeight
    ? parseFloat(formData.firstWeight)
    : null,
  second_weight: formData.secondWeight
    ? parseFloat(formData.secondWeight)
    : null,
  net_weight: formData.netWeight
    ? parseFloat(formData.netWeight)
    : null,
  
  // ✅ FIX: Use masterBardanaWeight instead of bardanaWeight
  bardana_weight: formData.masterBardanaWeight
    ? parseFloat(formData.masterBardanaWeight)
    : null,
  
  gross_weight: formData.grossWeight
    ? parseFloat(formData.grossWeight)
    : null,
  
  // ✅ FIX: Gross WBD = Gross Weight + Bardana Weight (use masterBardanaWeight)
  gross_wbd: (parseFloat(formData.grossWeight) || 0) + (parseFloat(formData.masterBardanaWeight) || 0),
  
  freight: formData.freight ? parseFloat(formData.freight) : null,
  
  // ⭐ REMOVED: Bardana Fields from master (these go to details table)
  // bardana_type: formData.bardanaType || null,
  // weight_per_bags: formData.wtPerBag ? parseFloat(formData.wtPerBag) : null,
  
  // ⭐ Other Fields
  remarks: formData.remarks || null,
  driver_name: formData.driverName || null,
  company_id: formData.companyId ? parseInt(formData.companyId, 10) : null,
  branch_id: formData.branchId ? parseInt(formData.branchId, 10) : null,
  online_entry: formData.onlineEntry === "Yes" ? "Yes" : null,
  offline_entry: formData.offlineEntry === "Yes" ? "Yes" : null,

  last_updated_by: user?.userid || null,
  last_updated_date: getPKTDateTime(),
  manual_dc_no: formData.manualDcNo || null,
  freightchild: formData.freightChild || null,

  status: onlineMode ? "ONLINE" : "OFFLINE",
  slip_date: getPKTDateTime(),

  // ⭐ Sales Fields
  vendor_name: salesData.find((row) => row.customerName)?.customerName || null,
  vehicle_no: finalVehicleNo,
  po_no: salesData.find((row) => row.doNo)?.doNo || null,
  igp_no: salesData.find((row) => row.dcNo)?.dcNo || null,
  item_desc: salesData.find((row) => row.itemDescription?.trim())?.itemDescription || null,
  item_code: salesData.find((row) => row.item_code?.trim())?.item_code || null,

  second_weight_by: user?.userid ? parseInt(user.userid.toString()) : null,
  
  po_qty: salesData.find((row) => row.doQty)?.doQty
    ? parseFloat(salesData.find((row) => row.doQty)?.doQty!)
    : null,
  igp_qty: salesData.find((row) => row.dcQty)?.dcQty
    ? parseFloat(salesData.find((row) => row.dcQty)?.dcQty!)
    : null,
  igp_date: salesData.find((row) => row.doDate)?.doDate || null,

  // ⭐ Registration Type - Sale module
  reg_type: formData.reg_type === "R" ? "R" : 
             formData.reg_type === "U"? "U" : "Null",
  
  // ⭐ Exc.Bags - Master
  exc_bags: formData.excBags ? 1 : 0,
  bardana_bag: formData.excBags ? 'Y' : 'N',
  
  // ⭐ Con Field (if needed)
  // con: formData.igpCheckbox ? 'Y' : 'N',
};
// ✅ UPDATE MASTER RECORD
const updateResponse = await fetch(
  `/api/purchase/update/${editingWbId}`,
  {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatePayload),
  }
);

if (!updateResponse.ok) {
  const errorText = await updateResponse.text();
  throw new Error(`Failed to update sales record: ${errorText}`);
}

savedWbId = editingWbId;
console.log("✅ Sales record updated successfully");

// ✅ UPDATE DETAILS TABLE WITH BARDANA FIELDS
// Filter non-empty rows
const nonEmptyRows = salesData.filter(
  (row) =>
    row.dcNo ||
    row.doNo ||
    row.customerName ||
    row.vehicleNo ||
    row.itemDescription ||
    row.dcQty ||
    row.doQty
);

const totalFeedBags = nonEmptyRows.reduce(
  (sum, row) => sum + (parseFloat(row.doQty) || 0),
  0
);

// ✅ First, delete existing child records for this wb_id
console.log("🗑️ Clearing existing child records for wb_id:", savedWbId);
try {
  const deleteResponse = await fetch(`/api/purchase-items/by-wbid/${savedWbId}`, {
    method: "DELETE"
  });
  
  if (deleteResponse.ok) {
    console.log("✅ Existing child records deleted");
  }
} catch (deleteError) {
  console.log("Note: Could not delete old records, continuing:", deleteError);
}

// ✅ Save new child records with bardana fields
for (const row of nonEmptyRows) {
  // ✅ Get bardana fields from the row (with fallback to formData)
  const bardanaType = row.bardanaType || formData.bardanaType || null;
  const wtPerBag = row.wtPerBag || formData.wtPerBag || null;
  const bardanaWeight = row.bardanaWeight || formData.masterBardanaWeight || null;
  const noOfBags = row.noOfBags || formData.noOfBags || null;

  console.log("📤 Saving bardana fields to details:", {
    bardanaType,
    wtPerBag,
    bardanaWeight,
    noOfBags,
  });

 const salesItemPayload = {
  branch_id:
    formData.branchId &&
    formData.branchId !== "undefined" &&
    formData.branchId.trim() !== ""
      ? parseInt(formData.branchId, 10)
      : user?.branchId
        ? parseInt(user.branchId.toString(), 10)
        : null,

  wb_id: savedWbId,
  
  // ⭐ Bardana Fields - Save to details table
  bardana_type: bardanaType,
  weight_per_bags: wtPerBag ? parseFloat(wtPerBag) : null,  // ✅ Database column name
  bardana_weight: bardanaWeight ? parseFloat(bardanaWeight) : null,
  no_of_bags: noOfBags ? parseInt(noOfBags, 10) : null,
  
  igp_no: row.dcNo || null,
  manual_dc_no: row.dcNo || null,
  dc_id: row.dcId || null,
  vehicle_no: finalVehicleNo || row.vehicleNo || null,
  total_feed_bags: totalFeedBags || null,
  igp_date: row.doDate || null,
  do_date: row.doDate || null,
  supplier_weight: null,
  quality_deduction: null,
  vendor_name: row.customerName || null,
  bag_condition: null,
  po_no: row.doNo || null,
  po_id: row.po_id ? parseInt(row.po_id, 10) : null,
  freight_child:
    row.freight && row.freight !== "" && row.freight !== "0"
      ? parseFloat(row.freight)
      : null,
  item_code: row.itemCode || null,
  item_desc: row.itemDescription || null,
  item_id: row.itemId ? parseInt(row.itemId, 10) : null,
  po_qty:
    row.doQty && row.doQty.trim() !== ""
      ? parseFloat(row.doQty)
      : null,
  igp_qty:
    row.dcQty && row.dcQty.trim() !== ""
      ? parseFloat(row.dcQty)
      : null,
  balance_qty: null,
  customer_name: row.customerName || null,
  customer_id: row.customerId || null,
  do_no: row.doNo || null,
  do_qty:
    row.doQty && row.doQty.trim() !== ""
      ? parseFloat(row.doQty)
      : null,
  dc_qty:
    row.dcQty && row.dcQty.trim() !== ""
      ? parseFloat(row.dcQty)
      : null,
  created_by: user?.userid ? parseInt(user.userid.toString(), 10) : null,
  last_updated_by: user?.userid ? parseInt(user.userid.toString(), 10) : null,
};

  const salesItemResponse = await fetch("/api/purchase-items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(salesItemPayload),
  });

  if (!salesItemResponse.ok) {
    console.error("❌ Failed to save sales item in update mode:", row);
    // Continue anyway - don't fail the whole update for one item
  } else {
    console.log("✅ Sales item saved successfully in update mode");
  }
}

      setFormData(prev => ({
        ...prev,
        isFirstWeightSaved: !!formData.firstWeight,
      }));

      setFormData(prev => ({
        ...prev,
        isSecondWeightSaved: !!formData.secondWeight,
      }));


      // update ki api ke baad igp api ko call horhi hai hamza

      // ✅ Call IGP API for Sale after 2nd weight (edit mode)
      if (isEditMode && formData.onlineEntry === "Yes" && formData.secondWeight) {
        console.log("📡 Preparing to call IGP API for Sale edit mode (2nd weight)...");

        setTimeout(async () => {
          try {
            const wbId = Number(savedWbId || formData.wbId);
            if (!wbId) {
              console.error("❌ Invalid wbId, skipping Sale IGP API call (edit mode).");
              return;
            }

            const dbData = await fetchSaleDataForIGP(wbId);

            if (!dbData) {
              console.error("❌ DB data not available for Sale IGP API call (edit mode).");
              return;
            }

            console.log("📥 Sale DB data fetched for IGP API (edit mode):", dbData);

            const igpResp = await fetch(
              "http://portal.sabirsgroup.com:8184/ords/sabroso_ords/wb-om/wb-update-on-igp",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dbData),
              }
            );

            const rawText = await igpResp.text();
            console.log("🧾 Raw Sale IGP API response (edit mode):", rawText);

            let igpData;
            try {
              igpData = JSON.parse(rawText);
            } catch {
              console.error("❌ Sale IGP API did not return JSON (edit mode). Raw response logged above.");
              return;
            }

            if (igpResp.ok && (igpData.status?.toLowerCase() === "success" || Array.isArray(igpData.items))) {
              console.log("✅ SALE IGP Data Uploaded Successfully (edit mode):", igpData);
            } else {
              console.error("❌ SALE IGP Upload Failed (edit mode). Response:", igpData);
            }
          } catch (err) {
            console.error("🛑 SALE IGP API Error (edit mode):", err);
          }
        }, 2000);
      }

    } else {
      // CREATE MODE: Create new record
      console.log("Creating new sales record");

      // Generate WB_ID for the sales record
      const wbIdResponse = await fetch("/api/purchases", {
        method: "GET",
      });
      const existingRecords = await wbIdResponse.json();
      const maxWbId =
        existingRecords.length > 0
          ? Math.max(...existingRecords.map((r: any) => r.wb_id || 0))
          : 0;
      const newWbId = maxWbId + 1;

      // Prepare master data payload with proper null handling for numeric fields
    const masterPayload = {
  slip_no: formData.slipNo || null,
  slip_in_time: slipInTime,

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
  
  // ✅ FIX: Use masterBardanaWeight for bardana_weight
  bardana_weight:
    formData.masterBardanaWeight && formData.masterBardanaWeight.trim() !== ""
      ? parseFloat(formData.masterBardanaWeight)
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
  online_entry: formData.onlineEntry === "Yes" ? "Yes" : null,
  offline_entry: formData.offlineEntry === "Yes" ? "Yes" : null,

  created_by: user?.userid || null,
  creation_date: formData.creationDate || null,
  last_updated_by: user?.userid || null,
  last_updated_date: formData.lastUpdatedDate || null,
  manual_dc_no: formData.manualDcNo || null,
  entry_type: "SALE",
  slip_out_time: slipOutTime,
  status: onlineMode ? "ONLINE" : "OFFLINE",
  slip_date: formData.slipDate || null,
  vehicle_no: finalVehicleNo,
  
  // ✅ FIX: Use masterBardanaWeight for gross_wbd calculation
  gross_wbd: (parseFloat(formData.grossWeight) || 0) + (parseFloat(formData.masterBardanaWeight) || 0),
  
  supplier_weight: formData.supplierWeight ? parseFloat(formData.supplierWeight) : null,
  exc_bags: formData.excBags ? 1 : 0,
  bardana_bag: formData.excBags ? 'Y' : 'N',
  
  // Sale module mein - reg_type column mein save hoga
  reg_type: formData.reg_type === "R" ? "R" : 
             formData.reg_type === "U" ? "U" : "Null",
};

console.log("🔍 DEBUG - Master Payload:", {
  bardana_weight: masterPayload.bardana_weight,
  gross_wbd: masterPayload.gross_wbd,
  grossWeight: formData.grossWeight,
  masterBardanaWeight: formData.masterBardanaWeight,
});


    
      // Naya master record create karna
      const masterResponse = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(masterPayload),
      });

      if (!masterResponse.ok) {
        const errorText = await masterResponse.text();
        throw new Error(`Failed to save master sales record: ${errorText}`);
      }

      // Backend se naya bana hua record le lo (isme wb_id hoga)
      const createdRecord = await masterResponse.json();

      // Wb_id ko variable me store kar lo
      savedWbId = createdRecord.wb_id;
    }


   
// ✅ Auto-print after save with 1 second delay
setTimeout(async () => {
  try {
    // Fetch from the correct API
    const slipResponse = await fetch(`/api/form-report/${savedWbId}`);
    if (!slipResponse.ok) throw new Error("Failed to fetch sale record for auto-print");

    const slipData = await slipResponse.json();

    if (!slipData.success) {
      console.error("API returned error:", slipData.message);
      return;
    }

    const reportData = slipData.data;

    const master = {
      wb_id: reportData.wb_id,
      vehicle_no: reportData.vehicle_no || finalVehicleNo || "-",
      slip_in_time: reportData.slip_in_time || slipInTime || getPKTDateTime(),
      entry_type: reportData.entry_type,
      first_weight: reportData.first_weight,
      second_weight: reportData.second_weight,
      net_weight: reportData.net_weight,
      created_by_name: reportData.created_by_name,
      second_weight_by_name: reportData.second_weight_by_name,
      has_second_weight: reportData.has_second_weight,
      ...reportData
    };

    const details = Array.isArray(reportData.details)
      ? reportData.details
      : [];

    autoPrintSlip(
      master,
      details,
      user?.userName || "admin",
      master
    );

  } catch (err) {
    console.error("Error fetching slip for auto-print:", err);
  }
}, 2000); // 2 second delay


    // Save sales detail records for each non-empty row (for both create and update)
    if (!isEditMode) {
      const nonEmptyRows = salesData.filter(
        (row) =>
          row.dcNo ||
          row.doNo ||
          row.customerName ||
          row.vehicleNo ||
          row.itemDescription ||
          row.dcQty ||
          row.doQty
      );

      const totalFeedBags = nonEmptyRows.reduce(
        (sum, row) => sum + (parseFloat(row.doQty) || 0),
        0
      );

      for (const row of nonEmptyRows) {
const salesItemPayload = {
  branch_id:
    formData.branchId &&
    formData.branchId !== "undefined" &&
    formData.branchId.trim() !== ""
      ? parseInt(formData.branchId, 10)
      : user?.branchId
        ? parseInt(user.branchId.toString(), 10)
        : null,

  wb_id: savedWbId,
  
  // ⭐ Bardana Fields - Row se lein (priority)
  bardana_type: row.bardanaType || formData.bardanaType || null,  // ✅ Row first
  bardana_type_id: row.bardanaTypeId || formData.bardanaTypeId 
    ? parseInt(row.bardanaTypeId || formData.bardanaTypeId, 10) 
    : null,  // ⭐ ADD THIS - bardana_type_id
  weight_per_bags: row.wtPerBag || formData.wtPerBag
    ? parseFloat(row.wtPerBag || formData.wtPerBag)
    : null,  // ✅ Row first
  bardana_weight: row.bardanaWeight || formData.bardanaWeight
    ? parseFloat(row.bardanaWeight || formData.bardanaWeight)
    : null,  // ✅ Row first
  no_of_bags: row.noOfBags || formData.noOfBags
    ? parseInt(row.noOfBags || formData.noOfBags, 10)
    : null,  // ✅ Row first
  
  igp_no: row.dcNo || null,
  manual_dc_no: row.dcNo || null,
  dc_id: row.dcId || null,
  vehicle_no: finalVehicleNo || row.vehicleNo || null,

  total_feed_bags: totalFeedBags || null,
  igp_date: row.doDate || null,
  do_date: row.doDate || null,
  supplier_weight: null,
  quality_deduction: null,
  
  vendor_name: row.customerName || null,
  bag_condition: null,
  po_no: row.doNo || null,
  po_id: row.po_id ? parseInt(row.po_id, 10) : null,

  freight_child:
    row.freight && row.freight !== "" && row.freight !== "0"
      ? parseFloat(row.freight)
      : null,

  item_code: row.itemCode || null,
  item_desc: row.itemDescription || null,
  item_id: row.itemId ? parseInt(row.itemId, 10) : null,

  po_qty:
    row.doQty && row.doQty.trim() !== ""
      ? parseFloat(row.doQty)
      : null,

  igp_qty:
    row.dcQty && row.dcQty.trim() !== ""
      ? parseFloat(row.dcQty)
      : null,

  balance_qty: null,
  customer_name: row.customerName || null,
  customer_id: row.customerId || null,
  do_no: row.doNo || null,

  do_qty:
    row.doQty && row.doQty.trim() !== ""
      ? parseFloat(row.doQty)
      : null,

  dc_qty:
    row.dcQty && row.dcQty.trim() !== ""
      ? parseFloat(row.dcQty)
      : null,

  created_by: user?.userid ? parseInt(user.userid.toString(), 10) : null,
  last_updated_by: user?.userid ? parseInt(user.userid.toString(), 10) : null,
};

// ⭐ Debug: Check payload
console.log("📤 Sales Item Payload Bardana Fields:", {
  bardana_type: salesItemPayload.bardana_type,
  bardana_type_id: salesItemPayload.bardana_type_id,
  weight_per_bags: salesItemPayload.weight_per_bags,
  bardana_weight: salesItemPayload.bardana_weight,
  no_of_bags: salesItemPayload.no_of_bags,
});


        const salesItemResponse = await fetch("/api/purchase-items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(salesItemPayload),
        });

        if (!salesItemResponse.ok) {
          console.error("Failed to save sales item:", row);
        }
      }
    }

    console.log("Sales data saved successfully");
    alert(
      isEditMode
        ? "Sales data updated successfully!"
        : "Sales data saved successfully!"
    );

    // ✅ Call IGP API for Sale only if online entry and new entry
    if (!isEditMode && formData.onlineEntry === "Yes") {
      console.log("📡 Preparing to call IGP API for new Sale entry...");

      setTimeout(async () => {
        const wbIdToUse = Number(savedWbId || formData.wbId);

        if (!wbIdToUse || wbIdToUse === 0) {
          console.error("❌ Invalid wbId — cannot call Sale IGP API. wbId:", wbIdToUse);
          return;
        }

        console.log("🔍 Using wbId for SALE IGP API:", wbIdToUse);

        try {
          const dbData = await fetchSaleDataForIGP(wbIdToUse);
          if (!dbData) {
            console.error("❌ DB data not available for SALE IGP API call. wbId:", wbIdToUse);
            return;
          }

          console.log("✅ Sale DB data fetched successfully:", dbData);

          const IGP_API_URL =
            "http://portal.sabirsgroup.com:8184/ords/sabroso_ords/wb-om/wb-update-on-igp";

          console.log("🌐 Sending SALE IGP payload to API:", IGP_API_URL);

          const igpResp = await fetch(IGP_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dbData),
          });

          const rawText = await igpResp.text();
          console.log("🧾 Raw SALE IGP API response:", rawText);

          let igpData;
          try {
            igpData = JSON.parse(rawText);
          } catch {
            console.warn("⚠️ SALE IGP API did not return JSON. Raw response logged above.");
            return;
          }

          if (
            igpResp.ok &&
            (igpData.status?.toLowerCase() === "success" || Array.isArray(igpData.items))
          ) {
            console.log("✅ SALE IGP Data Uploaded Successfully. Response:", igpData);
          } else {
            console.error("❌ SALE IGP Upload Failed. Response:", igpData);
          }
        } catch (err) {
          console.error("🛑 SALE IGP API Error:", err);
        }
      }, 1500);
    } else {
      console.log("⚙️ Skipping SALE IGP API — either offline or edit mode");
    }

    // Invalidate queries to refresh display table immediately
    await queryClient.invalidateQueries({
      queryKey: ["/api/purchase/first-weight-records"],
    });
    await queryClient.invalidateQueries({
      queryKey: ["/api/purchases/offline"],
    });

    // Reset sales data table after successful save
    setSalesData(
      Array.from({ length: 8 }, (_, index) => ({
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
        // Hidden columns for database storage
        dcId: "",
        customerId: "",
        itemId: "",
        itemCode: "",
      }))
    );
  } catch (err: any) {
    const errorMessage = err.message || "Failed to save sales data.";
    alert(errorMessage);
    console.error("Save error:", err);
  } finally {
    setLoading(false);
  }

  // Automatically capture first weight image
  // if (formData.firstWeight && !formData.secondWeight) {
  //   try {
  //     console.log("Capturing first weight image for slip:", formData.slipNo);
  //     const captureResponse = await fetch("/api/capture/first-weight", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         slipNo: formData.slipNo,
  //         cameraIp: "10.10.10.146",
  //         cameraPort: 554,
  //         entryType: formData.entryType || "sale",
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

  // Automatically capture second weight image when both weights are present
  // if (formData.firstWeight && formData.secondWeight) {
  //   try {
  //     console.log("Capturing second weight image for slip:", formData.slipNo);
  //     const captureResponse = await fetch("/api/capture/second-weight", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         slipNo: formData.slipNo,
  //         cameraIp: "10.10.10.146",
  //         cameraPort: 554,
  //         entryType: formData.entryType || "sale",
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

  // If second weight was entered, refresh to remove from display table
  if (formData.secondWeight && parseFloat(formData.secondWeight) > 0) {
    console.log(
      "Second weight added for sales entry, refreshing to remove from display table"
    );
    setTimeout(() => {
      window.location.reload();
    }, 4000);
    return;
  }

  // Exit edit mode after successful save/update
  if (isEditMode) {
    setIsEditMode(false);
    setEditingWbId(null);
    sessionStorage.removeItem("salesFormEditMode");

    // Clear URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete("edit");
    const newUrl = urlParams.toString()
      ? `${window.location.pathname}?${urlParams.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, "", newUrl);

    // Fetch next slip number for new entry after edit
    try {
      const response = await fetch(
        "/api/purchases/next-slip?entry_type=SALE"
      );
      const data = await response.json();

      setFormData({
        ...initialFormData,
        slipNo: data.nextSlipNo,
        slipInTime: new Date().toISOString().slice(0, 16),
        onlineEntry: onlineMode ? "Yes" : "No",
        offlineEntry: onlineMode ? "No" : "Yes",
        entryType: "SALE",
        creationDate: new Date().toISOString(),
        lastUpdatedDate: new Date().toISOString(),
        slipDate: new Date().toISOString(),
        branchId: user?.branchId ? String(user.branchId) : "4",
        branch: user?.branchId ? String(user.branchId) : "4",
        createdBy: user?.userid || "",
      });

      // Reset sales data table
      setSalesData(
        Array.from({ length: 8 }, (_, index) => ({
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
        }))
      );

      console.log(
        "✅ Form reset to new entry with slip number:",
        data.nextSlipNo
      );
    } catch (error) {
      console.error("Error fetching next slip number:", error);
      resetFormToInitial();
    }
  } else {
    resetFormToInitial();
  }
};







// ctrl + s command for save the entry 
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










  const navigateToFirst = async () => {
    try {
      const response = await fetch("/api/sales/first-weight-records");
      if (!response.ok) throw new Error("Failed to fetch first records");

      const records = await response.json();
      if (records && records.length > 0) {
        const firstRecord = records[records.length - 1];
        console.log("👉 First record selected:", firstRecord);

        // ❌ resetFormToInitial() hata diya
        // ✅ Directly load the record
        await loadDataByWbId(firstRecord.wb_id);
        return;
      }

      console.warn("⚠️ No records found, resetting form");
      resetFormToInitial(); // only if koi record hi na mile
    } catch (error) {
      console.error("Error navigating to first record:", error);
    }
  };




  
const navigateToPrev = async () => {
  let currentSlip = parseInt(formData.slipNo);
  let prevSlip = currentSlip - 1;
  let recordFound = false;

  // ✅ Get current reg_type from formData (REGISTER/UNREGISTER)
  const regType = formData.reg_type || 'R';
  const entryType = formData.entryType || 'SALE';

  console.log(`🔍 Searching previous ${entryType} slip for ${regType}...`);

  try {
    while (prevSlip > 0 && !recordFound) {
      // ✅ API call with reg_type filter
      const response = await fetch(`/api/sales/by-slip/${prevSlip}?entry_type=${entryType}&reg_type=${regType}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.master) {
          await loadDataByWbId(data.master.wb_id);
          setFormData((prev) => ({ ...prev, slipNo: prevSlip.toString() }));
          setCameFromPrevious(true);
          recordFound = true;
          console.log(`✅ Found previous slip: ${prevSlip} (${regType})`);
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
      console.log(`ℹ️ No previous record found for ${regType}`);
      setFormData((prev) => ({ ...prev, slipNo: "1" }));
    }
  } catch (error) {
    console.error("❌ Error navigating to previous sales record:", error);
  }
};

const navigateToNext = async () => {
  let currentSlip = parseInt(formData.slipNo);
  let nextSlip = currentSlip + 1;
  let recordFound = false;

  // ✅ Get current reg_type from formData (REGISTER/UNREGISTER)
  const regType = formData.reg_type || 'R';
  const entryType = formData.entryType || 'SALE';

  console.log(`🔍 Searching next ${entryType} slip for ${regType}...`);

  try {
    while (!recordFound) {
      // ✅ API call with reg_type filter
      const response = await fetch(`/api/sales/by-slip/${nextSlip}?entry_type=${entryType}&reg_type=${regType}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.master) {
          await loadDataByWbId(data.master.wb_id);
          setFormData((prev) => ({ ...prev, slipNo: nextSlip.toString() }));
          setCameFromPrevious(false);
          recordFound = true;
          console.log(`✅ Found next slip: ${nextSlip} (${regType})`);
          break;
        } else {
          nextSlip++; // missing → try next
        }
      } else {
        nextSlip++; // missing → try next
      }
      
      // ✅ Safety limit to prevent infinite loop
      if (nextSlip > 10000) {
        console.warn(`⚠️ Reached safety limit, stopping search`);
        break;
      }
    }

    // Agar next record exist nahi → current slip pe stay
    if (!recordFound) {
      console.log(`ℹ️ No next record found for ${regType}`);
      setFormData((prev) => ({ ...prev, slipNo: currentSlip.toString() }));
    }
  } catch (error) {
    console.error("❌ Error navigating to next sales record:", error);
  }
};



  const navigateToLast = async () => {
    try {
      const response = await fetch("/api/sales/first-weight-records");
      const records = await response.json();
      if (records.length > 0) {
        const lastRecord = records[0]; // Get newest record
        await loadDataByWbId(lastRecord.wb_id);
      }
    } catch (error) {
      console.error("Error navigating to last record:", error);
    }
  };

  // Helper function to move focus to next input field
  const moveToNextField = (currentElement: HTMLElement) => {
    const formInputs = Array.from(
      document.querySelectorAll('input, select, textarea, [role="combobox"]')
    ) as HTMLElement[];
    const currentIndex = formInputs.indexOf(currentElement);

    if (currentIndex !== -1 && currentIndex < formInputs.length - 1) {
      const nextElement = formInputs[currentIndex + 1];
      nextElement.focus();

      // If it's an input, select all text for easier editing
      if (
        nextElement instanceof HTMLInputElement ||
        nextElement instanceof HTMLTextAreaElement
      ) {
        nextElement.select();
      }
    }
  };

  // Add keyboard event listeners for Ctrl+L, F11, and Enter navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Enter key to move to next field (except for textareas and specific cases)
      if (event.key === "Enter") {
        const target = event.target as HTMLElement;

        // Don't interfere with textareas, buttons, or dropdowns
        if (
          target.tagName === "TEXTAREA" ||
          target.tagName === "BUTTON" ||
          target.getAttribute("role") === "combobox" ||
          target.closest('[role="listbox"]') ||
          target.closest(".select-content")
        ) {
          return;
        }

        // Don't interfere with form submission buttons
        if (
          ((target instanceof HTMLInputElement ||
            target instanceof HTMLButtonElement) &&
            target.type === "submit") ||
          target.classList.contains("submit-button")
        ) {
          return;
        }

        // For input fields, move to next field
        if (target.tagName === "INPUT") {
          event.preventDefault();
          moveToNextField(target);
        }
      }

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

          // Strategy 1: Find LOV in the same container/cell
          const findLOVInContainer = (container: Element) => {
            return container.querySelector('[role="combobox"]') as HTMLElement;
          };

          // Strategy 2: Field-specific targeting
          let targetLOV: HTMLElement | null = null;

          // For branch field
          if (
            inputName === "branch" ||
            placeholder.includes("branch") ||
            inputId.includes("branch")
          ) {
            targetLOV =
              (document.querySelector(
                '[name="branch"] + [role="combobox"]'
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

          // For customer fields in sales table
          else if (
            placeholder.includes("customer") ||
            inputName === "customerName"
          ) {
            // First check the immediate table cell
            const tableCell = activeElement.closest(
              'div[class*="bg-white border border-gray-300"]'
            );
            if (tableCell) {
              targetLOV = findLOVInContainer(tableCell);
            }

            // If not found in cell, check the table row
            if (!targetLOV) {
              const tableRow = activeElement.closest(
                'div[class*="grid gap-px text-xs"]'
              );
              if (tableRow) {
                // Find customer column specifically (usually 3rd column)
                const cells = tableRow.querySelectorAll(
                  'div[class*="bg-white border border-gray-300"]'
                );
                if (cells.length >= 3) {
                  targetLOV = findLOVInContainer(cells[2]); // Customer Name column
                }
              }
            }
          }

          // For item fields in sales table
          else if (
            placeholder.includes("item") ||
            inputName === "itemDescription"
          ) {
            // First check the immediate table cell
            const tableCell = activeElement.closest(
              'div[class*="bg-white border border-gray-300"]'
            );
            if (tableCell) {
              targetLOV = findLOVInContainer(tableCell);
            }

            // If not found in cell, check the table row
            if (!targetLOV) {
              const tableRow = activeElement.closest(
                'div[class*="grid gap-px text-xs"]'
              );
              if (tableRow) {
                // Find item description column specifically (usually 6th column)
                const cells = tableRow.querySelectorAll(
                  'div[class*="bg-white border border-gray-300"]'
                );
                if (cells.length >= 6) {
                  targetLOV = findLOVInContainer(cells[5]); // Item Description column
                }
              }
            }
          }

          // Strategy 3: Look in the immediate parent container
          if (!targetLOV) {
            const parentContainer =
              activeElement.closest(".flex") ||
              activeElement.closest('div[class*="items-center"]') ||
              activeElement.closest('div[class*="gap-"]') ||
              activeElement.closest(
                'div[class*="bg-white border border-gray-300"]'
              ) ||
              activeElement.parentElement;

            if (parentContainer) {
              targetLOV = findLOVInContainer(parentContainer);
            }
          }

          // Strategy 4: For table context, find LOV in the same row
          if (!targetLOV) {
            const tableRow = activeElement.closest(
              'div[class*="grid gap-px text-xs"]'
            );
            if (tableRow) {
              // Get all comboboxes in this row and find the closest one
              const rowComboboxes =
                tableRow.querySelectorAll('[role="combobox"]');
              if (rowComboboxes.length > 0) {
                let closestCombobox: HTMLElement | null = null;
                let minDistance = Infinity;

                rowComboboxes.forEach((combo) => {
                  const comboElement = combo as HTMLElement;
                  const rect1 = activeElement.getBoundingClientRect();
                  const rect2 = comboElement.getBoundingClientRect();
                  const distance =
                    Math.abs(rect1.left - rect2.left) +
                    Math.abs(rect1.top - rect2.top);

                  if (distance < minDistance) {
                    minDistance = distance;
                    closestCombobox = comboElement;
                  }
                });

                targetLOV = closestCombobox;
              }
            }
          }

          // Strategy 5: Look for the next/previous sibling that's a combobox
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

          // Strategy 6: Last resort - find closest combobox on the page
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
  }, [onlineMode, isEditMode, isSearchMode]);

  return (
    <div className="h-screen bg-gray-100 p-1 overflow-hidden relative">
      {/* Weight Display Table - Upper Right Side */}
      <div
        className={`absolute ${isEditMode ? "top-20" : "top-20"} right-2 z-50`}
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
<div className="border-r border-gray-400 p-2 w-28 h-12">
              <Input
                placeholder="Search Slip No"
                value={searchSlipNo}
                onChange={(e) => setSearchSlipNo(e.target.value)}
                className="h-5 text-xs text-black placeholder:text-gray-500 bg-white border-gray-300"
              />
            </div>
<div className="border-r border-gray-400 p-2 w-28 h-12">
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
                      if (!record.wb_id) return;

                      const urlParams = new URLSearchParams(
                        window.location.search
                      );
                      const typeMode = urlParams.get("type") || "online";

                      switch (record.entry_type) {
                        case "PURCHASE":
                          window.location.href = `/purchase-form?type=${typeMode}&edit=${record.wb_id}`;
                          break;

                        case "PURCHASE_RETURN":
                          window.location.href = `/purchase-return?type=${typeMode}&edit=${record.wb_id}`;
                          break;

                        case "SALE_RETURN":
                        case "SALES_RETURN":
                          window.location.href = `/sales-return?type=${typeMode}&edit=${record.wb_id}`;
                          break;

                        case "SOLDNOTE":
                          window.location.href = `/sold-note?type=${typeMode}&edit=${record.wb_id}`;
                          break;

                        default:
                          loadDataByWbId(record.wb_id); // sales entries in same form
                          break;
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
                  <div className="p-2 text-center text-blue-600 font-semibold truncate w-full">
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
  className="ml-16 h-8 px-1 text-sm font-medium bg-white text-black border border-black hover:bg-gray-100"
  onClick={() => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeMode = urlParams.get("type") || "online";
    const targetUrl = `/purchase-form?type=${typeMode}`;
    sessionStorage.removeItem("salesFormEditMode");
    window.location.href = targetUrl;
  }}
>
  Purchase
</Button>

{/* Sales */}
<Button
  className={`h-8 px-1 text-sm font-medium border border-black ${
    selectedForm === "sales"
      ? "bg-blue-700 text-white"  // Active
      : "bg-white text-black"     // Inactive
  } ${!showOfflineEntries ? "" : "opacity-50 cursor-not-allowed"}`}
  onClick={() => {
    if (showOfflineEntries) return; // Disabled state check
    setSelectedForm("sales"); // Mark as active
    const urlParams = new URLSearchParams(window.location.search);
    const typeMode = urlParams.get("type") || "online";
    const targetUrl = `/sales-form?type=${typeMode}`;
    sessionStorage.removeItem("salesFormEditMode");
    window.location.href = targetUrl;
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
            className="h-7 px-1 text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => toggleOnlineMode(false)}
          >
            Offline
          </Button>
          <Button
            className="h-7 px-1 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
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
    className={`bg-green-600 hover:bg-green-700 h-10 w-40 px-4 text-sm text-white font-medium ${
        (loading || disableSaveButton || (onlineMode && !hasDcNoInSalesData))
            ? "opacity-50 cursor-not-allowed"
            : ""
    }`}
    onClick={() => {
        console.log("🟢 Save button clicked");
        handleSave();
    }}
    disabled={loading || disableSaveButton || (onlineMode && !hasDcNoInSalesData)}
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
            className="h-7 px-1 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium"
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
 
   disabled={onlineMode && formData.firstWeight && formData.secondWeight}
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
      {/* ===== MAIN FORM LAYOUT SECTION ===== */}
      {/* Main Form Layout - 100% visible without scrolling */}
      <div className="bg-white p-1 rounded border h-[calc(100vh-60px)] overflow-hidden">
        <div className="grid grid-cols-12 gap-1 h-full">
          {/* ===== LEFT SIDE - MAIN FORM AREA (COLUMNS 1-8) ===== */}
          <div className="col-span-8">
            {/* ===== MASTER TABLE SECTION - BASIC SLIP INFORMATION ===== */}
            <div className="bg-gray-300 rounded border mb-4 w-full">
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
      
      {/* Reload Button */}
      {(() => {
        // Debug - yeh console.log yahan safe hai
        // console.log('🔍 DEBUG SLIP NO SECTION:');
        // console.log('  - formData.status:', formData.status);
        // console.log('  - editingWbId:', editingWbId);
        // console.log('  - isEditMode:', isEditMode);
        
        const statusStr = String(formData.status || '').trim().toUpperCase();
        const isValidStatus = statusStr === 'ONLINE' || Number(formData.status) === 1;
        const hasWbId = !!editingWbId && Number(editingWbId) > 0;
        const showReload = isValidStatus && hasWbId;
        
        console.log('  - showReload:', showReload);
        
        return showReload ? (
          <button
            onClick={async () => {
              try {
                const wbId = editingWbId;
                const entryType = formData.entryType || 'SALE';

                console.log(`🔄 Reloading ${entryType} record ${wbId}...`);

                const dbData = await fetchSaleDataForIGP(Number(wbId));

                if (!dbData) {
                  alert(`❌ Record not found for wb_id: ${wbId}`);
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
            title="Reload record from database"
          >
            🔄
          </button>
        ) : null;
      })()}
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
          value={Math.round(parseFloat(formData.masterBardanaWeight) || 0)}
          onChange={handleChange}
         // readOnly
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

     
     {/* Reg Type */}
<div className="flex items-center gap-1">
  <Label className="text-xs text-black w-20">Reg Type</Label>
  <select
    name="reg_type"  
    value={formData.reg_type || 'N'}
    onChange={(e) => {
        const value = e.target.value;
        console.log(`🔄 Reg Type changed to: "${value}"`);
        console.log(`📅 Current slipDate:`, formData.slipDate);
        
        setFormData(prev => ({
            ...prev,
            reg_type: value,
            slipNo: '' // ✅ Clear slipNo to fetch new one
        }));
    }}
    className="h-5 text-xs text-black flex-1 max-w-24
        !border !border-gray-400 rounded px-1 
        focus:!border-black bg-white"
    disabled={
        isEditMode ||  // ✅ Edit mode mein disable
        (formData.purchase && 
         formData.purchase !== 'NULL' && 
         formData.purchase !== 'Null')
    }
  >
    <option value="N">NULL</option>
    <option value="R">REGISTER</option>
    <option value="U">UNREGISTER</option>
  </select>
</div>
      {/* purchase Title & Exc.Bags */}
     <div className="flex items-center gap-1">
   <Label className="text-xs text-black w-20">Purchase</Label>
    <select
      name="purchase"
      value={formData.purchase || 'NULL'}
      onChange={(e) => {
        const value = e.target.value;
        console.log(`🔄 Purchase changed to: "${value}"`);
        
        setFormData(prev => ({
          ...prev,
          purchase: value,
          slipNo: '' // ✅ Clear slipNo to fetch new one
        }));
      }}
      className="h-5 text-xs text-black flex-1 max-w-24
        !border !border-gray-400 rounded px-1 
        focus:!border-black bg-white"
         disabled={
      // Agar Purchase field ka koi bhi value select hai toh disable
      formData.sale !== undefined && formData.sale !== null
    }
    >
     
      <option value="R">REGISTER</option>
      <option value="U">UNREGISTER</option>
      
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
        formData.isFirstWeightSaved || isRegTypeNull()
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
    }`}
    onClick={captureFirstWeight}
    disabled={formData.isFirstWeightSaved || isRegTypeNull()}
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
              ip: cameraIp,
              port: cameraPort,
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

            {/* ===== SALES MODE INDICATOR SECTION ===== */}
            <div className="text-center py-1 gap-0 mt-[-0.9rem]">
              <div
                className={`inline-block px-1 py-1 rounded-lg shadow-md ${
                  onlineMode === true
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                    : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                }`}
              >
                <h2 className="text-xl font-bold tracking-wide">
                  {onlineMode === true ? "Sale Online" : "Sale Offline"}
                </h2>
              </div>
            </div>

            {/* Top buttons row - above details section */}
            <div className="flex gap-1 mb-0">
              <Button
                className="h-7 text-xs px-1 bg-gray-300 text-black"
                onClick={() => {
                  // Always navigate to new purchase form
                  const urlParams = new URLSearchParams(window.location.search);
                  const typeMode = urlParams.get("type") || "online";
                  const targetUrl = `/purchase-form?type=${typeMode}`;
                  // Clear any edit state and force navigation
                  sessionStorage.removeItem("salesFormEditMode");
                  window.location.href = targetUrl;
                }}
              >
                Purchase
              </Button>
              <Button
                className={`h-7 text-xs px-1 ${
                  !showOfflineEntries
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-black"
                }`}
                onClick={() => {
                  // Always navigate to new sales form
                  const urlParams = new URLSearchParams(window.location.search);
                  const typeMode = urlParams.get("type") || "online";
                  const targetUrl = `/sales-form?type=${typeMode}`;
                  // Clear any edit state and force navigation
                  sessionStorage.removeItem("salesFormEditMode");
                  window.location.href = targetUrl;
                }}
              >
                Sales
              </Button>
              <Button
                className={`h-7 text-xs px-1 ${
                  showOfflineEntries
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-black"
                }`}
                onClick={() => setShowOfflineEntries(!showOfflineEntries)}
              >
                Offline
              </Button>
            </div>

            {/* ===== SALES DETAILS DATA ENTRY SECTION ===== */}
            <div className="bg-gray-300 p-1 rounded border w-[1165px] ">
              {showOfflineEntries ? (
                /* ===== OFFLINE ENTRIES TABLE DISPLAY ===== */
                <div className="h-full flex flex-col">
                  <h3 className="text-lg font-semibold mb-2 text-black">
                    Sale Offline Entries
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-1 text-left border border-black text-black">
                            Slip No
                          </th>
                          <th className="px-2 py-1 text-left border border-black text-black">
                            Slip Date
                          </th>
                          <th className="px-2 py-1 text-left border border-black text-black">
                            Entry Type
                          </th>
                          <th className="px-2 py-1 text-left border border-black text-black">
                            First Weight
                          </th>
                          <th className="px-2 py-1 text-left border border-black text-black">
                            Second Weight
                          </th>
                          <th className="px-2 py-1 text-left border border-black text-black">
                            Vehicle No
                          </th>
                          <th className="px-2 py-1 text-left border border-black text-black">
                            Company Name
                          </th>
                          <th className="px-2 py-1 text-left border border-black text-black">
                            Manual Trans #
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords && filteredRecords.length > 0 ? (
                          filteredRecords.map((record: any, index: number) => (
                            <tr
                              key={record.wb_id || index}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-2 py-1 border border-black text-black">
                                <button
                                  className="text-blue-600 hover:text-blue-800 font-medium underline"
                                  onClick={() => {
                                    console.log(
                                      "Clicked offline record:",
                                      record
                                    );
                                    if (record.wb_id) {
                                      // Check if this is an offline entry
                                      const isOfflineEntry =
                                        record.offline_entry === "Yes";

                                      // Determine the correct mode parameter
                                      const modeParam = isOfflineEntry
                                        ? "offline"
                                        : "online";

                                      if (record.entry_type === "PURCHASE") {
                                        // Navigate to purchase form
                                        const targetUrl = `/purchase-form?form=purchase&type=${modeParam}&edit=${record.wb_id}`;
                                        console.log(
                                          "Navigating to purchase form:",
                                          targetUrl
                                        );
                                        window.location.href = targetUrl;
                                      } else if (
                                        record.entry_type === "PURCHASE_RETURN"
                                      ) {
                                        const targetUrl = `/purchase-return?type=${modeParam}&edit=${record.wb_id}`;
                                        console.log(
                                          "Navigating to purchase return form:",
                                          targetUrl
                                        );
                                        window.location.href = targetUrl;
                                      } else if (
                                        record.entry_type === "SALE_RETURN"
                                      ) {
                                        const targetUrl = `/sales-return?type=${modeParam}&edit=${record.wb_id}`;
                                        console.log(
                                          "Navigating to sales return form:",
                                          targetUrl
                                        );
                                        window.location.href = targetUrl;
                                      } else {
                                        // For SALE entries, stay on current page and load the data
                                        loadDataByWbId(record.wb_id);

                                        // Update URL to show edit mode with correct type
                                        const newUrl = `/sales-form?type=${modeParam}&edit=${record.wb_id}`;
                                        window.history.replaceState(
                                          {},
                                          "",
                                          newUrl
                                        );

                                        // Close offline entries view
                                        setShowOfflineEntries(false);
                                      }
                                    }
                                  }}
                                >
                                  {record.slip_no || "---"}
                                </button>
                              </td>
                              <td className="px-4 py-2 border border-black text-black">
                                {record.slip_in_time
                                  ? new Date(
                                      record.slip_in_time
                                    ).toLocaleDateString()
                                  : "---"}
                              </td>
                              <td className="px-2 py-1 border border-black text-black">
                                {record.entry_type || "SALE"}
                              </td>
                              <td className="px-2 py-1 border border-black text-black">
                                ---
                              </td>
                              <td className="px-2 py-1 border border-black text-black">
                                ---
                              </td>
                              <td className="px-2 py-1 border border-black text-black">
                                {record.vehicle_no || "---"}
                              </td>
                              <td className="px-2 py-1 border border-black text-black">
                                {record.vendor_name || "---"}
                              </td>
                              <td className="px-2 py-1 border border-black text-black">
                                ---
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={8}
                              className="px-2 py-4 text-center text-gray-500 border border-black"
                            >
                              No offline entries found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* ===== REGULAR SALES FORM - DATA ENTRY TABLE ===== */
 <div className="h-full flex flex-col">
  {/* ===== SALES TABLE HEADER - WITH DELETE ACTION COLUMN ===== */}
  <div
    className="grid gap-px bg-gray-250 text-xs font-semibold mb-1 w-[1700px]"
    style={{
      gridTemplateColumns:
        "80px 180px 120px 170px 100px 170px 80px 120px 90px 40px",
      width: "1900px",
    }}
  >
    <div className="bg-gray-300 p-1 text-center border border-gray-400 text-black">
      DC #
    </div>
    <div className="bg-gray-300 p-1 text-center border border-gray-400 text-black">
      Customer Name
    </div>
    <div className="bg-gray-300 p-1 text-center border border-gray-400 text-black">
      Vehicle No
    </div>
    <div className="bg-gray-300 p-1 text-center border border-gray-400 text-black">
      Item Description
    </div>
    <div className="bg-gray-300 p-1 text-center border border-gray-400 text-black">
      DC Qty
    </div>
    <div className="bg-gray-300 p-1 text-center border border-gray-400 text-black">
      Bardana Type
    </div>
    <div className="bg-gray-300 p-1 text-center border border-gray-400 text-black">
      WPB
    </div>
    <div className="bg-gray-300 p-1 text-center border border-gray-400 text-black">
      Bardana Weight
    </div>
    <div className="bg-gray-300 p-1 text-center border border-gray-400 text-black">
      Branch
    </div>
    <div className="bg-gray-300 p-1 text-center border border-gray-400 text-black">
      ✖
    </div>
  </div>

  {/* Sales Table Body */}
  <div className="bg-gray-200 mb-4" style={{ height: "200px" }}>
    {[...Array(4)].map((_, index) => (
      <div
        key={index}
        className="grid gap-px text-xs"
        style={{
          gridTemplateColumns:
            "80px 180px 120px 170px 100px 170px 80px 120px 90px 40px",
          width: "1600px",
        }}
      >
        {/* DC # */}
        <div className="bg-white border border-gray-300 p-1">
          <input
            type="text"
            className={`w-full h-6 text-xs text-black px-2 border-none bg-transparent focus:outline-none ${
              (!onlineMode || salesData[index]?.isFetched)
                ? "bg-gray-100 cursor-not-allowed"
                : ""
            }`}
            value={salesData[index]?.dcNo || ""}
            onChange={(e) =>
              handleSalesDataChange(index, "dcNo", e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const dcNo = salesData[index]?.dcNo;
                if (dcNo && dcNo.trim() !== "") {
                  fetchDcData(dcNo.trim(), index);
                }
              }
            }}
            placeholder={!onlineMode || salesData[index]?.isFetched ? "" : "Press Enter to fetch"}
            readOnly={!onlineMode || salesData[index]?.isFetched}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-form-type="other"
          />
        </div>

        {/* Customer Name LOV */}
        <div className="bg-white border border-gray-300 p-1 relative">
          <input
            type="text"
            className={`w-full h-6 text-xs border-none bg-white text-black cursor-text px-2 ${
              salesData[index]?.customerId ? "bg-blue-100" : "bg-white"
            }`}
            value={salesData[index]?.customerName || ""}
            onFocus={() => {
              setFocusedCustomerRowIndex(index);
              setOpenBranchLovRowIndex(null);
              setOpenItemLovRowIndex(null);
            }}
            onChange={(e) => {
              const newData = [...salesData];
              newData[index] = { 
                ...newData[index], 
                customerName: e.target.value.toUpperCase(), 
                customerId: null
              };
              setSalesData(newData);
              if (openCustomerLovRowIndex === index) {
                setCustomerSearchQuery(e.target.value);
              }
            }}
            onKeyDown={(e) => {
              if ((e.ctrlKey && e.key.toLowerCase() === "l") && index === focusedCustomerRowIndex) {
                e.preventDefault();
                setOpenCustomerLovRowIndex(index);
                setCustomerSearchQuery(salesData[index]?.customerName || "");
                setHighlightedCustomerIndex(0);
                setTimeout(() => {
                  if (customerSearchInputRef.current) {
                    customerSearchInputRef.current.focus();
                  }
                }, 50);
              }
              if (salesData[index]?.customerId && e.key === "Backspace") {
                e.preventDefault();
                const newData = [...salesData];
                newData[index] = { ...newData[index], customerName: "", customerId: null };
                setSalesData(newData);
                return;
              }
              if (openCustomerLovRowIndex === index && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                e.preventDefault();
                setHighlightedCustomerIndex(prev => {
                  if (e.key === "ArrowDown") return prev === filteredCustomers.length - 1 ? 0 : prev + 1;
                  return prev <= 0 ? filteredCustomers.length - 1 : prev - 1;
                });
              }
              if (openCustomerLovRowIndex === index && e.key === "Enter" && filteredCustomers.length > 0) {
                e.preventDefault();
                const highlightedCustomer = filteredCustomers[highlightedCustomerIndex];
                if (highlightedCustomer) {
                  const customerId = highlightedCustomer.customer_id || highlightedCustomer.id;
                  const customerName = highlightedCustomer.name || highlightedCustomer.customer_name;
                  const newData = [...salesData];
                  newData[index] = {
                    ...newData[index],
                    customerName: customerName,
                    customerId: customerId
                  };
                  setSalesData(newData);
                  setOpenCustomerLovRowIndex(null);
                  setCustomerSearchQuery("");
                }
              }
              if (e.key === "Escape") {
                setOpenCustomerLovRowIndex(null);
                setHighlightedCustomerIndex(-1);
              }
            }}
            autoComplete="off"
          />

          {/* LOV Open Button */}
          <button
            className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (openCustomerLovRowIndex === index) {
                setOpenCustomerLovRowIndex(null);
              } else {
                setOpenCustomerLovRowIndex(index);
                setCustomerSearchQuery(salesData[index]?.customerName || "");
                setHighlightedCustomerIndex(0);
                setTimeout(() => {
                  if (customerSearchInputRef.current) {
                    customerSearchInputRef.current.focus();
                  }
                }, 50);
              }
            }}
            title="Open LOV (Ctrl+L)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Customer LOV Dropdown */}
          {openCustomerLovRowIndex === index && (
            <div
              ref={customerLovRef}
              className="absolute z-50 bg-white border border-gray-300 mt-1 w-full shadow-md max-h-48 overflow-y-auto"
              onMouseDown={(e) => e.preventDefault()}
            >
              <input
                ref={customerSearchInputRef}
                type="text"
                placeholder="Search customers..."
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                className="h-7 w-full text-black text-sm border border-gray-300 px-2 m-1 rounded"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();
                    setHighlightedCustomerIndex(prev => {
                      if (e.key === "ArrowDown") return prev === filteredCustomers.length - 1 ? 0 : prev + 1;
                      return prev <= 0 ? filteredCustomers.length - 1 : prev - 1;
                    });
                  }
                  if (e.key === "Enter" && filteredCustomers.length > 0) {
                    e.preventDefault();
                    const selectedCustomer = filteredCustomers[highlightedCustomerIndex];
                    if (selectedCustomer) {
                      const customerId = selectedCustomer.customer_id || selectedCustomer.id;
                      const customerName = selectedCustomer.name || selectedCustomer.customer_name;
                      const newSalesData = [...salesData];
                      newSalesData[index] = {
                        ...newSalesData[index],
                        customerName: customerName,
                        customerId: customerId
                      };
                      setSalesData(newSalesData);
                      setOpenCustomerLovRowIndex(null);
                      setCustomerSearchQuery("");
                    }
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setOpenCustomerLovRowIndex(null);
                    setHighlightedCustomerIndex(-1);
                  }
                }}
              />
              <div>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer, idx) => {
                    const customerId = customer.customer_id || customer.id;
                    const customerName = customer.name || customer.customer_name;
                    return (
                      <div
                        key={customerId}
                        className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 text-black ${
                          idx === highlightedCustomerIndex ? 'bg-blue-100' : ''
                        }`}
                        onClick={() => {
                          const newSalesData = JSON.parse(JSON.stringify(salesData));
                          newSalesData[index] = {
                            ...newSalesData[index],
                            customerName: customerName,
                            customerId: customerId
                          };
                          setSalesData(newSalesData);
                          setOpenCustomerLovRowIndex(null);
                          setCustomerSearchQuery("");
                        }}
                        onMouseEnter={() => setHighlightedCustomerIndex(idx)}
                      >
                        <div className="font-medium">{customerName}</div>
                        {customer.code && (
                          <div className="text-xs text-gray-500">Code: {customer.code}</div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-xs text-gray-500 text-center">
                    No customers found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vehicle No */}
        <div className="bg-white border border-gray-300 p-1">
          <input
            type="text"
            className={`w-full h-6 text-xs text-black px-2 border-none bg-transparent focus:outline-none ${
              (onlineMode && salesData[index]?.isFetched) ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            value={salesData[index]?.vehicleNo || ""}
            onChange={(e) => {
              if (onlineMode && salesData[index]?.isFetched) return;
              handleSalesDataChange(index, "vehicleNo", e.target.value);
            }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            readOnly={onlineMode && salesData[index]?.isFetched}
            data-form-type="other"
          />
        </div>

        {/* Item Description */}
        <div className="bg-white border border-gray-300 p-1">
          {!onlineMode ? (
            <Select
              value={salesData[index]?.itemId?.toString() || "__CUSTOM__"}
              onValueChange={(idStr) => {
                if (idStr === "__CUSTOM__") return;
                const id = parseInt(idStr, 10);
                const selectedItem = items.find((i) => i.id === id);
                if (selectedItem) {
                  handleSalesDataChange(index, "itemId", selectedItem.id);
                  handleSalesDataChange(index, "itemCode", selectedItem.item_code || selectedItem.code || "");
                  handleSalesDataChange(index, "itemDescription", selectedItem.description || selectedItem.item_desc || "");
                }
                setItemSearchQuery("");
              }}
              onOpenChange={(open) => {
                if (open) {
                  setTimeout(() => itemSearchInputRef.current?.focus(), 0);
                } else {
                  setItemSearchQuery("");
                }
              }}
            >
              <SelectTrigger className="w-full h-6 text-xs border-none bg-transparent focus:ring-0 text-black">
                <div className="flex items-center justify-between w-full">
                  <SelectValue placeholder="Select or type new item">
                    {salesData[index]?.itemDescription || ""}
                  </SelectValue>
                </div>
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1 sticky top-0 bg-white z-10">
                  <input
                    ref={itemSearchInputRef}
                    type="text"
                    placeholder="Search or type new item..."
                    value={itemSearchQuery || salesData[index]?.itemDescription || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setItemSearchQuery(val);
                      handleSalesDataChange(index, "itemDescription", val);
                      handleSalesDataChange(index, "itemId", null);
                      setTimeout(() => {
                        itemSearchInputRef.current?.focus();
                        itemSearchInputRef.current?.setSelectionRange(val.length, val.length);
                      }, 0);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (itemSearchQuery || "").trim() !== "") {
                        e.preventDefault();
                        handleSalesDataChange(index, "itemDescription", itemSearchQuery);
                        handleSalesDataChange(index, "itemId", null);
                        setItemSearchQuery("");
                      }
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="h-8 w-full text-sm border border-gray-300 px-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="off"
                  />
                </div>
                {filteredItems.filter(item => item?.id != null).map(item => (
                  <SelectItem
                    key={item.id}
                    value={item.id.toString()}
                    className="text-xs focus:bg-blue-500 focus:text-white data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                  >
                    {item.description || item.item_desc}
                  </SelectItem>
                ))}
                {itemSearchQuery && !items.some((i) => {
                  const desc = i?.description || i?.item_desc || "";
                  return desc.toLowerCase() === itemSearchQuery.toLowerCase();
                }) && (
                  <div
                    className="px-2 py-1 text-xs text-blue-600 cursor-pointer hover:bg-gray-100"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      handleSalesDataChange(index, "itemDescription", itemSearchQuery);
                      handleSalesDataChange(index, "itemId", null);
                      setItemSearchQuery("");
                      itemSearchInputRef.current?.focus();
                    }}
                  >
                    Add "{itemSearchQuery}"
                  </div>
                )}
              </SelectContent>
            </Select>
          ) : (
            <input
              type="text"
              className={`w-full h-6 text-xs text-black px-2 border-none bg-transparent focus:outline-none ${
                onlineMode && salesData[index]?.isFetched ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              value={salesData[index]?.itemDescription || ""}
              onChange={(e) => {
                if (onlineMode && salesData[index]?.isFetched) return;
                handleSalesDataChange(index, "itemDescription", e.target.value)
              }}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              data-form-type="other"
              readOnly={onlineMode && salesData[index]?.isFetched}
            />
          )}
        </div>

        {/* DC Qty - After Item Description */}
       <div className="bg-white border border-gray-300 p-1">
  <input
    type="text"
    className="w-full h-6 text-xs text-black px-2 border-none bg-transparent focus:outline-none text-right"
    value={salesData[index]?.dcQty || ""}
  onChange={(e) => {
  const newData = [...salesData];

  const dcQty = parseFloat(e.target.value || "0");
  const wtPerBag = parseFloat(newData[index]?.wtPerBag || "0");

  const bardanaWeight = dcQty * wtPerBag;

  newData[index] = {
    ...newData[index],
    dcQty: e.target.value,
    bardanaWeight: isNaN(bardanaWeight)
      ? ""
      : bardanaWeight.toString(),
  };
console.log("DC Qty:", dcQty);
console.log("WPB:", wtPerBag);
console.log("Bardana Weight:", bardanaWeight);

  setSalesData(newData);
  setFormData((prev) => ({
  ...prev,
  masterBardanaWeight: bardanaWeight.toString(),
}));
}}

    autoComplete="off"

    
  />

  
</div>

        {/* Bardana Type */}
        <div className="bg-white border border-gray-300 p-1">
          <Select
            value={salesData[index]?.bardanaType || ""}
          onValueChange={(value) => {
  const selectedBardana = bardanaTypes.find(
    (item) => item.type === value
  );

  const newData = [...salesData];

  const dcQty = parseFloat(newData[index]?.dcQty || "0");
  const wtPerBag = parseFloat(
    selectedBardana?.data_config_segment1 || "0"
  );

  const bardanaWeight = dcQty * wtPerBag;

  newData[index] = {
    ...newData[index],
    bardanaType: value,
    bardanaTypeId: selectedBardana?.data_config_id || null,
    wtPerBag: selectedBardana?.data_config_segment1 || "",
    bardanaWeight: bardanaWeight.toString(),
  };

  console.log("DC Qty:", dcQty);
  console.log("WPB:", wtPerBag);
  console.log("Bardana Weight:", bardanaWeight);

  setSalesData(newData);

  setFormData((prev) => ({
  ...prev,
  masterBardanaWeight: bardanaWeight.toString(),
}));
  setBardanaSelectOpen(false);
  setBardanaSelectedRow(null);
}}
            open={bardanaSelectOpen && bardanaSelectedRow === index}
            onOpenChange={(open) => {
              setBardanaSelectOpen(open);
              if (open) {
                setBardanaSelectedRow(index);
              } else {
                setBardanaSelectedRow(null);
              }
            }}
          >
            <SelectTrigger 
              className="w-full h-6 text-xs border-none bg-transparent focus:ring-0 text-black hover:bg-gray-50 focus:bg-gray-50"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setBardanaSelectOpen(!bardanaSelectOpen);
                  if (!bardanaSelectOpen) {
                    setBardanaSelectedRow(index);
                  } else {
                    setBardanaSelectedRow(null);
                  }
                }
              }}
              onClick={() => {
                setBardanaSelectOpen(!bardanaSelectOpen);
                if (!bardanaSelectOpen) {
                  setBardanaSelectedRow(index);
                } else {
                  setBardanaSelectedRow(null);
                }
              }}
            >
              <SelectValue placeholder="">
                {salesData[index]?.bardanaType || ""}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <div className="px-2 py-1 sticky top-0 bg-white z-10 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search Bardana Type..."
                  value={bardanaSearch.searchValue}
                  onChange={(e) => {
                    setBardanaSearch(prev => ({
                      ...prev,
                      searchValue: e.target.value
                    }));
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="h-7 w-full text-sm border border-gray-300 px-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              
              {filteredBardanaTypes.length > 0 ? (
                filteredBardanaTypes.map((bardanaType) => (
                  <SelectItem
                    key={bardanaType.data_config_id}
                    value={bardanaType.type}
                    className="text-xs focus:bg-blue-500 focus:text-white data-[state=checked]:bg-blue-500 data-[state=checked]:text-white cursor-pointer"
                  >
                    {bardanaType.type}
                  </SelectItem>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-gray-500 text-center">
                  {bardanaTypes.length === 0 ? 'Loading...' : 'No bardana types found'}
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
     
        {/* WPB - Weight Per Bags */}
       <div className="bg-white border border-gray-300 p-1">
  <input
    type="text"
    className="w-full h-6 text-xs text-black px-2 border-none bg-transparent focus:outline-none text-right"
    value={salesData[index]?.wtPerBag || ""}
   onChange={(e) => {
  const newData = [...salesData];

  const wtPerBag = parseFloat(e.target.value || "0");
  const dcQty = parseFloat(newData[index]?.dcQty || "0");

  const bardanaWeight = dcQty * wtPerBag;

  newData[index] = {
    ...newData[index],
    wtPerBag: e.target.value,
    bardanaWeight: isNaN(bardanaWeight)
      ? ""
      : bardanaWeight.toString(),
  };

  setSalesData(newData);
  setFormData((prev) => ({
  ...prev,
  masterBardanaWeight: bardanaWeight.toString(),
}));
}}
    autoComplete="off"
  />
</div>
        {/* Bardana Weight */}
   <div className="bg-white border border-gray-300 p-1">
  <input
    type="text"
    className="w-full h-6 text-xs text-black px-2 border-none bg-transparent focus:outline-none text-right"
    value={
      salesData[index]?.bardanaWeight
        ? Math.round(parseFloat(salesData[index].bardanaWeight))
        : ""
    }
    readOnly
    autoComplete="off"
  />
</div>
        {/* Branch - Read-only from master */}
        <div className="bg-white border border-gray-300 p-1">
          <input
            type="text"
            className="w-full h-6 text-xs text-black px-2 border-none bg-transparent focus:outline-none text-right"
            value={
              branches.find(
                (b) => b.branch_id.toString() === formData.branchId?.toString()
              )?.branch_name || ""
            }
            readOnly
          />
        </div>

        {/* Delete Button */}
        <div className="bg-white border border-gray-300 p-1 flex items-center justify-center">
          <button
            type="button"
            onClick={() => handleSalesRowDelete(index)}
            className="text-red-500 hover:text-red-700 text-lg font-bold"
            title="Delete row"
          >
            ✖
          </button>
        </div>
      </div>
    ))}
  </div>

  {/* Total Row */}
  <div
    className="grid gap-px text-xs font-semibold mb-4"
    style={{
      gridTemplateColumns: "80px 170px 120px 170px 80px 170px 100px 120px 100px 40px",
      width: "1150px",
      height: "5px",
      marginTop: "-70px",
    }}
  >
    <div className="bg-gray-200 border border-gray-400 p-0.5"></div>
    <div className="bg-gray-200 border border-gray-400 p-0.5"></div>
   
    <div className="bg-gray-200 border border-gray-400 p-0.5"></div>
     {/* <div className="bg-gray-200 border border-gray-400 p-0.5 flex items-center justify-end">
      <span className="text-black">Total:</span>
    </div>
      <div className="bg-white border border-gray-400 p-1">
      <input
        type="text"
        className="w-full h-4 text-xs text-black px-2 border-none bg-transparent focus:outline-none text-right font-semibold"
        readOnly
        value={salesData.reduce(
          (sum, row) => sum + (parseFloat(row.dcQty) || 0),
          0
        )}
      />
    </div> */}
    <div className="bg-gray-200 border border-gray-400 p-0.5"></div>
   
    <div className="bg-gray-200 border border-gray-400 p-0.5"></div>
    <div className="bg-gray-200 border border-gray-400 p-0.5"></div>
 
  
    <div className="bg-gray-200 border border-gray-400 p-0.5"></div>
  </div>

  {/* Bottom section */}
  <div
    className="bg-gray-100 p-0.5 flex justify-between items-center border border-gray-300 mt-0"
    style={{ width: "1150px" }}
  >
    <div className="bg-gray-300 flex items-center space-x-2">
      <label className="text-sm font-medium text-black">
        Total Weight Diff:
      </label>
      <input
        type="text"
        className={`w-32 h-6 text-sm border border-gray-300 px-2 focus:outline-none ${
          Math.abs(totalWeightDiff) > 30
            ? "bg-red-200 text-red-800"
            : "bg-white text-black"
        }`}
        value={totalWeightDiff.toFixed(2)}
        readOnly
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        data-form-type="other"
      />
    </div>

    <div className="bg-gray-300 flex items-center space-x-2">
      <label className="text-sm font-medium text-black">
        Total Feed Bags:
      </label>
      <input
        type="text"
        className="w-32 h-6 text-sm border border-gray-300 px-2 focus:outline-none text-black"
        value={salesData.reduce(
          (sum, row) => sum + (parseFloat(row.bardanaWeight) || 0),
          0
        )}
        readOnly
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        data-form-type="other"
      />
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
}
