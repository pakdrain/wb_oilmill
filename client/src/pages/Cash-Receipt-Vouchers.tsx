import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation } from "wouter";

const CashReceiptVoucher = () => {
const [location, setLocation] = useLocation();
const [freightVouchers, setFreightVouchers] = useState<any[]>([]);
// Add this with your other state declarations (around line 70)
const [activeRowIndex, setActiveRowIndex] = useState<number>(0); // Default to first row
const [isSavingVoucher, setIsSavingVoucher] = useState(false);
const [isLoadingVoucherNo, setIsLoadingVoucherNo] = useState(false);
const [freightDetails, setFreightDetails] = useState<any[]>([]);
const [selectedFreightId, setSelectedFreightId] = useState<string | number | null>(null);
// Add these with your other state declarations:
const [showCostCenterDropdown, setShowCostCenterDropdown] = useState<boolean>(false);
const [costCenterDropdownPosition, setCostCenterDropdownPosition] = useState({ top: 0, left: 0 });
const [costCenterDropdownForRowIndex, setCostCenterDropdownForRowIndex] = useState<number | null>(null);
const [costCenterList, setCostCenterList] = useState<any[]>([]);
const [costCenterSearchTerm, setCostCenterSearchTerm] = useState("");
const [totalDebit, setTotalDebit] = useState(0);
const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
const [isLoadingCostCenters, setIsLoadingCostCenters] = useState(false);
const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
// Add this with your other state declarations (around line 70-80)
// const [voucherTableFilters, setVoucherTableFilters] = useState(() => {
//   // Try to load saved filters from localStorage
//   const savedFilters = localStorage.getItem('voucherTableFilters');
//   return savedFilters ? JSON.parse(savedFilters) : {
//     voucherDate: "",
//     voucherNo: "",
//     description: "",
//   };
// });
const [customerSearchTerm, setCustomerSearchTerm] = useState("");

const [shouldBalanceVoucher, setShouldBalanceVoucher] = useState(false);
const [savedVoucherId, setSavedVoucherId] = useState<number | null>(null);
const [remarksFilter, setRemarksFilter] = useState(() => {
  return localStorage.getItem('voucherRemarksFilter') || "";
});
// Add with other dropdown states
const [showSlipDropdown, setShowSlipDropdown] = useState<boolean>(false);
const [slipDropdownPosition, setSlipDropdownPosition] = useState({ top: 0, left: 0 });
const [slipDropdownForRowIndex, setSlipDropdownForRowIndex] = useState<number | null>(null);
const [slipSearchTerm, setSlipSearchTerm] = useState("");

const [selectedMonth, setSelectedMonth] = useState(() => {
  // Try to load saved month from localStorage
  const savedMonth = localStorage.getItem('voucherSelectedMonth');
  return savedMonth || new Date().toISOString().slice(0, 7);
});

const [freightSlips, setFreightSlips] = useState<any[]>([]);




// Add these with your other state declarations:
const [showItemDropdown, setShowItemDropdown] = useState<boolean>(false);
const [itemDropdownPosition, setItemDropdownPosition] = useState({ top: 0, left: 0 });
const [itemDropdownForRowIndex, setItemDropdownForRowIndex] = useState<number | null>(null);
const [itemSearchTerm, setItemSearchTerm] = useState("");




const [showMasterAccountLOV, setShowMasterAccountLOV] = useState<boolean>(false);
const [masterAccountList, setMasterAccountList] = useState<any[]>([]);
const [masterAccountSearchTerm, setMasterAccountSearchTerm] = useState("");
const [masterAccountLOVPosition, setMasterAccountLOVPosition] = useState({ top: 0, left: 0 });


  const [selectedBranch, setSelectedBranch] = useState("1");
  const [selectedVoucherType, setSelectedVoucherType] = useState("MCRV");
  const [freightItems, setFreightItems] = useState<any[]>([]);
  const [selectedVoucherIds, setSelectedVoucherIds] = useState<(string | number)[]>([]);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [tableData, setTableData] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingWbId, setEditingWbId] = useState<number | string | null>(null);
const [selectedStatus, setSelectedStatus] = useState(() => {
  // Try to get saved status from localStorage, default to "PREPARED"
  const savedStatus = localStorage.getItem('voucherFilterStatus');
  return savedStatus || "PREPARED";
});
  const [approvedVouchers, setApprovedVouchers] = useState<any[]>([]);
  const [onlineVouchers, setOnlineVouchers] = useState<any[]>([]);
  const [editingFreightId, setEditingFreightId] = useState<number | null>(null);
  const [localFormItems, setLocalFormItems] = useState<any[]>([]);
  const [isAccountLOVOpen, setIsAccountLOVOpen] = useState<boolean>(false);
  const [currentRowIndex, setCurrentRowIndex] = useState<number>(-1);
  const [accountList, setAccountList] = useState<any[]>([]);

  // Add these state variables at the top with your other states
  const [accountsList, setAccountsList] = useState<any[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [accountDropdownPosition, setAccountDropdownPosition] = useState({ top: 0, left: 0 });
  const [accountDropdownForRowIndex, setAccountDropdownForRowIndex] = useState<number | null>(null);
  const [accountSearchTerm, setAccountSearchTerm] = useState("");

  // Add ref for account code inputs
  const accountCodeRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Consolidated local row values - REMOVE the duplicate from FormDetailTable
const [localRowValues, setLocalRowValues] = useState<any[]>(() => {
  return Array(9).fill(null).map((_, index) => ({
    id: `new-row-${index}`,
    checked: false,
    checkedC: false,
    checkedG: false,
    checkedI: false,
    party_account: "",
    party: "",
    account_code: "",
    account_id: 0,
    description: "",
    sub_acc_code: "",
    debit: "",
    credit: "",
    notation: "",
    cost_center: "",
    cost_desc: "",
    cost_center_id: null,
    slip_no: "",
    freight_amount: "",
    item_id: null,
    item_code: "",
    item_desc: "",
    gl_asset_id: 0,
    wb_id: null,
    vendor_id: null,
    customer_id: null
  }));
});
  
  const [itemsList, setItemsList] = useState<any[]>([]);
  const [vendorsList, setVendorsList] = useState<any[]>([]);
  const [customersList, setCustomersList] = useState<any[]>([]);
  
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    column: string;
  } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [vendorCache, setVendorCache] = useState<any[]>([]);
  const [vendorsLoaded, setVendorsLoaded] = useState(false);
  const [dropdownForRowIndex, setDropdownForRowIndex] = useState<number | null>(null);
  const [dropdownType, setDropdownType] = useState<"vendor" | "customer" | null>(null);

  const queryParams = new URLSearchParams(window.location.search);
  const urlVoucherType = queryParams.get('type') || 'MCRV';
  
const pageTitles: Record<string, string> = {
  'MCRV': 'Cash Receipt Voucher',
  'MCPV': 'Cash Payment Voucher',
  'MBPV': 'Bank Payment Voucher',
  'MBRV': 'Bank Receipt Voucher',
  'FFCPV': 'Feed Freight Voucher',
  'FMCPV': 'Freight Mill Cash Payment Voucher',  // ✅ ADD THIS
  'CPM': 'Cash Payment Mill'  // ✅ ADD THIS
};

  const inputRefs = useRef<{[key: string]: HTMLInputElement | HTMLTextAreaElement | null}>({});
  const [cursorPositions, setCursorPositions] = useState<{[key: string]: number}>({});

  interface VendorVoucherState {
    vendorNo: string;
    vendorDate: string;
    voucherType: string;
    vendorName: string;
    cashAmount: number;
    referenceNo: string;
    customers: string;
    currency: string;
    exchangeRate: number;
    
    accountBalance: number;
    description: string;
    company: string;
    branch: string;
    customerId: number | null;
    customerName: string;
    createdBy: number | null;
    acc_id:number;
    month: string;
      account_code?: string; // Account code from selection
  account_desc?: string; 
  }

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

interface LocalRow {
  id: string;
  checked: boolean;
  checkedC?: boolean;    // ✅ ADD THIS for Customers checkbox (FFCPV)
  checkedG?: boolean;    // ✅ ADD THIS for Goods checkbox (FFCPV)
  checkedI?: boolean;    // ✅ ADD THIS for I checkbox (MBPV/MCPV)
  party_account?: string;
  party?: string;
  account_code?: string;
  account_id?: number;
  description?: string;
  sub_acc_code?: string;
  debit?: string;
  credit?: string;
  notation?: string;
  cost_center?: string;        // Field me dikhegi (description)
  cost_center_id?: number | null; // DB me save hoga
  // For FFCPV specific fields:
  slip_no?: string;            // For FFCPV slip number
  freight_amount?: string; 
  
  
    item_id?: number | null;
  item_code?: string;
  item_desc?: string;
  gl_asset_id?: number;  // For FFCPV freight amount
}

const [vendorVoucherData, setVendorVoucherData] = useState<VendorVoucherState>({
  vendorNo: "",
  vendorDate: new Date().toISOString().split('T')[0],
  voucherType: urlVoucherType,
  vendorName: "60101-0002 - CASH AT MILL",
  cashAmount: 0,
  referenceNo: "",     
  customers: "",
  currency: "PKR",
  exchangeRate: 1,
  accountBalance: 0,
  description: "",
  company: "Multan Feed",
  branch: "",
  customerId: null,
  customerName: "",
  acc_id: 0, // Will be updated when account is selected or fetched
  createdBy: null,
  month: selectedMonth,
  account_code: "60101-0002",
  account_desc: "CASH AT MILL"
});


  const [showVendorVoucherForm, setShowVendorVoucherForm] = useState(false);
  const [isAddVoucherMode, setIsAddVoucherMode] = useState(false);

  // ✅ FIXED: Missing function definitions

  // ✅ Function to fetch account codes from API
  const fetchAccountCodes = async (searchTerm: string = ""): Promise<any[]> => {
    try {
      setIsLoadingAccounts(true);
      const url = searchTerm 
        ? `/api/chart-of-accounts?search=${encodeURIComponent(searchTerm)}&limit=500000`
        : "/api/chart-of-accounts?limit=100000";
      
      console.log(`📡 Fetching account codes from: ${url}`);
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Fetched ${data.length} account codes from API`);
        return data;
      } else {
        console.error("❌ Failed to fetch account codes:", response.status);
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching account codes:", error);
      return [];
    } finally {
      setIsLoadingAccounts(false);
    }
  };

const openAccountCodeLOV = async (rowIndex: number, currentValue: string): Promise<void> => {
  // Focus save karein taake LOV close hone ke baad wapis aa sake
  accountCodeRefs.current[rowIndex]?.focus();

  // Modal open karein ya dropdown show karein
  setIsAccountLOVOpen(true);
  setCurrentRowIndex(rowIndex);

  try {
    // ✅ LOV open hote hi agar master list empty hai to load kar lo
    if (!Array.isArray(accountsList) || accountsList.length === 0) {
      await fetchAccountsList(""); // loads full list into accountsList
    }

    // ✅ Now just set search term + show dropdown (local filtering will work)
    setAccountSearchTerm(currentValue);

    // Position dropdown near the input
    const inputElement = accountCodeRefs.current[rowIndex];
    if (inputElement) {
      const rect = inputElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      setAccountDropdownPosition({
        top: rect.bottom + scrollTop,
        left: rect.left + scrollLeft,
      });

      setAccountDropdownForRowIndex(rowIndex);
      setShowAccountDropdown(true);
    }
  } catch (error: any) {
    console.error("Error opening account LOV:", error);
    alert("Failed to load account list");
  }
};


useEffect(() => {
  // Fetch the correct account ID for CASH AT MILL (60101-0002)
  const fetchDefaultCashAccountId = async () => {
    try {
      const response = await fetch("/api/chart-of-accounts?search=60101-0002&limit=10");
      if (response.ok) {
        const accounts = await response.json();
        const cashAccount = accounts.find((acc: any) => 
          acc.chart_of_account_code === "60101-0002" || 
          acc.account_code === "60101-0002"
        );
        if (cashAccount) {
          const accountId = cashAccount.chart_of_account_id || cashAccount.id || 0;
          console.log(`✅ Found default CASH AT MILL account ID: ${accountId}`);
          setVendorVoucherData(prev => ({
            ...prev,
            acc_id: accountId,
            account_code: "60101-0002",
            account_desc: "CASH AT MILL"
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch default cash account ID:", error);
    }
  };
  
  fetchDefaultCashAccountId();
}, []);


  // Calculate total debit for FFCPV
useEffect(() => {
  if (vendorVoucherData.voucherType === 'FFCPV') {
    const total = localRowValues.reduce((sum, row) => {
      const debitValue = parseFloat(row.debit || "0");
      return sum + (isNaN(debitValue) ? 0 : debitValue);
    }, 0);
    setTotalDebit(total);
  } else {
    setTotalDebit(0);
  }
}, [localRowValues, vendorVoucherData.voucherType]);



useEffect(() => {
  if (remarksFilter !== undefined) {
    localStorage.setItem('voucherRemarksFilter', remarksFilter);
  }
}, [remarksFilter]);



// ✅ MODIFIED: fetchNextVoucherNo function with date parameter
const fetchNextVoucherNo = async (voucherType: string, voucherDate?: string) => {
  try {
    console.log(`📡 Fetching next voucher number for: ${voucherType}, date: ${voucherDate || 'today'}`);
    
    // Use provided date or today's date
    const dateToUse = voucherDate || new Date().toISOString().split('T')[0];
    
    const response = await fetch(
      `/api/vouchers/next-voucher-no?voucher_type=${encodeURIComponent(voucherType)}&voucher_date=${encodeURIComponent(dateToUse)}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch next voucher number: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Next voucher number: ${data.nextVoucherNo} for ${voucherType} on ${dateToUse}`);
      return data.nextVoucherNo;
    } else {
      console.error(`❌ API error: ${data.error}`);
      return "1"; // Fallback
    }
  } catch (error) {
    console.error("❌ Error fetching next voucher number:", error);
    return "1"; // Fallback
  }
};



// ✅ FIXED: Handler for slip selection
const handleSlipSelect = (rowIndex: number, selectedSlip: any) => {
  setActiveRowIndex(rowIndex);

  console.log("✅ Selected freight slip:", selectedSlip);
  
  // ✅ Determine which checkbox was clicked (C or G)
  const isGCheckbox = localRowValues[rowIndex]?.checkedG === true;
  const isCCheckbox = localRowValues[rowIndex]?.checkedC === true;
  
  console.log(`🔍 Checkbox state - C: ${isCCheckbox}, G: ${isGCheckbox}`);
  
  // ✅ CREATE FFCPV NARRATION FORMAT
  const ffcpvNarration = `SLIP# ${selectedSlip.slip_no}  Vehicle # ${selectedSlip.vehicle_no}  ${selectedSlip.customer_name}   DO# ${selectedSlip.do_no}`;
  
  // Base row update - common fields for both checkboxes
  const baseRowUpdate = {
    // ✅ AUTO-FILL SLIP-RELATED FIELDS (for both C and G)
    slip_no: selectedSlip.slip_no,
    freight_amount: parseFloat(selectedSlip.freight || 0).toFixed(2),
    wb_id: selectedSlip.wb_id,
    vehicle_no: selectedSlip.vehicle_no,
    do_no: selectedSlip.do_no,
    item_id: selectedSlip.item_id,
    item_code: selectedSlip.item_code,
    item_desc: selectedSlip.item_desc,
    
    // ✅ AUTO-FILL NARRATION (for both C and G)
    notation: ffcpvNarration,
    
    // ✅ Auto-fill reference fields (for both)
    party_account: selectedSlip.customer_id?.toString() || "",
    payable_account_id: selectedSlip.payable_account_id,
    gl_asset_id: selectedSlip.gl_asset_id,
    sub_acc_code: selectedSlip.payable_account_id?.toString() || "",
    customer_id: selectedSlip.customer_id
  };
  
  // Add conditional auto-fill based on checkbox type
  let rowUpdate;
  
  if (isGCheckbox) {
    // ✅ FOR G CHECKBOX (Goods) - ONLY auto-fill slip fields, NOT party/account/description
    console.log("✅ G checkbox detected - NOT auto-filling Party/Account/Description");
    rowUpdate = {
      ...baseRowUpdate
      // Party, account_code, description, account_id NOT auto-filled
    };
  } else {
    // ✅ FOR C CHECKBOX (Customers) - AUTO-FILL ALL fields (original behavior)
    console.log("✅ C checkbox detected - Auto-filling ALL fields");
    rowUpdate = {
      ...baseRowUpdate,
      // Auto-fill these fields for C checkbox only
      party: selectedSlip.customer_name,
      account_code: selectedSlip.account_code,
      description: selectedSlip.account_description,
      account_id: selectedSlip.payable_account_id
    };
  }
  
  // Update the row with appropriate data
  const updatedRows = [...localRowValues];
  updatedRows[rowIndex] = {
    ...updatedRows[rowIndex],
    ...rowUpdate
  };
  
  setLocalRowValues(updatedRows);
  
  // ✅ Also update other states
  const updatedLocal = [...localFormItems];
  updatedLocal[rowIndex] = {
    ...updatedLocal[rowIndex],
    ...updatedRows[rowIndex]
  };
  setLocalFormItems(updatedLocal);
  
  const updatedFreight = [...freightItems];
  updatedFreight[rowIndex] = {
    ...updatedFreight[rowIndex],
    ...updatedRows[rowIndex]
  };
  setFreightItems(updatedFreight);
  
  // ✅ IMPORTANT: Keep form-level customer data update (for both checkboxes)
  if (!vendorVoucherData.customerId) {
    setVendorVoucherData(prev => ({
      ...prev,
      customerId: selectedSlip.customer_id,
      customerName: selectedSlip.customer_name,
      customers: selectedSlip.customer_name
    }));
  }
  
  // Close slip dropdown
  setShowSlipDropdown(false);
  setSlipDropdownForRowIndex(null);
  
  // Auto-fill the debit field with freight amount for FFCPV (for both checkboxes)
  if (vendorVoucherData.voucherType === 'FFCPV') {
    setTimeout(() => {
      const debitInput = document.querySelector(`input[name="debit-${rowIndex}"]`) as HTMLInputElement;
      if (debitInput && selectedSlip.freight) {
        debitInput.value = parseFloat(selectedSlip.freight).toFixed(2);
        handleInputChange(rowIndex, 'debit', parseFloat(selectedSlip.freight).toFixed(2));
      }
    }, 100);
  }
  
  console.log(`✅ Row ${rowIndex} updated - C auto-fill: ${isCCheckbox}, G auto-fill: ${isGCheckbox}`);
};



// ✅ UPDATED: Slip Dropdown Component
const SlipDropdown = () => {
  if (!showSlipDropdown || slipDropdownForRowIndex === null) {
    return null;
  }

  // Filter slips based on search
  const filteredSlips = slipSearchTerm 
    ? freightSlips.filter(slip => {
        if (!slip) return false;
        const searchLower = slipSearchTerm.toLowerCase();
        const slipNo = (slip.slip_no || "").toLowerCase();
        const vehicleNo = (slip.vehicle_no || "").toLowerCase();
        const doNo = (slip.do_no || "").toLowerCase();
        const customerName = (slip.customer_name || "").toLowerCase();
        return slipNo.includes(searchLower) || 
               vehicleNo.includes(searchLower) || 
               doNo.includes(searchLower) ||
               customerName.includes(searchLower);
      })
    : freightSlips;

  return (
    <div 
      className="dropdown-menu show"
      style={{
        position: "absolute",
        top: `${slipDropdownPosition.top}px`,
        left: `${slipDropdownPosition.left}px`,
        width: "700px",  // ✅ Increased width
        maxHeight: "400px",
        overflowY: "auto",
        zIndex: 9999,
        display: "block",
        backgroundColor: "white",
        border: "1px solid #ccc",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
      }}
    >
      <div className="p-2 border-bottom bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <strong className="text-primary">
            Select Freight Slip for {vendorVoucherData.customers || "Customer"}
          </strong>
          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              setShowSlipDropdown(false);
              setSlipDropdownForRowIndex(null);
            }}
          >
            ×
          </button>
        </div>
        <div className="mt-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search slip no, vehicle, DO no, or customer..."
            value={slipSearchTerm}
            onChange={(e) => setSlipSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
        <div className="small text-muted mt-1">
          Showing {filteredSlips.length} unpaid freight slips
        </div>
      </div>
      
      <div className="dropdown-list">
        {filteredSlips.length > 0 ? (
          filteredSlips.slice(0, 30).map((slip: any, index: number) => {
            const key = slip.wb_id || slip.slip_no || `slip-${index}`;
            
            return (
              <button
                key={key}
                className="dropdown-item text-start"
                onClick={() => handleSlipSelect(slipDropdownForRowIndex, slip)}
                style={{ 
                  fontSize: "11px",
                  padding: "8px 10px",
                  borderBottom: "1px solid #f0f0f0",
                  whiteSpace: "normal",
                  textAlign: "left"
                }}
              >
                <div className="d-flex justify-content-between">
                  <div className="fw-bold text-primary">{slip.slip_no}</div>
                  <div className="fw-bold text-success">Freight: {parseFloat(slip.freight || 0).toFixed(2)}</div>
                </div>
                <div className="small">
                  <div><strong>Vehicle:</strong> {slip.vehicle_no} | <strong>DO No:</strong> {slip.do_no}</div>
                  <div><strong>Item:</strong> {slip.item_code} - {slip.item_desc}</div>
                  <div><strong>Customer:</strong> {slip.customer_name}</div>
                </div>
                <div className="text-primary small mt-1">
                  <strong>Account:</strong> {slip.account_code} - {slip.account_description}
                </div>
                <div className="text-muted small mt-1">
                  Customer ID: {slip.customer_id} | Payable Account ID: {slip.payable_account_id}
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-3 text-center text-muted">
            {slipSearchTerm 
              ? `No freight slips found for "${slipSearchTerm}"` 
              : "No unpaid freight slips available"}
          </div>
        )}
      </div>
    </div>
  );
};


  // ✅ FIXED: Handle account code click
  const handleAccountCodeClick = (rowIndex: number, e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get current value
    const currentValue = localRowValues[rowIndex]?.account_code || "";
    
    // Open LOV
    openAccountCodeLOV(rowIndex, currentValue);
  };


  // ✅ Master Account LOV Dropdown Component
const MasterAccountLOVDropdown = () => {
  if (!showMasterAccountLOV) {
    return null;
  }

  return (
    <div 
      className="dropdown-menu show"
      style={{
        position: "absolute",
        top: `${masterAccountLOVPosition.top}px`,
        left: `${masterAccountLOVPosition.left}px`,
        width: "500px",
        maxHeight: "350px",
        overflowY: "auto",
        zIndex: 10000,
        display: "block",
        backgroundColor: "white",
        border: "1px solid #ccc",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
      }}
    >
      <div className="p-2 border-bottom bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <strong className="text-primary">
            Select Cash Account for {vendorVoucherData.voucherType}
          </strong>
          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setShowMasterAccountLOV(false)}
          >
            ×
          </button>
        </div>
        <div className="mt-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search account code or description..."
            value={masterAccountSearchTerm}
            onChange={handleMasterAccountSearch}
            autoFocus
          />
        </div>
      </div>
      
      <div className="dropdown-list">
        {isLoadingAccounts ? (
          <div className="p-3 text-center">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-2 text-muted">Loading cash accounts...</div>
          </div>
        ) : masterAccountList.length > 0 ? (
          masterAccountList.slice(0, 30).map((account: any, index: number) => {
            const key = account.chart_of_account_id || `master-acc-${index}`;
            
            return (
              <button
                key={key}
                className="dropdown-item text-start"
                onClick={() => handleMasterAccountSelect(account)}
                style={{ 
                  fontSize: "12px",
                  padding: "8px 12px",
                  borderBottom: "1px solid #f0f0f0",
                  whiteSpace: "normal",
                  textAlign: "left"
                }}
              >
                <div className="fw-bold text-primary">
                  {account.chart_of_account_code || "N/A"}
                </div>
                <div className="small">
                  {account.description || "No description"}
                </div>
                <div className="text-muted small mt-1">
                  Account ID: {account.chart_of_account_id || "N/A"}
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-3 text-center text-muted">
            {masterAccountSearchTerm 
              ? `No accounts found for "${masterAccountSearchTerm}"` 
              : `No cash accounts available for ${vendorVoucherData.voucherType}`}
          </div>
        )}
      </div>
    </div>
  );
};



// ✅ Handler for I checkbox click (Items for MBPV/MCPV)
const handleICheckboxChange = async (rowIndex: number, checked: boolean) => {
  const updatedRows = [...localRowValues];
  
  // Update checkbox states
  updatedRows[rowIndex] = {
    ...updatedRows[rowIndex],
    checkedI: checked,
    // Uncheck C checkbox if I is checked
    checkedC: checked ? false : updatedRows[rowIndex].checkedC
  };
  
  setLocalRowValues(updatedRows);
  
  // Show item dropdown when I is checked
  if (checked && (selectedVoucherType === 'MBPV' || selectedVoucherType === 'MCPV')) {
    await showItemDropdownForRow(rowIndex);
  }
};




// Function to show item dropdown
const showItemDropdownForRow = async (rowIndex: number) => {
  try {
    // Get input element position
    const inputElement = document.getElementById(`party-account-${rowIndex}`);
    if (!inputElement) {
      console.error(`Input element #party-account-${rowIndex} not found`);
      return;
    }
    
    const rect = inputElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    setItemDropdownForRowIndex(rowIndex);
    setItemDropdownPosition({
      top: rect.bottom + scrollTop,
      left: rect.left + scrollLeft
    });
    setShowItemDropdown(true);
    setItemSearchTerm("");
    
    // Ensure items are loaded
    if (itemsList.length === 0) {
      await fetchItemsList();
    }
    
  } catch (error) {
    console.error("Error showing item dropdown:", error);
  }
};



const handleItemSelect = async (rowIndex: number, selectedItem: any) => {
    setActiveRowIndex(rowIndex); // Add this line at the beginning

  console.log("✅ Selected item:", selectedItem);
  
  // Get item details
  const itemId = selectedItem.id || selectedItem.item_id;
  const itemCode = selectedItem.item_code || "";
  const itemDesc = selectedItem.description || selectedItem.item_desc || "";
  const glAssetId = selectedItem.gl_asset_id || 0;
  
  console.log(`📝 Setting row ${rowIndex}: 
    Item ID=${itemId}, 
    Code=${itemCode}, 
    Description=${itemDesc}, 
    GL Asset ID=${glAssetId}`);
  
  // First update with item details
  const updatedRows = [...localRowValues];
  
  // For MCPV/MBPV: Preserve existing narration for rows after the first
  const existingNotation = updatedRows[rowIndex]?.notation || "";
  
  updatedRows[rowIndex] = {
    ...updatedRows[rowIndex],
    item_id: itemId,
    item_code: itemCode,
    item_desc: itemDesc,
    gl_asset_id: glAssetId,
    party_account: itemId?.toString() || "",
    party: itemDesc,  // Show item description in party field
    description: itemDesc,  // Also in description field
    // For MCPV/MBPV: Keep existing narration for rows after the first
    ...((vendorVoucherData.voucherType === 'MCPV' || vendorVoucherData.voucherType === 'MBPV') && rowIndex > 0 ? 
      { notation: existingNotation } : {})
  };
  
  setLocalRowValues(updatedRows);
  
  // Now fetch the account details using gl_asset_id
  if (glAssetId) {
    try {
      console.log(`📡 Fetching account for GL Asset ID: ${glAssetId}`);
      const response = await fetch(`/api/chart-of-accounts/${glAssetId}`);
      
      if (response.ok) {
        const accountData = await response.json();
        console.log("✅ Account data fetched:", accountData);
        
        // Update the row with account information BUT keep itemDesc in description
        updatedRows[rowIndex] = {
          ...updatedRows[rowIndex],
          account_id: accountData.chart_of_account_id || glAssetId,
          account_code: accountData.chart_of_account_code || accountData.account_code || "",
          // ✅ KEEP itemDesc in BOTH party and description fields
          party: itemDesc, // Ensure party has item description
          description: itemDesc, // Ensure description has item description (NOT account description)
          sub_acc_code: glAssetId.toString(),
          // For MCPV/MBPV: Preserve existing narration for rows after the first
          ...((vendorVoucherData.voucherType === 'MCPV' || vendorVoucherData.voucherType === 'MBPV') && rowIndex > 0 ? 
            { notation: existingNotation } : {})
        };
        
        setLocalRowValues([...updatedRows]);
        
        // Also update other states
        const updatedLocal = [...localFormItems];
        updatedLocal[rowIndex] = updatedRows[rowIndex];
        setLocalFormItems(updatedLocal);
        
        const updatedFreight = [...freightItems];
        updatedFreight[rowIndex] = updatedRows[rowIndex];
        setFreightItems(updatedFreight);
        
      } else {
        console.warn("❌ No account found for GL Asset ID:", glAssetId);
        // If no account found, use GL Asset ID as account code
        updatedRows[rowIndex] = {
          ...updatedRows[rowIndex],
          account_id: glAssetId,
          account_code: glAssetId.toString(),
          // ✅ Keep clean itemDesc in both fields
          party: itemDesc,
          description: itemDesc,
          sub_acc_code: glAssetId.toString(),
          // For MCPV/MBPV: Preserve existing narration for rows after the first
          ...((vendorVoucherData.voucherType === 'MCPV' || vendorVoucherData.voucherType === 'MBPV') && rowIndex > 0 ? 
            { notation: existingNotation } : {})
        };
        setLocalRowValues([...updatedRows]);
        
        // Also update other states
        const updatedLocal = [...localFormItems];
        updatedLocal[rowIndex] = updatedRows[rowIndex];
        setLocalFormItems(updatedLocal);
        
        const updatedFreight = [...freightItems];
        updatedFreight[rowIndex] = updatedRows[rowIndex];
        setFreightItems(updatedFreight);
      }
    } catch (error) {
      console.error("❌ Error fetching account:", error);
      // Fallback: use GL Asset ID as account code
      updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        account_id: glAssetId,
        account_code: glAssetId.toString(),
        // ✅ Keep clean itemDesc in both fields even on error
        party: itemDesc,
        description: itemDesc,
        sub_acc_code: glAssetId.toString(),
        // For MCPV/MBPV: Preserve existing narration for rows after the first
        ...((vendorVoucherData.voucherType === 'MCPV' || vendorVoucherData.voucherType === 'MBPV') && rowIndex > 0 ? 
          { notation: existingNotation } : {})
      };
      setLocalRowValues([...updatedRows]);
      
      // Also update other states
      const updatedLocal = [...localFormItems];
      updatedLocal[rowIndex] = updatedRows[rowIndex];
      setLocalFormItems(updatedLocal);
      
      const updatedFreight = [...freightItems];
      updatedFreight[rowIndex] = updatedRows[rowIndex];
      setFreightItems(updatedFreight);
    }
  } else {
    // If no glAssetId, still update other states
    const updatedLocal = [...localFormItems];
    updatedLocal[rowIndex] = updatedRows[rowIndex];
    setLocalFormItems(updatedLocal);
    
    const updatedFreight = [...freightItems];
    updatedFreight[rowIndex] = updatedRows[rowIndex];
    setFreightItems(updatedFreight);
  }
  
  // Close dropdown
  setShowItemDropdown(false);
  setItemDropdownForRowIndex(null);
};



  // ✅ Handler for master account LOV click
const handleMasterAccountClick = async (e: React.MouseEvent | React.FocusEvent) => {
  e.preventDefault();
  e.stopPropagation();
  
  // Get current voucher type from form data
  const voucherType = vendorVoucherData.voucherType;
  
  if (!voucherType) {
    alert("Please select voucher type first");
    return;
  }
  
  // Position the dropdown near the input
  const inputElement = e.currentTarget as HTMLInputElement;
  const rect = inputElement.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
setMasterAccountLOVPosition({
  top: rect.top + scrollTop,  // Align with top of input
  left: Math.max(10, rect.left - 500)  // Move to left side (500px width)
});
  
  // Fetch master accounts
  const accounts = await fetchMasterAccounts(voucherType, "", 100);
  setMasterAccountList(accounts);
  setMasterAccountSearchTerm("");
  setShowMasterAccountLOV(true);
};

const handleMasterAccountSelect = (account: any) => {
  console.log("✅ Selected master account:", account);
  
  // Extract account details with proper fallbacks
  const accountId = account.chart_of_account_id || account.id || 0;
  const accountCode = account.chart_of_account_code || account.account_code || "";
  const accountDesc = account.description || account.account_desc || "";
  const fullAccountName = `${accountCode} - ${accountDesc}`;
  
  console.log(`📝 Setting master account: ID=${accountId}, Code=${accountCode}, Desc=${accountDesc}`);
  
  // ✅ CRITICAL FIX: Ensure acc_id is properly set to the SELECTED account ID, not 203
  setVendorVoucherData(prev => ({
    ...prev,
    vendorName: fullAccountName,
    acc_id: accountId,  // This MUST be the user-selected account ID
    account_code: accountCode,
    account_desc: accountDesc,
    _selectedAccount: account
  }));
  
  // Close the LOV
  setShowMasterAccountLOV(false);
  
  // Focus back to the input
  setTimeout(() => {
    inputRefs.current['cashAccount']?.focus();
  }, 100);
};

// ✅ Handler for master account search
const handleMasterAccountSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setMasterAccountSearchTerm(value);
  
  // Fetch filtered accounts
  const accounts = await fetchMasterAccounts(vendorVoucherData.voucherType, value, 50);
  setMasterAccountList(accounts);
};

  // ✅ FIXED: Keyboard handler function with proper types
  const handleAccountCodeKeyDown = (rowIndex: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Ctrl+L press kiya to
    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault(); // Default action rokna
      handleAccountCodeClick(rowIndex, e);
    }
    
    // Ya phir F4 key ke liye (common for LOV)
    if (e.key === 'F4') {
      e.preventDefault();
      handleAccountCodeClick(rowIndex, e);
    }
    
    // Ya phir Alt+Down Arrow
    if (e.altKey && e.key === 'ArrowDown') {
      e.preventDefault();
      handleAccountCodeClick(rowIndex, e);
    }
  };

  // ✅ FIXED: openAccountLOV function (alias for openAccountCodeLOV)
  const openAccountLOV = (rowIndex: number) => {
    const currentValue = localRowValues[rowIndex]?.account_code || "";
    openAccountCodeLOV(rowIndex, currentValue);
  };

  // Function to show dropdown
  const showDropdownForRow = (rowIndex: number, isVendor: boolean) => {
    const inputElement = document.getElementById(`party-account-${rowIndex}`);
    if (!inputElement) {
      console.error(`Input element #party-account-${rowIndex} not found`);
      return;
    }
    
    const rect = inputElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    setDropdownForRowIndex(rowIndex);
    setDropdownType(isVendor ? "vendor" : "customer");
    setDropdownPosition({
      top: rect.bottom + scrollTop,
      left: rect.left + scrollLeft
    });
    setShowDropdown(true);
    setSearchTerm("");
  };

  // Function to fetch chart of accounts
  const fetchAccountsList = async (searchTerm = "") => {
    setIsLoadingAccounts(true);
    try {
      const url = searchTerm 
        ? `/api/chart-of-accounts?search=${encodeURIComponent(searchTerm)}&limit=500000`
        : "/api/chart-of-accounts?limit=1000000";
      
      console.log(`📡 Fetching accounts from: ${url}`);
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Fetched ${data.length} accounts from API`);
        setAccountsList(data);
      } else {
        console.error("❌ Failed to fetch accounts:", response.status);
        setAccountsList([]);
      }
    } catch (error) {
      console.error("❌ Error fetching accounts:", error);
      setAccountsList([]);
    } finally {
      setIsLoadingAccounts(false);
    }
  };
  

  // ✅ FIXED: Add global keyboard listener for Ctrl+L
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Check if Ctrl+L is pressed
      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        
        // Check if any account code field is focused
        const focusedElement = document.activeElement;
        if (focusedElement && focusedElement.tagName === 'INPUT') {
          const input = focusedElement as HTMLInputElement;
          
          // Check if this is an account code input
          const isAccountCodeField = input.placeholder?.includes('Ctrl+L') || 
                                     input.className?.includes('account-code') ||
                                     input.id?.includes('account') ||
                                     input.hasAttribute('data-lov-trigger');
          
          if (isAccountCodeField) {
            // Find which row this input belongs to
            const rowIndex = accountCodeRefs.current.findIndex(ref => ref === input);
            if (rowIndex !== -1) {
              const currentValue = localRowValues[rowIndex]?.account_code || "";
              openAccountCodeLOV(rowIndex, currentValue);
            }
          }
        }
      }
      
      // Escape to close dropdown
      if (e.key === 'Escape' && showAccountDropdown) {
        setShowAccountDropdown(false);
        setAccountDropdownForRowIndex(null);
        setIsAccountLOVOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showAccountDropdown, localRowValues]);



useEffect(() => {
  // When description changes, update narration in active row
  if (vendorVoucherData.description) {
    const updatedRows = [...localRowValues];
    
    updatedRows.forEach((row, index) => {
      // Skip rows that already have FFCPV slip narration
      if (row.notation && row.notation.includes('SLIP#') && vendorVoucherData.voucherType === 'FFCPV') {
        return; // Keep existing FFCPV narration
      }
      
      // FOR MCPV/MBPV: Only update the ACTIVE row's narration
      if (vendorVoucherData.voucherType === 'MCPV' || vendorVoucherData.voucherType === 'MBPV') {
        if (index === activeRowIndex) {
          // Active row gets the description
          let narrationText = vendorVoucherData.description;
          
          if (vendorVoucherData.referenceNo && vendorVoucherData.referenceNo.trim() !== "") {
            narrationText += ` cheque #${vendorVoucherData.referenceNo}`;
          }
          
          updatedRows[index] = {
            ...row,
            notation: narrationText
          };
        } else {
          // For other rows in MCPV/MBPV, DON'T auto-fill narration
          // Let them keep their existing narration or leave empty
          return;
        }
      } else {
        // For other voucher types (MCRV, MBRV), use existing logic
        if (row.notation === "" || !row.notation) {
          let narrationText = vendorVoucherData.description;
          
          if (vendorVoucherData.referenceNo && vendorVoucherData.referenceNo.trim() !== "") {
            narrationText += ` cheque #${vendorVoucherData.referenceNo}`;
          }
          
          updatedRows[index] = {
            ...row,
            notation: narrationText
          };
        }
      }
    });
    
    setLocalRowValues(updatedRows);
  }
}, [vendorVoucherData.description, vendorVoucherData.referenceNo, activeRowIndex]); // Added activeRowIndex dependency


useEffect(() => {
  // Save selectedMonth to localStorage whenever it changes
  if (selectedMonth) {
    localStorage.setItem('voucherSelectedMonth', selectedMonth);
  }
}, [selectedMonth]);


// Add this useEffect near your other useEffect hooks (around line 400):
useEffect(() => {
  // Save selectedStatus to localStorage whenever it changes
  if (selectedStatus) {
    localStorage.setItem('voucherFilterStatus', selectedStatus);
  }
}, [selectedStatus]);




// Function to handle checkbox change
const handleCheckboxChange = (rowIndex: number, checked: boolean) => {
  const updatedRows = [...localRowValues];
  
  // For MBPV/MCPV, handle I and C checkboxes separately
  if (selectedVoucherType === 'MBPV' || selectedVoucherType === 'MCPV') {
    // This function is called for the single V checkbox - we don't need to show dropdown
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      checked: checked
    };
  } else {
    // For other voucher types, use the existing logic
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      checked: checked
    };
    
    // Show dropdown
    if (checked) {
      showDropdownForRow(rowIndex, checked);
    }
  }
  
  setLocalRowValues(updatedRows);
  
  // Also update localFormItems
  const updatedLocalItems = [...localFormItems];
  if (updatedLocalItems[rowIndex]) {
    updatedLocalItems[rowIndex] = {
      ...updatedLocalItems[rowIndex],
      checked: checked
    };
  } else {
    updatedLocalItems[rowIndex] = updatedRows[rowIndex];
  }
  setLocalFormItems(updatedLocalItems);
};


// ✅ MODIFIED: Handler for C checkbox click (FFCPV - Customers)
// ✅ MODIFIED: Handler for C checkbox click (FFCPV - Customers)
const handleCCheckboxChangeFFCPV = async (rowIndex: number, checked: boolean) => {
  const updatedRows = [...localRowValues];
  
  updatedRows[rowIndex] = {
    ...updatedRows[rowIndex],
    checkedC: checked,
    // Uncheck G checkbox if C is checked
    checkedG: checked ? false : updatedRows[rowIndex].checkedG,
    // Clear slip data if unchecking C
    ...(!checked ? {
      slip_no: "",
      freight_amount: ""
    } : {})
  };
  
  setLocalRowValues(updatedRows);
  
  // When C is checked for FFCPV, ALSO fetch unpaid freight slips (same as G)
  if (checked && vendorVoucherData.voucherType === 'FFCPV') {
    // First check if we have a customer selected
    const customerId = vendorVoucherData.customerId || updatedRows[rowIndex]?.customer_id;
    
    if (!customerId) {
      alert("Please select a customer from the Customer dropdown above first!");
      // Uncheck C since no customer is selected
      updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        checkedC: false
      };
      setLocalRowValues(updatedRows);
      return;
    }
    
    // Fetch unpaid freight slips for this customer (SAME LOGIC AS G CHECKBOX)
    try {
      console.log(`🔄 Fetching freight slips for customer: ${customerId}`);
      const slips = await fetchUnpaidFreightSlips(customerId.toString());
      
      if (slips.length === 0) {
        alert(`No unpaid freight slips found for customer ${vendorVoucherData.customerName || customerId}`);
        // Uncheck C since no slips found
        updatedRows[rowIndex] = {
          ...updatedRows[rowIndex],
          checkedC: false
        };
        setLocalRowValues(updatedRows);
        return;
      }
      
      console.log(`✅ Found ${slips.length} unpaid freight slips`);
      setFreightSlips(slips);
      
      // Show slip selection dropdown (SAME AS G CHECKBOX)
      showSlipDropdownForRow(rowIndex, slips);
      
    } catch (error) {
      console.error("❌ Error fetching freight slips:", error);
      alert("Failed to fetch freight slips. Please try again.");
      
      // Uncheck C on error
      updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        checkedC: false
      };
      setLocalRowValues(updatedRows);
    }
  }
};


// ✅ ENHANCED: Handler for G checkbox click (FFCPV - Goods/Freight Slips)
const handleGCheckboxChangeFFCPV = async (rowIndex: number, checked: boolean) => {
  const updatedRows = [...localRowValues];
  
  updatedRows[rowIndex] = {
    ...updatedRows[rowIndex],
    checkedG: checked,
    // Uncheck C checkbox if G is checked
    checkedC: checked ? false : updatedRows[rowIndex].checkedC,
    // Clear slip data if unchecking G
    ...(!checked ? {
      slip_no: "",
      freight_amount: ""
    } : {})
  };
  
  setLocalRowValues(updatedRows);
  
  // When G is checked for FFCPV, fetch unpaid freight slips
  if (checked && vendorVoucherData.voucherType === 'FFCPV') {
    // First check if we have a customer selected
    const customerId = vendorVoucherData.customerId || updatedRows[rowIndex]?.customer_id;
    
    if (!customerId) {
      alert("Please select a customer from the Customer dropdown above first!");
      // Uncheck G since no customer is selected
      updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        checkedG: false
      };
      setLocalRowValues(updatedRows);
      return;
    }
    
    // Fetch unpaid freight slips for this customer
    try {
      console.log(`🔄 Fetching freight slips for customer: ${customerId}`);
      const slips = await fetchUnpaidFreightSlips(customerId.toString());
      
      if (slips.length === 0) {
        alert(`No unpaid freight slips found for customer ${vendorVoucherData.customerName || customerId}`);
        // Uncheck G since no slips found
        updatedRows[rowIndex] = {
          ...updatedRows[rowIndex],
          checkedG: false
        };
        setLocalRowValues(updatedRows);
        return;
      }
      
      console.log(`✅ Found ${slips.length} unpaid freight slips`);
      setFreightSlips(slips);
      
      // Show slip selection dropdown
      showSlipDropdownForRow(rowIndex, slips);
      
    } catch (error) {
      console.error("❌ Error fetching freight slips:", error);
      alert("Failed to fetch freight slips. Please try again.");
      
      // Uncheck G on error
      updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        checkedG: false
      };
      setLocalRowValues(updatedRows);
    }
  }
};




const fetchUnpaidFreightSlips = async (customerId: string, limit: number = 100) => {
  try {
    console.log(`📡 Fetching unpaid freight slips for customer: ${customerId}`);
    
    const response = await fetch(
      `/api/weighbridge/feed-freight-slip?customer_id=${encodeURIComponent(customerId)}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch freight slips: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Fetched ${data.length} unpaid freight slips for customer ${customerId}`);
    return data;
  } catch (error) {
    console.error("❌ Error fetching unpaid freight slips:", error);
    return [];
  }
};





// ✅ NEW: Function to show slip selection dropdown
const showSlipDropdownForRow = (rowIndex: number, slips: any[]) => {
  try {
    // Get slip no input element position
    const inputElement = document.getElementById(`slip-no-${rowIndex}`);
    if (!inputElement) {
      console.error(`Input element #slip-no-${rowIndex} not found`);
      return;
    }
    
    const rect = inputElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Store slip data for dropdown
    setFreightSlips(slips);
    
    // Show slip dropdown (you'll need to create this state)
    setSlipDropdownPosition({
      top: rect.bottom + scrollTop,
      left: rect.left + scrollLeft
    });
    setSlipDropdownForRowIndex(rowIndex);
    setShowSlipDropdown(true);
    setSlipSearchTerm("");
    
  } catch (error) {
    console.error("Error showing slip dropdown:", error);
  }
};


// ✅ NEW: Handler for C checkbox click (Customer list for MBPV/MCPV)
const handleCCheckboxChange = (rowIndex: number, checked: boolean) => {
  const updatedRows = [...localRowValues];
  updatedRows[rowIndex] = {
    ...updatedRows[rowIndex],
    checkedC: checked,
    // Uncheck I checkbox if C is checked
    checkedI: checked ? false : updatedRows[rowIndex].checkedI
  };
  
  setLocalRowValues(updatedRows);
  
  // Show customer dropdown when C is checked
  if (checked && (selectedVoucherType === 'MBPV' || selectedVoucherType === 'MCPV')) {
    showDropdownForRow(rowIndex, false); // false = customer dropdown
  }
};

// Function to handle input field click
const handleInputClick = (rowIndex: number, e: React.MouseEvent<HTMLInputElement>) => {
  // For MBPV/MCPV, don't open dropdown on input click - only on checkbox click
  if (selectedVoucherType === 'MBPV' || selectedVoucherType === 'MCPV') {
    return; // Don't open dropdown on input click for these types
  }
  
  // Existing logic for other voucher types
  const currentChecked = localRowValues[rowIndex]?.checked || false;
  
  const rect = e.currentTarget.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  setDropdownForRowIndex(rowIndex);
  setDropdownType(currentChecked ? "vendor" : "customer");
  setDropdownPosition({
    top: rect.bottom + scrollTop,
    left: rect.left + scrollLeft
  });
  setShowDropdown(true);
  setSearchTerm("");
};


const handleInputChange = (
  rowIndex: number,
  field: string,
  value: string
) => {
  // When user interacts with any field in a row, set that as active row
  setActiveRowIndex(rowIndex);
  
  setLocalRowValues(prev => {
    const updated = [...prev];
    updated[rowIndex] = {
      ...updated[rowIndex],
      [field]: value
    };
    return updated;
  });
};

  // ✅ FIXED: Function to handle input blur with types
const handleInputBlur = useCallback(
  (rowIndex: number, field: string) => {
    const rowValue = localRowValues[rowIndex]?.[field];

    // sync with form items
    setLocalFormItems(prev => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        [field]: rowValue
      };
      return updated;
    });

    // sync with freight items
    setFreightItems(prev => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        [field]: rowValue
      };
      return updated;
    });
  },
  [localRowValues]
);


  // Initialize refs in useEffect
  useEffect(() => {
    // Initialize refs array
    accountCodeRefs.current = accountCodeRefs.current.slice(0, localRowValues.length);
  }, [localRowValues.length]);
  

// ✅ MODIFIED: Customer selection handler
const handleCustomerSelect = (rowIndex: number, selectedCustomer: any) => {
    setActiveRowIndex(rowIndex); // Add this line at the beginning

  console.log("✅ Selected customer:", selectedCustomer);
  
  // Safely extract values with null checks
  const customerId = selectedCustomer?.id?.toString() || 
                    selectedCustomer?.customer_id?.toString() || 
                    "";
  const customerName = selectedCustomer?.customer_name || 
                      selectedCustomer?.party_name || 
                      selectedCustomer?.name || 
                      "";
  
  // ✅ IMPORTANT: Use 'receiveable_account_id' (single 'e')
  const receivableAccountId = selectedCustomer?.receiveable_account_id || 
                             selectedCustomer?.receivable_account_id || 
                             0;
  const receivableAccountCode = selectedCustomer?.receivable_account_code || "";
  const receivableAccountDesc = selectedCustomer?.receivable_account_desc || "";
  
  console.log(`📝 Setting row ${rowIndex}: 
    Customer ID=${customerId}, 
    Name=${customerName}, 
    Receiveable Account ID=${receivableAccountId} (single 'e'), 
    Account Code=${receivableAccountCode}, 
    Account Desc=${receivableAccountDesc}`);
  
  // Update local row values
  const updatedRows = [...localRowValues];
  if (updatedRows[rowIndex]) {
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      party_account: customerId,
      party: customerName,
      account_code: receivableAccountCode,
      account_id: receivableAccountId, // This will use receiveable_account_id
      description: receivableAccountDesc,
      sub_acc_code: receivableAccountId?.toString() || "",
      // ✅ Store customer ID for FFCPV G checkbox functionality
      customer_id: customerId
    };
    setLocalRowValues(updatedRows);
  }
  
  // Also update vendor voucher data with customer info
  if (vendorVoucherData.voucherType === 'FFCPV') {
    setVendorVoucherData(prev => ({
      ...prev,
      customerId: customerId,
      customerName: customerName,
      customers: customerName
    }));
  }
  
  // Close dropdown
  setShowDropdown(false);
  setDropdownForRowIndex(null);
  setDropdownType(null);
};



  // Function to handle vendor selection from dropdown
// ✅ MODIFIED: Function to handle vendor selection from dropdown
const handleVendorSelect = (rowIndex: number, item: any) => {
    setActiveRowIndex(rowIndex); // Add this line at the beginning

  console.log("✅ Selected vendor:", item);
  
  // Get vendor details
  const vendorId = item.vendor_id?.toString() || item.id?.toString() || "";
  const vendorName = item.vendor_name || item.party_name || item.name || "";
  const payableAccountId = item.payable_account_id;
  const payableAccountCode = item.payable_account_code || "";
  const payableAccountDesc = item.payable_account_desc || "";
  
  console.log(`📝 Setting row ${rowIndex}: 
    Vendor ID=${vendorId}, 
    Name=${vendorName}, 
    Payable Account ID=${payableAccountId}, 
    Account Code=${payableAccountCode}, 
    Account Desc=${payableAccountDesc}`);
  
  // Update local row values
  const updatedRows = [...localRowValues];
  updatedRows[rowIndex] = {
    ...updatedRows[rowIndex],
    party_account: vendorId,
    party: vendorName,
    account_code: payableAccountCode, // ✅ Auto-fill account code
    account_id: payableAccountId, // ✅ ADD THIS - store the actual account ID
    description: payableAccountDesc,  // ✅ Auto-fill description
    sub_acc_code: payableAccountId?.toString() || "" // ✅ Auto-fill sub account code
  };
  setLocalRowValues(updatedRows);
  
  // Update other states
  const updatedLocal = [...localFormItems];
  updatedLocal[rowIndex] = {
    ...updatedLocal[rowIndex],
    party_account: vendorId,
    party: vendorName,
    account_code: payableAccountCode,
    account_id: payableAccountId, // ✅ ADD THIS
    description: payableAccountDesc,
    sub_acc_code: payableAccountId?.toString() || ""
  };
  setLocalFormItems(updatedLocal);
  
  const updatedFreight = [...freightItems];
  updatedFreight[rowIndex] = {
    ...updatedFreight[rowIndex],
    party_account: vendorId,
    party: vendorName,
    account_code: payableAccountCode,
    account_id: payableAccountId, // ✅ ADD THIS
    description: payableAccountDesc,
    sub_acc_code: payableAccountId?.toString() || ""
  };
  setFreightItems(updatedFreight);
  
  // Close dropdown
  setShowDropdown(false);
  setDropdownForRowIndex(null);
  setDropdownType(null);
};





// Add this function with your other handlers:
const handleCostCenterClick = (rowIndex: number, e: React.MouseEvent) => {
    setActiveRowIndex(rowIndex); // Add this line

  e.preventDefault();
  e.stopPropagation();

  const currentValue = localRowValues[rowIndex]?.cost_center || "";

  // Input element ka position
  const inputElement = document.getElementById(`cost-center-${rowIndex}`);
  if (inputElement) {
    const rect = inputElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    setCostCenterDropdownForRowIndex(rowIndex);
setCostCenterDropdownPosition({
  top: rect.top + scrollTop,
  left: Math.max(10, rect.left - 500)  // Position to the left
});
    setShowCostCenterDropdown(true);
    setCostCenterSearchTerm("");

    // Load cost centers from backend
    fetchCostCenters(currentValue).then((centers) => {
      setCostCenterList(centers);
    }).catch((error) => {
      console.error("Error loading cost centers:", error);
    });
  }
};




// Add this function:
const handleCostCenterSelect = (rowIndex: number, selected: { id: number; desc: string }) => {
    setActiveRowIndex(rowIndex); // Add this line

  setLocalRowValues(prev => {
    
    const newRows = [...prev];
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      cost_center_id: selected.id,  // DB me save
      cost_center: selected.desc    // Field me show
    };
    return newRows;
  });

  setShowCostCenterDropdown(false);
};








