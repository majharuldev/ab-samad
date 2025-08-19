// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import dayjs from "dayjs";
// import { FaFilter, FaFilePdf, FaFileExcel, FaPrint, FaSearch } from "react-icons/fa";
// import { useReactToPrint } from "react-to-print";
// import { jsPDF } from "jspdf";
// import "jspdf-autotable";
// import { GrFormNext, GrFormPrevious } from "react-icons/gr";

// export default function FuelReport() {
//   const [tripData, setTripData] = useState([]);
//   const [purchaseData, setPurchaseData] = useState([]);
//   const [report, setReport] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showFilter, setShowFilter] = useState(false);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const reportRef = useRef();

//   // Fetch both APIs
//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const tripRes = await axios.get("${import.meta.env.VITE_BASE_URL}/api/trip/list");
//       const purchaseRes = await axios.get("${import.meta.env.VITE_BASE_URL}/api/purchase/list");
//       setTripData(tripRes.data.data || []);
//       setPurchaseData(purchaseRes.data.data || []);
//       generateReport(tripRes.data.data, purchaseRes.data.data);
//     } catch (error) {
//       console.error("Error fetching data", error);
//     }
//     setLoading(false);
//   };

//   // Generate fuel report
//   const generateReport = (trips, purchases) => {
//     const fuelPurchases = purchases.filter(p => p.category?.toLowerCase() === "fuel");
    
//     const grouped = fuelPurchases.reduce((acc, curr) => {
//       const date = curr.date;
//       if (!acc[date]) {
//         acc[date] = { 
//           date, 
//           totalQty: 0, 
//           totalCost: 0, 
//           suppliers: new Set(), 
//           tripCount: 0 
//         };
//       }
//       acc[date].totalQty += Number(curr.quantity || 0);
//       const cost = curr.purchase_amount ? Number(curr.purchase_amount) : 
//                   (Number(curr.quantity || 0) * Number(curr.unit_price || 0));
//       acc[date].totalCost += cost;
//       acc[date].suppliers.add(curr.supplier_name);
//       return acc;
//     }, {});

//     // Count trips per date
//     trips.forEach(trip => {
//       if (!trip.date) return;
//       const date = trip.date;
//       if (grouped[date]) {
//         grouped[date].tripCount += 1;
//       }
//     });

//     // Convert to array
//     const reportArray = Object.values(grouped).map(item => ({
//       ...item,
//       avgPrice: item.totalQty ? (item.totalCost / item.totalQty).toFixed(2) : "0",
//       suppliers: Array.from(item.suppliers).join(", ")
//     }));

//     setReport(reportArray);
//   };

//   // Filter report by date range and search term
//   const filteredReport = report.filter(item => {
//     // Date filter
//     if (startDate && endDate) {
//       const itemDate = dayjs(item.date);
//       if (!itemDate.isBetween(dayjs(startDate), dayjs(endDate), 'day', '[]')) {
//         return false;
//       }
//     }
    
//     // Search filter
//     if (searchTerm) {
//       const searchLower = searchTerm.toLowerCase();
//       return (
//         item.date.toLowerCase().includes(searchLower) ||
//         item.suppliers.toLowerCase().includes(searchLower) ||
//         item.totalQty.toString().includes(searchLower) ||
//         item.totalCost.toString().includes(searchLower) ||
//         item.avgPrice.includes(searchLower)
//   )}
    
//     return true;
//   });

//   // Handle print
//   const handlePrint = useReactToPrint({
//     content: () => reportRef.current,
//     pageStyle: `
//       @page { 
//         size: auto;  
//         margin: 10mm;
//       }
//       @media print {
//         body { 
//           -webkit-print-color-adjust: exact; 
//         }
//         table { 
//           width: 100%; 
//           border-collapse: collapse; 
//         }
//         th { 
//           background-color: #11375B !important; 
//           color: white !important; 
//         }
//       }
//     `
//   });

//   // Handle PDF export
//   const handlePdfExport = () => {
//     const doc = new jsPDF();
//     const title = "Fuel Report";
//     const headers = [
//       ["Date", "Trips", "Fuel Qty (L)", "Total Cost", "Avg Price/L", "Suppliers"]
//     ];
    
