
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

const AnnouncementForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]);
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
        toast.error('Failed to create announcement');
        return;
      }

      toast.success('Announcement created successfully');
      
      // Reset form
      form.reset();
      
      // Add the new announcement to the recent announcements
      if (announcementData && announcementData.length > 0) {
        setRecentAnnouncements([announcementData[0], ...recentAnnouncements.slice(0, 2)]);
      }
      
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch recent announcements on component mount
  useState(() => {
    const fetchRecentAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) {
          console.error('Error fetching announcements:', error);
          return;
        }

        if (data) {
          setRecentAnnouncements(data);
        }
      } catch (error) {
        console.error('Error fetching recent announcements:', error);
      }
    };

    fetchRecentAnnouncements();
  });

  return (
    <Card className="shadow-lg border-t-4 border-ishanya-yellow">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Megaphone className="h-5 w-5 text-ishanya-green" />
          Create Announcement
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
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

        {recentAnnouncements.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Announcements</h3>
            <div className="space-y-3">
              {recentAnnouncements.map((announcement) => (
                <div 
                  key={announcement.id}
                  className="p-3 border border-gray-200 rounded-md bg-gray-50"
                >
                  <p className="font-medium text-gray-800">{announcement.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{announcement.announcement}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(announcement.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnnouncementForm;
