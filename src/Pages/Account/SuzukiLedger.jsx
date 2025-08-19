
// import { useEffect, useState, useMemo } from "react"
// import { FaFilter } from "react-icons/fa6"
// import { Toaster, toast } from "react-hot-toast"
// import pdfMake from "pdfmake/build/pdfmake"
// import pdfFonts from "pdfmake/build/vfs_fonts"
// import axios from "axios"
// import { IoIosRemoveCircle } from "react-icons/io"
// import * as XLSX from "xlsx"
// import { saveAs } from "file-saver"
// import { toWords } from "number-to-words"
// import { HiCurrencyBangladeshi } from "react-icons/hi2"

// pdfMake.vfs = pdfFonts.vfs

// const SuzukiLedger = () => {
//   const [startDate, setStartDate] = useState("")
//   const [endDate, setEndDate] = useState("")
//   const [showFilter, setShowFilter] = useState(false)
//   const [ledgerData, setLedgerData] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [openingBalance, setOpeningBalance] = useState(0)

//   // Load data from server and set opening balance
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true)
//       try {
//         // Fetch customer list for opening balance
//         const customerRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/customer/list`)
//         const suzukiCustomer = customerRes.data.data.find((cust) => cust.customer_name === "Suzuki")
//         const initialDue = Number.parseFloat(suzukiCustomer?.due || "0") || 0
//         setOpeningBalance(initialDue)

//         // Fetch customer ledger list
//         const ledgerRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/customerLedger/list`)
//         if (ledgerRes.data.status === "Success") {
//           setLedgerData(ledgerRes.data.data)
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error)
//         toast.error("Failed to load data.")
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchData()
//   }, [])

//   // Filter Suzuki ledger entries
//   const suzukiLedger = useMemo(() => {
//     return ledgerData.filter((dt) => dt.customer_name === "Suzuki")
//   }, [ledgerData])

//   // Apply date filter to Suzuki ledger entries
//   const filteredLedger = useMemo(() => {
//     return suzukiLedger.filter((entry) => {
//       const entryDate = new Date(entry.bill_date || "")
//       const start = startDate ? new Date(startDate) : null
//       const end = endDate ? new Date(endDate) : null

//       if (isNaN(entryDate.getTime())) {
//         return false
//       }

//       return (!start || entryDate >= start) && (!end || entryDate <= end)
//     })
//   }, [suzukiLedger, startDate, endDate])

//   // Calculate ledger with running balances
//   const ledgerWithBalances = useMemo(() => {
//     let runningBalance = openingBalance
//     return filteredLedger.map(entry => {
//       const baseAmount = Number.parseFloat(entry?.bill_amount || "0") || 0
//       // const vatAmount = (baseAmount * 15) / 100
//       // const billAmountWithVatTax = baseAmount + vatAmount
//       // const taxDeduction = (baseAmount * 5) / 100
//       // const netBillReceivable = baseAmount - taxDeduction
//       const received = Number.parseFloat(entry.rec_amount || "0") || 0

//       runningBalance += baseAmount - received

//       return {
//         ...entry,
//         _calculatedBalance: runningBalance,
//         _billAmountWithVatTax: baseAmount,
//         // _netBillReceivable: netBillReceivable
//       }
//     })
//   }, [filteredLedger, openingBalance])

//   // Calculate totals for the footer
//   const totalQuantity = useMemo(() => {
//     return filteredLedger.reduce((sum, dt) => sum + (Number.parseFloat(dt.qty || "0") || 0), 0)
//   }, [filteredLedger])

//   const totalUnload = useMemo(() => {
//     return filteredLedger.reduce((sum, dt) => sum + (Number.parseFloat(dt.unload_charge || "0") || 0), 0)
//   }, [filteredLedger])

//   // const totalVehicleRentWithVAT = useMemo(() => {
//   //   return filteredLedger.reduce((sum, dt) => {
//   //     const baseAmount = Number.parseFloat(dt?.bill_amount || "0") || 0
//   //     const vatAmount = (baseAmount * 15) / 100
//   //     return sum + baseAmount + vatAmount
//   //   }, 0)
//   // }, [filteredLedger])

