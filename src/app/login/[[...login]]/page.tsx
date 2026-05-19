import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <SignIn
        routing="path"
        path="/login"
        forceRedirectUrl="/play"
        fallbackRedirectUrl="/play"
        signUpUrl="/login"
        withSignUp
      />
    </div>
  );
}