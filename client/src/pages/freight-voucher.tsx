import React, { useState, useEffect, useMemo, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation } from "wouter";

const FreightVoucher = () => {
  const [, setLocation] = useLocation();
  const [freightVouchers, setFreightVouchers] = useState<any[]>([]);
  const [freightDetails, setFreightDetails] = useState([]);
  const [selectedFreightId, setSelectedFreightId] = useState<string | number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState("1");
  const [docDateFilter, setDocDateFilter] = useState("");
  const LS_DOC_DATE = "fv_docDateFilter";
const LS_CREATION_DATE = "fv_creationEndDate";


  const [selectedVoucherType, setSelectedVoucherType] = useState("cpv");
  const [freightItems, setFreightItems] = useState<any[]>([]);
  const [selectedVoucherIds, setSelectedVoucherIds] = useState<(string | number)[]>([]);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [tableData, setTableData] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingWbId, setEditingWbId] = useState<number | string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("PREPARED");
  const [approvedVouchers, setApprovedVouchers] = useState<any[]>([]);
  const [onlineVouchers, setOnlineVouchers] = useState<any[]>([]);
  const [editingFreightId, setEditingFreightId] = useState<number | null>(null);
  const [creationEndDate, setCreationEndDate] = useState("");

  
  
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
  
  // // New states for filters
   const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [docNoSearch, setDocNoSearch] = useState("");
  const [voucherTypeFilter, setVoucherTypeFilter] = useState("all");
  const isSingleSelected = selectedVoucherIds.length === 1;

  const [remarksFilter, setRemarksFilter] = useState("");

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  useEffect(() => {
  // restore doc date filter
  const savedDocDate = localStorage.getItem(LS_DOC_DATE);
  if (savedDocDate) setDocDateFilter(savedDocDate);

  // restore creation date filter
  const savedCreation = localStorage.getItem(LS_CREATION_DATE);
  if (savedCreation) setCreationEndDate(savedCreation);
}, []);



// Save docNoSearch to localStorage
useEffect(() => {
  localStorage.setItem('fv_docNoSearch', docNoSearch);
}, [docNoSearch]);

// Save voucherTypeFilter to localStorage
useEffect(() => {
  localStorage.setItem('fv_voucherTypeFilter', voucherTypeFilter);
}, [voucherTypeFilter]);

// Save remarksFilter to localStorage
useEffect(() => {
  localStorage.setItem('fv_remarksFilter', remarksFilter);
}, [remarksFilter]);

useEffect(() => {
  // Try to load saved start/end dates from localStorage
  const savedStartDate = localStorage.getItem('fv_startDate');
  const savedEndDate = localStorage.getItem('fv_endDate');
  
  if (savedStartDate && savedEndDate) {
    setStartDate(savedStartDate);
    setEndDate(savedEndDate);
  } else {
    // Only set defaults if no saved dates exist
    const today = new Date();
    
    // Get first day of previous month
    const firstDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    
    // Format previous month's first day
    const formattedFirstDayOfPreviousMonth = formatDate(firstDayOfPreviousMonth);
    
    // Set start date to first day of previous month
    setStartDate(formattedFirstDayOfPreviousMonth);
    
    // Set end date to today's date (current date)
    setEndDate(formatDate(today));
  }
}, []);



// ✅ Always return YYYY-MM-DD without timezone shifts
const toYMD = (value: any) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return String(value).slice(0, 10); // handles ISO strings like 2026-02-10T...
};




  // Filter vouchers by selectedStatus and other filters
  const filteredVouchers = useMemo(() => {
    let filtered = freightVouchers;
    
    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter((voucher) => voucher.status === selectedStatus);
    }
    
    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // Start of day
      
      filtered = filtered.filter(voucher => {
        if (!voucher.doc_date) return false;
        
        const docDate = new Date(voucher.doc_date);
        docDate.setHours(0, 0, 0, 0); // Normalize time
        
        return docDate >= start;
      });
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of day
      
      filtered = filtered.filter(voucher => {
        if (!voucher.doc_date) return false;
        
        const docDate = new Date(voucher.doc_date);
        return docDate <= end;
      });
    }



    // Filter by creation_date (To)
if (creationEndDate) {
  const cEnd = new Date(creationEndDate);
  cEnd.setHours(23, 59, 59, 999);
  
  const cStart = new Date(creationEndDate);
  cStart.setHours(0, 0, 0, 0);

  filtered = filtered.filter(voucher => {
    if (!voucher.creation_date) return false;
    const cDate = new Date(voucher.creation_date);
    return cDate >= cStart && cDate <= cEnd;
  });
}