//   // const totalNetBillReceivable = useMemo(() => {
//   //   return filteredLedger.reduce((sum, dt) => {
//   //     const baseAmount = Number.parseFloat(dt?.bill_amount || "0") || 0
//   //     const taxDeduction = (baseAmount * 5) / 100
//   //     return sum + (baseAmount - taxDeduction)
//   //   }, 0)
//   // }, [filteredLedger])

//   // const totalReceivedAmount = useMemo(() => {
//   //   return filteredLedger.reduce((sum, dt) => sum + (Number.parseFloat(dt.rec_amount || "0") || 0), 0)
//   // }, [filteredLedger])

//   // const totalBalance = ledgerWithBalances.length
//   // ? ledgerWithBalances[ledgerWithBalances.length - 1]._calculatedBalance
//   // : openingBalance
//   // Total Bill Amount (without VAT)
// const totalBillAmount = useMemo(() => {
//   return filteredLedger.reduce(
//     (sum, dt) => sum + (Number.parseFloat(dt.bill_amount || "0") || 0),
//     0
//   )
// }, [filteredLedger])

// // Total Received
// const totalReceivedAmount = useMemo(() => {
//   return filteredLedger.reduce(
//     (sum, dt) => sum + (Number.parseFloat(dt.rec_amount || "0") || 0),
//     0
//   )
// }, [filteredLedger])

// // Total Balance = Opening Balance + Total Bill Amount - Total Received
// const totalBalance = useMemo(() => {
//   return openingBalance + totalBillAmount - totalReceivedAmount
// }, [openingBalance, totalBillAmount, totalReceivedAmount])

//   // Export to Excel
//   const exportToExcel = () => {
//     if (!ledgerWithBalances.length) {
//       return toast.error("No data to export.", { position: "top-right" })
//     }

//     const excelData = ledgerWithBalances.map((dt, idx) => {
//       return {
//         SL: idx + 1,
//         Date: dt.bill_date,
//         VehicleNo: dt.vehicle_no,
//         DealerName: dt.delar_name,
//         "Do(Si)": dt.do,
//         "Co(U)": dt.co,
//         Destination: dt.unload_point,
//         "Bike Qty": dt.qty,
//         UnloadCharge: dt.unload_charge,
//         "Bill Amount with VAT & TAX": dt._billAmountWithVatTax.toFixed(2),
//         "Net Bill Receivable after Tax": dt._netBillReceivable.toFixed(2),
//         ReceiveAmount: Number.parseFloat(dt.rec_amount || "0").toFixed(2),
//         Balance: dt._calculatedBalance.toFixed(2)
//       }
//     })

//     const worksheet = XLSX.utils.json_to_sheet(excelData)
//     const workbook = XLSX.utils.book_new()
//     XLSX.utils.book_append_sheet(workbook, worksheet, "SuzukiLedger")
//     const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
//     saveAs(new Blob([wbout], { type: "application/octet-stream" }), "SuzukiLedger.xlsx")
//   }

//   // Export to PDF
//   const exportToPDF = () => {
//     if (!ledgerWithBalances.length) {
//       return toast.error("No data to export.", { position: "top-right" })
//     }

//     const docDefinition = {
//       pageOrientation: "landscape",
//       content: [
//         { text: "Suzuki Customer Ledger Report", style: "header" },
//         {
//           table: {
//             headerRows: 1,
//             widths: ["auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
//             body: [
//               [
//                 "SL.",
//                 "Date",
//                 "VehicleNo.",
//                 "DealerName",
//                 "Do(Si)",
//                 "Co(U)",
//                 "Destination",
//                 "Bike Qty",
//                 "UnloadCharge",
//                 "Bill Amount with VAT & TAX",
//                 "Net Bill Receivable after Tax",
//                 "ReceiveAmount",
//                 "Balance"
//               ],
//               ...ledgerWithBalances.map((dt, idx) => [
//                 idx + 1,
//                 dt.bill_date,
//                 dt.vehicle_no,
//                 dt.delar_name,
//                 dt.do,
//                 dt.co,
//                 dt.unload_point,
//                 dt.qty,
//                 dt.unload_charge,
//                 dt._billAmountWithVatTax.toFixed(2),
//                 dt._netBillReceivable.toFixed(2),
//                 Number.parseFloat(dt.rec_amount || "0").toFixed(2),
//                 dt._calculatedBalance.toFixed(2)
//               ]),
//             ],
//           },
//         },
//         {
//           table: {
//             widths: ["*"],
//             body: [
//               [
//                 {
//                   text: `In Words: ${toWords(totalNetBillReceivable).replace(/^\w/, (c) => c.toUpperCase())} Taka only.`,
//                   style: "words"
//                 }
//               ]
//             ]
//           },
//           margin: [0, 10, 0, 0]
//         }
//       ],
//       styles: {
//         header: {
//           fontSize: 16,
//           bold: true,
//           marginBottom: 10,
//           alignment: "center",
//         },
//         words: {
//           fontSize: 10,
//           bold: true,
//           marginTop: 5
//         }
//       },
//     }
//     pdfMake.createPdf(docDefinition).download("SuzukiLedger.pdf")
//   }

//   // Handle Print
//   const handlePrint = () => {
//     if (!ledgerWithBalances.length) {
//       return toast.error("No data to print.", { position: "top-right" })
//     }

//     const currentYear = new Date().getFullYear()
//     const totalInWords = toWords(totalNetBillReceivable).replace(/^\w/, (c) => c.toUpperCase()) + " Taka only."

//     const rowsHTML = ledgerWithBalances
//       .map((dt, i) => `
//         <tr>
//           <td>${i + 1}.</td>
//           <td>${dt.bill_date}</td>
//           <td>${dt.vehicle_no || "--"}</td>
//           <td>${dt.delar_name|| "--"}</td>
//           <td>${dt.do|| "--"} </td>
//           <td>${dt.co ||"--"}</td>
//           <td>${dt.unload_point || "--"}</td>
//           <td>${dt.qty || 0}</td>
//           <td>${dt.unload_charge|| 0}</td>
//           <td>${dt._billAmountWithVatTax.toFixed(2) || 0}</td>
//           <td>${dt._netBillReceivable.toFixed(2)|| 0}</td>
//           <td>${Number.parseFloat(dt.rec_amount || "0").toFixed(2)}</td>
//           <td>${dt._calculatedBalance.toFixed(2)}</td>
//         </tr>`
//       )
//       .join("")

//     const html = `
//   <html>
//     <head>
//       <style>
//         @page {
//           margin: 0;
//         }
//         body {
//           margin: 1cm;
//           font-family: Arial, sans-serif;
//           font-size: 12px;
//         }
//         .header-section { margin-bottom: 5px; }
//         .subject { margin-top: 20px; }
//         table {
//           border-collapse: collapse;
//           width: 100%;
//           font-size: 12px;
//         }
//         th, td {
//           border: 1px solid #000;
//           padding: 4px;
//           text-align: center;
//         }
//         th {
//           background: #eee;
//         }
//         tfoot td {
//           font-weight: bold;
//           background-color: #f3f3f3;
//         }
//         .no-print {
//           display: none;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="header-section">
//         <div class="to-section">
//           <div>To</div>
//           <div><strong>Rancon Motor Bikes Ltd.</strong></div>
//           <div>Boro Bhobanipur</div>
//           <div>Kashimpur, Gazipur</div>
//           <div>Dhaka</div>
//           <div class="subject">Subject : Carrying Bill-${currentYear}</div>
//         </div>
//       </div>
//       <table>
//         <thead>
//           <tr>
//             <th>SL</th>
//             <th>Date</th>
//             <th>Vehicle No</th>
//             <th>Dealer Name</th>
//             <th>Do (Si)</th>
//             <th>Co (U)</th>
//             <th>Destination</th>
//             <th>Bike<br/>Qty</th>
//             <th>Unload<br/>Charge</th>
//             <th>Bill Amount<br/>(With Vat+Tax)</th>
//             <th>Net Bill<br/>Receivable after Tax</th>
//             <th>Receive<br/>Amount</th>
//             <th>Balance</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${rowsHTML}
//         </tbody>
//         <tfoot>
//           <tr class="font-bold">
//             <td colspan="7" class="border border-black px-2 py-1 text-right">Total</td>
//             <td class="border border-black px-2 py-1">${totalQuantity}</td>
//             <td class="border border-black px-2 py-1">${totalUnload}</td>
//             <td class="border border-black px-2 py-1">${totalVehicleRentWithVAT.toFixed(2)}</td>
//             <td class="border border-black px-2 py-1">${totalNetBillReceivable.toFixed(2)}</td>
//             <td class="border border-black px-2 py-1">${totalReceivedAmount.toFixed(2)}</td>
//             <td class="border border-black px-2 py-1"></td>
//           </tr>
//           <tr class="font-bold">
//             <td colspan="13" style="text-align:left;">In Words: <strong>${totalInWords}</strong></td>
//           </tr>
//         </tfoot>
//       </table>
//     </body>
//   </html>`
//     const newWindow = window.open("", "_blank")
//     newWindow?.document.write(html)
//     newWindow?.document.close()
//     newWindow?.focus()
//     newWindow?.print()
//   }

