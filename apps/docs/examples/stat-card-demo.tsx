"use client";

import { Users } from "lucide-react";
import { StatCard } from "neelam-ui";

const trend = [180, 190, 210, 205, 240, 260, 255, 290, 310, 340];

export default function StatCardDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <StatCard
        label="Active users"
        value="12.9K"
        delta={0.124}
        deltaLabel="vs. previous 30 days"
        trend={trend}
        icon={<Users className="h-4 w-4" />}
      />
      {/* Response time going up is bad news, so the colour has to flip. */}
      <StatCard
        label="Avg. response time"
        value="248 ms"
        delta={0.062}
        deltaLabel="vs. previous 30 days"
        deltaDirection="down-is-good"
      />
    </div>
  );
}
