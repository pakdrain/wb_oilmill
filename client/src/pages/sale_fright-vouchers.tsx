import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation } from "wouter";

const SaleFreightVoucher = () => {
  const [, setLocation] = useLocation();
  const [freightVouchers, setFreightVouchers] = useState<any[]>([]);
  const [freightDetails, setFreightDetails] = useState([]);
  const [selectedFreightId, setSelectedFreightId] = useState<string | number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState("1");
  const [selectedVoucherType, setSelectedVoucherType] = useState("cpv");
  const [freightItems, setFreightItems] = useState<any[]>([]);
  const [selectedVoucherIds, setSelectedVoucherIds] = useState<(string | number)[]>([]);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [tableData, setTableData] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingWbId, setEditingWbId] = useState<number | string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("PREPARED");
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [approvedVouchers, setApprovedVouchers] = useState<any[]>([]);
  const [onlineVouchers, setOnlineVouchers] = useState<any[]>([]);
  const [editingFreightId, setEditingFreightId] = useState<number | null>(null);
  const [localFormItems, setLocalFormItems] = useState<any[]>([]); // Yeh line add karo
  // States for dropdowns
  const [itemsList, setItemsList] = useState<any[]>([]);
  const [vendorsList, setVendorsList] = useState<any[]>([]);
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    column: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [vendorCache, setVendorCache] = useState<any[]>([]);
  const [vendorsLoaded, setVendorsLoaded] = useState(false);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
// Ref ko update karo taki yeh input aur textarea dono ko handle kar sake:
const inputRefs = useRef<{[key: string]: HTMLInputElement | HTMLTextAreaElement | null}>({});

// Or better: any type use karo for simplicity:

  // Use refs to track cursor positions

  const [cursorPositions, setCursorPositions] = useState<{[key: string]: number}>({});

 // ✅ TypeScript type for vendor voucher
type VendorVoucherState = {
  vendorNo: string;
  vendorDate: string;
  voucherType: string;
  vendorName: string;
  cashAmount: number;
  referenceNo: string;
  customers: string;
  currency: string;
  exchangeRate: number;
  description: string;
  company: string;
  branch: string;
  customerId: number | null;
  customerName: string;
  createdBy: number | null;
  month: string;
  accountBalance: string; // Added this field
};

// ✅ TypeScript Interface for voucher account
interface VoucherAccount {
  voucher_account_id?: number;
  voucher_id: number;
  account_id: number;
  debit?: number | string;
  credit?: number | string;
  naration?: string;
  created_by?: number;
  creation_date?: string;
  last_updated_by?: number;
  last_update_date?: string;
  sub_account_code?: string;
  reference_id?: number;
  dispatch_date?: string | null;
  realization_date?: string | null;
  cost_center_id?: number | null;
  fe_debit?: number | string;
  fe_credit?: number | string;
  segment1?: string;
  work_type?: string;
  hide?: string;
  file_source?: string | null;
  att_id?: number | null;
  file_ext?: string | null;
  file_name?: string | null;
  flock_id?: number | null;
  doc_date?: string;
  payment_mode?: string;
  doc_no?: string;
  paid_account?: string;
  vendor_id?: number | null;
  customer_id?: number | null;
  item_id?: number | null;
  qty?: number | null;
  p_type?: string;
  wb_id?: number | null;
  slip_no?: string;
}

const [vendorVoucherData, setVendorVoucherData] = useState<VendorVoucherState>({
  vendorNo: "",
  vendorDate: new Date().toISOString().split('T')[0],
  voucherType: "CRV",
  vendorName: "",
  cashAmount: 0,
  referenceNo: "",
  customers: "",
  currency: "PKR",
  exchangeRate: 1,
  description: "",
  company: "MULTAN FEEDS ",
  branch: "",
  customerId: null,
  customerName: "",
  createdBy: null,
  month: new Date().toISOString().slice(0, 7), // Current month in YYYY-MM format
  accountBalance: "" // ✅ Add this field
});


  // New state to control form visibility
  const [showVendorVoucherForm, setShowVendorVoucherForm] = useState(false);
  const [isAddVoucherMode, setIsAddVoucherMode] = useState(false);

const filteredVouchers = useMemo(() => {
  const vouchers = freightVouchers || [];

  let filtered = vouchers;

  // Status filter
  if (selectedStatus) {
    filtered = filtered.filter(v => v.status === selectedStatus);
  }

  // Month filter - FIXED VERSION
  if (vendorVoucherData?.month) {
    filtered = filtered.filter(v => {
      // Get the date field - use voucher_date (from API) or voucherDate
      const dateStr = v.voucher_date || v.voucherDate;
      if (!dateStr) return false;
      
      try {
        // Parse the date string
        const voucherDate = new Date(dateStr);
        
        // Check if date is valid
        if (isNaN(voucherDate.getTime())) return false;
        
        // Get YYYY-MM format
        const voucherMonth = voucherDate.getFullYear() + '-' + 
                           String(voucherDate.getMonth() + 1).padStart(2, '0');
        
        // Compare with selected month
        return voucherMonth === vendorVoucherData.month;
      } catch (error) {
        console.error('Error parsing date:', dateStr, error);
        return false;
      }
    });
  }

  return filtered;
}, [freightVouchers, selectedStatus, vendorVoucherData?.month]);