//   if (loading) return <p className="text-center mt-16">Loading Suzuki Ledger...</p>

//   return (
//     <div className="">
//       <Toaster />
//       <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-lg p-2 py-10 md:p-2 border border-gray-200">
//         <div className="md:flex items-center justify-between mb-6">
//           <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
//             <HiCurrencyBangladeshi className="text-[#11375B] text-2xl" />
//             Suzuki Ledger
//           </h1>
//           <div className="mt-3 md:mt-0 flex gap-2 no-print">
//             <button
//               onClick={() => setShowFilter((prev) => !prev)}
//               className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//             >
//               <FaFilter /> Filter
//             </button>
//           </div>
//         </div>
//         {/* export and search */}
//         <div className="md:flex justify-between items-center mb-4 no-print">
//           <div className="flex gap-1 md:gap-3 text-[#11375B] font-semibold rounded-md">
//             <button
//               onClick={exportToExcel}
//               className="py-2 px-5 hover:bg-[#11375B] bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//             >
//               Excel
//             </button>
//             <button
//               onClick={exportToPDF}
//               className="py-2 px-5 hover:bg-[#11375B] bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//             >
//               PDF
//             </button>
//             <button
//               onClick={handlePrint}
//               className="py-2 px-5 hover:bg-[#11375B] bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//             >
//               Print
//             </button>
//           </div>
//         </div>
//         {showFilter && (
//           <div className="md:flex items-center gap-5 justify-between border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5 no-print">
//             <div className="relative w-full">
//               <label className="block mb-1 text-sm font-medium">Start Date</label>
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
//                   setStartDate("")
//                   setEndDate("")
//                   setShowFilter(false)
//                 }}
//                 className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//               >
//                 <IoIosRemoveCircle /> Clear Filter
//               </button>
//             </div>
//           </div>
//         )}
//         <div className="w-full mt-5 overflow-x-auto border border-gray-200">
//           <table className="w-full text-sm text-left">
//             <thead className="capitalize text-sm">
//               <tr>
//                 <th className="border border-gray-700 px-2 py-1 ">SL.</th>
//                 <th className="border border-gray-700 px-2 py-1 ">Date</th>
//                 <th className="border border-gray-700 px-2 py-1 ">VehicleNo.</th>
//                 <th className="border border-gray-700 px-2 py-1 ">DealerName</th>
//                 <th className="border border-gray-700 px-2 py-1 ">Do(Si)</th>
//                 <th className="border border-gray-700 px-2 py-1">Co(U)</th>
//                 <th className="border border-gray-700 px-2 py-1 ">Destination</th>
//                 <th className="border border-gray-700 p-1 text-center ">
//                   BillAmount
//                   <br />
//                   with VAT & TAX
//                 </th>
//                 {/* <th className="border border-gray-700 p-1 text-center ">
//                   Net Bill
//                   <br />
//                   Receivable after Tax
//                 </th> */}
//                 <th className="border border-gray-700 p-1 text-center ">ReceiveAmount</th>
//                 <th className="text-center border border-black py-1 ">
//                   <p className="border-b">OpeningBalance {openingBalance.toFixed(2)}</p>
//                   Balance
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="font-semibold">
//               {ledgerWithBalances?.map((dt, index) => (
                
