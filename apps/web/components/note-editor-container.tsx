"use client";

import React, { useState, useEffect } from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";
import * as Y from "yjs";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
  useRoom,
} from "@liveblocks/react/suspense";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import type { Note } from "@/lib/api";
import { NoteEditorInner } from "./note-editor-inner";

export interface NoteEditorContainerProps {
  noteId: string;
  onNoteUpdate: (noteId: string, updates: Partial<Note>) => void;
  isDirty: boolean;
  onDirtyChange: (isDirty: boolean) => void;
  registerSaveFn?: (fn: () => Promise<void>) => void;
  onPDFUpload?: (file: File) => void;
  onInviteUser?: () => void;
  onExportNote?: (note: Note) => void;
  onShareNote?: (note: Note) => void;
  isAdmin: boolean;
  readOnly?: boolean;
}

export const NoteEditorContainer = React.memo(function NoteEditorContainer(
  props: NoteEditorContainerProps
) {
  return (
    <LiveblocksProvider
      publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!}
      largeMessageStrategy="split"
    >
      <RoomProvider
        id={`note:${props.noteId}`}
        initialPresence={{ cursor: null, title: "" }}
      >
        <ClientSideSuspense fallback={<EditorSkeleton />}>
          {() => <LiveblocksProviderWrapper key={props.noteId} {...props} />}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
});

function LiveblocksProviderWrapper(props: any & { noteId: string }) {
  const room = useRoom();
  const [doc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<LiveblocksYjsProvider | null>(null);

  useEffect(() => {
    // When switching rooms (noteId changes), we MUST use a fresh Y.Doc
    // Since this component is re-rendered by the RoomProvider change,
    // and ideally we want a clean state, we can use the useEffect to manage the provider.
    const yProvider = new LiveblocksYjsProvider(room, doc);
    setProvider(yProvider);

    return () => {
      yProvider.destroy();
      setProvider(null);
    };
  }, [room, doc]);

  if (!provider) return <EditorSkeleton />;

  // Using key={props.noteId} ensures the entire editor re-mounts on note switch
  return (
    <NoteEditorInner
      key={props.noteId}
      doc={doc}
      provider={provider}
      {...props}
    />
  );
}

function EditorSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-8 w-16" />
      </div>
      <div className="flex-1 space-y-4 px-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