//     const data = filteredReport.map(item => [
//       item.date,
//       item.tripCount.toString(),
//       item.totalQty.toString(),
//       item.totalCost.toFixed(2),
//       item.avgPrice,
//       item.suppliers
//     ]);

//     doc.text(title, 14, 16);
//     doc.autoTable({
//       head: headers,
//       body: data,
//       startY: 20,
//       styles: {
//         halign: 'center',
//         cellPadding: 3,
//         fontSize: 8
//       },
//       headStyles: {
//         fillColor: [17, 55, 91],
//         textColor: 255
//       }
//     });

//     doc.save('fuel_report.pdf');
//   };

//   // Handle Excel export
//   const handleExcelExport = () => {
//     let csvContent = "data:text/csv;charset=utf-8,";
    
//     // Headers
//     csvContent += "Date,Trips,Fuel Qty (L),Total Cost,Avg Price/L,Suppliers\n";
    
//     // Data
//     filteredReport.forEach(item => {
//       csvContent += `${item.date},${item.tripCount},${item.totalQty},${item.totalCost.toFixed(2)},${item.avgPrice},${item.suppliers}\n`;
//     });
    
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", "fuel_report.csv");
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   // pagination
//   const [currentPage, setCurrentPage] = useState(1)
//   const itemsPerPage = 10;
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentCustomer = customer.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(customer.length / itemsPerPage);
//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage((currentPage) => currentPage - 1);
//   };
//   const handleNextPage = () => {
//     if (currentPage < totalPages)
//       setCurrentPage((currentPage) => currentPage + 1);
//   };
//   const handlePageClick = (number) => {
//     setCurrentPage(number);
//   };

//   return (
//     <div className=" md:p-2">
//       <div 
//         ref={reportRef}
//         className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-8 border border-gray-200"
//       >
//         {/* Header */}
//         <div className="md:flex items-center justify-between mb-6">
//           <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
//             Fuel Report
//           </h1>
//           <div className="mt-3 md:mt-0 flex gap-2">
//             <button
//               onClick={() => setShowFilter(prev => !prev)}
//               className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//             >
//               <FaFilter /> Filter
//             </button>
//           </div>
//         </div>

//         {/* Export and Search */}
//         <div className="md:flex justify-between items-center">
//           <div className="flex gap-1 md:gap-3 text-primary font-semibold rounded-md">
//             <button 
//               onClick={handleExcelExport}
//               className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer flex items-center gap-2"
//             >
//               <FaFileExcel /> Excel
//             </button>
//             <button 
//               onClick={handlePdfExport}
//               className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer flex items-center gap-2"
//             >
//               <FaFilePdf /> PDF
//             </button>
//             <button 
//               onClick={handlePrint}
//               className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer flex items-center gap-2"
//             >
//               <FaPrint /> Print
//             </button>
//           </div>
          
//           <div className="mt-3 md:mt-0 relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <FaSearch className="text-gray-400" />
//             </div>
//             <input
//               type="text"
//               placeholder="Search..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="border border-gray-300 rounded-md outline-none text-sm py-2 pl-10 pr-5 w-full md:w-64"
//             />
//           </div>
//         </div>

//         {/* Conditional Filter Section */}
//         {showFilter && (
//           <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
//             <div className="relative w-full">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
//               <input
//                 type="date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//                 className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//               />
//             </div>
//             <div className="relative w-full">
//               <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
//               <input
//                 type="date"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//                 className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//               />
//             </div>
//           </div>
//         )}

//         {/* Loading state */}
//         {loading && (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#11375B]"></div>
//           </div>
//         )}

//         {/* Table */}
//         {!loading && (
//           <div className="mt-5 overflow-x-auto rounded-xl">
//             <table className="min-w-full text-sm text-left">
//               <thead className="bg-[#11375B] text-white capitalize text-sm">
//                 <tr>
//                   <th className="p-3">Date</th>
//                   <th className="p-3">Trips</th>
//                   <th className="p-3">Fuel Qty (L)</th>
                  
