import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query"









const Reportpage = () => {


  
  const [selectedBranch, setSelectedBranch] = useState<string>("");


  
  // State for Dates (Defaulting to System Date)
 const getToday = () => new Date().toISOString().split('T')[0];

const [dates, setDates] = useState({
  from: getToday(),
  to: getToday()
});






const { data: branches = [] } = useQuery<Branch[]>({
  queryKey: ["/api/branches"],
});


useEffect(() => {
  if (branches.length > 0 && !selectedBranch) {
    setSelectedBranch(branches[0].branch_id.toString());
  }
}, [branches, selectedBranch]);

function formatPakistanTimee(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-PK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true  // This will show AM/PM format
  });
}

const formatPakistanTime = (timeString: any) => {
  if (!timeString) return '';

  try {
    // ✅ Case 1: ISO UTC format
    if (timeString.includes('T') && timeString.includes('Z')) {
      const date = new Date(timeString);
      const pakistanTime = new Date(date.getTime() + (5 * 60 * 60 * 1000));

      return pakistanTime
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');
    }

    // ✅ Case 2: Already "DD-MM-YY hh:mm:ss AM/PM"
    if (timeString.includes('-') && timeString.includes('AM') || timeString.includes('PM')) {
      const [datePart, timePart, ampm] = timeString.split(' ');

      const [day, month, year] = datePart.split('-');

      return `${day}/${month}/20${year} ${timePart} ${ampm}`;
    }

    // ✅ Case 3: "YYYY-MM-DD HH:mm:ss"
    if (timeString.includes('-') && timeString.includes(':')) {
      const [datePart, timePart] = timeString.split(' ');
      const [year, month, day] = datePart.split('-');

      return `${day}/${month}/${year} ${timePart}`;
    }

    return timeString;

  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};


// Define ReportItem type
type ReportItem = {
  b_rcvd: number;
  itemGroup: string;
  srNo: number | string;
  mt?: string | number;
  fwTime?: string;
  swTime?: string;
  grnNo?: string | number;
  vehicleNo?: string;
  supplierName?: string;
  bRcvd?: number | string;
  accepted?: number | string;
  gross?: number | string;
  tare?: number | string;
  bardana?: number | string;
  ded?: number | string;
  net?: number | string;
  supWh?: number | string;
  freight?: number | string;
  status?: string;
  // Add more fields if needed
};

interface AccumulatedReportItem {
  grn_no: string;
  vehicle_no: string;
  prod_qty: number;
  net_weight: number;
  avg_weight: number;
  bardana_type: string;
  creation_date: string;
  item_id: number;
  item_code: string;
  item_desc: string;
  vendor_name: string;
}


interface UnloadReportItem {
  creation_date: string;
  item_id: number;
  item_code: string;
  item_desc: string;
  grn_no: string;
  supp_name: string;
  vehicle_no: string;
  prod_qty: number;
  net_weight: number;
  avg_weight: number;
  bardana_type: string;
}


// Type for report items
interface SoldNoteReportItem {
  srNo: number;
  mt: string;
  fwTime: string;
  swTime: string;
  grnNo: string;
  vehicleNo: string;
  supplierName: string;
  bRcvd: number;
  accepted: number;
  gross: number;
  tare: number;
  bardana: number;
  ded: number;
  net: number;
  supWh: number;
  freight: number;
  status: string;
  itemGroup: string;
}


interface SaleReportItem {
  srNo: number;
  mt: string;           // Item description
  fwTime: string;       // Slip In
  swTime: string;       // Slip Out
  slipNo: string;       // Manual slip / DC no
  vehicleNo: string;
  customerName: string;
  noOfBags: number;
  freight: number;
  branchName: string;
  itemGroup: string;
  netWeight: number;
  manual_dc_no?: string | number;
  status?: string;      // ✅ NEW: Online / Offline / -
}

interface SCReportItem {
  srNo: number;          // Serial number
  mt: string;            // Item description / Feed Name
  fwTime: string;        // Slip In / FW Time
  swTime: string;        // Slip Out / SW Time
  slipNo: string;        // Manual slip / DC #
  dcNo?: string;         // Optional: DC number
  doNo?: string;         // Optional: DO number
  vehicleNo: string;     // Vehicle number
  customerName: string;  // Party / Customer Name
  noOfBags: number;      // Number of bags
  freight: number;       // Freight amount
  branchName: string;    // Branch / Company Name
  itemGroup?: string;    // Optional grouping field
}



type SaleDOReportItem = {
  manual_dc_no: string;
  slip_in_time: string;
  slip_out_time: string;
  slip_no: string;
  vehicle_no: string;
  item_id: string;
  do_no: string;
  item_code: string;
  item_desc: string;
  customer_name: string;
  party_name: string;
  sales_customer_name: string;
  no_of_bags: number;
  freight: number;
  branch_name: string;
};

type ItemWiseSummary = {
  item_id: string;
  item_code: string;
  item_desc: string;
  bags: number;
};

interface VendorPurchaseItem {
  item_id: string;
  item_code: string;
  item_desc: string;
  vendor_name: string;
  m_t: string;
  slip_in_time: string;
  slip_out_time: string;
  grn_no: string;
  vehicle_no: string;
  b_rcvd: number;
  acceptence: number;
  gross: number;
  tare: number;
  bardana: number;
  ded: number;
  net_weight: number;
  supplier_weight: number;
  freight: number;
  status: string;
  item_category?: string;
}

interface ReportProps {
  companyId: string;
  branchId: string;
  vendorInput?: string;
  itemInput?: string;
  vehicleInput?: string;
  dates: { from: string; to: string };
  companyName: string;
}


interface PurchaseSummaryReportProps {
  companyId: number;
  branchId: number;
  vendorInput?: string;
  itemInput?: string;
  vehicleInput?: string;
  dates: {
    from: string;
    to: string;
  };
  companyName: string;
}


interface PurchaseSummaryItem {
  srNo: number;
  grn: string;
  supplier: string;
  vehicle: string;
  prodQty: number;
  netWeight: number;
  avgWeight: number;
  type: string;
}

 interface PendingPurchasePrevReportItem {
  item_id: number;
  item_code: string;
  item_desc: string;

  m_t: string;                 // IGP / MT #
  slip_in_time: string;        // FW Time
  slip_out_time: string;       // SW Time
  grn_no: string;

  vehicle_no: string;

  b_rcvd: number;              // Bags Received
  accepted: number;
  gross: number | string;      // formatted weight string from DB

  track_vehicle: 'GOING' | 'PENDING' | 'SOLD_NOTE';
  status: string;

  second_weight: number | null;
  bardana_weight: number | null;
  quality_deduction: number | null;
  net_weight: number | null;
  supplier_weight: number | null;
  freight: number | null;

  dif: number;                 // Days difference
}




// --- TypeScript Interface for Pending Purchase Items ---
interface PendingPurchaseItem {
  item_id: string;
  item_code: string;
  item_desc: string;
  vendor_name: string;
  mt_no: string;               // IGP Number
  slip_in_time: string;
  slip_out_time: string | null;
  grn_no: string;              // Slip Number
  vehicle_no: string;
  b_rcvd: number;              // No of bags received
  acceptence: number;          // Accepted bags
  first_weight: number;        // Gross weight
  second_weight: number | null; // Tare weight
  bardana_weight: number;
  quality_deduction: number;
  net_weight: number | null;
  supplier_weight: number;
  freight: number;
  track_vehicle: string;       // PENDING / GOING / SOLD_NOTE
  status: string;              // Vehicle status
    // optional aliases for the report generator
  gross?: number;
  tare?: number | null;
}

interface Branch {
  branch_id: number;
  branch_name: string;
}



// Default selections
const [companyId, setCompanyId] = useState<number>(5);
const [companyName, setCompanyName] = useState('Sabirs Vegetable Oils (Pvt.) Ltd.');

const [branchId, setBranchId] = useState<number>(1);
const [branchName, setBranchName] = useState('OIL MILL');



// Near your other state declarations (around line 170-200)
const [allVendors, setAllVendors] = useState<any[]>([]);
const [vendorSearch, setVendorSearch] = useState('');
const [vendorLoading, setVendorLoading] = useState(false);
const [showVendorDropdown, setShowVendorDropdown] = useState(false);




// Add these state declarations near your other state declarations (around line 170-200)
const [allItems, setAllItems] = useState<any[]>([]);
const [itemSearch, setItemSearch] = useState('');
const [itemLoading, setItemLoading] = useState(false);
const [showItemDropdown, setShowItemDropdown] = useState(false);


// Add these state handlers near your other state declarations
const [vendorsList, setVendorsList] = useState<string[]>(['']);
const [itemsList, setItemsList] = useState<string[]>(['']);
const [vehiclesList, setVehiclesList] = useState<string[]>(['']);

const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);



  // Checkboxes State
  const [purchaseChecked, setPurchaseChecked] = useState(false); // Middle column "Purchase" checkbox
  const [purchaseReportChecked, setPurchaseReportChecked] = useState(false); // Right column "Purchase Report"
const [accumulatedChecked, setAccumulatedChecked] = useState(false);
const [unloadedChecked, setUnloadedChecked] = useState(false);
const [soldNoteChecked, setSoldNoteChecked] = useState(false);
const [saleChecked, setSaleChecked] = useState(false);
const [vendorInput, setVendorInput] = useState<string>('');
const [itemInput, setItemInput] = useState<string>('');
const [vehicleInput, setVehicleInput] = useState<string>('');
const [doWiseChecked, setDoWiseChecked] = useState(false);
// React state at the top of your component
const [vendorPurchaseChecked, setVendorPurchaseChecked] = useState(false);
// State declaration at the top of your component
const [pendingPurchaseChecked, setPendingPurchaseChecked] = useState(false);
 const [pendingSaleChecked, setPendingSaleChecked] = useState(false); // ✅ state for Pending Sale
const [finalReportChecked, setFinalReportChecked] = useState(false);
const [scReportChecked, setScReportChecked] = useState(false);
const [customerInput, setCustomerInput] = useState('');
const [vendorWiseNewChecked, setVendorWiseChecked] = useState(false);
const [pendingPrevChecked, setPendingPrevChecked] = useState(false);



// Add these state declarations near your other state declarations
const [customersList, setCustomersList] = useState<string[]>(['']);
const [allCustomers, setAllCustomers] = useState<any[]>([]);
const [customerSearch, setCustomerSearch] = useState('');
const [customerLoading, setCustomerLoading] = useState(false);



// Add this useEffect to monitor customerInput changes
useEffect(() => {
  console.log('customerInput changed:', customerInput);
}, [customerInput]);



  // Load System Date on Component Mount
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    setDates({
      from: formattedDate,
      to: formattedDate
    });
  }, []);

  // Handler for date changes
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDates(prev => ({ ...prev, [name]: value }));
  };





