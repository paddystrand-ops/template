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
  Copy,
  Check,
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

type ChartRow = {
  year: string;
  valueA: number | null;
  valueB: number | null;
};

type SeriesPoint = { year: string; value: number };

export default function DashboardPage() {
  const router = useRouter();

  const [username, setUsername] = useState<string | null>(null);

  const [generated, setGenerated] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<string>("");

  const [selectedCountryA, setSelectedCountryA] = useState<string>("Ireland");
  const [selectedCountryB, setSelectedCountryB] =
    useState<string>("United Kingdom");

  const [rawData, setRawData] = useState<RawRow[] | null>(null);
  const [indicatorOptions, setIndicatorOptions] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [reportNotes, setReportNotes] = useState("");
  const [copiedNotes, setCopiedNotes] = useState(false);

  const [aiInsight, setAiInsight] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = () => {
    setGenerated(true);
  };

  const handleIndicatorChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newIndicator = e.target.value;
    setSelectedIndicator(newIndicator);
    setGenerated(false);
  };

  const handleCountryAChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountryA(e.target.value);
    setGenerated(false);
  };

  const handleCountryBChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountryB(e.target.value);
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

  const effectiveCountryOptions =
    countriesForSelectedIndicator.length > 0
      ? countriesForSelectedIndicator
      : [selectedCountryA];

  // Find rows matching the selected indicator + both countries
  const matchingRowA: RawRow | undefined =
    generated && rawData && selectedIndicator && selectedCountryA
      ? rawData.find(
          (row) =>
            row["Series Name"] === selectedIndicator &&
            row["Country Name"] === selectedCountryA
        )
      : undefined;

  const matchingRowB: RawRow | undefined =
    generated && rawData && selectedIndicator && selectedCountryB
      ? rawData.find(
          (row) =>
            row["Series Name"] === selectedIndicator &&
            row["Country Name"] === selectedCountryB
        )
      : undefined;

  // Build chart data containing both A and B
  const chartData: ChartRow[] =
    generated && (matchingRowA || matchingRowB)
      ? YEAR_COLUMNS.map((year) => {
          const rawA = matchingRowA?.[year];
          const rawB = matchingRowB?.[year];

          const numA =
            rawA === undefined || rawA === null || rawA === ""
              ? NaN
              : Number(rawA);
          const numB =
            rawB === undefined || rawB === null || rawB === ""
              ? NaN
              : Number(rawB);

          const valueA = Number.isNaN(numA) ? null : numA;
          const valueB = Number.isNaN(numB) ? null : numB;

          if (valueA === null && valueB === null) return null;

          return { year, valueA, valueB };
        }).filter((d): d is ChartRow => d !== null)
      : [];

  const seriesA: SeriesPoint[] = chartData
    .filter((d) => d.valueA !== null)
    .map((d) => ({ year: d.year, value: d.valueA as number }));

  const seriesB: SeriesPoint[] = chartData
    .filter((d) => d.valueB !== null)
    .map((d) => ({ year: d.year, value: d.valueB as number }));

  const generateReportNotes = () => {
    const header =
      `Report notes for ${selectedIndicator || "the selected indicator"} in ${
        selectedCountryA
      }` +
      (selectedCountryB ? ` (compared with ${selectedCountryB})` : "") +
      ` (2000–2023)\n\n`;

    let body: string;

    if (generated && chartData.length > 0) {
      body = [
        `1. Describe the overall trend for ${selectedIndicator} in ${selectedCountryA}.`,
        `   • Is it increasing, decreasing, or relatively stable between 2000 and 2023?`,
        selectedCountryB
          ? `2. Compare ${selectedCountryA} with ${selectedCountryB}. Which one appears higher or lower overall?`
          : `2. Optionally select a second country/region to compare trends.`,
        `3. Comment on any obvious spikes or drops in the lines.`,
        `   • Could these be linked to policy changes, economic events, or health crises?`,
        `4. Explain what this means in practical terms for this indicator (e.g. births, deaths, life expectancy, or another health measure).`,
        `5. Summarise why these findings are important for public health planning or policy-making.`,
      ]
        .filter(Boolean)
        .join("\n");
    } else {
      body = [
        `Graphs and data have not been generated yet or no data is available for this combination.`,
        `1. First click "Generate graphs & data" on the dashboard.`,
        `2. Make sure the selected indicator and country/region actually exist in the dataset.`,
        `3. Once the graphs are visible, focus on direction of change, spikes/drops, and differences between regions.`,
      ].join("\n");
    }

    setReportNotes(header + body);
    setCopiedNotes(false);
  };

  const handleCopyNotes = async () => {
    if (!reportNotes) return;
    try {
      await navigator.clipboard.writeText(reportNotes);
      setCopiedNotes(true);
      setTimeout(() => setCopiedNotes(false), 2000);
    } catch {
      // clipboard might not be available, fail silently
    }
  };

  // Local AI-style summary (no external LLM)
  const generateAiInsightLocal = () => {
    if (!generated || chartData.length === 0 || seriesA.length === 0) {
      setAiInsight(
        [
          "Please generate graphs & data first.",
          "",
          '1. Click "Generate graphs & data" above.',
          "2. Make sure a health indicator and at least one country/region are selected.",
          "3. Then try generating the local summary again.",
        ].join("\n")
      );
      return;
    }

    const firstA = seriesA[0].value;
    const lastA = seriesA[seriesA.length - 1].value;
    const diffA = lastA - firstA;

    let trendA: string;
    if (diffA > 0.5) trendA = "increasing";
    else if (diffA < -0.5) trendA = "decreasing";
    else trendA = "relatively stable";

    let comparisonLine = "";
    if (seriesB.length > 0 && selectedCountryB) {
      const firstB = seriesB[0].value;
      const lastB = seriesB[seriesB.length - 1].value;
      const diffB = lastB - firstB;

      let trendB: string;
      if (diffB > 0.5) trendB = "increasing";
      else if (diffB < -0.5) trendB = "decreasing";
      else trendB = "relatively stable";

      const gap = lastA - lastB;
      const whichHigher =
        Math.abs(gap) < 0.25
          ? "very similar in the latest year"
          : gap > 0
          ? `${selectedCountryA} is higher than ${selectedCountryB} in the latest year`
          : `${selectedCountryB} is higher than ${selectedCountryA} in the latest year`;

      comparisonLine = [
        "",
        `For ${selectedCountryB}, the indicator also appears ${trendB}. In the most recent year, ${whichHigher}.`,
      ].join("\n");
    }

    const indicatorShort = selectedIndicator.toLowerCase();

    const lines = [
      "Local AI-style summary (no external model):",
      "",
      `For ${selectedIndicator} in ${selectedCountryA}, the indicator appears to be ${trendA} over the period 2000–2023.`,
      `The value starts around ${firstA.toFixed(
        1
      )} and ends near ${lastA.toFixed(
        1
      )}, suggesting that ${indicatorShort} has ${
        trendA === "increasing"
          ? "been rising overall during this period."
          : trendA === "decreasing"
          ? "declined over time."
          : "remained fairly steady."
      }`,
      comparisonLine,
      "",
      "In your report, you could:",
      "• Comment on whether these patterns are expected for each country/region.",
      "• Suggest possible reasons (policy changes, economic conditions, health system strength, crises).",
      "• Compare this pattern to other countries for the same indicator if data is available.",
      "• Link the numeric change back to real-world effects relevant to this indicator.",
    ];

    setAiInsight(lines.join("\n"));
  };

  // Build a high-quality prompt for ChatGPT (or any LLM) – no API key needed.
  const generateLlmPromptForChatGPT = async () => {
    if (!generated || chartData.length === 0 || seriesA.length === 0) {
      setAiInsight(
        [
          "Please generate graphs & data first.",
          "",
          '1. Click "Generate graphs & data" above.',
          "2. Make sure a health indicator and at least one country/region are selected.",
          "3. Then try 'Copy LLM prompt for ChatGPT' again.",
        ].join("\n")
      );
      return;
    }

    const seriesAString = seriesA
      .map((p) => `${p.year}: ${p.value}`)
      .join(", ");

    const seriesBString =
      seriesB.length > 0 && selectedCountryB
        ? seriesB.map((p) => `${p.year}: ${p.value}`).join(", ")
        : "";

    const comparisonText =
      seriesB.length > 0 && selectedCountryB
        ? `\n\nFor ${selectedCountryB}, the indicator series is:\n${seriesBString}\n\nPlease compare ${selectedCountryA} and ${selectedCountryB} clearly.`
        : "\n\nNo comparison country was provided; focus on a clear analysis for the primary country only.";

    const prompt = [
      "You are an expert public health data analyst.",
      "You are given a world health indicator time series from 2000 to 2023, taken from a cleaned CSV dataset used in a student dashboard project.",
      "",
      `Indicator: ${selectedIndicator}`,
      `Country/Region A: ${selectedCountryA}`,
      `Time series for ${selectedCountryA}:`,
      seriesAString,
      comparisonText,
      "",
      "TASK:",
      "Write a clear, accurate, student-friendly narrative (no more than about 3 short paragraphs) that:",
      "1. Describes the overall trend over time (increasing/decreasing/stable) and any important spikes or drops.",
      "2. Interprets what this might mean in real-world terms (e.g. births, deaths, life expectancy or the meaning of the indicator).",
      "3. If a comparison country was provided, compares the two countries honestly and highlights key differences or similarities.",
      "4. Avoids guessing specific causes unless they are very generic (e.g. 'policy changes', 'economic conditions', 'health system strength').",
      "5. Avoids making up any numbers not present in the data – use only qualitative language about direction and relative levels.",
      "",
      "Keep the tone neutral and analytical, suitable for a college assignment.",
    ].join("\n");

    setAiInsight(prompt);

    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      // Clipboard not available – the prompt is still shown in the textarea for manual copy.
      setCopiedPrompt(false);
    }
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

            {/* Indicator selection */}
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
                List built directly from the CSV (no separate
                unique_series_names file needed).
              </p>
            </div>

            {/* Country A selection */}
            <div className="control-group" style={{ maxWidth: "220px" }}>
              <label>Country / region A</label>
              <select
                value={selectedCountryA}
                onChange={handleCountryAChange}
                disabled={loadingData || !!loadError}
              >
                {effectiveCountryOptions.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Primary country/region for analysis.
              </p>
            </div>

            {/* Country B selection */}
            <div className="control-group" style={{ maxWidth: "220px" }}>
              <label>Country / region B (comparison)</label>
              <select
                value={selectedCountryB}
                onChange={handleCountryBChange}
                disabled={loadingData || !!loadError}
              >
                <option value="">(None)</option>
                {effectiveCountryOptions.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Optional comparison line on the same chart.
              </p>
            </div>
          </div>

          {/* Actions row */}
          <div className="controls-row" style={{ marginTop: "16px" }}>
            <div className="control-group" style={{ maxWidth: "260px" }}>
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
                  !selectedCountryA
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
                1) Generate graphs. 2) Use them as evidence in your report. 3)
                Download the PDF template if needed.
              </p>
            </div>

            {/* Quick stat cards (placeholders) */}
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
                  <strong>{selectedCountryA}</strong>
                  {selectedCountryB ? (
                    <>
                      {" "}
                      (solid line) compared with{" "}
                      <strong>{selectedCountryB}</strong> (dashed line)
                    </>
                  ) : null}{" "}
                  using values from <strong>Data_Cleaned.csv</strong>.
                </>
              ) : (
                <>
                  No data was found in the cleaned dataset for this combination
                  of indicator and countries. Try selecting different
                  combinations.
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
                  {/* Country A line */}
                  <Line
                    type="monotone"
                    dataKey="valueA"
                    name={selectedCountryA}
                    stroke="#1b4965"
                    strokeWidth={2}
                    dot
                    connectNulls
                  />
                  {/* Country B line, if any */}
                  {selectedCountryB && seriesB.length > 0 && (
                    <Line
                      type="monotone"
                      dataKey="valueB"
                      name={selectedCountryB}
                      stroke="#e11d48"
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="4 4"
                      connectNulls
                    />
                  )}
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
                indicator and countries/regions, look for:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                <li>
                  Is the trend for <strong>{selectedIndicator}</strong> in{" "}
                  <strong>{selectedCountryA}</strong>{" "}
                  improving, worsening, or stable between 2000 and 2023?
                </li>
                {selectedCountryB && (
                  <li>
                    How does <strong>{selectedCountryA}</strong> compare with{" "}
                    <strong>{selectedCountryB}</strong> – is one consistently
                    higher/lower?
                  </li>
                )}
                <li>
                  Are there any obvious spikes or drops that might indicate
                  policy changes, shocks, or data issues?
                </li>
                <li>
                  What story do these graphs tell that you can write up in your
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
                  className="px-3 py-1.5 rounded-md border text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                >
                  {copiedNotes ? (
                    <>
                      <Check className="h-3 w-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy notes
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              value={reportNotes}
              onChange={(e) => {
                setReportNotes(e.target.value);
                setCopiedNotes(false);
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

          {/* AI insight block */}
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" />
                AI insight
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={generateAiInsightLocal}
                  className="px-3 py-1.5 rounded-md bg-slate-800 text-white text-xs font-medium hover:bg-slate-900 transition"
                >
                  Local summary
                </button>
                <button
                  type="button"
                  onClick={generateLlmPromptForChatGPT}
                  className="px-3 py-1.5 rounded-md bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition inline-flex items-center gap-1"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="h-3 w-3" />
                      Prompt copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy LLM prompt
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              value={aiInsight}
              readOnly
              rows={8}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-gray-100/70 focus:outline-none resize-vertical"
              placeholder="Click 'Local summary' for a built-in explanation, or 'Copy LLM prompt' to copy a ready-made prompt you can paste into ChatGPT and use in your report..."
            />

            <p className="text-[11px] text-gray-500">
              The local summary is generated with simple logic using your data.
              The LLM prompt option does not call any API – it just prepares a
              high-quality prompt using your real time series, so you can paste
              it into ChatGPT (or any LLM) yourself without exposing an API key.
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
