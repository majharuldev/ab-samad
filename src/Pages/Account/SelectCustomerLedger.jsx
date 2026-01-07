
import { useEffect, useState, useRef } from "react";
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa6";
import axios from "axios";
import * as XLSX from "xlsx";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { IoIosRemoveCircle } from "react-icons/io";
import api from "../../../utils/axiosConfig";
import { tableFormatDate } from "../../hooks/formatDate";
import DatePicker from "react-datepicker";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useTranslation } from "react-i18next";

// Patch jsPDF manually
// autoTable(jsPDF);

const SelectCustomerLadger = ({ customer, selectedCustomerName }) => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const tableRef = useRef();
  const [customerList, setCustomerList] = useState([]);

  // Fetch customer list with dues
  useEffect(() => {
    api.get(`/customer`)
      .then(res => {
        setCustomerList(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  const toNumber = (val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === "string") {
      if (val.trim().toLowerCase() === "null" || val.trim() === "") return 0;
    }
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  // Find selected customer due
  const selectedCustomer = customerList.find(
    cust => cust.customer_name === selectedCustomerName
  );
  const dueAmount = selectedCustomer && selectedCustomer.opening_balance
    ? toNumber(selectedCustomer.opening_balance) || 0
    : 0;

  // filter date 
  const filteredLedger = customer.filter((entry) => {
    const entryDate = new Date(entry.working_date).setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

    if (start && !end) {
      return entryDate === start;
    } else if (start && end) {
      return entryDate >= start && entryDate <= end;
    } else {
      return true;
    }
  });

  // Calculate totals including opening balance
  const totals = filteredLedger.reduce(
    (acc, item) => {
      const rent = toNumber(item.bill_amount || 0);
      const dem = toNumber(item.d_total || 0);
      const received = toNumber(item.rec_amount || 0);

      acc.tripRent += rent;
      acc.demurrage += dem;
      acc.billAmount += rent + dem;
      acc.received += received;

      return acc;
    },
    { tripRent: 0, demurrage: 0, billAmount: 0, received: 0 }
  );

  totals.due = totals.billAmount - totals.received;
  const grandDue = totals.due + dueAmount;

  const totalRent = filteredLedger.reduce(
    (sum, entry) => sum + toNumber(entry.rec_amount || 0),
    0
  );

  const customerName = filteredLedger[0]?.customer_name || "All Customers";


  //  Excel Export (Filtered Data)
  const exportToExcel = () => {
    let cumulativeDue = dueAmount; // opening balance

    const rows = filteredLedger.map((dt, index) => {
      const tripRent = toNumber(dt.bill_amount || 0);
      const dem = toNumber(dt.d_total || 0);
      const received = toNumber(dt.rec_amount || 0);
      const billAmount = tripRent + dem;

      cumulativeDue += billAmount;
      cumulativeDue -= received;

      return {
        SL: index + 1,
        "Working Date": tableFormatDate(dt.working_date),
        "Bill Date": tableFormatDate(dt.bill_date),
        "Challn No": dt.chalan,
        Customer: dt.customer_name,
        Load: dt.load_point || "--",
        Unload: dt.unload_point || "--",
        Vehicle: dt.vehicle_no || "--",
        "Challan Receive Status": dt.challan_rec,
        "Trip Rent": tripRent,
        Demurrage: dem,
        "Bill Amount": billAmount,
        "Received Amount": received,
        Due:
          cumulativeDue < 0
            ? `(${Math.abs(cumulativeDue)})`
            : cumulativeDue,
      };
    });

    //  Total row
    rows.push({
      SL: "Total",
      "Work Date": "",
      "Bill Date": "",
      "Challan No": "",
      Customer: "",
      Load: "",
      Unload: "",
      Vehicle: "",
      "Challan Receive Status": "",
      "Trip Rent": totals.tripRent,
      Demurrage: totals.demurrage,
      "Bill Amount": totals.billAmount,
      "Received Amount": totals.received,
      Due: grandDue < 0 ? `(${Math.abs(grandDue)})` : grandDue,
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Ledger");
    XLSX.writeFile(workbook, `${customerName}-Ledger.xlsx`);
  };



  //  Print (Filtered Data)
  const handlePrint = () => {
    const printContent = tableRef.current.innerHTML;
    const printWindow = window.open("", "", "width=900,height=700");
    printWindow.document.write(`
      <html>
        <head>
          <title>${customerName} ${t("Ledger")}</title>
          <style>
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #333; padding: 5px; text-align: center; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2 style="text-align:center;">${customerName} - ${t("Customer")} ${t("Ledger")}</h2>
          <h4 style="text-align:center;">Date Range: ${startDate ? tableFormatDate(startDate) : "All"} - ${endDate ? tableFormatDate(endDate) : "All"}</h4>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="md:p-4">
      <div className="overflow-x-auto">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B]">
            {filteredLedger.length > 0
              ? filteredLedger[0].customer_name
              : `${t("All")} ${t("Customer")}`} {t("Ledger")}
          </h1>
        </div>

        <div className="flex justify-between mb-4">
          <div className="flex gap-2 text-gray-700">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 py-1 px-5 bg-white hover:bg-primary hover:text-white rounded shadow  transition-all duration-300"
            >
              <FaFileExcel /> {t("Excel")}
            </button>
            {/* <button
              onClick={exportToPDF}
              className="flex items-center gap-2 py-1 px-5 bg-white hover:bg-primary hover:text-white rounded shadow  transition-all duration-300"
            >
              <FaFilePdf /> PDF
            </button> */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 py-1 px-5 bg-white hover:bg-primary hover:text-white rounded shadow transition-all duration-300"
            >
              <FaPrint /> {t("Print")}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300"
            >
              <FaFilter /> {t("Filter")}
            </button>
          </div>
        </div>

        {showFilter && (
          <div className="flex gap-4 border border-gray-300 rounded-md p-5 mb-5">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
              locale="en-GB"
              className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
              isClearable
            />

            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
              locale="en-GB"
              className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
              isClearable
            />
            <div className="w-sm">
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

        {loading ? (
          <p className="text-center mt-16">{t("Loading")}...</p>
        ) : (
          <div>
            {/* ===== Total Summary Cards ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">

              {/* Trip Rent */}
              <div className="bg-white shadow border-l-4 border-blue-500 rounded p-4">
                <p className="text-xs text-gray-500">{t("Total Trip Rent Till Now")}</p>
                <h3 className="text-lg font-bold text-gray-800">
                  ৳{totals.tripRent}
                </h3>
              </div>

              {/* Demurrage */}
              <div className="bg-white shadow border-l-4 border-orange-500 rounded p-4">
                <p className="text-xs text-gray-500">{t("Total Demurrage Till Now")}</p>
                <h3 className="text-lg font-bold text-gray-800">
                  ৳{totals.demurrage}
                </h3>
              </div>

              {/* Bill Amount */}
              <div className="bg-white shadow border-l-4 border-purple-500 rounded p-4">
                <p className="text-xs text-gray-500">{t("Total Bill Till Now")}</p>
                <h3 className="text-lg font-bold text-gray-800">
                  ৳{totals.billAmount}
                </h3>
              </div>

              {/* Received */}
              <div className="bg-white shadow border-l-4 border-green-500 rounded p-4">
                <p className="text-xs text-gray-500">{t("Total Received Till Now")}</p>
                <h3 className="text-lg font-bold text-gray-800">
                  ৳{totals.received}
                </h3>
              </div>

              {/* Due */}
              <div className="bg-white shadow border-l-4 border-red-500 rounded p-4">
                <p className="text-xs text-gray-500">{t("Currently Due")}</p>
                <h3
                  className={`text-lg font-bold ${grandDue < 0 ? "text-red-600" : "text-gray-800"
                    }`}
                >
                  {grandDue < 0 ? `৳(${Math.abs(grandDue)})` : `৳${grandDue}`}
                </h3>
              </div>

            </div>
            <div ref={tableRef}>
              <table className="min-w-full text-sm text-left text-gray-900">
                <thead className="bg-gray-100 text-gray-800 font-bold">
                  <tr>
                    <th className="border px-2 py-1">{t("SL.")}</th>
                    <th className="border px-2 py-1">{t("Working Date")}</th>
                    <th className="border px-2 py-1">{t("Bill Date")}</th>
                    <th className="border px-2 py-1">{t("Challan No")}</th>
                    <th className="border px-2 py-1">{t("Customer")}</th>
                    <th className="border px-2 py-1">{t("Load")}</th>
                    <th className="border px-2 py-1">{t("Unload")}</th>
                    <th className="border px-2 py-1">{t("Vehicle")}</th>
                    {/* <th className="border px-2 py-1">Driver</th> */}
                    <th className="border px-2 py-1">{t("Challan")} {t("Receive")} {t("Status")}</th>
                    <th className="border px-2 py-1">{t("Trip Rent")}</th>
                    <th className="border px-2 py-1">{t("Demurrage")}</th>
                    <th className="border px-2 py-1">{t("Bill Amount")}</th>
                    <th className="border px-2 py-1">{t("Received Amount")}</th>
                    <th className="border border-gray-700 px-2 py-1">
                      {selectedCustomerName && (
                        <p className="text-sm font-medium text-gray-800">
                          {t("Opening Balance")}: ৳{dueAmount?.toFixed(2)}
                        </p>
                      )}
                      {t("Due")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let cumulativeDue = dueAmount; // Opening balance
                    return filteredLedger.map((item, idx) => {
                      const tripRent = toNumber(item.bill_amount || 0);
                      const receivedAmount = toNumber(item.rec_amount || 0);
                      const demurageTotal = toNumber(item.d_total)
                      const billAmount = tripRent + demurageTotal;
                      // মোট due হিসাব
                      cumulativeDue += billAmount;
                      cumulativeDue -= receivedAmount;

                      return (
                        <tr key={idx}>
                          <td className="border px-2 py-1">{idx + 1}</td>
                          <td className="border px-2 py-1">{tableFormatDate(item.working_date)}</td>
                          <td className="border px-2 py-1">{tableFormatDate(item.bill_date)}</td>
                          <td className="border px-2 py-1">{item.chalan}</td>
                          <td className="border px-2 py-1">{item.customer_name}</td>
                          <td className="border px-2 py-1">
                            {item.load_point || <span className="flex justify-center items-center">--</span>}
                          </td>
                          <td className="border px-2 py-1">
                            {item.unload_point || <span className="flex justify-center items-center">--</span>}
                          </td>
                          <td className="border px-2 py-1">
                            {item.vehicle_no || <span className="flex justify-center items-center">--</span>}
                          </td>
                          {/* <td className="border px-2 py-1">
                          {item.driver_name || <span className="flex justify-center items-center">--</span>}
                        </td> */}
                        <td className="border px-2 py-1">
                          {item.chalan_rec || <span className="flex justify-center items-center">--</span>}
                        </td>
                          <td className="border px-2 py-1">
                            {tripRent ? tripRent : "--"}
                          </td>                         
                          <td className="border px-2 py-1">
                            {demurageTotal ? demurageTotal : "--"}
                          </td>
                          <td className="border px-2 py-1">
                            {billAmount ? billAmount : "--"}
                          </td>
                          <td className="border px-2 py-1">
                            {receivedAmount ? receivedAmount : "--"}
                          </td>
                          <td className={`border border-gray-700 px-2 py-1 ${cumulativeDue < 0 ? 'text-red-600' : ''}`}>
                            {cumulativeDue < 0 ? `(${Math.abs(cumulativeDue)})` : cumulativeDue}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>

                <tfoot>
                  <tr className="font-bold bg-gray-50">
                    <td colSpan={9} className="border px-2 py-1 text-right">
                      {t("Total")}
                    </td>

                    <td className="border px-2 py-1 text-right">
                      ৳{totals.tripRent}
                    </td>

                    <td className="border px-2 py-1 text-right">
                      ৳{totals.demurrage}
                    </td>

                    <td className="border px-2 py-1 text-right">
                      ৳{totals.billAmount}
                    </td>

                    <td className="border px-2 py-1 text-right">
                      ৳{totals.received}
                    </td>

                    <td className="border px-2 py-1 text-right font-extrabold">
                      ৳{grandDue}
                    </td>
                  </tr>
                </tfoot>

              </table>

              {/* Pagination */}
              {/* {pageCount > 1 && (
              <div className="mt-4 flex justify-center">
                <ReactPaginate
                  previousLabel={"Previous"}
                  nextLabel={"Next"}
                  breakLabel={"..."}
                  pageCount={pageCount}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={5}
                  onPageChange={handlePageClick}
                  containerClassName={"flex items-center gap-1"}
                  pageClassName={"px-3 py-1 border rounded hover:bg-gray-100 hover:text-black cursor-pointer"}
                  previousClassName={"px-3 py-1 border rounded hover:bg-gray-100 cursor-pointer"}
                  nextClassName={"px-3 py-1 border rounded hover:bg-gray-100 cursor-pointer"}
                  breakClassName={"px-3 py-1"}
                  activeClassName={"bg-primary text-white border-primary"}
                  forcePage={currentPage}
                />
              </div>
            )} */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectCustomerLadger;