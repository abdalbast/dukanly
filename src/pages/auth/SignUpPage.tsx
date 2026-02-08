import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    subscribeToNews: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate registration
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Account created!",
      description: "Welcome to Marketplace. You can now start shopping!",
    });

    setIsLoading(false);
    navigate("/");
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-12">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-border rounded-lg p-6">
            <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Your name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="First and last name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use 8 or more characters with a mix of letters, numbers & symbols
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  placeholder="Re-enter your password"
                  required
                />
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreeToTerms: !!checked })
                  }
                  className="mt-0.5"
                />
                <span className="text-sm">
                  I agree to the{" "}
                  <Link to="/conditions" className="text-info hover:underline">
                    Conditions of Use
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-info hover:underline">
                    Privacy Notice
                  </Link>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={formData.subscribeToNews}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, subscribeToNews: !!checked })
                  }
                />
                <span className="text-sm">
                  Send me deals, tips, and Marketplace news
                </span>
              </label>

              <Button
                type="submit"
                className="w-full btn-cta"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  or sign up with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" type="button">
                Google
              </Button>
              <Button variant="outline" type="button">
                Apple
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/auth/signin" className="text-info hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
