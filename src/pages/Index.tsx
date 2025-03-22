
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import CenterList from '@/components/centers/CenterList';
import { fetchCenters } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AnnouncementForm from '@/components/admin/AnnouncementForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Home, Users, GraduationCap } from 'lucide-react';

const Index = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEducators: 0,
    totalEmployees: 0
  });

  useEffect(() => {
    const loadCenters = async () => {
      try {
        const centersData = await fetchCenters();
        if (centersData) {
          setCenters(centersData);
          
          // Calculate total stats
          const totalStudents = centersData.reduce((sum, center) => sum + (center.num_of_student || 0), 0);
          const totalEducators = centersData.reduce((sum, center) => sum + (center.num_of_educator || 0), 0);
          const totalEmployees = centersData.reduce((sum, center) => sum + (center.num_of_employees || 0), 0);
          
          setStats({
            totalStudents,
            totalEducators,
            totalEmployees
          });
        }
      } catch (error) {
        console.error('Error fetching centers:', error);
        toast.error('Failed to load centers');
      } finally {
        setLoading(false);
      }
    };

    loadCenters();
  }, []);

  if (loading) {
    return (
      <Layout
        title="Loading..."
        subtitle="Please wait while we fetch the centers"
      >
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Admin Dashboard"
      subtitle="Manage centers and programs"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-ishanya-green">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-ishanya-green" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-ishanya-green">{stats.totalStudents}</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-ishanya-yellow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-ishanya-yellow" />
              Total Educators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-ishanya-yellow">{stats.totalEducators}</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-500" />
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-500">{stats.totalEmployees}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <CenterList centers={centers} />
        </div>
        
        <div>
          <AnnouncementForm />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
