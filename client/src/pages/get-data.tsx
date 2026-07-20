import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function GetData() {
  const [url, setUrl] = useState("");
  const [vendorUrl, setVendorUrl] = useState("");
  const [sysConfigUrl, setSysConfigUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [sysConfigLoading, setSysConfigLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [vendorMessage, setVendorMessage] = useState("");
  const [sysConfigMessage, setSysConfigMessage] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [vendorResponse, setVendorResponse] = useState<any>(null);
  const [sysConfigResponse, setSysConfigResponse] = useState<any>(null);
  const [chartAccountsUrl, setChartAccountsUrl] = useState("");
  const [chartAccountsLoading, setChartAccountsLoading] = useState(false);
  const [chartAccountsMessage, setChartAccountsMessage] = useState("");
  const [chartAccountsResponse, setChartAccountsResponse] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
const [customersLoading, setCustomersLoading] = useState(false);
const [customersMessage, setCustomersMessage] = useState("");
const [customersResponse, setCustomersResponse] = useState<any>(null);

const [itemsLoading, setItemsLoading] = useState(false);
const [itemsMessage, setItemsMessage] = useState("");
const [itemsResponse, setItemsResponse] = useState<any>(null);

 const { toast } = useToast();









// const handleFetchData = async () => {
//   if (!url.trim()) {
//     toast({
//       title: "Error",
//       description: "Please enter a valid URL",
//       variant: "destructive",
//     });
//     return;
//   }

//   setLoading(true);
//   setMessage("");
//   setResponse(null);

//   try {
//     // Decide API based on URL content
//     let apiEndpoint = "/api/fetch-and-save-vendors"; // default
//     if (url.includes("MULTAN_FEED_INV_ITEMS")) {
//       apiEndpoint = "/api/fetch-and-save-items"; // inventory items API
//     }

//     const response = await fetch(apiEndpoint, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ url: url.trim() }),
//     });

//     const result = await response.json();

//     if (!response.ok) {
//       throw new Error(result.error || result.details || "Failed to fetch data");
//     }

//   setResponse(result);

// // ORDS response ke liye (most likely)
// if (result.data?.items) {
//   setPreviewData(result.data.items.slice(0, 10));
// } else if (result.items) {
//   setPreviewData(result.items.slice(0, 10));
// } else {
//   setPreviewData([]);
// }

//     setMessage(
//       `✅ Successfully fetched and saved ${
//         result.recordsInserted
//       } records to ${result.targetTable} table`
//     );
//     toast({
//       title: "Success",
//       description: `Successfully fetched and saved ${result.recordsInserted} records to ${result.targetTable} table`,
//     });
//   } catch (error: any) {
//     console.error("Error fetching data:", error);
//     const errorMsg = error.message || "Failed to fetch and save data";
//     setMessage(`❌ Error: ${errorMsg}`);
//     toast({
//       title: "Error",
//       description: errorMsg,
//       variant: "destructive",
//     });
//   } finally {
//     setLoading(false);
//   }
// };


  const fetchAndSaveVendorData = async () => {
  const staticUrl = "http://portal.sabirsgroup.com:8184/ords/sabroso_ords/wb/VENDORS";
  
  setVendorLoading(true);
  setVendorMessage("");
  setVendorResponse(null);

  try {
    const response = await fetch("/api/fetch-and-save-vendors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: staticUrl }),
    });

    const data = await response.json();

    if (response.ok) {
      setVendorMessage(
        `✅ ${data.message} (${data.recordsInserted} records inserted into ${data.targetTable})`,
      );
      setVendorResponse(data);
    } else {
      setVendorMessage(`❌ Error: ${data.error || "Unknown error"}`);
    }
  } catch (error: any) {
    setVendorMessage(`❌ Network error: ${error.message}`);
  } finally {
    setVendorLoading(false);
  }
};

  const fetchAndSaveSysConfigData = async () => {
  //const staticSysConfigUrl = "http://portal.sabirsgroup.com:8184/ords/sabroso_ords/wb/segment_id";
  
const staticSysConfigUrl = "http://portal.sabirsgroup.com:8184/ords/sabroso_ords/webridge_igp/segment_id";



  setSysConfigLoading(true);
  setSysConfigMessage("");
  setSysConfigResponse(null);

  try {
    const response = await fetch("/api/fetch-and-save-sys-config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: staticSysConfigUrl }),
    });

    const data = await response.json();

    if (response.ok) {
      setSysConfigMessage(
        `✅ ${data.message} (${data.recordsInserted} records inserted into ${data.targetTable || 'sys_data_configg'} table)`,
      );
      setSysConfigResponse(data);
    } else {
      setSysConfigMessage(`❌ Error: ${data.error || "Unknown error"}`);
    }
  } catch (error: any) {
    setSysConfigMessage(`❌ Network error: ${error.message}`);
  } finally {
    setSysConfigLoading(false);
  }
};

  const fetchAndSaveChartAccountsData = async () => {
  const staticChartAccountsUrl = "http://portal.sabirsgroup.com:8184/ords/sabroso_ords/wb/CHART_OF_ACCOUNT_SHAHZOR";
  
  setChartAccountsLoading(true);
  setChartAccountsMessage("");
  setChartAccountsResponse(null);

  try {
    const response = await fetch("/api/fetch-and-save-chart-accounts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: staticChartAccountsUrl }),
    });

    const data = await response.json();

    if (response.ok) {
      setChartAccountsMessage(
        `✅ ${data.message} (${data.recordsInserted} records inserted into chart_of_accounts table)`,
      );
      setChartAccountsResponse(data);
    } else {
      setChartAccountsMessage(`❌ Error: ${data.error || "Unknown error"}`);
    }
  } catch (error: any) {
    setChartAccountsMessage(`❌ Network error: ${error.message}`);
  } finally {
    setChartAccountsLoading(false);
  }
};