//                   <th className="p-3">Avg Price/L</th>
//                   <th className="p-3">Total Cost</th>
//                   <th className="p-3">Suppliers</th>
//                 </tr>
//               </thead>
//               <tbody className="text-[#11375B] font-semibold bg-gray-100">
//                 {
//                 filteredReport.length > 0 ? (
//                   filteredReport.map((item, index) => (
//                     <tr key={index} className="hover:bg-gray-50 transition-all border border-gray-200">
//                       <td className="p-3">{item.date}</td>
//                       <td className="p-3">{item.tripCount}</td>
//                       <td className="p-3">{item.totalQty}</td>
                      
//                       <td className="p-3">{item.avgPrice}</td>
//                       <td className="p-3">{item.totalCost.toFixed(2)}</td>
//                       <td className="p-3">{item.suppliers}</td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={6} className="p-4 text-center text-gray-500">
//                       No fuel data found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//         {/* pagination */}
//                 {currentCustomer.length > 0 && totalPages >= 1 &&
//                 (<div className="mt-10 flex justify-center">
//                   <div className="space-x-2 flex items-center">
//                     <button
//                       onClick={handlePrevPage}
//                       className={`p-2 ${
//                         currentPage === 1 ? "bg-gray-300" : "bg-primary text-white"
//                       } rounded-sm`}
//                       disabled={currentPage === 1}
//                     >
//                       <GrFormPrevious />
//                     </button>
//                     {[...Array(totalPages).keys()].map((number) => (
//                       <button
//                         key={number + 1}
//                         onClick={() => handlePageClick(number + 1)}
//                         className={`px-3 py-1 rounded-sm ${
//                           currentPage === number + 1
//                             ? "bg-primary text-white hover:bg-gray-200 hover:text-primary transition-all duration-300 cursor-pointer"
//                             : "bg-gray-200 hover:bg-primary hover:text-white transition-all cursor-pointer"
//                         }`}
//                       >
//                         {number + 1}
//                       </button>
//                     ))}
//                     <button
//                       onClick={handleNextPage}
//                       className={`p-2 ${
//                         currentPage === totalPages
//                           ? "bg-gray-300"
//                           : "bg-primary text-white"
//                       } rounded-sm`}
//                       disabled={currentPage === totalPages}
//                     >
//                       <GrFormNext />
//                     </button>
//                   </div>
//                 </div>)}
//       </div>
//     </div>
//   );
// }


// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import dayjs from "dayjs";
// import { FaFilter, FaFilePdf, FaFileExcel, FaPrint, FaSearch } from "react-icons/fa";
// import { useReactToPrint } from "react-to-print";
// import { jsPDF } from "jspdf";
// import "jspdf-autotable";
// import { GrFormNext, GrFormPrevious } from "react-icons/gr";

// export default function FuelReport() {
//   const [tripData, setTripData] = useState([]);
//   const [purchaseData, setPurchaseData] = useState([]);
//   const [report, setReport] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showFilter, setShowFilter] = useState(false);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const reportRef = useRef();

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   // Fetch both APIs
//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const tripRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`);
//       const purchaseRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/purchase/list`);
//       setTripData(tripRes.data.data || []);
//       setPurchaseData(purchaseRes.data.data || []);
//       generateReport(tripRes.data.data, purchaseRes.data.data);
//     } catch (error) {
//       console.error("Error fetching data", error);
//     }
//     setLoading(false);
//   };

//   // Generate fuel report
//   const generateReport = (trips, purchases) => {
//     const fuelPurchases = purchases.filter(p => p.category?.toLowerCase() === "fuel");
    
//     const grouped = fuelPurchases.reduce((acc, curr) => {
//       const date = curr.date;
//       if (!acc[date]) {
//         acc[date] = { 
//           date, 
//           totalQty: 0, 
//           totalCost: 0, 
//           suppliers: new Set(), 
//           tripCount: 0 
//         };
//       }
//       acc[date].totalQty += Number(curr.quantity || 0);
//       const cost = curr.purchase_amount ? Number(curr.purchase_amount) : 
//                   (Number(curr.quantity || 0) * Number(curr.unit_price || 0));
//       acc[date].totalCost += cost;
//       acc[date].suppliers.add(curr.supplier_name);
//       return acc;
//     }, {});

