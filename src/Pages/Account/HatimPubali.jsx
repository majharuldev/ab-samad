

// import { useEffect, useState } from "react";
// import { FaFilter } from "react-icons/fa6";
// import { Toaster } from "react-hot-toast";
// import pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
// import axios from "axios";
// import { IoIosRemoveCircle } from "react-icons/io";

// pdfMake.vfs = pdfFonts.vfs;

// const HatimPubaliLedger = () => {
//   const [ledgerData, setLedgerData] = useState([]);
//   const [customerOpeningBalance, setCustomerOpeningBalance] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [showFilter, setShowFilter] = useState(false);

//   useEffect(() => {
//     const fetchAllData = async () => {
//       setLoading(true);
//       try {
//         // Fetch customer ledger data
//         const ledgerResponse = await axios.get(
//           `${import.meta.env.VITE_BASE_URL}/api/customerLedger/list`
//         );
//         if (ledgerResponse.data.status === "Success") {
//           setLedgerData(ledgerResponse.data.data);
//         }

//         // Fetch customer list for opening balance
//         const customerResponse = await axios.get(
//           `${import.meta.env.VITE_BASE_URL}/api/customer/list`
//         );
//         if (customerResponse.data.status === "Success") {
//           const hatimPubailCustomer = customerResponse.data.data.find(
//             (customer) => customer.customer_name === "Hatim Pubail"
//           );
//           if (hatimPubailCustomer) {
//             setCustomerOpeningBalance(
//               parseFloat(hatimPubailCustomer.due) || 0
//             );
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllData();
//   }, []);

//   // Filter ledger entries for "Hatim Pubail"
//   const hatimPubailLedgerEntries = ledgerData?.filter(
//     (dt) => dt.customer_name === "Hatim Pubail"
//   );

//   // Filter by date
//   const filteredLedgerEntries = hatimPubailLedgerEntries.filter((entry) => {
//     const entryDate = new Date(entry.bill_date);
//     const start = startDate ? new Date(startDate) : null;
//     const end = endDate ? new Date(endDate) : null;

//     if (start && end) {
//       return entryDate >= start && entryDate <= end;
//     } else if (start) {
//       return entryDate.toDateString() === start.toDateString();
//     } else {
//       return true; // no filter applied
//     }
//   });

//   // Calculate Total Bill Amount with VAT (assuming 15% VAT on bill_amount)
//   const totalBillAmountWithVAT = filteredLedgerEntries.reduce((sum, dt) => {
//     const bill = parseFloat(dt?.bill_amount) || 0;
//     const vatAmount = (bill * 15) / 100;
//     return sum + bill + vatAmount;
//   }, 0);

//   // Calculate Total Net Bill Receivable after Tax (assuming 5% tax deduction on bill_amount)
//   const totalNetBillReceivable = filteredLedgerEntries.reduce((sum, dt) => {
//     const bill = parseFloat(dt?.bill_amount) || 0;
//     const taxAmount = (bill * 5) / 100;
//     return sum + bill - taxAmount;
//   }, 0);

//   // Calculate Total Received Amount
//   const totalReceivedAmount = filteredLedgerEntries.reduce((sum, dt) => {
//     return sum + (parseFloat(dt?.rec_amount) || 0);
//   }, 0);

//   let runningBalance = customerOpeningBalance;

//   if (loading) return <p className="text-center mt-16">Loading Hatim Pubail Ledger...</p>;