const handleVoucherFieldChange = useCallback((
  voucherId: string, // Changed parameter name
  field: string,
  value: any
) => {
  setFreightVouchers(prev =>
    prev.map(v =>
      v.voucher_id === voucherId ? { ...v, [field]: value } : v // Changed field
    )
  );
}, []);

  const isDisabledAll = useMemo(() => 
    ["ONLINE", "CANCELLED", "CHECKED"].includes(selectedStatus),
    [selectedStatus]
  );

  useEffect(() => {
    fetchFreightVouchers();
    fetchItemsList();
    // Preload vendors on mount for better UX
    fetchVendorsList();
  }, [selectedStatus]);

  // Fetch items for dropdown
  const fetchItemsList = async () => {
    try {
      const response = await fetch("/api/items");
      if (response.ok) {
        const data = await response.json();
        setItemsList(data);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  // Fetch vendors for dropdown with caching - Load once
  const fetchVendorsList = async (forceRefresh = false) => {
    // If vendors are already cached and not forcing refresh, use cache
    if (vendorCache.length > 0 && vendorsLoaded && !forceRefresh) {
      setVendorsList(vendorCache);
      return;
    }

    setIsLoadingVendors(true);
    try {
      const response = await fetch("/api/vendors?limit=1000");
      if (response.ok) {
        const data = await response.json();
        
        // Sort vendors by name for better UX
        const sortedVendors = data.sort((a: any, b: any) => {
          const nameA = (a.vendor_name || a.party_name || "").toLowerCase();
          const nameB = (b.vendor_name || b.party_name || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });
        
        setVendorsList(sortedVendors);
        setVendorCache(sortedVendors); // Cache the vendors
        setVendorsLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      // If fetch fails but we have cache, use cache
      if (vendorCache.length > 0) {
        setVendorsList(vendorCache);
      }
    } finally {
      setIsLoadingVendors(false);
    }
  };

  // Memoized filtered vendors for better performance
  const filteredVendors = useMemo(() => {
    if (!searchTerm) return vendorsList.slice(0, 50); // Limit initial display
    
    return vendorsList.filter(vendor => {
      const vendorName = (vendor.vendor_name || vendor.party_name || "").toLowerCase();
      const vendorCode = (vendor.vendor_code || "").toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      return vendorName.includes(searchLower) || vendorCode.includes(searchLower);
    }).slice(0, 100); // Limit results for performance
  }, [vendorsList, searchTerm]);

  // Memoized filtered items
  const filteredItems = useMemo(() => {
    if (!searchTerm) return itemsList.slice(0, 50);
    
    return itemsList.filter(item => {
      const itemDesc = (item.item_desc || "").toLowerCase();
      const itemCode = (item.item_code || "").toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      return itemDesc.includes(searchLower) || itemCode.includes(searchLower);
    }).slice(0, 100);
  }, [itemsList, searchTerm]);



  const fetchVoucherData = async (voucherId: number) => {
  try {
    const res = await fetch(`/api/vouchers/sale-freight/${voucherId}`);
    if (!res.ok) throw new Error("Failed to fetch voucher data");
    
    const data = await res.json();

    // Assuming backend returns { master, details }
    return {
      master: data.master,
      details: data.details || [],
    };
  } catch (err) {
    console.error("fetchVoucherData Error:", err);
    return null;
  }
};


const handleApprove = async () => {
  if (!selectedRow || !selectedRow.voucher_id) {
    alert("Please select a valid voucher to approve");
    return;
  }

  try {
    const response = await fetch(
      `/api/sale-freight-approve/${selectedRow.voucher_id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: 1 })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to approve voucher");
    }

    const approvedVoucher = result.data.voucher;

    /* =========================
       🔥 UI STATE MANAGEMENT
       ========================= */

    // 1️⃣ Remove from Prepared / Freight list
    setFreightVouchers(prev =>
      prev.filter(v => v.voucher_id !== approvedVoucher.voucher_id)
    );

    // 2️⃣ Add to Approved list
    setApprovedVouchers(prev => [approvedVoucher, ...prev]);

    // 3️⃣ Update selection
    setSelectedRow(approvedVoucher);

    alert("✅ Voucher approved successfully!");
  } catch (err) {
    console.error("Approve error:", err);
    alert("❌ Error approving voucher");
  }
};






 const handleUnapprove = async () => {
  if (!selectedRow || !selectedRow.voucher_id) {
    alert("Please select a valid voucher to unapprove");
    return;
  }

  try {
    const response = await fetch(
      `/api/sale-freight-unapprove/${selectedRow.voucher_id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: 1 })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to unapprove voucher");
    }

    const voucher = result.data.voucher;

    setFreightVouchers(prev =>
      prev.map(row =>
        row.voucher_id === voucher.voucher_id ? voucher : row
      )
    );

    setSelectedRow(voucher);
    alert("Voucher unapproved successfully!");
  } catch (err) {
    console.error("Unapprove error:", err);
    alert("Error unapproving voucher");
  }
};




  const handleCancel = () => {
    console.log("Cancel clicked");
  };


  
const handleOnline = async () => {
  if (!selectedRow || selectedRow.status !== "APPROVED") {
    alert("❌ Only approved vouchers can go online!");
    return;
  }

  try {
    /* =======================
       1️⃣ Fetch voucher data
       ======================= */
    const voucherResp = await fetch(
      `/api/vouchers/sale-freight/${selectedRow.voucher_id}`
    );

    if (!voucherResp.ok) {
      const text = await voucherResp.text();
      console.error("❌ Failed to fetch voucher:", text);
      alert("❌ Failed to fetch voucher!");
      return;
    }

    const voucherJson = await voucherResp.json();
    const voucher = voucherJson?.data?.voucher;

    if (!voucher || !voucher.voucher_no) {
      console.error("❌ Invalid voucher data:", voucherJson);
      alert("❌ Voucher data incomplete!");
      return;
    }

    /* =======================
       2️⃣ Build complete IGP Payload
       ======================= */
    // ✅ IGP Payload
    const igpPayload = {
      master: {
        voucher_id: voucher.voucher_id,
        voucher_type: voucher.voucher_type,
        voucher_no: voucher.voucher_no,
        voucher_date: voucher.voucher_date,
        description: voucher.description,
        batch_id: voucher.batch_id,
        created_by: voucher.created_by,
        creation_date: voucher.creation_date,
        last_updated_by: voucher.last_updated_by,
        last_update_date: voucher.last_update_date,
        status: voucher.status,
        approved_by: voucher.approved_by,
        approval_date: voucher.approval_date,
        posted_by: voucher.posted_by,
        posting_date: voucher.posting_date,
        branch_id: voucher.branch_id,
        module: voucher.module,
        module_doc: voucher.module_doc,
        module_doc_id: voucher.module_doc_id,
        reference_no: voucher.reference_no,
        cheked_by: voucher.cheked_by,
        checked_date: voucher.checked_date,
        currency: voucher.currency,
        exchange_rate: voucher.exchange_rate,
        fe_voucher: voucher.fe_voucher,
        ref_date: voucher.ref_date,
        paid_amount: voucher.paid_amount,
        last_updated_date: voucher.last_updated_date,
        acc_id: voucher.acc_id,
        canceled_by: voucher.canceled_by,
        canceled_date: voucher.canceled_date,
        closed: voucher.closed,
        voucher_site: voucher.voucher_site,
        sale_purchase: voucher.sale_purchase,
        dc_igp_id: voucher.dc_igp_id,
        bank_id: voucher.bank_id,
        wh_tax_id: voucher.wh_tax_id,
        wh_tax_amt: voucher.wh_tax_amt,
        company_id: voucher.company_id,
        cpv_type: voucher.cpv_type,
        customer_id: voucher.customer_id,
        customer_name: voucher.customer_name
      },
      details: (voucher.accounts || []).map((d: VoucherAccount, i: number) => ({
        voucher_account_id: d.voucher_account_id || i + 1,
        voucher_id: d.voucher_id,
        account_id: d.account_id,
        debit: Number(d.debit) || 0,
        credit: Number(d.credit) || 0,
        naration: d.naration || "",
        created_by: d.created_by || voucher.created_by,
        creation_date: d.creation_date || new Date().toISOString(),
        last_updated_by: d.last_updated_by || d.created_by || voucher.created_by,
        last_update_date: d.last_update_date || new Date().toISOString(),
        sub_account_code: d.sub_account_code || "",
        reference_id: d.reference_id || 0,
        dispatch_date: d.dispatch_date || null,
        realization_date: d.realization_date || null,
        cost_center_id: d.cost_center_id || null,
        fe_debit: Number(d.fe_debit) || 0,
        fe_credit: Number(d.fe_credit) || 0,
        segment1: d.segment1 || "",
        work_type: d.work_type || "",
        hide: d.hide || "N",
        file_source: d.file_source || null,
        att_id: d.att_id || null,
        file_ext: d.file_ext || null,
        file_name: d.file_name || null,
        flock_id: d.flock_id || null,
        doc_date: d.doc_date || voucher.voucher_date,
        payment_mode: d.payment_mode || "CASH",
        doc_no: d.doc_no || "",
        paid_account: d.paid_account || "",
        vendor_id: d.vendor_id || null,
        customer_id: d.customer_id || null,
        item_id: d.item_id || null,
        qty: d.qty || null,
        p_type: d.p_type || "NORMAL",
        wb_id: d.wb_id || null,
        slip_no: d.slip_no || ""
      }))
    };

    console.log("📤 IGP Payload:", igpPayload);

    /* =======================
       3️⃣ Send to IGP
       ======================= */
    const igpResp = await fetch(
      "http://portal.sabirsgroup.com:8184/ords/sabroso_ords/webridge_igp/manual-vouchers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(igpPayload)
      }
    );

    const igpText = await igpResp.text();
    const igpData = JSON.parse(igpText);

    console.log("📥 IGP Response:", igpData);

    if (igpData.res_status !== 2) {
      alert(`❌ IGP rejected: ${igpData.res_message}`);
      return;
    }

    /* =======================
       4️⃣ Mark voucher ONLINE in backend
       ======================= */
    const onlineResp = await fetch(
      `/api/sale-freight-online/${voucher.voucher_id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ONLINE" })
      }
    );

    const onlineJson = await onlineResp.json();
    if (!onlineJson.success) {
      alert("❌ Failed to update voucher status!");
      return;
    }

    /* =======================
       5️⃣ Update UI immediately
       ======================= */
    setApprovedVouchers(prev =>
      prev.filter(v => String(v.voucher_id) !== String(voucher.voucher_id))
    );

    // Optional: add to online list if needed
    // setOnlineVouchers(prev => [voucher, ...prev]);

    setSelectedRow(null); // Clear selection to avoid reprocessing

    // ✅ Show success message and reload the page
    alert("✅ Voucher successfully moved ONLINE!");
    
    // Reload the page after successful operation
    window.location.reload();

  } catch (err) {
    console.error("❌ Online error:", err);
    alert("❌ Error while moving voucher online!");
  }
};






  const handleExit = () => {
    console.log("Exit clicked");
  };



 const fetchFreightVouchers = async () => {
  try {
    const response = await fetch("/api/vouchers/get-sale-freight"); 
    if (response.ok) {
      const resJson = await response.json(); // full response object
      const vouchers: any[] = resJson?.data?.vouchers || []; // <-- correct array
      const filtered = selectedStatus
        ? vouchers.filter(v => v.status === selectedStatus)
        : vouchers;
      setFreightVouchers(filtered);
    }
  } catch (error) {
    console.error("Error fetching freight vouchers:", error);
  }
};


  const fetchFreightDetails = async (freightId: number | string) => {
    try {
      const response = await fetch(
        `/api/freight-vouchers/${freightId}/details`,
      );
      if (response.ok) {
        const data = await response.json();
        setFreightDetails(data);
      }
    } catch (error) {
      console.error("Error fetching freight details:", error);
    }
  };

const fetchFreightItems = async (voucherId: number | string) => {
  console.log(`🔄 Fetching accounts for voucher ${voucherId}`);
  
  try {
    const response = await fetch(`http://10.10.10.217:5000/api/vouchers/${voucherId}/accounts`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`❌ API Error ${response.status}:`, errorData);
      throw new Error(errorData.error || `API Error ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Received ${data.length} account entries`);
    
    if (data.length > 0) {
      console.log("📋 First entry structure:", data[0]);
    }
    
    // Map API response to match your table structure
    const mappedData = data.map((account: any) => ({
      voucher_account_id: account.voucher_account_id,
      voucher_id: account.voucher_id,
      
      // For ViewDetailTable columns:
      party: account.vendor_name || "",                    // Goes to "Party" column
      account_code: account.account_id?.toString() || "",  // Goes to "Account Code" column
      account_desc: account.account_desc || "",            // Goes to "Description" column
      vendor_name: account.vendor_name || "",              // Keep for reference
      
      // Amount fields
      debit: account.debit?.toString() || "0.00",
      credit: account.credit?.toString() || "0.00",
      
      // Other fields
      naration: account.naration || "",
      vendor_id: account.vendor_id,
      
      // Original API fields (for debugging)
      _original: account
    }));
    
    console.log("📋 Mapped data for table:", mappedData);
    return mappedData;
    
  } catch (error) {
    console.error("❌ Error fetching accounts:", error);
    return [];
  }
};


const handleCheckboxChange = async (
  event: React.ChangeEvent<HTMLInputElement>,
  voucher: any
) => {
  console.log("✅ Checkbox clicked for voucher:", voucher);
  
  if (event.target.checked) {
    setSelectedVoucherIds((prev) => [...prev, voucher.voucher_id]);
    setSelectedRow(voucher);
    setSelectedFreightId(voucher.voucher_id);
    
    setIsLoadingAccounts(true);
    setFreightItems([]); // Clear previous data

    try {
      console.log("🔄 Fetching accounts for voucher ID:", voucher.voucher_id);
      const accounts = await fetchFreightItems(voucher.voucher_id);
      setFreightItems(accounts || []);
      
    } catch (err) {
      console.error("❌ Error in checkbox change:", err);
      setFreightItems([]);
    } finally {
      setIsLoadingAccounts(false);
    }
    
  } else {
    setSelectedVoucherIds((prev) =>
      prev.filter((id) => id !== voucher.voucher_id)
    );
    setSelectedRow(null);
    setSelectedFreightId(null);
    setFreightItems([]);
  }
};


  const handleNewEntry = () => {
    const params = new URLSearchParams();
    params.set("branch", selectedBranch);
    params.set("type", selectedVoucherType);
    setLocation(`/voucher-entry?${params.toString()}`);
  };

  const handleEditEntry = async () => {
    if (!selectedRow) return;

    setIsEditMode(true);

    const voucherId =
      selectedRow.freight_id ?? selectedRow.voucher_id ?? selectedRow.id;

    if (!voucherId) {
      alert("❌ No valid ID found in selected row.");
      console.log("SELECTED ROW →", selectedRow);
      return;
    }

    setEditingWbId(voucherId);

    try {
      const masterResp = await fetch(`/api/freight-vouchers/${voucherId}`);

      if (!masterResp.ok) {
        alert("❌ Failed to load master record.");
        return;
      }

      const master = await masterResp.json();

      if (!master || Object.keys(master).length === 0) {
        alert("❌ Master record empty.");
        return;
      }

      console.log("MASTER RAW DATA FROM API →", master);

      setFreightVouchers(prev => {
        const exists = prev.find(v => v.freight_id === master.freight_id);
        if (exists) {
          return prev.map(v =>
            v.freight_id === master.freight_id ? { ...v, ...master } : v
          );
        }
        return [...prev, master];
      });

      setSelectedStatus(master.status);

      const itemsResp = await fetch(`/api/freight-items?freightId=${voucherId}`);
      const itemsData = await itemsResp.json();

      const preparedRows = itemsData.map((row: any) => ({
        ...row,
        slip_no: row.slip_no || row.remarks || "",
        vehicle_no: row.vehicle_no || "",
        item_desc: row.item_desc || "",
        vendor_name: row.vendor_name || row.party_name || "",
      }));

      setTableData(preparedRows);

      const params = new URLSearchParams();
      params.set("branch", selectedBranch);
      params.set("type", selectedVoucherType);
      params.set("voucherId", voucherId.toString());
      params.set("mode", "edit");

      setLocation(`/voucher-entry?${params.toString()}`);
    } catch (error) {
      console.error("❌ Error loading edit entry:", error);
      alert("Failed to load entry for edit");
    }
  };

  const handleViewEntry = () => {
    if (!selectedRow) return;
    setFormData(selectedRow);
    setIsEditMode(false);
    setEditingWbId(selectedRow.id);
  };

   // Handle vendor voucher form changes with cursor preservation
  const handleVendorVoucherChange = (field: string, value: any) => {
    // Save cursor position before update
    const input = inputRefs.current[field];
    if (input) {
      const cursorPos = input.selectionStart || 0;
      setCursorPositions(prev => ({ ...prev, [field]: cursorPos }));
    }
    
    setVendorVoucherData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Restore cursor position after render
  useEffect(() => {
    Object.keys(cursorPositions).forEach(field => {
      const input = inputRefs.current[field];
      const cursorPos = cursorPositions[field];
      if (input && cursorPos !== undefined) {
        setTimeout(() => {
          input.setSelectionRange(cursorPos, cursorPos);
        }, 0);
      }
    });
  }, [vendorVoucherData, cursorPositions]);

  const toggleVendorVoucherForm = () => {
    setShowVendorVoucherForm(!showVendorVoucherForm);

    if (!showVendorVoucherForm) {
      // 👉 Add Voucher clicked
      setIsAddVoucherMode(true);

      setVendorVoucherData({
        vendorNo: "",
        vendorDate: new Date().toISOString().split('T')[0],
        voucherType: "FFCPY",
        vendorName: "",
        cashAmount: 0,
        referenceNo: "",
        customers: "",
        currency: "PKR",
        exchangeRate: 1,
        description: "",
        company: "MULTAN FEEDS ",
        branch: "",
        accountBalance: "",
        customerId: null,
        customerName: "",
        createdBy: null,
        month: new Date().toISOString().slice(0, 7)
      });
    } else {
      // 👉 Hide Form clicked
      setIsAddVoucherMode(false);
    }
  };

  // Handle cell click for editing
  const handleCellClick = useCallback(async (rowIndex: number, column: string) => {
    if (isDisabledAll) return; // Don't allow editing in certain statuses
    
    setEditingCell({ rowIndex, column });
    setSearchTerm("");
    
    // Show appropriate dropdown
    if (column === 'vendor') {
      setShowVendorDropdown(true);
      setShowItemDropdown(false);
    } else if (column === 'item') {
      setShowVendorDropdown(false);
      setShowItemDropdown(true);
    }
  }, [isDisabledAll]);

  // Handle item selection
  const handleItemSelect = useCallback((rowIndex: number, item: any) => {
    const updatedItems = [...freightItems];
    updatedItems[rowIndex] = {
      ...updatedItems[rowIndex],
      item_desc: item.item_desc || item.item_name,
      item_code: item.item_code,
      full_item_desc: item.full_item_desc || item.item_desc,
    };
    setFreightItems(updatedItems);
    setEditingCell(null);
    setShowItemDropdown(false);
  }, [freightItems]);

  // Handle vendor selection
  const handleVendorSelect = useCallback((rowIndex: number, vendor: any) => {
    const updatedItems = [...freightItems];
    updatedItems[rowIndex] = {
      ...updatedItems[rowIndex],
      vendor_name: vendor.vendor_name || vendor.party_name,
      vendor_id: vendor.vendor_id || vendor.party_id,
      vendor_code: vendor.vendor_code,
    };
    setFreightItems(updatedItems);
    setEditingCell(null);
    setShowVendorDropdown(false);
  }, [freightItems]);

  // Handle detail field change with cursor preservation
  const handleDetailFieldChange = useCallback((rowIndex: number, field: string, value: any) => {
    const updatedItems = [...freightItems];
    updatedItems[rowIndex] = {
      ...updatedItems[rowIndex],
      [field]: value
    };
    setFreightItems(updatedItems);
  }, [freightItems]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target || !(event.target as Element).closest('.dropdown-container')) {
        setShowVendorDropdown(false);
        setShowItemDropdown(false);
        setEditingCell(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Save detail changes
  const saveDetailChanges = async () => {
    if (!selectedFreightId) return;
    
    try {
      const response = await fetch(`/api/freight-items/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freightId: selectedFreightId,
          items: freightItems
        })
      });
      
      if (response.ok) {
        alert("Details updated successfully!");
      }
    } catch (error) {
      console.error("Error saving details:", error);
      alert("Error saving details");
    }
  };

const saveVendorVoucher = async () => {
  try {
    console.log("🚀 START saveVendorVoucher");

    // ===============================
    // 1️⃣ PREPARE VOUCHER PAYLOAD
    // ===============================
    const voucherPayload = {
      voucherDate: vendorVoucherData.vendorDate,
      voucherNo: vendorVoucherData.vendorNo,
      company_name: vendorVoucherData.company,
      branch: vendorVoucherData.branch,
      customerId: vendorVoucherData.customerId,
      cashAmount: vendorVoucherData.cashAmount,
      accountBalance: vendorVoucherData.accountBalance, // ✅ Custom field
      remarks: vendorVoucherData.description,
      createdBy: vendorVoucherData.createdBy
    };

    console.log("📤 VOUCHER PAYLOAD (to backend):", voucherPayload);

    // ===============================
    // 2️⃣ SAVE VOUCHER MASTER
    // ===============================
    const voucherResponse = await fetch('/api/vouchers/sale-freight/save', { // ✅ Sale Freight API
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voucherPayload)
    });

    const voucherData = await voucherResponse.json();
    console.log("📦 Voucher API Response:", voucherData);

    if (!voucherResponse.ok || !voucherData.voucher_id) {
      console.error("❌ Voucher save failed response:", voucherData);
      alert("Voucher save failed");
      return;
    }

    const voucherId = voucherData.voucher_id;
    console.log("✅ Voucher saved successfully. Voucher ID:", voucherId);

    // ===============================
    // 3️⃣ PREPARE ACCOUNTS PAYLOAD
    // ===============================
    if (freightItems.length > 0) {
      const accounts = freightItems
        .map(item => ({
          slipNo: item.slipNo || null,                     // ✅ Slip No
          accountId: item.accountId || null,               // Party A/C
          subAccountCode: item.sub_acc_code || null,      // Sub Account Code
          description: item.description || "",            // Description
          freightAmount: Number(item.freightAmount) || 0, // Freight Amount
          debit: Number(item.debit) || 0,                 // Debit
          naration: item.notation || "",                  // Naration
          branchId: vendorVoucherData.branch,
          vendorId: item.vendorId || null,
          customerId: vendorVoucherData.customerId
        }))
        .filter(a => a.debit > 0 || a.freightAmount > 0); // Only rows with values

      if (accounts.length > 0) {
        const accountsPayload = {
          voucherId,
          accounts,
          userId: vendorVoucherData.createdBy || 1
        };

        const accResponse = await fetch('/api/vouchers/sale-freight/save-accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(accountsPayload)
        });

        const accData = await accResponse.json();
        if (!accResponse.ok) {
          console.error("❌ Accounts save failed:", accData);
          alert(accData.message || "Accounts save failed");
          return;
        }
      }
    }

    // ===============================
    // 4️⃣ SUCCESS & CLEANUP
    // ===============================
    alert(`✅ Sale Freight Voucher Saved Successfully\nVoucher ID: ${voucherId}`);

    setShowVendorVoucherForm(false);
    setIsAddVoucherMode(false);

    // Clear form
    setVendorVoucherData({
      vendorNo: "",
      vendorDate: new Date().toISOString().split('T')[0],
      voucherType: "SFV",           // Sale Freight Voucher
      vendorName: "",
      cashAmount: 0,
      referenceNo: "",
      customers: "",
      currency: "PKR",
      exchangeRate: 1,
      description: "",
      company: "MULTAN FEEDS ",
      branch: "",
      customerId: null,
      customerName: "",
      createdBy: null,
      month: new Date().toISOString().slice(0, 7),
      accountBalance: ""            // Custom field
    });

    setFreightItems([]);
    fetchFreightVouchers(); // Reload table

  } catch (err) {
    console.error("❌ UNEXPECTED ERROR:", err);
    alert("Unexpected error occurred");
  }
};


  const handlePrint = () => {
    console.log("Selected Freight ID:", selectedFreightId);
    console.log("Freight Items:", freightItems);

    if (!selectedFreightId || freightItems.length === 0) {
      alert("Please select a voucher with details to print.");
      return;
    }

    let totalDr = 0;
    let totalCr = 0;
    
    const currentUserName =
      JSON.parse(sessionStorage.getItem("user") || "{}")?.userName || "admin";

    const rows = freightItems
      .map((item, index) => {
        totalDr += parseFloat(item.debit || 0);
        totalCr += parseFloat(item.credit || item.freight_amount || 0);

        return `
      <tr>
        <td>${index + 1}</td>
        <td>${item.item_code || ""}</td>
        <td>${item.full_item_desc || item.item_desc || ""}</td>
        <td>${item.debit || ""}</td>
        <td>${item.credit || item.freight_amount || ""}</td>
        <td>${item.vendor_name || ""}</td>
        <td>Vehicle: ${item.vehicle_no || ""}, WB ID: ${item.wb_id || ""}</td>
      </tr>
    `;
      })
      .join("");

    const printContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Voucher Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      margin: 30px;
    }

    .header {
      text-align: center;
      margin-bottom: 10px;
    }

    .header h2 {
      margin: 0;
      font-size: 16px;
    }

    .top-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .top-info span {
      font-weight: bold;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }

    table, th, td {
      border: 1px solid black;
    }

    th, td {
      padding: 6px;
      text-align: left;
    }

    .total-row td {
      font-weight: bold;
      text-align: right;
    }

    .footer {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
    }

    .footer .name-line {
      width: 160px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .footer .name-line .user-name {
      font-weight: bold;
      font-size: 12px;
      margin-bottom: 5px;
    }

    .footer .name-line .line {
      border-top: 1px solid black;
      width: 100%;
      margin-bottom: 5px;
    }

    .footer .name-line .label {
      font-weight: normal;
      font-size: 12px;
    }

    .signature {
      margin-top: 80px;
      text-align: right;
      font-weight: bold;
    }

    .bottom-text {
      position: absolute;
      bottom: 10px;
      left: 0;
      width: 100%;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
    }

    .bottom-text span:first-child {
      text-align: left;
      flex: 1;
    }

    .bottom-text span:last-child {
      text-align: center;
      flex: 1;
    }
  </style>
</head>
<body>

  <div class="header">
    <h2>MULTAN FEEDS </h2>
  </div>

  <div class="top-info">
  <div style="text-align: center;">
  Voucher #: 
  <span style="display: inline-block; width: 120px; border-bottom: 1px solid black; text-align: center;">
    ${selectedFreightId || ""}
  </span>
</div>

    <span>Date: 
      <span style="display:inline-block; border-bottom:1px solid black; width:120px; text-align:center; position:relative; top:-4px;font-weight:normal;">
        ${new Date().toLocaleDateString()}
      </span>
    </span>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Account</th>
        <th>Account Description</th>
        <th>DR</th>
        <th>CR</th>
        <th>Narration</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="3">Total</td>
        <td>${totalDr.toFixed(2)}</td>
        <td>${totalCr.toFixed(2)}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">
    <div class="name-line">
      <span class="user-name">${currentUserName}</span>
      <div class="line"></div>
      <span class="label">Prepared By</span>
    </div>
    <div class="name-line">
      <span class="user-name">${currentUserName}</span>
      <div class="line"></div>
      <span class="label">Approved By</span>
    </div>
    <div class="name-line">
      <span class="user-name"></span>
      <div class="line"></div>
      <span class="label">Received By</span>
    </div>
  </div>
</body>
</html>
`;

    const printWindow: Window | null = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Render dropdown for vendor or item
  const renderDropdown = () => {
    if (!editingCell) return null;
    
    const { rowIndex, column } = editingCell;
    
    if (column === 'vendor' && showVendorDropdown) {
      return (
        <div 
          className="dropdown-container"
          style={{
            position: "fixed",
            zIndex: 9999,
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            maxHeight: "300px",
            overflowY: "auto",
            minWidth: "300px",
            maxWidth: "400px"
          }}
        >
          <div className="p-2 border-bottom">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            {isLoadingVendors ? (
              <div className="p-3 text-center">
                <div className="spinner-border spinner-border-sm text-primary"></div>
                <span className="ms-2">Loading vendors...</span>
              </div>
            ) : filteredVendors.length > 0 ? (
              filteredVendors.map((vendor) => (
                <button
                  key={vendor.vendor_id || vendor.party_id}
                  className="dropdown-item text-start"
                  onClick={() => handleVendorSelect(rowIndex, vendor)}
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                >
                  <div className="fw-bold">{vendor.vendor_name || vendor.party_name}</div>
                  {vendor.vendor_code && (
                    <div className="text-muted small">Code: {vendor.vendor_code}</div>
                  )}
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-muted">No vendors found</div>
            )}
          </div>
        </div>
      );
    }
    
    if (column === 'item' && showItemDropdown) {
      return (
        <div 
          className="dropdown-container"
          style={{
            position: "fixed",
            zIndex: 9999,
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            maxHeight: "300px",
            overflowY: "auto",
            minWidth: "300px",
            maxWidth: "400px"
          }}
        >
          <div className="p-2 border-bottom">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <button
                  key={item.item_id || item.item_code}
                  className="dropdown-item text-start"
                  onClick={() => handleItemSelect(rowIndex, item)}
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                >
                  <div className="fw-bold">{item.item_code} - {item.item_desc}</div>
                  {item.full_item_desc && item.full_item_desc !== item.item_desc && (
                    <div className="text-muted small">{item.full_item_desc}</div>
                  )}
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-muted">No items found</div>
            )}
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Vendor Voucher Form Component - FIXED VERSION
  const VendorVoucherForm = () => {
    // Local state for immediate typing
    const [localValues, setLocalValues] = useState(vendorVoucherData);
    
    // Sync local values when main state changes
    useEffect(() => {
      setLocalValues(vendorVoucherData);
    }, [vendorVoucherData]);

    const handleLocalChange = (field: string, value: any) => {
      setLocalValues(prev => ({ ...prev, [field]: value }));
    };

    const handleLocalBlur = (field: string) => {
      handleVendorVoucherChange(field, localValues[field as keyof VendorVoucherState]);
    };

    return (
      <div className="row mt-3 mb-3" style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <div className="col-md-12">
          
          {/* Header Section */}
          <div className="row mb-3 p-2" style={{ backgroundColor: '#e9ecef', border: '1px solid #dee2e6', borderRadius: '3px' }}>
            <div className="col-md-3 mb-2">
              <label className="form-label fw-bold text-dark">Company</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={localValues.company}
                onChange={(e) => handleLocalChange('company', e.target.value)}
                onBlur={() => handleLocalBlur('company')}
                style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}
              />
            </div>
            
            <div className="col-md-3 mb-2">
              <label className="form-label fw-bold text-dark">Branch</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={localValues.branch}
                onChange={(e) => handleLocalChange('branch', e.target.value)}
                onBlur={() => handleLocalBlur('branch')}
                placeholder="Enter branch"
              />
            </div>
            
            <div className="col-md-3 mb-2">
              <label className="form-label fw-bold text-dark">Type</label>
              <select
                className="form-select form-select-sm"
                value={localValues.voucherType}
                onChange={(e) => {
                  handleLocalChange('voucherType', e.target.value);
                  handleVendorVoucherChange('voucherType', e.target.value);
                }}
              >
                <option value="CRV">CRV</option>
                <option value="CPV">CPV</option>
                <option value="FFCPY">FFCPY</option>
                <option value="BRV">BRV</option>
              </select>
            </div>
            
            <div className="col-md-3 mb-2">
              <label className="form-label fw-bold text-dark">Month</label>
              <input
                type="month"
                className="form-control form-control-sm"
                value={localValues.month}
                onChange={(e) => {
                  handleLocalChange('month', e.target.value);
                  handleVendorVoucherChange('month', e.target.value);
                }}
              />
            </div>
          </div>
          
          {/* Form Fields */}
          <div className="row">
            {/* First Row */}
            <div className="col-md-2">
              <label className="form-label fw-bold text-dark">Vendor No</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={localValues.vendorNo || ''}
                onChange={(e) => handleLocalChange('vendorNo', e.target.value)}
                onBlur={() => handleLocalBlur('vendorNo')}
                placeholder="Vendor number"
              />
            </div>
            
            <div className="col-md-2">
              <label className="form-label fw-bold text-dark">Vendor Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={localValues.vendorDate}
                onChange={(e) => {
                  handleLocalChange('vendorDate', e.target.value);
                  handleVendorVoucherChange('vendorDate', e.target.value);
                }}
              />
            </div>
            
            <div className="col-md-4">
              <label className="form-label fw-bold text-dark">Name</label>
              <input
                ref={el => inputRefs.current['vendorName'] = el}
                type="text"
                className="form-control form-control-sm"
                value={localValues.vendorName}
                onChange={(e) => handleLocalChange('vendorName', e.target.value)}
                onBlur={() => handleLocalBlur('vendorName')}
                placeholder="Vendor name"
              />
            </div>
            
            {/* Second Row */}
            <div className="col-md-3">
              <label className="form-label fw-bold text-dark">Cash Amount</label>
              <input
                ref={el => inputRefs.current['cashAmount'] = el}
                type="text"
                className="form-control form-control-sm"
                value={localValues.cashAmount}
                onChange={(e) => handleLocalChange('cashAmount', e.target.value)}
                onBlur={() => handleLocalBlur('cashAmount')}
                placeholder="Cash amount"
              />
            </div>
            
            <div className="col-md-3">
              <label className="form-label fw-bold text-dark">Reference No</label>
              <input
                ref={el => inputRefs.current['referenceNo'] = el}
                type="text"
                className="form-control form-control-sm"
                value={localValues.referenceNo}
                onChange={(e) => handleLocalChange('referenceNo', e.target.value)}
                onBlur={() => handleLocalBlur('referenceNo')}
                placeholder="Reference number"
              />
            </div>
            
            <div className="col-md-3">
              <label className="form-label fw-bold text-dark">Customers</label>
              <input
                ref={el => inputRefs.current['customers'] = el}
                type="text"
                className="form-control form-control-sm"
                value={localValues.customers}
                onChange={(e) => handleLocalChange('customers', e.target.value)}
                onBlur={() => handleLocalBlur('customers')}
                placeholder="Customers"
              />
            </div>
            
            {/* Currency Field */}
      <div className="col-md-3">
  <label className="form-label fw-bold text-dark">Account Balance</label>
  <input
    type="text"
    className="form-control form-control-sm text-end"
    value={localValues.accountBalance}
    onChange={(e) =>
      handleLocalChange('accountBalance', e.target.value)
    }
    onBlur={() =>
      handleVendorVoucherChange(
        'accountBalance',
        localValues.accountBalance
      )
    }
    placeholder="0.00"
  />
</div>


            
            {/* Description Row */}
            <div className="col-md-12 mt-2">
              <label className="form-label fw-bold text-dark">Description:</label>
              <textarea
                ref={el => inputRefs.current['description'] = el}
                className="form-control form-control-sm"
                rows={2}
                value={localValues.description}
                onChange={(e) => handleLocalChange('description', e.target.value)}
                onBlur={() => handleLocalBlur('description')}
                placeholder="Enter description here..."
              />
            </div>
            
            {/* Form Actions */}
            <div className="col-md-12 mt-2 d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={toggleVendorVoucherForm}
                style={{ minWidth: '100px' }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={saveVendorVoucher}
                style={{ minWidth: '120px' }}
              >
                Save Voucher
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

 // Main Vouchers Table Component (Only shown when NOT in form view)
const MainVouchersTable = () => (
  <div
    className="table-responsive mb-3"
    style={{
      height: "40%",
      overflowY: "auto",
      backgroundColor: "white",
      border: "1px solid #ddd",
      borderRadius: "5px",
      maxHeight: "300px"
    }}
  >
    <table
      className="table table-bordered table-sm text-center mb-0"
      style={{ borderSpacing: "0 4px" }}
    >
      <thead
        style={{
          backgroundColor: "#336699",
          color: "white",
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}
      >
        <tr>
          <th width="3%"></th>
          <th width="10%">Voucher Date</th>
          <th width="15%">Voucher Type</th>
          <th width="10%">Voucher #</th>
          <th width="10%">Reference</th>
          <th width="30%">Description</th>
          <th width="10%">Debit</th>
          <th width="10%">Credit</th>
        </tr>
      </thead>
      <tbody>
        {filteredVouchers && Array.isArray(filteredVouchers) && filteredVouchers.length > 0 ? (
          filteredVouchers.map((voucher, index) => (
            <tr key={voucher.voucher_id || index}>
              <td>
                <div className="form-check d-flex justify-content-center">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedVoucherIds.includes(voucher.voucher_id)}
                    onChange={(e) => handleCheckboxChange(e, voucher)}
                    id={`voucher-${voucher.voucher_id}`}
                  />
                </div>
              </td>
              <td>
                {voucher.voucher_date 
                  ? new Date(voucher.voucher_date).toLocaleDateString('en-GB')
                  : ""}
              </td>
              <td>{voucher.voucher_type || "FFCPY"}</td>
              <td>{voucher.voucher_no || voucher.voucher_id || `#${index + 1}`}</td>
              <td>{voucher.reference_no || ""}</td>
              <td>{voucher.description || voucher.entry_remarks || "No description"}</td>
              <td>{voucher.debit_amount ? voucher.debit_amount.toFixed(2) : "-"}</td>
              <td>{voucher.credit_amount ? voucher.credit_amount.toFixed(2) : "-"}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={8} className="text-center py-3">
              No vouchers found. Click "Add Voucher" to create one.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

// Separate Detail Table for Form View (with Party A/C column)
// In FormDetailTable component - FIXED VERSION
// Fixed FormDetailTable component
const FormDetailTable = () => {
  // Local state for each row's input values to prevent re-renders
  const [localRowValues, setLocalRowValues] = useState<any[]>(() => {
    if (localFormItems.length === 0) {
      return Array(5).fill(null).map((_, index) => ({
        id: `new-row-${index}`,
        checked: false,
        party_account: "",
        party: "",
        description: "",
        sub_acc_code: "",
        debit: "0.00",
        credit: "0.00",
        notation: ""
      }));
    }
    return localFormItems;
  });

  // Initialize once when form is shown
  useEffect(() => {
    if (showVendorVoucherForm && localFormItems.length === 0) {
      const emptyRows = Array(5).fill(null).map((_, index) => ({
        id: `new-row-${index}`,
        checked: false,
        party_account: "",
        party: "",
        description: "",
        sub_acc_code: "",
        debit: "0.00",
        credit: "0.00",
        notation: ""
      }));
      setLocalRowValues(emptyRows);
      setLocalFormItems(emptyRows);
    }
  }, [showVendorVoucherForm]);

  // Handle input change without re-rendering the entire table
  const handleInputChange = (rowIndex: number, field: string, value: any) => {
    const updatedRows = [...localRowValues];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [field]: value
    };
    setLocalRowValues(updatedRows);
    
    // Update parent state on blur only
  };

  // Handle blur to sync with parent
  const handleInputBlur = (rowIndex: number, field: string) => {
    // Update local form items
    const updatedLocalItems = [...localFormItems];
    updatedLocalItems[rowIndex] = {
      ...updatedLocalItems[rowIndex],
      [field]: localRowValues[rowIndex][field]
    };
    setLocalFormItems(updatedLocalItems);
    
    // Update freight items
    const updatedFreightItems = [...freightItems];
    updatedFreightItems[rowIndex] = {
      ...updatedFreightItems[rowIndex],
      [field]: localRowValues[rowIndex][field]
    };
    setFreightItems(updatedFreightItems);
  };

  return (
    <div
      className="table-responsive mb-3"
      style={{
        height: "30%",
        overflowY: "auto",
        position: "relative",
        backgroundColor: "white",
        border: "1px solid #ddd",
        borderRadius: "5px",
        maxHeight: "250px"
      }}
    >
 <table
  className="table table-bordered table-sm text-center mb-0"
  style={{ borderSpacing: "0 4px" }}
>
  <thead
    style={{
      backgroundColor: "#f0f0f0",
      position: "sticky",
      top: 0,
      zIndex: 1,
    }}
  >
    <tr>
      <th width="3%">C</th>
      <th width="3%">G</th>
      <th width="15%">Slip No</th>
      <th width="15%">Party</th>
      <th width="20%">Description</th>
      <th width="15%">Freight Amount</th>
      <th width="10%">Debit</th>
      <th width="20%">Naration</th>
    </tr>
  </thead>

  <tbody>
    {localRowValues.map((item, rowIndex) => (
      <tr key={item.id || `form-row-${rowIndex}`}>

        {/* C - Checkbox */}
        <td className="text-center align-middle">
          <input
            type="checkbox"
            className="h-4 w-4 accent-black border border-black"
            checked={item.isC || false}
            onChange={(e) =>
              handleInputChange(rowIndex, 'isC', e.target.checked)
            }
            onBlur={() => handleInputBlur(rowIndex, 'isC')}
          />
        </td>

        {/* G - Checkbox */}
        <td className="text-center align-middle">
          <input
            type="checkbox"
            className="h-4 w-4 accent-black border border-black"
            checked={item.isG || false}
            onChange={(e) =>
              handleInputChange(rowIndex, 'isG', e.target.checked)
            }
            onBlur={() => handleInputBlur(rowIndex, 'isG')}
          />
        </td>

        {/* Slip No */}
        <td>
          <input
            type="text"
            className="form-control form-control-sm"
            value={item.slip_no || ""}
            onChange={(e) =>
              handleInputChange(rowIndex, 'slip_no', e.target.value)
            }
            onBlur={() => handleInputBlur(rowIndex, 'slip_no')}
            placeholder="Enter Slip No"
          />
        </td>

        {/* Party */}
        <td>
          <input
            type="text"
            className="form-control form-control-sm"
            value={item.party || ""}
            onChange={(e) =>
              handleInputChange(rowIndex, 'party', e.target.value)
            }
            onBlur={() => handleInputBlur(rowIndex, 'party')}
            placeholder="Party name"
          />
        </td>

        {/* Description */}
        <td>
          <input
            type="text"
            className="form-control form-control-sm"
            value={item.description || ""}
            onChange={(e) =>
              handleInputChange(rowIndex, 'description', e.target.value)
            }
            onBlur={() => handleInputBlur(rowIndex, 'description')}
            placeholder="Description"
          />
        </td>

        {/* Freight Amount */}
        <td>
          <input
            type="number"
            className="form-control form-control-sm text-end"
            value={item.freight_amount || "0.00"}
            onChange={(e) =>
              handleInputChange(rowIndex, 'freight_amount', e.target.value)
            }
            onBlur={() => handleInputBlur(rowIndex, 'freight_amount')}
            step="0.01"
            placeholder="0.00"
          />
        </td>

        {/* Debit */}
        <td>
          <input
            type="number"
            className="form-control form-control-sm text-end"
            value={item.debit || "0.00"}
            onChange={(e) =>
              handleInputChange(rowIndex, 'debit', e.target.value)
            }
            onBlur={() => handleInputBlur(rowIndex, 'debit')}
            step="0.01"
            placeholder="0.00"
          />
        </td>

        {/* Naration */}
        <td>
          <input
            type="text"
            className="form-control form-control-sm"
            value={item.notation || ""}
            onChange={(e) =>
              handleInputChange(rowIndex, 'notation', e.target.value)
            }
            onBlur={() => handleInputBlur(rowIndex, 'notation')}
            placeholder="Naration"
          />
        </td>

      </tr>
    ))}
  </tbody>
</table>


    </div>
  );
};
// Separate Detail Table for View Mode (without Party A/C column)
const ViewDetailTable = () => {
  return (
    <div
      className="table-responsive mb-3"
      style={{
        height: "30%",
        overflowY: "auto",
        position: "relative",
        backgroundColor: "white",
        border: "1px solid #ddd",
        borderRadius: "5px",
        maxHeight: "250px"
      }}
    >
      <table
        className="table table-bordered table-sm text-center mb-0"
        style={{ borderSpacing: "0 4px" }}
      >
        <thead
          style={{
            backgroundColor: "#f0f0f0",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <tr>
            <th width="10%">Party</th>
            <th width="15%">Account Code</th>
            <th width="25%">Description</th>
            <th width="15%">Debit</th>
            <th width="15%">Credit</th>
            <th width="15%">Naration</th>
          </tr>
        </thead>
        <tbody>
          {freightItems && Array.isArray(freightItems) && freightItems.length > 0 ? (
            freightItems.map((item, rowIndex) => (
              <tr key={item.voucher_account_id || `view-row-${rowIndex}`}>
                {/* Party - Show vendor name */}
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={item.party || item.vendor_id || ""}
                    readOnly={isDisabledAll}
                  />
                </td>

                {/* Account Code - Use account_id from API */}
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={item.account_code || item.account_id?.toString() || ""}
                    readOnly={isDisabledAll}
                  />
                </td>

                {/* Description - Use account_desc from API */}
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={item.account_desc || ""}
                    readOnly={isDisabledAll}
                  />
                </td>

                {/* Debit */}
                <td>
                  <input
                    type="number"
                    className="form-control form-control-sm text-end"
                    value={item.debit || "0.00"}
                    readOnly={isDisabledAll}
                  />
                </td>

                {/* Credit */}
                <td>
                  <input
                    type="number"
                    className="form-control form-control-sm text-end"
                    value={item.credit || "0.00"}
                    readOnly={isDisabledAll}
                  />
                </td>

                {/* Naration */}
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={item.naration || item.notation || ""}
                    readOnly={isDisabledAll}
                  />
                </td>
              </tr>
            ))
          ) : (
            // Show empty state
            <>
              {Array(5)
                .fill(null)
                .map((_, rowIdx) => (
                  <tr key={`empty-view-row-${rowIdx}`}>
                    <td><input type="text" className="form-control form-control-sm" readOnly disabled /></td>
                    <td><input type="text" className="form-control form-control-sm" readOnly disabled /></td>
                    <td><input type="text" className="form-control form-control-sm" readOnly disabled /></td>
                    <td><input type="text" className="form-control form-control-sm" readOnly disabled /></td>
                    <td><input type="text" className="form-control form-control-sm" readOnly disabled /></td>
                    <td><input type="text" className="form-control form-control-sm" readOnly disabled /></td>
                  </tr>
                ))}
              
              {!selectedFreightId && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                    <strong>
                      Select a voucher from above to view accounts
                    </strong>
                  </td>
                </tr>
              )}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

  return (
    <div
      className="container-fluid border p-2"
      style={{
        backgroundColor: "#eaf6ec",
        fontSize: "12px",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Dropdown overlay */}
      {renderDropdown()}

      {/* Header Section with Buttons */}
      <div
        className="row align-items-center mb-2 p-2"
        style={{
          backgroundColor: "#336699",
          color: "#fff",
          borderRadius: "5px",
          margin: 0,
          padding: "8px 12px"
        }}
      >
        {/* Left Side: Title and Add Voucher Button */}
        <div className="col-md-3">
          <div className="d-flex align-items-center">
            <h5 className="mb-0 me-2" style={{ fontSize: "14px", fontWeight: "bold" }}>
              Cash Receipt Voucher
            </h5>
            <button 
              className="btn btn-light btn-sm"
              onClick={toggleVendorVoucherForm}
              style={{ fontSize: "12px", padding: "4px 12px" }}
            >
              {showVendorVoucherForm ? "Hide Form" : "Add Voucher"}
            </button>
          </div>
        </div>
        
       {!showVendorVoucherForm && (
        <div className="col-md-6">
          <div className="d-flex justify-content-center btn-group btn-group-sm">
            <button className="btn btn-outline-light btn-sm me-1" onClick={() => alert("Add clicked")}>
              Add
            </button>
            <button className="btn btn-outline-light btn-sm me-1" onClick={handleEditEntry} disabled={!selectedRow}>
              Edit
            </button>
            <button className="btn btn-outline-light btn-sm me-1" onClick={handleViewEntry} disabled={!selectedRow}>
              View
            </button>
            <button className="btn btn-outline-light btn-sm me-1" onClick={handleApprove} disabled={!selectedRow || selectedRow.status === "APPROVED"}>
              Approved
            </button>
            <button className="btn btn-outline-light btn-sm me-1" onClick={handleUnapprove} disabled={!selectedRow || selectedRow.status !== "APPROVED"}>
              UnApproved
            </button>
            <button className="btn btn-outline-light btn-sm me-1" onClick={() => alert("Dataset Yes clicked")}>
              Dataset Yes
            </button>
          </div>
        </div>)}
        
     {!showVendorVoucherForm && (
        <div className="col-md-3">
          <div className="d-flex justify-content-end btn-group btn-group-sm">
            <button className="btn btn-outline-light btn-sm me-1" onClick={() => alert("U2 Number clicked")}>
              U2 Number
            </button>
            <button className="btn btn-outline-light btn-sm me-1" onClick={handleOnline} disabled={!selectedRow || selectedRow.status !== "APPROVED"}>
              Online
            </button>
            <button className="btn btn-outline-light btn-sm me-1" onClick={() => alert("Check clicked")}>
              Check
            </button>
            <button className="btn btn-outline-light btn-sm me-1" onClick={() => alert("Chat clicked")}>
              Chat
            </button>
            <button className="btn btn-outline-light btn-sm me-1" onClick={handleEditEntry} disabled={!selectedRow}>
              Edit
            </button>
          </div>
        </div>)}

      </div>

      {/* Top Info Row (Company & Status) - Only show in report view */}
      {!showVendorVoucherForm && (
        <div className="row mb-3 p-2" style={{ backgroundColor: '#e9ecef', border: '1px solid #dee2e6', borderRadius: '3px' }}>
          {/* Company */}
          <div className="col-md-2 mb-2">
            <label className="form-label fw-bold text-dark">Company</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value="MULTAN FEEDS "
              readOnly
              style={{ backgroundColor: "white" }}
            />
          </div>
          
          {/* Branch */}
          <div className="col-md-2 mb-2">
            <label className="form-label fw-bold text-dark">Branch</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value="MULTAN FEEDS "
              readOnly
              style={{ backgroundColor: "white" }}
            />
          </div>
          
          {/* Type */}
          <div className="col-md-2 mb-2">
            <label className="form-label fw-bold text-dark">Type</label>
            <select
              className="form-select form-select-sm"
              value={selectedVoucherType}
              onChange={(e) => setSelectedVoucherType(e.target.value)}
              style={{ backgroundColor: "white" }}
            >
              <option value="cpv">CPV</option>
              <option value="crv">CRV</option>
              <option value="ffcpy">FFCPY</option>
              <option value="brv">BRV</option>
            </select>
          </div>
          
          {/* Month */}
          <div className="col-md-2 mb-2">
            <label className="form-label fw-bold text-dark">Month</label>
            <input
              type="month"
              className="form-control form-control-sm"
              value={vendorVoucherData.month}
              onChange={(e) => handleVendorVoucherChange('month', e.target.value)}
              style={{ backgroundColor: "white" }}
            />
          </div>
          
          {/* Status */}
          <div className="col-md-2 mb-2">
            <label className="form-label fw-bold text-dark">Status</label>
            <select
              className="form-select form-select-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ backgroundColor: "white" }}
            >
              <option value="PREPARED">PREPARED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="ONLINE">ONLINE</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="CHECKED">CHECKED</option>
            </select>
          </div>
          
          {/* Foreign Currency Checkbox */}
          <div className="col-md-3 mb-2">
            <div className="d-flex align-items-end" style={{ height: "100%" }}>
              <div className="form-check d-flex align-items-center" style={{ paddingTop: "24px" }}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="foreignCurrency"
                  style={{ 
                    width: "18px", 
                    height: "18px",
                    marginRight: "8px",
                    marginTop: "0"
                  }}
                />
                <label 
                  className="form-check-label fw-bold text-dark m-0" 
                  htmlFor="foreignCurrency"
                  style={{ 
                    fontSize: "13px",
                    lineHeight: "1.2"
                  }}
                >
                  Foreign Currency
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VENDOR VOUCHER FORM - Conditionally Rendered */}
      {showVendorVoucherForm && <VendorVoucherForm />}

      {/* MAIN VOUCHERS TABLE - Only show when NOT in form view */}
      {!showVendorVoucherForm && <MainVouchersTable />}

      {/* DETAIL TABLE - Show different table based on mode */}
      {showVendorVoucherForm ? <FormDetailTable /> : <ViewDetailTable />}
    </div>
  );
};

export default SaleFreightVoucher;