// Verifies that each product image is relevant to its subject by checking
// whether the photo appears in Unsplash's search results for that subject.
// Uses r.jina.ai to render the client-rendered Unsplash search page to text.
// Usage: node scripts/verify-subjects.mjs

const MAP = {
  "photo-1546435770-a3e426bf472b": "headphones",
  "photo-1505740420928-5e560c06d30e": "headphones",
  "photo-1591047139829-d91aecb6caea": "earbuds",
  "photo-1572569511254-d8f925fe2cbb": "smartphone",
  "photo-1589003077984-894e133dabab": "speaker",
  "photo-1608043152269-423dbba4e7e1": "speaker",
  "photo-1599669454699-248893623440": "gaming headset",
  "photo-1618384887929-16ec33fab9ef": "mechanical keyboard",
  "photo-1587825140708-dfaf72ae4b04": "keyboard",
  "photo-1618424181497-157f25b6ddd5": "gaming keyboard",
  "photo-1587829741301-dc798b83add3": "computer mouse",
  "photo-1583394838336-acd977736f90": "gaming mouse",
  "photo-1547082299-de196ea013d6": "imac monitor",
  "photo-1527443224154-c4a3942d3acf": "desk setup monitor",
  "photo-1496181133206-80ce9b88a853": "macbook",
  "photo-1517336714731-489689fd1ca8": "macbook",
  "photo-1523275335684-37898b6baf30": "watch",
  "photo-1546868871-7041f2a55e12": "smartwatch",
  "photo-1579586337278-3befd40fd17a": "smart ring",
  "photo-1473968512647-3e447244af8f": "drone",
  "photo-1579829366248-204fe8413f31": "drone",
  "photo-1516035069371-29a1b244cc32": "camera",
  "photo-1515859005217-8a1f08870f59": "camera lens",
  "photo-1526170375885-4d8ecf77b99f": "camera",
  "photo-1609091839311-d5365f9ff1c5": "power bank",
  "photo-1585487000160-6ebcfceb0d03": "wireless charger",
  "photo-1590602847861-f357a9332bbc": "microphone",
  "photo-1611224885990-ab7363d1f2a9": "usb c hub",
  "photo-1607779097040-26e80aa78e66": "laptop accessories",
  "photo-1618410320928-25228d811631": "webcam",
};

const cache = new Map();

async function resultsFor(query) {
  if (cache.has(query)) return cache.get(query);
  const url = `https://r.jina.ai/https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { accept: "text/plain", "user-agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(60000),
  });
  const text = await res.text();
  cache.set(query, text);
  return text;
}

let pass = 0;
let fail = 0;
for (const [id, query] of Object.entries(MAP)) {
  const page = await resultsFor(query);
  const found = page.includes(id);
  if (found) pass++;
  else {
    fail++;
    console.log(`MISMATCH ${id}  expected "${query}"`);
  }
}
console.log(`\n${pass}/${Object.keys(MAP).length} images confirmed on-subject.`);
process.exit(fail > 0 ? 1 : 0);
