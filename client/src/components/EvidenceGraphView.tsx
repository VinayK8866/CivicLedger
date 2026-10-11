import React, { useState, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { StatusBadge } from './StatusBadge';
import {
  Shield,
  AlertTriangle,
  FileText,
  MapPin,
  Calendar,
  X,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

// Custom Node: Incident
const IncidentNode = ({ data, selected }: NodeProps) => {
  return (
    <div
      className={`min-w-[240px] max-w-[280px] rounded-xl border bg-white p-3.5 shadow-md transition-all ${
        selected ? 'border-sky-500 ring-2 ring-sky-400' : 'border-slate-200'
      }`}
    >
      <Handle type="source" position={Position.Bottom} className="!bg-sky-500 !w-2.5 !h-2.5" />
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 uppercase">
          <MapPin className="w-3 h-3" /> Incident
        </span>
        <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
          {String(data.recurrenceCount)}x Recurrence
        </span>
      </div>
      <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">{data.label as string}</h4>
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
        <span className="capitalize">{data.category as string}</span>
        <span className="font-medium text-slate-700">{data.status as string}</span>
      </div>
    </div>
  );
};

// Custom Node: Claim
const ClaimNode = ({ data, selected }: NodeProps) => {
  const isDisputed = data.status === 'disputed';
  return (
    <div
      className={`min-w-[260px] max-w-[300px] rounded-xl border bg-white p-3.5 shadow-md transition-all ${
        selected
          ? 'border-indigo-500 ring-2 ring-indigo-400'
          : isDisputed
          ? 'border-rose-300 bg-rose-50/20'
          : 'border-slate-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-indigo-500 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !w-2.5 !h-2.5" />
      <div className="flex items-center justify-between gap-1 mb-2">
        <span className="text-[10px] font-bold tracking-wider text-indigo-700 uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
          Claim ({data.claimType as string})
        </span>
        <StatusBadge status={data.status as string} size="sm" />
      </div>
      <p className="text-xs font-medium text-slate-800 leading-relaxed line-clamp-3 mb-2.5">
        "{data.label as string}"
      </p>
      <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-1.5">
        <span>Confidence</span>
        <span className="font-semibold text-slate-800">{Math.round(((data.confidence as number) || 0.8) * 100)}%</span>
      </div>
    </div>
  );
};

// Custom Node: Evidence
const EvidenceNode = ({ data, selected }: NodeProps) => {
  return (
    <div
      className={`min-w-[260px] max-w-[300px] rounded-xl border bg-white p-3.5 shadow-md transition-all ${
        selected ? 'border-teal-500 ring-2 ring-teal-400' : 'border-slate-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-teal-500 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Bottom} className="!bg-teal-500 !w-2.5 !h-2.5" />
      <div className="flex items-center justify-between gap-1 mb-2">
        <span className="text-[10px] font-bold tracking-wider text-teal-700 uppercase bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
          {(data.evidenceType as string).replace(/_/g, ' ')}
        </span>
        <span className="text-[10px] text-slate-500 capitalize bg-slate-100 px-1.5 py-0.5 rounded">
          {data.sourceCategory as string}
        </span>
      </div>
      <p className="text-xs text-slate-700 leading-relaxed line-clamp-3 mb-2">{data.label as string}</p>
      <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-1.5">
        <StatusBadge status={data.verificationStatus as string} size="sm" />
        <span>{data.observedAt ? new Date(data.observedAt as string).toLocaleDateString() : ''}</span>
      </div>
    </div>
  );
};

// Custom Node: Intervention
const InterventionNode = ({ data, selected }: NodeProps) => {
  return (
    <div
      className={`min-w-[240px] max-w-[280px] rounded-xl border bg-white p-3.5 shadow-md transition-all ${
        selected ? 'border-amber-500 ring-2 ring-amber-400' : 'border-slate-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-amber-500 !w-2.5 !h-2.5" />
      <div className="flex items-center justify-between gap-1 mb-2">
        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
          Intervention
        </span>
        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
          ${(data.estimatedCost as number)?.toLocaleString()}
        </span>
      </div>
      <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 mb-2">{data.label as string}</h4>
      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <span>Target Effectiveness:</span>
        <span className="font-semibold text-emerald-700">{data.expectedEffectiveness as number}%</span>
      </div>
    </div>
  );
};

const nodeTypes = {
  incidentNode: IncidentNode,
  claimNode: ClaimNode,
  evidenceNode: EvidenceNode,
  interventionNode: InterventionNode
};

interface EvidenceGraphViewProps {
  initialNodes: any[];
  initialEdges: any[];
  rawRelations?: any[];
  onNodeSelect?: (nodeData: any) => void;
  height?: string;
}

export const EvidenceGraphView: React.FC<EvidenceGraphViewProps> = ({
  initialNodes,
  initialEdges,
  rawRelations = [],
  onNodeSelect,
  height = '600px'
}) => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  // Sync when initial data updates
  React.useEffect(() => {
    // handled cleanly by react-flow states
  }, [initialNodes, initialEdges]);

  const handleNodeClick = (_: React.MouseEvent, node: any) => {
    setSelectedNode(node);
    if (onNodeSelect) onNodeSelect(node);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm" style={{ height }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.2}
        maxZoom={1.8}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
        <Controls className="!bg-white !border-slate-200 !shadow-sm !rounded-lg" />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="!bg-white/90 !border-slate-200 !rounded-xl !shadow-md"
        />
      </ReactFlow>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="absolute right-4 top-4 bottom-4 w-96 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur-md overflow-y-auto z-50 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">
                <Layers className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {selectedNode.type?.replace('Node', '')} Inspection
              </span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400">Title / Statement</label>
              <p className="text-sm font-semibold text-slate-900 leading-snug mt-1">
                {String(selectedNode.data.label || '')}
              </p>
            </div>

            {selectedNode.data.status && (
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Verification Status</label>
                <div className="mt-1">
                  <StatusBadge status={String(selectedNode.data.status)} />
                </div>
              </div>
            )}

            {selectedNode.data.confidence && (
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Confidence Calibration</label>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full"
                      style={{ width: `${Math.round(selectedNode.data.confidence * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {Math.round(selectedNode.data.confidence * 100)}%
                  </span>
                </div>
              </div>
            )}

            {selectedNode.data.evidenceType && (
              <div className="space-y-2 rounded-xl bg-slate-50 p-3 border border-slate-100">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Evidence Class:</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {selectedNode.data.evidenceType.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Source Category:</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {selectedNode.data.sourceCategory}
                  </span>
                </div>
                {selectedNode.data.observedAt && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Observed Date:</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(selectedNode.data.observedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Related Edges for this node */}
            <div className="border-t border-slate-100 pt-3">
              <label className="text-[10px] font-bold uppercase text-slate-400">Graph Relationships</label>
              <div className="mt-2 space-y-2">
                {edges
                  .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                  .map(edge => {
                    const isOutgoing = edge.source === selectedNode.id;
                    const otherNodeId = isOutgoing ? edge.target : edge.source;
                    const isContradict = edge.label === 'CONTRADICTS';

                    return (
                      <div
                        key={edge.id}
                        className={`flex items-center justify-between rounded-lg p-2 text-xs border ${
                          isContradict ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-medium">
                          <span className="text-[10px] font-bold uppercase">{edge.label}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-mono text-[10px] text-slate-500 truncate max-w-[140px]">{otherNodeId}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graph Help / Legend Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 rounded-xl bg-white/90 p-2 text-xs shadow-sm backdrop-blur-sm border border-slate-200">
        <span className="font-bold text-slate-800 px-1">ProofMesh Layers:</span>
        <span className="flex items-center gap-1 rounded bg-sky-50 px-2 py-0.5 text-sky-700 font-semibold border border-sky-200 text-[11px]">
          Incident
        </span>
        <span className="flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-indigo-700 font-semibold border border-indigo-200 text-[11px]">
          Claim
        </span>
        <span className="flex items-center gap-1 rounded bg-teal-50 px-2 py-0.5 text-teal-700 font-semibold border border-teal-200 text-[11px]">
          Evidence Item
        </span>
        <span className="flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-amber-700 font-semibold border border-amber-200 text-[11px]">
          Intervention
        </span>
        <span className="ml-2 flex items-center gap-1 text-rose-600 font-semibold text-[11px]">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
          Red Edge = CONTRADICTS
        </span>
      </div>
    </div>
  );
};
