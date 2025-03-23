
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/auth';
import supabase from '@/lib/api';
import AnnouncementBoard from '@/components/announcements/AnnouncementBoard';

const ParentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();
  const initialized = useRef(false);

  // Redirect to the parent page which will handle detailed student info
  const handleViewDetails = () => {
    navigate('/parent/details');
  };
  
  useEffect(() => {
    // Use a ref to ensure this effect only runs once
    if (initialized.current) return;
    initialized.current = true;
    
    let isMounted = true; // Flag to prevent state updates after unmount
    
    const checkParentStatus = async () => {
      if (!user) {
        if (isMounted) {
          setError("Not logged in");
          setLoading(false);
        }
        return;
      }
      
      try {
        // Check if parent exists and has a student_id
        const { data: parentData, error: parentError } = await supabase
          .from('parents')
          .select('*')
          .eq('email', user.email)
          .single();
          
        if (parentError) {
          console.error('Error fetching parent data:', parentError);
          if (isMounted) {
            setError("Unable to fetch parent information. Please contact support.");
            setLoading(false);
          }
          return;
        }
        
        if (!parentData) {
          if (isMounted) {
            setError("No parent record found. Please contact the administrator.");
            setLoading(false);
          }
          return;
        }

        // If we have a parent record, we're good to go for the dashboard
        if (isMounted) {
          // Only show toast if loading was true (first load)
          if (loading) {
            toast({
              title: "Welcome to your dashboard",
              description: "View your child's details for more information",
            });
          }
          setLoading(false);
        }
        
      } catch (error) {
        console.error('Error checking parent status:', error);
        if (isMounted) {
          setError("An unexpected error occurred. Please try again later.");
          setLoading(false);
        }
      }
    };
    
    checkParentStatus();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once on mount
  
  return (
    <Layout
      title="Parent Dashboard"
      subtitle={`Welcome, ${user?.name || 'Parent'}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <ErrorDisplay message={error} />
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Your Parent Portal</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Access your child's information, communicate with educators, and track progress all in one place.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-700 mb-3">Student Information</h3>
                  <p className="text-gray-600 mb-4">View detailed information about your child, including personal details, program enrollment, and session schedules.</p>
                  <Button onClick={handleViewDetails} className="w-full">
                    View Details
                  </Button>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                  <h3 className="text-lg font-semibold text-purple-700 mb-3">Progress Tracking</h3>
                  <p className="text-gray-600 mb-4">Monitor your child's progress, download reports, and stay updated on their development journey.</p>
                  <Button variant="outline" onClick={handleViewDetails} className="w-full">
                    Track Progress
                  </Button>
                </div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                <h3 className="text-lg font-semibold text-green-700 mb-3">Educator Communication</h3>
                <p className="text-gray-600 mb-4">Contact your child's assigned educators, share feedback, and maintain open communication to support their learning journey.</p>
                <Button variant="outline" onClick={handleViewDetails} className="w-full">
                  Contact & Feedback
                </Button>
              </div>
            </div>
          )}
        </div>
        <div>
          <AnnouncementBoard />
        </div>
      </div>
    </Layout>
  );
};

export default ParentDashboard;
