"use client";

import React, { Component } from "react";
import { SignIn } from "@clerk/nextjs";

class SignInPage extends Component {
  render() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-black">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <SignIn 
            afterSignInUrl="/"
            afterSignUpUrl="/"
            signUpUrl="/sign-up"
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
}
export default SignInPage;

