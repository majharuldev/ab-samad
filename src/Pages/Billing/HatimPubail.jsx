import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaFilter } from "react-icons/fa6";
import { HiCurrencyBangladeshi } from "react-icons/hi2";
import { toWords } from "number-to-words";
import { IoIosRemoveCircle } from "react-icons/io";
import jsPDF from "jspdf";

const HatimPubail = () => {
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
  const hatimTrip = hatim?.filter((dt) => dt.customer === "Hatim Pubail");
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

  const handleSubmit = async () => {
    // const selectedData = hatimTrip.filter((_, i) => selectedRows[i]);
    const selectedData = hatimTrip.filter(
    (dt, i) => selectedRows[i] && dt.status === "Pending"
  );
    if (!selectedData.length) {
      return toast.error("Please select at least one row Not Submitted.", {
        position: "top-right",
      });
    }

    console.log("Selected Data:", selectedData);

    try {
      const loadingToast = toast.loading("Submitting selected rows...");

      for (const dt of selectedData) {
        const fd = new FormData();
        fd.append("bill_date", dt.date);
        fd.append("driver_name", dt.driver_name);
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


  // print selected bills as PDF
  const handlePrint = () => {
  const selectedData = hatimTrip.filter((_, i) => selectedRows[i]);
  if (!selectedData.length) {
    return toast.error("Please select at least one bill to print.", {
      position: "top-right",
    });
  }

  // Group trips by date and vehicle number
  const groupedTrips = selectedData.reduce((acc, trip) => {
    const key = `${trip.date}-${trip.vehicle_no}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(trip);
    return acc;
  }, {});

  // Calculate date range
  const dates = selectedData.map(trip => new Date(trip.date));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  const formattedMinDate = minDate.toLocaleDateString('en-GB').replace(/\//g, '.');
  const formattedMaxDate = maxDate.toLocaleDateString('en-GB').replace(/\//g, '.');
  const dateRange = `${formattedMinDate} To ${formattedMaxDate}`;

  // Generate current bill number
  const now = new Date();
  const billNo = `HTA-${now.toLocaleString('default', { month: 'long' })}-${now.getFullYear()}`;

  // Create HTML content for printing
  const htmlContent = `
    <html>
      <head>
        <style>
        @page { margin: 0; }
  body { margin: 1cm; font-family: Arial, sans-serif; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid black; padding: 5px; }
  p { margin: 5px 0; }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0;
            padding: 20px;
          }
          .header {
            margin-bottom: 20px;
          }
          .subject {
            font-weight: bold;
            margin: 15px 0;
          }
          .bill-info {
            margin-bottom: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #000;
            padding: 5px;
            font-size: 12px;
          }
          th {
            text-align: left;
            background-color: #f2f2f2;
          }
          .page-break {
            page-break-after: always;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
          }
          .total {
            font-weight: bold;
            text-align: right;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header" style="margin-top:2.62in">
          <div>To</div>
          <div>Distribution Manager</div>
          <div>Hatim Group</div>
          <div>Dhaka-1212</div>
        </div>

        <div class="subject">Subject: Carrying Bill</div>

        <div class="bill-info">
          <div>Warehouse Name : Puhall</div>
          <div>Date:- ${dateRange} (Part-A)</div>
          <div>Bill No : ${billNo}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>SL No</th>
              <th>Date</th>
              <th>Vehicle No</th>
              <th>Distribution Name</th>
              <th>Destination</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(groupedTrips).map(([key, trips], index) => {
              const firstTrip = trips[0];
              const dateParts = firstTrip.date.split('-');
              const formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0].slice(-2)}`;
              
              let distributionContent = '';
              let destinationContent = '';
              let amountContent = '';
              let totalAmount = 0;
              
              trips.forEach((trip, tripIndex) => {
                const distPoints = trip.distribution_name?.split(',').map(p => p.trim()) || [];
                const destPoints = trip.unload_point?.split(',').map(p => p.trim()) || [];
                
                distPoints.forEach((point, i) => {
                  distributionContent += `${i+1}. ${point}<br/>`;
                  if (destPoints[i]) {
                    destinationContent += `${i+1}. ${destPoints[i]}<br/>`;
                  } else {
                    destinationContent += `<br/>`;
                  }
                });
                
                if (tripIndex === trips.length - 1) {
                  const amount = parseFloat(trip.total_rent) || 0;
                  totalAmount += amount;
                  amountContent = amount;
                }
              });
              
              return `
                <tr>
                  <td>${(index + 1).toString().padStart(2, '0')}</td>
                  <td>${formattedDate}</td>
                  <td>${firstTrip.vehicle_no}</td>
                  <td>${distributionContent}</td>
                  <td>${destinationContent}</td>
                  <td>${amountContent}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="total">
          Total Amount: ${selectedData.reduce((sum, trip) => sum + (parseFloat(trip.total_rent) || 0), 0)}
        </div>
        <div class="footer">
          In Words: ${numberToWords(selectedData.reduce((sum, trip) => sum + (parseFloat(trip.total_rent) || 0), 0))}
        </div>
      </body>
    </html>
  `;

  // Open print window
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  
  // Wait for content to load before printing
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};

// pdf download function
// Updated handleDownloadPDF function to match the bill format
const handleDownloadPDF = () => {
  const selectedData = hatimTrip.filter((_, i) => selectedRows[i]);
  if (!selectedData.length) {
    return toast.error("Please select at least one bill to download.", {
      position: "top-right",
    });
  }

  // Group trips by date and vehicle number
  const groupedTrips = selectedData.reduce((acc, trip) => {
    const key = `${trip.date}-${trip.vehicle_no}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(trip);
    return acc;
  }, {});

  const doc = new jsPDF();
  
  // Set font and size for the document
  doc.setFont("helvetica");
  doc.setFontSize(10);

  // Calculate date range
  const dates = selectedData.map(trip => new Date(trip.date));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  const dateRange = `${minDate.toLocaleDateString('en-GB')} To ${maxDate.toLocaleDateString('en-GB')}`;

  // Header section
  doc.setFontSize(12);
  doc.text("To", 20, 20);
  doc.text("Distribution Manager", 20, 26);
  doc.text("Hatim Group", 20, 32);
  doc.text("Dhaka-1212", 20, 38);

  doc.setFontSize(12);
  doc.text("Subject: Carrying Bill", 20, 48);

  // Warehouse and date info
  doc.setFontSize(10);
  doc.text(`Warehouse Name : Puhall`, 20, 56);
  doc.text(`Date:- ${dateRange} (Part-A)`, 20, 62);
  doc.text(`Bill No : HTA-July-2025`, 20, 68);

  // Table header
  let y = 78;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("SL No", 20, y);
  doc.text("Date", 35, y);
  doc.text("Vehicle No", 55, y);
  doc.text("Distribution Name", 90, y);
  doc.text("Destination", 140, y);
  doc.text("Total Amount", 180, y);

  // Table rows
  doc.setFont("helvetica", "normal");
  let slNo = 1;
  let totalAmount = 0;

  Object.entries(groupedTrips).forEach(([key, trips], groupIndex) => {
    const firstTrip = trips[0];
    const dateParts = firstTrip.date.split('-');
    const formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0].slice(-2)}`;
    
    // Main row
    doc.text(slNo.toString().padStart(2, '0'), 20, y + 8);
    doc.text(formattedDate, 35, y + 8);
    doc.text(firstTrip.vehicle_no, 55, y + 8);
    
    // Distribution and destination points
    let distY = y + 8;
    trips.forEach((trip, idx) => {
      const distPoints = trip.distribution_name?.split(',').map(p => p.trim()) || [];
      const destPoints = trip.unload_point?.split(',').map(p => p.trim()) || [];
      
      distPoints.forEach((point, i) => {
        if (i === 0 && idx === 0) {
          doc.text(`${i+1}. ${point}`, 90, distY);
          if (destPoints[i]) {
            doc.text(`${i+1}. ${destPoints[i]}`, 140, distY);
          }
        } else {
          distY += 5;
          doc.text(`${i+1}. ${point}`, 90, distY);
          if (destPoints[i]) {
            doc.text(`${i+1}. ${destPoints[i]}`, 140, distY);
          }
        }
      });
      
      // Add amount to the last row of the group
      if (idx === trips.length - 1) {
        const amount = parseFloat(trip.total_rent) || 0;
        totalAmount += amount;
        doc.text(amount.toString(), 180, distY);
      }
    });
    
    // Find the maximum height used by this group
    const maxDistY = distY;
    const groupHeight = Math.max(maxDistY - y, 10);
    
    // Draw horizontal lines
    doc.line(15, y + 3, 195, y + 3);
    doc.line(15, maxDistY + 5, 195, maxDistY + 5);
    
    // Update y position for next group
    y = maxDistY + 8;
    slNo++;
    
    // Add new page if needed
    if (y > 250) {
      doc.addPage();
      y = 20;
      // Repeat header on new page
      doc.setFont("helvetica", "bold");
      doc.text("SL No", 20, y);
      doc.text("Date", 35, y);
      doc.text("Vehicle No", 55, y);
      doc.text("Distribution Name", 90, y);
      doc.text("Destination", 140, y);
      doc.text("Total Amount", 180, y);
      doc.setFont("helvetica", "normal");
      y += 8;
    }
  });

  // Footer with total
  doc.setFont("helvetica", "bold");
  doc.text(`Total Amount: ${totalAmount}`, 150, y + 10);
  doc.text(`In Words: ${numberToWords(totalAmount)}`, 20, y + 20);

  // Page numbering
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Page ${i} of ${pageCount}`, 180, 287);
  }

  doc.save("hatim_carrying_bill.pdf");
};

  if (loading) return <p className="text-center mt-16">Loading Hatim...</p>;
  return (
    <div className=" md:p-2">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-2 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <HiCurrencyBangladeshi className="text-[#11375B] text-2xl" />
            Billing Hatim Pubail
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
        <div className="flex gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <button
              onClick={handleDownloadPDF}
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
                <th className="border border-gray-700 p-1">SL.</th>
                <th className="border border-gray-700 p-1">Date</th>
                <th className="border border-gray-700 p-1">VehicleNo.</th>
                {/* <th className="border border-gray-700 p-1">Goods</th> */}
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
                  {/* <td className="border border-gray-700 p-1">{dt.goods}</td> */}
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
                  colSpan={5}
                  className="border border-black px-2 py-1 text-right"
                >
                  Grand Total = {totalRent}
                </td>
                <td className="border border-black px-2 py-1"></td>
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

export default HatimPubail;


