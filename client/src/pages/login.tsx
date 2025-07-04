import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { sendOtpSchema, verifyOtpSchema, registerUserSchema } from "@shared/schema";
import { z } from "zod";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

type LoginStep = "email" | "otp" | "register";

// Helper to migrate guest cart to user cart
async function migrateGuestCartToUserCart() {
  try {
    const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
    if (guestCart.length > 0) {
      for (const item of guestCart) {
        await apiRequest("POST", "/api/cart", {
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        });
      }
      // Clear guest cart after successful migration
      localStorage.removeItem('guest_cart');
    }
  } catch (error) {
    console.error('Failed to migrate guest cart:', error);
  }
}

export default function Login() {
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const navigate = useLocation();

  // Email form
  const emailForm = useForm({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: {
      email: "",
    },
  });

  // OTP form
  const otpForm = useForm({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: "",
      code: "",
    },
  });

  // Registration form
  const registerForm = useForm({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  // Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: async (data: z.infer<typeof sendOtpSchema>) => {
      await apiRequest("POST", "/api/auth/send-otp", data);
    },
    onSuccess: () => {
      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code.",
      });
      setStep("otp");
      otpForm.setValue("email", email);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (data: z.infer<typeof verifyOtpSchema>) => {
      const response = await apiRequest("POST", "/api/auth/verify-otp", data);
      return await response.json();
    },
    onSuccess: async (data: any) => {
      if (data.requiresRegistration) {
        // New user needs to register
        setStep("register");
        registerForm.setValue("email", email);
        toast({
          title: "Registration Required",
          description: "Please complete your registration to continue.",
        });
      } else {
        // Existing user logged in
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        await migrateGuestCartToUserCart(); // Migrate guest cart after successful login
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        // Redirect based on user role
        if (data.user.role === 'buyer') {
          setLocation("/");
        } else if (data.user.role === 'seller') {
          setLocation("/seller");
        } else if (data.user.role === 'super_admin') {
          setLocation("/admin");
        } else {
          setLocation("/");
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Invalid OTP",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof registerUserSchema>) => {
      return await apiRequest("POST", "/api/auth/register", data);
    },
    onSuccess: async (data) => {
      toast({
        title: "Registration Successful",
        description: "Welcome to the platform!",
      });
      await migrateGuestCartToUserCart(); // Migrate guest cart after successful registration
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Redirect to homepage for new registrations
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onEmailSubmit = (data: z.infer<typeof sendOtpSchema>) => {
    setEmail(data.email);
    sendOtpMutation.mutate(data);
  };

  const onOtpSubmit = (data: z.infer<typeof verifyOtpSchema>) => {
    verifyOtpMutation.mutate(data);
  };

  const onRegisterSubmit = (data: z.infer<typeof registerUserSchema>) => {
    registerMutation.mutate(data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email);
      await migrateGuestCartToUserCart(); // Migrate guest cart after successful login
      
      // Check for redirect URL
      const redirectUrl = localStorage.getItem('redirect_after_login') || '/storefront';
      localStorage.removeItem('redirect_after_login');
      navigate(redirectUrl);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to login. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {step === "email" && "Welcome"}
            {step === "otp" && "Enter Verification Code"}
            {step === "register" && "Complete Registration"}
          </CardTitle>
          <CardDescription>
            {step === "email" && "Enter your email to get started"}
            {step === "otp" && `We sent a code to ${email}`}
            {step === "register" && "Tell us a bit about yourself"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "email" && (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={sendOtpMutation.isPending}
                >
                  {sendOtpMutation.isPending ? "Sending..." : "Send Verification Code"}
                </Button>
              </form>
            </Form>
          )}

          {step === "otp" && (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                <FormField
                  control={otpForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifyOtpMutation.isPending}
                >
                  {verifyOtpMutation.isPending ? "Verifying..." : "Verify Code"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep("email")}
                >
                  Back to Email
                </Button>
              </form>
            </Form>
          )}

          {step === "register" && (
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Enter your phone number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating Account..." : "Complete Registration"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}