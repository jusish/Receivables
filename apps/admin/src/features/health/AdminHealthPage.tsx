import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@receivables/ui';
import {
  CheckCircle2,
  Server,
  Database,
  Layers,
  HardDrive,
  Cpu,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { adminApiFetch } from '../../lib/api';

const getComponentIcon = (name: string) => {
  if (name.includes('PostgreSQL')) return Database;
  if (name.includes('Redis')) return Layers;
  if (name.includes('MinIO')) return HardDrive;
  if (name.includes('BullMQ')) return Cpu;
  return Server;
};

export const AdminHealthPage: React.FC = () => {
  const [healthData, setHealthData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadHealth = async () => {
    try {
      setLoading(true);
      const data = await adminApiFetch('/admin/health');
      setHealthData(data);
    } catch (err) {
      console.error('Failed to load system health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            System Health & Infrastructure
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time operational status of backend services, persistent databases, and cache layers.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadHealth}
          disabled={loading}
          className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>

      {/* Component Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthData?.components?.map((comp: any) => {
          const Icon = getComponentIcon(comp.name);
          const isHealthy = comp.status === 'Healthy';

          return (
            <Card key={comp.name} className="bg-slate-950 border-slate-800 text-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-semibold">{comp.name}</span>
                  </div>
                  <Badge
                    variant={isHealthy ? 'success' : 'destructive'}
                    className="text-[10px] gap-1"
                  >
                    {isHealthy ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    {comp.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-900">
                  <div>
                    <span className="text-slate-500">Latency:</span>
                    <p className="font-mono text-slate-300 font-medium">{comp.latency}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Uptime:</span>
                    <p className="font-mono text-emerald-400 font-medium">{comp.uptime}</p>
                  </div>
                </div>
                {comp.details && (
                  <p className="text-[11px] text-slate-500 mt-2 truncate">{comp.details}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Resources Card */}
      {healthData?.system && (
        <Card className="bg-slate-950 border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-300">
              API Runtime Resource Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Process Uptime:</span>
                <p className="text-lg font-bold text-white mt-1">
                  {Math.floor(healthData.system.uptimeSeconds / 60)} minutes
                </p>
              </div>
              <div className="p-3 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Memory RSS:</span>
                <p className="text-lg font-bold text-indigo-400 mt-1">
                  {healthData.system.memoryRssMb} MB
                </p>
              </div>
              <div className="p-3 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Heap Used:</span>
                <p className="text-lg font-bold text-emerald-400 mt-1">
                  {healthData.system.heapUsedMb} MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
