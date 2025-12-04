"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import {
  Globe2,
  Activity,
  TrendingUp,
  Users,
  AlertCircle,
  FileDown,
  PlayCircle,
  Brain,
  LogOut,
} from "lucide-react";

import Papa from "papaparse";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Years we care about (2000–2023)
const YEAR_COLUMNS = Array.from(
  { length: 2023 - 2000 + 1 },
  (_, i) => (2000 + i).toString()
);

type RawRow = Record<string, string>;

export default function DashboardPage() {
  const router = useRouter();

  const [username, setUsername] = useState<string | null>(null);

  const [generated, setGenerated] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("Ireland");

  const [rawData, setRawData] = useState<RawRow[] | null>(null);
  const [indicatorOptions, setIndicatorOptions] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [reportNotes, setReportNotes] = useState("");
  const [copied, setCopied] = useState(false);

  const [aiInsight, setAiInsight] = useState("");

  const stats = [
    { label: "Birth-related indicators", icon: Activity },
    { label: "Death & mortality rates", icon: AlertCircle },
    { label: "Life expectancy", icon: TrendingUp },
    { label: "Population health", icon: Users },
  ];

  // Load username from localStorage (set by landing page)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("whd-username");
    if (stored) setUsername(stored);
  }, []);

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("whd-username");
    }
    router.push("/");
  };

  // Load the cleaned CSV once on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        setLoadError(null);

        const res = await fetch("/data/Data_Cleaned.csv");
        if (!res.ok) {
          throw new Error(`Failed to load data: ${res.status} ${res.statusText}`);
        }

        const csvText = await res.text();

        const parsed = Papa.parse<RawRow>(csvText, {
          header: true,
          skipEmptyLines: true,
        });

        const rows = (parsed.data || []).filter(
          (row) => row["Series Name"] && row["Country Name"]
        );

        setRawData(rows);

        // Build full indicator list from the CSV (this replaces unique_series_names.csv)
        const indicators = Array.from(
          new Set(rows.map((row) => row["Series Name"]))
        ).sort();

        setIndicatorOptions(indicators);

        // Set a default indicator if we don't have one yet
        if (!selectedIndicator && indicators.length > 0) {
          setSelectedIndicator(indicators[0]);
        }
      } catch (err) {
        setLoadError(
          "Could not load health dataset. Check that public/data/Data_Cleaned.csv exists and try again."
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
    // we intentionally ignore selectedIndicator in deps so it only runs once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = () => {
    setGenerated(true);
  };

  const handleIndicatorChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newIndicator = e.target.value;
    setSelectedIndicator(newIndicator);
    setGenerated(false); // force user to regenerate to reflect change
  };

  const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
    setGenerated(false);
  };

  // Build list of countries for the selected indicator from the real data
  const countriesForSelectedIndicator: string[] =
    rawData && selectedIndicator
      ? Array.from(
          new Set(
            rawData
              .filter((row) => row["Series Name"] === selectedIndicator)
              .map((row) => row["Country Name"])
          )
        ).sort()
      : [];

  // If there are no matches yet (e.g. still loading), keep at least the current value
  const effectiveCountryOptions =
    countriesForSelectedIndicator.length > 0
      ? countriesForSelectedIndicator
      : [selectedCountry];

  // Find the row matching the selected indicator + country
  const matchingRow: RawRow | undefined =
    generated && rawData && selectedIndicator && selectedCountry
      ? rawData.find(
          (row) =>
            row["Series Name"] === selectedIndicator &&
            row["Country Name"] === selectedCountry
        )
      : undefined;

  // Build chart data from the matching row
  const chartData =
    matchingRow && generated
      ? YEAR_COLUMNS.map((year) => {
          const rawVal = matchingRow[year];
          const num =
            rawVal === undefined || rawVal === null || rawVal === ""
              ? NaN
              : Number(rawVal);
          return { year, value: num };
        }).filter((d) => !Number.isNaN(d.value))
      : [];

  const generateReportNotes = () => {
    const header = `Report notes for ${selectedIndicator || "the selected indicator"} in ${
      selectedCountry
    } (2000–2023)\n\n`;
    const body =
      generated && chartData.length > 0
        ? [
            `1. Describe the overall trend for ${selectedIndicator} in ${selectedCountry}.`,
            `   • Is it increasing, decreasing, or relatively stable between 2000 and 2023?`,
            `2. Comment on any obvious spikes or drops in the line.`,
            `   • Could these be linked to policy changes, economic events, or health crises?`,
            `3. Compare ${selectedCountry} to other countries or regions if you explore them on the dashboard.`,
            `4. Explain what this means in practical terms (e.g. births, deaths, life expectancy or the meaning of this indicator).`,
            `5. Briefly summarise why these findings are important for public health planning.`,
          ].join("\n")
        : [
            `Graphs and data have not been generated yet or no data is available for this combination.`,
            `1. First click "Generate graphs & data" on the dashboard.`,
            `2. Make sure the selected indicator and country/region actually exist in the dataset.`,
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
      // clipboard might not be available, fail silently
    }
  };

  const generateAiInsight = () => {
    if (!generated || chartData.length === 0) {
      setAiInsight(
        [
          "Please generate graphs & data first.",
          "",
          '1. Click "Generate graphs & data" above.',
          "2. Make sure a health indicator and country/region are selected.",
          "3. Then try generating the AI-style summary again.",
        ].join("\n")
      );
      return;
    }

    const first = chartData[0].value;
    const last = chartData[chartData.length - 1].value;
    const diff = last - first;

    let trend: string;
    if (diff > 0.5) trend = "increasing";
    else if (diff < -0.5) trend = "decreasing";
    else trend = "relatively stable";

    const indicatorShort = selectedIndicator.toLowerCase();

    const lines = [
      "AI-style summary (prototype, no external model):",
      "",
      `For ${selectedIndicator} in ${selectedCountry}, the indicator appears to be ${trend} over the period 2000–2023.`,
      `The value starts around ${first.toFixed(
        1
      )} and ends near ${last.toFixed(
        1
      )}, suggesting that ${indicatorShort} has ${
        trend === "increasing"
          ? "been rising overall during this period."
          : trend === "decreasing"
          ? "declined over time."
          : "remained fairly steady."
      }`,
      "",
      "In your report, you could:",
      "• Comment on whether this pattern is expected for this country/region.",
      "• Suggest possible reasons (policy changes, economic conditions, health system strength, crises).",
      "• Compare this pattern to other countries for the same indicator if data is available.",
      "• Link the numeric change back to real-world effects relevant to this indicator.",
    ];

    setAiInsight(lines.join("\n"));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Themed header using your old style (now .health-header) */}
      <header className="health-header">
        <h1>Health Data Trends Dashboard</h1>
        <p>Visualize global health indicators (2000–2023)</p>
      </header>

      <main className="flex-1 w-full">
        {/* Signed-in bar */}
        <div className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between px-4 pt-4 pb-2 text-xs sm:text-sm text-gray-700">
          <div>
            {username ? (
              <span>
                Signed in as <strong>{username}</strong>
              </span>
            ) : (
              <span>Not signed in (demo mode)</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-2 sm:mt-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium hover:bg-gray-100 transition"
          >
            <LogOut className="h-3 w-3" />
            Sign out
          </button>
        </div>

        {/* Top controls */}
        <section id="controls">
          <div className="controls-row">
            {/* Left: overview text */}
            <div className="control-group" style={{ maxWidth: "420px" }}>
              <label>Overview</label>
              <p className="text-sm text-gray-700">
                Explore{" "}
                <strong>births, deaths, life expectancy</strong> and many other
                world health indicators across more than 200 countries. The
                graphs use values from your cleaned data file{" "}
                <strong>Data_Cleaned.csv</strong>.
              </p>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Globe2 className="h-4 w-4 text-blue-600" />
                108+ indicators • 200+ countries • Years: 2000–2023
              </p>
              {loadingData && (
                <p className="text-xs text-gray-500 mt-1">
                  Loading dataset… please wait.
                </p>
              )}
              {loadError && (
                <p className="text-xs text-red-600 mt-1">{loadError}</p>
              )}
            </div>

            {/* Middle-left: indicator selection */}
            <div className="control-group" style={{ maxWidth: "260px" }}>
              <label>Health indicator</label>
              <select
                value={selectedIndicator}
                onChange={handleIndicatorChange}
                disabled={loadingData || !!loadError || indicatorOptions.length === 0}
              >
                {indicatorOptions.map((indicator) => (
                  <option key={indicator} value={indicator}>
                    {indicator}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                List built directly from the CSV (no need to maintain a separate
                unique_series_names file in code).
              </p>
            </div>

            {/* Middle-right: country selection */}
            <div className="control-group" style={{ maxWidth: "220px" }}>
              <label>Country / region</label>
              <select
                value={selectedCountry}
                onChange={handleCountryChange}
                disabled={loadingData || !!loadError}
              >
                {effectiveCountryOptions.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Options filtered by the selected indicator.
              </p>
            </div>

            {/* Right: generate & report */}
            <div className="control-group" style={{ maxWidth: "220px" }}>
              <label>Actions</label>
              <button
                type="button"
                onClick={handleGenerate}
                className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed mb-2"
                disabled={
                  generated ||
                  loadingData ||
                  !!loadError ||
                  !selectedIndicator ||
                  !selectedCountry
                }
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
                1) Generate graphs &amp; data. 2) Use them as evidence in your
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
                    ? "Values are based on your real dataset. Replace text with your own summary."
                    : "Placeholder – will show as 'ready' after generation."}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Main chart area */}
        <section id="chartContainer">
          <h2 className="text-xl font-semibold mb-1">
            {selectedIndicator || "Select an indicator"}{" "}
            {generated ? "(generated from cleaned data)" : "(waiting for generation)"}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {generated ? (
              chartData.length > 0 ? (
                <>
                  The chart below shows the real time trend for{" "}
                  <strong>{selectedIndicator}</strong> in{" "}
                  <strong>{selectedCountry}</strong> using values from{" "}
                  <strong>Data_Cleaned.csv</strong>.
                </>
              ) : (
                <>
                  No data was found in the cleaned dataset for this combination
                  of indicator and country. Try selecting a different country or
                  indicator.
                </>
              )
            ) : (
              <>
                Click <strong>&quot;Generate graphs &amp; data&quot;</strong>{" "}
                above to populate this chart using your cleaned dataset.
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

        {/* Summary / explanation area */}
        <section id="summary">
          <h2>Summary &amp; Interpretation</h2>
          {generated && chartData.length > 0 ? (
            <>
              <p className="text-sm text-gray-700">
                Use this view to support your written report. For the selected
                indicator and country/region, look for:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                <li>
                  Is the trend for <strong>{selectedIndicator}</strong>{" "}
                  improving, worsening, or stable between 2000 and 2023?
                </li>
                <li>
                  Are there any obvious spikes or drops that might indicate
                  policy changes, shocks, or data issues?
                </li>
                <li>
                  How does {selectedCountry} compare to other countries when you
                  change the selection?
                </li>
                <li>
                  What story does this graph tell that you can write up in your
                  report?
                </li>
              </ul>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700">
                Once you&apos;ve generated the graphs, this section should be
                used to write up your findings. Focus on what is happening over
                time and what that might mean for health outcomes.
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
              These notes are meant to be a starting template. Edit them in
              place, then copy into your Word/PDF report or learning journal.
            </p>
          </div>

          {/* AI-style insight block */}
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" />
                AI-style insight (prototype)
              </h3>
              <button
                type="button"
                onClick={generateAiInsight}
                className="px-3 py-1.5 rounded-md bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition"
              >
                Generate AI summary
              </button>
            </div>

            <textarea
              value={aiInsight}
              readOnly
              rows={7}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-gray-100/70 focus:outline-none resize-vertical"
              placeholder="Click 'Generate AI summary' to create a prototype narrative based on the selected indicator and country..."
            />

            <p className="text-[11px] text-gray-500">
              This summary is generated locally using simple logic, not a real
              LLM. Later you could replace this with a proper AI service to
              generate richer explanations and predictions.
            </p>
          </div>

          <div className="data-info">
            <p>📊 108+ Indicators • 200+ Countries • Years: 2000–2023</p>
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
