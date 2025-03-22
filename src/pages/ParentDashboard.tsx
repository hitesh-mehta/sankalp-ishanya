
import { useEffect } from 'react';
import Layout from '../components/layout/Layout';
import ParentsView from '../components/parents/ParentsView';
import AnnouncementBoard from '../components/announcements/AnnouncementBoard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUserRole } from '../lib/auth';

const ParentDashboard = () => {
  const userRole = getUserRole();

  useEffect(() => {
    document.title = 'Parent Dashboard | Ishanya';
  }, []);

  return (
    <Layout title="Parent Dashboard" subtitle="View and manage your child's information">
      <Tabs defaultValue="student" className="w-full">
        <TabsList className="w-full justify-start mb-4">
          <TabsTrigger value="student">Student Information</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="student">
          <ParentsView />
        </TabsContent>
        
        <TabsContent value="announcements">
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <AnnouncementBoard canEdit={userRole === 'administrator'} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default ParentDashboard;
