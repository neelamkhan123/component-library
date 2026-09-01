"use client";

import { Attachment } from "neelam-ui";

export default function AttachmentDemo() {
  return (
    <div className="flex flex-col gap-3">
      <Attachment name="release-notes.pdf" size="248 KB" />
      <Attachment
        name="q3-forecast.xlsx"
        size="1.2 MB"
        url="/q3-forecast.xlsx"
      />
    </div>
  );
}
