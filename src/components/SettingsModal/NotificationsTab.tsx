import type { SettingsTabProps } from './types';

export const NotificationsTab = ({ formData, setFormData }: SettingsTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
          Enable System Notifications
          <input
            type="checkbox"
            checked={formData.notifications.enabled}
            onChange={(e) =>
              setFormData({
                ...formData,
                notifications: { ...formData.notifications, enabled: e.target.checked },
              })
            }
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
      </div>
      <div className="space-y-3 pt-2">
        {[
          {
            label: 'Notify on System Overheating',
            checked: formData.notifications.notify_on_overheating,
            path: ['notifications', 'notify_on_overheating'] as const,
          },
          {
            label: 'Notify when Ethereal is Angry',
            checked: formData.notifications.notify_on_angry,
            path: ['notifications', 'notify_on_angry'] as const,
          },
          {
            label: 'Notify on Low Battery',
            checked: formData.battery.notify_on_low_battery,
            path: ['battery', 'notify_on_low_battery'] as const,
          },
        ].map((item) => (
          <label
            key={item.label}
            className="flex items-center gap-2 text-sm cursor-pointer hover:text-white transition-colors group"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => {
                const [section, field] = item.path;
                setFormData({
                  ...formData,
                  [section]: { ...formData[section], [field]: e.target.checked },
                });
              }}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-white/60 group-hover:text-white/90">{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
