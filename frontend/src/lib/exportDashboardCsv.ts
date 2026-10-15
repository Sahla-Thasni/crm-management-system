import type { DashboardData } from "@/types/dashboard";

export function exportDashboardCsv(data: DashboardData) {
  const rows: string[][] = [];

  // =====================================================
  // DASHBOARD SUMMARY
  // =====================================================

  rows.push(["DASHBOARD SUMMARY"]);
  rows.push(["Metric", "Value"]);

  rows.push(["Total Leads", String(data.total_leads)]);
  rows.push(["Active Deals", String(data.active_deals)]);
  rows.push(["Closed Deals", String(data.closed_deals)]);
  rows.push(["Monthly Revenue", String(data.monthly_revenue)]);

  rows.push([]);

  // =====================================================
  // CONVERSION
  // =====================================================

  rows.push(["CONVERSION"]);
  rows.push(["Title", "Percentage"]);

  data.conversion.forEach((item) => {
    rows.push([
      item.title,
      `${item.percentage}%`,
    ]);
  });

  rows.push([]);

  // =====================================================
  // SALES REPORT
  // =====================================================

  rows.push(["SALES REPORT"]);
  rows.push(["Month", "Sales", "Target"]);

  data.sales_report.forEach((item) => {
    rows.push([
      item.month,
      String(item.sales),
      String(item.target),
    ]);
  });

  rows.push([]);

  // =====================================================
  // TEAM PERFORMANCE
  // =====================================================

  rows.push(["TEAM PERFORMANCE"]);
  rows.push([
    "Employee",
    "Active Deals",
    "Closed Deals",
    "Revenue",
    "Growth",
  ]);

  data.team_performance.forEach((item) => {
    rows.push([
      item.employee,
      String(item.activeDeals),
      String(item.closedDeals),
      String(item.revenue),
      `${item.growth}%`,
    ]);
  });

  // =====================================================
  // CSV ESCAPING
  // =====================================================

  const csvContent = rows
    .map((row) =>
      row
        .map((value) => {
          const escaped = value.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(","),
    )
    .join("\n");

  // =====================================================
  // DOWNLOAD CSV
  // =====================================================

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `dashboard-${new Date()
    .toISOString()
    .split("T")[0]}.csv`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}