if (docDateFilter) {
  filtered = filtered.filter(voucher => {
    if (!voucher.doc_date) return false;
    
    // Extract just the date part from the voucher doc_date
    const voucherDate = voucher.doc_date.split('T')[0]; // Gets YYYY-MM-DD
    
    // Compare with the selected filter date
    return voucherDate === docDateFilter;
  });
}


    // Filter by doc no search
    if (docNoSearch.trim() !== "") {
      const searchTerm = docNoSearch.toLowerCase();
      filtered = filtered.filter(voucher => {
        const docNo = (voucher.wb_doc_no || voucher.doc_no || "").toString().toLowerCase();
        return docNo.includes(searchTerm);
      });
    }
    
    // Filter by voucher type - CORRECTED: Use freight_type field
    if (voucherTypeFilter !== "all") {
      filtered = filtered.filter(voucher => {
        const freightType = (voucher.freight_type || "").toLowerCase();
        return freightType === voucherTypeFilter.toLowerCase();
      });
    }
    
    // Filter by remarks
    if (remarksFilter.trim() !== "") {
      const searchRemarks = remarksFilter.toLowerCase();
      filtered = filtered.filter(voucher => {
        const remarks = (voucher.remarks || "").toLowerCase();
        return remarks.includes(searchRemarks);
      });
    }
    
    return filtered;
  }, [freightVouchers,docDateFilter, selectedStatus, startDate, endDate, docNoSearch, voucherTypeFilter,creationEndDate, remarksFilter]);

  

  
  const handleVoucherFieldChange = useCallback((
    freightId: string,
    field: string,
    value: any
  ) => {
    setFreightVouchers(prev =>
      prev.map(v =>
        v.freight_id === freightId ? { ...v, [field]: value } : v
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

  const fetchVoucherData = async (freightId: number) => {
    try {
      const masterRes = await fetch(`/api/freight-vouchers/${freightId}/details`);
      const master = await masterRes.json();

      if (!master || master.length === 0) return null;

      const detailsRes = await fetch(`/api/freight-items?freightId=${freightId}`);
      const details = await detailsRes.json();

      return {
        master: master[0],
        details: details,
      };
    } catch (err) {
      console.error("fetchVoucherData Error:", err);
      return null;
    }
  };



//   useEffect(() => {
//   // Try to get saved status from localStorage
//   const savedStatus = localStorage.getItem('freightVoucherStatus');
//   if (savedStatus) {
//     setSelectedStatus(savedStatus);
//   } else {
//     // Default to "PREPARED" if nothing saved
//     setSelectedStatus("PREPARED");
//   }
  
//   // Set default dates (existing code)
//   const today = new Date();
//   const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//   const formattedFirstDay = formatDate(firstDayOfMonth);
  
//   setStartDate(formattedFirstDay);
//   setEndDate(formatDate(today));
// }, []);






const handleDelete = async () => {
  if (!selectedRow) {
    alert("Please select a voucher to delete");
    return;
  }

  if (!window.confirm(`Are you sure you want to delete voucher ${selectedRow.voucher_no}? This action cannot be undone.`)) {
    return;
  }

  try {
    // Backend API endpoint aur method ke hisaab se update
    const response = await fetch(`/api/freight/${selectedRow.freight_id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: 1 }) // Or actual userId from your auth
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete voucher");
    }

    const data = await response.json();

    // Remove the deleted row from state
    setFreightVouchers(prev =>
      prev.filter(row => row.freight_id !== selectedRow.freight_id)
    );

    // Clear selected row
    setSelectedRow(null);
    
    // Message backend response ke hisaab se update
    alert(`Voucher ${selectedRow.voucher_no} deleted successfully! Deleted ${data.deletedItemsCount} items.`);
  } catch (err) {
    console.error("Error deleting voucher:", err);
    alert(err.message || "Error deleting voucher");
  }
};



const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const newStatus = e.target.value;
  setSelectedStatus(newStatus);
  
  // Save to localStorage
  localStorage.setItem('freightVoucherStatus', newStatus);
};



const handleApprove = async () => {
  if (selectedVoucherIds.length === 0) {
    alert("Please select at least one voucher to approve");
    return;
  }

  try {
    // Option A (works with your existing API): approve one-by-one
    const results = await Promise.all(
      selectedVoucherIds.map(async (id) => {
        const res = await fetch(`/api/freight/approve/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: 1 }),
        });

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(`Approve failed for Freight ID ${id}. ${msg}`);
        }

        return res.json(); // expects { freight }
      })
    );

    // Update state with returned approved freight rows
    setFreightVouchers((prev) => {
      const map = new Map(prev.map((v) => [v.freight_id, v]));
      results.forEach((r: any) => {
        if (r?.freight?.freight_id) map.set(r.freight.freight_id, r.freight);
      });
      return Array.from(map.values());
    });

    alert(`✅ Approved ${selectedVoucherIds.length} voucher(s) successfully!`);

    // After bulk approval, you can clear selection (recommended)
    setSelectedVoucherIds([]);
    setSelectedRow(null);
    setSelectedFreightId(null);
    setFreightItems([]);

  } catch (err: any) {
    console.error(err);
    alert(err.message || "Error approving voucher(s)");
  }
};



  

  const handleUnapprove = async () => {
    if (!selectedRow) {
      alert("Please select an approved entry to unapprove.");
      return;
    }

    if (selectedRow.status !== "APPROVED") {
      alert("Only approved entries can be unapproved.");
      return;
    }

    try {
      const response = await fetch(`/api/freight/unapprove/${selectedRow.freight_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          updatedBy: JSON.parse(sessionStorage.getItem("user") || "{}")?.userId || 1 
        })
      });

      if (!response.ok) {
        throw new Error("Failed to unapprove entry");
      }

      const updatedVouchers = freightVouchers.map((v) =>
        v.freight_id === selectedRow.freight_id
          ? { ...v, status: "PREPARED" }
          : v
      );

      setFreightVouchers(updatedVouchers);
      setSelectedRow(null);
      setSelectedVoucherIds([]);
      alert("Entry successfully unapproved and moved to PREPARED.");

    } catch (err) {
      console.error("Unapprove error:", err);
      alert("Error unapproving entry");
    }
  };

  const handleCancel = () => {
    console.log("Cancel clicked");
  };

  const handleOnline = async () => {
    if (selectedVoucherIds.length === 0) {
      alert("Please select a voucher!");
      return;
    }

    const freightId = Number(selectedVoucherIds[0]);

    try {
      const voucherData = await fetchVoucherData(freightId);

      if (!voucherData || voucherData.master.status !== "APPROVED") {
        alert("❌ Only approved vouchers can go online!");
        return;
      }

      console.log("📤 Sending approved data to IGP:", voucherData);

      const igpResponse = await fetch(
        "http://portal.sabirsgroup.com:8184/ords/sabroso_ords/wb/freight",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(voucherData),
        }
      );

      const rawText = await igpResponse.text();
      console.log("🔍 IGP RAW RESPONSE:", rawText);

      let igpData: any;

      try {
        const cleaned = rawText
          .replace(/,\s*}/g, "}")
          .replace(/,\s*]/g, "]")
          .replace(/"\s*:\s*{\s*{/g, '": {')
          .replace(/}\s*}/g, '}');

        igpData = JSON.parse(cleaned);
      } catch (err) {
        console.error("JSON parse error:", err);
        alert("IGP returned invalid JSON:\n" + rawText);
        return;
      }

      console.log("🔍 Parsed IGP Data:", igpData);

      alert(`IGP Response:\nStatus: ${igpData.res_status}\nMessage: ${igpData.res_message}`);

      if (igpData.res_status === 2 || igpData.res_status === "2") {
        const onlineMaster = igpData.master;
        const voucherId = igpData.voucher_id;

        const updateResp = await fetch(`/api/freight/online/${freightId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voucher_id: voucherId }),
        });

        const updateData = await updateResp.json();
        if (!updateData.success) {
          alert("❌ Failed to update local DB: " + (updateData.error || ""));
          return;
        }

        const saveVoucherResp = await fetch("/api/vouchers/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            voucher_id: onlineMaster.voucher_id,
            voucherType: onlineMaster.voucher_type,
            docDate: onlineMaster.voucher_date,
            remarks: onlineMaster.description,
            createdBy: onlineMaster.created_by,
            creationDate: onlineMaster.creation_date,
            last_updated_by: onlineMaster.last_updated_by,
            status: onlineMaster.status,
            branch: Number(onlineMaster.branch_id),
            docNo: onlineMaster.module_doc_id,
            approved_by: onlineMaster.approved_by,
            approval_date: onlineMaster.approval_date,
            company_name: onlineMaster.company_id,
          }),
        });

        const savedVoucher = await saveVoucherResp.json();
        if (!savedVoucher.success) {
          alert("❌ Failed to save voucher master!");
          return;
        }

        const details =
          igpData.details ||
          igpData.voucher_accounts ||
          igpData.voucher_details ||
          igpData.account_details ||
          igpData.accounts ||
          null;

        console.log("🔍 Extracted DETAILS from IGP:", details);

        if (!details || !Array.isArray(details) || details.length === 0) {
          alert("❌ IGP did not return any voucher details!");
          return;
        }

        const mappedDetails = details.map((d, index) => {
          const mapped = {
            voucher_account_id: d.voucher_account_id,
            voucher_id: savedVoucher.voucher_id,
            account_id: Number(d.account_id) || 0,
            debit: Number(d.debit) || 0,
            credit: Number(d.credit) || 0,
            naration: d.naration ? String(d.naration).substring(0, 4000) : "",
            created_by: Number(d.created_by) || onlineMaster.created_by || 1,
            creation_date: d.creation_date
              ? new Date(d.creation_date).toISOString()
              : new Date().toISOString(),
            last_updated_by: Number(d.last_updated_by) || onlineMaster.created_by || 1,
            last_update_date: d.last_update_date
              ? new Date(d.last_update_date).toISOString()
              : new Date().toISOString(),
            reference_id: d.reference_id != null ? Number(d.reference_id) : 0,
            vendor_id: d.vendor_id != null ? Number(d.vendor_id) : 0,
            branch_id: onlineMaster.branch_id || 1,
          };

          console.log(`🔹 Mapped DETAIL #${index + 1}:`, mapped);
          return mapped;
        });

        console.log("📤 Sending mapped voucher accounts to backend:", mappedDetails);

        const saveAccountsResp = await fetch("/api/voucher-accounts/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            voucherId: savedVoucher.voucher_id,
            details: mappedDetails,
          }),
        });

        const savedAccounts = await saveAccountsResp.json();
        console.log("📥 Response from /api/voucher-accounts/save:", savedAccounts);

        if (!savedAccounts.success) {
          alert("❌ Failed to save voucher accounts! " + (savedAccounts.error || ""));
          return;
        }

        setApprovedVouchers(prev => prev.filter(v => v.freight_id !== freightId));
        setOnlineVouchers(prev => [
          ...prev,
          { ...onlineMaster, status: "ONLINE", voucher_id: voucherId },
        ]);

        alert("✅ Entry moved ONLINE and voucher saved successfully!");
      }
    } catch (error) {
      console.error("❌ Error sending online:", error);
      alert("❌ Error sending online!");
    }
  };



