"use client";

// Client-side auth surface re-exported so apps import from one place.
// (Use `useAuth().isSignedIn` for conditional rendering — this Clerk build does
// not export <SignedIn>/<SignedOut> from the main entry.)
export {
  useAuth,
  useUser,
  useSignIn,
  useSignUp,
  useClerk,
  SignIn,
  SignUp,
  SignInButton,
  SignUpButton,
  UserButton,
  AuthenticateWithRedirectCallback,
} from "@clerk/nextjs";
