import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaEye, FaFilter, FaPen, FaTrashAlt } from "react-icons/fa";
import { FaPlus, FaUserSecret } from "react-icons/fa6";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { IoIosRemoveCircle } from "react-icons/io";
import { Link } from "react-router-dom";

const PurchaseList = () => {
  const [purchase, setPurchase] = useState([]);
  const [loading, setLoading] = useState(true);
  // Date filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // search
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  // get single car info by id
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPurchase, setselectedPurchase] = useState(null);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/purchase/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setPurchase(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);
  // Filter by date
  const filtered = purchase.filter((dt) => {
    const dtDate = new Date(dt.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (start && end) {
      return dtDate >= start && dtDate <= end;
    } else if (start) {
      return dtDate.toDateString() === start.toDateString();
    } else {
      return true; // no filter applied
    }
  });
  // search
  const filteredPurchase = filtered.filter((dt) => {
    const term = searchTerm.toLowerCase();
    return dt.id?.toString().toLowerCase().includes(term);
  });
  // view car by id
  const handleViewCar = async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/purchase/show/${id}`
      );
      if (response.data.status === "Success") {
        setselectedPurchase(response.data.data);
        setViewModalOpen(true);
      } else {
        toast.error("Purchase Information could not be loaded.");
      }
    } catch (error) {
      console.error("View error:", error);
      toast.error("Purchase Information could not be loaded.");
    }
  };
  if (loading) return <p className="text-center mt-16">Loading data...</p>;
  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPurchase = filteredPurchase.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredPurchase.length / itemsPerPage);
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((currentPage) => currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages)
      setCurrentPage((currentPage) => currentPage + 1);
  };
  const handlePageClick = (number) => {
    setCurrentPage(number);
  };
  return (
    <div className=" md:p-2">
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-2 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <FaUserSecret className="text-[#11375B] text-2xl" />
            Purchase List
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
            <Link to="/tramessy/Purchase/PurchaseForm">
              <button className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Purchase
              </button>
            </Link>
          </div>
        </div>
        {/* export */}
        <div className="md:flex justify-between items-center">
          <div className="flex gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <button
              // onClick={exportExcel}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              Excel
            </button>
            <button
              // onClick={exportPDF}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              PDF
            </button>
            <button
              // onClick={printTable}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              Print
            </button>
          </div>
          {/* search */}
          <div className="mt-3 md:mt-0">
            <span className="text-primary font-semibold pr-3">Search: </span>
            <input
              type="text"
              // value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Product ID..."
              className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
          </div>
        </div>
        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="md:flex items-center gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
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
                className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <IoIosRemoveCircle /> Clear Filter
              </button>
            </div>
          </div>
        )}
        <div className="mt-5 overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#11375B] text-white capitalize text-sm border border-gray-600">
              <tr>
                <th className="p-2">SL.</th>
                <th className="p-2">Product ID</th>
                <th className="p-2">Supplier Name</th>
                <th className="p-2">Category</th>
                <th className="p-2">Item Name</th>
                <th className="p-2">Quantity</th>
                <th className="p-2">Unit Price</th>
                <th className="p-2">Total</th>
                <th className="p-2">Bill Image</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody className="text-[#11375B] font-semibold bg-gray-100">
              { currentPurchase.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    No purchase found
                  </td>
                  </tr>)
              :(currentPurchase?.map((dt, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-all border border-gray-200"
                >
                  <td className="p-2 font-bold">
                    {indexOfFirstItem + index + 1}.
                  </td>
                  <td className="p-2">{dt.id}</td>
                  <td className="p-2">{dt.supplier_name}</td>
                  <td className="p-2">{dt.category}</td>
                  <td className="p-2">{dt.item_name}</td>
                  <td className="p-2">{dt.quantity}</td>
                  <td className="p-2">{dt.unit_price}</td>
                  <td className="p-2">{dt.purchase_amount}</td>
                  <td className="p-2">
                    <img
                      src={`${import.meta.env.VITE_BASE_URL}/public/uploads/purchase/${dt.bill_image}`}
                      alt=""
                      className="w-20 h-20 rounded-xl"
                    />
                  </td>
                  <td className="px-2 action_column">
                    <div className="flex gap-1">
                      <Link
                        to={`/tramessy/Purchase/UpdatePurchaseForm/${dt.id}`}
                      >
                        <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                          <FaPen className="text-[12px]" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleViewCar(dt.id)}
                        className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaEye className="text-[12px]" />
                      </button>
                      {/* <button className="text-red-900 hover:text-white hover:bg-red-900 px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                        <FaTrashAlt className="text-[12px]" />
                      </button> */}
                    </div>
                  </td>
                </tr>
              )))
              }
            </tbody>
          </table>
        </div>
        {/* pagination */}
        { currentPurchase.length > 0 && totalPages >= 1 &&
        (<div className="mt-10 flex justify-center">
          <div className="space-x-2 flex items-center">
            <button
              onClick={handlePrevPage}
              className={`p-2 ${
                currentPage === 1 ? "bg-gray-300" : "bg-primary text-white"
              } rounded-sm`}
              disabled={currentPage === 1}
            >
              <GrFormPrevious />
            </button>
            {[...Array(totalPages).keys()].map((number) => (
              <button
                key={number + 1}
                onClick={() => handlePageClick(number + 1)}
                className={`px-3 py-1 rounded-sm ${
                  currentPage === number + 1
                    ? "bg-primary text-white hover:bg-gray-200 hover:text-primary transition-all duration-300 cursor-pointer"
                    : "bg-gray-200 hover:bg-primary hover:text-white transition-all cursor-pointer"
                }`}
              >
                {number + 1}
              </button>
            ))}
            <button
              onClick={handleNextPage}
              className={`p-2 ${
                currentPage === totalPages
                  ? "bg-gray-300"
                  : "bg-primary text-white"
              } rounded-sm`}
              disabled={currentPage === totalPages}
            >
              <GrFormNext />
            </button>
          </div>
        </div>)}
      </div>
      {viewModalOpen && selectedPurchase && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#000000ad] z-50 p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 relative">
            <h2 className="text-2xl font-bold text-primary border-b pb-4 mb-6">
              Purchase Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
              <div className="flex justify-between border p-4 rounded-lg bg-gray-50">
                <span className="font-medium w-1/2">Product ID:</span>
                <span>{selectedPurchase.id}</span>
              </div>
              <div className="flex justify-between border p-4 rounded-lg bg-gray-50">
                <span className="font-medium w-1/2">Supplier Name:</span>
                <span>{selectedPurchase.supplier_name}</span>
              </div>
              <div className="flex justify-between border p-4 rounded-lg bg-gray-50">
                <span className="font-medium w-1/2">Category:</span>
                <span>{selectedPurchase.category}</span>
              </div>
              <div className="flex justify-between border p-4 rounded-lg bg-gray-50">
                <span className="font-medium w-1/2">Item Name:</span>
                <span>{selectedPurchase.item_name}</span>
              </div>
              <div className="flex justify-between border p-4 rounded-lg bg-gray-50">
                <span className="font-medium w-1/2">Quantity:</span>
                <span>{selectedPurchase.quantity}</span>
              </div>
              <div className="flex justify-between border p-4 rounded-lg bg-gray-50">
                <span className="font-medium w-1/2">Unit Price:</span>
                <span>{selectedPurchase.unit_price}</span>
              </div>
              <div className="flex justify-between border p-4 rounded-lg bg-gray-50">
                <span className="font-medium w-1/2">Total:</span>
                <span>{selectedPurchase.purchase_amount}</span>
              </div>
              <div className="flex flex-col items-start border p-4 rounded-lg bg-gray-50">
                <span className="font-medium mb-2">Bill Image:</span>
                <img
                  src={`${import.meta.env.VITE_BASE_URL}/public/uploads/purchase/${selectedPurchase.bill_image}`}
                  alt="Bill"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setViewModalOpen(false)}
                className="bg-primary text-white px-5 py-2 rounded-md hover:bg-secondary transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseList;
