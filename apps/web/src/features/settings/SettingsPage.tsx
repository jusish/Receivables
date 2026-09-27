import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge } from '@receivables/ui';
import { Building2, Users } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Business Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure business details, default currency, timezones, and staff memberships.
        </p>
      </div>

      {/* Business Profile */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-base font-semibold">Business Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Business Name</label>
              <Input defaultValue="Kigali Trading Co." className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Business Code</label>
              <Input defaultValue="BIZ-KTC" disabled className="mt-1 bg-slate-50" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Default Currency</label>
              <Input defaultValue="RWF (Rwandan Franc)" disabled className="mt-1 bg-slate-50" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Timezone</label>
              <Input defaultValue="Africa/Kigali (UTC+2)" disabled className="mt-1 bg-slate-50" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button size="sm">Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Members & Roles */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-base font-semibold">Team Members & Roles</CardTitle>
            </div>
            <Button size="sm" variant="outline">
              Invite User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Justin Ishimwe</p>
                <p className="text-xs text-slate-500">+250 788 123 456</p>
              </div>
              <Badge variant="outline">Business Owner</Badge>
            </div>
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Alice Uwase</p>
                <p className="text-xs text-slate-500">+250 788 654 321</p>
              </div>
              <Badge variant="secondary">Accountant</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
