"use client";

import { useState, ChangeEvent } from "react";

import {
  Globe2,
  Activity,
  TrendingUp,
  Users,
  AlertCircle,
  FileDown,
  PlayCircle,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Demo data structure – later we can replace this with real CSV/API data
// Format: demoData[indicator][country] = [{ year, value }, ...]
const demoData: Record<
  string,
  Record<string, { year: string; value: number }[]>
> = {
  "Crude birth rate (per 1,000 people)": {
    Global: [
      { year: "2018", value: 18.5 },
      { year: "2019", value: 18.2 },
      { year: "2020", value: 17.8 },
      { year: "2021", value: 17.5 },
      { year: "2022", value: 17.2 },
      { year: "2023", value: 17.0 },
    ],
    Ireland: [
      { year: "2018", value: 12.3 },
      { year: "2019", value: 11.9 },
      { year: "2020", value: 11.3 },
      { year: "2021", value: 10.8 },
      { year: "2022", value: 10.4 },
      { year: "2023", value: 10.1 },
    ],
  },
  "Crude death rate (per 1,000 people)": {
    Global: [
      { year: "2018", value: 7.6 },
      { year: "2019", value: 7.5 },
      { year: "2020", value: 8.1 },
      { year: "2021", value: 8.0 },
      { year: "2022", value: 7.8 },
      { year: "2023", value: 7.7 },
    ],
    Ireland: [
      { year: "2018", value: 6.4 },
      { year: "2019", value: 6.3 },
      { year: "2020", value: 7.0 },
      { year: "2021", value: 6.8 },
      { year: "2022", value: 6.6 },
      { year: "2023", value: 6.5 },
    ],
  },
  "Life expectancy at birth (years)": {
    Global: [
      { year: "2018", value: 72.6 },
      { year: "2019", value: 72.8 },
      { year: "2020", value: 72.1 },
      { year: "2021", value: 72.3 },
      { year: "2022", value: 72.6 },
      { year: "2023", value: 72.9 },
    ],
    Ireland: [
      { year: "2018", value: 82.2 },
      { year: "2019", value: 82.4 },
      { year: "2020", value: 81.9 },
      { year: "2021", value: 82.0 },
      { year: "2022", value: 82.3 },
      { year: "2023", value: 82.5 },
    ],
  },
};

const indicatorOptions = Object.keys(demoData);
const defaultIndicator = indicatorOptions[0];
const defaultCountry = "Global";

export default function DashboardPage() {
  const [generated, setGenerated] = useState(false);
  const [selectedIndicator, setSelectedIndicator] =
    useState<string>(defaultIndicator);
  const [selectedCountry, setSelectedCountry] =
    useState<string>(defaultCountry);

  const [reportNotes, setReportNotes] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = [
    { label: "Birth-related indicators", icon: Activity },
    { label: "Death & mortality rates", icon: AlertCircle },
    { label: "Life expectancy", icon: TrendingUp },
    { label: "Population health", icon: Users },
  ];

  const handleGenerate = () => {
    // later: fetch real data, call API, etc.
    setGenerated(true);
  };

  const handleIndicatorChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newIndicator = e.target.value;
    setSelectedIndicator(newIndicator);

    // If the current country isn't available for the new indicator, reset to Global
    const countriesForIndicator = Object.keys(demoData[newIndicator] || {});
    if (!countriesForIndicator.includes(selectedCountry)) {
      setSelectedCountry(countriesForIndicator[0] || "Global");
    }
  };

  const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
  };

  const generateReportNotes = () => {
    const header = `Report notes for ${selectedIndicator} in ${selectedCountry} (2000–2022)\n\n`;
    const body = generated
      ? [
          `1. Describe the overall trend for ${selectedIndicator} in ${selectedCountry}.`,
          `   • Is it increasing, decreasing, or relatively stable over the years shown?`,
          `2. Comment on any obvious spikes or drops.`,
          `   • Could these be linked to policy changes, economic events, or health crises?`,
          `3. Compare ${selectedCountry} to the global pattern for this indicator (if relevant).`,
          `4. Explain what this means for births, deaths, mortality, or life expectancy in practical terms.`,
          `5. Briefly summarise why these findings are important for public health planning.`,
        ].join("\n")
      : [
          `Graphs and data have not been generated yet.`,
          `1. First click "Generate graphs & data" on the dashboard.`,
          `2. Then, use the chart and summary values as evidence in your written report.`,
          `3. Once the graphs are visible, focus on direction of change, spikes/drops, and differences between regions.`,
        ].join("\n");

    setReportNotes(header + body);
    setCopied(false);
  };

  const handleCopyNotes = async () => {
    if (!reportNotes) return;
    try {
      await navigator.clipboard.writeText(reportNotes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore errors – clipboard might not be available
    }
  };

  const countriesForSelectedIndicator = Object.keys(
    demoData[selectedIndicator] || {}
  );

  const chartData =
    generated && demoData[selectedIndicator]?.[selectedCountry]
      ? demoData[selectedIndicator][selectedCountry]
      : [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Themed header using your old style (now .health-header) */}
      <header className="health-header">
        <h1>Health Data Trends Dashboard</h1>
        <p>Visualize global health indicators (2000–2022)</p>
      </header>

      <main className="flex-1 w-full">
        {/* Top summary + Generate button + PDF download */}
        <section id="controls">
          <div className="controls-row">
            {/* Left: overview text */}
            <div className="control-group" style={{ maxWidth: "420px" }}>
              <label>Overview</label>
              <p className="text-sm text-gray-700">
                Explore{" "}
                <strong>births, deaths, mortality, life expectancy</strong> and
                other key world health indicators across more than 200
                countries. This prototype uses sample values but mirrors how the
                real dashboard will behave once connected to your cleaned CSV
                data.
              </p>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Globe2 className="h-4 w-4 text-blue-600" />
                108 indicators • 200+ countries • Years: 2000–2022
              </p>
            </div>

            {/* Middle-left: indicator selection */}
            <div className="control-group" style={{ maxWidth: "240px" }}>
              <label>Health indicator</label>
              <select
                value={selectedIndicator}
                onChange={handleIndicatorChange}
              >
                {indicatorOptions.map((indicator) => (
                  <option key={indicator} value={indicator}>
                    {indicator}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose whether to focus on births, deaths, or life expectancy.
              </p>
            </div>

            {/* Middle-right: country selection */}
            <div className="control-group" style={{ maxWidth: "200px" }}>
              <label>Country / region</label>
              <select value={selectedCountry} onChange={handleCountryChange}>
                {countriesForSelectedIndicator.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Prototype options: Global and Ireland.
              </p>
            </div>

            {/* Right: generate & report */}
            <div className="control-group" style={{ maxWidth: "220px" }}>
              <label>Actions</label>
              <button
                type="button"
                onClick={handleGenerate}
                className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed mb-2"
                disabled={generated}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                {generated ? "Graphs generated" : "Generate graphs & data"}
              </button>
              <a
                href="/reports/world-health-dashboard.pdf"
                download
                className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Download PDF summary
              </a>
              <p className="text-xs text-gray-500 mt-2">
                1) Generate graphs & data. 2) Use them as evidence in your
                report. 3) Download the PDF template if needed.
              </p>
            </div>
          </div>

          {/* Quick stat cards (placeholders) */}
          <div className="controls-row" style={{ marginTop: "24px" }}>
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="control-group"
                style={{ maxWidth: "220px" }}
              >
                <label>{stat.label}</label>
                <div className="flex items-center gap-2">
                  <stat.icon className="h-5 w-5 text-blue-600" />
                  {generated ? (
                    <span className="text-sm font-medium text-gray-800">
                      Ready for report
                    </span>
                  ) : (
                    <div className="h-5 w-24 rounded bg-gray-100 animate-pulse" />
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {generated
                    ? "Sample values computed. Replace with real metrics later."
                    : "Placeholder – will show summary values after generation."}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Main chart area */}
        <section id="chartContainer">
          <h2 className="text-xl font-semibold mb-1">
            {selectedIndicator}{" "}
            {generated ? "(generated view)" : "(waiting for generation)"}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {generated ? (
              <>
                The chart below shows a sample time trend for{" "}
                <strong>{selectedIndicator}</strong> in{" "}
                <strong>{selectedCountry}</strong>. When connected to real
                data, this will reflect actual values from your cleaned world
                health dataset.
              </>
            ) : (
              <>
                Click <strong>&quot;Generate graphs &amp; data&quot;</strong>{" "}
                above to populate this chart. Right now you&apos;re seeing a
                placeholder configuration for {selectedIndicator} in{" "}
                <strong>{selectedCountry}</strong>.
              </>
            )}
          </p>

          <div style={{ width: "100%", height: "320px" }}>
            {generated && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#1b4965"
                    strokeWidth={2}
                    dot
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center rounded-lg bg-gray-50 border border-dashed border-gray-300 text-sm text-gray-500 text-center px-4">
                Graphs will appear here after you click{" "}
                <strong>&quot;Generate graphs &amp; data&quot;</strong>.
              </div>
            )}
          </div>
        </section>

        {/* Summary / explanation area using #summary + .data-info + report notes */}
        <section id="summary">
          <h2>Summary & Interpretation</h2>
          {generated ? (
            <>
              <p className="text-sm text-gray-700">
                Use this view to support your written report. For the selected
                indicator and country/region, look for:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                <li>
                  Is the trend for <strong>{selectedIndicator}</strong>{" "}
                  improving, worsening, or stable over time?
                </li>
                <li>
                  Are there any obvious spikes or drops that might indicate
                  policy changes, shocks, or data issues?
                </li>
                <li>
                  How does {selectedCountry} compare to the global pattern for
                  this indicator?
                </li>
                <li>
                  What story about births, deaths, or life expectancy does this
                  graph tell that you can write up in your report?
                </li>
              </ul>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700">
                Once you&apos;ve generated the graphs, this section should be
                used to write up your findings. Focus on what is happening with
                births, deaths, life expectancy, and other indicators over time.
              </p>
              <p className="text-sm text-gray-700 mt-2">
                Start by generating the data above, then use the chart and key
                numbers as evidence in your written report or PDF summary.
              </p>
            </>
          )}

          {/* Report notes block */}
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold">Report notes</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={generateReportNotes}
                  className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition"
                >
                  Generate notes
                </button>
                <button
                  type="button"
                  onClick={handleCopyNotes}
                  disabled={!reportNotes}
                  className="px-3 py-1.5 rounded-md border text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copied ? "Copied ✓" : "Copy notes"}
                </button>
              </div>
            </div>

            <textarea
              value={reportNotes}
              onChange={(e) => {
                setReportNotes(e.target.value);
                setCopied(false);
              }}
              rows={8}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              placeholder="Click 'Generate notes' to create a starting point for your report, then edit and expand it here..."
            />

            <p className="text-[11px] text-gray-500">
              These notes are meant to be a starting template. Edit them in place,
              then copy into your Word/PDF report or learning journal.
            </p>
          </div>

          <div className="data-info">
            <p>📊 108 Indicators • 200+ Countries • Years: 2000–2022</p>
          </div>
        </section>
      </main>

      {/* Themed footer using .health-footer */}
      <footer className="health-footer">
        <p>© 2025 | World Health Analytics Dashboard | Built by Patrick</p>
      </footer>
    </div>
  );
}
