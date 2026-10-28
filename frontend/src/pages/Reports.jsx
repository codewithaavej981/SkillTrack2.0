import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Printer,
  Download,
  Calendar,
  RefreshCw,
  Award,
  Target,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";

import PageHead from "../components/PageHead";
import Button from "../components/Button";
import Progress from "../components/Progress";
import Notice from "../components/Notice";
import { getReportData } from "../services/reportService";
import { useAuth } from "../context/AuthContext";

const REPORT_TYPES = [
  { id: "overall", label: "Overall Progress", icon: TrendingUp },
  { id: "skills", label: "Skill Progress", icon: Award },
  { id: "goals", label: "Goal Completion", icon: Target },
  { id: "learning", label: "Learning Library", icon: BookOpen },
];

const PRESETS = [
  { id: "all", label: "All Time" },
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "90d", label: "Last 90 Days" },
  { id: "year", label: "This Year" },
  { id: "custom", label: "Custom Range" },
];

const CATEGORY_COLORS = {
  Development: "#6956e7",
  Design: "#24a47f",
  Analytics: "#ef8b45",
  Leadership: "#d6547d",
  Cybersecurity: "#0ea5e9",
  "AI / ML": "#8b5cf6",
  Other: "#64748b",
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
};

export default function Reports() {
  const { user } = useAuth();
  const [reportType, setReportType] = useState("overall");
  const [preset, setPreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Calculate start and end date based on preset
  const getDateRangeForPreset = useCallback((presetId) => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    if (presetId === "7d") {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      return { start: past.toISOString().split("T")[0], end: todayStr };
    }
    if (presetId === "30d") {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      return { start: past.toISOString().split("T")[0], end: todayStr };
    }
    if (presetId === "90d") {
      const past = new Date();
      past.setDate(past.getDate() - 90);
      return { start: past.toISOString().split("T")[0], end: todayStr };
    }
    if (presetId === "year") {
      const startOfYear = `${now.getFullYear()}-01-01`;
      return { start: startOfYear, end: todayStr };
    }
    return { start: "", end: "" };
  }, []);

  const fetchReport = useCallback(
    async (type, start, end) => {
      try {
        setLoading(true);
        setError("");
        const res = await getReportData({
          type,
          startDate: start || undefined,
          endDate: end || undefined,
        });

        if (res?.success && res?.data) {
          setReport(res.data);
        } else {
          setError("Failed to retrieve report data from workspace server.");
        }
      } catch (err) {
        console.error("Failed to load report:", err);
        const serverMessage =
          typeof err.response?.data?.message === "string"
            ? err.response.data.message
            : typeof err.response?.data === "string"
            ? (err.response.status === 404
                ? "Report API endpoint not found (HTTP 404). Please ensure the backend server has loaded latest routes."
                : err.response.statusText)
            : null;

        setError(
          serverMessage ||
            err.message ||
            "Unable to generate report. Please verify your connection."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Auto-dismiss transient notices after 4.5 seconds
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (preset !== "custom") {
      const { start, end } = getDateRangeForPreset(preset);
      setStartDate(start);
      setEndDate(end);
      fetchReport(reportType, start, end);
    }
  }, [reportType, preset, getDateRangeForPreset, fetchReport]);

  const handleApplyCustomRange = (e) => {
    e.preventDefault();
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after end date.");
      return;
    }
    fetchReport(reportType, startDate, endDate);
  };

  const handlePrint = () => {
    try {
      if (!report || !hasData) {
        setError("Cannot print an empty report. Please ensure report data is loaded.");
        return;
      }
      window.print();
    } catch (err) {
      console.error("Print dialog invocation failed:", err);
      setError("Failed to open print dialog: " + (err.message || "Unknown error"));
    }
  };

  const handleExportCSV = () => {
    try {
      if (!report) {
        setError("Report data is unavailable to export.");
        return;
      }

      const sanitizeForFilename = (str) =>
        String(str || "all").toLowerCase().replace(/[^a-z0-9_-]/g, "_");

      const dateStr = new Date().toISOString().slice(0, 10);
      const periodSlug = sanitizeForFilename(report.period?.label || preset);
      const filename = `SkillTracker_${reportType.toUpperCase()}_Report_${periodSlug}_${dateStr}.csv`;

      const escapeCSV = (value) => {
        if (value === null || value === undefined) return '""';
        const str = String(value).replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/"/g, '""');
        return `"${str}"`;
      };

      let csvContent = "";

      if (reportType === "skills") {
        const headers = ["Skill Name", "Category", "Level", "Progress (%)", "Target Date", "Description", "Created Date", "Last Updated"];
        const rows = (report.skills?.items || []).map((s) => [
          escapeCSV(s.name),
          escapeCSV(s.category),
          escapeCSV(s.level),
          s.progress ?? 0,
          escapeCSV(formatDate(s.targetDate)),
          escapeCSV(s.description),
          escapeCSV(formatDate(s.createdAt)),
          escapeCSV(formatDate(s.updatedAt)),
        ]);
        csvContent = [headers.map(escapeCSV).join(","), ...rows.map((r) => r.join(","))].join("\r\n");
      } else if (reportType === "goals") {
        const headers = ["Goal Title", "Category", "Progress (%)", "Status", "Deadline", "Description", "Created Date", "Last Updated"];
        const rows = (report.goals?.items || []).map((g) => [
          escapeCSV(g.title),
          escapeCSV(g.category),
          g.progress ?? 0,
          escapeCSV(g.completed ? "Completed" : g.isOverdue ? "Overdue" : "In Progress"),
          escapeCSV(formatDate(g.deadline)),
          escapeCSV(g.description),
          escapeCSV(formatDate(g.createdAt)),
          escapeCSV(formatDate(g.updatedAt)),
        ]);
        csvContent = [headers.map(escapeCSV).join(","), ...rows.map((r) => r.join(","))].join("\r\n");
      } else if (reportType === "learning") {
        const headers = ["Resource Title", "Source", "Category", "Progress (%)", "Status", "Resource URL", "Created Date", "Last Updated"];
        const rows = (report.learning?.items || []).map((r) => [
          escapeCSV(r.title),
          escapeCSV(r.source),
          escapeCSV(r.category),
          r.progress ?? 0,
          escapeCSV(r.completed ? "Completed" : (r.progress || 0) > 0 ? "In Progress" : "Not Started"),
          escapeCSV(r.url),
          escapeCSV(formatDate(r.createdAt)),
          escapeCSV(formatDate(r.updatedAt)),
        ]);
        csvContent = [headers.map(escapeCSV).join(","), ...rows.map((r) => r.join(","))].join("\r\n");
      } else {
        // Overall Report CSV: Executive metrics followed by itemized sections
        const metaRows = [
          ["Report Type", "Overall Performance Summary"],
          ["Prepared For", `${report.user?.name || "Member"} (${report.user?.email || ""})`],
          ["Period", report.period?.label || "All Time"],
          ["Generated At", formatDateTime(report.generatedAt)],
          ["Overall Composite Progress (%)", report.summary?.overallProgress ?? 0],
          ["Total Skills Tracked", report.summary?.totalSkills ?? 0],
          ["Average Skill Proficiency (%)", report.summary?.avgSkillProgress ?? 0],
          ["Total Goals", report.summary?.totalGoals ?? 0],
          ["Completed Goals", report.summary?.completedGoals ?? 0],
          ["In Progress Goals", report.summary?.inProgressGoals ?? 0],
          ["Goal Completion Rate (%)", `${report.summary?.goalCompletionRate ?? 0}%`],
          ["Average Goal Progress (%)", `${report.summary?.avgGoalProgress ?? 0}%`],
          ["Total Learning Resources", report.summary?.totalResources ?? 0],
          ["Completed Learning Resources", report.summary?.completedResources ?? 0],
          ["In Progress Learning Resources", report.summary?.inProgressResources ?? 0],
          ["Learning Completion Rate (%)", `${report.summary?.learningCompletionRate ?? 0}%`],
          ["Average Learning Progress (%)", `${report.summary?.avgLearningProgress ?? 0}%`],
        ];

        const parts = [metaRows.map((r) => r.map(escapeCSV).join(",")).join("\r\n")];

        if ((report.skills?.items || []).length > 0) {
          const skillHeaders = ["Skill Name", "Category", "Level", "Progress (%)", "Target Date"];
          const skillRows = report.skills.items.map((s) => [
            escapeCSV(s.name),
            escapeCSV(s.category),
            escapeCSV(s.level),
            s.progress ?? 0,
            escapeCSV(formatDate(s.targetDate)),
          ]);
          parts.push(
            "\r\n" + escapeCSV("=== SKILLS BREAKDOWN ==="),
            [skillHeaders.map(escapeCSV).join(","), ...skillRows.map((r) => r.join(","))].join("\r\n")
          );
        }

        if ((report.goals?.items || []).length > 0) {
          const goalHeaders = ["Goal Title", "Category", "Progress (%)", "Status", "Deadline"];
          const goalRows = report.goals.items.map((g) => [
            escapeCSV(g.title),
            escapeCSV(g.category),
            g.progress ?? 0,
            escapeCSV(g.completed ? "Completed" : g.isOverdue ? "Overdue" : "In Progress"),
            escapeCSV(formatDate(g.deadline)),
          ]);
          parts.push(
            "\r\n" + escapeCSV("=== GOALS BREAKDOWN ==="),
            [goalHeaders.map(escapeCSV).join(","), ...goalRows.map((r) => r.join(","))].join("\r\n")
          );
        }

        if ((report.learning?.items || []).length > 0) {
          const learningHeaders = ["Resource Title", "Source", "Category", "Progress (%)", "Status", "Resource URL"];
          const learningRows = report.learning.items.map((r) => [
            escapeCSV(r.title),
            escapeCSV(r.source),
            escapeCSV(r.category),
            r.progress ?? 0,
            escapeCSV(r.completed ? "Completed" : (r.progress || 0) > 0 ? "In Progress" : "Not Started"),
            escapeCSV(r.url),
          ]);
          parts.push(
            "\r\n" + escapeCSV("=== LEARNING RESOURCES BREAKDOWN ==="),
            [learningHeaders.map(escapeCSV).join(","), ...learningRows.map((r) => r.join(","))].join("\r\n")
          );
        }

        csvContent = parts.join("\r\n");
      }

      // Add UTF-8 Byte Order Mark (\uFEFF) for Microsoft Excel compatibility
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setNotice(`Exported ${filename} successfully.`);
    } catch (err) {
      console.error("CSV Export failure:", err);
      setError("Failed to export CSV: " + (err.message || "Unknown error"));
    }
  };

  const summary = report?.summary || {};
  const skills = report?.skills || { items: [], strengths: [], needsImprovement: [] };
  const goals = report?.goals || { items: [] };
  const learning = report?.learning || { items: [] };

  const skillCount = report?.skills?.items?.length || 0;
  const goalCount = report?.goals?.items?.length || 0;
  const learningCount = report?.learning?.items?.length || 0;

  const hasData = Boolean(
    report &&
      (reportType === "skills"
        ? skillCount > 0
        : reportType === "goals"
        ? goalCount > 0
        : reportType === "learning"
        ? learningCount > 0
        : skillCount > 0 || goalCount > 0 || learningCount > 0)
  );

  const exportDisabledReason = loading
    ? "Compiling live report metrics... Exports will be enabled once loaded."
    : !report
    ? "Report data is unavailable. Please verify connection and retry."
    : !hasData
    ? `No ${reportType === "overall" ? "workspace" : reportType} records found matching the selected period to export.`
    : "";

  return (
    <>
      <div className="reports-page-head">
        <PageHead
          label="REPORTS & EXPORTS"
          title="Performance & Progress Reports"
          text="Generate, preview, and export high-fidelity reports grounded in your live MongoDB records."
          action={
            <div className="reports-top-actions">
              {!loading && !hasData && (
                <span className="export-disabled-hint" title={exportDisabledReason}>
                  Exports disabled (no records in period)
                </span>
              )}

              <div
                className="export-btn-container"
                title={exportDisabledReason || "Print or Save as PDF via browser print dialog"}
              >
                <Button
                  type="button"
                  className="btn-print-report"
                  onClick={handlePrint}
                  disabled={loading || !hasData}
                >
                  <Printer size={15} />
                  <span>Print / Save PDF</span>
                </Button>
              </div>

              <div
                className="export-btn-container"
                title={exportDisabledReason || "Download active report dataset as CSV spreadsheet"}
              >
                <Button
                  type="button"
                  className="btn-csv-report"
                  variant="secondary"
                  onClick={handleExportCSV}
                  disabled={loading || !hasData}
                >
                  <Download size={15} />
                  <span>Export CSV</span>
                </Button>
              </div>
            </div>
          }
        />
      </div>

      <Notice message={notice} />

      {/* Report Controls (Hidden in Print) */}
      <section className="card reports-controls">
        <div className="reports-type-tabs">
          {REPORT_TYPES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`report-tab-btn ${reportType === id ? "active" : ""}`}
              onClick={() => setReportType(id)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="reports-filter-row">
          <div className="reports-presets">
            <span className="filter-label">
              <Calendar size={14} /> Period:
            </span>
            <div className="pills">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={preset === p.id ? "on" : ""}
                  onClick={() => setPreset(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {preset === "custom" && (
            <form className="reports-custom-dates" onSubmit={handleApplyCustomRange}>
              <div className="date-input-group">
                <label>From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="date-input-group">
                <label>To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="btn-apply-dates">
                Apply
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Error state */}
      {error && !loading && (
        <article className="card reports-error-card">
          <AlertTriangle size={24} style={{ color: "var(--danger, #e5484d)" }} />
          <p>{error}</p>
          <Button
            type="button"
            onClick={() => fetchReport(reportType, startDate, endDate)}
          >
            <RefreshCw size={14} /> Retry
          </Button>
        </article>
      )}

      {/* Loading state */}
      {loading ? (
        <article className="card reports-loading-card">
          <RefreshCw size={24} className="spinning" />
          <p>Compiling live report metrics from your workspace...</p>
        </article>
      ) : !hasData ? (
        /* Empty state */
        <article className="card reports-empty-card">
          <div className="reports-empty-icon">
            <FileText size={32} />
          </div>
          <h3>No records found for this period</h3>
          <p>
            There are no {reportType === "overall" ? "workspace" : reportType}{" "}
            records matching &ldquo;{report?.period?.label || "the selected period"}&rdquo;.
            Add items or adjust your date range to generate a comprehensive report.
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
            {preset !== "all" && (
              <Button variant="secondary" onClick={() => setPreset("all")}>
                Reset to All Time
              </Button>
            )}
            <Link to={reportType === "goals" ? "/goals" : reportType === "learning" ? "/learning" : "/skills"}>
              <Button>
                Add {reportType === "goals" ? "Goals" : reportType === "learning" ? "Resources" : "Skills"}
              </Button>
            </Link>
          </div>
        </article>
      ) : (
        /* Report Printable Document Container */
        <div className="report-document-wrapper">
          <div className="report-print-tip">
            <Printer size={14} />
            <span>
              Tip: Click <b>Print / Save PDF</b> to download as PDF using your browser&rsquo;s print dialog.
            </span>
          </div>

          <article className="card report-document" id="printable-report">
            {/* Report Document Header (Print & Screen View) */}
            <div className="report-doc-header">
              <div className="report-doc-topbar">
                <div className="report-doc-brand">
                  <span className="brand-logo-mark">S</span>
                  <div className="brand-info">
                    <strong className="brand-name">SkillTracker 2.0</strong>
                    <span className="brand-sub">Skill Intelligence &amp; Analytics</span>
                  </div>
                </div>

                <div className="report-doc-badges">
                  <span className="report-doc-status-badge">Official Record</span>
                  <span className="report-type-badge">
                    {REPORT_TYPES.find((t) => t.id === reportType)?.label || "Report"}
                  </span>
                </div>
              </div>

              <div className="report-doc-title-block">
                <h1 className="report-doc-title">
                  {reportType === "skills"
                    ? "Skill Proficiency & Progress Report"
                    : reportType === "goals"
                    ? "Goal Milestone & Completion Report"
                    : reportType === "learning"
                    ? "Curriculum & Learning Progress Report"
                    : "Executive Overall Progress Summary"}
                </h1>
                <p className="report-doc-desc">
                  {reportType === "skills"
                    ? "Comprehensive assessment of active competencies, proficiency distribution, core strengths, and focus areas."
                    : reportType === "goals"
                    ? "Audit of goal milestones, target timelines, completion ratios, and overdue health indicators."
                    : reportType === "learning"
                    ? "Curriculum breakdown covering verified educational platforms, completion status, and ongoing resources."
                    : "Unified performance overview aggregating skill competencies, milestone achievements, and educational progress."}
                </p>
              </div>

              <div className="report-meta-grid">
                <div className="meta-cell">
                  <span className="meta-label">Prepared For</span>
                  <strong className="meta-val">{report.user?.name || user?.name || "Member"}</strong>
                  <span className="meta-sub">{report.user?.email || user?.email}</span>
                </div>

                <div className="meta-cell">
                  <span className="meta-label">Reporting Period</span>
                  <strong className="meta-val">{report.period?.label || "All Time"}</strong>
                  <span className="meta-sub">
                    {report.period?.startDate && report.period?.endDate
                      ? `${formatDate(report.period.startDate)} — ${formatDate(report.period.endDate)}`
                      : "Cumulative workspace records"}
                  </span>
                </div>

                <div className="meta-cell">
                  <span className="meta-label">Generated On</span>
                  <strong className="meta-val">{formatDate(report.generatedAt)}</strong>
                  <span className="meta-sub">
                    {new Date(report.generatedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>

                <div className="meta-cell">
                  <span className="meta-label">Workspace Role</span>
                  <strong className="meta-val">{report.user?.role || user?.role || "SkillTracker Member"}</strong>
                  <span className="meta-sub">Authenticated Member</span>
                </div>
              </div>
            </div>

            {/* KPI Summary Metric Strip */}
            <section className="report-kpi-strip">
              {reportType === "skills" ? (
                <>
                  <div className="report-kpi-card">
                    <span className="kpi-num">{skills.total}</span>
                    <span className="kpi-label">Skills Tracked</span>
                  </div>
                  <div className="report-kpi-card">
                    <span className="kpi-num">{skills.avgProgress}%</span>
                    <span className="kpi-label">Average Proficiency</span>
                  </div>
                  <div className="report-kpi-card">
                    <span className="kpi-num">{skills.strengthsCount || 0}</span>
                    <span className="kpi-label">Strengths (&ge;75%)</span>
                  </div>
                  <div className="report-kpi-card">
                    <span className="kpi-num">{skills.needsImprovementCount || 0}</span>
                    <span className="kpi-label">Needs Improvement (&lt;50%)</span>
                  </div>
                </>
              ) : reportType === "goals" ? (
                <>
                  <div className="report-kpi-card">
                    <span className="kpi-num">{goals.total}</span>
                    <span className="kpi-label">Total Goals</span>
                  </div>
                  <div className="report-kpi-card">
                    <span className="kpi-num">{goals.completed}</span>
                    <span className="kpi-label">Completed</span>
                  </div>
                  <div className="report-kpi-card">
                    <span className="kpi-num">{goals.inProgress}</span>
                    <span className="kpi-label">In Progress</span>
                  </div>
                  <div className="report-kpi-card">
                    <span className="kpi-num">{goals.completionRate}%</span>
                    <span className="kpi-label">Completion Rate</span>
                  </div>
                </>
              ) : reportType === "learning" ? (
                <>
                  <div className="report-kpi-card">
                    <span className="kpi-num">{learning.total}</span>
                    <span className="kpi-label">Total Resources</span>
                  </div>
                  <div className="report-kpi-card">
                    <span className="kpi-num">{learning.completed}</span>
                    <span className="kpi-label">Completed</span>
                  </div>
                  <div className="report-kpi-card">
                    <span className="kpi-num">{learning.inProgress}</span>
                    <span className="kpi-label">In Progress</span>
                  </div>
                  <div className="report-kpi-card">
                    <span className="kpi-num">{learning.avgProgress}%</span>
                    <span className="kpi-label">Average Progress</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="report-kpi-card">
                    <span className="kpi-num">{summary.overallProgress}%</span>
                    <span className="kpi-label">Overall Index</span>
                  </div>
                  <div className="report-kpi-card">
                    <span className="kpi-num">{summary.totalSkills}</span>
                    <span className="kpi-label">Skills ({summary.avgSkillProgress}% avg)</span>
                  </div>
                  <div className="report-kpi-card">
                    <span className="kpi-num">{summary.goalCompletionRate}%</span>
                    <span className="kpi-label">Goal Completion ({summary.completedGoals}/{summary.totalGoals})</span>
                  </div>
                  <div className="report-kpi-card">
                    <span className="kpi-num">{summary.learningCompletionRate}%</span>
                    <span className="kpi-label">Resources Done ({summary.completedResources}/{summary.totalResources})</span>
                  </div>
                </>
              )}
            </section>

            {/* Analytical Callouts / Highlights */}
            {reportType === "skills" && (
              <section className="report-highlights-grid">
                <div className="highlight-box strengths">
                  <h4>
                    <Sparkles size={16} /> Key Strengths ({skills.strengthsCount || 0})
                  </h4>
                  <p className="highlight-sub">Skills at 75% or higher recorded proficiency:</p>
                  {skills.strengths && skills.strengths.length > 0 ? (
                    <ul className="highlight-list">
                      {skills.strengths.map((s) => (
                        <li key={s.id}>
                          <span>
                            <b>{s.name}</b> <small>({s.category} · {s.level})</small>
                          </span>
                          <span className="highlight-val">{s.progress}%</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="highlight-empty">No skills currently at 75%+ proficiency.</p>
                  )}
                </div>

                <div className="highlight-box attention">
                  <h4>
                    <Clock size={16} /> Focus Areas ({skills.needsImprovementCount || 0})
                  </h4>
                  <p className="highlight-sub">Skills below 50% progress that may need attention:</p>
                  {skills.needsImprovement && skills.needsImprovement.length > 0 ? (
                    <ul className="highlight-list">
                      {skills.needsImprovement.map((s) => (
                        <li key={s.id}>
                          <span>
                            <b>{s.name}</b> <small>({s.category} · {s.level})</small>
                          </span>
                          <span className="highlight-val warning">{s.progress}%</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="highlight-empty">All tracked skills have reached at least 50% progress.</p>
                  )}
                </div>
              </section>
            )}

            {reportType === "goals" && (
              <section className="report-highlights-grid">
                <div className="highlight-box strengths">
                  <h4>
                    <CheckCircle2 size={16} /> Completed Milestones ({goals.completed})
                  </h4>
                  <p className="highlight-sub">
                    {goals.completionRate}% of all tracked milestones have been successfully finished.
                  </p>
                </div>

                <div className="highlight-box attention">
                  <h4>
                    <AlertTriangle size={16} /> Timeline Status
                  </h4>
                  <p className="highlight-sub">
                    {goals.overdueCount > 0 ? (
                      <span style={{ color: "var(--danger, #e5484d)", fontWeight: 700 }}>
                        {goals.overdueCount} milestone{goals.overdueCount > 1 ? "s are" : " is"} currently past the target deadline.
                      </span>
                    ) : (
                      "All milestones are on schedule or have no pending overdue deadlines."
                    )}
                  </p>
                </div>
              </section>
            )}

            {reportType === "learning" && (
              <section className="report-highlights-grid">
                <div className="highlight-box strengths">
                  <h4>
                    <CheckCircle2 size={16} /> Completed Curriculum ({learning.completed})
                  </h4>
                  <p className="highlight-sub">
                    {learning.completionRate}% of tracked learning assets have been completed ({learning.completed} of {learning.total}).
                  </p>
                </div>

                <div className="highlight-box attention">
                  <h4>
                    <Clock size={16} /> Active In-Progress ({learning.inProgress})
                  </h4>
                  <p className="highlight-sub">
                    Average progress across active learning resources is currently {learning.avgProgress}%.
                  </p>
                </div>
              </section>
            )}

            {reportType === "overall" && (
              <section className="report-highlights-grid">
                <div className="highlight-box strengths">
                  <h4>
                    <Sparkles size={16} /> Key Accomplishments &amp; Strengths
                  </h4>
                  <p className="highlight-sub">
                    {summary.completedGoals} milestones achieved, {skills.strengthsCount || 0} core skill competencies (&ge;75%), and {summary.completedResources} learning resources completed.
                  </p>
                </div>

                <div className="highlight-box attention">
                  <h4>
                    <TrendingUp size={16} /> Active Priorities &amp; Momentum
                  </h4>
                  <p className="highlight-sub">
                    {summary.inProgressGoals} goals in progress ({goals.overdueCount > 0 ? `${goals.overdueCount} overdue` : "all milestones on schedule"}), and {summary.inProgressResources} ongoing learning items ({summary.avgLearningProgress}% avg progress).
                  </p>
                </div>
              </section>
            )}

            {/* Detailed Data Tables */}
            {(reportType === "skills" || reportType === "overall") && skills.items.length > 0 && (
              <section className="report-table-section">
                <div className="section-title-row">
                  <h3>Skill Proficiency Breakdown</h3>
                  <span className="table-count">{skills.items.length} records</span>
                </div>

                <div className="report-table-wrap">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th className="col-resource-title">Skill Name</th>
                        <th style={{ width: "18%" }}>Category</th>
                        <th style={{ width: "14%" }}>Level</th>
                        <th style={{ width: "160px" }}>Proficiency</th>
                        <th style={{ width: "16%" }}>Target Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skills.items.map((s) => (
                        <tr key={s.id}>
                          <td className="col-resource-title">
                            <div className="table-title-cell">
                              <strong className="item-title">{s.name}</strong>
                              {s.description && <span className="table-sub">{s.description}</span>}
                            </div>
                          </td>
                          <td>
                            <span
                              className="report-cat-badge"
                              style={{
                                borderColor: CATEGORY_COLORS[s.category] || "#6956e7",
                                color: CATEGORY_COLORS[s.category] || "#6956e7",
                              }}
                            >
                              {s.category}
                            </span>
                          </td>
                          <td>
                            <span className="level-badge">{s.level}</span>
                          </td>
                          <td>
                            <div className="table-progress-cell">
                              <Progress
                                value={s.progress}
                                color={CATEGORY_COLORS[s.category] || "#6956e7"}
                              />
                              <b>{s.progress}%</b>
                            </div>
                          </td>
                          <td>{formatDate(s.targetDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {(reportType === "goals" || reportType === "overall") && goals.items.length > 0 && (
              <section className="report-table-section">
                <div className="section-title-row">
                  <h3>Goal Milestones Breakdown</h3>
                  <span className="table-count">{goals.items.length} records</span>
                </div>

                <div className="report-table-wrap">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th className="col-resource-title">Goal Title</th>
                        <th style={{ width: "18%" }}>Category</th>
                        <th style={{ width: "160px" }}>Progress</th>
                        <th style={{ width: "15%" }}>Status</th>
                        <th style={{ width: "16%" }}>Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {goals.items.map((g) => (
                        <tr key={g.id}>
                          <td className="col-resource-title">
                            <div className="table-title-cell">
                              <strong className="item-title">{g.title}</strong>
                              {g.description && <span className="table-sub">{g.description}</span>}
                            </div>
                          </td>
                          <td>
                            <span
                              className="report-cat-badge"
                              style={{
                                borderColor: CATEGORY_COLORS[g.category] || "#6956e7",
                                color: CATEGORY_COLORS[g.category] || "#6956e7",
                              }}
                            >
                              {g.category}
                            </span>
                          </td>
                          <td>
                            <div className="table-progress-cell">
                              <Progress
                                value={g.progress}
                                color={CATEGORY_COLORS[g.category] || "#6956e7"}
                              />
                              <b>{g.progress}%</b>
                            </div>
                          </td>
                          <td>
                            {g.completed ? (
                              <span className="report-status completed">
                                <CheckCircle2 size={12} /> Completed
                              </span>
                            ) : g.isOverdue ? (
                              <span className="report-status overdue">
                                <AlertTriangle size={12} /> Overdue
                              </span>
                            ) : (
                              <span className="report-status in-progress">
                                In Progress
                              </span>
                            )}
                          </td>
                          <td>{formatDate(g.deadline)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {(reportType === "learning" || reportType === "overall") && learning.items.length > 0 && (
              <section className="report-table-section">
                <div className="section-title-row">
                  <h3>Curriculum &amp; Resource Breakdown</h3>
                  <span className="table-count">{learning.items.length} records</span>
                </div>

                <div className="report-table-wrap">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th className="col-resource-title">Resource Title</th>
                        <th style={{ width: "20%" }}>Source / Platform</th>
                        <th style={{ width: "15%" }}>Category</th>
                        <th style={{ width: "160px" }}>Progress</th>
                        <th style={{ width: "15%" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {learning.items.map((r) => (
                        <tr key={r.id}>
                          <td className="col-resource-title">
                            <div className="table-title-cell">
                              <strong className="item-title">{r.title}</strong>
                              {r.url && (
                                <a
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="table-url-link"
                                >
                                  <span>View resource</span>
                                  <ExternalLink size={11} />
                                </a>
                              )}
                            </div>
                          </td>
                          <td>{r.source}</td>
                          <td>
                            <span
                              className="report-cat-badge"
                              style={{
                                borderColor: CATEGORY_COLORS[r.category] || "#6956e7",
                                color: CATEGORY_COLORS[r.category] || "#6956e7",
                              }}
                            >
                              {r.category}
                            </span>
                          </td>
                          <td>
                            <div className="table-progress-cell">
                              <Progress
                                value={r.progress}
                                color={CATEGORY_COLORS[r.category] || "#6956e7"}
                              />
                              <b>{r.progress}%</b>
                            </div>
                          </td>
                          <td>
                            {r.completed ? (
                              <span className="report-status completed">
                                <CheckCircle2 size={12} /> Completed
                              </span>
                            ) : r.progress > 0 ? (
                              <span className="report-status in-progress">
                                {r.progress}% Done
                              </span>
                            ) : (
                              <span className="report-status not-started">
                                Not Started
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Document Verification Footer */}
            <footer className="report-doc-footer">
              <div className="report-footer-brand">
                <div className="report-footer-logo-row">
                  <span className="footer-mini-mark">S</span>
                  <span className="footer-title">SkillTracker 2.0 &bull; Verified Workspace Report</span>
                </div>
                <span className="footer-sub">
                  Generated for <b>{report.user?.name || user?.name || "Member"}</b> ({report.user?.email || user?.email}) &bull; {formatDate(report.generatedAt)}
                </span>
              </div>
              <div className="report-footer-security">
                <span className="footer-badge">Strict Data Isolation</span>
                <span className="footer-sub">Encrypted &bull; Authenticated</span>
              </div>
            </footer>
          </article>
        </div>
      )}
    </>
  );
}
