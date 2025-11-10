"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, CreditCard, BarChart, ShieldCheck, UserPlus, UserCog, Crown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import type { UserManagementProfile, Role } from '@/types';
import { availableRoles } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

// This is a simulation. In a real app, this would be fetched from a secure backend.
const getAllUsersFromLocalStorage = (): UserManagementProfile[] => {
  if (typeof window === 'undefined') return [];
  const users: UserManagementProfile[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('userData-')) {
      try {
        const userData = JSON.parse(localStorage.getItem(key)!);
        users.push({
          userId: userData.userId, 
          email: userData.email,
          // --- FIX 1: Added 'as Role[]' ---
          roles: userData.roles || (['User'] as Role[]),
          hasActiveSubscription: userData.hasActiveSubscription ?? false, 
          chartAnalysisTrialPoints: userData.chartAnalysisTrialPoints ?? 0, 
        });
      } catch (error) {
        console.error(`Failed to parse user data for key ${key}:`, error);
      }
    }
  }
  return users;
};

// Function to find a user by email in local storage
const findUserByEmail = (email: string): UserManagementProfile | null => {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('userData-')) {
            try {
                const userData = JSON.parse(localStorage.getItem(key)!);
                if (userData.email.toLowerCase() === email.toLowerCase()) {
                    return {
                        userId: userData.userId, 
                        email: userData.email,
                        // --- FIX 2: Added 'as Role[]' ---
                        roles: userData.roles || (['User'] as Role[]),
                        hasActiveSubscription: userData.hasActiveSubscription ?? false, 
                        chartAnalysisTrialPoints: userData.chartAnalysisTrialPoints ?? 0, 
                    };
                }
            } catch (e) { /* ignore */ }
        }
    }
    return null;
};


const AdminDashboardPage = () => {
  const { user, hasRole, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [managedUsers, setManagedUsers] = useState<UserManagementProfile[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [userToAdd, setUserToAdd] = useState<UserManagementProfile | null>(null);
  const [isConfirmAddUserOpen, setIsConfirmAddUserOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUserForRoles, setSelectedUserForRoles] = useState<UserManagementProfile | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Set<Role>>(new Set());

  const isOwner = hasRole('Owner');

  useEffect(() => {
    if (!loading && !hasRole('Developer')) {
      router.push('/');
    }
  }, [hasRole, loading, router]);
  
  useEffect(() => {
    // Only load users if the current user is a developer
    if (hasRole('Developer')) {
      setManagedUsers(getAllUsersFromLocalStorage());
    }
  }, [hasRole]);
  
  const refreshUsers = () => {
    setManagedUsers(getAllUsersFromLocalStorage());
  };

  const handleUpdateRoles = (userId: string, newRoles: Role[]) => {
    const key = `userData-${userId}`; 
    try {
      const userDataString = localStorage.getItem(key);
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        
        if (userData.email === 'pb7552212@gmail.com' && !newRoles.includes('Owner')) {
          toast({
            title: "Action Forbidden",
            description: "The Owner's 'Owner' role cannot be removed.",
            variant: "destructive",
          });
          return;
        }

        userData.roles = newRoles;
        localStorage.setItem(key, JSON.stringify(userData));
        toast({
          title: "Roles Updated",
          description: `User roles have been updated.`,
        });
        refreshUsers();
        setIsRoleModalOpen(false);
      } else {
         toast({
          title: "Update Failed",
          description: "User data not found in local storage.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update role:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating roles.",
        variant: "destructive",
      });
    }
  };

  const handleAddUserInitiate = () => {
    if (!newUserEmail) {
        toast({ title: "Email required", description: "Please enter an email address."});
        return;
    }

    const existingUser = findUserByEmail(newUserEmail);
    if (existingUser) {
        openRoleManagement(existingUser);
    } else {
        setUserToAdd({ 
            userId: `new-${Date.now()}`, 
            email: newUserEmail, 
            // --- FIX 3: Added 'as Role[]' ---
            roles: ['User'] as Role[],
            hasActiveSubscription: false, 
            chartAnalysisTrialPoints: 0, 
        });
        setIsConfirmAddUserOpen(true);
    }
  };

  const handleConfirmAddUser = () => {
    if (!userToAdd) return;
    
    const newUserEntry = {
        userId: userToAdd.userId, 
        email: userToAdd.email,
        chartAnalysisTrialPoints: 0,
        hasActiveSubscription: false,
        // --- FIX 4: Added 'as Role[]' ---
        roles: ['User'] as Role[], 
    };
    localStorage.setItem(`userData-${userToAdd.userId}`, JSON.stringify(newUserEntry)); 
    toast({ title: "User Added", description: `${userToAdd.email} has been added.` });
    refreshUsers();
    setNewUserEmail('');
    setUserToAdd(null);
    setIsConfirmAddUserOpen(false);
    
    openRoleManagement({
        userId: newUserEntry.userId,
        email: newUserEntry.email,
        roles: newUserEntry.roles,
        hasActiveSubscription: newUserEntry.hasActiveSubscription,
        chartAnalysisTrialPoints: newUserEntry.chartAnalysisTrialPoints
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


  if (loading || !hasRole('Developer')) {
    return (
      <main className="flex-1 p-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 pb-16 md:pb-0">
        <TooltipProvider> {/* Added TooltipProvider to wrap the whole component */}
            <div className="container mx-auto py-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-headline font-bold tracking-tight flex items-center gap-2">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                        Admin Dashboard
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Application metrics and user management.
                    </p>
                </header>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                          <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                          <div className="text-2xl font-bold">{managedUsers.length}</div>
                          <p className="text-xs text-muted-foreground">in local browser storage</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                          <div className="text-2xl font-bold">+150</div>
                          <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">API Usage (Today)</CardTitle>
                          <BarChart className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                          <div className="text-2xl font-bold">5,732</div>
                          <p className="text-xs text-muted-foreground">+12% since last hour</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Analyses Performed</CardTitle>
                          <BarChart className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                          <div className="text-2xl font-bold">+12,234</div>
                          <p className="text-xs text-muted-foreground">+19% from last month</p>
                      </CardContent>
                    </Card>
                </div>
                 <div className="mt-8 grid gap-8 md:grid-cols-2">
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">User Role Management</CardTitle>
                            <CardDescription>Add, find, and manage user roles. Only the Owner can assign roles.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {isOwner && (
                                  <div className="flex gap-2">
                                      <Input
                                          type="email"
                                          placeholder="Find or add user by email"
                                          value={newUserEmail}
                                          onChange={(e) => setNewUserEmail(e.target.value)}
                                      />
                                      <Button onClick={handleAddUserInitiate}><UserPlus className="h-4 w-4 mr-2"/>Find/Add</Button>
                                  </div>
                                )}
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
                                                    <TooltipContent>
                                                      <p>Owner</p>
                                                    </TooltipContent>
                                                  </Tooltip>
                                              )}
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                                {mUser.roles.map(role => (
                                                    <Badge key={role} variant={role === 'Developer' ? "default" : "secondary"} className="text-xs">
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
            </div>

            <AlertDialog open={isConfirmAddUserOpen} onOpenChange={setIsConfirmAddUserOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>User Not Found</AlertDialogTitle>
                        <AlertDialogDescription>
                            The user "{userToAdd?.email}" does not exist. Would you like to create a new user entry for this email?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToAdd(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmAddUser}>
                            Yes, Add User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
                                    disabled={role === 'Owner' && selectedUserForRoles?.email === 'pb7552212@gmail.com'}
                                />
                                <Label htmlFor={`role-${role}`} className="font-medium">{role}</Label>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={saveRoles}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TooltipProvider> {/* Closed the TooltipProvider */}
    </main>
  );
};

export default AdminDashboardPage;