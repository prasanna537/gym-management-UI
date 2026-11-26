"use client"

import { motion } from "framer-motion"
import { Dumbbell, Clock, Sparkles, Shield, HeartPulse, Zap } from "lucide-react"

const features = [
  {
    icon: Dumbbell,
    title: "State-of-the-Art Equipment",
    description: "Premium Technogym and Hammer Strength equipment for optimal performance and results.",
  },
  {
    icon: Clock,
    title: "24/7 Access",
    description: "Train on your schedule with round-the-clock facility access for all members.",
  },
  {
    icon: Sparkles,
    title: "Luxury Amenities",
    description: "Spa, sauna, steam rooms, and premium locker facilities for complete recovery.",
  },
  {
    icon: Shield,
    title: "Expert Trainers",
    description: "Certified professionals with specialized expertise to guide your fitness journey.",
  },
  {
    icon: HeartPulse,
    title: "Wellness Programs",
    description: "Holistic approach combining fitness, nutrition, and mental wellness coaching.",
  },
  {
    icon: Zap,
    title: "High-Energy Classes",
    description: "Dynamic group classes from HIIT to yoga, led by passionate instructors.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-balance">
            The Ultimate Fitness Experience
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Everything you need to achieve your fitness goals under one roof, 
            with premium facilities and expert guidance.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="glass-card rounded-2xl p-8 h-full hover:border-primary/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
