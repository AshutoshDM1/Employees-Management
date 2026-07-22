import React, { useState, useEffect } from 'react';
import { employeeApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { OrgTreeNode, Employee } from '../../types';
import {
  Network,
  ChevronDown,
  ChevronRight,
  Users,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

interface TreeNodeProps {
  node: OrgTreeNode;
  onSelect: (node: OrgTreeNode) => void;
  selectedId: string | null;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, onSelect, selectedId }) => {
  const [expanded, setExpanded] = useState(true);

  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  const getBadgeColor = (role: string) => {
    if (role === 'SUPER_ADMIN') return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    if (role === 'HR_MANAGER') return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  };

  return (
    <div className="space-y-2">
      <div
        onClick={() => onSelect(node)}
        className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 ${
          isSelected
            ? 'bg-indigo-500/15 border-indigo-500/50 ring-1 ring-indigo-500/30 shadow-lg'
            : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700/60 hover:bg-zinc-800/30'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}

          <img
            src={
              node.image ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
            }
            alt={node.name}
            className="h-10 w-10 rounded-full object-cover border border-zinc-700/80"
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white truncate">{node.name}</h4>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                {node.employeeId}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate">
              {node.designation} • {node.department}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getBadgeColor(node.role)}`}
          >
            {node.role.replace('_', ' ')}
          </span>

          {hasChildren && (
            <span className="text-[10px] font-medium text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md">
              {node.children.length} {node.children.length === 1 ? 'Reportee' : 'Reportees'}
            </span>
          )}
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="pl-6 border-l border-zinc-800/80 ml-5 space-y-2 pt-1">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} onSelect={onSelect} selectedId={selectedId} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function OrgHierarchy() {
  const { user } = useAuth();
  const [tree, setTree] = useState<OrgTreeNode[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<OrgTreeNode | null>(null);

  // Manager Assignment State
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    try {
      setLoading(true);
      const [tData, empRes] = await Promise.all([
        employeeApi.getOrgTree(),
        employeeApi.getEmployees({ limit: 100 }),
      ]);
      setTree(tData);
      setAllEmployees(empRes.data);
      if (tData.length > 0 && !selectedNode) {
        setSelectedNode(tData[0] || null);
        setSelectedManagerId(tData[0]?.managerId || '');
      }
    } catch (err) {
      console.error('Failed to load org tree:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNode = (node: OrgTreeNode) => {
    setSelectedNode(node);
    setSelectedManagerId(node.managerId || '');
    setAlertMsg(null);
  };

  const handleUpdateManager = async () => {
    if (!selectedNode) return;

    setUpdating(true);
    setAlertMsg(null);

    try {
      await employeeApi.updateManager(selectedNode.id, selectedManagerId || null);
      setAlertMsg({ type: 'success', text: 'Reporting manager updated successfully!' });
      fetchTree();
    } catch (err: any) {
      setAlertMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to update reporting manager',
      });
    } finally {
      setUpdating(false);
    }
  };

  const isSuperAdminOrHr = user?.role === 'SUPER_ADMIN' || user?.role === 'HR_MANAGER';

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-900/5 backdrop-blur-sm overflow-y-auto font-sans">
      {/* Header */}
      <header className="px-6 py-5 border-b border-zinc-800/80 bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-linear-to-b from-white to-zinc-300 bg-clip-text text-transparent flex items-center gap-2">
            <Network className="h-5 w-5 text-indigo-400" />
            <span>Organizational Hierarchy & Tree</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Visual reporting tree structure & cycle-prevention manager assignment
          </p>
        </div>

        <button
          onClick={fetchTree}
          className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700/60 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Tree</span>
        </button>
      </header>

      {/* Main Grid Layout */}
      <main className="p-6 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Tree */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Management Reporting Hierarchy
              </h3>
              <span className="text-[11px] text-zinc-500">
                Click node to inspect or reassign manager
              </span>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-2">
                <Loader2 className="h-7 w-7 text-indigo-500 animate-spin" />
                <p className="text-xs">Building organization tree...</p>
              </div>
            ) : tree.length === 0 ? (
              <p className="text-xs text-zinc-500 py-8 text-center">No hierarchy nodes available</p>
            ) : (
              <div className="space-y-3 pt-2">
                {tree.map((root) => (
                  <TreeNode
                    key={root.id}
                    node={root}
                    onSelect={handleSelectNode}
                    selectedId={selectedNode?.id || null}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Node Details & Reporting Manager Assignment */}
        <div className="space-y-4">
          {selectedNode ? (
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md space-y-5">
              <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                <img
                  src={
                    selectedNode.image ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                  }
                  alt={selectedNode.name}
                  className="h-12 w-12 rounded-full object-cover border-2 border-indigo-500/40"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedNode.name}</h3>
                  <p className="text-xs text-zinc-400">{selectedNode.designation}</p>
                  <p className="text-[10px] text-indigo-400 font-mono mt-0.5">
                    {selectedNode.employeeId}
                  </p>
                </div>
              </div>

              {/* Alert Feedback */}
              {alertMsg && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                    alertMsg.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  }`}
                >
                  {alertMsg.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{alertMsg.text}</span>
                </div>
              )}

              {/* Reporting Manager Assignment Control */}
              {isSuperAdminOrHr ? (
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">
                      Reassign Reporting Manager
                    </label>
                    <select
                      value={selectedManagerId}
                      onChange={(e) => setSelectedManagerId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="">-- No Manager (Root Node) --</option>
                      {allEmployees
                        .filter((emp) => emp.id !== selectedNode.id)
                        .map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} ({emp.designation})
                          </option>
                        ))}
                    </select>
                  </div>

                  <button
                    onClick={handleUpdateManager}
                    disabled={updating}
                    className="w-full py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {updating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    <span>Update Manager</span>
                  </button>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">
                  Manager assignment restricted to HR Managers & Super Admins.
                </p>
              )}

              {/* Direct Reportees Section */}
              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-purple-400" />
                  <span>
                    Direct Reportees ({selectedNode.children ? selectedNode.children.length : 0})
                  </span>
                </h4>

                {!selectedNode.children || selectedNode.children.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">
                    No direct reportees under this employee
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedNode.children.map((child) => (
                      <div
                        key={child.id}
                        className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              child.image ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                            }
                            alt={child.name}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-zinc-200">{child.name}</p>
                            <p className="text-[10px] text-zinc-500">{child.designation}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {child.employeeId}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 text-center text-zinc-500 text-xs">
              Select an employee node from the hierarchy tree to inspect details
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
