import { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa6";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import axios from "axios";
import { IoIosRemoveCircle } from "react-icons/io";
pdfMake.vfs = pdfFonts.vfs;
import * as XLSX from "xlsx";

const YamahaLedger = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [yamaha, setYamaha] = useState([]);
  const [loading, setLoading] = useState(true);
  // let runningBalance = 2000;
  const [openingBalance, setOpeningBalance] = useState(0);
  // load data from server
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/customerLedger/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setYamaha(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);
  const yamahaLedger = yamaha?.filter((dt) => dt.customer_name === "Yamaha");
  const totalBodyFare = yamahaLedger.reduce(
    (sum, dt) => sum + (parseFloat(dt.body_cost) || 0),
    0
  );
  const totalFuelCost = yamahaLedger.reduce(
    (sum, dt) => sum + (parseFloat(dt.fuel_cost) || 0),
    0
  );
  // Total Receive Amount
const totalReceived = yamahaLedger.reduce(
  (sum, dt) => sum + (parseFloat(dt.rec_amount) || 0),
  0
);

// Final Balance after all transactions
// const finalBalance = yamahaLedger.reduce((balance, dt) => {
//   const body = parseFloat(dt?.body_cost) || 0;
//   const fuel = parseFloat(dt?.fuel_cost) || 0;
//   const billAmount = (body * 5) / 100;
//   const totalBillAmount = body - billAmount + fuel;
//   const received = parseFloat(dt.rec_amount || 0);
//   return balance + totalBillAmount - received;
// }, openingBalance);

// Final Balance without VAT/TAX
const finalBalance = yamahaLedger.reduce((balance, dt) => {
  const body = parseFloat(dt?.body_cost) || 0;
  const fuel = parseFloat(dt?.fuel_cost) || 0;
  const received = parseFloat(dt.rec_amount || 0);
  return balance + (body + fuel) - received;
}, openingBalance);

// Total Bill (Without VAT/TAX)
const totalBill = yamahaLedger.reduce((sum, dt) => {
  const rent = parseFloat(dt.body_cost || 0);
  return sum + rent; // শুধু body cost
}, 0);

// Net Bill (Without TAX Deduction)
const netBill = yamahaLedger.reduce((sum, dt) => {
  const body = parseFloat(dt.body_cost) || 0;
  const fuel = parseFloat(dt?.fuel_cost) || 0;
  return sum + body + fuel;
}, 0);

  // customer 
  // Load opening balance from customer list
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/customer/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          const yamahaCustomer = response.data.data.find(
            (c) => c.customer_name === "Yamaha"
          );
          if (yamahaCustomer) {
            setOpeningBalance(parseFloat(yamahaCustomer.due) || 0);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching customer list:", error);
      });
  }, []);
   let runningBalance = openingBalance;
  // Calculate Total BillAmount
  // const totalBill = yamahaLedger.reduce((sum, dt) => {
  //   const rent = parseFloat(dt.body_cost || 0);
  //   const vatAmount = (rent * 15) / 100;
  //   return sum + rent + vatAmount;
  // }, 0);
  // // Calculate Total Net Bill after tax
  // const netBill = yamahaLedger.reduce((sum, dt) => {
  //   const body = parseFloat(dt.body_cost || 0);
  //   const fuel = parseFloat(dt?.fuel_cost) || 0;
  //   const vatAmount = (body * 5) / 100;
  //   return sum + body - vatAmount + fuel;
  // }, 0);

  // pdf function
