import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowRight, ShieldCheck, Activity, GraduationCap } from "lucide-react";
import hero1 from "@assets/generated_images/ndt_hero1.jpg";
import hero2 from "@assets/generated_images/ndt_hero2.jpg";
import hero3 from "@assets/generated_images/ndt_hero3.jpg";

const slides = [
  {
    image: hero1,
    title: "PRECISION INSPECTION",
    subtitle: "Safeguarding Saudi Arabia's Industrial Future",
  },
  {
    image: hero2,
    title: "EXPERT NDT SERVICES",
    subtitle: "Advanced Technologies for Flawless Integrity",
  },
  {
    image: hero3,
    title: "AUTHORITATIVE QUALITY",
    subtitle: "Dependable Surveillance and Testing Programs",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full">
      {/* Hero Carousel */}
      <section className="relative h-[85vh] w-full overflow-hidden bg-background">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={currentSlide}
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-background/20 z-10 mix-blend-multiply" />

        <div className="relative z-20 container mx-auto px-4 md:px-6 h-full flex items-center">
          <div className="max-w-3xl">
            <motion.div
              key={`text-${currentSlide}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="inline-block px-3 py-1 border border-primary text-primary font-display font-semibold tracking-widest text-sm mb-6 uppercase bg-primary/10 backdrop-blur-sm">
                Top Quality Prospect
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white leading-[1.1] mb-6 tracking-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl font-light border-l-2 border-accent pl-4">
                {slides[currentSlide].subtitle}
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link 
                  href="/services" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 font-display font-bold tracking-wider transition-all flex items-center gap-2 group border border-primary"
                >
                  DISCOVER SERVICES
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/contact" 
                  className="bg-transparent hover:bg-white/5 text-white px-8 py-4 font-display font-bold tracking-wider transition-all border border-white/20"
                >
                  REQUEST QUOTE
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-0 right-0 z-20 container mx-auto px-4 md:px-6 flex gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 transition-all duration-500 rounded-none ${
                idx === currentSlide ? "w-12 bg-primary" : "w-6 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Services and Projects */}
      <section className="py-24 bg-card border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
            <div className="max-w-2xl">
              <h2 className="text-sm font-display text-primary tracking-widest uppercase mb-3 font-semibold">What We Do</h2>
              <h3 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
                SERVICES AND PROJECTS
              </h3>
            </div>
            <Link href="/services" className="text-muted-foreground hover:text-primary flex items-center gap-2 font-display font-bold tracking-wider transition-colors group">
              VIEW ALL <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Activity className="w-10 h-10 text-primary mb-6" />,
                title: "Advanced NDT",
                desc: "State-of-the-art non-destructive testing methodologies including UT, RT, MT, PT, and ET to assure material integrity.",
                link: "/ndt"
              },
              {
                icon: <ShieldCheck className="w-10 h-10 text-primary mb-6" />,
                title: "Inspection Services",
                desc: "Turnkey product inspection, API certifications, and structural integrity assessments for critical infrastructure.",
                link: "/services"
              },
              {
                icon: <GraduationCap className="w-10 h-10 text-primary mb-6" />,
                title: "Training Programs",
                desc: "Comprehensive training in Level I, II, and III NDT methods to build a culture of continuous integrated excellence.",
                link: "/training"
              }
            ].map((item, idx) => (
              <Link key={idx} href={item.link}>
                <div className="group bg-background border border-white/5 p-10 hover:border-primary/50 transition-all duration-300 h-full relative overflow-hidden flex flex-col cursor-pointer">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700" />
                  
                  {item.icon}
                  <h4 className="text-xl font-display font-bold text-white mb-4 uppercase tracking-wide group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-muted-foreground leading-relaxed flex-1">{item.desc}</p>
                  
                  <div className="mt-8 flex items-center text-sm font-display font-bold text-primary tracking-wider uppercase">
                    Explore <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Teaser */}
      <section className="py-24 relative overflow-hidden bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-[4/5] bg-card border border-white/10 relative z-10 overflow-hidden">
                <img src={hero3} alt="Industrial Facility" className="w-full h-full object-cover opacity-60 mix-blend-luminosity grayscale contrast-150" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-2/3 aspect-square bg-primary/10 border border-primary/20 backdrop-blur-sm z-20 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-5xl font-display font-bold text-white mb-2">10+</div>
                  <div className="text-sm text-primary font-display font-bold tracking-widest uppercase">Years of Excellence</div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-display text-primary tracking-widest uppercase mb-3 font-semibold">About Top Quality</h2>
              <h3 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight mb-8">
                ESTABLISHED IN <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">SAUDI ARABIA</span>
              </h3>
              
              <div className="space-y-6 text-muted-foreground leading-relaxed text-lg mb-10">
                <p>
                  Top Quality Prospect is a recognized leader in Service Surveillance, Inspection activities, and Non-Destructive Examinations across the Kingdom.
                </p>
                <p>
                  We are driven by technical precision and a deep commitment to ensuring the safety and reliability of critical industrial infrastructure through highly qualified specialists.
                </p>
              </div>

              <Link 
                href="/about" 
                className="bg-transparent hover:bg-white/5 text-white px-8 py-4 font-display font-bold tracking-wider transition-all border border-white/20 inline-flex items-center gap-2 group"
              >
                READ OUR STORY
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
