"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Custom Icons
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const FolderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
  </svg>
);

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5v14"/>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
  </svg>
);

export default function Dashboard() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<"profile" | "projects" | "messages">("profile");
  const [profile, setProfile] = useState({ name: "", role: "", bio: "", github_url: "", linkedin_url: "", whatsapp: "", email: "" });
  const [projects, setProjects] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // Check existing session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session) {
        fetchDashboardData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchDashboardData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSession(data.session);
    } catch (err: any) {
      setLoginError(err.message || "Gagal masuk. Periksa email & password Anda.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      const { data: profileData } = await supabase.from('profile').select('*').single();
      if (profileData) setProfile(profileData);

      const { data: projectsData } = await supabase.from('projects').select('*').order('order', { ascending: true });
      if (projectsData) setProjects(projectsData);

      const { data: messagesData } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
      if (messagesData) setMessages(messagesData);
    } catch (err) {
      console.error("Gagal memuat data dari Supabase.", err);
    } finally {
      setDataLoading(false);
    }
  };

  // PROFILE ACTIONS
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    setSaving(true);
    setStatusMsg("");
    try {
      const { data: existing } = await supabase.from('profile').select('id').single();
      if (existing) {
        await supabase.from('profile').update(profile).eq('id', existing.id);
      } else {
        await supabase.from('profile').insert([profile]);
      }
      setStatusMsg("Profil berhasil disimpan!");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setStatusMsg("Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  // PROJECTS ACTIONS
  const addProject = () => {
    const newProject = {
      id: `temp-${Date.now()}`,
      title: "Project Baru",
      description: "Deskripsi project...",
      image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600",
      link: "#",
      order: projects.length,
      isNew: true
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (id: string, field: string, value: string | number) => {
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const saveProjects = async () => {
    setSaving(true);
    setStatusMsg("");
    try {
      for (const p of projects) {
        const { isNew, id, ...projectData } = p;
        if (isNew || String(id).startsWith('temp-')) {
          await supabase.from('projects').insert([projectData]);
        } else {
          await supabase.from('projects').update(projectData).eq('id', id);
        }
      }
      await fetchDashboardData();
      setStatusMsg("Seluruh project berhasil disimpan!");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setStatusMsg("Gagal menyimpan data project.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (String(id).startsWith('temp-')) {
      setProjects(projects.filter(p => p.id !== id));
      return;
    }

    if (confirm("Hapus project ini secara permanen?")) {
      try {
        await supabase.from('projects').delete().eq('id', id);
        setProjects(projects.filter(p => p.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  // MESSAGES INBOX ACTIONS
  const deleteMessage = async (id: string) => {
    if (confirm("Hapus pesan ini secara permanen?")) {
      try {
        await supabase.from('messages').delete().eq('id', id);
        setMessages(messages.filter(m => m.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="login-container">
        <div className="spinner"></div>
      </div>
    );
  }

  // 1. LOGIN INTERFACE (WHEN NOT AUTHENTICATED)
  if (!session) {
    return (
      <div className="login-container animate-on-load">
        <form onSubmit={handleLogin} className="login-card glass">
          <h2 className="text-gradient-purple" style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Admin Portal</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", marginBottom: "2rem" }}>
            Harap masuk untuk mengelola isi landing page.
          </p>

          {loginError && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", color: "#ef4444", borderRadius: "10px", padding: "0.75rem", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              {loginError}
            </div>
          )}

          <div className="form-group" style={{ textAlign: "left" }}>
            <label className="form-label">Email Administrator</label>
            <input type="email" required className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="form-group" style={{ textAlign: "left" }}>
            <label className="form-label">Kata Sandi</label>
            <input type="password" required className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
            Masuk Sekarang
          </button>
        </form>
      </div>
    );
  }

  // 2. PROTECTED ADMIN DASHBOARD PANELS
  return (
    <div className="dashboard-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="dashboard-sidebar glass">
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <h3 className="text-gradient">Portfolio Admin</h3>
        </div>

        <nav className="dashboard-nav">
          <div className={`dashboard-nav-item ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>
            <UserIcon /> Profil & Kontak
          </div>
          <div className={`dashboard-nav-item ${activeTab === "projects" ? "active" : ""}`} onClick={() => setActiveTab("projects")}>
            <FolderIcon /> Portofolio Project
          </div>
          <div className={`dashboard-nav-item ${activeTab === "messages" ? "active" : ""}`} onClick={() => setActiveTab("messages")}>
            <MessageIcon /> Kotak Masuk ({messages.length})
          </div>
        </nav>

        <button onClick={handleLogout} className="btn btn-secondary" style={{ marginTop: "auto", display: "flex", gap: "0.5rem", width: "100%", justifyContent: "center" }}>
          <LogoutIcon /> Keluar Sesi
        </button>
      </aside>

      {/* DASHBOARD CONTENT BODY */}
      <main className="dashboard-content animate-on-load">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <h1 style={{ fontSize: "2rem" }} className="text-gradient-purple">
            {activeTab === "profile" && "Edit Profil Utama"}
            {activeTab === "projects" && "Kelola Portofolio"}
            {activeTab === "messages" && "Pesan Masuk Pengunjung"}
          </h1>
          {statusMsg && (
            <div style={{ padding: "0.5rem 1rem", background: "var(--primary-glow)", border: "1px solid var(--primary)", borderRadius: "8px", color: "var(--accent)", fontWeight: "600", fontSize: "0.9rem" }}>
              {statusMsg}
            </div>
          )}
        </div>

        {dataLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {/* TAB 1: PROFILE MANAGEMENT */}
            {activeTab === "profile" && (
              <div className="dashboard-card glass">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                  <h2>Data Personal</h2>
                  <button onClick={saveProfile} className="btn btn-primary" disabled={saving}>
                    <SaveIcon /> {saving ? "Menyimpan..." : "Simpan Profil"}
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Nama Lengkap</label>
                    <input type="text" name="name" className="form-input" value={profile.name} onChange={handleProfileChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Peran / Role</label>
                    <input type="text" name="role" className="form-input" value={profile.role} onChange={handleProfileChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Deskripsi Ringkas (Bio)</label>
                    <textarea name="bio" className="form-textarea" rows={4} value={profile.bio} onChange={handleProfileChange}></textarea>
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp (Gunakan kode negara, misal: 6281...)</label>
                    <input type="text" name="whatsapp" className="form-input" value={profile.whatsapp} onChange={handleProfileChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Kontak</label>
                    <input type="email" name="email" className="form-input" value={profile.email} onChange={handleProfileChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GitHub URL</label>
                    <input type="text" name="github_url" className="form-input" value={profile.github_url} onChange={handleProfileChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">LinkedIn URL</label>
                    <input type="text" name="linkedin_url" className="form-input" value={profile.linkedin_url} onChange={handleProfileChange} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PROJECTS MANAGEMENT */}
            {activeTab === "projects" && (
              <div className="dashboard-card glass">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
                  <h2>Daftar Project Portofolio</h2>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button onClick={addProject} className="btn btn-secondary">
                      <PlusIcon /> Tambah Baris
                    </button>
                    <button onClick={saveProjects} className="btn btn-primary" disabled={saving}>
                      <SaveIcon /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </div>

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: "80px" }}>Urutan</th>
                        <th style={{ width: "120px" }}>Gambar</th>
                        <th>Data Informasi Project</th>
                        <th style={{ width: "80px" }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project, idx) => (
                        <tr key={project.id}>
                          <td>
                            <input type="number" className="form-input" style={{ width: "60px", padding: "0.5rem" }} value={project.order ?? idx} onChange={(e) => updateProject(project.id, "order", parseInt(e.target.value))} />
                          </td>
                          <td>
                            <div style={{ width: "100px", height: "65px", overflow: "hidden", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--card-border)" }}>
                              <img src={project.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                          </td>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", padding: "0.5rem 0" }}>
                              <input type="text" className="form-input" placeholder="Nama Project" value={project.title} onChange={(e) => updateProject(project.id, "title", e.target.value)} />
                              <input type="text" className="form-input" placeholder="Tautan Project" value={project.link} onChange={(e) => updateProject(project.id, "link", e.target.value)} />
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                <label className="form-label" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>Pilih Gambar dari Perangkat</label>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="form-input" 
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setStatusMsg("Mengunggah gambar...");
                                    try {
                                      const fileExt = file.name.split('.').pop();
                                      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
                                      const filePath = `uploads/${fileName}`;

                                      const { error: uploadError } = await supabase.storage
                                        .from('project-images')
                                        .upload(filePath, file);

                                      if (uploadError) throw uploadError;

                                      const { data: { publicUrl } } = supabase.storage
                                        .from('project-images')
                                        .getPublicUrl(filePath);

                                      updateProject(project.id, "image_url", publicUrl);
                                      setStatusMsg("Gambar berhasil diunggah!");
                                      setTimeout(() => setStatusMsg(""), 3000);
                                    } catch (err: any) {
                                      console.error(err);
                                      alert("Gagal mengunggah gambar. Pastikan Anda telah membuat bucket publik bernama 'project-images' di Storage Supabase Anda.");
                                      setStatusMsg("Gagal mengunggah gambar.");
                                    }
                                  }} 
                                />
                              </div>
                              <textarea className="form-textarea" placeholder="Deskripsi Ringkas Project" rows={2} value={project.description} onChange={(e) => updateProject(project.id, "description", e.target.value)}></textarea>
                            </div>
                          </td>
                          <td style={{ verticalAlign: "top" }}>
                            <button onClick={() => deleteProject(project.id)} className="btn btn-danger" style={{ padding: "0.5rem", marginTop: "0.5rem" }}>
                              <TrashIcon />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {projects.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", padding: "3rem" }}>
                            Belum ada project. Mulai tambahkan project baru.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: MESSAGES/INBOX LIST */}
            {activeTab === "messages" && (
              <div className="dashboard-card glass">
                <h2 style={{ marginBottom: "2rem" }}>Kotak Masuk Pengunjung</h2>
                <div className="message-list">
                  {messages.map((msg) => (
                    <div key={msg.id} className="message-item glass">
                      <div className="message-header">
                        <div>
                          <div className="message-sender">{msg.name}</div>
                          <div style={{ fontSize: "0.85rem", color: "var(--primary)" }}>{msg.email}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          <span className="message-meta">
                            {new Date(msg.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <button onClick={() => deleteMessage(msg.id)} className="btn btn-danger" style={{ padding: "0.4rem" }}>
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                      <p className="message-body">{msg.message}</p>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", padding: "3rem" }}>
                      Belum ada pesan yang masuk.
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
