
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error("Please enter both username and password");
      return;
    }
    
    toast.success(`Welcome back, ${username}!`);
    navigate("/groups");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm animate-fadeIn">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          required
        />
      </div>
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          required
        />
      </div>
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
        Login
      </Button>
      <div className="flex justify-between text-sm">
        <a href="#" className="text-accent hover:text-accent/80 transition-colors dark:text-accent-foreground">
          Sign Up
        </a>
        <a href="#" className="text-accent hover:text-accent/80 transition-colors dark:text-accent-foreground">
          Forgot Password?
        </a>
      </div>
    </form>
  );
};
