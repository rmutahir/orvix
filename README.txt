ORVIX - store + admin (Node.js / Express). Runs locally or on Vercel.

LOCAL
  npm install, then ADMIN_PASSWORD="your-password" npm start
  Store http://localhost:3000   Admin http://localhost:3000/admin   (data saved in data/db.json)

VERCEL (orvixpk.vercel.app)
  1. Upload the WHOLE folder (package.json, server.js, api/, public/, vercel.json) to GitHub and import it in Vercel.
     Framework preset: Other. Leave build/output settings empty (vercel.json sets them).
  2. Vercel project > Storage > Marketplace > Upstash Redis (free) > connect to this project.
     This adds KV_REST_API_URL and KV_REST_API_TOKEN automatically.
  2b. Storage > Create Blob store > connect to this project (needed for product and category photo uploads;
     adds BLOB_READ_WRITE_TOKEN automatically).
  3. Project > Settings > Environment Variables: add ADMIN_PASSWORD (strong). Optional: SESSION_SECRET (random text).
  4. Deployments > Redeploy.
  Admin: https://orvixpk.vercel.app/admin

ADMIN ON admin.yourdomain.com (after you buy a domain)
  Vercel > Settings > Domains: add yourdomain.com and admin.yourdomain.com.
  Add this to the "rewrites" list at the TOP of vercel.json (replace the domain):
  {"source":"/","has":[{"type":"host","value":"admin.yourdomain.com"}],"destination":"/admin/index.html"}

NOTES
  Data lives in one Redis key (orvix_db) on Vercel. Fine for early volume; move to a full database later by
  replacing read()/write() in server.js. Back up by exporting that key from the Upstash dashboard.
  Legal pages are drafts. Customer emails are saved, but no email is sent yet.
