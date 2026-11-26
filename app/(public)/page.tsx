import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { MembershipSection } from "@/components/home/membership-section"
import { TrainersSection } from "@/components/home/trainers-section"
import { GallerySection } from "@/components/home/gallery-section"
import { TestimonialsSection } from "@/components/home/testimonials-section"
import { CTASection } from "@/components/home/cta-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <MembershipSection />
      <TrainersSection />
      <GallerySection />
      <TestimonialsSection />
      <CTASection />
    </>
  )
}
