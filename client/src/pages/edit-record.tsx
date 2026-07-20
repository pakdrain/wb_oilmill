
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import WeightIndicator from "@/components/weight-indicator";
import VideoStreamFullscreen from "@/components/video-stream-fullscreen";
import { useQuery } from "@tanstack/react-query";
import { useComPort } from "@/Comportcontext";

export default function EditRecord() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  
  // Form data state matching purchase form
  const [formData, setFormData] = useState({
    slipNo: "",
    slipInTime: "",
    slipOutTime: "",
    slipDate: "",
    status: "",
    entryType: "PURCHASE",
    firstWeight: "",
    secondWeight: "",
    netWeight: "",
    bardanaWeight: "",
    grossWeight: "",
    supplierWeight: "",
    qualityDeduction: "",
    vehicleNo: "",
    driverName: "",
    igpNo: "",
    igpDate: "",
    poNo: "",
    itemCode: "",
    itemDesc: "",
    poQty: "",
    igpQty: "",
    balanceQty: "",
    bardanaType: "",
    wtPerBag: "",
    noOfBags: "",
    bagCondition: "",
    vendor: "",
    vendorName: "",
    freight: "",
    remarks: "",
    branchId: "",
    branch: "",
    onlineEntry: "Yes",
    offlineEntry: "",
  });

  const { comPort } = useComPort();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    if (!formData.slipNo || formData.slipNo.trim() === "") {
      alert("Please enter a slip number");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/purchase/by-slip/${formData.slipNo.trim()}`);
      
      if (!response.ok) {
        alert(`No record found for slip number ${formData.slipNo}`);
        setSearchResults([]);
        setShowResults(false);
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (data && data.master) {
        const master = data.master;
        const details = data.details && data.details.length > 0 ? data.details[0] : {};
        
        // Load all the form data
        setFormData({
          slipNo: master.slip_no || "",
          vehicleNo: details.vehicle_no || "",
          firstWeight: master.first_weight ? String(master.first_weight) : "",
          secondWeight: master.second_weight ? String(master.second_weight) : "",
          netWeight: master.net_weight ? String(master.net_weight) : "",
          bardanaWeight: master.bardana_weight ? String(master.bardana_weight) : "",
          grossWeight: master.gross_weight ? String(master.gross_weight) : "",
          freight: master.freight ? String(master.freight) : "",
          remarks: master.remarks || "",
          driverName: master.driver_name || "",
          vendor: details.vendor_name || "",
          igpNo: details.igp_no || "",
          poNo: details.po_no || "",
          itemCode: details.item_code || "",
          itemDesc: details.item_desc || "",
          poQty: details.po_qty ? String(details.po_qty) : "",
          igpQty: details.igp_qty ? String(details.igp_qty) : "",
          balanceQty: details.balance_qty ? String(details.balance_qty) : "",
          bardanaType: details.bardana_type || details.baradana_type || "",
          wtPerBag: details.weight_per_bags ? String(details.weight_per_bags) : "",
          noOfBags: details.no_of_bags ? String(details.no_of_bags) : "",
          igpDate: details.igp_date || "",
          slipInTime: master.slip_in_time || "",
          slipOutTime: master.slip_out_time || "",
          entryType: master.entry_type || "PURCHASE",
          branch: master.branch_id ? String(master.branch_id) : "",
          branchId: master.branch_id ? String(master.branch_id) : "",
          qualityDeduction: details.quality_deduction ? String(details.quality_deduction) : "",
          supplierWeight: details.supplier_weight ? String(details.supplier_weight) : "",
          onlineEntry: master.online_entry || "Yes",
          offlineEntry: master.offline_entry || "",
          slipDate: master.slip_date || "",
          status: master.status || "",
          bagCondition: details.bag_condition || "",
          vendorName: details.vendor_name || "",
        });
        
        setSearchResults([data]);
        setShowResults(true);
      } else {
        alert("Invalid record data found");
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error("Error searching for slip:", error);
      alert("Failed to search for slip number");
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadRecord = (record: any) => {
    const master = record.master;
    const entryType = master.entry_type;
    const isOffline = master.offline_entry === "Yes";
    
    let targetUrl = "";
    const modeParam = isOffline ? "offline" : "online";
    
    if (entryType === "PURCHASE") {
      targetUrl = `/purchase-form?type=${modeParam}&edit=${master.wb_id}`;
    } else if (entryType === "PURCHASE_RETURN") {
      targetUrl = `/purchase-return?type=${modeParam}&edit=${master.wb_id}`;
    } else if (entryType === "SALE") {
      targetUrl = `/sales-form?type=${modeParam}&edit=${master.wb_id}`;
    } else if (entryType === "SALE_RETURN") {
      targetUrl = `/sales-return?type=${modeParam}&edit=${master.wb_id}`;
    } else {
      targetUrl = `/purchase-form?type=${modeParam}&edit=${master.wb_id}`;
    }
    
    console.log(`Found ${entryType} entry (${isOffline ? 'Offline' : 'Online'}), navigating to:`, targetUrl);
    window.location.href = targetUrl;
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const resetForm = () => {
    setFormData({
      slipNo: "",
      slipInTime: "",
      slipOutTime: "",
      slipDate: "",
      status: "",
      entryType: "PURCHASE",
      firstWeight: "",
      secondWeight: "",
      netWeight: "",
      bardanaWeight: "",
      grossWeight: "",
      supplierWeight: "",
      qualityDeduction: "",
      vehicleNo: "",
      driverName: "",
      igpNo: "",
      igpDate: "",
      poNo: "",
      itemCode: "",
      itemDesc: "",
      poQty: "",
      igpQty: "",
      balanceQty: "",
      bardanaType: "",
      wtPerBag: "",
      noOfBags: "",
      bagCondition: "",
      vendor: "",
      vendorName: "",
      freight: "",
      remarks: "",
      branchId: "",
      branch: "",
      onlineEntry: "Yes",
      offlineEntry: "",
    });
    setSearchResults([]);
    setShowResults(false);
  };

  // Fetch branches
  useEffect(() => {
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
    fetchBranches();
  }, []);

  // Get camera data
  const { data: camera } = useQuery({
    queryKey: ["/api/cameras/1"],
    enabled: true,
  });

  return (
    <div className="h-screen bg-gray-100 p-1 overflow-hidden relative">
      {/* Navigation Buttons */}
      <div className="flex justify-between items-center bg-white border rounded p-1 mb-1">
        <div className="flex gap-1 text-xs">
          <Button
            className="h-8 px-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleGoBack}
          >
            Cancel
          </Button>
          <Button
            className="h-8 px-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
          <Button
            className="h-8 px-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => {
              if (searchResults.length > 0) {
                handleLoadRecord(searchResults[0]);
              }
            }}
            disabled={searchResults.length === 0}
          >
            Load Record
          </Button>
          <Button
            className="h-8 px-2 text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white"
            onClick={resetForm}
          >
            Clear
          </Button>
        </div>
        <div className="flex gap-1 items-center">
      <WeightIndicator comPort={comPort} compact={true} />
          <button className="h-6 px-3 text-xs font-medium rounded transition-colors bg-green-500 hover:bg-green-600 text-white">
            ONLINE
          </button>
        </div>
        <div className="text-2xl text-green-600 font-bold">2500</div>
      </div>

      {/* Main Form Layout - matching purchase form */}
      <div className="bg-white p-1 rounded border h-[calc(100vh-30px)] overflow-hidden">
        <div className="grid grid-cols-12 gap-1 h-full">
          {/* Left Side - Main Form (Columns 1-8) */}
          <div className="col-span-8">
            {/* Master Table Section */}
            <div className="bg-blue-50 p-2 rounded border mb-4 w-full">
              <div className="grid grid-cols-9 gap-4">
                {/* Column 1 - Left Form Fields */}
                <div className="col-span-3 flex flex-col gap-2 items-start">
                  {/* Slip No - Now searchable */}
                  <div className="flex items-center gap-[2px]">
                    <Label className="text-xs text-black w-20">Slip No</Label>
                    <Input
                      name="slipNo"
                      value={formData.slipNo}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch();
                        }
                      }}
                      placeholder="Enter slip number to search"
                      className="h-8 text-xs text-black w-52"
                    />
                  </div>

                  {/* Net Weight */}
                  <div className="flex items-center gap-[2px]">
                    <Label className="text-xs text-black w-20">Net Weight</Label>
                    <Input
                      name="netWeight"
                      value={formData.netWeight}
                      onChange={handleChange}
                      className="h-8 text-xs bg-yellow-200 text-black w-52"
                    />
                  </div>

                  {/* Freight */}
                  <div className="flex items-center gap-[2px]">
                    <Label className="text-xs text-black w-20">Freight</Label>
                    <Input
                      name="freight"
                      value={formData.freight}
                      onChange={handleChange}
                      className="h-8 text-xs text-black w-52"
                    />
                  </div>

                  {/* Remarks */}
                  <div className="flex items-start gap-[2px]">
                    <Label className="text-xs text-black w-20 mt-1">Remarks</Label>
                    <Textarea
                      placeholder="Add remarks"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                      className="h-20 text-xs resize-none text-black placeholder:text-gray-500 w-60"
                    />
                  </div>
                </div>

                {/* Column 2 - Weight Fields */}
                <div className="col-span-3 flex flex-col gap-2 items-start">
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-black w-24">First Weight</Label>
                    <Input
                      name="firstWeight"
                      value={formData.firstWeight}
                      onChange={handleChange}
                      className="h-8 text-xs text-black w-52"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-black w-24">Second Weight</Label>
                    <Input
                      name="secondWeight"
                      value={formData.secondWeight}
                      onChange={handleChange}
                      className="h-8 text-xs text-green-600 w-52"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-black w-24">Bardana Weight</Label>
                    <Input
                      name="bardanaWeight"
                      value={formData.bardanaWeight}
                      onChange={handleChange}
                      className="h-8 text-xs text-black w-52"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-black w-24">Gross Weight</Label>
                    <Input
                      name="grossWeight"
                      value={formData.grossWeight}
                      readOnly
                      className="h-8 text-xs text-black w-52"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-black w-24">Branch</Label>
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
                      <SelectTrigger className="h-8 text-xs text-black w-52">
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
                  </div>
                </div>

                {/* Column 3 - Driver & Camera */}
                <div className="col-span-3 flex flex-col justify-between">
                  <div className="flex flex-col gap-2">
                    {/* Driver Name */}
                    <div className="flex items-center gap-1">
                      <Label className="text-xs text-black w-20">Driver Name</Label>
                      <Input
                        placeholder="Enter driver name"
                        name="driverName"
                        value={formData.driverName}
                        onChange={handleChange}
                        className="h-8 text-xs text-black placeholder:text-gray-500 w-52"
                      />
                    </div>
                  </div>

                  {/* Camera Feed */}
                  <div className="h-40 w-full overflow-hidden mb-1 rounded border">
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
                </div>
              </div>
            </div>

            {/* Large Label Between Sections */}
            <div className="text-center py-1 mb-3">
              <div className="inline-block px-4 py-1 rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <h2 className="text-3xl font-bold tracking-wide">Edit Record</h2>
              </div>
            </div>

            {/* Details Section */}
            <div className="bg-blue-50 p-2 rounded border">
              <div className="mt-1">
                <div className="grid grid-cols-3 gap-4 text-xs">
                  {/* First Column */}
                  <div className="flex flex-col gap-2">
                    {/* Bardana Type */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-black w-28">Bardana Type</span>
                      <Input
                        name="bardanaType"
                        value={formData.bardanaType}
                        onChange={handleChange}
                        className="h-8 text-xs text-black w-60"
                        placeholder="Enter bardana type"
                      />
                    </div>

                    {/* Wt per Bag */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-black w-28">Wt per Bag</span>
                      <Input
                        name="wtPerBag"
                        value={formData.wtPerBag}
                        onChange={handleChange}
                        className="h-8 text-xs text-black w-60"
                      />
                    </div>

                    {/* No of Bags */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-black w-28">No of Bags</span>
                      <Input
                        name="noOfBags"
                        value={formData.noOfBags}
                        onChange={handleChange}
                        className="h-8 text-xs text-black w-60"
                      />
                    </div>

                    {/* Quality */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-black w-28">Quality</span>
                      <Input
                        name="qualityDeduction"
                        value={formData.qualityDeduction}
                        onChange={handleChange}
                        className="h-8 text-xs text-black w-60"
                      />
                    </div>
                  </div>

                  {/* Second Column */}
                  <div className="flex flex-col gap-2">
                    {/* IGP No */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-black w-28">IGP No</span>
                      <Input
                        name="igpNo"
                        value={formData.igpNo}
                        onChange={handleChange}
                        className="h-8 text-xs text-black w-60"
                        placeholder="IGP Number"
                      />
                    </div>

                    {/* IGP Date */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-black w-28">IGP Date</span>
                      <Input
                        name="igpDate"
                        value={formData.igpDate}
                        onChange={handleChange}
                        className="h-8 text-xs text-black w-60"
                        placeholder="IGP Date"
                      />
                    </div>

                    {/* Vendor */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-black w-28">Vendor</span>
                      <Input
                        name="vendor"
                        value={formData.vendor}
                        onChange={handleChange}
                        className="h-8 text-xs text-black w-60"
                      />
                    </div>

                    {/* Vehicle No */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-black w-28">Vehicle No</span>
                      <Input
                        name="vehicleNo"
                        value={formData.vehicleNo}
                        onChange={handleChange}
                        className="h-8 text-xs text-black w-60"
                      />
                    </div>
                  </div>

                  {/* Third Column */}
                  <div className="space-y-2">
                    {/* Supplier Weight */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-black w-28">Supplier Weight</span>
                      <Input
                        name="supplierWeight"
                        value={formData.supplierWeight}
                        onChange={handleChange}
                        className="h-8 text-xs text-black w-60"
                      />
                    </div>

                    {/* Entry Type */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-black w-28">Entry Type</span>
                      <Input
                        name="entryType"
                        value={formData.entryType}
                        onChange={handleChange}
                        className="h-8 text-xs text-black w-60"
                        readOnly
                      />
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-black w-28">Status</span>
                      <Input
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="h-8 text-xs text-black w-60"
                      />
                    </div>
                  </div>
                </div>

                {/* Table Section */}
                <div className="border rounded text-xs h-[calc(100%-200px)] overflow-auto mt-4 -ml-4 mr-0" style={{ width: "calc(100% + 1rem)" }}>
                  <table className="w-full text-center">
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
                      <tr>
                        <td className="border p-1 h-4 text-xs text-black">
                          <Input
                            name="poNo"
                            value={formData.poNo}
                            onChange={handleChange}
                            className="h-4 text-xs text-black w-full border-none bg-transparent"
                            placeholder="PO Number"
                          />
                        </td>
                        <td className="border p-1 h-4 text-xs text-black">
                          <Input
                            name="itemCode"
                            value={formData.itemCode}
                            onChange={handleChange}
                            className="h-4 text-xs text-black w-full border-none bg-transparent"
                            placeholder="Item Code"
                          />
                        </td>
                        <td className="border p-1 h-4 text-xs text-black">
                          <Input
                            name="itemDesc"
                            value={formData.itemDesc}
                            onChange={handleChange}
                            className="h-4 text-xs text-black w-full border-none bg-transparent"
                            placeholder="Item Description"
                          />
                        </td>
                        <td className="border p-1 h-4 text-xs text-black">
                          <Input
                            name="poQty"
                            value={formData.poQty}
                            onChange={handleChange}
                            className="h-4 text-xs text-black w-full border-none bg-transparent"
                            placeholder="PO Qty"
                            type="number"
                          />
                        </td>
                        <td className="border p-1 h-4 text-xs text-black">
                          <Input
                            name="igpQty"
                            value={formData.igpQty}
                            onChange={handleChange}
                            className="h-4 text-xs text-black w-full border-none bg-transparent"
                            placeholder="IGP Qty"
                            type="number"
                          />
                        </td>
                        <td className="border p-1 h-4 text-xs text-black">
                          <Input
                            name="balanceQty"
                            value={formData.balanceQty}
                            onChange={handleChange}
                            className="h-4 text-xs text-black w-full border-none bg-transparent"
                            placeholder="Balance"
                            type="number"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Empty for now */}
          <div className="col-span-4">
            {/* This section matches purchase form layout */}
          </div>
        </div>
      </div>
    </div>
  );
}
