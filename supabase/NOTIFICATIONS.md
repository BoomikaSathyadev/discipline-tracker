# Daily check-in push notifications

## Deploy the notification backend

1. Link the Supabase CLI to the existing project, then apply the single new migration:

   ```sh
   npx supabase link --project-ref <project-ref>
   npx supabase db push
   ```

   The migration creates `public.daily_notification_subscriptions`, enables RLS, and limits rows to their owning authenticated user.

2. Generate a VAPID key pair:

   ```sh
   npx web-push generate-vapid-keys
   ```

3. Set these secrets for the Supabase Edge Function. Use the generated public/private keys and a long random cron secret:

   ```sh
   npx supabase secrets set VAPID_PUBLIC_KEY=<public-key> VAPID_PRIVATE_KEY=<private-key> VAPID_SUBJECT=mailto:<contact-email> CRON_SECRET=<long-random-secret>
   ```

   The VAPID private key and cron secret stay in Supabase. Never add them to the Next.js environment.

4. Deploy the function:

   ```sh
   npx supabase functions deploy send-daily-checkin
   ```

5. Add only the public VAPID key to the Next.js environment as `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, alongside the existing public Supabase settings. Rebuild/redeploy the Next.js app after setting it.

6. In Supabase Dashboard → Database → Extensions, enable `pg_cron`, `pg_net`, and Vault if they are not already enabled. In SQL Editor, store the function URL and the same cron secret in Vault:

   ```sql
   select vault.create_secret('https://<project-ref>.supabase.co/functions/v1/send-daily-checkin', 'daily_checkin_function_url');
   select vault.create_secret('<the same CRON_SECRET>', 'daily_checkin_cron_secret');
   ```

7. Schedule the function once per minute. The function checks each active subscription's IANA time zone and sends only during its local 9:45 PM minute:

   ```sql
   select cron.schedule(
     'daily-checkin-push-every-minute',
     '* * * * *',
     $$
       select net.http_post(
         url := (select decrypted_secret from vault.decrypted_secrets where name = 'daily_checkin_function_url'),
         headers := jsonb_build_object(
           'Content-Type', 'application/json',
           'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'daily_checkin_cron_secret')
         ),
         body := '{}'::jsonb,
         timeout_milliseconds := 55000
       );
     $$
   );
   ```

## Android setup and test

Install/open the app from Chrome on Android, sign in, open Settings, and tap **Enable reminder**. Accept Chrome's notification permission prompt. The app stores the device's time zone with its push subscription. Permission is requested only while it is in the default state; granted/denied permission is not prompted again. To disable, tap **Disable reminder** in Settings.

To test delivery, enable the reminder before 9:45 PM local time, close the PWA, and wait for the notification. Tap it to open `/today`. Android must allow notifications for the installed PWA, and the device must have network access. Supabase Cron checks at one-minute intervals and push delivery can be delayed by the network or Android/browser power management.