// Items API URL (aapko confirm karna hoga)
const ITEMS_API_URL = "http://portal.sabirsgroup.com:8184/ords/sabroso_ords/wb/MULTAN_FEED_INV_ITEMS"; // Example URL, aap apni actual URL daalein

// Customers API URL (Vendors wali same API use kar rahe hain)
const CUSTOMERS_API_URL = "http://portal.sabirsgroup.com:8184/ords/sabroso_ords/wb/CUSTOMERS"; // Same as vendors URL

// Fetch and Save Customers Function
const fetchAndSaveCustomersData = async () => {
  const staticCustomersUrl = CUSTOMERS_API_URL;
  
  setCustomersLoading(true);
  setCustomersMessage("");
  setCustomersResponse(null);

  try {
    const response = await fetch("/api/fetch-and-save-vendors", { // Same API endpoint
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: staticCustomersUrl }),
    });

    const data = await response.json();

    if (response.ok) {
      setCustomersMessage(
        `✅ ${data.message} (${data.recordsInserted} records inserted into customers table)`,
      );
      setCustomersResponse(data);
    } else {
      setCustomersMessage(`❌ Error: ${data.error || "Unknown error"}`);
    }
  } catch (error: any) {
    setCustomersMessage(`❌ Network error: ${error.message}`);
  } finally {
    setCustomersLoading(false);
  }
};

// Fetch and Save Items Function
const fetchAndSaveItemsData = async () => {
  const staticItemsUrl = ITEMS_API_URL;
  
  if (!staticItemsUrl) {
    setItemsMessage("❌ Items API URL not configured");
    return;
  }

  setItemsLoading(true);
  setItemsMessage("");
  setItemsResponse(null);

  try {
    const response = await fetch("/api/fetch-and-save-items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: staticItemsUrl }),
    });

    const data = await response.json();

    if (response.ok) {
      setItemsMessage(
        `✅ ${data.message} (${data.recordsInserted} records inserted into items table)`,
      );
      setItemsResponse(data);
    } else {
      setItemsMessage(`❌ Error: ${data.error || "Unknown error"}`);
    }
  } catch (error: any) {
    setItemsMessage(`❌ Network error: ${error.message}`);
  } finally {
    setItemsLoading(false);
  }
};




  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-2">
          <Download className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-white-900">Get Data</h1>
        </div>

      {/* URL Data Section */}
{/* <Card>
  <CardHeader>
    <CardTitle>Fetch Data from URL</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="url">Enter URL</Label>
      <Input
        id="url"
        type="url"
        placeholder="https://example.com/api/data"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={loading}
      />
    </div>

    <Button
     // onClick={handleFetchData}
      disabled={loading || !url.trim()}
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Fetching Data...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Fetch and Save Data
        </>
      )}
    </Button>

    {message && (
      <Alert className={message.includes("✅") ? "border-green-500" : "border-red-500"}>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    )}
  </CardContent>
</Card> */}

