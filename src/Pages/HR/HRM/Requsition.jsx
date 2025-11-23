
import React, { useEffect, useState } from "react";
import { FaPen, FaPlus, FaTrashAlt, FaUserSecret } from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../../../../utils/axiosConfig";
import Pagination from "../../../components/Shared/Pagination";
import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";
import { tableFormatDate } from "../../../hooks/formatDate";

const Requisition = () => {
  const [requisition, setRequisition] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, empRes] = await Promise.all([
          api.get(`/requestion`),
          api.get(`/employee`),
        ]);
        if (reqRes.data?.success) setRequisition(reqRes.data.data);
        if (empRes.data?.success){ const activeEmployee = response?.data?.data?.filter(
        (employee) => employee.status?.toLowerCase() === "active"
      );
          setEmployee(activeEmployee);}
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/requestion/${id}`);
      setRequisition((prev) => prev.filter((item) => item.id !== id));
      toast.success("Requisition deleted successfully!");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to delete requisition!");
    }
  };

  const getEmployeeName = (empId) => {
    const emp = employee.find((e) => e.id === Number(empId));
    return emp ? emp.employee_name || emp.email : empId;
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = requisition.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(requisition.length / itemsPerPage);

  return (
    <div className="p-2">
      <div className="overflow-x-auto bg-white shadow-lg rounded-md p-4 border border-gray-200 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FaUserSecret className="text-gray-800 text-xl" />
            Requisition List
          </h1>
          <Link to="/tramessy/HR/advance-requisition-form">
            <button className="bg-gradient-to-r from-primary to-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow hover:scale-105 transition-all">
              <FaPlus /> Add Requisition
            </button>
          </Link>
        </div>

        <table className="min-w-full text-sm text-left border">
          <thead className="bg-gray-200 text-primary capitalize text-xs">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2">Date</th>
              <th className="p-2">Employee</th>
              <th className="p-2">Purpose</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Remarks</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-2">{indexOfFirst + index + 1}</td>
                  <td className="p-2">{tableFormatDate(item.date)}</td>
                  <td className="p-2">{getEmployeeName(item.employee_id)}</td>
                  <td className="p-2">{item.purpose}</td>
                  <td className="p-2">{item.amount} ৳</td>
                  <td className="p-2">{item.remarks}</td>
                  <td className="p-2 flex gap-2">
                    <Link to={`/tramessy/HR/update-advance-requisition/${item.id}`}>
                      <button className=" text-primary px-2 py-1 rounded hover:bg-primary hover:text-white transition bg-white shadow">
                        <FaPen size={12}/>
                      </button>
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedId(item.id);
                        setIsOpen(true);
                      }}
                      className=" text-red-500 px-2 py-1 rounded hover:bg-red-600 hover:text-white transition bg-white shadow"
                    >
                      <FaTrashAlt size={12} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  No requisition data found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {currentItems.length > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#00000090] z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-72 relative">
            <button
              onClick={toggleModal}
              className="absolute top-2 right-2 text-red-600"
            >
              <IoMdClose />
            </button>
            <div className="flex flex-col items-center text-center">
              <FaTrashAlt className="text-3xl text-red-500 mb-3" />
              <p className="mb-4">Are you sure you want to delete?</p>
              <div className="flex gap-3">
                <button
                  onClick={toggleModal}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(selectedId)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requisition;
