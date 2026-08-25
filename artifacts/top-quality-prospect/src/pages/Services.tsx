import { ArrowRight, Settings, Wrench } from "lucide-react";
import { Link } from "wouter";

export default function Services() {
  const leftColumn = [
    "DNV NOBL Limited",
    "Advanced Sailing Sail",
    "TPHL",
    "TUVS",
    "Magnetic Particle Inspection (MT, MPI)",
    "Dye Penetrant / Liquid Penetrant (PT, LPT)",
    "Ultrasonic Testing (UT)",
    "Radiographic Testing (RT)",
    "Visual Inspection (VT)",
    "Eddy Current Testing (ET)",
    "Hardness Testing (HT)",
    "Acoustic Emission Testing (AET)",
    "Remote Field Technique (RFT)",
    "NDT Level Testing and Inspection",
    "Level III Services",
    "Phased Array Testing/PAUT",
    "Advanced NDT Procedure Writing",
    "NDT Level Testing & Inspection (AML,MT)",
    "API-510 Pressure Vessel inspection",
    "API-570 Piping inspection",
    "API-580 Risk Based Inspection",
    "RSTRENG",
    "Hardness Testing (HT)",
    "X-Ray Welding Inspection",
    "X-Ray Pipe Inspection",
    "Magnetic Particle Inspection",
    "Rope Access (IRATA) Inspection",
    "Visual Inspection",
    "Phased Array",
    "Long Range Ultrasonic Testing (LRUT)",
    "Time of Flight Diffraction (TOFD)",
    "Time of Flight Diffraction (TOFD) Level 2"
  ];

  const rightColumn = [
    "Turnkey Product Inspection (Real-Time RT/VT/UT/ET/PAUT/TOFD)",
    "MT, PT, VT",
    "API-510",
    "API-570",
    "API-580",
    "RSTRENG",
    "Fitness for Service (FFS)",
    "Remaining Life Assessment (RLA)",
    "Magnetic Particle Inspection (MPI/MT)",
    "Phased Array (PA/PAUT)",
    "Long Range UT (LRUT/Guided Waves)",
    "Rope Access (IRATA) Inspection",
    "Non-Destructive Test Consultation",
    "Contract and Project management",
    "Structural Integrity Assessment",
    "Pipeline Inspections",
    "Reliability Engineering",
    "Asset Management",
    "Heat exchanger Inspection",
    "Boiler Inspection",
    "Safety Studies",
    "Piping System Evaluation",
    "FMEA",
    "Root Cause Analysis",
    "Maintenance Planning"
  ];

  return (
    <div className="w-full pt-20">
      <section className="py-20 md:py-32 bg-card border-b border-white/10 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-4xl">
          <Settings className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white leading-tight mb-6">
            FULL SERVICE PORTFOLIO
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed font-light tracking-wide">
            Comprehensive Industrial Inspection & Testing Solutions
          </p>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Left Column */}
            <div>
              <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
                <Wrench className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">
                  Testing & Inspection Services
                </h2>
              </div>
              
              <ul className="space-y-4">
                {leftColumn.map((service, idx) => (
                  <li key={idx} className="flex items-start gap-4 p-4 border border-white/5 bg-card hover:border-primary/30 transition-colors group">
                    <div className="w-2 h-2 bg-primary rounded-none mt-2 group-hover:bg-accent transition-colors" />
                    <span className="text-gray-300 font-medium">{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column */}
            <div>
              <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
                <Settings className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">
                  On-Site & Consulting Services
                </h2>
              </div>
              
              <ul className="space-y-4">
                {rightColumn.map((service, idx) => (
                  <li key={idx} className="flex items-start gap-4 p-4 border border-white/5 bg-card hover:border-primary/30 transition-colors group">
                    <div className="w-2 h-2 bg-primary rounded-none mt-2 group-hover:bg-accent transition-colors" />
                    <span className="text-gray-300 font-medium">{service}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          <div className="mt-20 text-center">
            <Link 
              href="/contact" 
              className="bg-transparent hover:bg-white/5 text-white px-10 py-5 font-display font-bold tracking-wider transition-all border border-white/20 inline-flex items-center gap-2 group"
            >
              REQUEST A CONSULTATION
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
