'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Sparkles, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui';

interface DataPoint {
  day: string;
  points: number;
  velocity: number;
}

const WEEKLY_DATA: DataPoint[] = [
  { day: 'Mon', points: 12, velocity: 14 },
  { day: 'Tue', points: 19, velocity: 18 },
  { day: 'Wed', points: 15, velocity: 22 },
  { day: 'Thu', points: 28, velocity: 24 },
  { day: 'Fri', points: 24, velocity: 26 },
  { day: 'Sat', points: 34, velocity: 30 },
  { day: 'Sun', points: 38, velocity: 32 },
];

export const SprintPerformanceChart: React.FC = () => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(5); // default hover on high point

  // SVG dimensions
  const width = 500;
  const height = 180;
  const paddingX = 35;
  const paddingY = 25;

  const maxVal = 45;
  const minVal = 0;

  const getX = (index: number) => paddingX + (index / (WEEKLY_DATA.length - 1)) * (width - paddingX * 2);
  const getY = (val: number) => height - paddingY - ((val - minVal) / (maxVal - minVal)) * (height - paddingY * 2);

  // Generate smooth SVG Bézier path
  const createSmoothPath = (dataKey: 'points' | 'velocity') => {
    const points = WEEKLY_DATA.map((d, i) => ({ x: getX(i), y: getY(d[dataKey]) }));
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const pointsPath = createSmoothPath('points');
  const velocityPath = createSmoothPath('velocity');

  // Area path for gradient under points
  const pointsAreaPath = `${pointsPath} L ${getX(WEEKLY_DATA.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`;

  return (
    <Card className="flex flex-col p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight text-slate-900">
              Sprint Performance & Velocity
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 border border-emerald-200/60">
              <TrendingUp className="h-3 w-3" />
              +24%
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">Weekly story points delivered across pods</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 mr-2">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-600" /> Points
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-400" /> Velocity
            </span>
          </div>
          <Link
            href="/sprints"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5851d8] bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 hover:bg-indigo-100/70 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-[#5851d8]" /> Sprint 2
          </Link>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden mt-1 select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 15, 30, 45].map((val) => (
            <line
              key={val}
              x1={paddingX}
              y1={getY(val)}
              x2={width - paddingX}
              y2={getY(val)}
              stroke="#F1F5F9"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          ))}

          {/* Shaded Area */}
          <path d={pointsAreaPath} fill="url(#chartGradient)" />

          {/* Secondary Line (Velocity Target) */}
          <path
            d={velocityPath}
            fill="none"
            stroke="#A5B4FC"
            strokeWidth="2"
            strokeDasharray="3 3"
          />

          {/* Primary Line (Delivered Points) */}
          <path
            d={pointsPath}
            fill="none"
            stroke="url(#strokeGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Data Nodes & Interactive Tooltips */}
          {WEEKLY_DATA.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.points);
            const isHovered = hoverIndex === i;

            return (
              <g key={d.day} className="cursor-pointer" onMouseEnter={() => setHoverIndex(i)}>
                {/* Vertical guide line on hover */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={paddingY}
                    x2={cx}
                    y2={height - paddingY}
                    stroke="#E2E8F0"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Day Labels */}
                <text
                  x={cx}
                  y={height - 6}
                  textAnchor="middle"
                  className={`text-[10px] font-medium transition-colors ${
                    isHovered ? 'fill-[#5851d8] font-bold' : 'fill-slate-400'
                  }`}
                >
                  {d.day}
                </text>

                {/* Node Outer Circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5.5 : 3.5}
                  className={`transition-all ${
                    isHovered
                      ? 'fill-white stroke-blue-600 stroke-[2.5px] drop-shadow-md'
                      : 'fill-blue-600 stroke-white stroke-[1.5px]'
                  }`}
                />

                {/* Hover Tooltip Popup */}
                {isHovered && (
                  <g transform={`translate(${cx}, ${cy - 12})`}>
                    <rect
                      x="-28"
                      y="-24"
                      width="56"
                      height="20"
                      rx="6"
                      fill="#0F172A"
                      className="drop-shadow-lg"
                    />
                    <text
                      x="0"
                      y="-10"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      className="text-[10px] font-bold"
                    >
                      {d.points} pts
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Insight */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5 text-slate-600">
          Peak sprint throughput achieved on <strong className="text-slate-900">Sunday (38 pts)</strong>
        </span>
        <Link
          href="/analytics"
          className="font-medium text-[#5851d8] hover:underline cursor-pointer flex items-center gap-0.5"
        >
          Full Report <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
};
