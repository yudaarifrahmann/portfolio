"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

// CUSTOM SVG COMPONENTS
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
  </svg>
);

const GithubIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

const LinkedinIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const WhatsappIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const EmailIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

type Project = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link: string;
};

type Profile = {
  name: string;
  role: string;
  bio: string;
  github_url: string;
  linkedin_url: string;
  whatsapp: string;
  email: string;
};

const fallbackProfile: Profile = {
  name: "Yuda Arif Rahman",
  role: "Web Developer",
  bio: "Web developer yang membangun aplikasi web, dashboard monitoring, dan integrasi IoT untuk kebutuhan operasional. Terbiasa mengerjakan alur data realtime, antarmuka responsif, dan sistem yang mudah digunakan tim.",
  github_url: "https://github.com",
  linkedin_url: "https://linkedin.com",
  whatsapp: "6281234567890",
  email: "yuda@example.com",
};

// Roles rotor options
const ROLES_LIST = [
  "Web Developer",
  "IoT Integrator"
];

export default function Home() {
  const [profile, setProfile] = useState<Profile>(fallbackProfile);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  
  // Scrolled state
  const [scrolled, setScrolled] = useState(false);

  // Rotating roles index
  const [roleIdx, setRoleIdx] = useState(0);

  // Interactive mouse follow state
  const mouseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch data
    async function loadData() {
      try {
        const { data: profileData } = await supabase.from('profile').select('*').single();
        if (profileData) setProfile(profileData);

        const { data: projectsData } = await supabase.from('projects').select('*').order('order', { ascending: true });
        if (projectsData) setProjects(projectsData);
      } catch (err) {
        console.error("Gagal memuat data dari Supabase.", err);
      } finally {
        setTimeout(() => setLoading(false), 900);
      }
    }
    loadData();

    // 2. Track mouse for follow blob
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseRef.current) {
        mouseRef.current.style.left = `${e.clientX}px`;
        mouseRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 3. Track scroll
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    // 4. Scroll Reveal Intersection Observer
    const observerOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-active");
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll(".reveal");
    revealElements.forEach((el) => observer.observe(el));

    // 5. Rotate words/roles interval
    const interval = setInterval(() => {
      setRoleIdx((prev) => (prev + 1) % ROLES_LIST.length);
    }, 2200);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      revealElements.forEach((el) => observer.unobserve(el));
      clearInterval(interval);
    };
  }, [loading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitting(true);
    setSubmitStatus("");

    try {
      const { error } = await supabase.from("messages").insert([form]);
      if (error) throw error;
      setSubmitStatus("Pesan berhasil dikirim! Terima kasih.");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      setSubmitStatus("Gagal mengirim pesan. Silakan coba kembali.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* LOADING ANIMATION */}
      {loading && (
        <div className="loading-overlay">
          <div className="logo-container" style={{ fontSize: "1.75rem" }}>
            <span className="text-gradient">Yuda Arif Rahman</span>
          </div>
          <div className="loading-bar"></div>
        </div>
      )}

      {/* DYNAMIC MOUSE FOLLOWER BLOB */}
      <div ref={mouseRef} className="mouse-follower"></div>

      {/* HEADER NAVBAR (DYNAMIC GLASS ON SCROLL) */}
      <header className={`main-header ${scrolled ? "scrolled" : ""}`}>
        <div className="logo-container">
          <span className="text-gradient">{profile.name}</span>
        </div>
        <nav style={{ display: "flex", gap: "2rem" }}>
          <a href="#about" className="project-btn" style={{ fontSize: "0.95rem" }}>Tentang</a>
          <a href="#work" className="project-btn" style={{ fontSize: "0.95rem" }}>Project</a>
          <a href="#contact" className="project-btn" style={{ fontSize: "0.95rem" }}>Kontak</a>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="hero">
        <h1 className="hero-title reveal d-2">
          Halo, Saya <span className="text-gradient-purple">{profile.name}</span>{" "}
          <span className="hero-role-line">
            Seorang{" "}
            <span className="text-gradient-purple text-rotor">
              <span key={roleIdx} className="text-rotor-span">
                {ROLES_LIST[roleIdx]}
              </span>
            </span>
          </span>
        </h1>
        <p className="hero-desc reveal d-3">
          {profile.bio}
        </p>
        <div className="btn-group reveal d-4">
          <a href="#work" className="btn btn-primary">
            Lihat Project <ArrowRightIcon />
          </a>
          <a href="#contact" className="btn btn-secondary">
            Hubungi Saya
          </a>
        </div>
      </section>

      {/* TENTANG SAYA SECTION */}
      <section id="about" className="section reveal">
        <div className="section-head">
          <span className="section-tag">Overview</span>
          <h2 className="section-title text-gradient">Tentang Saya</h2>
        </div>
        <div className="about-grid">
          <div className="about-card glass reveal d-1">
            <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }} className="text-gradient-purple">Profil Keahlian</h3>
            <p className="about-text">
              Fokus pada aplikasi yang rapi, cepat dipahami, dan kuat untuk dipakai harian. Saya banyak menangani integrasi perangkat, visualisasi data, serta dashboard yang membantu tim membaca kondisi sistem dengan jelas.
            </p>
          </div>
          <div className="about-card glass reveal d-2">
            <p className="about-text">
              {profile.bio}
            </p>
          </div>
        </div>
      </section>

      {/* PORTFOLIO PROJECTS SECTION */}
      <section id="work" className="section reveal">
        <div className="section-head">
          <span className="section-tag">Portofolio</span>
          <h2 className="section-title text-gradient">Project</h2>
        </div>
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div key={project.id} className={`project-card glass reveal d-${(index % 3) + 1}`}>
              <div className="project-thumbnail">
                <img src={project.image_url} alt={project.title} />
              </div>
              <div className="project-body">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc">{project.description}</p>
                <div className="project-footer">
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-btn">
                    Kunjungi Tautan <ExternalLinkIcon />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="section reveal">
        <div className="section-head">
          <span className="section-tag">Hubungi</span>
          <h2 className="section-title text-gradient">Mulai Kolaborasi</h2>
        </div>

        <div className="contact-grid">
          {/* Info Details */}
          <div className="contact-info reveal d-1">
            <div className="contact-info-item">
              <div className="contact-icon-wrapper">
                <EmailIcon size={24} />
              </div>
              <div>
                <span className="contact-label">Email</span>
                <div className="contact-value">{profile.email}</div>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-icon-wrapper">
                <WhatsappIcon size={24} />
              </div>
              <div>
                <span className="contact-label">WhatsApp</span>
                <div className="contact-value">+{profile.whatsapp}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="btn-icon">
                <GithubIcon />
              </a>
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn-icon">
                <LinkedinIcon />
              </a>
            </div>
          </div>

          {/* Form */}
          <form className="contact-form glass reveal d-2" onSubmit={handleFormSubmit}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }} className="text-gradient-purple">Kirim Pesan</h3>
            <div className="form-group">
              <label className="form-label">Nama Anda</label>
              <input type="text" name="name" className="form-input" required value={form.name} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Alamat Email</label>
              <input type="email" name="email" className="form-input" required value={form.email} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Isi Pesan</label>
              <textarea name="message" className="form-textarea" rows={5} required value={form.message} onChange={handleInputChange}></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={submitting}>
              {submitting ? "Mengirim..." : "Kirim Pesan"}
            </button>
            {submitStatus && (
              <p style={{ marginTop: "1.25rem", color: "var(--accent)", fontSize: "0.9rem", fontWeight: "600", textAlign: "center" }}>
                {submitStatus}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--card-border)", padding: "2.5rem 1.5rem", textAlign: "center", fontSize: "0.85rem", color: "rgba(255,255,255,0.3)" }}>
        <p>&copy; {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
      </footer>
    </>
  );
}