// Add this component with your other dropdown components:
// ✅ CORRECTED CostCenterDropdown component
const CostCenterDropdown = () => {
  if (!showCostCenterDropdown || costCenterDropdownForRowIndex === null) {
    return null;
  }

  // Filter based on search
  const filteredCenters = costCenterSearchTerm 
    ? costCenterList.filter(center => {
        const searchLower = costCenterSearchTerm.toLowerCase();
        const code = (center.cost_center || "").toLowerCase();
        const desc = (center.cost_desc || "").toLowerCase();
        const shortDesc = (center.cost_short_desc || "").toLowerCase();
        
        return code.includes(searchLower) || 
               desc.includes(searchLower) || 
               shortDesc.includes(searchLower);
      })
    : costCenterList;

  return (
    <div 
      className="dropdown-menu show"
      style={{
        position: "absolute",
        top: `${costCenterDropdownPosition.top}px`,
        left: `${costCenterDropdownPosition.left}px`,
        width: "500px",
        maxHeight: "350px",
        overflowY: "auto",
        zIndex: 9999,
        display: "block",
        backgroundColor: "white",
        border: "1px solid #ccc",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
      }}
    >
      <div className="p-2 border-bottom bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <strong className="text-primary">
            Select Cost Center
          </strong>
          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              setShowCostCenterDropdown(false);
              setCostCenterDropdownForRowIndex(null);
            }}
          >
            ×
          </button>
        </div>
        <div className="mt-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search cost center code or description..."
            value={costCenterSearchTerm}
            onChange={(e) => setCostCenterSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
      </div>
      
      <div className="dropdown-list">
        {isLoadingCostCenters ? (
          <div className="p-3 text-center">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-2 text-muted">Loading cost centers...</div>
          </div>
        ) : filteredCenters.length > 0 ? (
          filteredCenters.slice(0, 30).map((center: any, index: number) => {
            const key = center.cost_center_id || `center-${index}`;
            
            return (
              <button
                key={key}
                className="dropdown-item text-start"
                onClick={() => handleCostCenterSelect(costCenterDropdownForRowIndex, { 
                  id: center.cost_center_id, 
                  desc: center.cost_desc || center.cost_center || "N/A" 
                })}
                style={{ 
                  fontSize: "12px",
                  padding: "8px 12px",
                  borderBottom: "1px solid #f0f0f0",
                  whiteSpace: "normal",
                  textAlign: "left"
                }}
              >
                <div className="fw-bold text-primary">{center.cost_center || "N/A"}</div>
                <div className="small">{center.cost_desc || "No description"}</div>
                {center.cost_short_desc && (
                  <div className="text-muted small">Short: {center.cost_short_desc}</div>
                )}
                <div className="text-muted small mt-1">
                  Order: {center.cost_center_order || "N/A"} | 
                  ID: {center.cost_center_id || "N/A"}
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-3 text-center text-muted">
            {costCenterSearchTerm 
              ? `No cost centers found for "${costCenterSearchTerm}"` 
              : "No cost centers available"}
          </div>
        )}
      </div>
    </div>
  );
};

  

  // ✅ FIXED: Function to handle account selection from LOV
// ✅ FIXED: Function to handle account selection from LOV
const handleAccountSelect = (account: any) => {
  if (accountDropdownForRowIndex !== null) {
        setActiveRowIndex(accountDropdownForRowIndex); // Add this line

    const updatedRows = [...localRowValues];
    updatedRows[accountDropdownForRowIndex] = {
      ...updatedRows[accountDropdownForRowIndex],
      account_code: account.account_code || "",
      account_id: account.chart_of_account_id || account.id || 0, // ✅ ADD THIS
      description: account.account_desc || ""
    };
    setLocalRowValues(updatedRows);
    
    // Also update other states
    const updatedLocal = [...localFormItems];
    if (updatedLocal[accountDropdownForRowIndex]) {
      updatedLocal[accountDropdownForRowIndex] = {
        ...updatedLocal[accountDropdownForRowIndex],
        account_code: account.account_code || "",
        account_id: account.chart_of_account_id || account.id || 0, // ✅ ADD THIS
        description: account.account_desc || ""
      };
    } else {
      updatedLocal[accountDropdownForRowIndex] = updatedRows[accountDropdownForRowIndex];
    }
    setLocalFormItems(updatedLocal);
    
    // Close dropdown
    setShowAccountDropdown(false);
    setAccountDropdownForRowIndex(null);
    setIsAccountLOVOpen(false);
    
    // Focus back to the input field
    setTimeout(() => {
      accountCodeRefs.current[accountDropdownForRowIndex]?.focus();
    }, 100);
  }
};

  // ✅ FIXED: Function to handle account search
const handleAccountSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  setAccountSearchTerm(e.target.value);
  // ✅ No API call here — we search locally in accountsList
};


  useEffect(() => {
    if (customersList.length > 0) {
      console.log("🔍 First 5 customers structure:", customersList.slice(0, 5));
    }
  }, [customersList]);

  // Add this function after your other helper functions
  const useSelectedRowAsFallback = (voucherId: string | number) => {
    if (!selectedRow) {
      alert("❌ No data available for editing");
      return;
    }
    
    console.log("🔄 Using selectedRow as fallback data");
    
    // Use selectedRow data directly
    const formData = {
      vendorNo: selectedRow.voucher_no || selectedRow.voucher_number || "",
      vendorDate: selectedRow.voucher_date 
        ? new Date(selectedRow.voucher_date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      voucherType: selectedRow.voucher_type || selectedVoucherType,
      vendorName: selectedRow.customer_name || selectedRow.vendor_name || selectedRow.party_name || "",
      cashAmount: selectedRow.cash_amount || selectedRow.paid_amount || selectedRow.amount || 0,
      referenceNo: selectedRow.reference_no || selectedRow.ref_no || "",
      customers: selectedRow.customers || selectedRow.customer_name || "",
      currency: selectedRow.currency || "PKR",
      exchangeRate: selectedRow.exchange_rate || 1,
      accountBalance: selectedRow.account_balance || 0, // ✅ ADD THIS
      description: selectedRow.description || selectedRow.remarks || selectedRow.narration || "",
      company: selectedRow.company_name || selectedRow.company || "Multan Feed",
      branch: selectedRow.branch || selectedRow.branch_name || selectedBranch,
      customerId: selectedRow.customer_id || selectedRow.vendor_id || null,
      customerName: selectedRow.customer_name || selectedRow.vendor_name || "",
      createdBy: selectedRow.created_by || selectedRow.user_id || null,
      month: selectedRow.voucher_date 
        ? new Date(selectedRow.voucher_date).toISOString().slice(0, 7)
        : new Date().toISOString().slice(0, 7)
    };
    
    console.log("📝 Fallback form data:", formData);
    
    setVendorVoucherData(formData);
    setShowVendorVoucherForm(true);
    setIsEditMode(true);
    setEditingWbId(voucherId);
    
    // Try to load accounts if available
    if (selectedRow.accounts && Array.isArray(selectedRow.accounts)) {
      const formattedAccounts = selectedRow.accounts.map((acc: any, index: number) => ({
        id: acc.voucher_account_id || `fallback-acc-${index}`,
        voucher_account_id: acc.voucher_account_id,
        party: acc.vendor_name || acc.account_desc || "",
        account_code: acc.account_code?.toString() || "",
        account_desc: acc.account_desc || "",
        debit: acc.debit?.toString() || "",
        credit: acc.credit?.toString() || "",
        naration: acc.naration || "",
        checked: true
      }));
      setFreightItems(formattedAccounts);
    } else {
      // Add empty rows
      const emptyRows = Array(3).fill(null).map((_, index) => ({
        id: `empty-fallback-${index}`,
        party: "",
        account_code: "",
        account_desc: "",
        debit: "",
        credit: "",
        naration: "",
        checked: index === 0
      }));
      setFreightItems(emptyRows);
    }
    
    alert("⚠️ Using basic voucher data. Some details may be missing.");
  };

  // Keep voucher types synchronized
  useEffect(() => {
    if (vendorVoucherData.voucherType && vendorVoucherData.voucherType !== selectedVoucherType) {
      console.log("🔄 Syncing selectedVoucherType from vendorVoucherData:", vendorVoucherData.voucherType);
      setSelectedVoucherType(vendorVoucherData.voucherType);
    }
  }, [vendorVoucherData.voucherType]);

  useEffect(() => {
    if (selectedVoucherType && selectedVoucherType !== vendorVoucherData.voucherType) {
      console.log("🔄 Syncing vendorVoucherData.voucherType from selectedVoucherType:", selectedVoucherType);
      setVendorVoucherData(prev => ({
        ...prev,
        voucherType: selectedVoucherType
      }));
    }
  }, [selectedVoucherType]);

useEffect(() => {
  // Allow MCPV, FMCPV, CPM for cash payment voucher page
  let validType = urlVoucherType;
  if (urlVoucherType === 'MCPV' || urlVoucherType === 'FMCPV' || urlVoucherType === 'CPM') {
    validType = urlVoucherType;
  }
  setSelectedVoucherType(validType);
  setVendorVoucherData(prev => ({
    ...prev,
    voucherType: validType
  }));
}, [urlVoucherType]);



// Your existing filteredVouchers useMemo (keep as is - around line 815)
const filteredVouchers = useMemo(() => {
  const vouchers = freightVouchers || [];
  let filtered = vouchers;

  if (selectedVoucherType) {
    filtered = filtered.filter(v => v.voucher_type === selectedVoucherType);
  }

  if (selectedStatus) {
    filtered = filtered.filter(v => v.status === selectedStatus);
  }

  // Remarks/Description filter
  if (remarksFilter.trim() !== "") {
    const searchTerm = remarksFilter.toLowerCase().trim();
    filtered = filtered.filter(v => {
      const description = (v.description || "").toLowerCase();
      const remarks = (v.remarks || "").toLowerCase();
      const narration = (v.narration || "").toLowerCase();
      const entryRemarks = (v.entry_remarks || "").toLowerCase();
      
      return description.includes(searchTerm) || 
             remarks.includes(searchTerm) || 
             narration.includes(searchTerm) || 
             entryRemarks.includes(searchTerm);
    });
  }

  return filtered;
}, [freightVouchers, selectedVoucherType, selectedStatus, remarksFilter]);

// const filteredVouchers = useMemo(() => {
//   const vouchers = freightVouchers || [];
//   let filtered = vouchers;

//   if (selectedVoucherType) {
//     filtered = filtered.filter(v => v.voucher_type === selectedVoucherType);
//   }

//   if (selectedStatus) {
//     filtered = filtered.filter(v => v.status === selectedStatus);
//   }

//   if (vendorVoucherData?.month) {
//     filtered = filtered.filter(v => {
//       const dateStr = v.voucher_date || v.voucherDate;
//       if (!dateStr) return false;
      
//       const date = new Date(dateStr);
//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const yearMonth = `${year}-${month}`;
      
//       return yearMonth === vendorVoucherData.month;
//     });
//   }

//   // ✅ NEW: Remarks/Description filter add karein
//   if (remarksFilter.trim() !== "") {
//     const searchTerm = remarksFilter.toLowerCase().trim();
//     filtered = filtered.filter(v => {
//       // Multiple fields mein search karein
//       const description = (v.description || "").toLowerCase();
//       const remarks = (v.remarks || "").toLowerCase();
//       const narration = (v.narration || "").toLowerCase();
//       const entryRemarks = (v.entry_remarks || "").toLowerCase();
      
//       // Check if search term exists in any of these fields
//       return description.includes(searchTerm) || 
//              remarks.includes(searchTerm) || 
//              narration.includes(searchTerm) || 
//              entryRemarks.includes(searchTerm);
//     });
//   }

//   return filtered;
// }, [freightVouchers, selectedVoucherType, selectedStatus, vendorVoucherData?.month, remarksFilter]); // ✅ remarksFilter ko dependency mein add karein








  const handleVoucherFieldChange = useCallback((
    voucherId: string,
    field: string,
    value: any
  ) => {
    setFreightVouchers(prev =>
      prev.map(v =>
        v.voucher_id === voucherId ? { ...v, [field]: value } : v
      )
    );
  }, []);

  const isDisabledAll = useMemo(() => 
    ["ONLINE", "CANCELLED", "CHECKED"].includes(selectedStatus),
    [selectedStatus]
  );

  useEffect(() => {
    fetchFreightVouchers();
      fetchAccountsList(); // Add this if you need accounts list

    fetchItemsList();
    fetchVendorsList();
    fetchCustomersList();
  }, [selectedStatus, selectedVoucherType, vendorVoucherData.month]);


const fetchFreightVouchers = async () => {
  try {
    setIsLoadingVouchers(true); // ✅ Show loading
    console.log("📡 Fetching vouchers with type:", selectedVoucherType, "and month:", vendorVoucherData.month);
    
    // Clear existing data immediately when fetching new month
    setFreightVouchers([]); // ✅ Clear immediately
    setSelectedVoucherIds([]);
    setSelectedRow(null);
    setSelectedFreightId(null);
    setFreightItems([]);
    
    const response = await fetch("/api/vouchers/post-vouchers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        voucher_type: selectedVoucherType,
        month: vendorVoucherData.month
      })
    });
    
    if (response.ok) {
      const resJson = await response.json();
      let vouchers: any[] = resJson.data?.vouchers || [];
      
      vouchers.sort((a, b) => {
        const voucherNoA = a.voucher_no || a.voucherNumber || a.id || 0;
        const voucherNoB = b.voucher_no || b.voucherNumber || b.id || 0;
        const numA = typeof voucherNoA === 'string' ? parseInt(voucherNoA) || 0 : voucherNoA;
        const numB = typeof voucherNoB === 'string' ? parseInt(voucherNoB) || 0 : voucherNoB;
        return numB - numA;
      });
      
      const filtered = selectedStatus
        ? vouchers.filter(v => v.status === selectedStatus)
        : vouchers;
      
      setFreightVouchers(filtered);
      
      if (filtered.length === 0) {
        console.log(`⚠️ No vouchers found for month: ${vendorVoucherData.month}`);
      }
    } else {
      console.error("Failed to fetch vouchers:", response.status);
      setFreightVouchers([]);
    }
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    setFreightVouchers([]);
  } finally {
    setIsLoadingVouchers(false); // ✅ Hide loading
  }
};

  


// const fetchFreightVouchers = async () => {
//   try {
//     console.log("📡 Fetching vouchers with type:", selectedVoucherType, "and month:", vendorVoucherData.month);
    
//     const response = await fetch("/api/vouchers/post-vouchers", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         voucher_type: selectedVoucherType,
//         month: vendorVoucherData.month // Add month parameter
//       })
//     });
    
//     console.log("📡 API Response status:", response.status);
    
//     if (response.ok) {
//       const resJson = await response.json();
//       console.log("📡 Received vouchers count:", resJson.data?.vouchers?.length || 0);
      
//       let vouchers: any[] = resJson.data?.vouchers || [];
      
//       vouchers.sort((a, b) => {
//         const voucherNoA = a.voucher_no || a.voucherNumber || a.id || 0;
//         const voucherNoB = b.voucher_no || b.voucherNumber || b.id || 0;
        
//         const numA = typeof voucherNoA === 'string' ? parseInt(voucherNoA) || 0 : voucherNoA;
//         const numB = typeof voucherNoB === 'string' ? parseInt(voucherNoB) || 0 : voucherNoB;
        
//         return numB - numA;
//       });
      
//       const filtered = selectedStatus
//         ? vouchers.filter(v => v.status === selectedStatus)
//         : vouchers;
      
//       setFreightVouchers(filtered);
//     } else {
//       console.error("Failed to fetch vouchers:", response.status);
//     }
//   } catch (error) {
//     console.error("Error fetching vouchers:", error);
//   }
// };






  
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


// Add this function with your other API functions:
const fetchCostCenters = async (searchTerm: string = ""): Promise<any[]> => {
  try {
    setIsLoadingCostCenters(true);
    const url = searchTerm 
      ? `/api/cost-centers?search=${encodeURIComponent(searchTerm)}&limit=500000`
      : "/api/cost-centers?limit=100000";
    
    console.log(`📡 Fetching cost centers from: ${url}`);
    
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Fetched ${data.length} cost centers from API`);
      return data;
    } else {
      console.error("❌ Failed to fetch cost centers:", response.status);
      return [];
    }
  } catch (error) {
    console.error("❌ Error fetching cost centers:", error);
    return [];
  } finally {
    setIsLoadingCostCenters(false);
  }
};





// ✅ MODIFIED: fetchVendorsList function
const fetchVendorsList = async (forceRefresh = false) => {
  if (vendorCache.length > 0 && vendorsLoaded && !forceRefresh) {
    setVendorsList(vendorCache);
    return;
  }

  setIsLoadingVendors(true);
  try {
    // ✅ Include payable_account_id, payable_account_code, payable_account_desc in API call
    const response = await fetch("/api/vendors?limit==10000");
    if (response.ok) {
      const data = await response.json();
      const sortedVendors = data.sort((a: any, b: any) => {
        const nameA = (a.vendor_name || a.party_name || "").toLowerCase();
        const nameB = (b.vendor_name || b.party_name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      // ✅ Log sample data to check structure
      if (sortedVendors.length > 0) {
        console.log("✅ First vendor with payable account:", {
          name: sortedVendors[0].vendor_name,
          payable_account_id: sortedVendors[0].payable_account_id,
          payable_account_code: sortedVendors[0].payable_account_code,
          payable_account_desc: sortedVendors[0].payable_account_desc
        });
      }
      
      setVendorsList(sortedVendors);
      setVendorCache(sortedVendors);
      setVendorsLoaded(true);
    }
  } catch (error) {
    console.error("Error fetching vendors:", error);
    if (vendorCache.length > 0) {
      setVendorsList(vendorCache);
    }
  } finally {
    setIsLoadingVendors(false);
  }
};






const handleDelete = async () => {
  // 1) check ke kam az kam 1 voucher select ho
  if (!selectedVoucherIds || selectedVoucherIds.length === 0) {
    alert("Please select at least one voucher to delete");
    return;
  }

  // Optional confirm (delete is risky)
  const ok = window.confirm(
    `Are you sure you want to delete ${selectedVoucherIds.length} voucher(s)?`
  );
  if (!ok) return;

  const idsToDelete = [...selectedVoucherIds]; // snapshot

  try {
    const deletedList: Array<number | string> = [];
    const failedList: Array<{ id: number | string; message: string }> = [];

    for (const id of idsToDelete) {
      try {
        const response = await fetch(`/api/cash-receipt-delete/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: 1 }), // same as approve
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          failedList.push({
            id,
            message: result.message || "Failed to delete voucher",
          });
          continue;
        }

        // API me "data: { id, deleted_by, deleted_at }" aa raha hai
        deletedList.push(result?.data?.id ?? id);
      } catch (innerErr: any) {
        console.error("Delete error for voucher:", id, innerErr);
        failedList.push({
          id,
          message: innerErr?.message || "Unknown error",
        });
      }
    }

    // 2) List se deleted vouchers hata do
    setFreightVouchers((prev) =>
      prev.filter((v) => !idsToDelete.includes(v.voucher_id))
    );

    // 3) UI state clear
    setSelectedVoucherIds([]);
    setSelectedRow(null);
    setSelectedFreightId(null);
    setFreightItems([]);

    // 4) User ko summary message
    let msg = `🗑️ Deleted ${deletedList.length} voucher(s) successfully.`;
    if (failedList.length > 0) {
      msg += `\n❌ Failed: ${failedList
        .map((f) => f.id)
        .join(", ")} (check console/logs)`;
    }

    alert(msg);

    // 5) Agar kam az kam 1 delete hua hai to page reload karo
    if (deletedList.length > 0) {
      window.location.reload();
    }
  } catch (err) {
    console.error("Delete error:", err);
    alert("❌ Error deleting vouchers");
  }
};




// ✅ UPDATE: Use 'receiveable_account_id' (single 'e') to match database
const fetchCustomersList = async () => {
  try {
    const response = await fetch("/api/customers?limit=1000000");
    if (!response.ok) throw new Error("Failed to fetch customers");

    const data = await response.json();
    console.log("📡 Raw customers API response:", data);

    // ✅ IMPORTANT: Use 'receiveable_account_id' (single 'e') to match database
    const transformed = data.map((c: any) => ({
      id: c.customer_id,
      name: c.customer_name,
      party_ac: c.customer_id?.toString() || "",
      party_name: c.customer_name,
      party_desc: c.receivable_account_desc || "",
      // ✅ Database field name: receiveable_account_id (single 'e')
      receiveable_account_id: c.receiveable_account_id,
      receivable_account_id: c.receiveable_account_id, // Keep both for compatibility
      receivable_account_code: c.receivable_account_code || "",
      receivable_account_desc: c.receivable_account_desc || "",
      // For table fields:
      account_code: c.receivable_account_code || "",
      description: c.receivable_account_desc || "",
      // Original fields:
      customer_code: c.customer_code,
      _original: c
    }));
    
    setCustomersList(transformed);
    console.log("✅ Transformed customers with receiveable_account_id:", transformed.slice(0, 3));

  } catch (error) {
    console.error("❌ Error fetching customers:", error);
    setCustomersList([]);
  }
};



// Clear voucher data when month changes to prevent showing stale data
useEffect(() => {
  // Clear any selected vouchers when month changes
  setSelectedVoucherIds([]);
  setSelectedRow(null);
  setSelectedFreightId(null);
  setFreightItems([]);
  
  // Also clear any editing state
  if (isEditMode) {
    setIsEditMode(false);
    setEditingWbId(null);
  }
  
  console.log(`🗓️ Month changed to: ${vendorVoucherData.month}, clearing old voucher data`);
}, [vendorVoucherData.month]);


  useEffect(() => {
    console.log("📊 Current state:", {
      showDropdown,
      dropdownForRowIndex,
      dropdownType,
      vendorsCount: vendorsList.length,
      customersCount: customersList.length,
      searchTerm
    });
  }, [showDropdown, dropdownForRowIndex, dropdownType, vendorsList, customersList, searchTerm]);


  
  const fetchVoucherData = async (voucherId: number) => {
    try {
      const res = await fetch(`/api/vouchers/${selectedVoucherType.toLowerCase()}/${voucherId}`);
      if (!res.ok) throw new Error("Failed to fetch voucher data");
      
      const data = await res.json();
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
  // 1) check ke kam az kam 1 voucher select ho
  if (!selectedVoucherIds || selectedVoucherIds.length === 0) {
    alert("Please select at least one voucher to approve");
    return;
  }

  const idsToApprove = [...selectedVoucherIds]; // snapshot

  try {
    const approvedList: any[] = [];
    const failedList: Array<{ id: number | string; message: string }> = [];

    for (const id of idsToApprove) {
      try {
        const response = await fetch(`/api/cash-receipt-approve/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: 1 }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          failedList.push({
            id,
            message: result.message || "Failed to approve voucher",
          });
          continue;
        }

        const approvedVoucher = result.data.voucher;
        if (approvedVoucher) {
          approvedList.push(approvedVoucher);
        }
      } catch (innerErr: any) {
        console.error("Approve error for voucher:", id, innerErr);
        failedList.push({
          id,
          message: innerErr?.message || "Unknown error",
        });
      }
    }

    // 2) List se approved vouchers hata do
    setFreightVouchers((prev) =>
      prev.filter((v) => !idsToApprove.includes(v.voucher_id))
    );

    // 3) Approved list ko approvedVouchers me add karo
    if (approvedList.length > 0) {
      setApprovedVouchers((prev) => [...approvedList, ...prev]);
    }

    // 4) UI state clear
    setSelectedVoucherIds([]);
    setSelectedRow(null);
    setSelectedFreightId(null);
    setFreightItems([]);

    // 5) User ko summary message
    let msg = `✅ Approved ${approvedList.length} voucher(s) successfully.`;
    if (failedList.length > 0) {
      msg += `\n❌ Failed: ${failedList
        .map((f) => f.id)
        .join(", ")} (check console/logs)`;
    }

    alert(msg);

    // 6) Agar kam az kam 1 approve hua hai to page reload karo
    if (approvedList.length > 0) {
      window.location.reload();
    }
  } catch (err) {
    console.error("Approve error:", err);
    alert("❌ Error approving vouchers");
  }
};


const handleChecked = async () => {
  // 1) Check if at least 1 voucher is selected
  if (!selectedVoucherIds || selectedVoucherIds.length === 0) {
    alert("Please select at least one voucher to mark as checked");
    return;
  }

  const idsToCheck = [...selectedVoucherIds]; // snapshot

  try {
    const checkedList: any[] = [];
    const failedList: Array<{ id: number | string; message: string }> = [];

    for (const id of idsToCheck) {
      try {
        const response = await fetch(`/api/cash-receipt-checked/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: 1 }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          failedList.push({
            id,
            message: result.message || "Failed to mark voucher as checked",
          });
          continue;
        }

        // Find and add the checked voucher to the checked list
        const checkedVoucher = freightVouchers.find(v => v.voucher_id === id);
        if (checkedVoucher) {
          checkedList.push(checkedVoucher);
        }
      } catch (innerErr: any) {
        console.error("Check error for voucher:", id, innerErr);
        failedList.push({
          id,
          message: innerErr?.message || "Unknown error",
        });
      }
    }

    // 2) Remove checked vouchers from freightVouchers list
    setFreightVouchers((prev) =>
      prev.filter((v) => !idsToCheck.includes(v.voucher_id))
    );

    // 3) Add checked list to checkedVouchers (or approvedVouchers if you keep that name)
    if (checkedList.length > 0) {
      setApprovedVouchers((prev) => [...checkedList, ...prev]);
    }

    // 4) Clear UI state
    setSelectedVoucherIds([]);
    setSelectedRow(null);
    setSelectedFreightId(null);
    setFreightItems([]);

    // 5) Show summary message to user
    let msg = `✅ ${checkedList.length} voucher(s) marked as checked successfully.`;
    if (failedList.length > 0) {
      msg += `\n❌ Failed: ${failedList
        .map((f) => f.id)
        .join(", ")} (check console/logs)`;
    }

    alert(msg);

    // 6) If at least 1 was checked, reload page
    if (checkedList.length > 0) {
      window.location.reload();
    }
  } catch (err) {
    console.error("Check error:", err);
    alert("❌ Error marking vouchers as checked");
  }
};




const handleBalanceVoucher = async () => {
  if (!selectedRow || !selectedRow.voucher_id) {
    alert("Please select a valid voucher to balance");
    return;
  }

  try {
    // Get narration from appropriate source
    let narration = "Cash Payment against invoice";
    
    // Try to get from the first account's naration
    if (freightItems.length > 0 && freightItems[0].naration) {
      narration = freightItems[0].naration;
    } else if (freightItems.length > 0 && freightItems[0].notation) {
      narration = freightItems[0].notation;
    } else if (selectedRow.description) {
      narration = selectedRow.description;
    }

    // Get current voucher type
    const currentVoucherType = selectedRow.voucher_type || selectedVoucherType;
    
    let accountId;
    
    // ✅ FOR MBPV - use the master cash account selected by user
    if (currentVoucherType === 'MBPV') {
      console.log("🔍 MBPV detected - Using selected cash account for balance");
      
      // PRIORITY 1: Use the master cash account selected in the form (vendorVoucherData.acc_id)
      if (vendorVoucherData.acc_id && vendorVoucherData.acc_id > 0) {
        accountId = vendorVoucherData.acc_id;
        console.log(`✅ Using master cash account ID from form: ${accountId} (${vendorVoucherData.vendorName})`);
      }
      // PRIORITY 2: If we're in edit mode and have selectedRow with master account
      else if (selectedRow.acc_id && selectedRow.acc_id > 0) {
        accountId = selectedRow.acc_id;
        console.log(`✅ Using master cash account ID from selected voucher: ${accountId}`);
      }
      // PRIORITY 3: Check if selectedRow has accounts array with master account
      else if (selectedRow.accounts && selectedRow.accounts.length > 0) {
        const firstAccount = selectedRow.accounts[0];
        
        // Look for master account ID in various places
        if (firstAccount.master_account_id) {
          accountId = firstAccount.master_account_id;
        } else if (firstAccount.acc_id) {
          accountId = firstAccount.acc_id;
        } else if (firstAccount.Account && firstAccount.Account.account_id) {
          accountId = firstAccount.Account.account_id;
        } else if (firstAccount.account_id) {
          accountId = firstAccount.account_id;
        } else if (firstAccount.final_account_id) {
          accountId = firstAccount.final_account_id;
        }
      }
      // PRIORITY 4: From local form items
      else if (localFormItems.length > 0 && localFormItems[0].account_id) {
        accountId = localFormItems[0].account_id;
      }
      // PRIORITY 5: From freight items
      else if (freightItems.length > 0 && freightItems[0].account_id) {
        accountId = freightItems[0].account_id;
      }
      
      // If still no account found for MBPV, show error
      if (!accountId || accountId === 0) {
        const useDefault = window.confirm(
          `⚠️ WARNING: No cash account selected for MBPV.\n\n` +
          `Please select a cash account from the Cash Account field first.\n\n` +
          `Do you want to continue with default account 203?`
        );
        
        if (!useDefault) {
          alert("Please select a cash account from the Cash Account field first.");
          return;
        } else {
          accountId = 203;
        }
      }
    } else {
      // ✅ For ALL OTHER VOUCHER TYPES (MCRV, MCPV, MBRV, FFCPV) - use master account if available, else 203
      if (vendorVoucherData.acc_id && vendorVoucherData.acc_id > 0) {
        accountId = vendorVoucherData.acc_id;
        console.log(`✅ Using master account ID for balance: ${accountId}`);
      } else if (selectedRow.acc_id && selectedRow.acc_id > 0) {
        accountId = selectedRow.acc_id;
        console.log(`✅ Using selectedRow.acc_id for balance: ${accountId}`);
      } else {
        accountId = 203;
        console.log(`⚠️ Using default account 203 for balance (${currentVoucherType})`);
      }
    }

    console.log("📊 Balance Voucher Parameters:", {
      voucher_id: selectedRow.voucher_id,
      voucher_type: currentVoucherType,
      account_id: accountId,
      narration: narration,
      account_source: currentVoucherType === 'MBPV' 
        ? (accountId === 203 ? "DEFAULT_FALLBACK" : "USER_SELECTED_CASH_ACCOUNT") 
        : (accountId === 203 ? "DEFAULT_203" : "MASTER_ACCOUNT"),
      master_account: vendorVoucherData.vendorName
    });

    const confirmProceed = window.confirm(
      `BALANCE VOUCHER CONFIRMATION\n\n` +
      `Voucher #: ${selectedRow.voucher_no || selectedRow.voucher_id}\n` +
      `Voucher Type: ${currentVoucherType}\n` +
      `Account ID: ${accountId}\n` +
      `${currentVoucherType === 'MBPV' ? `Account Name: ${vendorVoucherData.vendorName || "Not selected"}\n` : ''}` +
      `Narration: ${narration}\n\n` +
      `Click OK to proceed with balancing this voucher.`
    );

    if (!confirmProceed) {
      return;
    }

    // Show loading state
    const originalText = "Balance Voucher";
    const button = document.querySelector('button[onclick*="handleBalanceVoucher"]');
    if (button) {
      button.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Balancing...';
      button.disabled = true;
    }

    // Construct the URL with query parameters - using the determined account_id
    const apiUrl = `/api/vouchers/balance?voucher_id=${encodeURIComponent(selectedRow.voucher_id.toString())}&voucher_type_desc=${encodeURIComponent(currentVoucherType.toUpperCase())}&account_id=${encodeURIComponent(accountId.toString())}&narration=${encodeURIComponent(narration)}&user_id=${encodeURIComponent("1")}`;
    
    console.log("API URL:", apiUrl);

    // Call the API
    const response = await fetch(apiUrl);

    const result = await response.json();
    console.log("API Response:", result);

    // Reset button state
    if (button) {
      button.innerHTML = originalText;
      button.disabled = false;
    }

    if (result.success) {
      alert(`✅ SUCCESS!\n\nVoucher #${selectedRow.voucher_id} balanced successfully using account ID: ${accountId}\n\nMessage: ${result.message}`);
      
      // Clear selections
      setSelectedVoucherIds(prev => prev.filter(id => id !== selectedRow.voucher_id));
      setSelectedRow(null);
      setFreightItems([]);
      setSelectedFreightId(null);
    } else {
      alert(`❌ FAILED\n\nCould not balance voucher.\n\nError: ${result.error || result.message || "Unknown error"}\n\nPlease check the console for details.`);
    }

  } catch (error) {
    console.error("❌ Balance Voucher Error:", error);
    
    // Reset button state
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      if (btn.textContent.includes('Balancing...')) {
        btn.innerHTML = 'Balance Voucher';
        btn.disabled = false;
      }
    });
    
    alert(`❌ NETWORK ERROR\n\nFailed to connect to server.\n\nError: ${error.message}\n\nPlease check your connection and try again.`);
  }
};



