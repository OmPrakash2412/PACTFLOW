"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import EmptyState from "@/components/EmptyState";
import NotificationBanner from "@/components/NotificationBanner";
import {
  Sparkles,
  Search,
  CheckCircle2,
  FolderPlus,
  ShieldCheck,
  CreditCard,
  FileCode,
} from "lucide-react";

export default function DesignSystemPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"loading" | "empty" | "error" | "success">("success");

  return (
    <div className="min-h-screen flex flex-col bg-[#faf6f0] text-stone-900 selection:bg-amber-500/20">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Layer 6: Living Design System
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
            PACTFLOW Design System
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            Light beige glassmorphism tokens and standardized UI components.
            Guaranteed 100% WCAG 2.1 AA accessibility and full mobile responsiveness.
          </p>
        </div>

        {/* 1. Mandatory 4-State Architecture Showcase */}
        <section className="glass-card rounded-2xl border border-stone-200/80 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                1. Four Core View States (Playbook 6b)
              </h2>
              <p className="text-xs text-stone-500">
                Every data-driven view in PACTFLOW must handle all four states gracefully.
              </p>
            </div>
            <div className="inline-flex rounded-xl bg-stone-200/60 p-1 border border-stone-300/40">
              {(["loading", "empty", "error", "success"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    activeTab === tab
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-xl bg-stone-100/50 border border-stone-200/50 min-h-[220px] flex items-center justify-center">
            {activeTab === "loading" && (
              <div className="w-full max-w-md space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton variant="circular" width={40} height={40} />
                  <div className="space-y-2 flex-1">
                    <Skeleton variant="text" width="60%" height={14} />
                    <Skeleton variant="text" width="40%" height={10} />
                  </div>
                </div>
                <Skeleton variant="rectangular" height={90} />
              </div>
            )}

            {activeTab === "empty" && (
              <EmptyState
                icon={FolderPlus}
                title="No Milestones Generated"
                description="Prompt the Gemini Pact Architect to formulate structured milestone criteria for this workspace."
                actionLabel="Draft Agreement"
                onAction={() => alert("Action clicked")}
              />
            )}

            {activeTab === "error" && (
              <ErrorState
                title="Failed to Sync PayPal Webhook"
                message="Network timeout connecting to PayPal Sandbox gateway. Please retry or check status."
                onRetry={() => alert("Retrying operation...")}
              />
            )}

            {activeTab === "success" && (
              <div className="text-center space-y-3 py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  Trust Ledger Hash Sealed
                </h3>
                <p className="text-xs text-stone-600 max-w-sm mx-auto">
                  Milestone #1 settled via PayPal Sandbox. Event hash anchored to the SHA-256 chain.
                </p>
                <span className="inline-block px-3 py-1 rounded-md bg-stone-200 font-mono text-[11px] text-stone-700">
                  0x7f4a...8b9c (Verified)
                </span>
              </div>
            )}
          </div>
        </section>

        {/* 2. Interactive Buttons */}
        <section className="glass-card rounded-2xl border border-stone-200/80 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-stone-900">2. Button Variants & Sizes</h2>
            <p className="text-xs text-stone-500">Accessible interactive buttons with micro-interactions.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" isLoading>
              Loading
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button size="sm" leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}>
              Small (sm)
            </Button>
            <Button size="md" leftIcon={<CreditCard className="w-4 h-4" />}>
              Medium (md)
            </Button>
            <Button size="lg" leftIcon={<FileCode className="w-5 h-5" />}>
              Large (lg)
            </Button>
          </div>
        </section>

        {/* 3. Form Controls (Input & Select) */}
        <section className="glass-card rounded-2xl border border-stone-200/80 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-stone-900">3. Form Inputs & Selects</h2>
            <p className="text-xs text-stone-500">
              Client-side validations, clear labels, helper text, and error indicators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Project Title"
              placeholder="e.g. Next.js SaaS Web App"
              helperText="Give your project a concise, descriptive name."
            />
            <Input
              label="Search Deliverables"
              placeholder="Search by keyword..."
              leftIcon={<Search className="w-4 h-4" />}
            />
            <Input
              label="Target Budget ($USD)"
              defaultValue="-500"
              error="Budget must be a positive number greater than 0."
            />
            <Select
              label="Settlement Currency"
              options={[
                { value: "USD", label: "USD - United States Dollar" },
                { value: "EUR", label: "EUR - Euro" },
                { value: "GBP", label: "GBP - British Pound" },
              ]}
              helperText="Settled via PayPal Sandbox Invoicing API v2."
            />
          </div>
        </section>

        {/* 4. Notification Banners */}
        <section className="glass-card rounded-2xl border border-stone-200/80 p-6 sm:p-8 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900">4. Notification Banners</h2>
            <p className="text-xs text-stone-500">Used for contextual system feedback.</p>
          </div>

          <div className="space-y-3">
            <NotificationBanner
              type="success"
              message="Agreement version 2 accepted by both client and contractor."
            />
            <NotificationBanner
              type="warning"
              message="Deliverable requires revision: AI identified missing integration test logs."
            />
            <NotificationBanner
              type="error"
              message="SSRF Protection: Submission blocked because loopback address was provided."
            />
            <NotificationBanner
              type="info"
              message="PayPal Sandbox Mode is active. Live transactions are not processed."
            />
          </div>
        </section>

        {/* 5. Modals & Dialogs */}
        <section className="glass-card rounded-2xl border border-stone-200/80 p-6 sm:p-8 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900">5. Modal Dialogs</h2>
            <p className="text-xs text-stone-500">
              Focus-trapped, keyboard ESC-closable, and accessible dialog boxes.
            </p>
          </div>

          <Button onClick={() => setIsModalOpen(true)}>
            Open Sample Modal Dialog
          </Button>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Approve Milestone Deliverable"
            description="Milestone 1: Architecture Blueprint & Core Ingestion Pipeline"
            footer={
              <>
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    alert("Milestone Approved!");
                    setIsModalOpen(false);
                  }}
                >
                  Confirm & Generate Invoice
                </Button>
              </>
            }
          >
            <p className="leading-relaxed">
              By approving this milestone, you verify that all acceptance criteria have been met.
              An official PayPal Sandbox invoice for <strong>$2,500.00 USD</strong> will be delivered to your account.
            </p>
          </Modal>
        </section>
      </main>

      <Footer />
    </div>
  );
}