// const handleOnline = async () => {
//   if (selectedVoucherIds.length === 0) {
//     alert("Please select a voucher!");
//     return;
//   }

//   const freightId = Number(selectedVoucherIds[0]);

//   try {
//     const voucherData = await fetchVoucherData(freightId);

//     if (!voucherData || voucherData.master.status !== "APPROVED") {
//       alert("❌ Only approved vouchers can go online!");
//       return;
//     }

//     console.log("📤 Sending approved data to IGP:", voucherData);

//     const igpResponse = await fetch(
//       "http://84.16.235.111:2128/api/wb-freight",
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: 
//         JSON.stringify(voucherData),
//       }
//     );

//     const rawText = await igpResponse.text();
//     console.log("🔍 IGP RAW RESPONSE:", rawText);

//     let igpData: any;

//     try {
//       const cleaned = rawText
//         .replace(/,\s*}/g, "}")
//         .replace(/,\s*]/g, "]")
//         .replace(/"\s*:\s*{\s*{/g, '": {')
//         .replace(/}\s*}/g, '}');

//       igpData = JSON.parse(cleaned);
//     } catch (err) {
//       console.error("JSON parse error:", err);
//       alert("IGP returned invalid JSON:\n" + rawText);
//       return;
//     }

//     console.log("🔍 Parsed IGP Data:", igpData);