const exportPDF = () => {
  let runningBalance = openingBalance;

  const tableBody = [
    ["SL", "Date", "Product", "Portfolio", "Vehicle", "Chalan", "From", "Destination", "Quantity", "BodyFare", "FuelCost", "ReceiveAmount", "Balance"],
    ...yamahaLedger.map((dt, index) => {
      const body = parseFloat(dt.body_cost) || 0;
      const fuel = parseFloat(dt.fuel_cost) || 0;
      const received = parseFloat(dt.rec_amount) || 0;
      runningBalance += body + fuel - received;

      return [
        index + 1,
        dt.bill_date,
        "Motorcycle",
        "Yamaha",
        dt.vehicle_no,
        dt.chalan,
        dt.load_point,
        dt.unload_point,
        dt.qty,
        body,
        fuel,
        received,
        runningBalance.toFixed(2),
      ];
    }),
    ["", "", "", "", "", "", "", "", "Total", totalBodyFare, totalFuelCost, totalReceived, finalBalance.toFixed(2)]
  ];

  const docDefinition = {
    pageOrientation: 'landscape',
    content: [
      { text: "Yamaha Ledger", style: "header" },
      {
        table: {
          headerRows: 1,
          widths: [20, 50, 50, 50, 50, 50, 40, 40, 20, 50, 50, 50, 60],
          body: tableBody
        },
        layout: { defaultBorder: true }
      }
    ],
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] }
    },
    defaultStyle: { fontSize: 8, noWrap: false }
  };

  pdfMake.createPdf(docDefinition).download("yamaha_ledger.pdf");
};



// excel funtion
const exportExcel = () => {
  let runningBalance = openingBalance;

  const excelData = yamahaLedger.map((dt, index) => {
    const body = parseFloat(dt.body_cost) || 0;
    const fuel = parseFloat(dt.fuel_cost) || 0;
    const received = parseFloat(dt.rec_amount) || 0;
    runningBalance += body + fuel - received;

    return {
      SL: index + 1,
      Date: dt.bill_date,
      Product: "Motorcycle",
      Portfolio: "Yamaha",
      Vehicle: dt.vehicle_no,
      Chalan: dt.chalan,
      From: dt.load_point,
      Destination: dt.unload_point,
      Quantity: dt.qty,
      BodyFare: body,
      FuelCost: fuel,
      ReceiveAmount: received,
      Balance: runningBalance.toFixed(2)
    };
  });

  // Add total row
  excelData.push({
    SL: "",
    Date: "",
    Product: "",
    Portfolio: "",
    Vehicle: "",
    Chalan: "",
    From: "",
    Destination: "Total",
    Quantity: "",
    BodyFare: totalBodyFare,
    FuelCost: totalFuelCost,
    ReceiveAmount: totalReceived,
    Balance: finalBalance.toFixed(2)
  });

  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ledger");
  XLSX.writeFile(wb, "yamaha_ledger.xlsx");
};

// print function
// const printPDF = () => {
//   const tableBody = [
//     [
//       "SL", "Date", "Product", "Portfolio", "Vehicle", "Chalan", "From", "Destination", "Quantity", 
//       "BodyFare", "FuelCost", "BillAmount(VAT+TAX)", "NetBill(AfterTax)", "ReceiveAmount", "Balance"
//     ],
//     ...yamahaLedger.map((dt, index) => {
//       const rent = parseFloat(dt?.body_cost) || 0;
//       const vatAmount = (rent * 15) / 100;
//       const totalVatTax = rent + vatAmount;

//       const body = parseFloat(dt?.body_cost) || 0;
//       const fuel = parseFloat(dt?.fuel_cost) || 0;
//       const billAmount = (body * 5) / 100;
//       const totalBillAmount = body - billAmount + fuel;
//       const received = parseFloat(dt.rec_amount || 0);
//       runningBalance += totalBillAmount - received;

//       return [
//         index + 1,
//         dt.bill_date,
//         "Motorcycle",
//         "Yamaha",
//         dt.vehicle_no,
//         dt.chalan,
//         dt.load_point,
//         dt.unload_point,
//         dt.qty,
//         dt.body_cost,
//         dt.fuel_cost,
//         totalVatTax,
//         totalBillAmount,
//         dt.rec_amount,
//         runningBalance.toFixed(2),
//       ];
//     }),
//     ["", "", "", "", "", "", "", "", "", totalBodyFare, totalFuelCost, totalBill, netBill, totalReceived, finalBalance.toFixed(2)]
//   ];

//   const docDefinition = {
//     content: [
//       { text: "Yamaha Ledger", style: "header" },
//       { table: { headerRows: 1, widths: Array(15).fill("auto"), body: tableBody } }
//     ],
//     styles: {
//       header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] }
//     }
//   };

