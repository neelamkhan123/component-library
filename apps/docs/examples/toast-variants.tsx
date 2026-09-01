"use client";

import { Button, toast, Toaster } from "neelam-ui";

export default function ToastVariants() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" onClick={() => toast("Saved successfully")}>
          Default
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast({ title: "Profile updated", variant: "success" })
          }
        >
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast({
              title: "Could not save changes",
              description: "Check your connection and try again.",
              variant: "destructive",
              duration: Infinity,
            })
          }
        >
          Destructive
        </Button>
      </div>
      <Toaster position="bottom-right" />
    </>
  );
}
