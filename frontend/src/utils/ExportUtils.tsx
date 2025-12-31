export const exportInsightsSummary = (
  stats: any,
  monthlyData: any,
  distributionData: any
) => {
  const rows = [];

  // Section 1: Core Statistics
  rows.push(["FINANCIAL SUMMARY REPORT"]);
  rows.push(["Generated on", new Date().toLocaleString()]);
  rows.push([]);
  rows.push(["Metric", "Value"]);
  rows.push(["Total Accumulated Billing", stats.totalInvoiced]);
  rows.push(["Total Projected Net (Gross)", stats.totalGross]);
  rows.push(["Total Accumulated Safety Buffer", stats.totalBuffer]);
  rows.push(["Average Hourly Rate", Math.round(stats.avgRate)]);
  rows.push(["Total Saved Scenarios", stats.count]);
  rows.push([]);

  // Section 2: Monthly Performance
  rows.push(["MONTHLY REVENUE PERFORMANCE"]);
  rows.push(["Month", "Revenue"]);
  monthlyData.forEach((item: any) => {
    rows.push([item.name, item.value]);
  });
  rows.push([]);

  // Section 3: Latest Distribution Profile
  rows.push(["80/20 DISTRIBUTION (LATEST PROFILE)"]);
  rows.push(["Category", "Amount"]);
  distributionData.forEach((item: any) => {
    rows.push([item.name, item.value]);
  });

  const csvContent = rows.map((row) => row.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `eighty_twenty_insights_summary_${
      new Date().toISOString().split("T")[0]
    }.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportHistory = (calculations: any) => {
  if (calculations.length === 0) {
    return;
  }

  const headers = [
    "ID",
    "Date",
    "Client",
    "Hourly Rate",
    "Hours Worked",
    "Invoiced Amount",
    "After Deduction",
    "Buffer Saving",
    "Gross Salary",
    "Employer Fee",
    "Take Home",
    "Notes",
  ];

  const rows = calculations.map((c: any) => [
    c.id,
    c.date?.split("T")[0],
    `"${c.client_name}"`,
    c.hourly_rate,
    c.hours_worked,
    c.invoiced_amount,
    c.after_deduction,
    c.save_to_buffer,
    c.gross_salary,
    c.employer_fee,
    c.remaining_for_gross_salary,
    `"${c.notes || ""}"`,
  ]);

  const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `eighty-twenty-history-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
