"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, X, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Basic",
    description: "Perfect for beginners starting their fitness journey",
    monthly: 49,
    quarterly: 129,
    yearly: 469,
    popular: false,
    features: [
      { name: "Full gym access", included: true },
      { name: "Locker room access", included: true },
      { name: "2 group classes/week", included: true },
      { name: "Fitness assessment", included: true },
      { name: "Unlimited classes", included: false },
      { name: "Personal training", included: false },
      { name: "Spa & sauna", included: false },
      { name: "Nutrition consultation", included: false },
      { name: "Guest passes", included: false },
    ],
  },
  {
    name: "Elite",
    description: "Our most popular plan for dedicated fitness enthusiasts",
    monthly: 99,
    quarterly: 269,
    yearly: 949,
    popular: true,
    features: [
      { name: "Full gym access", included: true },
      { name: "Locker room access", included: true },
      { name: "Unlimited group classes", included: true },
      { name: "Fitness assessment", included: true },
      { name: "4 PT sessions/month", included: true },
      { name: "Spa & sauna access", included: true },
      { name: "Nutrition consultation", included: true },
      { name: "Priority booking", included: true },
      { name: "Guest passes (2/month)", included: true },
    ],
  },
  {
    name: "VIP",
    description: "The ultimate premium experience for serious athletes",
    monthly: 199,
    quarterly: 549,
    yearly: 1899,
    popular: false,
    features: [
      { name: "Full gym access", included: true },
      { name: "Private locker", included: true },
      { name: "Unlimited group classes", included: true },
      { name: "Monthly assessments", included: true },
      { name: "Unlimited PT sessions", included: true },
      { name: "Full spa access", included: true },
      { name: "Personalized meal plans", included: true },
      { name: "VIP priority booking", included: true },
      { name: "Guest passes (4/month)", included: true },
    ],
  },
]

const comparisonFeatures = [
  "Gym Access Hours",
  "Group Classes",
  "Personal Training",
  "Spa & Recovery",
  "Nutrition Support",
  "Guest Passes",
  "Locker",
  "Priority Booking",
]

const comparisonData = [
  ["6am - 10pm", "24/7", "24/7"],
  ["2/week", "Unlimited", "Unlimited"],
  ["Add-on", "4/month", "Unlimited"],
  ["Not included", "Sauna only", "Full access"],
  ["Not included", "Consultation", "Personalized plans"],
  ["Not included", "2/month", "4/month"],
  ["Shared", "Shared", "Private"],
  ["Standard", "Priority", "VIP Priority"],
]

type BillingCycle = "monthly" | "quarterly" | "yearly"

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly")

  const getPrice = (plan: typeof plans[0]) => {
    return plan[billingCycle]
  }

  const getPeriodLabel = () => {
    switch (billingCycle) {
      case "monthly":
        return "/month"
      case "quarterly":
        return "/quarter"
      case "yearly":
        return "/year"
    }
  }

  const getSavings = () => {
    switch (billingCycle) {
      case "quarterly":
        return "Save 10%"
      case "yearly":
        return "Save 20%"
      default:
        return null
    }
  }

  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
              Membership Plans
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Invest in Your Health
            </h1>
            <p className="text-xl text-muted-foreground text-pretty mb-10">
              Choose the plan that fits your goals. All memberships include access to our 
              premium facilities and world-class amenities.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-2 p-1 rounded-full bg-secondary">
              {(["monthly", "quarterly", "yearly"] as BillingCycle[]).map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    billingCycle === cycle
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                </button>
              ))}
            </div>
            {getSavings() && (
              <p className="text-primary text-sm mt-3">{getSavings()}</p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 pb-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-2xl ${
                  plan.popular
                    ? "glass-card border-primary/50 scale-105 z-10"
                    : "glass-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full neon-glow">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                  
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-5xl font-bold">${getPrice(plan)}</span>
                    <span className="text-muted-foreground">{getPeriodLabel()}</span>
                  </div>

                  <Button
                    className={`w-full mb-8 ${
                      plan.popular
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 neon-glow"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    Get Started
                  </Button>

                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature.name} className="flex items-center gap-3 text-sm">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                        )}
                        <span className={feature.included ? "" : "text-muted-foreground/50"}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
              Compare Plans
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">
              Detailed Comparison
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="overflow-x-auto"
          >
            <table className="w-full min-w-[600px] glass-card rounded-2xl overflow-hidden">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-6 text-left font-semibold">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.name} className="p-6 text-center font-semibold">
                      <span className={plan.popular ? "text-primary" : ""}>{plan.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, idx) => (
                  <tr key={feature} className="border-b border-border last:border-0">
                    <td className="p-6 text-muted-foreground">{feature}</td>
                    {comparisonData[idx].map((value, planIdx) => (
                      <td key={planIdx} className="p-6 text-center text-sm">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-2xl p-8 md:p-12 max-w-2xl mx-auto"
          >
            <HelpCircle className="h-12 w-12 text-primary mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4">Have Questions?</h3>
            <p className="text-muted-foreground mb-6">
              Our team is here to help you choose the right membership for your goals.
            </p>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Contact Us
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
