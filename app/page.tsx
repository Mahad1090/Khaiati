import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Collections } from "@/components/collections";
import { FeaturedProducts } from "@/components/featured-products";
import { FeaturedBusinesses } from "@/components/featured-businesses";
import { HowItWorks } from "@/components/how-it-works";
import { Heritage } from "@/components/heritage";
import { Personalization } from "@/components/personalization";
import { Sustainability } from "@/components/sustainability";
import { Press } from "@/components/press";
import { Services } from "@/components/services";
import { Testimonials } from "@/components/testimonials";
import { Journal } from "@/components/journal";
import { Newsletter } from "@/components/newsletter";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Collections />
      <FeaturedBusinesses />
      <FeaturedProducts />
      <HowItWorks />
      <Heritage />
      <Personalization />
      <Sustainability />
      <Press />
      <Services />
      <Testimonials />
      <Journal />
      <Newsletter />
      <Footer />
    </main>
  );
}
