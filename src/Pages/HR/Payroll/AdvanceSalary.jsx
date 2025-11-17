import React, { useEffect, useState } from "react";
import { FaPen, FaPlus, FaTrashAlt, FaUserSecret } from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../../../../utils/axiosConfig";
import Pagination from "../../../components/Shared/Pagination";
import { tableFormatDate } from "../../../hooks/formatDate";
import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import toNumber from "../../../hooks/toNumber";

const AdvanceSalary = () => {
  const [advanceSalary, setAdvanceSalary] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAdvanceSalaryId, setSelectedAdvanceSalaryId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);

  // salary advance fetch
  useEffect(() => {
    const fetchSalaryAdvance = async () => {
      try {
        const res = await api.get(`/salaryAdvanced`);
        if (res.data?.status === "Success") {
          setAdvanceSalary(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching advance salary:", error);
      }
    };

    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employee`);
        if (res.data?.success) {
          setEmployee(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchSalaryAdvance();
    fetchEmployee();
  }, []);

  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/salaryAdvanced/${id}`);

      // Remove driver from local list
      setAdvanceSalary((prev) => prev.filter((account) => account.id !== id));
      toast.success("Advance Salary deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setSelectedAdvanceSalaryId(null);
    } catch (error) {
      console.error("Delete error:", error.response || error);
      toast.error("There was a problem deleting!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };


  // helper to get employee name
  const getEmployeeName = (empId) => {
    const emp = employee.find((e) => e.id === Number(empId));
    return emp ? emp.employee_name || emp.email : empId;
  };

  // Search filter
  const filteredData = advanceSalary.filter((item) => {
    const empName = getEmployeeName(item.employee_id)?.toLowerCase() || "";
    const amount = item.amount?.toString() || "";
    const month = item.salary_month?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();

    return (
      empName.includes(term) || amount.includes(term) || month.includes(term)
    );
  });

  // pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Export Excel
  const exportExcel = () => {
    const data = filteredData.map((item) => ({
      Date: tableFormatDate(item.created_at),
      "Employee Name": getEmployeeName(item.employee_id),
      Amount: toNumber(item.amount),
      "Salary Month": item.salary_month,
      "After Adjustment": toNumber(item.adjustment),
      Status: item.status,
      "Created By": item.created_by,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Advance Salary");
    XLSX.writeFile(workbook, "Advance_Salary_List.xlsx");
  };

  // Print
  const printTable = () => {
    const printWindow = window.open("", "", "width=900,height=600");
    const tableHTML = `
      <html>
        <head>
          <title></title>
          <style>
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #333; padding: 6px; text-align: left; }
            th { background-color: #f2f2f2; }
            h2 { text-align: center; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h2>Advance Salary Report</h2>
          <table>
            <thead>
              <tr>
              <th>#</th>
              <th>Date</th>
              <th>Employee Name</th>
              <th>Amount</th>
              <th>Salary Month</th>
              <th>After Adjustment</th>
              <th>Status</th>
              <th>Created By</th>
            </tr>
            </thead>
            <tbody>
              ${filteredData
        .map(
          (item, index) => `
                <tr>
        <td>${index + 1}</td>
        <td>${tableFormatDate(item.created_at)}</td>
        <td>${getEmployeeName(item.employee_id)}</td>
        <td>${item.amount} ৳</td>
        <td>${item.salary_month}</td>
        <td>${item.adjustment} ৳</td>
        <td>${item.status}</td>
        <td>${item.created_by}</td>
      </tr>`
        )
        .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="p-2">
      <div className="w-[22rem] md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-4 border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FaUserSecret className="text-gray-800 text-xl" />
            Advance Salary
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/HR/Payroll/Advance-Salary-Form">
              <button className="bg-gradient-to-r from-primary to-[#075e13] text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Advance
              </button>
            </Link>
          </div>
        </div>
        {/* export */}
        <div className="md:flex justify-between items-center">
          <div className="flex gap-1 md:gap-3 text-gray-700 font-semibold rounded-md">
            <button
              onClick={exportExcel}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              Excel
            </button>
            <button
              onClick={printTable}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              Print
            </button>
          </div>
          {/* search */}
          <div className="mt-3 md:mt-0">
            {/* <span className="text-primary font-semibold pr-3">Search: </span> */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Product ..."
              className="lg:w-60 border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-5 top-[5.5rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-md">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-primary capitalize text-xs">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Date</th>
                <th className="p-2">Employee Name</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Salary Month</th>
                <th className="p-2">After Adjustment</th>
                <th className="p-2">Status</th>
                <th className="p-2">Created By</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    <td className="p-2 font-bold">
                      {indexOfFirst + index + 1}
                    </td>
                    <td className="p-2">{tableFormatDate(item.created_at)}</td>
                    <td className="p-2">{getEmployeeName(item.employee_id)}</td>
                    <td className="p-2">{item.amount} ৳</td>
                    <td className="p-2">
                      {item.salary_month}
                    </td>
                    <td className="p-2">{item.adjustment} ৳</td>
                    <td className="p-2">{item.status}</td>
                    <td className="p-2">
                      {(item.created_by)}
                    </td>
                    <td className="p-2 flex gap-2">
                      <Link to={`/tramessy/HR/Payroll/update-advance/${item.id}`}>
                        <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                          <FaPen className="text-[12px]" />
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedAdvanceSalaryId(item.id);
                          setIsOpen(true);
                        }}
                        className="text-red-500 hover:text-white hover:bg-red-600 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaTrashAlt className="text-[12px]" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-4 text-gray-500">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {currentItems.length > 0 && totalPages >= 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              maxVisible={8}
            />
          </div>
        )}
      </div>
      {/* Delete Modal */}
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
                Are you sure you want to delete this Customer?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={() => handleDelete(selectedAdvanceSalaryId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvanceSalary;
