// scripts/scrape.mjs — monthly IFSC snapshot.
// Tries the Razorpay public IFSC mirror of RBI data; falls back to a small
// embedded sample if upstream is unreachable.
import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const UA = "oriz-api-bot/0.1 (+https://oriz.in/about)";

const FALLBACK = {
  HDFC: [
    { ifsc: "HDFC0000001", branch: "MUMBAI - FORT" },
    { ifsc: "HDFC0000060", branch: "NEW DELHI - CONNAUGHT PLACE" },
    { ifsc: "HDFC0000240", branch: "BANGALORE - KORAMANGALA" },
  ],
  ICIC: [
    { ifsc: "ICIC0000001", branch: "MUMBAI - BACKBAY RECLAMATION" },
    { ifsc: "ICIC0000002", branch: "MUMBAI - WORLI" },
    { ifsc: "ICIC0000007", branch: "NEW DELHI - PARLIAMENT STREET" },
  ],
  SBIN: [
    { ifsc: "SBIN0000001", branch: "MUMBAI MAIN BRANCH" },
    { ifsc: "SBIN0000300", branch: "NEW DELHI MAIN BRANCH" },
    { ifsc: "SBIN0000813", branch: "CHENNAI MAIN BRANCH" },
  ],
  UTIB: [
    { ifsc: "UTIB0000001", branch: "MUMBAI - FORT (AXIS)" },
    { ifsc: "UTIB0000002", branch: "NEW DELHI - CONNAUGHT PLACE (AXIS)" },
  ],
  KKBK: [
    { ifsc: "KKBK0000001", branch: "MUMBAI - BKC (KOTAK)" },
    { ifsc: "KKBK0000200", branch: "BANGALORE - MG ROAD (KOTAK)" },
  ],
};

async function main() {
  let banks = FALLBACK;
  let source = "embedded fallback (upstream unavailable)";
  try {
    const r = await fetch(
      "https://raw.githubusercontent.com/razorpay/ifsc/master/src/IFSC.json",
      { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(45000) },
    );
    if (r.ok) {
      const j = await r.json();
      // Razorpay stores IFSC suffixes as numbers/strings under a 4-letter bank
      // prefix; full IFSC = `${prefix}0${suffix.padStart(6,'0')}`.
      const fmt = (prefix, code) => {
        const s = String(code);
        return prefix + "0" + s.padStart(6, "0");
      };
      const out = {};
      for (const [bank, codes] of Object.entries(j)) {
        if (Array.isArray(codes) && /^[A-Z]{4}$/.test(bank)) {
          out[bank] = codes
            .slice(0, 50)
            .map((c) => ({ ifsc: fmt(bank, c), branch: "" }));
        }
      }
      if (Object.keys(out).length > 5) {
        banks = out;
        source = "https://github.com/razorpay/ifsc (RBI mirror)";
      }
    }
  } catch (e) {
    console.warn("[ifsc] upstream failed:", e.message);
  }
  const count = Object.values(banks).reduce((s, a) => s + a.length, 0);
  const payload = {
    source,
    fetchedAt: new Date().toISOString(),
    count,
    bankCount: Object.keys(banks).length,
    banks,
  };
  const dataDir = join(ROOT, "data");
  await mkdir(dataDir, { recursive: true });
  await writeFile(join(dataDir, "ifsc.json"), JSON.stringify(payload, null, 2));
  await writeFile(join(dataDir, "latest.json"), JSON.stringify(payload, null, 2));
  console.log(`[ifsc] wrote ${count} IFSC codes across ${Object.keys(banks).length} banks`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
