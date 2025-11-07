
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, CreditCard, BarChart, ShieldCheck, UserPlus, UserMinus, Crown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import type { UserManagementProfile } from '@/types';
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
} from "@/components/ui/alert-dialog"

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
          uid: userData.userId,
          email: userData.email,
          isDeveloper: userData.isDeveloper || false,
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
                        uid: userData.userId,
                        email: userData.email,
                        isDeveloper: userData.isDeveloper || false,
                    };
                }
            } catch (e) { /* ignore */ }
        }
    }
    return null;
};


const AdminDashboardPage = () => {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [managedUsers, setManagedUsers] = useState<UserManagementProfile[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [userToAdd, setUserToAdd] = useState<UserManagementProfile | null>(null);
  const [isConfirmAddUserOpen, setIsConfirmAddUserOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !userData?.isDeveloper)) {
      router.push('/');
    }
  }, [user, userData, loading, router]);
  
  useEffect(() => {
    // Only load users if the current user is a developer
    if (userData?.isDeveloper) {
      setManagedUsers(getAllUsersFromLocalStorage());
    }
  }, [userData?.isDeveloper]);
  
  const refreshUsers = () => {
    setManagedUsers(getAllUsersFromLocalStorage());
  };

  const handleUpdateRole = (uid: string, isDeveloper: boolean) => {
    const key = `userData-${uid}`;
    try {
      const userDataString = localStorage.getItem(key);
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        
        // Prevent lead developer from being demoted
        if (userData.email === 'pb7552212@gmail.com' && !isDeveloper) {
          toast({
            title: "Action Forbidden",
            description: "The lead developer's role cannot be changed.",
            variant: "destructive",
          });
          return;
        }

        userData.isDeveloper = isDeveloper;
        localStorage.setItem(key, JSON.stringify(userData));
        toast({
          title: "Role Updated",
          description: `User role has been set to ${isDeveloper ? 'Developer' : 'User'}.`,
        });
        refreshUsers();
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
        description: "An error occurred while updating the role.",
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
        // If user exists and is not a developer, promote them
        if (!existingUser.isDeveloper) {
            handleUpdateRole(existingUser.uid, true);
            setNewUserEmail('');
        } else {
            toast({ title: "Already a Developer", description: `${newUserEmail} already has developer privileges.`});
        }
    } else {
        // If user does not exist, trigger confirmation dialog
        setUserToAdd({ uid: `new-${Date.now()}`, email: newUserEmail, isDeveloper: true });
        setIsConfirmAddUserOpen(true);
    }
  };

  const handleConfirmAddUser = () => {
    if (!userToAdd) return;
    // This is a simulation. In a real app, you'd create a user in your backend.
    // Here, we just create a new entry in local storage.
    const newUserEntry = {
        userId: userToAdd.uid,
        email: userToAdd.email,
        chartAnalysisTrialPoints: 0,
        hasActiveSubscription: false,
        isDeveloper: true,
    };
    localStorage.setItem(`userData-${userToAdd.uid}`, JSON.stringify(newUserEntry));
    toast({ title: "User Added", description: `${userToAdd.email} has been added as a developer.` });
    refreshUsers();
    setNewUserEmail('');
    setUserToAdd(null);
    setIsConfirmAddUserOpen(false);
  };

  if (loading || !user || !userData?.isDeveloper) {
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
                        <CardDescription>Promote existing users or add new developers. This is a prototype and only affects browser storage.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    type="email"
                                    placeholder="Enter user's email"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                />
                                <Button onClick={handleAddUserInitiate}>Add User</Button>
                            </div>
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                              {managedUsers.map((mUser) => (
                                  <div key={mUser.uid} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium flex items-center gap-1.5">
                                          {mUser.email}
                                          {mUser.email === 'pb7552212@gmail.com' && <Crown className="h-4 w-4 text-amber-500" title="Lead Developer"/>}
                                        </span>
                                        <Badge variant={mUser.isDeveloper ? "default" : "secondary"} className="w-fit mt-1">
                                            {mUser.isDeveloper ? 'Developer' : 'User'}
                                        </Badge>
                                      </div>
                                      <div className="flex gap-2">
                                          {!mUser.isDeveloper ? (
                                              <Button size="sm" variant="outline" onClick={() => handleUpdateRole(mUser.uid, true)}>
                                                  <UserPlus className="h-4 w-4 mr-1" /> Promote
                                              </Button>
                                          ) : (
                                              <Button size="sm" variant="destructive" onClick={() => handleUpdateRole(mUser.uid, false)} disabled={mUser.email === 'pb7552212@gmail.com'}>
                                                  <UserMinus className="h-4 w-4 mr-1" /> Demote
                                              </Button>
                                          )}
                                      </div>
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
                        The user "{userToAdd?.email}" does not exist in the local storage database. Would you like to create a new developer entry for this email?
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

    </main>
  );
};

export default AdminDashboardPage;

    