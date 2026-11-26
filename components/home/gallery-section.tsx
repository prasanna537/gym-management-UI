"use client"

import { motion } from "framer-motion"

const transformations = [
  {
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop",
    category: "Weight Training",
  },
  {
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&h=600&fit=crop",
    category: "CrossFit",
  },
  {
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop",
    category: "Personal Training",
  },
  {
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop",
    category: "Group Classes",
  },
  {
    image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&h=600&fit=crop",
    category: "Cardio Zone",
  },
  {
    image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop",
    category: "Functional Training",
  },
]

export function GallerySection() {
  return (
    <section className="py-24 bg-card/30">
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
            Our Facilities
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-balance">
            Where Transformation Happens
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            State-of-the-art equipment and premium facilities designed for peak performance 
            and optimal results.
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {transformations.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className={`relative group overflow-hidden rounded-xl ${
                index === 1 || index === 4 ? "row-span-2" : ""
              }`}
            >
              <div className={`${index === 1 || index === 4 ? "aspect-square" : "aspect-[3/2]"} relative`}>
                <img
                  src={item.image}
                  alt={item.category}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Category Label */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-sm font-semibold text-foreground">{item.category}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
