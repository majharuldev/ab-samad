import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { FaEye, FaPen, FaPlus, FaUserSecret } from "react-icons/fa6";
import { IoCloseOutline, IoCloseSharp } from "react-icons/io5";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

const AttendanceList = () => {
  const [employee, setEmployee] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/employee/list`)
      .then((response) => response.json())
      .then((data) => setEmployee(data.data))
      .catch((error) => console.error("Error fetching employee data:", error));

    fetch(`${import.meta.env.VITE_BASE_URL}/api/attendance/list`)
      .then((response) => response.json())
      .then((data) => setAttendanceList(data.data))
      .catch((error) =>
        console.error("Error fetching attendance data:", error)
      );
  }, []);

  const handleViewClick = (id) => {
    setSelectedEmployeeId(id === selectedEmployeeId ? null : id);
  };

  const selectedEmployee = employee.find(
    (e) => String(e.id) === String(selectedEmployeeId)
  );

  const attendanceData = attendanceList.filter(
    (att) => att.employee_id === String(selectedEmployeeId)
  );

  const totalPresent = attendanceData.filter((a) => a.present === "1").length;
  const totalAbsent = attendanceData.filter((a) => a.absent === "1").length;

  const printTable = () => {
    const printContent = document.getElementById("print-section").innerHTML;
    const newWindow = window.open("", "", "width=900,height=600");
    newWindow.document.write(`
      <html>
        <head>
          <title>Attendance Report</title>
          <style>
            @media print {
              table, th, td {
                border: 1px solid black !important;
                border-collapse: collapse !important;
              }
              th, td {
                padding: 6px;
                text-align: left;
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
  };

  const exportPDF = () => {
    if (!selectedEmployee || attendanceData.length === 0) {
      alert("No data to export.");
      return;
    }

    const doc = new jsPDF("landscape");
    doc.setFontSize(16);
    doc.text("Attendance Report", 14, 20);

    doc.setFontSize(12);
    doc.text(`Employee: ${selectedEmployee.full_name}`, 14, 30);

    const rows = attendanceData.map((att, index) => [
      index + 1,
      att.date,
      att.present === "1" ? "1" : "-",
      att.absent === "1" ? "1" : "-",
    ]);

    // Add total row at the end
    rows.push([
      "", // SL
      "Total",
      totalPresent.toString().padStart(2, "0"),
      totalAbsent.toString().padStart(2, "0"),
    ]);

    autoTable(doc, {
      head: [["SL", "Date", "Present", "Absent"]],
      body: rows,
      startY: 40,
      theme: "grid",
      styles: { halign: "center" },

      // No background fill color in header
      headStyles: {
        fillColor: "#CDCDCD", // disables background color
        textColor: 0,
        fontStyle: "bold",
      },

      didParseCell: (data) => {
        if (data.row.index === rows.length - 1) {
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    doc.save("attendance_report.pdf");
  };

  return (
    <div className=" md:p-2">
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-primary flex items-center gap-3">
            <FaUserSecret className="text-primary text-2xl" />
            Attendance List
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/HR/HRM/Attendance/AttendanceForm">
              <button className="bg-gradient-to-r from-primary to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Attendance
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-primary text-white capitalize text-sm">
              <tr>
                <th className="p-2">SL.</th>
                <th className="p-2">Name</th>
                <th className="p-2">Join Date</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody className="text-primary">
              {employee.map((emp, index) => (
                <tr
                  key={emp.id}
                  className="hover:bg-gray-50 transition-all border border-gray-200"
                >
                  <td className="p-2 font-bold">{index + 1}</td>
                  <td className="p-2">{emp.full_name}</td>
                  <td className="p-2">{emp.join_date}</td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <Link>
                        <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                          <FaPen className="text-[12px]" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleViewClick(emp.id)}
                        className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaEye className="text-[12px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedEmployeeId && (
        <div className="fixed inset-0 bg-[#00000065] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 max-w-3xl w-full relative overflow-x-auto shadow-2xl border border-gray-300">
            <button
              onClick={() => setSelectedEmployeeId(null)}
              className="absolute top-2 right-2 text-white bg-red-500 hover:text-white hover:bg-primary rounded-md w-5 h-5 flex items-center justify-center transition-all cursor-pointer"
            >
              <IoCloseSharp />
            </button>

            <div className="md:flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-primary">
                Employee Name: {selectedEmployee?.full_name || "N/A"}
              </h2>
              <div className="flex gap-1 md:gap-3 text-primary font-semibold rounded-md pr-5">
                <button
                  onClick={exportPDF}
                  className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
                >
                  PDF
                </button>
                <button
                  onClick={printTable}
                  className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
                >
                  Print
                </button>
              </div>
            </div>

            <div id="print-section">
              <div className="mb-4 text-center hidden print:block">
                <h2 className="text-xl font-bold">Attendance Report</h2>
                <p className="text-md">
                  Employee: {selectedEmployee?.full_name || "N/A"}
                </p>
              </div>
              <table className="min-w-full text-sm text-left text-gray-900 mt-2">
                <thead className="capitalize text-sm">
                  <tr>
                    <th className="border border-gray-700 px-2 py-1">SL.</th>
                    <th className="border border-gray-700 px-2 py-1">Date</th>
                    {/* <th className="border border-gray-700 px-2 py-1">
                      Employee Name
                    </th> */}
                    <th className="border border-gray-700 px-2 py-1 text-center">
                      Present
                    </th>
                    <th className="border border-gray-700 px-2 py-1 text-center">
                      Absent
                    </th>
                  </tr>
                </thead>
                <tbody className="font-semibold">
                  {attendanceData.map((att, index) => (
                    <tr
                      key={att.id}
                      className="hover:bg-gray-50 transition-all"
                    >
                      <td className="border border-gray-700 p-1 font-bold">
                        {index + 1}.
                      </td>
                      <td className="border border-gray-700 p-1">{att.date}</td>
                      {/* <td className="border border-gray-700 p-1">
                        {selectedEmployee?.full_name || "N/A"}
                      </td> */}
                      <td className="border border-gray-700 p-1 text-center">
                        {att.present === "1" ? (
                          <span className="text-green-600">
                            <FaCheck />
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="border border-gray-700 p-1 text-center">
                        {att.absent === "1" ? (
                          <span className="text-red-600">
                            <IoCloseOutline />
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold">
                    <td
                      colSpan={2}
                      className="border border-black px-2 py-1 text-right"
                    >
                      Total
                    </td>
                    <td className="border border-black px-2 py-1 text-center">
                      {totalPresent.toString().padStart(2, "0")}
                    </td>
                    <td className="border border-black px-2 py-1 text-center">
                      {totalAbsent.toString().padStart(2, "0")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceList;
