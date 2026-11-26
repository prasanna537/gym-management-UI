"use client"

import { motion } from "framer-motion"
import { Target, Eye, Award, Users, Clock, Dumbbell } from "lucide-react"

const stats = [
  { value: "10+", label: "Years Experience" },
  { value: "5,000+", label: "Active Members" },
  { value: "150+", label: "Expert Trainers" },
  { value: "50+", label: "Weekly Classes" },
]

const milestones = [
  { year: "2014", title: "Founded", description: "APEX FITNESS was born with a vision to revolutionize fitness." },
  { year: "2016", title: "First Expansion", description: "Opened our second location due to overwhelming demand." },
  { year: "2018", title: "Award Winning", description: "Named 'Best Premium Gym' by Fitness Magazine." },
  { year: "2020", title: "Digital Launch", description: "Launched online training platform during global challenges." },
  { year: "2022", title: "5,000 Members", description: "Reached milestone of 5,000 active members." },
  { year: "2024", title: "Innovation Hub", description: "Introduced AI-powered fitness tracking and coaching." },
]

const facilities = [
  {
    icon: Dumbbell,
    title: "Premium Equipment",
    description: "Over 200 pieces of state-of-the-art Technogym and Hammer Strength equipment.",
  },
  {
    icon: Users,
    title: "Group Studios",
    description: "5 dedicated studios for yoga, HIIT, cycling, dance, and functional training.",
  },
  {
    icon: Clock,
    title: "24/7 Access",
    description: "Round-the-clock facility access with secure keycard entry for all members.",
  },
  {
    icon: Award,
    title: "Recovery Zone",
    description: "Full spa, sauna, steam rooms, and cryotherapy for optimal recovery.",
  },
]

export default function AboutPage() {
  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl"
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
              Our Story
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Building Champions Since 2014
            </h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl">
              APEX FITNESS was founded with a singular vision: to create a fitness sanctuary 
              where ambition meets excellence. We believe everyone deserves access to world-class 
              facilities and expert guidance on their journey to peak performance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-card rounded-2xl p-8 md:p-10"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To empower individuals to achieve their fullest potential through premium 
                fitness experiences, expert coaching, and a supportive community that 
                celebrates every milestone along the way.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-card rounded-2xl p-8 md:p-10"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Eye className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To be the global standard for premium fitness, where cutting-edge technology, 
                world-class facilities, and passionate experts converge to create transformative 
                experiences for every member.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Facilities */}
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
              Facilities
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-balance">
              World-Class Amenities
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
              Every detail of our facilities has been designed with your performance and 
              comfort in mind.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((facility, index) => (
              <motion.div
                key={facility.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <facility.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{facility.title}</h3>
                <p className="text-muted-foreground text-sm">{facility.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
              Our Journey
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-balance">
              Milestones & Achievements
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2" />

              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex items-center gap-8 mb-12 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-0 md:left-1/2 w-4 h-4 bg-primary rounded-full md:-translate-x-1/2 neon-glow" />
                  
                  {/* Content */}
                  <div className={`ml-8 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                    <span className="text-primary font-bold text-lg">{milestone.year}</span>
                    <h3 className="text-xl font-semibold mt-1">{milestone.title}</h3>
                    <p className="text-muted-foreground text-sm mt-2">{milestone.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