//                 <tr key={index} className="hover:bg-gray-50 transition-all">
//                   <td className="border border-gray-700 p-1 font-bold">{index + 1}.</td>
//                   <td className="border border-gray-700 p-1">{dt.bill_date}</td>
//                   <td className="border border-gray-700 p-1">{dt.vehicle_no}</td>
//                   <td className="border border-gray-700 p-1">{dt.delar_name}</td>
//                   <td className="border border-gray-700 p-1">{dt.do}</td>
//                   <td className="border border-gray-700 p-1">{dt.co}</td>
//                   <td className="border border-gray-700 p-1">{dt.unload_point}</td>
//                   <td className="border border-gray-700 p-1">{dt._billAmountWithVatTax.toFixed(2)}</td>
//                   {/* <td className="border border-gray-700 p-1">{dt._netBillReceivable.toFixed(2)}</td> */}
//                   <td className="border border-gray-700 p-1">{Number.parseFloat(dt.rec_amount || "0").toFixed(2)}</td>
//                   <td className="border border-gray-700 p-1">{dt._calculatedBalance.toFixed(2)}</td>
//                 </tr>
//               ))}
//             </tbody>
//             <tfoot>
//               <tr className="font-bold">
//                 <td colSpan={7} className="border border-black px-2 py-1 text-right">
//                   Total
//                 </td>
//                 <td className="border border-black px-2 py-1">{totalBillAmount.toFixed(2)}</td>
//                 {/* <td className="border border-black px-2 py-1">{totalNetBillReceivable.toFixed(2)}</td> */}
//                 <td className="border border-black px-2 py-1">{totalReceivedAmount.toFixed(2)}</td>
//                 <td className="border border-black px-2 py-1">{totalBalance.toFixed(2)}</td>
//               </tr>
//               <tr className="font-bold">
//                 <td colSpan={13} className="border border-black px-2 py-1 text-left">
//                   In Words:{" "}
//                   <span className="font-medium">
//                     {toWords(totalBalance).replace(/^\w/, (c) => c.toUpperCase()) + " Taka only."}
//                   </span>
//                 </td>
//               </tr>
//             </tfoot>
//           </table>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default SuzukiLedger



import { useEffect, useState, useMemo } from "react"
import { FaFilter } from "react-icons/fa6"
import { Toaster, toast } from "react-hot-toast"
import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"
import axios from "axios"
import { IoIosRemoveCircle } from "react-icons/io"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { toWords } from "number-to-words"
import { HiCurrencyBangladeshi } from "react-icons/hi2"

pdfMake.vfs = pdfFonts.vfs

