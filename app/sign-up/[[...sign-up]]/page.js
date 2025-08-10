"use client";

import React from "react";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-black">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        <SignUp 
          afterSignInUrl="/"
          afterSignUpUrl="/"
          signInUrl="/sign-in"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white/90 shadow-xl border-0",
            }
          }}
        />
      </div>
    </div>
  );
}
