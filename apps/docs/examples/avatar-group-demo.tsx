"use client";

import { Avatar, AvatarFallback, AvatarGroup } from "neelam-ui";

export default function AvatarGroupDemo() {
  return (
    <AvatarGroup label="Project collaborators" max={4} total={12}>
      <Avatar>
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>GH</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AT</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>KJ</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MH</AvatarFallback>
      </Avatar>
    </AvatarGroup>
  );
}
