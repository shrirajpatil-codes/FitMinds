import React, { useState, useEffect } from 'react';
import { Flame, Calendar, Award, CheckCircle, Info } from 'lucide-react';
import { Card } from '../common/Card';
import { api } from '../../services/api';

export const ActivityHeatmap = ({ className }) => {
  const [heatmapData, setHeatmapData] = useState({});
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [totalActiveDays, setTotalActiveDays] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      const res = await api.profile.getHeatmap();
      if (res && res.success && res.data) {
        setHeatmapData(res.data.heatmapData || {});
        setTotalSubmissions(res.data.totalSubmissions || 0);
        setTotalActiveDays(res.data.totalActiveDays || 0);
        setCurrentStreak(res.data.currentStreak || 0);
        setMaxStreak(res.data.maxStreak || 0);
      }
    } catch (err) {
      console.warn('Failed to load activity heatmap:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate 52 weeks (364 days) ending on today
  const generateGridWeeks = () => {
    const weeks = [];
    const today = new Date();
    
    // Find the ending Saturday of current week to make full column alignment
    const endDay = new Date(today);
    const dayOfWeek = endDay.getDay();
    endDay.setDate(endDay.getDate() + (6 - dayOfWeek));

    // Go back 52 weeks (364 days)
    const startDate = new Date(endDay);
    startDate.setDate(startDate.getDate() - (52 * 7 - 1));

    let currentDate = new Date(startDate);

    for (let w = 0; w < 52; w++) {
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const isFuture = currentDate > today;
        const count = isFuture ? 0 : (heatmapData[dateStr] || 0);

        weekDays.push({
          dateStr,
          dateObj: new Date(currentDate),
          count,
          isFuture
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(weekDays);
    }
    return weeks;
  };

  const weeks = generateGridWeeks();

  // Generate Month Header Labels
  const getMonthLabels = () => {
    const months = [];
    let lastMonth = -1;

    weeks.forEach((week, wIndex) => {
      const firstDayOfWeek = week[0].dateObj;
      const month = firstDayOfWeek.getMonth();
      if (month !== lastMonth && wIndex % 4 === 0) {
        months.push({
          name: firstDayOfWeek.toLocaleString('default', { month: 'short' }),
          colIndex: wIndex
        });
        lastMonth = month;
      }
    });
    return months;
  };

  const monthLabels = getMonthLabels();

  const getIntensityClass = (count, isFuture) => {
    if (isFuture) return 'bg-slate-950/40 border-slate-900 cursor-not-allowed opacity-30';
    if (count === 0) return 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700';
    if (count === 1) return 'bg-orange-500/40 border-orange-500/60 shadow-orange-glow-sm';
    if (count === 2) return 'bg-orange-500 border-orange-400 shadow-orange-glow';
    return 'bg-amber-600 border-amber-400 shadow-orange-glow-lg font-bold';
  };

  const handleMouseEnter = (e, day) => {
    if (day.isFuture) return;
    const formattedDate = day.dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const text = `${day.count} submission${day.count === 1 ? '' : 's'} on ${formattedDate}`;
    
    const rect = e.target.getBoundingClientRect();
    setTooltip({
      visible: true,
      text,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, text: '', x: 0, y: 0 });
  };

  return (
    <Card variant="default" className={`p-5 space-y-4 ${className}`}>
      {/* Top Header Row (LeetCode Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Flame className="w-5 h-5 fill-orange-500/20" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <span>{totalSubmissions} submissions in the past year</span>
              <Info className="w-3.5 h-3.5 text-slate-500" />
            </h3>
            <p className="text-xs text-slate-400">LeetCode-style workout & daily check-in activity matrix</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="text-slate-400">
            Total active days: <strong className="text-slate-100">{totalActiveDays}</strong>
          </div>
          <div className="text-slate-400">
            Max streak: <strong className="text-slate-100">{maxStreak}</strong>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold flex items-center gap-1.5 shadow-orange-glow-sm">
            <Flame className="w-4 h-4 fill-orange-400" />
            <span>Streak: {currentStreak} days</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Section */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[680px]">
          {/* Month Labels Header */}
          <div className="flex text-[10px] text-slate-400 font-medium mb-1.5 pl-6">
            {monthLabels.map((m, idx) => (
              <div
                key={idx}
                style={{ marginLeft: idx === 0 ? 0 : `${(m.colIndex - (monthLabels[idx - 1]?.colIndex || 0)) * 12.5 - 20}px` }}
              >
                {m.name}
              </div>
            ))}
          </div>

          {/* Grid Rows (7 Days per week x 52 Weeks) */}
          <div className="flex items-start gap-1">
            {/* Day of Week Labels */}
            <div className="grid grid-rows-7 gap-[3px] text-[9px] text-slate-500 pr-1.5 select-none pt-[1px]">
              <span className="h-[10px] leading-[10px]"></span>
              <span className="h-[10px] leading-[10px]">Mon</span>
              <span className="h-[10px] leading-[10px]"></span>
              <span className="h-[10px] leading-[10px]">Wed</span>
              <span className="h-[10px] leading-[10px]"></span>
              <span className="h-[10px] leading-[10px]">Fri</span>
              <span className="h-[10px] leading-[10px]"></span>
            </div>

            {/* 52 Columns */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="grid grid-rows-7 gap-[3px]">
                  {week.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      onMouseEnter={(e) => handleMouseEnter(e, day)}
                      onMouseLeave={handleMouseLeave}
                      className={`w-[10px] h-[10px] rounded-[2px] border transition-all duration-150 ${getIntensityClass(
                        day.count,
                        day.isFuture
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Legend */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-4 pt-2 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500">Every workout completed & daily check-in turns squares deeper orange 🔥</span>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px]">Less</span>
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-900 border border-slate-800" title="0 submissions" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-orange-500/40 border border-orange-500/60" title="1 submission" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-orange-500 border border-orange-400" title="2 submissions" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-amber-600 border border-amber-400" title="3+ submissions" />
              </div>
              <span className="text-[10px]">More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full px-2.5 py-1 bg-slate-950 border border-orange-500/40 text-slate-100 text-[11px] font-medium rounded-lg shadow-xl pointer-events-none transition-all duration-75"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
        >
          {tooltip.text}
        </div>
      )}
    </Card>
  );
};
