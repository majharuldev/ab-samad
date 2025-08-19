
import { Toaster } from "react-hot-toast";
import { MdOutlineArrowDropDown } from "react-icons/md";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaFilter } from "react-icons/fa6";
import { IoIosRemoveCircle } from "react-icons/io";

const OfficeLedger = () => {
  const [branch, setBranch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [officeList, setOfficeList] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);

  // Fetch branch data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/branch/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setBranch(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching branch data:", error);
        setLoading(false);
      });
  }, []);

  // Fetch office list with opening balances
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/office/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          const data = response.data.data;
          setOfficeList(data);
          
          // Set default branch if available
          if (data.length > 0 && !selectedBranch) {
            setSelectedBranch(data[0].branch_name);
            setOpeningBalance(parseFloat(data[0].opening_balance) || 0);
            setCurrentBalance(parseFloat(data[0].opening_balance) || 0);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching office list:", error);
      });
  }, []);

  // Update opening balance when branch changes
  useEffect(() => {
    if (selectedBranch && officeList.length > 0) {
      const selectedOffice = officeList.find(office => office.branch_name === selectedBranch);
      if (selectedOffice) {
        const balance = parseFloat(selectedOffice.opening_balance) || 0;
        setOpeningBalance(balance);
        setCurrentBalance(balance);
      }
    }
  }, [selectedBranch, officeList]);

  if (loading) return <p className="text-center mt-16">Loading data...</p>;

  // Filtered data based on selected branch and date range
  const filteredBranch = branch.filter((item) => {
    const isBranchMatch = selectedBranch
      ? item.branch_name === selectedBranch
      : true;

    if (!isBranchMatch) return false;

    const itemDate = new Date(item.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      return itemDate >= start && itemDate <= end;
    } else if (start) {
      return itemDate >= start;
    } else if (end) {
      return itemDate <= end;
    }

    return true;
  });

  // Calculate running balance
  const calculateBalance = () => {
    let balance = openingBalance;
    return filteredBranch.map(item => {
      const cashIn = parseFloat(item.cash_in) || 0;
      const cashOut = parseFloat(item.cash_out) || 0;
      balance += cashIn - cashOut;
      return {
        ...item,
        runningBalance: balance
      };
    });
  };

  const branchDataWithBalance = calculateBalance();

  // Closing balance
const closingBalance =
  branchDataWithBalance.length > 0
    ? branchDataWithBalance[branchDataWithBalance.length - 1].runningBalance
    : openingBalance;

  return (
    <main className=" md:p-2 overflow-hidden">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#11375B] capitalize flex items-center gap-3">
            OFFICE LEDGER: {selectedBranch}
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

        {/* Export and Branch Selection */}
        <div className="md:flex items-center justify-between mb-4">
          <div className="flex gap-1 md:gap-3 flex-wrap">
            <button className="py-2 px-5 bg-gray-200 text-primary font-semibold rounded-md hover:bg-primary hover:text-white transition-all cursor-pointer">
              Excel
            </button>
            <button className="py-2 px-5 bg-gray-200 text-primary font-semibold rounded-md hover:bg-primary hover:text-white transition-all cursor-pointer">
              PDF
            </button>
            <button className="py-2 px-5 bg-gray-200 text-primary font-semibold rounded-md hover:bg-primary hover:text-white transition-all cursor-pointer">
              Print
            </button>
          </div>
          <div className="mt-3 md:mt-0">
            <div className="relative w-full">
              <label className="text-primary text-sm font-semibold">
                Select Branch Ledger
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
              >
                {officeList.map((office, i) => (
                  <option key={i} value={office.branch_name}>
                    {office.branch_name} (Balance: {office.opening_balance})
                  </option>
                ))}
              </select>
              <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
            </div>
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

        {/* Table */}
        <div className="w-full mt-5 overflow-x-auto border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="text-black capitalize font-bold">
               <tr className="bg-gray-100 font-bold text-black">
                <td colSpan="8" className="text-right border border-gray-700 px-2 py-2">
                  Closing Balance:
                </td>
                <td className="border border-gray-700 px-2 py-2">
                  {closingBalance < 0
    ? `${Math.abs(closingBalance)}`
    : closingBalance}
                </td>
                <td className="border border-gray-700 px-2 py-2"></td>
              </tr>
              <tr>
                <th className="border border-gray-700 px-2 py-1">SL</th>
                <th className="border border-gray-700 px-2 py-1">Date</th>
                <th className="border border-gray-700 px-2 py-1">Particulars</th>
                <th className="border border-gray-700 px-2 py-1">Mode</th>
                <th className="border border-gray-700 px-2 py-1">Destination</th>
                <th className="border border-gray-700 px-2 py-1">Due</th>
                <th className="border border-gray-700 px-2 py-1">CashIn</th>
                <th className="border border-gray-700 px-2 py-1">CashOut</th>
                <th className="border border-gray-700 py-1 text-center">
                  <p className="border-b">Opening Balance: {openingBalance}</p>
                  <p>Current Balance</p>
                </th>
                <th className="border border-gray-700 px-2 py-1">Ref</th>
              </tr>
            </thead>
            <tbody className="text-black font-semibold">
              {branchDataWithBalance.map((dt, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-all">
                  <td className="border border-gray-700 px-2 py-1 font-bold">
                    {index + 1}.
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.date}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.remarks || "--"}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.mode || "--"}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.unload_point || "--"}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.due || "--"}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.cash_in || "--"}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.cash_out || "--"}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.runningBalance < 0
                      ? `${Math.abs(dt.runningBalance)}`
                      : dt.runningBalance}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.ref || "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default OfficeLedger;