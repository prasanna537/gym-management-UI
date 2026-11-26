"use client"

import { motion } from "framer-motion"
import { Instagram, Twitter, Linkedin } from "lucide-react"

const trainers = [
  {
    name: "Marcus Chen",
    role: "Head Coach",
    specialization: "Strength & Conditioning",
    bio: "15+ years of experience training elite athletes and fitness enthusiasts. Certified NSCA and NASM trainer.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=500&fit=crop&crop=face",
    certifications: ["NSCA-CSCS", "NASM-CPT", "Precision Nutrition"],
    social: { instagram: "#", twitter: "#", linkedin: "#" },
  },
  {
    name: "Sarah Williams",
    role: "Senior Trainer",
    specialization: "HIIT & CrossFit",
    bio: "Former competitive athlete with a passion for high-intensity training and functional fitness.",
    image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=500&fit=crop&crop=face",
    certifications: ["CrossFit L3", "NASM-CPT", "TRX Certified"],
    social: { instagram: "#", twitter: "#", linkedin: "#" },
  },
  {
    name: "David Park",
    role: "Performance Specialist",
    specialization: "Sports Performance",
    bio: "Works with professional athletes to optimize performance through science-backed training methods.",
    image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&h=500&fit=crop&crop=face",
    certifications: ["CSCS", "USA Weightlifting", "FMS Certified"],
    social: { instagram: "#", twitter: "#", linkedin: "#" },
  },
  {
    name: "Emma Rodriguez",
    role: "Wellness Coach",
    specialization: "Yoga & Mobility",
    bio: "Combines ancient practices with modern science for holistic wellness and injury prevention.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop&crop=face",
    certifications: ["RYT-500", "FRC Mobility", "Mindfulness Coach"],
    social: { instagram: "#", twitter: "#", linkedin: "#" },
  },
  {
    name: "James Mitchell",
    role: "Boxing Coach",
    specialization: "Combat Sports",
    bio: "Former professional boxer bringing championship-level training to every session.",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=500&fit=crop&crop=face",
    certifications: ["USA Boxing Coach", "First Aid", "NASM-CPT"],
    social: { instagram: "#", twitter: "#", linkedin: "#" },
  },
  {
    name: "Lisa Thompson",
    role: "Nutrition Specialist",
    specialization: "Sports Nutrition",
    bio: "Registered dietitian helping members fuel their performance with personalized nutrition plans.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop&crop=face",
    certifications: ["RD", "CISSN", "Precision Nutrition L2"],
    social: { instagram: "#", twitter: "#", linkedin: "#" },
  },
]

export default function TrainersPage() {
  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
              Expert Team
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Meet Your Coaches
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Our certified trainers bring decades of combined experience and a passion 
              for helping you achieve your fitness goals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trainers Grid */}
      <section className="py-16 pb-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainers.map((trainer, index) => (
              <motion.div
                key={trainer.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="glass-card rounded-2xl overflow-hidden">
                  {/* Image */}
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <img
                      src={trainer.image}
                      alt={trainer.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    
                    {/* Social Links */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={trainer.social.instagram}
                        className="p-2 rounded-lg bg-background/80 hover:bg-primary hover:text-primary-foreground transition-colors"
                        aria-label={`${trainer.name} Instagram`}
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                      <a
                        href={trainer.social.twitter}
                        className="p-2 rounded-lg bg-background/80 hover:bg-primary hover:text-primary-foreground transition-colors"
                        aria-label={`${trainer.name} Twitter`}
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                      <a
                        href={trainer.social.linkedin}
                        className="p-2 rounded-lg bg-background/80 hover:bg-primary hover:text-primary-foreground transition-colors"
                        aria-label={`${trainer.name} LinkedIn`}
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </div>

                    {/* Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span className="text-primary text-xs font-semibold uppercase tracking-wider">
                        {trainer.specialization}
                      </span>
                      <h3 className="text-2xl font-bold mt-1">{trainer.name}</h3>
                      <p className="text-muted-foreground text-sm">{trainer.role}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {trainer.bio}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {trainer.certifications.map((cert) => (
                        <span
                          key={cert}
                          className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
