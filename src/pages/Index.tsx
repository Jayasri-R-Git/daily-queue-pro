import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StartScreen } from "@/components/StartScreen";
import { ReservationForm } from "@/components/ReservationForm";
import { PendingReservations } from "@/components/PendingReservations";
import { AdminHistory } from "@/components/AdminHistory";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, LayoutDashboard, History, LogOut } from "lucide-react";
import { playSound } from "@/utils/sounds";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [showStart, setShowStart] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [hotelName, setHotelName] = useState("");

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Get hotel name from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('hotel_name')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setHotelName(profile.hotel_name);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleStart = () => {
    setShowStart(false);
  };

  const handleBack = () => {
    playSound('click');
    setShowStart(true);
  };

  const handleLogout = async () => {
    playSound('click');
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const handleReservationSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!user) {
    return null; // Loading or redirecting
  }

  if (showStart) {
    return <StartScreen onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            className="shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Start
          </Button>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {hotelName} - Reservation Management
            </h1>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="lg"
              onClick={handleLogout}
              className="shadow-md hover:shadow-lg transition-all"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="manage" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 h-14">
            <TabsTrigger value="manage" className="text-lg" onClick={() => playSound('click')}>
              <LayoutDashboard className="mr-2 h-5 w-5" />
              Manage
            </TabsTrigger>
            <TabsTrigger value="history" className="text-lg" onClick={() => playSound('click')}>
              <History className="mr-2 h-5 w-5" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-8">
            <ReservationForm onSuccess={handleReservationSuccess} />
            <PendingReservations refreshTrigger={refreshTrigger} />
          </TabsContent>

          <TabsContent value="history">
            <AdminHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