{/* Fetched Data Preview */}
{/* {response && (
  <Card>
    <CardHeader>
      <CardTitle>Fetched Data Preview</CardTitle>
    </CardHeader>
    <CardContent>
      {response.targetTable === "inv_items" ? (
        // Inventory items preview
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 text-sm">
          {JSON.stringify(response.items || [], null, 2)}
        </pre>
      ) : (
        // Vendor or other data preview
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 text-sm">
          {JSON.stringify(response.data || [], null, 2)}
        </pre>
      )}
    </CardContent>
  </Card>
)} */}


        {/* Vendor Data Section */}
        <Card>
          <CardHeader>
            <CardTitle>Fetch and Save Vendor Data</CardTitle>
            {/* <CardDescription>
              Enter API URL to fetch vendor/customer data and save to database
            </CardDescription> */}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              {/* <Input
                placeholder="Enter vendor/customer API URL..."
                value={vendorUrl}
                onChange={(e) => setVendorUrl(e.target.value)}
                className="flex-1"
              /> */}
              <Button
                onClick={fetchAndSaveVendorData}
                disabled={vendorLoading}
                className="px-6"
              >
                {vendorLoading ? "Fetching..." : "Fetch & Save Vendors"}
              </Button>
            </div>

            {vendorMessage && (
              <Alert className={vendorMessage.includes("✅") ? "border-green-500" : "border-red-500"}>
                <AlertDescription>{vendorMessage}</AlertDescription>
              </Alert>
            )}

            {/* {vendorResponse && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Response Preview:</h4>
                <pre className="text-sm overflow-auto max-h-40">
                  {JSON.stringify(vendorResponse.data, null, 2)}
                </pre>
              </div>
            )} */}
          </CardContent>
        </Card>

        {/* System Config Data Section */}
        <Card>
          <CardHeader>
            <CardTitle>Fetch and Save System Config Data</CardTitle>
            {/* <CardDescription>
              Enter API URL to fetch system configuration data and save to sys_data_configg table
            </CardDescription> */}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              {/* <Input
                placeholder="Enter system config API URL..."
                value={sysConfigUrl}
                onChange={(e) => setSysConfigUrl(e.target.value)}
                className="flex-1"
              /> */}
              <Button
                onClick={fetchAndSaveSysConfigData}
                disabled={sysConfigLoading}
                className="px-6"
              >
                {sysConfigLoading ? "Fetching..." : "Fetch & Save Config"}
              </Button>
            </div>

            {sysConfigMessage && (
              <Alert className={sysConfigMessage.includes("✅") ? "border-green-500" : "border-red-500"}>
                <AlertDescription>{sysConfigMessage}</AlertDescription>
              </Alert>
            )}

            {/* {sysConfigResponse && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Response Preview:</h4>
                <pre className="text-sm overflow-auto max-h-40">
                  {JSON.stringify(sysConfigResponse.data, null, 2)}
                </pre>
              </div>
            )} */}
          </CardContent>
        </Card>



        {/* Customers Data Section */}
<Card>
  <CardHeader>
    <CardTitle>Fetch and Save Customers Data</CardTitle>
    {/* <CardDescription>
      Fetch customers data from API and save to customers table
    </CardDescription> */}
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex space-x-2">
      <Button
        onClick={fetchAndSaveCustomersData}
        disabled={customersLoading}
        className="px-6"
      >
        {customersLoading ? "Fetching..." : "Fetch & Save Customers"}
      </Button>
    </div>

    {customersMessage && (
      <Alert className={customersMessage.includes("✅") ? "border-green-500" : "border-red-500"}>
        <AlertDescription>{customersMessage}</AlertDescription>
      </Alert>
    )}
{/* 
    {customersResponse && (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Response Preview:</h4>
        <pre className="text-sm overflow-auto max-h-40">
          {JSON.stringify(customersResponse.data, null, 2)}
        </pre>
      </div>
    )} */}
  </CardContent>
</Card>



{/* Items Data Section */}
<Card>
  <CardHeader>
    <CardTitle>Fetch and Save Items Data</CardTitle>
    {/* <CardDescription>
      Fetch items data from API and save to items table
    </CardDescription> */}
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex space-x-2">
      <Button
        onClick={fetchAndSaveItemsData}
        disabled={itemsLoading}
        className="px-6"
      >
        {itemsLoading ? "Fetching..." : "Fetch & Save Items"}
      </Button>
    </div>

    {itemsMessage && (
      <Alert className={itemsMessage.includes("✅") ? "border-green-500" : "border-red-500"}>
        <AlertDescription>{itemsMessage}</AlertDescription>
      </Alert>
    )}

    {/* {itemsResponse && (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Response Preview:</h4>
        <pre className="text-sm overflow-auto max-h-40">
          {JSON.stringify(itemsResponse.data, null, 2)}
        </pre>
      </div>
    )} */}
  </CardContent>
</Card>

        {/* Chart of Accounts Data Section */}
        <Card>
          <CardHeader>
            <CardTitle>Fetch and Save Chart of Accounts Data</CardTitle>
            {/* <CardDescription>
              Enter API URL to fetch Chart of Accounts data and save to chart_of_accounts table
            </CardDescription> */}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              {/* <Input
                placeholder="Enter Chart of Accounts API URL..."
                value={chartAccountsUrl}
                onChange={(e) => setChartAccountsUrl(e.target.value)}
                className="flex-1"
              /> */}
              <Button
                onClick={fetchAndSaveChartAccountsData}
                disabled={chartAccountsLoading}
                className="px-6"
              >
                {chartAccountsLoading ? "Fetching..." : "Fetch & Save Chart Accounts"}
              </Button>
            </div>

            {chartAccountsMessage && (
              <Alert className={chartAccountsMessage.includes("✅") ? "border-green-500" : "border-red-500"}>
                <AlertDescription>{chartAccountsMessage}</AlertDescription>
              </Alert>
            )}

            {/* {chartAccountsResponse && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Response Preview:</h4>
                <pre className="text-sm overflow-auto max-h-40">
                  {JSON.stringify(chartAccountsResponse.data, null, 2)}
                </pre>
              </div>
            )} */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}