import { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa6";
import { Toaster } from "react-hot-toast";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import axios from "axios";
import { IoIosRemoveCircle } from "react-icons/io";
pdfMake.vfs = pdfFonts.vfs;

const HatimLedger = () => {
  const [hatim, setHatim] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilter, setShowFilter] = useState(false);
   const [openingBalance, setOpeningBalance] = useState(0);
  // Fetch ledger data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/customerLedger/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setHatim(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);
  // find hatim
  const hatimTrip = hatim?.filter((dt) => dt.customer_name === "Hatim Rupgonj");
  // Load opening balance from customer list
useEffect(() => {
  axios
    .get(`${import.meta.env.VITE_BASE_URL}/api/customer/list`)
    .then((response) => {
      if (response.data.status === "Success") {
        const hatimCustomer = response.data.data.find(
          (c) => c.customer_name === "Hatim Rupgonj"
        );
        if (hatimCustomer) {
          setOpeningBalance(parseFloat(hatimCustomer.due) || 0);
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching customer list:", error);
    });
}, []);

   let runningBalance = openingBalance;
   // Before return, calculate totals
const totalAmount = hatimTrip.reduce(
  (sum, dt) => sum + parseFloat(dt.bill_amount || 0),
  0
);
const totalReceived = hatimTrip.reduce(
  (sum, dt) => sum + parseFloat(dt.rec_amount || 0),
  0
);
// Final balance after all trips
const finalBalance =
  openingBalance +
  hatimTrip.reduce(
    (sum, dt) => sum + (parseFloat(dt.bill_amount || 0) - parseFloat(dt.rec_amount || 0)),
    0
  );

   // Export Excel
  const exportExcel = () => {
    const wsData = [
      ["SL", "Date", "VehicleNo", "Goods", "Distributor", "Destination", "Amount", "Received", "Balance"]
    ];
    let tempBalance = openingBalance;
    hatimTrip.forEach((dt, index) => {
      const bill = parseFloat(dt.bill_amount || 0);
      const rec = parseFloat(dt.rec_amount || 0);
      tempBalance += bill - rec;
      wsData.push([
        index + 1,
        dt.bill_date,
        dt.vehicle_no,
        dt.goods,
        dt.delar_name,
        dt.unload_point,
        bill,
        rec,
        tempBalance
      ]);
    });
    wsData.push(["", "", "", "", "", "Total", totalAmount, totalReceived, finalBalance]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "HatimLedger");
    XLSX.writeFile(wb, "HatimLedger.xlsx");
  };

  // Export PDF
  const exportPDF = () => {
    const body = hatimTrip.map((dt, index) => {
      const bill = parseFloat(dt.bill_amount || 0);
      const rec = parseFloat(dt.rec_amount || 0);
      runningBalance += bill - rec;
      return [
        index + 1,
        dt.bill_date,
        dt.vehicle_no,
        dt.goods,
        dt.delar_name,
        dt.unload_point,
        bill,
        rec,
        runningBalance
      ];
    });
    body.push(["", "", "", "", "", "Total", totalAmount, totalReceived, finalBalance]);

    const docDefinition = {
      content: [
        { text: "Hatim Rupgonj Ledger", style: "header" },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "auto", "auto", "*", "*", "*", "auto", "auto", "auto"],
            body: [
              ["SL", "Date", "VehicleNo", "Goods", "Distributor", "Destination", "Amount", "Received", "Balance"],
              ...body
            ]
          }
        }
      ],
      styles: {
        header: { fontSize: 16, bold: true, marginBottom: 10 }
      }
    };
    pdfMake.createPdf(docDefinition).download("HatimLedger.pdf");
  };

  // Print
  const handlePrint = () => {
  const printContent = document.getElementById("ledger-table");
  const WinPrint = window.open("", "", "width=900,height=650");

  WinPrint.document.write(`
    <html>
      <head>
        <title>Hatim Ledger</title>
        <style>
          table { border-collapse: collapse; width: 100%; font-size: 12px; }
          th, td { border: 1px solid #000; padding: 4px; text-align: left; }
          th { background-color: #f0f0f0; }
        </style>
      </head>
      <body>
        ${printContent.outerHTML}
      </body>
    </html>
  `);

  WinPrint.document.close();
  WinPrint.focus();
  WinPrint.print();
  WinPrint.close();
};


  if (loading) return <p className="text-center mt-16">Loading Hatim...</p>;
  return (
    <div className=" md:p-2">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-2 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            Hatim Rupgonj Ledger
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
            <button onClick={exportExcel} className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">
              Excel
            </button>
            <button onClick={exportPDF} className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">
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

        <div id="ledger-table"  className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-900">
            <thead className="capitalize text-sm">
              <tr>
                <th className="border border-gray-700 px-2 py-1">SL.</th>
                <th className="border border-gray-700 px-2 py-1 min-w-[100px]">
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
                <th className="border border-gray-700 px-2 py-1">Amount</th>
                {/* <th className="border border-gray-700 p-1 text-center">
                  BillAmount
                  <br />
                  with VAT & TAX
                </th>{" "}
                <th className="border border-gray-700 p-1 text-center">
                  Net Bill
                  <br />
                  Receivable after Tax
                </th> */}
                <th className="border border-gray-700 p-1 text-center">
                  ReceiveAmount
                </th>
                <th className="text-center border border-black py-1">
                  <p className="border-b">OpeningBalance {runningBalance}</p>
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="font-semibold">
              {hatimTrip?.map((dt, index) => {
                const billAmount = parseFloat(dt.bill_amount || 0);
                const received = parseFloat(dt.rec_amount || 0);

                runningBalance += billAmount - received;
                return (
                  <tr key={index} lassName="hover:bg-gray-50 transition-all">
                    <td className="border border-gray-700 p-1 font-bold">
                      {index + 1}.
                    </td>
                    <td className="border border-gray-700 p-1 w-2xl min-w-[100px]">
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
                      {dt.bill_amount}
                    </td>
                    {/* <td className="border border-gray-700 p-1">{totalCost}</td>
                    <td className="border border-gray-700 p-1">
                      {totalNetBillAmount}
                    </td> */}
                    <td className="border border-gray-700 p-1">
                      {dt.rec_amount}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {runningBalance}
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
                <td className="border border-black px-2 py-1">{totalAmount}</td>
                <td className="border border-black px-2 py-1">{totalReceived}</td>
                <td className="border border-black px-2 py-1">{finalBalance}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HatimLedger;
