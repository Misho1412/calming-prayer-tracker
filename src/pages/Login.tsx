import { LoginForm } from "@/components/auth/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue your prayer journey</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;