// Generate Purchase HTML report
const generateHTMLReport = (data: ReportItem[], company: string) => {

  const formatReportDateTime = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;
    const hh = String(hours).padStart(2, '0');

    return `${day}-${month}-${year} ${hh}:${minutes} ${ampm}`;
  };

  const reportDate = formatReportDateTime(new Date());

  const groupedData = data.reduce((acc: Record<string, ReportItem[]>, item) => {
    if (!acc[item.itemGroup]) acc[item.itemGroup] = [];
    acc[item.itemGroup].push(item);
    return acc;
  }, {});

  // Sort item groups alphabetically (ascending order)
  const sortedItemGroups = Object.keys(groupedData).sort((a, b) => 
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );

  let serialNo = 1;

  // Grand totals
  let grandVehicleCount = 0;
  let grandBRcvd = 0;
  let grandGross = 0;
  let grandTare = 0;
  let grandBardana = 0;
  let grandDed = 0;
  let grandNet = 0;
  let grandSupWh = 0;
  // ❌ Freight removed
  // let grandFreight = 0;

  let rows = '';

  // Iterate through sorted item groups
  sortedItemGroups.forEach(group => {
    let vehicleCount = 0;
    let itemBRcvd = 0;
    let itemDedTotal = 0;
    let itemNetTotal = 0;
  
    // Group title
    rows += `
      <tr style="background:#e6f7ff; font-weight:bold;">
        <td colspan="17" style="text-align:left;">${group}</td>
      </tr>
    `;

    // Column headers - ✅ Freight removed, B.Rcvd column duplicated
    rows += `
      <tr>
        <th>Sr #</th>
        <th>IGP No</th>
        <th style="min-width:120px;">FW Time</th>
        <th style="min-width:120px;">SW Time</th>
        <th>Slip No</th>
        <th style="min-width:58px;">Vehicle</th>
        <th>Supplier</th>
        <th>B.Rcvd</th>
        <th>Accepted</th> <!-- ✅ Duplicate B.Rcvd -->
        <th>Gross</th>
        <th>Tare</th>
        <th>Bardana</th>
        <th>DED</th>
        <th>Net</th>
        <th>Sup.Wh</th>
        <!-- ❌ Freight column removed -->
        <th>Status</th>
      </tr>
    `;

    groupedData[group].forEach(item => {
      vehicleCount += item.vehicleNo ? 1 : 0;
      itemBRcvd += Number(item.bRcvd || 0);
      itemDedTotal += Number(item.ded || 0);
      itemNetTotal += Number(item.net || 0);

      grandVehicleCount += item.vehicleNo ? 1 : 0;
      grandBRcvd += Number(item.bRcvd || 0);
      grandGross += Number(item.gross || 0);
      grandTare += Number(item.tare || 0);
      grandBardana += Number(item.bardana || 0);
      grandDed += Number(item.ded || 0);
      grandNet += Number(item.net || 0);
      grandSupWh += Number(item.supWh || 0);
      // ❌ Freight removed
      // grandFreight += Number(item.freight || 0);

      rows += `
        <tr>
          <td>${serialNo}</td>
          <td>${/^\d+$/.test(String(item.mt ?? '').trim()) ? item.mt : ''}</td>
          <td>${formatPakistanTime(item.fwTime)}</td>
          <td>${formatPakistanTime(item.swTime)}</td>
          <td style="color:red;">${item.grnNo ?? ''}</td>
          <td style="color:red;">${item.vehicleNo ?? ''}</td>
          <td>${item.supplierName ?? ''}</td>
          <td>${item.bRcvd ?? 0}</td>
          <td>${item.bRcvd ?? 0}</td> <!-- ✅ Duplicate B.Rcvd -->
          <td>${item.gross ?? 0}</td>
          <td>${item.tare ?? 0}</td>
          <td>${item.bardana ?? 0}</td>
          <td>${item.ded ?? 0}</td>
          <td>${item.net ?? 0}</td>
          <td>${item.supWh ?? 0}</td>
          <!-- ❌ Freight column removed -->
          <td class="${item.status?.toLowerCase() === 'online' ? 'status-online' : ''}">
            ${item.status ?? ''}
          </td>
        </tr>
      `;
      serialNo++;
    });

    // Item-wise total row - ✅ Freight removed, B.Rcvd duplicate
    rows += `
      <tr class="total-row">
        <td colspan="5">Vehicle Count</td>
        <td>${vehicleCount}</td>
        <td>&nbsp;</td>
        <td>${itemBRcvd}</td>
        <td>${itemBRcvd}</td> <!-- ✅ Duplicate B.Rcvd -->
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>${itemDedTotal}</td>
        <td>${itemNetTotal}</td>
        <td>&nbsp;</td>
        <!-- ❌ Freight column removed -->
        <td>&nbsp;</td>
      </tr>
    `;
  });

  // Grand total row - ✅ Freight removed, B.Rcvd duplicate
  rows += `
    <tr class="grand-total">
      <td colspan="5">Total Vehicle Count</td>
      <td>${grandVehicleCount}</td>
      <td></td>
      <td>${grandBRcvd}</td>
      <td>${grandBRcvd}</td> <!-- ✅ Duplicate B.Rcvd -->
      <td>${grandGross}</td>
      <td>${grandTare}</td>
      <td>${grandBardana}</td>
      <td>${grandDed}</td>
      <td>${grandNet}</td>
      <td>${grandSupWh}</td>
      <!-- ❌ Freight column removed -->
      <td></td>
    </tr>
  `;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Daily Material Receipt Report</title>
  <style>
    body { font-family: Arial; margin: 20px; background:#f9f9f9; }
    h1, h2 { text-align:center; margin:0; }
    h1 { color: green; }
    h2 { color: red; margin-bottom:15px; }
    .report-date {
      font-size:14px; 
      font-weight:bold; 
      color:#333;
      display:flex;
      align-items:center;
      gap:5px;
    }
    .print-button {
      padding:8px 14px;
      font-size:14px;
      font-weight:bold;
      background:#007bff;
      color:white;
      border:none;
      cursor:pointer;
      border-radius:3px;
      display:flex;
      align-items:center;
      gap:5px;
    }
    .print-button:hover { background:#0056b3; }
    .date-print-row {
      display:flex; 
      justify-content:space-between; 
      align-items:center; 
      margin-bottom:15px;
    }
    table { width:100%; border-collapse:collapse; table-layout:auto; }
    th, td { border:1px solid #ccc; padding:6px; text-align:center; font-size:12px; }
    th { background:#d4edda; font-weight:bold; }
    .total-row td { color:red; font-weight:bold; border-top:2px solid black; }
    .grand-total td  { color:Blue; font-weight:bold; border-top:2px solid black; }
    .status-online { color:green; font-weight:bold; }
    svg { width:16px; height:16px; }
  </style>
</head>
<body>
  <h1>${company} </h1>
  <h2>Daily Material Receipt Report</h2>

  <!-- Date and Print button with inline SVG icons -->
  <div class="date-print-row">
    <div class="report-date">
      <!-- Calendar SVG -->
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      Print Date: ${new Date().toLocaleString('en-US', { hour12: true })}
    </div>
    <button class="print-button" onclick="window.print()">
      <!-- Printer SVG -->
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9V2h12v7M6 18h12v4H6v-4zM6 14h12v4H6v-4z"/>
      </svg>
      Print
    </button>
  </div>

  <table>
    ${rows}
  </table>
</body>
</html>
`;
};



const runReport = async () => {
  // ✅ Your condition is correct
  if (!purchaseChecked || purchaseReportChecked) {
    alert('Please select Purchase checkbox and ensure Purchase Report checkbox is unchecked to print.');
    return;
  }

  try {
    const fromDate = dates.from;
    const toDate = dates.to;

    const params = new URLSearchParams({
      company: String(companyId),
      branch: String(branchId),
      vendor: vendorInput || '',
      item: itemInput || '',
      vehicle: vehicleInput || '',
      from: fromDate,
      to: toDate,
    });

    console.log("Sending params to API:", Object.fromEntries(params.entries()));

    const res = await fetch(`/api/purchase-report?${params.toString()}`);
    const rawData = await res.json();

    console.log("API response:", rawData);

 console.log("🔍=== RUN REPORT DEBUG ===");
  console.log("1️⃣ purchaseChecked:", purchaseChecked);
  console.log("2️⃣ purchaseReportChecked:", purchaseReportChecked);
  console.log("3️⃣ dates object:", dates);
  console.log("4️⃣ from date:", dates?.from);
  console.log("5️⃣ to date:", dates?.to);
  console.log("6️⃣ companyId:", companyId);
  console.log("7️⃣ branchId:", branchId);
  console.log("8️⃣ vendorInput:", vendorInput);
  console.log("9️⃣ itemInput:", itemInput);
  console.log("🔟 vehicleInput:", vehicleInput);


    // ✅ Fix: API directly array return kar raha hai
    if (!Array.isArray(rawData) || rawData.length === 0) {
      alert(`No data returned for selected filters.
      
Branch: ${branchId}
Dates: ${fromDate} to ${toDate}
Vendor: ${vendorInput || 'All'}
Item: ${itemInput || 'All'}
Vehicle: ${vehicleInput || 'All'}`);
      return;
    }

    console.log(`✅ Found ${rawData.length} records`);

    const data: ReportItem[] = rawData.map((d: any, i: number) => ({
      srNo: i + 1,
      mt: d.m_t || d.item_desc || '',
      fwTime: d.slip_in_time || '',
      swTime: d.slip_out_time || '',
      grnNo: d.grn_no || '',
      vehicleNo: d.vehicle_no || '',
      supplierName: d.supp_name || '',
      bRcvd: d.b_rec || '',
      accepted: d.accepted || '',
      gross: d.gross || 0,
      tare: d.tare || 0,
      bardana: d.bardana || 0,
      ded: d.ded || 0,
      net: d.net || 0,
      supWh: d.supp_weight || 0,
      freight: d.freight || 0,
      status: d.status || '',
      itemGroup: d.item_desc || ''
    }));

    const html = generateHTMLReport(data, companyName);

    const win = window.open('', '_blank');
    if (!win) {
      alert('Popup blocked! Please allow popups for this site.');
    } else {
      win.document.write(html);
      win.document.close();
    }
  } catch (err) {
    console.error('runReport error:', err);
    alert(`Error loading Purchase report: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};




const generatePurchaseSummaryHTML = (
  data: PurchaseSummaryItem[],
  company: string
) => {

  const formatReportDateTime = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12;

    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  };

  let rows = '';
  let serialNo = 1;

  let grandVehicleSet = new Set<string>();
  let grandProdQty = 0;
  let grandNet = 0;
  let grandAvgSum = 0;

  // ✅ GROUP BY DATE
  const dateGroups = data.reduce((acc: any, item) => {
    const key = item.date || 'NO DATE';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  // ✅ SORT DATES
  const sortedDates = Object.keys(dateGroups).sort((a, b) =>
    new Date(a).getTime() - new Date(b).getTime()
  );

  sortedDates.forEach((dateKey) => {

    let dateVehicleSet = new Set<string>();
    let dateQty = 0;
    let dateNet = 0;

    rows += `
      <tr style="background:#d9edf7; font-weight:900; font-size:15px;">
        <td colspan="8" style="text-align:left;">
          📅 ${dateKey}
        </td>
      </tr>
    `;

    // ✅ GROUP BY ITEM (TYPE)
    const itemGroups = dateGroups[dateKey].reduce((acc: any, item: any) => {
      const key = item.type || 'NO ITEM';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    // ✅ SORT ITEMS
    const sortedItems = Object.keys(itemGroups).sort((a, b) =>
      a.localeCompare(b)
    );

    sortedItems.forEach((itemKey) => {

      let itemVehicleSet = new Set<string>();
      let itemQty = 0;
      let itemNet = 0;

      rows += `
        <tr style="background:#f5f5f5; font-weight:900; color:purple; font-size:14px;">
          <td colspan="8" style="text-align:left;">
            🔹 ${itemKey}
          </td>
        </tr>

        <tr style="background:#e9ecef; font-weight:900;">
          <th>Sr #</th>
          <th>GRN #</th>
          <th style="text-align:left;">Supplier Name</th>
          <th>Vehicle #</th>
          <th>Prod. Qty</th>
          <th>Net Weight</th>
          <th>Avg Weight</th>
          <th>Type</th>
        </tr>
      `;

      itemGroups[itemKey].forEach((item: any) => {

        const qty = Number(item.prodQty) || 0;
        const net = Number(item.netWeight) || 0;
        const avg = qty ? (net / qty) : 0;

        grandAvgSum += avg;

        if (item.vehicle) {
          itemVehicleSet.add(item.vehicle);
          dateVehicleSet.add(item.vehicle);
          grandVehicleSet.add(item.vehicle);
        }

        itemQty += qty;
        itemNet += net;

        dateQty += qty;
        dateNet += net;

        grandProdQty += qty;
        grandNet += net;

        rows += `
          <tr>
            <td>${serialNo++}</td>
            <td style="color:red; font-weight:900;">${item.grn || ''}</td>
            <td style="text-align:left;">${item.supplier || ''}</td>
            <td style="color:red; font-weight:700;">${item.vehicle || ''}</td>
            <td>${qty}</td>
            <td>${net}</td>
            <td>${avg.toFixed(2)}</td>
            <td>${item.type || ''}</td>
          </tr>
        `;
      });

      const itemAvg = itemQty ? (itemNet / itemQty) : 0;

      rows += `
        <tr style="font-weight:900; background:#fff3cd;">
          <td colspan="3" style="text-align:left;">
            Item Total (${itemKey})
          </td>
          <td>${itemVehicleSet.size}</td>
          <td>${itemQty}</td>
          <td>${itemNet}</td>
          <td>${itemAvg.toFixed(2)}</td>
          <td></td>
        </tr>
      `;
    });

    const dateAvg = dateQty ? (dateNet / dateQty) : 0;

    rows += `
      <tr style="font-weight:900; background:#f8d7da; color:#721c24;">
        <td colspan="3" style="text-align:left;">
          Date Total (${dateKey})
        </td>
        <td>${dateVehicleSet.size}</td>
        <td>${dateQty}</td>
        <td>${dateNet}</td>
        <td>${dateAvg.toFixed(2)}</td>
        <td></td>
      </tr>
    `;
  });

  rows += `
    <tr style="background:#cfe2ff; font-weight:900; font-size:15px;">
      <td colspan="3">🧾 GRAND TOTAL</td>
      <td>${grandVehicleSet.size}</td>
      <td>${grandProdQty}</td>
      <td>${grandNet}</td>
      <td>${grandAvgSum.toFixed(2)}</td>
      <td></td>
    </tr>
  `;

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Production Report</title>
<style>
  body { font-family: Arial; margin:20px; }
  table { width:100%; border-collapse:collapse; }
  th, td { border:1px solid #000; padding:8px; text-align:center; }
  th { background:#d4edda; }
</style>
</head>
<body>

<h1>${company} (.PVT) .LTD</h1>
<h2>Production Report (Date & Item Wise)</h2>

<div style="text-align:right; font-weight:bold;">
  ${formatReportDateTime(new Date())}
</div>

<table>
${rows}
</table>

</body>
</html>
`;
};


const runPurchaseSummaryReport = async (
  props: PurchaseSummaryReportProps
) => {
  const {
    companyId,
    branchId,
    vendorInput,
    itemInput,
    vehicleInput,
    dates,
    companyName
  } = props;

  try {
    const params = new URLSearchParams();

    params.append("company", String(companyId));
    params.append("branch", String(branchId));

    if (vendorInput) params.append("vendor", vendorInput);
    if (itemInput) params.append("item", itemInput);
    if (vehicleInput) params.append("vehicle", vehicleInput);

    params.append("dateFrom", dates.from);
    params.append("dateTo", dates.to);

    const res = await fetch(`/api/purchase-summary-report?${params.toString()}`);

    if (!res.ok) {
      const errorText = await res.text();
      alert(errorText);
      return;
    }

    const raw = await res.json();

    if (!raw?.success || !Array.isArray(raw.data) || raw.data.length === 0) {
      alert("No Purchase Summary data found");
      return;
    }

    const data: PurchaseSummaryItem[] = raw.data.map((d: any, i: number) => ({
      srNo: i + 1,
      grn: d.grn || '',
      supplier: d.supplier || '',
      vehicle: d.vehicle || '',
      prodQty: Number(d.prod_qty ?? 0),
      netWeight: Number(d.net_weight ?? 0),
      avgWeight: Number(d.avg_weight ?? 0),
      type: d.type || ''
    }));

    const html = generatePurchaseSummaryHTML(data, companyName);

    const win = window.open("", "_blank");
    if (!win) return alert("Popup blocked");

    win.document.write(html);
    win.document.close();

  } catch (err) {
    console.error(err);
  }
};









const handleVendorInputChange = async (index: number, value: string) => {
  const newVendors = [...vendorsList];
  newVendors[index] = value;
  setVendorsList(newVendors);
  setVendorSearch(value);
  
  // Update vendorInput state by joining all non-empty values
  const filteredVendors = newVendors.filter(v => v.trim() !== '');
  setVendorInput(filteredVendors.join(';'));
  
  // Show dropdown when typing
  if (value.length > 0) {
    setShowVendorDropdown(true);
  }
  
  // Fetch vendors when user types (with debounce)
  if (value.length >= 2) {
    const debounceTimer = setTimeout(() => {
      fetchVendors(value);
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  } else {
    setAllVendors([]);
  }
};

const handleItemInputChange = async (index: number, value: string) => {
  const newItems = [...itemsList];
  newItems[index] = value;
  setItemsList(newItems);
  setItemSearch(value);
  
  // Update itemInput state by joining all non-empty values
  const filteredItems = newItems.filter(i => i.trim() !== '');
  setItemInput(filteredItems.join(';'));
  
  // Show dropdown when typing
  if (value.length > 0) {
    setShowItemDropdown(true);
  }
  
  // Fetch items when user types (with debounce)
  if (value.length >= 2) {
    const debounceTimer = setTimeout(() => {
      fetchItems(value);
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  } else {
    setAllItems([]);
  }
};

const handleVehicleInputChange = (index: number, value: string) => {
  const newVehicles = [...vehiclesList];
  newVehicles[index] = value;
  setVehiclesList(newVehicles);
  
  const filteredVehicles = newVehicles.filter(v => v.trim() !== '');
  setVehicleInput(filteredVehicles.join(';'));
};

const handleCustomerInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setCustomerInput(value);
  setCustomerSearch(value);
  
  // Show dropdown when typing
  if (value.length > 0) {
    setShowCustomerDropdown(true);
  }
  
  // Fetch customers when user types (with debounce)
  if (value.length >= 2) {
    const debounceTimer = setTimeout(() => {
      fetchCustomers(value);
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  } else {
    setAllCustomers([]);
  }
};

const fetchItems = async (searchTerm: string = '') => {
  try {
    console.log('🔍 Fetching items with search term:', searchTerm);
    setItemLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    params.append('limit', '10000');
    
    const url = `/api/items?${params.toString()}`;
    console.log('📡 Fetching from URL:', url);
    
    const res = await fetch(url);
    console.log('📥 Response status:', res.status);
    
    if (!res.ok) throw new Error('Failed to fetch items');
    
    const data = await res.json();
    console.log('✅ Fetched items data:', data);
    console.log('📊 Items count:', data.length);
    
    setAllItems(data);
  } catch (error) {
    console.error('❌ Error fetching items:', error);
    setShowItemDropdown(false);
    alert('Error loading items');
  } finally {
    setItemLoading(false);
  }
};

// Fetch items on component mount
useEffect(() => {
  fetchItems();
}, []);




const fetchCustomers = async (searchTerm: string = '', branchIdParam?: number) => {
  try {
    setCustomerLoading(true);
    
    const branchToUse = branchIdParam !== undefined ? branchIdParam : branchId;
    
    if (!branchToUse) {
      console.warn('⚠️ No branch selected');
      setAllCustomers([]);
      setCustomerLoading(false);
      return;
    }
    
    const params = new URLSearchParams();
    params.append('branch_id', branchToUse.toString());
    params.append('limit', '10000');
    
    if (searchTerm && searchTerm.trim()) {
      params.append('search', searchTerm.trim());
    }
    
    const url = `/api/customers?${params.toString()}`;
    console.log('🌐 Fetching customers URL:', url);
    
    const res = await fetch(url);
    const response = await res.json();
    
    console.log('📦 Full API Response:', response);
    
    if (response && response.success && Array.isArray(response.data)) {
      console.log('✅ Customers fetched:', response.data.length);
      
      // ✅ IMPORTANT: Directly set the array
      const customersArray = response.data;
      setAllCustomers(customersArray);
      
      // ✅ Debug: Check if state is updated
      console.log('📊 Setting allCustomers with:', customersArray.length, 'customers');
      
      // ✅ Optional: Show dropdown automatically when data arrives
      if (customersArray.length > 0) {
        setShowCustomerDropdown(true);
      }
    } else {
      console.warn('No customers data in response');
      setAllCustomers([]);
    }
    
  } catch (error) {
    console.error('❌ Error fetching customers:', error);
    setAllCustomers([]);
  } finally {
    setCustomerLoading(false);
  }
};


// Initial fetch when component mounts and branchId is available
useEffect(() => {
  if (branchId) {
    console.log('Initial fetch for branch:', branchId);
    fetchCustomers('', branchId);
  }
}, []); // Runs once on mount

// Fetch when branch changes (from Select component)
useEffect(() => {
  if (selectedBranch && selectedBranch !== 'all') {
    const branchIdNum = parseInt(selectedBranch);
    console.log('Branch selection changed to:', branchIdNum);
    fetchCustomers('', branchIdNum);
    // Clear customer input
    setCustomerInput('');
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  }
}, [selectedBranch]); // Depends on selectedBranch



// Close item dropdown when clicking outside
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (showItemDropdown && !target.closest('.item-dropdown-container')) {
      setShowItemDropdown(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showItemDropdown]);




// Close vendor dropdown when clicking outside
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (showVendorDropdown && !target.closest('.vendor-dropdown-container')) {
      setShowVendorDropdown(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showVendorDropdown]);



// Close dropdown when clicking outside
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (showCustomerDropdown && !target.closest('.customer-dropdown-container')) {
      setShowCustomerDropdown(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showCustomerDropdown]);











const fetchVendors = async (searchTerm: string = '') => {
  try {
    setVendorLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    params.append('limit', '10000');
    
    const res = await fetch(`/api/vendors?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch vendors');
    
    const data = await res.json();
    setAllVendors(data);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    setShowVendorDropdown(false);
    alert('Error loading vendors');
  } finally {
    setVendorLoading(false);
  }
};

// Fetch vendors on component mount
useEffect(() => {
  fetchVendors();
}, []);

const generateAccumulatedHTMLReport = (data: AccumulatedReportItem[], company: string) => {
  const reportDate = new Date().toLocaleString('en-GB', { day:'2-digit', month:'short', year:'2-digit', hour:'2-digit', minute:'2-digit', hour12:true });

  // Group by date
  const dateGroups: Record<string, AccumulatedReportItem[]> = {};
  data.forEach(item => {
    const dateStr = new Date(item.creation_date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'2-digit' });
    if (!dateGroups[dateStr]) dateGroups[dateStr] = [];
    dateGroups[dateStr].push(item);
  });

  // Make sure reportDate includes AM/PM
  const reportDateWithAMPM = new Date().toLocaleString('en-GB', {
    day:'2-digit',
    month:'short',
    year:'2-digit',
    hour:'2-digit',
    minute:'2-digit',
    hour12:true
  });

  let htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Accumulated Report</title>
  <style>
    body { font-family: Arial; margin:20px; font-size:12px; }
    h1, h2 { text-align:center; margin:0; }
    h1 { color:green; font-size:24px; }
    h2 { color:red; margin-bottom:15px; font-size:20px; }
    .box { border:1px solid black; margin-bottom:15px; padding:4px; }
    .flex { display:flex; }
    .item-name { width:18%; font-weight:bold; border-right:2px solid black; padding-left:4px; padding-top:2px; }
    .content { flex:1; }
    .grid { display:grid; }
    .grid-cols-7 { grid-template-columns: 100px 220px 120px 100px 120px 100px 100px; }
    .text-center { text-align:center; }
    .font-bold { font-weight:bold; }
    .border-b { border-bottom:1px solid black; }
    .border-r { border-right:1px solid black; }
    .mb-1 { margin-bottom:4px; }
    .mt-1 { margin-top:4px; }
    .pt-1 { padding-top:2px; }
    .pl-2 { padding-left:0.5rem; }
    .text-red-600 { color:red; }
    .text-red-900 { color:#8B0000; }
    .text-fuchsia-800 { color:#7C3AED; }
    .text-green { color:green; font-weight:bold; font-size:14px; }
    .print-button {
      background-color:#1E90FF;
      color:white;
      font-weight:bold;
      padding:6px 12px;
      border:none;
      border-radius:4px;
      cursor:pointer;
      display:flex;
      align-items:center;
      gap:5px;
    }
    .print-button:hover { background-color:#187bcd; }
    svg { width:16px; height:16px; }
  </style>
</head>
<body>
  <h1>${company} (PVT.) LTD.</h1>
  <h2>Daily Material Receipt Report</h2>
  <div class="flex" style="justify-content:space-between; align-items:center; margin-bottom:10px;">
    <div style="font-weight:bold; display:flex; align-items:center; gap:5px;">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      <b>Report Date:</b> ${reportDateWithAMPM}
    </div>
    <button class="print-button" onclick="window.print()">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9V2h12v7M6 18h12v4H6v-4zM6 14h12v4H6v-4z"/>
      </svg>
      Print
    </button>
  </div>
`;

  // Grand totals
  let grandVehicleCount = 0;
  let grandProdQty = 0;
  let grandNetWt = 0;
  let grandAvgWtSum = 0;

  Object.keys(dateGroups).forEach(date => {
    const items = dateGroups[date];

    // Date-wise totals
    const dateVehicleCount = items.length;
    const dateQtySum = items.reduce((acc, r) => acc + Number(r.prod_qty || 0), 0);
    const dateNetSum = items.reduce((acc, r) => acc + Number(r.net_weight || 0), 0);
    const dateAvgWt = dateQtySum > 0 ? (dateNetSum / dateQtySum).toFixed(2) : '0.00';

    // Add to grand totals
    grandVehicleCount += dateVehicleCount;
    grandProdQty += dateQtySum;
    grandNetWt += dateNetSum;
    grandAvgWtSum += Number(dateAvgWt);

    // Group by item_desc
    const itemGroups: Record<string, AccumulatedReportItem[]> = {};
    items.forEach(it => {
      if (!itemGroups[it.item_desc]) itemGroups[it.item_desc] = [];
      itemGroups[it.item_desc].push(it);
    });

    htmlContent += `<div class="text-red-900 font-bold mb-1 border-b">${date}</div>`;

    Object.keys(itemGroups).forEach(itemName => {
      const rows = itemGroups[itemName];

      htmlContent += `<div class="box flex">`;
      htmlContent += `<div class="item-name">${itemName}</div>`;
      htmlContent += `<div class="content">`;

      htmlContent += `
        <div class="grid grid-cols-7 text-center border-b h-8 font-bold text-green">
          <div class="border-r">GRN #</div>
          <div class="border-r">Supplier Name</div>
          <div class="border-r">Vehicle#</div>
          <div class="border-r">Prod. QTY</div>
          <div class="border-r">Net Weight</div>
          <div class="border-r">Avg Weight</div>
          <div>Type</div>
        </div>
      `;

      rows.forEach(r => {
        htmlContent += `
          <div class="grid grid-cols-7 text-center border-b h-8 font-bold">
            <div class="border-r text-red-600">${r.grn_no}</div>
            <div class="border-r">${r.vendor_name}</div>
            <div class="border-r">${r.vehicle_no}</div>
            <div class="border-r">${r.prod_qty}</div>
            <div class="border-r">${r.net_weight}</div>
            <div class="border-r">${r.avg_weight}</div>
            <div>${r.bardana_type}</div>
          </div>
        `;
      });

      // Item-wise summary
      const vehicleCount = rows.length;
      const qtySum = rows.reduce((acc, r) => acc + Number(r.prod_qty || 0), 0);
      const netSum = rows.reduce((acc, r) => acc + Number(r.net_weight || 0), 0);
      const avgSum = rows.reduce((acc, r) => acc + Number(r.avg_weight || 0), 0);

      htmlContent += `
        <div class="grid grid-cols-7 text-fuchsia-800 font-bold h-8 mt-1" style="border:none;">
          <div></div>
          <div class="text-left pl-2">Item Wise Vehicle count</div>
          <div class="text-center">${vehicleCount}</div>
          <div class="text-center">${qtySum}</div>
          <div class="text-center">${netSum}</div>
          <div class="text-center">${avgSum}</div>
          <div></div>
        </div>
      `;

      htmlContent += `</div></div>`; // end content + box

    });

    // Date-wise summary
    htmlContent += `
      <div class="grid grid-cols-7 text-fuchsia-800 font-bold h-8 mt-1" style="border:none;">
        <div></div>
        <div class="text-left pl-2">Date Wise Vehicle count</div>
        <div class="text-center">${dateVehicleCount}</div>
        <div class="text-center">${dateQtySum}</div>
        <div class="text-center">${dateNetSum}</div>
        <div class="text-center">${dateAvgWt}</div>
        <div></div>
      </div>
    `;
  });

  // Total-wise summary at end
  const grandAvgWt = grandProdQty > 0 ? (grandNetWt / grandProdQty).toFixed(2) : '0.00';
  htmlContent += `
    <div class="grid grid-cols-7 text-fuchsia-800 font-bold h-8 mt-2" style="border-top:2px solid #000; padding-top:4px;">
      <div></div>
      <div class="text-left pl-2">Total Vehicle Count</div>
      <div class="text-center">${grandVehicleCount}</div>
      <div class="text-center">${grandProdQty}</div>
      <div class="text-center">${grandNetWt}</div>
      <div class="text-center">${grandAvgWt}</div>
      <div></div>
    </div>
  `;

  htmlContent += `<div class="border-b-2 mt-4"></div></body></html>`;
  return htmlContent;
};


const runAccumulatedReport = async () => {
   if (!accumulatedChecked || purchaseReportChecked) {
    alert('Please select Purchase checkbox and ensure Purchase Report checkbox is unchecked to print.');
    return;
  }
  try {
    const params = new URLSearchParams({
      vendor: '' // optional
    });

    const res = await fetch(`/api/accumulated-report?${params.toString()}`);
    const rawData = await res.json();

    if (!Array.isArray(rawData) || rawData.length === 0) {
      alert('No accumulated data found');
      return;
    }

    const html = generateAccumulatedHTMLReport(rawData, companyName);

    const win = window.open('', '_blank');
    if (!win) alert('Popup blocked');
    else {
      win.document.write(html);
      win.document.close();
    }
  } catch (err) {
    console.error('Accumulated report error:', err);
    alert('Error loading accumulated report');
  }
};


// unloaded HTML report
const generateUnloadHTMLReport = (
  data: UnloadReportItem[],
  company: string
) => {

  const reportDate = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Group by date
  const dateGroups: Record<string, UnloadReportItem[]> = {};
  data.forEach(item => {
    const d = new Date(item.creation_date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
    if (!dateGroups[d]) dateGroups[d] = [];
    dateGroups[d].push(item);
  });

  let html = `
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Unloaded Report</title>
    <style>
      body { font-family: Arial; font-size:12px; margin:20px; }
      h1 { color:green; text-align:center; }
      h2 { color:red; text-align:center; margin-bottom:15px; }
      .box { border:1px solid black; margin-bottom:15px; padding:4px; }
      .flex { display:flex; justify-content:space-between; margin-bottom:10px; }
      .item { width:18%; font-weight:bold; border-right:2px solid black; }
      .grid { display:grid; grid-template-columns: 80px 200px 120px 90px 120px 200px 90px; }
      .b { border-bottom:1px solid black; }
      .r { border-right:1px solid black; }
      .c { text-align:center; }
      .g { font-weight:bold; color:green; }
      .sum { font-weight:bold; color:#7C3AED; }
      .print-button { padding:8px 14px; font-size:14px; font-weight:bold; background:#007bff; color:white; border:none; cursor:pointer; border-radius:3px; }
      .print-button:hover { background:#0056b3; }
    </style>
  </head>
  <body>
    <h1>${company} (PVT.) LTD.</h1>
    <h2>Daily Material Receipt Report</h2>

    <div class="flex">
      <div><b>Report Date:</b> ${reportDate}</div>
      <button class="print-button" onclick="window.print()">Print</button>
    </div>
  `;

  // Grand total variables
  let grandVehicleCount = 0;
  let grandProdQty = 0;
  let grandNetWt = 0;

  Object.keys(dateGroups).forEach(date => {
    const dateItems = dateGroups[date];

    const dateVehicleCount = dateItems.length;
    const dateQtySum = dateItems.reduce((a, b) => a + Number(b.prod_qty || 0), 0);
    const dateNetSum = dateItems.reduce((a, b) => a + Number(b.net_weight || 0), 0);
    const dateAvgWt =
      dateQtySum > 0 ? (dateNetSum / dateQtySum).toFixed(2) : '0.00';

    // Update grand totals
    grandVehicleCount += dateVehicleCount;
    grandProdQty += dateQtySum;
    grandNetWt += dateNetSum;

    const itemGroups: Record<string, UnloadReportItem[]> = {};
    dateItems.forEach(it => {
      if (!itemGroups[it.item_desc]) itemGroups[it.item_desc] = [];
      itemGroups[it.item_desc].push(it);
    });

    html += `<div style="font-weight:bold;color:#8B0000;border-bottom:1px solid black">${date}</div>`;

    Object.keys(itemGroups).forEach(itemName => {
      const rows = itemGroups[itemName];

      html += `
      <div class="box flex">
        <div class="item">${itemName}</div>
        <div style="flex:1">
          <div class="grid b c g">
            <div class="r">GRN</div>
            <div class="r">Supplier</div>
            <div class="r">Vehicle</div>
            <div class="r">Prod.Qty</div>
            <div class="r">Net Wt</div>
            <div class="r">Avg Wt</div>
            <div>Type</div>
          </div>
      `;

      rows.forEach(r => {
        html += `
          <div class="grid b c">
            <div class="r">${r.grn_no}</div>
            <div class="r">${r.supp_name}</div>
            <div class="r">${r.vehicle_no}</div>
            <div class="r">${r.prod_qty}</div>
            <div class="r">${r.net_weight}</div>
            <div class="r">${Number(r.avg_weight || 0).toFixed(2)}</div>
            <div>${r.bardana_type}</div>
          </div>
        `;
      });

      const itemVehicleCount = rows.length;
      const itemQtySum = rows.reduce((a, b) => a + Number(b.prod_qty || 0), 0);
      const itemNetSum = rows.reduce((a, b) => a + Number(b.net_weight || 0), 0);

      // ITEM WISE SUMMARY
      html += `
        <div class="grid sum c">
          <div></div>
          <div class="r" style="text-align:left">Item Wise Vehicle Count</div>
          <div class="r">${itemVehicleCount}</div>
          <div class="r">${itemQtySum}</div>
          <div class="r">${itemNetSum}</div>
          <div></div>
          <div></div>
        </div>
        </div>
      </div>
      `;
    });

    // DATE WISE SUMMARY (aligned exactly like item-wise)
    html += `
      <div class="grid sum c">
        <div></div>
        <div class="r" style="text-align:left">Date Wise Vehicle Count</div>
        <div class="r">${dateVehicleCount}</div>
        <div class="r">${dateQtySum}</div>
        <div class="r">${dateNetSum}</div>
        <div class="r">${dateAvgWt}</div>
        <div></div>
      </div>
    `;
  });

  // TOTAL WISE SUMMARY (added at end)
  const grandAvgWt = grandProdQty > 0 ? (grandNetWt / grandProdQty).toFixed(2) : '0.00';
  html += `
    <div class="grid sum c" style="border-top:2px solid #000; margin-top:10px; padding-top:4px;">
      <div></div>
      <div class="r" style="text-align:left">Total Vehicle Count</div>
      <div class="r">${grandVehicleCount}</div>
      <div class="r">${grandProdQty}</div>
      <div class="r">${grandNetWt}</div>
      <div class="r">${grandAvgWt}</div>
      <div></div>
    </div>
  `;

  return html + '</body></html>';
};


// Run unload report
const runUnloadReport = async () => {
  try {
    const params = new URLSearchParams({
      company: String(companyId),
      branch: String(branchId),
      dateFrom: dates.from,
      dateTo: dates.to
    });

    const res = await fetch(`/api/unload-report?${params.toString()}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      alert('No unload data found');
      return;
    }

    const html = generateUnloadHTMLReport(data, companyName);
    const win = window.open('', '_blank');
    win?.document.write(html);
    win?.document.close();
  } catch (err) {
    console.error(err);
    alert('Unload report error');
  }
};





// Generate HTML report for Sold Note
const generateSoldNoteReportHTML = (data: ReportItem[], company: string) => {
  const formatReportDateTime = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${day}-${month}-${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const reportDate = formatReportDateTime(new Date());

  // Group data by item description
  const groupedData = data.reduce((acc: Record<string, ReportItem[]>, item) => {
    if (!acc[item.itemGroup]) acc[item.itemGroup] = [];
    acc[item.itemGroup].push(item);
    return acc;
  }, {});

  let serialNo = 1;

  // Grand totals
  let grandVehicleCount = 0;
  let grandBRcvd = 0;
  let grandAccepted = 0;
  let grandGross = 0;
  let grandTare = 0;
  let grandBardana = 0;
  let grandDed = 0;
  let grandNet = 0;
  let grandSupWh = 0;
  let grandFreight = 0;

  let rows = '';

  Object.keys(groupedData).forEach(group => {
    let vehicleCount = 0;
    let acceptedTotal = 0;
    let dedTotal = 0;
    let netTotal = 0;

    // Group header
    rows += `
      <tr style="background:#e6f7ff; font-weight:bold;">
        <td colspan="17" style="text-align:left;">${group}</td>
      </tr>

      <tr>
        <th>Sr #</th>
        <th>MT</th>
        <th>FW Time</th>
        <th>SW Time</th>
        <th>GRN</th>
        <th>Vehicle</th>
        <th>Supplier</th>
        <th>B.Rcvd</th>
        <th>Accepted</th>
        <th>Gross</th>
        <th>Tare</th>
        <th>Bardana</th>
        <th>DED</th>
        <th>Net</th>
        <th>Sup.Wh</th>
        <th>Freight</th>
        <th>Status</th>
      </tr>
    `;

    groupedData[group].forEach(item => {
      vehicleCount += item.vehicleNo ? 1 : 0;
      acceptedTotal += Number(item.accepted || 0);
      dedTotal += Number(item.ded || 0);
      netTotal += Number(item.net || 0);

      grandVehicleCount += item.vehicleNo ? 1 : 0;
      grandBRcvd += Number(item.b_rcvd || 0);
      grandAccepted += Number(item.accepted || 0);
      grandGross += Number(item.gross || 0);
      grandTare += Number(item.tare || 0);
      grandBardana += Number(item.bardana || 0);
      grandDed += Number(item.ded || 0);
      grandNet += Number(item.net || 0);
      grandSupWh += Number(item.supWh || 0);
      grandFreight += Number(item.freight || 0);

      rows += `
        <tr>
          <td>${serialNo}</td>
          <td>${item.mt ?? ''}</td>
     <td>${formatPakistanTime(item.fwTime)}</td>
<td>${formatPakistanTime(item.swTime)}</td>
          <td style="color:red;">${item.grnNo ?? ''}</td>
          <td style="color:red;">${item.vehicleNo ?? ''}</td>
          <td>${item.supplierName ?? ''}</td>
          <td>${item.b_rcvd ?? 0}</td>
          <td>${item.accepted ?? 0}</td>
          <td>${item.gross ?? 0}</td>
          <td>${item.tare ?? 0}</td>
          <td>${item.bardana ?? 0}</td>
          <td>${item.ded ?? 0}</td>
          <td>${item.net ?? 0}</td>
          <td>${item.supWh ?? 0}</td>
          <td>${item.freight ?? 0}</td>
          <td class="${item.status?.toLowerCase() === 'sold_note' ? 'status-online' : ''}">
            ${item.status ?? ''}
          </td>
        </tr>
      `;
      serialNo++;
    });

    // Group totals
    rows += `
      <tr class="total-row">
        <td colspan="5">TOTAL</td>
        <td>${vehicleCount}</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>${acceptedTotal}</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>${dedTotal}</td>
        <td>${netTotal}</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
    `;
  });

  // Grand totals
  rows += `
    <tr class="grand-total">
      <td colspan="5"></td>
      <td>${grandVehicleCount}</td>
      <td></td>
      <td>${grandBRcvd}</td>
      <td>${grandAccepted}</td>
      <td>${grandGross}</td>
      <td>${grandTare}</td>
      <td>${grandBardana}</td>
      <td>${grandDed}</td>
      <td>${grandNet}</td>
      <td>${grandSupWh}</td>
      <td>${grandFreight}</td>
      <td></td>
    </tr>
  `;

 // Make sure reportDate includes AM/PM
const reportDateWithAMPM = new Date().toLocaleString('en-GB', {
  day:'2-digit',
  month:'short',
  year:'2-digit',
  hour:'2-digit',
  minute:'2-digit',
  hour12:true
});

return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Daily Sold Note Report</title>
  <style>
    body { font-family: Arial; margin: 20px; background:#f9f9f9; }
    h1, h2 { text-align:center; margin:0; font-weight:bold; }
    h1 { color: green; }
    h2 { color: red; margin-bottom:15px; }
    .report-date {
      text-align:right; 
      margin-bottom:10px; 
      font-size:16px; 
      font-weight:bold; 
      color:#333;
      display:flex;
      align-items:center;
      gap:5px;
      justify-content:flex-end;
    }
    .print-button {
      float:right;
      margin-bottom:15px;
      padding:8px 14px;
      font-size:14px;
      font-weight:bold;
      background:#1E90FF;
      color:white;
      border:none;
      cursor:pointer;
      border-radius:4px;
      display:flex;
      align-items:center;
      gap:5px;
    }
    .print-button:hover { background:#1C86EE; }
    table { width:100%; border-collapse:collapse; table-layout:auto; }
    th, td { border:1px solid #ccc; padding:6px; text-align:center; font-size:12px; }
    th { background:#d4edda; font-weight:bold; }
    .total-row td { color:red; font-weight:bold; border-top:2px solid black; }
    .status-online { color:green; font-weight:bold; }
    svg { width:16px; height:16px; }
  </style>
</head>
<body>
  <h1>${company} (PVT.) LTD.</h1>
  <h2>Daily Material Sold Note Report</h2>
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
    <div class="report-date">
      <!-- Calendar icon -->
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      Print Date: ${reportDateWithAMPM}
    </div>
    <button class="print-button" onclick="window.print()">
      <!-- Printer icon -->
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9V2h12v7M6 18h12v4H6v-4zM6 14h12v4H6v-4z"/>
      </svg>
      Print
    </button>
  </div>

  <table>
    ${rows}
  </table>
</body>
</html>
`;
};







// const runSoldNoteReport = async (
//   companyId: number,
//   branchId: number,
//   dates: { from: string; to: string },
//   companyName: string,
//   customerNameInput?: string,
//   vendorInput?: string,
//   itemInput?: string,
//   vehicleInput?: string
// ) => {
//   console.log('=== DEBUG: runSoldNoteReport called ===');
//   console.log('📅 Date range:', dates.from, 'to', dates.to);
//   console.log('👤 Customer filter:', customerNameInput);
//   console.log('🏭 Vendor filter:', vendorInput);
//   console.log('📦 Item filter:', itemInput);
//   console.log('🚚 Vehicle filter:', vehicleInput);
  
//   try {
//     const params = new URLSearchParams({
//       company: String(companyId),
//         vendor: vendorInput || '',  // Add vendor filter
//   item: itemInput || '',      // Add item filter
//   vehicle: vehicleInput || '',
//       branch: String(branchId),
//       dateFrom: dates.from,
//       dateTo: dates.to,
//     });

//     // ✅ Add CUSTOMER filter
//     if (customerNameInput && customerNameInput.trim()) {
//       params.append('customer', customerNameInput.trim());
//     }
    
//     // ✅ Add VENDOR filter
//     if (vendorInput && vendorInput.trim()) {
//       params.append('vendor', vendorInput.trim());
//     }
    
//     // ✅ Add ITEM filter
//     if (itemInput && itemInput.trim()) {
//       params.append('item', itemInput.trim());
//     }
    
//     // ✅ Add VEHICLE filter
//     if (vehicleInput && vehicleInput.trim()) {
//       params.append('vehicle', vehicleInput.trim());
//     }

//     const res = await fetch(`/api/sold-note-report?${params.toString()}`);
//     const rawData = await res.json();

//     if (!Array.isArray(rawData) || rawData.length === 0) {
//       alert('No Sold Note data returned for selected filters.');
//       return;
//     }

//     const data: ReportItem[] = rawData.map((d: any, i: number) => ({
//       srNo: i + 1,
//       mt: d.item_desc,
//       fwTime: d.slip_in_time,
//       swTime: d.slip_out_time,
//       grnNo: d.igp_no,
//       vehicleNo: d.vehicle_no,
//       supplierName: d.vendor_name,
//       b_rcvd: d.no_of_bags,
//       accepted: d.net_weight,
//       gross: d.first_weight,
//       tare: d.second_weight,
//       bardana: d.bardana_weight,
//       ded: d.quality_deduction,
//       net: d.net_weight,
//       supWh: d.supplier_weight,
//       freight: d.freight,
//       status: d.status,
//       itemGroup: d.item_desc
//     }));

//     const html = generateSoldNoteReportHTML(data, companyName);
//     const win = window.open('', '_blank');
//     if (win) {
//       win.document.write(html);
//       win.document.close();
//     } else alert('Popup blocked!');
//   } catch (err) {
//     console.error('Sold Note report error:', err);
//     alert('Error loading Sold Note report');
//   }
// };


const runSoldNoteReport = async (
  companyId: number,
  branchId: number,
  dates: { from: string; to: string },
  companyName: string,
  customerNameInput?: string,
  vendorInput?: string,
  itemInput?: string,
  vehicleInput?: string
) => {
  console.log('=== DEBUG: runSoldNoteReport called ===');
  console.log('📅 Date range:', dates.from, 'to', dates.to);
  console.log('👤 Customer filter:', customerNameInput);
  console.log('🏭 Vendor filter:', vendorInput);
  console.log('📦 Item filter:', itemInput);
  console.log('🚚 Vehicle filter:', vehicleInput);
  
  try {
    const params = new URLSearchParams({
      company: String(companyId),
      vendor: vendorInput || '',  // Add vendor filter
      item: itemInput || '',      // Add item filter
      vehicle: vehicleInput || '',
      branch: String(branchId),
      dateFrom: dates.from,
      dateTo: dates.to,
    });

    // ✅ Add CUSTOMER filter
    if (customerNameInput && customerNameInput.trim()) {
      params.append('customer', customerNameInput.trim());
    }
    
    // ✅ Add VENDOR filter
    if (vendorInput && vendorInput.trim()) {
      params.append('vendor', vendorInput.trim());
    }
    
    // ✅ Add ITEM filter
    if (itemInput && itemInput.trim()) {
      params.append('item', itemInput.trim());
    }
    
    // ✅ Add VEHICLE filter
    if (vehicleInput && vehicleInput.trim()) {
      params.append('vehicle', vehicleInput.trim());
    }

    const res = await fetch(`/api/sold-note-report?${params.toString()}`);
    const rawData = await res.json();

    if (!Array.isArray(rawData) || rawData.length === 0) {
      alert('No Sold Note data returned for selected filters.');
      return;
    }

    // ✅ CORRECTED FIELD MAPPING:
    const data: ReportItem[] = rawData.map((d: any, i: number) => ({
      srNo: i + 1,
      mt: d.item_desc,
      fwTime: d.slip_in_time,
      swTime: d.slip_out_time,
      grnNo: d.grn_no,  // Changed from d.igp_no to d.grn_no
      vehicleNo: d.vehicle_no,
      supplierName: d.supp_name,  // Changed from d.vendor_name to d.supp_name
      b_rcvd: Number(d.b_rcvd) || 0,  // ✅ This should now work
      accepted: Number(d.accepted) || 0,  // Changed from d.net_weight to d.accepted
      gross: Number(d.gross) || 0,
      tare: Number(d.tare) || 0,
      bardana: Number(d.bardana) || 0,
      ded: Number(d.ded) || 0,  // ✅ This should now work
      net: Number(d.net_weight) || 0,  // ✅ This should now work
      supWh: Number(d.supplier_weight) || 0,
      freight: Number(d.freight) || 0,
      status: d.status,
      itemGroup: d.item_desc
    }));

    console.log('✅ Mapped data for Sold Note:', data);

    const html = generateSoldNoteReportHTML(data, companyName);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    } else alert('Popup blocked!');
  } catch (err) {
    console.error('Sold Note report error:', err);
    alert('Error loading Sold Note report');
  }
};



const generateSaleReportHTML = (
  data: SaleReportItem[],
  company: string,
  bagsSummary: { item_desc: string; BAGS: number; NET_WEIGHT: number }[] = []
) => {
  const reportDate = new Date().toLocaleString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  });

  let rows = '';
  let serialNo = 0;

  let totalVehicles = 0;
  let totalBags = 0;
  let totalNetWeight = 0;

  const groupedData: Record<string, SaleReportItem[]> = {};
  data.forEach(item => {
    const party = item.customerName || 'Unknown';
    if (!groupedData[party]) groupedData[party] = [];
    groupedData[party].push(item);
  });

  Object.keys(groupedData).forEach(party => {
    const groupItems = groupedData[party];
    let vehicleCount = 0;
    let bagsCount = 0;
    let netWeightCount = 0;

    rows += `<tr><td colspan="11" class="dnn-row">Party: ${party}</td></tr>`;

    // Group by slipNo (DNN) — same DNN ke records ek saath
    const vehicleGrouped: Record<string, SaleReportItem[]> = {};
    groupItems.forEach(item => {
      const key = item.slipNo || 'Unknown';
      if (!vehicleGrouped[key]) vehicleGrouped[key] = [];
      vehicleGrouped[key].push(item);
    });

    Object.keys(vehicleGrouped).forEach(key => {
      const vItems = vehicleGrouped[key];
      const vNo = vItems[0].vehicleNo || 'Unknown';
      vehicleCount++;

      vItems.forEach((item, index) => {
        if (index === 0) serialNo++;

        bagsCount += Number(item.noOfBags || 0);
        netWeightCount += Number(item.netWeight || 0);

        // ✅ Status: Online / Offline with color
        let status = '';
        let statusClass = '';
        if (item.status === 'Online' || item.status === 'online' || item.status === 'ONLINE') {
          status = 'Online';
          statusClass = 'status-online';
        } else if (item.status === 'Offline' || item.status === 'offline' || item.status === 'OFFLINE') {
          status = 'Offline';
          statusClass = 'status-offline';
        } else {
          status = '-';
          statusClass = '';
        }

        rows += `
<tr>
  <td>${index === 0 ? serialNo : ''}</td>
  <td>${index === 0 ? item.slipNo || '' : ''}</td>
  <td>${index === 0 ? item.manual_dc_no || '' : ''}</td>
  <td>${index === 0 ? formatPakistanTime(item.fwTime) : ''}</td>
  <td>${index === 0 ? formatPakistanTime(item.swTime) : ''}</td>
  <td>${index === 0 ? vNo : ''}</td>
  <td>${index === 0 ? item.customerName || '' : ''}</td>
  <td>${index === 0 ? item.mt || '' : ''}</td>
  <td>${item.noOfBags || 0}</td>
  <td>${item.netWeight || 0}</td>
  <td class="${statusClass}">${index === 0 ? status : ''}</td>
</tr>`;
      });
    });

    totalVehicles += vehicleCount;
    totalBags += bagsCount;
    totalNetWeight += netWeightCount;

    // ✅ Vehicle Count: Label Time Out column (5th column index), Value Vehicle column (6th column index)
    rows += `
<tr class="vehicle-count-row">
  <td></td><td></td><td></td><td></td>
  <td>Vehicle Count</td>  <!-- ✅ Label in Time Out column -->
  <td>${vehicleCount}</td>  <!-- ✅ Value in Vehicle column -->
  <td></td><td></td>
  <td>${bagsCount}</td>
  <td>${netWeightCount}</td>
  <td></td>
</tr>`;
  });

  // ✅ Grand Total: Label Time Out column, Value Vehicle column
  rows += `
<tr class="vehicle-count-row">
  <td></td><td></td><td></td><td></td>
  <td><b>Total Vehicle Count</b></td>  <!-- ✅ Label in Time Out column -->
  <td>${totalVehicles}</td>  <!-- ✅ Value in Vehicle column -->
  <td></td><td></td>
  <td>${totalBags}</td>
  <td>${totalNetWeight}</td>
  <td></td>
</tr>`;

  // ✅ Bags Summary with Net Weight (No commas in Net Weight)
  const mappedBagsSummary = bagsSummary.map(item => ({
    item_desc: item.item_desc || 'Unknown',
    BAGS: Number(item.BAGS ?? 0),
    NET_WEIGHT: Number(item.NET_WEIGHT ?? 0)
  }));

  let bagsRows = '';
  mappedBagsSummary.forEach(item => {
    bagsRows += `
<tr>
  <td>${item.item_desc}</td>
  <td>${item.BAGS}</td>
  <td>${item.NET_WEIGHT}</td>   <!-- ✅ Removed .toLocaleString('en-IN') -->
</tr>`;
  });

  const totalBagsSummary = mappedBagsSummary.reduce((sum, item) => sum + item.BAGS, 0);
  const totalNetWeightSummary = mappedBagsSummary.reduce((sum, item) => sum + item.NET_WEIGHT, 0);

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Daily Feed Delivery Report</title>
<style>
  body { font-family: Arial; margin:20px; }
  h1 { text-align:center; color:#8B0000; margin:0 0 5px 0; }
  .report-header {
    display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;
  }
  .report-title { flex:1; text-align:center; font-weight:bold; color:blue; font-size:16px; }
  .print-btn {
    padding:5px 10px; font-size:12px; cursor:pointer; background-color:#007BFF;
    color:white; border:none; border-radius:4px; display:flex; align-items:center; gap:4px; margin-left:10px;
  }
  table { width:100%; border-collapse:collapse; margin-top:10px; }
  th, td { border:1px solid #444; padding:6px; font-size:12px; text-align:center; }
  th { color:green; font-weight:bold; }
  .dnn-row { color:blue; font-weight:bold; text-align:left; padding:6px 0; padding-left:6px; }
  .vehicle-count-row { text-align:center; color:#8B0000; font-weight:bold; }
  .status-online { color:green; font-weight:bold; }
  .status-offline { color:red; font-weight:bold; }
</style>
</head>
<body>

<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
  <div style="flex:1;"></div>
  <h1 style="margin:0; flex:1; text-align:center;">${company}</h1>
  <div style="flex:1; text-align:right;"><b>Report Date :</b> ${reportDate}</div>
</div>

<div class="report-header">
  <div class="report-title">
    Daily Feed Delivery Report &nbsp;
    From ${data[0]?.fwTime ? formatPakistanTime(data[0].fwTime) : '-'}
    To ${data[data.length - 1]?.swTime ? formatPakistanTime(data[data.length - 1].swTime) : '-'}
  </div>
  <button class="print-btn" onclick="window.print()">🖨️ Print</button>
</div>

<table>
  <tr>
    <th>Sr #</th>
    <th>DNN #</th>
    <th>D.C #</th>
    <th>Time In</th>
    <th>Time Out</th>
    <th>Vehicle #</th>
    <th>Party Name</th>
    <th>Feed Name</th>
    <th>Bags</th>
    <th>Net Weight</th>
    <th>Status</th>
  </tr>
  ${rows}
</table>

${mappedBagsSummary.length ? `
<h3 style="margin-top:20px;">Bags Summary</h3>
<table>
  <tr>
    <th>Feed Name</th>
    <th>Total Bags</th>
    <th>Net Weight</th>
  </tr>
  ${bagsRows}
  <tr>
    <td><b>Total</b></td>
    <td><b>${totalBagsSummary}</b></td>
    <td><b>${totalNetWeightSummary}</b></td>   <!-- ✅ Removed .toLocaleString('en-IN') -->
  </tr>
</table>` : ''}

</body>
</html>
`;
};




const runSaleReport = async (
  companyId: number,
  branchId: number,
  dates: { from: string; to: string },
  companyName: string,
  customerNameInput?: string,
  vendorInput?: string,
  itemInput?: string,
  vehicleInput?: string
) => {
  console.log('=== DEBUG: runSaleReport called ===');
  console.log('📅 Date range:', dates.from, 'to', dates.to);
  console.log('👤 Customer filter:', customerNameInput);
  console.log('🏭 Vendor filter:', vendorInput);
  console.log('📦 Item filter:', itemInput);
  console.log('🚚 Vehicle filter:', vehicleInput);
  
  try {
    const params = new URLSearchParams();
    params.append('company', String(companyId));
    params.append('branch', String(branchId));
    
    if (customerNameInput && customerNameInput.trim()) {
      params.append('customer', customerNameInput.trim());
    }
    
    if (vendorInput && vendorInput.trim()) {
      params.append('vendor', vendorInput.trim());
    }
    
    if (itemInput && itemInput.trim()) {
      params.append('item', itemInput.trim());
    }
    
    if (vehicleInput && vehicleInput.trim()) {
      params.append('vehicle', vehicleInput.trim());
    }
    
    params.append('dateFrom', dates.from);
    params.append('dateTo', dates.to);

    console.log('Fetching Sale Report with params:', params.toString());

    const res = await fetch(`/api/sale-report?${params.toString()}`);
    if (!res.ok) {
      const text = await res.text();
      console.error('Sale Report API returned error:', text);
      alert(`Error fetching Sale Report: ${text}`);
      return;
    }

    const rawData = await res.json();

    if (!rawData || !Array.isArray(rawData.sales) || rawData.sales.length === 0) {
      alert('No Sale data found for selected filters.');
      return;
    }

    // ✅ FRONTEND CUSTOMER FILTER
    let salesData = rawData.sales;

    if (customerNameInput && customerNameInput.trim()) {
      const customerFilter = customerNameInput.trim().toLowerCase();
      salesData = salesData.filter((d: any) =>
        (d.party_name || '').toLowerCase().includes(customerFilter)
      );
    }

    if (!salesData.length) {
      alert('No Sale data found for selected customer.');
      return;
    }

    // ✅ Map data with status
    const data: SaleReportItem[] = salesData.map((d: any, i: number) => ({
      srNo: i + 1,
      mt: d.feed_name,
      fwTime: d.slip_in_time,
      swTime: d.slip_out_time,
      slipNo: d.slip_no,
      manual_dc_no: d.manual_dc_no || '',  
      vehicleNo: d.vehicle_no,
      customerName: d.party_name,
      noOfBags: d.no_of_bags,
      netWeight: Number(d.net_weight || 0),
      freight: d.freight ?? 0,
      branchName: d.company_name,
      itemGroup: d.feed_name,
      status: d.status || '',  // ✅ NEW: status from API
    }));

    console.log('First item full:', JSON.stringify(data[0]));

    // ✅ BAG SUMMARY FROM FILTERED DATA (WITH NET WEIGHT)
    const bagMap: Record<string, { BAGS: number; NET_WEIGHT: number }> = {};

    salesData.forEach((item: any) => {
      const key = item.feed_name || 'Unknown';
      const bags = Number(item.no_of_bags) || 0;
      const netWeight = Number(item.net_weight) || 0;

      if (!bagMap[key]) {
        bagMap[key] = { BAGS: 0, NET_WEIGHT: 0 };
      }

      bagMap[key].BAGS += bags;
      bagMap[key].NET_WEIGHT += netWeight;
    });

    const bagsSummaryMapped: { item_desc: string; BAGS: number; NET_WEIGHT: number }[] =
      Object.keys(bagMap).map((key) => ({
        item_desc: key,
        BAGS: bagMap[key].BAGS,
        NET_WEIGHT: bagMap[key].NET_WEIGHT
      }));

    console.log('Mapped Sale Report data:', data);
    console.log('Bags Summary data:', bagsSummaryMapped);

    const html = generateSaleReportHTML(data, companyName, bagsSummaryMapped);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    } else {
      alert('Popup blocked!');
    }

  } catch (err) {
    console.error('Sale Report fetch error:', err);
    alert('Error loading Sale Report. Check console.');
  }
};






const generateSaleDOHTMLReport = (
  detailed: SaleDOReportItem[],
  itemWise: ItemWiseSummary[],
  filterParams: {
    fromDate: string;
    toDate: string;
    customer?: string;
    vendor?: string;
    item?: string;
    vehicle?: string;
  } = {
    fromDate: '',
    toDate: '',
    customer: '',
    vendor: '',
    item: '',
    vehicle: ''
  }
) => {
  const reportDate = new Date().toLocaleString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  let rows = '';
  let serialNo = 0;

  let totalVehicles = 0;
  let totalFreight = 0;
  let totalBags = 0;

  // Helper function to format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    } catch (e) {
      return dateStr;
    }
  };

  // Extract actual dates from data if filter dates are not provided
  const actualFromDate = detailed.length > 0 && detailed[0]?.slip_in_time 
    ? formatDate(detailed[0].slip_in_time)
    : '';
  
  const actualToDate = detailed.length > 0 && detailed[detailed.length - 1]?.slip_out_time
    ? formatDate(detailed[detailed.length - 1].slip_out_time)
    : '';

  // Use filter dates if provided, otherwise use actual dates from data
  const displayFromDate = filterParams.fromDate ? formatDate(filterParams.fromDate) : actualFromDate;
  const displayToDate = filterParams.toDate ? formatDate(filterParams.toDate) : actualToDate;

  // Sort by DC number (NO GROUPING)
  const sortedDetailed = [...detailed].sort((a, b) => {
    const dcA = a.manual_dc_no || '';
    const dcB = b.manual_dc_no || '';

    // Method 1: Direct numeric comparison
    const numA = Number(dcA);
    const numB = Number(dcB);
    
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    
    // Method 2: Extract numbers from strings like "DC123", "123", "DC-123"
    const extractNumber = (str: string): number => {
      // Remove all non-digit characters and convert to number
      const num = parseInt(str.replace(/\D/g, ''));
      return isNaN(num) ? 0 : num;
    };
    
    const extractedNumA = extractNumber(dcA);
    const extractedNumB = extractNumber(dcB);
    
    if (extractedNumA !== 0 && extractedNumB !== 0 && extractedNumA !== extractedNumB) {
      return extractedNumA - extractedNumB;
    }
    
    // Method 3: Alphanumeric sort as fallback
    return dcA.localeCompare(dcB, undefined, { 
      numeric: true, 
      sensitivity: 'base' 
    });
  });

  // Generate rows from sorted list
  sortedDetailed.forEach(item => {
    serialNo++;
    totalVehicles++;
    totalFreight += Number(item.freight || 0);
    totalBags += Number(item.no_of_bags || 0);

    rows += `
<tr>
  <td>${serialNo}</td>
  <td>${item.slip_no || ''}</td>
  <td>${item.manual_dc_no || ''}</td> <!-- DC No - sorted ascending -->
  <td>${item.do_no || ''}</td>
  <td>${item.slip_in_time ? item.slip_in_time.replace('T', ' ').replace('.000Z', '') : ''}</td>
  <td>${item.slip_out_time ? item.slip_out_time.replace('T', ' ').replace('.000Z', '') : ''}</td>
  <td>${item.vehicle_no || ''}</td>
  <td>${item.freight || 0}</td>
  <td>${item.party_name || item.customer_name || ''}</td>
  <td>${item.item_desc || ''}</td>
  <td>${item.no_of_bags || 0}</td>
</tr>`;
  });

  // Grand total
  rows += `
<tr class="vehicle-count-row">
  <td colspan="5"><b>Total Vehicle Count</b></td>
  <td></td>
  <td>${totalVehicles}</td>
  <td>${totalFreight}</td>
  <td></td>
  <td></td>
  <td>${totalBags}</td>
</tr>`;

  // Bags Summary Table with total sum
  const mappedBagsSummary = itemWise.map(item => ({
    item_desc: item.item_desc || 'Unknown',
    BAGS: Number(item.bags ?? 0)
  }));

  let bagsRows = '';
  let totalBagsSummary = 0;
  mappedBagsSummary.forEach(item => {
    bagsRows += `
<tr>
  <td>${item.item_desc}</td>
  <td>${item.BAGS}</td>
</tr>`;
    totalBagsSummary += item.BAGS;
  });

  const bagsSummaryHTML = mappedBagsSummary.length ? `
<h3 style="margin-top:20px;">Bags Summary</h3>
<table>
  <tr>
    <th>Feed Name</th>
    <th>Total Bags</th>
  </tr>
  ${bagsRows}
  <tr>
    <td><b>Total</b></td>
    <td><b>${totalBagsSummary}</b></td>
  </tr>
</table>` : '';

  // Generate filters display HTML
  let filtersHTML = '';
  if (filterParams.fromDate || filterParams.toDate || 
      filterParams.customer || filterParams.vendor || 
      filterParams.item || filterParams.vehicle) {
    
    filtersHTML = `
<div style="margin: 15px 0; padding: 10px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
  <h4 style="margin: 0 0 10px 0; color: #495057;">Applied Filters:</h4>
  <div style="display: flex; flex-wrap: wrap; gap: 15px; font-size: 13px;">
    ${filterParams.fromDate || filterParams.toDate ? `
    <div>
      <strong>Date Range:</strong> ${displayFromDate} to ${displayToDate}
    </div>` : ''}
    
    ${filterParams.customer ? `
    <div>
      <strong>Customer:</strong> ${filterParams.customer}
    </div>` : ''}
    
    ${filterParams.vendor ? `
    <div>
      <strong>Vendor:</strong> ${filterParams.vendor}
    </div>` : ''}
    
    ${filterParams.item ? `
    <div>
      <strong>Item:</strong> ${filterParams.item}
    </div>` : ''}
    
    ${filterParams.vehicle ? `
    <div>
      <strong>Vehicle:</strong> ${filterParams.vehicle}
    </div>` : ''}
  </div>
</div>`;
  }

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>DO-wise Sale Report</title>
<style>
  body { 
    font-family: Arial, sans-serif; 
    margin: 20px; 
    background-color: #ffffff;
  }
  
  /* Fixed header */
  .sticky-header {
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 100;
    padding-bottom: 10px;
    border-bottom: 2px solid #8B0000;
  }
  
  h1 { 
    text-align: center; 
    color: #8B0000; 
    margin: 0 0 5px 0; 
    font-size: 24px;
  }
  
  .report-header { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 15px;
    padding: 10px 0;
  }
  
  .report-title { 
    flex: 1; 
    text-align: center; 
    font-weight: bold; 
    color: #0056b3; 
    font-size: 16px;
  }
  
  .print-btn { 
    padding: 8px 16px; 
    font-size: 14px; 
    cursor: pointer; 
    background-color: #007BFF; 
    color: white; 
    border: none; 
    border-radius: 4px; 
    display: flex; 
    align-items: center; 
    gap: 6px; 
    margin-left: 10px;
    transition: background-color 0.2s;
  }
  
  .print-btn:hover {
    background-color: #0056b3;
  }
  
  table { 
    width: 100%; 
    border-collapse: collapse; 
    margin-top: 15px; 
    font-size: 12px;
  }
  
  th, td { 
    border: 1px solid #444; 
    padding: 8px; 
    text-align: center; 
    position: relative;
  }
  
  /* Table headings with border-bottom */
  th { 
    background-color: #f2f2f2; 
    color: #000; 
    font-weight: bold;
    position: sticky;
    top: 150px; /* Adjust based on header height */
    z-index: 99;
    border-bottom: 2px solid #000 !important;
  }
  
  /* Add border-bottom for all th cells */
  th::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 2px;
    background-color: #000;
  }
  
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  tr:hover {
    background-color: #e6f7ff;
  }
  
  .vehicle-count-row { 
    background-color: #e6f7ff !important; 
    font-weight: bold; 
    color: #000;
  }
  
  .checked-by-container {
    margin-top: 90px;
    display: none;
  }
  
  .checked-by-line {
    display: inline-block;
    width: 200px;
    border-bottom: 1px solid #000;
    margin-left: 10px;
    vertical-align: middle;
  }
  
  .filter-info {
    margin: 10px 0;
    padding: 10px;
    background-color: #f8f9fa;
    border-left: 4px solid #007BFF;
    font-size: 13px;
  }
  
  @media print {
    .print-btn { display: none; }
    .no-print { display: none; }
    
    /* Page margins */
    @page {
      margin: 15mm 10mm 20mm 10mm;
      @bottom-center {
        content: "Page " counter(page) " of " counter(pages);
        font-size: 12px;
        font-weight: bold;
        color: #000000;
      }
    }
    
    /* Initialize page counter */
    body {
      counter-reset: page;
    }
    
    /* Ensure table headers repeat on each printed page */
    thead { 
      display: table-header-group; 
    }
    
    /* Remove sticky positioning for print */
    .sticky-header {
      position: static;
    }
    
    th {
      position: static;
    }
    
    /* Remove the pseudo-element for print */
    th::after {
      display: none;
    }
    
    /* Show Checked By section in print */
    .checked-by-container {
      display: block;
      page-break-inside: avoid;
    }
    
    /* Print quality improvements */
    table {
      page-break-inside: auto;
    }
    
    tr {
      page-break-inside: avoid;
    }
    
    th {
      background-color: #f2f2f2 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      border-bottom: 2px solid #000 !important;
    }
  }
</style>
</head>
<body>

<div class="sticky-header">
  <div class="report-header">
    <div style="flex:1;">
      <div style="font-size: 14px; color: #666;">
        <strong>Report Generated:</strong> ${reportDate}
      </div>
    </div>
    <h1 style="margin:0; flex:1; text-align:center;">DO-wise Sale Report</h1>
    <div style="flex:1; text-align:right;">
      <button class="print-btn" onclick="window.print()">🖨️ Print Report</button>
    </div>
  </div>
  
  <div class="report-title">
    Report Period: ${displayFromDate} to ${displayToDate}
  </div>
  
  ${filtersHTML}
  
  <div style="margin: 10px 0; font-size: 13px; color: #495057;">
    <strong>Total Records:</strong> ${detailed.length} vehicles
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>Sr #</th>
      <th>Slip #</th>
      <th>DC #</th>
      <th>DO #</th>
      <th>Time In</th>
      <th>Time Out</th>
      <th>Vehicle #</th>
      <th>Freight</th>
      <th>Party Name</th>
      <th>Feed Name</th>
      <th>Bags</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>

${bagsSummaryHTML}

<!-- Checked By section (only shows when printing) -->
<div class="checked-by-container">
  <div style="text-align: left;">
    <strong>Checked By:</strong>
    <span class="checked-by-line"></span>
  </div>
</div>

<div style="margin-top: 30px; padding: 10px; border-top: 1px solid #dee2e6; font-size: 12px; color: #666; text-align: center;" class="no-print">
  <div>DO-wise Sale Report - Generated by System</div>
  <div>Page numbers will appear when printing</div>
</div>

</body>
</html>`;
};




const runSaleDOReport = async (
  companyId: number,
  branchId: number,
  dates: { from: string; to: string },
  companyName: string,
  customerNameInput?: string,
  vendorInput?: string,
  itemInput?: string,
  vehicleInput?: string,
  doWiseChecked: boolean = false
) => {
  if (!doWiseChecked) {
    alert('Please select DO Wise to generate report.');
    return;
  }

  console.log('=== DEBUG: runSaleDOReport called ===');
  console.log('📅 Date range:', dates.from, 'to', dates.to);
  console.log('👤 Customer filter:', customerNameInput);
  console.log('🏭 Vendor filter:', vendorInput);
  console.log('📦 Item filter:', itemInput);
  console.log('🚚 Vehicle filter:', vehicleInput);
  
  try {
    const params = new URLSearchParams({
      company: String(companyId),
      branch: String(branchId),
      dateFrom: dates.from,
      dateTo: dates.to,
    });

    // ✅ Add CUSTOMER filter
    if (customerNameInput && customerNameInput.trim()) {
      params.append('customer', customerNameInput.trim());
    }
    
    // ✅ Add VENDOR filter
    if (vendorInput && vendorInput.trim()) {
      params.append('vendor', vendorInput.trim());
    }
    
    // ✅ Add ITEM filter
    if (itemInput && itemInput.trim()) {
      params.append('item', itemInput.trim());
    }
    
    // ✅ Add VEHICLE filter
    if (vehicleInput && vehicleInput.trim()) {
      params.append('vehicle', vehicleInput.trim());
    }

    const res = await fetch(`/api/sale-do-report?${params.toString()}`);
    const data = await res.json();

    if (!data?.detailed?.length) {
      alert('No Sale DO data found');
      return;
    }

    // Pass filter parameters to the HTML generator
    const html = generateSaleDOHTMLReport(
      data.detailed, 
      data.itemWiseSummary,
      {
        fromDate: dates.from,
        toDate: dates.to,
        customer: customerNameInput?.trim(),
        vendor: vendorInput?.trim(),
        item: itemInput?.trim(),
        vehicle: vehicleInput?.trim()
      }
    );
    
    const win = window.open('', '_blank');
    win?.document.write(html);
    win?.document.close();
  } catch (err) {
    console.error(err);
    alert('Error generating Sale DO report');
  }
};


const generateSCReportHTML = (
  data: SCReportItem[],
  company: string,
  bagsSummary: { item_desc: string; BAGS: number | string }[] = []
) => {
  const reportDate = new Date().toLocaleString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  let rows = '';
  let serialNo = 0;
  let totalVehicles = 0;
  let totalFreight = 0;
  let totalBags = 0;

  const groupedData: Record<string, SCReportItem[]> = {};
  data.forEach(item => {
    // ✅ DNN = DC No
    const dnn = item.dcNo || 'UNKNOWN';
    if (!groupedData[dnn]) groupedData[dnn] = [];
    groupedData[dnn].push(item);
  });

  Object.keys(groupedData).forEach(dnn => {
    const groupItems = groupedData[dnn];
    let vehicleCount = 0;
    let freightCount = 0;
    let bagsCount = 0;

    rows += `<tr><td colspan="11" class="dnn-row">DNN ${dnn}</td></tr>`;

    groupItems.forEach(item => {
      serialNo++;
      vehicleCount++;
      freightCount += Number(item.freight || 0);
      bagsCount += Number(item.noOfBags || 0);

      rows += `
<tr>
  <td>${serialNo}</td>
  <td>${item.slipNo || ''}</td>
  <td>${item.dcNo || ''}</td>
  <td>${item.doNo || ''}</td>
<td>${formatPakistanTime(item.fwTime)}</td>
<td>${formatPakistanTime(item.swTime)}</td>

  <td>${item.vehicleNo || ''}</td>
  <td>${item.freight || 0}</td>
  <td>${item.customerName || ''}</td>
  <td>${item.mt || ''}</td>
  <td>${item.noOfBags || 0}</td>
</tr>`;
    });

    totalVehicles += vehicleCount;
    totalFreight += freightCount;
    totalBags += bagsCount;

    rows += `
<tr class="vehicle-count-row">
  <td colspan="6" style="text-align:right;"><b>Vehicle Count</b></td>
  <td>${vehicleCount}</td>
  <td>${freightCount}</td>
  <td colspan="2"></td>
  <td>${bagsCount}</td>
</tr>`;
  });

  rows += `
<tr class="vehicle-count-rowW">
  <td colspan="6" style="text-align:right;"><b>Total</b></td>
  <td>${totalVehicles}</td> 
  <td>${totalFreight}</td>
  <td colspan="2"></td>
  <td>${totalBags}</td>
</tr>`;

 // ------------------ Bags Summary Fix for numeric BAGS ------------------
const mappedBagsSummary = bagsSummary.map(item => ({
  item_desc: item.item_desc || 'Unknown',
  BAGS: Number(item.BAGS) || 0 // ✅ directly numeric
}));

let bagsRows = '';
mappedBagsSummary.forEach(item => {
  bagsRows += `
<tr>
  <td>${item.item_desc}</td>
  <td>${item.BAGS}</td>
</tr>`;
});

const totalBagsSummary = mappedBagsSummary.reduce((sum, item) => sum + item.BAGS, 0);

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Single Customer Report</title>
<style>
  body { font-family: Arial; margin:20px; }
  h1 { text-align:center; color:#8B0000; margin:0 0 5px 0; }
  .report-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; }
  .report-title { flex:1; text-align:center; font-weight:bold; color:blue; font-size:16px; }
  .print-btn { padding:5px 10px; font-size:12px; cursor:pointer; background-color:#007BFF;
               color:white; border:none; border-radius:4px; display:flex; align-items:center; gap:4px; margin-left:10px; }
  table { width:100%; border-collapse:collapse; margin-top:10px; }
  th, td { border:1px solid #444; padding:6px; font-size:12px; text-align:center; }
  th { color:green; font-weight:bold; }
  .dnn-row { color:blue; font-weight:bold; text-align:left; padding:6px 0; padding-left:6px; }
  .vehicle-count-row { text-align:center; color:#8B0000; font-weight:bold; }

    .vehicle-count-rowW { text-align:center; color:blue; font-weight:bold; }

</style>
</head>
<body>

<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
  <div style="flex:1;"></div>
  <h1 style="margin:0; flex:1; text-align:center;">${company}</h1>
  <div style="flex:1; text-align:right;"><b>Report Date :</b> ${reportDate}</div>
</div>

<div class="report-header">
  <div class="report-title">
    Single Customer Report &nbsp; From ${data[0]?.fwTime || '-'} To ${data[data.length - 1]?.swTime || '-'}
  </div>
  <button class="print-btn" onclick="window.print()">🖨️ Print</button>
</div>

<table>
  <tr>
    <th>Sr #</th>
    <th>Slip #</th>
    <th>D.C #</th>
    <th>D.O #</th>
    <th>Time In</th>
    <th>Time Out</th>
    <th>Vehicle #</th>
    <th>Freight</th>
    <th>Party Name</th>
    <th>Feed Name</th>
    <th>Bags</th>
  </tr>
  ${rows}
</table>

${mappedBagsSummary.length ? `
<h3 style="margin-top:20px;">Bags Summary</h3>
<table>
  <tr>
    <th>Feed Name</th>
    <th>Total Bags</th>
  </tr>
  ${bagsRows}
  <tr>
    <td><b>Total</b></td>
    <td><b>${totalBagsSummary}</b></td>
  </tr>
</table>` : ''}

</body>
</html>
`;
};



// ------------------ Run Single Customer DO-wise Report ------------------
const runSCReport = async (
  companyId: number,
  branchId: number,
  dates: { from: string; to: string },
  companyName: string,
  customerNameInput?: string,
  vendorInput?: string,
  itemInput?: string,
  vehicleInput?: string
) => {
  console.log('=== DEBUG: runSCReport called ===');
  console.log('📅 Date range:', dates.from, 'to', dates.to);
  console.log('👤 Customer filter:', customerNameInput);
  console.log('🏭 Vendor filter:', vendorInput);
  console.log('📦 Item filter:', itemInput);
  console.log('🚚 Vehicle filter:', vehicleInput);
  console.log('🏢 Company ID:', companyId, 'Branch ID:', branchId);
  
  try {
    const params = new URLSearchParams({
      company: String(companyId),
      branch: String(branchId),
      dateFrom: dates.from,
      dateTo: dates.to,
    });

    // ✅ Add CUSTOMER filter
    if (customerNameInput && customerNameInput.trim()) {
      const trimmedCustomer = customerNameInput.trim();
      console.log('✅ Adding customer to params:', trimmedCustomer);
      params.append('customer', trimmedCustomer);
    } else {
      console.log('❌ Customer input is empty or falsy');
    }
    
    // ✅ Add VENDOR filter
    if (vendorInput && vendorInput.trim()) {
      const trimmedVendor = vendorInput.trim();
      console.log('✅ Adding vendor to params:', trimmedVendor);
      params.append('vendor', trimmedVendor);
    } else {
      console.log('❌ Vendor input is empty or falsy');
    }
    
    // ✅ Add ITEM filter
    if (itemInput && itemInput.trim()) {
      const trimmedItem = itemInput.trim();
      console.log('✅ Adding item to params:', trimmedItem);
      params.append('item_desc', trimmedItem);
    } else {
      console.log('❌ Item input is empty or falsy');
    }
    
    // ✅ Add VEHICLE filter
    if (vehicleInput && vehicleInput.trim()) {
      const trimmedVehicle = vehicleInput.trim();
      console.log('✅ Adding vehicle to params:', trimmedVehicle);
      params.append('vehicle_no', trimmedVehicle);
    } else {
      console.log('❌ Vehicle input is empty or falsy');
    }

    console.log('🌐 Final API URL params:', params.toString());
    
    const url = `/api/sale-single-customer-report?${params.toString()}`;
    console.log('🌐 Full API URL:', url);

    console.log('📤 Making API call...');
    const res = await fetch(url);
    console.log('✅ API response status:', res.status);

    if (!res.ok) {
      const text = await res.text();
      console.error('SC API error:', text);
      alert(`Error fetching SC report: ${text}`);
      return;
    }

    const rawData = await res.json();
    console.log('📥 API response data:', rawData);
    console.log('Detailed rows count:', rawData?.detailed?.length || 0);
    console.log('Item wise summary count:', rawData?.itemWiseSummary?.length || 0);

    if (!rawData?.detailed?.length) {
      console.log('❌ No data returned. Possible reasons:');
      console.log('1. No sales data for the selected filters');
      console.log('2. Filters too restrictive');
      console.log('3. Date range has no data');
      
      alert('No data found for the selected filters. Try broadening your filters.');
      return;
    }

    console.log('✅ Processing data for HTML...');
    const data: SCReportItem[] = rawData.detailed.map((d: any, i: number) => ({
      srNo: i + 1,
      mt: d.item_desc,
      fwTime: d.slip_in_time,
      swTime: d.slip_out_time,
      slipNo: d.slip_no,
      dcNo: d.manual_dc_no,
      doNo: d.do_no,
      vehicleNo: d.vehicle_no,
      customerName: d.party_name,
      noOfBags: Number(d.no_of_bags ?? 0),
      freight: Number(d.freight ?? 0),
      branchName: d.branch_name || companyName,
    }));

    const bagsSummary: { item_desc: string; BAGS: number }[] =
      Array.isArray(rawData.itemWiseSummary)
        ? rawData.itemWiseSummary.map((item: any) => ({
            item_desc: item.item_desc || 'Unknown',
            BAGS: Number(item.bags ?? 0),
          }))
        : [];

    console.log('✅ Generated HTML data:', { 
      dataCount: data.length, 
      bagsSummaryCount: bagsSummary.length 
    });

    const html = generateSCReportHTML(data, companyName, bagsSummary);
    console.log('✅ HTML generated, opening window...');
    
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      console.log('✅ Report opened successfully!');
    } else {
      console.log('❌ Popup was blocked');
      alert('Popup blocked! Please allow popups.');
    }
  } catch (err) {
    console.error('❌ Error in runSCReport:', err);
    alert('Error generating SC report. Check console for details.');
  }
};







// --- Pending Sale HTML Report Generator ---
const generatePendingSaleHTMLReport = (
  detailed: any[],       // Pending sale detailed rows
  itemWise: any[]        // Pending sale item-wise summary
) => {
  const reportDate = new Date().toLocaleString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  let rows = '';
  let serialNo = 0;

  let totalVehicles = 0;
  let totalFreight = 0;
  let totalBags = 0;

  // Group by DO No
  const groupedData: Record<string, any[]> = {};
  detailed.forEach(item => {
    const doNo = item.do_no || 'UNKNOWN';
    if (!groupedData[doNo]) groupedData[doNo] = [];
    groupedData[doNo].push(item);
  });

  Object.keys(groupedData).forEach(doNo => {
    const groupItems = groupedData[doNo];
    let vehicleCount = 0;
    let freightCount = 0;
    let bagsCount = 0;

    // DO row
    rows += `<tr><td colspan="10" class="dnn-row">DO ${doNo}</td></tr>`;

    groupItems.forEach(item => {
      serialNo++;
      vehicleCount++;
      freightCount += Number(item.freight || 0);
      bagsCount += Number(item.bags || 0);

      rows += `
<tr>
  <td>${serialNo}</td>
  <td>${item.dc_no || ''}</td>
  <td>${item.do_no || ''}</td>
<td>${item.slip_in_time || ''}</td>
<td>${item.slip_out_time || ''}</td>
  <td>${item.vehicle_no || ''}</td>
  <td>${item.freight || 0}</td>
  <td>${item.party_name || item.customer_name || ''}</td>
  <td>${item.feed_name || item.item_desc || ''}</td>
  <td>${item.bags || 0}</td>
</tr>`;
    });

    totalVehicles += vehicleCount;
    totalFreight += freightCount;
    totalBags += bagsCount;

    // Vehicle count per DO
    rows += `
<tr class="vehicle-count-row">
  <td colspan="5"><b>Vehicle Count</b></td>
  <td>${vehicleCount}</td>
  <td>${freightCount}</td>
  <td></td>
  <td></td>
  <td>${bagsCount}</td>
</tr>`;
  });

  // Grand totals
  rows += `
<tr class="vehicle-count-row">
  <td colspan="5"><b>Total Vehicle Count</b></td>
  <td>${totalVehicles}</td>
  <td>${totalFreight}</td>
  <td></td>
  <td></td>
  <td>${totalBags}</td>
</tr>`;

  // Bags summary with total sum
  let bagsRows = '';
  let totalBagsSummary = 0;
  itemWise.forEach(item => {
    const bags = Number(item.bags || item.bags || 0);
    totalBagsSummary += bags;
    bagsRows += `
<tr>
  <td>${item.item_desc || item.feed_name || 'Unknown'}</td>
  <td>${bags}</td>
</tr>`;
  });

  const bagsSummaryHTML = itemWise.length ? `
<h3 style="margin-top:20px;">Bags Summary</h3>
<table>
  <tr>
    <th>Feed Name</th>
    <th>Total Bags</th>
  </tr>
  ${bagsRows}
  <tr>
    <td><b>Total</b></td>
    <td><b>${totalBagsSummary}</b></td>
  </tr>
</table>` : '';

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Pending Sale DO-wise Report</title>
<style>
  body { font-family: Arial; margin:20px; }
  h1 { text-align:center; color:#8B0000; margin:0 0 5px 0; }
  .report-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; }
  .report-title { flex:1; text-align:center; font-weight:bold; color:blue; font-size:16px; }
  .print-btn { padding:5px 10px; font-size:12px; cursor:pointer; background-color:#007BFF; color:white; border:none; border-radius:4px; display:flex; align-items:center; gap:4px; margin-left:10px; }
  table { width:100%; border-collapse:collapse; margin-top:10px; }
  th, td { border:1px solid #444; padding:6px; font-size:12px; text-align:center; }
  th { color:green; font-weight:bold; }
  .dnn-row { color:blue; font-weight:bold; text-align:left; padding:6px 0; padding-left:6px; }
  .vehicle-count-row { text-align:center; color:8B0000; font-weight:bold; }
</style>
</head>
<body>

<div style="text-align:center;">
  <h1 style="margin:0;">Multan Feeds (.PTV) .LTD </h1>
  <h2 style="margin:0;">
    Pending Sale Feed Delivery Report &nbsp; From ${detailed[0]?.slip_in_time || '-'} To ${detailed[detailed.length - 1]?.slip_out_time || '-'}
  </h2>
</div>


<div class="report-header">
 
  <button class="print-btn" onclick="window.print()">🖨️ Print</button>
</div>

<table>
  <tr>
    <th>Sr #</th>
    <th>DC #</th>
    <th>DO #</th>
    <th>Time In</th>
    <th>Time Out</th>
    <th>Vehicle #</th>
    <th>Freight</th>
    <th>Party Name</th>
    <th>Feed Name</th>
    <th>Bags</th>
  </tr>
  ${rows}
</table>

${bagsSummaryHTML}

</body>
</html>
`;
};






const runPendingSaleReport = async (
  branchId: number,
  dates: { from: string; to: string },
  companyName: string,
  customerNameInput?: string,
  vendorInput?: string,
  itemInput?: string,
  vehicleInput?: string,
  doWiseChecked: boolean = false
) => {
  console.log('=== DEBUG: runPendingSaleReport called ===');
  console.log('👤 Customer filter value:', customerNameInput);
  
  if (!doWiseChecked) {
    alert('Please select DO Wise to generate report.');
    return;
  }

  try {
    const params = new URLSearchParams({
      branch: String(branchId),
      dateFrom: dates.from,
      dateTo: dates.to,
    });

    // ✅ Add COMPANY ID (required by backend)
    params.append('company', String(companyId));
    
    // ✅ Add CUSTOMER filter - CORRECT PARAMETER NAME
    if (customerNameInput && customerNameInput.trim()) {
      const trimmedCustomer = customerNameInput.trim();
      console.log('✅ Adding customer to params:', trimmedCustomer);
      params.append('customer', trimmedCustomer); // ✅ This matches backend
    } else {
      console.log('❌ Customer input is empty or falsy');
    }
    
    // ✅ Add VENDOR filter
    if (vendorInput && vendorInput.trim()) {
      const trimmedVendor = vendorInput.trim();
      console.log('✅ Adding vendor to params:', trimmedVendor);
      params.append('vendor', trimmedVendor);
    } else {
      console.log('❌ Vendor input is empty or falsy');
    }
    
    // ✅ Add ITEM filter
    if (itemInput && itemInput.trim()) {
      const trimmedItem = itemInput.trim();
      console.log('✅ Adding item to params:', trimmedItem);
      params.append('item', trimmedItem);
    } else {
      console.log('❌ Item input is empty or falsy');
    }
    
    // ✅ Add VEHICLE filter
    if (vehicleInput && vehicleInput.trim()) {
      const trimmedVehicle = vehicleInput.trim();
      console.log('✅ Adding vehicle to params:', trimmedVehicle);
      params.append('vehicle', trimmedVehicle);
    } else {
      console.log('❌ Vehicle input is empty or falsy');
    }

    console.log('🌐 API parameters:', Object.fromEntries(params));
    
    const url = `/api/sale-pending-report?${params.toString()}`;
    console.log('🌐 Full URL:', url);

    const res = await fetch(url);
    const data = await res.json();

    if (!data?.detailed?.length) {
      alert('No Pending Sale data found');
      return;
    }

    const html = generatePendingSaleHTMLReport(data.detailed, data.itemWiseSummary);
    const win = window.open('', '_blank');
    win?.document.write(html);
    win?.document.close();

  } catch (err) {
    console.error(err);
    alert('Error generating Pending Sale DO report');
  }
};



const generateVendorPurchaseHTMLReport = (
  detailed: VendorPurchaseItem[],
  company: string,
  filters: {
    customer?: string;
    vendor?: string;
    item?: string;
    vehicle?: string;
  } = {}
) => {
  const formatReportDateTime = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12;
    const hh = String(hours).padStart(2, '0');

    return `${day}-${month}-${year} ${hh}:${minutes} ${ampm}`;
  };

  const formatPakistanTime = (date: any) => {
    if (!date) return '';
    return date;
  };

  const reportDate = formatReportDateTime(new Date());
  let serialNo = 1;

  let rows = '';

  let grandVehicleCount = 0;
  let grandBReceived = 0;
  let grandAccepted = 0;
  let grandGross = 0;
  let grandTare = 0;
  let grandBardana = 0;
  let grandDed = 0;
  let grandNet = 0;
  let grandFreight = 0;

  const groupedItems = detailed.reduce((acc: Record<string, VendorPurchaseItem[]>, item) => {
    const category = item.item_desc || 'GENERAL';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  Object.keys(groupedItems).forEach(itemName => {
    const itemData = groupedItems[itemName];

    let itemVehicleCount = 0;
    let itemNetTotal = 0;
    let itemAcceptedTotal = 0;
    let itemBReceived = 0;
    let itemGrossTotal = 0;
    let itemTareTotal = 0;
    let itemBardanaTotal = 0;
    let itemDedTotal = 0;
    let itemFreightTotal = 0;

    rows += `
      <tr style="background:#e6f7ff; font-weight:bold;">
        <td colspan="15" style="text-align:left; font-size:14px;">${itemName}</td>
      </tr>
    `;

    const vendors = Array.from(new Set(itemData.map(i => i.vendor_name)));

    vendors.forEach(vendor => {
      const vendorItems = itemData.filter(i => i.vendor_name === vendor);

      rows += `
        <tr style="background:#f0f8ff; font-weight:bold;">
          <td colspan="15" style="text-align:left; color:blue;">${vendor}</td>
        </tr>
      `;

      let vendorVehicleCount = 0;
      let vendorNetTotal = 0;
      let vendorAcceptedTotal = 0;
      let vendorDedTotal = 0;

      vendorItems.forEach(item => {
        const vehicleCount = item.vehicle_no ? 1 : 0;
        vendorVehicleCount += vehicleCount;
        vendorNetTotal += Number(item.net_weight || 0);
        vendorAcceptedTotal += Number(item.acceptence || 0);
        vendorDedTotal += Number(item.ded || 0);

        itemVehicleCount += vehicleCount;
        itemNetTotal += Number(item.net_weight || 0);
        itemAcceptedTotal += Number(item.acceptence || 0);
        itemBReceived += Number(item.b_rcvd || 0);
        itemGrossTotal += Number(item.gross || 0);
        itemTareTotal += Number(item.tare || 0);
        itemBardanaTotal += Number(item.bardana || 0);
        itemDedTotal += Number(item.ded || 0);
        itemFreightTotal += Number(item.freight || 0);

        grandVehicleCount += vehicleCount;
        grandBReceived += Number(item.b_rcvd || 0);
        grandAccepted += Number(item.acceptence || 0);
        grandGross += Number(item.gross || 0);
        grandTare += Number(item.tare || 0);
        grandBardana += Number(item.bardana || 0);
        grandDed += Number(item.ded || 0);
        grandNet += Number(item.net_weight || 0);
        grandFreight += Number(item.freight || 0);

        rows += `
          <tr>
            <td>${serialNo}</td>
            <td>${item.grn_no ?? ''}</td>
            <td>${formatPakistanTimee(item.slip_in_time)}</td>
            <td>${formatPakistanTimee(item.slip_out_time)}</td>
            <td>${item.m_t ?? ''}</td>
            <td style="color:red;">${item.vehicle_no ?? ''}</td>
            <td>${item.b_rcvd ?? 0}</td>
            <td>${item.gross ?? 0}</td>
            <td>${item.tare ?? 0}</td>
            <td>${item.bardana ?? 0}</td>
            <td>${item.ded ?? 0}</td>
            <td>${item.net_weight ?? 0}</td>
            <td>${item.supplier_weight ?? 0}</td>
            <td>${item.freight ?? 0}</td>
            <td class="${item.status?.toLowerCase() === 'online' ? 'status-online' : ''}">
              ${item.status ?? ''}
            </td>
          </tr>
        `;
        serialNo++;
      });

      // Vendor Wise Vehicle Count
      rows += `
        <tr class="total-row" style="background:#f9f9f9;">
          <td colspan="5" style="text-align:right;">Vendor Wise Vehicle Count</td>
          <td style="font-weight:bold;">${vendorVehicleCount}</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td style="font-weight:bold;">${vendorDedTotal}</td>
          <td style="font-weight:bold;">${vendorNetTotal}</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
        </tr>
      `;

      // Date Wise Vehicle Count
      rows += `
        <tr class="total-row" style="background:#fcf8e3;">
          <td colspan="5" style="text-align:right;">Date Wise Vehicle Count</td>
          <td style="font-weight:bold;">${vendorVehicleCount}</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td style="font-weight:bold;">${vendorDedTotal}</td>
          <td style="font-weight:bold;">${vendorNetTotal}</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
        </tr>
      `;

      rows += `<tr style="height:5px;"><td colspan="15"></td></tr>`;
    });

    // Item Total
    rows += `
      <tr class="item-total-row" style="background:#fff3cd; font-weight:bold;">
        <td colspan="5" style="text-align:right;">Item Total (${itemName})</td>
        <td style="color:#856404;">${itemVehicleCount}</td>
        <td style="color:#856404;">${itemBReceived}</td>
        <td style="color:#856404;">${itemGrossTotal}</td>
        <td style="color:#856404;">${itemTareTotal}</td>
        <td style="color:#856404;">${itemBardanaTotal}</td>
        <td style="color:#856404;">${itemDedTotal}</td>
        <td style="color:#856404;">${itemNetTotal}</td>
        <td style="color:#856404;"></td>
        <td style="color:#856404;">${itemFreightTotal}</td>
        <td style="color:#856404;"></td>
      </tr>
    `;

    rows += `<tr style="height:10px;"><td colspan="15"></td></tr>`;
  });

  // ✅ Grand Total — Sup.Wh blank
  rows += `
    <tr class="grand-row" style="background:#d1ecf1;">
      <td colspan="5" style="text-align:right; font-weight:bold;">Grand Total</td>
      <td style="font-weight:bold; color:#0c5460;">${grandVehicleCount}</td>
      <td style="font-weight:bold; color:#0c5460;">${grandBReceived}</td>
      <td style="font-weight:bold; color:#0c5460;">${grandGross}</td>
      <td style="font-weight:bold; color:#0c5460;">${grandTare}</td>
      <td style="font-weight:bold; color:#0c5460;">${grandBardana}</td>
      <td style="font-weight:bold; color:#0c5460;">${grandDed}</td>
      <td style="font-weight:bold; color:#0c5460;">${grandNet}</td>
      <td>&nbsp;</td>
      <td style="font-weight:bold; color:#0c5460;">${grandFreight}</td>
      <td style="font-weight:bold; color:#0c5460;">${grandAccepted}</td>
    </tr>
  `;

  const appliedFilters = [];
  if (filters.customer) appliedFilters.push(`Customer: ${filters.customer}`);
  if (filters.vendor) appliedFilters.push(`Vendor: ${filters.vendor}`);
  if (filters.item) appliedFilters.push(`Item: ${filters.item}`);
  if (filters.vehicle) appliedFilters.push(`Vehicle: ${filters.vehicle}`);

  const filtersHTML = appliedFilters.length > 0 ? `
<div style="margin: 10px 0; padding: 10px; background: #f0f8ff; border-left: 4px solid #28a745; border-radius: 4px;">
  <div style="font-weight: bold; color: #28a745; margin-bottom: 5px;">Applied Filters:</div>
  <div style="display: flex; flex-wrap: wrap; gap: 15px;">
    ${appliedFilters.map(filter => `<span style="background: #e9ecef; padding: 3px 8px; border-radius: 3px; font-size: 12px;">${filter}</span>`).join('')}
  </div>
</div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Daily Material Receipt Report</title>
  <style>
    body { font-family: Arial; margin: 20px; background:#f9f9f9; }
    h1, h2 { text-align:center; margin:0; }
    h1 { color: green; }
    h2 { color: red; margin-bottom:15px; }
    .report-date { font-size:14px; font-weight:bold; color:#333; display:flex; align-items:center; gap:5px; }
    .print-button { padding:8px 14px; font-size:14px; font-weight:bold; background:#007bff; color:white; border:none; cursor:pointer; border-radius:3px; display:flex; align-items:center; gap:5px; }
    .print-button:hover { background:#0056b3; }
    .date-print-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; }
    table { width:100%; border-collapse:collapse; table-layout:auto; }
    th, td { border:1px solid #ccc; padding:6px; text-align:center; font-size:12px; }
    th { background:#d4edda; font-weight:bold; }
    .total-row td { color:red; font-weight:bold; border-top:2px solid black; }
    .grand-row td { color:#0c5460; font-weight:bold; border-top:2px solid black; }
    .item-total-row td { color:#856404; font-weight:bold; border-top:2px solid #ffc107; background:#fff3cd; }
    .status-online { color:green; font-weight:bold; }
    @media print {
      .print-button { display: none; }
      body { margin: 0; padding: 10px; }
    }
  </style>
</head>
<body>
  <h1>${company} (PVT.) LTD.</h1>
  <h2>Daily Material Receipt Report</h2>

  ${filtersHTML}

  <div class="date-print-row">
    <div class="report-date">
      Print Date: ${reportDate}
    </div>
    <button class="print-button" onclick="window.print()">Print</button>
  </div>

  <table>
    <thead>
      <tr>
        <th>Sr #</th>
        <th>GRN</th>
        <th>FW Time</th>
        <th>SW Time</th>
        <th>WB</th>
        <th>Vehicle</th>
        <th>B.Rcvd</th>
        <th>Gross</th>
        <th>Tare</th>
        <th>Bardana</th>
        <th>DED</th>
        <th>Net</th>
        <th>Sup.Wh</th>
        <th>Freight</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
   </table>
</body>
</html>
  `;
};







const runVendorPurchaseReport = async (
  companyId: number,
  branchId: number,
  dates: { from: string; to: string },
  companyName: string,
  customerNameInput?: string,
  vendorInput?: string,
  itemInput?: string,
  vehicleInput?: string
) => {
  console.log('=== DEBUG: runVendorPurchaseReport called ===');
  console.log('📅 Date range:', dates.from, 'to', dates.to);
  console.log('👤 Customer filter:', customerNameInput);
  console.log('🏭 Vendor filter:', vendorInput);
  console.log('📦 Item filter:', itemInput);
  console.log('🚚 Vehicle filter:', vehicleInput);
  
  try {
    const params = new URLSearchParams({
      company: companyId.toString(),
      branch: branchId.toString(),
      dateFrom: dates.from,
      dateTo: dates.to,
    });

    // ✅ Add CUSTOMER filter
    if (customerNameInput && customerNameInput.trim()) {
      const trimmedCustomer = customerNameInput.trim();
      console.log('✅ Adding customer to params:', trimmedCustomer);
      params.append('customer', trimmedCustomer);
    } else {
      console.log('❌ Customer input is empty or falsy');
    }
    
    // ✅ Add VENDOR filter
    if (vendorInput && vendorInput.trim()) {
      const trimmedVendor = vendorInput.trim();
      console.log('✅ Adding vendor to params:', trimmedVendor);
      params.append('vendor', trimmedVendor);
    } else {
      console.log('❌ Vendor input is empty or falsy');
    }
    
    // ✅ Add ITEM filter
    if (itemInput && itemInput.trim()) {
      const trimmedItem = itemInput.trim();
      console.log('✅ Adding item to params:', trimmedItem);
      // API ke hisaab se parameter name check karein
      params.append('item', trimmedItem); // ya 'item_desc'
    } else {
      console.log('❌ Item input is empty or falsy');
    }
    
    // ✅ Add VEHICLE filter
    if (vehicleInput && vehicleInput.trim()) {
      const trimmedVehicle = vehicleInput.trim();
      console.log('✅ Adding vehicle to params:', trimmedVehicle);
      params.append('vehicle', trimmedVehicle); // ya 'vehicle_no'
    } else {
      console.log('❌ Vehicle input is empty or falsy');
    }

    const url = `/api/purchase-vendor-report?${params.toString()}`;
    console.log('🌐 Full API URL with filters:', url);

    const res = await fetch(url);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Server responded with status ${res.status}`);
    }

    const data = await res.json();

    if (!data?.length) {
      alert('No Vendor Purchase data found for selected filters.');
      return;
    }

    const html = generateVendorPurchaseHTMLReport(data, companyName);
    const win = window.open('', '_blank');
    win?.document.write(html);
    win?.document.close();
  } catch (err) {
    console.error('Error generating Vendor Purchase report:', err);
    alert('Error generating Vendor Purchase report');
  }
};




// ------------------ Generate Vendor Purchase New HTML Report ------------------
const generateVendorPurchaseNewHTMLReport = (
  detailed: any[],
  company: string,
  filters: {             
    customer?: string;
    vendor?: string;
    item?: string;
    vehicle?: string;
    fromDate?: string;  // ✅ ADD THIS LINE
    toDate?: string;    // ✅ ADD THIS LINE
  } = {}
) => {
  // ✅ Modified Function to get date range from FILTERS instead of data
  const getDateRange = () => {
    try {
      // ✅ Check if date filters are available in filters object
      if (filters.fromDate || filters.toDate) {
        const formatDate = (dateString: string) => {
          try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = date.toLocaleString('en-US', { month: 'short' });
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
          } catch {
            return dateString;
          }
        };
        
        if (filters.fromDate && filters.toDate) {
          const fromFormatted = formatDate(filters.fromDate);
          const toFormatted = formatDate(filters.toDate);
          
          if (fromFormatted === toFormatted) {
            return fromFormatted;
          }
          
          return `${fromFormatted} to ${toFormatted}`;
        }
        
        if (filters.fromDate && !filters.toDate) {
          return `From ${formatDate(filters.fromDate)}`;
        }
        
        if (!filters.fromDate && filters.toDate) {
          return `Up to ${formatDate(filters.toDate)}`;
        }
      }
      
      // ✅ Fallback: If no date filters, calculate from data (original logic)
      if (!detailed || detailed.length === 0) return 'N/A';
      
      const dates = detailed
        .map(item => {
          if (item.slip_in_time) return new Date(item.slip_in_time);
          if (item.created_at) return new Date(item.created_at);
          return null;
        })
        .filter(date => date instanceof Date && !isNaN(date.getTime()));
      
      if (dates.length === 0) return 'N/A';
      
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      
      const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };
      
      if (formatDate(minDate) === formatDate(maxDate)) {
        return formatDate(minDate);
      }
      
      return `${formatDate(minDate)} to ${formatDate(maxDate)}`;
    } catch {
      return 'N/A';
    }
  };

  // NEW: Format date with month as number (DD-MM-YYYY HH:MM AM/PM)
  const formatDateWithNumericMonth = (timeString: string) => {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Month as number (01-12)
      const year = date.getFullYear();
      
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      
      return `${day}-${month}-${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const formatDateTimeWithDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month as number for print date too
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${day}-${month}-${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // ✅ Helper function to format dates for display (DD-MM-YYYY)
  const formatDateForDisplay = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateString;
    }
  };

  const printDate = formatDateTimeWithDate(new Date());
  const dateRange = getDateRange(); // ✅ Yeh ab filters se date range lega agar available ho
  
  // ✅ Get from and to dates for center display
  const fromDateDisplay = filters.fromDate ? formatDateForDisplay(filters.fromDate) : '';
  const toDateDisplay = filters.toDate ? formatDateForDisplay(filters.toDate) : '';
  
  let serialNo = 1;
  let rows = '';

  // Grand totals
  let grandVehicleCount = 0;
  let grandBReceived = 0;
  let grandAccepted = 0;
  let grandGross = 0;
  let grandTare = 0;
  let grandBardana = 0;
  let grandDed = 0;
  let grandNet = 0;
  let grandSupplierWeight = 0;
  let grandFreight = 0;

  // Sort data in descending order by slip_in_time
  const sortedData = [...detailed].sort((a, b) => {
    const dateA = a.slip_in_time ? new Date(a.slip_in_time).getTime() : 0;
    const dateB = b.slip_in_time ? new Date(b.slip_in_time).getTime() : 0;
    return dateB - dateA; // Descending order (newest first)
  });

  // Group by Item (M.T) - using sorted data
  const groupedItems = sortedData.reduce((acc: Record<string, any[]>, item) => {
    const mt = item.item_desc || 'GENERAL';
    if (!acc[mt]) acc[mt] = [];
    acc[mt].push(item);
    return acc;
  }, {});

  // Sort MT groups alphabetically or keep as is
  const sortedMTs = Object.keys(groupedItems);

  sortedMTs.forEach(mtName => {
    const mtItems = groupedItems[mtName];

    // Item header
    rows += `
<tr style="background:#e6f7ff; font-weight:bold;">
  <td colspan="17" style="text-align:left; font-size:14px;">${mtName}</td>
</tr>`;

    // Group by vendor within each MT group
    const vendors = Array.from(new Set(mtItems.map(i => i.vendor_name || 'UNKNOWN')));

    // Item-wise totals for current MT
    let itemVehicleCount = 0;
    let itemNetTotal = 0;
    let itemAcceptedTotal = 0;
    let itemBReceivedTotal = 0;
    let itemFreightTotal = 0;
    let itemGrossTotal = 0;
    let itemTareTotal = 0;
    let itemBardanaTotal = 0;
    let itemDedTotal = 0;
    let itemSupplierWeightTotal = 0;

    vendors.forEach(vendor => {
      const vendorItems = mtItems.filter(i => (i.vendor_name || 'UNKNOWN') === vendor);

      // Vendor header
      rows += `
<tr style="background:#f0f8ff; font-weight:bold;">
  <td colspan="17" style="text-align:left; color:blue;">${vendor}</td>
</tr>`;

      let vendorVehicleCount = 0;
      let vendorNetTotal = 0;
      let vendorAcceptedTotal = 0;
      let vendorBReceivedTotal = 0;
      let vendorFreightTotal = 0;

      // Sort vendor items by slip_in_time descending
      const sortedVendorItems = [...vendorItems].sort((a, b) => {
        const dateA = a.slip_in_time ? new Date(a.slip_in_time).getTime() : 0;
        const dateB = b.slip_in_time ? new Date(b.slip_in_time).getTime() : 0;
        return dateB - dateA; // Descending order
      });

      sortedVendorItems.forEach(item => {
        const vehicleCount = item.vehicle_no ? 1 : 0;
        vendorVehicleCount += vehicleCount;
        itemVehicleCount += vehicleCount;

        // Map database fields to report fields
        const bRcvd = Number(item.no_of_bags ?? 0);
        const accepted = Number(item.no_of_bags ?? 0); // Same as bRcvd
        const gross = Number(item.first_weight ?? 0);
        const tare = Number(item.second_weight ?? 0);
        const bardana = Number(item.bardana_weight ?? 0);
        const ded = Number(item.quality_deduction ?? 0);
        const net = Number(item.net_weight ?? 0);
        const supplierWeight = Number(item.supplier_weight ?? 0);
        const freight = Number(item.freight ?? 0);

        vendorNetTotal += net;
        vendorAcceptedTotal += accepted;
        vendorBReceivedTotal += bRcvd;
        vendorFreightTotal += freight;

        // Item totals
        itemNetTotal += net;
        itemAcceptedTotal += accepted;
        itemBReceivedTotal += bRcvd;
        itemFreightTotal += freight;
        itemGrossTotal += gross;
        itemTareTotal += tare;
        itemBardanaTotal += bardana;
        itemDedTotal += ded;
        itemSupplierWeightTotal += supplierWeight;

        // Grand totals
        grandVehicleCount += vehicleCount;
        grandBReceived += bRcvd;
        grandAccepted += accepted;
        grandGross += gross;
        grandTare += tare;
        grandBardana += bardana;
        grandDed += ded;
        grandNet += net;
        grandSupplierWeight += supplierWeight;
        grandFreight += freight;

        rows += `
<tr>
  <td>${serialNo++}</td>
  <td>${item.slip_no ?? ''}</td>
  <td>${mtName}</td>
  <td>${formatDateWithNumericMonth(item.slip_in_time)}</td>  <!-- Updated format -->
  <td>${formatDateWithNumericMonth(item.slip_out_time)}</td> <!-- Updated format -->
  <td style="color:red;">${item.igp_no ?? ''}</td>
  <td style="color:red;">${item.vehicle_no ?? ''}</td>
  <td>${bRcvd}</td>
  <td>${accepted}</td>
  <td>${gross}</td>
  <td>${tare}</td>
  <td>${bardana}</td>
  <td>${ded}</td>
  <td>${net}</td>
  <td>${supplierWeight}</td>
  <td>${freight}</td>
  <td class="${item.status?.toLowerCase() === 'online' ? 'status-online' : ''}">
    ${item.status ?? ''}
  </td>
</tr>`;
      });

      // Vendor Wise Vehicle Count row
      rows += `
<tr class="total-row" style="background:#f9f9f9;">
  <td colspan="5" style="text-align:right;">Vendor Wise Vehicle Count</td>
  <td>&nbsp;</td>
  <td>${vendorVehicleCount}</td>
  <td>${vendorBReceivedTotal}</td>
  <td>${vendorAcceptedTotal}</td>
  <td>&nbsp;</td>
  <td>&nbsp;</td>
  <td>&nbsp;</td>
  <td>&nbsp;</td>
  <td>${vendorNetTotal}</td>
  <td>&nbsp;</td>
  <td>${vendorFreightTotal}</td>
  <td>&nbsp;</td>
</tr>`;
    });

    // Item Wise Totals row
    rows += `
<tr class="total-row" style="background:#e8f5e8; border-top: 2px solid #000;">
  <td colspan="5" style="text-align:right; font-weight:bold;">Item Wise Total (${mtName})</td>
  <td>&nbsp;</td>
  <td>${itemVehicleCount}</td>
  <td>${itemBReceivedTotal}</td>
  <td>${itemAcceptedTotal}</td>
  <td>${itemGrossTotal}</td>
  <td>${itemTareTotal}</td>
  <td>${itemBardanaTotal}</td>
  <td>${itemDedTotal}</td>
  <td>${itemNetTotal}</td>
  <td>${itemSupplierWeightTotal}</td>
  <td>${itemFreightTotal}</td>
  <td>&nbsp;</td>
</tr>`;
  });

  // Grand Total row
  rows += `
<tr class="grand-row" style="background:#ffe6e6;">
  <td colspan="5" style="text-align:right;">Grand Total</td>
  <td>&nbsp;</td>
  <td>${grandVehicleCount}</td>
  <td>${grandBReceived}</td>
  <td>${grandAccepted}</td>
  <td>${grandGross}</td>
  <td>${grandTare}</td>
  <td>${grandBardana}</td>
  <td>${grandDed}</td>
  <td>${grandNet}</td>
  <td>${grandSupplierWeight}</td>
  <td>${grandFreight}</td>
  <td>&nbsp;</td>
</tr>`;

  // Build applied filters string
  const appliedFilters = [];
  if (filters.customer) appliedFilters.push(`Customer: ${filters.customer}`);
  if (filters.vendor) appliedFilters.push(`Vendor: ${filters.vendor}`);
  if (filters.item) appliedFilters.push(`Item: ${filters.item}`);
  if (filters.vehicle) appliedFilters.push(`Vehicle: ${filters.vehicle}`);

  // ✅ ADDED: Date range display for center section
  // ✅ CHANGED: Always show "From" and "To" separately, even if dates are same
  let dateRangeCenter = '';
  if (filters.fromDate && filters.toDate) {
    const fromFormatted = formatDateForDisplay(filters.fromDate);
    const toFormatted = formatDateForDisplay(filters.toDate);
    
    // ✅ CHANGED: Always show both labels, even if dates are same
    dateRangeCenter = `<b>From:</b> ${fromFormatted} <b>To:</b> ${toFormatted}`;
  } else if (filters.fromDate) {
    const formatted = formatDateForDisplay(filters.fromDate);
    dateRangeCenter = `<b>From:</b> ${formatted}`;
  } else if (filters.toDate) {
    const formatted = formatDateForDisplay(filters.toDate);
    dateRangeCenter = `<b>To:</b> ${formatted}`;
  }

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Vendor Purchase New Report</title>
<style>
  body { font-family: Arial; margin:20px; background:#f9f9f9; }
  h1, h2 { text-align:center; margin:0; }
  h1 { color:green; }
  h2 { color:red; margin-bottom:10px; }

  .date-print-row {
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:15px;
  }

  .center-date-range {
    text-align:center;
    margin:10px 0;
    font-size:14px;
    font-weight:bold;
    color:#333;
    display:flex;
    justify-content:center;
    align-items:center;
    gap:15px;
  }
  
  .date-label {
    display:flex;
    align-items:center;
    gap:5px;
  }

  .print-button {
    padding:8px 14px;
    font-size:14px;
    font-weight:bold;
    background:#007bff;
    color:white;
    border:none;
    cursor:pointer;
    border-radius:3px;
    display:flex;
    align-items:center;
    gap:5px;
  }

  .print-button:hover { background:#0056b3; }

  table { width:100%; border-collapse:collapse; }
  th, td { border:1px solid #ccc; padding:6px; font-size:12px; text-align:center; }
  th { background:#d4edda; font-weight:bold; }

  .total-row td {
    color:red;
    font-weight:bold;
    border-top:2px solid black;
  }

  .grand-row td {
    color:blue;
    font-weight:bold;
    border-top:2px solid black;
  }

  .status-online { color:green; font-weight:bold; }
</style>
</head>

<body>
<h1>${company} (.PVT) .LTD</h1>
<h2>Vendor Purchase New Report</h2>

<!-- ✅ ADDED: Center Date Range Display -->
${dateRangeCenter ? `
<div class="center-date-range">
  ${filters.fromDate ? `<div class="date-label"><b>From:</b> ${formatDateForDisplay(filters.fromDate)}</div>` : ''}
  ${filters.toDate ? `<div class="date-label"><b>To:</b> ${formatDateForDisplay(filters.toDate)}</div>` : ''}
</div>
` : ''}

<div class="date-print-row">
  <div><b>Print Date :</b> ${printDate}</div>
  <button class="print-button" onclick="window.print()">Print</button>
</div>

<table>
<tr>
  <th>Sr #</th>
  <th>Slip No</th>
  <th>MT</th>
  <th>FW Time</th>
  <th>SW Time</th>
  <th>GRN</th>
  <th>Vehicle</th>
  <th>B.Rcvd</th>
  <th>Accepted</th>
  <th>Gross</th>
  <th>Tare</th>
  <th>Bardana</th>
  <th>DED</th>
  <th>Net</th>
  <th>Sup.Wh</th>
  <th>Freight</th>
  <th>Status</th>
</tr>
${rows}
</table>
</body>
</html>`;
};





const runVendorPurchaseNewReport = async (
  companyId: number,
  branchId: number,
  dates: { from: string; to: string },
  companyName: string,
  customerNameInput?: string,
  vendorInput?: string,
  itemInput?: string,
  vehicleInput?: string
) => {
  console.log('=== DEBUG: runVendorPurchaseNewReport called ===');
  console.log('📅 Date range:', dates.from, 'to', dates.to);
  console.log('👤 Customer filter:', customerNameInput);
  console.log('🏭 Vendor filter:', vendorInput);
  console.log('📦 Item filter:', itemInput);
  console.log('🚚 Vehicle filter:', vehicleInput);
  
  try {
    const params = new URLSearchParams({
      company: String(companyId),
      branch: String(branchId),
      dateFrom: dates.from,
      dateTo: dates.to,
    });

    // ✅ Add CUSTOMER filter
    if (customerNameInput && customerNameInput.trim()) {
      params.append('customer', customerNameInput.trim());
    }
    
    // ✅ Add VENDOR filter
    if (vendorInput && vendorInput.trim()) {
      params.append('vendor', vendorInput.trim());
    }
    
    // ✅ Add ITEM filter
    if (itemInput && itemInput.trim()) {
      params.append('item', itemInput.trim());
    }
    
    // ✅ Add VEHICLE filter
    if (vehicleInput && vehicleInput.trim()) {
      params.append('vehicle', vehicleInput.trim());
    }

    const url = `/api/purchase-vendor-new-report?${params.toString()}`;
    console.log('Fetching Vendor Purchase New Report with URL:', url);

    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      console.error('Vendor Purchase API error:', text);
      alert(`Error fetching Vendor Purchase New Report: ${text}`);
      return;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      alert('No Vendor Purchase data found');
      return;
    }

    // ✅ Create filters object to pass to HTML generator
    const filters: {
      customer?: string;
      vendor?: string;
      item?: string;
      vehicle?: string;
      fromDate?: string;
      toDate?: string;
    } = {};

    if (customerNameInput && customerNameInput.trim()) {
      filters.customer = customerNameInput.trim();
    }
    if (vendorInput && vendorInput.trim()) {
      filters.vendor = vendorInput.trim();
    }
    if (itemInput && itemInput.trim()) {
      filters.item = itemInput.trim();
    }
    if (vehicleInput && vehicleInput.trim()) {
      filters.vehicle = vehicleInput.trim();
    }
    
    // ✅ Add date filters
    filters.fromDate = dates.from;
    filters.toDate = dates.to;

    console.log('📋 Passing filters to HTML generator:', filters);
    
    // ✅ Pass filters to the HTML generator
    const html = generateVendorPurchaseNewHTMLReport(data, companyName, filters);
    
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    } else {
      alert('Popup blocked! Please allow popups.');
    }
  } catch (err) {
    console.error('Error generating Vendor Purchase New Report:', err);
    alert('Error generating Vendor Purchase New Report');
  }
};


// ------------------ Generate Pending Purchase Previous Date HTML Report with Box ------------------
const generatePendingPurchasePrevHTMLReport = (
  detailed: any[],
  company: string
) => {
  const formatReportDateTime = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${day}-${month}-${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const reportDate = formatReportDateTime(new Date());
  let serialNo = 1;
  let rows = '';

  // Grand totals
  let grandVehicleCount = 0;
  let grandBReceived = 0;
  let grandAccepted = 0;
  let grandGross = 0;

  // 🔹 Group by Item (M.T)
  const groupedItems = detailed.reduce((acc: Record<string, any[]>, item) => {
    const mt = item.item_desc || 'GENERAL';
    if (!acc[mt]) acc[mt] = [];
    acc[mt].push(item);
    return acc;
  }, {});

  Object.keys(groupedItems).forEach(mtName => {
    const mtItems = groupedItems[mtName];

    // M.T Header
    rows += `
<tr style="background:#e6f7ff; font-weight:bold;">
  <td colspan="11" style="text-align:left; font-size:14px;">${mtName}</td>
</tr>`;

    // 🔹 Group by Vendor
    const vendors = Array.from(new Set(mtItems.map(i => i.vendor_name || '')));

    vendors.forEach(vendor => {
      const vendorItems = mtItems.filter(i => i.vendor_name === vendor);

      rows += `
<tr style="background:#f0f8ff; font-weight:bold;">
  <td colspan="11" style="text-align:left; color:blue;">${vendor}</td>
</tr>`;

      let vendorVehicleCount = 0;
      let vendorAcceptedTotal = 0;

      vendorItems.forEach(item => {
        const vehicleCount = item.vehicle_no ? 1 : 0;
        vendorVehicleCount += vehicleCount;

        const bRcvd = Number(item.b_rcvd ?? 0);
        const accepted = Number(item.accepted ?? 0);

        const grossStr = item.gross ?? '0';
        const grossValue = parseFloat(String(grossStr).replace(/,/g, '')) || 0;

        vendorAcceptedTotal += accepted;

        grandVehicleCount += vehicleCount;
        grandBReceived += bRcvd;
        grandAccepted += accepted;
        grandGross += grossValue;

        rows += `
<tr>
  <td>${serialNo++}</td>
  <td>${mtName}</td>
 <td>${formatPakistanTime(item.slip_in_time)}</td>
<td>${formatPakistanTime(item.slip_out_time)}</td>
  <td style="color:red;">${item.grn_no ?? ''}</td>
  <td style="color:red;">${item.vehicle_no ?? ''}</td>
  <td>${bRcvd}</td>
  <td>${accepted}</td>
  <td>${grossStr}</td>
  <td style="font-weight:bold;
      color:${item.track_vehicle === 'GOING'
        ? 'green'
        : item.track_vehicle === 'PENDING'
        ? 'orange'
        : 'red'}">
    ${item.track_vehicle ?? ''}
  </td>
  <td>${item.status ?? ''}</td>
</tr>`;
      });

      // Vendor Wise Vehicle Count
      rows += `
<tr class="total-row" style="background:#f9f9f9;">
  <td colspan="5" style="text-align:right;">Vendor Wise Vehicle Count</td>
  <td>${vendorVehicleCount}</td>
  <td></td>
  <td>${vendorAcceptedTotal}</td>
  <td></td>
  <td></td>
  <td></td>
</tr>`;

      // Date Wise Vehicle Count (single row)
      rows += `
<tr class="total-row" style="background:#fcf8e3;">
  <td colspan="5" style="text-align:right;">Date Wise Vehicle Count</td>
  <td>${vendorVehicleCount}</td>
  <td></td>
  <td>${vendorAcceptedTotal}</td>
  <td></td>
  <td></td>
  <td></td>
</tr>`;

      rows += `<tr><td colspan="11" style="height:6px;"></td></tr>`;
    });

    rows += `<tr><td colspan="11" style="height:10px;"></td></tr>`;
  });

  // 🔹 Grand Total row
  rows += `
<tr class="grand-total" style="background:#ffe6e6;">
  <td colspan="5" style="text-align:right;">Grand Total</td>
  <td>${grandVehicleCount}</td>
  <td></td>
  <td>${grandAccepted}</td>
  <td>${grandGross}</td>
  <td></td>
  <td></td>
</tr>`;

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Pending Purchase Previous Date Report</title>
<style>
  body { font-family: Arial; margin:20px; background:#f0f0f0; }
  h1, h2 { text-align:center; margin:0; }
  h1 { color:green; }
  h2 { color:red; margin-bottom:10px; }

  .report-box {
    max-width: 1200px;
    margin: 0 auto;
    background: #fff;
    padding: 20px;
    border: 2px solid #ccc;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    border-radius: 8px;
  }

  .date-print-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; }
  .print-button { padding:8px 14px; font-size:14px; font-weight:bold; background:#007bff; color:white; border:none; cursor:pointer; border-radius:3px; }

  table { width:100%; border-collapse:collapse; }
  th, td { border:1px solid #ccc; padding:6px; font-size:12px; text-align:center; }
  th { background:#d4edda; font-weight:bold; }
  .total-row td { color:red; font-weight:bold; border-top:2px solid black; }
</style>
</head>
<body>
<div class="report-box">
<h1>${company} (.PVT) .LTD</h1>
<h2>Pending Purchase Previous Date Report</h2>

<div class="date-print-row">
  <div><b>Print Date :</b> ${reportDate}</div>
  <button class="print-button" onclick="window.print()">Print</button>
</div>

<table>
<tr>
  <th>Sr #</th>
  <th>M.T</th>
  <th>FW. Time</th>
  <th>SW. Time</th>
  <th>GRN #</th>
  <th>Vehicle</th>
  <th>B.Rcvd</th>
  <th>Accepted</th>
  <th>Gross</th>
  <th>Tracking</th>
  <th>Status</th>
</tr>
${rows}
</table>
</div>
</body>
</html>`;
};


const runPendingPurchasePrevReport = async (
  companyId: number,
  branchId: number,
  dates: { from: string; to: string },
  companyName: string,
  customerNameInput?: string,
  vendorInput?: string,
  itemInput?: string,
  vehicleInput?: string
) => {
  console.log('=== DEBUG: runPendingPurchasePrevReport called ===');
  console.log('📅 Date range:', dates.from, 'to', dates.to);
  console.log('👤 Customer filter:', customerNameInput);
  console.log('🏭 Vendor filter:', vendorInput);
  console.log('📦 Item filter:', itemInput);
  console.log('🚚 Vehicle filter:', vehicleInput);
  
  try {
    const params = new URLSearchParams({
      company: String(companyId),
      branch: String(branchId),
      dateFrom: dates.from,
      dateTo: dates.to,
    });

    // ✅ Add CUSTOMER filter
    if (customerNameInput && customerNameInput.trim()) {
      params.append('customer', customerNameInput.trim());
    }
    
    // ✅ Add VENDOR filter
    if (vendorInput && vendorInput.trim()) {
      params.append('vendor', vendorInput.trim());
    }
    
    // ✅ Add ITEM filter
    if (itemInput && itemInput.trim()) {
      params.append('item', itemInput.trim());
    }
    
    // ✅ Add VEHICLE filter
    if (vehicleInput && vehicleInput.trim()) {
      params.append('vehicle', vehicleInput.trim());
    }

    const url = `/api/purchase-pending-prev-report?${params.toString()}`;
    console.log('Fetching Pending Purchase Previous Date Report URL:', url);

    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      console.error('Pending Purchase Prev API error:', text);
      alert(`Error fetching Pending Purchase Previous Date Report: ${text}`);
      return;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      alert('No Pending Purchase Previous Date data found');
      return;
    }

    const html = generatePendingPurchasePrevHTMLReport(data, companyName);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    } else {
      alert('Popup blocked! Please allow popups.');
    }
  } catch (err) {
    console.error('Error generating Pending Purchase Previous Date Report:', err);
    alert('Error generating Pending Purchase Previous Date Report');
  }
};





const generatePendingPurchaseHTMLReport = (
  data: PendingPurchaseItem[],
  company: string,
  filters: {             
    customer?: string;
    vendor?: string;
    item?: string;
    vehicle?: string;
    fromDate?: string;  // ✅ ADDED THIS LINE
    toDate?: string;    // ✅ ADDED THIS LINE
  } = {}
) => {
  // ✅ Format date for display (DD-MM-YYYY)
  const formatDateForDisplay = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateString;
    }
  };

  // ✅ Format date for report header (DD-MMM-YY HH:MM AM/PM)
  const reportDate = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // ✅ Format date time for printing (DD-MM-YYYY HH:MM AM/PM)
  const formatDateTimeWithDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${day}-${month}-${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const printDate = formatDateTimeWithDate(new Date());

  // ---- GRAND TOTAL VARIABLES ----
  let grandVehicleCount = 0;
  let grandBRcvd = 0;
  let grandAccepted = 0;
  let grandGross = 0;

  // ✅ Build center date display
  let centerDateDisplay = '';
  if (filters.fromDate || filters.toDate) {
    centerDateDisplay = '<div class="center-date-range">';
    
    if (filters.fromDate) {
      centerDateDisplay += `<div class="date-label"><b>From:</b> ${formatDateForDisplay(filters.fromDate)}</div>`;
    }
    
    if (filters.toDate) {
      centerDateDisplay += `<div class="date-label"><b>To:</b> ${formatDateForDisplay(filters.toDate)}</div>`;
    }
    
    centerDateDisplay += '</div>';
  }

  let html = `
  <html>
  <head>
  <meta charset="UTF-8">
  <title>Pending Purchase Report</title>
    <style>
      body { font-family: Arial; font-size:12px; margin:20px; background:#f5f5f5; }
      .report-container {
        max-width:1200px;
        margin:auto;
        padding:20px;
        background:#fff;
        border:2px solid #333;
        border-radius:10px;
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
      }
      h1 { text-align:center; color:green; margin:0; }
      h2 { text-align:center; color:red; margin:5px 0 15px; }
      
      /* ✅ Center date range styling */
      .center-date-range {
        text-align:center;
        margin:10px 0;
        font-size:14px;
        font-weight:bold;
        color:#333;
        display:flex;
        justify-content:center;
        align-items:center;
        gap:15px;
      }
      
      .date-label {
        display:flex;
        align-items:center;
        gap:5px;
      }
      
      .date-print-row {
        display:flex;
        justify-content:space-between;
        align-items:center;
        font-size:11px;
        margin-bottom:8px;
      }
      
      table { width:100%; border-collapse:collapse; margin-bottom:10px; table-layout:fixed; }
      th, td { border:1px solid black; padding:4px; text-align:center; }
      th { background:#f0f0f0; color:green; font-weight:bold; }
      .item { font-weight:bold; color:blue; border-top:2px solid black; margin-top:14px; padding-top:4px; }
      .vendor { font-weight:bold; color:purple; padding:4px 0; }
      .pending { color:red; font-weight:bold; }
      .summary-row td { font-weight:bold; border-top:2px solid black; background:#fafafa; }
      .date-row td { font-weight:bold; color:brown; }
      .print-btn { 
        padding:8px 14px; 
        background:#007bff; 
        color:#fff; 
        border:none; 
        cursor:pointer; 
        border-radius:3px;
        font-weight:bold;
        display:flex;
        align-items:center;
        gap:5px;
      }
      .print-btn:hover { background:#0056b3; }
      .left { text-align:left; padding-left:6px; }
    </style>
  </head>
  <body>
    <div class="report-container">
      <h1>${company} (PVT.) LTD.</h1>
      <h2>Pending Purchase Raw Material Receipt Report</h2>
      
      <!-- ✅ Center Date Range Display -->
      ${centerDateDisplay}
      
      <div class="date-print-row">
        <div><b>Print Date:</b> ${printDate}</div>
        <button class="print-btn" onclick="window.print()">🖨️ Print</button>
      </div>
  `;

  // ---- GROUP BY ITEM & VENDOR ----
  const itemGroups: Record<string, PendingPurchaseItem[]> = {};
  data.forEach(r => {
    const item = r.item_desc || 'UNKNOWN ITEM';
    if (!itemGroups[item]) itemGroups[item] = [];
    itemGroups[item].push(r);
  });

  Object.entries(itemGroups).forEach(([itemName, itemRows]) => {
    html += `<div class="item">${itemName}</div>`;

    const vendorGroups: Record<string, PendingPurchaseItem[]> = {};
    itemRows.forEach(r => {
      const vendor = r.vendor_name || 'UNKNOWN VENDOR';
      if (!vendorGroups[vendor]) vendorGroups[vendor] = [];
      vendorGroups[vendor].push(r);
    });

    Object.entries(vendorGroups).forEach(([vendor, rows]) => {
      html += `<div class="vendor">${vendor}</div>`;

      html += `
      <table>
        <colgroup>
          <col style="width:40px;"> <!-- Sr# -->
          <col style="width:60px;"> <!-- M.T -->
          <col style="width:120px;"> <!-- FW Time -->
          <col style="width:120px;"> <!-- SW Time -->
          <col style="width:80px;"> <!-- GRN# -->
          <col style="width:80px;"> <!-- Vehicle -->
          <col style="width:60px;"> <!-- B.Rcvd -->
          <col style="width:60px;"> <!-- Accepted -->
          <col style="width:60px;"> <!-- Gross -->
          <col style="width:100px;"> <!-- Tracking -->
          <col style="width:80px;"> <!-- Status -->
        </colgroup>
        <tr>
          <th>Sr#</th>
          <th>M.T</th>
          <th>FW Time</th>
          <th>SW Time</th>
          <th>GRN#</th>
          <th>Vehicle</th>
          <th>B.Rcvd</th>
          <th>Accepted</th>
          <th>Gross</th>
          <th>Tracking</th>
          <th>Status</th>
        </tr>
      `;

      let vendorVehicleCount = 0;
      let vendorBRcvd = 0;
      let vendorAccepted = 0;
      let vendorGross = 0;

      rows.forEach((r, i) => {
        const bRcvd = Number(r.b_rcvd || 0);
        const accepted = Number(r.acceptence || r.b_rcvd || 0);
        const gross = Number(r.gross || 0);

        vendorVehicleCount += 1;
        vendorBRcvd += bRcvd;
        vendorAccepted += accepted;
        vendorGross += gross;

        grandVehicleCount += 1;
        grandBRcvd += bRcvd;
        grandAccepted += accepted;
        grandGross += gross;

        html += `
        <tr>
          <td>${i + 1}</td>
          <td>${r.mt_no || ''}</td>
          <td>${r.slip_in_time || ''}</td>
          <td>${r.slip_out_time || ''}</td>
          <td style="color:red;font-weight:bold;">${r.grn_no || ''}</td>
          <td>${r.vehicle_no || ''}</td>
          <td>${bRcvd}</td>
          <td>${accepted}</td>
          <td>${gross}</td>
          <td class="pending">${r.track_vehicle || 'PENDING'}</td>
          <td>${r.status || 'OFFLINE'}</td>
        </tr>
        `;
      });

      // Vendor Wise summary
      html += `
        <tr class="summary-row">
          <td colspan="5" style="text-align:right;">Vendor Wise Vehicle Count:</td>
          <td>${vendorVehicleCount}</td>
          <td>${vendorBRcvd}</td>
          <td>${vendorAccepted}</td>
          <td>${vendorGross}</td>
          <td colspan="2"></td>
        </tr>
      `;

      // Date Wise summary
      html += `
        <tr class="summary-row date-row">
          <td colspan="5" style="text-align:right;">Date Wise Vehicle Count:</td>
          <td>${vendorVehicleCount}</td>
          <td></td>
          <td>${vendorAccepted}</td>
          <td></td>
          <td colspan="2"></td>
        </tr>
      </table>
      `;
    });
  });

  // ---- GRAND TOTAL TABLE WITH PROPER ALIGNMENT ----
  html += `
    <table style="width:100%; border-collapse:collapse; border:2px solid black; margin-top:10px; table-layout:fixed;">
      <colgroup>
        <col style="width:40px;">
        <col style="width:60px;">
        <col style="width:120px;">
        <col style="width:120px;">
        <col style="width:80px;">
        <col style="width:80px;">
        <col style="width:60px;">
        <col style="width:60px;">
        <col style="width:60px;">
        <col style="width:100px;">
        <col style="width:80px;">
      </colgroup>
      <tr class="summary-row date-row">
        <td colspan="5" style="text-align:right; font-weight:bold;">Total Vehicle Count:</td>
        <td style="font-weight:bold;">${grandVehicleCount}</td>
        <td style="font-weight:bold;">${grandBRcvd}</td>
        <td style="font-weight:bold;">${grandAccepted}</td>
        <td style="font-weight:bold;">${grandGross}</td>
        <td></td>
        <td></td>
      </tr>
    </table>
  `;

  html += `</div></body></html>`;

  return html;
};

const runPendingPurchaseReport = async (
  companyId: number,
  branchId: number,
  dates: { from: string; to: string },
  companyName: string,
  customerNameInput?: string,
  vendorInput?: string,
  itemInput?: string,
  vehicleInput?: string
) => {
  console.log('=== DEBUG: runPendingPurchaseReport called ===');
  console.log('📅 Date range:', dates.from, 'to', dates.to);
  console.log('👤 Customer filter:', customerNameInput);
  console.log('🏭 Vendor filter:', vendorInput);
  console.log('📦 Item filter:', itemInput);
  console.log('🚚 Vehicle filter:', vehicleInput);
  
  try {
    const params = new URLSearchParams({
      company: companyId.toString(),
      branch: branchId.toString(),
      dateFrom: dates.from,
      dateTo: dates.to,
    });

    // ✅ Add CUSTOMER filter
    if (customerNameInput && customerNameInput.trim()) {
      const trimmedCustomer = customerNameInput.trim();
      console.log('✅ Adding customer to params:', trimmedCustomer);
      params.append('customer', trimmedCustomer);
    } else {
      console.log('❌ Customer input is empty or falsy');
    }
    
    // ✅ Add VENDOR filter
    if (vendorInput && vendorInput.trim()) {
      const trimmedVendor = vendorInput.trim();
      console.log('✅ Adding vendor to params:', trimmedVendor);
      params.append('vendor', trimmedVendor);
    } else {
      console.log('❌ Vendor input is empty or falsy');
    }
    
    // ✅ Add ITEM filter
    if (itemInput && itemInput.trim()) {
      const trimmedItem = itemInput.trim();
      console.log('✅ Adding item to params:', trimmedItem);
      params.append('item', trimmedItem);
    } else {
      console.log('❌ Item input is empty or falsy');
    }
    
    // ✅ Add VEHICLE filter
    if (vehicleInput && vehicleInput.trim()) {
      const trimmedVehicle = vehicleInput.trim();
      console.log('✅ Adding vehicle to params:', trimmedVehicle);
      params.append('vehicle', trimmedVehicle);
    } else {
      console.log('❌ Vehicle input is empty or falsy');
    }

    console.log('🌐 Final API URL params:', params.toString());
    const url = `/api/purchase-pending-report?${params.toString()}`;
    console.log('🌐 Full API URL:', url);

    console.log('📤 Making API call...');
    const res = await fetch(url);
    console.log('✅ API response status:', res.status);

    if (!res.ok) {
      const text = await res.text();
      console.error('Pending Purchase API error:', text);
      alert(`Error fetching Pending Purchase report: ${text}`);
      return;
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.log('❌ No data returned. Possible reasons:');
      console.log('1. No data for the selected filters');
      console.log('2. Filters too restrictive');
      console.log('3. Date range has no data');
      
      alert('No data found for the selected filters. Try broadening your filters.');
      return;
    }

    console.log('✅ Processing data for HTML...');
    
    // ✅ Create filters object for HTML report
    const filters = {
      fromDate: dates.from,
      toDate: dates.to,
      customer: customerNameInput?.trim(),
      vendor: vendorInput?.trim(),
      item: itemInput?.trim(),
      vehicle: vehicleInput?.trim()
    };
    
    const html = generatePendingPurchaseHTMLReport(data, companyName, filters);
    
    console.log('✅ HTML generated, opening window...');
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      console.log('✅ Report opened successfully!');
    } else {
      console.log('❌ Popup was blocked');
      alert('Popup blocked! Please allow popups.');
    }
  } catch (err) {
    console.error('❌ Error in runPendingPurchaseReport:', err);
    alert('Error generating Pending Purchase report. Check console for details.');
  }
};


const generateFinalReportHTML = (data: any[], company: string) => {
  const reportDate = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  let grandBags = 0;
  let grandfinal=0;
  let grandDeduction = 0;
  let grandFinalWeight = 0;
  let grandFreight = 0;
  let grandVehicle = 0;
  let srCounter = 1;

  let html = `
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Final Report</title>
    <style>
      body { font-family: Arial; font-size:14px; margin:20px; background:#f5f5f5; }
      .report-container { 
        max-width:1200px; 
        margin:auto; 
        padding:20px; 
        background:#fff; 
        border:2px solid #333; 
        border-radius:10px; 
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
      }
      h1 { text-align:center; color:green; margin:0; font-size:24px; }
      h2 { text-align:center; color:red; margin:5px 0 15px; font-size:18px; }
      table { width:100%; border-collapse:collapse; margin-bottom:10px; table-layout:fixed; }
      th { border:1px solid black; padding:6px; text-align:center; word-wrap: break-word; font-size:16px; background:#f0f0f0; color:green; font-weight:bold; }
      td { border:1px solid black; padding:6px; text-align:center; word-wrap: break-word; font-size:14px; }
      .item { font-weight:bold; color:blue; border-top:2px solid black; margin-top:14px; padding-top:4px; font-size:16px; }
      .vendor { font-weight:bold; color:purple; padding:4px 0; font-size:15px; }
      .summary-row td { font-weight:bold; border-top:2px solid black; font-size:14px; background:#fafafa; }
      .date-row td { font-weight:bold; color:brown; font-size:14px; }
      .print-btn { padding:5px 10px; background:#1E90FF; color:#fff; border:none; cursor:pointer; font-size:14px; }
      .left { text-align:left; padding-left:6px; }
      .pending { color:red; font-weight:bold; font-size:14px; }
    </style>
  </head>
  <body>
    <div class="report-container">
      <h1>${company} (PVT.) LTD.</h1>
      <h2>Pending Purchase Raw Material Receipt Report</h2>
      <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:12px;">
        <div><b>Report Date:</b> <b>${reportDate}</b></div>
        <button class="print-btn" onclick="window.print()">🖨️ Print</button>
      </div>
  `;

  // ---- GROUP BY ITEM ----
  const itemGroups: Record<string, any[]> = {};
  data.forEach(r => {
    const item = r.item_desc || 'UNKNOWN ITEM';
    if (!itemGroups[item]) itemGroups[item] = [];
    itemGroups[item].push(r);
  });

  Object.entries(itemGroups).forEach(([itemName, itemRows]) => {
    html += `<div class="item">${itemName}</div>`;

    // ---- GROUP BY VENDOR ----
    const vendorGroups: Record<string, any[]> = {};
    itemRows.forEach(r => {
      const vendor = r.vendor_name || 'UNKNOWN VENDOR';
      if (!vendorGroups[vendor]) vendorGroups[vendor] = [];
      vendorGroups[vendor].push(r);
    });

    Object.entries(vendorGroups).forEach(([vendor, rows]) => {
      html += `<div class="vendor">${vendor}</div>`;

      html += `
      <table>
        <tr>
          <th>Sr#</th>
          <th>NoOfBags</th>
          <th>Deduction</th>
          <th>Final</th>
          <th>Freight</th>
          <th>Vehicle</th>
          <th>Status</th>
        </tr>
      `;

      let vendorBags = 0;
      let vendorDeduction = 0;
      let vendorFinal = 0;
      let vendorFreight = 0;
      let vendorVehicle = 0;

      rows.forEach((r) => {
        const bags = Number(r.no_of_bags || 0);
        const deduction = Number(r.deduction || 0);
        const finalVal = Number(r.final || 0);
        const freight = Number(r.freight || r.final_freight || 0); // check both keys
        const vehicleNo = r.vehicle_no || ''; // actual vehicle number
        const vehicleStatus = r.status || '';

        vendorBags += bags;
        vendorDeduction += deduction;
        vendorFreight += freight;

        if (vehicleNo) {
          vendorVehicle += 1;
          grandVehicle += 1;
        }

        grandBags += bags;
        grandDeduction += deduction;
                grandfinal +=finalVal ;

        grandFreight += freight;

        html += `
        <tr>
          <td>${srCounter++}</td>
          <td>${bags}</td>
          <td>${deduction}</td>
          <td>${finalVal}</td>
          <td>${freight}</td>
          <td>${vehicleNo}</td>
          <td class="${vehicleStatus.toLowerCase() === 'pending' ? 'pending' : ''}">${vehicleStatus}</td>
        </tr>
        `;
      });

      html += `
        <tr class="summary-row">
          <td class="left">Vendor Wise Vehicle Count:</td>
          <td>${vendorBags}</td>
          <td>${vendorDeduction}</td>
          <td>${vendorDeduction}</td>
          <td>${vendorFreight}</td>
          <td>${vendorVehicle}</td>
          <td>-</td>
        </tr>
      `;

      html += `
        <tr class="summary-row date-row">
          <td class="left">Date Wise Vehicle Count:</td>
          <td>${vendorBags}</td>
          <td>${vendorDeduction}</td>
          <td></td>
          <td>${vendorFreight}</td>
          <td>${vendorVehicle}</td>
          <td>-</td>
        </tr>
      </table>
      `;
    });
  });

  // ---- Grand Total ----
  html += `
    <table style="width:100%; border-collapse:collapse; table-layout: fixed;">
      <tr class="summary-row date-row">
        <td class="left">Total Vehicle Count:</td>
        <td>${grandBags}</td>
        <td>${grandDeduction}</td>
        <td>${grandfinal}</td>
        <td>${grandFreight}</td>
        <td>${grandVehicle}</td>
        <td>-</td>
      </tr>
    </table>
    </div> <!-- report-container -->
  </body></html>
  `;

  return html;
};


const runFinalReport = async (
  companyId: number,
  branchId: number,
  dates: { from: string; to: string },
  companyName: string,
  customerNameInput?: string,
  vendorInput?: string,
  itemInput?: string,
  vehicleInput?: string
) => {
  console.log('=== DEBUG: runFinalReport called ===');
  console.log('📅 Date range:', dates.from, 'to', dates.to);
  console.log('👤 Customer filter:', customerNameInput);
  console.log('🏭 Vendor filter:', vendorInput);
  console.log('📦 Item filter:', itemInput);
  console.log('🚚 Vehicle filter:', vehicleInput);
  console.log('🏢 Company ID:', companyId, 'Branch ID:', branchId);
  
  try {
    const params = new URLSearchParams({
      company: String(companyId),
      branch: String(branchId),
      dateFrom: dates.from,
      dateTo: dates.to,
    });

    // ✅ Add CUSTOMER filter
    if (customerNameInput && customerNameInput.trim()) {
      const trimmedCustomer = customerNameInput.trim();
      console.log('✅ Adding customer to params:', trimmedCustomer);
      params.append('customer', trimmedCustomer);
    } else {
      console.log('❌ Customer input is empty or falsy');
    }
    
    // ✅ Add VENDOR filter
    if (vendorInput && vendorInput.trim()) {
      const trimmedVendor = vendorInput.trim();
      console.log('✅ Adding vendor to params:', trimmedVendor);
      params.append('vendor', trimmedVendor);
    } else {
      console.log('❌ Vendor input is empty or falsy');
    }
    
    // ✅ Add ITEM filter
    if (itemInput && itemInput.trim()) {
      const trimmedItem = itemInput.trim();
      console.log('✅ Adding item to params:', trimmedItem);
      params.append('item', trimmedItem);
    } else {
      console.log('❌ Item input is empty or falsy');
    }
    
    // ✅ Add VEHICLE filter
    if (vehicleInput && vehicleInput.trim()) {
      const trimmedVehicle = vehicleInput.trim();
      console.log('✅ Adding vehicle to params:', trimmedVehicle);
      params.append('vehicle', trimmedVehicle);
    } else {
      console.log('❌ Vehicle input is empty or falsy');
    }

    console.log('🌐 Final API URL params:', params.toString());
    
    const url = `/api/final-report?${params.toString()}`;
    console.log('🌐 Full API URL:', url);

    console.log('📤 Making API call...');
    const res = await fetch(url);
    console.log('✅ API response status:', res.status);

    if (!res.ok) {
      const text = await res.text();
      console.error('Final Report API error:', text);
      alert(`Error fetching Final report: ${text}`);
      return;
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.log('❌ No data returned. Possible reasons:');
      console.log('1. No data for the selected filters');
      console.log('2. Filters too restrictive');
      console.log('3. Date range has no data');
      
      alert('No data found for the selected filters. Try broadening your filters.');
      return;
    }

    console.log('✅ Processing data for HTML...');
    console.log('✅ Data count:', data.length);

    const html = generateFinalReportHTML(data, companyName);
    console.log('✅ HTML generated, opening window...');
    
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      console.log('✅ Report opened successfully!');
    } else {
      console.log('❌ Popup was blocked');
      alert('Popup blocked! Please allow popups.');
    }
  } catch (err) {
    console.error('❌ Error in runFinalReport:', err);
    alert('Error generating Final report. Check console for details.');
  }
};



  // Mock data to fill empty space in lists (4 rows initially)
  const emptyRows = Array(4).fill('');

  return (
    <div className="w-full h-screen bg-gray-300 flex flex-col font-sans text-sm overflow-hidden">
      
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-gray-600 to-gray-400 text-white px-3 py-2 flex items-center shadow-md shrink-0">
        {/* <div className="w-4 h-4 bg-white/20 rounded-full mr-2 border border-white/50"></div> */}
        <span className="font-semibold tracking-wide text-sm">Weigh Bridge General Report </span>
      </div>

      {/* Main Content Area */}
      <div className="p-4 flex-1 flex flex-col overflow-hidden">
        <div className="grid grid-cols-12 gap-6 h-full">
          
          {/* LEFT COLUMN */}
          <div className="col-span-5 flex flex-col gap-4 h-full">
            <div className="flex flex-col gap-3">
           <div className="flex items-center">
  <label className="w-28 font-bold text-gray-700 text-sm">Company</label>
  <select value={companyName} disabled className="flex-1 border border-gray-400 rounded-sm px-2 py-1 bg-white text-black shadow-inner">
    <option value="5"> Sabirs' Vegetable Oils (Pvt.) Ltd.</option>
  </select>
</div>

<div className="flex items-center">
  <label className="w-28 font-bold text-gray-700 text-sm">
    Branch:
  </label>
  <Select
    value={selectedBranch}
    onValueChange={(value) => {
      console.log('📌 Branch selected:', value);
      setSelectedBranch(value);
      
      // ✅ IMPORTANT: Update branchId when branch changes
      if (value && value !== 'all') {
        const newBranchId = parseInt(value);
        setBranchId(newBranchId);
        
        // Update branch name
        const selected = branches.find((b: any) => b.branch_id === newBranchId);
        if (selected) {
          setBranchName(selected.branch_name);
          console.log('✅ Branch updated to:', selected.branch_name, '(ID:', newBranchId, ')');
        }
      }
    }}
  >
    <SelectTrigger className="flex-1 border border-gray-400 rounded-sm px-2 py-1 bg-white text-black shadow-inner">
      <SelectValue placeholder="Select Branch" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all" className="text-black">
    
      </SelectItem>
      {branches.map((branch: any) => (
        <SelectItem
          key={branch.branch_id}
          value={branch.branch_id.toString()}
          className="text-black"
        >
          {branch.branch_name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
</div>

{/* Date Inputs */}
<div className="flex flex-col gap-3 mt-2">
  <div className="flex items-center">
    <label className="w-28 font-bold text-gray-700 text-sm">From Date</label>
    <input
      type="date"             // ✅ date picker
      name="from"
      value={dates.from}      // YYYY-MM-DD format
      onChange={handleDateChange}
      className="w-40 border border-gray-400 rounded-sm px-2 py-1 bg-white text-black shadow-inner"
    />
  </div>

  <div className="flex items-center">
    <label className="w-28 font-bold text-gray-700 text-sm">To Date</label>
    <input
      type="date"             // ✅ date picker
      name="to"
      value={dates.to}        // YYYY-MM-DD format
      onChange={handleDateChange}
      className="w-40 border border-gray-400 rounded-sm px-2 py-1 bg-white text-black shadow-inner"
    />
  </div>
</div>


            {/* Left Side Checkboxes */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-3 mt-2 text-xs font-bold text-gray-800">
             {/* <div className="flex items-center justify-end gap-2">
    <span className="font-bold text-gray-700">Vendor Wise Purchase New</span>
    <input
      type="checkbox"
      checked={vendorWiseNewChecked}          // state variable
      onChange={(e) => setVendorWiseChecked(e.target.checked)}
      className="h-4 w-4"
    />
  </div> */}
              <div></div>
             {/* <div className="flex items-center justify-end gap-2">
  <span className="font-bold text-gray-700">
    Pending Purchase Previous Date
  </span>
  <input
    type="checkbox"
    checked={pendingPrevChecked}          // state variable
    onChange={(e) => setPendingPrevChecked(e.target.checked)}
    className="h-4 w-4"
  />
</div> */}

            </div>
{/* Vehicle No List */}
<div className="flex-1 flex flex-col mt-2 min-h-0">
  <div className="flex justify-between items-center mb-1">
    <label className="font-bold text-gray-700 text-xs ml-6">Vehicle No</label>
  </div>
  <div className="bg-white border border-gray-300 flex-1 overflow-y-auto p-1 shadow-inner rounded-sm">
    {vehiclesList.map((vehicle, index) => (
      <div key={index} className="flex items-center gap-1 mb-0.5">
        <input
          type="text"
          value={vehicle}
          onChange={(e) => handleVehicleInputChange(index, e.target.value)}
          placeholder={`Vehicle ${index + 1}`}
          className="flex-1 border-b border-gray-200 text-xs p-0.5 focus:outline-none focus:border-blue-400 focus:ring-0 focus:ring-blue-400 text-gray-900 placeholder-gray-400 h-6"
        />
        {vehiclesList.length > 1 && (
          <button
            type="button"
            onClick={() => {
              const newVehicles = vehiclesList.filter((_, i) => i !== index);
              setVehiclesList(newVehicles);
            }}
            className="text-xs text-red-500 hover:text-red-700 px-0.5 text-[10px]"
          >
            ✕
          </button>
        )}
      </div>
    ))}
  </div>
</div>
          </div>

          {/* MIDDLE COLUMN */}
          <div className="col-span-3 flex flex-col items-center pt-8 border-x border-gray-300/30 px-2">
            <div className="flex w-full justify-between px-4 mb-4">
              <span className="text-[#8B0000] font-bold text-lg">Purchase</span>
              <span className="text-[#8B0000] font-bold text-lg">Sale</span>
            </div>

            <div className="flex w-full justify-between px-8 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-black">Purchase</span>
                <input type="checkbox" checked={purchaseChecked} onChange={(e) => setPurchaseChecked(e.target.checked)} className="h-4 w-4 accent-blue-600" />
              </div>
             <div className="flex items-center gap-2">
  <span className="text-sm text-black">Sale</span>
  <input
    type="checkbox"
    checked={saleChecked}
    onChange={(e) => setSaleChecked(e.target.checked)}
    className="h-4 w-4 accent-blue-600"
  />
</div>
            </div>

            {/* Grid checkboxes (LEFT & RIGHT columns) */}
            <div className="w-full grid grid-cols-2 gap-x-6 gap-y-4 text-xs text-black">
              {/* Left column */}
              <div className="flex flex-col gap-3">
              {/* <div className="flex items-center gap-2">
  <span className="text-sm text-black">Vendor Wise Purchase</span>
  <input
    type="checkbox"
    checked={vendorPurchaseChecked}
    onChange={(e) => setVendorPurchaseChecked(e.target.checked)}
    className="h-4 w-4 accent-blue-600"
  />
</div> */}

            {/* <div className="flex items-center gap-2">
  <span className="text-sm text-black">Pending Purchase</span>
  <input
    type="checkbox"
    checked={pendingPurchaseChecked}
    onChange={(e) => setPendingPurchaseChecked(e.target.checked)}
    className="h-4 w-4 accent-blue-600"
  />
</div> */}

            {/* <div className="flex justify-between items-center w-full">
  <span>Unloaded</span>
  <input
    type="checkbox"
    className="h-4 w-4"
    checked={unloadedChecked}
    onChange={(e) => setUnloadedChecked(e.target.checked)}
  />
</div> */}

               {/* <div className="flex justify-between items-center w-full">
  <span>Accumulated Unloaded</span>
  <input
    type="checkbox"
    className="h-4 w-4"
    checked={accumulatedChecked}
    onChange={(e) => setAccumulatedChecked(e.target.checked)}
  />
</div> */}

              </div>
           {/* Right column */}
<div className="flex flex-col gap-3">

  {/* <div className="flex items-center gap-2">
    <span className="w-40 text-sm text-black">DO Wise</span>
    <input
      type="checkbox"
      className="h-5 w-5  accent-blue-600"
      checked={doWiseChecked}
      onChange={(e) => setDoWiseChecked(e.target.checked)}
    />
  </div> */}

  {/* <div className="flex items-center gap-2">
    <span className="w-40 text-sm text-black">Pending Sale</span>
    <input
      type="checkbox"
      className="h-5 w-5  accent-blue-600"
      checked={pendingSaleChecked}
      onChange={(e) => setPendingSaleChecked(e.target.checked)}
    />
  </div> */}

  {/* <div className="flex items-center gap-2">
    <span className="w-40 text-sm text-black">Sold Note</span>
    <input
      type="checkbox"
      className="h-5 w-5  accent-blue-600"
      checked={soldNoteChecked}
      onChange={(e) => setSoldNoteChecked(e.target.checked)}
    />
  </div> */}

  {/* <div className="flex items-center gap-2">
    <span className="w-40 text-sm text-black">Final Report</span>
    <input
      type="checkbox"
      className="h-5 w-5  accent-blue-600"
      checked={finalReportChecked}
      onChange={(e) => setFinalReportChecked(e.target.checked)}
    />
  </div> */}

  {/* <div className="flex items-center gap-2">
    <span className="w-40 text-sm text-black">SC</span>
    <input
      type="checkbox"
      className="h-5 w-5 accent-blue-600"
      checked={scReportChecked}
      onChange={(e) => setScReportChecked(e.target.checked)}
    />
  </div> */}

</div>

            </div>
          </div>

{/* RIGHT COLUMN */}
<div className="col-span-4 flex flex-col gap-4 h-full">
  {/* Customer Dropdown for SC Report */}
  <div className="flex-1 flex flex-col min-h-0">
    <label className="font-bold text-gray-900 text-sm mb-1 block">
      Customer (for SC Report)
      {branchId && (
        <span className="text-xs text-gray-500 ml-2">
          (Branch: {branchName})
        </span>
      )}
    </label>
    
    {/* Search input for filtering */}
    <div className="relative customer-dropdown-container mb-1">
      <input
        type="text"
        value={customerInput}
        onChange={(e) => {
          const value = e.target.value;
          setCustomerInput(value);
          setCustomerSearch(value);
          setShowCustomerDropdown(true);
          
          // Clear existing timeout
          if (window.debounceTimer) clearTimeout(window.debounceTimer);
          
          // Fetch customers when user types (with debounce)
          if (value.length >= 2 || value.length === 0) {
            window.debounceTimer = setTimeout(() => {
              if (branchId) {
                fetchCustomers(value, branchId); // Pass branchId
              } else {
                console.warn('No branch selected');
                setAllCustomers([]);
              }
            }, 300);
          } else {
            setAllCustomers([]);
          }
        }}
        onFocus={() => {
          // Load customers for current branch when focusing
          if (branchId && allCustomers.length === 0) {
            fetchCustomers('', branchId);
          }
          setShowCustomerDropdown(true);
        }}
        onBlur={() => {
          // Small delay to allow clicking on dropdown items
          setTimeout(() => {
            setShowCustomerDropdown(false);
          }, 200);
        }}
        placeholder="Search customer..."
        className="bg-white border border-gray-400 p-1 text-xs shadow-inner w-full text-gray-900 placeholder:text-gray-500"
      />
      
      {customerInput && (
        <button
          type="button"
          onClick={() => {
            setCustomerInput('');
            setCustomerSearch('');
            setAllCustomers([]);
            setShowCustomerDropdown(false);
          }}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 text-xs text-red-500 hover:text-red-700 px-1"
        >
          ✕
        </button>
      )}
      
      <button
        type="button"
        onClick={() => {
          if (branchId) {
            fetchCustomers(customerSearch, branchId);
          } else {
            alert('Please select a branch first');
          }
          setShowCustomerDropdown(!showCustomerDropdown);
        }}
        className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs bg-blue-100 hover:bg-blue-200 px-2 py-0.5 rounded text-gray-900"
        disabled={customerLoading}
      >
        {customerLoading ? '...' : '▼'}
      </button>
    </div>

    {/* Customer dropdown - Only show when showCustomerDropdown is true */}
    {showCustomerDropdown && (
      <div className="relative customer-dropdown-container">
        <div className="absolute z-10 w-full bg-white border border-gray-400 max-h-60 overflow-y-auto shadow-lg">
          {customerLoading ? (
            <div className="text-center py-2 text-xs text-gray-900">Loading customers...</div>
          ) : !branchId ? (
            <div className="text-center py-2 text-xs text-red-600">
              ⚠️ Please select a branch first
            </div>
          ) : allCustomers.length === 0 ? (
            <div className="text-center py-2 text-xs text-gray-900">
              {customerSearch ? `No customers found for "${customerSearch}"` : 'No customers available for this branch'}
            </div>
          ) : (
            <div className="space-y-1">
              {allCustomers.map((customer: any) => (
                <div
                  key={customer.customer_id}
                  onClick={() => {
                    setCustomerInput(customer.customer_name);
                    setCustomerSearch(customer.customer_name);
                    setShowCustomerDropdown(false);
                  }}
                  className={`cursor-pointer p-2 text-xs border-b border-gray-100 hover:bg-blue-50 ${
                    customerInput === customer.customer_name
                      ? 'bg-blue-100 border-blue-300'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium text-gray-900">{customer.customer_name}</div>
                  {customer.receivable_account_code && (
                    <div className="text-gray-900 text-xs mt-1">
                      Account: {customer.receivable_account_code} - {customer.receivable_account_desc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}

    {/* Selected customer display - Always show below dropdown */}
    {customerInput && !showCustomerDropdown && (
      <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-900">{customerInput}</span>
          <button
            type="button"
            onClick={() => {
              setCustomerInput('');
              setCustomerSearch('');
              setAllCustomers([]);
            }}
            className="text-xs text-red-500 hover:text-red-700"
          >
            ✕ Clear
          </button>
        </div>
      </div>
    )}
  </div>


{/* Vendors List with Dropdown */}
<div className="flex-1 flex flex-col min-h-0">
  <div className="flex justify-between items-center mb-1">
    <label className="font-bold text-gray-900 text-sm">Vendors</label>
  </div>
  
  {/* Search input for vendors */}
  <div className="relative vendor-dropdown-container mb-1">
    <input
      type="text"
      value={vendorsList[0] || ''}
      onChange={(e) => handleVendorInputChange(0, e.target.value)}
      onFocus={() => setShowVendorDropdown(true)}
      onBlur={() => {
        setTimeout(() => {
          setShowVendorDropdown(false);
        }, 200);
      }}
      placeholder="Search vendor..."
      className="bg-white border border-gray-400 p-1 text-xs shadow-inner w-full text-gray-900 placeholder:text-gray-500"
    />
    
    {vendorsList[0] && (
      <button
        type="button"
        onClick={() => {
          handleVendorInputChange(0, '');
          setAllVendors([]);
          setShowVendorDropdown(false);
        }}
        className="absolute right-8 top-1/2 transform -translate-y-1/2 text-xs text-red-500 hover:text-red-700 px-1"
      >
        ✕
      </button>
    )}
    
    <button
      type="button"
      onClick={() => {
        fetchVendors(vendorSearch);
        setShowVendorDropdown(!showVendorDropdown);
      }}
      className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs bg-blue-100 hover:bg-blue-200 px-2 py-0.5 rounded text-gray-900"
      disabled={vendorLoading}
    >
      {vendorLoading ? '...' : '▼'}
    </button>
  </div>

  {/* Vendor dropdown - Only show when showVendorDropdown is true */}
 {showVendorDropdown && (
  <div className="relative vendor-dropdown-container">
    <div className="absolute z-10 w-full bg-white border border-gray-400 max-h-60 overflow-y-auto shadow-lg">
      {vendorLoading ? (
        <div className="text-center py-2 text-xs text-gray-900">Loading vendors...</div>
      ) : allVendors.length === 0 ? (
        <div className="text-center py-2 text-xs text-gray-900">
          {vendorSearch ? `No vendors found for "${vendorSearch}"` : 'Start typing to search vendors'}
        </div>
      ) : (
        <div className="space-y-1">
          {allVendors.map((vendor) => (
            <div
              key={vendor.vendor_id}
              onClick={() => {
                handleVendorInputChange(0, vendor.vendor_name);
                setVendorSearch(vendor.vendor_name);
                setShowVendorDropdown(false);
              }}
              className={`cursor-pointer p-2 text-xs border-b border-gray-100 hover:bg-blue-50 ${
                vendorsList[0] === vendor.vendor_name
                  ? 'bg-blue-100 border-blue-300'
                  : 'border-gray-200'
              }`}
            >
              <div className="font-medium text-gray-900">{vendor.vendor_name}</div>
              {vendor.payable_account_code && (
                <div className="text-gray-900 text-xs mt-1">
                  Account: {vendor.payable_account_code} - {vendor.payable_account_desc}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}

  {/* Selected vendor display - Always show below dropdown */}
 {vendorsList[0] && !showVendorDropdown && (
  <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded">
    <div className="flex justify-between items-center">
      <span className="text-xs font-semibold text-gray-900">{vendorsList[0]}</span>
      <button
        type="button"
        onClick={() => {
          handleVendorInputChange(0, '');
          setAllVendors([]);
        }}
        className="text-xs text-red-500 hover:text-red-700"
      >
        ✕ Clear
      </button>
    </div>
  </div>
)}
</div>


{/* Items List with Dropdown */}
<div className="flex-1 flex flex-col min-h-0">
  <div className="flex justify-between items-center mb-1">
    <label className="font-bold text-gray-900 text-sm">Items</label>
  </div>

  {/* Search input for items */}
  <div className="relative item-dropdown-container mb-1">
    <input
      type="text"
      value={itemsList[0] || ''}
      onChange={(e) => {
        const value = e.target.value;
        handleItemInputChange(0, value);
        setItemSearch(value);          // ✅ added
        setShowItemDropdown(true);
      }}
      onFocus={() => setShowItemDropdown(true)}
      onBlur={() => {
        setTimeout(() => {
          setShowItemDropdown(false);
        }, 200);
      }}
      placeholder="Search item..."
      className="bg-white border border-gray-400 p-1 text-xs shadow-inner w-full text-gray-900 placeholder:text-gray-500"
    />

    {itemsList[0] && (
      <button
        type="button"
        onClick={() => {
          handleItemInputChange(0, '');
          setItemSearch('');
          setAllItems([]);
          setShowItemDropdown(false);
        }}
        className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-red-500 hover:text-red-700 px-1"
      >
        ✕
      </button>
    )}

    <button
      type="button"
      onClick={() => {
        fetchItems(itemSearch);
        setShowItemDropdown(true);
      }}
      className="absolute right-1 top-1/2 -translate-y-1/2 text-xs bg-blue-100 hover:bg-blue-200 px-2 py-0.5 rounded text-gray-900"
      disabled={itemLoading}
    >
      {itemLoading ? '...' : '▼'}
    </button>
  </div>

  {/* Item dropdown */}
  {showItemDropdown && (
    <div className="relative item-dropdown-container">
      <div className="absolute z-10 w-full bg-white border border-gray-400 max-h-60 overflow-y-auto shadow-lg">

        {itemLoading ? (
          <div className="text-center py-2 text-xs">Loading items...</div>
        ) : (() => {
          const filteredItems = allItems.filter(item =>
            item.item_desc
              ?.toLowerCase()
              .includes(itemSearch.toLowerCase())
          );

          if (filteredItems.length === 0) {
            return (
              <div className="text-center py-2 text-xs">
                No items found for "{itemSearch}"
              </div>
            );
          }

          return (
            <div className="space-y-1">
              {filteredItems.map((item) => (
                <div
                  key={item.item_id}
                  onClick={() => {
                    handleItemInputChange(0, item.item_desc);
                    setItemSearch(item.item_desc);
                    setShowItemDropdown(false);
                  }}
                  className="cursor-pointer p-2 text-xs border-b border-gray-200 hover:bg-blue-50"
                >
                  <div className="font-medium  text-black">{item.item_desc}</div>
                  {item.item_code && (
                    <div className="text-xs mt-1 text-black">
                      Code: {item.item_code}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  )}

  {/* Selected item display */}
  {itemsList[0] && !showItemDropdown && (
    <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold">{itemsList[0]}</span>
        <button
          type="button"
          onClick={() => {
            handleItemInputChange(0, '');
            setItemSearch('');
            setAllItems([]);
          }}
          className="text-xs text-red-500 hover:text-red-700"
        >
          ✕ Clear
        </button>
      </div>
    </div>
  )}
</div>


  {/* Purchase Report Checkbox */}
  <div className="flex justify-end items-center gap-2 mt-auto py-2">
    <span className="font-bold text-sm text-gray-800">Purchase Report</span>
    <input
      type="checkbox"
      checked={purchaseReportChecked}
      onChange={(e) => setPurchaseReportChecked(e.target.checked)}
      className="h-4 w-4"
    />
  </div>
</div>






      </div>

      {/* Footer Buttons */}
    <div className="bg-[#E6E8FA] p-3 flex justify-center gap-6 border-t border-gray-300 shrink-0">
<button
  className="w-28 bg-gray-300 hover:bg-gray-400 border border-gray-500 text-black text-sm font-bold py-1.5 px-4 shadow-sm active:translate-y-0.5 transition-all rounded-sm"
  onClick={() => {
    console.log('=== Print Button Clicked ===');
    console.log('customerInput:', customerInput);
    console.log('vendorInput:', vendorInput);
    console.log('itemInput:', itemInput);
    console.log('vehicleInput:', vehicleInput);
    
    // 1️⃣ Unloaded
    // if (unloadedChecked) {
    //   console.log('Running Unloaded Report...');
    //   runUnloadReport();
    //   return;
    // }

    // 2️⃣ Accumulated
    // if (accumulatedChecked) {
    //   console.log('Running Accumulated Report...');
    //   runAccumulatedReport();
    //   return;
    // }

    // 3️⃣ Vendor Wise Purchase
    // if (vendorPurchaseChecked && !purchaseChecked) {
    //   console.log('Running Vendor Purchase Report...');
    //   runVendorPurchaseReport(
    //     companyId,
    //     branchId,
    //     { from: dates.from, to: dates.to },
    //     companyName,
    //     customerInput,
    //     vendorInput || '',
    //     itemInput || '',
    //     vehicleInput || ''
    //   );
    //   return;
    // }

    // 4️⃣ Vendor Wise Purchase New
    // if (vendorWiseNewChecked) {
    //   console.log('Running Vendor Purchase New Report...');
    //   runVendorPurchaseNewReport(
    //     companyId,
    //     branchId,
    //     { from: dates.from, to: dates.to },
    //     companyName,
    //     customerInput,
    //     vendorInput || '',
    //     itemInput || '',
    //     vehicleInput || ''
    //   );
    //   return;
    // }

    // 5️⃣ Pending Purchase Previous Date
    // if (pendingPrevChecked) {
    //   console.log('Running Pending Purchase Previous Date Report...');
    //   runPendingPurchasePrevReport(
    //     companyId,
    //     branchId,
    //     { from: dates.from, to: dates.to },
    //     companyName,
    //     customerInput,
    //     vendorInput || '',
    //     itemInput || '',
    //     vehicleInput || ''
    //   );
    //   return;
    // }

    // 6️⃣ Pending Purchase
    // if (pendingPurchaseChecked) {
    //   console.log('Running Pending Purchase Report...');
    //   runPendingPurchaseReport(
    //     companyId,
    //     branchId,
    //     { from: dates.from, to: dates.to },
    //     companyName,
    //     customerInput,
    //     vendorInput || '',
    //     itemInput || '',
    //     vehicleInput || ''
    //   );
    //   return;
    // }


//purc = y and p_r = n 
//purc = y and p_r = y

   if (purchaseChecked) {

  // 🟢 CASE 1: BOTH CHECKED → SUMMARY REPORT
  if (purchaseReportChecked) {
    console.log('Running Purchase Summary Report...');
    runPurchaseSummaryReport({
      companyId,
      branchId,
      vendorInput,
      itemInput,
      vehicleInput,
      dates,
      companyName
    });
    return;
  }

  // 🟢 CASE 2: ONLY PURCHASE CHECKED → NORMAL REPORT
  console.log('Running Purchase Report...');
  runReport();
  return;
}

    // 8️⃣ Sold Note
    // if (soldNoteChecked) {
    //   console.log('Running Sold Note Report...');
    //   runSoldNoteReport(
    //     companyId,
    //     branchId,
    //     { from: dates.from, to: dates.to },
    //     companyName,
    //     customerInput,
    //     vendorInput || '',
    //     itemInput || '',
    //     vehicleInput || ''
    //   );
    //   return;
    // }

    // 9️⃣ SC Report
    // if (scReportChecked) {
    //   console.log('Running SC Report...');
    //   runSCReport(
    //     companyId,
    //     branchId,
    //     { from: dates.from, to: dates.to },
    //     companyName,
    //     customerInput,
    //     vendorInput || '',
    //     itemInput || '',
    //     vehicleInput || ''
    //   );
    //   return;
    // }

// 🔹 10️⃣ Check for DO Wise + Sale combination FIRST
// if (doWiseChecked && saleChecked) {
//   console.log('Running Sale DO Report (DO Wise + Sale both selected)...');
//   runSaleDOReport(
//     companyId,
//     branchId,
//     { from: dates.from, to: dates.to },
//     companyName,
//     customerInput,
//     vendorInput || '',
//     itemInput || '',
//     vehicleInput || '',
//     doWiseChecked
//   );
//   return;
// }

// 🔹 11️⃣ Check for DO Wise alone
// if (doWiseChecked && !saleChecked) {
//   console.log('Running Sale DO Report (DO Wise only)...');
//   runSaleDOReport(
//     companyId,
//     branchId,
//     { from: dates.from, to: dates.to },
//     companyName,
//     customerInput,
//     vendorInput || '',
//     itemInput || '',
//     vehicleInput || '',
//     doWiseChecked
//   );
//   return;
// }

// 🔹 12️⃣ Check for Sale alone
if (saleChecked && !doWiseChecked) {
  console.log('Running Sale Report (Sale only)...');
  runSaleReport(
    companyId,
    branchId,
    { from: dates.from, to: dates.to },
    companyName,
    customerInput,
    vendorInput || '',
    itemInput || '',
    vehicleInput || ''
  );
  return;
}

    // 1️⃣2️⃣ Pending Sale
    // if (pendingSaleChecked) {
    //   console.log('Running Pending Sale Report...');
    //   runPendingSaleReport(
    //     branchId,
    //     { from: dates.from, to: dates.to },
    //     companyName,
    //     customerInput,
    //     vendorInput || '',
    //     itemInput || '',
    //     vehicleInput || '',
    //     pendingSaleChecked
    //   );
    //   return;
    // }

    // 1️⃣3️⃣ Final Report
    // if (finalReportChecked) {
    //   console.log('Running Final Report...');
    //   runFinalReport(
    //     companyId,
    //     branchId,
    //     { from: dates.from, to: dates.to },
    //     companyName,
    //     customerInput,
    //     vendorInput || '',
    //     itemInput || '',
    //     vehicleInput || ''
    //   );
    //   return;
    // }

    alert('Please select a report type to print.');
  }}
>
  Print
</button>



  <button
    className="w-28 bg-gray-300 hover:bg-gray-400 border border-gray-500 text-black text-sm font-bold py-1.5 px-4 shadow-sm active:translate-y-0.5 transition-all rounded-sm"
  >
    Exit
  </button>
</div>

    </div>
  </div>
  );
};

export default Reportpage;
