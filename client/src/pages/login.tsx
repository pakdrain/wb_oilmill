import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Scale, Users, LogIn, UserPlus } from "lucide-react";
import { z } from "zod";

// Define schemas locally to avoid import issues
const loginSchema = z.object({
  userName: z.string().min(1, "Username is required"),
  userPassword: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  userName: z.string().min(3, "Username must be at least 3 characters").max(50, "Username too long"),
  userPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  branchId: z.string().min(1, "Please select a branch"),
}).refine((data) => data.userPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
const { login, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [branches, setBranches] = useState<any[]>([]);





// ✅ FIX: redirect AFTER user set
  useEffect(() => {
    if (user) {
      console.log("✅ User mil gaya, redirect ho raha hai...");
      setLocation("/");
    }
  }, [user]);

  // Fetch branches for registration dropdown
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch('/api/branches');
        if (response.ok) {
          const branchData = await response.json();
          setBranches(branchData);
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    fetchBranches();
  }, []);

  // Login form
  const loginForm = useForm<LoginData>({
    
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userName: "",
      userPassword: "",
    },
  });

  // Registration form
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userName: "",
      userPassword: "",
      confirmPassword: "",
      branchId: "",
    },
  });

  // Login mutation
  const loginMutation = useMutation({
  mutationFn: async (data: LoginData) => {
    console.log("🔄 1. Mutation function starting");
    console.log("📝 Sending data:", { userName: data.userName, userPassword: "***" });
    
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    console.log("📡 2. Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ 3. Login failed with status:", response.status);
      console.error("Error details:", errorText);
      throw new Error("Login failed");
    }
    
    const result = await response.json();
    console.log("✅ 4. Login response received:", result);
    return result;
  },
  onSuccess: (data) => {
    console.log("🎉 5. onSuccess called with:", data);
    
    if (data.success) {
      console.log("✅ 6. Login successful! User data:", data.user);
      console.log("🔄 7. Calling login() from auth context");
      
      // Use auth context to login
      login({
        userid: data.user.userid,
        userName: data.user.userName,
        branchId: data.user.branchId,
        branchName: data.user.branchName
      });

      console.log("🚀 8. Redirecting to /purchase-form");
      setLocation('/');
    } else {
      console.warn("⚠️ 6. data.success is false, not redirecting");
      console.log("Response data:", data);
    }
  },
  onError: (error) => {
    console.error("💥 5. onError called:", error);
    console.log("Form values at time of error:", loginForm.getValues());
  },
});

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }
      return result;
    },
    onSuccess: (data) => {
      if (data.success) {
        console.log("LOGIN RESPONSE:", data);
        // Reset form and switch to login tab
        registerForm.reset();
        setActiveTab("login");
        // Pre-fill the login form with the registered username
        loginForm.setValue("userName", data.user.userName);
      }
    },
    onError: (error) => {
      console.error("Registration error:", error);
    },
  });

  const onLogin = (data: LoginData) => {
  console.log("========== LOGIN ATTEMPT ==========");
  console.log("Submitted Username:", data.userName);
  console.log("Submitted Password:", data.userPassword);
  console.log("Full Form Data:", data);
  
  loginMutation.mutate(data);
};

  const onRegister = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;
  const loginError = loginMutation.error;
  const registerError = registerMutation.error;

  return (
    <div className="min-h-screen bg-monitoring-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-monitoring-blue p-3 rounded-full">
              <Scale className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Weighbridge System </h1>
          <p className="text-gray-400">Industrial Weight Management Platform</p>
        </div>



        {/* Auth Forms */}
        <Card className="bg-monitoring-slate border-monitoring-gray">
          <CardHeader className="space-y-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-monitoring-gray">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-monitoring-blue data-[state=active]:text-white"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="data-[state=active]:bg-monitoring-blue data-[state=active]:text-white"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
                <CardDescription className="text-gray-400">
                  Enter your credentials to access the system
                </CardDescription>
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <CardTitle className="text-2xl text-white">Create Account</CardTitle>
                <CardDescription className="text-gray-400">
                  Register a new user account for the system
                </CardDescription>
              </TabsContent>
            </Tabs>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loginUsername" className="text-gray-300">Username</Label>
                    <Input
                      id="loginUsername"
                      type="text"
                      autoComplete="off"
                      placeholder="Enter your username"
                      className="bg-monitoring-gray border-monitoring-gray text-white placeholder:text-gray-500 focus:border-monitoring-blue"
                      {...loginForm.register("userName")}
                    />
                    {loginForm.formState.errors.userName && (
                      <p className="text-sm text-monitoring-red">
                        {loginForm.formState.errors.userName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loginPassword" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Input
                        id="loginPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="off"
                        placeholder="Enter your password"
                        className="bg-monitoring-gray border-monitoring-gray text-white placeholder:text-gray-500 focus:border-monitoring-blue pr-10"
                        {...loginForm.register("userPassword")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {loginForm.formState.errors.userPassword && (
                      <p className="text-sm text-monitoring-red">
                        {loginForm.formState.errors.userPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Login Error Display */}
                  {loginError && (
                    <div className="p-3 rounded-md bg-red-900/50 border border-red-700">
                      <p className="text-sm text-red-200">
                        {loginError.message}
                      </p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-monitoring-blue hover:bg-monitoring-blue/90 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              {/* Registration Form */}
              <TabsContent value="register">
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="registerBranch" className="text-gray-300">Branch</Label>
                    <Select 
                      value={registerForm.watch("branchId")} 
                      onValueChange={(value) => registerForm.setValue("branchId", value)}
                    >
                      <SelectTrigger className="bg-monitoring-gray border-monitoring-gray text-white focus:border-monitoring-blue">
                        <SelectValue placeholder="Select your branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.branch_id} value={branch.branch_id.toString()}>
                            {branch.branch_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {registerForm.formState.errors.branchId && (
                      <p className="text-sm text-monitoring-red">
                        {registerForm.formState.errors.branchId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerUsername" className="text-gray-300">Username</Label>
                    <Input
                      id="registerUsername"
                      type="text"
                      autoComplete="off"
                      placeholder="Choose a username"
                      className="bg-monitoring-gray border-monitoring-gray text-white placeholder:text-gray-500 focus:border-monitoring-blue"
                      {...registerForm.register("userName")}
                    />
                    {registerForm.formState.errors.userName && (
                      <p className="text-sm text-monitoring-red">
                        {registerForm.formState.errors.userName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerPassword" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Input
                        id="registerPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="off"
                        placeholder="Create a password"
                        className="bg-monitoring-gray border-monitoring-gray text-white placeholder:text-gray-500 focus:border-monitoring-blue pr-10"
                        {...registerForm.register("userPassword")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {registerForm.formState.errors.userPassword && (
                      <p className="text-sm text-monitoring-red">
                        {registerForm.formState.errors.userPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="off"
                        placeholder="Confirm your password"
                        className="bg-monitoring-gray border-monitoring-gray text-white placeholder:text-gray-500 focus:border-monitoring-blue pr-10"
                        {...registerForm.register("confirmPassword")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-monitoring-red">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Registration Error Display */}
                  {registerError && (
                    <div className="p-3 rounded-md bg-red-900/50 border border-red-700">
                      <p className="text-sm text-red-200">
                        {registerError.message}
                      </p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-monitoring-blue hover:bg-monitoring-blue/90 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Industrial Weighbridge Management System v2.0
          </p>
        </div>
      </div>
    </div>
  );
}