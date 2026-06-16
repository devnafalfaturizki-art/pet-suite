import { Link } from 'react-router-dom';
import { Button, Card, Skeleton, Badge } from '@/components/ui';
import { useActiveServices, useActiveDoctors, useActiveTestimonials, useLatestArticles, useWebsiteContent } from '../../website.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Star, ArrowRight, Heart, Stethoscope, Scissors, Syringe, ShieldCheck, HeartHandshake, Award, Clock, ChevronRight, PawPrint, CalendarCheck, Users, Building2, Quote } from 'lucide-react';
import { SectionContainer } from '@/shared/ui/SectionContainer';

function ImageWithFallback({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-50 text-indigo-300 dark:from-indigo-900/30 dark:to-slate-800 ${className}`}>
        <Heart className="h-8 w-8" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        const target = e.currentTarget;
        target.style.display = 'none';
        const fallback = target.nextElementSibling;
        if (fallback) {
          (fallback as HTMLElement).style.display = 'flex';
        }
      }}
    />
  );
}

function ImageFallback({ className }: { className?: string }) {
  return (
    <div className={`hidden items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-50 text-indigo-300 dark:from-indigo-900/30 dark:to-slate-800 ${className}`}>
      <Heart className="h-8 w-8" />
    </div>
  );
}

export default function HomePage() {
  const { data: contentData = [] } = useWebsiteContent();
  const servicesQuery = useActiveServices();
  const doctorsQuery = useActiveDoctors();
  const testimonialsQuery = useActiveTestimonials();
  const articlesQuery = useLatestArticles();

  useDocumentTitle('Home');

  const heroContent = contentData.find((d: any) => d.section_key === 'hero');
  const heroTitle = heroContent?.content?.title || 'Compassionate Care for Your Beloved Pets';
  const heroSubtitle = heroContent?.content?.subtitle || 'Professional veterinary services with a gentle touch. Your pet\'s health and happiness are our top priorities.';

  return (
    <div>
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-slate-950">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/20 via-transparent to-slate-950" />
        
        <SectionContainer className="relative z-10 py-20 md:py-32">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Left: Text */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300 mb-6">
                <ShieldCheck className="h-4 w-4" />
                Trusted Veterinary Clinic
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
                {heroTitle}
              </h1>
              <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-lg">
                {heroSubtitle}
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link to="/booking" className="btn-primary text-base px-6 py-3">
                  <CalendarCheck className="h-5 w-5" />
                  Book Appointment
                </Link>
                <Link to="/services" className="btn-secondary border-slate-700 text-slate-200 hover:bg-slate-800 text-base px-6 py-3">
                  Our Services
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              {/* Trust indicators */}
              <div className="mt-10 flex items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>500+ Patients</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>10+ Years</span>
                </div>
              </div>
            </div>

            {/* Right: Image grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                  <img
                    src="https://placedog.net/400/300"
                    alt="Happy dog at vet"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                  <img
                    src="https://placekitten.com/400/300"
                    alt="Cat receiving care"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                  <img
                    src="https://placekitten.com/401/301"
                    alt="Happy cat"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                  <img
                    src="https://placedog.net/401/301"
                    alt="Dog playing"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </SectionContainer>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="border-y border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900">
        <SectionContainer className="py-8 md:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Happy Patients', icon: Heart },
              { value: '10+', label: 'Expert Doctors', icon: Users },
              { value: '15+', label: 'Services', icon: Stethoscope },
              { value: '4.9', label: 'Average Rating', icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <stat.icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </SectionContainer>
      </section>

      {/* ===== SERVICES SECTION ===== */}
      {servicesQuery.data && servicesQuery.data.length > 0 && (
        <section className="section-padding bg-slate-50 dark:bg-slate-950/50">
          <SectionContainer>
            <div className="text-center mb-12">
              <Badge variant="indigo" className="mb-4">Our Services</Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Comprehensive Pet Care
              </h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                From routine checkups to specialized treatments, we offer a full range of veterinary services.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {servicesQuery.isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                  ))
                : servicesQuery.data.map((svc: any) => (
                    <div key={svc.id} className="card-premium p-6 group cursor-pointer">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-200">
                        <Stethoscope className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{svc.name}</h3>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{svc.description}</p>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{formatCurrency(svc.price)}</span>
                        <span className="text-slate-400 dark:text-slate-500">{svc.duration_minutes} min</span>
                      </div>
                    </div>
                  ))}
            </div>
          </SectionContainer>
        </section>
      )}

      {/* ===== WHY US SECTION ===== */}
      <section className="section-padding bg-white dark:bg-slate-900">
        <SectionContainer>
          <div className="text-center mb-12">
            <Badge variant="emerald" className="mb-4">Why Choose Us</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Dedicated to Your Pet's Wellbeing
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              We combine professional expertise with genuine compassion for every animal in our care.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: HeartHandshake, title: 'Compassionate Care', desc: 'Every pet is treated with the love and attention they deserve, as if they were our own.' },
              { icon: Award, title: 'Expert Team', desc: 'Our veterinarians bring years of specialized experience and continuous education to every case.' },
              { icon: Clock, title: 'Always Available', desc: 'Open 7 days a week with extended hours to accommodate your busy schedule.' },
            ].map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 mb-5">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </SectionContainer>
      </section>

      {/* ===== DOCTORS SECTION ===== */}
      {doctorsQuery.data && doctorsQuery.data.length > 0 && (
        <section className="section-padding bg-slate-50 dark:bg-slate-950/50">
          <SectionContainer>
            <div className="text-center mb-12">
              <Badge variant="blue" className="mb-4">Our Team</Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Meet Our Veterinarians
              </h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                Experienced professionals dedicated to providing the highest standard of veterinary care.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {doctorsQuery.isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                  ))
                : doctorsQuery.data.map((doc: any) => (
                    <div key={doc.id} className="card-premium p-6 text-center group">
                      <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full ring-4 ring-indigo-100 dark:ring-indigo-900/30">
                        {doc.photo_url ? (
                          <img src={doc.photo_url} alt={doc.full_name} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-600 text-2xl font-bold text-white">
                            {doc.full_name?.charAt(0)?.toUpperCase() || 'D'}
                          </div>
                        )}
                      </div>
                      <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">{doc.full_name}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{doc.specialization}</p>
                    </div>
                  ))}
            </div>
          </SectionContainer>
        </section>
      )}

      {/* ===== TESTIMONIALS SECTION ===== */}
      {testimonialsQuery.data && testimonialsQuery.data.length > 0 && (
        <section className="section-padding bg-white dark:bg-slate-900">
          <SectionContainer>
            <div className="text-center mb-12">
              <Badge variant="emerald" className="mb-4">Testimonials</Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                What Pet Parents Say
              </h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                Real stories from pet owners who trust us with their companions' health.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonialsQuery.isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                  ))
                : testimonialsQuery.data.map((t: any) => (
                    <div key={t.id} className="card-premium p-6 relative">
                      <Quote className="absolute top-4 right-4 h-8 w-8 text-indigo-100 dark:text-indigo-900/30" />
                      <div className="flex gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">&ldquo;{t.content}&rdquo;</p>
                      <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">&mdash; {t.customer_name}</p>
                    </div>
                  ))}
            </div>
          </SectionContainer>
        </section>
      )}

      {/* ===== ARTICLES SECTION ===== */}
      {articlesQuery.data && articlesQuery.data.length > 0 && (
        <section className="section-padding bg-slate-50 dark:bg-slate-950/50">
          <SectionContainer>
            <div className="text-center mb-12">
              <Badge variant="blue" className="mb-4">Articles</Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Latest Pet Care Tips
              </h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                Expert advice and insights to help you keep your pet healthy and happy.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {articlesQuery.isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                  ))
                : articlesQuery.data.map((a: any) => (
                    <div key={a.id} className="card-premium overflow-hidden group">
                      <div className="aspect-[16/9] overflow-hidden">
                        {a.cover_url ? (
                          <img src={a.cover_url} alt={a.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-50 text-indigo-300 dark:from-indigo-900/30 dark:to-slate-800">
                            <Heart className="h-10 w-10" />
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {a.title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {a.excerpt?.length > 120 ? `${a.excerpt.slice(0, 120)}...` : a.excerpt}
                        </p>
                        <Link to={`/articles/${a.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                          Read More <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
            </div>
          </SectionContainer>
        </section>
      )}

      {/* ===== CTA SECTION ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-800 py-20">
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
        <SectionContainer className="relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Ready to Give Your Pet the Best Care?
            </h2>
            <p className="mt-4 text-lg text-indigo-100 leading-relaxed">
              Schedule an appointment today and experience the PetCare Suite difference.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/booking" className="btn-primary bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg text-base px-6 py-3">
                <CalendarCheck className="h-5 w-5" />
                Book Appointment
              </Link>
              <Link to="/contact" className="btn-secondary border-indigo-300 text-white hover:bg-white/10 text-base px-6 py-3">
                Contact Us
              </Link>
            </div>
          </div>
        </SectionContainer>
      </section>
    </div>
  );
}