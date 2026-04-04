"use client";

import React from "react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Sheet, SheetTrigger } from "@workspace/ui/components/sheet";
import { Menu, Sparkles } from "lucide-react";
import type { Tenant, User as UserType } from "@/lib/api";

interface TopbarProps {
  limitReached: boolean;
  canUpgrade: boolean;
  onUpgrade: () => void;
  tenant: Tenant;
  user: UserType | null;
  tenantLoading: boolean;
  children: React.ReactNode;
  onOpenSheet: () => void;
  isSheetOpen: boolean;
  onLogout: () => void;
}

export const Topbar = React.memo(function Topbar({
  limitReached,
  canUpgrade,
  onUpgrade,
  tenant,
  user,
  tenantLoading,
  children,
  onOpenSheet,
  isSheetOpen,
  onLogout,
}: TopbarProps) {
  return (
    <header className="bg-card flex w-full items-center justify-between px-3 py-2 md:hidden">
      {}
      <Sheet open={isSheetOpen} onOpenChange={onOpenSheet}>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline">
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        {children} {}
      </Sheet>

      {}
      <div className="flex items-center gap-2">
        {tenantLoading ? (
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-pretty">
              {tenant?.slug}
            </span>
            <Badge
              variant="secondary"
              className="px-1.5 py-0.5 text-xs font-medium"
            >
              {tenant?.plan?.toLowerCase() === "free" ? "Free" : "Pro"}
            </Badge>
          </div>
        )}
      </div>

      {}
      <div className="flex items-center gap-2">
        {!tenantLoading && canUpgrade && (
          <Button size="sm" onClick={onUpgrade} variant="secondary">
            <Sparkles className="mr-1.5 size-4" />
            Upgrade
          </Button>
        )}
      </div>
    </header>
  );
});
