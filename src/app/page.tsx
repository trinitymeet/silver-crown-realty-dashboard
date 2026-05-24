"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { MapPin, ArrowRight, ShieldCheck, Phone, CheckCircle2, ChevronRight, Maximize2, Building, Leaf, Lock, Star } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.8, 0.25, 1] } }
} as const;
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
} as const;

export default function GlobalEstateHome() {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  
  // Custom Cursor
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen bg-navy text-ivory overflow-hidden uppercase tracking-wider selection:bg-gold/30 selection:text-white">
      
      {/* Custom Cursor Ring */}
      <motion.div 
        className="fixed top-0 left-0 w-8 h-8 border border-gold/50 rounded-full pointer-events-none z-[100] mix-blend-screen transition-transform duration-100 ease-out flex justify-center items-center backdrop-blur-sm"
        animate={{ 
          x: mousePosition.x - 16, 
          y: mousePosition.y - 16,
          scale: isHovered ? 1.8 : 1,
          borderColor: isHovered ? 'rgba(211, 142, 112, 1)' : 'rgba(211, 142, 112, 0.4)'
        }}
      >
        <div className="w-1 h-1 bg-gold rounded-full" />
      </motion.div>

      {/* Cinematic Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-gold/10 rounded-full blur-[120px]" />
      </div>

      {/* Top Banner for Internal Portals */}
      <div className="w-full bg-[#08150F] border-b border-white/5 text-[10px] text-zinc-400 py-2.5 px-6 font-semibold flex flex-wrap gap-2 items-center justify-between relative z-[60]">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-700 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded">PORTAL</span>
          <span>FieldSync Construction Execution is active.</span>
        </div>
        <div className="flex gap-4">
          <a href="/mobile" className="text-white hover:text-gold transition-colors font-bold flex items-center gap-1">
            📱 Launch Mobile App &rarr;
          </a>
          <span className="text-white/10">|</span>
          <a href="/dashboard" className="text-emerald-450 hover:text-emerald-350 transition-colors font-bold flex items-center gap-1 font-mono">
            📊 Silver Crown Realty &rarr;
          </a>
        </div>
      </div>

      {/* Header */}
      <header className="fixed w-full top-0 z-50 border-b border-white/5 backdrop-blur-lg bg-navy/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-xs">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-lg md:text-2xl font-bold tracking-widest text-white cursor-pointer flex items-center gap-2" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
              {/* Modern building tower logo */}
              <svg className="w-6 h-6 text-gold shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 22V2H11V22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M11 6H15V22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                <path d="M15 11H19V22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
              </svg>
              SILVER <span className="text-gold font-normal">CROWN REALTY</span>
            </h1>
          </div>
          <div className="hidden md:flex gap-12 items-center">
            <nav className="flex gap-8 text-[10px] text-white/60">
              <a href="/mobile" className="text-gold font-bold hover:text-white transition-colors">📱 FieldSync Mobile</a>
              <a href="/dashboard" className="text-emerald-450 font-bold hover:text-white transition-colors">📊 Silver Crown Realty</a>
              <a href="#" className="hover:text-gold transition-colors">Portfolio</a>
              <a href="#" className="hover:text-gold transition-colors">Exclusives</a>
              <a href="#" className="hover:text-gold transition-colors">Advisors</a>
            </nav>
            <div className="flex flex-col text-right border-l border-white/10 pl-6">
              <span className="text-[9px] text-white/40 flex items-center justify-end gap-1">
                <ShieldCheck size={10} className="text-gold/80" />
                RERA Compliant
              </span>
              <span className="text-[10px] font-medium text-gold/80 mt-1">A52100012345</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 min-h-[100vh] flex items-center z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <motion.div className="lg:col-span-6 z-10" initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={fadeUp} className="pl-6 mb-8 border-l-2 border-gold/60">
              <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.1] text-white tracking-tight normal-case">
                Weightless Design.<br />
                <span className="text-gold italic font-light">Weighty Credibility.</span>
              </h2>
            </motion.div>
            <motion.p variants={fadeUp} className="text-sm text-ivory/60 mb-10 max-w-lg leading-relaxed font-light tracking-widest normal-case">
              The central nerve center for India’s premium real estate and infrastructure contracts. Monitor project execution, materials supply logs, and client running bills with biophilic clarity.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-6">
              <a 
                href="/dashboard"
                onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
                className="bg-gold text-[#091B11] font-semibold px-8 py-4 text-[10px] tracking-widest uppercase hover:bg-white transition-colors flex items-center gap-3 group"
              >
                Launch ERP Console
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="/mobile"
                onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
                className="border border-white/20 text-white px-8 py-4 text-[10px] tracking-widest uppercase hover:border-gold/60 transition-colors flex items-center gap-3"
              >
                📱 Supervisor Mobile
              </a>
            </motion.div>
          </motion.div>

          {/* Floating Hero Gallery */}
          <div className="hidden lg:block lg:col-span-6 relative h-[600px] perspective-1000">
            <motion.div 
              style={{ y: yHero }}
              className="absolute top-10 right-0 w-[400px] z-20 backdrop-blur-xl bg-[#1A1F2C]/40 border border-white/10 p-4 shadow-2xl"
              initial={{ opacity: 0, x: 50, rotateY: -15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
            >
              <div className="h-60 overflow-hidden relative border border-white/5 group">
                <img 
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                  alt="Altamount Tower" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent opacity-90"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="text-[8px] bg-gold text-[#091B11] px-2 py-1 font-bold tracking-widest uppercase mb-3 inline-block">Active Contract</span>
                  <h3 className="font-serif text-2xl text-white normal-case">Altamount Tower</h3>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4 text-[10px]">
                <span className="text-gold font-medium tracking-widest">₹45.0 CR CONTRACT</span>
                <span className="text-white/40 uppercase tracking-widest flex items-center gap-1"><MapPin size={10}/> Altamount Rd</span>
              </div>
            </motion.div>

            <motion.div 
              className="absolute bottom-0 left-10 w-[300px] z-10 backdrop-blur-xl bg-[#1A1F2C]/20 border border-white/5 p-3 shadow-2xl"
              initial={{ opacity: 0, x: -30, y: 50 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
            >
              <div className="h-40 overflow-hidden relative group border border-white/5">
                <img 
                    src="https://images.unsplash.com/photo-1600607687931-cebf0746f366?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Worli Sea Face Phase-2" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out opacity-80"
                  />
              </div>
              <h3 className="font-serif text-lg text-white/90 mt-3 normal-case">Worli Sea Face Ph-2</h3>
              <p className="text-[9px] text-ivory/40 mt-1 uppercase tracking-widest">Worli Sea Face • Duplex</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Advanced Credibility Stripe */}
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
        className="border-y border-white/5 bg-[#050811] py-12 relative z-10"
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
          {[
            { metric: "₹500Cr+", label: "Capital Deployed" },
            { metric: "1,000+", label: "HNIs Advised" },
            { metric: "ISO9001", label: "Certified Audit" },
            { metric: "15+", label: "Tier-1 Developers" }
          ].map((item, i) => (
            <motion.div key={i} variants={fadeUp} className="group">
              <h4 className="font-serif text-3xl md:text-4xl text-white mb-3 group-hover:text-gold transition-colors">{item.metric}</h4>
              <p className="text-[9px] tracking-[0.2em] uppercase text-white/30">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Infinite Trust Wall */}
      <section className="py-24 overflow-hidden relative border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
          <p className="text-[9px] text-gold uppercase tracking-[0.4em] font-medium mb-3">Our Syndicate</p>
          <h3 className="font-serif text-3xl text-white tracking-wide normal-case">Authorized Partners of India's Elite</h3>
        </div>

        <div className="relative w-full overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'}}>
          <motion.div 
            animate={{ x: ["0%", "-50%"] }} 
            transition={{ ease: "linear", duration: 35, repeat: Infinity }}
            className="flex w-[200%] items-center"
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex justify-around items-center w-1/2 flex-shrink-0 px-8 gap-20 grayscale opacity-30 hover:grayscale-0 transition-all duration-[2s]">
                <h2 className="font-serif text-3xl font-bold text-white tracking-wider">LODHA</h2>
                <h2 className="font-sans text-2xl font-light tracking-[0.4em] text-white">GODREJ</h2>
                <h2 className="font-serif text-3xl font-medium text-white tracking-widest uppercase">Oberoi</h2>
                <h2 className="font-sans text-3xl font-normal tracking-tight text-white hover:text-gold transition-colors">Runwal</h2>
                <h2 className="font-serif text-3xl italic text-white/90">Hiranandani</h2>
                <h2 className="font-sans text-2xl font-bold text-white uppercase tracking-[0.3em]">Piramal</h2>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Cinematic Greentown Masterpiece Section */}
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
        className="py-32 bg-[#0B132B] relative z-10"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={fadeUp} className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <p className="text-[9px] text-gold uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                <Leaf size={10} /> Signature Pre-Launch
              </p>
              <h3 className="font-serif text-4xl md:text-5xl text-white tracking-wide normal-case">Greentown Residences</h3>
              <p className="text-sm text-white/40 mt-4 max-w-xl font-light leading-relaxed normal-case tracking-widest">
                A sanctuary above the skyline. Engineered with biophilic principles, featuring zero-carbon architecture and 270-degree panoramic ocean views. Strictly by invitation.
              </p>
            </div>
            <button className="text-[9px] tracking-[0.3em] uppercase text-white hover:text-gold transition-colors flex items-center gap-2 border-b border-white/20 hover:border-gold pb-2">
              Explore Masterplan <ChevronRight size={10} />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-4 h-[900px] md:h-[700px]">
             {/* Feature Video/Img - Spans 8 cols, 2 rows */}
            <motion.div variants={fadeUp} className="md:col-span-8 md:row-span-2 relative group overflow-hidden bg-black/50 border border-white/5 cursor-crosshair">
              <img 
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1800&q=80" 
                alt="Greentown Exterior" 
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-[2s] ease-out opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/20 to-transparent opacity-90"></div>
              <div className="absolute bottom-10 left-10 text-left">
                <h4 className="font-serif text-3xl text-white mb-2 normal-case">The Botanical Tower</h4>
                <p className="text-[10px] text-gold tracking-[0.3em] uppercase">65 Levels • 3 Acres Landscaping</p>
              </div>
            </motion.div>

            {/* Top Right */}
            <motion.div variants={fadeUp} className="md:col-span-4 relative group overflow-hidden bg-black/50 border border-white/5">
              <img 
                src="https://images.unsplash.com/photo-1600607688969-a5bfcd64bd40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Interiors" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out opacity-60"
              />
              <div className="absolute text-center inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-[#050811] to-transparent">
                <h4 className="font-serif text-xl text-white normal-case">Bespoke Volumes</h4>
                <p className="text-[8px] text-white/50 tracking-[0.3em] uppercase mt-2">12ft Ceiling Heights</p>
              </div>
            </motion.div>

            {/* Bottom Right */}
            <motion.div variants={fadeUp} className="md:col-span-4 relative group overflow-hidden bg-black/50 border border-white/5">
              <img 
                src="https://images.unsplash.com/photo-1542314831-c53cd3b82741?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Club" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out opacity-60 filter sepia-[0.3]"
              />
              <div className="absolute text-center inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-[#050811] to-transparent">
                <h4 className="font-serif text-xl text-white normal-case">The Core Club</h4>
                <p className="text-[8px] text-white/50 tracking-[0.3em] uppercase mt-2">25,000 Sq.Ft Club</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* NEW: Trusted Advisors Team Section */}
      <motion.section 
         initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
         className="py-32 relative border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-20">
            <p className="text-[9px] text-gold uppercase tracking-[0.4em] mb-4">Elite Division</p>
            <h3 className="font-serif text-4xl text-white tracking-wide normal-case drop-shadow-2xl">Your Trusted Advisors</h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[ 
              { name: "Rajiv Menon", focus: "South Mumbai Exclusives", exp: "18+ Years Expert", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
              { name: "Ananya Desai", focus: "Corporate Relocations", exp: "12+ Years Expert", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
              { name: "Vikram Chauhan", focus: "NRI Investment Desk", exp: "15+ Years Expert", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
            ].map((agent, index) => (
               <motion.div key={index} variants={fadeUp} className="group relative">
                  <div className="h-[400px] overflow-hidden border border-white/10 bg-black/30 mb-6 grayscale group-hover:grayscale-0 transition-all duration-[1s]">
                    <img src={agent.img} alt={agent.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s] opacity-70" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-serif text-2xl text-white mb-1 normal-case">{agent.name}</h4>
                    <p className="text-[10px] text-gold tracking-[0.2em] mb-2">{agent.focus}</p>
                    <p className="text-[9px] text-white/30 tracking-widest">{agent.exp}</p>
                  </div>
               </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* NEW: Secure Inquiry / Footer Form */}
      <section className="py-24 bg-[#050811] relative border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
           <Lock size={20} className="text-gold mx-auto mb-6 opacity-60" />
           <h3 className="font-serif text-3xl md:text-4xl text-white mb-4 normal-case">Direct Channel to Inventory</h3>
           <p className="text-xs text-white/40 tracking-widest leading-relaxed mb-12 normal-case font-light">
             Our data rooms are strictly confidential. Submit your preliminary requirements below for a curated dossier of off-market assets.
           </p>

           <form className="space-y-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] text-white/50 tracking-[0.2em] uppercase ml-1">Full Name</label>
                  <input type="text" className="w-full bg-transparent border-b border-white/20 focus:border-gold py-3 text-sm text-white focus:outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] text-white/50 tracking-[0.2em] uppercase ml-1">Contact Matrix</label>
                  <input type="text" className="w-full bg-transparent border-b border-white/20 focus:border-gold py-3 text-sm text-white focus:outline-none transition-colors" />
                </div>
              </div>
              <div className="space-y-2 mt-6">
                  <label className="text-[9px] text-white/50 tracking-[0.2em] uppercase ml-1">Target Capital (₹)</label>
                  <select className="w-full bg-transparent border-b border-white/20 focus:border-gold py-3 text-sm text-white focus:outline-none transition-colors appearance-none cursor-pointer">
                    <option className="bg-navy">₹10 Cr - ₹25 Cr</option>
                    <option className="bg-navy">₹25 Cr - ₹50 Cr</option>
                    <option className="bg-navy">₹50 Cr +</option>
                  </select>
              </div>
              <button className="w-full mt-10 bg-white hover:bg-gold text-[#091B11] font-bold tracking-[0.3em] uppercase py-5 text-[10px] transition-colors duration-500">
                Submit Portal Request
              </button>
           </form>
        </div>
      </section>

      {/* Deep Footer */}
      <footer className="border-t border-gold/10 py-12 bg-[#02040a] text-center relative z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-left gap-6">
          <div className="text-center md:text-left">
            <h2 className="font-serif text-xl text-white mb-2">SILVER CROWN REALTY</h2>
            <p className="text-[9px] text-white/30 uppercase tracking-[0.3em]">Corporate Escrow • RERA Legalized • Transparent</p>
          </div>
          <p className="text-[8px] text-white/20 uppercase tracking-[0.4em]">
            © {new Date().getFullYear()} Silver Crown Realty. BKC HQ, Mumbai. All Rights Reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
