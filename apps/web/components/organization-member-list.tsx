"use client";

import React, { useState } from "react";
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Trash2,
  Circle,
} from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { useRemoveUser } from "@/lib/api";
import { useSession } from "next-auth/react";
import {
  LiveblocksProvider,
  RoomProvider,
  useOthers,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { toast } from "sonner";

interface OrganizationMemberListProps {
  members: any[];
  isAdmin: boolean;
  tenantId: string;
}

function MemberListInner({
  members,
  isAdmin,
}: {
  members: any[];
  isAdmin: boolean;
}) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // Real-time presence using Liveblocks
  const others = useOthers();
  const removeUserMutation = useRemoveUser();
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Extract all currently online emails
  const onlineEmails = new Set(others.map(other => other.presence.email));

  const handleRemoveUser = async (id: string, name: string) => {
    setRemovingId(id);
    try {
      await removeUserMutation.mutateAsync(id);
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingId(null);
    }
  };

  if (!members || members.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-3 p-12 text-center italic">
        <AlertTriangle className="h-8 w-8 opacity-20" />
        No members found in this organization.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/30 border-border/50 text-muted-foreground border-b text-left text-[10px] font-medium tracking-wider uppercase">
            <th className="px-6 py-3">Member</th>
            <th className="px-6 py-3">Role</th>
            <th className="px-6 py-3 text-center">Status</th>
            {isAdmin && <th className="px-6 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-border/50 divide-y">
          {members.map(member => {
            const isMe = member.id === currentUserId;
            // A user is online if it's 'me' or if their email is in the Liveblocks presence list
            const isOnline = isMe || onlineEmails.has(member.email);

            return (
              <tr
                key={member.id}
                className="group hover:bg-primary/5 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 border-primary/20 ring-offset-background ring-primary/20 relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border transition-all group-hover:ring-2">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-primary text-xs font-bold">
                          {(
                            member.first_name?.[0] ||
                            member.email?.[0] ||
                            "?"
                          ).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-foreground group-hover:text-primary flex items-center gap-2 font-semibold transition-colors">
                        {member.first_name
                          ? `${member.first_name} ${member.last_name || ""}`
                          : member.email.split("@")[0]}
                        {isMe && (
                          <Badge
                            variant="outline"
                            className="h-4 px-1 py-0 text-[9px] uppercase"
                          >
                            You
                          </Badge>
                        )}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {member.email}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={member.role === "admin" ? "secondary" : "outline"}
                    className={`text-[10px] font-bold tracking-tighter uppercase ${member.role === "admin" ? "border-blue-500/20 bg-blue-500/10 text-blue-500" : "bg-muted/50 text-muted-foreground"}`}
                  >
                    {member.role === "admin" ? (
                      <ShieldCheck className="mr-1 h-3 w-3" />
                    ) : (
                      <Users className="mr-1 h-3 w-3" />
                    )}
                    {member.role}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1.5">
                    <Circle
                      className={`h-2.5 w-2.5 fill-current ${isOnline ? "text-green-500" : "text-muted-foreground/30"}`}
                    />
                    <span
                      className={`text-xs font-medium ${isOnline ? "text-green-500" : "text-muted-foreground"}`}
                    >
                      {isOnline ? "Active" : "Offline"}
                    </span>
                  </div>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    {!isMe && member.role !== "admin" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
                            disabled={removingId === member.id}
                          >
                            {removingId === member.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Remove Team Member
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove{" "}
                              <strong>{member.email}</strong> from the
                              organization? They will immediately lose access to
                              all resources. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleRemoveUser(member.id, member.email)
                              }
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Yes, Remove User
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MemberListSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-12">
      <Loader2 className="text-primary h-8 w-8 animate-spin opacity-50" />
      <p className="text-muted-foreground animate-pulse text-sm">
        Connecting to team directory...
      </p>
    </div>
  );
}

export function OrganizationMemberList({
  members,
  isAdmin,
  tenantId,
}: OrganizationMemberListProps) {
  const publicApiKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

  if (!publicApiKey || !tenantId) {
    return <MemberListSkeleton />;
  }

  return (
    <LiveblocksProvider publicApiKey={publicApiKey}>
      <RoomProvider
        id={`org-presence-${tenantId}`}
        initialPresence={{ email: "viewer", isOnline: true }}
      >
        <ClientSideSuspense fallback={<MemberListSkeleton />}>
          {() => <MemberListInner members={members} isAdmin={isAdmin} />}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
