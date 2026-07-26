import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const files = fs.readdirSync(root).filter((file) => file.endsWith(".html"));

function value(source, expression) {
  const match = source.match(expression);
  return match ? match[1].trim() : "";
}

function decode(valueToDecode) {
  return valueToDecode
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function meta(property, content, attribute = "property") {
  return `  <meta ${attribute}="${property}" content="${content}">`;
}

for (const file of files) {
  const filePath = path.join(root, file);
  let html = fs.readFileSync(filePath, "utf8");
  const title = value(html, /<title>([\s\S]*?)<\/title>/i);
  const description = value(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
  const canonical = value(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i);
  const localHero = value(html, /<img[^>]+class="[^"]*(?:hero-media|page-hero-media)[^"]*"[^>]+src="([^"]+)"/i);
  const existingImage = value(html, /<meta\s+property="og:image"\s+content="([^"]*)"/i);
  const image = existingImage || (localHero ? `https://aventuraksa.com/${localHero}` : "https://aventuraksa.com/assets/images/og-cover.jpg");

  if (!html.includes('name="referrer"')) {
    html = html.replace(/(\s*<meta name="theme-color"[^>]*>)/i, `$1\n  <meta name="referrer" content="strict-origin-when-cross-origin">`);
  }

  const tags = [];
  if (!html.includes('property="og:type"')) tags.push(meta("og:type", "website"));
  if (!html.includes('property="og:site_name"')) tags.push(meta("og:site_name", "AVENTURA"));
  if (!html.includes('property="og:title"')) tags.push(meta("og:title", title));
  if (!html.includes('property="og:description"')) tags.push(meta("og:description", description));
  if (!html.includes('property="og:url"')) tags.push(meta("og:url", canonical));
  if (!html.includes('property="og:locale"')) tags.push(meta("og:locale", "en_US"));
  if (!html.includes('property="og:image"')) tags.push(meta("og:image", image));
  if (!html.includes('name="twitter:card"')) tags.push(meta("twitter:card", "summary_large_image", "name"));
  if (!html.includes('name="twitter:title"')) tags.push(meta("twitter:title", title, "name"));
  if (!html.includes('name="twitter:description"')) tags.push(meta("twitter:description", description, "name"));
  if (!html.includes('name="twitter:image"')) tags.push(meta("twitter:image", image, "name"));
  if (tags.length) {
    html = html.replace(/(\s*<link rel="stylesheet")/i, `\n${tags.join("\n")}\n$1`);
  }

  if (!html.includes("assets/js/analytics.js") && html.includes("assets/js/app.js")) {
    html = html.replace(/(\s*<script src="assets\/js\/app\.js" defer><\/script>)/i, `\n  <script src="assets/js/analytics.js" defer></script>$1`);
  }

  if (file !== "404.html" && !html.includes('type="application/ld+json"')) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: decode(title),
      description: decode(description),
      url: canonical,
      inLanguage: ["en", "ar", "es"],
      isPartOf: {
        "@type": "WebSite",
        name: "AVENTURA",
        url: "https://aventuraksa.com/"
      }
    };
    html = html.replace(/\s*<\/head>/i, `\n  <script type="application/ld+json">\n${JSON.stringify(schema, null, 2).split("\n").map((line) => `  ${line}`).join("\n")}\n  </script>\n</head>`);
  }

  fs.writeFileSync(filePath, html, "utf8");
}

console.log(`Enriched ${files.length} HTML files.`);
