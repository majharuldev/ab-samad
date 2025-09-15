// import { Card } from "@/components/ui/card";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Legend
// } from "recharts";
// import useMonthlyStatementData from "../../hooks/monthlyStatementHooks";


// const ProfitLossChartCard = () => {
//   const { data, loading } = useMonthlyStatementData();

//   if (loading) return <Card className="p-4">Loading chart...</Card>;

//   return (
//     <Card className="p-4 shadow-lg">
//       <h3 className="text-lg font-semibold mb-4">Monthly Profit vs Expense</h3>
//       <ResponsiveContainer width="100%" height={300}>
//         <BarChart data={data}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="month" />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Bar dataKey="totalExpense" fill="#f87171" name="Total Expense" />
//           <Bar dataKey="netProfit" fill="#34d399" name="Net Profit" />
//         </BarChart>
//       </ResponsiveContainer>
//     </Card>
//   );
// };

// export default ProfitLossChartCard;


import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import useMonthlyStatementData from "../../hooks/monthlyStatementHooks";

const ProfitLossChartCard = () => {
  const { data, loading } = useMonthlyStatementData();

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        Loading chart...
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 ">
      <h3 className="text-lg font-semibold mb-4">Monthly Profit vs Expense</h3>
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalExpense" fill="#ed4553" name="Total Expense" />
            <Bar dataKey="netProfit" fill="#239230" name="Net Profit" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProfitLossChartCard;

