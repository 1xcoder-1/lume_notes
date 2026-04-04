"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "nextjs-toploader/app";
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
  Lock
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@workspace/ui/components/select";
import { 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent 
} from "@workspace/ui/components/tooltip";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useInviteUser, useOrganizationStats, useOrganizationUsers } from "@/lib/api";
import { inviteUserSchema } from "@/lib/validations";
import { Switch } from "@workspace/ui/components/switch";

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
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}


function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text);
}

export default function OrganizationManagementPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const queryClient = useQueryClient();
  const user = session?.user as any;
  const isAdmin = user?.role === "admin";

  const { data: statsData, isLoading: loading, refetch: fetchStats } = useOrganizationStats(user?.role === "admin");
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
  const initializedName = useRef(false);

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

    
    if (!initializedName.current) {
      if (stats?.name) {
        setNewOrgName(stats.name);
        setMembersCanEdit(stats.members_can_edit ?? true);
        setMembersCanCreate(stats.members_can_create ?? true);
        setMembersCanShare(stats.members_can_share ?? true);
        initializedName.current = true;
      } else if (user?.tenantSlug) {
        setNewOrgName(user.tenantSlug);
        initializedName.current = true;
      }
    }
  }, [status, session, router, user?.role, user?.tenantSlug, stats]);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");

    
    const validationResult = inviteUserSchema.safeParse({
      email: inviteEmail,
      role: inviteRole,
    });

    if (!validationResult.success) {
      setInviteError(validationResult.error.issues?.[0]?.message || "Validation failed");
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 antialiased p-4 md:p-8">
      {}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-500 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {}
        {}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="-ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => router.push("/notes")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Workspace
            </Button>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Building className="h-8 w-8 text-primary" />
              {isAdmin ? "Organization Management" : "Team Directory"}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Manage your team and view organization-wide metrics." : "View and collaborate with your team members in real-time."}
            </p>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all animate-in fade-in slide-in-from-top-2">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-all">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team Members
                </CardDescription>
                <CardTitle className="text-4xl font-bold group-hover:text-primary transition-colors">
                  {stats?.memberCount ?? 0}
                </CardTitle>
              </CardHeader>
              <div className="px-6 pb-6 pt-0">
                 <div className="h-1 w-full bg-muted rounded-full overflow-hidden mt-4">
                    <div 
                      className="h-full bg-primary transition-all duration-1000" 
                      style={{ width: stats?.totalCount ? `${(stats.memberCount / stats.totalCount) * 100}%` : '0%' }}
                    />
                 </div>
              </div>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-blue-500/30 transition-all">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Group Admins
                </CardDescription>
                <CardTitle className="text-4xl font-bold group-hover:text-blue-500 transition-colors">
                  {stats?.adminCount ?? 0}
                </CardTitle>
              </CardHeader>
              <div className="px-6 pb-6 pt-0">
                 <div className="h-1 w-full bg-muted rounded-full overflow-hidden mt-4">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-1000" 
                      style={{ width: stats?.totalCount ? `${(stats.adminCount / stats.totalCount) * 100}%` : '0%' }}
                    />
                 </div>
              </div>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-purple-500/30 transition-all">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <ChartBar className="h-4 w-4" />
                  Total Seats
                </CardDescription>
                <CardTitle className="text-4xl font-bold group-hover:text-purple-500 transition-colors">
                  {stats?.totalCount ?? 0}
                </CardTitle>
              </CardHeader>
               <div className="px-6 pb-6 pt-0 text-xs text-muted-foreground flex gap-1 items-center mt-4">
                  <ShieldAlert className="h-3 w-3" />
                  Only admins can see these stats.
               </div>
            </Card>
          </div>
        )}

        {}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 transition-all animate-in fade-in slide-in-from-top-4">
            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
                <CardDescription>Common tasks for organization admins.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <Button className="w-full justify-start gap-3 h-14" variant="outline" size="lg" onClick={() => setShowInviteDialog(true)}>
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <UserPlus className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Invite New Member</div>
                      <div className="text-xs text-muted-foreground">Add someone to your organization</div>
                    </div>
                 </Button>
                 <Button className="w-full justify-start gap-3 h-14" variant="outline" size="lg" onClick={() => setShowSettingsDialog(true)}>
                    <div className="bg-muted p-2 rounded-lg">
                      <Settings className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Organization Settings</div>
                      <div className="text-xs text-muted-foreground">Change organization name and identity</div>
                    </div>
                 </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-primary/5 border-primary/20 flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                   <Lock className="h-5 w-5 text-primary opacity-60" />
                   Admin Security
                </CardTitle>
                <CardDescription>Privacy and visibility rules.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-4 text-muted-foreground leading-relaxed flex-1">
                <p>
                  As an organization admin, you have exclusive access to this management dashboard. 
                  Regular members of <strong>{user?.tenantSlug || "your organization"}</strong> cannot see 
                  member counts or administrative settings.
                </p>
                <p>
                  Invite others with the "Admin" role if you want to share these management capabilities. 
                  Admins have full visibility and control over organization resources.
                </p>
              </CardContent>
              <CardFooter className="pt-4 border-t border-primary/10">
                 <Badge variant="outline" className="text-[10px] opacity-70 tracking-widest">
                    ENCRYPTED ADMIN SESSION
                 </Badge>
              </CardFooter>
            </Card>
          </div>
        )}

        {}
        <Card className="border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Team Members
                </CardTitle>
                <CardDescription>Manage everyone currently in your organization.</CardDescription>
              </div>
              <Badge variant="outline" className="font-mono">
                {members?.length || 0} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingMembers ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                <p className="text-sm text-muted-foreground animate-pulse">Loading team roster...</p>
              </div>
            ) : members && members.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border/50 text-left text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                      <th className="px-6 py-3">Member</th>
                      <th className="px-6 py-3">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {members.map((member) => (
                      <tr key={member.id} className="group hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden ring-offset-background group-hover:ring-2 ring-primary/20 transition-all">
                              {member.image ? (
                                <img src={member.image} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold text-primary">
                                  {(member.first_name?.[0] || member.email?.[0] || '?').toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {member.first_name ? `${member.first_name} ${member.last_name || ''}` : member.email.split('@')[0]}
                              </span>
                              <span className="text-xs text-muted-foreground">{member.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={member.role === 'admin' ? 'secondary' : 'outline'} 
                            className={`text-[10px] font-bold uppercase tracking-tighter ${member.role === 'admin' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-muted/50 text-muted-foreground'}`}
                          >
                            {member.role === 'admin' ? (
                              <ShieldCheck className="h-3 w-3 mr-1" />
                            ) : (
                              <Users className="h-3 w-3 mr-1" />
                            )}
                            {member.role}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground italic flex flex-col items-center gap-3">
                <AlertTriangle className="h-8 w-8 opacity-20" />
                No members found in this organization.
              </div>
            )}
          </CardContent>
        </Card>
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
                onValueChange={value => setInviteRole(value as "admin" | "member")}
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member (Regular access)</SelectItem>
                  <SelectItem value="admin">Admin (Full management access)</SelectItem>
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
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              <Button type="submit" disabled={inviteUserMutation.isPending} className="px-6">
                {inviteUserMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending Invite...
                  </>
                ) : (
                   <>
                    Send Invitation
                    <ArrowRight className="h-4 w-4 ml-2" />
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
              <Label htmlFor="orgName" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Organization Display Name
              </Label>
              <Input
                id="orgName"
                type="text"
                placeholder="Acme Corp"
                className="h-12 text-lg border-border/50"
                value={newOrgName}
                onChange={e => setNewOrgName(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                This name will be visible to all members of your organization.
              </p>
            </div>

            <Separator className="opacity-50" />

            <div className="space-y-4">
               <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                 Member Permissions
               </Label>
               
               <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Allow Members to Edit</div>
                    <div className="text-xs text-muted-foreground">Members can save changes, move files, and manage tags</div>
                  </div>
                 <Switch 
                   checked={membersCanEdit}
                   onCheckedChange={setMembersCanEdit}
                 />
               </div>

               <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Allow Members to Create</div>
                    <div className="text-xs text-muted-foreground">Members can create notes, folders, and import PDFs</div>
                  </div>
                 <Switch 
                   checked={membersCanCreate}
                   onCheckedChange={setMembersCanCreate}
                 />
               </div>

               <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Allow Members to Share</div>
                    <div className="text-xs text-muted-foreground">Members can generate public sharing links for notes</div>
                  </div>
                 <Switch 
                   checked={membersCanShare}
                   onCheckedChange={setMembersCanShare}
                 />
               </div>
            </div>

            <Separator className="opacity-50" />

            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
               <div className="flex items-start gap-4">
                 <div className="bg-primary/10 p-2 rounded-lg mt-1">
                   <ShieldAlert className="h-5 w-5 text-primary" />
                 </div>
                 <div className="space-y-1">
                   <h4 className="font-semibold text-sm">Danger Zone</h4>
                   <p className="text-xs text-muted-foreground">
                     Changing the organization name does not affect existing note links or slugs.
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
              <Button type="submit" disabled={updatingSettings || !newOrgName.trim()} className="px-8">
                {updatingSettings ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