const handlePrinnt = async () => {
  console.log("Selected Freight ID:", selectedFreightId);

  if (!selectedFreightId) {
    alert("Please select a voucher to print.");
    return;
  }

  try {
    // Call the single voucher report API
    const response = await fetch(`/api/single-voucher-report?voucher_id=${selectedFreightId}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const voucherData = await response.json();
    console.log("Voucher API Response:", voucherData);

    if (!voucherData || voucherData.length === 0) {
      alert("No voucher data found for the selected ID.");
      return;
    }

    // Calculate totals
    let totalDr = 0;
    let totalCr = 0;
    
    voucherData.forEach(item => {
      totalDr += parseFloat(item.debit || 0);
      totalCr += parseFloat(item.credit || 0);
    });

    // Function to convert amount to words
    const amountToWords = (num) => {
      if (num === 0) return "Zero Only";
      
      const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
      const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
      const thousands = ["", "Thousand", "Million", "Billion"];

      if (num > 999999999.99) {
        return "Amount too large";
      }

      // Separate rupees and paisa
      const rupees = Math.floor(num);
      const paisa = Math.round((num - rupees) * 100);
      
      let words = "";

      // Convert rupees to words
      if (rupees > 0) {
        let count = 0;
        let n = rupees;

        while (n > 0) {
          if (n % 1000 !== 0) {
            let chunkWords = "";
            let chunk = n % 1000;
            
            if (chunk >= 100) {
              chunkWords += ones[Math.floor(chunk / 100)] + " Hundred";
              chunk %= 100;
              if (chunk > 0) chunkWords += " and ";
            }

            if (chunk > 0) {
              if (chunk < 20) {
                chunkWords += ones[chunk];
              } else {
                chunkWords += tens[Math.floor(chunk / 10)];
                if (chunk % 10 > 0) {
                  chunkWords += " " + ones[chunk % 10];
                }
              }
            }

            if (chunkWords !== "") {
              words = chunkWords + (thousands[count] ? " " + thousands[count] : "") + (words ? " " + words : "");
            }
          }
          n = Math.floor(n / 1000);
          count++;
        }

        words += " Rupees";
      } else {
        words = "Zero Rupees";
      }

      // Add paisa if exists
      if (paisa > 0) {
        if (rupees > 0) words += " and ";
        
        if (paisa < 20) {
          words += ones[paisa] + " Paisa";
        } else {
          words += tens[Math.floor(paisa / 10)];
          if (paisa % 10 > 0) {
            words += " " + ones[paisa % 10];
          }
          words += " Paisa";
        }
      }

      return words + " Only";
    };

    const currentUserName = JSON.parse(sessionStorage.getItem("user") || "{}")?.userName || "admin";
    const voucherInfo = voucherData[0]; // First row contains voucher header info

    // Generate rows for the print content - UPDATED COLUMN ORDER
    const rows = voucherData.map((item:any, index:any) => {
      const accountDesc = item.acc_desc || item.description || "";
      const narration = item.naration || "";
      const party = item.party || "";

      // Format debit and credit values with proper decimal alignment
      const debitValue = parseFloat(item.debit || 0);
      const creditValue = parseFloat(item.credit || 0);
      
      const debitFormatted  = debitValue.toLocaleString("en-US");
      const creditFormatted = creditValue.toLocaleString("en-US");

      return `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td>${item.chart_of_account_code || ""}</td>
        <td>${accountDesc}</td>
        <td>${narration}</td>
        <td style="text-align: right; padding-right: 20px; font-family: 'Courier New', monospace;">${debitFormatted}</td>
        <td style="text-align: right; padding-right: 20px; font-family: 'Courier New', monospace;">${creditFormatted}</td>
      </tr>
    `;
    }).join("");

    // Generate party information row if exists
    const partyRow = voucherInfo.party ? `
      <tr>
      </tr>
    ` : '';

    // Format dates
    const formatDate = (dateString:any) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    };

    // Get amount in words (use totalDr if it's a debit voucher, otherwise totalCr)
    const amountForWords = totalDr > 0 ? totalDr : totalCr;
    const amountInWords = amountToWords(amountForWords);

    const printContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Voucher Report - ${selectedVoucherType|| 'Voucher'}</title>
  <style>
    body {
      font-family: Times New Roman;
      font-size: 18px;
      margin: 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 15px;
    }

    .header h2 {
      margin: 0;
      font-size: 18px;
    }

    .voucher-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }

    .voucher-info div {
      margin-bottom: 5px;
    }

    .voucher-info span.label {
      font-weight: bold;
    }

    .voucher-info span.value {
      display: inline-block;
      border-bottom: 1px solid black;
      min-width: 150px;
      text-align: center;
      margin-left: 5px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      table-layout: fixed;
    }

    table, th, td {
      border: 1px solid black;
    }

    th, td {
      padding: 8px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background-color: #f2f2f2;
      text-align: center;
    }

    .amount-column {
      text-align: right;
      font-family: 'Courier New', monospace;
      padding-right: 20px !important;
    }

    .total-row {
      font-weight: bold;
      background-color: #e8e8e8;
    }

    .total-row td {
      text-align: right;
    }

    .footer {
      margin-top: 50px;
      display: flex;
      justify-content: space-between;
      gap: 20px;
    }

    .signature-box {
      flex: 1;
      text-align: center;
    }

    .signature-line {
      border-top: 1px solid black;
      width: 100%;
      margin: 40px 0 5px 0;
    }

    .company-header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 1px solid #333;
      padding-bottom: 10px;
    }

    .company-name {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .voucher-title {
      font-size: 18px;
      font-weight: bold;
      text-decoration: underline;
      margin-top: 5px;
      text-transform: uppercase;
    }

    .amount-in-words {
      margin: 20px 0;
      padding: 8px;
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      font-style: italic;
    }

    .amount-in-words-label {
      font-weight: bold;
      margin-right: 10px;
    }

    /* Column width adjustments */
    .col-sno {
      width: 5%;
    }
    .col-account-code {
      width: 12%;
    }
    .col-account-desc {
      width: 28%;
    }
    .col-narration {
      width: 25%;
    }
    .col-debit {
      width: 15%;
    }
    .col-credit {
      width: 15%;
    }

    .signature-content {
      margin-top: 10px;
      font-size: 14px;
    }
  </style>
</head>
<body>

<div class="company-header">
  <div class="company-name">Multan Feed (PVT.) LTD.</div>
  <div class="voucher-title">
    ${selectedVoucherType === 'FFCPV' ? 'Feed Freight Cash Payment Voucher' : 
      selectedVoucherType === 'MCRV' ? 'Mill Cash Receipt Voucher' :
      selectedVoucherType === 'MCPV' ? 'Mill Cash Payment Voucher' :
      selectedVoucherType === 'MBPV' ? 'Mill Bank Payment Voucher' :
      selectedVoucherType === 'MBRV' ? 'Mill Bank Receipt Voucher' :
      selectedVoucherType}
  </div>
</div>
<div style="margin-top: 8%; font-size: 15px; text-align: center;">
  ${selectedVoucherType} - ${voucherInfo.voucher_no}
</div>

<div class="voucher-info">
  <div>
    <p><strong>Date:</strong> ${
      new Date(voucherInfo.voucher_date)
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: '2-digit'
        })
        .replace(/ /g, '-')
        .toUpperCase()
    }</p>
  </div>

  <div>
    <span class="label">Module Name</span>
    <span class="value">Direct Voucher</span>
  </div>
</div>

${partyRow}

<table>
  <thead>
    <tr>
      <th class="col-sno">#</th>
      <th class="col-account-code">Account Code</th>
      <th class="col-account-desc">Account Description</th>
      <th class="col-narration">Narration</th>
      <th class="col-debit">Debit</th>
      <th class="col-credit">Credit</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
    <tr class="total-row">
      <td colspan="4" style="text-align: left;">Total</td>
      <td class="amount-column">
        ${Number(totalDr.toFixed(0)).toLocaleString("en-US")}
      </td>
      <td class="amount-column">
        ${Number(totalCr.toFixed(0)).toLocaleString("en-US")}
      </td>
    </tr>
  </tbody>
</table>

<!-- Amount in Words Section -->
<div class="amount-in-words">
  <span class="amount-in-words-label">Amount in Words:</span>
  <span>${amountInWords}</span>
</div>

<div class="footer">
  <div class="signature-box">
    <div class="signature-line"></div>
    <div class="signature-content">
      <strong>Prepared By</strong><br>
      Adnan Butt<br>
      Date: ${formatDate(voucherInfo.creation_date)}
    </div>
  </div>

  <div class="signature-box">
    <div class="signature-line"></div>
    <div class="signature-content">
      <strong>Checked By</strong><br>
      ${voucherInfo.cheked_by || ''}<br>
      Date: ${formatDate(voucherInfo.checked_date)}
    </div>
  </div>

  <div class="signature-box">
    <div class="signature-line"></div>
    <div class="signature-content">
      <strong>Approved By</strong><br>
      ${voucherInfo.approved_by || ''}<br>
      Date: ${formatDate(voucherInfo.approval_date)}
    </div>
  </div>

  <div class="signature-box">
    <div class="signature-line"></div>
    <div class="signature-content">
      <strong>Received By</strong><br>
      ${voucherInfo.received_by || ''}<br>
      Date: ${formatDate(voucherInfo.received_date)}
    </div>
  </div>
</div>



</body>
</html>
`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for images to load before printing
      printWindow.onload = function() {
        printWindow.print();
      };
    }

  } catch (error) {
    console.error("❌ Error fetching voucher data:", error);
    alert("Failed to fetch voucher data for printing. Please try again.");
  }
};
  







  const handleCancel = async () => {
    if (!selectedRow || !selectedRow.voucher_id) {
      alert("Please select a valid voucher to cancel");
      return;
    }

    const confirmCancel = window.confirm(
      `Are you sure you want to cancel Voucher #${selectedRow.voucher_id}? This action cannot be undone.`
    );
    
    if (!confirmCancel) return;

    try {
      const response = await fetch(`/api/cash-receipt-cancel/${selectedRow.voucher_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: 1 })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to cancel voucher");
      }

      setFreightVouchers(prev =>
        prev.filter(v => v.voucher_id !== selectedRow.voucher_id)
      );

      setSelectedRow(null);
      
      alert("✅ Voucher cancelled successfully!");
      
   } catch (err) {
  console.error("Cancel error:", err);

  const message =
    err instanceof Error
      ? err.message
      : "Error cancelling voucher";

  alert(`❌ ${message}`);
}

  };




const handleUnapprove = async () => {
  if (!selectedRow || !selectedRow.voucher_id) {
    alert("Please select a valid voucher to unapprove");
    return;
  }

  try {
    const response = await fetch(
      `/api/cash-receipt-unapprove/${selectedRow.voucher_id}`,
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

    // Instead of manually updating state, just reload the page
    alert("Voucher unapproved successfully! Page will reload.");
    window.location.reload(); // This will reload the entire page
    
  } catch (err) {
    console.error("Unapprove error:", err);
    alert("Error unapproving voucher");
  }
};




const handleOnline = async () => {
  if (!selectedRow || selectedRow.status !== "APPROVED") {
    alert("❌ Only approved vouchers can go online!");
    return;
  }

  try {
    const voucherEndpoint = `/api/vouchers/cash-receipt/${selectedVoucherType.toLowerCase()}/${selectedRow.voucher_id}`;
    console.log("🔍 Fetching from:", voucherEndpoint);
    
    const voucherResp = await fetch(voucherEndpoint);
    const voucherText = await voucherResp.text();
    
    if (voucherText.trim().startsWith('<!DOCTYPE')) {
      console.error("❌ HTML response:", voucherText.substring(0, 500));
      alert("❌ Server error!");
      return;
    }
    
    const voucherJson = JSON.parse(voucherText);
    
    if (!voucherResp.ok || !voucherJson.success) {
      console.error("❌ Voucher fetch failed:", voucherJson);
      alert(`❌ Failed: ${voucherJson.message}`);
      return;
    }

    const voucher = voucherJson.data?.voucher;

    if (!voucher || !voucher.voucher_no) {
      console.error("❌ Invalid data:", voucherJson);
      alert("❌ Voucher data incomplete!");
      return;
    }

    const igpPayload = {
      master: {
        voucher_id: voucher.voucher_id,
        voucher_type: voucher.voucher_type,
        voucher_no: voucher.voucher_no,
        voucher_date: voucher.voucher_date,
        description: voucher.description || "",
        batch_id: voucher.batch_id || 0,
        created_by: voucher.created_by || 1,
        creation_date: voucher.creation_date || new Date().toISOString(),
        last_updated_by: voucher.last_updated_by || voucher.created_by || 1,
        last_update_date: voucher.last_update_date || new Date().toISOString(),
        status: voucher.status || "APPROVED",
        approved_by: voucher.approved_by || null,
        approval_date: voucher.approval_date || null,
        posted_by: voucher.posted_by || null,
        posting_date: voucher.posting_date || null,
        branch_id: voucher.branch_id || 1,
        module: voucher.module || "FINANCE",
        module_doc: voucher.module_doc || "",
        module_doc_id: voucher.module_doc_id || 0,
        reference_no: voucher.reference_no || "",
        cheked_by: voucher.cheked_by || null,
        checked_date: voucher.checked_date || null,
        currency: voucher.currency || "PKR",
        exchange_rate: voucher.exchange_rate || 1,
        fe_voucher: voucher.fe_voucher || "N",
        ref_date: voucher.ref_date || null,
        paid_amount: voucher.paid_amount || 0,
        last_updated_date: voucher.last_updated_date || new Date().toISOString(),
        acc_id: voucher.acc_id || null,
        canceled_by: voucher.canceled_by || null,
        canceled_date: voucher.canceled_date || null,
        closed: voucher.closed || "N",
        voucher_site: voucher.voucher_site || 1,
        sale_purchase: voucher.sale_purchase || "N",
        dc_igp_id: voucher.dc_igp_id || 0,
        bank_id: voucher.bank_id || null,
        wh_tax_id: voucher.wh_tax_id || null,
        wh_tax_amt: voucher.wh_tax_amt || 0,
        company_id: voucher.company_id || 1,
        cpv_type: voucher.cpv_type || voucher.voucher_type,
        customer_id: voucher.customer_id || null,
        customer_name: voucher.customer_name || ""
      },
      details: (voucher.accounts || []).map((d: any, i: number) => ({
        voucher_account_id: d.voucher_account_id || i + 1,
        voucher_id: voucher.voucher_id,
        account_id: d.account_id || d.final_account_id || 999999,
        debit: Number(d.debit) || 0,
        credit: Number(d.credit) || 0,
        naration: d.naration || "",
        created_by: d.created_by || voucher.created_by || 1,
        creation_date: d.creation_date || new Date().toISOString(),
        last_updated_by: d.last_updated_by || d.created_by || voucher.created_by || 1,
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
        payment_mode: d.payment_mode || (voucher.voucher_type === 'MBPV' || voucher.voucher_type === 'MBRV' ? "BANK" : "CASH"),
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

    console.log("🚀 Complete IGP Payload being sent:", JSON.stringify(igpPayload, null, 2));

    const igpResp = await fetch(
      "http://portal.sabirsgroup.com:8184/ords/sabroso_ords/wb/manual-vouchers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Origin": window.location.origin
        },
        body: JSON.stringify(igpPayload)
      }
    );

    const igpText = await igpResp.text();
    
    if (igpText.includes('<!DOCTYPE') || igpText.includes('<html')) {
      console.error("❌ IGP returned HTML error page");
      alert("❌ IGP server returned HTML error page. Status: " + igpResp.status);
      return;
    }

    let igpData;
    try {
      igpData = JSON.parse(igpText);
    } catch (e) {
      console.error("❌ Failed to parse IGP response as JSON:", e);
      alert("❌ IGP returned invalid JSON response");
      return;
    }

    if (igpData.res_status !== 2) {
      console.error("❌ IGP rejected:", igpData);
      alert(`❌ IGP rejected: ${igpData.res_message || "Unknown error"}`);
      return;
    }

    const onlineResp = await fetch(
      `/api/cash-receipt-online/${voucher.voucher_id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ONLINE" })
      }
    );

    if (!onlineResp.ok) {
      const errorText = await onlineResp.text();
      console.error("❌ Status update failed:", errorText);
      alert("⚠️ IGP succeeded but failed to update local status");
      return;
    }

    // ✅ FIXED: Success - show alert and refresh page with type preserved
    alert("✅ Voucher successfully moved ONLINE! Page will refresh...");
    
    // Wait 1.5 seconds before refreshing to show the success message
    setTimeout(() => {
      // Preserve the selected status in URL
      const params = new URLSearchParams(window.location.search);
      params.set('status', selectedStatus);
      if (remarksFilter) {
        params.set('remarks', remarksFilter);
      }
      
      // ✅ CRITICAL FIX: Preserve voucher type for CPM and all other types
      const currentVoucherType = selectedRow?.voucher_type || selectedVoucherType || vendorVoucherData.voucherType;
      params.set('type', currentVoucherType);
      
      // Also preserve month if needed
      if (selectedMonth) {
        params.set('month', selectedMonth);
      }
      
      // Reload with preserved parameters
      window.location.href = `${window.location.pathname}?${params.toString()}`;
    }, 1500);

  } catch (err) {
    console.error("❌ Online error:", err);
    alert("❌ Error while moving voucher online! Check console.");
  }
};









