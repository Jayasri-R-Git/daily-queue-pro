import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StartScreen } from "@/components/StartScreen";
import { ReservationForm } from "@/components/ReservationForm";
import { PendingReservations } from "@/components/PendingReservations";
import { AdminHistory } from "@/components/AdminHistory";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, LayoutDashboard, History, LogOut, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            className="shadow-md hover:shadow-lg transition-all md:px-4 px-2"
          >
            <ArrowLeft className="md:mr-2 h-5 w-5" />
            <span className="hidden md:inline">Back to Start</span>
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Reservation Management
            </h1>
          </div>
          <div className="flex gap-2 items-center">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" className="shadow-md hover:shadow-lg transition-all md:px-4 px-2">
                  <User className="md:mr-2 h-5 w-5" />
                  <span className="hidden md:inline">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-2 text-sm">
                  <p className="font-semibold">{hotelName}</p>
                  <p className="text-muted-foreground text-xs mt-1">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
