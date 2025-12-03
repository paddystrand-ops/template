// src/app/dashboard/page.tsx
"use client";

import { Globe2, Activity, TrendingUp, Users, AlertCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const globalCasesData = [
  { year: "2018", cases: 120 },
  { year: "2019", cases: 140 },
  { year: "2020", cases: 320 },
  { year: "2021", cases: 280 },
  { year: "2022", cases: 220 },
  { year: "2023", cases: 190 },
];

export default function DashboardPage() {
  const stats = [
    { label: "Total Cases", icon: Activity },
    { label: "Active Cases", icon: AlertCircle },
    { label: "Recovered", icon: TrendingUp },
    { label: "Mortality Rate", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
              <Globe2 className="h-7 w-7 text-blue-600" />
              World Health Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Placeholder dashboard for global health statistics. Real data and
              LLM predictions will be added later.
            </p>
          </div>
          <span className="text-xs text-gray-500">
            Status: <span className="font-semibold">Prototype / Skeleton</span>
          </span>
        </header>

        {/* Stats cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow border border-gray-100 p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="mt-2 h-6 w-20 rounded bg-gray-100 animate-pulse" />
                <p className="text-[11px] text-gray-400 mt-2">
                  Placeholder – connect to WHO / World Bank later.
                </p>
              </div>
              <stat.icon className="h-7 w-7 text-blue-600" />
            </div>
          ))}
        </section>

        {/* Chart */}
        <section className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-1">
            Global Cases (Dummy Data)
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            This line chart uses static dummy data as a placeholder. Later you’ll
            replace it with real world health data and LLM-based predictions.
          </p>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={globalCasesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="cases"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* AI placeholder */}
        <section className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-1">AI Predictions</h2>
          <p className="text-sm text-gray-500 mb-3">
            This section will later connect to an LLM (e.g. GPT-4o or local
            Llama) to generate forecasts and narrative analysis.
          </p>
          <div className="w-full h-20 rounded-xl bg-gray-100 animate-pulse" />
        </section>
      </div>
    </div>
  );
}
