import { getCurrentCustomer } from "@/lib/actions/customer-auth";
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
import { Newsletter } from "@/components/newsletter";
import { Footer } from "@/components/footer";

export default async function Home() {
  const customer = await getCurrentCustomer();

  return (
    <main className="min-h-screen">
      <Header customer={customer ? { name: customer.name, email: customer.email } : null} />
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
      <Newsletter />
      <Footer />
    </main>
  );
}
