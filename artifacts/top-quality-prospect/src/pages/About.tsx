import { Link } from "wouter";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import teamImg from "@assets/generated_images/about_team.jpg";

export default function About() {
  return (
    <div className="w-full pt-20">
      {/* Page Header */}
      <section className="py-20 md:py-32 bg-card border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('@assets/generated_images/hero1.jpg')] bg-cover bg-center opacity-[0.03] mix-blend-overlay" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-4xl">
          <h1 className="text-sm font-display text-primary tracking-widest uppercase mb-4 font-semibold">About Top Quality Prospect</h1>
          <h2 className="text-5xl md:text-6xl font-display font-bold text-white leading-tight mb-6">
            A LEGACY OF INDUSTRIAL INTEGRITY
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Established in Saudi Arabia, providing premier NDT inspection, surveillance, and testing services across the Kingdom.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Image Side */}
            <div className="relative">
              <div className="border border-white/10 p-2 bg-card">
                <img 
                  src={teamImg} 
                  alt="Top Quality Prospect Team" 
                  className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                />
              </div>
              <div className="absolute -left-6 top-1/4 w-12 h-32 bg-primary/20 border-l border-primary backdrop-blur-sm" />
              <div className="absolute -right-6 bottom-1/4 w-12 h-32 bg-accent/20 border-r border-accent backdrop-blur-sm" />
            </div>

            {/* Text Side */}
            <div>
              <h3 className="text-3xl font-display font-bold text-white mb-8 border-l-4 border-primary pl-6">
                DELIVERING EXCELLENCE ACROSS THE KINGDOM
              </h3>
              
              <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
                <p>
                  Top Quality Prospect was established in Saudi Arabia to meet the growing demand for highly specialized, rigorous, and dependable Non-Destructive Testing (NDT) and inspection services in the energy, petrochemical, and heavy manufacturing sectors.
                </p>
                <p>
                  We are a recognized leader in Service Surveillance, Inspection activities, and Non-Destructive Examinations. Our reputation is built on an unwavering commitment to precision, safety, and technical excellence.
                </p>
                <p>
                  Equipped with cutting-edge technology and staffed by highly-qualified specialists, we provide critical insights into asset integrity, ensuring compliance with international standards and minimizing operational risk for our clients.
                </p>
              </div>

              <div className="mt-10 pt-10 border-t border-white/10">
                <h4 className="font-display font-bold text-white mb-6 uppercase tracking-wide">Our Core Pillars</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Highly-Qualified Specialists",
                    "Advanced Testing Equipment",
                    "Stringent Safety Protocols",
                    "Kingdom-Wide Coverage",
                    "Internationally Certified",
                    "Uncompromising Accuracy"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-gray-300 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12">
                <Link 
                  href="/services" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 font-display font-bold tracking-wider transition-all inline-flex items-center gap-2 group"
                >
                  VIEW OUR CAPABILITIES
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
