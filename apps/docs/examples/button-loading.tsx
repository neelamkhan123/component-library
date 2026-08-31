"use client";

import { useState } from "react";
import { Button } from "@neelamkhan21/ui";

export default function ButtonLoading() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        loading={loading}
        onClick={() => {
          setLoading(true);
          window.setTimeout(() => setLoading(false), 2000);
        }}
      >
        {loading ? "Saving…" : "Save changes"}
      </Button>
      <Button disabled>Disabled</Button>
    </div>
  );
}
