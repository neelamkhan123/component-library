"use client";

import { Avatar, AvatarFallback, AvatarImage } from "neelam-ui";

export default function AvatarDemo() {
  return (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage
          src="https://i.pravatar.cc/128?img=47"
          alt="Ada Lovelace"
        />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>

      {/* No src, so the fallback is what shows. */}
      <Avatar>
        <AvatarFallback>GH</AvatarFallback>
      </Avatar>
    </div>
  );
}
