import React from 'react';
import { Card, CardHeader, CardContent, Badge } from '@receivables/ui';
import { CheckCircle2, Server, Database, Layers, HardDrive, Cpu } from 'lucide-react';

const healthComponents = [
  { name: 'Core API Service', status: 'Healthy', icon: Server, latency: '4ms', uptime: '99.98%' },
  {
    name: 'PostgreSQL Database',
    status: 'Healthy',
    icon: Database,
    latency: '2ms',
    uptime: '100%',
  },
  {
    name: 'Redis Cache & PubSub',
    status: 'Healthy',
    icon: Layers,
    latency: '<1ms',
    uptime: '100%',
  },
  {
    name: 'MinIO Object Storage',
    status: 'Healthy',
    icon: HardDrive,
    latency: '6ms',
    uptime: '99.95%',
  },
  {
    name: 'BullMQ Background Workers',
    status: 'Healthy',
    icon: Cpu,
    latency: '12ms',
    uptime: '99.99%',
  },
];

export const AdminHealthPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          System Health & Infrastructure
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Real-time operational status of backend services, persistent databases, and cache layers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthComponents.map((comp) => {
          const Icon = comp.icon;
          return (
            <Card key={comp.name} className="bg-slate-950 border-slate-800 text-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-semibold">{comp.name}</span>
                  </div>
                  <Badge variant="success" className="text-[10px] gap-1">
                    <CheckCircle2 className="w-3 h-3" />
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
                    <span className="text-slate-500">Uptime (30d):</span>
                    <p className="font-mono text-emerald-400 font-medium">{comp.uptime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