const SuzukiLedger = () => {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showFilter, setShowFilter] = useState(false)
  const [ledgerData, setLedgerData] = useState([])
  const [loading, setLoading] = useState(true)
  const [openingBalance, setOpeningBalance] = useState(0)

  // Load data from server and set opening balance
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch customer list for opening balance
        const customerRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/customer/list`)
        const suzukiCustomer = customerRes.data.data.find((cust) => cust.customer_name === "Suzuki")
        const initialDue = Number.parseFloat(suzukiCustomer?.due || "0") || 0
        setOpeningBalance(initialDue)

        // Fetch customer ledger list
        const ledgerRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/customerLedger/list`)
        if (ledgerRes.data.status === "Success") {
          setLedgerData(ledgerRes.data.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load data.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter Suzuki ledger entries
  const suzukiLedger = useMemo(() => {
    return ledgerData.filter((dt) => dt.customer_name === "Suzuki")
  }, [ledgerData])

  // Apply date filter to Suzuki ledger entries
  const filteredLedger = useMemo(() => {
    return suzukiLedger.filter((entry) => {
      const entryDate = new Date(entry.bill_date || "")
      const start = startDate ? new Date(startDate) : null
      const end = endDate ? new Date(endDate) : null

      if (isNaN(entryDate.getTime())) {
        return false
      }

      return (!start || entryDate >= start) && (!end || entryDate <= end)
    })
  }, [suzukiLedger, startDate, endDate])

  // Calculate ledger with running balances
  const ledgerWithBalances = useMemo(() => {
    let runningBalance = openingBalance
    return filteredLedger.map(entry => {
      const baseAmount = Number.parseFloat(entry?.bill_amount || "0") || 0
      const received = Number.parseFloat(entry.rec_amount || "0") || 0

      runningBalance += baseAmount - received

      return {
        ...entry,
        _calculatedBalance: runningBalance,
        _billAmount: baseAmount,
      }
    })
  }, [filteredLedger, openingBalance])

  // Calculate totals for the footer
  const totalQuantity = useMemo(() => {
    return filteredLedger.reduce((sum, dt) => sum + (Number.parseFloat(dt.qty || "0") || 0), 0)
  }, [filteredLedger])

  const totalUnload = useMemo(() => {
    return filteredLedger.reduce((sum, dt) => sum + (Number.parseFloat(dt.unload_charge || "0") || 0), 0)
  }, [filteredLedger])

  // Total Bill Amount
  const totalBillAmount = useMemo(() => {
    return filteredLedger.reduce(
      (sum, dt) => sum + (Number.parseFloat(dt.bill_amount || "0") || 0),
      0
    )
  }, [filteredLedger])

  // Total Received
  const totalReceivedAmount = useMemo(() => {
    return filteredLedger.reduce(
      (sum, dt) => sum + (Number.parseFloat(dt.rec_amount || "0") || 0),
      0
    )
  }, [filteredLedger])

  // Total Balance = Opening Balance + Total Bill Amount - Total Received
  const totalBalance = useMemo(() => {
    return openingBalance + totalBillAmount - totalReceivedAmount
  }, [openingBalance, totalBillAmount, totalReceivedAmount])

  // Export to Excel
  const exportToExcel = () => {
    if (!ledgerWithBalances.length) {
      return toast.error("No data to export.", { position: "top-right" })
    }

    const excelData = ledgerWithBalances.map((dt, idx) => {
      return {
        SL: idx + 1,
        Date: dt.bill_date,
        VehicleNo: dt.vehicle_no,
        DealerName: dt.delar_name,
        "Do(Si)": dt.do,
        "Co(U)": dt.co,
        Destination: dt.unload_point,
        "Bike Qty": dt.qty,
        UnloadCharge: dt.unload_charge,
        "Bill Amount": dt._billAmount.toFixed(2),
        ReceiveAmount: Number.parseFloat(dt.rec_amount || "0").toFixed(2),
        Balance: dt._calculatedBalance.toFixed(2)
      }
    })

    // Add summary row
    excelData.push({
      SL: "Total",
      Date: "",
      VehicleNo: "",
      DealerName: "",
      "Do(Si)": "",
      "Co(U)": "",
      Destination: "",
      "Bike Qty": totalQuantity,
      UnloadCharge: totalUnload.toFixed(2),
      "Bill Amount": totalBillAmount.toFixed(2),
      ReceiveAmount: totalReceivedAmount.toFixed(2),
      Balance: totalBalance.toFixed(2)
    })

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "SuzukiLedger")
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "SuzukiLedger.xlsx")
  }

  // Export to PDF
  const exportToPDF = () => {
    if (!ledgerWithBalances.length) {
      return toast.error("No data to export.", { position: "top-right" })
    }

    const docDefinition = {
      pageOrientation: "landscape",
      content: [
        { 
          text: "Suzuki Customer Ledger Report", 
          style: "header",
          margin: [0, 0, 0, 10] 
        },
        {
          text: `Opening Balance: ${openingBalance.toFixed(2)}`,
          style: "subheader",
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
            body: [
              [
                "SL.",
                "Date",
                "VehicleNo.",
                "DealerName",
                "Do(Si)",
                "Co(U)",
                "Destination",
                "Bike Qty",
                "UnloadCharge",
                "Bill Amount",
                "ReceiveAmount",
                "Balance"
              ],
              ...ledgerWithBalances.map((dt, idx) => [
                idx + 1,
                dt.bill_date,
                dt.vehicle_no,
                dt.delar_name,
                dt.do,
                dt.co,
                dt.unload_point,
                dt.qty,
                dt.unload_charge,
                dt._billAmount.toFixed(2),
                Number.parseFloat(dt.rec_amount || "0").toFixed(2),
                dt._calculatedBalance.toFixed(2)
              ]),
              [
                "Total",
                "",
                "",
                "",
                "",
                "",
                "",
                totalQuantity,
                totalUnload.toFixed(2),
                totalBillAmount.toFixed(2),
                totalReceivedAmount.toFixed(2),
                totalBalance.toFixed(2)
              ]
            ],
          },
        },
        {
          text: `In Words: ${toWords(totalBalance).replace(/^\w/, (c) => c.toUpperCase())} Taka only.`,
          style: "words",
          margin: [0, 10, 0, 0]
        }
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          alignment: "center",
        },
        subheader: {
          fontSize: 12,
          bold: true,
          alignment: "left"
        },
        words: {
          fontSize: 10,
          bold: true
        }
      },
    }
    pdfMake.createPdf(docDefinition).download("SuzukiLedger.pdf")
  }

  // Handle Print
  const handlePrint = () => {
    if (!ledgerWithBalances.length) {
      return toast.error("No data to print.", { position: "top-right" })
    }

    const currentYear = new Date().getFullYear()
    const totalInWords = toWords(totalBalance).replace(/^\w/, (c) => c.toUpperCase()) + " Taka only."

    const rowsHTML = ledgerWithBalances
      .map((dt, i) => `
        <tr>
          <td>${i + 1}.</td>
          <td>${dt.bill_date}</td>
          <td>${dt.vehicle_no || "--"}</td>
          <td>${dt.delar_name|| "--"}</td>
          <td>${dt.do|| "--"} </td>
          <td>${dt.co ||"--"}</td>
          <td>${dt.unload_point || "--"}</td>
          <td>${dt.qty || 0}</td>
          <td>${dt.unload_charge|| 0}</td>
          <td>${dt._billAmount.toFixed(2) || 0}</td>
          <td>${Number.parseFloat(dt.rec_amount || "0").toFixed(2)}</td>
          <td>${dt._calculatedBalance.toFixed(2)}</td>
        </tr>`
      )
      .join("")

    const html = `
      <html>
        <head>
          <title>Suzuki Ledger Report</title>
          <style>
            @page {
              size: landscape;
              margin: 10mm;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              margin: 0;
              padding: 10px;
            }
            .header {
              text-align: center;
              margin-bottom: 15px;
            }
            .header h1 {
              font-size: 18px;
              margin: 5px 0;
            }
            .header p {
              margin: 3px 0;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #000;
              padding: 5px;
              text-align: center;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .total-row {
              font-weight: bold;
              background-color: #f2f2f2;
            }
            .words {
              margin-top: 10px;
              font-weight: bold;
            }
            .no-print {
              display: none;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Suzuki Customer Ledger Report</h1>
            <p>Opening Balance: ${openingBalance.toFixed(2)}</p>
            <p>Period: ${startDate || 'Start'} to ${endDate || 'End'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Date</th>
                <th>Vehicle No</th>
                <th>Dealer Name</th>
                <th>Do (Si)</th>
                <th>Co (U)</th>
                <th>Destination</th>
                <th>Bike Qty</th>
                <th>Unload Charge</th>
                <th>Bill Amount</th>
                <th>Receive Amount</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
              <tr class="total-row">
                <td colspan="7">Total</td>
                <td>${totalQuantity}</td>
                <td>${totalUnload.toFixed(2)}</td>
                <td>${totalBillAmount.toFixed(2)}</td>
                <td>${totalReceivedAmount.toFixed(2)}</td>
                <td>${totalBalance.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div class="words">In Words: ${totalInWords}</div>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank', 'width=1000,height=600')
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
    
    // Wait for content to load before printing
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      }, 500)
    }
  }

  if (loading) return <p className="text-center mt-16">Loading Suzuki Ledger...</p>

  return (
    <div className="">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-lg p-2 py-10 md:p-2 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <HiCurrencyBangladeshi className="text-[#11375B] text-2xl" />
            Suzuki Ledger
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2 no-print">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>
        {/* export and search */}
        <div className="md:flex justify-between items-center mb-4 no-print">
          <div className="flex gap-1 md:gap-3 text-[#11375B] font-semibold rounded-md">
            <button
              onClick={exportToExcel}
              className="py-2 px-5 hover:bg-[#11375B] bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              Excel
            </button>
            <button
              onClick={exportToPDF}
              className="py-2 px-5 hover:bg-[#11375B] bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              PDF
            </button>
            <button
              onClick={handlePrint}
              className="py-2 px-5 hover:bg-[#11375B] bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              Print
            </button>
          </div>
        </div>
        {showFilter && (
          <div className="md:flex items-center gap-5 justify-between border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5 no-print">
            <div className="relative w-full">
              <label className="block mb-1 text-sm font-medium">Start Date</label>
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
                  setStartDate("")
                  setEndDate("")
                  setShowFilter(false)
                }}
                className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <IoIosRemoveCircle /> Clear Filter
              </button>
            </div>
          </div>
        )}
        <div className="w-full mt-5 overflow-x-auto border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="capitalize text-sm">
              <tr>
                <th className="border border-gray-700 px-2 py-1 ">SL.</th>
                <th className="border border-gray-700 px-2 py-1 ">Date</th>
                <th className="border border-gray-700 px-2 py-1 ">VehicleNo.</th>
                <th className="border border-gray-700 px-2 py-1 ">DealerName</th>
                <th className="border border-gray-700 px-2 py-1 ">Do(Si)</th>
                <th className="border border-gray-700 px-2 py-1">Co(U)</th>
                <th className="border border-gray-700 px-2 py-1 ">Destination</th>
                <th className="border border-gray-700 p-1 text-center ">
                  BillAmount
                </th>
                <th className="border border-gray-700 p-1 text-center ">ReceiveAmount</th>
                <th className="text-center border border-black py-1 ">
                  <p className="border-b">OpeningBalance {openingBalance.toFixed(2)}</p>
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="font-semibold">
              {ledgerWithBalances?.map((dt, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-all">
                  <td className="border border-gray-700 p-1 font-bold">{index + 1}.</td>
                  <td className="border border-gray-700 p-1">{dt.bill_date}</td>
                  <td className="border border-gray-700 p-1">{dt.vehicle_no}</td>
                  <td className="border border-gray-700 p-1">{dt.delar_name}</td>
                  <td className="border border-gray-700 p-1">{dt.do}</td>
                  <td className="border border-gray-700 p-1">{dt.co}</td>
                  <td className="border border-gray-700 p-1">{dt.unload_point}</td>
                  <td className="border border-gray-700 p-1">{dt._billAmount.toFixed(2)}</td>
                  <td className="border border-gray-700 p-1">{Number.parseFloat(dt.rec_amount || "0").toFixed(2)}</td>
                  <td className="border border-gray-700 p-1">{dt._calculatedBalance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td colSpan={7} className="border border-black px-2 py-1 text-right">
                  Total
                </td>
                <td className="border border-black px-2 py-1">{totalBillAmount.toFixed(2)}</td>
                <td className="border border-black px-2 py-1">{totalReceivedAmount.toFixed(2)}</td>
                <td className="border border-black px-2 py-1">{totalBalance.toFixed(2)}</td>
              </tr>
              <tr className="font-bold">
                <td colSpan={13} className="border border-black px-2 py-1 text-left">
                  In Words:{" "}
                  <span className="font-medium">
                    {toWords(totalBalance).replace(/^\w/, (c) => c.toUpperCase()) + " Taka only."}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SuzukiLedger