//     // Count trips per date
//     trips.forEach(trip => {
//       if (!trip.date) return;
//       const date = trip.date;
//       if (grouped[date]) {
//         grouped[date].tripCount += 1;
//       }
//     });

//     // Convert to array
//     const reportArray = Object.values(grouped).map(item => ({
//       ...item,
//       avgPrice: item.totalQty ? (item.totalCost / item.totalQty).toFixed(2) : "0",
//       suppliers: Array.from(item.suppliers).join(", ")
//     }));

//     setReport(reportArray);
//   };

//   // Filter report by date range and search term
//   const filteredReport = report.filter(item => {
//     // Date filter
//     if (startDate && endDate) {
//       const itemDate = dayjs(item.date);
//       if (!itemDate.isBetween(dayjs(startDate), dayjs(endDate), 'day', '[]')) {
//         return false;
//       }
//     }
    
//     // Search filter
//     if (searchTerm) {
//       const searchLower = searchTerm.toLowerCase();
//       return (
//         item.date.toLowerCase().includes(searchLower) ||
//         item.suppliers.toLowerCase().includes(searchLower) ||
//         item.totalQty.toString().includes(searchLower) ||
//         item.totalCost.toString().includes(searchLower) ||
//         item.avgPrice.includes(searchLower)
//       );
//     }
    
//     return true;
//   });

//   // Pagination calculations
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredReport.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredReport.length / itemsPerPage);

//   // Handle page change
//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

//   const handlePageClick = (number) => {
//     setCurrentPage(number);
//   };

//   // Handle print
//   const handlePrint = useReactToPrint({
//     content: () => reportRef.current,
//     pageStyle: `
//       @page { 
//         size: auto;  
//         margin: 10mm;
//       }
//       @media print {
//         body { 
//           -webkit-print-color-adjust: exact; 
//         }
//         table { 
//           width: 100%; 
//           border-collapse: collapse; 
//         }
//         th { 
//           background-color: #11375B !important; 
//           color: white !important; 
//         }
//       }
//     `
//   });

//   // Handle PDF export
//   const handlePdfExport = () => {
//     const doc = new jsPDF();
//     const title = "Fuel Report";
//     const headers = [
//       ["Date", "Trips", "Fuel Qty (L)", "Total Cost", "Avg Price/L", "Suppliers"]
//     ];
    
//     const data = filteredReport.map(item => [
//       item.date,
//       item.tripCount.toString(),
//       item.totalQty.toString(),
//       item.totalCost.toFixed(2),
//       item.avgPrice,
//       item.suppliers
//     ]);

//     doc.text(title, 14, 16);
//     doc.autoTable({
//       head: headers,
//       body: data,
//       startY: 20,
//       styles: {
//         halign: 'center',
//         cellPadding: 3,
//         fontSize: 8
//       },
//       headStyles: {
//         fillColor: [17, 55, 91],
//         textColor: 255
//       }
//     });

//     doc.save('fuel_report.pdf');
//   };

//   // Handle Excel export
//   const handleExcelExport = () => {
//     let csvContent = "data:text/csv;charset=utf-8,";
    
//     // Headers
//     csvContent += "Date,Trips,Fuel Qty (L),Total Cost,Avg Price/L,Suppliers\n";
    
//     // Data
//     filteredReport.forEach(item => {
//       csvContent += `${item.date},${item.tripCount},${item.totalQty},${item.totalCost.toFixed(2)},${item.avgPrice},${item.suppliers}\n`;
//     });
    
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", "fuel_report.csv");
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div className="md:p-2">
//       <div 
//         ref={reportRef}
//         className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-8 border border-gray-200"
//       >
//         {/* Header */}
//         <div className="md:flex items-center justify-between mb-6">
//           <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
//             Fuel Report
//           </h1>
//           <div className="mt-3 md:mt-0 flex gap-2">
//             <button
//               onClick={() => setShowFilter(prev => !prev)}
//               className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//             >
//               <FaFilter /> Filter
//             </button>
//           </div>
//         </div>