const fetchFreightItems = async (voucherId: number | string) => {
  console.log(`🔄 Fetching accounts for voucher ${voucherId}`);
  
  try {
    // Try to get from selectedRow first
    const selectedVoucher = freightVouchers.find(v => v.voucher_id === voucherId);
    
    if (selectedVoucher && selectedVoucher.accounts) {
      console.log(`✅ Using cached accounts from selectedVoucher`);
      const mappedAccounts = selectedVoucher.accounts.map((account: any, index: number) => ({
        voucher_account_id: account.voucher_account_id,
        voucher_id: account.voucher_id,
        party_account: account.vendor_id?.toString() || account.customer_id?.toString() || account.party_account || "",
        party: account.party_name || account.vendor_name || account.customer_name || account.account_desc || "",
        account_code: account.account_code || account.chart_of_account_code || "",
        account_id: account.account_id || account.chart_of_account_id || account.final_account_id || 0,
        account_desc: account.account_desc || account.account_name || account.description || "",
        vendor_name: account.vendor_name || "",
        customer_name: account.customer_name || "",
        debit: account.debit?.toString() || "",
        credit: account.credit?.toString() || "",
        naration: account.naration || account.narration || account.notation || "",
        notation: account.naration || account.narration || account.notation || "",
        vendor_id: account.vendor_id,
        customer_id: account.customer_id,
        cost_center: account.cost_desc || account.cost_center || account.cost_center_name || "",
        cost_center_id: account.cost_center_id,
        slip_no: account.slip_no || "",
        freight_amount: account.freight_amount?.toString() || "",
        item_id: account.item_id,
        item_desc: account.item_desc || "",
        wb_id: account.wb_id,
        // ✅ FIX: Add more fallbacks for sub_acc_code
        sub_acc_code: account.sub_account_code || account.sub_acc_code || account.subAccountCode || account.sub_account || "",
        _original: account
      }));
      
      console.log(`✅ Mapped ${mappedAccounts.length} accounts with fields:`, 
        mappedAccounts.map(acc => ({
          account_code: acc.account_code,
          account_desc: acc.account_desc,
          sub_acc_code: acc.sub_acc_code,  // Debug this
          cost_center: acc.cost_center,    // Debug this
          cost_center_id: acc.cost_center_id,
          debit: acc.debit,
          credit: acc.credit,
          naration: acc.naration
        }))
      );
      
      return mappedAccounts;
    }
    
    // If not in cache, fetch from API
    console.log(`📡 Fetching from API for voucher ${voucherId}`);
    const response = await fetch(`/api/vouchers/${voucherId}/accounts`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch accounts: ${response.status}`);
    }
    
    const accountsData = await response.json();
    console.log("📊 Raw accounts data from API:", accountsData);
    
    return accountsData.map((acc: any, index: number) => ({
      voucher_account_id: acc.voucher_account_id,
      voucher_id: acc.voucher_id,
      party_account: acc.vendor_id?.toString() || acc.customer_id?.toString() || acc.party_account || "",
      party: acc.party_name || acc.vendor_name || acc.customer_name || acc.account_desc || "",
      account_code: acc.account_code || acc.chart_of_account_code || "",
      account_id: acc.account_id || acc.chart_of_account_id || acc.final_account_id || 0,
      account_desc: acc.account_desc || acc.account_name || acc.description || "",
      vendor_name: acc.vendor_name || "",
      customer_name: acc.customer_name || "",
      debit: acc.debit?.toString() || "",
      credit: acc.credit?.toString() || "",
      naration: acc.naration || acc.narration || acc.notation || "",
      notation: acc.naration || acc.narration || acc.notation || "",
      vendor_id: acc.vendor_id,
      customer_id: acc.customer_id,
      // ✅ FIX: Add more fallbacks for cost center
      cost_center: acc.cost_desc || acc.cost_center || acc.cost_center_name || acc.cost_center_code || "",
      cost_center_id: acc.cost_center_id,
      slip_no: acc.slip_no || "",
      freight_amount: acc.freight_amount?.toString() || "",
      item_id: acc.item_id,
      item_desc: acc.item_desc || "",
      wb_id: acc.wb_id,
      // ✅ FIX: Add more fallbacks for sub_acc_code
      sub_acc_code: acc.sub_account_code || acc.sub_acc_code || acc.subAccountCode || acc.sub_account || "",
      _original: acc
    }));
    
  } catch (error) {
    console.error("❌ Error fetching accounts:", error);
    return [];
  }
};


// ✅ NEW: Handle Edit button click
const handleEdit = async () => {
  if (!selectedRow || !selectedRow.voucher_id) {
    alert("Please select a voucher to edit");
    return;
  }

  // Check if voucher can be edited
  if (selectedRow.status === "ONLINE" || selectedRow.status === "CANCELLED") {
    alert(`Cannot edit ${selectedRow.status} voucher`);
    return;
  }

  try {
    setIsLoadingAccounts(true);
    
    // Fetch complete voucher data
    const voucherData = await fetchVoucherForEdit(selectedRow.voucher_id);
    
    if (!voucherData) {
      alert("Failed to load voucher data for editing");
      return;
    }

    // Populate form with voucher master data
setVendorVoucherData({
  vendorNo: voucherData.voucher_no || "",
vendorDate: voucherData.voucher_date
  ? (() => {
      const d = new Date(voucherData.voucher_date);

      // ✅ add hours instead of day
      d.setHours(d.getHours() + 5);   // Pakistan = UTC+5 (adjust if needed)

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");

      return `${y}-${m}-${day}`;
    })()
  : new Date().toISOString().split("T")[0],

  // ... rest of the code
      voucherType: voucherData.voucher_type || selectedVoucherType,
      vendorName: voucherData.account_name || `${voucherData.account_code || ""} - ${voucherData.account_desc || ""}`,
      cashAmount: voucherData.paid_amount || 0,
      referenceNo: voucherData.reference_no || "",
      customers: voucherData.customer_name || "",
      currency: voucherData.currency || "PKR",
      exchangeRate: voucherData.exchange_rate || 1,
      accountBalance: 0,
      description: voucherData.description || voucherData.entry_remarks || "",
      company: "Multan Feed",
      branch: voucherData.branch_name || "1",
      customerId: voucherData.customer_id || null,
      customerName: voucherData.customer_name || "",
      createdBy: voucherData.created_by || 1,
      acc_id: voucherData.acc_id || 0,
      month: voucherData.voucher_date 
        ? new Date(voucherData.voucher_date).toISOString().slice(0, 7)
        : new Date().toISOString().slice(0, 7),
      account_code: voucherData.account_code || "",
      account_desc: voucherData.account_desc || ""
    });

    // Populate account rows
    const accounts = await fetchFreightItems(selectedRow.voucher_id);
    
    if (accounts && accounts.length > 0) {
      // Map accounts to localRowValues format
      const mappedRows = [...localRowValues];
      
      accounts.forEach((acc: any, index: number) => {
        if (index < mappedRows.length) {
          mappedRows[index] = {
            ...mappedRows[index],
            party_account: acc.vendor_id?.toString() || acc.customer_id?.toString() || "",
            party: acc.party || acc.vendor_name || acc.customer_name || "",
            account_code: acc.account_code || "",
            account_id: acc.account_id || 0,
            description: acc.account_desc || "",
            sub_acc_code: acc.sub_acc_code || "",
            debit: acc.debit?.toString() || "",
            credit: acc.credit?.toString() || "",
            notation: acc.naration || acc.notation || "",
            cost_center_id: acc.cost_center_id || null,
            cost_center: acc.cost_center || "",
            slip_no: acc.slip_no || "",
            freight_amount: acc.freight_amount?.toString() || "",
            item_id: acc.item_id || null,
            item_code: acc.item_code || "",
            item_desc: acc.item_desc || "",
            wb_id: acc.wb_id || null,
            customer_id: acc.customer_id || null,
            vendor_id: acc.vendor_id || null,
            checked: true,
            checkedC: voucherData.voucher_type === 'FFCPV' && acc.slip_no ? true : false,
            checkedG: voucherData.voucher_type === 'FFCPV' && acc.wb_id ? true : false,
            checkedI: (voucherData.voucher_type === 'MBPV' || voucherData.voucher_type === 'MCPV') && acc.item_id ? true : false
          };
        }
      });
      
      setLocalRowValues(mappedRows);
      setFreightItems(accounts);
      setLocalFormItems(accounts);
    }

    // Show the form in edit mode
    setIsEditMode(true);
    setIsAddVoucherMode(false);
    setShowVendorVoucherForm(true);
    
    console.log("✅ Edit mode activated for voucher:", selectedRow.voucher_id);
    
  } catch (error) {
    console.error("❌ Error loading voucher for edit:", error);
    alert("Failed to load voucher data for editing. Please try again.");
  } finally {
    setIsLoadingAccounts(false);
  }
};



// ✅ NEW: Reset edit mode
const resetEditMode = () => {
  setIsEditMode(false);
  setEditingWbId(null);
  setShowVendorVoucherForm(false);
  setSelectedVoucherIds([]);
  setSelectedRow(null);
  setSelectedFreightId(null);
  setFreightItems([]);
  setLocalFormItems([]);
  
  // Reset form data
  setVendorVoucherData(prev => ({
    ...prev,
    vendorNo: "",
    description: "",
    referenceNo: "",
    vendorDate: new Date().toISOString().split('T')[0],
    vendorName: "60101-0002 - CASH AT MILL",
    account_code: "60101-0002",
    account_desc: "CASH AT MILL"
  }));
  
  // Reset rows
  setLocalRowValues(prev => prev.map((row, index) => ({
    ...row,
    id: `new-row-${index}`,
    checked: false,
    checkedC: false,
    checkedG: false,
    checkedI: false,
    party_account: "",
    party: "",
    account_code: "",
    account_id: 0,
    description: "",
    sub_acc_code: "",
    debit: "",
    credit: "",
    notation: "",
    cost_center: "",
    cost_center_id: null,
    slip_no: "",
    freight_amount: "",
    item_id: null,
    item_code: "",
    item_desc: "",
    wb_id: null,
    vendor_id: null,
    customer_id: null
  })));
};



// ✅ NEW: Update existing voucher
const updateVendorVoucher = async () => {
  // ✅ Prevent multiple simultaneous updates
  if (isSavingVoucher) {
    console.log("⚠️ Update already in progress, ignoring duplicate click");
    return;
  }
  
  try {
    setIsSavingVoucher(true);
    
    // ✅ Force a re-render before proceeding
    await new Promise(resolve => setTimeout(resolve, 50));

    console.log("🚀 START updateVendorVoucher");
    console.log("📋 Updating voucher type:", vendorVoucherData.voucherType);
    console.log("📋 Voucher ID:", selectedRow?.voucher_id);

    if (!selectedRow?.voucher_id) {
      alert("No voucher selected for update");
      setIsSavingVoucher(false);
      return;
    }

    // ========================================
    // 1) VOUCHER HEADER (MASTER) PAYLOAD
    // ========================================
    const voucherPayload = {
      voucherId: selectedRow.voucher_id,
      voucherDate: vendorVoucherData.vendorDate,
      voucherNo: vendorVoucherData.vendorNo,
      voucherType: vendorVoucherData.voucherType,
      remarks: vendorVoucherData.description,
      createdBy: vendorVoucherData.createdBy || 1,
      currency: vendorVoucherData.currency,
      exchangeRate: vendorVoucherData.exchangeRate,
      cashAmount: vendorVoucherData.cashAmount,
      customerId: vendorVoucherData.customerId,
      acc_id: vendorVoucherData.acc_id,
      userId: vendorVoucherData.createdBy || 1
    };

    console.log("📤 UPDATE VOUCHER HEADER PAYLOAD:", voucherPayload);

    // ========================================
    // 2) ACCOUNTS PREPARATION
    // ========================================
    const extractAccountIdFromCode = (accountCode: string | undefined) => {
      if (!accountCode) return 0;
      if (/^\d+$/.test(accountCode)) return parseInt(accountCode, 10);
      const match = accountCode.match(/\d+/g);
      return match && match[0] ? parseInt(match[0], 10) : 0;
    };

    const accounts = localRowValues
      .filter((row) => {
        const debitValue = parseFloat(row.debit || "0");
        const creditValue = parseFloat(row.credit || "0");
        const hasAmount = debitValue > 0 || creditValue > 0;
        const hasAccountCode = row.account_code && row.account_code.trim() !== "";
        const hasAccountId = row.account_id && row.account_id > 0;
        const hasAccountIdentifier = hasAccountCode || hasAccountId;

        if (hasAmount && hasAccountIdentifier) return true;
        if (row.checked || row.checkedC || row.checkedG || row.checkedI) return true;
        return false;
      })
      .map((row) => {
        let accountId = row.account_id;
        if (!accountId || accountId === 0) {
          accountId = extractAccountIdFromCode(row.account_code);
        }

        const vendorId = row.party_account ? parseInt(row.party_account, 10) || null : null;
        
        let narrationText = row.notation || vendorVoucherData.description || "";
        if (vendorVoucherData.voucherType === "FFCPV" && row.slip_no) {
          narrationText = row.notation || `SLIP# ${row.slip_no}`;
        }

        return {
          accountId,
          vendorId,
          customerId: vendorVoucherData.customerId || row.customer_id || null,
          debit: parseFloat(row.debit || "0") || 0,
          credit: parseFloat(row.credit || "0") || 0,
          naration: narrationText,
          referenceId: null,
          subAccountCode: row.sub_acc_code || null,
          cost_center_id: row.cost_center_id ?? null,
          slip_no: row.slip_no || null,
          item_id: row.item_id || null,
          wb_id: row.wb_id || null
        };
      });

    if (accounts.length === 0) {
      alert("Please enter at least one account with debit or credit amount");
      setIsSavingVoucher(false);
      return;
    }

    const totalDebit = accounts.reduce((sum, acc) => sum + (acc.debit || 0), 0);
    const totalCredit = accounts.reduce((sum, acc) => sum + (acc.credit || 0), 0);

    // ========================================
    // 3) CONFIRM BEFORE UPDATE
    // ========================================
    const shouldProceed = window.confirm(
      `Update Voucher?\n\n` +
      `Voucher Type: ${vendorVoucherData.voucherType}\n` +
      `Voucher No: ${vendorVoucherData.vendorNo}\n` +
      `Voucher ID: ${selectedRow.voucher_id}\n` +
      `Total Debit: ${totalDebit.toFixed(2)}\n` +
      `Total Credit: ${totalCredit.toFixed(2)}\n` +
      `Number of Accounts: ${accounts.length}\n\n` +
      `Click OK to proceed with update.`
    );

    if (!shouldProceed) {
      console.log("❌ Update cancelled by user");
      setIsSavingVoucher(false);
      return;
    }

    // ========================================
    // 4) CALL UPDATE API
    // ========================================
    const updatePayload = {
      ...voucherPayload,
      accounts
    };

    console.log("📤 UPDATE API PAYLOAD:", updatePayload);

    const response = await fetch("/api/vouchers/cash-receipt/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePayload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || "Update failed");
    }

    console.log("✅ Update successful:", result);

    // ========================================
    // 5) ASK FOR BALANCE (OPTIONAL)
    // ========================================
    const shouldBalance = window.confirm(
      `✅ Voucher Updated Successfully!\n\n` +
      `Voucher ID: ${selectedRow.voucher_id}\n` +
      `Voucher No: ${vendorVoucherData.vendorNo}\n` +
      `Accounts Updated: ${result.updatedAccounts || accounts.length}\n\n` +
      `Do you want to balance this voucher now?`
    );

    if (shouldBalance) {
      let balanceAccountId = 203; // Default for all types
      
      // ✅ ONLY FOR MBPV - try to get selected cash account
      if (vendorVoucherData.voucherType === 'MBPV') {
        if (vendorVoucherData.acc_id && vendorVoucherData.acc_id > 0) {
          balanceAccountId = vendorVoucherData.acc_id;
        } else if (accounts.length > 0 && accounts[0].accountId) {
          balanceAccountId = accounts[0].accountId;
        }
      } else {
        // For other voucher types, try to use master account
        if (vendorVoucherData.acc_id && vendorVoucherData.acc_id > 0) {
          balanceAccountId = vendorVoucherData.acc_id;
        } else if (accounts.length > 0 && accounts[0].accountId) {
          balanceAccountId = accounts[0].accountId;
        }
      }
      
      let balanceNarration = vendorVoucherData.description || "";
      if (accounts.length > 0 && accounts[0].naration) {
        balanceNarration = accounts[0].naration || balanceNarration;
      }

      const queryString =
        `voucher_id=${encodeURIComponent(selectedRow.voucher_id)}` +
        `&voucher_type_desc=${encodeURIComponent(vendorVoucherData.voucherType)}` +
        `&account_id=${encodeURIComponent(balanceAccountId)}` +
        `&narration=${encodeURIComponent(balanceNarration)}` +
        `&user_id=${encodeURIComponent(vendorVoucherData.createdBy || 1)}`;

      try {
        const balanceResponse = await fetch(`/api/vouchers/balance?${queryString}`);
        const balanceResult = await balanceResponse.json();

        if (balanceResult?.success) {
          alert(
            `✅ Voucher Balanced Successfully!\n\n` +
            `Voucher #${selectedRow.voucher_id} has been balanced using account ID: ${balanceAccountId}.`
          );
        } else {
          alert(`⚠️ Voucher updated but balance failed: ${balanceResult?.message || "Unknown error"}`);
        }
      } catch (balanceErr) {
        console.error("❌ Balance API error:", balanceErr);
        alert("⚠️ Voucher updated but error occurred during balancing.");
      }
    }
    
    // ========================================
    // 6) RESET FORM AND REFRESH
    // ========================================
    alert(`✅ Voucher #${vendorVoucherData.vendorNo} updated successfully!`);
    
    // Close form
    setShowVendorVoucherForm(false);
    setIsEditMode(false);
    setIsAddVoucherMode(false);
    
    // Reset selections
    setSelectedVoucherIds([]);
    setSelectedRow(null);
    setSelectedFreightId(null);
    
    // Reset form data
    setVendorVoucherData(prev => ({
      ...prev,
      vendorNo: "",
      description: "",
      referenceNo: "",
      vendorName: "60101-0002 - CASH AT MILL",
      vendorDate: new Date().toISOString().split('T')[0]
    }));
    
    // Reset rows
    setLocalRowValues(prev => prev.map((row, index) => ({
      ...row,
      id: `new-row-${index}`,
      debit: "",
      credit: "",
      account_code: "",
      account_id: 0,
      description: "",
      notation: "",
      party: "",
      party_account: "",
      checked: false,
      checkedC: false,
      checkedG: false,
      checkedI: false,
      slip_no: "",
      freight_amount: "",
      item_id: null,
      wb_id: null
    })));
    
    setFreightItems([]);
    setLocalFormItems([]);
    
    // Refresh vouchers list
    await fetchFreightVouchers();
    
  } catch (error) {
    console.error("❌ UPDATE ERROR:", error);
    alert(`Update failed: ${(error as Error).message}`);
  } finally {
    setIsSavingVoucher(false);
  }
};






const handleCheckboxChangeMain = async (
  event: React.ChangeEvent<HTMLInputElement>,
  voucher: any
) => {
  console.log("✅ Checkbox clicked for voucher:", voucher);
  
  if (event.target.checked) {
    setSelectedVoucherIds((prev) => [...prev, voucher.voucher_id]);
    setSelectedRow(voucher);
    setSelectedFreightId(voucher.voucher_id);
    
    setIsLoadingAccounts(true);
    setFreightItems([]);

    try {
      console.log("🔄 Fetching accounts for voucher ID:", voucher.voucher_id);
      const accounts = await fetchFreightItems(voucher.voucher_id);
      
      console.log(`✅ Loaded ${accounts.length} accounts for viewing`);
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


// ✅ Helper function to preload freight slips for edit mode
const preloadFreightSlipsForEdit = async (customerId: string) => {
  try {
    console.log(`🔄 Preloading freight slips for customer: ${customerId}`);
    const slips = await fetchUnpaidFreightSlips(customerId.toString(), 50);
    setFreightSlips(slips);
    console.log(`✅ Preloaded ${slips.length} freight slips for edit`);
    return slips;
  } catch (error) {
    console.error("❌ Error preloading freight slips:", error);
    return [];
  }
};


  const handleVendorVoucherChange = (field: string, value: any) => {
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

  
  useEffect(() => {
  // Prevent double-clicks on save buttons globally
  const handleGlobalClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const saveButton = target.closest('button');
    
    if (saveButton && 
        (saveButton.textContent?.includes('Save') || 
         saveButton.textContent?.includes('Update')) &&
        isSavingVoucher) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  
  document.addEventListener('click', handleGlobalClick, true);
  return () => document.removeEventListener('click', handleGlobalClick, true);
}, [isSavingVoucher]);

useEffect(() => {
  // When description or referenceNo changes, auto-fill narration
  const description = vendorVoucherData.description || '';
  const referenceNo = vendorVoucherData.referenceNo || '';
  
  if (description && vendorVoucherData.voucherType !== 'FFCPV') {
    const updatedRows = [...localRowValues];
    
    const baseFormat = referenceNo 
      ? `${description} cheque #${referenceNo}`
      : `${description} cheque #`;
    
    updatedRows.forEach((row, index) => {
      // Skip rows that already have FFCPV slip narration
      if (row.notation && row.notation.includes('SLIP#')) {
        return;
      }
      
      // FOR MCPV/MBPV: Only update ACTIVE row
      if (vendorVoucherData.voucherType === 'MCPV' || vendorVoucherData.voucherType === 'MBPV') {
        if (index === activeRowIndex) {
          // Active row gets the auto-filled narration
          updatedRows[index] = {
            ...row,
            notation: baseFormat
          };
        }
        return;
      }
      
      // For other voucher types
      const currentNotation = row.notation || "";
      const hasUserAddition = currentNotation.includes('[') && currentNotation.includes(']');
      
      if (!currentNotation || 
          currentNotation.startsWith(description) || 
          !hasUserAddition) {
        
        updatedRows[index] = {
          ...row,
          notation: baseFormat
        };
      }
    });
    
    setLocalRowValues(updatedRows);
  }
}, [vendorVoucherData.description, vendorVoucherData.referenceNo, activeRowIndex]); // Added activeRowIndex dependency


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
  if (showVendorVoucherForm) {
    // Closing form - check if in edit mode
    if (isEditMode) {
      resetEditMode();
    } else {
      setShowVendorVoucherForm(false);
      setIsAddVoucherMode(false);
    }
  } else {
    // Opening form for new voucher
    setIsEditMode(false);
    setIsAddVoucherMode(true);
    setShowVendorVoucherForm(true);
    
    const currentDate = new Date().toISOString().split('T')[0];
    
    // ✅ For MBPV, don't set default account - let user select
    const isMBPV = selectedVoucherType === 'MBPV';
    
    setVendorVoucherData({
      vendorNo: "",
      vendorDate: currentDate,
      voucherType: selectedVoucherType,
      vendorName: isMBPV ? "" : "60101-0002 - CASH AT MILL", // Empty for MBPV
      cashAmount: 0,
      referenceNo: "",
      customers: "",
      currency: "PKR",
      exchangeRate: 1,
      description: "",
      accountBalance: 0,
      company: "Multan Feed",
      branch: "",
      customerId: null,
      customerName: "",
      createdBy: null,
      acc_id: 0, // Start with 0 for MBPV
      month: new Date().toISOString().slice(0, 7),
      account_code: isMBPV ? "" : "60101-0002", // Empty for MBPV
      account_desc: isMBPV ? "" : "CASH AT MILL" // Empty for MBPV
    });
    
    // Fetch next voucher number
    fetchNextVoucherNo(selectedVoucherType, currentDate).then(nextNo => {
      setVendorVoucherData(prev => ({ ...prev, vendorNo: nextNo }));
    });
    
    // Reset rows
    setLocalRowValues(prev => prev.map((row, index) => ({
      ...row,
      id: `new-row-${index}`,
      checked: false,
      checkedC: false,
      checkedG: false,
      checkedI: false,
      party_account: "",
      party: "",
      account_code: "",
      account_id: 0,
      description: "",
      sub_acc_code: "",
      debit: "",
      credit: "",
      notation: "",
      cost_center: "",
      cost_center_id: null,
      slip_no: "",
      freight_amount: "",
      item_id: null,
      item_code: "",
      item_desc: "",
      wb_id: null,
      vendor_id: null,
      customer_id: null
    })));
  }
};

const fetchMasterAccounts = async (
  voucherType: string, 
  searchTerm: string = "", 
  limit: number = 50000
): Promise<any[]> => {
  try {
    setIsLoadingAccounts(true);
    
    let url = `/api/master-accounts-lov?voucher_type=${encodeURIComponent(voucherType)}`;
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
    if (limit) url += `&limit=${limit}`;
    
    console.log(`📡 Fetching master accounts from: ${url}`);
    
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      
      // ✅ ENSURE each account has proper ID and code
      const validatedData = data.map((account: any) => ({
        ...account,
        chart_of_account_id: account.chart_of_account_id || account.id || 0,
        chart_of_account_code: account.chart_of_account_code || account.account_code || "",
        description: account.description || account.account_desc || "",
        // ✅ Also keep original fields for compatibility
        account_code: account.chart_of_account_code || account.account_code || "",
        account_desc: account.description || account.account_desc || "",
        id: account.chart_of_account_id || account.id || 0
      }));
      
      // ✅ IMPORTANT: For MBPV, make sure we return the correct account type
      if (voucherType === 'MBPV') {
        console.log(`📡 MBPV: Filtering bank/cash accounts...`);
        // The API should return appropriate bank/cash accounts
      }
      
      console.log(`✅ Fetched ${validatedData.length} master accounts for ${voucherType}`);
      console.log("📋 First account structure:", validatedData[0]);
      
      return validatedData;
    } else {
      console.error("❌ Failed to fetch master accounts:", response.status);
      return [];
    }
  } catch (error) {
    console.error("❌ Error fetching master accounts:", error);
    return [];
  } finally {
    setIsLoadingAccounts(false);
  }
};


const saveVendorVoucher = async () => {
  // ✅ Prevent multiple simultaneous saves
  if (isSavingVoucher) {
    console.log("⚠️ Save already in progress, ignoring duplicate click");
    return;
  }
  
  try {
    setIsSavingVoucher(true);
    
    // ✅ Force a re-render before proceeding
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // ✅ DEBUG: Log master account data before saving
    console.log("🔍 SAVING VOUCHER - Master Account Data:", {
      acc_id: vendorVoucherData.acc_id,
      account_code: vendorVoucherData.account_code,
      account_desc: vendorVoucherData.account_desc,
      vendorName: vendorVoucherData.vendorName,
      voucherType: vendorVoucherData.voucherType,
      voucherNo: vendorVoucherData.vendorNo
    });

    // ✅ CRITICAL FIX FOR MBPV: Use user-selected account directly, don't override with 203
    let finalAccId = vendorVoucherData.acc_id;
    
    // ✅ For MBPV, we should NOT default to CASH AT MILL (60101-0002)
    // Instead, use exactly what the user selected
    if (vendorVoucherData.voucherType === 'MBPV') {
      // For MBPV, we REQUIRE user to select a bank/cash account
      if (!finalAccId || finalAccId === 0) {
        console.error("❌ MBPV: No cash account selected by user!");
        alert("Please select a Cash/Bank Account from the Cash Account field before saving!");
        setIsSavingVoucher(false);
        return;
      }
      
      console.log(`✅ MBPV: Using user-selected account ID: ${finalAccId} (${vendorVoucherData.account_code} - ${vendorVoucherData.account_desc})`);
    }
    
    // Only apply CASH AT MILL fallback for non-MBPV voucher types
    if (vendorVoucherData.voucherType !== 'MBPV') {
      // If account code is 60101-0002 but acc_id is 0 or missing, try to find it
      if ((vendorVoucherData.account_code === "60101-0002" || vendorVoucherData.vendorName?.includes("60101-0002")) && 
          (!finalAccId || finalAccId === 0)) {
        console.log("⚠️ CASH AT MILL selected but acc_id missing, searching for account ID...");
        
        // Try to find from accountsList first
        let cashAccount = accountsList.find(acc => 
          acc.chart_of_account_code === "60101-0002" || 
          acc.account_code === "60101-0002" ||
          acc.chart_of_account_code?.includes("60101-0002")
        );
        
        // If not found in accountsList, fetch directly from API
        if (!cashAccount) {
          try {
            const response = await fetch("/api/chart-of-accounts?search=60101-0002&limit=10");
            if (response.ok) {
              const accounts = await response.json();
              cashAccount = accounts.find((acc: any) => 
                acc.chart_of_account_code === "60101-0002" || 
                acc.account_code === "60101-0002"
              );
            }
          } catch (error) {
            console.error("Failed to fetch CASH AT MILL account:", error);
          }
        }
        
        if (cashAccount) {
          finalAccId = cashAccount.chart_of_account_id || cashAccount.id || 0;
          console.log(`✅ Found CASH AT MILL account ID: ${finalAccId}`);
          
          // Also update the state for future use
          setVendorVoucherData(prev => ({
            ...prev,
            acc_id: finalAccId
          }));
        } else {
          console.warn("⚠️ Could not find CASH AT MILL account ID, using fallback 0");
        }
      }
    }

    // ✅ VALIDATION: Check if acc_id is set for voucher types that require it
    const voucherTypesRequiringAccId = ['MCRV', 'MCPV', 'MBPV', 'MBRV', 'FFCPV'];
    if (voucherTypesRequiringAccId.includes(vendorVoucherData.voucherType) && (!finalAccId || finalAccId === 0)) {
      console.warn("⚠️ Warning: acc_id is 0 or missing for voucher type:", vendorVoucherData.voucherType);
      
      // For MBPV, this is critical - show stronger warning
      if (vendorVoucherData.voucherType === 'MBPV') {
        alert(`ERROR: No Cash Account selected for ${vendorVoucherData.voucherType}!\n\nPlease select a Cash/Bank Account from the Cash Account field before saving.`);
        setIsSavingVoucher(false);
        return;
      }
      
      const continueAnyway = window.confirm(
        `Warning: No cash account selected for ${vendorVoucherData.voucherType}.\n\n` +
        `The voucher will be saved without a master account ID.\n\n` +
        `Do you want to continue?`
      );
      if (!continueAnyway) {
        setIsSavingVoucher(false);
        return;
      }
    }

    // ========================================
    // 1) VOUCHER HEADER (MASTER) PAYLOAD
    // ========================================
    const voucherPayload = {
      voucherDate: vendorVoucherData.vendorDate,
      voucherNo: vendorVoucherData.vendorNo,
      voucherType: vendorVoucherData.voucherType,
      company_name: vendorVoucherData.company || "Multan Feed",
      branch: vendorVoucherData.branch || "1",
      customerId: vendorVoucherData.customerId || null,
      currency: vendorVoucherData.currency || "PKR",
      exchangeRate: vendorVoucherData.exchangeRate || 1,
      cashAmount: vendorVoucherData.cashAmount || 0,
      remarks: vendorVoucherData.description || "",
      createdBy: vendorVoucherData.createdBy || 1,
      // ✅ CRITICAL FIX: Use finalAccId (user-selected for MBPV, or CASH AT MILL for others)
      acc_id: finalAccId && finalAccId > 0 ? finalAccId : 0,
      // ✅ For MBPV, use the user-selected account details, not hardcoded CASH AT MILL
      account_code: vendorVoucherData.voucherType === 'MBPV' 
        ? vendorVoucherData.account_code 
        : (vendorVoucherData.account_code || "60101-0002"),
      account_desc: vendorVoucherData.voucherType === 'MBPV'
        ? vendorVoucherData.account_desc
        : (vendorVoucherData.account_desc || "CASH AT MILL"),
      // ✅ ALSO SEND as account_id if backend expects that
      account_id: finalAccId && finalAccId > 0 ? finalAccId : 0
    };

    console.log("📤 VOUCHER HEADER PAYLOAD:", JSON.stringify(voucherPayload, null, 2));

    // ========================================
    // 2) CUSTOMER ACCOUNTS PREPARATION
    // ========================================
    const extractAccountIdFromCode = (accountCode: string | undefined) => {
      if (!accountCode) return 0;
      if (/^\d+$/.test(accountCode)) return parseInt(accountCode, 10);
      const match = accountCode.match(/\d+/g);
      return match && match[0] ? parseInt(match[0], 10) : 0;
    };

    const customerAccounts = localRowValues
      .filter((row) => {
        const debitValue = parseFloat(row.debit || "0");
        const creditValue = parseFloat(row.credit || "0");
        const hasAmount = debitValue > 0 || creditValue > 0;
        const hasAccountCode = row.account_code && row.account_code.trim() !== "";
        const hasAccountId = row.account_id && row.account_id > 0;
        const hasAccountIdentifier = hasAccountCode || hasAccountId;

        if (hasAmount && hasAccountIdentifier) return true;
        if (row.checked || row.checkedC || row.checkedG || row.checkedI) return true;
        return false;
      })
      .map((row, index) => {
        let accountId = row.account_id;
        if (!accountId || accountId === 0) {
          accountId = extractAccountIdFromCode(row.account_code);
        }

        const vendorId = row.party_account ? parseInt(row.party_account, 10) || null : null;

        let narrationText = row.notation || vendorVoucherData.description || "";
        if (vendorVoucherData.voucherType === "FFCPV" && row.slip_no) {
          narrationText = row.notation || `SLIP# ${row.slip_no}`;
        }

        return {
          accountId,
          vendorId,
          customerId: vendorVoucherData.customerId || row.customer_id || null,
          debit: parseFloat(row.debit || "0") || 0,
          credit: parseFloat(row.credit || "0") || 0,
          naration: narrationText,
          referenceId: null,
          subAccountCode: row.sub_acc_code || null,
          branchId: vendorVoucherData.branch || "1",
          cost_center_id: row.cost_center_id ?? null,
          slip_no: row.slip_no || null,
          item_id: row.item_id || null,
          wb_id: row.wb_id || null,
          rowIndex: index,
        };
      });

    if (customerAccounts.length === 0) {
      alert("Please enter at least one account with debit or credit amount");
      setIsSavingVoucher(false);
      return;
    }

    const allAccounts = [...customerAccounts];
    const totalDebit = allAccounts.reduce((sum, acc) => sum + (acc.debit || 0), 0);
    const totalCreditAll = allAccounts.reduce((sum, acc) => sum + (acc.credit || 0), 0);

    console.log("📊 Account Summary:", {
      accountCount: allAccounts.length,
      totalDebit,
      totalCreditAll,
      hasMasterAccountId: voucherPayload.acc_id > 0,
      masterAccountId: voucherPayload.acc_id
    });

    // ========================================
    // 3) SAVE VOUCHER HEADER
    // ========================================
    const voucherResponse = await fetch("/api/vouchers/cash-receipt/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(voucherPayload),
    });

    if (!voucherResponse.ok) {
      const text = await voucherResponse.text();
      console.error("❌ VOUCHER SAVE FAILED:", text);
      alert("Voucher save failed: " + text);
      setIsSavingVoucher(false);
      return;
    }

    const voucherDataResp = await voucherResponse.json();
    const voucherId = voucherDataResp?.voucher_id;

    if (!voucherId) {
      console.error("❌ No voucher ID returned:", voucherDataResp);
      alert("Voucher save failed (no voucher ID returned)");
      setIsSavingVoucher(false);
      return;
    }

    console.log(`✅ Voucher header saved with ID: ${voucherId}, acc_id: ${voucherPayload.acc_id}`);

    // ========================================
    // 4) SAVE ACCOUNTS (DETAILS)
    // ========================================
    const accountsForApi = allAccounts.map(({ rowIndex, ...rest }) => rest);

    const accountsPayload = {
      voucherId,
      accounts: accountsForApi,
      userId: vendorVoucherData.createdBy || 1,
    };

    const accResponse = await fetch("/api/vouchers/cash-receipt/save-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(accountsPayload),
    });

    if (!accResponse.ok) {
      const text = await accResponse.text();
      console.error("❌ ACCOUNTS SAVE FAILED:", text);
      alert("Accounts save failed: " + text);
      setIsSavingVoucher(false);
      return;
    }

    console.log(`✅ Accounts saved for voucher ID: ${voucherId}`);

    // ========================================
    // 5) SUCCESS MESSAGE
    // ========================================
    alert(
      `✅ Voucher Saved Successfully!\n\n` +
      `Voucher ID: ${voucherId}\n` +
      `Voucher Type: ${vendorVoucherData.voucherType}\n` +
      `Voucher No: ${vendorVoucherData.vendorNo}\n` +
      `Master Account ID: ${voucherPayload.acc_id || 'None'}\n` +
      `Total Debit: ${totalDebit.toFixed(2)}\n` +
      `Total Credit: ${totalCreditAll.toFixed(2)}\n` +
      `Accounts: ${allAccounts.length}`
    );

    // ========================================
    // 6) ASK FOR BALANCE (OPTIONAL)
    // ========================================
    // ========================================
// 6) ASK FOR BALANCE (OPTIONAL)
// ========================================
const shouldBalance = window.confirm(
  `✅ Voucher Saved Successfully!\n\n` +
  `Voucher ID: ${voucherId}\n` +
  `Voucher Type: ${vendorVoucherData.voucherType}\n` +
  `Number of Accounts: ${allAccounts.length}\n\n` +
  `Do you want to automatically balance this voucher now?`
);

let balanceWasSuccessful = false;

if (shouldBalance) {
  let balanceAccountId;
  
  // ✅ FOR MBPV - ALWAYS use the user-selected cash account (never 203)
  if (vendorVoucherData.voucherType === 'MBPV') {
    // MBPV MUST use the selected cash account
    if (finalAccId && finalAccId > 0) {
      balanceAccountId = finalAccId;
      console.log(`✅ MBPV using user-selected cash account for balance: ${balanceAccountId} (${vendorVoucherData.account_code})`);
    } else if (vendorVoucherData.acc_id && vendorVoucherData.acc_id > 0) {
      balanceAccountId = vendorVoucherData.acc_id;
      console.log(`✅ MBPV using vendorVoucherData.acc_id for balance: ${balanceAccountId}`);
    } else {
      // This should not happen due to validation above, but just in case
      console.error("❌ MBPV: No cash account available for balance!");
      alert("ERROR: Cannot balance MBPV voucher - no cash account selected!");
      setIsSavingVoucher(false);
      return;
    }
  } else {
    // For MCRV, MCPV, MBRV, FFCPV - use the master account if available, otherwise default to 203
    if (finalAccId && finalAccId > 0) {
      balanceAccountId = finalAccId;
      console.log(`✅ Using master account for balance: ${balanceAccountId}`);
    } else if (vendorVoucherData.acc_id && vendorVoucherData.acc_id > 0) {
      balanceAccountId = vendorVoucherData.acc_id;
      console.log(`✅ Using vendorVoucherData.acc_id for balance: ${balanceAccountId}`);
    } else {
      balanceAccountId = 203;
      console.log(`⚠️ Using default account 203 for balance (${vendorVoucherData.voucherType})`);
    }
  }
  
  let balanceNarration = vendorVoucherData.description || "";
  if (allAccounts.length > 0 && allAccounts[0].naration) {
    balanceNarration = allAccounts[0].naration || balanceNarration;
  }

  const queryString =
    `voucher_id=${encodeURIComponent(voucherId)}` +
    `&voucher_type_desc=${encodeURIComponent(vendorVoucherData.voucherType)}` +
    `&account_id=${encodeURIComponent(balanceAccountId)}` +
    `&narration=${encodeURIComponent(balanceNarration)}` +
    `&user_id=${encodeURIComponent(vendorVoucherData.createdBy || 18)}`;

  try {
    console.log("🔄 Calling balance API with:", {
      voucherId,
      voucherType: vendorVoucherData.voucherType,
      balanceAccountId,
      narration: balanceNarration
    });

    const balanceResponse = await fetch(`/api/vouchers/balance?${queryString}`);

    if (!balanceResponse.ok) {
      const text = await balanceResponse.text();
      console.error("❌ BALANCE API FAILED:", text);
      alert("Voucher saved but balance API failed: " + text);
    } else {
      const balanceResult = await balanceResponse.json();
      console.log("✅ Balance API response:", balanceResult);

      if (balanceResult?.success) {
        balanceWasSuccessful = true;
        alert(
          `✅ ${vendorVoucherData.voucherType} Voucher Balanced Successfully!\n\n` +
          `Voucher ID: ${voucherId}\n` +
          `Account ID used: ${balanceAccountId}\n` +
          `Account Name: ${vendorVoucherData.voucherType === 'MBPV' ? vendorVoucherData.vendorName : 'CASH AT MILL'}\n` +
          `Message: ${balanceResult.message}`
        );
      } else {
        alert(`⚠️ Voucher saved but balance returned:\n\n${balanceResult?.message || "Unknown"}`);
      }
    }
  } catch (balanceErr) {
    console.error("❌ ERROR CALLING BALANCE API:", balanceErr);
    alert("Voucher saved but error occurred while balancing: " + (balanceErr as Error).message);
  }
}

    // ========================================
    // 7) AUTO PRINT (WITHOUT BLOCKING)
    // ========================================
    if (shouldBalance && balanceWasSuccessful) {
      await handlePrint(voucherId);
    } else if (!shouldBalance) {
      await handlePrint(voucherId);
    }

    // ========================================
    // 8) RESET FORM AND REFRESH
    // ========================================
    setShowVendorVoucherForm(false);
    setIsAddVoucherMode(false);
    setIsEditMode(false);

    // Reset form data (preserve selected voucher type)
    const isMBPV = selectedVoucherType === 'MBPV';
    setVendorVoucherData({
      vendorNo: "",
      vendorDate: new Date().toISOString().split("T")[0],
      voucherType: selectedVoucherType,
      vendorName: isMBPV ? "" : "60101-0002 - CASH AT MILL",
      cashAmount: 0,
      referenceNo: "",
      customers: "",
      currency: "PKR",
      accountBalance: 0,
      exchangeRate: 1,
      description: "",
      company: "Multan Feed",
      branch: "",
      customerId: null,
      customerName: "",
      createdBy: null,
      acc_id: 0,
      account_code: isMBPV ? "" : "60101-0002",
      account_desc: isMBPV ? "" : "CASH AT MILL",
      month: new Date().toISOString().slice(0, 7)
    });

    // Reset rows
    setLocalRowValues(prev => prev.map((row, index) => ({
      ...row,
      id: `new-row-${index}`,
      checked: false,
      checkedC: false,
      checkedG: false,
      checkedI: false,
      party_account: "",
      party: "",
      account_code: "",
      account_id: 0,
      description: "",
      sub_acc_code: "",
      debit: "",
      credit: "",
      notation: "",
      cost_center: "",
      cost_center_id: null,
      slip_no: "",
      freight_amount: "",
      item_id: null,
      item_code: "",
      item_desc: "",
      wb_id: null,
      vendor_id: null,
      customer_id: null
    })));

    setFreightItems([]);
    setLocalFormItems([]);

    // Refresh vouchers list
    await fetchFreightVouchers();

  } catch (err) {
    console.error("❌ UNEXPECTED ERROR:", err);
    alert("Unexpected error occurred: " + (err as Error).message);
  } finally {
    setIsSavingVoucher(false);
  }
};



