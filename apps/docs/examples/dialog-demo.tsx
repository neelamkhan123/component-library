"use client";

import {
  Button,
  buttonVariants,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  useDialog,
} from "@neelamkhan21/ui";

// `useDialog` lets any control inside the dialog drive its open state — here
// a real Button, which DialogClose is not.
function SaveButton() {
  const { onOpenChange } = useDialog();
  return <Button onClick={() => onOpenChange(false)}>Save changes</Button>;
}

export default function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger className={buttonVariants({ variant: "outline" })}>
        Edit profile
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose className={buttonVariants({ variant: "outline" })}>
            Cancel
          </DialogClose>
          <SaveButton />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
