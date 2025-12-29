import { useState, useEffect, useRef } from "react"
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa6"
import { HiCurrencyBangladeshi } from "react-icons/hi2"
import toast, { Toaster } from "react-hot-toast"
import * as XLSX from "xlsx"
import saveAs from "file-saver"
import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"
import Pagination from "../../components/Shared/Pagination"
import CreatableSelect from "react-select/creatable"
import { IoIosRemoveCircle } from "react-icons/io"
import api from "../../../utils/axiosConfig"
import { tableFormatDate } from "../../hooks/formatDate"
import DatePicker from "react-datepicker"
import { useTranslation } from "react-i18next"

pdfMake.vfs = pdfFonts.vfs

const Bill = () => {
  const {t} = useTranslation();
  const [yamaha, setYamaha] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilter, setShowFilter] = useState(false)
  const [selectedRows, setSelectedRows] = useState({})
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // New states for customer search
  const [customerList, setCustomerList] = useState([])
  const [customerSearchTerm, setCustomerSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false)
  const customerSearchRef = useRef(null)

  // fetch all trip data from server
  useEffect(() => {
    api.get(`/trip`)
      .then((res) => {
        setYamaha(res.data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching trip data:", error)
        setLoading(false)
      })
  }, [])

  // Fetch customer list for the search dropdown
  useEffect(() => {
    api.get(`/customer`)
      .then((res) => {
        setCustomerList(res.data)
      })
      .catch((error) => console.error("Error fetching customer list:", error))
  }, [])

  const customerOptions = customerList.map((customer) => ({
    value: customer.customer_name,
    label: customer.customer_name,
  }))

  // Handle click outside the customer search input to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerSearchRef.current && !customerSearchRef.current.contains(event.target)) {
        setShowCustomerSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // excel
  const exportToExcel = () => {
    const selectedData = yamaha.filter((trip) => selectedRows[trip.id])
    if (!selectedData.length) {
      return toast.error("Please select at least one row.")
    }
    const excelData = selectedData.map((dt, idx) => ({
      SL: idx + 1,
      Date: dt.date,
      Customer: dt.customer,
      Vehicle: dt.vehicle_no,
      Chalan: dt.challan,
      From: dt.load_point,
      Destination: dt.unload_point,
      Rent: dt.total_rent,
      Demurrage: dt.d_total,
      Total: (Number.parseFloat(dt.total_rent) || 0) + (Number.parseFloat(dt.d_total) || 0),
    }))
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bill")
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "Bill.xlsx")
  }

  // pdf
  const exportToPDF = () => {
    const selectedData = yamaha.filter((trip) => selectedRows[trip.id])
    if (!selectedData.length) {
      return toast.error("Please select at least one row.")
    }
    const docDefinition = {
      content: [
        { text: "Bill", style: "header" },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "*", "*", "*", "*", "*", "*", "*", "*"],
            body: [
              ["SL", "Date", "Customer", "Vehicle", "From", "Destination", "Rent", "Demurrage", "Total"],
              ...selectedData.map((dt, idx) => [
                idx + 1,
                dt.date,
                dt.customer,
                dt.vehicle_no,
                dt.load_point,
                dt.unload_point,
                dt.total_rent,
                dt.d_total,
                (Number.parseFloat(dt.total_rent) || 0) + (Number.parseFloat(dt.d_total) || 0),
              ]),
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          marginBottom: 10,
        },
      },
    }
    pdfMake.createPdf(docDefinition).download("Bill.pdf")
  }

  // Filtered customer suggestions based on search term
  const filteredCustomerSuggestions = customerList.filter((customer) =>
    (customer.customer_name ?? "").toLowerCase().includes(customerSearchTerm.toLowerCase()),
  )

  // Handle customer selection from suggestions
  const handleCustomerSelect = (customerName) => {
    setSelectedCustomer(customerName)
    setCustomerSearchTerm(customerName)
    setShowCustomerSuggestions(false)
    setCurrentPage(1)
  }

  // number converts function
