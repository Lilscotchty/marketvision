"use client";

import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCog, Crown, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import type { UserManagementProfile, Role, NewsPost } from '@/types';
import { availableRoles } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { updateUserRoles, getNewsPosts, adminAddCredits, adminToggleSubscription } from '@/lib/actions'; 
import NewsPostManager from './news-post-manager';

type AdminClientProps = {
  initialManagedUsers: UserManagementProfile[];
  initialNewsPosts: NewsPost[];
  isOwner: boolean;
};

const AdminClient = ({ initialManagedUsers, initialNewsPosts, isOwner }: AdminClientProps) => {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  // In a real app, you might want to refetch this data or use router.refresh()
  const [managedUsers] = useState(initialManagedUsers); 
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserManagementProfile | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Set<Role>>(new Set());

  const [newsPosts, setNewsPosts] = useState(initialNewsPosts);
  const [isNewsLoading, setIsNewsLoading] = useState(false);

  const refreshNewsPosts = async () => {
    setIsNewsLoading(true);
    const { data, error } = await getNewsPosts();
    if (error) {
      toast({ title: "Error", description: "Could not refresh news posts.", variant: "destructive" });
    } else if (data) {
      setNewsPosts(data);
    }
    setIsNewsLoading(false);
  };

  const handleUpdateRoles = (userId: string, newRoles: Role[]) => {
    startTransition(async () => {
      const result = await updateUserRoles(userId, newRoles);
      if (result.success) {
        toast({ title: "Roles Updated", description: result.message });
        setIsRoleModalOpen(false);
      } else {
        toast({ title: "Update Failed", description: result.message, variant: "destructive" });
      }
    });
  };

  const handleAddCredits = (userId: string) => {
      startTransition(async () => {
          const result = await adminAddCredits(userId, 5); // Add 5 credits
          if (result.success) {
              toast({ title: "Credits Added", description: "User credited with 5 points." });
              // Optional: router.refresh() to update the UI count
          } else {
              toast({ title: "Error", description: result.message, variant: "destructive" });
          }
      });
  };

  const handleToggleSub = (userId: string, currentStatus: boolean) => {
      startTransition(async () => {
          const result = await adminToggleSubscription(userId, !currentStatus);
          if (result.success) {
              toast({ title: "Subscription Updated", description: result.message });
              // Optional: router.refresh() to update the UI badge
          } else {
              toast({ title: "Error", description: result.message, variant: "destructive" });
          }
      });
  };

  const openRoleManagement = (userToManage: UserManagementProfile) => {
    setSelectedUser(userToManage);
    setSelectedRoles(new Set(userToManage.roles));
    setIsRoleModalOpen(true);
  };
  
  const onRoleCheckboxChange = (role: Role, checked: boolean) => {
    setSelectedRoles(prev => {
        const newRoles = new Set(prev);
        if (checked) {
            newRoles.add(role);
        } else {
            newRoles.delete(role);
        }
        return newRoles;
    });
  };

  const saveRoles = () => {
      if (selectedUser) {
          handleUpdateRoles(selectedUser.userId, Array.from(selectedRoles));
      }
  };

  return (
    <TooltipProvider>
      <div className="mt-8 grid gap-8 md:grid-cols-1">
        <NewsPostManager 
          posts={newsPosts}
          onRefresh={refreshNewsPosts}
          isLoading={isNewsLoading}
        />

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">User Management</CardTitle>
            <CardDescription>Manage roles, credits, and subscriptions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {managedUsers.map((mUser) => (
                  <div key={mUser.userId} className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-md bg-muted/50 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium flex items-center gap-1.5">
                        {mUser.email}
                        {mUser.roles.includes('Owner') && (
                          <Tooltip>
                            <TooltipTrigger><Crown className="h-4 w-4 text-amber-500" /></TooltipTrigger>
                            <TooltipContent><p>Owner</p></TooltipContent>
                          </Tooltip>
                        )}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {mUser.roles.map(role => (
                          <Badge key={role} variant={role === 'Developer' || role === 'Owner' ? "default" : "secondary"} className="text-xs">
                            {role}
                          </Badge> 
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Credits Management */}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Credits:</span>
                            <span className="font-mono font-bold">{mUser.chartAnalysisTrialPoints}</span>
                            {isOwner && (
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleAddCredits(mUser.userId)} disabled={isPending}>
                                    <Plus className="h-3 w-3" />
                                </Button>
                            )}
                        </div>

                        {/* Subscription Toggle */}
                        <div className="flex items-center gap-2">
                             <Badge variant={mUser.hasActiveSubscription ? "default" : "outline"} className={mUser.hasActiveSubscription ? "bg-green-600 hover:bg-green-700" : ""}>
                                {mUser.hasActiveSubscription ? "Pro" : "Free"}
                             </Badge>
                             {isOwner && (
                                 <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleToggleSub(mUser.userId, mUser.hasActiveSubscription)} disabled={isPending}>
                                     {mUser.hasActiveSubscription ? "Revoke" : "Grant"}
                                 </Button>
                             )}
                        </div>

                        {/* Role Button */}
                        {isOwner && (
                        <Button size="sm" variant="outline" onClick={() => openRoleManagement(mUser)} disabled={isPending}>
                            <UserCog className="h-4 w-4 mr-1" /> Roles
                        </Button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Roles for {selectedUser?.email}</DialogTitle>
          </DialogHeader>
          <div className="py-4 grid grid-cols-2 gap-4">
            {availableRoles.map(role => (
              <div key={role} className="flex items-center space-x-2">
                <Checkbox 
                  id={`role-${role}`}
                  checked={selectedRoles.has(role)}
                  onCheckedChange={(checked) => onRoleCheckboxChange(role, Boolean(checked))}
                  disabled={(role === 'Owner' && selectedUser?.email === 'pb7552212@gmail.com') || isPending}
                />
                <Label htmlFor={`role-${role}`} className="font-medium">{role}</Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isPending}>Cancel</Button>
            </DialogClose>
            <Button onClick={saveRoles} disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default AdminClient;
