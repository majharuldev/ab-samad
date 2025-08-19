
import { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa6";
import { Toaster } from "react-hot-toast";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import axios from "axios";
import { IoIosRemoveCircle } from "react-icons/io";

pdfMake.vfs = pdfFonts.vfs;

const HondaLedger = () => {
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
          const hondaCustomer = customerResponse.data.data.find(
            (customer) => customer.customer_name === "Honda"
          );
          if (hondaCustomer) {
            setCustomerOpeningBalance(parseFloat(hondaCustomer.due) || 0);
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

  const hondaLedgerEntries = ledgerData?.filter(
    (dt) => dt.customer_name === "Honda"
  );

  // Filter by date
  const filteredLedgerEntries = hondaLedgerEntries.filter((entry) => {
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

  // Calculate totals for footer
  const totalBillAmount = filteredLedgerEntries.reduce((sum, dt) => sum + (parseFloat(dt?.bill_amount) || 0), 0);
  const totalVatAmount = filteredLedgerEntries.reduce((sum, dt) => {
    const bill = parseFloat(dt?.bill_amount) || 0;
    return sum + (bill * 0.15); // Just the 15% VAT amount
  }, 0);
  const totalBillAmountWithVATAndTax = filteredLedgerEntries.reduce((sum, dt) => {
    const bill = parseFloat(dt?.bill_amount) || 0;
    return sum + (bill * 1.15); // Bill + 15% VAT
  }, 0);
  const totalNetBillReceivable = filteredLedgerEntries.reduce((sum, dt) => {
    const bill = parseFloat(dt?.bill_amount) || 0;
    return sum + (bill * 0.95); // Bill - 5% Tax
  }, 0);
  const totalReceivedAmount = filteredLedgerEntries.reduce((sum, dt) => sum + (parseFloat(dt?.rec_amount) || 0), 0);

  let runningBalance = customerOpeningBalance; // Initialize with dynamic opening balance

  /**  Excel Export */
  const handleExportExcel = () => {
    const exportData = filteredLedgerEntries.map((dt, index) => ({
      SL: index + 1,
      Date: dt.bill_date,
      Do_Si: dt.do,
      DealerName: dt.delar_name,
      Address: dt.unload_point,
      NoOfTrip: dt.no_of_trip,
      NoOfUnit: dt.qty,
      VehicleMode: dt.vehicle_mode,
      PerTruckRent: dt.per_truck_rent,
      Vat15: ((parseFloat(dt.bill_amount) || 0) * 0.15).toFixed(2),
      TotalRent: dt.bill_amount,
      ReceiveAmount: dt.rec_amount,
      Balance: ""
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Honda Ledger");
    XLSX.writeFile(wb, "Honda_Ledger.xlsx");
  };

  /**  PDF Export */
  const handleExportPDF = () => {
    const tableBody = [
      [
        "SL",
        "Date",
        "Do(Si)",
        "DealerName",
        "Address",
        "NoOfTrip",
        "NoOfUnit",
        "VehicleMode",
        "PerTruckRent",
        "15%Vat",
        "TotalRent",
        "ReceiveAmount",
        `OpeningBalance ${customerOpeningBalance}`,
        "Balance"
      ]
    ];

    runningBalance = customerOpeningBalance;
    filteredLedgerEntries.forEach((dt, index) => {
      const billAmount = parseFloat(dt.bill_amount) || 0;
      const receivedAmount = parseFloat(dt.rec_amount) || 0;
      const vatAmount = billAmount * 0.15;
      runningBalance = runningBalance + billAmount - receivedAmount;

      tableBody.push([
        index + 1,
        dt.bill_date,
        dt.do,
        dt.delar_name,
        dt.unload_point,
        dt.no_of_trip,
        dt.qty,
        dt.vehicle_mode,
        dt.per_truck_rent,
        vatAmount.toFixed(2),
        billAmount.toFixed(2),
        receivedAmount.toFixed(2),
        "",
        runningBalance.toFixed(2)
      ]);
    });

    tableBody.push([
      { text: "Total", colSpan: 9, alignment: "right" }, {}, {}, {}, {}, {}, {}, {}, {},
      totalVatAmount.toFixed(2),
      "",
      totalReceivedAmount.toFixed(2),
      "",
      runningBalance.toFixed(2)
    ]);

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [20, 40, 20, 20],
      content: [
        { text: "Honda Ledger", style: "header", alignment: "center" },
        {
          table: {
  headerRows: 1,
  // Adjust widths so all columns fit A4
  widths: [
    15, 50, 30, 50, 50, 20, 20, 20, 40, 40, 45, 45, 45, 45
  ],
  body: tableBody
}
        }
      ],
      styles: {
        header: { fontSize: 18, bold: true }
      },
      defaultStyle: {
    fontSize: 6,   // ছোট করলে সব ডাটা ফিট হবে
    noWrap: false  // wrap allow
  }
    };

    pdfMake.createPdf(docDefinition).download("Honda_Ledger.pdf");
  };

  /**  Print Function */
 const handlePrint = () => {
  const tableHTML = document.querySelector("table").outerHTML;
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Honda Ledger</title>
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
          }
          table, th, td {
            border: 1px solid black;
            padding: 4px;
          }
          th {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        ${tableHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};


  if (loading) return <p className="text-center mt-16">Loading Honda Ledger...</p>;

  return (
    <div className="">
      <Toaster />
      <div className=" w-full overflow-hidden overflow-x-auto  mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10  border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            Honda Ledger
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
            <button onClick={handleExportExcel} className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">
              Excel
            </button>
            <button onClick={handleExportPDF} className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">
              PDF
            </button>
            <button onClick={handlePrint} className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">
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
          <table className="min-w-full text-sm text-left text-gray-900">
            <thead className="capitalize text-sm">
              <tr>
                <th className="border border-gray-700 px-2 py-1">SL.</th>
                <th className="border border-gray-700 px-2 py-1 min-w-[100px]">
                  Date
                </th>
                <th className="border border-gray-700 px-2 py-1">Do(Si)</th>
                <th className="border border-gray-700 px-2 py-1">DealerName</th>
                <th className="border border-gray-700 px-2 py-1">Address</th>
                <th className="border border-gray-700 px-2 py-1">NoOfTrip</th>
                <th className="border border-gray-700 px-2 py-1">NoOfUnit</th>
                <th className="border border-gray-700 px-2 py-1">
                  VehicleMode
                </th>
                <th className="border border-gray-700 px-2 py-1">
                  PerTruckRent
                </th>
                    <th className="border border-gray-700 px-2 py-1">15%Vat</th>
                <th className="border border-gray-700 px-2 py-1">TotalRent</th>
            
               
                <th className="border border-gray-700 p-1 text-center">
                  ReceiveAmount
                </th>
                <th className="text-center border border-black py-1">
                  <p className="border-b">OpeningBalance {customerOpeningBalance}</p>
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="font-semibold">
              {filteredLedgerEntries?.map((dt, index) => {
                const billAmount = parseFloat(dt?.bill_amount) || 0;
                const receivedAmount = parseFloat(dt?.rec_amount) || 0;
                const noOfTrip = parseFloat(dt?.no_of_trip) || 0;
                const perTruckRent = parseFloat(dt?.per_truck_rent) || 0;

                // Total Rent calculation
                const totalRent = noOfTrip * perTruckRent;

                // 15% VAT calculation (just the VAT amount)
                const vatAmount = billAmount * 0.15;

                // Update running balance
                runningBalance = runningBalance + billAmount - receivedAmount;

                return (
                  <tr key={index} className="hover:bg-gray-50 transition-all">
                    <td className="border border-gray-700 p-1 font-bold">
                      {index + 1}.
                    </td>
                    <td className="border border-gray-700 p-1 w-2xl min-w-[100px]">
                      {dt.bill_date}
                    </td>
                    <td className="border border-gray-700 p-1">{dt.do}</td>
                    <td className="border border-gray-700 p-1">
                      {dt.delar_name}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.unload_point}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.no_of_trip}
                    </td>
                    <td className="border border-gray-700 p-1">{dt.qty}</td>
                    <td className="border border-gray-700 p-1">
                      {dt.vehicle_mode}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.per_truck_rent}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {vatAmount > 0 ? vatAmount.toFixed(2) : ""}
                    </td>
                    <td className="border border-gray-700 p-1">
                     {billAmount > 0 ? billAmount.toFixed(2) : ""}
                    </td>
                  
                    <td className="border border-gray-700 p-1">
                      {receivedAmount > 0 ? receivedAmount.toFixed(2) : ""}
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
                  colSpan={10}
                  className="border border-black px-2 py-1 text-right"
                >
                  Total
                </td>
                <td className="border border-black px-2 py-1">
                  {totalVatAmount.toFixed(2)}
                </td>
                
                <td className="border border-black px-2 py-1">
                  {totalReceivedAmount.toFixed(2)}
                </td>
                <td className="border border-black px-2 py-1">
                  {runningBalance.toFixed(2)} {/* Final balance */}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HondaLedger;
