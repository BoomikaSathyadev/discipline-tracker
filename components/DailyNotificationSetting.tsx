'use client';

import { useEffect, useState } from 'react';
import {
  DailyNotificationState,
  dailyNotificationErrorMessage,
  disableDailyNotifications,
  enableDailyNotifications,
  loadDailyNotificationState,
} from '@/lib/daily-notifications';

type SettingState = DailyNotificationState | 'loading' | 'error';

export default function DailyNotificationSetting() {
  const [state, setState] = useState<SettingState>('loading');
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadDailyNotificationState().then(setState).catch(error => {
      setErrorMessage(dailyNotificationErrorMessage(error));
      setState('error');
    });
  }, []);

  async function toggleReminder() {
    setBusy(true);
    setErrorMessage('');
    try {
      if (state === 'enabled') {
        await disableDailyNotifications();
        setState('disabled');
      } else {
        setState(await enableDailyNotifications());
      }
    } catch (error) {
      setErrorMessage(dailyNotificationErrorMessage(error));
      setState('error');
    } finally {
      setBusy(false);
    }
  }

  const unavailable = state === 'unsupported' || state === 'denied';
  const status = state === 'enabled'
    ? 'Scheduled daily for 9:45 PM local time.'
    : state === 'denied'
      ? 'Notifications are blocked. Allow them in Android app settings to enable this reminder.'
      : state === 'unsupported'
        ? 'Push notifications are not supported by this browser.'
        : state === 'error'
          ? errorMessage
          : state === 'loading'
            ? 'Checking reminder status…'
            : 'Daily Check-in Reminder · 9:45 PM local time';

  return (
    <div className="bg-white rounded-2xl p-4 space-y-3" style={{ border: '1px solid #e5e5e3' }}>
      <div>
        <p className="text-sm font-semibold text-neutral-800">Daily Check-in Reminder</p>
        <p className="text-xs text-neutral-400 mt-0.5">Scheduled for 9:45 PM in your local time zone.</p>
      </div>
      <button type="button" onClick={toggleReminder} disabled={busy || state === 'loading' || unavailable}
        className="w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        style={{ background: '#f7f7f5', color: '#1a1a1a', border: '1px solid #e5e5e3' }}>
        {busy ? 'Updating…' : state === 'enabled' ? 'Disable reminder' : 'Enable reminder'}
      </button>
      <p role="status" className="text-xs text-neutral-500">{status}</p>
    </div>
  );
}
