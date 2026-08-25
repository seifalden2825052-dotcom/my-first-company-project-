import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Mail, User, Linkedin, Twitter, MessageCircle } from "lucide-react";
import regionalMapPath from "@assets/generated_images/regional_map_base.png";
import EG from "country-flag-icons/react/3x2/EG";
import SA from "country-flag-icons/react/3x2/SA";
import AE from "country-flag-icons/react/3x2/AE";

type CountryKey = "egypt" | "saudi" | "uae";

const offices: Record<
  CountryKey,
  { country: string; countryAr: string; address: string; person: string; phone: string; phoneHref: string; code: string }
> = {
  egypt: {
    country: "Egypt",
    countryAr: "Egypt — Headquarters",
    address: "Giza, Egypt",
    person: "Mohamed Refaat",
    phone: "+20 10 00780475",
    phoneHref: "tel:+201000780475",
    code: "EG",
  },
  saudi: {
    country: "Saudi Arabia",
    countryAr: "Saudi Arabia",
    address: "Mecca, Saudi Arabia",
    person: "Ahmed Sedek",
    phone: "+971-543394096",
    phoneHref: "tel:+971543394096",
    code: "SA",
  },
  uae: {
    country: "United Arab Emirates",
    countryAr: "UAE",
    address: "Dubai, United Arab Emirates",
    person: "Mustafa Riad",
    phone: "+966 50 844 6103",
    phoneHref: "tel:+966508446103",
    code: "AE",
  },
};

/* Map pin positions — calibrated against the satellite image (1024×1024 square).
   Giza  : west bank of the Nile near Cairo → left side, ~30% down
   Mecca : west Saudi, east of Red Sea mid  → centre-left, ~60% down
   Dubai : UAE Gulf coast                   → centre-right, ~46% down          */
const mapPoints: Record<CountryKey, { x: number; y: number; city: string }> = {
  egypt: { x: 16, y: 41, city: "GIZA" },
  saudi: { x: 36, y: 60, city: "MECCA" },
  uae:   { x: 69, y: 46, city: "DUBAI" },
};

/* Flag sizes for the three usage contexts */
const flagSizes = {
  sm: "w-8 h-5",
  md: "w-10 h-[26px]",
  lg: "w-14 h-9",
};

function FlagMark({ country, size = "md" }: { country: CountryKey; size?: "sm" | "md" | "lg" }) {
  const cls = `${flagSizes[size]} shrink-0 rounded-[2px] shadow-[0_2px_8px_rgba(0,0,0,0.5)]`;
  if (country === "egypt")  return <EG  title="Egypt"                className={cls} />;
  if (country === "saudi")  return <SA  title="Saudi Arabia"         className={cls} />;
  return                           <AE  title="United Arab Emirates" className={cls} />;
}

