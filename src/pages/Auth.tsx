import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { playSound } from "@/utils/sounds";
import { Hotel, LogIn, UserPlus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ email: "", password: "", hotelName: "" });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    playSound('click');

    const { error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });

    if (error) {
      playSound('error');
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      playSound('success');
      toast({
        title: "Welcome Back!",
        description: "Successfully logged in to your hotel account.",
      });
      navigate("/");
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    playSound('click');

    const { error } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
      options: {
        data: {
          hotel_name: signupData.hotelName,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      playSound('error');
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      playSound('success');
      toast({
        title: "Account Created!",
        description: "Your hotel account has been created successfully.",
      });
      navigate("/");
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    playSound('click');

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      playSound('error');
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      playSound('success');
      toast({
        title: "Check Your Email",
        description: "Password reset link has been sent to your email.",
      });
      setShowForgotPassword(false);
      setResetEmail("");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5 relative overflow-hidden p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-primary/20 animate-scale-in">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-4 animate-slow-pulse">
            <Hotel className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Hotel Reservation System
          </CardTitle>
          <CardDescription className="text-base">
            Manage your hotel reservations efficiently
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="hotel@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="transition-all focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowForgotPassword(false)}
              >
                Back to Login
              </Button>
            </form>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" onClick={() => playSound('click')}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" onClick={() => playSound('click')}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Signup
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="hotel@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      className="transition-all focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      className="transition-all focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm px-0"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot Password?
                  </Button>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-hotel">Hotel Name</Label>
                    <Input
                      id="signup-hotel"
                      type="text"
                      placeholder="Grand Hotel"
                      value={signupData.hotelName}
                      onChange={(e) => setSignupData({ ...signupData, hotelName: e.target.value })}
                      required
                      className="transition-all focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="hotel@example.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                      className="transition-all focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                      className="transition-all focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
