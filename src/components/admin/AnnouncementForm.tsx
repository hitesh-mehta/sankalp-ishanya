
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import supabase from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { Megaphone } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const announcementSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }).max(100),
  announcement: z.string().min(10, { message: "Announcement must be at least 10 characters" }).max(500),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

type AnnouncementFormProps = {
  onAnnouncementAdded?: () => void;
};

const AnnouncementForm = ({ onAnnouncementAdded }: AnnouncementFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = getCurrentUser();

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      announcement: '',
    },
  });

  const onSubmit = async (data: AnnouncementFormValues) => {
    if (!user || !user.id) {
      toast.error('You must be logged in to create announcements');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the current date
      const currentDate = new Date().toISOString();

      // Insert announcement to the announcements table
      const { data: announcementData, error } = await supabase
        .from('announcements')
        .insert({
          admin_id: user.id, // This is the UUID from the employees table
          title: data.title,
          announcement: data.announcement,
          created_at: currentDate,
        })
        .select();

      if (error) {
        console.error('Error creating announcement:', error);
        toast.error('Failed to create announcement: ' + error.message);
        return;
      }

      toast.success('Announcement created successfully');
      
      // Reset form
      form.reset();
      
      // Call the callback if provided
      if (onAnnouncementAdded) {
        onAnnouncementAdded();
      }
      
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      toast.error('An unexpected error occurred: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Announcement Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter announcement title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="announcement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Announcement Content</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter your announcement here..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-ishanya-green hover:bg-ishanya-green/90 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? <LoadingSpinner size="sm" /> : "Post Announcement"}
        </Button>
      </form>
    </Form>
  );
};

export default AnnouncementForm;