export default function Contact() {
  const [selected, setSelected] = useState<CountryKey>("egypt");
  const office = offices[selected];

  return (
    <div className="w-full pt-20">
      <section className="py-20 md:py-32 bg-card border-b border-white/10 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white leading-tight mb-6">
            CONTACT US
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed font-light tracking-wide">
            Serving clients across Egypt, Saudi Arabia, and the United Arab Emirates
          </p>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.42fr)] gap-12 xl:gap-16 items-start">

            {/* Contact Details */}
            <div>
              <h2 className="text-3xl font-display font-bold text-white mb-8 border-l-4 border-primary pl-6 uppercase">
                Our Offices
              </h2>

              {/* Country selector tabs */}
              <div className="flex gap-2 mb-10">
                {(Object.keys(offices) as CountryKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelected(key)}
                    data-testid={`button-country-${key}`}
                    className={`flex-1 px-3 py-3 border font-display font-bold tracking-wider text-xs md:text-sm uppercase transition-all ${
                      selected === key
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-white/10 hover:border-primary/50 hover:text-white"
                    }`}
                  >
                    <FlagMark country={key} size="sm" />
                    {offices[key].country === "United Arab Emirates" ? "UAE" : offices[key].country}
                  </button>
                ))}
              </div>

              {/* Selected office card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selected}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-8 mb-12"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-card border border-white/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-display font-bold text-muted-foreground uppercase tracking-wider mb-1">Office</h3>
                      <p className="text-lg text-white" data-testid="text-office-country">
                         <span className="inline-flex items-center gap-3">
                           <FlagMark country={selected} size="md" />
                           {office.country}
                         </span>
                        {selected === "egypt" && (
                          <span className="ml-2 text-xs text-primary font-display font-bold uppercase tracking-wider border border-primary/40 px-2 py-0.5">HQ</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="ml-16 border border-primary/30 bg-primary/10 p-5 md:p-6">
                    <div className="mb-2 flex items-center gap-2 text-xs font-display font-bold uppercase tracking-[0.18em] text-primary">
                      <MapPin className="h-4 w-4" />
                      Office Address
                    </div>
                    <p className="text-xl font-medium text-white md:text-2xl">{office.address}</p>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-card border border-white/10 flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-display font-bold text-muted-foreground uppercase tracking-wider mb-1">Contact Person</h3>
                      <p className="text-lg text-white" data-testid="text-contact-person">{office.person}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-card border border-white/10 flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-display font-bold text-muted-foreground uppercase tracking-wider mb-1">Phone</h3>
                      <a href={office.phoneHref} className="text-lg text-white hover:text-primary transition-colors" data-testid="text-contact-phone">
                        {office.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-card border border-white/10 flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-display font-bold text-muted-foreground uppercase tracking-wider mb-1">Email</h3>
                      <a href="mailto:info@topquality-prospect.com" className="text-lg text-white hover:text-primary transition-colors">
                        info@topquality-prospect.com
                      </a>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* All addresses */}
              <div className="border-t border-white/10 pt-8 mb-12">
                <h3 className="text-sm font-display font-bold text-white mb-4 uppercase tracking-wider">Locations</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                   <li className="flex items-center gap-3"><FlagMark country="egypt" size="sm" /> Egypt — Headquarters</li>
                   <li className="flex items-center gap-3"><FlagMark country="saudi" size="sm" /> Saudi Arabia</li>
                   <li className="flex items-center gap-3"><FlagMark country="uae" size="sm" /> United Arab Emirates</li>
                </ul>
              </div>

              <div className="border-t border-white/10 pt-8">
                <h3 className="text-sm font-display font-bold text-white mb-6 uppercase tracking-wider">Connect With Us</h3>
                <div className="flex gap-4">
                  <a href="#" className="w-12 h-12 bg-card border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all hover:border-primary">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-card border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all hover:border-primary">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href={`https://wa.me/${office.phoneHref.replace("tel:+", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-card border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-green-600 hover:text-white transition-all hover:border-green-600"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                  <a
                    href="mailto:info@topquality-prospect.com"
                    className="w-12 h-12 bg-card border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all hover:border-primary"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Interactive stylized map */}
            <div className="relative border border-white/10 bg-card overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="font-display font-bold text-white uppercase tracking-wider text-sm">Regional Presence</h3>
                <p className="text-xs text-muted-foreground mt-1">Click a location to view its contact details</p>
              </div>

              <div className="relative min-h-[520px] sm:min-h-[600px] lg:min-h-[660px] bg-[#0b2540] overflow-hidden">
                <img
                  src={regionalMapPath}
                  alt="Regional map showing Egypt, Saudi Arabia, and the United Arab Emirates"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[#061426]/20" aria-hidden="true" />
                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
                  <defs>
                    <marker id="map-route-arrow" markerWidth="4" markerHeight="4" refX="3.5" refY="2" orient="auto">
                      <path d="M0,0 L4,2 L0,4 Z" fill="hsl(210, 100%, 58%)" />
                    </marker>
                  </defs>
                  <path d="M16 41 Q26 52 36 60" fill="none" stroke="hsl(210, 100%, 58%)" strokeWidth="0.7" strokeDasharray="2 1.5" markerEnd="url(#map-route-arrow)" />
                  <path d="M16 41 Q42 30 69 46" fill="none" stroke="hsl(210, 100%, 58%)" strokeWidth="0.7" strokeDasharray="2 1.5" markerEnd="url(#map-route-arrow)" />
                  <circle cx="16" cy="41" r="2.2" fill="none" stroke="hsl(45, 100%, 60%)" strokeWidth="0.6">
                    <animate attributeName="r" values="2.2;4;2.2" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  {(Object.keys(mapPoints) as CountryKey[]).map((key) => {
                    const p = mapPoints[key];
                    return <circle key={key} cx={p.x} cy={p.y} r="1.1" fill="hsl(45, 100%, 60%)" stroke="#fff" strokeWidth="0.4" />;
                  })}
                </svg>

                <div className="absolute left-4 top-4 border border-white/30 bg-[#071426]/75 px-3 py-2 text-[10px] font-display font-bold tracking-[0.18em] text-white/90 uppercase backdrop-blur-sm">
                  Regional coverage · Egypt / KSA / UAE
                </div>

                {(Object.keys(mapPoints) as CountryKey[]).map((key) => {
                  const p = mapPoints[key];
                  const active = selected === key;
                  const label = key === "egypt" ? "EGYPT" : key === "saudi" ? "KSA" : "UAE";
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelected(key)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 rounded-sm p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      style={{ left: `${p.x}%`, top: `${p.y}%` }}
                      aria-label={`View ${offices[key].country} contact details`}
                    >
                      <span className={`transition-transform duration-300 drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)] ${active ? "scale-125" : "hover:scale-110"}`}>
                        <FlagMark country={key} size="lg" />
                      </span>
                      <span className={`px-2 py-1 text-[10px] sm:text-xs font-display font-bold tracking-[0.16em] whitespace-nowrap shadow-lg ${active ? "bg-primary text-white" : "bg-[#071426]/90 text-white border border-white/35"}`}>
                        {label} · {p.city}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected office strip under the map */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selected}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 bg-primary/10 border-t border-primary/30 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-xs font-display font-bold text-primary tracking-widest uppercase mb-1">
                      <span className="inline-flex items-center gap-2">
                        <FlagMark country={selected} size="sm" />
                        {office.country}
                      </span>
                    </div>
                    <div className="text-white font-medium">{office.person}</div>
                  </div>
                  <a
                    href={office.phoneHref}
                    className="bg-primary text-primary-foreground px-5 py-2.5 font-display font-bold tracking-wider text-sm hover:bg-primary/90 transition-colors"
                  >
                    {office.phone}
                  </a>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
