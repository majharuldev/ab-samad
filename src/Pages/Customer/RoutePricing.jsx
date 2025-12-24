
import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaPen, FaTrashAlt, FaPlus, FaUsers } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import CreatableSelect from "react-select/creatable";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import Pagination from "../../components/Shared/Pagination";
import api from "../../../utils/axiosConfig";
import { useTranslation } from "react-i18next";

const RoutePricing = () => {
  const {t} = useTranslation();
  const [routePricing, setRoutePricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [unloadpoints, setUnloadpoints] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRateId, setSelectedRateId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);

  const [formData, setFormData] = useState({
    customer_name: "",
    vehicle_category: "",
    vehicle_size: "",
    load_point: "",
    unload_point: "",
    rate: "",
    vat: ""
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Fetch customers
  useEffect(() => {
    api.get(`/customer`)
      .then(res => {
        setCustomers(res.data);
      })
      .catch(console.error);
  }, []);

  // Fetch unload points
  useEffect(() => {
    axios.get("https://bdapis.vercel.app/geo/v2.0/upazilas")
      .then(res => {
        if (res.data.success) setUnloadpoints(res.data.data);
      })
      .catch(console.error);
  }, []);

  // Fetch route pricing
  useEffect(() => {
    fetchRoutePricingData();
  }, []);

  const fetchRoutePricingData = () => {
    api.get(`/rate`)
      .then(res => {
        setRoutePricing(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  // Reset form & close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ customer_name: "", vehicle_category: "", load_point: "", vehicle_size: "", unload_point: "", rate: "" });
    setEditId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/rate/${id}`);

      // Remove driver from local list
      setRoutePricing((prev) => prev.filter((customer) => customer.id !== id));
      toast.success(t("Customer rate deleted successfully"), {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setSelectedRateId(null);
    } catch (error) {
      console.error(t("Delete error:"), error.response || error);
      toast.error(t("There was a problem deleting!"), {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Handle add or update
  const handleSubmit = (e) => {
    e.preventDefault();

    // if (!formData.load_point || !formData.unload_point || !formData.rate) {
    //   toast.error(t("Please fill in all fields"));
    //   return;
    // }

    const apiCall = editId
      ? api.put(`/rate/${editId}`, formData)
      : api.post(`/rate`, formData);

    apiCall
      .then(res => {
        toast.success(editId ? (t("Route Pricing updated successfully")) : t("Route Pricing added successfully"));
        closeModal();
        fetchRoutePricingData();
      })
      .catch(err => {
        console.error(err);
        toast.error("Error occurred");
      });
  };

  // edit handler
  const handleEdit = (item) => {
    setFormData({
      customer_name: item.customer_name,
      vehicle_category: item.vehicle_category,
      vehicle_size: item.vehicle_size,
      load_point: item.load_point,
      unload_point: item.unload_point,
      rate: item.rate
    });
    setEditId(item.id);
    setIsModalOpen(true);
  };

  // Excel Export (filtered)
  const exportTripsToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((dt, index) => ({
        SL: index + 1,
        Customer: dt.customer_name,
        "Vehicle Category": dt.vehicle_category,
        Size: dt.vehicle_size,
        "Load Point": dt.load_point,
        "Unload Point": dt.unload_point,
        Rate: dt.rate,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "RoutePricing");
    XLSX.writeFile(workbook, "RoutePricing.xlsx");
  };

  // PDF Export (filtered)
  const exportTripsToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Route Pricing Report", 14, 15);

    // Table body
    const tableData = filteredData.map((dt, index) => [
      index + 1,
      dt.customer_name || "-",
      dt.vehicle_category,
      dt.vehicle_size,
      dt.load_point,
      dt.unload_point,
      dt.rate,
    ]);

    autoTable(doc, {
      head: [["SL", "Customer", "Vehicle Category", "Size", "Load Point", "Unload Point", "Rate"]],
      body: tableData,
      startY: 25,
      theme: "grid",
      headStyles: { fillColor: [17, 55, 91], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 2, halign: "center" },
    });

    doc.save("RoutePricing.pdf");
    toast.success("PDF downloaded!");
  };

  // Print Table (filtered)
  const printTripsTable = () => {
    const printWindow = window.open("", "", "width=1000,height=700");
    const tableRows = filteredData
      .map(
        (dt, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${dt.customer_name || "-"}</td>
        <td>${dt.vehicle_category || "-"}</td>
        <td>${dt.vehicle_size || "-"}</td>
        <td>${dt.load_point || "-"}</td>
        <td>${dt.unload_point || "-"}</td>
        <td>${dt.rate || "-"}</td>
      </tr>`
      )
      .join("");

    printWindow.document.write(`
    <html>
      <head>
        <title>-</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h2 { color: #11375B; text-align: center; font-size: 22px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th, td { padding: 8px; border: 1px solid #ddd; text-align: center; }
          th { background-color: #11375B; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          tr:hover { background-color: #f1f5f9; }
          .footer { margin-top: 20px; text-align: right; font-size: 12px; color: #555; }
          @media print { body { margin: 0; } }
           thead th {
          color: #000000 !important;
          background-color: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        </style>
      </head>
      <body>
        <h2>${t("Route Pricing")} </h2>
        <table>
          <thead>
            <tr>
              <th>${t("SL.")}</th>
              <th>${t("Customer")}</th>
              <th>${t("Vehicle")} ${t("Category")}</th>
              <th>${t("Size")}</th>
              <th>${t("Load Point")}</th>
              <th>${t("Unload Point")}</th>
              <th>${t("Rate")}</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="footer">
          Printed on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
        </div>
      </body>
    </html>
  `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // filter data
  const filteredData = routePricing.filter(item =>
    item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vehicle_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vehicle_size?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.load_point?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.unload_point?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.rate?.toString().includes(searchTerm)
  );


  if (loading) return <p className="text-center mt-16">{t("Loading")}...</p>;

  // Pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomer = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <main className="p-2">
      <Toaster />
      <div className="w-[22rem] md:w-full max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 md:p-4 border border-gray-200">

        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FaUsers className="text-gray-800 text-2xl" />
            {t("Customer")} {t("Route Pricing")}
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-3 bg-primary text-white px-4 py-1 rounded-md shadow-md flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <FaPlus /> {t("Add")}
          </button>
        </div>
        {/* Filter and Search */}
        <div className="md:flex justify-between items-center mb-5">
          <div className="flex gap-1 md:gap-3 text-gray-700 font-medium rounded-md">
            <button
              onClick={exportTripsToExcel}
              className="py-1 px-5 hover:bg-primary shadow bg-white hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              {t("Excel")}
            </button>
            {/* <button
              onClick={exportTripsToPDF}
              className="py-1 px-5 hover:bg-primary shadow bg-white hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              PDF
            </button> */}
            <button
              onClick={printTripsTable}
              className="py-1 px-5 hover:bg-primary shadow bg-white hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              {t("Print")}
            </button>
          </div>
          {/* search */}
          <div className="mt-3 md:mt-0 relative">
            {/* <span className="text-primary font-semibold pr-3">Search: </span> */}
            <div className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={`${t("search")}...`}
                className="lg:w-60 border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-7 w-full"
              />

              {/*  Clear button */}
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Table */}
        <div id="pricingTable" className="overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-primary">
              <tr>
                <th className="p-2">{t("SL.")}</th>
                <th className="p-2">{t("Customer")}</th>
                <th className="p-2">{t("Vehicle")} {t("Category")}</th>
                <th className="p-2">{t("Size")}</th>
                <th className="p-2">{t("Load Point")}</th>
                <th className="p-2">{t("Unload Point")}</th>
                <th className="p-2">{t("Rate")}</th>
                {/* <th className="p-2">Vat</th> */}
                <th className="p-2">{t("Action")}</th>
              </tr>
            </thead>
            <tbody className=" text-gray-700">
              {currentCustomer.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center p-4 text-gray-500">
                    {t("No customer rate found")}
                  </td>
                </tr>
              ) : currentCustomer.map((dt, index) => (
                <tr key={index} className="hover:bg-gray-50 border border-gray-200">
                  <td className="px-2 py-4 font-bold">{indexOfFirstItem + index + 1}</td>
                  <td className="px-2 py-4">{dt.customer_name}</td>
                  <td className="px-2 py-4">{dt.vehicle_category}</td>
                  <td className="px-2 py-4">{dt.vehicle_size}</td>
                  <td className="px-2 py-4">{dt.load_point}</td>
                  <td className="px-2 py-4">{dt.unload_point}</td>
                  <td className="px-2 py-4">{dt.rate}</td>
                  {/* <td className="p-2">{dt.vat}</td> */}
                  <td className="p-2 flex gap-2 items-center">

                    <button onClick={() => handleEdit(dt)} className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md">
                      <FaPen className="text-[12px]" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRateId(dt.id);
                        setIsOpen(true);
                      }}
                      className="text-red-500 hover:text-white hover:bg-red-600 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                    >
                      <FaTrashAlt className="text-[12px]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {currentCustomer.length > 0 && totalPages >= 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            maxVisible={8}
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-xl border border-gray-300">
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
              <IoMdClose className="text-2xl" />
            </button>
            <h2 className="text-xl font-bold text-[#11375B] mb-6 text-center">
              {editId ? t("Update Route Pricing") : t("Add Route Pricing")}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="w-full">
                  <label className="block text-gray-700 text-sm font-medium mb-1">{t("Customer")}</label>
                  <CreatableSelect
                    options={customers.map(c => ({ value: c.customer_name, label: c.customer_name }))}
                    value={formData.customer_name ? { value: formData.customer_name, label: formData.customer_name } : null}
                    onChange={selected => setFormData(prev => ({ ...prev, customer_name: selected?.value || "" }))}
                    isClearable
                    placeholder="Select or type customer"
                    className="focus:!outline-none focus:!ring-2 focus:!ring-primary"
                  />
                </div>
                <div className="relative w-full">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    {t("Vehicle")} {t("Category")}
                  </label>
                  <select
                    name="vehicle_category"
                    value={formData.vehicle_category}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, vehicle_category: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">{t("Vehicle")} {t("Category")} {t("Select")}...</option>
                    <option value="pickup">{t("Pickup")}</option>
                    <option value="covered_van">{t("Covered Van")}</option>
                    <option value="open_truck">{t("Open Truck")}</option>
                    <option value="trailer">{t("Trailer")}</option>
                    <option value="freezer_van">{t("Freezer Van")}</option>
                    <option value="oil_tanker">{t("Oil Tanker")}</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-full">
                  <label className="block text-gray-700 text-sm font-medium mb-1">{t("Load Point")}</label>
                  <CreatableSelect
                    options={customers.map(c => ({ value: c.customer_name, label: c.customer_name }))}
                    value={formData.load_point ? { value: formData.load_point, label: formData.load_point } : null}
                    onChange={selected => setFormData(prev => ({ ...prev, load_point: selected?.value || "" }))}
                    isClearable
                    placeholder={t("Select or type load")}
                    className="focus:!ring-2 focus:!ring-primary"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-gray-700 text-sm font-medium mb-1">{t("Unload Point")}</label>
                  <CreatableSelect
                    options={unloadpoints.map(c => ({ value: c.name, label: c.name }))}
                    value={formData.unload_point ? { value: formData.unload_point, label: formData.unload_point } : null}
                    onChange={selected => setFormData(prev => ({ ...prev, unload_point: selected?.value || "" }))}
                    isClearable
                    placeholder={t("Select or type unload")}
                    className="focus:!ring-2 focus:!ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="w-full">
                  <label className="block text-gray-700 text-sm font-medium mb-1">{t("Vehicle")} {t("Size")}</label>
                  <input
                    type="text"
                    name="vehicle_size"
                    value={formData.vehicle_size}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter 1 Ton/7 Feet"
                  />
                </div>
                <div className="w-full">
                  <label className="block text-gray-700 text-sm font-medium mb-1">{t("Rate")}</label>
                  <input
                    type="number"
                    name="rate"
                    value={formData.rate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t("Enter price")}
                  />
                </div>
              </div>
              {/* <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Vat</label>
                <input
                  type="number"
                  name="vat"
                  value={formData.vat}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter vat"
                />
              </div> */}

              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                  {t("Cancel")}
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80">
                  {editId ? t("Update Pricing") : t("Add Pricing")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
                {t("Are you sure you want to delete?")}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  {t("No")}
                </button>
                <button
                  onClick={() => handleDelete(selectedRateId)}
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

export default RoutePricing;