const numberToWords = (num) => {
  if (!num || isNaN(num)) return t("Zero Taka only")
  
  const numInt = Math.floor(num)
  
  // Helper function to check if translation exists and is not the same as key
  const getTranslation = (key) => {
    const translation = t(key)
    // If translation is same as key, it means translation doesn't exist
    return translation === key ? null : translation
  }

  // Special handling for 21-99 numbers - only use if translation exists
  const specialNumbers = {}
  for (let i = 21; i <= 99; i++) {
    const key = i.toString()
    const translation = getTranslation(key)
    if (translation) {
      specialNumbers[i] = translation
    }
  }

  const ones = ["", t("One"), t("Two"), t("Three"), t("Four"), t("Five"), 
                t("Six"), t("Seven"), t("Eight"), t("Nine")]
  
  const teens = [t("Ten"), t("Eleven"), t("Twelve"), t("Thirteen"), t("Fourteen"), 
                 t("Fifteen"), t("Sixteen"), t("Seventeen"), t("Eighteen"), t("Nineteen")]
  
  const tens = ["", "", t("Twenty"), t("Thirty"), t("Forty"), t("Fifty"), 
                t("Sixty"), t("Seventy"), t("Eighty"), t("Ninety")]

  const convertTwoDigit = (n) => {
    if (n === 0) return ""
    
    // Check for special number (21-99) only if translation exists
    if (specialNumbers[n]) {
      return specialNumbers[n]
    }
    
    if (n < 10) {
      return ones[n]
    } else if (n < 20) {
      return teens[n - 10]
    } else {
      const tenDigit = Math.floor(n / 10)
      const oneDigit = n % 10
      if (oneDigit === 0) {
        return tens[tenDigit]
      } else {
        // Fallback: if tens[tenDigit] or ones[oneDigit] is same as key, use default
        const tenWord = tens[tenDigit] === `t(${tenDigit})` ? 
                       ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"][tenDigit] : 
                       tens[tenDigit]
        
        const oneWord = ones[oneDigit] === `t(${oneDigit})` ? 
                       ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"][oneDigit] : 
                       ones[oneDigit]
        
        return `${tenWord} ${oneWord}`
      }
    }
  }

  const convertThreeDigit = (n) => {
    if (n === 0) return ""
    
    let result = ""
    
    // Handle hundreds
    if (n >= 100) {
      const hundredDigit = Math.floor(n / 100)
      const hundredWord = ones[hundredDigit] === `t(${hundredDigit})` ? 
                         ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"][hundredDigit] : 
                         ones[hundredDigit]
      result += hundredWord + " " + t("Hundred")
      n %= 100
      if (n > 0) {
        result += " "
      }
    }
    
    // Handle remaining two digits
    if (n > 0) {
      result += convertTwoDigit(n)
    }
    
    return result
  }

  if (numInt === 0) return t("Zero") + " " + t("Taka only")
  
  let result = ""
  let remaining = numInt
  
  // Crore (কোটি) - 10000000
  if (remaining >= 10000000) {
    const crorePart = Math.floor(remaining / 10000000)
    result += convertThreeDigit(crorePart) + " " + t("Crore") + " "
    remaining %= 10000000
  }
  
  // Lakh (লাখ) - 100000
  if (remaining >= 100000) {
    const lakhPart = Math.floor(remaining / 100000)
    result += convertTwoDigit(lakhPart) + " " + t("Lakh") + " "
    remaining %= 100000
  }
  
  // Thousand (হাজার) - 1000
  if (remaining >= 1000) {
    const thousandPart = Math.floor(remaining / 1000)
    result += convertTwoDigit(thousandPart) + " " + t("Thousand") + " "
    remaining %= 1000
  }
  
  // Rest (1-999)
  if (remaining > 0) {
    result += convertThreeDigit(remaining) + " "
  }

  return result.trim() + " " + t("Taka only")
}

