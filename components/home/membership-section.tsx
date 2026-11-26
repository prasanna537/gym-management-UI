"use client"

import { motion } from "framer-motion"
import { Check, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Basic",
    price: "49",
    period: "/month",
    description: "Perfect for beginners starting their fitness journey",
    features: [
      "Full gym access",
      "Locker room access",
      "2 group classes/week",
      "Fitness assessment",
    ],
    popular: false,
  },
  {
    name: "Elite",
    price: "99",
    period: "/month",
    description: "Our most popular plan for dedicated fitness enthusiasts",
    features: [
      "Everything in Basic",
      "Unlimited group classes",
      "4 PT sessions/month",
      "Spa & sauna access",
      "Nutrition consultation",
      "Priority booking",
    ],
    popular: true,
  },
  {
    name: "VIP",
    price: "199",
    period: "/month",
    description: "The ultimate premium experience for serious athletes",
    features: [
      "Everything in Elite",
      "Unlimited PT sessions",
      "Private locker",
      "Guest passes (4/month)",
      "Recovery suite access",
      "Exclusive events",
    ],
    popular: false,
  },
]

export function MembershipSection() {
  return (
    <section className="py-24 bg-card/50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
            Membership Plans
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-balance">
            Invest in Your Health
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Choose the membership that fits your lifestyle. All plans include access to our 
            premium facilities and world-class amenities.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/pricing" className="block">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 neon-glow"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href="/pricing" className="inline-flex items-center gap-2 text-primary hover:underline group">
            View all membership options
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
