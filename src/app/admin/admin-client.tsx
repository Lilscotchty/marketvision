// src/app/admin/admin-client.tsx
"use client";

import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCog, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import type { UserManagementProfile, Role } from '@/types';
import { availableRoles } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { updateUserRoles } from '@/lib/actions'; // Import the Server Action

type AdminClientProps = {
  initialManagedUsers: UserManagementProfile[];
  isOwner: boolean;
};

const AdminClient = ({ initialManagedUsers, isOwner }: AdminClientProps) => {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [managedUsers] = useState(initialManagedUsers);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUserForRoles, setSelectedUserForRoles] = useState<UserManagementProfile | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Set<Role>>(new Set());

  const handleUpdateRoles = (userId: string, newRoles: Role[]) => {
    startTransition(async () => {
      const result = await updateUserRoles(userId, newRoles);

      if (result.success) {
        toast({
          title: "Roles Updated",
          description: result.message,
        });
        setIsRoleModalOpen(false);
      } else {
        toast({
          title: "Update Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  const openRoleManagement = (userToManage: UserManagementProfile) => {
    setSelectedUserForRoles(userToManage);
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
      if (selectedUserForRoles) {
          handleUpdateRoles(selectedUserForRoles.userId, Array.from(selectedRoles));
      }
  };

  return (
    <TooltipProvider>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">User Role Management</CardTitle>
            <CardDescription>
              Manage user roles. Only the Owner can assign roles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Note: Add/Find user logic is removed for simplicity.
                  You can add a new Server Action for that. */}
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {managedUsers.map((mUser) => (
                  <div key={mUser.userId} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium flex items-center gap-1.5">
                        {mUser.email}
                        {mUser.roles.includes('Owner') && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Crown className="h-4 w-4 text-amber-500" />
                            </TooltipTrigger>
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
                    {isOwner && (
                      <Button size="sm" variant="outline" onClick={() => openRoleManagement(mUser)}>
                        <UserCog className="h-4 w-4 mr-1" /> Manage
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>A log of recent user activities will be displayed here.</CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground py-12">
            <p>Activity Log Coming Soon</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Roles for {selectedUserForRoles?.email}</DialogTitle>
            <DialogDescription>
              Assign or revoke roles. The 'Owner' role cannot be removed from the application owner.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 grid grid-cols-2 gap-4">
            {availableRoles.map(role => (
              <div key={role} className="flex items-center space-x-2">
                <Checkbox 
                  id={`role-${role}`}
                  checked={selectedRoles.has(role)}
                  onCheckedChange={(checked) => onRoleCheckboxChange(role, Boolean(checked))}
                  disabled={(role === 'Owner' && selectedUserForRoles?.email === 'pb7552212@gmail.com') || isPending}
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