//         {/* Export and Search */}
//         <div className="md:flex justify-between items-center">
//           <div className="flex gap-1 md:gap-3 text-primary font-semibold rounded-md">
//             <button 
//               onClick={handleExcelExport}
//               className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer flex items-center gap-2"
//             >
//               <FaFileExcel /> Excel
//             </button>
//             <button 
//               onClick={handlePdfExport}
//               className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer flex items-center gap-2"
//             >
//               <FaFilePdf /> PDF
//             </button>
//             <button 
//               onClick={handlePrint}
//               className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer flex items-center gap-2"
//             >
//               <FaPrint /> Print
//             </button>
//           </div>
          
//           <div className="mt-3 md:mt-0 relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <FaSearch className="text-gray-400" />
//             </div>
//             <input
//               type="text"
//               placeholder="Search..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="border border-gray-300 rounded-md outline-none text-sm py-2 pl-10 pr-5 w-full md:w-64"
//             />
//           </div>
//         </div>

//         {/* Conditional Filter Section */}
//         {showFilter && (
//           <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
//             <div className="relative w-full">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
//               <input
//                 type="date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//                 className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//               />
//             </div>
//             <div className="relative w-full">
//               <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
//               <input
//                 type="date"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//                 className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//               />
//             </div>
//           </div>
//         )}

//         {/* Loading state */}
//         {loading && (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#11375B]"></div>
//           </div>
//         )}

//         {/* Table */}
//         {!loading && (
//           <div className="mt-5 overflow-x-auto rounded-xl">
//             <table className="min-w-full text-sm text-left">
//               <thead className="bg-[#11375B] text-white capitalize text-sm">
//                 <tr>
//                   <th className="p-3">Date</th>
//                   <th className="p-3">Vehicle</th>
//                   <th className="p-3">Trips</th>
//                   <th className="p-3">Fuel Qty (L)</th>
//                   <th className="p-3">Total Cost</th>
//                   <th className="p-3">Avg Price/L</th>
//                   <th className="p-3">Suppliers</th>
//                 </tr>
//               </thead>
//               <tbody className="text-[#11375B] font-semibold bg-gray-100">
//                 {currentItems.length > 0 ? (
//                   currentItems.map((item, index) => (
//                     <tr key={index} className="hover:bg-gray-50 transition-all border border-gray-200">
//                       <td className="p-3">{item.date}</td>
//                        <td className="p-3">{item.}</td>
//                       <td className="p-3">{item.tripCount}</td>
//                       <td className="p-3">{item.totalQty}</td>
//                       <td className="p-3">{item.totalCost.toFixed(2)}</td>
//                       <td className="p-3">{item.avgPrice}</td>
//                       <td className="p-3">{item.suppliers}</td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={6} className="p-4 text-center text-gray-500">
//                       No fuel data found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Pagination */}
//         {filteredReport.length > 0 && (
//           <div className="mt-6 flex justify-center items-center">
//             <button
//               onClick={handlePrevPage}
//               disabled={currentPage === 1}
//               className={`p-2 mx-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500' : 'bg-primary text-white hover:bg-blue-700'}`}
//             >
//               <GrFormPrevious />
//             </button>

//             {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
//               <button
//                 key={number}
//                 onClick={() => handlePageClick(number)}
//                 className={`mx-1 px-3 py-1 rounded ${currentPage === number ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
//               >
//                 {number}
//               </button>
//             ))}

//             <button
//               onClick={handleNextPage}
//               disabled={currentPage === totalPages}
//               className={`p-2 mx-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500' : 'bg-primary text-white hover:bg-blue-700'}`}
//             >
//               <GrFormNext />
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { FaFilter, FaFilePdf, FaFileExcel, FaPrint, FaSearch } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";

export default function FuelReport() {
  const [tripData, setTripData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const reportRef = useRef();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch both APIs
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const tripRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`);
      const purchaseRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/purchase/list`);
      setTripData(tripRes.data.data || []);
      setPurchaseData(purchaseRes.data.data || []);
      generateReport(tripRes.data.data, purchaseRes.data.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
    setLoading(false);
  };

  // Get unique vehicles from trip data
  const getAvailableVehicles = () => {
    const vehicles = new Set();
    tripData.forEach(trip => {
      if (trip.vehicle_no) {
        vehicles.add(trip.vehicle_no);
      }
    });
    return Array.from(vehicles).sort();
  };

  // Generate fuel report (modified to include trip fuel costs)
  const generateReport = (trips, purchases) => {
    const fuelPurchases = purchases.filter(p => p.category?.toLowerCase() === "fuel");
    console.log(fuelPurchases, 'fuel purchase');
    
    const grouped = fuelPurchases.reduce((acc, curr) => {
      const date = curr.date;
      const vehicle = curr.vehicle_no || "Unknown";
      
      if (!acc[date]) {
        acc[date] = {};
      }
      
      if (!acc[date][vehicle]) {
        acc[date][vehicle] = { 
          date, 
          vehicle,
          totalQty: 0, 
          totalCost: 0, 
          suppliers: new Set(), 
          tripCount: 0,
          source: 'purchase' // Track data source
        };
      }
      
      acc[date][vehicle].totalQty += Number(curr.quantity || 0);
      const cost = curr.purchase_amount ? Number(curr.purchase_amount) : 
                  (Number(curr.quantity || 0) * Number(curr.unit_price || 0));
      acc[date][vehicle].totalCost += cost;
      if (curr.supplier_name) {
        acc[date][vehicle].suppliers.add(curr.supplier_name);
      }
      
      return acc;
    }, {});

    // Process trip fuel costs
    trips.forEach(trip => {
      if (!trip.date || !trip.vehicle_no || !trip.fuel_cost) return;
      
      const date = trip.date;
      const vehicle = trip.vehicle_no;
      const fuelAmount = Number(trip.fuel_cost || 0);
      
      if (fuelAmount > 0) {
        if (!grouped[date]) {
          grouped[date] = {};
        }
        
        if (!grouped[date][vehicle]) {
          grouped[date][vehicle] = { 
            date, 
            vehicle,
            totalQty: 0, // Quantity not available from trip
            totalCost: 0, 
            suppliers: new Set(["Trip Expense"]), 
            tripCount: 0,
            source: 'trip'
          };
        }
        
        grouped[date][vehicle].totalCost += fuelAmount;
        if (grouped[date][vehicle].source === 'purchase') {
          grouped[date][vehicle].suppliers.add("Trip Expense");
        }
      }
    });

    // Count trips per date and vehicle
    trips.forEach(trip => {
      if (!trip.date || !trip.vehicle_no) return;
      const date = trip.date;
      const vehicle = trip.vehicle_no;
      
      if (grouped[date] && grouped[date][vehicle]) {
        grouped[date][vehicle].tripCount += 1;
      }
    });

    // Convert to flat array
    const reportArray = [];
    Object.values(grouped).forEach(dateGroup => {
      Object.values(dateGroup).forEach(vehicleData => {
        reportArray.push({
          ...vehicleData,
          avgPrice: vehicleData.totalQty > 0 ? 
                   (vehicleData.totalCost / vehicleData.totalQty).toFixed(2) : 
                   "N/A", // Show N/A if no quantity data
          suppliers: Array.from(vehicleData.suppliers).join(", ")
        });
      });
    });

    setReport(reportArray);
  };

  // Filter report by date range, vehicle, and search term
  const filteredReport = report.filter(item => {
    // Date filter
    if (startDate && endDate) {
      const itemDate = dayjs(item.date);
      if (!itemDate.isBetween(dayjs(startDate), dayjs(endDate), 'day', '[]')) {
        return false;
      }
    }
    
    // Vehicle filter
    if (selectedVehicle && item.vehicle !== selectedVehicle) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.date.toLowerCase().includes(searchLower) ||
        item.vehicle.toLowerCase().includes(searchLower) ||
        item.suppliers.toLowerCase().includes(searchLower) ||
        item.totalQty.toString().includes(searchLower) ||
        item.totalCost.toString().includes(searchLower) ||
        item.avgPrice.includes(searchLower)
      );
    }
    
    return true;
  });

  // Clear all filters
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedVehicle("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReport.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReport.length / itemsPerPage);

  // Handle page change
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (number) => {
    setCurrentPage(number);
  };

  // Handle print
  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    pageStyle: `
      @page { 
        size: auto;  
        margin: 10mm;
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact; 
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
        }
        th { 
          background-color: #11375B !important; 
          color: white !important; 
        }
      }
    `
  });

  // Handle PDF export
  const handlePdfExport = () => {
    const doc = new jsPDF();
    const title = "Fuel Report";
    const headers = [
      ["Date", "Vehicle", "Trips", "Fuel Qty (L)", "Total Cost", "Avg Price/L", "Suppliers"]
    ];
    
    const data = filteredReport.map(item => [
      item.date,
      item.vehicle,
      item.tripCount.toString(),
      item.totalQty > 0 ? item.totalQty.toString() : "N/A",
      item.totalCost.toFixed(2),
      item.avgPrice,
      item.suppliers
    ]);

    doc.text(title, 14, 16);
    doc.autoTable({
      head: headers,
      body: data,
      startY: 20,
      styles: {
        halign: 'center',
        cellPadding: 3,
        fontSize: 8
      },
      headStyles: {
        fillColor: [17, 55, 91],
        textColor: 255
      }
    });

    doc.save('fuel_report.pdf');
  };

  // Handle Excel export
  const handleExcelExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headers
    csvContent += "Date,Vehicle,Trips,Fuel Qty (L),Total Cost,Avg Price/L,Suppliers\n";
    
    // Data
    filteredReport.forEach(item => {
      csvContent += `${item.date},${item.vehicle},${item.tripCount},${
        item.totalQty > 0 ? item.totalQty : "N/A"},${
        item.totalCost.toFixed(2)},${
        item.avgPrice},${
        item.suppliers}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fuel_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="md:p-2">
      <div 
        ref={reportRef}
        className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-8 border border-gray-200"
      >
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            Fuel Report
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter(prev => !prev)}
              className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>

        {/* Export and Search */}
        <div className="md:flex justify-between items-center">
          <div className="flex gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <button 
              onClick={handleExcelExport}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer flex items-center gap-2"
            >
              <FaFileExcel /> Excel
            </button>
            <button 
              onClick={handlePdfExport}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer flex items-center gap-2"
            >
              <FaFilePdf /> PDF
            </button>
            <button 
              onClick={handlePrint}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer flex items-center gap-2"
            >
              <FaPrint /> Print
            </button>
          </div>
          
          <div className="mt-3 md:mt-0 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md outline-none text-sm py-2 pl-10 pr-5 w-full md:w-64"
            />
          </div>
        </div>

        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <div className="relative w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              >
                <option value="">All Vehicles</option>
                {getAvailableVehicles().map(vehicle => (
                  <option key={vehicle} value={vehicle}>{vehicle}</option>
                ))}
              </select>
            </div>
            <div className="relative w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>
            <div className="relative w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="border border-red-500 text-red-500 px-4 py-2 rounded-md hover:text-red-600 transition-colors"
              >
                Clear 
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#11375B]"></div>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="mt-5 overflow-x-auto rounded-xl">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-[#11375B] text-white capitalize text-sm">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Vehicle</th>
                  <th className="p-3">Trips</th>
                  <th className="p-3">Fuel Qty (L)</th>
                  <th className="p-3">Total Cost</th>
                  <th className="p-3">Avg Price/L</th>
                  <th className="p-3">Suppliers</th>
                </tr>
              </thead>
              <tbody className="text-[#11375B] font-semibold bg-gray-100">
                {currentItems.length > 0 ? (
                  currentItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-all border border-gray-200">
                      <td className="p-3">{item.date}</td>
                      <td className="p-3">{item.vehicle}</td>
                      <td className="p-3">{item.tripCount}</td>
                      <td className="p-3">{item.totalQty > 0 ? item.totalQty : "N/A"}</td>
                      <td className="p-3">{item.totalCost.toFixed(2)}</td>
                      <td className="p-3">{item.avgPrice}</td>
                      <td className="p-3">{item.suppliers}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-500">
                      No fuel data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredReport.length > 0 && (
          <div className="mt-6 flex justify-center items-center">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-2 mx-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500' : 'bg-primary text-white hover:bg-blue-700'}`}
            >
              <GrFormPrevious />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => handlePageClick(number)}
                className={`mx-1 px-3 py-1 rounded ${currentPage === number ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {number}
              </button>
            ))}

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 mx-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500' : 'bg-primary text-white hover:bg-blue-700'}`}
            >
              <GrFormNext />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}