//     alert(`IGP Response:\nStatus: ${igpData.res_status}\nMessage: ${igpData.res_message}`);

//     if (igpData.res_status === 2 || igpData.res_status === "2") {
//       const onlineMaster = igpData.master || {};
//       const voucherId = igpData.voucher_id;

//       // Update local freight status to ONLINE
//       const updateResp = await fetch(`/api/freight/online/${freightId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ voucher_id: voucherId }),
//       });

//       const updateData = await updateResp.json();
//       if (!updateData.success) {
//         alert("❌ Failed to update local DB: " + (updateData.error || ""));
//         return;
//       }

//       // Prepare master data from IGP response
//       const masterData = {
//         voucher_id: onlineMaster.voucher_id || voucherId || null,
//         voucher_type: onlineMaster.voucher_type || "MCPV",
//         voucher_no: onlineMaster.voucher_no || null,
//         voucher_date: onlineMaster.voucher_date || new Date().toISOString(),
//         description: onlineMaster.description || voucherData.master.remarks || "",
//         created_by: onlineMaster.created_by || 1,
//         creation_date: onlineMaster.creation_date || new Date().toISOString(),
//         last_updated_by: onlineMaster.last_updated_by || onlineMaster.created_by || 1,
//         status: onlineMaster.status || "ONLINE",
//         approved_by: onlineMaster.approved_by || 1,
//         approval_date: onlineMaster.approval_date || new Date().toISOString(),
//         branch_id: String(onlineMaster.branch_id || voucherData.master.branch_id || "8"),
//         module: onlineMaster.module || "GL",
//         module_doc: onlineMaster.module_doc || "FREIGHT",
//         module_doc_id: onlineMaster.module_doc_id || voucherData.master.igp_no || null,
//         reference_no: onlineMaster.reference_no || voucherData.master.doc_no || "",
//         checked_by: onlineMaster.checked_by || 1,
//         checked_date: onlineMaster.checked_date || new Date().toISOString(),
//         currency: onlineMaster.currency || "PKR",
//         exchange_rate: onlineMaster.exchange_rate || 1,
//         ref_date: onlineMaster.ref_date || onlineMaster.voucher_date || new Date().toISOString(),
//         paid_amount: onlineMaster.paid_amount || voucherData.master.amount || 0,
//         last_update_date: onlineMaster.last_update_date || new Date().toISOString(),
//         acc_id: onlineMaster.acc_id || 28,
//         company_id: onlineMaster.company_id || 5,
//         entry_remarks: onlineMaster.entry_remarks || onlineMaster.description || voucherData.master.remarks || "",
//         company_name: onlineMaster.company_name || "SABROSO"
//       };

//       // Prepare details data from IGP response
//       const detailsData = igpData.details || 
//                           igpData.voucher_accounts || 
//                           igpData.voucher_details || 
//                           igpData.account_details || 
//                           [];

//       // Map details to match table structure
//       const mappedDetails = detailsData.map((detail: any, index: number) => ({
//         voucher_account_id: detail.voucher_account_id || null,
//         voucher_id: masterData.voucher_id || voucherId,
//         account_id: Number(detail.account_id) || 0,
//         debit: Number(detail.debit) || 0,
//         credit: Number(detail.credit) || 0,
//         naration: detail.naration ? String(detail.naration).substring(0, 1000) : "",
//         created_by: Number(detail.created_by) || masterData.created_by || 1,
//         creation_date: detail.creation_date || new Date().toISOString(),
//         last_updated_by: Number(detail.last_updated_by) || masterData.created_by || 1,
//         last_update_date: detail.last_update_date || new Date().toISOString(),
//         reference_id: detail.reference_id != null ? Number(detail.reference_id) : null,
//         vendor_id: detail.vendor_id != null ? Number(detail.vendor_id) : null
//       }));

//       console.log("📤 Prepared master data:", masterData);
//       console.log("📤 Prepared details data:", mappedDetails);

//       // Use the comprehensive API to save both master and details
//       const saveVoucherResp = await fetch("/api/vouchers/save-complete", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           master: masterData,
//           details: mappedDetails
//         }),
//       });

//       const savedVoucher = await saveVoucherResp.json();
      
//       if (!saveVoucherResp.ok || !savedVoucher.success) {
//         console.error("❌ Failed to save voucher:", savedVoucher);
//         alert("❌ Failed to save voucher: " + (savedVoucher.error || savedVoucher.details || "Unknown error"));
//         return;
//       }

//       console.log("✅ Voucher saved successfully:", savedVoucher);

//       // Update local state
//       setApprovedVouchers(prev => prev.filter(v => v.freight_id !== freightId));
//       setOnlineVouchers(prev => [
//         ...prev,
//         { 
//           ...voucherData.master, 
//           status: "ONLINE", 
//           voucher_id: savedVoucher.voucher_id,
//           freight_id: freightId 
//         },
//       ]);

//       alert(`✅ Entry moved ONLINE!\nVoucher ID: ${savedVoucher.voucher_id}\nDetails saved: ${savedVoucher.details_count || 0}`);
      
//       // Clear selection
//       setSelectedVoucherIds([]);
      
//       // ⭐⭐ IMPORTANT: REFRESH THE PAGE ⭐⭐
//       // Option 1: Full page reload (simplest)
//       window.location.reload();
      
//       // Option 2: Reset states and refetch data (if you don't want full reload)
//       // setSelectedRow(null);
//       // setFreightItems([]);
//       // fetchFreightVouchers(); // Refetch to get updated status
      
