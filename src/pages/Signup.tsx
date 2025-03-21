
import { SignupForm } from "@/components/auth/SignupForm";

const Signup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-slate-900 bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 animate-gradient-x"></div>
        <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/50 bg-[size:20px_20px] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
      </div>
      
      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Create an Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign up to start your prayer journey</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
};

export default Signup;
