"""Read aggregate Aventura GA4 event counts using short-lived Google credentials.

Requires Application Default Credentials and GA4 property Viewer permission.
Never prints tokens, credentials, personal data or journey identifiers.
"""
import json
import os
import sys
from datetime import datetime, timezone, timedelta
from urllib.request import Request, urlopen
from urllib.error import HTTPError

import google.auth
from google.auth.transport.requests import Request as AuthRequest

PROPERTY_ID = os.environ.get("GA4_PROPERTY_ID", "549237338")
SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]
API = f"https://analyticsdata.googleapis.com/v1beta/properties/{PROPERTY_ID}:runReport"

def main():
    credentials, _ = google.auth.default(scopes=SCOPES)
    credentials.refresh(AuthRequest())
    payload = {
        "dateRanges": [{"startDate": "yesterday", "endDate": "yesterday"}],
        "dimensions": [{"name": "eventName"}],
        "metrics": [{"name": "eventCount"}],
        "limit": 100,
    }
    request = Request(API, data=json.dumps(payload).encode("utf-8"),
                      headers={"Authorization": f"Bearer {credentials.token}",
                               "Content-Type": "application/json"}, method="POST")
    try:
        with urlopen(request, timeout=30) as response:
            result = json.load(response)
    except HTTPError as exc:
        print(f"GA4 request failed: HTTP {exc.code}. Verify property access and API permissions.", file=sys.stderr)
        sys.exit(1)
    events = [{"event": row["dimensionValues"][0]["value"],
               "count": int(row["metricValues"][0]["value"])}
              for row in result.get("rows", [])]
    report = {"property_id": PROPERTY_ID, "period": "yesterday",
              "generated_at_utc": datetime.now(timezone.utc).isoformat(),
              "scope": "aggregate_event_counts_only", "events": events}
    os.makedirs("conan-output", exist_ok=True)
    with open("conan-output/ga4-event-summary.json", "w", encoding="utf-8") as output:
        json.dump(report, output, ensure_ascii=False, indent=2)
    print(f"GA4 report completed: {len(events)} event categories (no visitor-level data).")

if __name__ == "__main__":
    main()