//   pdfMake.createPdf(docDefinition).print();
// };

  if (loading) return <p className="text-center mt-16">Loading Yamaha...</p>;
  return (
    <div className="">
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            Yamaha Ledger
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
        {/* export */}
        <div className="md:flex justify-between items-center">
          <div className="flex gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <button onClick={exportExcel} className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">
              Excel
            </button>
            <button onClick={exportPDF} className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">
              PDF
            </button>
            {/* <button onClick={printPDF} className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">
              Print
            </button> */}
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
                <th className="border border-gray-700 px-2 py-1 min-w-[90px]">
                  Date
                </th>
                <th className="border border-gray-700 px-2 py-1">Product</th>
                <th className="border border-gray-700 px-2 py-1">Portfolio</th>
                <th className="border border-gray-700 px-2 py-1">Vehicle</th>
                <th className="border border-gray-700 px-2 py-1">Chalan</th>
                <th className="border border-gray-700 px-2 py-1">From</th>
                <th className="border border-gray-700 px-2 py-1">
                  Destination
                </th>
                <th className="border border-gray-700 px-2 py-1">Quantity</th>
                <th className="border border-gray-700 px-2 py-1">BodyFare</th>
                <th className="border border-gray-700 px-2 py-1">FuelCost</th>
                {/* <th className="border border-gray-700 p-1 text-center">
                  BillAmount
                  <br />
                  with VAT & TAX
                </th>{" "} */}
                {/* <th className="border border-gray-700 p-1 text-center">
                  Net Bill
                  <br />
                  Receivable after Tax
                </th> */}
                <th className="border border-gray-700 p-1 text-center">
                  ReceiveAmount
                </th>
                <th className="text-center border border-black py-1">
                  <p className="border-b">OpeningBalance {openingBalance}</p>
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="font-semibold">
              {yamahaLedger?.map((dt, index) => {
                // Bill Amount with VAT & TAX
                const rent = parseFloat(dt?.body_cost) || 0;
                const vatAmount = (rent * 15) / 100;
                const totalVatTax = rent + vatAmount;
                // Net Bill Receivable after Tax
                const body = parseFloat(dt?.body_cost) || 0;
                const fuel = parseFloat(dt?.fuel_cost) || 0;
                const billAmount = (body * 5) / 100;
                // const totalBillAmount = body - billAmount + fuel;
                const totalBillAmount = body + fuel; 
                // Receive amount
                const received = parseFloat(dt.rec_amount || 0);
                // update balance
                runningBalance += totalBillAmount;
                runningBalance -= received;
                return (
                  <tr key={index} lassName="hover:bg-gray-50 transition-all">
                    <td className="border border-gray-700 p-1 font-bold">
                      {index + 1}.
                    </td>
                    <td className="border border-gray-700 p-1 w-2xl min-w-[90px]">
                      {dt.bill_date}
                    </td>
                    <td className="border border-gray-700 p-1">Motorcycle</td>
                    <td className="border border-gray-700 p-1">Yamaha</td>
                    <td className="border border-gray-700 p-1">
                      {dt.vehicle_no}
                    </td>
                    <td className="border border-gray-700 p-1">{dt.chalan}</td>
                    <td className="border border-gray-700 p-1">
                      {dt.load_point}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.unload_point}
                    </td>
                    <td className="border border-gray-700 p-1">{dt.qty}</td>
                    <td className="border border-gray-700 p-1">
                      {dt.body_cost}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.fuel_cost}
                    </td>
                    {/* <td className="border border-gray-700 p-1">
                      {totalVatTax}
                    </td> */}
                    {/* <td className="border border-gray-700 p-1">
                      {totalBillAmount}
                    </td> */}
                    <td className="border border-gray-700 p-1">
                      {dt.rec_amount}
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
                  colSpan={9}
                  className="border border-black px-2 py-1 text-right"
                >
                  Total
                </td>
                <td className="border border-black px-2 py-1">
                  {totalBodyFare}
                </td>
                <td className="border border-black px-2 py-1">
                  {totalFuelCost}
                </td>
                {/* <td className="border border-black px-2 py-1">{totalBill}</td>
                <td className="border border-black px-2 py-1">{netBill}</td> */}
                <td className="border border-black px-2 py-1">{totalReceived}</td>
<td className="border border-black px-2 py-1">{finalBalance.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default YamahaLedger;
