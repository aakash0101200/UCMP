/**
 * DirectoryMindmap.jsx
 *
 * React Flow + Dagre hierarchical directory mindmap.
 * Replaces the old custom SVG Bézier connector implementation.
 *
 * Layout: Left-to-right tree (rankdir: LR)
 *   College Root → Departments → [Faculty Staff | Sections] → Personnel / Section Nodes
 *
 * Collapsibility is driven by the parent's selection state (activeDept, activeBranchType,
 * activeSectionId). When a department is clicked in the parent, the branch children appear;
 * clicking Faculty/Sections shows leaves.
 */

import React, { useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Panel,
  ReactFlowProvider,
  useReactFlow,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import {
  Briefcase,
  Layers,
  Mail,
  Hash,
  Pencil,
  KeyRound,
  Trash2,
  RefreshCw,
  Building2,
  Maximize2,
  Minimize2,
} from 'lucide-react';

/* ─── Dagre layout helper ──────────────────────────────────────────────── */
const NODE_WIDTH = 200;
const NODE_HEIGHT = 68;
const PERSON_HEIGHT = 120;

function applyDagreLayout(nodes, edges) {
  console.log("[DirectoryMindmap] applyDagreLayout input:", nodes.length, "nodes,", edges.length, "edges");
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', ranksep: 90, nodesep: 30, marginx: 30, marginy: 30 });

  nodes.forEach((n) => {
    const h = n.data?.nodeType === 'person' ? PERSON_HEIGHT : NODE_HEIGHT;
    g.setNode(n.id, { width: NODE_WIDTH, height: h });
  });
  edges.forEach((e) => g.setEdge(e.source, e.target));

  try {
    dagre.layout(g);
  } catch (err) {
    console.error("[DirectoryMindmap] Dagre layout failed:", err);
  }

  return nodes.map((n) => {
    const pos = g.node(n.id);
    const h = n.data?.nodeType === 'person' ? PERSON_HEIGHT : NODE_HEIGHT;
    if (!pos) {
      console.warn("[DirectoryMindmap] Dagre position missing for node ID:", n.id);
      return n;
    }
    console.log("[DirectoryMindmap] Node:", n.id, "computed pos x:", pos.x, "y:", pos.y);
    return {
      ...n,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - h / 2,
      },
    };
  });
}

/* ─── Section year resolver ────────────────────────────────────────────── */
function resolveSectionYear(sec) {
  let secYear = sec.year;
  if (secYear === undefined || secYear === null) {
    const nameMatch = sec.sectionName?.match(/(?:Yr|Year)\s*(\d+)/i);
    if (nameMatch) {
      secYear = parseInt(nameMatch[1]);
    } else {
      const batchNameStr = sec.batchName || sec.batch?.batchName || '';
      const batchMatch = batchNameStr.match(/(?:Yr|Year)\s*(\d+)/i);
      if (batchMatch) {
        secYear = parseInt(batchMatch[1]);
      } else if (batchNameStr.includes('2026') || batchNameStr.includes('26')) {
        secYear = 3;
      }
    }
  }
  return secYear ? parseInt(secYear) : null;
}

/* ─── Edge style ───────────────────────────────────────────────────────── */
const edgeDefaults = {
  type: 'smoothstep',
  style: {
    stroke: 'url(#rf-mindmap-grad)',
    strokeWidth: 2,
    opacity: 0.65,
  },
  animated: false,
};

