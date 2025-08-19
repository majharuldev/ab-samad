import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaFilter } from "react-icons/fa6";
import { HiCurrencyBangladeshi } from "react-icons/hi2";
import { IoIosRemoveCircle } from "react-icons/io";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Honda = () => {
  const [honda, setHonda] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedRows, setSelectedRows] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // Fetch trips data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setHonda(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);
  // find honda
  const hondaTrip = honda?.filter((dt) => dt.customer === "Honda");

  const handleCheckBox = (index) => {
    setSelectedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  // Filter start
  // Get selected data based on selectedRows
  const selectedTrips = hondaTrip.filter((_, idx) => selectedRows[idx]);
  // Fallback: show all if none selected
  const tripsToCalculate = selectedTrips.length > 0 ? selectedTrips : hondaTrip;
  const filteredTrips = hondaTrip.filter((trip) => {
    const tripDate = new Date(trip.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return (!start || tripDate >= start) && (!end || tripDate <= end);
  });
  // Filter end
  // Total trip
  const totalTrip = tripsToCalculate.reduce(
    (sum, dt) => sum + (parseFloat(dt.no_of_trip) || 0),
    0
  );
  // Per truck rent
  const perTruckRent = tripsToCalculate.reduce(
    (sum, dt) => sum + (parseFloat(dt.per_truck_rent) || 0),
    0
  );
  // Total rent
  const totalRent = tripsToCalculate.reduce((sum, dt) => {
    const trips = parseFloat(dt.no_of_trip || 0);
    const perTruckRent = parseFloat(dt.per_truck_rent || 0);
    return sum + trips * perTruckRent;
  }, 0);
  // Calculate 15% vat
  const totalVat = tripsToCalculate.reduce((sum, dt) => {
    const rent = parseFloat(dt.total_rent || 0);
    const vatAmount = (rent * 15) / 100;
    return sum + vatAmount;
  }, 0);
  // Calculate Total Cost
  const totalCost = tripsToCalculate.reduce((sum, dt) => {
    const rent = parseFloat(dt.total_rent || 0);
    const vatAmount = (rent * 15) / 100;
    return sum + rent + vatAmount;
  }, 0);

  // bill submit func
  const handleSubmit = async () => {
    const selectedData = hondaTrip.filter((_, i) => selectedRows[i] && dt.status === "Pending");
    if (!selectedData.length) {
      return toast.error("Please select at least one row.", {
        position: "top-right",
      });
    }
    try {
      const loadingToast = toast.loading("Submitting selected rows...");
      for (const dt of selectedData) {
        const rent = parseFloat(dt.total_rent) || 0;
      const vatAmount = (rent * 15) / 100;
      const totalCost = rent + vatAmount
        const fd = new FormData();
        fd.append("bill_date", new Date().toISOString().split("T")[0]);
        fd.append("customer_name", dt.customer);
        fd.append("delar_name", dt.dealer_name);
        fd.append("unload_point", dt.unload_point);
        fd.append("no_of_trip", dt.no_of_trip);
        fd.append("qty", dt.quantity);
        fd.append("vehicle_mode", dt.vehicle_mode);
        fd.append("per_truck_rent", dt.per_truck_rent);
        fd.append("bill_amount", totalCost);

        // Step 1: Create ledger entry
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/customerLedger/create`,
          fd
        );

        // Step 2: Update trip status to Approved
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/trip/update/${dt.id}`,
          { status: "Approved",
             customer: dt.customer,
        date: dt.date,
        load_point: dt.load_point,
        unload_point: dt.unload_point,
        transport_type: dt.transport_type,
        vehicle_no: dt.vehicle_no,
        total_rent: dt.total_rent,
        quantity: dt.quantity,
        dealer_name: dt.dealer_name,
        driver_name: dt.driver_name,
        vendor_name: dt.vendor_name,
        fuel_cost: dt.fuel_cost,
        do_si: dt.do_si,
        driver_mobile: dt.driver_mobile,
        challan: dt.challan,
        sti: dt.sti,
        model_no: dt.model_no,
        co_u: dt.co_u,
        masking: dt.masking,
        unload_charge: dt.unload_charge,
        extra_fare: dt.extra_fare,
        vehicle_rent: dt.vehicle_rent,
        goods: dt.goods,
        distribution_name: dt.distribution_name,
        remarks: dt.remarks,
        no_of_trip: dt.no_of_trip,
        vehicle_mode: dt.vehicle_mode,
        per_truck_rent: dt.per_truck_rent,
        vat: dt.vat,
        total_rent_cost: dt.total_rent_cost,
        driver_commission: dt.driver_commission,
        road_cost: dt.road_cost,
        food_cost: dt.food_cost,
        total_exp: dt.total_exp,
        trip_rent: dt.trip_rent,
        advance: dt.advance,
        due_amount: dt.due_amount,
        ref_id: dt.ref_id,
        body_fare: dt.body_fare,
        parking_cost: dt.parking_cost,
        night_guard: dt.night_guard,
        toll_cost: dt.toll_cost,
        feri_cost: dt.feri_cost,
        police_cost: dt.police_cost,
        driver_adv: dt.driver_adv,
        chada: dt.chada,
        labor: dt.labor,
           }
        );
      }
      toast.success("Successfully submitted!", {
        id: loadingToast,
        position: "top-right",
      });
      setSelectedRows({});

      // Optional: refetch trips to refresh data
      const refreshed = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/trip/list`
      );
      if (refreshed.data.status === "Success") {
        setHonda(refreshed.data.data);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Submission failed. Check console for details.", {
        position: "top-right",
      });
    }
  };

  // Excel Export
  const exportToExcel = () => {
    if (!selectedTrips.length) {
      return toast.error("Please select at least one row.");
    }
    const ws = XLSX.utils.json_to_sheet(selectedTrips);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Honda Billing");
    XLSX.writeFile(wb, "Honda_Billing.xlsx");
  };

  // PDF Export
  const exportToPDF = () => {
    if (!selectedTrips.length) {
      return toast.error("Please select at least one row.");
    }
    const doc = new jsPDF();
    doc.text("Honda Billing", 14, 10);
    autoTable(doc, {
      head: [
        [
          "Date",
          "Do(Si)",
          "Dealer Name",
          "Address",
          "No of Trip",
          "No of Unit",
          "Vehicle Mode",
          "Per Truck Rent",
          "Total Rent",
          "15% Vat",
          "Total Cost",
        ],
      ],
      body: selectedTrips.map((dt) => {
        const rent = parseFloat(dt.total_rent) || 0;
        const vatAmount = (rent * 15) / 100;
        return [
          dt.date,
          dt.do_si,
          dt.dealer_name,
          dt.unload_point,
          dt.no_of_trip,
          dt.quantity,
          dt.vehicle_mode,
          dt.per_truck_rent,
          dt.total_rent,
          vatAmount.toFixed(2),
          (rent + vatAmount).toFixed(2),
        ];
      }),
    });
    doc.save("Honda_Billing.pdf");
  };

  // Print
  const handlePrint = () => {
    if (!selectedTrips.length) {
      return toast.error("Please select at least one row.");
    }
    const printContent = `
      <html>
      <head>
        <style>
         @page { margin: 0; }
  body { margin: 1cm; font-family: Arial, sans-serif; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid black; padding: 5px; }
  p { margin: 5px 0; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid black; padding: 5px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h2 style="margin-top: 2.62in;">Honda Billing</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Do(Si)</th>
              <th>Dealer Name</th>
              <th>Address</th>
              <th>No of Trip</th>
              <th>No of Unit</th>
              <th>Vehicle Mode</th>
              <th>Per Truck Rent</th>
              <th>Total Rent</th>
              <th>15% Vat</th>
              <th>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            ${selectedTrips
              .map((dt) => {
                const rent = parseFloat(dt.total_rent) || 0;
                const vatAmount = (rent * 15) / 100;
                return `
                  <tr>
                    <td>${dt.date}</td>
                    <td>${dt.do_si}</td>
                    <td>${dt.dealer_name}</td>
                    <td>${dt.unload_point}</td>
                    <td>${dt.no_of_trip}</td>
                    <td>${dt.quantity}</td>
                    <td>${dt.vehicle_mode}</td>
                    <td>${dt.per_truck_rent}</td>
                    <td>${dt.total_rent}</td>
                    <td>${vatAmount.toFixed(2)}</td>
                    <td>${(rent + vatAmount).toFixed(2)}</td>
                  </tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) return <p className="text-center mt-16">Loading Honda...</p>;

  return (
    <div className=" md:p-2">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-2 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <HiCurrencyBangladeshi className="text-[#11375B] text-2xl" />
            Billing Honda
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
            <button
              onClick={exportToExcel}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              Excel
            </button>
            <button
              onClick={exportToPDF}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              PDF
            </button>
            <button
              onClick={handlePrint}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              Print
            </button>
          </div>
        </div>
        {/* Conditional Filter Section */}
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
          <table className="min-w-full text-sm text-left">
            <thead className="capitalize text-sm">
              <tr>
                <th className="border border-gray-700 px-2 py-1">SL.</th>
                <th className="border border-gray-700 px-2 py-1">Date</th>
                <th className="border border-gray-700 px-2 py-1">Do(Si)</th>
                <th className="border border-gray-700 px-2 py-1">DealerName</th>
                <th className="border border-gray-700 px-2 py-1">Address</th>
                <th className="border border-gray-700 px-2 py-1">NoOfTrip</th>
                <th className="border border-gray-700 px-2 py-1">NoOfUnit</th>
                <th className="border border-gray-700 px-2 py-1">
                  VehicleMode
                </th>
                <th className="border border-gray-700 px-2 py-1">
                  PerTruckRent
                </th>
                <th className="border border-gray-700 px-2 py-1">TotalRent</th>
                <th className="border border-gray-700 px-2 py-1">15%Vat</th>
                <th className="border border-gray-700 px-2 py-1">TotalCost</th>
                <th className="border border-gray-700 px-2 py-1">BillStatus</th>
              </tr>
            </thead>
            <tbody className="font-semibold">
              {filteredTrips?.map((dt, index) => {
                const rent = parseFloat(dt?.total_rent) || 0;
                const vatAmount = (rent * 15) / 100;
                const totalCost = rent + vatAmount;

                return (
                  <tr key={index} className="hover:bg-gray-50 transition-all">
                    <td className="border border-gray-700 p-1 font-bold">
                      {index + 1}
                    </td>
                    <td className="border border-gray-700 p-1">{dt.date}</td>
                    <td className="border border-gray-700 p-1">{dt.do_si}</td>
                    <td className="border border-gray-700 p-1">
                      {dt.dealer_name}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.unload_point}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.no_of_trip}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.quantity}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.vehicle_mode}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.per_truck_rent}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.total_rent}
                    </td>
                    <td className="border border-gray-700 p-1">{vatAmount}</td>
                    <td className="border border-gray-700 p-1">{totalCost}</td>
                    <td className="border border-gray-700 p-1 text-center ">
  <div className="flex items-center">
    <input
    type="checkbox"
    className="w-4 h-4"
    checked={!!selectedRows[index]}
    onChange={() => handleCheckBox(index)}
    disabled={false} 
  />
  {dt.status === "Pending" && (
    <span className=" inline-block px-2  text-xs text-yellow-600 rounded">
      Not Submitted
    </span>
  )}
  {dt.status === "Approved" && (
    <span className="inline-block px-2  text-xs text-green-700 rounded">
      Submitted
    </span>
  )}
  </div>
</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td
                  colSpan={5}
                  className="border border-black px-2 py-1 text-right"
                >
                  Total
                </td>
                <td className="border border-black px-2 py-1">{totalTrip}</td>
                <td className="border border-black px-2 py-1">
                  {/* {totalQuantity} */}
                </td>
                <td className="border border-black px-2 py-1">
                  {/* {totalMasking} */}
                </td>
                <td className="border border-black px-2 py-1">
                  {perTruckRent}
                </td>
                <td className="border border-black px-2 py-1">{totalRent}</td>
                <td className="border border-black px-2 py-1">{totalVat}</td>
                <td className="border border-black px-2 py-1">{totalCost}</td>
                <td className="border border-black px-2 py-1"></td>
              </tr>
            </tfoot>
          </table>
          <div className="flex justify-end mt-5">
            <button
              className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300  cursor-pointer"
              onClick={handleSubmit}
            >
              Save Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Honda;
