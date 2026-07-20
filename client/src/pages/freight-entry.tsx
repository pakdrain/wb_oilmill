import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation } from "wouter";

const FreightEntry = () => {
  const [, setLocation] = useLocation();
  const [doNumbers, setDoNumbers] = useState([]);
    const [isLoadingSlipData, setIsLoadingSlipData] = useState(false);

  const [selectedDoNo, setSelectedDoNo] = useState("");
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [voucherType, setVoucherType] = useState("IGP");
  const [activeLovRow, setActiveLovRow] = useState<number | null>(null);
const [activeLovType, setActiveLovType] = useState<"item" | "party" | null>(null);

const [lovSearchByRow, setLovSearchByRow] = useState<Record<number, string>>({});
const [lovOpenByRow, setLovOpenByRow] = useState<Record<number, boolean>>({});
const [lovHighlightByRow, setLovHighlightByRow] = useState<Record<number, number>>({});

//   const [search, setSearch] = useState("");
// const [showDropdown, setShowDropdown] = useState(false);

  const [currentDate, setCurrentDate] = useState("");
  const [maxDocNo, setMaxDocNo] = useState("");
const [slipData, setSlipData] = useState<SlipItem[]>([]);
const [voucherId, setVoucherId] = useState<string | null>(null);
const [isEditMode, setIsEditMode] = useState(false);
const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
const [slipDropdownData, setSlipDropdownData] = useState<Record<number, any>>({});
// 👇 new state add karo
const [selectedPartyRows, setSelectedPartyRows] = useState(new Set());


const safeInputValue = (val: string | number | boolean | null | undefined) => {
  if (val === null || val === undefined || typeof val === "boolean") return "";
  return val;
};


// React state for master section
const [formData, setFormData] = useState<MasterData>({
  docNo: "",
  voucherType: "",
  docDate: "",
  remarks: "",
  createdBy: 1,
  creationDate: "",
  branch: "",
  selectedDoNo: "",
});


// Define a type (recommended for better clarity and type safety)
interface SlipItem {
  slip_no: string;
  freight_amount: number;
  vehicle_no: string;
  
  item_desc: string;
  vendor_name: string;
  wb_id: string | number | null;
  item_code: string;
  item_id: string | number | null;
  vendor_id: string | number | null;
  
  [key: string]: any; // allows extra props from tableData
}

interface MasterData {
  docNo: string;
  voucherType: string;
  docDate: string;
  remarks: string;
  createdBy: number;
  creationDate: string;
  branch: string;
  selectedDoNo: string;
  status?: string; // Add this
  lastUpdateBy?: number; // Add this
  company_name?: string; // Add this if needed
  branch_id?: string; // Add this if needed
  wb_doc_no?: string; // Add this if needed
  [key: string]: any;
}


// put this helper near the top of your file or in a utils file
const safeValue = (val: unknown): string | number | readonly string[] | undefined => {
  if (val === true || val === false || val == null) return "";
  if (typeof val === "string" || typeof val === "number") return val;
  return String(val);
};


  // Define the structure of one row of your table
interface TableRow {
  [key: string]: string | number | boolean | null; // flexible keys if API returns dynamic fields
}





// useEffect(() => {
//   const urlParams = new URLSearchParams(window.location.search);
//   const voucherIdParam = urlParams.get("voucherId");
//   const mode = urlParams.get("mode");

//   if (voucherIdParam && mode === "edit") {
//     setIsEditMode(true);
//     setVoucherId(voucherIdParam);

//     // 1️⃣ Fetch Master Data
//     fetch(`/api/freight-vouchers/${voucherIdParam}/details`)
//       .then(res => res.json())
//       .then(masterData => {
//         if (masterData.length > 0) {
//           const m = masterData[0];
          
//           // 🟢 Correct Mapping CamelCase → SnakeCase
//           const formDataObj = {
//             docNo: m.doc_no || "",
//             voucherType: m.freight_type || "",
//             docDate: m.doc_date ? m.doc_date.substring(0,10) : "",
//             remarks: m.remarks || "",
//             createdBy: m.created_by || 1,
//             creationDate: m.creation_date ? m.creation_date.substring(0,10) : "",
//             branch: m.branch_id || "",
//             selectedDoNo: m.wb_doc_no || "",
//           };
          
//           setFormData(formDataObj);
          
//           // Fetch slip data with master dates
//           if (formDataObj.docDate && formDataObj.creationDate) {
//             fetchSlipData(formDataObj.docDate, formDataObj.creationDate);
//           }
//         }
//       });

//     // 2️⃣ Fetch Slip Items
//     fetch(`/api/freight-items?freightId=${voucherIdParam}`)
//       .then(res => res.json())
//       .then(items => {
//         const preparedRows = items.map((row: any) => ({
//           ...row,
//           slip_no: row.slip_no || row.remarks || "",
//           vehicle_no: row.vehicle_no || "",
//           item_desc: row.item_desc || "",
//           vendor_name: row.vendor_name || row.party_name || "",
//         }));

//         setTableData(preparedRows);
//       });
//   } else {
//     // ✅ NEW ENTRY MODE: Fetch max doc number
//     fetchMaxDocNo();
//   }
// }, []);


  const selectLovSlip = async (rowIndex: number, slip: SlipItem) => {
    const type = selectedRows.has(rowIndex)
      ? "item"
      : selectedPartyRows.has(rowIndex)
      ? "party"
      : null;

    if (!type) return;

    const selectedText = `WB Slip # ${slip.slip_no} - Vehicle # ${
      slip.vehicle_no
    } - DOC # ${formData.docNo || maxDocNo}`;

    await handleSlipSelection(rowIndex, slip.slip_no, type, selectedText);

    setLovSearch(rowIndex, slip.slip_no.toString());
    setLovOpen(rowIndex, false);
  };



  const fetchDoNumbers = async () => {
    try {
      const response = await fetch("/api/do-numbers");
      if (response.ok) {
        const data = await response.json();
        setDoNumbers(data);
      }
    } catch (error) {
      console.error("Error fetching DO numbers:", error);
    }
  };

const fetchMaxDocNo = async () => {
  try {
    console.log("🔍 Fetching max doc number...");
    const response = await fetch("/api/vouchers/max-doc-no");
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Max doc number received:", data.maxDocNo);
      setMaxDocNo(data.maxDocNo.toString());
    }
  } catch (error) {
    console.error("❌ Error fetching max Doc No:", error);
    setMaxDocNo("1"); // Fallback value
  }
};




  const setLovOpen = (row: number, open: boolean) => {
    setLovOpenByRow((prev) => ({ ...prev, [row]: open }));
    if (open) {
      setActiveLovRow(row);
    } else if (activeLovRow === row) {
      setActiveLovRow(null);
      setActiveLovType(null);
    }
  };

  const setLovSearch = (row: number, value: string) => {
    setLovSearchByRow((prev) => ({ ...prev, [row]: value }));
  };


  const setLovHighlight = (row: number, idx: number) => {
    setLovHighlightByRow((prev) => ({ ...prev, [row]: idx }));
  };





const handlePrint = async (freightId, preOpenedWindow = null) => {
  if (!freightId) {
    alert("Freight ID missing. Can't print.");
    return;
  }

  // ✅ Popup blocker avoid: use pre-opened window if provided
  const printWindow = preOpenedWindow || window.open("", "_blank");

  if (!printWindow) {
    alert("Popup blocked! Please allow popups to print.");
    return;
  }

  // Optional: while fetching show loading
  printWindow.document.open();
  printWindow.document.write("<h3 style='font-family: Arial'>Loading print...</h3>");
  printWindow.document.close();

  try {
    const response = await fetch(`/freightreport/${freightId}`);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const result = await response.json();
    if (!result.success || !result.data || result.data.length === 0) {
      alert("No freight data found for the selected ID.");
      printWindow.close();
      return;
    }

    const freightData = result.data;
    const first = freightData[0];

    const voucherInfo = {
      voucher_type: "FREIGHT VOUCHER",
      voucher_id: first.doc_no,
      voucher_date: first.doc_date,
      creation_date: first.doc_date,
      approval_date: first.approval_date,
      checked_date: first.checked_date,
      description: first.remarks,
      created_by: first.created_by,
      approved_by: first.approved_by,
      cheked_by: first.checked_by,
      branch_name: "HEAD OFFICE",
      module: "Freight",
      status: "Y",
    };

    let totalDr = 0;
    let totalCr = 0;

    let serialNo = 1;
    const rows = freightData
      .map((item) => {
        const amount = parseFloat(item.freight_amount || 0);
        totalDr += amount;
        totalCr += amount;

        const formattedAmount =
          amount % 1 === 0
            ? amount.toLocaleString("en-US")
            : amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });

        const debitRow = `
          <tr>
            <td>${serialNo}</td>
            <td>${item.debit_account_code || ""}</td>
            <td>${item.debit_account_desc || ""}</td>
            <td>${item.remarks || ""}</td>
            <td style="text-align: right;">${formattedAmount}</td>
            <td style="text-align: right;">0</td>
          </tr>
        `;

        serialNo++;

        const creditRow = `
          <tr>
            <td>${serialNo}</td>
            <td>${item.credit_account_code || ""}</td>
            <td>${item.credit_account_desc || ""}</td>
            <td>${item.remarks || ""}</td>
            <td style="text-align: right;">0</td>
            <td style="text-align: right;">${formattedAmount}</td>
          </tr>
        `;

        serialNo++;
        return debitRow + creditRow;
      })
      .join("");

    const formattedTotalDr =
      totalDr % 1 === 0
        ? totalDr.toLocaleString("en-US")
        : totalDr.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

    const formattedTotalCr =
      totalCr % 1 === 0
        ? totalCr.toLocaleString("en-US")
        : totalCr.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

    const printContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Freight Voucher</title>
  <style>
    body { font-family: Times New Roman; font-size: 20px; margin: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    table, th, td { border: 1px solid black; }
    th, td { padding: 8px; }
    th { background-color: #f2f2f2; }
    .amount { text-align: right; }
    .total-row { font-weight: bold; background-color: #e8e8e8; }
    .footer { display: flex; justify-content: space-between; margin-top: 15%; }
    .signature-box { width: 30%; text-align: center; }
    .signature-line { border-top: 1px solid black; margin-bottom: 5px; }
  </style>
</head>
<body>

<h2 style="text-align:center;">MULTAN FEEDS  (PVT.) LTD.</h2>
<h3 style="text-align:center;text-decoration:underline;">FREIGHT VOUCHER</h3>

<p><strong>Voucher #:</strong>_______</p>

<p style="margin-left: 80%; font-size: 20px;">
  <strong>Date:</strong> ${
    new Date(voucherInfo.voucher_date)
      .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
      .replace(/ /g, "-")
      .toUpperCase()
  }
</p>

<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Account Code</th>
      <th>Account Description</th>
      <th>Narration</th>
      <th class="amount">Debit</th>
      <th class="amount">Credit</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
    <tr class="total-row">
      <td colspan="4">Total</td>
      <td class="amount">${formattedTotalDr}</td>
      <td class="amount">${formattedTotalCr}</td>
    </tr>
  </tbody>
</table>

<div class="footer">
  <div class="signature-box">
    <div class="signature-line"></div>
    <div>Prepared By</div>
        <div>Adnan Butt</div>

  </div>

  <div class="signature-box">
    <div class="signature-line"></div>
    <div>Approved By</div>
  </div>

  <div class="signature-box">
    <div class="signature-line"></div>
    <div>Received By</div>
    <div style="margin-top: 40%; font-size: 20px;">
      Doc No: ${voucherInfo.voucher_id || "N/A"}
    </div>
  </div>
</div>

</body>
</html>
`;

    // ✅ Write final content + print
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();

    // ✅ Ensure print happens after content loads
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  } catch (error) {
    console.error("❌ Error fetching freight voucher:", error);
    alert("Failed to fetch freight voucher data for printing.");
    try { printWindow.close(); } catch {}
  }
};



const fetchSlipData = async (
  fromDate: string,
  toDate: string,
  freightId?: string | null
): Promise<SlipItem[]> => {
  try {
    setIsLoadingSlipData(true);
    
    let url = `/api/vouchers/slip-data?fromDate=${encodeURIComponent(
      fromDate
    )}&toDate=${encodeURIComponent(toDate)}`;

    if (freightId) {
      const cleanFreightId = String(freightId).replace(/\//g, "");
      url += `&freightid=${encodeURIComponent(cleanFreightId)}`;
    } else {
      url += `&freightid=0`;
    }

    console.log("📡 Fetching slip data from URL:", url);

    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      console.log("📋 Slip data fetched:", {
        count: data.length,
        slipNos: data.map((s: SlipItem) => s.slip_no),
      });
      setSlipData(data);
      setIsLoadingSlipData(false);
      return data;
    } else {
      console.error("Failed to fetch slip data");
      setIsLoadingSlipData(false);
      return [];
    }
  } catch (error) {
    console.error("Error fetching slip data:", error);
    setIsLoadingSlipData(false);
    return [];
  }
};







const handleFormDataChange = (field: string, value: string) => {
  const newFormData = { ...formData, [field]: value };
  setFormData(newFormData);
  
  // If docDate or creationDate changes, refetch slip data
  if (field === 'docDate' || field === 'creationDate') {
    if (newFormData.docDate && newFormData.creationDate) {
      // ✅ Pass correct freightId (voucherId in edit mode, null for new)
      fetchSlipData(newFormData.docDate, newFormData.creationDate, isEditMode ? voucherId : null);
    }
  }
};

 const fetchDoData = async (doNo: string) => {
  try {
    const response = await fetch(`/api/do-data/${doNo}`);
    if (response.ok) {
      const data = await response.json();
      setTableData(data);
    }
  } catch (error) {
    console.error("Error fetching DO data:", error);
  }
};


 const handleDoNoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const doNo = e.target.value;
  setSelectedDoNo(doNo);
  if (doNo) {
    fetchDoData(doNo);
  } else {
    setTableData([]);
  }
};
const handleTableDataChange = (
  index: number,
  field: string,
  value: number | string
) => {
  const updatedData = [...tableData];

  // If debit or credit, convert to number
  if (field === "debit" || field === "credit" || field === "freight_amount") {
    value = Number(value) || 0;
  }

  updatedData[index] = { ...updatedData[index], [field]: value };
  setTableData(updatedData);
};







const handleItemCheckboxChange = (index: number, checked: boolean) => {
  const newSelectedRows = new Set(selectedRows);
  const updatedData = [...tableData];

  if (checked) {
    newSelectedRows.add(index);

    // Uncheck Party checkbox
    setSelectedPartyRows((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });

    // Clear previous data when switching to Item
    updatedData[index] = {
      ...updatedData[index],
      slip_no: "",
      vehicle_no: "",
      item_desc: "",
      vendor_name: "",
      customer_name: "",
      freight_amount: "",
      wb_id: "",
      item_code: "",
      item_id: "",
      vendor_id: "",
    };

    setTableData(updatedData);

    // Auto open Slip dropdown
    setTimeout(() => {
      const slipDropdown = document.querySelector(
        `#slip-dropdown-${index}`
      ) as HTMLElement | null;
      if (slipDropdown) slipDropdown.click();
    }, 100);
  } else {
    // ✅ When unchecked → clear all LOV-fetched fields
    newSelectedRows.delete(index);

    updatedData[index] = {
      ...updatedData[index],
      slip_no: "",
      vehicle_no: "",
      item_desc: "",
      vendor_name: "",
      customer_name: "",
      freight_amount: "",
      wb_id: "",
      item_code: "",
      item_id: "",
      vendor_id: "",
    };

    setTableData(updatedData);
  }

  setSelectedRows(newSelectedRows);
};




