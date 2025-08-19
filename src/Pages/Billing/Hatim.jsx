import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaFilter } from "react-icons/fa6";
import { HiCurrencyBangladeshi } from "react-icons/hi2";
import { toWords } from "number-to-words";
import { IoIosRemoveCircle } from "react-icons/io";
import * as XLSX from "xlsx";

const Hatim = () => {
  const [hatim, setHatim] = useState([]);
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
          setHatim(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);
  // find hatim
  const hatimTrip = hatim?.filter((dt) => dt.customer === "Hatim Rupgonj");
  // Filter by date
  const filteredTrips = hatimTrip.filter((trip) => {
    const tripDate = new Date(trip.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      return tripDate >= start && tripDate <= end;
    } else if (start) {
      return tripDate.toDateString() === start.toDateString();
    } else {
      return true; // no filter applied
    }
  });
  const handleCheckBox = (index) => {
    setSelectedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  const numberToWords = (num) => {
    if (!num || isNaN(num)) return "Zero";
    return toWords(num).replace(/^\w/, (c) => c.toUpperCase()) + " Taka only.";
  };
  // Get selected data based on selectedRows
  const selectedTrips = hatimTrip.filter((_, idx) => selectedRows[idx]);
  // Fallback: show all if none selected
  const tripsToCalculate = selectedTrips.length > 0 ? selectedTrips : hatimTrip;
  const totalRent = tripsToCalculate.reduce(
    (sum, dt) => sum + (parseFloat(dt.total_rent) || 0),
    0
  );

  // bill submit function
  const handleSubmit = async () => {
    // const selectedData = hatimTrip.filter((_, i) => selectedRows[i]);
    const selectedData = hatimTrip.filter(
    (dt, i) => selectedRows[i] && dt.status === "Pending"
  );
    if (!selectedData.length) {
      return toast.error("Please select at least one row for Not submitted.", {
        position: "top-right",
      });
    }
    try {
      const loadingToast = toast.loading("Submitting selected rows...");
      for (const dt of selectedData) {
        const fd = new FormData();
        fd.append("bill_date", new Date().toISOString().split("T")[0]);
        fd.append("vehicle_no", dt.vehicle_no);
        fd.append("goods", dt.goods);
        fd.append("customer_name", dt.customer);
        fd.append("delar_name", dt.distribution_name);
        fd.append("unload_point", dt.unload_point);
        fd.append("bill_amount", dt.total_rent);

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
        setHatim(refreshed.data.data);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Submission failed. Check console for details.", {
        position: "top-right",
      });
    }
  };

  // Convert table data to array for Excel/PDF
const tableData = tripsToCalculate.map((dt, index) => [
  index + 1,
  dt.date,
  dt.vehicle_no,
  dt.goods,
  dt.distribution_name?.split(",").join("\n") || "",
  dt.unload_point?.split(",").join("\n") || "",
  dt.total_rent,
  dt.status === "Pending" ? "" : "Submited"
]);

const headers = [
  "SL.",
  "Date",
  "Vehicle No",
  "Goods",
  "Distributor Name",
  "Destination",
  "Amount",
  "Remark"
];

const exportToExcel = () => {
  const wb = XLSX.utils.book_new();
  const wsData = [
    ["To", "Distribution Manager", "Hatim Group", "Dhaka-1212"],
    [],
    ["Subject: Carrying Bill"],
    [],
    ["Date Range:", startDate + " to " + endDate, "", "Bill No: HTA-21(Gs+SS)/2025"],
    [],
    headers,
    ...tableData,
    [],
    ["Grand Total", "", "", "", "", "", totalRent],
    ["In Words", numberToWords(totalRent)]
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, "Hatim Bill");
  XLSX.writeFile(wb, "Hatim_Bill.xlsx");
};

const exportToPDF = () => {
  const docDefinition = {
    pageMargins: [40, 100, 40, 40], // 2 inch top margin ~ 144 pts
    content: [
      // { text: "To\nDistribution Manager\nHatim Group\nDhaka-1212", margin: [0,0,0,10] },
      // { text: "Subject: Carrying Bill", bold: true, margin: [0,0,0,10] },
      // { text: `Date: ${startDate} to ${endDate}`, margin: [0,0,0,5] },
      // { text: `Bill No: HTA-21(Gs+SS)/2025`, margin: [0,0,0,10] },
      {
        table: {
          headerRows: 1,
          widths: ["auto","auto","auto","*","*","*","auto","auto"],
          body: [headers, ...tableData, [
            { text: "Grand Total", colSpan: 6, alignment: "right"}, {}, {}, {}, {}, {}, totalRent, ""
          ]]
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1
        }
      },
      { text: `In Words: ${numberToWords(totalRent)}`, margin: [0,10,0,0] },
      // { text: "\nFor-\nHaque Transport Agency", margin: [0,20,0,0] },
      // { text: "Security in charge       Distribution       Admin       DGM Sir       Authorized signature", margin: [0,20,0,0] }
    ]
  };
  pdfMake.createPdf(docDefinition).open();
};

const handlePrint = () => {
  // Check if any rows are selected
  const selectedTrips = hatimTrip.filter((_, idx) => selectedRows[idx]);
  if (selectedTrips.length === 0) {
    return toast.error("Please select bill(s) to print", {
      position: "top-right",
    });
  }

  // Calculate total amount for selected trips
  const totalAmount = selectedTrips.reduce(
    (sum, trip) => sum + (parseFloat(trip.total_rent) || 0),
    0
  );

  // Generate the print content
  const printContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; margin-top:2.62in">
      <div style="margin-bottom: 30px;">
        <p>To</p>
        <p>Distribution Manager</p>
        <p>Hatim Group</p>
        <p>Dhaka-1212</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <p style="font-weight: bold;">Subject: Carrying Bill</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <p>Date: ${startDate} to ${endDate}</p>
        <p>Bill No: HTA-${selectedTrips[0].id}(Gs+SS)/2025</p>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr>
            <th style="border: 1px solid black; padding: 5px;">SL</th>
            <th style="border: 1px solid black; padding: 5px;">Date</th>
            <th style="border: 1px solid black; padding: 5px;">Vehicle No</th>
            <th style="border: 1px solid black; padding: 5px;">Goods</th>
            <th style="border: 1px solid black; padding: 5px;">Distributor Name</th>
            <th style="border: 1px solid black; padding: 5px;">Destination</th>
            <th style="border: 1px solid black; padding: 5px;">Amount</th>
            <th style="border: 1px solid black; padding: 5px;">Remark</th>
          </tr>
        </thead>
        <tbody>
          ${selectedTrips
            .map(
              (trip, index) => `
            <tr>
              <td style="border: 1px solid black; padding: 5px;">${index + 1}</td>
              <td style="border: 1px solid black; padding: 5px;">${trip.date}</td>
              <td style="border: 1px solid black; padding: 5px;">${trip.vehicle_no}</td>
              <td style="border: 1px solid black; padding: 5px;">${trip.goods}</td>
              <td style="border: 1px solid black; padding: 5px; white-space: pre-line;">${
                trip.distribution_name || ""
              }</td>
              <td style="border: 1px solid black; padding: 5px; white-space: pre-line;">${
                trip.unload_point || ""
              }</td>
              <td style="border: 1px solid black; padding: 5px;">${trip.total_rent}</td>
              <td style="border: 1px solid black; padding: 5px;">${trip.remarks}</td>
            </tr>
          `
            )
            .join("")}
          <tr>
            <td colspan="6" style="border: 1px solid black; padding: 5px; text-align: right;">
              Grand Total =
            </td>
            <td style="border: 1px solid black; padding: 5px;">${totalAmount}</td>
            <td style="border: 1px solid black; padding: 5px;"></td>
          </tr>
        </tbody>
      </table>
      
      <div style="margin-bottom: 20px;">
        <p>In Word: ${numberToWords(totalAmount)}</p>
      </div>
    </div>
  `;

  // Open print window
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>

       <style>
  @page { margin: 0; }
  body { margin: 1cm; font-family: Arial, sans-serif; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid black; padding: 5px; }
  p { margin: 5px 0; }
</style>
      </head>
      <body>
        ${printContent}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 200);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

  if (loading) return <p className="text-center mt-16">Loading Hatim...</p>;
  return (
    <div className=" md:p-2">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-2 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <HiCurrencyBangladeshi className="text-[#11375B] text-2xl" />
            Billing Hatim Rupgonj
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
        <div id="printArea" className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="capitalize text-sm">
              <tr>
                <th className="border border-gray-700 p-1">SL.</th>
                <th className="border border-gray-700 p-1">Date</th>
                <th className="border border-gray-700 p-1">VehicleNo.</th>
                <th className="border border-gray-700 p-1">Goods</th>
                <th className="border border-gray-700 p-1">Distributor Name</th>
                <th className="border border-gray-700 p-1">Destination</th>
                <th className="border border-gray-700 p-1">Amount</th>
                <th className="border border-gray-700 px-2 py-1">BillStatus</th>
              </tr>
            </thead>
            <tbody className="font-semibold">
              {filteredTrips?.map((dt, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-all">
                  <td className="border border-gray-700 p-1 font-bold">
                    {index + 1}.
                  </td>
                  <td className="border border-gray-700 p-1">{dt.date}</td>
                  <td className="border border-gray-700 p-1">
                    {dt.vehicle_no}
                  </td>
                  <td className="border border-gray-700 p-1">{dt.goods}</td>
                  <td className="border border-gray-700 p-1 whitespace-pre-line">
                    {dt.distribution_name
                      ?.split(",")
                      .map((point) => point.trim())
                      .join("\n")}
                  </td>
                  <td className="border border-gray-700 p-1 whitespace-pre-line">
                    {dt.unload_point
                      ?.split(",")
                      .map((point) => point.trim())
                      .join("\n")}
                  </td>
                  <td className="border border-gray-700 p-1">
                    {dt.total_rent}
                  </td>
                  {/* <td className="border border-gray-700 p-1 text-center">
                    {dt.status === "Pending" ? (
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={!!selectedRows[index]}
                        onChange={() => handleCheckBox(index)}
                      />
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs text-green-700 rounded">
                        Submited
                      </span>
                    )}
                  </td> */}
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
    <span className=" inline-block px-2  text-xs text-green-700 rounded">
      Submitted
    </span>
  )}
  </div>
</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td
                  colSpan={6}
                  className="border border-black px-2 py-1 text-right"
                >
                  Grand Total
                </td>
                <td className="border border-black px-2 py-1">{totalRent}</td>
                <td className="border border-black px-2 py-1"></td>
              </tr>
              <tr className="font-bold">
                <td colSpan={12} className="py-1">
                  In Words (For Body Bill):{" "}
                  <span className="font-medium">
                    {numberToWords(totalRent)}
                  </span>
                </td>
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

export default Hatim;
