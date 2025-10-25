import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
  Calendar,
  Download,
} from "lucide-react";

const EarningsChart = ({
  analytics = {},
  isLoading = false,
  userRole = "freelancer",
  showExport = true,
  title = null,
}) => {
  const [chartType, setChartType] = useState("line");
  const [timeRange, setTimeRange] = useState("monthly");

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getChartData = () => {
    switch (timeRange) {
      case "daily":
        return analytics.daily || [];
      case "weekly":
        return analytics.weekly || [];
      case "monthly":
        return analytics.monthly || [];
      default:
        return analytics.monthly || [];
    }
  };

  const getDataKey = () => {
    return userRole === "freelancer" ? "earnings" : "expenses";
  };

  const getChartColor = () => {
    return userRole === "freelancer" ? "#10b981" : "#3b82f6";
  };

  const getXAxisKey = () => {
    switch (timeRange) {
      case "daily":
        return "date";
      case "weekly":
        return "week";
      case "monthly":
        return "month";
      default:
        return "month";
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-slate-300 text-sm mb-1">{label}</p>
          <p className="text-white font-semibold">
            {userRole === "freelancer" ? "Earnings: " : "Expenses: "}
            <span className="text-green-400">{formatCurrency(data.value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            {userRole === "freelancer"
              ? "Earnings Analytics"
              : "Spending Analytics"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-slate-700 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const chartData = getChartData();
  const dataKey = getDataKey();
  const chartColor = getChartColor();

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            {title ||
              (userRole === "freelancer"
                ? "Earnings Analytics"
                : "Spending Analytics")}
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* Time Range Selector */}
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>

            {/* Chart Type Toggle */}
            <div className="flex rounded-md overflow-hidden">
              <Button
                variant={chartType === "line" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("line")}
                className={
                  chartType === "line"
                    ? "bg-blue-600 text-white"
                    : "border-slate-600 text-slate-300 hover:bg-slate-700"
                }
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === "bar" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("bar")}
                className={
                  chartType === "bar"
                    ? "bg-blue-600 text-white"
                    : "border-slate-600 text-slate-300 hover:bg-slate-700"
                }
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>

            {/* Export Button */}
            {showExport && (
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No data available</p>
              <p className="text-slate-500 text-sm">
                {userRole === "freelancer"
                  ? "Start earning to see your analytics here"
                  : "Start making payments to see your spending analytics"}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey={getXAxisKey()}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    tickLine={{ stroke: "#374151" }}
                  />
                  <YAxis
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    tickLine={{ stroke: "#374151" }}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey={dataKey}
                    stroke={chartColor}
                    strokeWidth={3}
                    dot={{ fill: chartColor, strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: chartColor, strokeWidth: 2 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey={getXAxisKey()}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    tickLine={{ stroke: "#374151" }}
                  />
                  <YAxis
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    tickLine={{ stroke: "#374151" }}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey={dataKey}
                    fill={chartColor}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart Summary */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-700">
            <div className="text-center">
              <p className="text-slate-500 text-sm">Total</p>
              <p className="text-white font-semibold">
                {formatCurrency(
                  chartData.reduce((sum, item) => sum + (item[dataKey] || 0), 0)
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-500 text-sm">Average</p>
              <p className="text-white font-semibold">
                {formatCurrency(
                  chartData.reduce(
                    (sum, item) => sum + (item[dataKey] || 0),
                    0
                  ) / chartData.length
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-500 text-sm">
                {timeRange === "daily"
                  ? "Best Day"
                  : timeRange === "weekly"
                  ? "Best Week"
                  : "Best Month"}
              </p>
              <p className="text-white font-semibold">
                {formatCurrency(
                  Math.max(...chartData.map((item) => item[dataKey] || 0))
                )}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EarningsChart;
