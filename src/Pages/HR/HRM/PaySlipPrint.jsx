
// Helper: convert number to words (English, supports up to millions)
const numberToWords = (num) => {
  if (num === null || num === undefined) return "";
  if (num === 0) return "zero";
  const a = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const g = ["", "thousand", "million", "billion"];

  const makeGroup = (n) => {
    let str = "";
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + " hundred";
      n = n % 100;
      if (n) str += " ";
    }
    if (n >= 20) {
      str += b[Math.floor(n / 10)];
      if (n % 10) str += " " + a[n % 10];
    } else if (n > 0) {
      str += a[n];
    }
    return str;
  };

  let i = 0;
  let words = [];
  while (num > 0) {
    const chunk = num % 1000;
    if (chunk) {
      let chunkWords = makeGroup(chunk);
      if (g[i]) chunkWords += " " + g[i];
      words.unshift(chunkWords.trim());
    }
    num = Math.floor(num / 1000);
    i++;
  }
  return words.join(" ");
};

export default function SalaryPaySlip({ payslipData }, ref) {
  // default fallback data if nothing provided
  const data = payslipData || {
    company: {
      name: "M/S AJ Enterprise",
      addressLine1: "Razzak Plaza, 11th Floor, Room No: J-12",
      addressLine2: "2 Shahid Tajuddin Sarani, Moghbazar, Dhaka-1217, Bangladesh",
    },
    employeeId: "AJBD-E10092018",
    employeeName: "Md. Jubel",
    designation: "Sr. Executive (Ops)",
    monthYear: "1-Nov-2023",
    earnings: [
      { label: "Basic", amount: 5500 },
      { label: "House Rent", amount: 1500 },
      { label: "Medical", amount: 1500 },
      { label: "Conveyance", amount: 500 },
      { label: "Allowance", amount: 0 },
      { label: "Bonus", amount: 0 },
    ],
    deductions: [
      { label: "Advance", amount: 0 },
      { label: "Loan", amount: 1000 },
      { label: "Tax", amount: 0 },
    ],
    paidBy: "Cash", // or "Cheque"
  };

  const totalEarnings = data.earnings.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalDeductions = data.deductions.reduce((s, d) => s + Number(d.amount || 0), 0);
  const netSalary = totalEarnings - totalDeductions;

  return (
    <div ref={ref} className="max-w-3xl mx-auto p-6">
      <div className="border-2 border-gray-300 p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 rounded">
              {/* simple logo mark */}
              <svg viewBox="0 0 100 100" className="w-10 h-10 text-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 80 L40 20 L70 80 Z" fill="white" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">{data.company.name}</h2>
              <div className="text-xs">{data.company.addressLine1}</div>
              <div className="text-xs">{data.company.addressLine2}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold">Salary Pay Slip</div>
          </div>
        </div>

        {/* main table area */}
        <div className="border-t border-b border-gray-300">
          <div className="grid grid-cols-3 gap-x-4 text-sm">
            <div className="p-3 border-r border-gray-200">
              <div className="font-medium">Employee ID</div>
              <div>{data.employeeId}</div>
            </div>
            <div className="p-3 border-r border-gray-200">
              <div className="font-medium">Employee Name</div>
              <div>{data.employeeName}</div>
            </div>
            <div className="p-3">
              <div className="font-medium">Month/Year</div>
              <div>{data.monthYear}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-x-4 text-sm border-t border-gray-200">
            <div className="p-3 border-r border-gray-200">
              <div className="font-medium">Designation</div>
              <div>{data.designation}</div>
            </div>
            <div className="p-3 border-r border-gray-200"></div>
            <div className="p-3"></div>
          </div>
        </div>

        {/* Earnings / Deductions table mimic */}
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Earnings */}
            <div className="border border-gray-300">
              <div className="bg-gray-100 px-3 py-2 font-semibold">Earnings</div>
              <div className="p-3">
                <table className="w-full text-sm table-fixed">
                  <tbody>
                    {data.earnings.map((e, idx) => (
                      <tr key={idx} className="odd:bg-white even:bg-gray-50">
                        <td className="py-2">{e.label}</td>
                        <td className="py-2 text-right font-medium">{Number(e.amount).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="border-t">
                      <td className="py-2 font-semibold">Total Addition</td>
                      <td className="py-2 text-right font-semibold">{totalEarnings.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-gray-300">
              <div className="bg-gray-100 px-3 py-2 font-semibold">Deductions</div>
              <div className="p-3">
                <table className="w-full text-sm table-fixed">
                  <tbody>
                    {data.deductions.map((d, idx) => (
                      <tr key={idx} className="odd:bg-white even:bg-gray-50">
                        <td className="py-2">{d.label}</td>
                        <td className="py-2 text-right font-medium">{Number(d.amount).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="border-t">
                      <td className="py-2 font-semibold">Total Deductions</td>
                      <td className="py-2 text-right font-semibold">{totalDeductions.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Net salary row */}
          <div className="mt-4 border border-gray-300">
            <div className="p-3 grid grid-cols-3 items-center">
              <div className="col-span-2">
                <div className="text-sm font-medium">Net Salary</div>
                <div className="text-lg font-semibold">{netSalary.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">Salary in Words:</div>
                <div className="text-xs italic">{numberToWords(netSalary)} only</div>
              </div>
            </div>
          </div>

          {/* Paid by and signatures */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center space-x-3">
              <label className="inline-flex items-center">
                <input type="checkbox" checked={data.paidBy === "Cash"} readOnly className="mr-2" />
                Cash
              </label>
              <label className="inline-flex items-center">
                <input type="checkbox" checked={data.paidBy === "Cheque"} readOnly className="mr-2" />
                Cheque
              </label>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="h-6 border-b w-40"></div>
                <div className="text-xs">Employee Signature</div>
              </div>
              <div className="text-center">
                <div className="h-6 border-b w-40"></div>
                <div className="text-xs">Authorized</div>
              </div>
            </div>
          </div>
        </div>

        {/* footer small */}
        <div className="mt-4 text-xs text-gray-500 text-center">This is a system generated payslip and does not require signature if presented digitally.</div>
      </div>
    </div>
  );
}
