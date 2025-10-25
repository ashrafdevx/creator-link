import React from "react";
import AuthFlow from "@/components/auth/AuthFlow";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Layout({ children }) {
  return (
    <AuthFlow>
      <div className="min-h-screen bg-[#0F172A] text-slate-100">
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
    </AuthFlow>
  );
}
