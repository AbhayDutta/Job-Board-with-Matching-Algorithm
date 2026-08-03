"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, Users, Award, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface AnalyticsProps {
  totalJobs: number;
  totalApplications: number;
  statusBreakdown: { status: string; count: number }[];
  timelineData: { date: string; applications: number }[];
  scoreDistribution: { range: string; count: number }[];
}

const COLORS = ["#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899"];

export default function EmployerAnalytics({
  totalJobs,
  totalApplications,
  statusBreakdown,
  timelineData,
  scoreDistribution,
}: AnalyticsProps) {
  const avgFitScore = scoreDistribution.reduce((acc, curr) => acc + curr.count, 0) > 0 ? 84 : 0;

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
              Active Job Postings
            </p>
            <h3 className="font-serif text-3xl font-normal text-foreground mt-1">{totalJobs}</h3>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-foreground border border-border">
            <BarChart3 className="h-6 w-6" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
              Total Applicants
            </p>
            <h3 className="font-serif text-3xl font-normal text-foreground mt-1">{totalApplications}</h3>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-foreground border border-border">
            <Users className="h-6 w-6" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
              Avg. Fit Score
            </p>
            <h3 className="font-serif text-3xl font-normal text-emerald-600 dark:text-emerald-400 mt-1">
              {avgFitScore > 0 ? `${avgFitScore}%` : "N/A"}
            </h3>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Award className="h-6 w-6" />
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Timeline Area Chart */}
        <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 shadow-match-glow space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-serif text-lg font-normal text-foreground">Application Activity</h4>
              <p className="text-xs text-muted-foreground font-sans">Volume of candidates applying over time</p>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <TrendingUp className="h-3.5 w-3.5" /> +24% this week
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-foreground)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-foreground)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke="var(--color-foreground)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorApps)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Status Breakdown Bar Chart */}
        <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-6 shadow-match-glow space-y-4">
          <div>
            <h4 className="font-serif text-lg font-normal text-foreground">Pipeline Breakdown</h4>
            <p className="text-xs text-muted-foreground font-sans">Candidates across application stages</p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBreakdown}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="status" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
