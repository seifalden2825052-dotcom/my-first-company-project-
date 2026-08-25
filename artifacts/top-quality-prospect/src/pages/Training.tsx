import { Link } from "wouter";
import { GraduationCap, ArrowRight, CheckSquare } from "lucide-react";
import trainingImg from "@assets/generated_images/hero2.jpg";

export default function Training() {
  const methods = [
    "Ultrasonic Testing (UT)",
    "Radiographic Testing (RT)",
    "Magnetic Particle Testing (MT)",
    "Liquid Penetrant Testing (PT)",
    "Visual Testing (VT)",
    "Eddy Current Testing (ET)",
    "Phased Array Ultrasonic Testing (PAUT)",
    "Time of Flight Diffraction (TOFD)",
    "API Inspector Preparation",
    "Radiation Safety"
  ];

  return (
    <div className="w-full pt-20">
      <section className="py-20 md:py-32 bg-card border-b border-white/10 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-4xl">
          <GraduationCap className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white leading-tight mb-6">
            A CULTURE OF CONTINUOUS AND INTEGRATED
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed font-light tracking-wide uppercase">
            Specialized Industrial Training Programs
          </p>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-3xl font-display font-bold text-white mb-8 border-l-4 border-primary pl-6">
                EMPOWERING THE WORKFORCE
              </h3>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                We believe that the quality of inspection is directly tied to the competence of the inspector. Top Quality Prospect offers comprehensive training programs designed to elevate the technical capabilities of industrial personnel.
              </p>
              
              <div className="bg-card border border-white/10 p-8 mb-8">
                <h4 className="font-display font-bold text-white uppercase tracking-wider mb-6">Available Training Methods</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {methods.map((method, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-gray-300 font-medium">{method}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            <div className="relative">
              <div className="aspect-square border border-white/10 p-2 bg-card relative z-10 overflow-hidden group">
                <img 
                  src={trainingImg} 
                  alt="Training Session" 
                  className="w-full h-full object-cover grayscale mix-blend-luminosity group-hover:grayscale-0 group-hover:mix-blend-normal transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="text-3xl font-display font-bold text-white mb-2">LEVEL I, II & III</div>
                  <div className="text-primary font-bold uppercase tracking-widest text-sm">Certification Training</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary/10 border-t border-primary/20">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
          <h3 className="text-3xl font-display font-bold text-white mb-6 uppercase">Ready to elevate your team's expertise?</h3>
          <p className="text-muted-foreground mb-10 text-lg">Contact our training department to schedule a session or request a custom curriculum tailored to your facility's needs.</p>
          <Link 
            href="/contact" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-5 font-display font-bold tracking-wider transition-all inline-flex items-center gap-2 group"
          >
            CONTACT TRAINING DEPT
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