/* ─── Custom node: Department ──────────────────────────────────────────── */
function DeptNode({ data }) {
  const { label, isActive } = data;
  return (
    <div
      className={`nopan w-[200px] px-4 py-3 rounded-2xl border cursor-pointer transition-all duration-200 select-none text-center
        ${isActive
          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent shadow-lg scale-[1.03]'
          : 'surface-card hover:scale-[1.02] text-text-primary hover:border-indigo-400/50'
        }`}
    >
      <div className="flex items-center justify-center gap-1.5">
        <Building2 className="w-3.5 h-3.5 shrink-0" />
        <span className="text-xs font-bold leading-snug">{label}</span>
      </div>
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
}

/* ─── Custom node: Branch (Faculty / Sections) ─────────────────────────── */
function BranchNode({ data }) {
  const { label, isActive, icon } = data;
  const Icon = icon === 'faculty' ? Briefcase : Layers;
  return (
    <div
      className={`nopan w-[200px] px-4 py-3 rounded-2xl border cursor-pointer transition-all duration-200 select-none text-center
        ${isActive
          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent shadow-md scale-[1.03]'
          : 'surface-card hover:scale-[1.02] text-text-primary hover:border-indigo-400/50'
        }`}
    >
      <div className="flex items-center justify-center gap-1.5">
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span className="text-xs font-bold">{label}</span>
      </div>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
}

/* ─── Custom node: Academic Year ───────────────────────────────────────── */
function YearNode({ data }) {
  const { label, isActive } = data;
  return (
    <div
      className={`nopan w-[200px] px-4 py-3 rounded-2xl border cursor-pointer transition-all duration-200 select-none text-center
        ${isActive
          ? 'bg-amber-500 dark:bg-amber-100 text-white dark:text-amber-900 border-transparent shadow-md scale-[1.03]'
          : 'surface-card hover:scale-[1.02] text-text-primary hover:border-amber-400/50'
        }`}
    >
      <span className="text-xs font-bold">{label}</span>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
}

/* ─── Custom node: Section ─────────────────────────────────────────────── */
function SectionNode({ data }) {
  const { label, isActive } = data;
  return (
    <div
      className={`nopan w-[200px] px-4 py-3 rounded-2xl border cursor-pointer transition-all duration-200 select-none text-center
        ${isActive
          ? 'bg-indigo-600 text-white border-transparent shadow-md scale-[1.03]'
          : 'surface-card hover:scale-[1.02] text-text-primary hover:border-indigo-400/50'
        }`}
    >
      <span className="text-xs font-semibold">{label}</span>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
}

/* ─── Custom node: Person card ─────────────────────────────────────────── */
function PersonNode({ data }) {
  const { person, onEdit, onReset, onDelete } = data;
  const roleColors = {
    ADMIN: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    FACULTY: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    STUDENT: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  };
  return (
    <div className="nopan w-[200px] p-3 surface-card rounded-2xl text-xs flex flex-col gap-1.5">
      <div className="flex justify-between items-start gap-1">
        <div className="min-w-0">
          <p className="font-bold text-text-primary truncate leading-snug">{person.name}</p>
          <p className="font-mono text-[9px] text-indigo-500 dark:text-indigo-400">{person.collegeId}</p>
        </div>
        <span className={`shrink-0 px-1.5 py-0.5 rounded-full text-[8px] font-bold ${roleColors[person.role] || roleColors.STUDENT}`}>
          {person.role}
        </span>
      </div>

      <div className="text-text-muted space-y-0.5 text-[9px]">
        <div className="flex items-center gap-1 truncate">
          <Mail className="w-3 h-3 shrink-0" />
          <span className="truncate">{person.email}</span>
        </div>
        {person.role === 'FACULTY' && (
          <div className="flex items-center gap-1">
            <Briefcase className="w-3 h-3 shrink-0" />
            <span>{person.designation || 'Faculty'} ({person.department})</span>
          </div>
        )}
        {person.role === 'STUDENT' && (
          <div className="flex items-center gap-1">
            <Hash className="w-3 h-3 shrink-0" />
            <span>Roll: {person.rollNumber} · Yr {person.year}</span>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-1 pt-1 border-t border-surface-border">
        <button
          title="Edit"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(person);
          }}
          className="p-1 rounded hover:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 transition-all"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          title="Reset Password"
          onClick={(e) => {
            e.stopPropagation();
            onReset(person);
          }}
          className="p-1 rounded hover:bg-amber-500/10 text-amber-500 dark:text-amber-400 transition-all"
        >
          <KeyRound className="w-3 h-3" />
        </button>
        <button
          title="Delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(person);
          }}
          className="p-1 rounded hover:bg-rose-500/10 text-rose-500 dark:text-rose-400 transition-all"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
    </div>
  );
}

/* ─── Custom node: Load More ───────────────────────────────────────────── */
function LoadMoreNode({ data }) {
  const { loading } = data;
  return (
    <div
      className="nopan w-[200px] px-4 py-3 rounded-2xl border border-dashed border-indigo-400/50 dark:border-indigo-500/40 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/5 transition-all text-center"
    >
      {loading
        ? <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-500"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading...</div>
        : <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400">Load More Records…</span>
      }
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
    </div>
  );
}

/* ─── Custom node: Loading / Empty placeholder ─────────────────────────── */
function PlaceholderNode({ data }) {
  return (
    <div className="w-[200px] px-4 py-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
      <span className="text-[10px] text-text-muted">{data.label}</span>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
    </div>
  );
}

/* ─── Node type registry ───────────────────────────────────────────────── */
const nodeTypes = {
  dept: DeptNode,
  branch: BranchNode,
  yearNode: YearNode,
  section: SectionNode,
  person: PersonNode,
  loadMore: LoadMoreNode,
  placeholder: PlaceholderNode,
};

/* ─── SVG gradient definition injected into the React Flow DOM ─────────── */
function GradientDefs() {
  return (
    <svg style={{ width: 0, height: 0, position: 'absolute' }}>
      <defs>
        <linearGradient id="rf-mindmap-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Flow Rendering Engine Component (must be inside ReactFlowProvider)
   ═══════════════════════════════════════════════════════════════════════════ */
function MindmapFlow({
  departments,
  activeDept,
  activeBranchType,
  activeSectionId,
  sectionsList,
  loadingSections,
  personnelList,
  loadingPersonnel,
  hasLoadedAll,
  onDeptClick,
  onBranchTypeClick,
  onSectionClick,
  onLoadMore,
  onEdit,
  onResetPassword,
  onDelete,
}) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { fitView } = useReactFlow();
  const [activeYear, setActiveYear] = useState(null);

  console.log("[DirectoryMindmap] MindmapFlow render. activeDept:", activeDept, "activeBranchType:", activeBranchType, "activeSectionId:", activeSectionId, "activeYear:", activeYear);

  // Re-run fitView on toggling fullscreen or layout changes to keep nodes centered
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ duration: 400, padding: 0.15 });
    }, 150);
    return () => clearTimeout(timer);
  }, [isFullScreen, fitView, activeDept, activeBranchType, activeYear, activeSectionId]);

  // Reset active year when department changes, or when branch type is not sections
  useEffect(() => {
    if (activeBranchType !== 'Sections') {
      setActiveYear(null);
    }
  }, [activeDept, activeBranchType]);

  /* ── Build nodes + edges from state ── */
  const { layoutNodes, layoutEdges } = useMemo(() => {
    const rawNodes = [];
    const rawEdges = [];

    const addEdge = (source, target) =>
      rawEdges.push({ id: `${source}→${target}`, source, target, ...edgeDefaults });

    /* Department nodes */
    departments.forEach((dept) => {
      rawNodes.push({
        id: `dept:${dept}`,
        type: 'dept',
        position: { x: 0, y: 0 },
        data: {
          nodeType: 'dept',
          label: dept,
          isActive: activeDept === dept,
          onClick: () => {
            console.log("[DirectoryMindmap] Dept node handler click deptName:", dept);
            onDeptClick(dept);
          },
        },
      });
    });

    /* Branch nodes (only when a dept is selected) */
    if (activeDept) {
      // Faculty branch
      rawNodes.push({
        id: 'branch:Faculty',
        type: 'branch',
        position: { x: 0, y: 0 },
        data: {
          nodeType: 'branch',
          label: 'Faculty Staff',
          icon: 'faculty',
          isActive: activeBranchType === 'Faculty',
          onClick: () => {
            console.log("[DirectoryMindmap] Branch node handler click type: Faculty");
            setActiveYear(null);
            onBranchTypeClick('Faculty');
          },
        },
      });
      addEdge(`dept:${activeDept}`, 'branch:Faculty');

      // Academic Year branch nodes (not for Administration dept)
      if (activeDept !== 'Administration') {
        // Resolve years in the sections list
        const yearsSet = new Set();
        sectionsList.forEach(sec => {
          const yr = resolveSectionYear(sec);
          if (yr) yearsSet.add(yr);
        });
        const availableYears = Array.from(yearsSet).sort((a, b) => a - b);
        const yearsToRender = availableYears.length > 0 ? availableYears : [1, 2, 3, 4];

        yearsToRender.forEach((yr) => {
          const yrLabel = yr === 1 ? '1st Year' : yr === 2 ? '2nd Year' : yr === 3 ? '3rd Year' : `${yr}th Year`;
          rawNodes.push({
            id: `year:${yr}`,
            type: 'yearNode',
            position: { x: 0, y: 0 },
            data: {
              nodeType: 'yearNode',
              label: yrLabel,
              isActive: activeBranchType === 'Sections' && activeYear === yr,
              onClick: () => {
                console.log("[DirectoryMindmap] Year node handler click yr:", yr);
                if (activeBranchType === 'Sections' && activeYear === yr) {
                  // Toggle off
                  setActiveYear(null);
                  onBranchTypeClick('');
                } else {
                  // Toggle on
                  setActiveYear(yr);
                  onBranchTypeClick('Sections');
                }
              },
            },
          });
          addEdge(`dept:${activeDept}`, `year:${yr}`);
        });
      }
    }

    /* Section nodes (only when a Year branch is active) */
    if (activeDept && activeBranchType === 'Sections' && activeYear) {
      const filteredSections = sectionsList.filter(sec => resolveSectionYear(sec) === activeYear);

      if (loadingSections) {
        rawNodes.push({
          id: 'sec:loading',
          type: 'placeholder',
          position: { x: 0, y: 0 },
          data: { nodeType: 'placeholder', label: 'Loading sections…' },
        });
        addEdge(`year:${activeYear}`, 'sec:loading');
      } else if (filteredSections.length === 0) {
        rawNodes.push({
          id: 'sec:empty',
          type: 'placeholder',
          position: { x: 0, y: 0 },
          data: { nodeType: 'placeholder', label: `No sections for ${activeYear} Year` },
        });
        addEdge(`year:${activeYear}`, 'sec:empty');
      } else {
        filteredSections.forEach((sec) => {
          rawNodes.push({
            id: `sec:${sec.id}`,
            type: 'section',
            position: { x: 0, y: 0 },
            data: {
              nodeType: 'section',
              label: sec.sectionName,
              isActive: activeSectionId === sec.id,
              onClick: () => {
                console.log("[DirectoryMindmap] Section node handler click secId:", sec.id);
                onSectionClick(sec.id);
              },
            },
          });
          addEdge(`year:${activeYear}`, `sec:${sec.id}`);
        });
      }
    }

    /* Personnel nodes — Faculty branch */
    if (activeDept && activeBranchType === 'Faculty') {
      if (loadingPersonnel && personnelList.length === 0) {
        rawNodes.push({
          id: 'person:loading',
          type: 'placeholder',
          position: { x: 0, y: 0 },
          data: { nodeType: 'placeholder', label: 'Loading faculty…' },
        });
        addEdge('branch:Faculty', 'person:loading');
      } else if (personnelList.length === 0) {
        rawNodes.push({
          id: 'person:empty',
          type: 'placeholder',
          position: { x: 0, y: 0 },
          data: { nodeType: 'placeholder', label: 'No records found.' },
        });
        addEdge('branch:Faculty', 'person:empty');
      } else {
        personnelList.forEach((p) => {
          rawNodes.push({
            id: `person:${p.collegeId}`,
            type: 'person',
            position: { x: 0, y: 0 },
            data: {
              nodeType: 'person',
              person: p,
              onEdit,
              onReset: onResetPassword,
              onDelete,
            },
          });
          addEdge('branch:Faculty', `person:${p.collegeId}`);
        });
        if (!hasLoadedAll) {
          rawNodes.push({
            id: 'person:loadMore',
            type: 'loadMore',
            position: { x: 0, y: 0 },
            data: { loading: loadingPersonnel, onClick: onLoadMore },
          });
          addEdge('branch:Faculty', 'person:loadMore');
        }
      }
    }

    /* Personnel nodes — Sections branch (students in a selected section) */
    if (activeDept && activeBranchType === 'Sections' && activeSectionId) {
      if (loadingPersonnel && personnelList.length === 0) {
        rawNodes.push({
          id: 'stu:loading',
          type: 'placeholder',
          position: { x: 0, y: 0 },
          data: { nodeType: 'placeholder', label: 'Loading students…' },
        });
        addEdge(`sec:${activeSectionId}`, 'stu:loading');
      } else if (personnelList.length === 0) {
        rawNodes.push({
          id: 'stu:empty',
          type: 'placeholder',
          position: { x: 0, y: 0 },
          data: { nodeType: 'placeholder', label: 'No students enrolled.' },
        });
        addEdge(`sec:${activeSectionId}`, 'stu:empty');
      } else {
        personnelList.forEach((p) => {
          rawNodes.push({
            id: `stu:${p.collegeId}`,
            type: 'person',
            position: { x: 0, y: 0 },
            data: {
              nodeType: 'person',
              person: p,
              onEdit,
              onReset: onResetPassword,
              onDelete,
            },
          });
          addEdge(`sec:${activeSectionId}`, `stu:${p.collegeId}`);
        });
        if (!hasLoadedAll) {
          rawNodes.push({
            id: 'stu:loadMore',
            type: 'loadMore',
            position: { x: 0, y: 0 },
            data: { loading: loadingPersonnel, onClick: onLoadMore },
          });
          addEdge(`sec:${activeSectionId}`, 'stu:loadMore');
        }
      }
    }

    /* Run Dagre layout */
    const positioned = applyDagreLayout(rawNodes, rawEdges);
    return { layoutNodes: positioned, layoutEdges: rawEdges };
  }, [
    departments, activeDept, activeBranchType, activeYear, activeSectionId,
    sectionsList, loadingSections,
    personnelList, loadingPersonnel, hasLoadedAll,
    onDeptClick, onBranchTypeClick, onSectionClick, onLoadMore, onEdit, onResetPassword, onDelete,
  ]);

  return (
    <div className={
      isFullScreen
        ? "fixed inset-0 z-50 w-screen h-screen bg-background dark:bg-[#0B0F19] p-6 flex flex-col transition-all duration-300"
        : "rf-mindmap-container surface-card rounded-3xl overflow-hidden relative transition-all duration-300"
    }>
      <GradientDefs />
      <ReactFlow
        nodes={layoutNodes}
        edges={layoutEdges}
        nodeTypes={nodeTypes}
        onNodeClick={(event, node) => {
          console.log("[DirectoryMindmap] ReactFlow onNodeClick:", node.id, node.type);
          if (node.data && typeof node.data.onClick === 'function') {
            node.data.onClick();
          }
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.25}
        maxZoom={2.0}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        panOnScroll={false}
        preventScrolling
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        proOptions={{ hideAttribution: true }}
        className="w-full h-full"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="var(--surface-border)"
        />
        <Controls
          showInteractive={false}
          className="!bottom-4 !right-4 !left-auto !top-auto"
        />

        {/* Floating Workspace Maximize/Restore Button Panel */}
        <Panel position="top-right">
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-md font-semibold text-xs transition-all active:scale-[0.97] flex items-center gap-2 cursor-pointer"
            title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullScreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-indigo-500" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-indigo-500 animate-pulse" />
                <span>Fullscreen View</span>
              </>
            )}
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

/* ─── ReactFlowProvider Parent Wrapper ─────────────────────────────────── */
export default function DirectoryMindmap(props) {
  return (
    <ReactFlowProvider>
      <MindmapFlow {...props} />
    </ReactFlowProvider>
  );
}
