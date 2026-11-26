"use client"

import { motion } from "framer-motion"
import { ArrowRight, Instagram, Twitter } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const trainers = [
  {
    name: "Marcus Chen",
    role: "Head Coach",
    specialization: "Strength & Conditioning",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=500&fit=crop&crop=face",
    social: { instagram: "#", twitter: "#" },
  },
  {
    name: "Sarah Williams",
    role: "Senior Trainer",
    specialization: "HIIT & CrossFit",
    image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=500&fit=crop&crop=face",
    social: { instagram: "#", twitter: "#" },
  },
  {
    name: "David Park",
    role: "Specialist",
    specialization: "Sports Performance",
    image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&h=500&fit=crop&crop=face",
    social: { instagram: "#", twitter: "#" },
  },
]

export function TrainersSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16"
        >
          <div>
            <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
              Expert Trainers
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-balance">
              Meet Your Coaches
            </h2>
          </div>
          <Link href="/trainers">
            <Button variant="outline" className="group">
              View All Trainers
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trainers.map((trainer, index) => (
            <motion.div
              key={trainer.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative rounded-2xl overflow-hidden glass-card">
                {/* Image */}
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img
                    src={trainer.image}
                    alt={trainer.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  
                  {/* Social Icons */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={trainer.social.instagram}
                      className="p-2 rounded-lg bg-background/80 hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                    <a
                      href={trainer.social.twitter}
                      className="p-2 rounded-lg bg-background/80 hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="text-primary text-xs font-semibold uppercase tracking-wider">
                    {trainer.specialization}
                  </span>
                  <h3 className="text-xl font-semibold mt-1">{trainer.name}</h3>
                  <p className="text-muted-foreground text-sm">{trainer.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