//   return (
//     <div className="">
//       <Toaster />
//       <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-2 border border-gray-200">
//         <div className="md:flex items-center justify-between mb-6">
//           <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
//             Hatim Pubail Ledger
//           </h1>
//           <div className="mt-3 md:mt-0 flex gap-2">
//             <button
//               onClick={() => setShowFilter((prev) => !prev)}
//               className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//             >
//               <FaFilter /> Filter
//             </button>
//           </div>
//         </div>
//         {/* export and search */}
//         <div className="md:flex justify-between items-center">
//           <div className="flex gap-1 md:gap-3 text-primary font-semibold rounded-md">
//             <button className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">
//               Excel
//             </button>
//             <button className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">
//               PDF
//             </button>
//             <button className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">
//               Print
//             </button>
//           </div>
//         </div>
//         {showFilter && (
//           <div className="md:flex items-center gap-5 justify-between border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
//             <div className="relative w-full">
//               <label className="block mb-1 text-sm font-medium">
//                 Start Date
//               </label>
//               <input
//                 type="date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//                 className="w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//               />
//             </div>
//             <div className="relative w-full">
//               <label className="block mb-1 text-sm font-medium">End Date</label>
//               <input
//                 type="date"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//                 className="w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//               />
//             </div>
//             <div className="w-xs mt-5">
//               <button
//                 onClick={() => {
//                   setStartDate("");
//                   setEndDate("");
//                   setShowFilter(false);
//                 }}
//                 className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//               >
//                 <IoIosRemoveCircle /> Clear Filter
//               </button>
//             </div>
//           </div>
//         )}
//         <div className="mt-5 overflow-x-auto">
//           <table className="min-w-full text-sm text-left text-gray-900">
//             <thead className="capitalize text-sm">
//               <tr>
//                 <th className="border border-gray-700 px-2 py-1">SL.</th>
//                 <th className="border border-gray-700 px-2 py-1 min-w-[100px]">
//                   Date
//                 </th>
//                 <th className="border border-gray-700 px-2 py-1">VehicleNo.</th>
//                 <th className="border border-gray-700 px-2 py-1">Goods</th>
//                 <th className="border border-gray-700 px-2 py-1">
//                   DistributorName
//                 </th>
//                 <th className="border border-gray-700 px-2 py-1">
//                   Destination
//                 </th>
//                 <th className="border border-gray-700 px-2 py-1">Bill Amount</th>
//                 <th className="border border-gray-700 p-1 text-center">
//                   Bill Amount
//                   <br />
//                   with VAT & TAX
//                 </th>{" "}
//                 <th className="border border-gray-700 p-1 text-center">
//                   Net Bill
//                   <br />
//                   Receivable after Tax
//                 </th>
//                 <th className="border border-gray-700 p-1 text-center">
//                   Receive Amount
//                 </th>
//                 <th className="text-center border border-black py-1">
//                   <p className="border-b">Opening Balance {customerOpeningBalance}</p>
//                   Balance
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="font-semibold">
//               {filteredLedgerEntries?.map((dt, index) => {
//                 const billAmount = parseFloat(dt?.bill_amount) || 0;
//                 const receivedAmount = parseFloat(dt?.rec_amount) || 0;

//                 // BillAmount with vat tax (assuming 15% VAT on bill_amount)
//                 const vatAmount = (billAmount * 15) / 100;
//                 const totalCostWithVat = billAmount + vatAmount;

//                 // Net Bill Receivable after Tax (assuming 5% tax deduction on bill_amount)
//                 const taxAmount = (billAmount * 5) / 100;
//                 const totalNetBillAmount = billAmount - taxAmount;

//                 // Update running balance
//                 runningBalance = runningBalance + billAmount - receivedAmount;

//                 return (
//                   <tr key={index} className="hover:bg-gray-50 transition-all">
//                     <td className="border border-gray-700 p-1 font-bold">
//                       {index + 1}.
//                     </td>
//                     <td className="border border-gray-700 p-1 w-2xl min-w-[100px]">
//                       {dt.bill_date}
//                     </td>
//                     <td className="border border-gray-700 p-1">
//                       {dt.vehicle_no}
//                     </td>
//                     <td className="border border-gray-700 p-1">{dt.goods}</td>
//                     <td className="border border-gray-700 p-1">
//                       {dt.delar_name}
//                     </td>
//                     <td className="border border-gray-700 p-1">
//                       {dt.unload_point}
//                     </td>
//                     <td className="border border-gray-700 p-1">
//                       {billAmount > 0 ? billAmount : ""}
//                     </td>
//                     <td className="border border-gray-700 p-1">
//                       {billAmount > 0 ? totalCostWithVat.toFixed(2) : ""}
//                     </td>
//                     <td className="border border-gray-700 p-1">
//                       {billAmount > 0 ? totalNetBillAmount.toFixed(2) : ""}
//                     </td>
//                     <td className="border border-gray-700 p-1">
//                       {receivedAmount > 0 ? receivedAmount : ""}
//                     </td>
//                     <td className="border border-gray-700 p-1">
//                       {runningBalance.toFixed(2)}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//             <tfoot>
//               <tr className="font-bold">
//                 <td
//                   colSpan={6}
//                   className="border border-black px-2 py-1 text-right"
//                 >
//                   Total
//                 </td>
//                 <td className="border border-black px-2 py-1">
//                   {filteredLedgerEntries.reduce((sum, dt) => sum + (parseFloat(dt?.bill_amount) || 0), 0).toFixed(2)}
//                 </td>
//                 <td className="border border-black px-2 py-1">
//                   {totalBillAmountWithVAT.toFixed(2)}
//                 </td>
//                 <td className="border border-black px-2 py-1">
//                   {totalNetBillReceivable.toFixed(2)}
//                 </td>
//                 <td className="border border-black px-2 py-1">
//                   {totalReceivedAmount.toFixed(2)}
//                 </td>
//                 <td className="border border-black px-2 py-1">
//                   {runningBalance.toFixed(2)}
//                 </td>
//               </tr>
//             </tfoot>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HatimPubaliLedger;

import { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa6";
import { Toaster } from "react-hot-toast";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import axios from "axios";
import { IoIosRemoveCircle } from "react-icons/io";
import * as XLSX from "xlsx";

pdfMake.vfs = pdfFonts.vfs;

const HatimPubaliLedger = () => {
  const [ledgerData, setLedgerData] = useState([]);
  const [customerOpeningBalance, setCustomerOpeningBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch customer ledger data
        const ledgerResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/customerLedger/list`
        );
        if (ledgerResponse.data.status === "Success") {
          setLedgerData(ledgerResponse.data.data);
        }

        // Fetch customer list for opening balance
        const customerResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/customer/list`
        );
        if (customerResponse.data.status === "Success") {
          const hatimPubailCustomer = customerResponse.data.data.find(
            (customer) => customer.customer_name === "Hatim Pubail"
          );
          if (hatimPubailCustomer) {
            setCustomerOpeningBalance(
              parseFloat(hatimPubailCustomer.due) || 0
            );
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Filter ledger entries for "Hatim Pubail"
  const hatimPubailLedgerEntries = ledgerData?.filter(
    (dt) => dt.customer_name === "Hatim Pubail"
  );

  // Filter by date
  const filteredLedgerEntries = hatimPubailLedgerEntries.filter((entry) => {
    const entryDate = new Date(entry.bill_date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      return entryDate >= start && entryDate <= end;
    } else if (start) {
      return entryDate.toDateString() === start.toDateString();
    } else {
      return true; // no filter applied
    }
  });

  // Calculate Total Received Amount
  const totalReceivedAmount = filteredLedgerEntries.reduce((sum, dt) => {
    return sum + (parseFloat(dt?.rec_amount) || 0);
  }, 0);

  let runningBalance = customerOpeningBalance;

  // Generate PDF
  const generatePDF = () => {
    const docDefinition = {
      content: [
        { text: 'Hatim Pubail Ledger', style: 'header' },
        { text: `Date: ${new Date().toLocaleDateString()}`, style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                'SL.',
                'Date',
                'Vehicle No.',
                'Goods',
                'Distributor Name',
                'Destination',
                'Bill Amount',
                'Receive Amount',
                'Balance'
              ],
              ...filteredLedgerEntries.map((dt, index) => {
                const billAmount = parseFloat(dt?.bill_amount) || 0;
                const receivedAmount = parseFloat(dt?.rec_amount) || 0;
                runningBalance = runningBalance + billAmount - receivedAmount;

                return [
                  (index + 1).toString(),
                  dt.bill_date,
                  dt.vehicle_no,
                  dt.goods,
                  dt.delar_name,
                  dt.unload_point,
                  billAmount > 0 ? billAmount.toFixed(2) : '',
                  receivedAmount > 0 ? receivedAmount.toFixed(2) : '',
                  runningBalance.toFixed(2)
                ];
              }),
              [
                { text: 'Total', colSpan: 6, alignment: 'right' },
                {}, {}, {}, {}, {},
                filteredLedgerEntries.reduce((sum, dt) => sum + (parseFloat(dt?.bill_amount) || 0), 0).toFixed(2),
                totalReceivedAmount.toFixed(2),
                runningBalance.toFixed(2)
              ]
            ]
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
          alignment: 'center'
        },
        subheader: {
          fontSize: 12,
          margin: [0, 0, 0, 10],
          alignment: 'center'
        }
      }
    };

    pdfMake.createPdf(docDefinition).open();
  };

  // Generate Excel
  const generateExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredLedgerEntries.map((dt, index) => {
        const billAmount = parseFloat(dt?.bill_amount) || 0;
        const receivedAmount = parseFloat(dt?.rec_amount) || 0;
        runningBalance = runningBalance + billAmount - receivedAmount;

        return {
          'SL.': index + 1,
          'Date': dt.bill_date,
          'Vehicle No.': dt.vehicle_no,
          'Goods': dt.goods,
          'Distributor Name': dt.delar_name,
          'Destination': dt.unload_point,
          'Bill Amount': billAmount > 0 ? billAmount : '',
          'Receive Amount': receivedAmount > 0 ? receivedAmount : '',
          'Balance': runningBalance.toFixed(2)
        };
      })
    );

    // Add totals row
    XLSX.utils.sheet_add_aoa(worksheet, [
      [
        'Total',
        '',
        '',
        '',
        '',
        '',
        filteredLedgerEntries.reduce((sum, dt) => sum + (parseFloat(dt?.bill_amount) || 0), 0).toFixed(2),
        totalReceivedAmount.toFixed(2),
        runningBalance.toFixed(2)
      ]
    ], { origin: -1 });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hatim Pubail Ledger");
    XLSX.writeFile(workbook, "Hatim_Pubail_Ledger.xlsx");
  };

  // Print function
  const printTable = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Hatim Pubail Ledger</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 20px; }
            .date { text-align: center; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Hatim Pubail Ledger</h1>
            <div class="date">Date: ${new Date().toLocaleDateString()}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>SL.</th>
                <th>Date</th>
                <th>Vehicle No.</th>
                <th>Goods</th>
                <th>Distributor Name</th>
                <th>Destination</th>
                <th>Bill Amount</th>
                <th>Receive Amount</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${filteredLedgerEntries.map((dt, index) => {
                const billAmount = parseFloat(dt?.bill_amount) || 0;
                const receivedAmount = parseFloat(dt?.rec_amount) || 0;
                runningBalance = runningBalance + billAmount - receivedAmount;

                return `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${dt.bill_date}</td>
                    <td>${dt.vehicle_no}</td>
                    <td>${dt.goods}</td>
                    <td>${dt.delar_name}</td>
                    <td>${dt.unload_point}</td>
                    <td>${billAmount > 0 ? billAmount.toFixed(2) : ''}</td>
                    <td>${receivedAmount > 0 ? receivedAmount.toFixed(2) : ''}</td>
                    <td>${runningBalance.toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
              <tr>
                <td colspan="6" style="text-align: right;">Total</td>
                <td>${filteredLedgerEntries.reduce((sum, dt) => sum + (parseFloat(dt?.bill_amount) || 0), 0).toFixed(2)}</td>
                <td>${totalReceivedAmount.toFixed(2)}</td>
                <td>${runningBalance.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) return <p className="text-center mt-16">Loading Hatim Pubail Ledger...</p>;

  return (
    <div className="">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-2 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            Hatim Pubail Ledger
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>
        {/* export and search */}
        <div className="md:flex justify-between items-center">
          <div className="flex gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <button 
              onClick={generateExcel}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              Excel
            </button>
            <button 
              onClick={generatePDF}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              PDF
            </button>
            <button 
              onClick={printTable}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              Print
            </button>
          </div>
        </div>
        {showFilter && (
          <div className="md:flex items-center gap-5 justify-between border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <div className="relative w-full">
              <label className="block mb-1 text-sm font-medium">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>
            <div className="relative w-full">
              <label className="block mb-1 text-sm font-medium">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>
            <div className="w-xs mt-5">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setShowFilter(false);
                }}
                className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <IoIosRemoveCircle /> Clear Filter
              </button>
            </div>
          </div>
        )}
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-900" id="hatim-pubail-ledger-table">
            <thead className="capitalize text-sm">
              <tr>
                <th className="border border-gray-700 px-2 py-1">SL.</th>
                <th className="border border-gray-700 px-2 py-1 ">
                  Date
                </th>
                <th className="border border-gray-700 px-2 py-1">VehicleNo.</th>
                <th className="border border-gray-700 px-2 py-1">Goods</th>
                <th className="border border-gray-700 px-2 py-1">
                  DistributorName
                </th>
                <th className="border border-gray-700 px-2 py-1">
                  Destination
                </th>
                <th className="border border-gray-700 px-2 py-1">Bill Amount</th>
                <th className="border border-gray-700 p-1 text-center">
                  Receive Amount
                </th>
                <th className="text-center border border-black py-1">
                  <p className="border-b">Opening Balance {customerOpeningBalance}</p>
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="font-semibold">
              {filteredLedgerEntries?.map((dt, index) => {
                const billAmount = parseFloat(dt?.bill_amount) || 0;
                const receivedAmount = parseFloat(dt?.rec_amount) || 0;

                // Update running balance
                runningBalance = runningBalance + billAmount - receivedAmount;

                return (
                  <tr key={index} className="hover:bg-gray-50 transition-all">
                    <td className="border border-gray-700 p-1 font-bold">
                      {index + 1}.
                    </td>
                    <td className="border border-gray-700 p-1 ">
                      {dt.bill_date}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.vehicle_no}
                    </td>
                    <td className="border border-gray-700 p-1">{dt.goods}</td>
                    <td className="border border-gray-700 p-1">
                      {dt.delar_name}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.unload_point}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {billAmount > 0 ? billAmount : ""}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {receivedAmount > 0 ? receivedAmount : ""}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {runningBalance.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td
                  colSpan={6}
                  className="border border-black px-2 py-1 text-right"
                >
                  Total
                </td>
                <td className="border border-black px-2 py-1">
                  {filteredLedgerEntries.reduce((sum, dt) => sum + (parseFloat(dt?.bill_amount) || 0), 0).toFixed(2)}
                </td>
                <td className="border border-black px-2 py-1">
                  {totalReceivedAmount.toFixed(2)}
                </td>
                <td className="border border-black px-2 py-1">
                  {runningBalance.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HatimPubaliLedger;