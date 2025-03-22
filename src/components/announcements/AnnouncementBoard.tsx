
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import supabase from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AnnouncementForm from '@/components/admin/AnnouncementForm';

const AnnouncementBoard = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();
  const userIsAdmin = isAdmin();

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching announcements:', error);
        return;
      }

      if (data) {
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <Card className="shadow-lg border-t-4 border-ishanya-yellow">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Megaphone className="h-5 w-5 text-ishanya-green" />
          Announcements
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {userIsAdmin && (
          <div className="mb-6">
            <AnnouncementForm onAnnouncementAdded={fetchAnnouncements} />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div 
                key={announcement.id}
                className="p-4 border border-gray-200 rounded-md bg-gray-50"
              >
                <p className="font-medium text-gray-800">{announcement.title}</p>
                <p className="text-sm text-gray-600 mt-1">{announcement.announcement}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(announcement.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No announcements available.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AnnouncementBoard;
