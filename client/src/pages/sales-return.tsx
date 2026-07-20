import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useCallback } from "react";
import { useComPort } from "@/Comportcontext";
import { useQueryClient } from "@tanstack/react-query";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

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
import { useConfig } from "@/lib/config-context";

export default function SalesReturnForm() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchSlipNo, setSearchSlipNo] = useState("");
  const [searchVehicleNo, setSearchVehicleNo] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
const [selectedForm, setSelectedForm] = useState<"purchase" | "sales" | "sales-return" | "soldNote">("sales-return");
const [cameFromPrevious, setCameFromPrevious] = useState(false);
 const queryClient = useQueryClient();  // ✅ FIX HERE
const [disableSaveButton, setDisableSaveButton] = useState(false);




  // Sales data state - mapped to database columns
  const [details, setdetails] = useState<any[]>(
    Array.from({ length: 8 }, (_, index) => ({
      doId: "", // Will be auto-generated as maximum number
      dcNo: "",
      doNo: "",
      customerName: "", // Maps to customer_name
      vehicleNo: "", // Maps to vehicle_no
       itemCode: "",         // ✅ New field for item_code  
      doDate: "", // Maps to do_date (will be null for now)
      itemDescription: "", // Maps to item_description
      dcQty: "",
      doQty: "",
      branch: "",
    }))
  );

  const nonEmptyRows = details.filter(
    (row) =>
      row.dcNo ||
      row.doNo ||
      row.customerName ||
      row.vehicleNo ||
      row.itemCode ||           // ✅ added this line
      row.itemDescription ||
      row.dcQty ||
      row.doQty
  );

const handlePrintReport = async () => {
  if (!formData.slipNo) {
    alert("Please save the record first or load an existing slip to print");
    return;
  }

  if (!editingWbId || Number(editingWbId) === 0) {
    alert("❌ Please save the record first or load an existing slip to print");
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to print the report");
    return;
  }

  try {
    const response = await fetch(`/api/form-report/${editingWbId}`);
    if (!response.ok) throw new Error("Failed to fetch report data");
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error("Invalid response from API");
    }
    
    const raw = result.data;

    const apiData = {
      ...raw,
      slip_no:               raw.slip_no || "",
      vehicle_no:            raw.vehicle_no || "",
      first_weight:          raw.first_weight ? String(raw.first_weight) : "",
      second_weight:         raw.second_weight ? String(raw.second_weight) : "",
      net_weight:            raw.net_weight ? String(raw.net_weight) : "",
      freight:               raw.freight ? String(raw.freight) : "",
      slip_in_time:          raw.slip_in_time || "",
      slip_out_time:         raw.slip_out_time || "",
      entry_type:            raw.entry_type || "SALE_RETURN",
      created_by_name:       raw.created_by_name || "",
      second_weight_by_name: raw.second_weight_by_name || "",
      second_weight_by:      raw.second_weight_by || "",
    };

    // ✅ DB se details lo — state se nahi
    const dbRows = (raw.details || []).filter((row: any) =>
      row.dc_no || row.do_no || row.customer_name ||
      row.item_code || row.item_desc || row.dc_qty
    ).map((row: any) => ({
      customerName:    row.customer_name || "",
      itemCode:        row.item_code || "",
      itemDescription: row.item_desc || "",
      dcQty:           row.dc_qty ? String(row.dc_qty) : "",
      doNo:            row.do_no || "",
      dcNo:            row.dc_no || "",
    }));
    
    const reportHTML = generateReportHTML(apiData, dbRows);
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.print();
    
  } catch (error) {
    console.error("Error printing report:", error);
    alert("Error generating report. Please try again.");
    printWindow.close();
  }
};