//     } else {
//       alert("❌ IGP did not return success status. Voucher not saved.");
//     }
//   } catch (error: any) {
//     console.error("❌ Error in handleOnline:", error);
//     alert("❌ Error sending online: " + (error.message || "Unknown error"));
//   }
// };





  
  const handleExit = () => {
    console.log("Exit clicked");
  };

  const fetchFreightVouchers = async () => {
    try {
      const response = await fetch("/api/freight-vouchers");
      if (response.ok) {
        const data: any[] = await response.json();
        setFreightVouchers(data);
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

const fetchFreightItems = async (freightId: number | string) => {
  try {
    const response = await fetch(`/api/freight-items?freightId=${freightId}`);
    if (response.ok) {
      const data = await response.json();
      console.log("Freight items API response:", data);
      
      // Return the data as-is with all fields from API
      return Array.isArray(data) 
        ? data.map((d) => ({ 
            ...d, 
            freight_id: freightId,
            // Make sure we have the vendor_name from either vendor_name or party_name
            vendor_name: d.vendor_name || d.party_name || ""
          })) 
        : [];
    }
  } catch (error) {
    console.error("❌ Error fetching freight items:", error);
  }
  return [];
};

const handleCheckboxChange = async (
  event: React.ChangeEvent<HTMLInputElement>,
  voucher: any
) => {
  const isChecked = event.target.checked;

  setSelectedVoucherIds((prev) => {
    const id = voucher.freight_id;

    // ✅ add/remove from selected list
    const next = isChecked
      ? Array.from(new Set([...prev, id]))
      : prev.filter((x) => x !== id);

    return next;
  });

  // ✅ If exactly 1 selected -> load detail
  // ✅ If 0 or multiple selected -> clear detail (optional but recommended)
  try {
    if (isChecked) {
      // we need to know what selection becomes, so compute it here too:
      const currentSelected = selectedVoucherIds;
      const nextSelected = Array.from(new Set([...currentSelected, voucher.freight_id]));

      if (nextSelected.length === 1) {
        setSelectedRow(voucher);
        setSelectedFreightId(voucher.freight_id);

        const items = await fetchFreightItems(voucher.freight_id);
        const itemsWithVendor = (items || []).map((item: any) => ({
          ...item,
          remarks: item.remarks || voucher.remarks || "",
          vendor_name: item.vendor_name || item.party_name || "",
          debit_name: item.debit_name || "",
          credit_name: item.credit_name || "",
          item_desc: item.item_desc || "",
          freight_amount: item.freight_amount || "0.00",
        }));

        setFreightItems(itemsWithVendor);
      } else {
        // multiple selected -> clear detail view
        setSelectedRow(null);
        setSelectedFreightId(null);
        setFreightItems([]);
      }
    } else {
      // unchecked
      const nextSelected = selectedVoucherIds.filter((x) => x !== voucher.freight_id);

      if (nextSelected.length === 1) {
        const onlyId = nextSelected[0];
        const onlyVoucher = freightVouchers.find((v) => v.freight_id === onlyId);

        if (onlyVoucher) {
          setSelectedRow(onlyVoucher);
          setSelectedFreightId(onlyId);

          const items = await fetchFreightItems(onlyId);
          const itemsWithVendor = (items || []).map((item: any) => ({
            ...item,
            remarks: item.remarks || onlyVoucher.remarks || "",
            vendor_name: item.vendor_name || item.party_name || "",
            debit_name: item.debit_name || "",
            credit_name: item.credit_name || "",
            item_desc: item.item_desc || "",
            freight_amount: item.freight_amount || "0.00",
          }));

          setFreightItems(itemsWithVendor);
        }
      } else {
        setSelectedRow(null);
        setSelectedFreightId(null);
        setFreightItems([]);
      }
    }
  } catch (err) {
    console.error(err);
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

  if (selectedRow.status === "APPROVED") {
    alert("❌ Approved entries cannot be edited. Please unapprove first.");
    return;
  }

  const nonEditableStatuses = ["ONLINE", "CANCELLED", "CHECKED"];
  if (nonEditableStatuses.includes(selectedRow.status)) {
    alert(`❌ Entries with status "${selectedRow.status}" cannot be edited.`);
    return;
  }

  const freightId = selectedRow.freight_id;
  if (!freightId) {
    alert("❌ No freight_id found.");
    return;
  }

  try {
    // ✅ 1) MASTER API (single object)
    const masterRes = await fetch(`/api/freight-vouchers/${freightId}`);
    if (!masterRes.ok) throw new Error("Failed to load master");
    const master = await masterRes.json();

    // ✅ 2) DETAILS API (array)
    const detailRes = await fetch(`/api/freight-vouchers/${freightId}/details`);
    if (!detailRes.ok) throw new Error("Failed to load details");
    const details = await detailRes.json(); // array

    // ✅ pick the first row (your details API returns rows array)
    const detailMaster = Array.isArray(details) && details.length > 0 ? details[0] : {};

    // ✅ 3) ITEMS
    const itemsRes = await fetch(`/api/freight-items?freightId=${freightId}`);
    if (!itemsRes.ok) throw new Error("Failed to load items");
    const items = await itemsRes.json();

    // ✅ Merge master + details (if both contain same fields, details overwrites master)
    const mergedMaster = { ...master, ...detailMaster };

    // ✅ Prepare payload for FreightEntry
    const payload = {
      master: mergedMaster,
      items: Array.isArray(items) ? items : [],
      branch: String(mergedMaster.branch_id || selectedBranch || "1"),
      voucherType: String(mergedMaster.freight_type || "IGP"),
      status: String(mergedMaster.status || "PREPARED"),
      freightId: freightId
    };

    localStorage.setItem("freightEditData", JSON.stringify(payload));

    // ✅ Navigate to entry in edit mode
    const params = new URLSearchParams();
    params.set("voucherId", String(freightId));
    params.set("mode", "edit");
    setLocation(`/voucher-entry?${params.toString()}`);
  } catch (err: any) {
    console.error("❌ Edit load error:", err);
    alert(err.message || "Failed to load entry for edit");
  }
};



























  const handleViewEntry = () => {
    if (!selectedRow) return;
    setFormData(selectedRow);
    setIsEditMode(false);
    setEditingWbId(selectedRow.id);
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

  // Handle detail field change
// Handle detail field change
const handleDetailFieldChange = useCallback((rowIndex: number, field: string, value: any) => {
  const updatedItems = [...freightItems];
  updatedItems[rowIndex] = {
    ...updatedItems[rowIndex],
    [field]: value
  };
  setFreightItems(updatedItems);
}, [freightItems]);









useEffect(() => {
  // Load saved status from localStorage
  const savedStatus = localStorage.getItem('freightVoucherStatus');
  if (savedStatus) {
    setSelectedStatus(savedStatus);
  }
  
  fetchFreightVouchers();
  fetchItemsList();
  fetchVendorsList();
}, [selectedStatus]); // Keep dependency as selectedStatus





  
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


  // Save start date to localStorage when changed
const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setStartDate(value);
  localStorage.setItem('fv_startDate', value);
};

// Save end date to localStorage when changed
const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setEndDate(value);
  localStorage.setItem('fv_endDate', value);
};

  // Clear all filters and reset to today's date
const clearFilters = () => {
  const today = new Date();
  const formattedToday = formatDate(today);

  setStartDate(formattedToday);
  setEndDate(formattedToday);

  setCreationEndDate("");
  setDocDateFilter("");

  setDocNoSearch("");
  setVoucherTypeFilter("all");
  setRemarksFilter("");

  // ✅ clear persisted filters
  localStorage.removeItem(LS_DOC_DATE);
  localStorage.removeItem(LS_CREATION_DATE);
  localStorage.removeItem('fv_startDate');
  localStorage.removeItem('fv_endDate');
  localStorage.removeItem('fv_docNoSearch');
  localStorage.removeItem('fv_voucherTypeFilter');
  localStorage.removeItem('fv_remarksFilter');
};


  // Set first day of current month
  const setFirstDayOfMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(formatDate(firstDay));
    setEndDate(formatDate(lastDay));
  };



  

const handlePrint = async () => {
  console.log("Selected Freight ID:", selectedFreightId);

  if (!selectedFreightId) {
    alert("Please select a voucher to print.");
    return;
  }

  try {
    const response = await fetch(`/freightreport/${selectedFreightId}`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Freight API Response:", result);

    if (!result.success || !result.data || result.data.length === 0) {
      alert("No freight data found for the selected ID.");
      return;
    }

    const freightData = result.data;

    const first = freightData[0];
    const currentUserName =
      JSON.parse(sessionStorage.getItem("user") || "{}")?.userName || "admin";

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
    
    // Start serial number from 1
    let serialNo = 1;
    const rows = freightData
      .map((item: any) => {
        const amount = parseFloat(item.freight_amount || 0);
        totalDr += amount;
        totalCr += amount;

        // Format amount without unnecessary decimals
        const formattedAmount =
          amount % 1 === 0
            ? amount.toLocaleString("en-US")
            : amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        // Debit row with current serial number
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
        
        // Increment serial number for credit row
        serialNo++;
        
        // Credit row with next serial number
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
        
        // Increment for next item's debit row
        serialNo++;
        
        return debitRow + creditRow;
      })
      .join("");

    const formatDate = (dateString: any) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB");
    };

    // Format totals without unnecessary decimals
    const formattedTotalDr =
      totalDr % 1 === 0
        ? totalDr.toLocaleString("en-US")
        : totalDr.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const formattedTotalCr =
      totalCr % 1 === 0
        ? totalCr.toLocaleString("en-US")
        : totalCr.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const printContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Times New Roman; font-size: 20px; margin: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    table, th, td { border: 1px solid black; }
    th, td { padding: 8px; }
    th { background-color: #f2f2f2; }
    .amount { text-align: right; }
    .total-row { font-weight: bold; background-color: #e8e8e8; }
    
    .footer {
      display: flex;
      justify-content: space-between;
      margin-top: 15%;
      gap: 30px;
    }

    .signature-box {
      flex: 1;
      text-align: center;
    }

    .signature-line {
      border-top: 1px solid black;
      margin-bottom: 5px;
    }
  </style>
</head>
<body>

<h2 style="text-align:center;">MULTAN FEEDS (PVT.) LTD.</h2>
<h3 style="text-align:center;text-decoration:underline;">FREIGHT VOUCHER</h3>

<p><strong>Voucher #:</strong>_______</p>
<p style="margin-left: 80%; font-size: 20px;"><strong>Date:</strong> ${
      new Date(voucherInfo.voucher_date)
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: '2-digit'
        })
        .replace(/ /g, '-')
        .toUpperCase()
    }</p>

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
  </div>

  <div class="signature-box">
    <div class="signature-line"></div>
    <div>Checked By</div>
  </div>
  
  <div class="signature-box">
    <div class="signature-line"></div>
    <div>Approved By</div>
  </div>
  
  <div class="signature-box">
    <div class="signature-line"></div>
    <div>Received By</div>
    <div style="margin-top: 40%; font-size: 20px;">
      Doc No: ${voucherInfo.voucher_id || 'N/A'}
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
      printWindow.onload = () => printWindow.print();
    }
  } catch (error) {
    console.error("❌ Error fetching freight voucher:", error);
    alert("Failed to fetch freight voucher data for printing.");
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

      {/* Header */}
      <div
        className="d-flex justify-content-between align-items-center px-2 py-1 rounded"
        style={{ 
          backgroundColor: "#336699", 
          color: "#fff",
          fontWeight: 500,
          fontSize: "1.1rem"
        }}
      >
        Voucher View
      </div>

      {/* Form Filters */}
      <div className="row mt-3 mb-2">
        <div className="col-md-2">
          <label className="form-label fw-bold text-dark">Status</label>
<select
  className="form-select form-select-sm"
  value={selectedStatus}
  onChange={handleStatusChange} // Changed to use new handler
>
  <option value="PREPARED">PREPARED</option>
  <option value="APPROVED">APPROVED</option>
  <option value="ONLINE">ONLINE</option>
  <option value="CHECKED">CHECKED</option>
  <option value="CANCELLED">CANCELLED</option>
</select>
        </div>

        <div className="col-md-4">
          <label className="form-label fw-bold text-dark">Branch</label>
          <select
            className="form-select form-select-sm"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="shahzor">MULTAN FEEDS </option>
          </select>
        </div>

        {/* <div className="col-md-2">
          <label className="form-label fw-bold text-dark">Voucher Type</label>
          <select
            className="form-select form-select-sm"
            value={selectedVoucherType}
            onChange={(e) => setSelectedVoucherType(e.target.value)}
          >
            <option value="cpv">IGP</option>
            <option value="cv">CV</option>
          </select>
        </div> */}


      </div>

      {/* Date Range Filters with Quick Date Options */}
      <div className="row mt-2 mb-3">
<div className="col-md-2">
  <label className="form-label fw-bold text-dark">Start Date</label>
  <input
    type="date"
    className="form-control form-control-sm"
    value={startDate}
    onChange={handleStartDateChange}
  />
</div>

<div className="col-md-2">
  <label className="form-label fw-bold text-dark">End Date</label>
  <input
    type="date"
    className="form-control form-control-sm"
    value={endDate}
    onChange={handleEndDateChange}
  />
</div>
        
        {/* <div className="col-md-2">
          <label className="form-label fw-bold text-dark">Doc No Search</label>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search by Doc No..."
            value={docNoSearch}
            onChange={(e) => setDocNoSearch(e.target.value)}
          />
        </div> */}
        
        {/* <div className="col-md-2">
          <label className="form-label fw-bold text-dark">Voucher Type Filter</label>
          <select
            className="form-select form-select-sm"
            value={voucherTypeFilter}
            onChange={(e) => setVoucherTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="cpv">CPV</option>
            <option value="cv">CV</option>
            <option value="bank">Bank</option>
            <option value="igp">IGP</option>
            <option value="jv">JV</option>
          </select>
        </div> */}
        
        {/* <div className="col-md-2">
          <label className="form-label fw-bold text-dark">Remarks Filter</label>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Filter by remarks..."
            value={remarksFilter}
            onChange={(e) => setRemarksFilter(e.target.value)}
          />
        </div> */}
        
        <div className="col-md-2 d-flex align-items-end gap-2">
          <button
            className="btn btn-outline-primary btn-sm w-100"
            onClick={setFirstDayOfMonth}
          >
            Current Month
          </button>
          <button
            className="btn btn-outline-secondary btn-sm w-100"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Master Table */}
<div className="d-flex mt-3">
  <div
    className="table-responsive"
    style={{
      maxHeight: "300px",
      overflowY: "auto",
    }}
  >
    <table
      className="table table-bordered table-sm text-center mb-0"
      style={{
        borderSpacing: "0 4px",
        tableLayout: "auto",
        width: "100%",
      }}
    >
      <thead
        style={{
          backgroundColor: "#f0f0f0",
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}
      >
        {/* Header Row */}
        <tr>
          <th></th>
          <th>Doc #</th>
          <th>Voucher Type</th>
          <th>Doc Date</th>
          <th>Creation Date</th>
          <th>Remarks</th>
        </tr>

        {/* ✅ Filter Row */}
        <tr>
          <th></th>

          {/* Doc # Search */}
          <th>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search Doc #..."
              value={docNoSearch}
              onChange={(e) => setDocNoSearch(e.target.value)}
            />
          </th>

          {/* Voucher Type Filter */}
          <th>
            <select
              className="form-select form-select-sm"
              value={voucherTypeFilter}
              onChange={(e) => setVoucherTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="cpv">CPV</option>
              <option value="cv">CV</option>
              <option value="bank">Bank</option>
              <option value="igp">IGP</option>
              <option value="jv">JV</option>
            </select>
          </th>

          {/* ✅ Doc Date Filter */}
          <th>
            <input
              type="date"
              className="form-control form-control-sm"
              value={docDateFilter}
onChange={(e) => {
  const v = e.target.value;
  setDocDateFilter(v);
  localStorage.setItem(LS_DOC_DATE, v);
}}
            />
          </th>

          {/* Creation Date Filter */}
          <th>
            <input
              type="date"
              className="form-control form-control-sm"
              value={creationEndDate}
onChange={(e) => {
  const v = e.target.value;
  setCreationEndDate(v);
  localStorage.setItem(LS_CREATION_DATE, v);
}}
            />
          </th>

          {/* Remarks Filter */}
          <th>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Filter by remarks..."
              value={remarksFilter}
              onChange={(e) => setRemarksFilter(e.target.value)}
            />
          </th>
        </tr>
      </thead>

      <tbody>
        {filteredVouchers.length > 0
          ? filteredVouchers.map((voucher) => (
              <tr
                key={voucher.freight_id}
                className={
                  selectedVoucherIds.includes(voucher.freight_id)
                    ? "table-active"
                    : ""
                }
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedVoucherIds.includes(voucher.freight_id)}
                    onChange={(e) => handleCheckboxChange(e, voucher)}
                  />
                </td>

                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={voucher.wb_doc_no || voucher.doc_no || ""}
                    onChange={(e) =>
                      handleVoucherFieldChange(
                        voucher.freight_id,
                        "wb_doc_no",
                        e.target.value
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={voucher.freight_type || ""}
                    onChange={(e) =>
                      handleVoucherFieldChange(
                        voucher.freight_id,
                        "freight_type",
                        e.target.value
                      )
                    }
                  />
                </td>

<td>
  <input
    type="date"
    className="form-control form-control-sm"
    value={
      voucher.doc_date
        ? (() => {
            const date = new Date(voucher.doc_date);
            // Add 5 hours (5 * 60 * 60 * 1000 milliseconds)
            date.setTime(date.getTime() + (5 * 60 * 60 * 1000));
            // Format to YYYY-MM-DD
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          })()
        : ""
    }
    onChange={(e) =>
      handleVoucherFieldChange(
        voucher.freight_id,
        "doc_date",
        e.target.value
      )
    }
  />
</td>

                <td>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={
                      voucher.creation_date
                        ? new Date(voucher.creation_date)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      handleVoucherFieldChange(
                        voucher.freight_id,
                        "creation_date",
                        e.target.value
                      )
                    }
                  />
                </td>

                <td style={{ width: "40%", minWidth: "450px" }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    style={{ width: "100%" }}
                    value={voucher.remarks || ""}
                    onChange={(e) =>
                      handleVoucherFieldChange(
                        voucher.freight_id,
                        "remarks",
                        e.target.value
                      )
                    }
                  />
                </td>
              </tr>
            ))
          : null}
      </tbody>
    </table>
  </div>
</div>




<div className="col-md-12 d-flex align-items-end gap-2 flex-wrap">

  <button
    className="btn btn-success btn-sm"
    onClick={handleNewEntry}
  >
    New Entry
  </button>

  <button
    className="btn btn-success btn-sm"
    onClick={handleApprove}
  >
    Approve
  </button>

  <button
    className="btn btn-success btn-sm"
    onClick={handleDelete}
  >
    Delete
  </button>

  <button
    className="btn btn-success btn-sm"
    onClick={handleUnapprove}
  >
    Unapprove
  </button>

<button
  className="btn btn-success btn-sm"
  onClick={handleOnline}
  disabled={!isSingleSelected}
>
  Online
</button>



<button
  type="button"
  className="btn btn-warning btn-sm"
  onClick={handleEditEntry}
  disabled={
    !isSingleSelected ||
    !selectedRow ||
    ["APPROVED", "ONLINE", "CANCELLED", "CHECKED"].includes(selectedRow?.status)
  }
>
  Edit
</button>



<button
  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded shadow ml-auto disabled:opacity-50"
  onClick={handlePrint}
  disabled={!isSingleSelected || !selectedFreightId}
>
  Print Voucher
</button>

</div>





      {/* Detail Table */}
      <div
        className="table-responsive"
        style={{
          height: "30%",
          overflowY: "auto",
          position: "relative",
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
              {/* <th>IGP #</th> */}
              <th>Vendor Name</th>
              {/* <th>Delivery Terms</th> */}
              <th>Item Desc</th>
              <th>Freight</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Narration</th>
            </tr>
          </thead>
          <tbody>
            {freightItems && Array.isArray(freightItems) && freightItems.length > 0 ? (
              freightItems.map((item, rowIndex) => (
                <tr key={item.freight_item_id || `freight-item-${rowIndex}`}>
                  {/* IGP # */}
                  {/* <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={item.igp_no || "Unknown IGP"}
                      readOnly
                    />
                  </td> */}

                  {/* Vendor Name */}
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={item.vendor_name || item.party_name || item.customer_name || item.supplier_name || ""}
                      onClick={() => handleCellClick(rowIndex, 'vendor')}
                      readOnly={isDisabledAll}
                      placeholder="Click to select vendor"
                    />
                  </td>

                  {/* Delivery Terms */}
                  {/* <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={item.delivery_terms || "N/A"}
                      onChange={(e) => handleDetailFieldChange(rowIndex, 'delivery_terms', e.target.value)}
                      readOnly={isDisabledAll}
                    />
                  </td> */}

                  {/* Item Desc */}
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={item.item_desc}
                      onClick={() => handleCellClick(rowIndex, 'item')}
                      readOnly={isDisabledAll}
                      placeholder="Click to select item"
                    />
                  </td>

                  {/* Freight */}
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={item.freight_amount || "0.00"}
                      onChange={(e) => handleDetailFieldChange(rowIndex, 'freight_amount', e.target.value)}
                      readOnly={isDisabledAll}
                    />
                  </td>

{/* Debit */}
<td>
  <input
    type="text"
    className="form-control form-control-sm"
    value={item.debit_name || item.debit || "0.00"}
    onChange={(e) => handleDetailFieldChange(rowIndex, 'debit_name', e.target.value)}
    readOnly={isDisabledAll}
  />
</td>

{/* Credit */}
<td>
  <input
    type="text"
    className="form-control form-control-sm"
    value={item.credit_name || item.credit || "0.00"}
    onChange={(e) => handleDetailFieldChange(rowIndex, 'credit_name', e.target.value)}
    readOnly={isDisabledAll}
  />
</td>

                  {/* Narration */}
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={item.remarks || ""}
                      onChange={(e) => handleDetailFieldChange(rowIndex, 'remarks', e.target.value)}
                      readOnly={isDisabledAll}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <>
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>
                    <strong>
                      {selectedFreightId
                        ? "No freight items found for selected freight voucher"
                        : "Select a freight voucher to view details"}
                    </strong>
                  </td>
                </tr>
                {Array(8)
                  .fill(null)
                  .map((_, rowIdx) => (
                    <tr key={`empty-row-${rowIdx}`}>
                      {Array(8)
                        .fill(null)
                        .map((_, colIdx) => (
                          <td key={`empty-cell-${rowIdx}-${colIdx}`}>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              readOnly
                            />
                          </td>
                        ))}
                    </tr>
                  ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FreightVoucher;