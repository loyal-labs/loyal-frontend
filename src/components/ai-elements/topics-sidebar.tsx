// components/topics-sidebar.tsx
"use client";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // shadcn/ui

type Topic = { id: string; title: string; updatedAt: string };

interface TopicsSidebarProps {
  topics: Topic[];
  onNewChat?: () => void;
}

export function TopicsSidebar({ topics, onNewChat }: TopicsSidebarProps) {
  return (
    <aside className="flex h-screen w-72 flex-col border-r">
      <div className="flex gap-2 border-b p-3">
        <Button onClick={onNewChat}>New chat</Button>
      </div>
      <ScrollArea className="flex-1">
        <ul className="p-2">
          {topics.map((t) => (
            <li className="rounded px-2 py-1 hover:bg-muted" key={t.id}>
              <Link className="block" href={`/chat/${t.id}`}>
                <div className="truncate font-medium">{t.title}</div>
                <div className="text-muted-foreground text-xs">
                  {new Date(t.updatedAt).toLocaleString()}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </aside>
  );
}
