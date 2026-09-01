"use client";

import { useState } from "react";
import { Attachment } from "neelam-ui";

export default function AttachmentPending() {
  const [files, setFiles] = useState([
    { name: "diagram.png", size: "84 KB" },
    { name: "notes.txt", size: "2 KB" },
  ]);

  if (files.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        All attachments removed.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-start gap-3">
      {files.map((file) => (
        // onRemove marks this as staged in a composer, not already sent.
        <Attachment
          key={file.name}
          name={file.name}
          size={file.size}
          onRemove={() =>
            setFiles((current) => current.filter((f) => f.name !== file.name))
          }
        />
      ))}
    </div>
  );
}
