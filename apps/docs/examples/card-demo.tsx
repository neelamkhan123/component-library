"use client";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
} from "neelam-ui";

export default function CardDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create a project</CardTitle>
        <CardDescription>Deploy your new project in one click.</CardDescription>
      </CardHeader>
      <CardContent>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
          Name
          <Input placeholder="my-app" />
        </label>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  );
}
