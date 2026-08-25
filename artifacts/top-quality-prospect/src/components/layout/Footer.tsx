import { Link } from "wouter";
import { Mail, Phone, MapPin, Linkedin, Twitter, MessageCircle } from "lucide-react";
import logoPath from "@assets/1.png";

export function Footer() {
  return (
    <footer className="bg-background border-t border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <img src={logoPath} alt="Top Quality Prospect" className="h-32 w-auto" data-testid="img-footer-logo" />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Precision industrial inspection and NDT services across Egypt, Saudi Arabia, and the United Arab Emirates. Authoritative, technical, and dependable.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-display font-bold text-foreground mb-6 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">Our Services</Link></li>
              <li><Link href="/ndt" className="text-sm text-muted-foreground hover:text-primary transition-colors">NDT Methods</Link></li>
              <li><Link href="/certificates" className="text-sm text-muted-foreground hover:text-primary transition-colors">Verify Certificate</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-display font-bold text-foreground mb-6 uppercase tracking-wider">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>🇪🇬 Egypt (HQ) · 🇸🇦 Saudi Arabia · 🇦🇪 UAE</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>
                  Egypt: Mohamed Refaat — +20 10 00780475<br />
                  Saudi Arabia: Ahmed Sedek — +971-543394096<br />
                  UAE: Mustafa Riad — +966 50 844 6103
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>info@topquality-prospect.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-display font-bold text-foreground mb-6 uppercase tracking-wider">Connect</h3>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-none bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all border border-white/10">
                <Linkedin size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-none bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all border border-white/10">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-none bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all border border-white/10">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Top Quality Prospect. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