// ✅ dbRows parameter add kiya
const generateReportHTML = (apiData: any = null, dbRows: any[] = []) => {
  const currentDate = new Date()
    .toLocaleDateString("en-GB", { timeZone: "Asia/Karachi", day: "2-digit", month: "short", year: "2-digit" })
    .toUpperCase().replace(/\s/g, "-");

  const currentTime = new Date()
    .toLocaleTimeString("en-GB", { timeZone: "Asia/Karachi", hour12: true })
    .toUpperCase();

  function formatPKTDateTime(dateStr: string | Date | null | undefined): string {
    if (!dateStr) return "";
    const date = new Date(new Date(dateStr).toLocaleString("en-US", { timeZone: "Asia/Karachi" }));
    if (isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEPT","OCT","NOV","DEC"];
    const month = months[date.getMonth()];
    const time = date.toLocaleTimeString("en-GB", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" }).toUpperCase();
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
  const hasSecondWeight = apiData?.second_weight && parseFloat(apiData.second_weight) > 0;
  const hasSecondWeightBy = !!(apiData?.second_weight_by);
  const secondWeightByName = (hasSecondWeight && hasSecondWeightBy) ? (apiData?.second_weight_by_name || "") : "";

  const firstWeight  = apiData?.first_weight  ? String(apiData.first_weight)  : "";
  const secondWeight = apiData?.second_weight ? String(apiData.second_weight) : "";
  const netWeight    = apiData?.net_weight    ? String(apiData.net_weight)    : "";

  const firstImg  = `/captured_images/first_weight/slip_${apiData?.slip_no || ""}_${apiData?.entry_type || "sale"}.jpg`;
  const secondImg = `/captured_images/second_weight/slip_${apiData?.slip_no || ""}_${apiData?.entry_type || "sale"}.jpg`;

  // ✅ dbRows use karo — state nahi
  const grandTotal = dbRows.reduce((acc, row) => acc + (parseFloat(row.dcQty) || 0), 0);

  const signaturesHTML = `
    <div class="signatures">
      <div class="signature-block" style="text-align: left;">
        <div class="signature-container">
          <span class="signature-label">Weight By:</span>
          <span class="signature-line"><span class="signature-name"><strong>${weightByName}</strong></span></span>
        </div>
      </div>
      <div class="signature-block" style="text-align: center;">
        <div class="signature-container">
          <span class="signature-label">Second Weight By:</span>
          <span class="signature-line"><span class="signature-name"><strong>${secondWeightByName}</strong></span></span>
        </div>
      </div>
      <div class="signature-block" style="text-align: right;">
        <div class="signature-container">
          <span class="signature-label">Checked By:</span>
          <span class="signature-line"><span class="signature-name"></span></span>
        </div>
      </div>
      <div class="signature-block" style="text-align: right;">
        <div class="signature-container">
          <span class="signature-label">Production Manager:</span>
          <span class="signature-line"><span class="signature-name"></span></span>
        </div>
      </div>
    </div>
  `;

  // ✅ dbRows use karo
  const tableRowsHTML = dbRows.map((row, idx) => `
    <tr>
      <td><strong>${idx + 1}</strong></td>
      <td><strong>${row.customerName || ""}</strong></td>
      <td><strong>${row.itemCode || ""}</strong></td>
      <td><strong>${row.itemDescription || ""}</strong></td>
      <td><strong>${row.dcQty || ""}</strong></td>
    </tr>
  `).join("");

  const tableHTML = `
    <table class="table">
      <thead>
        <tr><th>SR #</th><th>Party Name</th><th>Feed #</th><th>Feed Name</th><th>Qty</th></tr>
      </thead>
      <tbody>${tableRowsHTML}</tbody>
    </table>
  `;

  const totalsHTML = `
    <div class="totals">
      <div><strong>Freight Payment:</strong> <strong>${formatFreightWithCommas(apiData?.freight || "")}</strong></div>
      <div><strong>Grand Total:</strong> <strong>${grandTotal}</strong></div>
    </div>
  `;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Weighbridge Slip</title>
  <style>
    body { font-family: "Times New Roman", Times, serif; font-size: 12px; margin: 20px; font-weight: 700; }
    .container { border: 1px solid black; padding: 20px; height: 1122px; box-sizing: border-box; }
    .title { text-align: center; font-weight: 900; margin-bottom: 6px; font-size: 18px; }
    .copy-label-right { text-align: right; font-weight: 900; margin-bottom: 4px; }
    .copy-label { text-align: left; font-weight: 900; margin-bottom: 4px; }
    .print-date { text-align: right; font-size: 12px; font-weight: 900; }
    .copy-label-left { text-align: left; font-size: 18px; font-weight: 900; margin-bottom: 8px; }
    .info-table { border-collapse: collapse; width: 100%; }
    .info-table td { border-bottom: 1px solid black; padding: 4px 8px; font-size: 13px; line-height: 1.2; }
    .label-cell { width: 24%; font-weight: 900; font-size: 13px; }
    .value-cell { width: 37%; font-weight: 900; font-size: 14px; }
    .slip-no-value { font-weight: 900 !important; font-size: 24px !important; }
    .image-cell { width: 30%; border-left: 1px solid black; text-align: center; }
    .image-box-tall { height: 100%; display: flex; justify-content: center; align-items: center; border: 1px solid black; overflow: hidden; }
    .image-box-tall img { max-height: 100%; max-width: 100%; object-fit: contain; }
    .center-box { border: 1px solid black; text-align: center; font-weight: 900; width: 100%; height: 100px; display: flex; flex-direction: column; justify-content: center; box-sizing: border-box; padding: 8px 10px; }
    .truck-label { font-weight: 700; font-size: 13px; border-bottom: 1px solid black; margin-bottom: 5px; padding-bottom: 2px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .table th, .table td { border: 1px solid black; padding: 6px; text-align: left; font-weight: 900; font-size: 13px; }
    .table th { font-weight: 900; background-color: #f0f0f0; }
    .signatures { display: flex; font-weight: 900; justify-content: space-between; margin-top: 40px; }
    .signature-block { flex: 1; font-size: 13px; font-weight: 900; }
    .signature-label { display: inline-block; font-weight: 900; }
    .signature-line { display: inline-block; border-bottom: 1px solid black; width: 140px; position: relative; }
    .signature-name { font-size: 12px; font-weight: 900 !important; color: #000; position: absolute; top: -14px; left: 50%; transform: translateX(-50%); white-space: nowrap; }
    .signature-container { display: flex; align-items: center; gap: 5px; }
    .totals { display: flex; justify-content: space-between; margin-top: 15px; font-weight: 900; font-size: 14px; }
    hr.dashed { border: 1px dashed #aaa; margin: 30px 0; }
    .vehicle-no { font-weight: 900; font-size: 18px; }
    * { font-weight: 700 !important; }
    .title, .copy-label-right, .copy-label, .copy-label-left, .label-cell, .value-cell,
    .table th, .signatures, .signature-label, .signature-name, .totals, .vehicle-no,
    .slip-no-value, .table td, .center-box { font-weight: 900 !important; }
  </style>
</head>
<body>
<div class="container">
  <div class="print-date">Print Date: ${currentDate} ${currentTime}</div>
  <div class="title">Multan Feed (PVT.) LTD.</div>
  <div style="display: flex; justify-content: space-between;">
    <div class="copy-label-left">Sale Return</div>
    <div class="copy-label-right">Office Copy</div>
  </div>
  <div style="display: flex; justify-content: space-between; border: 1px solid black; border-left: 1px solid black;">
    <table class="info-table" style="width: 33.33%; border-right: 1px solid black;">
      <tr>
        <td class="label-cell">Slip No:</td>
        <td class="value-cell"><span class="slip-no-value">${apiData?.slip_no || ""}</span></td>
        <td class="image-cell" rowspan="3">
          <div class="image-box-tall">
            <img src="${firstImg}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" alt="First Weight Image" />
            <div style="display: none; font-size: 8px; color: #666;">No Img</div>
          </div>
        </td>
      </tr>
      <tr><td class="label-cell">Time In:</td><td class="value-cell">${apiData?.slip_in_time ? formatPKTDateTime(apiData.slip_in_time) : ""}</td></tr>
      <tr><td class="label-cell">Time Out:</td><td class="value-cell">${apiData?.slip_out_time ? formatPKTDateTime(apiData.slip_out_time) : ""}</td></tr>
    </table>
    <div class="center-wrapper" style="width: 33.33%; display: flex; align-items: center; justify-content: center;">
      <div class="center-box">
        <div class="truck-label">Truck #</div>
        <span class="vehicle-no">${apiData?.vehicle_no || ""}</span>
      </div>
    </div>
    <table class="info-table" style="width: 33.33%; border-right: 1px solid black;">
      <tr>
        <td class="label-cell">Tare Weight:</td>
        <td class="value-cell"><strong>${firstWeight}</strong></td>
        <td class="image-cell" rowspan="3">
          <div class="image-box-tall">
            <img src="${secondImg}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" alt="Second Weight Image" />
            <div style="display: none; font-size: 8px; color: #666;">No Img</div>
          </div>
        </td>
      </tr>
      <tr><td class="label-cell">Loaded Weight:</td><td class="value-cell"><strong>${secondWeight}</strong></td></tr>
      <tr><td class="label-cell">Net Weight:</td><td class="value-cell"><strong>${netWeight ? Math.abs(parseFloat(netWeight)) : ""}</strong></td></tr>
    </table>
  </div>
  ${tableHTML}
  ${totalsHTML}
  ${signaturesHTML}

  <hr class="dashed" />

  <!-- CUSTOMER COPY -->
  <div class="print-date">Print Date: ${currentDate} ${currentTime}</div>
  <div class="title">Multan Feed (PVT.) LTD.</div>
  <div style="display: flex; justify-content: space-between;">
    <div class="copy-label-left">Sale Return</div>
    <div class="copy-label-right">Customer Copy</div>
  </div>
  <div style="display: flex; justify-content: space-between; border: 1px solid black; border-left: 1px solid black;">
    <table class="info-table" style="width: 33.33%; border-right: 1px solid black;">
      <tr>
        <td class="label-cell">Slip No:</td>
        <td class="value-cell"><span class="slip-no-value">${apiData?.slip_no || ""}</span></td>
      </tr>
      <tr><td class="label-cell">Time In:</td><td class="value-cell">${apiData?.slip_in_time ? formatPKTDateTime(apiData.slip_in_time) : ""}</td></tr>
      <tr><td class="label-cell">Time Out:</td><td class="value-cell">${apiData?.slip_out_time ? formatPKTDateTime(apiData.slip_out_time) : ""}</td></tr>
    </table>
    <div class="center-wrapper" style="width: 33.33%; display: flex; align-items: center; justify-content: center;">
      <div class="center-box">
        <div class="truck-label">Truck #</div>
        <span class="vehicle-no">${apiData?.vehicle_no || ""}</span>
      </div>
    </div>
    <table class="info-table" style="width: 33.33%; border-right: 1px solid black;">
      <tr><td class="label-cell">Tare Weight:</td><td class="value-cell"><strong>${firstWeight}</strong></td></tr>
      <tr><td class="label-cell">Loaded Weight:</td><td class="value-cell"><strong>${secondWeight}</strong></td></tr>
      <tr><td class="label-cell">Net Weight:</td><td class="value-cell"><strong>${netWeight ? Math.abs(parseFloat(netWeight)) : ""}</strong></td></tr>
    </table>
  </div>
  ${tableHTML}
  ${totalsHTML}
  ${signaturesHTML}
</div>
</body>
</html>`;
};


const handledetailsChange = (index: number, field: string, value: any) => {
  const newData = [...details];
  newData[index] = { ...newData[index], [field]: value };
  
  setdetails(newData);

  // ✅ Correct console log: newData[index] shows updated value immediately
  console.log(`📝 Updated details[${index}]:`, newData[index]);
};


  const handleSalesRowDelete = (index: number) => {
    setdetails((prevData) => {
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
  const { comPort } = useComPort();

  // Fetch all first weight records for Sales Return
  const { data: firstWeightRecords = [] } = useQuery({
    queryKey: ["/api/purchase/first-weight-records?entry_type=Sales%20Return"],
    refetchInterval: 10000, // Refresh every 10 seconds
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
    entryType: "SALE_RETURN",
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
    // Sales return specific fields
    returnReason: "",
    returnDate: "",
    originalSlipNo: "",
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
    igpNo: "",
    igpDate: "",
    poNo: "",
    po_no: "",
    itemCode: "",
    itemDesc: "",
    poQty: "",
    igpQty: "",
    balanceQty: "",
    bardanaType: "",
    wtPerBag: "",
    noOfBags: "",
    bagCondition: "",
    bardanaTypeId: "",
    vendor: "",
    vendorName: "",
    customerId: "",
    qualityDed: "",
    weight: "",
    bags: "",
    wbItemPId: "",
    itemId: "",
    poId: "",

     created_by_name: "",        // ✅ Add this
  second_weight_by_name: "",  // ✅ Add this
  second_weight_by: "",       // ✅ Add this
    baradanaType: "",
    manualIgpNo: "",
    igpId: "",
    vendorId: "",
     totalFeedBags: "",
    weightPerBags: "",
    dcQty: "",
    supWeightWithoutBardana: "",
    netSupplierWeight: "",
    isPercentageMode: false,
     isFirstWeightSaved: false,  // ✅ first weight DB me saved hai ya nahi
  isSecondWeightSaved: false, // ✅ second weight DB me saved hai ya nahi
  };

  // Form data and loading states
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingWbId, setEditingWbId] = useState<number | null>(null);
  const [isLoadingEditData, setIsLoadingEditData] = useState(false);

  // Customer LOV states
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const customerSearchInputRef = useRef<HTMLInputElement>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [openCustomerLovRowIndex, setOpenCustomerLovRowIndex] = useState<
    number | null
  >(null);
  const [focusedCustomerRowIndex, setFocusedCustomerRowIndex] = useState<
    number | null
  >(null);
  const [highlightedCustomerIndex, setHighlightedCustomerIndex] =
    useState<number>(-1);
  const customerLovRef = useRef<HTMLDivElement>(null);
  
const [isCustomerSelected, setIsCustomerSelected] = useState(false);

  // Item LOV states
  const [itemSearchQuery, setItemSearchQuery] = useState<string>("");
  const itemSearchInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<any[]>([]);
  const [openItemLovRowIndex, setOpenItemLovRowIndex] = useState<number | null>(
    null
  );
  const [focusedItemRowIndex, setFocusedItemRowIndex] = useState<number | null>(
    null
  );
  const [highlightedItemIndex, setHighlightedItemIndex] = useState<number>(-1);
  const itemLovRef = useRef<HTMLDivElement | null>(null);

  // Branch LOV states
  const [openBranchLovRowIndex, setOpenBranchLovRowIndex] = useState<
    number | null
  >(null);
  const [focusedBranchRowIndex, setFocusedBranchRowIndex] = useState<
    number | null
  >(null);
  const [highlightedBranchIndex, setHighlightedBranchIndex] =
    useState<number>(-1);
  const branchLovRef = useRef<HTMLDivElement | null>(null);

  // Close Customer LOV and deselect row when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        customerLovRef.current &&
        !customerLovRef.current.contains(event.target as Node)
      ) {
        setOpenCustomerLovRowIndex(null); // Close customer LOV
        setHighlightedCustomerIndex(-1); // Remove highlight
        setFocusedCustomerRowIndex(null); // Deselect row
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Optimized filtered customers with better case-insensitive performance
const filteredCustomers = useMemo(() => {
  if (!customers || customers.length === 0) return [];

  const query = customerSearchQuery.trim().toLowerCase();

  if (!query) {
    // Show only first 5 customers when no search query
    return customers.slice(0, 5);
  }

  // Fast case-insensitive search with early termination
  const matches = [];
  for (let i = 0; i < customers.length && matches.length < 50; i++) {
    const customer = customers[i];
    // ✅ FIX: Check BOTH customer.name AND customer.customer_name
    const customerNameLower = (customer.name || customer.customer_name || "").toLowerCase();
    if (customerNameLower.includes(query)) {
      matches.push(customer);
    }
  }

  return matches;
}, [customers, customerSearchQuery]);

  // Optimized filtered items with better case-insensitive performance
  const filteredItems = useMemo(() => {
    if (!items || items.length === 0) return [];

    const query = itemSearchQuery.trim().toLowerCase();

    if (!query) {
      // Show only first 5 items when no search query
      return items.slice(0, 5);
    }

    // Fast case-insensitive search with early termination
    const matches = [];
    for (let i = 0; i < items.length && matches.length <50; i++) {
      const item = items[i];
      const itemCodeLower = (item.code || "").toLowerCase();
      const itemDescLower = (item.item_desc || "").toLowerCase();

      if (itemCodeLower.includes(query) || itemDescLower.includes(query)) {
        matches.push(item);
      }
    }

    return matches;
  }, [items, itemSearchQuery]);

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
    return false;
  });


  
  const [plateReading, setPlateReading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [entryTypes, setEntryTypes] = useState<any[]>([]);
  const { cameraIp, cameraPort } = useConfig();

   useEffect(() => {
    const firstWeight = parseFloat(formData.firstWeight) || 0;
    const secondWeight = parseFloat(formData.secondWeight) || 0;
    const wtPerBag = parseFloat(formData.wtPerBag) || 0;
    const noOfBags = parseFloat(formData.noOfBags) || 0;
  
    const bardanaWeight = wtPerBag * noOfBags;
  
    // ✔️ Your actual formula (negative allowed)
    const grossWeight = secondWeight - firstWeight;
  
    const netWeight = grossWeight - bardanaWeight;
  
   setFormData((prev) => ({
  ...prev,
  bardanaWeight: Math.round(bardanaWeight).toString(),
  grossWeight: Math.round(grossWeight).toString(),
  netWeight: Math.round(netWeight).toString(),
}));
  }, [
    formData.firstWeight,
    formData.secondWeight,
    formData.wtPerBag,
    formData.noOfBags,
  ]);
  
  
 useEffect(() => {
  const netWeight = parseFloat(formData.netWeight);

  // ⚡ total DC Qty ka sum from details[] rows
  const totalDcQty = details.reduce(
    (sum, row) => sum + (parseFloat(row.dcQty) || 0),
    0
  );

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
}, [formData.netWeight, details]); // ⚡ Runs when net weight or any dcQty changes



  // Calculate Total Weight Diff
  const totalWeightDiff = useMemo(() => {
    const firstWeight = parseFloat(formData.firstWeight) || 0;
    const secondWeight = parseFloat(formData.secondWeight) || 0;
    return firstWeight - secondWeight;
  }, [formData.firstWeight, formData.secondWeight]);

  // DC Data Fetching Function for Sales Return
  const fetchDcData = async (dcNo: string, rowIndex: number) => {
    if (!dcNo || dcNo.trim() === "") {
      alert("Please enter DC No");
      return;
    }

    try {
      const response = await fetch(
        `http://portal.sabirsgroup.com:8184/ords/sabroso_ords/wb/dc_data?dc_no=${dcNo}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("DC API Response:", data);

      if (data && data.items && data.items.length > 0) {
        const item = data.items[0];

        const branchName = formData.branch || "";

        // Get the branch name from branches array based on current branchId
        const selectedBranch = branches.find(
          (b) => b.branch_id.toString() === formData.branchId?.toString()
        );
        const branchNameToShow = selectedBranch
          ? selectedBranch.branch_name
          : "";

        setdetails((prev) => {
          const updated = [...prev];
          updated[rowIndex] = {
            ...updated[rowIndex],
            doId: item.do_id || "",
            dcNo: item.dc_no || "",
            doNo: item.delivery_order_no ? String(item.delivery_order_no) : "",
            customerName: item.customer_name || "",
            vehicleNo: item.vehicle_no || "",
            doDate: item.dc_date || "",
            itemDescription: item.item_desc || "",
            dcQty: item.dc_qty ? String(item.dc_qty) : "",
            doQty: item.del_qty ? String(item.del_qty) : "",
            branch: branchNameToShow,
            branchId: formData.branchId,
            dcId: item.dc_id || "",
            customerId: item.customer_id || "",
            itemId: item.item_id || "",
            itemCode: item.item_code || "",
          
          };
          return updated;
        });
        // ✅ Aur saath hi formData.vehicleNo bhi update kar do (slip ke liye)
        setFormData((prev) => ({
          ...prev,
          vehicleNo: item.vehicle_no || prev.vehicleNo,
        }));
      } else {
        alert("No data found for this DC No.");
      }
    } catch (error) {
      console.error("Error fetching DC data:", error);
      alert(
        "Failed to fetch DC data. Please check the DC number and try again."
      );
    }
  };

  // Function to cancel edit mode and return to new entry mode
  const cancelEdit = () => {
    setIsEditMode(false);
    setEditingWbId(null);
    sessionStorage.removeItem("salesReturnEditMode");

    // Clear edit parameter from URL
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete("edit");
    const newUrl = urlParams.toString()
      ? `${window.location.pathname}?${urlParams.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, "", newUrl);

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

  // Function to reset form to clean state
  const resetFormToInitial = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeMode = urlParams.get("type");
    const isOfflineMode = typeMode === "offline";

    setOnlineMode(false); // ✅ ALWAYS OFFLINE for Sale Return

    let nextSlip = Date.now().toString().slice(-6); // fallback slip

    try {
      // Always fetch next slip number for clean form
      const response = await fetch(
        "/api/purchases/next-slip?entry_type=SALE_RETURN"
      );
      if (response.ok) {
        const data = await response.json();
        nextSlip = data.nextSlipNo || nextSlip;
      }
    } catch (error) {
      console.error("Error fetching next slip number:", error);
    }

    setFormData({
      ...initialFormData,
      slipNo: nextSlip,

      // ✅ PKT time helper
      slipInTime: "",
      creationDate: getPKTDateTime(),
      lastUpdatedDate: getPKTDateTime(),
      slipDate: getPKTDateTime(),
      returnDate: getPKTDateTime(),

      onlineEntry: isOfflineMode ? "No" : "Yes",
      offlineEntry: isOfflineMode ? "Yes" : "No",
      entryType: "SALE_RETURN",
    });

    // Reset sales table
    setdetails(
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

    setIsEditMode(false);
    setEditingWbId(null);
  };

  // Get camera data
  const { data: camera } = useQuery({
    queryKey: ["/api/cameras/1"],
    enabled: true,
  });

  const formatDatetimeLocal = useCallback((raw: any) => {
    // Strict null/empty check
    if (raw === null || raw === undefined || raw === "" || raw === "null")
      return "-";

    let s = String(raw).trim();

    // DB "YYYY-MM-DD HH:MM:SS" -> ISO
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(s)) {
      s = s.replace(/\s+/, "T");
    }

    // Short date "DD-MMM-YY"
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

    let date = new Date(s);

    // Defensive: replace space->T
    if (isNaN(date.getTime()) && s.includes(" ")) {
      date = new Date(s.replace(" ", "T"));
    }

    if (isNaN(date.getTime())) return "-";

    return date
      .toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Karachi",
      })
      .replace(",", "");
  }, []);

  // const formatISODate = (localString: string) => {
  //   if (!localString) return null;
  //   return new Date(localString).toISOString();
  // };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  // Function to search and load Sale Return by slip number
  const searchAndLoadBySlipNo = async () => {
    if (!formData.slipNo || formData.slipNo.trim() === "") {
      alert("Please enter a slip number to search");
      return;
    }

    try {
      setLoading(true);
      console.log("Searching for Sale Return slip:", formData.slipNo);

      // 🔹 Fetch Sale Return entry by slip number
      const response = await fetch(
        `/api/sale-return/by-slip/${formData.slipNo.trim()}`
      );

      if (!response.ok) {
        alert(
          `No SALE_RETURN record found for slip number ${formData.slipNo}`
        );
        return;
      }

      const data = await response.json();
      if (!data || !data.master) {
        alert("Invalid record data found");
        return;
      }

      const master = data.master;
      const entryType = master.entry_type;
      const isOffline = master.offline_entry === "Yes";

      console.log(
        "Found record - Entry Type:",
        entryType,
        "Offline:",
        isOffline
      );

      if (entryType?.toUpperCase() === "SALE_RETURN") {
        // 🔹 Set online/offline mode
        setOnlineMode(!isOffline);
        const modeParam = isOffline ? "offline" : "online";

        // 🔹 Load the Sale Return record
        await loadDataByWbId(master.wb_id);

        // 🔹 Update URL to show edit mode
        const newUrl = `/sales-return?type=${modeParam}&edit=${master.wb_id}`;
        window.history.replaceState({}, "", newUrl);

        // 🔹 Exit search mode
        setIsSearchMode(false);
      } else {
        alert(
          `Found ${entryType} entry for slip ${formData.slipNo}, but this is the Sale Return form. Please use the appropriate form for ${entryType} entries.`
        );
      }
    } catch (error) {
      console.error("Error searching for Sale Return slip:", error);
      alert("Failed to search for Sale Return slip number");
    } finally {
      setLoading(false);
    }
  };

  // Fetch entry types and branches
  useEffect(() => {
    const fetchEntryTypes = async () => {
      try {
        const response = await fetch("/api/entry-types");
        if (response.ok) {
          const entryTypeData = await response.json();
          setEntryTypes(entryTypeData);
        }
      } catch (error) {
        console.error("Error fetching entry types:", error);
      }
    };

    const fetchBranches = async () => {
      try {
        const response = await fetch("/api/branches");
        if (response.ok) {
          const branchData = await response.json();
          setBranches(Array.isArray(branchData) ? branchData : []);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        setBranches([]);
      }
    };

    fetchEntryTypes();
    fetchBranches();
  }, []);

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

  // Customers query
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
              const response = await fetch(`/api/customers?branch_id=${branchId}`);
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
     // enabled: !onlineMode && !!formData.branchId,
      staleTime: 30 * 60 * 1000,
  });



  // Items query
  const {
    data: itemsData = [],
    isLoading: isItemsLoading,
    isError: isItemsError,
  } = useQuery({
    queryKey: ["/api/items"],
    queryFn: async () => {
      const res = await fetch("/api/items");
      if (!res.ok) throw new Error("Failed to load items");
      return res.json();
    },
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: true,
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
    if (itemsData) setItems(itemsData);
  }, [itemsData]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editWbId = urlParams.get("edit");
    const searchMode = urlParams.get("search");
    const typeMode = urlParams.get("type");

    console.log("URL parameters:", { editWbId, searchMode, typeMode });

    // Set online/offline mode
    if (typeMode === "offline") setOnlineMode(false);
    else if (typeMode === "online") setOnlineMode(true);

    // Detect page reload
    const isReload = window.performance
      .getEntriesByType("navigation")
      .map((nav: any) => nav.type)
      .includes("reload");

    if (isReload) {
      console.log("Page reload detected → resetting edit mode for sale return");
      setIsEditMode(false);
      setEditingWbId(null);
      resetFormToInitial();
      return; // exit early, ignore edit param
    }

    // Search mode handling
    if (searchMode === "true") {
      setIsSearchMode(true);
      setIsEditMode(false);
      setEditingWbId(null);
      setFormData((prev) => ({ ...prev, slipNo: "" }));
      return;
    }

    // Edit mode handling (normal, not reload)
    if (editWbId) {
      console.log("Edit mode from URL, loading wbId:", editWbId);
      loadDataByWbId(parseInt(editWbId));
      return;
    }

    // No edit param → new form (if not already)
    if (isEditMode) {
      setIsEditMode(false);
      setEditingWbId(null);
      setTimeout(() => resetFormToInitial(), 100);
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
      details.length > 0
    ) {
      const branchName =
        branches.find(
          (b) => b.branch_id.toString() === formData.branchId?.toString()
        )?.branch_name || "";

      if (branchName && details.some((row) => row.branch === "")) {
        setdetails((prevData) =>
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
  }, [branches, isEditMode, formData.branchId, details]);

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
    // Fetch next slip number specific to Sales Return entry type with retry logic
    const fetchSlipNumber = async (retryCount = 0) => {
      try {
        // First try to wake up database
        if (retryCount === 0) {
          try {
            await fetch("/api/db/wake");
            console.log("Database wake-up initiated for sales return form");
          } catch (wakeError) {
            console.log("Database wake-up failed, continuing with slip fetch");
          }
        }

        const response = await fetch(
          "/api/purchases/next-slip?entry_type=SALE_RETURN"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Next slip number response for Sales Return:", data);
        const nextSlip = data.nextSlipNo || "1";
        console.log(
          `✅ Fetched next slip number for Sales Return: ${nextSlip}`
        );
        setFormData((prev) => ({ ...prev, slipNo: nextSlip }));
      } catch (err: any) {
        console.error(
          `Error fetching next slip number for Sales Return (attempt ${
            retryCount + 1
          }):`,
          err
        );

        if (retryCount < 2) {
          // Retry after delay
          setTimeout(
            () => fetchSlipNumber(retryCount + 1),
            (retryCount + 1) * 1000
          );
        } else {
          // Generate a timestamp-based slip number as fallback
          const fallbackSlip = Date.now().toString().slice(-6);
          console.log(
            `Using fallback slip number for Sales Return: ${fallbackSlip}`
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
      .then((data: any) => {
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

    const now = getPKTDateTime();
    setFormData((prev) => ({
      ...prev,
      slipInTime: now,
      creationDate: now,
      lastUpdatedDate: now,
      slipDate: now,
      returnDate: now,
    }));
  }, []);

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
  setSelectedForm("sales-return"); // Mark as active
  const urlParams = new URLSearchParams(window.location.search);
  const typeMode = urlParams.get("type") || "offline";
  const targetUrl = `/sales-return?type=${typeMode}`;
  sessionStorage.removeItem("salereturnFormEditMode");
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

    console.log("First weight captured:", weightData.weight);

    // 3️⃣ Capture first weight image if slip number exists
    if (formData.slipNo) {
      try {
        console.log("Capturing first weight image for slip:", formData.slipNo);

        // Add a flag "update: true" to indicate this should overwrite existing image
        const captureResponse = await fetch("/api/capture/first-weight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slipNo: formData.slipNo,
            cameraIp: "10.10.10.146",
            cameraPort: 554,
            entryType: formData.entryType || "SALE_RETURN",
            update: true, // <-- tells backend to overwrite if image exists
          }),
        });

       if (captureResponse.ok) {
  const captureData = await captureResponse.json();
  console.log("Success:", captureData);
} else {
  const errorData = await captureResponse.json();
  console.error("Backend Error:", errorData);
}
      } catch (imageError) {
        console.error("Error capturing/updating first weight image:", imageError);
      }
    }
  } catch (error) {
    console.error("Error fetching weight data:", error);
    alert("Failed to capture first weight reading");
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

    console.log("Second weight captured:", weightData.weight);

    // 3️⃣ Capture second weight image if slip number exists
    if (formData.slipNo) {
      try {
        console.log("Capturing second weight image for slip:", formData.slipNo);

        // Add `update: true` same as first weight
        const captureResponse = await fetch("/api/capture/second-weight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slipNo: formData.slipNo,
            cameraIp: "10.10.10.146",
            cameraPort: 554,
            entryType: formData.entryType || "SALE_RETURN",
            update: true, // <-- ensure old image deleted
          }),
        });

        if (captureResponse.ok) {
          const captureData = await captureResponse.json();
          console.log("Second weight image captured successfully:", captureData.message);
        } else {
          const errorData = await captureResponse.json();
          console.error("Backend Error:", errorData);
        }

      } catch (imageError) {
        console.error("Error capturing/updating second weight image:", imageError);
      }
    }

  } catch (error) {
    console.error("Error fetching weight data:", error);
    alert("Failed to capture second weight reading");
  }
};






// Fetch data from DB by wbId
const fetchDataForIGP = async (wbId: number) => {
  try {
    const response = await fetch(`/api/sales-return/${wbId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for wbId: ${wbId}`);
    }
    const data = await response.json();
    return data; // Raw data from DB
  } catch (error: any) {
    console.error("Error fetching data for IGP:", error);
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


  const handleSave = async () => {
  setLoading(true);

  // Validate first weight
  if (!formData.firstWeight || parseFloat(formData.firstWeight) <= 0) {
    alert("First weight is required and must be greater than 0");
    setLoading(false);
    return;
  }

  // Ensure customerId is synced
  if (
    (!formData.customerId || formData.customerId === "") &&
    (details[0]?.customerId || details[0]?.customer_id)
  ) {
    setFormData((prev) => ({
      ...prev,
      customerId: details[0]?.customerId || details[0]?.customer_id,
    }));
  }

  console.log("🔥 Before save:", {
    formDataCustomerId: formData.customerId,
    firstRowCustomerId: details[0]?.customerId,
    firstRowCustomer_id: details[0]?.customer_id,
  });

  // Vehicle number resolve
  let finalVehicleNo =
    details.find((r) => r.vehicleNo?.trim())?.vehicleNo?.trim() ||
    formData.vehicleNo?.trim() ||
    "";
  if (!finalVehicleNo) {
    alert("Vehicle number is required");
    setLoading(false);
    return;
  }

  // // Weight diff check
  // if (
  //   formData.firstWeight &&
  //   formData.secondWeight &&
  //   parseFloat(formData.firstWeight) > 0 &&
  //   parseFloat(formData.secondWeight) > 0
  // ) {
  //   if (Math.abs(totalWeightDiff) > 500) {
  //     alert(
  //       `Total Weight Difference (${totalWeightDiff.toFixed(
  //         2
  //       )}) is outside acceptable range of ±30. Entry cannot be saved.`
  //     );
  //     setLoading(false);
  //     return;
  //   }
  // }

  try {
    // PKT Date-times
    let slipInTime = formData.slipInTime || getPKTDateTime();
    let slipOutTime =
      isEditMode && formData.secondWeight
        ? getPKTDateTime()
        : formData.slipOutTime || null;

    // Master Payload
    const masterPayload = {
      slip_no: formData.slipNo || null,
      slip_in_time: slipInTime,
      slip_out_time: slipOutTime,
      first_weight: parseFloat(formData.firstWeight),
      second_weight: formData.secondWeight
        ? parseFloat(formData.secondWeight)
        : null,
      net_weight: formData.netWeight ? parseFloat(formData.netWeight) : null,
      bardana_weight: formData.bardanaWeight
        ? parseFloat(formData.bardanaWeight)
        : null,
      gross_weight: formData.grossWeight
        ? parseFloat(formData.grossWeight)
        : null,
      freight: formData.freight ? parseFloat(formData.freight) : null,
      remarks: formData.remarks || null,
      driver_name: formData.driverName || null,
      company_id: formData.companyId ? parseInt(formData.companyId, 10) : null,
      branch_id: formData.branchId ? parseInt(formData.branchId, 10) : null,
      online_entry: formData.onlineEntry === "Yes" ? "Yes" : null,
      offline_entry: formData.offlineEntry === "Yes" ? "Yes" : null,
      created_by: user?.userid || null,
      creation_date: getPKTDateTime(),
      last_updated_by: user?.userid || null,
      last_updated_date: getPKTDateTime(),
      manual_dc_no: formData.manualDcNo || null,
      status: onlineMode ? "ONLINE" : "OFFLINE",
      slip_date: getPKTDateTime(),
      return_reason: formData.returnReason || null,
      return_date: formData.returnDate ? getPKTDateTime() : null,
      original_slip_no: formData.originalSlipNo || null,
      customer_name:
        formData.customerName && formData.customerName.trim() !== ""
          ? formData.customerName
          : details[0]?.customerName || details[0]?.customer_name || null,
      customer_id:
        formData.customerId && formData.customerId !== ""
          ? formData.customerId
          : null,
      vehicle_no: finalVehicleNo,
        // ✅ ADD THIS LINE - Second weight by (only if second weight exists)
  second_weight_by: formData.secondWeight && parseFloat(formData.secondWeight) > 0 
    ? (user?.userid ? parseInt(user.userid.toString()) : null)
    : null,

    };

    // Filter non-empty rows
    const nonEmptyRows = details.filter(
      (r) =>
        r.dcNo ||
        r.doNo ||
        r.customerName ||
        r.vehicleNo ||
        r.itemDescription ||
        r.dcQty ||
        r.doQty
    );

    // Log items
    nonEmptyRows.forEach((item, index) => {
      console.log(
        `🧾 Item ${index + 1}: ${item.itemDescription || "Unnamed"} | Customer ID:`,
        item.customerId || formData.customerId || null
      );
    });

    // Save master + items
    const endpoint = isEditMode
      ? `/api/sales-return/update/${editingWbId}`
      : "/api/sales-return/save";
    const method = isEditMode ? "PUT" : "POST";

    console.log("📤 Sending SALE_RETURN payload to API:", {
      master: masterPayload,
      details: nonEmptyRows,
    });

        
const totalFeedBags = nonEmptyRows.reduce((sum, row) => {
  const val = parseFloat(row.dcQty ?? "0"); // ⚡ undefined/null ko "0" treat karo
  return sum + (isNaN(val) ? 0 : val);      // ⚡ NaN ko 0 treat karo
}, 0);



    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        master: masterPayload,
        details: nonEmptyRows.map((item) => ({
          ...item,
          customerId: item.customerId || formData.customerId || null,
          item_code: item.itemCode || item.item_code || null,
          // 🆕 Add item_id for DB save
          item_id: item.item_id || item.id || null,
           branch_id: formData.branchId ? parseInt(formData.branchId, 10) : null, // ✅ NEW
           total_weight_diff:
    formData.firstWeight && formData.secondWeight
      ? parseFloat(formData.firstWeight) - parseFloat(formData.secondWeight)
      : null, // ✅ NEW FIELD for DB
       weight_per_bags: formData.weightPerBags
    ? parseFloat(formData.weightPerBags)
    : null,  // ✅ send weightPerBags to backend
      created_by: user?.userid || null,        // ✅ NEW
  last_updated_by: user?.userid || null,   // ✅ NEW
   // ⭐ ADD THIS (now works — because declared above)
  total_feed_bags: totalFeedBags || null,
     // ⭐ NEW: freight_child taken from MASTER.freight
      freight_child: formData.freight ? parseFloat(formData.freight) : 0,
        })),
      }),
    });

    if (!response.ok) throw new Error(await response.text());
    const result = await response.json();
    const savedWbId = result.wb_id;



           setFormData(prev => ({
    ...prev,
    isFirstWeightSaved: !!formData.firstWeight,
  }));

    setFormData(prev => ({
    ...prev,
    isSecondWeightSaved: !!formData.secondWeight,
  }));


    console.log("✅ Data saved successfully in local DB with WB_ID:", savedWbId);

    // -----------------------
    // ✅ IGP API call for edit mode + second weight + online entry
    if (
      isEditMode &&
      formData.secondWeight &&
      parseFloat(formData.secondWeight) > 0 &&
      formData.onlineEntry === "Yes"
    ) {
      const dbData = await fetchDataForIGP(Number(formData.wbId));

      if (!dbData) {
        console.error("❌ DB data not available, skipping IGP API call.");
      } else {
        try {
          console.log("🚀 IGP API payload:", dbData);

          const igpResp = await fetch(
            "http://portal.sabirsgroup.com:8184/ords/sabroso_ords/wb/wb-update-on-igp",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(dbData),
            }
          );

          console.log("📡 IGP API HTTP status:", igpResp.status, igpResp.statusText);

          const rawText = await igpResp.text();
          console.log("📄 IGP API raw response:", rawText);

          let igpData = null;
          try {
            igpData = JSON.parse(rawText);
            console.log("✅ IGP API parsed JSON response:", igpData);
          } catch (jsonErr) {
            console.error("❌ Failed to parse IGP API JSON:", jsonErr);
          }

          if (igpResp.ok && igpData) {
            if (
              igpData.status?.toLowerCase() === "success" ||
              Array.isArray(igpData.items)
            ) {
              console.log("✅ SALE_RETURN IGP Data Uploaded Successfully:", igpData);
            } else {
              console.error("❌ SALE_RETURN IGP Upload Failed:", igpData);
            }
          } else if (!igpResp.ok) {
            console.error("❌ IGP API HTTP error, check server logs");
          }
        } catch (err) {
          console.error("🛑 SALE_RETURN IGP API Error:", err);
        }
      }
    } else {
      console.log(
        "⚙️ Skipping IGP API — not edit mode, missing second weight, or offline entry"
      );
    }

    // -----------------------
    // ✅ Show popup FIRST
    alert(
      isEditMode
        ? "Sales return updated successfully!"
        : "Sales return saved successfully!"
    );

    // -----------------------
    // Auto-print AFTER popup
try {
  // ✅ Use unified form-report API instead of sales-return
  const slipResponse = await fetch(`/api/form-report/${savedWbId}`);
  if (!slipResponse.ok) throw new Error("Failed to fetch sales return slip");
  
  const slipData = await slipResponse.json();
  
  // ✅ Check if API returned success
  if (!slipData.success) {
    throw new Error(slipData.message || "API returned error");
  }
  
  // ✅ Extract data from the correct structure
  const reportData = slipData.data;
  
  // ✅ Build master object
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
    ...reportData
  };
  
  // ✅ Get details array
  const details = Array.isArray(reportData.details) ? reportData.details : [];
  
  // ✅ Debug (optional)
  console.log("SALES RETURN DATA:", master);
  
  autoPrintSlip(
    master,
    details,
    user?.userName || "admin"
  );
  
} catch (err) {
  console.error("Auto-print error:", err);
}

    console.log("🧩 Edit mode status:", isEditMode);
    console.log("🧩 Second weight value:", formData.secondWeight);

    // -----------------------
    // ✅ Capture images BEFORE reset
    // if (formData.firstWeight && !formData.secondWeight) {
    //   try {
    //     console.log("Capturing first weight image for slip:", formData.slipNo);
    //     await fetch("/api/capture/first-weight", {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify({
    //         slipNo: formData.slipNo,
    //         cameraIp: "10.10.10.146",
    //         cameraPort: 554,
    //         entryType: formData.entryType || "SALE_RETURN",
    //       }),
    //     });
    //   } catch (err) {
    //     console.log("First weight image capture error:", err);
    //   }
    // }

    // if (formData.firstWeight && formData.secondWeight) {
    //   try {
    //     console.log("Capturing second weight image for slip:", formData.slipNo);
    //     await fetch("/api/capture/second-weight", {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify({
    //         slipNo: formData.slipNo,
    //         cameraIp: "10.10.10.146",
    //         cameraPort: 554,
    //         entryType: formData.entryType || "SALE_RETURN",
    //       }),
    //     });
    //   } catch (err) {
    //     console.log("Second weight image capture error:", err);
    //   }
    // }

    // -----------------------
    // Refresh and reset form
    const refreshIfSecondWeight = () => {
      if (formData.secondWeight && parseFloat(formData.secondWeight) > 0) {
        setTimeout(() => window.location.reload(), 1000);
      }
    };

    await resetFormToInitial();
    refreshIfSecondWeight();

    if (isEditMode) {
      setIsEditMode(false);
      setEditingWbId(null);
      sessionStorage.removeItem("salesReturnEditMode");
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.delete("edit");
      const newUrl = urlParams.toString()
        ? `${window.location.pathname}?${urlParams.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  } catch (error: any) {
    console.error(`Error ${isEditMode ? "updating" : "saving"} sales return:`, error);
    alert(`Failed to ${isEditMode ? "update" : "save"} sales return: ${error.message}`);
  } finally {
    setLoading(false);
  }

 async function autoPrintSlip(
  master: any,
  details: any[],
  currentUserName: string,
) {
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

  function formatPKTDateTime(dateStr: string | Date | null | undefined): string {
    if (!dateStr) return "";
    const date = new Date(
      new Date(dateStr).toLocaleString("en-US", {
        timeZone: "Asia/Karachi",
      })
    );
    if (isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const months = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEPT", "OCT", "NOV", "DEC",
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

  const formatFreightWithCommas = (value: string | number) => {
    if (!value) return "";
    const stringValue = value.toString();
    const cleanValue = stringValue.replace(/[^\d.]/g, "");
    const parts = cleanValue.split(".");
    let integerPart = parts[0];
    const decimalPart = parts[1];
    if (integerPart.length > 3) {
      const rightPart = integerPart.slice(-3);
      let leftPart = integerPart.slice(0, -3);
      const leftPartFormatted = leftPart.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
      integerPart = leftPartFormatted + "," + rightPart;
    }
    return decimalPart !== undefined ? integerPart + "." + decimalPart : integerPart;
  };

  const nonEmptyRows = details.filter(
    (row) =>
      row.dcno ||
      row.dc_no ||
      row.dcNo ||
      row.igp_no ||
      row.dono ||
      row.do_no ||
      row.customername ||
      row.customer_name ||
      row.vehicleno ||
      row.vehicle_no ||
      row.itemdescription ||
      row.item_desc ||
      row.dcqty ||
      row.dc_qty ||
      row.doqty ||
      row.do_qty
  );

  let apiData = null;

  // ✅ UPDATED: Use unified form-report API
  if (master.wb_id) {
    try {
      const response = await fetch(`/api/form-report/${master.wb_id}`);
      const result = await response.json();

      // ✅ Changed from result.master to result.data
      if (result.success && result.data) {
        apiData = result.data;

        console.log("Auto Print - API Data:", {
          created_by_name: apiData.created_by_name,
          second_weight_by_name: apiData.second_weight_by_name,
          second_weight_by: apiData.second_weight_by
        });
      }
    } catch (error) {
      console.error("Error fetching API data for auto print:", error);
    }
  }

  // ✅ Get names from API or fallback to master/formData
  const weightByName = apiData?.created_by_name || master.created_by_name || currentUserName || "WRONG";
  
  // ✅ Only show second weight by if BOTH conditions are true
  const hasSecondWeight = (apiData?.second_weight || master.second_weight) && 
                          parseFloat(apiData?.second_weight || master.second_weight) > 0;
  const hasSecondWeightBy = apiData?.second_weight_by || master.second_weight_by;
  
  let secondWeightByName = "";
  
  if (hasSecondWeight && hasSecondWeightBy) {
    secondWeightByName = apiData?.second_weight_by_name || 
                         master.second_weight_by_name || 
                         "Not recorded";
  } else {
    secondWeightByName = "";
  }

  // Auto-print after successful save
  setTimeout(() => {
    try {
      const printHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Weighbridge Slip</title>
  <style>
    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 12px;
      margin: 20px;
      font-weight: 700;
    }

    .container {
      border: 1px solid black;
      padding: 20px;
      height: 1122px;
      box-sizing: border-box;
    }

    .title {
      text-align: center;
      font-weight: 900;
      margin-bottom: 6px;
      font-size: 18px;
    }

    .copy-label-right {
      text-align: right;
      font-weight: 900;
      margin-bottom: 4px;
    }
    
    .copy-label {
      text-align: left;
      font-weight: 900;
      margin-bottom: 4px;
    }
    
    .print-date {
      text-align: right;
      font-size: 12px;
      font-weight: 900;
    }

    .copy-label-left {
      text-align: left;
      font-size: 18px;
      font-weight: 900;
      margin-bottom: 8px;
    }

    .info-table {
      border-collapse: collapse;
      width: 100%;
    }

    .info-table td {
      border-bottom: 1px solid black;
      padding: 4px 8px;
      font-size: 13px;
      line-height: 1.2;
    }

    .label-cell {
      width: 24%;
      font-weight: 900;
      font-size: 13px;
    }

    .value-cell {
      width: 37%;
      font-weight: 900;
      font-size: 14px;
    }
    
    .slip-no-value {
      font-weight: 900 !important;
      font-size: 24px !important;
    }

    .image-cell {
      width: 30%;
      border-left: 1px solid black;
      text-align: center;
    }

    .image-box-tall {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid black;
      overflow: hidden;
    }

    .image-box-tall img {
      max-height: 100%;
      max-width: 100%;
      object-fit: contain;
    }

    .center-box {
      border: 1px solid black;
      text-align: center;
      font-weight: 900;
      width: 100%;
      height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      box-sizing: border-box;
      padding: 8px 10px;
    }

    .truck-label {
      font-weight: 700;
      font-size: 13px;
      border-bottom: 1px solid black;
      margin-bottom: 5px;
      padding-bottom: 2px;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }

    .table th, .table td {
      border: 1px solid black;
      padding: 6px;
      text-align: left;
      font-weight: 900;
      font-size: 13px;
    }

    .table th {
      font-weight: 900;
      background-color: #f0f0f0;
    }

    .signatures {
      display: flex;
      font-weight: 900;
      justify-content: space-between;
      margin-top: 40px;
    }

    .signature-block {
      flex: 1;
      font-size: 13px;
      font-weight: 900;
    }

    .signature-label {
      display: inline-block;
      font-weight: 900;
    }

    .signature-line {
      display: inline-block;
      border-bottom: 1px solid black;
      width: 140px;
      position: relative;
    }

    .signature-name {
      font-size: 12px;
      font-weight: 900 !important;
      color: #000;
      position: absolute;
      top: -14px;
      left: 50%;
      transform: translateX(-50%);
      white-space: nowrap;
    }

    .signature-container {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .totals {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
      font-weight: 900;
      font-size: 14px;
    }

    .totals.right-only {
      justify-content: flex-end;
    }

    hr.dashed {
      border: 1px dashed #aaa;
      margin: 30px 0;
    }

    .vehicle-no {
      font-weight: 900;
      font-size: 18px;
    }

    .label, .value {
      font-weight: 900;
    }
    
    .value-cell,
    .value-cell span,
    .info-table .value-cell,
    .center-box .vehicle-no,
    .totals .value,
    .totals div,
    .table td,
    .net-weight-value {
      font-weight: 900 !important;
    }
    
    .info-table td:not(.label-cell) {
      font-weight: 900 !important;
      font-size: 14px !important;
    }
    
    .net-weight {
      font-weight: 900 !important;
      font-size: 15px !important;
    }
    
    .totals div:last-child {
      font-weight: 900 !important;
      font-size: 15px !important;
    }
    
    * {
      font-weight: 700 !important;
    }
    
    .title,
    .copy-label-right,
    .copy-label,
    .copy-label-left,
    .label-cell,
    .value-cell,
    .table th,
    .signatures,
    .signature-label,
    .signature-name,
    .totals,
    .vehicle-no,
    .slip-no-value,
    .table td {
      font-weight: 900 !important;
    }
    
    .center-box {
      font-weight: 900 !important;
    }
  </style>
</head>

<body>

<div class="container">
<div class="print-date">Print Date: ${currentDate} ${currentTime}</div>
  <div class="title">Multan Feed (PVT.) LTD.</div>
  <div style="display: flex; justify-content: space-between;">
    <div class="copy-label-left">Sale Return</div>
    <div class="copy-label-right">Office Copy</div>
  </div>

  <div style="display: flex; justify-content: space-between; border: 1px solid black; border-left: 1px solid black;">
    <table class="info-table" style="width: 33.33%; border-right: 1px solid black;">
      <tr>
        <td class="label-cell">Slip No:</td>
        <td class="value-cell">
          <span class="slip-no-value">
            ${apiData?.slip_no || master.slip_no || formData.slipNo}
          </span>
        </td>
        <td class="image-cell" rowspan="3">
          <div class="image-box-tall">
            <img src="/captured_images/first_weight/slip_${master.slip_no || formData.slipNo}_${master.entry_type || "sale"}.jpg"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" 
                 alt="First Weight Image" />
            <div style="display: none; font-size: 8px; color: #666;">No Img</div>
          </div>
        </td>
      </tr>
      <tr>
        <td class="label-cell">Time In:</td>
        <td class="value-cell">${apiData?.slip_in_time ? formatPKTDateTime(apiData.slip_in_time) : (master.slip_in_time ? formatPKTDateTime(master.slip_in_time) : "-")}</td>
      </tr>
      <tr>
        <td class="label-cell">Time Out:</td>
        <td class="value-cell">${apiData?.slip_out_time ? formatPKTDateTime(apiData.slip_out_time) : (master.slip_out_time ? formatPKTDateTime(master.slip_out_time) : "-")}</td>
      </tr>
    </table>

    <div class="center-wrapper" style="width: 33.33%; display: flex; align-items: center; justify-content: center;">
      <div class="center-box">
        <div class="truck-label">Truck #</div>
        <span class="vehicle-no">${apiData?.vehicle_no || master.vehicle_no || "-"}</span>
      </div>
    </div>

    <table class="info-table" style="width: 33.33%; border-right: 1px solid black;">
      <tr>
        <td class="label-cell">Tare Weight:</td>
        <td class="value-cell"><strong>${apiData?.first_weight || master.first_weight}</strong></td>
        <td class="image-cell" rowspan="3">
          <div class="image-box-tall">
            <img src="/captured_images/second_weight/slip_${master.slip_no || formData.slipNo}_${master.entry_type || "sale"}.jpg"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" 
                 alt="Second Weight Image" />
            <div style="display: none; font-size: 8px; color: #666;">No Img</div>
          </div>
        </td>
      </tr>
      <tr>
        <td class="label-cell">Loaded Weight:</td>
        <td class="value-cell"><strong>${apiData?.second_weight || master.second_weight}</strong></td>
      </tr>
      <tr>
        <td class="label-cell">Net Weight:</td>
        <td class="value-cell net-weight"><strong>${Math.abs(parseFloat(apiData?.net_weight || master.net_weight))}</strong></td>
      </tr>
    </table>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>SR #</th>
        <th>Party Name</th>
        <th>Feed #</th>
        <th>Feed Name</th>
        <th>Qty</th>
      </tr>
    </thead>
    <tbody>
      ${nonEmptyRows.map((row, idx) => `
        <tr>
          <td><strong>${idx + 1}</strong></td>
          <td><strong>${row.customer_name || row.customerName}</strong></td>
          <td><strong>${row.item_code || row.itemCode}</strong></td>
          <td><strong>${row.item_desc || row.itemDescription}</strong></td>
          <td><strong>${row.dc_qty || row.dcQty}</strong></td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <div class="totals">
    <div><strong>Freight Payment:</strong> <strong>${formatFreightWithCommas(apiData?.freight || master.freight || "")}</strong></div>
    <div><strong>Grand Total:</strong> <strong>${nonEmptyRows.reduce((acc, row) => acc + (parseFloat(row.dc_qty || row.dcQty) || 0), 0)}</strong></div>
  </div>

 <div class="signatures">
    <div class="signature-block" style="text-align: left;">
      <div class="signature-container">
        <span class="signature-label">Weight By:</span>
        <span class="signature-line">
          <span class="signature-name"><strong>${weightByName}</strong></span>
        </span>
      </div>
    </div>
    <div class="signature-block" style="text-align: center;">
      <div class="signature-container">
        <span class="signature-label">Second Weight By:</span>
        <span class="signature-line">
          <span class="signature-name"><strong>${secondWeightByName}</strong></span>
        </span>
      </div>
    </div>
    <div class="signature-block" style="text-align: right;">
      <div class="signature-container">
        <span class="signature-label">Checked By:</span>
        <span class="signature-line">
          <span class="signature-name"></span>
        </span>
      </div>
    </div>
    <div class="signature-block" style="text-align: right;">
      <div class="signature-container">
        <span class="signature-label">Production Manager:</span>
        <span class="signature-line">
          <span class="signature-name"></span>
        </span>
      </div>
    </div>
  </div>

  <hr class="dashed" />

  <!-- CUSTOMER COPY -->
  <div class="print-date">Print Date: ${currentDate} ${currentTime}</div>
  <div class="title">Multan Feed (PVT.) LTD.</div>
  <div style="display: flex; justify-content: space-between;">
    <div class="copy-label-left">Sale Return</div>
    <div class="copy-label-right">Customer Copy</div>
  </div>

  <div style="display: flex; justify-content: space-between; border: 1px solid black; border-left: 1px solid black;">
    <table class="info-table" style="width: 33.33%; border-right: 1px solid black;">
      <tr>
        <td class="label-cell">Slip No:</td>
        <td class="value-cell">
          <span class="slip-no-value">
            ${apiData?.slip_no || master.slip_no || formData.slipNo}
          </span>
        </td>
      </tr>
      <tr>
        <td class="label-cell">Time In:</td>
        <td class="value-cell">${apiData?.slip_in_time ? formatPKTDateTime(apiData.slip_in_time) : (master.slip_in_time ? formatPKTDateTime(master.slip_in_time) : "-")}</td>
      </tr>
      <tr>
        <td class="label-cell">Time Out:</td>
        <td class="value-cell">${apiData?.slip_out_time ? formatPKTDateTime(apiData.slip_out_time) : (master.slip_out_time ? formatPKTDateTime(master.slip_out_time) : "-")}</td>
      </tr>
    </table>

    <div class="center-wrapper" style="width: 33.33%; display: flex; align-items: center; justify-content: center;">
      <div class="center-box">
        <div class="truck-label">Truck #</div>
        <span class="vehicle-no">${apiData?.vehicle_no || master.vehicle_no || "-"}</span>
      </div>
    </div>

    <table class="info-table" style="width: 33.33%; border-right: 1px solid black;">
      <tr>
        <td class="label-cell">Tare Weight:</td>
        <td class="value-cell"><strong>${apiData?.first_weight || master.first_weight}</strong></td>
      </tr>
      <tr>
        <td class="label-cell">Loaded Weight:</td>
        <td class="value-cell"><strong>${apiData?.second_weight || master.second_weight}</strong></td>
      </tr>
      <tr>
        <td class="label-cell">Net Weight:</td>
        <td class="value-cell net-weight"><strong>${Math.abs(parseFloat(apiData?.net_weight || master.net_weight))}</strong></td>
      </tr>
    </table>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>SR #</th>
        <th>Party Name</th>
        <th>Feed #</th>
        <th>Feed Name</th>
        <th>Qty</th>
      </tr>
    </thead>
    <tbody>
      ${nonEmptyRows.map((row, idx) => `
        <tr>
          <td><strong>${idx + 1}</strong></td>
          <td><strong>${row.customer_name || row.customerName}</strong></td>
          <td><strong>${row.item_code || row.itemCode}</strong></td>
          <td><strong>${row.item_desc || row.itemDescription}</strong></td>
          <td><strong>${row.dc_qty || row.dcQty}</strong></td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <div class="totals">
    <div><strong>Freight Payment:</strong> <strong>${formatFreightWithCommas(apiData?.freight || master.freight || "")}</strong></div>
    <div><strong>Grand Total:</strong> <strong>${nonEmptyRows.reduce((acc, row) => acc + (parseFloat(row.dc_qty || row.dcQty) || 0), 0)}</strong></div>
  </div>

 <div class="signatures">
    <div class="signature-block" style="text-align: left;">
      <div class="signature-container">
        <span class="signature-label">Weight By:</span>
        <span class="signature-line">
          <span class="signature-name"><strong>${weightByName}</strong></span>
        </span>
      </div>
    </div>
    <div class="signature-block" style="text-align: center;">
      <div class="signature-container">
        <span class="signature-label">Second Weight By:</span>
        <span class="signature-line">
          <span class="signature-name"><strong>${secondWeightByName}</strong></span>
        </span>
      </div>
    </div>
    <div class="signature-block" style="text-align: right;">
      <div class="signature-container">
        <span class="signature-label">Checked By:</span>
        <span class="signature-line">
          <span class="signature-name"></span>
        </span>
      </div>
    </div>
    <div class="signature-block" style="text-align: right;">
      <div class="signature-container">
        <span class="signature-label">Production Manager:</span>
        <span class="signature-line">
          <span class="signature-name"></span>
        </span>
      </div>
    </div>
  </div>

</div>

</body>
</html>
`;
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(printHTML);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (printError) {
      console.error("Auto-print error:", printError);
    }
  }, 1000);
}
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


  // vehicle no in offline entry auto generate slip (SALE_RETURN)
  useEffect(() => {
    if (
      formData.offlineEntry === "Yes" &&
      formData.entryType === "SALE_RETURN"
    ) {
      const firstVehicleNo = details
        .find((row) => row.vehicleNo?.trim())
        ?.vehicleNo?.trim();
      if (firstVehicleNo) {
        setFormData((prev) => ({
          ...prev,
          vehicleNo: firstVehicleNo,
        }));
      }
    }
  }, [details, formData.offlineEntry, formData.entryType]);

  // ✅ Function to load data by wb_id for editing
const loadDataByWbId = async (wbId: number) => {
  console.log(`Loading data for edit mode, wb_id: ${wbId}`);
  setLoading(true);
  setIsEditMode(true);
  setEditingWbId(wbId);

  try {
    const response = await fetch(`/api/sales-return/${wbId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for wbId: ${wbId}`);
    }

    const data = await response.json();

    if (data && data.master) {
      const master = data.master;
      const details = data.details || [];

      // ✅ Format date strings correctly
      master.slipInTime = formatDatetimeLocal(master.slip_in_time);
      master.slipOutTime = formatDatetimeLocal(master.slip_out_time);
      master.slipDate = formatDatetimeLocal(master.slip_date);
      master.returnDate = formatDatetimeLocal(master.return_date);

      // ✅ If master has no customer_id, try to get it from detail rows
      if (!master.customer_id && details.length > 0) {
        master.customer_id =
          details.find((item: any) => item.customer_id)?.customer_id || "";
      }

     // ✅ Set formData
setFormData(prevState => ({
  ...prevState,
  slipNo: master.slip_no || "",
  slipInTime: master.slipInTime || "",
  slipOutTime: master.slipOutTime || "",
  slipDate: master.slipDate || "",
  status: master.status || "",
  entryType: master.entry_type || "SALE_RETURN",
  firstWeight: master.first_weight ? String(master.first_weight) : "",
  secondWeight: master.second_weight ? String(master.second_weight) : "",
  netWeight: master.net_weight ? String(master.net_weight) : "",
  bardanaWeight: master.bardana_weight ? String(master.bardana_weight) : "",
  grossWeight: master.gross_weight ? String(master.gross_weight) : "",
  supplierWeight: master.supplier_weight ? String(master.supplier_weight) : "",
  supplierWeightMinusBardana: master.supplier_weight_minus_bardana
    ? String(master.supplier_weight_minus_bardana)
    : "",
  supplierWeightMinusOutWeight: master.supplier_weight_minus_out_weight
    ? String(master.supplier_weight_minus_out_weight)
    : "",
  qualityDeduction: master.quality_deduction ? String(master.quality_deduction) : "",
  vehicleNo: master.vehicle_no || details[0]?.vehicle_no || "",
  driverName: master.driver_name || "",
  returnReason: master.return_reason || "",
  returnDate: master.returnDate || "",
  originalSlipNo: master.original_slip_no || "",
  customerName: master.customer_name || "",
  customerId: String(master.customer_id || ""),
  wbId: String(master.wb_id) || "",
  companyId: String(master.company_id) || "",
  branchId: String(master.branch_id) || "",
  branch: String(master.branch_id) || "",
  onlineEntry: master.online_entry || "Yes",
  offlineEntry: master.offline_entry || "No",
  createdBy: String(master.created_by) || "",
  creationDate: master.creation_date || "",
  lastUpdatedBy: String(master.last_updated_by) || "",
  lastUpdatedDate: master.last_updated_date || "",
  manualDcNo: master.manual_dc_no || "",
  doId: master.do_id || "",
  doNo: master.do_no || "",
  doDate: master.do_date || "",
  freight: master.freight ? String(master.freight) : "",
  remarks: master.remarks || "",
  igpNo: master.igp_no || "",
  igpDate: master.igp_date || "",
  poNo: master.po_no || "",
  po_no: master.po_no || "",
  itemCode: master.item_code || "",
  itemDesc: master.item_desc || "",
  poQty: master.po_qty || "",
  igpQty: master.igp_qty || "",
  balanceQty: master.balance_qty || "",
  bardanaType: master.bardana_type || "",
  wtPerBag: master.wt_per_bag ? String(master.wt_per_bag) : "",
  noOfBags: master.no_of_bags ? String(master.no_of_bags) : "",
  bagCondition: master.bag_condition || "",
  bardanaTypeId: String(master.bardana_type_id) || "",
  vendor: master.vendor || "",
  vendorName: master.vendor_name || "",
  qualityDed: master.quality_ded || "",
  weight: master.weight || "",
  bags: master.bags || "",
  wbItemPId: String(master.wb_item_p_id) || "",
  itemId: String(master.item_id) || "",
  poId: String(master.po_id) || "",
  baradanaType: master.baradana_type || "",
  manualIgpNo: master.manual_igp_no || "",
  igpId: String(master.igp_id) || "",
  vendorId: String(master.vendor_id) || "",
  weightPerBags: master.weight_per_bags || "",
  dcQty: master.dc_qty || "",
  supWeightWithoutBardana: master.sup_weight_without_bardana || "",
  netSupplierWeight: master.net_supplier_weight || "",
  isPercentageMode: master.is_percentage_mode || false,
 // ✅ ADD THESE FIELDS - Weight by names (for edit mode)
          created_by_name: master.created_by_name || "",
          second_weight_by_name: master.second_weight_by_name || master.created_by_name || "",
          second_weight_by: master.second_weight_by || "",
  // ✅ Added missing fields
  totalFeedBags: master.total_feed_bags || 0,
                                      // ✅ NEW FIELDS FOR BUTTON DISABLE LOGIC
  isFirstWeightSaved: !!master.first_weight,   // true if first weight exists in DB
  isSecondWeightSaved: !!master.second_weight, // true if second weight exists in DB
  
}));




                  // 🔥 Set Save Disable Condition
setDisableSaveButton(
  master.status === "ONLINE" &&     // ⬅️ status check yahan
  !!master.first_weight &&
  !!master.second_weight
);
    

      // ✅ Map sales data correctly (ensure customerId is preserved)
      console.log("Raw sales data from database:", details);

      const mappeddetails = details.map((item: any) => {
        const branchName =
          branches.find(
            (b) =>
              b.branch_id.toString() ===
              (item.branch_id || master.branch_id)?.toString()
          )?.branch_name || "";

        return {
          doId: item.do_id || "",
          dcNo: item.igp_no || "",
          doNo: item.po_no || "",
          customerName: item.customer_name || item.vendor_name || "",
          customerId: item.customer_id || master.customer_id || "",
          vehicleNo: item.vehicle_no || "",
          doDate: item.igp_date || item.do_date || "",
          itemDescription: item.item_desc || "",
          dcQty:
            item.igp_qty || item.dc_qty
              ? String(item.igp_qty || item.dc_qty)
              : "",
          doQty:
            item.po_qty || item.do_qty
              ? String(item.po_qty || item.do_qty)
              : "",
          branch: branchName,
          dcId: item.dc_id || "",
          itemId: item.item_id || "",
          itemCode: item.item_code || "",
        };
      });

      console.log("Mapped sales data:", mappeddetails);

      // ✅ Always keep 8 rows
      const paddeddetails = [...mappeddetails];
      while (paddeddetails.length < 8) {
        paddeddetails.push({
          doId: "",
          dcNo: "",
          doNo: "",
          customerName: "",
          customerId: "",
          vehicleNo: "",
          doDate: "",
          itemDescription: "",
          dcQty: "",
          doQty: "",
          branch: "",
          dcId: "",
          itemId: "",
          itemCode: "",
        });
      }

      setdetails(paddeddetails);
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


  const navigateToFirst = async () => {
    try {
      const response = await fetch("/api/sales-return/first-weight-records");
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

  try {
    while (prevSlip > 0 && !recordFound) {
      const response = await fetch(`/api/sale-return/by-slip/${prevSlip}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.master) {
          await loadDataByWbId(data.master.wb_id);
          setFormData((prev) => ({ ...prev, slipNo: prevSlip.toString() }));
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
    console.error("Error navigating to previous sale-return record:", error);
  }
};

  const navigateToNext = async () => {
    const currentSlip = parseInt(formData.slipNo);
    const nextSlip = currentSlip + 1;
    try {
      const response = await fetch(`/api/sale-return/by-slip/${nextSlip}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.master) {
          await loadDataByWbId(data.master.wb_id);
        }
      } else {
        // If no next record exists, create new entry with next slip number
        resetFormToInitial();
        setFormData((prev) => ({ ...prev, slipNo: nextSlip.toString() }));
      }
    } catch (error) {
      console.error("Error navigating to next record:", error);
    }
  };

  const navigateToLast = async () => {
    try {
      const response = await fetch("/api/sales-return/first-weight-records");
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
                  className="grid border-b border-gray-400 hover:bg-gray-50 text-xs"
                  style={{ gridTemplateColumns: "119px 119px 1fr" }} // Custom widths
                >
                  {/* Slip No */}
                    <button
className="border-r border-gray-400 p-1 text-center text-blue-600 truncate w-full h-14 text-lg font-bold flex items-center justify-center"
                    onClick={() => {
                      console.log("Clicked record:", record);
                      console.log("wb_id:", record.wb_id);
                      console.log("entry_type:", record.entry_type);

                      if (record.wb_id) {
                        const urlParams = new URLSearchParams(
                          window.location.search
                        );
                        const typeMode = urlParams.get("type") || "online";

                        if (record.entry_type === "PURCHASE") {
                          setLocation(
                            `/purchase-form?type=${typeMode}&edit=${record.wb_id}`
                          );
                        } else if (record.entry_type === "PURCHASE_RETURN") {
                          setLocation(
                            `/purchase-return?type=${typeMode}&edit=${record.wb_id}`
                          );
                        } else if (record.entry_type === "SALE") {
                          setLocation(
                            `/sales-form?type=${typeMode}&edit=${record.wb_id}`
                          );
                        } else if (
                          record.entry_type === "SOLDNOTE" ||
                          record.entry_type === "SOLD_NOTE"
                        ) {
                          setLocation(
                            `/sold-note?type=${typeMode}&edit=${record.wb_id}`
                          );
                        } else {
                          // Load the data for editing (sales return entries)
                          urlParams.set("edit", record.wb_id);
                          const newUrl = `${
                            window.location.pathname
                          }?${urlParams.toString()}`;
                          window.history.replaceState({}, "", newUrl);

                          sessionStorage.setItem("salesReturnEditMode", "true");
                          setIsLoadingEditData(true);
                          loadDataByWbId(parseInt(record.wb_id));
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
          EDIT MODE: Sales Return Slip No. {formData.slipNo} (ID: {editingWbId})
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center bg-white border rounded p-1 mb-1">
        <div className="flex gap-1 text-xs">
{/* Purchase */}
<Button
  className="ml-16 h-7 px-1 text-sm font-medium bg-white text-black border border-black hover:bg-gray-100"
  onClick={() => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeMode = urlParams.get("type") || "online";
    const targetUrl = `/purchase-form?type=${typeMode}`;
    window.history.pushState({}, "", targetUrl);
    setLocation(targetUrl);
  }}
>
  Purchase
</Button>

{/* Sale */}
<Button
  className="h-7 px-1 text-sm font-medium bg-white text-black border border-black hover:bg-gray-100"
  onClick={() => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeMode = urlParams.get("type") || "online";
    const targetUrl = `/sales-form?type=${typeMode}`;
    window.history.pushState({}, "", targetUrl);
    setLocation(targetUrl);
  }}
>
  Sale
</Button>

{/* Sales Return */}
<Button
  className={`h-7 px-1 text-sm font-medium border border-black ${
    selectedForm === "sales-return" ? "bg-blue-700 text-white" : "bg-white text-black"
  }`}
  onClick={() => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeMode = urlParams.get("type") || "online";
    const targetUrl = `/sales-return?type=${typeMode}`;
    window.history.pushState({}, "", targetUrl);
    setLocation(targetUrl);
    setSelectedForm("sales-return"); // set active form
  }}
>
  Sales Return
</Button>


{/* Sold Note */}
<Button
  className="h-7 px-1 text-sm font-medium bg-white text-black border border-black hover:bg-gray-100"
  onClick={() => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeMode = urlParams.get("type") || "online";
    const targetUrl = `/sold-note?type=${typeMode}`;
    window.location.href = targetUrl;
  }}
>
  Sold Note
</Button>


          {/* <Button
            className="h-7 px-1 text-sm font-medium bg-gray-300 hover:bg-gray-400 text-black"
            onClick={() => {
              // Navigate to purchase return form with same type
              const urlParams = new URLSearchParams(window.location.search);
              const typeMode = urlParams.get("type") || "online";
              const targetUrl = `/purchase-return?type=${typeMode}`;
              window.history.pushState({}, "", targetUrl);
              setLocation(targetUrl);
            }}
          >
            Purchase Return
          </Button> */}
          {/* <Button
            className="h-7 px-1 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={navigateToFirst}
          >
            First
          </Button> */}
          <Button
            className="h-7 px-1 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium"
            onClick={navigateToPrev}
          >
            Prev
          </Button>
          <Button
            className="h-7 px-1 text-sm bg-cyan-600 hover:bg-cyan-700 text-white font-medium"
            onClick={navigateToNext}
          >
            Next
          </Button>

        
      <div className="flex gap-5">
  <Button
    type="button"
    className="bg-green-600 hover:bg-green-700 h-10 w-40 px-4 text-sm text-white font-medium"
    onClick={() => {
      console.log("🟢 Save button clicked");
      handleSave();
    }}
    disabled={loading || disableSaveButton}
  >
    {loading ? "Saving..." : "Save"}
  </Button>

  <Button
    className="h-7 px-1 text-sm bg-orange-600 hover:bg-orange-700 text-white font-medium"
    onClick={handlePrintReport}
  >
    Print
  </Button>
</div>




  {/* <Button
            className="h-7 px-1 text-sm bg-teal-600 hover:bg-teal-700 text-white font-medium"
            onClick={navigateToLast}
          >
            Last
          </Button> */}

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
             className={`h-7 px-2 text-sm font-medium text-white ${
               onlineMode && formData.firstWeight && formData.secondWeight
                 ? "bg-gray-400 cursor-not-allowed"
                 : "bg-blue-600 hover:bg-blue-700"
             }`}
             onClick={() => handleReject(editingWbId as number)}
           
             disabled={onlineMode && formData.firstWeight && formData.secondWeight}
           >
             Rej
           </Button>
           
          {/* <Button
            className="h-7 px-1 text-sm bg-yellow-500 text-xs"
            onClick={resetForm}
          >
            Clear
          </Button>
          {isEditMode && (
            <Button
              className="h-7 px-1 text-sm bg-gray-500 hover:bg-gray-600 text-white font-medium"
              onClick={cancelEdit}
            >
              Cancel Edit
            </Button>
          )} */}
        </div>
       <div className="flex items-center gap-3">
                {/* Weight Display - bigger and aligned left */}
                <div className="mr-[-5rem] transform scale-150">
                  <WeightIndicator comPort={comPort} compact={true} />
                </div>
      
                {/* Buttons */}
                <div className="flex gap-1 ml-28">
                  {/* <button
                    className={`h-8 px-2 text-sm font-medium rounded transition-colors ${
                      onlineMode === true
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-gray-300 hover:bg-gray-400 text-gray-600"
                    }`}
                    onClick={() => toggleOnlineMode(true)}
                  >
                    ONLINE
                  </button> */}
      
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
      <div className="bg-white p-1 rounded border h-[calc(100vh-60px)] overflow-hidden">
        <div className="grid grid-cols-12 gap-1 h-full">
          {/* Left Side - Main Form (Columns 1-8) */}
          <div className="col-span-8">
            {/* Master Table Section */}
            <div className="bg-gray-300 p-1 rounded border mb-4 w-full">
              <div className="grid grid-cols-9 gap-4">
                {/* Column 1 - Left Form Fields */}
                <div className="col-span-3 flex flex-col gap-2 items-start">
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-black w-20">Slip No</Label>
                    {isSearchMode ? (
                      <div className="flex gap-1 w-32">
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
                          className="h-7 px-1 text-xs bg-green-600 hover:bg-green-700 text-white"
                          disabled={loading}
                        >
                          {loading ? "..." : "Search"}
                        </Button>
                      </div>
                    ) : (
                      <Input
                        name="slipNo"
                        value={formData.slipNo}
                        readOnly
                   className="h-7 text-xs text-black w-32 
           !border !border-gray-400 rounded px-1 
           focus:!border-black"
                      />
                    )}
                  </div>
                  {/* <div className="flex items-center gap-1">
                    <Label className="text-xs text-black w-20">
                      Original Slip No
                    </Label>
                    <Input
                      name="originalSlipNo"
                      value={formData.originalSlipNo}
                      onChange={handleChange}
                      className="h-7 text-xs text-black w-32"
                      placeholder="Original slip"
                    />
                  </div> */}

                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-black w-20">
                      Net Weight
                    </Label>
                    <Input
                      name="netWeight"
                      value={formData.netWeight}
                      onChange={handleChange}
                     className="h-7 text-xs bg-yellow-200 text-black w-32 
           !border !border-gray-400 rounded px-1 
           focus:!border-black"
                    />
                  </div>

                  {/* <div className="flex items-center gap-1">
                    <Label className="text-xs text-black w-20">
                      Vehicle No
                    </Label>
                    <Input
                      name="vehicleNo"
                      value={formData.vehicleNo}
                      onChange={handleChange}
                      className="h-7 text-xs text-black w-32"
                      placeholder="Vehicle number"
                    />
                  </div> */}

                  {/* ✅ Freight field added under Vehicle No */}
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-black w-20">Freight</Label>
                    <Input
                      autoComplete="off"
                     // type="number"
                      name="freight"
                      value={formData.freight}
                      onChange={handleChange}
                     className="h-7 text-xs text-black w-32 
           !border !border-gray-400 rounded px-1 
           focus:!border-black"
                      //placeholder="Enter Freight"
                    />
                  </div>


<div className="flex flex-col gap-1">
                    {/* Driver Name */}
                    <div className="flex items-center gap-1">
                      <Label className="text-xs text-black w-20">
                        Driver Name
                      </Label>
                      <Input
                        autoComplete="off"
                       // placeholder="Enter driver name"
                        name="driverName"
                        value={formData.driverName}
                        onChange={handleChange}
                       className="h-7 text-xs text-black placeholder:text-gray-500 w-32 
           !border !border-gray-400 rounded px-1 
           focus:!border-black"
                      />
                    </div>
                  </div>


                  {/* ✅ Return Reason added under Customer Name */}
                  <div className="col-span-6  mt-4">
                    <Label className="text-xs text-black">Return Reason</Label>
                    <Input
                      autoComplete="off"
                      placeholder="Enter return reason"
                      name="returnReason"
                      value={formData.returnReason}
                      onChange={handleChange}
                     className="text-xs text-black placeholder:text-gray-500 w-[400px] 
           !border !border-gray-400 rounded px-1 
           focus:!border-black"
                    />
                  </div>
                </div>

                {/* Column 2 - Weight Fields */}
                <div className="col-span-3 flex flex-col gap-2 items-start">
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-black w-24">
                      First Weight
                    </Label>
                    <Input
                      autoComplete="off"
                      name="firstWeight"
                      value={formData.firstWeight}
                      onChange={handleChange}
                       readOnly
                      className="h-7 text-xs text-black w-32 
           !border !border-gray-400 rounded px-1 
           focus:!border-black"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-black w-24">
                      Second Weight
                    </Label>
                    <Input
                      autoComplete="off"
                      name="secondWeight"
                      value={formData.secondWeight}
                      onChange={handleChange}
                       readOnly
                     className="h-7 text-xs text-black w-32 
           !border !border-gray-400 rounded px-1 
           focus:!border-black"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-black w-24">
                      Bardana Weight
                    </Label>
                    <Input
                      autoComplete="off"
                      name="bardanaWeight"
                      value={formData.bardanaWeight}
                      onChange={handleChange}
                     className="h-7 text-xs text-black w-32 
           !border !border-gray-400 rounded px-1 
           focus:!border-black"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-black w-24">
                      Gross Weight
                    </Label>
                    <Input
                      autoComplete="off"
                      name="grossWeight"
                      value={formData.grossWeight}
                      readOnly
                     className="h-7 text-xs text-black w-32 
           !border !border-gray-400 rounded px-1 
           focus:!border-black"
                    />
                  </div>

                  {/* ✅ Branch moved here under Gross Weight */}
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-black w-24">Branch</Label>
                    {isEditMode ? (
                      <Input
                        value={
                          branches.find(
                            (b) =>
                              b.branch_id.toString() ===
                              formData.branchId?.toString()
                          )?.branch_name ||
                          formData.branch ||
                          ""
                        }
                        readOnly
                        className="h-7 text-xs text-black bg-gray-100 w-32"
                      />
                    ) : (
                      <Select
                        name="branch"
                        value={formData.branchId} // ✅ yahan hamesha branchId rakho
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            branchId: value, // ✅ backend ke liye id save hogi
                            branch:
                              branches.find(
                                (b) => b.branch_id.toString() === value
                              )?.branch_name || "",
                            // ✅ frontend display ke liye branch name
                          }))
                        }
                      >
                        <SelectTrigger className="h-7 text-xs text-black w-32 
           !border !border-gray-400 rounded px-1 
           focus:!border-black">
                          <SelectValue
                            placeholder="Select branch"
                            className="text-black"
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem
                              key={branch.branch_id}
                              value={branch.branch_id.toString()} // ✅ id hi value hogi
                            >
                              {branch.branch_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {/* ===== COLUMN 3 - DRIVER INFO & CAMERA CONTROLS SECTION ===== */}
                <div className="col-span-3 flex flex-col justify-between">
                  

                  {/* Buttons & Camera Feed */}
                  <div className="flex flex-col gap-1 mt-2">
                    <div className="grid grid-cols-2 gap-1 mb-0">
                                       {/* Slight space below */}
                    <Button
                      className={`h-7 text-xs ${
                        formData.isFirstWeightSaved ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                      }`}
                      onClick={captureFirstWeight}
                     // disabled={formData.isFirstWeightSaved}
                    >
                      1st WHT
                    </Button>
                    
                   {/* 2nd Weight Button */}
<Button
  className={`h-7 text-xs ${
    (!isEditMode && !formData.isFirstWeightSaved) || formData.isSecondWeightSaved
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-green-600 hover:bg-green-700"
  }`}
  onClick={captureSecondWeight}
 // disabled={!isEditMode && !formData.isFirstWeightSaved || formData.isSecondWeightSaved}
>
  2nd WHT
</Button>
                    
                    </div>

                    <div className="h-32 w-full overflow-hidden mb-4 rounded border mt-2">
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

                    <div className="grid grid-cols-2 gap-1 mt-[-1rem]">
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
            </div>

            {/* Large Label Between Sections */}
            <div className="text-center py-1 mb-1 mt-[-1rem]">
              <div
                className={`inline-block px-1 py-1 rounded-lg shadow-md ${
                  onlineMode === true
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                    : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                }`}
              >
                <h2 className="text-xl font-bold tracking-wide">
                  {onlineMode === true
                    ? "Sales Return Online"
                    : "Sales Return Offline"}
                </h2>
              </div>
            </div>

            {/* Sales Return Details Section */}
            <div className="bg-gray-300 p-0.5rem rounded border w-[1000px] ">
              <div className="h-full flex flex-col">
                {/* Sales Table Header - with delete action column */}
                <div
                  className="grid gap-px bg-gray-250 text-xs font-semibold mb-1"
                  style={{
                    gridTemplateColumns:
                      "80px 250px 120px 120px 250px 80px 85px ", // Added extra 100px for DC ID
                    width: "1800px", // adjust width
                  }}
                >
                  <div className="bg-gray-300 p-1 text-center border border-gray-400 text-black">
                    SR #
                  </div>
                  {/* <div className="bg-blue-100 p-1 text-center border border-gray-400 text-black">
      DC ID
    </div> */}
                  {/* <div className="bg-blue-100 p-1 text-center border border-gray-400 text-black">
                    DO #
                  </div> */}
                  <div className="bg-gray-300 p-1 text-center border border-gray-400 text-black">
                    Customer Name
                  </div>
                  <div className="bg-gray-300 p-1 text-center border border-gray-400 text-black">
                    Vehicle No
                  </div>
                  <div className="bg-gray-300 p-1 text-center border border-gray-400 text-black">
                    SR Date
                  </div>
                  <div className="bg-gray-300 p-1 text-center border border-gray-400 text-black">
                    Item Description
                  </div>
                  <div className="bg-gray-300 p-1 text-center border border-gray-400 text-black">
                    SR Qty
                  </div>
                  {/* <div className="bg-blue-100 p-1 text-center border border-gray-400 text-black">
                    DO Qty
                  </div> */}
                  {/* <div className="bg-blue-100 p-1 text-center border border-gray-400 text-black">
                    Branch
                  </div> */}
                  <div className="bg-gray-300 p-1 text-center border border-gray-400 text-black">
                    ✖
                  </div>
                </div>

                {/* Sales Table Body - Fixed height with 8 rows */}
                <div className="bg-gray-200 mb-4" style={{ height: "200px" }}>
                  {[...Array(4)].map((_, index) => (
                    <div
                      key={index}
                      className="grid gap-px text-xs"
                      style={{
                        gridTemplateColumns:
                          "80px 250px 120px 120px 250px 80px 85px ", // adjust for DC ID
                        width: "1800px",
                      }}
                    >
<div className="bg-white border border-gray-300 p-1">
  <input
    type="text"
    className="w-full h-6 text-xs text-black px-1 border-none bg-transparent focus:outline-none"
    value={details[index]?.srNo || ""}
    onChange={(e) => {
      const value = e.target.value;

      setdetails((prev) => {
        const updated = [...prev];

        updated[index] = {
          ...updated[index],
          srNo: value,
          ...(value && !updated[index]?.doDate && {
            doDate: format(new Date(), "yyyy-MM-dd"),
          }),
        };

        return updated;
      });
    }}
  />
</div>

                      {/* DC ID
        <div className="bg-white border border-gray-300 p-1">
          <input
            type="text"
            className="w-full h-6 text-xs text-black px-2 border-none bg-transparent focus:outline-none"
            value={details[index]?.dcId || ""}
            onChange={(e) =>
              handledetailsChange(index, "dcId", e.target.value)
            }
            readOnly={true} // DC ID should be fetched, not editable
            autoComplete="off"
          />
        </div> */}

                      {/* <div className="bg-white border border-gray-300 p-1">
                          <input
                            type="text"
                            className="w-full h-6 text-xs text-black px-1 border-none bg-transparent focus:outline-none"
                            value={details[index]?.doNo || ""}
                            onChange={(e) =>
                              handledetailsChange(
                                index,
                                "doNo",
                                e.target.value,
                              )
                            }
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            data-form-type="other"
                          />
                        </div> */}

{/* Customer Name LOV */}
<div className="bg-white border border-gray-300 p-1 relative">
  {/* ✅ FILTERED CUSTOMERS */}
  {(() => {
   
    return (
      <>
        <input
          type="text"
          className={`w-full h-6 text-xs border-none bg-white text-black cursor-text px-2 ${
            details[index]?.customerId ? "bg-blue-100" : "bg-white"
          }`}
          value={details[index]?.customerName || ""}
          onFocus={() => {
            setFocusedCustomerRowIndex(index);
            setOpenBranchLovRowIndex(null);
            setOpenItemLovRowIndex(null);

            setOpenCustomerLovRowIndex(index);
            setCustomerSearchQuery("");
            setHighlightedCustomerIndex(0);

            setTimeout(() => customerSearchInputRef.current?.focus(), 50);
          }}
          onChange={(e) => {
            const newData = [...details];
            newData[index] = {
              ...newData[index],
              customerName: e.target.value.toUpperCase(),
              customerId: null,
            };
            setdetails(newData);

            setCustomerSearchQuery(e.target.value);
            setOpenCustomerLovRowIndex(index);
            setHighlightedCustomerIndex(0);
          }}
          onKeyDown={(e) => {
            // 🔴 CLEAR SELECTED
            if (details[index]?.customerId && e.key === "Backspace") {
              e.preventDefault();
              const newData = [...details];
              newData[index] = { ...newData[index], customerName: "", customerId: null };
              setdetails(newData);
              return;
            }

            // 🟢 OPEN LOV
            if (
              (e.key === "Enter" || (e.ctrlKey && e.key.toLowerCase() === "l")) &&
              index === focusedCustomerRowIndex
            ) {
              e.preventDefault();
              setOpenCustomerLovRowIndex(index);
              setCustomerSearchQuery(details[index]?.customerName || "");
              setHighlightedCustomerIndex(0);
              setTimeout(() => customerSearchInputRef.current?.focus(), 0);
            }

            if (e.key === "Escape") {
              setOpenCustomerLovRowIndex(null);
              setHighlightedCustomerIndex(-1);
            }
          }}
        />

        {/* 🔽 DROPDOWN */}
        {openCustomerLovRowIndex === index && (
          <div
            ref={customerLovRef}
            className="absolute z-50 bg-white border border-gray-300 mt-1 w-full shadow-md max-h-48 overflow-y-auto"
          >
            {/* 🔍 SEARCH INPUT (MAIN FIX HERE) */}
            <input
              ref={customerSearchInputRef}
              type="text"
              placeholder="Search customers..."
              value={customerSearchQuery}
              onChange={(e) => setCustomerSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (!filteredCustomers.length) return;

                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlightedCustomerIndex((prev) =>
                    prev >= filteredCustomers.length - 1 ? 0 : prev + 1
                  );
                }

                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlightedCustomerIndex((prev) =>
                    prev <= 0 ? filteredCustomers.length - 1 : prev - 1
                  );
                }

                // ✅ ENTER SELECT
                if (e.key === "Enter") {
                  e.preventDefault();

                  const safeIndex =
                    highlightedCustomerIndex >= 0 &&
                    highlightedCustomerIndex < filteredCustomers.length
                      ? highlightedCustomerIndex
                      : 0;

                  const selected = filteredCustomers[safeIndex];

                  if (selected) {
                    const customerId = selected.customer_id || selected.id;
                    const customerName = selected.name || selected.customer_name;

                    const newDetails = [...details];
                    newDetails[index] = {
                      ...newDetails[index],
                      customerName,
                      customerId,
                    };

                    setdetails(newDetails);

                    setTimeout(() => {
                      setOpenCustomerLovRowIndex(null);
                      setCustomerSearchQuery("");
                    }, 0);
                  }
                }

                if (e.key === "Escape") {
                  setOpenCustomerLovRowIndex(null);
                  setHighlightedCustomerIndex(-1);
                }
              }}
              className="h-7 w-full text-black text-sm border border-gray-300 px-2 m-1 rounded"
              autoFocus
            />

            {/* 📋 LIST */}
            <div>
              {filteredCustomers.map((customer, i) => {
                const customerId = customer.customer_id || customer.id;
                const customerName = customer.name || customer.customer_name;

                return (
                  <div
                    key={customerId}
                    className={`px-3 py-2 text-xs cursor-pointer ${
                      highlightedCustomerIndex === i
                        ? "bg-blue-500 text-white"
                        : "hover:bg-blue-100 text-black"
                    }`}
                    onMouseEnter={() => setHighlightedCustomerIndex(i)}
                    onClick={() => {
                      const newDetails = [...details];
                      newDetails[index] = {
                        ...newDetails[index],
                        customerName,
                        customerId,
                      };
                      setdetails(newDetails);
                      setOpenCustomerLovRowIndex(null);
                      setCustomerSearchQuery("");
                    }}
                  >
                    <div className="font-medium">{customerName}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </>
    );
  })()}
</div>





                      <div className="bg-white border border-gray-300 p-1">
                        <input
                          type="text"
                          className="w-full h-6 text-xs text-black px-1 border-none bg-transparent focus:outline-none"
                          value={details[index]?.vehicleNo || ""}
                          onChange={(e) =>
                            handledetailsChange(
                              index,
                              "vehicleNo",
                              e.target.value
                            )
                          }
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck="false"
                          data-form-type="other"
                        />
                      </div>

                      <div className="bg-white border border-gray-300 p-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full h-6 text-xs text-left px-1 border-none bg-transparent focus:outline-none flex items-center justify-between text-black">
                              <span className="text-black">
                                {details[index]?.doDate
                                  ? format(
                                      new Date(details[index].doDate),
                                      "dd.MM.yyyy"
                                    )
                                  : ""}{" "}
                                {/* Empty if no date */}
                              </span>
                              {/* Only show calendar icon if date exists */}
                              {details[index]?.doDate && (
                                <CalendarIcon className="h-3 w-3 text-black" />
                              )}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0 bg-white border border-black"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={
                                details[index]?.doDate
                                  ? new Date(details[index].doDate)
                                  : undefined
                              }
                              onSelect={(date) => {
                                if (date) {
                                  handledetailsChange(
                                    index,
                                    "doDate",
                                    format(date, "yyyy-MM-dd")
                                  );
                                }
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

<div className="bg-white border border-gray-300 p-1 relative">
  {/* Trigger field */}
  <div
    className="w-full h-6 text-xs border-none bg-white text-black cursor-text flex items-center px-2"
    tabIndex={0}
    onFocus={() => {
      setFocusedItemRowIndex(index);
      setOpenCustomerLovRowIndex(null);
      setOpenBranchLovRowIndex(null);
    }}
    onClick={() => setFocusedItemRowIndex(index)}
    onKeyDown={(e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        e.stopPropagation();
        setOpenItemLovRowIndex(index);
        setOpenCustomerLovRowIndex(null);
        setOpenBranchLovRowIndex(null);
        setHighlightedItemIndex(0);
        setTimeout(() => itemSearchInputRef.current?.focus(), 0);
      }
    }}
  >
    {/* SHOW ONLY DESCRIPTION IN FIELD; NO PLACEHOLDER */}
    {details[index]?.itemDescription || ""}
  </div>

  {/* Render LOV content only for active row */}
  {openItemLovRowIndex === index && (
    <div
      ref={itemLovRef}
      className="absolute z-50 bg-white border border-gray-300 mt-1 w-full shadow-md"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Search Box */}
      <div className="px-1 py-1 sticky top-0 bg-white z-10">
       <input
  ref={itemSearchInputRef}
  type="text"
  placeholder="Search by item code or name..."
  value={itemSearchQuery}
  onChange={(e) => {
    setItemSearchQuery(e.target.value);
    setHighlightedItemIndex(0);
  }}
  onMouseDown={(e) => e.stopPropagation()}
  onKeyDown={(e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedItemIndex((prev) =>
        prev === filteredItems.length - 1 ? 0 : prev + 1
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedItemIndex((prev) =>
        prev <= 0 ? filteredItems.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();

      if (filteredItems.length > 0 && highlightedItemIndex >= 0) {
        // Existing item selected
        const selectedItem = filteredItems[highlightedItemIndex];
        const newRow = {
          ...details[index],
          itemCode: selectedItem.item_code || selectedItem.code,
          itemDescription: selectedItem.description || selectedItem.item_desc,
          item_id: selectedItem.item_id || selectedItem.id,
        };
        const newData = [...details];
        newData[index] = newRow;
        setdetails(newData);
      } else if (itemSearchQuery.trim() !== "") {
        // NEW item: just set description, leave item_id null
        const newRow = {
          ...details[index],
          itemDescription: itemSearchQuery,
          item_id: null,
        };
        const newData = [...details];
        newData[index] = newRow;
        setdetails(newData);
      }

      // Close LOV & reset
      setOpenItemLovRowIndex(null);
      setItemSearchQuery("");
      setHighlightedItemIndex(-1);
      setFocusedItemRowIndex(null);

      console.log(`📝 Updated details[${index}]:`, details[index]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpenItemLovRowIndex(null);
      setHighlightedItemIndex(-1);
    }
  }}
  className="h-7 w-full text-black text-sm border border-gray-300 px-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
/>

      </div>

      {/* Items List */}
      <div className="max-h-40 overflow-y-auto">
        {isItemsLoading ? (
          <div className="px-1 py-1 text-xs text-gray-500">
            Loading items...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="px-1 py-1 text-xs text-gray-500">
            No items found matching "{itemSearchQuery}"
          </div>
        ) : (
          filteredItems.map((item, idx) => (
            <div
              key={item.id}
              className={`px-1 py-1 text-xs cursor-pointer ${
                highlightedItemIndex === idx
                  ? "bg-blue-400 text-black"
                  : "text-black"
              }`}
              onMouseEnter={() => setHighlightedItemIndex(idx)}
              onClick={() => {
                const newRow = {
                  ...details[index],
                  itemCode: item.item_code || item.code,
                  itemDescription: item.description || item.item_desc,
                  // 🆕 silently store item_id (for DB only)
                  item_id: item.item_id || item.id,
                };
                const newData = [...details];
                newData[index] = newRow;
                setdetails(newData);

                setOpenItemLovRowIndex(null);
                setItemSearchQuery("");
                setHighlightedItemIndex(-1);
                setFocusedItemRowIndex(null);

                console.log(`📝 Updated details[${index}]:`, newData[index]);
              }}
            >
              {/* SHOW ONLY DESCRIPTION IN LOV */}
              <span>{ item.item_desc}</span>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      {items.length > 0 && (
        <div className="px-1 py-1 text-xs text-gray-500 border-t">
          {itemSearchQuery
            ? `Showing ${filteredItems.length} matches`
            : `Showing ${filteredItems.length} of ${items.length} items (search to see all)`}
        </div>
      )}
    </div>
  )}
</div>





                     <div className="bg-white border border-gray-300 p-1">
  <input
    type="text"
    className="w-full h-6 text-xs text-black px-1 border-none bg-transparent focus:outline-none text-right"
    value={details[index]?.dcQty || ""}
    onChange={(e) => {
      const value = e.target.value;
      const updated = [...details];
      updated[index] = {
        ...updated[index],
        dcQty: value, // manual SR Qty store
      };
      setdetails(updated);

      // ⚡ update dcQty in formData to recalc Weight Per Bags
      setFormData((prev) => ({
        ...prev,
        dcQty: value, // useEffect triggers weightPerBags calculation
      }));
    }}
    autoComplete="off"
    autoCorrect="off"
    autoCapitalize="off"
    spellCheck="false"
    data-form-type="other"
  />
</div>

                      {/* <div className="bg-white border border-gray-300 p-1">
                          <input
                            type="text"
                            className="w-full h-6 text-xs text-black px-1 border-none bg-transparent focus:outline-none text-right"
                            value={details[index]?.doQty || ""}
                            onChange={(e) =>
                              handledetailsChange(
                                index,
                                "doQty",
                                e.target.value,
                              )
                            }
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            data-form-type="other"
                          />
                        </div> */}
                      {/* <div className="bg-white border border-gray-300 p-1">
  {onlineMode ? (
    // ✅ Online mode: backend se aaya hua branch value show kare
    <input
      type="text"
      className="w-full h-6 text-xs text-black px-1 border-none bg-transparent focus:outline-none text-right"
      value={details[index]?.branch || ""}
      readOnly
    />
  ) : (
    // ✅ Offline mode: master section ka branch name dikhana hai jab DC no ho
    <input
      type="text"
      className="w-full h-6 text-xs text-black px-1 border-none bg-transparent focus:outline-none text-right"
      value={
        details[index]?.dcNo
          ? branches.find(
              (b) => b.branch_id.toString() === formData.branchId?.toString()
            )?.branch_name || ""
          : ""
      }
      readOnly
    />
  )}
</div> */}

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
                  className="grid gap-px text-xs font-semibold mb-12"
                  style={{
                    gridTemplateColumns:
                      "80px 250px 120px 120px 250px 80px 60px 90px 40px",
                    width: "830px",
                    height: "3px",
                    marginTop: "-66px",
                  }}
                >
                  <div className="bg-gray-100 border border-gray-200 p-1"></div>
                  <div className="bg-gray-100 border border-gray-200 p-1"></div>
                  <div className="bg-gray-100 border border-gray-200 p-1"></div>
                  <div className="bg-gray-100 border border-gray-200 p-1"></div>
                  <div className="bg-gray-100 border border-gray-200 p-1 flex items-center justify-end">
                    <span className="text-black">Total:</span>
                  </div>

                  <div className="bg-white border border-gray-400 p-1">
                    <input
                      type="text"
                      className="w-full h-6 text-xs text-black px-2 border-none bg-transparent focus:outline-none text-right font-semibold"
                      readOnly
                      value={details.reduce(
                        (sum, row) => sum + (parseFloat(row.dcQty) || 0),
                        0
                      )}
                    />
                  </div>
                  {/* <div className="bg-white border border-gray-400 p-1">
                      <input
                        type="text"
                        className="w-full h-6 text-xs text-black px-2 border-none bg-transparent focus:outline-none text-right font-semibold"
                        readOnly
                        value={details.reduce(
                          (sum, row) => sum + (parseFloat(row.doQty) || 0),
                          0,
                        )}
                      />
                    </div> */}
                  <div className="bg-gray-200 border border-gray-400 p-0.5rem"></div>
                </div>

                {/* Bottom section with Weight Per Bags, Total Weight Out, and Total Feed Bags - matching image layout */}
                <div
                  className="bg-gray-100 p-1 flex justify-between items-center border border-gray-300 mt-[-0.5rem]"
                  style={{ width: "990px" }}
                >
                    <div className="flex items-center space-x-4">
  <div className="bg-gray-300 flex items-center space-x-2">
    <label className="text-xs font-medium text-black">
      Weight Per Bags:
    </label>
    <input
      type="text"
      className="w-24 h-6 text-xs text-black border border-gray-300 px-2 focus:outline-none"
      value={formData.weightPerBags || ""}
      readOnly
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
      data-form-type="other"
    />
  </div>
</div>

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
    value={details.reduce(
      (sum, row) => sum + (parseFloat(row.dcQty) || 0),
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
