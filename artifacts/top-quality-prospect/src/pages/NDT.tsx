import { Link } from "wouter";
import { ArrowRight, Search, Activity, Scan, Zap } from "lucide-react";
import ndtWorker from "@assets/generated_images/ndt_worker.jpg";

export default function NDT() {
  return (
    <div className="w-full pt-20">
      {/* Header */}
      <section className="py-20 md:py-32 bg-card border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-4xl">
          <h1 className="text-sm font-display text-primary tracking-widest uppercase mb-4 font-semibold">Our Expertise</h1>
          <h2 className="text-5xl md:text-6xl font-display font-bold text-white leading-tight mb-6">
            NON-DESTRUCTIVE TESTING IN SAUDI ARABIA
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Recognized leaders in Service Surveillance, Inspection activities, and Non-Destructive Examinations.
          </p>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h3 className="text-3xl font-display font-bold text-white mb-6 uppercase tracking-wide">
                Advanced Asset Integrity
              </h3>
              <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
                <p>
                  Non-Destructive Testing (NDT) is the backbone of industrial safety and reliability. At Top Quality Prospect, we deploy state-of-the-art diagnostic methods to evaluate the properties of materials, components, and structural assemblies without causing damage.
                </p>
                <p>
                  Our highly trained personnel operate across Saudi Arabia, bringing specialized technical knowledge to complex industrial environments. From refineries to pipelines, our NDT services ensure continuous operation and regulatory compliance.
                </p>
              </div>
              <div className="mt-10">
                <Link 
                  href="/services" 
                  className="bg-transparent hover:bg-white/5 text-white px-8 py-4 font-display font-bold tracking-wider transition-all border border-white/20 inline-flex items-center gap-2 group"
                >
                  FULL NDT SERVICES LIST
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] border border-white/10 p-2 bg-card relative z-10">
                <img 
                  src={ndtWorker} 
                  alt="NDT Specialist Working" 
                  className="w-full h-full object-cover contrast-125"
                />
                <div className="absolute inset-2 bg-primary/10 mix-blend-color pointer-events-none" />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-primary" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b-2 border-l-2 border-accent" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Search className="w-8 h-8 text-primary mb-4" />,
                title: "Ultrasonic Testing (UT)",
                desc: "High-frequency sound waves to detect surface and subsurface flaws."
              },
              {
                icon: <Scan className="w-8 h-8 text-primary mb-4" />,
                title: "Radiographic Testing (RT)",
                desc: "X-ray or gamma rays to view the internal structure of a component."
              },
              {
                icon: <Activity className="w-8 h-8 text-primary mb-4" />,
                title: "Magnetic Particle (MT)",
                desc: "Detects surface and slightly subsurface discontinuities in ferromagnetic materials."
              },
              {
                icon: <Zap className="w-8 h-8 text-primary mb-4" />,
                title: "Eddy Current (ET)",
                desc: "Electromagnetic induction to detect flaws in conductive materials."
              }
            ].map((method, idx) => (
              <div key={idx} className="bg-card border border-white/5 p-8 hover:border-primary/30 transition-colors">
                {method.icon}
                <h4 className="text-lg font-display font-bold text-white mb-3">{method.title}</h4>
                <p className="text-sm text-muted-foreground">{method.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