const handlePartyCheckboxChange = (index: number, checked: boolean) => {
  const newSelectedPartyRows = new Set(selectedPartyRows);
  const updatedData = [...tableData];

  if (checked) {
    newSelectedPartyRows.add(index);

    // Uncheck Item checkbox
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });

    // Clear all item/slip-related data when switching to Party
    updatedData[index] = {
      ...updatedData[index],
      slip_no: "",
      vehicle_no: "",
      item_desc: "",
      freight_amount: "",
      wb_id: "",
      item_code: "",
      item_id: "",
      vendor_id: "",
      vendor_name: "",
      customer_name: "",
    };

    setTableData(updatedData);

    // Auto open Party dropdown
    setTimeout(() => {
      const partyDropdown = document.querySelector(
        `#party-dropdown-${index}`
      ) as HTMLElement | null;
      if (partyDropdown) partyDropdown.click();
    }, 100);
  } else {
    // ✅ When unchecked → clear all LOV-fetched fields
    newSelectedPartyRows.delete(index);

    updatedData[index] = {
      ...updatedData[index],
      slip_no: "",
      vehicle_no: "",
      item_desc: "",
      freight_amount: "",
      wb_id: "",
      item_code: "",
      item_id: "",
      vendor_id: "",
      vendor_name: "",
      customer_name: "",
    };

    setTableData(updatedData);
  }

  setSelectedPartyRows(newSelectedPartyRows);
};

  // ✅ NEW: preload LOV values in edit mode so Slip input is not blank
