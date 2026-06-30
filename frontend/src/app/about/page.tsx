'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Award, Truck, ShieldCheck, Users, Star, MapPin, Phone, Clock,
  ChevronRight, Paintbrush, Wrench, Droplets, Zap, ArrowRight,
  CheckCircle2, Heart, Target, TrendingUp
} from 'lucide-react';

import { useSettings } from '../context/SettingsContext';

function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true);
    }
  }, [startOnView]);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted, startOnView]);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [hasStarted, end, duration]);

  return { count, ref };
}

export default function AboutUsPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stat1 = useCountUp(30, 2000);
  const stat2 = useCountUp(15000, 2500);
  const stat3 = useCountUp(500, 2000);
  const stat4 = useCountUp(98, 2000);

  const values = [
    {
      icon: <Award className="w-8 h-8" />,
      title: "Artisanat d'Exception",
      description: "Nous sélectionnons les matériaux et émaux les plus nobles pour une expérience décorative inégalée.",
      gradient: 'from-lime-400 to-emerald-600',
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: 'Qualité Maximale',
      description: "Émaux naturels, cuisson traditionnelle et finitions soignées sur toutes nos créations premium.",
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Service Restauration',
      description: "Notre atelier certifié s'occupe de la restauration et de l'entretien pour préserver la beauté de vos Zelliges.",
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Livraison Nationale',
      description: "Livraison express de vos carreaux prêts à poser partout au Maroc, avec kit d'installation offert.",
      gradient: 'from-rose-500 to-pink-600',
    },
  ];

  const timeline = [
    { year: '1920', title: 'Les Racines', desc: "Héritage de l'artisanat marocain : transmission du savoir-faire ancestral du Zellige de père en fils." },
    { year: '1980', title: 'Renaissance', desc: "Redécouverte et modernisation des techniques traditionnelles de fabrication des carreaux de Zellige." },
    { year: '2010', title: 'Expansion', desc: "Ouverture de notre showroom à Marrakech et exportation de nos créations à l'international." },
    { year: '2026', title: "L'Excellence", desc: "Référence nationale avec +1000 motifs, service premium et engagement pour la préservation de l'artisanat." },
  ];

  const categories = [
    { icon: <Zap className="w-6 h-6" />, name: 'Zelliges', count: '120+' },
    { icon: <Wrench className="w-6 h-6" />, name: 'Accessoires', count: '450+' },
    { icon: <ShieldCheck className="w-6 h-6" />, name: 'Finition', count: '80+' },
    { icon: <Clock className="w-6 h-6" />, name: 'Carreaux', count: '900+' },
  ];

  const { settings } = useSettings();

  const rawAddress = settings?.address || "Gueliz, Marrakech, Maroc";
  const addressParts = rawAddress.split(',');
  const addr1 = addressParts[0].trim();
  const addr2 = addressParts.slice(1).join(',').trim();

  return (
        <div className="flex-1 flex flex-col bg-canvas">

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative h-[620px] overflow-hidden">
        {/* Parallax background */}
        <div
          className="absolute inset-0 scale-110"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <Image
            src="http://localhost:3002/uploads/zelijworker2.jpg"
            alt="Zelij Maroc — Zellige artisanal premium"
            fill
            className="object-cover"
            priority
          />
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-canvas z-10" />

        {/* Content */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-10 backdrop-blur-md border border-primary/20 text-primary text-sm font-black mb-8 animate-fade-in uppercase tracking-widest">
            <Star className="w-4 h-4 fill-current" />
            L'ARTISANAT MAROCAIN DEPUIS 1920
          </div>
          <h1 className="text-white text-5xl md:text-7xl font-black mb-6 tracking-tight leading-[1.1] max-w-4xl italic uppercase">
            À Propos de
            <span className="block text-primary">
              Zelij Maroc
            </span>
          </h1>
          <p className="text-white/60 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mb-10 italic">
            Plus qu'un carreau — une révolution pour votre décoration
            alliant tradition marocaine, design premium et qualité artisanale.
          </p>
          <div className="flex gap-4">
            <Link
              href="/produits"
              className="group flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-black text-[13px] uppercase tracking-wider hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:-translate-y-1"
            >
              Voir la collection
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 bg-gray-50 backdrop-blur-md border border-border text-charcoal px-8 py-4 rounded-xl font-black text-[13px] uppercase tracking-wider hover:bg-gray-100 transition-all"
            >
              Nous contacter
            </Link>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 46.7C840 53.3 960 66.7 1080 70C1200 73.3 1320 66.7 1380 63.3L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="var(--color-canvas)" />
          </svg>
        </div>
      </section>

      {/* ═══════════ STATS BANNER ═══════════ */}
      <section className="relative -mt-2 z-30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { ref: stat1.ref, count: stat1.count, suffix: '+', label: "Motifs d'Exception", icon: <Zap className="w-5 h-5" /> },
              { ref: stat2.ref, count: stat2.count.toLocaleString(), suffix: '+', label: 'Mètres Carrés', icon: <TrendingUp className="w-5 h-5" /> },
              { ref: stat3.ref, count: stat3.count, suffix: '+', label: 'Clients Convaincus', icon: <Users className="w-5 h-5" /> },
              { ref: stat4.ref, count: stat4.count, suffix: '%', label: 'Artisans Qualifiés', icon: <Droplets className="w-5 h-5" /> },
            ].map((stat, i) => (
              <div
                key={i}
                ref={stat.ref}
                className="bg-white rounded-2xl p-6 shadow-2xl border border-border text-center hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-10 text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-black text-charcoal mb-1">
                  {stat.count}{stat.suffix}
                </div>
                <div className="text-[10px] text-charcoal-muted font-black uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ OUR STORY ═══════════ */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-10 text-primary text-xs font-black uppercase tracking-widest mb-6 border border-primary/20">
                <CheckCircle2 className="w-4 h-4" />
                Notre Vision
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-charcoal mb-6 leading-tight italic uppercase">
                Redéfinir la <span className="text-primary">décoration</span>
              </h2>
              <div className="space-y-5 text-charcoal-muted text-[16px] leading-relaxed italic font-medium">
                <p>
                  Née d'une passion pour l'artisanat marocain, Zelij s'est donnée
                  pour mission d'offrir une alternative crédible, raffinée et authentique
                  aux revêtements industriels.
                </p>
                <p>
                  Ce qui a commencé comme une passion pour l'art traditionnel est devenu aujourd'hui
                  le premier showroom dédié exclusivement aux Zelliges haut de gamme
                  et à la décoration intérieure raffinée.
                </p>
                <p>
                  Notre philosophie : <strong>Authenticité, Qualité et Élégance</strong>.
                  Chaque carreau est façonné à la main selon les techniques ancestrales avant d'être proposé.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {categories.map((cat, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-border text-charcoal-soft text-xs font-black uppercase tracking-widest hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-default">
                    <span className="text-primary">{cat.icon}</span>
                    {cat.name}
                    <span className="text-charcoal-soft text-[10px]">({cat.count})</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-[48px] overflow-hidden shadow-2xl border border-border bg-white">
                <Image
                  src="http://localhost:3002/uploads/zelijworker3.jpg"
                  alt="Détail artisanal Zellige Zelij Maroc"
                  width={600}
                  height={500}
                  className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-black rounded-2xl p-5 shadow-2xl border border-border max-w-[220px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-white uppercase tracking-widest">Artisans d'Art</div>
                    <div className="text-[10px] text-charcoal-muted uppercase font-bold">Savoir-faire</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ VALUES ═══════════ */}
      <section className="py-24 bg-[#0D0D0D]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-10 text-primary text-xs font-black uppercase tracking-widest mb-4 border border-primary/20">
              <Heart className="w-4 h-4" />
              L'ADN Zelij
            </div>
            <h2 className="text-4xl font-black text-white mb-4 italic uppercase">
              Nos Piliers d'<span className="text-primary">Excellence</span>
            </h2>
            <p className="text-charcoal-muted max-w-xl mx-auto text-lg italic font-medium">
              Nous ne vendons pas juste des carreaux, nous perpétuons l'art du Zellige marocain.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <div
                key={i}
                className="group bg-white rounded-[32px] p-8 shadow-2xl border border-border hover:border-primary/30 hover:-translate-y-2 transition-all duration-300 cursor-default"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-black text-charcoal mb-3 italic uppercase">{value.title}</h3>
                <p className="text-charcoal-muted text-[15px] leading-relaxed italic font-medium">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TIMELINE ═══════════ */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-10 text-primary text-xs font-black uppercase tracking-widest mb-4 border border-primary/20">
              <Clock className="w-4 h-4" />
              L'Évolution
            </div>
            <h2 className="text-4xl font-black text-charcoal mb-4 italic uppercase">
              Notre Héritage <span className="text-primary">Zelij</span>
            </h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-primary/30 to-canvas-alt hidden md:block" />

            <div className="space-y-12 md:space-y-0">
              {timeline.map((item, i) => (
                <div key={i} className={`relative flex items-center md:mb-16 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Content side */}
                  <div className={`w-full md:w-[calc(50%-40px)] ${i % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'}`}>
                    <div className="bg-white rounded-2xl p-6 shadow-2xl border border-border hover:border-border transition-shadow">
                      <span className="inline-block text-primary text-xs font-black mb-2 bg-primary-10 px-3 py-1 rounded-full uppercase tracking-tighter">{item.year}</span>
                      <h3 className="text-xl font-black text-charcoal mb-2 italic uppercase">{item.title}</h3>
                      <p className="text-charcoal-muted text-[15px] font-medium italic">{item.desc}</p>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary border-4 border-black shadow-2xl flex items-center justify-center hidden md:flex z-10">
                    <div className="w-2 h-2 rounded-full bg-black" />
                  </div>

                  {/* Empty side */}
                  <div className="hidden md:block w-[calc(50%-40px)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ DELIVERY / SERVICES ═══════════ */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative rounded-[48px] overflow-hidden shadow-2xl border border-border">
              <Image
                src="http://localhost:3002/uploads/zelijworker1.jpg"
                alt="Support client et service Zelij"
                width={600}
                height={450}
                className="w-full h-[450px] object-cover"
              />
              {/* Floating badge */}
              <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md rounded-xl px-4 py-3 border border-border">
                <div className="text-white font-black text-lg uppercase italic">Livraison Express</div>
                <div className="text-primary text-[10px] font-black uppercase tracking-widest">Partout au Maroc</div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-10 text-primary text-xs font-black uppercase tracking-widest mb-6 border border-primary/20">
                <Truck className="w-4 h-4" />
                Notre Service
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight italic uppercase">
                Un service <span className="text-primary">d'Exception</span>
              </h2>
              <p className="text-charcoal-muted text-lg mb-8 leading-relaxed italic font-medium">
                De la sélection à la pose, nous sommes à vos côtés pour garantir
                que votre projet reste toujours une réussite.
              </p>
              <div className="space-y-4">
                {[
                  'Expédition sécurisée sous 48h max',
                  'Atelier de restauration certifié Zelij',
                  'Conseils personnalisés via WhatsApp 7j/7',
                  'Garantie premium 2 ans',
                  'Consultation gratuite en showroom à Marrakech',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-white/80">
                    <div className="w-6 h-6 rounded-full bg-primary-10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-[15px] font-medium italic">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/contact"
                className="mt-10 inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-black text-[13px] uppercase tracking-wider hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:-translate-y-1 group"
              >
                Nous contacter
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ LOCATION / CONTACT ═══════════ */}
      <section className="py-24 bg-canvas">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-10 text-primary text-xs font-black uppercase tracking-widest mb-4 border border-primary/20">
              <MapPin className="w-4 h-4" />
              Showroom
            </div>
            <h2 className="text-4xl font-black text-charcoal mb-4 italic uppercase">
              Rendez-nous <span className="text-primary">visite</span>
            </h2>
            <p className="text-charcoal-muted max-w-xl mx-auto text-lg italic font-medium">
              Venez découvrir nos collections dans notre showroom de Marrakech.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-[32px] p-8 shadow-2xl border border-border hover:border-border transition-all text-center group">
              <div className="w-14 h-14 rounded-2xl bg-primary-10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-charcoal mb-2 italic uppercase">Adresse</h3>
              <p className="text-charcoal-muted font-medium italic">{addr1} <br />{addr2}</p>
            </div>
            <div className="bg-white rounded-[32px] p-8 shadow-2xl border border-border hover:border-border transition-all text-center group">
              <div className="w-14 h-14 rounded-2xl bg-primary-10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                <Phone className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-charcoal mb-2 italic uppercase">WhatsApp</h3>
              <p className="text-charcoal-muted font-medium italic">{settings?.phoneNumber || "+212 6 00 00 00 00"}</p>
            </div>
            <div className="bg-white rounded-[32px] p-8 shadow-2xl border border-border hover:border-border transition-all text-center group">
              <div className="w-14 h-14 rounded-2xl bg-primary-10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-charcoal mb-2 italic uppercase">Horaires</h3>
              <div className="text-charcoal-muted font-medium italic">
                {settings?.workingHours ? (
                  settings.workingHours.split('\n').map((line, idx) => (
                    <p key={idx} className="mb-1">{line.trim()}</p>
                  ))
                ) : (
                  <>
                    <p className="mb-1">Lun – Sam : 9h00 – 20h00</p>
                    <p>Dimanche : Fermé</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-20 bg-primary relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-white/5" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-white text-4xl md:text-5xl font-black mb-6 leading-tight italic uppercase">
            Embellissez votre intérieur dès aujourd'hui
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto font-black uppercase tracking-tighter">
            Explorez notre sélection premium et bénéficiez de l'expertise Zelij
            pour choisir le carreau de vos rêves.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/produits"
              className="group inline-flex items-center justify-center gap-2 bg-black text-white px-10 py-4 rounded-xl font-black text-[14px] uppercase tracking-wider hover:bg-black/80 transition-all shadow-xl hover:-translate-y-1"
            >
              Explorer le store
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white/40 text-white px-10 py-4 rounded-xl font-black text-[14px] uppercase tracking-wider hover:bg-white/5 transition-all"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