// check trip box
  const handleCheckBox = (tripId) => {
    setSelectedRows((prev) => ({
      ...prev,
      [tripId]: !prev[tripId],
    }))
  }

  // Fixed calculation functions
  const calculateTotals = (trips) => {
    const totalRent = trips.reduce((sum, dt) => sum + (Number.parseFloat(dt.total_rent) || 0), 0)
    const totalDemurrage = trips.reduce((sum, dt) => sum + (Number.parseFloat(dt.d_total) || 0), 0)
    const grandTotal = totalRent + totalDemurrage
    return { totalRent, totalDemurrage, grandTotal }
  }

  // Date filter
  const filteredTrips = yamaha.filter((trip) => {
    const tripDate = new Date(trip.date).setHours(0, 0, 0, 0)
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null
    const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null
    const matchDate =
      start && end ? tripDate >= start && tripDate <= end : start ? tripDate === start : end ? tripDate === end : true

    const matchCustomer =
      !selectedCustomer || (trip.customer ?? "").toLowerCase().includes(selectedCustomer.toLowerCase())

    return matchDate && matchCustomer
  })

  // Get selected data based on selectedRows for total calculation
  const selectedTripsForCalculation = filteredTrips.filter((trip) => selectedRows[trip.id])
  const tripsToCalculate = selectedTripsForCalculation.length > 0 ? selectedTripsForCalculation : filteredTrips
  const { totalRent, totalDemurrage, grandTotal } = calculateTotals(tripsToCalculate)

  // print
  const handlePrint = () => {
    const selectedData = filteredTrips.filter((trip) => selectedRows[trip.id])
    if (!selectedData.length) {
      return toast.error("Please select at least one row.")
    }

    // Get customer name from first selected trip
    const customerName = selectedData[0]?.customer || "Customer Name"
    const customerAddress = selectedData[0]?.c_address || "Dhaka"

    // Calculate totals for selected data
    const {
      totalRent: printTotalRent,
      totalDemurrage: printTotalDemurrage,
      grandTotal: printGrandTotal,
    } = calculateTotals(selectedData)

    // Generate bill number based on current date
    const currentDate = new Date()
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentMonth = monthNames[currentDate.getMonth()]
    const currentYear = currentDate.getFullYear()
    const billNumber = `${currentMonth}-${currentYear} Bill Summary`

    // Convert total to words
    const totalInWords = numberToWords(printGrandTotal)

    const newWindow = window.open("", "_blank")
    const html = `
      <html>
        <head>
          <style>
            @page { margin: 0; }
            body {
              margin: 1cm;
              font-family: Arial, sans-serif;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .company-name-bangla {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .company-name-english {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .contact-info {
              font-size: 10px;
              line-height: 1.4;
            }
            .bill-info {
              display: flex;
              justify-content: space-between;
              margin: 20px 0;
            }
            .to-section {
              line-height: 1.6;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              font-size: 11px;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #000;
              padding: 4px;
              text-align: left;
            }
            th {
              background: #f0f0f0;
              font-weight: bold;
              text-align: center;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            tfoot td {
              font-weight: bold;
              background-color: #f9f9f9;
            }
            .signature-section {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
            }
          </style>
        </head>
        <body>
        <div class="bill-info" style="margin-top:3in;">
            <div class="to-section">
              <div>${t("To")}</div>
              <div><strong>${customerName}</strong></div>
              <div>${customerAddress}</div>
              <div><strong>${t("Sub")}: ${billNumber}</strong></div>
            </div>
            <div>
              <div><strong>${t("Date")}: ${new Date().toLocaleDateString("bn-BD")}</strong></div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>${t("TripNo")}</th>
                <th>${t("Date")}</th>
                <th>${t("Driver")}</th>
                <th>${t("Customer")}</th>
                <th>${t("Truck No")}</th>
                <th>${t("Load")}/${t("Unload")}</th>
                <th>${t("Rent")}</th>
                <th>${t("Demurrage")}</th>
                <th>${t("Total")}</th>
              </tr>
            </thead>
            <tbody>
              ${selectedData
        .map(
          (dt, i) => `
                <tr>
                  <td class="text-center">${dt.id}</td>
                  <td class="text-center">${tableFormatDate(dt.start_date)}</td>
                  <td class="text-center">${dt.driver_name || "N/A"}</td>
                  <td class="text-center">${dt.customer || "N/A"}</td>
                  <td class="text-center">${dt.vehicle_no || "N/A"}</td>
                  <td>${dt.load_point || "N/A"} to ${dt.unload_point || "N/A"}</td>
                  <td class="text-right">${dt.total_rent || 0}</td>
                  <td class="text-right">${dt.d_total || 0}</td>
                  <td class="text-right">${(Number.parseFloat(dt.total_rent) || 0) + (Number.parseFloat(dt.d_total) || 0)}</td>
                </tr>`,
        )
        .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="text-right"><strong>${t("Total")}</strong></td>
                <td class="text-right"><strong>${printTotalRent}</strong></td>
                <td class="text-right"><strong>${printTotalDemurrage}</strong></td>
                <td class="text-right"><strong>${printGrandTotal}</strong></td>
              </tr>
            </tfoot>
          </table>

          <div style="margin-top: 20px;">
            <strong>In words: ${totalInWords}</strong>
          </div>
        </body>
      </html>`

    newWindow.document.write(html)
    newWindow.document.close()
    newWindow.focus()
    newWindow.print()
  }

  // submit func
  const handleSubmit = async () => {
    const selectedData = filteredTrips.filter(
      (dt, i) => selectedRows[dt.id] && dt.status === "Pending"
    );
    if (!selectedData.length) {
      return toast.error("Please select at least one row for Not submitted.", {
        position: "top-right",
      });
    }
    try {
      const loadingToast = toast.loading("Submitting selected rows...")

      // Create array of promises for all updates
      const updatePromises = selectedData.map((dt) =>
        api.put(`/trip/${dt.id}`, {
          status: "Submitted",
          start_date: dt.start_date,
          end_date: dt.end_date,
          customer: dt.customer,
          branch_name: dt.branch_name,
          load_point: dt.load_point,
          additional_load: dt.additional_load,
          unload_point: dt.unload_point,
          transport_type: dt.transport_type,
          trip_type: dt.trip_type,
          trip_id: dt.trip_id,
          sms_sent: dt.sms_sent,
          vehicle_no: dt.vehicle_no,
          driver_name: dt.driver_name,
          vehicle_category: dt.vehicle_category,
          vehicle_size: dt.vehicle_size,
          product_details: dt.product_details,
          driver_mobile: dt.driver_mobile,
          challan: dt.challan,
          driver_adv: dt.driver_adv,
          remarks: dt.remarks,
          food_cost: dt.food_cost,
          total_exp: dt.total_exp,
          total_rent: dt.total_rent,
          vendor_rent: dt.vendor_rent,
          advance: dt.advance,
          due_amount: dt.due_amount,
          parking_cost: dt.parking_cost,
          night_guard: dt.night_guard,
          toll_cost: dt.toll_cost,
          feri_cost: dt.feri_cost,
          police_cost: dt.police_cost,
          others_cost: dt.others_cost,
          chada: dt.chada,
          labor: dt.labor,
          vendor_name: dt.vendor_name,
          fuel_cost: dt.fuel_cost,
          challan_cost: dt.challan_cost,
          d_day: dt.d_day,
          d_amount: dt.d_amount,
          d_total: dt.d_total,
        })
      );

      // Wait for all updates to complete
      await Promise.all(updatePromises)

      // Update local state immediately
      setYamaha((prev) =>
        prev.map((trip) => (selectedData.some((dt) => dt.id === trip.id) ? { ...trip, status: "Submitted" } : trip)),
      )

      toast.success("Successfully submitted!", { id: loadingToast })
      setSelectedRows({})
    } catch (error) {
      console.error("Submission error:", error)
      toast.error("Submission failed. Check console for details.")
    }
  }

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredTrips.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage)

  if (loading) return <p className="text-center mt-16">{t("Loading")}...</p>

  return (
    <div className="p-2">
      <Toaster />
      <div className="w-[24rem] md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-6 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-gray-800 flex items-center gap-3">
            <HiCurrencyBangladeshi className="text-gray-800 text-2xl" />
            {t("Billing")}
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> {t("Filter")}
            </button>
          </div>
        </div>

        {/* export and search */}
        <div className="md:flex justify-between items-center">
          <div className="flex flex-wrap md:flex-row gap-1 md:gap-3 text-gray-700 font-medium rounded-md">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 py-1 px-5 hover:bg-primary bg-white shadow  hover:text-white rounded  transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel className="" />
              {t("Excel")}
            </button>
            {/* <button
              onClick={exportToPDF}
              className="flex items-center gap-2 py-1 px-5 hover:bg-primary bg-white shadow  hover:text-white rounded  transition-all duration-300 cursor-pointer"
            >
              <FaFilePdf className="" />
              PDF
            </button> */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 py-1 px-5 hover:bg-primary bg-white shadow  hover:text-white rounded transition-all duration-300 cursor-pointer"
            >
              <FaPrint className="" />
              {t("Print")}
            </button>
          </div>


        </div>

        {showFilter && (
          <div className="md:flex items-center gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
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
            <div className=" w-full">
              <CreatableSelect
                isClearable
                placeholder="Select or create customer..."
                value={selectedCustomer ? { value: selectedCustomer, label: selectedCustomer } : null}
                options={customerOptions}
                onChange={(newValue) => {
                  setSelectedCustomer(newValue ? newValue.value : "")
                  setCurrentPage(1)
                }}
                onCreateOption={(inputValue) => {
                  const newCustomer = { value: inputValue, label: inputValue }
                  setCustomerList((prev) => [...prev, { customer_name: inputValue }])
                  setSelectedCustomer(inputValue)
                }}
                className="text-sm"
              />
            </div>
            <div className="w-lg">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSelectedCustomer("");
                  setShowFilter(false);
                }}
                className="bg-primary text-white px-2 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> {t("Clear")}
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-900">
            <thead className="capitalize text-sm">
              <tr>
                <th className="border border-gray-700 px-2 py-1">{t("TripNo")}</th>
                <th className="border border-gray-700 px-2 py-1">{t("Date")}</th>
                <th className="border border-gray-700 px-2 py-1">{t("Driver")}</th>
                <th className="border border-gray-700 px-2 py-1">{t("Customer")}</th>
                <th className="border border-gray-700 px-2 py-1">{t("Truck No")}</th>
                <th className="border border-gray-700 px-2 py-1">{t("Load Point")}</th>
                <th className="border border-gray-700 px-2 py-1">{t("Unload Point")}</th>
                <th className="border border-gray-700 px-2 py-1">{t("Total Rent")}</th>
                <th className="border border-gray-700 px-2 py-1">{t("Demurrage")}</th>
                <th className="border border-gray-700 px-2 py-1">{t("Bill Amount")}</th>
                <th className="border border-gray-700 px-2 py-1">{t("Bill")} {t("Status")}</th>
              </tr>
            </thead>
            <tbody className="font-semibold">
              {currentItems.map((dt, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-all">
                  <td className="border border-gray-700 p-1 font-bold">{dt.id}.</td>
                  <td className="border border-gray-700 p-1">{tableFormatDate(dt.start_date)}</td>
                  <td className="border border-gray-700 p-1">{dt.driver_name}</td>
                  <td className="border border-gray-700 p-1">{dt.customer}</td>
                  <td className="border border-gray-700 p-1">{dt.vehicle_no}</td>
                  <td className="border border-gray-700 p-1">{dt.load_point}</td>
                  <td className="border border-gray-700 p-1">{dt.unload_point}</td>
                  <td className="border border-gray-700 p-1">{dt.total_rent}</td>
                  <td className="border border-gray-700 p-1">{dt.d_total || 0}</td>
                  <td className="border border-gray-700 p-1">
                    {(Number.parseFloat(dt.total_rent) || 0) + (Number.parseFloat(dt.d_total) || 0)}
                  </td>
                  <td className="border border-gray-700 p-1 text-center ">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={!!selectedRows[dt.id]}
                        onChange={() => handleCheckBox(dt.id)}
                        disabled={false}
                      />
                      {dt.status === "Pending" && (
                        <span className=" inline-block px-2  text-xs text-yellow-600 rounded">
                          {t("Not Submitted")}
                        </span>
                      )}
                      {dt.status === "Submitted" && (
                        <span className=" inline-block px-2  text-xs text-green-700 rounded">
                          {t("Submitted")}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td colSpan={7} className="border border-black px-2 py-1 text-right">
                  {t("Total")}
                </td>
                <td className="border border-black px-2 py-1">{totalRent}</td>
                <td className="border border-black px-2 py-1">{totalDemurrage}</td>
                <td className="border border-black px-2 py-1">{grandTotal}</td>
                <td className="border border-black px-2 py-1"></td>
              </tr>
              <tr className="font-bold">
                <td colSpan={11} className="border border-black px-2 py-1">
                  {t("Total")} {t("Amount")} {t("In Words")}: <span className="font-medium">{numberToWords(grandTotal)}</span>
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Pagination */}
          {filteredTrips.length > 0 && totalPages >= 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              maxVisible={8}
            />
          )}

          <div className="flex justify-end mt-5">
            <button
              className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 cursor-pointer"
              onClick={handleSubmit}
            >
              {t("Save Change")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Bill;