import React, { useState, useEffect } from 'react';

interface ChartOfAccount {
  id: number;
  account_code: string;
  account_desc: string;
  cust_vendor_id: number | null;
  is_customer: boolean;
  is_vendor: boolean;
  is_cash_bank: boolean;
  type: string;
}

interface ReportData {
  voucher_date: string;
  voucher_type: string;
  voucher_no: string;
  naration: string;
  debit: string;
  credit: string;
  balance: string;
  chart_of_account_code: string;
  account_name: string;
  account_id: number;
  reference_no: string;
  status: string;
  transaction_type: string;
  sr_no: number;
  running_balance: string;
}

interface ReportSummary {
  total_debit: string;
  total_credit: string;
  opening_balance: string;
  closing_balance: string;
  total_transactions: number;
}

const CashReportPage = () => {
  // State for Dates
  const getToday = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  const [dates, setDates] = useState({
    from: getToday(),
    to: getToday()
  });

  // Default selections
  const [companyId, setCompanyId] = useState<number>(5);
  const [companyName, setCompanyName] = useState('MULTAN FEEDS ');
  const [branchId, setBranchId] = useState<number>(4);
  const [branchName, setBranchName] = useState('MULTAN FEEDS ');

  

const [accountInput, setAccountInput] = useState('CASH AT MILL (60101-0002)');


  // Account state
  const [accountId, setAccountId] = useState<number>(203);
  const [accountName, setAccountName] = useState('');
  const [accountCode, setAccountCode] = useState('');
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

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

  // Fetch Chart of Accounts from API
useEffect(() => {
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/chart-of-accounts');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status}`);
      }
      
      const data = await response.json();
      setAccounts(data);
      
      // ADD THIS: Find and set CASH AT MILL as default
      const cashAtMillAccount = data.find((acc: ChartOfAccount) => 
        acc.account_code === '60101-0002' && acc.account_desc === 'CASH AT MILL'
      );
      
      if (cashAtMillAccount) {
        setAccountId(cashAtMillAccount.id);
        setAccountName(cashAtMillAccount.account_desc);
        setAccountCode(cashAtMillAccount.account_code);
        setAccountInput(`${cashAtMillAccount.account_desc} (${cashAtMillAccount.account_code})`);
      }
      
    } catch (err: any) {
      console.error('Error fetching accounts:', err);
      setError(err.message || 'Failed to load accounts');
      
      // Fallback to sample data
      const fallbackAccounts = [
        { id: 446, account_code: '60101-0002', account_desc: 'CASH AT MILL', is_cash_bank: true, type: 'ACCOUNT', is_customer: false, is_vendor: false, cust_vendor_id: null },
        { id: 2, account_code: '002', account_desc: 'Bank Account - HBL', is_cash_bank: true, type: 'ACCOUNT', is_customer: false, is_vendor: false, cust_vendor_id: null },
        { id: 3, account_code: '003', account_desc: 'Bank Account - MCB', is_cash_bank: true, type: 'ACCOUNT', is_customer: false, is_vendor: false, cust_vendor_id: null },
      ];
      setAccounts(fallbackAccounts as ChartOfAccount[]);
      
      // ADD THIS: Set default from fallback data
      const defaultAccount = fallbackAccounts.find(acc => acc.account_code === '60101-0002');
      if (defaultAccount) {
        setAccountId(defaultAccount.id);
        setAccountName(defaultAccount.account_desc);
        setAccountCode(defaultAccount.account_code);
        setAccountInput(`${defaultAccount.account_desc} (${defaultAccount.account_code})`);
      }
      
    } finally {
      setLoading(false);
    }
  };

  fetchAccounts();
}, []);

  // Fetch report data
  const fetchReportData = async (): Promise<{data: ReportData[], summary: ReportSummary}> => {
    const { from, to } = dates;
    
    try {
      const response = await fetch(
        `/api/cash-report?accountId=${accountId}&fromDate=${from}&toDate=${to}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch report data');
      }
      
      return {
        data: result.data,
        summary: result.summary
      };
      
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  };



  const handleAccountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setAccountInput(value);

  const selected = accounts.find(
    acc => `${acc.account_desc} (${acc.account_code})` === value
  );

  if (selected) {
    setAccountId(selected.id);
    setAccountName(selected.account_desc);
    setAccountCode(selected.account_code);
  } else {
    setAccountId(0);
  }
};


  // Format date to DD-MMM-YY format
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    const year = date.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
  };

  // Handler for date changes
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDates(prev => ({ ...prev, [name]: value }));
  };

  // Handler for Account change
  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value);
    setAccountId(selectedId);
    
    const selectedAccount = accounts.find(acc => acc.id === selectedId);
    if (selectedAccount) {
      setAccountName(selectedAccount.account_desc);
      setAccountCode(selectedAccount.account_code);
    } else {
      setAccountName('');
      setAccountCode('');
    }
  };



  
  // Generate print window content
  // const generatePrintContent = (reportData: ReportData[], summary: ReportSummary) => {
  //   const formattedFromDate = formatDate(dates.from);
  //   const formattedToDate = formatDate(dates.to);
    
  //   return `
  //     <!DOCTYPE html>
  //     <html>
  //     <head>
  //       <title>Cash Report - ${accountCode} ${accountName}</title>
  //       <style>
  //         * {
  //           margin: 0;
  //           padding: 0;
  //           box-sizing: border-box;
  //           font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  //         }
  //         body {
  //           padding: 20px;
  //           background: white;
  //           color: black;
  //           font-size: 12px;
  //         }
  //         .header {
  //           text-align: center;
  //           margin-bottom: 20px;
  //           border-bottom: 2px solid #333;
  //           padding-bottom: 10px;
  //         }
  //         .report-title {
  //           font-size: 18px;
  //           font-weight: bold;
  //           margin-bottom: 5px;
  //         }
  //         .report-period {
  //           font-size: 14px;
  //           margin-bottom: 10px;
  //         }
  //         .account-info {
  //           font-size: 14px;
  //           font-weight: bold;
  //           margin-bottom: 15px;
  //         }
  //         table {
  //           width: 100%;
  //           border-collapse: collapse;
  //           margin-bottom: 20px;
  //           table-layout: fixed;
  //         }
  //         th {
  //           background-color: #f0f0f0;
  //           border: 1px solid #333;
  //           padding: 6px 4px;
  //           text-align: left;
  //           font-weight: bold;
  //           font-size: 11px;
  //         }
  //         td {
  //           border: 1px solid #333;
  //           padding: 4px;
  //           font-size: 11px;
  //           vertical-align: top;
  //         }
  //         .date-col { width: 8%; }
  //         .type-col { width: 7%; }
  //         .no-col { width: 5%; }
  //         .ref-col { width: 10%; }
  //         .naration-col { width: 30%; }
  //         .debit-col { width: 10%; text-align: right; }
  //         .credit-col { width: 10%; text-align: right; }
  //         .balance-col { width: 10%; text-align: right; }
  //         .text-right { text-align: right; }
  //         .summary {
  //           margin-top: 20px;
  //           border-top: 2px solid #333;
  //           padding-top: 10px;
  //           font-size: 18px;
  //         }
  //         .summary-row {
  //           display: flex;
  //           justify-content: space-between;
  //           margin-bottom: 5px;
  //         }
  //         .opening-balance {
  //           font-weight: bold;
  //           font-size: 13px;
  //         }
  //         .closing-balance {
  //           font-weight: bold;
  //           font-size: 13px;
  //           color: #006600;
  //         }
  //         .footer {
  //           text-align: center;
  //           margin-top: 30px;
  //           font-size: 10px;
  //           color: #666;
  //         }
  //         .proved {
  //           font-weight: bold;
  //           color: #006600;
  //         }
  //         @media print {
  //           body { padding: 0; }
  //           .no-print { display: none; }
  //         }
  //       </style>
  //     </head>
  //     <body>
  //       <div class="header">
  //         <div class="report-title">General Ledger</div>
  //         <div class="report-period">From ${formattedFromDate} To ${formattedToDate}</div>
  //       </div>
        
  //       <div class="account-info">
  //         <strong>Voucher</strong><br>
  //         <strong>${accountCode} - ${accountName}</strong>
  //       </div>
        
  //       <table>
  //         <thead>
  //           <tr>
  //             <th class="date-col">Date</th>
  //             <th class="type-col">Type</th>
  //             <th class="no-col">No</th>
  //             <th class="naration-col">Naration</th>
  //             <th class="debit-col">Debit</th>
  //             <th class="credit-col">Credit</th>
  //             <th class="balance-col">Balance</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           ${reportData.map((row, index) => `
  //             <tr>
  //               <td>${formatDate(row.voucher_date)}</td>
  //               <td>${row.voucher_type}</td>
  //               <td>${row.voucher_no}</td>
  //               <td>${row.naration || ''}</td>
  //               <td class="text-right">${parseFloat(row.debit).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
  //               <td class="text-right">${parseFloat(row.credit).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
  //               <td class="text-right">(${Math.abs(parseFloat(row.running_balance)).toLocaleString('en-US', { minimumFractionDigits: 2 })})<span class="proved">PROVED</span></td>
  //             </tr>
  //           `).join('')}
            
  //           <!-- Total Row -->
  //           <tr style="font-weight: bold; background-color: #f8f8f8;">
  //             <td colspan="4" style="text-align: center;">Total:</td>
  //             <td class="text-right">${parseFloat(summary.total_debit).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
  //             <td class="text-right">${parseFloat(summary.total_credit).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
  //             <td></td>
  //           </tr>
  //         </tbody>
  //       </table>
        
  //       <div class="summary">
  //         <div class="summary-row opening-balance">
  //           <span>Opening:</span>
  //           <span>${parseFloat(summary.opening_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
  //         </div>
  //         <div class="summary-row">
  //           <span>Debit:</span>
  //           <span>${parseFloat(summary.total_debit).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
  //         </div>
  //         <div class="summary-row">
  //           <span>Credit:</span>
  //           <span>${parseFloat(summary.total_credit).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
  //         </div>
  //         <div class="summary-row closing-balance">
  //           <span>Closing:</span>
  //           <span>${parseFloat(summary.closing_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
  //         </div>
  //       </div>
        
  //       <div class="footer no-print">
  //         <p>Printed on: ${new Date().toLocaleString()}</p>
  //         <button onclick="window.print()" style="padding: 5px 15px; margin-top: 10px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">Print Report</button>
  //         <button onclick="window.close()" style="padding: 5px 15px; margin-top: 10px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; margin-left: 10px;">Close Window</button>
  //       </div>
        
  //       <script>
  //         window.onload = function() {
  //           window.focus();
  //         };
  //       </script>
  //     </body>
  //     </html>
  //   `;
  // };



  
const generatePrintContent = (reportData: ReportData[], summary: ReportSummary) => {
  const formattedFromDate = formatDate(dates.from);
  const formattedToDate = formatDate(dates.to);

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Cash Report - ${accountCode} ${accountName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: "Times New Roman", Times, serif;
    }

    body {
      padding: 20px;
      background: white;
      color: black;
      font-size: 14px;
    }

    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
    }

    .report-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .report-period {
      font-size: 15px;
      margin-bottom: 10px;
    }

    .account-info {
      font-size: 15px;
      font-weight: bold;
      margin-bottom: 15px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      table-layout: fixed;
    }

    th {
      background-color: #f0f0f0;
      border: 1px solid #333;
      padding: 6px;
      text-align: left;
      font-weight: bold;
      font-size: 18px;
    }

    td {
      border: 1px solid #333;
      padding: 5px;
      font-size: 17px;
      vertical-align: top;
    }

    .date-col { width: 8%; }
    .type-col { width: 7%; }
    .no-col { width: 5%; }
    .naration-col { width: 33%; }
    .debit-col,
    .credit-col,
    .balance-col {
      width: 10%;
      text-align: right;
    }

    .text-right { text-align: right; }

    /* ===== SUMMARY FIXED ===== */
    .summary {
      margin-top: 15px;
      border-top: 2px solid #333;
      padding-top: 10px;
      width: 50%;
        margin-left: auto;   /* 👈 this moves it to right */

    }

    .summary table {
      width: 100%;
      border: none;
    }

    .summary td {
      border: none;
      padding: 4px 0;
      font-size: 17px;
    }

    .summary-label {
      font-weight: bold;
      text-align: left;
    }

    .summary-value {
      text-align: right;
      font-weight: bold;
    }

    .closing-balance {
      color: #006600;
      font-size: 15px;
    }

    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 11px;
      color: #666;
    }

    .proved {
      font-weight: bold;
      margin-left: 5px;
      color: #006600;
    }

    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>

<body>

  <div class="header">
      <div class="report-title">MULTAN FEEDS  Mill (PVT).LTD</div>

    <div class="report-title">General Ledger</div>
    <div class="report-period">From ${formattedFromDate} To ${formattedToDate}</div>
  </div>

  <div class="account-info">
    Voucher<br>
    ${accountCode} - ${accountName}
  </div>

  <table>
    <thead>
      <tr>
        <th class="date-col">Date</th>
        <th class="type-col">Type</th>
        <th class="no-col">No</th>
                <th class="no-col">Ref</th>

        <th class="naration-col">Naration</th>
        <th class="debit-col">Debit</th>
        <th class="credit-col">Credit</th>
        <th class="balance-col">Balance</th>
                <th class="balance-col">Status</th>

      </tr>
    </thead>

    <tbody>
      ${reportData.map(row => `
      <tr>
        <td>${formatDate(row.voucher_date)}</td>
        <td>${row.voucher_type}</td>
        <td>${row.voucher_no}</td>
                <td>${row.reference_no}</td>

        <td>${row.naration || ''}</td>
        <td class="text-right">${parseFloat(row.debit).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        <td class="text-right">${parseFloat(row.credit).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        <td class="text-right">
          (${Math.abs(parseFloat(row.running_balance)).toLocaleString('en-US', { minimumFractionDigits: 2 })})
        </td>
                        <td>${row.status}</td>

      </tr>
      `).join('')}

      <tr style="font-weight:bold;background:#f8f8f8;">
        <td colspan="5" style="text-align:center;">Total</td>
        <td class="text-right">${parseFloat(summary.total_debit).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        <td class="text-right">${parseFloat(summary.total_credit).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        <td></td>

      </tr>
    </tbody>
  </table>

  <!-- SUMMARY -->
  <div class="summary">
    <table>
      <tr>
        <td class="summary-label">Opening</td>
        <td class="summary-value">${parseFloat(summary.opening_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td class="summary-label">Debit</td>
        <td class="summary-value">${parseFloat(summary.total_debit).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td class="summary-label">Credit</td>
        <td class="summary-value">${parseFloat(summary.total_credit).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td class="summary-label closing-balance">Closing</td>
        <td class="summary-value closing-balance">${parseFloat(summary.closing_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      </tr>
    </table>
  </div>

  <div class="footer no-print">
    <p>Printed on: ${new Date().toLocaleString()}</p>
    <button onclick="window.print()">Print</button>
    <button onclick="window.close()">Close</button>
  </div>

</body>
</html>
`;
};


  // Handler for Print button
  const handlePrint = async () => {
    if (accountId === 0) {
      alert('Please select an account');
      return;
    }

    if (new Date(dates.to) < new Date(dates.from)) {
      alert('To date cannot be before From date');
      return;
    }

    try {
      setIsPrinting(true);
      
      // Fetch report data
      const { data: reportData, summary } = await fetchReportData();
      
      if (reportData.length === 0) {
        alert('No data found for the selected period and account');
        setIsPrinting(false);
        return;
      }

      // Open new window for printing
      const printWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
      
      if (!printWindow) {
        alert('Popup blocked! Please allow popups for this site.');
        setIsPrinting(false);
        return;
      }

      // Generate and write print content
      const printContent = generatePrintContent(reportData, summary);
      printWindow.document.write(printContent);
      printWindow.document.close();
      
    } catch (error: any) {
      console.error('Error generating report:', error);
      alert(`Error generating report: ${error.message || 'Unknown error'}`);
    } finally {
      setIsPrinting(false);
    }
  };

  // Handler for Exit button
  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit?')) {
      window.history.back();
    }
  };

  // Sort accounts
  const sortedAccounts = [...accounts].sort((a, b) => 
    a.account_code.localeCompare(b.account_code)
  );

  return (
    <div className="w-full h-screen bg-gray-300 flex flex-col font-sans text-sm overflow-hidden">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-gray-600 to-gray-400 text-white px-3 py-2 flex items-center shadow-md shrink-0">
        <span className="font-semibold tracking-wide text-sm">Cash Report Page</span>
      </div>

      {/* Main Content Area */}
      <div className="p-4 flex-1 flex flex-col overflow-hidden">
        <div className="grid grid-cols-12 gap-6 h-full">
          
          {/* LEFT COLUMN */}
          <div className="col-span-5 flex flex-col gap-4 h-full">
            <div className="flex flex-col gap-3">
              <div className="flex items-center">
                <label className="w-28 font-bold text-gray-700 text-sm">Company</label>
                <select 
                  value={companyName} 
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    setCompanyId(5);
                  }}
                  className="flex-1 border border-gray-400 rounded-sm px-2 py-1 bg-white text-black shadow-inner"
                  disabled
                >
                  <option value="MULTAN FEEDS ">MULTAN FEEDS </option>
                </select>
              </div>
              
              <div className="flex items-center">
                <label className="w-28 font-bold text-gray-700 text-sm">Branch</label>
                <select 
                  value={branchName}
                  onChange={(e) => {
                    setBranchName(e.target.value);
                    setBranchId(4);
                  }}
                  className="flex-1 border border-gray-400 rounded-sm px-2 py-1 bg-white text-black shadow-inner"
                  disabled
                >
                  <option value="MULTAN FEEDS ">MULTAN FEEDS </option>
                </select>
              </div>

              {/* Account Field */}
<div className="flex items-center">
  <label className="w-28 font-bold text-gray-700 text-sm">Account</label>

  <div className="flex-1">
    <input
      list="accountList"
      placeholder="Search account..."
      value={accountInput}
      onChange={handleAccountInputChange}
      disabled={loading || isPrinting}
      className="w-full border border-gray-400 rounded-sm px-2 py-1 bg-white text-black shadow-inner disabled:bg-gray-100"
    />

    <datalist id="accountList">
      {sortedAccounts.map(acc => (
        <option
          key={acc.id}
          value={`${acc.account_desc} (${acc.account_code})`}
        />
      ))}
    </datalist>
  </div>
</div>

              
              {error && (
                <div className="text-red-600 text-xs italic mt-1 ml-28">
                  Error loading accounts: {error}
                </div>
              )}
            </div>

            {/* Date Inputs */}
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center">
                <label className="w-28 font-bold text-gray-700 text-sm">From Date</label>
                <input
                  type="date"
                  name="from"
                  value={dates.from}
                  onChange={handleDateChange}
                  disabled={isPrinting}
                  className="w-40 border border-gray-400 rounded-sm px-2 py-1 bg-white text-black shadow-inner disabled:bg-gray-100"
                />
              </div>

              <div className="flex items-center">
                <label className="w-28 font-bold text-gray-700 text-sm">To Date</label>
                <input
                  type="date"
                  name="to"
                  value={dates.to}
                  onChange={handleDateChange}
                  disabled={isPrinting}
                  className="w-40 border border-gray-400 rounded-sm px-2 py-1 bg-white text-black shadow-inner disabled:bg-gray-100"
                />
              </div>
            </div>
          
          </div>

          {/* MIDDLE COLUMN - Empty */}
          <div className="col-span-3 border-x border-gray-300/30 px-2">
          </div>

          {/* RIGHT COLUMN - Empty */}
          <div className="col-span-4">
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="bg-[#E6E8FA] p-3 flex justify-center gap-6 border-t border-gray-300 shrink-0 mt-4">
          <button
            className="w-28 bg-gray-300 hover:bg-gray-400 border border-gray-500 text-black text-sm font-bold py-1.5 px-4 shadow-sm active:translate-y-0.5 transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
            onClick={handlePrint}
           // disabled={loading || accountId === 0 || isPrinting}
          >
            {isPrinting ? 'Generating...' : 'Print'}
          </button>

          <button
            className="w-28 bg-gray-300 hover:bg-gray-400 border border-gray-500 text-black text-sm font-bold py-1.5 px-4 shadow-sm active:translate-y-0.5 transition-all rounded-sm disabled:opacity-50"
            onClick={handleExit}
            disabled={isPrinting}
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashReportPage;