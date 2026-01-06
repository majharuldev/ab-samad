import axios from "axios";
import { useEffect, useState } from "react";
import { FaPlus, FaFilter, FaPen, FaTrashAlt, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";
// export
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast, { Toaster } from "react-hot-toast";
import { IoIosRemoveCircle, IoMdClose } from "react-icons/io";
import Pagination from "../components/Shared/Pagination";
import { formatDate, tableFormatDate } from "../hooks/formatDate";
import api from "../../utils/axiosConfig";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";

const VendorList = () => {
  const {t} = useTranslation()
  const [vendor, setVendor] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  // Date filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedvendorId, setselectedvendorId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  // search
  const [searchTerm, setSearchTerm] = useState("");
  // Fetch vendor data
  useEffect(() => {
    api
      .get(`/vendor`)
      .then((response) => {       
          setVendor(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);

  // if (loading) return <p className="text-center mt-16">{t("Vendor")} {t("Loading")}...</p>;
  // Export Excel
  const exportExcel = () => {
    const exportData = filteredvendor.map(
      ({ date, vendor_name, mobile, rent_category, work_area, opening_balance, status }) => ({
        Date: date,
        Name: vendor_name,
        Mobile: mobile,
        RentCategory: rent_category,
        WorkArea: work_area,
        OpeningBalance: opening_balance,
        Status: status,
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendors");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Vendor_List_${new Date().toISOString()}.xlsx`);
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      "Date",
      "Name",
      "Mobile",
      "RentCategory",
      "WorkArea",
      "Status",
    ];
    const tableRows = filteredvendor.map(
      ({ date, vendor_name, mobile, rent_category, work_area, status }) => [
        date,
        vendor_name,
        mobile,
        rent_category,
        work_area,
        status,
      ]
    );

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [17, 55, 91] },
    });

    doc.save(`Vendor_List_${new Date().toISOString()}.pdf`);
  };

  // Print Table
const printTable = () => {
  const tableRows = filteredvendor
    .map(
      (dt, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${tableFormatDate(dt.date)}</td>
        <td>${dt.vendor_name}</td>
        <td>${dt.mobile}</td>
        <td>${dt.rent_category}</td>
        <td>${dt.work_area}</td>
        <td>${dt.opening_balance}</td>
        <td>${dt.status}</td>
      </tr>
    `
    )
    .join("");

  const tableHTML = `
    <table>
      <thead>
        <tr>
          <th>${t("SL.")}</th>
          <th>${t("Date")}</th>
          <th>${t("Name")}</th>
          <th>${t("Mobile")}</th>
          <th>${t("Rent Category")}</th>
          <th>${t("Work Area")}</th>
          <th>${t("Opening Balance")}</th>
          <th>${t("Status")}</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  `;

  const WinPrint = window.open("", "", "width=900,height=650");
  WinPrint.document.write(`
    <html>
    <head>
      <title>-</title>
      <style>
        body { font-family: Arial, sans-serif; }

        .print-container {
          display: table;
          width: 100%;
        }

        .print-header {
          display: table-header-group;
        }

        .header {
          width: 100%;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 5px; }
        thead th {
         
          color: black !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      </style>
    </head>

    <body>
      <div class="print-container">

        <div class="content">
          <h3 style="text-align:center;">${t("Vendor")} ${t("ïnfo")}</h3>
          ${tableHTML}
        </div>

      </div>
    </body>
    </html>
  `);

  WinPrint.document.close();
  WinPrint.focus();
  WinPrint.print();
  // WinPrint.close(); // optional
};


  // delete by id
  const handleDelete = async (id) => {
  try {
    const response = await api.delete(`/vendor/${id}`);

    // Axios er jonno check
    if (response.status === 200) {
      // UI update
      setVendor((prev) => prev.filter((item) => item.id !== id));
      toast.success("Vendor deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setselectedvendorId(null);
    } else {
      throw new Error("Delete request failed");
    }
  } catch (error) {
    console.error("Delete error:", error);
    toast.error("There was a problem deleting!", {
      position: "top-right",
      autoClose: 3000,
    });
  }
};
  // search
  const filteredvendor = vendor.filter((dt) => {
    const term = searchTerm.toLowerCase();
    const vendorDate = dt.date;
    const matchesSearch =
      dt.vendor_name?.toLowerCase().includes(term) ||
      dt.vehicle_number?.toLowerCase().includes(term) ||
      dt.driver_name?.toLowerCase().includes(term) ||
      dt.trip_id_invoice_no?.toLowerCase().includes(term) ||
      dt.pump_name_address?.toLowerCase().includes(term) ||
      String(dt.capacity).includes(term) ||
      dt.type?.toLowerCase().includes(term) ||
      String(dt.quantity).includes(term) ||
      dt.price?.toLowerCase().includes(term) ||
      dt.total_price?.toLowerCase().includes(term);
    const matchesDateRange =
      (!startDate || new Date(vendorDate) >= new Date(startDate)) &&
      (!endDate || new Date(vendorDate) <= new Date(endDate));

    return matchesSearch && matchesDateRange;
  });
  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVendor = filteredvendor.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredvendor.length / itemsPerPage);

  return (
    <main className="p-2">
      <Toaster />
      <div className="w-sm md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 md:p-4 py-10 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FaUsers className="text-gray-800 text-2xl" />
           {t("All")} {t("Vendor")} {t("Information")}
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            {/* <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> {t("Filter")}
            </button> */}
            <Link to="/tramessy/AddVendorForm">
              <button className="bg-gradient-to-r from-primary to-[#115e15]  text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> {t("Add Vendor")}
              </button>
            </Link>
          </div>
        </div>
        {/* export */}
        <div className="md:flex justify-between items-center">
          <div className="flex gap-1 md:gap-3 text-gray-700 font-medium rounded-md">
            <button
              onClick={exportExcel}
              className="py-1 px-5 hover:bg-primary bg-white shadow hover:text-white rounded transition-all duration-300 cursor-pointer"
            >
              {t("Excel")}
            </button>
            {/* <button
              onClick={exportPDF}
              className="py-1 px-5 hover:bg-primary bg-white shadow hover:text-white rounded transition-all duration-300 cursor-pointer"
            >
              PDF
            </button> */}
            <button
              onClick={printTable}
              className="py-1 px-5 hover:bg-primary bg-white shadow hover:text-white rounded transition-all duration-300 cursor-pointer"
            >
              {t("Print")}
            </button>
          </div>
          {/*  */}
          <div className="mt-3 md:mt-0">
            {/* <span className="text-primary font-semibold pr-3">Search: </span> */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={`${t("search")}...`}
              className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
             {/*  Clear button */}
    {searchTerm && (
      <button
        onClick={() => {
          setSearchTerm("");
          setCurrentPage(1);
        }}
        className="absolute right-5 top-[5.3rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
      >
        ✕
      </button>
    )}
          </div>
        </div>
        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="md:flex items-center justify-between gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <div className="relative w-full">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start date"
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>
            <div className="relative w-full">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End date"
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>
            <div className="w-xs">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setShowFilter(false);
                }}
                className="bg-primary w-full text-white px-4 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <IoIosRemoveCircle /> {t("Clear")}
              </button>
            </div>
          </div>
        )}
        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-md">
          <table className="min-w-full table-fixed text-sm text-left">
            <thead className="bg-gray-200 text-primary capitalize text-xs">
              <tr>
                <th className="px-2 py-4 lg:w-[20px]">{t("SL.")}</th>
                <th className="px-2 py-4 lg:w-[120px]">{t("Date")}</th>
                <th className="px-2 py-4 lg:w-[120px]">{t("Name")}</th>
                <th className="px-2 py-4 lg:w-[100px]">{t("Mobile")}</th>
                <th className="px-2 py-4 lg:w-[20px]">{t("Rent Category")}</th>
                <th className="px-2 py-4 lg:w-[80px]">{t("Work Area")}</th>
                <th className="px-2 py-4 lg:w-[120px]">{t("Opening Balance")}</th>
                <th className="px-2 py-4 lg:w-[80px]">{t("Status")}</th>
                <th className="px-2 py-4 action_column lg:w-[80px]">{t("Action")}</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 ">
              { loading ? (
                 <tr>
                  <td colSpan={12} className="text-center py-20"><Spin /></td>
                </tr>
              )
              :currentVendor.length === 0 ? (<tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    {t("No Vendor found")}
                  </td>
                  </tr>)
              :(currentVendor?.map((dt, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-all border border-gray-200"
                >
                  <td className="p-2 font-bold">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="p-2">{tableFormatDate(dt.date)}</td>
                  <td className="p-2">{dt.vendor_name}</td>
                  <td className="p-2">{dt.mobile}</td>
                  <td className="p-2">{dt.rent_category}</td>
                  <td className="p-2">{dt.work_area}</td>
                  <td className="p-2">{dt.opening_balance}</td>
                  <td className="p-2">{dt.status}</td>
                  <td className="p-2 action_column">
                    <div className="flex gap-2">
                      <Link to={`/tramessy/UpdateVendorForm/${dt.id}`}>
                        <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                          <FaPen className="text-[12px]" />
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          setselectedvendorId(dt.id);
                          setIsOpen(true);
                        }}
                        className="text-red-500 hover:text-white hover:bg-red-600 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaTrashAlt className="text-[12px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              )))
              }
            </tbody>
          </table>
        </div>
        {/* pagination */}
        {currentVendor.length > 0 && totalPages >= 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          maxVisible={8} 
        />
      )}
      </div>
      {/* Delete modal */}
      <div className="flex justify-center items-center">
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#000000ad] z-50">
            <div className="relative bg-white rounded-lg shadow-lg p-6 w-72 max-w-sm border border-gray-300">
              <button
                onClick={toggleModal}
                className="text-2xl absolute top-2 right-2 text-white bg-red-500 hover:bg-red-700 cursor-pointer rounded-sm"
              >
                <IoMdClose />
              </button>

              <div className="flex justify-center mb-4 text-red-500 text-4xl">
                <FaTrashAlt />
              </div>
              <p className="text-center text-gray-700 font-medium mb-6">
                {t("Do you want to delete the vendor?")}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  {t("No")}
                </button>
                <button
                  onClick={() => handleDelete(selectedvendorId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
                >
                  {t("Yes")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default VendorList;
