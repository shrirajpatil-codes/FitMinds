import React, { useState, useEffect } from 'react';
import { Flame, Info } from 'lucide-react';
import { Card } from '../common/Card';
import { api } from '../../services/api';

export const ActivityHeatmap = ({ className }) => {
  const [heatmapData, setHeatmapData] = useState({});
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [totalActiveDays, setTotalActiveDays] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });

  useEffect(() => {
    fetchHeatmapData();

    // Listen for live activity events across the app
    const handleActivityUpdate = () => {
      fetchHeatmapData();
    };

    window.addEventListener('fitminds_activity_updated', handleActivityUpdate);
    return () => {
      window.removeEventListener('fitminds_activity_updated', handleActivityUpdate);
    };
  }, []);

  const fetchHeatmapData = async () => {
    try {
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
    }
  };

  // Helper to format date as YYYY-MM-DD in local time
  const getLocalDateStr = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Build Month-Clustered Grid structure (LeetCode Style)
  const generateMonthBlocks = () => {
    const today = new Date();
    const monthBlocks = [];

    // Past 12 months starting from 11 months ago to current month
    for (let mOffset = 11; mOffset >= 0; mOffset--) {
      const targetMonth = new Date(today.getFullYear(), today.getMonth() - mOffset, 1);
      const year = targetMonth.getFullYear();
      const monthIndex = targetMonth.getMonth();
      const monthName = targetMonth.toLocaleString('default', { month: 'short' });

      // First day and last day of target month
      const firstDay = new Date(year, monthIndex, 1);
      const lastDay = new Date(year, monthIndex + 1, 0);

      // Align start date to Sunday of the first week of month
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - startDate.getDay());

      // Align end date to Saturday of the last week of month
      const endDate = new Date(lastDay);
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

      const weeksInMonth = [];
      let cur = new Date(startDate);

      while (cur <= endDate) {
        const weekDays = [];
        for (let d = 0; d < 7; d++) {
          const dateStr = getLocalDateStr(cur);
          const isCurrentMonth = cur.getMonth() === monthIndex;
          const isFuture = cur > today;
          const count = (!isCurrentMonth || isFuture) ? 0 : (heatmapData[dateStr] || 0);

          weekDays.push({
            dateStr,
            dateObj: new Date(cur),
            count,
            isCurrentMonth,
            isFuture
          });
          cur.setDate(cur.getDate() + 1);
        }
        weeksInMonth.push(weekDays);
      }

      monthBlocks.push({
        monthName,
        year,
        weeks: weeksInMonth
      });
    }

    return monthBlocks;
  };

  const monthBlocks = generateMonthBlocks();

  const getSquareStyle = (day) => {
    if (!day.isCurrentMonth || day.isFuture) {
      return 'bg-slate-950/40 border-slate-900/60 opacity-20';
    }
    if (day.count === 0) {
      return 'bg-[#18202c] border-[#222f42] hover:border-slate-600';
    }
    if (day.count === 1) {
      return 'bg-[#fb923c] border-[#f97316] shadow-orange-glow-sm cursor-pointer';
    }
    if (day.count === 2) {
      return 'bg-[#f97316] border-[#ea580c] shadow-orange-glow cursor-pointer';
    }
    return 'bg-[#ea580c] border-[#c2410c] shadow-orange-glow-lg font-bold cursor-pointer';
  };

  const handleMouseEnter = (e, day) => {
    if (!day.isCurrentMonth || day.isFuture) return;
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
    <Card variant="default" className={`p-5 sm:p-6 space-y-4 ${className}`}>
      {/* Top LeetCode Statistics Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
            <span>{totalSubmissions} submissions in the past one year</span>
            <Info className="w-4 h-4 text-slate-500 hover:text-slate-300 transition-colors" />
          </h3>
        </div>

        <div className="flex items-center gap-5 text-xs font-semibold">
          <div className="text-slate-400">
            Total active days: <strong className="text-slate-100 font-bold">{totalActiveDays}</strong>
          </div>
          <div className="text-slate-400">
            Max streak: <strong className="text-slate-100 font-bold">{maxStreak}</strong>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold flex items-center gap-1.5 shadow-orange-glow-sm">
            <Flame className="w-4 h-4 fill-orange-400" />
            <span>Streak: {currentStreak} days</span>
          </div>
        </div>
      </div>

      {/* LeetCode Month-Clustered Heatmap Container */}
      <div className="overflow-x-auto pb-3 pt-1 scrollbar-thin">
        <div className="min-w-[760px]">
          <div className="flex items-end gap-3">
            {monthBlocks.map((mBlock, mIdx) => (
              <div key={mIdx} className="flex flex-col items-center gap-1">
                {/* 7-Row Grid per Month Block */}
                <div className="flex gap-[3px]">
                  {mBlock.weeks.map((week, wIdx) => (
                    <div key={wIdx} className="grid grid-rows-7 gap-[3px]">
                      {week.map((day, dIdx) => (
                        <div
                          key={dIdx}
                          onMouseEnter={(e) => handleMouseEnter(e, day)}
                          onMouseLeave={handleMouseLeave}
                          className={`w-[11px] h-[11px] rounded-[2px] border transition-all duration-150 ${getSquareStyle(
                            day
                          )}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Month Name Label Centered Under Block */}
                <span className="text-[11px] font-medium text-slate-400 mt-1">
                  {mBlock.monthName}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Legend */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-400">
              Completing workouts, check-ins or reflections turns squares vibrant orange 🔥
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500">Less</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-[2px] bg-[#18202c] border border-[#222f42]" title="0 submissions" />
                <div className="w-3 h-3 rounded-[2px] bg-[#fb923c] border border-[#f97316]" title="1 submission" />
                <div className="w-3 h-3 rounded-[2px] bg-[#f97316] border border-[#ea580c]" title="2 submissions" />
                <div className="w-3 h-3 rounded-[2px] bg-[#ea580c] border border-[#c2410c]" title="3+ submissions" />
              </div>
              <span className="text-[10px] text-slate-500">More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full px-3 py-1.5 bg-slate-950 border border-orange-500/50 text-slate-100 text-[11px] font-semibold rounded-lg shadow-2xl pointer-events-none transition-all duration-75"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
        >
          {tooltip.text}
        </div>
      )}
    </Card>
  );
};
