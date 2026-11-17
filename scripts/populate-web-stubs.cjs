const fs = require('fs');
const path = require('path');

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full);
    } else if (stat.size === 0) {
      if (item === 'page.tsx') {
        fs.writeFileSync(full, 'export default function Page() {\n  return <div>Under Construction</div>;\n}\n', 'utf8');
      } else if (item === 'layout.tsx') {
        fs.writeFileSync(full, 'export default function Layout({ children }: { children: React.ReactNode }) {\n  return <>{children}</>;\n}\n', 'utf8');
      } else if (item === 'loading.tsx') {
        fs.writeFileSync(full, 'export default function Loading() {\n  return <div>Loading...</div>;\n}\n', 'utf8');
      } else if (item === 'error.tsx' || item === 'global-error.tsx') {
        fs.writeFileSync(full, '"use client";\nexport default function ErrorBoundary({ reset }: { reset: () => void }) {\n  return <div>Error <button onClick={() => reset()}>Retry</button></div>;\n}\n', 'utf8');
      } else if (item === 'not-found.tsx') {
        fs.writeFileSync(full, 'export default function NotFound() {\n  return <div>404 Not Found</div>;\n}\n', 'utf8');
      } else if (item === 'route.ts') {
        fs.writeFileSync(full, 'import { NextResponse } from "next/server";\nexport async function GET() {\n  return NextResponse.json({ ok: true });\n}\n', 'utf8');
      } else if (item === 'robots.ts') {
        fs.writeFileSync(full, 'export default function robots() {\n  return { rules: { userAgent: "*", allow: "/" } };\n}\n', 'utf8');
      } else if (item === 'sitemap.ts') {
        fs.writeFileSync(full, 'export default function sitemap() {\n  return [];\n}\n', 'utf8');
      } else {
        fs.writeFileSync(full, 'export {};\n', 'utf8');
      }
      console.log('Populated:', item, 'at', full);
    }
  }
}

walk('d:/project/apps/web/src/app');
console.log('Finished populating stubs.');

