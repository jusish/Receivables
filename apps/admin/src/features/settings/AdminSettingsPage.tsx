import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@receivables/ui';
import { Settings, Server, Lock, Globe } from 'lucide-react';
import { adminApiFetch } from '../../lib/api';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await adminApiFetch('/admin/settings');
      setSettings(data);
    } catch (err) {
      console.error('Failed to load platform settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          <span>Platform Settings & Policies</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Runtime parameters, security enforcement, cluster configuration, and token lifetimes.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading settings...</div>
      ) : (
        <div className="space-y-6">
          {/* Environment & Node */}
          <Card className="bg-slate-950 border-slate-800 text-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-400" />
                <CardTitle className="text-base font-semibold text-white">
                  Environment & Cluster
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Environment Mode:</span>
                  <p className="text-sm font-semibold text-white mt-1 uppercase">
                    {settings?.environment}
                  </p>
                </div>
                <div className="p-3 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Cluster Deployment:</span>
                  <p className="text-sm font-semibold text-white mt-1">{settings?.cluster}</p>
                </div>
                <div className="p-3 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">API Gateway Port:</span>
                  <p className="text-sm font-semibold text-white mt-1">{settings?.port}</p>
                </div>
                <div className="p-3 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">System Log Level:</span>
                  <p className="text-sm font-semibold text-white mt-1 uppercase">
                    {settings?.logLevel}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Regional Defaults */}
          <Card className="bg-slate-950 border-slate-800 text-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                <CardTitle className="text-base font-semibold text-white">
                  Regional & Tenancy Defaults
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Default Currency:</span>
                  <p className="text-sm font-semibold text-emerald-400 mt-1">
                    {settings?.defaultCurrency} (Rwandan Franc)
                  </p>
                </div>
                <div className="p-3 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Primary Platform Timezone:</span>
                  <p className="text-sm font-semibold text-white mt-1">
                    {settings?.defaultTimezone} (UTC+2)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security & Authentication */}
          <Card className="bg-slate-950 border-slate-800 text-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-400" />
                <CardTitle className="text-base font-semibold text-white">
                  Security & Authentication Policy
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded bg-slate-900 border border-slate-800">
                <div>
                  <p className="font-semibold text-white">Phone Normalization Standard</p>
                  <p className="text-slate-400">{settings?.security?.phoneNormalization}</p>
                </div>
                <Badge variant="outline" className="text-indigo-400 border-indigo-500/40">
                  Enforced
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-slate-900 border border-slate-800">
                <div>
                  <p className="font-semibold text-white">Password Hashing Primitive</p>
                  <p className="text-slate-400">{settings?.security?.hashingAlgorithm}</p>
                </div>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/40">
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-slate-900 border border-slate-800">
                <div>
                  <p className="font-semibold text-white">JWT Access Token Expiration</p>
                  <p className="text-slate-400">Lifespan: {settings?.jwtExpiresIn}</p>
                </div>
                <Badge variant="outline" className="text-indigo-400 border-indigo-500/40">
                  Standard
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-slate-900 border border-slate-800">
                <div>
                  <p className="font-semibold text-white">Tenancy Boundary Enforcement</p>
                  <p className="text-slate-400">{settings?.security?.tenancyIsolation}</p>
                </div>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/40">
                  Strict
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
