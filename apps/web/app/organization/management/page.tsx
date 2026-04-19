"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Users,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  Building,
  UserPlus,
  Settings,
  ChartBar,
  ShieldAlert,
  Eye,
  EyeOff,
  Copy,
  ArrowRight,
  AlertTriangle,
  Lock,
  History,
  Activity,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@workspace/ui/components/tooltip";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  useInviteUser,
  useOrganizationStats,
  useOrganizationUsers,
} from "@/lib/api";
import { inviteUserSchema } from "@/lib/validations";
import { Switch } from "@workspace/ui/components/switch";
import { OrganizationMemberList } from "@/components/organization-member-list";
import { copyToClipboard } from "@/lib/clipboard";

interface OrganizationStats {
  name: string;
  memberCount: number;
  adminCount: number;
  totalCount: number;
  members_can_edit: boolean;
  members_can_create: boolean;
  members_can_share: boolean;
}

function generateRandomPassword(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export default function OrganizationManagementPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const queryClient = useQueryClient();
  const user = session?.user as any;
  const isAdmin = user?.role === "admin";

  const {
    data: statsData,
    isLoading: loading,
    refetch: fetchStats,
  } = useOrganizationStats(user?.role === "admin");
  const stats = statsData as OrganizationStats | undefined;

  const { data: members, isLoading: loadingMembers } = useOrganizationUsers();

  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [invitePassword, setInvitePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [membersCanEdit, setMembersCanEdit] = useState(true);
  const [membersCanCreate, setMembersCanCreate] = useState(true);
  const [membersCanShare, setMembersCanShare] = useState(true);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [initializedName, setInitializedName] = useState(false);

  const inviteUserMutation = useInviteUser();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    /* 
       We now allow members to stay on the page so their 'Active' status is tracked in real-time,
       but we will use 'isAdmin' to hide sensitive controls below.
    */

    if (!initializedName) {
      if (stats?.name) {
        setNewOrgName(stats.name);
        setMembersCanEdit(stats.members_can_edit ?? true);
        setMembersCanCreate(stats.members_can_create ?? true);
        setMembersCanShare(stats.members_can_share ?? true);
        setInitializedName(true);
      } else if (user?.tenantSlug) {
        setNewOrgName(user.tenantSlug);
        setInitializedName(true);
      }
    }

    if (isAdmin && auditLogs.length === 0 && !loadingLogs) {
      fetchAuditLogs();
    }
  }, [status, session, router, user?.role, user?.tenantSlug, stats, isAdmin]);

  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await fetch("/api/organization/audit-logs");
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs");
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");

    const validationResult = inviteUserSchema.safeParse({
      email: inviteEmail,
      role: inviteRole,
    });

    if (!validationResult.success) {
      setInviteError(
        validationResult.error.issues?.[0]?.message || "Validation failed"
      );
      return;
    }

    const validatedData = validationResult.data;

    try {
      const result = await inviteUserMutation.mutateAsync({
        email: validatedData.email,
        role: validatedData.role as "admin" | "member",
        password: invitePassword || undefined,
      });

      toast.success(`User ${inviteEmail} invited successfully!`);

      if (result.password) {
        copyToClipboard(result.password);
        toast.success("Password copied to clipboard!");
      }

      setShowInviteDialog(false);
      setInviteEmail("");
      setInviteRole("member");
      setInvitePassword("");
      setShowPassword(false);
      setInviteError("");
      fetchStats();
    } catch (err: any) {
      setInviteError(err.message || "Failed to invite user");
    }
  };

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setUpdatingSettings(true);
    try {
      const response = await fetch("/api/organization/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newOrgName.trim(),
          members_can_edit: membersCanEdit,
          members_can_create: membersCanCreate,
          members_can_share: membersCanShare,
        }),
      });

      if (response.ok) {
        toast.success("Organization updated successfully");
        setShowSettingsDialog(false);

        queryClient.invalidateQueries({ queryKey: ["organizationStats"] });

        await update();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update organization");
      }
    } catch (error) {
      toast.error("Network error while updating organization");
    } finally {
      setUpdatingSettings(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground selection:bg-primary/30 min-h-screen p-4 antialiased md:p-8">
      {}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-[0.03]">
        <div className="bg-primary absolute top-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[30%] w-[30%] rounded-full bg-blue-500 blur-[100px]" />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 relative z-10 mx-auto max-w-5xl space-y-8 duration-500">
        {}
        {}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground -ml-2"
              onClick={() => router.push("/notes")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Workspace
            </Button>
            <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight">
              <Building className="text-primary h-8 w-8" />
              {isAdmin ? "Organization Management" : "Team Directory"}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin
                ? "Manage your team and view organization-wide metrics."
                : "View and collaborate with your team members in real-time."}
            </p>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {}
        {isAdmin && (
          <div className="animate-in fade-in slide-in-from-top-2 grid grid-cols-1 gap-6 transition-all md:grid-cols-3">
            <Card className="border-border/50 bg-card/50 group hover:border-primary/30 overflow-hidden backdrop-blur-sm transition-all">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team Members
                </CardDescription>
                <CardTitle className="group-hover:text-primary text-4xl font-bold transition-colors">
                  {stats?.memberCount ?? 0}
                </CardTitle>
              </CardHeader>
              <div className="px-6 pt-0 pb-6">
                <div className="bg-muted mt-4 h-1 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full transition-all duration-1000"
                    style={{
                      width: stats?.totalCount
                        ? `${(stats.memberCount / stats.totalCount) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>
            </Card>

            <Card className="border-border/50 bg-card/50 group overflow-hidden backdrop-blur-sm transition-all hover:border-blue-500/30">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Group Admins
                </CardDescription>
                <CardTitle className="text-4xl font-bold transition-colors group-hover:text-blue-500">
                  {stats?.adminCount ?? 0}
                </CardTitle>
              </CardHeader>
              <div className="px-6 pt-0 pb-6">
                <div className="bg-muted mt-4 h-1 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full bg-blue-500 transition-all duration-1000"
                    style={{
                      width: stats?.totalCount
                        ? `${(stats.adminCount / stats.totalCount) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>
            </Card>

            <Card className="border-border/50 bg-card/50 group overflow-hidden backdrop-blur-sm transition-all hover:border-purple-500/30">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <ChartBar className="h-4 w-4" />
                  Total Seats
                </CardDescription>
                <CardTitle className="text-4xl font-bold transition-colors group-hover:text-purple-500">
                  {stats?.totalCount ?? 0}
                </CardTitle>
              </CardHeader>
              <div className="text-muted-foreground mt-4 flex items-center gap-1 px-6 pt-0 pb-6 text-xs">
                <ShieldAlert className="h-3 w-3" />
                Only admins can see these stats.
              </div>
            </Card>
          </div>
        )}

        {}
        {isAdmin && (
          <div className="animate-in fade-in slide-in-from-top-4 mt-12 grid grid-cols-1 gap-8 transition-all md:grid-cols-2">
            <Card className="border-border/50 transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks for organization admins.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="h-14 w-full justify-start gap-3"
                  variant="outline"
                  size="lg"
                  onClick={() => setShowInviteDialog(true)}
                >
                  <div className="bg-primary/10 rounded-lg p-2">
                    <UserPlus className="text-primary h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Invite New Member</div>
                    <div className="text-muted-foreground text-xs">
                      Add someone to your organization
                    </div>
                  </div>
                </Button>
                <Button
                  className="h-14 w-full justify-start gap-3"
                  variant="outline"
                  size="lg"
                  onClick={() => setShowSettingsDialog(true)}
                >
                  <div className="bg-muted rounded-lg p-2">
                    <Settings className="text-foreground h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Organization Settings</div>
                    <div className="text-muted-foreground text-xs">
                      Change organization name and identity
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-primary/5 border-primary/20 flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Lock className="text-primary h-5 w-5 opacity-60" />
                  Admin Security
                </CardTitle>
                <CardDescription>Privacy and visibility rules.</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground flex-1 space-y-4 text-sm leading-relaxed">
                <p>
                  As an organization admin, you have exclusive access to this
                  management dashboard. Regular members of{" "}
                  <strong>{user?.tenantSlug || "your organization"}</strong>{" "}
                  cannot see member counts or administrative settings.
                </p>
                <p>
                  Invite others with the "Admin" role if you want to share these
                  management capabilities. Admins have full visibility and
                  control over organization resources.
                </p>
              </CardContent>
              <CardFooter className="border-primary/10 border-t pt-4">
                <Badge
                  variant="outline"
                  className="text-[10px] tracking-widest opacity-70"
                >
                  ENCRYPTED ADMIN SESSION
                </Badge>
              </CardFooter>
            </Card>
          </div>
        )}

        {}
        <Card className="border-border/50 bg-card/30 overflow-hidden backdrop-blur-sm">
          <CardHeader className="border-border/50 bg-muted/20 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="text-primary h-5 w-5" />
                  Team Members
                </CardTitle>
                <CardDescription>
                  Manage everyone currently in your organization.
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono">
                {members?.length || 0} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingMembers ? (
              <div className="flex flex-col items-center justify-center space-y-4 p-12">
                <Loader2 className="text-primary h-8 w-8 animate-spin opacity-50" />
                <p className="text-muted-foreground animate-pulse text-sm">
                  Loading team roster...
                </p>
              </div>
            ) : (
              <OrganizationMemberList
                members={members || []}
                isAdmin={isAdmin}
                tenantId={user?.tenantId}
              />
            )}
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className="border-border/50 bg-card/30 overflow-hidden backdrop-blur-sm">
            <CardHeader className="border-border/50 bg-muted/20 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <History className="text-primary h-5 w-5" />
                    Security Audit Logs
                  </CardTitle>
                  <CardDescription>
                    Recent administrative and user actions within your
                    organization.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={fetchAuditLogs}
                  disabled={loadingLogs}
                >
                  {loadingLogs ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Activity className="mr-1 h-3 w-3" />
                  )}
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                {loadingLogs && auditLogs.length === 0 ? (
                  <div className="text-muted-foreground p-8 text-center">
                    <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin opacity-50" />
                    Loading security logs...
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-muted-foreground p-8 text-center text-sm italic">
                    No security events recorded yet.
                  </div>
                ) : (
                  <div className="divide-border/50 divide-y">
                    {auditLogs.map(log => (
                      <div
                        key={log.id}
                        className="hover:bg-muted/30 flex items-start gap-4 p-4 transition-colors"
                      >
                        <div className="bg-primary/10 mt-0.5 rounded-full p-2">
                          <Activity className="text-primary h-3 w-3" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold tracking-tight">
                              {log.action.replace("_", " ")}
                            </span>
                            <span className="text-muted-foreground font-mono text-[10px]">
                              {new Date(log.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-xs">
                            Performed by{" "}
                            <span className="text-foreground font-medium">
                              {log.user?.email}
                            </span>
                            {log.entity_type &&
                              ` on ${log.entity_type.toLowerCase()}`}
                          </p>
                          {log.details && (
                            <div className="bg-muted/50 text-muted-foreground mt-2 truncate overflow-hidden rounded p-1.5 font-mono text-[10px]">
                              {log.details}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>
              Add a new user to your organization.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteUser} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">Email Address</Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="name@company.com"
                className="h-10"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <div className="w-full space-y-2">
              <Label htmlFor="inviteRole">Assigned Role</Label>
              <Select
                value={inviteRole}
                onValueChange={value =>
                  setInviteRole(value as "admin" | "member")
                }
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">
                    Member (Regular access)
                  </SelectItem>
                  <SelectItem value="admin">
                    Admin (Full management access)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="invitePassword">Password (Optional)</Label>
                <button
                  type="button"
                  className="text-primary h-auto cursor-pointer p-0 text-sm font-bold hover:underline"
                  onClick={() => setInvitePassword(generateRandomPassword())}
                >
                  Generate Secure
                </button>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="invitePassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Auto-generated if empty"
                    className="h-10 pr-10"
                    value={invitePassword}
                    onChange={e => setInvitePassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 w-10 p-0"
                      disabled={!invitePassword}
                      onClick={() => {
                        copyToClipboard(invitePassword);
                        toast.success("Password copied to clipboard!");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy password</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {inviteError && (
              <Alert variant="destructive" className="rounded-lg">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{inviteError}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowInviteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={inviteUserMutation.isPending}
                className="px-6"
              >
                {inviteUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Invite...
                  </>
                ) : (
                  <>
                    Send Invitation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Organization Settings</DialogTitle>
            <DialogDescription>
              Update your organization's display name and preferences.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateOrganization} className="space-y-6 pt-4">
            <div className="space-y-3">
              <Label
                htmlFor="orgName"
                className="text-muted-foreground text-sm font-semibold tracking-wider uppercase"
              >
                Organization Display Name
              </Label>
              <Input
                id="orgName"
                type="text"
                placeholder="Acme Corp"
                className="border-border/50 h-12 text-lg"
                value={newOrgName}
                onChange={e => setNewOrgName(e.target.value)}
                required
              />
              <p className="text-muted-foreground text-xs">
                This name will be visible to all members of your organization.
              </p>
            </div>

            <Separator className="opacity-50" />

            <div className="space-y-4">
              <Label className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                Member Permissions
              </Label>

              <div className="border-border/50 bg-muted/20 flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">
                    Allow Members to Edit
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Members can save changes, move files, and manage tags
                  </div>
                </div>
                <Switch
                  checked={membersCanEdit}
                  onCheckedChange={setMembersCanEdit}
                />
              </div>

              <div className="border-border/50 bg-muted/20 flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">
                    Allow Members to Create
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Members can create notes, folders, and import PDFs
                  </div>
                </div>
                <Switch
                  checked={membersCanCreate}
                  onCheckedChange={setMembersCanCreate}
                />
              </div>

              <div className="border-border/50 bg-muted/20 flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">
                    Allow Members to Share
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Members can generate public sharing links for notes
                  </div>
                </div>
                <Switch
                  checked={membersCanShare}
                  onCheckedChange={setMembersCanShare}
                />
              </div>
            </div>

            <Separator className="opacity-50" />

            <div className="bg-primary/5 border-primary/10 rounded-xl border p-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 mt-1 rounded-lg p-2">
                  <ShieldAlert className="text-primary h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Danger Zone</h4>
                  <p className="text-muted-foreground text-xs">
                    Changing the organization name does not affect existing note
                    links or slugs.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowSettingsDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updatingSettings || !newOrgName.trim()}
                className="px-8"
              >
                {updatingSettings ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