// ✅ UPDATED: handlePrint accepts voucherId, so it prints the voucher you just saved
const handlePrint = async (voucherIdParam?: string | number) => {
  const vid = voucherIdParam ?? selectedFreightId;

  console.log("Selected Voucher ID:", vid);

  if (!vid) {
    alert("Please select a voucher to print.");
    return;
  }

  try {
    const response = await fetch(`/api/single-voucher-report?voucher_id=${vid}`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const voucherData = await response.json();
    console.log("Voucher API Response:", voucherData);

    if (!voucherData || voucherData.length === 0) {
      alert("No voucher data found for the selected ID.");
      return;
    }

    // ✅ voucher type for correct heading (auto print safe)
    const vt =
      vendorVoucherData?.voucherType ||
      voucherData?.[0]?.voucher_type_desc ||
      selectedVoucherType ||
      "Voucher";

    // totals
    let totalDr = 0;
    let totalCr = 0;

    voucherData.forEach((item: any) => {
      totalDr += parseFloat(item.debit || 0);
      totalCr += parseFloat(item.credit || 0);
    });

    const amountToWords = (num: number) => {
      if (num === 0) return "Zero Only";
      const ones = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
      ];
      const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
      const thousands = ["", "Thousand", "Million", "Billion"];

      if (num > 999999999.99) return "Amount too large";

      const rupees = Math.floor(num);
      const paisa = Math.round((num - rupees) * 100);

      let words = "";

      if (rupees > 0) {
        let count = 0;
        let n = rupees;

        while (n > 0) {
          if (n % 1000 !== 0) {
            let chunkWords = "";
            let chunk = n % 1000;

            if (chunk >= 100) {
              chunkWords += ones[Math.floor(chunk / 100)] + " Hundred";
              chunk %= 100;
              if (chunk > 0) chunkWords += " and ";
            }

            if (chunk > 0) {
              if (chunk < 20) chunkWords += ones[chunk];
              else {
                chunkWords += tens[Math.floor(chunk / 10)];
                if (chunk % 10 > 0) chunkWords += " " + ones[chunk % 10];
              }
            }

            if (chunkWords !== "") {
              words =
                chunkWords +
                (thousands[count] ? " " + thousands[count] : "") +
                (words ? " " + words : "");
            }
          }
          n = Math.floor(n / 1000);
          count++;
        }

        words += " Rupees";
      } else {
        words = "Zero Rupees";
      }

      if (paisa > 0) {
        if (rupees > 0) words += " and ";

        if (paisa < 20) words += ones[paisa] + " Paisa";
        else {
          words += tens[Math.floor(paisa / 10)];
          if (paisa % 10 > 0) words += " " + ones[paisa % 10];
          words += " Paisa";
        }
      }

      return words + " Only";
    };

    const voucherInfo = voucherData[0];

    const rows = voucherData
      .map((item: any, index: number) => {
        const accountDesc = item.acc_desc || item.description || "";
        const narration = item.naration || "";

        const debitValue = parseFloat(item.debit || 0);
        const creditValue = parseFloat(item.credit || 0);

        const debitFormatted = debitValue.toLocaleString("en-US");
        const creditFormatted = creditValue.toLocaleString("en-US");

        return `
          <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td>${item.chart_of_account_code || ""}</td>
            <td>${accountDesc}</td>
            <td>${narration}</td>
            <td style="text-align: right; padding-right: 20px; font-family: 'Courier New', monospace;">${debitFormatted}</td>
            <td style="text-align: right; padding-right: 20px; font-family: 'Courier New', monospace;">${creditFormatted}</td>
          </tr>
        `;
      })
      .join("");

    const formatDate = (dateString: any) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB");
    };

    const amountForWords = totalDr > 0 ? totalDr : totalCr;
    const amountInWords = amountToWords(amountForWords);

    const printContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Voucher Report - ${vt || "Voucher"}</title>
  <style>
    body { font-family: Times New Roman; font-size: 18px; margin: 20px; }
    .voucher-info { display: flex; justify-content: space-between; margin-bottom: 15px; flex-wrap: wrap; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
    table, th, td { border: 1px solid black; }
    th, td { padding: 8px; text-align: left; vertical-align: top; }
    th { background-color: #f2f2f2; text-align: center; }
    .amount-column { text-align: right; font-family: 'Courier New', monospace; padding-right: 20px !important; }
    .total-row { font-weight: bold; background-color: #e8e8e8; }
    .company-header { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 10px; }
    .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
    .voucher-title { font-size: 18px; font-weight: bold; text-decoration: underline; margin-top: 5px; text-transform: uppercase; }
    .amount-in-words { margin: 20px 0; padding: 8px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; font-style: italic; }
    .amount-in-words-label { font-weight: bold; margin-right: 10px; }
    
    /* Updated Footer Styles - 4 boxes in one line */
    .signatures-container {
      display: flex;
      justify-content: space-between;
      margin-top: 50px;
      gap: 20px;
    }
    
    .signature-box {
      flex: 1;
      text-align: center;
      min-width: 0;
    }
    
    .signature-line {
      border-top: 1px solid black;
      width: 100%;
      margin: 40px 0 5px 0;
    }
    
    .signature-box div {
      margin: 5px 0;
    }
    
    .col-sno { width: 5%; } 
    .col-account-code { width: 12%; } 
    .col-account-desc { width: 28%; }
    .col-narration { width: 25%; } 
    .col-debit { width: 15%; } 
    .col-credit { width: 15%; }
    
    @media print {
      body { margin: 0; }
      .signatures-container { margin-top: 30px; }
    }
  </style>
</head>
<body>

<div class="company-header">
  <div class="company-name">Multan Feed (PVT.) LTD.</div>
  <div class="voucher-title">
    ${
      vt === "FFCPV"
        ? "Feed Freight Cash Payment Voucher"
        : vt === "MCRV"
        ? "Mill Cash Receipt Voucher"
        : vt === "MCPV"
        ? "Mill Cash Payment Voucher"
        : vt === "FMCPV"
        ? "Freight Mill Cash Payment Voucher"
        : vt === "CPM"
        ? "Cash Payment Mill"
        : vt === "MBPV"
        ? "Mill Bank Payment Voucher"
        : vt === "MBRV"
        ? "Mill Bank Receipt Voucher"
        : vt
    }
  </div>
</div>
  <div style="margin-top: 8%; font-size: 15px;">
    ${vt} - ${voucherInfo.voucher_no}
  </div>

<div class="voucher-info">
  <div>
    <p><strong>Date:</strong> ${
      new Date(voucherInfo.voucher_date)
        .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
        .replace(/ /g, "-")
        .toUpperCase()
    }</p>
  </div>

  <div>
    <span class="label"><strong>Module Name</strong></span>
    <span class="value" style="display:inline-block;border-bottom:1px solid black;min-width:150px;text-align:center;margin-left:5px;">
      Direct Voucher
    </span>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th class="col-sno">#</th>
      <th class="col-account-code">Account Code</th>
      <th class="col-account-desc">Account Description</th>
      <th class="col-narration">Narration</th>
      <th class="col-debit">Debit</th>
      <th class="col-credit">Credit</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
    <tr class="total-row">
      <td colspan="4" style="text-align:left;">Total</td>
      <td class="amount-column">${Number(totalDr.toFixed(0)).toLocaleString("en-US")}</td>
      <td class="amount-column">${Number(totalCr.toFixed(0)).toLocaleString("en-US")}</td>
    </tr>
  </tbody>
</table>

<div class="amount-in-words">
  <span class="amount-in-words-label">Amount in Words:</span>
  <span>${amountInWords}</span>
</div>

<!-- Updated Footer: 4 boxes in one line -->
<div class="signatures-container">
  <div class="signature-box">
    <div class="signature-line"></div>
    <div>Prepared By</div>
    <div>Adnan Butt</div>
    <div>Date: ${formatDate(voucherInfo.creation_date)}</div>
  </div>
  
  <div class="signature-box">
    <div class="signature-line"></div>
    <div>Checked By</div>
    <div></div>
    <div>Date: ${formatDate(voucherInfo.creation_date)}</div>
  </div>
  
  <div class="signature-box">
    <div class="signature-line"></div>
    <div>Approved By</div>
    <div>${voucherInfo.approved_by || ""}</div>
    <div>Date: ${formatDate(voucherInfo.approval_date)}</div>
  </div>
  
  <div class="signature-box">
    <div class="signature-line"></div>
    <div>Received By</div>
    <div>${voucherInfo.cheked_by || ""}</div>
    <div>Date: ${formatDate(voucherInfo.checked_date)}</div>
  </div>
</div>

</body>
</html>
`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = function () {
        printWindow.focus();
        printWindow.print();
      };
    }
  } catch (error) {
    console.error("❌ Error fetching voucher data:", error);
    alert("Failed to fetch voucher data for printing. Please try again.");
  }
};



// ✅ NEW: Fetch voucher data for editing
const fetchVoucherForEdit = async (voucherId: number | string) => {
  try {
    setIsLoadingAccounts(true);
    console.log(`📡 Fetching voucher ${voucherId} for editing...`);
    
    const response = await fetch(`/api/vouchers/cash-receipt/${vendorVoucherData.voucherType.toLowerCase()}/${voucherId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch voucher: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "Failed to fetch voucher data");
    }
    
    const voucher = result.data?.voucher;
    
    if (!voucher) {
      throw new Error("No voucher data received");
    }
    
    console.log("✅ Voucher data fetched for edit:", voucher);
    return voucher;
  } catch (error) {
    console.error("❌ Error fetching voucher for edit:", error);
    throw error;
  } finally {
    setIsLoadingAccounts(false);
  }
};






// Helper function to reset form and show success
const resetFormAndShowSuccess = (voucherId: number, accountCount: number, totalDebit: number, totalCreditAll: number) => {
    setIsSavingVoucher(false); // Hide loader

  setShowVendorVoucherForm(false);
  setIsAddVoucherMode(false);

  setVendorVoucherData({
    vendorNo: "",
    vendorDate: new Date().toISOString().split("T")[0],
    voucherType: selectedVoucherType,
    vendorName: "",
    cashAmount: 0,
    referenceNo: "",
    customers: "",
    currency: "PKR",
    accountBalance: 0,
    exchangeRate: 1,
    description: "",
    company: "Multan Feed",
    branch: "",
    customerId: null,
    customerName: "",
    createdBy: null,
    acc_id: 0,
    account_code: "",
    account_desc: "",
    month: new Date().toISOString().slice(0, 7)
  });

  setLocalRowValues(prev => prev.map(row => ({
    ...row,
    debit: "",
    credit: "",
    account_code: "",
    account_id: 0,
    description: "",
    sub_acc_code: "",
    notation: "",
    cost_center_id: null
  })));

  setFreightItems([]);
  setLocalFormItems([]);

  fetchFreightVouchers();

  alert(`✅ ${pageTitles[vendorVoucherData.voucherType]} Saved Successfully\nVoucher ID: ${voucherId}\nAccount Saved: ${accountCount}\nTotal Debit: ${totalDebit.toFixed(2)}\nTotal Credit: ${totalCreditAll.toFixed(2)}`);
};



// Debug: Log when acc_id changes
useEffect(() => {
  console.log("🔍 DEBUG - vendorVoucherData.acc_id changed:", {
    acc_id: vendorVoucherData.acc_id,
    account_code: vendorVoucherData.account_code,
    account_desc: vendorVoucherData.account_desc,
    voucherType: vendorVoucherData.voucherType
  });
}, [vendorVoucherData.acc_id, vendorVoucherData.account_code, vendorVoucherData.account_desc]);


// ✅ Auto-refetch voucher number when date changes in add mode
useEffect(() => {
  if (isAddVoucherMode && vendorVoucherData.voucherType && vendorVoucherData.vendorDate) {
    const refetchOnDateChange = async () => {
      // Only refetch if we have a voucher type but no voucher number yet
      // or if user hasn't manually edited it
      if (!vendorVoucherData.vendorNo || vendorVoucherData.vendorNo.trim() === "") {
        setIsLoadingVoucherNo(true);
        try {
          const nextNo = await fetchNextVoucherNo(vendorVoucherData.voucherType, vendorVoucherData.vendorDate);
          setVendorVoucherData(prev => ({ ...prev, vendorNo: nextNo }));
        } catch (error) {
          console.error("Failed to refetch voucher number on date change:", error);
        } finally {
          setIsLoadingVoucherNo(false);
        }
      }
    };
    
    refetchOnDateChange();
  }
}, [vendorVoucherData.vendorDate, vendorVoucherData.voucherType, isAddVoucherMode]);


useEffect(() => {
  const balanceSavedVoucher = async () => {
    // ✅ REMOVED: && vendorVoucherData.voucherType === 'MCRV'
    if (shouldBalanceVoucher && savedVoucherId) {
      try {

         setIsSavingVoucher(true); // Show loader
        // Get parameters from saved data - USE BALANCE-SPECIFIC DATA
        const voucherTypeDesc = vendorVoucherData.voucherType; // Can be MCRV, MCPV, MBPV, MBRV, FFCPV
        
        // ✅ Use the balance-specific account ID we stored
        const accountId = vendorVoucherData.balanceAccountId || vendorVoucherData.acc_id;
        
        // ✅ Use the balance-specific narration
        const narration = vendorVoucherData.balanceNarration || vendorVoucherData.description || "";
        
        const userId = vendorVoucherData.createdBy || 1;

        console.log("🔄 Calling balance API with CORRECT account data:", {
          voucher_id: savedVoucherId,
          voucher_type_desc: voucherTypeDesc,
          account_id: accountId,
          narration: narration,
          user_id: userId,
          account_source: vendorVoucherData.balanceAccountId ? "Customer Account" : "Master Account"
        });

        // Call the balance API
        const response = await fetch(`/api/vouchers/balance?` + new URLSearchParams({
          voucher_id: savedVoucherId.toString(),
          voucher_type_desc: voucherTypeDesc,
          account_id: accountId.toString(),
          narration: narration,
          user_id: userId.toString()
        }));

        const result = await response.json();
        console.log("Balance API Response:", result);

        if (result.success) {
          console.log(`✅ Voucher #${savedVoucherId} balanced successfully with account ID: ${accountId}`);
          // Show combined success message
          resetFormAndShowSuccess(
            savedVoucherId,
            localRowValues.filter(row => row.debit || row.credit).length,
            localRowValues.reduce((sum, row) => sum + parseFloat(row.debit || "0"), 0),
            localRowValues.reduce((sum, row) => sum + parseFloat(row.credit || "0"), 0)
          );
          
          // Show additional message about balancing
          setTimeout(() => {
            alert(`✅ Voucher Balanced Successfully!\n\nVoucher #${savedVoucherId} has been automatically balanced.\n\nAccount ID used: ${accountId}\nNarration: ${narration}`);
          }, 100);
        } else {
          console.error("❌ Balance API failed:", result.error);
          // Still show saved success but with warning
          resetFormAndShowSuccess(
            savedVoucherId,
            localRowValues.filter(row => row.debit || row.credit).length,
            localRowValues.reduce((sum, row) => sum + parseFloat(row.debit || "0"), 0),
            localRowValues.reduce((sum, row) => sum + parseFloat(row.credit || "0"), 0)
          );
          
          setTimeout(() => {
            alert(`⚠️ Voucher Saved but Balance Failed\n\nVoucher #${savedVoucherId} was saved successfully but balancing failed.\n\nError: ${result.error || "Unknown error"}\n\nAccount ID attempted: ${accountId}`);
          }, 100);
        }

      } catch (error) {
        console.error("❌ Error calling balance API:", error);
        // Still show saved success but with warning
        resetFormAndShowSuccess(
          savedVoucherId,
          localRowValues.filter(row => row.debit || row.credit).length,
          localRowValues.reduce((sum, row) => sum + parseFloat(row.debit || "0"), 0),
          localRowValues.reduce((sum, row) => sum + parseFloat(row.credit || "0"), 0)
        );
        
        setTimeout(() => {
          alert(`⚠️ Voucher Saved but Balance Failed\n\nVoucher #${savedVoucherId} was saved successfully but balancing encountered an error.\n\nPlease try balancing manually.`);
        }, 100);
      } finally {
        // Reset the state
        setShouldBalanceVoucher(false);
        setSavedVoucherId(null);
        // Clear balance-specific data
        setVendorVoucherData(prev => ({
          ...prev,
          balanceAccountId: undefined,
          balanceNarration: undefined
        }));
      }
    }
  };

  balanceSavedVoucher();
}, [shouldBalanceVoucher, savedVoucherId]);



const getVoucherTypeDisplay = (type: any) => {
  switch(type) {
    case 'MCRV': return 'Cash Receipt Voucher (MCRV)';
    case 'MCPV': return 'Cash Payment Voucher (MCPV)';
    case 'MBPV': return 'Bank Payment Voucher (MBPV)';
    case 'MBRV': return 'Bank Receipt Voucher (MBRV)';
    case 'FFCPV': return 'Feed Freight Voucher (FFCPV)';
    case 'FMCPV': return 'Freight Mill Cash Payment Voucher (FMCPV)';  // ✅ ADD THIS
    case 'CPM': return 'Cash Payment Mill (CPM)';  // ✅ ADD THIS
    default: return type;
  }
};

// ✅ Account LOV Dropdown (TAB = next item, SHIFT+TAB = prev item, ENTER = select, ↑↓ navigate, ESC close)
const AccountLOVDropdown = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const listRef = React.useRef<HTMLDivElement | null>(null);

  if (!showAccountDropdown || accountDropdownForRowIndex === null) {
    return null;
  }

  const list = Array.isArray(accountsList) ? accountsList : [];

  const normalize = (val = "") =>
    val
      .toString()
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
      .replace(/\s*-\s*/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const rawSearch = (accountSearchTerm || "").toString();
  const searchTerm = rawSearch.trim();
  const searchNorm = normalize(searchTerm);

  const filteredList = searchTerm
    ? list
        .map((account) => {
          if (!account) return null;

          const accountCodeRaw = (account.account_code || account.chart_of_account_code || "")
            .toString()
            .trim();

          const accountDescRaw = (account.account_desc || account.description || account.account_name || "")
            .toString()
            .trim();

          const codeNormFull = normalize(accountCodeRaw);
          const descNorm = normalize(accountDescRaw);
          const codeKey = codeNormFull.split(" ")[0] || "";

          let score = 0;

          if (codeNormFull.startsWith(searchNorm) || codeKey.startsWith(searchNorm)) score = 1000;
          else if (codeNormFull.includes(searchNorm) || codeKey.includes(searchNorm)) score = 700;
          else if (descNorm.includes(searchNorm)) score = 400;
          else if (searchNorm.length >= 4) {
            let searchIndex = 0;
            const fullText = `${codeNormFull} ${descNorm}`;
            for (let i = 0; i < fullText.length && searchIndex < searchNorm.length; i++) {
              if (fullText[i] === searchNorm[searchIndex]) searchIndex++;
            }
            if (searchIndex === searchNorm.length) score = 250;
          }

          if (score === 0) {
            const cleanCode = codeNormFull.replace(/[^a-z0-9]/g, "");
            const cleanSearch = searchNorm.replace(/[^a-z0-9]/g, "");
            if (cleanCode.includes(cleanSearch)) score = 150;
          }

          if (score === 0) return null;

          score += Math.max(0, 50 - Math.min(codeNormFull.length, 50));
          return { account, score };
        })
        .filter(Boolean)
        .sort((a: any, b: any) => b.score - a.score)
        .map((x: any) => x.account)
    : list;

  const visibleList = filteredList.slice(0, 50);

  React.useEffect(() => {
    setActiveIndex(0);
    itemRefs.current = [];
  }, [showAccountDropdown, accountDropdownForRowIndex, accountSearchTerm, filteredList.length]);

  React.useEffect(() => {
    const el = itemRefs.current[activeIndex];
    if (el && listRef.current) el.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const closeDropdown = () => {
    setShowAccountDropdown(false);
    setAccountDropdownForRowIndex(null);
    setIsAccountLOVOpen(false);
  };

  const selectByIndex = (idx: number) => {
    const acc = visibleList[idx];
    if (!acc) return;
    handleAccountSelect(acc); // ✅ ENTER selects
  };

  // ✅ Keyboard handler:
  // - TAB => next item (NOT select)
  // - SHIFT+TAB => previous item
  // - ENTER => select highlighted item
  // - ↑/↓ => navigate
  // - ESC => close
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!visibleList.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, visibleList.length - 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        setActiveIndex((prev) => (prev - 1 + visibleList.length) % visibleList.length);
      } else {
        setActiveIndex((prev) => (prev + 1) % visibleList.length);
      }
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      selectByIndex(activeIndex);
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      closeDropdown();
      return;
    }
  };

  console.log(`🔍 Searching for: "${accountSearchTerm}", found: ${filteredList.length} matches`);

  return (
    <div
      className="dropdown-menu show"
      style={{
        position: "absolute",
        top: `${accountDropdownPosition.top}px`,
        left: `${accountDropdownPosition.left}px`,
        width: "600px",
        maxHeight: "450px",
        overflowY: "auto",
        zIndex: 9999,
        display: "block",
        backgroundColor: "white",
        border: "1px solid #ccc",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <div className="p-2 border-bottom bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <strong className="text-primary">Select Account Code</strong>
          <button className="btn btn-sm btn-outline-secondary" onClick={closeDropdown} type="button">
            ×
          </button>
        </div>

        <div className="mt-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search account code or description..."
            value={accountSearchTerm}
            onChange={(e) => setAccountSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <div className="d-flex justify-content-between mt-1">
            <small className="text-muted">{filteredList.length} accounts found</small>
            {accountSearchTerm && filteredList.length === 0 && (
              <small className="text-danger">No matches found</small>
            )}
          </div>

          <div className="mt-1">
            <small className="text-muted">
              Use <b>Tab</b> (next) / <b>Shift+Tab</b> (prev), <b>Enter</b> to select, <b>↑</b>/<b>↓</b>{" "}
              to navigate, <b>Esc</b> to close.
            </small>
          </div>
        </div>
      </div>

      <div className="dropdown-list" ref={listRef}>
        {isLoadingAccounts ? (
          <div className="p-3 text-center">
            <div className="spinner-border spinner-border-sm text-primary">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-2 text-muted">Loading accounts...</div>
          </div>
        ) : visibleList.length > 0 ? (
          visibleList.map((account: any, index: number) => {
            const key =
              account.id || account.chart_of_account_id || account.account_code || `account-${index}`;

            const accountCode = account.account_code || account.chart_of_account_code || "N/A";
            const accountDesc =
              account.account_desc || account.description || account.account_name || "No description";

            const isTopMatch = searchTerm && normalize(accountCode).startsWith(searchNorm);
            const isActive = index === activeIndex;

            return (
              <button
                key={key}
                ref={(el) => (itemRefs.current[index] = el)}
                className="dropdown-item text-start"
                type="button"
                onClick={() => handleAccountSelect(account)}
                onMouseEnter={() => setActiveIndex(index)}
                style={{
                  fontSize: "12px",
                  padding: "8px 12px",
                  borderBottom: "1px solid #f0f0f0",
                  whiteSpace: "normal",
                  cursor: "pointer",
                  backgroundColor: isActive ? "#e8f1ff" : isTopMatch ? "#e3f2fd" : "transparent",
                  borderLeft: isActive ? "3px solid #0d6efd" : isTopMatch ? "3px solid #2196f3" : "none",
                  outline: "none",
                }}
              >
                <div className="fw-bold text-primary">{accountCode}</div>
                <div className="small">
                  {accountCode} - {accountDesc}
                </div>

                {isTopMatch && (
                  <div className="text-success small mt-1 fw-bold">✓ Matches "{accountSearchTerm}"</div>
                )}

                {account.chart_of_account_id && (
                  <div className="text-muted small mt-1">ID: {account.chart_of_account_id}</div>
                )}
              </button>
            );
          })
        ) : (
          <div className="p-3 text-center text-muted">
            {accountSearchTerm ? `No accounts found for "${accountSearchTerm}"` : "No accounts available"}
          </div>
        )}
      </div>
    </div>
  );
};




const VendorDropdown = () => {
  if (!showDropdown || dropdownForRowIndex === null || !dropdownType) {
    return null;
  }

  // Get appropriate list based on dropdown type
  const listToShow = dropdownType === "vendor" ? vendorsList : customersList;
  
  console.log(`🔍 Dropdown Type: ${dropdownType}, List count: ${listToShow.length}`);
  
  // Filter based on search
  const filteredList = searchTerm 
    ? listToShow.filter((listItem: any) => {
        if (!listItem) return false;
        
        // For vendor dropdown
        if (dropdownType === "vendor") {
          const name = (listItem.vendor_name || listItem.party_name || "").toLowerCase();
          const code = (listItem.vendor_code || "").toLowerCase();
          const accountCode = (listItem.payable_account_code || "").toLowerCase();
          const searchLower = searchTerm.toLowerCase();
          
          return name.includes(searchLower) || 
                 code.includes(searchLower) || 
                 accountCode.includes(searchLower);
        } 
        // For customer dropdown
        else {
          const name = (
            listItem.customer_name || 
            listItem.party_name || 
            listItem.vendor_name || 
            listItem.name || 
            listItem.full_name || 
            ""
          ).toLowerCase();
          
          const code = (
            listItem.customer_code || 
            listItem.vendor_code || 
            listItem.code || 
            listItem.customer_id || 
            ""
          ).toString().toLowerCase();
          
          const searchLower = searchTerm.toLowerCase();
          return name.includes(searchLower) || code.includes(searchLower);
        }
      })
    : listToShow;

  console.log(`🔍 Filtered list count: ${filteredList.length}`);

  return (
    <div 
      className="dropdown-menu show"
      style={{
        position: "absolute",
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: "500px",
        maxHeight: "350px",
        overflowY: "auto",
        zIndex: 9999,
        display: "block"
      }}
    >
      <div className="p-2 border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <strong className="text-primary">
            {dropdownType === "vendor" ? "Select Vendor" : "Select Customer"}
          </strong>
          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setShowDropdown(false)}
          >
            ×
          </button>
        </div>
        <input
          type="text"
          className="form-control form-control-sm mt-2"
          placeholder={`Search ${dropdownType}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>
      
      <div className="dropdown-list">
      
{filteredList.length > 0 ? (
  filteredList.slice(0, 20).map((listItem: any, index: number) => {
    if (!listItem) return null;
    
    const key = listItem.id || listItem.vendor_id || listItem.customer_id || `item-${index}`;
    
    // Get display name
    let displayName = "Unknown";
    if (dropdownType === "vendor") {
      displayName = listItem.vendor_name || listItem.party_name || listItem.name || "Unknown Vendor";
    } else {
      displayName = listItem.customer_name || listItem.party_name || listItem.vendor_name || listItem.name || "Unknown Customer";
    }
    
    return (
      <button
        key={key}
        className="dropdown-item text-start"
        onClick={() => {
          if (dropdownForRowIndex !== null) {
            if (dropdownType === "vendor") {
              const selectedItem = {
                ...listItem,
                vendor_id: listItem.vendor_id || listItem.id,
                vendor_name: displayName,
                payable_account_id: listItem.payable_account_id,
                payable_account_code: listItem.payable_account_code,
                payable_account_desc: listItem.payable_account_desc
              };
              handleVendorSelect(dropdownForRowIndex, selectedItem);
            } else if (dropdownType === "customer") {
              const selectedItem = {
                ...listItem,
                id: listItem.id || listItem.customer_id,
                customer_id: listItem.customer_id || listItem.id,
                customer_name: displayName,
                // ✅ IMPORTANT: Pass both versions for compatibility
                receiveable_account_id: listItem.receiveable_account_id, // Single 'e'
                receivable_account_id: listItem.receiveable_account_id, // Also set for consistency
                receivable_account_code: listItem.receivable_account_code,
                receivable_account_desc: listItem.receivable_account_desc
              };
              handleCustomerSelect(dropdownForRowIndex, selectedItem);
            }
          }
        }}
        style={{ 
          fontSize: "12px",
          padding: "8px 12px",
          borderBottom: "1px solid #f0f0f0",
          textAlign: "left",
          whiteSpace: "normal"
        }}
      >
        <div className="fw-bold">{displayName}</div>
        
        {/* ✅ Show receivable account info for customers */}
        {dropdownType === "customer" && listItem.receivable_account_code && (
          <div className="mt-1">
            <div className="text-success small fw-bold">
              Account: {listItem.receivable_account_code}
            </div>
            {listItem.receivable_account_desc && (
              <div className="text-muted small">
                {listItem.receivable_account_desc}
              </div>
            )}
            <div className="text-muted small">
              Account ID: {listItem.receiveable_account_id || "N/A"}
            </div>
          </div>
        )}
        
        {dropdownType === "customer" && !listItem.receivable_account_code && (
          <div className="text-warning small mt-1">
            No receivable account linked
          </div>
        )}
        
        <div className="text-muted small mt-1">
          ID: {listItem.vendor_id || listItem.customer_id || listItem.id || "N/A"}
        </div>
      </button>
    );
  })
) : (
  <div className="p-3 text-center text-muted">
    {searchTerm ? `No ${dropdownType}s found for "${searchTerm}"` : `No ${dropdownType}s available`}
  </div>
)}
      </div>
    </div>
  );
};






// ✅ Item Dropdown Component
const ItemDropdown = () => {
  if (!showItemDropdown || itemDropdownForRowIndex === null) {
    return null;
  }

  // Filter items based on search
  const filteredItems = itemSearchTerm 
    ? itemsList.filter(item => {
        if (!item) return false;
        const searchLower = itemSearchTerm.toLowerCase();
        const description = (item.description || item.item_desc || "").toLowerCase();
        const code = (item.item_code || "").toLowerCase();
        return description.includes(searchLower) || code.includes(searchLower);
      })
    : itemsList;

  return (
    <div 
      className="dropdown-menu show"
      style={{
        position: "absolute",
        top: `${itemDropdownPosition.top}px`,
        left: `${itemDropdownPosition.left}px`,
        width: "500px",
        maxHeight: "350px",
        overflowY: "auto",
        zIndex: 9999,
        display: "block",
        backgroundColor: "white",
        border: "1px solid #ccc",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
      }}
    >
      <div className="p-2 border-bottom bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <strong className="text-primary">
            Select Item
          </strong>
          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              setShowItemDropdown(false);
              setItemDropdownForRowIndex(null);
            }}
          >
            ×
          </button>
        </div>
        <div className="mt-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search item description or code..."
            value={itemSearchTerm}
            onChange={(e) => setItemSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
      </div>
      
      <div className="dropdown-list">
        {filteredItems.length > 0 ? (
          filteredItems.slice(0, 30).map((item: any, index: number) => {
            const key = item.id || item.item_id || `item-${index}`;
            
            return (
              <button
                key={key}
                className="dropdown-item text-start"
                onClick={() => handleItemSelect(itemDropdownForRowIndex, item)}
                style={{ 
                  fontSize: "12px",
                  padding: "8px 12px",
                  borderBottom: "1px solid #f0f0f0",
                  whiteSpace: "normal",
                  textAlign: "left"
                }}
              >
                <div className="fw-bold text-primary">{item.item_code || "N/A"}</div>
                <div className="small">{item.description || item.item_desc || "No description"}</div>
                <div className="text-muted small mt-1">
                  Item ID: {item.id || "N/A"} | 
                  GL Asset ID: {item.gl_asset_id || "N/A"}
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-3 text-center text-muted">
            {itemSearchTerm 
              ? `No items found for "${itemSearchTerm}"` 
              : "No items available"}
          </div>
        )}
      </div>
    </div>
  );
};



const VendorVoucherForm = () => {
  const [localValues, setLocalValues] = useState(vendorVoucherData);
  const [isLoadingVoucherNo, setIsLoadingVoucherNo] = useState(false);
  
  useEffect(() => {
    setLocalValues(vendorVoucherData);
  }, [vendorVoucherData]);

  // ✅ Load customer data for FFCPV when in edit mode
// ✅ Load customer data for FFCPV when in edit mode
useEffect(() => {
  if (isEditMode && localValues.voucherType === 'FFCPV' && localValues.customerId) {
    console.log("🔄 Loading customer for FFCPV edit mode:", {
      customerId: localValues.customerId,
      customersListCount: customersList.length
    });
    
    // Find the customer in customersList
    const customer = customersList.find(c => 
      c.customer_id === localValues.customerId || 
      c.id === localValues.customerId
    );
    
    if (customer) {
      console.log("✅ Found customer for FFCPV edit:", {
        name: customer.customer_name,
        id: customer.customer_id || customer.id
      });
      
      setLocalValues(prev => ({
        ...prev,
        customers: customer.customer_name || customer.party_name || "",
        customerName: customer.customer_name || customer.party_name || ""
      }));
      
      // Also update main state
      handleVendorVoucherChange('customers', customer.customer_name || customer.party_name || "");
      handleVendorVoucherChange('customerName', customer.customer_name || customer.party_name || "");
    } else {
      console.log("⚠️ Customer not found in list, trying to fetch...");
      
      // If customer not found in current list, try to fetch it
      const fetchCustomer = async () => {
        try {
          const response = await fetch(`/api/customers/${localValues.customerId}`);
          if (response.ok) {
            const customerData = await response.json();
            
            setLocalValues(prev => ({
              ...prev,
              customers: customerData.customer_name || "",
              customerName: customerData.customer_name || ""
            }));
            
            handleVendorVoucherChange('customers', customerData.customer_name || "");
            handleVendorVoucherChange('customerName', customerData.customer_name || "");
            
            // Also add to local customers list for dropdown
            const newCustomer = {
              customer_id: customerData.customer_id || localValues.customerId,
              customer_name: customerData.customer_name,
              customer_code: customerData.customer_code,
              receivable_account_code: customerData.receivable_account_code
            };
            
            setCustomersList(prev => {
              // Check if customer already exists in list
              const exists = prev.some(c => 
                c.customer_id === newCustomer.customer_id || 
                c.id === newCustomer.customer_id
              );
              return exists ? prev : [...prev, newCustomer];
            });
          }
        } catch (error) {
          console.error("❌ Failed to fetch customer:", error);
          // Keep the existing customer ID in the field
          setLocalValues(prev => ({
            ...prev,
            customers: `Customer ID: ${localValues.customerId}`,
            customerName: `Customer ID: ${localValues.customerId}`
          }));
        }
      };
      
      fetchCustomer();
    }
  }
}, [isEditMode, localValues.voucherType, localValues.customerId, customersList]);




// ✅ MODIFIED: fetchNextVoucherNo function with date parameter
const fetchNextVoucherNo = async (voucherType: string, voucherDate?: string) => {
  try {
    console.log(`📡 Fetching next voucher number for: ${voucherType}, date: ${voucherDate || 'today'}`);
    
    // Use provided date or today's date
    const dateToUse = voucherDate || new Date().toISOString().split('T')[0];
    
    const response = await fetch(
      `/api/vouchers/next-voucher-no?voucher_type=${encodeURIComponent(voucherType)}&voucher_date=${encodeURIComponent(dateToUse)}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch next voucher number: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Next voucher number: ${data.nextVoucherNo} for ${voucherType} on ${dateToUse}`);
      return data.nextVoucherNo;
    } else {
      console.error(`❌ API error: ${data.error}`);
      return "1"; // Fallback
    }
  } catch (error) {
    console.error("❌ Error fetching next voucher number:", error);
    return "1"; // Fallback
  }
};





// ✅ FIRST useEffect for auto-fetch when voucher type changes
useEffect(() => {
  const fetchAutoVoucherNo = async () => {
    // Only fetch if we're adding new voucher (not editing) and voucher type exists
    if (isAddVoucherMode && localValues.voucherType) {
      // Don't fetch if user has already entered a voucher number
      if (!localValues.vendorNo || localValues.vendorNo.trim() === "") {
        setIsLoadingVoucherNo(true);
        try {
          // ✅ Pass voucher date as well
          const nextNo = await fetchNextVoucherNo(localValues.voucherType, localValues.vendorDate);
          setLocalValues(prev => ({ ...prev, vendorNo: nextNo }));
          // Also update main state
          handleVendorVoucherChange('vendorNo', nextNo);
        } catch (error) {
          console.error("Failed to auto-fetch voucher number:", error);
        } finally {
          setIsLoadingVoucherNo(false);
        } 
      }
    }
  };
  
  fetchAutoVoucherNo();
}, [localValues.voucherType, localValues.vendorDate, isAddVoucherMode]); // ✅ Added vendorDate to dependencies

// ✅ SECOND useEffect for when form opens initially
useEffect(() => {
  if (isAddVoucherMode && localValues.voucherType && (!localValues.vendorNo || localValues.vendorNo.trim() === "")) {
    const fetchOnOpen = async () => {
      setIsLoadingVoucherNo(true);
      try {
        // ✅ Pass voucher date as well
        const nextNo = await fetchNextVoucherNo(localValues.voucherType, localValues.vendorDate);
        setLocalValues(prev => ({ ...prev, vendorNo: nextNo }));
        handleVendorVoucherChange('vendorNo', nextNo);
      } catch (error) {
        console.error("Failed to fetch voucher number on open:", error);
      } finally {
        setIsLoadingVoucherNo(false);
      }
    };
    
    fetchOnOpen();
  }
}, []);

  const handleLocalChange = (field: string, value: any) => {
    setLocalValues(prev => ({ ...prev, [field]: value }));
  };

  const handleLocalBlur = (field: string) => {
    handleVendorVoucherChange(field, localValues[field as keyof VendorVoucherState]);
  };

  // ✅ Helper function to get appropriate label for account field
  const getAccountFieldLabel = () => {
    switch(localValues.voucherType) {
      case 'MCPV':
      case 'FFCPV':
      case 'MBPV':
        return "Cash Account";
      case 'MCRV':
      case 'MBRV':
        return "Account";
      default:
        return "Account";
    }
  };

  return (
    <div className="row mt-3 mb-3" style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <div className="col-md-12">
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
              value={localValues.branch || 'Multan Feed'}
              onChange={(e) => handleLocalChange('branch', e.target.value)}
              onBlur={() => handleLocalBlur('branch')}
              placeholder="Enter branch"
            />
          </div>

<div className="col-md-3 mb-2">
  <label className="form-label fw-bold text-dark">Type</label>
  {localValues.voucherType === 'MCPV' ? (
    <select
      className="form-select form-select-sm"
      value={localValues.voucherType}
      onChange={(e) => {
        const newType = e.target.value;
        handleLocalChange('voucherType', newType);
        handleVendorVoucherChange('voucherType', newType);
        // Auto-fetch new voucher number when type changes
        fetchNextVoucherNo(newType).then(nextNo => {
          handleLocalChange('vendorNo', nextNo);
          handleVendorVoucherChange('vendorNo', nextNo);
        });
      }}
      style={{ backgroundColor: 'white' }}
    >
      <option value="MCPV">Cash Payment Voucher (MCPV)</option>
      {/* <option value="FMCPV">Freight Mill Cash Payment Voucher (FMCPV)</option> */}
      <option value="CPM">Cash Payment Mill (CPM)</option>
    </select>
  ) : (
    <input
      type="text"
      className="form-control form-control-sm"
      value={getVoucherTypeDisplay(localValues.voucherType)}
      readOnly
      style={{
        cursor: 'default',
        backgroundColor: '#f8f9fa'
      }}
    />
  )}
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
        
        <div className="row">
          {/* ✅ Updated Voucher No field with auto-fetch */}
          <div className="col-md-2 mb-2">
            <label className="form-label fw-bold text-dark">Voucher No</label>
            <div className="input-group input-group-sm">
              <input
                type="text"
                className="form-control form-control-sm"
                value={localValues.vendorNo || ''}
                onChange={(e) => handleLocalChange('vendorNo', e.target.value)}
                onBlur={() => handleLocalBlur('vendorNo')}
                placeholder="Auto-fetched"
                disabled={isLoadingVoucherNo || isEditMode} // Disable editing in edit mode
                style={{
                  backgroundColor: isLoadingVoucherNo || isEditMode ? '#f8f9fa' : 'white',
                  cursor: isEditMode ? 'not-allowed' : 'text'
                }}
              />
              {!isEditMode && (
<button
  className="btn btn-outline-secondary"
  type="button"
  onClick={async () => {
    if (localValues.voucherType) {
      setIsLoadingVoucherNo(true);
      try {
        // ✅ Pass voucher date as well
        const nextNo = await fetchNextVoucherNo(localValues.voucherType, localValues.vendorDate);
        setLocalValues(prev => ({ ...prev, vendorNo: nextNo }));
        handleVendorVoucherChange('vendorNo', nextNo);
      } catch (error) {
        console.error("Failed to refresh voucher number:", error);
        alert("Failed to fetch new voucher number");
      } finally {
        setIsLoadingVoucherNo(false);
      }
    }
  }}
  disabled={isLoadingVoucherNo || !localValues.voucherType}
  title="Refresh voucher number"
>
  {isLoadingVoucherNo ? (
    <div className="spinner-border spinner-border-sm" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  ) : (
    '🔄'
  )}
</button>
              )}
            </div>
            {!isLoadingVoucherNo && localValues.voucherType && (
              <small className="text-muted">
                {isEditMode ? "Voucher number cannot be changed" : `Auto-generated for ${localValues.voucherType}`}
              </small>
            )}
          </div>
          
          <div className="col-md-2 mb-2">
            <label className="form-label fw-bold text-dark">Voucher Date</label>
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

          <div className="col-md-3 mb-2">
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
          
          <div className="col-md-4 mb-2">
            <label className="form-label fw-bold text-dark">{getAccountFieldLabel()}</label>
            <div className="position-relative">
              <div
                className="form-control form-control-sm d-flex align-items-center justify-content-between"
                style={{ 
                  cursor: "pointer",
                  backgroundColor: localValues.vendorName ? "#f8f9fa" : "white",
                  minHeight: "38px"
                }}
                onClick={(e) => handleMasterAccountClick(e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleMasterAccountClick(e);
                  }
                }}
                tabIndex={0}
                title="Click or press Ctrl+L to open account list"
              >
                <span className={localValues.vendorName ? "" : "text-muted"}>
                  {localValues.vendorName || "Select account (click or press Ctrl+L)"}
                </span>
                <span className="text-muted">▼</span>
              </div>
            </div>
          </div>

          {/* ✅ Show Customer field for FFCPV in both add and edit modes */}
{/* ✅ Show Customer field for FFCPV in both add and edit modes */}
{(localValues.voucherType === 'FFCPV') && (
  <div className="col-md-3 mb-2">
    <label className="form-label fw-bold text-dark">Customer</label>
    <div className="position-relative">
      {/* Show selected customer in edit mode */}
      <input
        type="text"
        className="form-control form-control-sm"
        placeholder="Select customer..."
        value={
          // Priority: localValues.customerName -> localValues.customers -> selected customer from list
          localValues.customerName || 
          localValues.customers || 
          (localValues.customerId ? 
            customersList.find(c => 
              c.customer_id === localValues.customerId || 
              c.id === localValues.customerId
            )?.customer_name || "" 
            : "")
        }
        onClick={() => setShowCustomerDropdown(true)}
        style={{
          cursor: 'pointer',
          backgroundColor: 'white',
          // Highlight if customer is selected
          border: localValues.customerId ? '1px solid #28a745' : '1px solid #ced4da'
        }}
        readOnly
      />
      
      {/* Small indicator showing customer ID if available */}
      {localValues.customerId && (
        <small className="text-muted">
          Customer ID: {localValues.customerId}
        </small>
      )}
      
      {/* Customer dropdown */}
      {showCustomerDropdown && (
        <div
          className="dropdown-menu show"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            maxHeight: "250px",
            overflowY: "auto",
            zIndex: 1000,
            backgroundColor: "white",
            border: "1px solid #ccc",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
          }}
        >
          {/* SEARCH INPUT */}
          <div className="p-2 border-bottom bg-light">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Type to search customers..."
              value={customerSearchTerm}
              onChange={(e) => setCustomerSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          {/* CUSTOMER LIST */}
          <div>
            {/* First, show the currently selected customer at the top */}
            {localValues.customerId && !customerSearchTerm && (
              <div className="p-2 border-bottom bg-light">
                <small className="text-muted">Currently selected:</small>
                <div className="fw-bold">
                  {customersList.find(c => 
                    c.customer_id === localValues.customerId || 
                    c.id === localValues.customerId
                  )?.customer_name || "Customer not found in list"}
                </div>
              </div>
            )}
            
            {customersList
              .filter(customer =>
                (customer.customer_name || customer.party_name || "")
                  .toLowerCase()
                  .includes(customerSearchTerm.toLowerCase())
              )
              .slice(0, 200)
              .map(customer => {
                const id = customer.customer_id || customer.id;
                const name = customer.customer_name || customer.party_name;
                const isSelected = id === localValues.customerId;

                return (
                  <button
                    key={id}
                    type="button"
                    className={`dropdown-item text-start ${isSelected ? 'bg-primary text-white' : ''}`}
                    onClick={() => {
                      handleLocalChange("customerId", id);
                      handleLocalChange("customers", name);
                      handleLocalChange("customerName", name);

                      handleVendorVoucherChange("customerId", id);
                      handleVendorVoucherChange("customers", name);
                      handleVendorVoucherChange("customerName", name);

                      setCustomerSearchTerm("");
                      setShowCustomerDropdown(false);
                    }}
                    style={{
                      fontSize: "12px",
                      padding: "8px 12px",
                      borderBottom: "1px solid #f0f0f0"
                    }}
                  >
                    <div className="fw-bold">
                      {name}
                      {isSelected && <span className="ms-2">✓</span>}
                    </div>
                    <div className="text-muted small">
                      Code: {customer.customer_code || "N/A"}
                      {customer.receivable_account_code && (
                        <div className="mt-1">
                          Account: {customer.receivable_account_code}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  </div>
)}
          
          <div className="col-md-12 mt-2">
            <label className="form-label fw-bold text-dark">Description</label>
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
<div className="col-md-12 mt-2 d-flex justify-content-end gap-2">
  <button
    className="btn btn-secondary btn-sm"
    onClick={toggleVendorVoucherForm}
    style={{ minWidth: '100px' }}
    disabled={isSavingVoucher}
  >
    Cancel
  </button>
<button
    className="btn btn-primary btn-sm"
    onClick={async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // 🔥 YE LINE ADD KARO - Focus hatao input field se
      document.activeElement?.blur();
      
      // Disable button immediately to prevent double-click
      const btn = e.currentTarget;
      btn.disabled = true;
      
      try {
        if (isEditMode) {
          await updateVendorVoucher();
        } else {
          await saveVendorVoucher();
        }
      } catch (error) {
        console.error("Save error:", error);
      } finally {
        // Re-enable button if save fails (successful save will close form)
        if (!isSavingVoucher) {
          btn.disabled = false;
        }
      }
    }}
    disabled={isSavingVoucher}
    style={{ minWidth: '120px', position: 'relative' }}
  >
    {isSavingVoucher ? (
      <>
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        {isEditMode ? 'Updating...' : 'Saving...'}
      </>
    ) : (
      isEditMode ? 'Update Voucher' : 'Save Voucher'
    )}
  </button>
</div>
        </div>
      </div>
    </div>
  );
};



const MainVouchersTable = () => {
  const [filterValues, setFilterValues] = useState({
    voucherDate: "",
    voucherNo: "",
    description: "",
  });

  const toYMDLocal = (dateInput: any) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const calculateVoucherTotals = (voucher: any) => {
    let totalDebit = 0;
    let totalCredit = 0;

    if (voucher.accounts && Array.isArray(voucher.accounts)) {
      voucher.accounts.forEach((account: any) => {
        totalDebit += parseFloat(account.debit) || 0;
        totalCredit += parseFloat(account.credit) || 0;
      });
    }

    return { totalDebit, totalCredit };
  };

  const filteredVouchersWithFilters = useMemo(() => {
    let filtered = filteredVouchers;

    if (filterValues.voucherDate) {
      filtered = filtered.filter((v) => {
        const voucherDate = toYMDLocal(v.voucher_date);
        return voucherDate === filterValues.voucherDate;
      });
    }

    if (filterValues.voucherNo.trim()) {
      const searchTerm = filterValues.voucherNo.toLowerCase().trim();
      filtered = filtered.filter((v) =>
        (v.voucher_no?.toString().toLowerCase() || "").includes(searchTerm)
      );
    }

    if (filterValues.description.trim()) {
      const searchTerm = filterValues.description.toLowerCase().trim();
      filtered = filtered.filter((v) =>
        (v.description || v.entry_remarks || "").toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [filteredVouchers, filterValues]);

  const handleFilterChange = (field: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilterValues({
      voucherDate: "",
      voucherNo: "",
      description: "",
    });
  };

  // Calculate totals
  const totalDebitAll = filteredVouchersWithFilters.reduce((sum, v) => {
    const { totalDebit } = calculateVoucherTotals(v);
    return sum + totalDebit;
  }, 0);

  const totalCreditAll = filteredVouchersWithFilters.reduce((sum, v) => {
    const { totalCredit } = calculateVoucherTotals(v);
    return sum + totalCredit;
  }, 0);

  // Format month display
  const getMonthDisplay = () => {
    if (!vendorVoucherData?.month) return "";
    const [year, month] = vendorVoucherData.month.split("-");
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div
      className="table-responsive mb-3"
      style={{
        height: "40%",
        overflowY: "auto",
        backgroundColor: "white",
        border: "1px solid #ddd",
        borderRadius: "5px",
        maxHeight: "300px",
        position: "relative",
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
            zIndex: 2,
          }}
        >
          <tr>
            <th style={{ width: "3%" }}></th>
            <th style={{ width: "10%" }}>Voucher Date</th>
            <th style={{ width: "15%" }}>Voucher Type</th>
            <th style={{ width: "10%" }}>Voucher #</th>
            <th style={{ width: "10%" }}>Reference</th>
            <th style={{ width: "30%" }}>Description</th>
            <th style={{ width: "10%" }}>Debit</th>
            <th style={{ width: "10%" }}>Credit</th>
          </tr>

          <tr
            style={{
              backgroundColor: "#f0f0f0",
              fontWeight: "bold",
              fontSize: "25px",
            }}
          >
            <th style={{ padding: "4px" }}></th>
            <th style={{ padding: "4px" }}>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filterValues.voucherDate}
                onChange={(e) => handleFilterChange("voucherDate", e.target.value)}
                style={{
                  fontSize: "13px",
                  fontWeight: "bold",
                  padding: "2px 4px",
                  width: "100%",
                  backgroundColor: "white",
                  border: "1px solid #ced4da",
                }}
              />
            </th>
            <th></th>
            <th style={{ padding: "4px" }}>
              <input
                type="text"
                className="form-control form-control-sm"
                value={filterValues.voucherNo}
                onChange={(e) => handleFilterChange("voucherNo", e.target.value)}
                style={{
                  fontSize: "13px",
                  fontWeight: "bold",
                  padding: "2px 4px",
                  width: "100%",
                  backgroundColor: "white",
                  border: "1px solid #ced4da",
                }}
                placeholder="Search voucher #"
              />
            </th>
            <th></th>
            <th style={{ padding: "4px" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={filterValues.description}
                  onChange={(e) => handleFilterChange("description", e.target.value)}
                  style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    padding: "2px 4px",
                    width: "100%",
                    backgroundColor: "white",
                    border: "1px solid #ced4da",
                  }}
                  placeholder="Search description"
                />

                {(filterValues.voucherDate ||
                  filterValues.voucherNo ||
                  filterValues.description) && (
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={clearFilters}
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      padding: "2px 6px",
                      backgroundColor: "white",
                    }}
                    title="Clear all filters"
                  >
                    ✕
                  </button>
                )}
              </div>
            </th>
            <th></th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filteredVouchersWithFilters?.length > 0 ? (
            filteredVouchersWithFilters.map((voucher: any, index: number) => {
              const { totalDebit, totalCredit } =
                calculateVoucherTotals(voucher);

              return (
                <tr key={voucher.voucher_id || index}>
                  <td>
                    <div className="form-check d-flex justify-content-center">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedVoucherIds.includes(
                          voucher.voucher_id
                        )}
                        onChange={(e) =>
                          handleCheckboxChangeMain(e, voucher)
                        }
                      />
                    </div>
                  </td>

                  <td>
                    {voucher.voucher_date
                      ? (() => {
                          const date = new Date(voucher.voucher_date);
                          const day = String(date.getDate()).padStart(2, "0");
                          const month = String(date.getMonth() + 1).padStart(
                            2,
                            "0"
                          );
                          const year = date.getFullYear();
                          return `${day}/${month}/${year}`;
                        })()
                      : ""}
                  </td>

                  <td>{voucher.voucher_type || selectedVoucherType}</td>
                  <td>{voucher.voucher_no}</td>
                  <td>{voucher.reference_no || ""}</td>
                  <td style={{ textAlign: "left" }}>
                    {voucher.description ||
                      voucher.entry_remarks ||
                      "No description"}
                  </td>
                  <td>
                    {totalDebit > 0 ? totalDebit.toFixed(2) : "-"}
                  </td>
                  <td>
                    {totalCredit > 0 ? totalCredit.toFixed(2) : "-"}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={8} className="text-center py-4">
                <div className="text-muted">
                  <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                  <strong>No vouchers found</strong>
                  <div className="small mt-1">
                    {vendorVoucherData?.month ? (
                      <>
                        No data available for <strong>{getMonthDisplay()}</strong>
                        <br />
                        <span className="text-muted" style={{ fontSize: "11px" }}>
                          Try selecting a different month or create a new voucher
                        </span>
                      </>
                    ) : (
                      "No vouchers available for the selected filters"
                    )}
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {/* TOTALS FOOTER - Only show if there are records */}
      {filteredVouchersWithFilters.length > 0 && (
        <div className="p-2 bg-light border-top" style={{ fontSize: '12px', fontWeight: 'bold' }}>
          <div className="row">
            <div className="col-md-6">
              <span className="text-primary">Total Records: {filteredVouchersWithFilters.length}</span>
            </div>
            <div className="col-md-6 text-end">
              <span className="text-success">
                Total Debit: {totalDebitAll.toFixed(2)} | 
                Total Credit: {totalCreditAll.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};





  
const FormDetailTable = () => {
  // Function to determine if we should show FFCPV specific fields
  const isFFCPV = vendorVoucherData.voucherType === 'FFCPV';
  
  // Check if we should show I and C checkboxes (for MBPV and MCPV)
const showICCheckboxes = vendorVoucherData.voucherType === 'MBPV' || 
                         vendorVoucherData.voucherType === 'MCPV' ||
                         vendorVoucherData.voucherType === 'FMCPV' ||
                         vendorVoucherData.voucherType === 'CPM';  const showCGCheckboxes = vendorVoucherData.voucherType === 'FFCPV';
  
  // NEW: Helper variable for MBPV/MCPV
const isMBPVOrMCPV = vendorVoucherData.voucherType === 'MBPV' || 
                     vendorVoucherData.voucherType === 'MCPV' ||
                     vendorVoucherData.voucherType === 'FMCPV' ||
                     vendorVoucherData.voucherType === 'CPM';  
  return (
    <>
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
              {/* Conditionally show checkboxes based on voucher type */}
              {showICCheckboxes ? (
                <>
                  <th style={{ width: "2%" }}>I</th>
                  <th style={{ width: "2%" }}>C</th>
                </>
              ) : showCGCheckboxes ? (
                <>
                  <th style={{ width: "2%" }}>C</th>
                  <th style={{ width: "2%" }}>G</th>
                </>
              ) : (
                <th style={{ width: "3%" }}>V</th>
              )}
              
              <th style={{ width: isFFCPV ? "12%" : "12%" }}>
                {isFFCPV ? "Slip No" : "Party A/C"}
              </th>
              <th style={{ width: "12%" }}>Party</th>
              <th style={{ width: "10%" }}>Account Code</th>
              <th style={{ width: "18%" }}>Description</th>
              {!isFFCPV && (
                <th style={{ width: "12%" }}>Sub Acc Code</th>
              )}
              <th style={{ width: "10%" }}>
                {isFFCPV ? "Freight Amount" : "Cost"}
              </th>
              <th style={{ width: "10%" }}>
{vendorVoucherData.voucherType === 'MBPV' || 
 vendorVoucherData.voucherType === 'MCPV' || 
 vendorVoucherData.voucherType === 'FMCPV' || 
 vendorVoucherData.voucherType === 'CPM' || 
 vendorVoucherData.voucherType === 'FFCPV' ? 'Debit' : 'Credit'}
              </th>
              <th style={{ width: "10%" }}>Naration</th>
            </tr>
          </thead>
          <tbody>
            {localRowValues.map((item, rowIndex) => (
              <tr key={item.id || `form-row-${rowIndex}`}>
                {/* Checkbox column - Conditionally render based on voucher type */}
                {showICCheckboxes ? (
                  <>
                    {/* I Checkbox for MBPV/MCPV */}
                    <td className="text-center align-middle">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={item.checkedI === true}
                        onChange={(e) => {
                          if (isMBPVOrMCPV) {
                            handleICheckboxChange(rowIndex, e.target.checked);
                          } else {
                            handleInputChange(rowIndex, 'checkedI', e.target.checked);
                          }
                        }}
                      />
                    </td>
                    
                    {/* C Checkbox for MBPV/MCPV */}
                    <td className="text-center align-middle">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={item.checkedC === true}
                        onChange={(e) => {
                          if (isMBPVOrMCPV) {
                            handleCCheckboxChange(rowIndex, e.target.checked);
                          } else {
                            handleInputChange(rowIndex, 'checkedC', e.target.checked);
                          }
                        }}
                      />
                    </td>
                  </>
                ) : showCGCheckboxes ? (
                  <>
                    {/* C Checkbox for FFCPV (Customers) */}
                    <td className="text-center align-middle">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={item.checkedC === true}
                        onChange={(e) => {
                          if (isFFCPV) {
                            handleCCheckboxChangeFFCPV(rowIndex, e.target.checked);
                          }
                        }}
                      />
                    </td>
                    
                    {/* G Checkbox for FFCPV (Goods) */}
                    <td className="text-center align-middle">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={item.checkedG === true}
                        onChange={(e) => {
                          if (isFFCPV) {
                            handleGCheckboxChangeFFCPV(rowIndex, e.target.checked);
                          }
                        }}
                      />
                    </td>
                  </>
                ) : (
                  /* Single V Checkbox for other voucher types (MCRV, MBRV, etc.) */
                  <td className="text-center align-middle">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={item.checked === true}
                      onChange={(e) => handleCheckboxChange(rowIndex, e.target.checked)}
                    />
                  </td>
                )}

                {/* Slip No for FFCPV, Party A/C for others */}
                <td>
                  {isFFCPV ? (
                    <input
                      id={`slip-no-${rowIndex}`}
                      type="text"
                      className="form-control form-control-sm"
                      value={item.slip_no || ""}
                      onChange={(e) => handleInputChange(rowIndex, 'slip_no', e.target.value)}
                      onBlur={() => handleInputBlur(rowIndex, 'slip_no')}
                      placeholder="Click to select slip"
                      autoComplete="off"
                      onClick={(e) => {
                        if (freightSlips.length > 0) {
                          showSlipDropdownForRow(rowIndex, freightSlips);
                          e.preventDefault();
                        }
                      }}
                      style={{
                        cursor: "pointer",
                        backgroundColor: "white",
                        border: item.slip_no ? "1px solid #28a745" : "1px solid #ced4da"
                      }}
                      disabled={false}
                    />
                  ) : (
                    <input
                      id={`party-account-${rowIndex}`}
                      type="text"
                      className="form-control form-control-sm"
                      value={item.party_account || ""}
                      onChange={(e) => handleInputChange(rowIndex, 'party_account', e.target.value)}
                      onBlur={() => handleInputBlur(rowIndex, 'party_account')}
                      onClick={(e) => {
                        if (isMBPVOrMCPV) {
                          if (item.checkedI) {
                            showItemDropdownForRow(rowIndex);
                            e.preventDefault();
                          } else if (item.checkedC) {
                            handleInputClick(rowIndex, e);
                          } else {
                            e.preventDefault();
                            return;
                          }
                        } else {
                          handleInputClick(rowIndex, e);
                        }
                      }}
                      placeholder={isMBPVOrMCPV ? "Select I or C first" : "Select party"}
                      autoComplete="off"
                      style={{ 
                        cursor: isMBPVOrMCPV && !item.checkedI && !item.checkedC ? "not-allowed" : "pointer",
                        backgroundColor: isMBPVOrMCPV && !item.checkedI && !item.checkedC ? "#f5f5f5" : "white"
                      }}
                      disabled={isMBPVOrMCPV && !item.checkedI && !item.checkedC}
                    />
                  )}
                </td>

                {/* Party Name */}
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={item.party || ""}
                    onChange={(e) => handleInputChange(rowIndex, 'party', e.target.value)}
                    onBlur={() => handleInputBlur(rowIndex, 'party')}
                    placeholder="Party name"
                  />
                </td>

                {/* Account Code */}
                <td>
                  <input
                    ref={el => {
                      if (el) accountCodeRefs.current[rowIndex] = el;
                    }}
                    type="text"
                    className="form-control form-control-sm"
                    value={item.account_code || ""}
                    onChange={(e) => handleInputChange(rowIndex, 'account_code', e.target.value)}
                    onClick={(e) => handleAccountCodeClick(rowIndex, e)}
                    onKeyDown={(e) => handleAccountCodeKeyDown(rowIndex, e)}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = "#e8f4fd";
                    }}
                    onBlur={(e) => {
                      handleInputBlur(rowIndex, 'account_code');
                      e.target.style.backgroundColor = item.account_code ? "#f8f9fa" : "white";
                    }}
                    placeholder="Ctrl+L for list"
                    title="Click or press Ctrl+L to open account list"
                    autoComplete="off"
                    data-lov-trigger="true"
                    style={{ 
                      cursor: "pointer",
                      backgroundColor: item.account_code ? "#f8f9fa" : "white",
                      border: "1px solid #ced4da",
                      position: "relative"
                    }}
                  />
                </td>

                {/* Description */}
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={item.description || ""}
                    onChange={(e) => handleInputChange(rowIndex, 'description', e.target.value)}
                    onBlur={() => handleInputBlur(rowIndex, 'description')}
                    placeholder="Description"
                  />
                </td>

                {/* Sub Acc Code - Hidden for FFCPV */}
                {!isFFCPV && (
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={item.sub_acc_code || ""}
                      onChange={(e) => handleInputChange(rowIndex, 'sub_acc_code', e.target.value)}
                      onBlur={() => handleInputBlur(rowIndex, 'sub_acc_code')}
                      placeholder="Sub account code"
                    />
                  </td>
                )}

                {/* Freight Amount for FFCPV, Cost Center for others */}
                <td>
                  {isFFCPV ? (
                    <input
                      type="number"
                      className="form-control form-control-sm text-end"
                      value={item.freight_amount || ""}
                      onChange={(e) => handleInputChange(rowIndex, 'freight_amount', e.target.value)}
                      onBlur={() => handleInputBlur(rowIndex, 'freight_amount')}
                      placeholder=""
                      style={{
                        border: item.freight_amount ? "1px solid #28a745" : "1px solid #ced4da"
                      }}
                    />
                  ) : (
                    <input
                      id={`cost-center-${rowIndex}`}
                      type="text"
                      className="form-control form-control-sm"
                      value={item.cost_center || ""}
                      onChange={(e) => {
                        handleInputChange(rowIndex, 'cost_center', e.target.value);
                        setLocalRowValues(prev => {
                          const newRows = [...prev];
                          newRows[rowIndex].cost_center_id = null;
                          return newRows;
                        });
                      }}
                      onClick={(e) => handleCostCenterClick(rowIndex, e)}
                      placeholder="Select cost center"
                      autoComplete="off"
                      style={{ cursor: "pointer" }}
                    />
                  )}
                </td>
                
                <td>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="form-control form-control-sm text-end no-arrows"
defaultValue={
  vendorVoucherData.voucherType === 'MBPV' ||
  vendorVoucherData.voucherType === 'MCPV' ||
  vendorVoucherData.voucherType === 'FMCPV' ||
  vendorVoucherData.voucherType === 'CPM' ||
  vendorVoucherData.voucherType === 'FFCPV'
    ? item.debit ?? ""
    : item.credit ?? ""
}
onBlur={(e) => {
  const value = e.target.value;
  if (
    vendorVoucherData.voucherType === 'MBPV' ||
    vendorVoucherData.voucherType === 'MCPV' ||
    vendorVoucherData.voucherType === 'FMCPV' ||
    vendorVoucherData.voucherType === 'CPM' ||
    vendorVoucherData.voucherType === 'FFCPV'
  ) {
    handleInputChange(rowIndex, 'debit', value);
  } else {
    handleInputChange(rowIndex, 'credit', value);
  }
}}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.target.blur();
                      }
                    }}
                  />
                </td>

                {/* Narration */}
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={item.notation || ""}
                    onChange={(e) => handleInputChange(rowIndex, 'notation', e.target.value)}
                    onBlur={() => handleInputBlur(rowIndex, 'notation')}
                    placeholder={
                      vendorVoucherData.voucherType === 'FFCPV' 
                        ? "Auto-filled from slip" 
                        : "Auto-filled from description"
                    }
                    title={
                      vendorVoucherData.voucherType === 'FFCPV'
                        ? "Auto-filled from slip data. Click to edit manually."
                        : "Auto-filled from description above. Click to edit manually."
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* ADDED: Total Debit Section for FFCPV - NOW OUTSIDE THE TABLE CONTAINER */}
      {isFFCPV && (
        <div className="row mb-3">
          <div className="col-md-12">
            <div className="d-flex justify-content-end align-items-center p-2"
style={{
  backgroundColor: "#000000",   // proper black
  color: "#ffffff",             // text white (important)
  border: "1px solid #dee2e6",
  borderRadius: "3px",
  fontWeight: "bold"
}}

            >
              <div className="me-3">
                Total Debit for FFCPV:
              </div>
              <div style={{
                backgroundColor: "#000000",
                padding: "4px 12px",
                border: "1px solid #ced4da",
                borderRadius: "3px",
                minWidth: "100px",
                textAlign: "right",
                fontFamily: "'Courier New', monospace"
              }}>
                {totalDebit.toFixed()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};






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
            <th style={{ width: "10%" }}>Party</th>
            <th style={{ width: "15%" }}>Account Code</th>
            <th style={{ width: "20%" }}>Description</th>
            {/* REMOVE THIS COLUMN: <th style={{ width: "10%" }}>Sub Acc Code</th> */}
            {/* REMOVE THIS COLUMN: <th style={{ width: "10%" }}>Cost Center</th> */}
            <th style={{ width: "10%" }}>Debit</th>
            <th style={{ width: "10%" }}>Credit</th>
            <th style={{ width: "15%" }}>Narration</th>
          </tr>
        </thead>
        <tbody>
          {freightItems && Array.isArray(freightItems) && freightItems.length > 0 ? (
            freightItems.map((item, rowIndex) => (
              <tr key={item.voucher_account_id || `view-row-${rowIndex}`}>
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={item.party || item.vendor_name || item.customer_name || item.account_desc || ""}
                    readOnly={isDisabledAll}
                  />
                </td>

                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={item.account_code || ""}
                    readOnly={isDisabledAll}
                  />
                </td>

                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={item.account_desc || item.description || ""}
                    readOnly={isDisabledAll}
                  />
                </td>

                {/* REMOVE THIS CELL (Sub Acc Code): */}
                {/* <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={item.sub_acc_code || ""}
                    readOnly={isDisabledAll}
                  />
                </td> */}

                {/* REMOVE THIS CELL (Cost Center): */}
                {/* <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={item.cost_center || ""}
                    readOnly={isDisabledAll}
                  />
                </td> */}

                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm text-end"
                    value={Number(item.debit || 0).toFixed(2)}
                    readOnly={isDisabledAll}
                  />
                </td>

                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm text-end"
                    value={Number(item.credit || 0).toFixed(2)}
                    readOnly={isDisabledAll}
                  />
                </td>

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
            <>
              {Array(5)
                .fill(null)
                .map((_, rowIdx) => (
                  <tr key={`empty-view-row-${rowIdx}`}>
                    <td><input type="text" className="form-control form-control-sm" readOnly disabled /></td>
                    <td><input type="text" className="form-control form-control-sm" readOnly disabled /></td>
                    <td><input type="text" className="form-control form-control-sm" readOnly disabled /></td>
                    {/* REMOVE THESE TWO EMPTY CELLS: */}
                    {/* <td><input type="text" className="form-control form-control-sm" readOnly disabled /></td>
                    <td><input type="text" className="form-control form-control-sm" readOnly disabled /></td> */}
                    <td><input type="text" className="form-control form-control-sm" readOnly disabled /></td>
                    <td><input type="text" className="form-control form-control-sm" readOnly disabled /></td>
                    <td><input type="text" className="form-control form-control-sm" readOnly disabled /></td>
                  </tr>
                ))}
              
              {!selectedFreightId && (
                <tr>
                  {/* CHANGE colSpan FROM 8 TO 6 (since we removed 2 columns) */}
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


const btnMini = {
  fontSize: "16px",
  padding: "5px 18px",
  minWidth: "110px",
  whiteSpace: "nowrap",
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
    {/* SIMPLIFIED HEADER - ONLY TITLE AND ADD VOUCHER BUTTON */}
    <div
      className="row align-items-center mb-2 p-2"
      style={{
        backgroundColor: "#336699",
        color: "#fff",
        borderRadius: "5px",
        margin: 0,
        padding: "8px 12px",
      }}
    >
      <div className="col-md-12 d-flex align-items-center justify-content-between">
        <h5 className="mb-0" style={{ fontSize: "14px", fontWeight: "bold" }}>
          {pageTitles[selectedVoucherType]}
        </h5>

      </div>
    </div>

    {/* FILTER SECTION */}
    {!showVendorVoucherForm && (
      <div
        className="row mb-3 p-2"
        style={{
          backgroundColor: "#e9ecef",
          border: "1px solid #dee2e6",
          borderRadius: "3px",
        }}
      >
        <div className="col-md-2 mb-2">
          <label className="form-label fw-bold text-dark">Company</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value="Multan Feed"
            readOnly
            style={{ backgroundColor: "white" }}
          />
        </div>

        <div className="col-md-2 mb-2">
          <label className="form-label fw-bold text-dark">Branch</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value="Multan Feed"
            readOnly
            style={{ backgroundColor: "white" }}
          />
        </div>

<div className="col-md-2 mb-2">
  <label className="form-label fw-bold text-dark">Type</label>
  {selectedVoucherType === 'MCPV' || selectedVoucherType === 'FMCPV' || selectedVoucherType === 'CPM' ? (
    <select
      className="form-select form-select-sm"
      value={selectedVoucherType}
      onChange={(e) => {
        const newType = e.target.value;
        setSelectedVoucherType(newType);
        setVendorVoucherData(prev => ({
          ...prev,
          voucherType: newType
        }));
      }}
      style={{ backgroundColor: "white" }}
    >
      <option value="MCPV">Cash Payment Voucher (MCPV)</option>
      {/* <option value="FMCPV">Freight Mill Cash Payment Voucher (FMCPV)</option> */}
      <option value="CPM">Cash Payment Mill (CPM)</option>
    </select>
  ) : (
    <input
      type="text"
      className="form-control form-control-sm"
      value={getVoucherTypeDisplay(selectedVoucherType)}
      readOnly
      style={{
        cursor: "default",
        backgroundColor: "#f8f9fa",
        border: "1px solid #ced4da",
      }}
    />
  )}
</div>


<div className="col-md-2 mb-2">
  <label className="form-label fw-bold text-dark">Month</label>
  <input
    type="month"
    className="form-control form-control-sm"
    value={selectedMonth}
    onChange={(e) => {
      const newMonth = e.target.value;
      setSelectedMonth(newMonth);
      handleVendorVoucherChange("month", newMonth);
    }}
    style={{ backgroundColor: "white" }}
  />
</div>

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

        <div className="col-md-2">
          <label className="form-label fw-bold text-dark">Remarks Filter</label>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Filter by remarks..."
            value={remarksFilter}
            onChange={(e) => setRemarksFilter(e.target.value)}
          />
        </div>

        <div className="col-md-3 mb-2">
          <div className="d-flex align-items-end" style={{ height: "100%" }}>
            <div
              className="form-check d-flex align-items-center"
              style={{ paddingTop: "24px" }}
            >
              <input
                type="checkbox"
                className="form-check-input"
                id="foreignCurrency"
                style={{
                  width: "18px",
                  height: "18px",
                  marginRight: "8px",
                  marginTop: "0",
                }}
              />
              <label
                className="form-check-label fw-bold text-dark m-0"
                htmlFor="foreignCurrency"
                style={{
                  fontSize: "13px",
                  lineHeight: "1.2",
                }}
              >
                Foreign Currency
              </label>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* VENDOR VOUCHER FORM OR MAIN VOUCHERS TABLE */}
    {showVendorVoucherForm && <VendorVoucherForm />}
    {!showVendorVoucherForm && <MainVouchersTable />}

    {/* ✅ BUTTONS SECTION - NOW SINGLE LINE (LIKE SCREENSHOT) */}
    {!showVendorVoucherForm && (
      <div className="row mb-3">
        <div className="col-md-12">
          <div
            className="d-flex justify-content-center"
            style={{
              flexWrap: "nowrap",
              overflowX: "auto",
              gap: "4px",
            }}
          >


                    <button
          className="btn btn-light btn-sm"
          onClick={toggleVendorVoucherForm}
          style={{ fontSize: "12px", padding: "4px 12px", width: "auto" }}
        >
          {showVendorVoucherForm ? "Hide Form" : "Add Voucher"}
        </button>



                        <button
  className="btn btn-outline-primary"
  onClick={handleEdit}
  disabled={!selectedRow || selectedRow.status !== "PREPARED" }
  style={btnMini}
>
  Edit Voucher
</button>


            <button
              className="btn btn-outline-primary"
              onClick={handleChecked}
              disabled={!selectedRow || selectedRow.status !== "PREPARED" }
              // disabled={!selectedRow || selectedRow.status === "APPROVED" || selectedRow.status === "ONLINE" || selectedRow.status === "CHECKED"  || selectedRow.status === ""}
              style={btnMini}
            >
              Checked
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={handleApprove}
disabled={!selectedRow || (selectedRow.status !== "PREPARED" && selectedRow.status !== "CHECKED")}            >
              Approved
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={handleUnapprove}
              disabled={!selectedRow || selectedRow.status !== "APPROVED"}
              style={btnMini}
            >
              UnApproved
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={handleDelete}
              disabled={!selectedRow || selectedRow.status !== "PREPARED"}
              style={btnMini}
            >
              Delete
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={handleBalanceVoucher}
               disabled={!selectedRow || selectedRow.status !== "PREPARED"}
              title="Balance selected voucher"
              style={btnMini}
            >
              Balance Voucher
            </button>

            {/* <button
              className="btn btn-outline-primary"
              onClick={() => alert("U2 Notation clicked")}
              style={btnMini}
            >
              U2 Notation
            </button> */}

            <button
              className="btn btn-outline-primary"
              onClick={handleOnline}
              disabled={!selectedRow || selectedRow.status !== "APPROVED"}
              style={btnMini}
            >
              Online
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={handleCancel}
              style={btnMini}
            >
              Cancel
            </button>
                        <button
              className="btn btn-primary"
              onClick={handlePrinnt}
              disabled={!selectedFreightId}
              style={btnMini}
            >
              Print Voucher
            </button>
          </div>
        </div>
      </div>
    )}

    {/* DETAIL TABLE (FORM OR VIEW) */}
    {showVendorVoucherForm ? <FormDetailTable /> : <ViewDetailTable />}

    {/* DROPDOWN COMPONENTS */}
    <MasterAccountLOVDropdown />
    <CostCenterDropdown />
    <SlipDropdown />
    <VendorDropdown />
    <AccountLOVDropdown />
    <ItemDropdown />

    {/* OVERLAY CLICK HANDLERS */}
    {showDropdown && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9998,
        }}
        onClick={() => {
          setShowDropdown(false);
          setDropdownForRowIndex(null);
          setDropdownType(null);
        }}
      />
    )}

    {showAccountDropdown && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9997,
        }}
        onClick={() => {
          setShowAccountDropdown(false);
          setAccountDropdownForRowIndex(null);
          setIsAccountLOVOpen(false);
        }}
      />
    )}

    {showCostCenterDropdown && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9996,
        }}
        onClick={() => {
          setShowCostCenterDropdown(false);
          setCostCenterDropdownForRowIndex(null);
        }}
      />
    )}

    {showMasterAccountLOV && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
        }}
        onClick={() => setShowMasterAccountLOV(false)}
      />
    )}

    {showSlipDropdown && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9994,
        }}
        onClick={() => {
          setShowSlipDropdown(false);
          setSlipDropdownForRowIndex(null);
        }}
      />
    )}

    {showItemDropdown && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9995,
        }}
        onClick={() => {
          setShowItemDropdown(false);
          setItemDropdownForRowIndex(null);
        }}
      />
    )}

    {showCustomerDropdown && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
        }}
        onClick={() => {
          setShowCustomerDropdown(false);
        }}
      />
    )}
  </div>
  );
};

export default CashReceiptVoucher; 