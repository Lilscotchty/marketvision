// src/app/admin/news-post-manager.tsx
"use client";

import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { PlusCircle, Edit, Trash2, Loader2, RefreshCcw } from 'lucide-react';
import type { NewsPost, NewsPostFormValues, Sentiment } from '@/types';
import { NewsPostSchema, sentimentOptions } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { upsertNewsPost, deleteNewsPost } from '@/lib/actions';
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
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';

interface NewsPostManagerProps {
  posts: NewsPost[];
  onRefresh: () => void;
  isLoading: boolean;
}

const NewsPostForm = ({ post, onFormSubmit }: { post?: NewsPost | null, onFormSubmit: () => void }) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<NewsPostFormValues>({
    resolver: zodResolver(NewsPostSchema),
    defaultValues: {
      title: post?.title || '',
      content: post?.content || '',
      banner_image_url: post?.banner_image_url || '',
      sentiment: post?.sentiment || 'Neutral',
    },
  });

  const onSubmit = (values: NewsPostFormValues) => {
    startTransition(async () => {
      const result = await upsertNewsPost(values, post?.id);
      if (result.success) {
        toast({
          title: post ? 'Post Updated' : 'Post Created',
          description: result.message,
        });
        onFormSubmit();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="content" render={({ field }) => (
          <FormItem><FormLabel>Content</FormLabel><FormControl><Textarea {...field} rows={8} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="banner_image_url" render={({ field }) => (
          <FormItem><FormLabel>Banner Image URL (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="sentiment" render={({ field }) => (
          <FormItem>
            <FormLabel>Sentiment</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>{sentimentOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <DialogFooter>
          <DialogClose asChild><Button variant="outline" disabled={isPending}>Cancel</Button></DialogClose>
          <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save Post'}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

const NewsPostManager = ({ posts, onRefresh, isLoading }: NewsPostManagerProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);
  const { toast } = useToast();

  const handleEdit = (post: NewsPost) => {
    setSelectedPost(post);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedPost(null);
    setIsFormOpen(true);
  };
  
  const handleFormSubmit = () => {
    setIsFormOpen(false);
    onRefresh();
  };

  const handleDelete = async (postId: string) => {
    const result = await deleteNewsPost(postId);
    if (result.success) {
      toast({
        title: "Post Deleted",
        description: result.message,
      });
      onRefresh();
    } else {
       toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">News Post Management</CardTitle>
          <CardDescription>Create, edit, and delete news articles for the app.</CardDescription>
        </div>
        <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onRefresh} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            </Button>
            <Button size="sm" onClick={handleCreate}><PlusCircle className="mr-2 h-4 w-4" /> Create Post</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {posts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No news posts yet. Create one to get started.</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                <div>
                  <p className="font-semibold">{post.title}</p>
                  <p className="text-xs text-muted-foreground">
                    By {post.author_email || 'Unknown'} on {format(new Date(post.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                   <Badge variant={
                       post.sentiment === 'Bullish' ? 'default' : post.sentiment === 'Bearish' ? 'destructive' : 'secondary'
                    } className={
                       post.sentiment === 'Bullish' ? 'bg-green-600 hover:bg-green-700' : ''
                    }>
                        {post.sentiment}
                    </Badge>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(post)}><Edit className="h-4 w-4 mr-1" />Edit</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4 mr-1" />Delete</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{post.title}".</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(post.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedPost ? 'Edit News Post' : 'Create News Post'}</DialogTitle>
            <DialogDescription>Fill in the details for the news article.</DialogDescription>
          </DialogHeader>
          <NewsPostForm post={selectedPost} onFormSubmit={handleFormSubmit} />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default NewsPostManager;