const preloadLovFromRows = (rows: any[]) => {
  const nextLovSearch: Record<number, string> = {};
  const nextLovOpen: Record<number, boolean> = {};
  const nextLovHighlight: Record<number, number> = {};

  rows.forEach((r: any, idx: number) => {
    // ✅ Use slip_no from row (which now contains the actual slip number)
    nextLovSearch[idx] = r?.slip_no ? String(r.slip_no) : "";
    nextLovOpen[idx] = false;
    nextLovHighlight[idx] = 0;
  });

  setLovSearchByRow(nextLovSearch);
  setLovOpenByRow(nextLovOpen);
  setLovHighlightByRow(nextLovHighlight);
  
  console.log("✅ Preloaded LOV values:", nextLovSearch);
};






  const handleUpdate = async () => {
    if (!voucherId) {
      alert("Missing freight id for update");
      return;
    }

    const masterData = {
      docNo: formData.docNo,
      voucherType: formData.voucherType,
      docDate: formData.docDate,
      remarks: formData.remarks,
      createdBy: formData.createdBy || 1,
      creationDate: formData.creationDate,
      branch: formData.branch_id,
      wb_doc_no: formData.wb_doc_no || formData.selectedDoNo || null,
      status: formData.status || "PREPARED",
      lastUpdateBy:
        JSON.parse(sessionStorage.getItem("user") || "{}")?.userId || 1,
    };

    const slipDataPayload: any[] = [];

    selectedRows.forEach((idx: number) => {
      const row = tableData[idx];
      if (!row) return;
      slipDataPayload.push({
        ...row,
        freight_charged_to: "I",
      });
    });

    selectedPartyRows.forEach((idx: number) => {
      const row = tableData[idx];
      if (!row) return;
      slipDataPayload.push({
        ...row,
        freight_charged_to: "P",
        party_name: (row as any).vendor_name || (row as any).party_name || "",
      });
    });

    if (slipDataPayload.length === 0) {
      alert("Select at least one row (Item/Party) to update.");
      return;
    }

    try {
      const resp = await fetch(`/api/freight/update/${voucherId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterData, slipData: slipDataPayload }),
      });

      const data = await resp.json();
      if (!resp.ok)
        throw new Error(data?.details || data?.error || "Update failed");

      alert("✅ Updated successfully!");
      setLocation("/voucher-view");
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Error updating voucher");
    }
  };




useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const voucherIdParam = urlParams.get("voucherId");
  const mode = urlParams.get("mode");

  const initEditModeFromLocalStorage = async (
    freightId: string,
    savedEditData: string
  ) => {
    try {
      const parsed = JSON.parse(savedEditData);
      const master = parsed.master || {};
      const items = Array.isArray(parsed.items) ? parsed.items : [];
      const branch = parsed.branch ?? master.branch_id ?? "1";
      const voucherType = parsed.voucherType ?? master.freight_type ?? "IGP";
      const status = parsed.status ?? master.status ?? "PREPARED";

      console.log("📥 LOADING EDIT DATA FROM LOCALSTORAGE:", {
        freightId,
        master,
        itemsCount: items.length,
      });

      const formDataObj: any = {
        docNo: master.doc_no || master.wb_doc_no || "",
        voucherType: master.freight_type || voucherType || "IGP",
        docDate: master.doc_date ? String(master.doc_date).substring(0, 10) : "",
        remarks: master.remarks || "",
        createdBy: master.created_by || 1,
        creationDate: master.creation_date
          ? String(master.creation_date).substring(0, 10)
          : "",
        branch_id: String(master.branch_id || branch || "1"),
        wb_doc_no: master.wb_doc_no || "",
        status: status,
        selectedDoNo: master.wb_doc_no || "",
      };

      setFormData((prev: any) => ({ ...prev, ...formDataObj }));
      setSelectedBranch(String(branch || formDataObj.branch_id || "1"));
      setVoucherType(String(voucherType || formDataObj.voucherType || "IGP"));

      // ✅ CRITICAL CHANGE: Fetch slip data FIRST and wait for it
      let slips: SlipItem[] = [];
      if (formDataObj.docDate && formDataObj.creationDate) {
        slips = await fetchSlipData(formDataObj.docDate, formDataObj.creationDate, freightId);
      }

      // ✅ Process rows AFTER slip data is available
      const processedRows = items.map((row: any, index: number) => {
        let cleanSlipNo = "";
        if (row?.slip_no != null) {
          const s = String(row.slip_no);
          if (s.includes("WB Slip #")) {
            const m = s.match(/WB Slip #\s*(\d+)/);
            cleanSlipNo = m?.[1] || "";
          } else {
            cleanSlipNo = s;
          }
        }

        const chargedTo = row.freight_charged_to || row.entry_type || "";
        const isParty = chargedTo === "P" || chargedTo === "party";
        const isItem = chargedTo === "I" || chargedTo === "item";

        // ✅ Try to find matching slip in the loaded slip data
        let matchingSlip: SlipItem | undefined;
        if (row.wb_id) {
          matchingSlip = slips.find(
            (slip) => String(slip.wb_id) === String(row.wb_id)
          );
        }
        
        // If not found by wb_id, try by slip_no
        if (!matchingSlip && cleanSlipNo) {
          matchingSlip = slips.find(
            (slip) => String(slip.slip_no) === cleanSlipNo
          );
        }

        // Use slip number from matching slip if found
        const finalSlipNo = matchingSlip?.slip_no || cleanSlipNo || "";

        return {
          ...row,
          slip_no: finalSlipNo, // ✅ Use the actual slip number
          vehicle_no: matchingSlip?.vehicle_no || row.vehicle_no || "",
          item_desc: matchingSlip?.item_desc || row.item_desc || "",
          vendor_name: matchingSlip?.vendor_name || row.vendor_name || row.party_name || "",
          vendor_id: matchingSlip?.vendor_id ?? row.vendor_id ?? null,
          item_id: matchingSlip?.item_id ?? row.item_id ?? null,
          wb_id: matchingSlip?.wb_id ?? row.wb_id ?? null,
          debit: row.debit || "",
          credit: row.credit || "",
          debit_name: row.debit_name || "",
          credit_name: row.credit_name || "",
          freight_amount: matchingSlip?.freight_amount || row.freight_amount || "0.00",
          remarks: row.remarks || "",
          debit_account_desc: row.debit_account_desc || row.debit_name || "",
          credit_account_desc: row.credit_account_desc || row.credit_name || "",
          debit_account_code: row.debit_account_code || "",
          credit_account_code: row.credit_account_code || "203",
          freight_charged_to: isParty ? "P" : "I",
          entry_type: isParty ? "party" : "item",
        };
      });

      console.log("✅ Processed rows from localStorage:", processedRows);
      setTableData(processedRows);

      // ✅ Preload LOV with actual slip numbers
      preloadLovFromRows(processedRows);

      const itemIndices = new Set<number>();
      const partyIndices = new Set<number>();

      processedRows.forEach((r: any, idx: number) => {
        if (r.freight_charged_to === "I") itemIndices.add(idx);
        if (r.freight_charged_to === "P") partyIndices.add(idx);
      });

      setSelectedRows(itemIndices);
      setSelectedPartyRows(partyIndices);

      localStorage.removeItem("freightEditData");
    } catch (error) {
      console.error("❌ Error parsing/loading localStorage data:", error);
      // Fall back to API if localStorage fails
      if (voucherIdParam) {
        await fetchEditDataFromAPI(voucherIdParam);
      }
    }
  };

  const initNewMode = async () => {
    fetchMaxDocNo();

    const today = new Date().toISOString().split("T")[0];
    setFormData((prev: any) => ({
      ...prev,
      docDate: today,
      creationDate: today,
      voucherType: prev.voucherType || "IGP",
    }));

    await fetchSlipData(today, today, null);
  };

  (async () => {
    if (voucherIdParam && mode === "edit") {
      setIsEditMode(true);
      setVoucherId(voucherIdParam);

      const savedEditData = localStorage.getItem("freightEditData");
      if (savedEditData) {
        try {
          await initEditModeFromLocalStorage(voucherIdParam, savedEditData);
        } catch (error) {
          console.error("❌ Error parsing/loading localStorage data:", error);
          await fetchEditDataFromAPI(voucherIdParam);
        }
      } else {
        await fetchEditDataFromAPI(voucherIdParam);
      }
    } else {
      await initNewMode();
    }
  })();
}, []);




const fetchEditDataFromAPI = async (voucherIdParam: string) => {
  try {
    console.log("🔍 Starting edit data fetch for voucher:", voucherIdParam);

    // 1️⃣ Master
    const masterResponse = await fetch(
      `/api/freight-vouchers/${voucherIdParam}/details`
    );
    const masterData = await masterResponse.json();

    if (masterData.length > 0) {
      const m = masterData[0];

      const formDataObj: any = {
        docNo: m.doc_no || "",
        voucherType: m.freight_type || "",
        docDate: m.doc_date ? m.doc_date.substring(0, 10) : "",
        remarks: m.remarks || "",
        createdBy: m.created_by || 1,
        creationDate: m.creation_date ? m.creation_date.substring(0, 10) : "",
        branch_id: m.branch_id || "",
        selectedDoNo: m.wb_doc_no || "",
        wb_doc_no: m.wb_doc_no || "",
        status: m.status || "PREPARED",
      };

      console.log("✅ Master data loaded:", formDataObj);
      setFormData((prev: any) => ({ ...prev, ...formDataObj }));

      // 2️⃣ ✅ IMPORTANT: Wait for slip data to load FIRST
      let slips: SlipItem[] = [];
      if (formDataObj.docDate && formDataObj.creationDate) {
        slips = await fetchSlipData(
          formDataObj.docDate,
          formDataObj.creationDate,
          voucherIdParam
        );
      }

      // 3️⃣ Items - fetch AFTER slip data is loaded
      const itemsResponse = await fetch(
        `/api/freight-items?freightId=${voucherIdParam}`
      );
      const items = await itemsResponse.json();

      console.log("📥 Raw items from API:", items);
      console.log("📋 Available slip data:", slips);

      const processedRows = items.map((row: any, index: number) => {
        const isItem = row.freight_charged_to === "I";
        const isParty = row.freight_charged_to === "P";

        let matchingSlip: SlipItem | undefined;
        let slipNoValue = "";

        // ✅ Try multiple ways to find slip
        if (row.wb_id) {
          matchingSlip = slips.find(
            (slip) => String(slip.wb_id) === String(row.wb_id)
          );
        }
        
        // If not found by wb_id, try by slip_no
        if (!matchingSlip && row.slip_no) {
          matchingSlip = slips.find(
            (slip) => String(slip.slip_no) === String(row.slip_no)
          );
        }

        // Set slip number from matching slip
        if (matchingSlip) {
          slipNoValue = matchingSlip.slip_no;
          console.log(
            `✅ Found matching slip for row ${index}: ${matchingSlip.slip_no}`
          );
        } else if (row.slip_no) {
          // Fallback to row's slip_no
          slipNoValue = String(row.slip_no);
        }

        const rowData: any = {
          ...row,
          // ✅ Use the found slip number
          slip_no: slipNoValue,
          vehicle_no: matchingSlip?.vehicle_no || row.vehicle_no || "",
          item_desc: matchingSlip?.item_desc || row.item_desc || "",
          vendor_name:
            matchingSlip?.vendor_name || row.vendor_name || row.party_name || "",
          debit: row.debit || "",
          credit: row.credit || "",
          debit_name: row.debit_name || "",
          credit_name: row.credit_name || "",
          freight_amount: row.freight_amount || "0.00",
          remarks: row.remarks || "",
          debit_account_desc: row.debit_account_desc || row.debit_name || "",
          credit_account_desc: row.credit_account_desc || row.credit_name || "",
          entry_type: isItem ? "item" : "party",
          debit_account_code: row.debit_account_code || "",
          credit_account_code: row.credit_account_code || "203",
        };

        if (matchingSlip) {
          rowData.wb_id = matchingSlip.wb_id;
          rowData.item_code = matchingSlip.item_code;
          rowData.item_id = matchingSlip.item_id;
          rowData.customer_name = matchingSlip.customer_name;
          rowData.freight_amount = matchingSlip.freight || rowData.freight_amount;
        }

        return rowData;
      });

      console.log("✅ Processed rows for edit:", processedRows);
      setTableData(processedRows);

      // ✅ NEW: preload LOV slip text with ACTUAL slip numbers
      preloadLovFromRows(processedRows);

      const itemIndices = new Set<number>();
      const partyIndices = new Set<number>();

      processedRows.forEach((row: any, index: number) => {
        if (row.freight_charged_to === "I") itemIndices.add(index);
        else if (row.freight_charged_to === "P") partyIndices.add(index);
      });

      setSelectedRows(itemIndices);
      setSelectedPartyRows(partyIndices);
    }
  } catch (error) {
    console.error("❌ Error in fetchEditDataFromAPI:", error);
    alert("Failed to load edit data from API");
  }
};








// Add this function after fetchEditDataFromAPI
const autoSelectSlipInDropdown = (index: number, slipNo: string) => {
  if (!slipNo) {
    console.log(`⚠️ No slip_no to auto-select for row ${index}`);
    return;
  }
  
  // Clean the slip number first
  let cleanSlipNo = slipNo;
  if (slipNo.includes("WB Slip #")) {
    const slipMatch = slipNo.match(/WB Slip #\s*(\d+)/);
    cleanSlipNo = slipMatch && slipMatch[1] ? slipMatch[1] : slipNo;
  }
  
  console.log(`🔄 Auto-selecting slip for row ${index}:`, {
    original: slipNo,
    cleaned: cleanSlipNo
  });
  
  setTimeout(() => {
    const dropdown = document.getElementById(`slip-dropdown-${index}`) as HTMLSelectElement;
    if (dropdown) {
      // Find the option with matching slip_no
      for (let i = 0; i < dropdown.options.length; i++) {
        if (dropdown.options[i].value === cleanSlipNo) {
          dropdown.selectedIndex = i;
          console.log(`✅ Auto-selected slip ${cleanSlipNo} in dropdown for row ${index}`);
          
          // Also trigger the handleSlipSelection to populate other fields
          const selectedText = dropdown.options[i].text;
          const entryType = selectedRows.has(index) ? "item" : selectedPartyRows.has(index) ? "party" : null;
          
          if (entryType) {
            handleSlipSelection(index, cleanSlipNo, entryType, selectedText);
          }
          break;
        }
      }
    }
  }, 1000); // Increased delay to ensure dropdown is rendered
};





useEffect(() => {
  console.log("✅ Slip data loaded:", slipData);
}, [slipData]);




const handleSlipSelection = async (
  index: number,
  slipNo: string,
  entryType?: string | null,
  selectedText?: string
) => {
  if (!slipNo) return;

  const safeType = (entryType ?? "").toString().trim().toLowerCase();
  const slipRecord = slipData.find((slip) => slip.slip_no === slipNo);
  if (!slipRecord) {
    console.error("❌ Slip not found in slipData array:", slipNo);
    return;
  }

  console.log("✅ Found slip in slipData array:", slipRecord);

  const updatedData = [...tableData];

  const fetchAccountDescription = async (accountId: number) => {
    try {
      const response = await fetch(`/api/chart-of-accounts/${accountId}`);
      if (response.ok) {
        const data = await response.json();
        return {
          account_code: data.chart_of_account_code,
          account_desc: data.description
        };
      }
    } catch (error) {
      console.error("Error fetching account description:", error);
    }
    return { account_code: "", account_desc: "" };
  };

  if (safeType === "item") {
    const glAssetId = parseInt(slipRecord.gl_asset_id) || 0;
    const debitAccountInfo = await fetchAccountDescription(glAssetId);

    updatedData[index] = {
      ...updatedData[index],
      slip_no: slipRecord.slip_no,
      vehicle_no: slipRecord.vehicle_no,
      freight_amount: slipRecord.freight || 0,
      wb_id: slipRecord.wb_id || null,
      item_code: slipRecord.item_code || "",
      item_id: slipRecord.item_id || null,
      // vendor_id: slipRecord.vendor_id || null,
      // vendor_name: slipRecord.vendor_name || "",
      customer_name: slipRecord.customer_name || "",
      credit: 203,
      entry_type: safeType,
      remarks: selectedText || "", // ✅ row remarks
      item_desc: slipRecord.item_desc || "",
      debit: glAssetId,
      debit_account_code: debitAccountInfo.account_code,
      debit_account_desc: debitAccountInfo.account_desc,
      credit_account_code: "203",
      credit_account_desc: ""
    };
  }

  if (safeType === "party") {
    const payableAccId = parseInt(slipRecord.payable_acc_id) || 0;
    const debitAccountInfo = await fetchAccountDescription(payableAccId);

    updatedData[index] = {
      ...updatedData[index],
      vendor_name: slipRecord.vendor_name || "",
      customer_name: slipRecord.customer_name || "",
      vendor_id: slipRecord.vendor_id || null,
      party_name: slipRecord.vendor_name || "",
      vehicle_no: slipRecord.vehicle_no || "",
      slip_no: slipRecord.slip_no || "",
      // item_desc: slipRecord.item_desc || "",
      // item_code: slipRecord.item_code || "",
      // item_id: slipRecord.item_id || null,
      freight_amount: slipRecord.freight || 0,
      wb_id: slipRecord.wb_id || null,
      entry_type: safeType,
      credit: 203,
      remarks: selectedText || "", // ✅ row remarks
      debit: payableAccId,
      debit_account_code: debitAccountInfo.account_code,
      debit_account_desc: debitAccountInfo.account_desc,
      credit_account_code: "203",
      credit_account_desc: ""
    };
  }

  // ALWAYS fetch description for credit account (203)
  const creditAccountInfo = await fetchAccountDescription(203);
  updatedData[index] = {
    ...updatedData[index],
    credit_account_desc: creditAccountInfo.account_desc
  };

  // -------------------------
  // ✅ Update master remarks field too
  if (selectedText) {
    handleFormDataChange('remarks', selectedText);
  }

  console.log(`✅ Updated row ${index}:`, updatedData[index]);
  setTableData(updatedData);
};




useEffect(() => {
  const today = new Date().toISOString().split('T')[0];
  setCurrentDate(today);
  
  // Set default values for docDate and creationDate in formData
  setFormData(prev => ({
    ...prev,
    docDate: today,
    creationDate: today
  }));
  
  // ✅ Fetch slip data with freightid=0 for new entries
  fetchSlipData(today, today, null);
  fetchMaxDocNo();
}, []);


// useEffect(() => {
//   if (isEditMode && tableData.length > 0 && slipData.length > 0) {
//     console.log("🔄 AUTO-SELECTING SLIPS FOR EDIT MODE");
    
//     // For each row with slip_no, auto-select in dropdown
//     tableData.forEach((row, index) => {
//       if (row.slip_no && row.slip_no !== "") {
//         console.log(`Row ${index} has slip_no: ${row.slip_no} - auto-selecting`);
//         autoSelectSlipInDropdown(index, String(row.slip_no));
//       }
//     });
//   }
// }, [isEditMode, tableData, slipData]);


const handleSave = async (): Promise<void> => {


    if (isEditMode && voucherId) {
    await handleUpdate();
    return;
  }
  try {
    console.log("🔄 Starting freight voucher save process...");

    // ✅ Ensure freight tables exist
    console.log("📋 Creating freight tables...");
    await fetch("/api/create-freight-table", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    // ✅ Ensure voucher tables exist
    console.log("📋 Creating voucher tables...");
    await fetch("/api/create-gl-voucher-table", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    // ✅ Safely get input values
    const docDateElement = document.querySelector('input[type="date"]') as HTMLInputElement | null;
    const remarksElement = document.querySelector('textarea') as HTMLTextAreaElement | null;

    const docNoToUse = isEditMode ? formData.docNo : (maxDocNo || "1");

    const masterData: MasterData = {
      docNo: docNoToUse,
    voucherType: formData.voucherType || "IGP", // ✅ Use formData.voucherType instead of checking for CPV
      docDate: docDateElement?.value || currentDate,
      remarks: remarksElement?.value || "",
      createdBy: 1,
      creationDate: currentDate,
      branch: selectedBranch || "Main Branch",
      selectedDoNo: selectedDoNo || "",
    };

    console.log("📝 Master data prepared:", masterData);

    // ✅ Collect slip data from selected item and party rows
    const slipData: SlipItem[] = [];

    console.log("🔍 Checking tableData before processing:");
    console.log("Total tableData rows:", tableData.length);
    console.log("Selected item rows:", Array.from(selectedRows));
    console.log("Selected party rows:", Array.from(selectedPartyRows));

    // 🔹 Handle item rows
    selectedRows.forEach((index: number) => {
      const row = tableData[index];
      console.log(`\n📦 Processing ITEM row ${index}:`, row);
      
      if (row) {
        const debitValue = Number(row.debit) || 0;
        const debitAccountCode = row.debit_account_code || "";
        const debitAccountDesc = row.debit_account_desc || "";
        
        console.log(`  Debit from row: ${debitValue} (raw: ${row.debit})`);
        console.log(`  Debit Account Code: ${debitAccountCode}`);
        console.log(`  Debit Account Desc: ${debitAccountDesc}`);
        console.log(`  Credit will be hardcoded to: 203`);
        console.log(`  Credit Account Code: ${row.credit_account_code || "203"}`);
        console.log(`  Credit Account Desc: ${row.credit_account_desc || ""}`);
        console.log(`  freight_charged_to: I (Item)`);
        
        slipData.push({
          ...row,
          slip_no: String(row.slip_no || `SLIP_${index}`),
          freight_amount: Number(row.freight_amount) || 0,
          vehicle_no: String(row.vehicle_no || ""),
          item_desc: String(row.item_desc || ""),
          vendor_name: String(row.vendor_name || ""),
          wb_id: typeof row.wb_id === "boolean" ? null : row.wb_id ?? null,
          item_code: String(row.item_code || ""),
          item_id: typeof row.item_id === "boolean" ? null : row.item_id ?? null,
          vendor_id: typeof row.vendor_id === "boolean" ? null : row.vendor_id ?? null,
          
          // Debit information
          debit: debitValue,
          debit_account_code: debitAccountCode,
          debit_account_desc: debitAccountDesc,
          
          // Credit information (always 203)
          credit: 203,
          credit_account_code: row.credit_account_code || "203",
          credit_account_desc: row.credit_account_desc || "",
          
          freight_charged_to: "I", // Item
          remarks: row.remarks || "",
        });
        
        console.log(`  ✅ Item row ${index} added with Debit: ${debitValue} (${debitAccountCode}), Credit: 203`);
      }
    });

    // 🔹 Handle party rows
    (selectedPartyRows as Set<number>).forEach((index: number) => {
      const row = tableData[index];
      console.log(`\n🤝 Processing PARTY row ${index}:`, row);
      
      if (row) {
        const debitValue = Number(row.debit) || 0;
        const debitAccountCode = row.debit_account_code || "";
        const debitAccountDesc = row.debit_account_desc || "";
        
        console.log(`  Debit from row: ${debitValue} (raw: ${row.debit})`);
        console.log(`  Debit Account Code: ${debitAccountCode}`);
        console.log(`  Debit Account Desc: ${debitAccountDesc}`);
        console.log(`  Credit will be hardcoded to: 203`);
        console.log(`  Credit Account Code: ${row.credit_account_code || "203"}`);
        console.log(`  Credit Account Desc: ${row.credit_account_desc || ""}`);
        console.log(`  freight_charged_to: P (Party)`);
        
        slipData.push({
          ...row,
          slip_no: String(row.slip_no || `SLIP_${index}`),
          freight_amount: Number(row.freight_amount) || 0,
          vehicle_no: String(row.vehicle_no || ""),
          item_desc: String(row.item_desc || ""),
          vendor_name: String(row.vendor_name || ""),
          wb_id: typeof row.wb_id === "boolean" ? null : row.wb_id ?? null,
          item_code: String(row.item_code || ""),
          item_id: typeof row.item_id === "boolean" ? null : row.item_id ?? null,
          vendor_id: typeof row.vendor_id === "boolean" ? null : row.vendor_id ?? null,
          
          // Debit information
          debit: debitValue,
          debit_account_code: debitAccountCode,
          debit_account_desc: debitAccountDesc,
          
          // Credit information (always 203)
          credit: 203,
          credit_account_code: row.credit_account_code || "203",
          credit_account_desc: row.credit_account_desc || "",
          
          freight_charged_to: "P", // Party
          remarks: row.remarks || "",
        });
        
        console.log(`  ✅ Party row ${index} added with Debit: ${debitValue} (${debitAccountCode}), Credit: 203`);
      }
    });

    console.log("\n📊 SUMMARY BEFORE SAVING:");
    console.log("Total slipData entries:", slipData.length);
    
    slipData.forEach((slip, idx) => {
      console.log(`  Entry ${idx}:`, {
        slip_no: slip.slip_no,
        freight_charged_to: slip.freight_charged_to,
        debit: slip.debit,
        debit_account_code: slip.debit_account_code,
        debit_account_desc: slip.debit_account_desc,
        credit: slip.credit,
        credit_account_code: slip.credit_account_code,
        credit_account_desc: slip.credit_account_desc,
        freight_amount: slip.freight_amount,
        vendor_name: slip.vendor_name,
        item_desc: slip.item_desc
      });
    });

    if (slipData.length === 0) {
      alert("Please select at least one slip to save.");
      return;
    }

    console.log("\n🚀 Sending save request...");
    console.log("Request payload:", {
      masterData,
      slipDataCount: slipData.length,
      firstSlip: slipData[0]
    });

    const response = await fetch("/api/freight/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterData, slipData }),
    });

    console.log("📡 Response status:", response.status);

    if (response.ok) {
const result = await response.json();
console.log("✅ Freight voucher saved successfully:", result);

// ✅ 1) Pre-open window (popup blocker avoid)
const pw = window.open("", "_blank");

// ✅ 2) Auto print the newly saved freight id
await handlePrint(result.freight_id, pw);

// ✅ 3) then navigate
setLocation("/voucher-view");

    } else {
      const errorText = await response.text();
      console.error("❌ Save failed with status:", response.status);
      console.error("❌ Error response:", errorText);

      try {
        const errorData = JSON.parse(errorText);
        throw new Error(
          errorData.error || errorData.details || "Failed to save freight voucher"
        );
      } catch {
        throw new Error(`Failed to save freight voucher. Server returned: ${errorText}`);
      }
    }
  } catch (error: any) {
    console.error("❌ Error saving freight voucher:", error);
    alert(`Failed to save freight voucher: ${error.message}`);
  }
};





// const handleUpdate = async (): Promise<void> => {
//   try {
//     if (!voucherId) {
//       alert("No voucher ID found for update");
//       return;
//     }

//     console.log("🔄 Starting freight voucher update process for ID:", voucherId);

//     // ✅ Collect slip data (same logic as handleSave)
//     const slipData: SlipItem[] = [];

//     console.log("🔍 Checking tableData before processing:");
//     console.log("Total tableData rows:", tableData.length);
//     console.log("Selected item rows:", Array.from(selectedRows));
//     console.log("Selected party rows:", Array.from(selectedPartyRows));

//     // 🔹 Handle item rows
//     selectedRows.forEach((index: number) => {
//       const row = tableData[index];
//       console.log(`\n📦 Processing ITEM row ${index}:`, row);
      
//       if (row) {
//         const debitValue = Number(row.debit) || 0;
//         const debitAccountCode = row.debit_account_code || "";
//         const debitAccountDesc = row.debit_account_desc || "";
        
//         slipData.push({
//           ...row,
//           slip_no: String(row.slip_no || `SLIP_${index}`),
//           freight_amount: Number(row.freight_amount) || 0,
//           vehicle_no: String(row.vehicle_no || ""),
//           item_desc: String(row.item_desc || ""),
//           vendor_name: String(row.vendor_name || ""),
//           wb_id: typeof row.wb_id === "boolean" ? null : row.wb_id ?? null,
//           item_code: String(row.item_code || ""),
//           item_id: typeof row.item_id === "boolean" ? null : row.item_id ?? null,
//           vendor_id: typeof row.vendor_id === "boolean" ? null : row.vendor_id ?? null,
          
//           // Debit information
//           debit: debitValue,
//           debit_account_code: debitAccountCode,
//           debit_account_desc: debitAccountDesc,
          
//           // Credit information (always 203)
//           credit: 203,
//           credit_account_code: row.credit_account_code || "203",
//           credit_account_desc: row.credit_account_desc || "",
          
//           freight_charged_to: "I", // Item
//           remarks: row.remarks || "",
//           party_name: row.vendor_name || row.customer_name || "",
//         });
//       }
//     });

//     // 🔹 Handle party rows
//     (selectedPartyRows as Set<number>).forEach((index: number) => {
//       const row = tableData[index];
//       console.log(`\n🤝 Processing PARTY row ${index}:`, row);
      
//       if (row) {
//         const debitValue = Number(row.debit) || 0;
//         const debitAccountCode = row.debit_account_code || "";
//         const debitAccountDesc = row.debit_account_desc || "";
        
//         slipData.push({
//           ...row,
//           slip_no: String(row.slip_no || `SLIP_${index}`),
//           freight_amount: Number(row.freight_amount) || 0,
//           vehicle_no: String(row.vehicle_no || ""),
//           item_desc: String(row.item_desc || ""),
//           vendor_name: String(row.vendor_name || ""),
//           wb_id: typeof row.wb_id === "boolean" ? null : row.wb_id ?? null,
//           item_code: String(row.item_code || ""),
//           item_id: typeof row.item_id === "boolean" ? null : row.item_id ?? null,
//           vendor_id: typeof row.vendor_id === "boolean" ? null : row.vendor_id ?? null,
          
//           // Debit information
//           debit: debitValue,
//           debit_account_code: debitAccountCode,
//           debit_account_desc: debitAccountDesc,
          
//           // Credit information (always 203)
//           credit: 203,
//           credit_account_code: row.credit_account_code || "203",
//           credit_account_desc: row.credit_account_desc || "",
          
//           freight_charged_to: "P", // Party
//           remarks: row.remarks || "",
//           party_name: row.vendor_name || row.customer_name || "",
//         });
//       }
//     });

//     if (slipData.length === 0) {
//       alert("Please select at least one slip to update.");
//       return;
//     }

//     // ✅ Safely get input values
//     const docDateElement = document.querySelector('input[type="date"]') as HTMLInputElement | null;
//     const remarksElement = document.querySelector('textarea') as HTMLTextAreaElement | null;

//     const masterData: MasterData = {
//       docNo: formData.docNo,
//       voucherType: formData.voucherType || "IGP", // ✅ Use formData.voucherType
//       docDate: docDateElement?.value || currentDate,
//       remarks: remarksElement?.value || "",
//       createdBy: 1,
//       creationDate: currentDate,
//       branch: selectedBranch || "Main Branch",
//       selectedDoNo: selectedDoNo || "",
//       status: "PREPARED", // Add status for update
//       lastUpdateBy: 1, // Add last update user
//     };

//     console.log("📝 Update payload:", {
//       freight_id: voucherId,
//       masterData,
//       slipDataCount: slipData.length,
//     });

//     const response = await fetch(`/api/freight/update/${voucherId}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ masterData, slipData }),
//     });

//     console.log("📡 Update response status:", response.status);

//     if (response.ok) {
//       const result = await response.json();
//       console.log("✅ Freight voucher updated successfully:", result);
//       alert(`Freight voucher updated successfully! Freight ID: ${result.freight_id}`);
//       setLocation("/voucher-view");
//     } else {
//       const errorText = await response.text();
//       console.error("❌ Update failed:", response.status, errorText);
//       alert(`Failed to update freight voucher: ${errorText}`);
//     }

//   } catch (error: any) {
//     console.error("❌ Error updating freight voucher:", error);
//     alert(`Failed to update freight voucher: ${error.message}`);
//   }
// };


  return (
    <div
      className="container-fluid p-2"
      style={{
        backgroundColor: "#e6ffee",
        minHeight: "100vh",
        overflowY: "hidden", // 🚨 Block vertical scroll only
      }}
    >
      {/* Header */}
      <div
        className="d-flex justify-content-between align-items-center px-2 py-1 rounded"
        style={{ backgroundColor: "#336699", color: "#fff" }}
      >
        <strong>Voucher Entry</strong>
      </div>

   {/* Row 1 */}
<div className="row mt-3 mb-2">
  <div className="col-md-4">
    <strong className="text-black">Company</strong>
    <input
      className="form-control"
      value={formData.company_name || "Shahzor' Feed (Pvt.) Ltd"}
      readOnly
    />
  </div>

  <div className="col-md-4">
    <strong className="text-black">Branch</strong>
    <select
      className="form-control"
      value={formData.branch_id || ""}
      onChange={(e) =>
        setFormData({ ...formData, branch_id: e.target.value })
      }
    >
     
      <option value="MULTAN FEEDS ">MULTAN FEEDS </option>
      {/* Agar aur branches hain to map karke add karein */}
    </select>
  </div>

  <div className="col-md-4">
    <strong className="text-black">Type</strong>
    <input
      className="form-control"
      value={formData.voucherType || "IGP"}
      readOnly
    />
  </div>
</div>

{/* Row 2 */}
<div className="row mb-3">
  <div className="col-md-4">
    <strong className="text-black">Doc No</strong>
    <input
      type="text"
      value={formData.docNo || maxDocNo}
      readOnly={!!voucherId} // readonly in edit mode
      className="form-control form-control-sm"
      onChange={(e) => handleFormDataChange('docNo', e.target.value)}
    />
  </div>




  

  <div className="col-md-4">
    <strong className="text-black">Doc Date</strong>
    <input
      type="date"
      className="form-control"
      value={formData.docDate || currentDate}
      onChange={(e) => handleFormDataChange('docDate', e.target.value)}
    />
  </div>

  <div className="col-md-4">
    <strong className="text-black">Creation Date</strong>
    <input
      type="date"
      className="form-control"
      value={formData.creationDate || currentDate}
      onChange={(e) => handleFormDataChange('creationDate', e.target.value)}
    />
  </div>
</div>





{/* Remarks */}
<div className="row mb-4">
  <div className="col-12">
    <strong className="text-black">Remarks</strong>
    <textarea
      className="form-control"
      rows={1}
      value={formData.remarks || ""}
      onChange={(e) => handleFormDataChange('remarks', e.target.value)}
      placeholder="Enter remarks here..."
    ></textarea>
  </div>
</div>


      {/* Table */}
      <div className="table-responsive" style={{ marginTop: "20px" }}>
        {/* 👆 Added marginTop to move table down */}
        <table className="table table-bordered table-sm">
          <thead>
            <tr className="text-center">
              <th>Item</th>
              <th>Party</th>
              <th>Slip No</th>
              <th>Vehicle No</th>
              {/* <th>Delivery Term</th> */}
              <th>Item Desc</th>
              <th>Party Name</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Freight Amount</th>
              <th></th>
            </tr>
          </thead>
        <tbody>
  {Array.from({ length: Math.max(tableData.length, 6) }).map((_, i) => {
    const row = tableData[i] || {};
    return (
      <tr key={i}>
        {/* ✅ ITEM CHECKBOX */}
        <td className="text-center">
          <input
            type="checkbox"
            className="form-check-input"
            checked={selectedRows.has(i)}
            onChange={(e) =>
              handleItemCheckboxChange(i, e.target.checked)
            }
          />
        </td>

        {/* ✅ PARTY CHECKBOX – same logic for LOV */}
        <td className="text-center">
          <input
            type="checkbox"
            className="form-check-input"
            checked={selectedPartyRows?.has(i) || false}
            onChange={(e) => handlePartyCheckboxChange(i, e.target.checked)}
          />
        </td>



<td style={{ position: "relative" }}>
  {selectedRows.has(i) || selectedPartyRows?.has(i) ? (
    (() => {
      const rowSearch = lovSearchByRow[i] ?? "";
      const isLovOpen = !!lovOpenByRow[i];

      const filteredLov = slipData.filter(
        (slip) =>
          slip.slip_no.toString().includes(rowSearch) ||
          (slip.vehicle_no || "")
            .toLowerCase()
            .includes(rowSearch.toLowerCase())
      );

      const highlightIndex = lovHighlightByRow[i] ?? 0;

      return (
        <>
          <input
            className="form-control form-control-sm"
            placeholder="Search Slip No"
            value={rowSearch}
            onChange={(e) => {
              setLovSearch(i, e.target.value);
              setLovOpen(i, true);
              setLovHighlight(i, 0);
            }}
            onFocus={() => {
              setLovOpen(i, true);
              setLovHighlight(i, 0);
              setActiveLovType(
                selectedRows.has(i)
                  ? "item"
                  : selectedPartyRows.has(i)
                  ? "party"
                  : null
              );
            }}
            onKeyDown={async (e) => {
              if (!isLovOpen) return;

              if (e.key === "ArrowDown") {
                e.preventDefault();
                setLovHighlight(
                  i,
                  Math.min(highlightIndex + 1, filteredLov.length - 1)
                );
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setLovHighlight(i, Math.max(highlightIndex - 1, 0));
              } else if (e.key === "Enter" || e.key === "Tab") {
                if (filteredLov.length > 0) {
                  e.preventDefault();
                  await selectLovSlip(
                    i,
                    filteredLov[highlightIndex] || filteredLov[0]
                  );

                  // Tab -> next field focus
                  if (e.key === "Tab") {
                    setTimeout(() => {
                      const el = document.querySelector(
                        `#freight-amount-${i}`
                      ) as HTMLElement | null;
                      el?.focus?.();
                    }, 0);
                  }
                }
              } else if (e.key === "Escape") {
                e.preventDefault();
                setLovOpen(i, false);
              }
            }}
          />

          {isLovOpen && (
            <ul
              className="list-group"
              style={{
                position: "absolute",
                zIndex: 1000,
                maxHeight: "200px",
                overflowY: "auto",
                width: "20rem",
              }}
            >
              {filteredLov.map((slip, idx) => (
                <li
                  key={idx}
                  className={`list-group-item list-group-item-action ${
                    idx === highlightIndex ? "active" : ""
                  }`}
                  onMouseEnter={() => setLovHighlight(i, idx)}
                  onClick={() => selectLovSlip(i, slip)}
                  style={{ cursor: "pointer" }}
                >
                  WB Slip # {slip.slip_no} - Vehicle # {slip.vehicle_no}
                </li>
              ))}
            </ul>
          )}
        </>
      );
    })()
  ) : (
    <input
      className="form-control form-control-sm"
      value={
        row.slip_no === true || row.slip_no === false
          ? ""
          : String(row.slip_no || "")
      }
      readOnly
      placeholder="Check item or party box to select slip"
    />
  )}
</td>












        <td>
          <input
            className="form-control form-control-sm"
            value={
              typeof row.vehicle_no === "boolean"
                ? ""
                : String(row.vehicle_no ?? "")
            }
            readOnly
          />
        </td>

        {/* <td>
          <input
            className="form-control form-control-sm"
            value={safeValue(row.do_date || row.delivery_term)}
            readOnly
          />
        </td> */}

        <td>
          <input
            className="form-control form-control-sm"
            value={safeValue(row.item_desc)}
            readOnly
          />
        </td>

      <td>
  <input
    className="form-control form-control-sm"
    value={
      // ✅ Party name sirf tab show karo jab Party checkbox checked ho
      selectedPartyRows?.has(i)
        ? typeof row.vendor_name === "boolean"
          ? ""
          : typeof row.customer_name === "boolean"
          ? ""
          : String(row.vendor_name || row.customer_name || "")
        : "" // ✅ agar Party checkbox unchecked hai to blank dikhao
    }
    readOnly
  />
</td>


{/* Debit Column */}
<td>
  <div className="small text-muted" style={{ fontSize: "11px" }}>
    {/* {row.debit_account_code || ""} */}
  </div>
  <input
    type="text"
    className="form-control form-control-sm"
    value={row.debit_account_desc || ""}
    readOnly
    placeholder="Account description"
  />
</td>

{/* Credit Column */}
<td>
  <input
    type="text"
    className="form-control form-control-sm"
    value={row.credit_account_desc || ""}
    readOnly
    placeholder="Account description"
  />
</td>




        <td>
<input
  id={`freight-amount-${i}`}
  className="form-control form-control-sm"
  value={safeValue(row.freight_amount)}
  onChange={(e) =>
    handleTableDataChange(i, "freight_amount", e.target.value)
  }
/>

        </td>

        <td>
          <button className="btn btn-sm btn-outline-danger">X</button>
        </td>
      </tr>
    );
  })}
</tbody>

        </table>
      </div>

      {/* Footer Buttons */}
      <div className="row mt-4">
        {/* 👆 Increased marginTop to move buttons further down */}
        <div className="col-md-6 text-start">
<button
  className="btn btn-success px-4"
  style={{ fontWeight: "bold" }}
  onClick={handleSave}
>
  {isEditMode ? "[Update]" : "[Save]"}
</button>
        </div>
       <div className="col-md-6 text-end">
  <button
    className="btn btn-danger px-4"
    style={{ fontWeight: "bold" }}
    onClick={() => setLocation("/voucher-view")} // <-- same as handleSave
  >
    [Exit]
  </button>
</div>
      </div>
    </div>
  );
};

export default FreightEntry;