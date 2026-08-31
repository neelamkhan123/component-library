"use client";

import { Button, toast, Toaster } from "@neelamkhan21/ui";

export default function ToastDemo() {
  return (
    <>
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: "Event created",
            description: "Monday, January 3rd at 6:00pm.",
            action: { label: "Undo", onClick: () => toast("Event removed") },
          })
        }
      >
        Show toast
      </Button>
      {/* In a real app this lives once, near the root of the tree. */}
      <Toaster position="bottom-right" />
    </>
  );
}
