import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  BookOpen,
  History as HistoryIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Mic,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { supabase, supabaseConfigError } from "./lib/supabase";
import { listSessions } from "./lib/sessions";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import Practice from "./components/Practice";
import History from "./components/History";
import Resources from "./components/Resources";
import type { Page, SavedSession } from "./types";
import "./App.css";
import "./interview.css";

const navItems: { name: Page; label: string; icon: LucideIcon }[] = [
  { name: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
  { name: "Practice", label: "Mock Interview", icon: Mic },
  { name: "History", label: "History", icon: HistoryIcon },
  { name: "Resources", label: "Resources", icon: BookOpen },
];

function displayName(email: string | undefined): string {
  const local = email?.split("@")[0]?.split(/[._-]/)[0] ?? "";
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : "";
}

function FullScreenMessage({ children }: { children: ReactNode }) {
  return <div className="auth-page center-screen">{children}</div>;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  const [activePage, setActivePage] = useState<Page>("Dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);

  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState("");
  const [signOutError, setSignOutError] = useState("");

  // ---------- auth ----------
  useEffect(() => {
    if (supabaseConfigError) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setAuthReady(true);
      if (event === "PASSWORD_RECOVERY") setIsRecovery(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ---------- saved sessions ----------
  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    listSessions()
      .then((data) => {
        if (cancelled) return;
        setSessions(data);
        setSessionsError("");
      })
      .catch((err: unknown) => {
        if (!cancelled) setSessionsError(err instanceof Error ? err.message : "Could not load sessions.");
      })
      .finally(() => {
        if (!cancelled) setSessionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function reloadSessions() {
    setSessionsLoading(true);
    try {
      setSessions(await listSessions());
      setSessionsError("");
    } catch (err) {
      setSessionsError(err instanceof Error ? err.message : "Could not load sessions.");
    } finally {
      setSessionsLoading(false);
    }
  }

  async function handleSignOut() {
    setSignOutError("");
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSignOutError(error.message);
      return;
    }
    setSessions([]);
    setSessionsLoading(true);
    setActivePage("Dashboard");
  }

  function navigate(page: Page) {
    setActivePage(page);
    setMobileMenu(false);
  }

  // ---------- gates ----------
  if (supabaseConfigError) {
    return (
      <FullScreenMessage>
        <div className="panel auth-card">
          <h2>Configuration needed</h2>
          <p className="muted">{supabaseConfigError}</p>
        </div>
      </FullScreenMessage>
    );
  }

  if (!authReady) {
    return (
      <FullScreenMessage>
        <Loader2 size={28} className="spin" aria-label="Loading" />
      </FullScreenMessage>
    );
  }

  if (isRecovery) {
    return <AuthScreen recovery onRecoveryDone={() => setIsRecovery(false)} />;
  }

  if (!session) {
    return <AuthScreen />;
  }

  // ---------- app shell ----------
  const email = session.user.email ?? "";
  const name = displayName(email);
  const initials = (name || email || "U").slice(0, 2).toUpperCase();
  const currentLabel = navItems.find((n) => n.name === activePage)?.label ?? activePage;

  return (
    <div className="app-shell">
      {mobileMenu && (
        <button className="mobile-overlay" onClick={() => setMobileMenu(false)} aria-label="Close menu" />
      )}

      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-logo">S</div>
          <div>
            <div className="brand-name">INTERVIEW SAATHI</div>
            <div className="brand-sub">AI INTERVIEW COACH</div>
          </div>
          <button className="icon-btn mobile-close" onClick={() => setMobileMenu(false)} aria-label="Close menu">
            <X size={19} />
          </button>
        </div>

        <div className="profile-card">
          <div className="avatar">{initials}</div>
          <div className="profile-text">
            <div className="profile-name">{name || "Candidate"}</div>
            <div className="profile-role" title={email}>{email}</div>
          </div>
          <span className="online-dot" />
        </div>

        <div className="nav-label">PREPARE</div>
        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className={`nav-item ${activePage === item.name ? "nav-active" : ""}`}
                onClick={() => navigate(item.name)}
                aria-current={activePage === item.name ? "page" : undefined}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-icon"><Sparkles size={16} /></div>
            <div className="tip-title">Keep showing up.</div>
            <p>Every practice answer makes the real one easier.</p>
          </div>
          <button className="nav-item" onClick={() => void handleSignOut()}>
            <LogOut size={19} />
            <span>Sign out</span>
          </button>
          {signOutError && <div className="alert alert-error small">{signOutError}</div>}
          <div className="version">INTERVIEW SAATHI AI - VERSION 2.0</div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-btn menu-toggle" onClick={() => setMobileMenu(true)} aria-label="Open menu">
              <Menu size={21} />
            </button>
            <div className="breadcrumb">
              Interview Saathi <span>/</span> <strong>{currentLabel}</strong>
            </div>
          </div>
          <div className="topbar-right">
            <span className="status-pill">
              <span className="live-dot" /> AI coach ready
            </span>
            <div className="top-avatar">{initials}</div>
          </div>
        </header>

        <div className="page-content">
          {activePage === "Dashboard" && (
            <Dashboard
              name={name}
              sessions={sessions}
              loading={sessionsLoading}
              error={sessionsError}
              onNavigate={navigate}
            />
          )}
          {/* Practice stays mounted so an in-progress interview survives page switches. */}
          <div hidden={activePage !== "Practice"}>
            <Practice
              onSaved={(saved) => {
                setSessions((prev) => [saved, ...prev]);
                setSessionsError("");
              }}
            />
          </div>
          {activePage === "History" && (
            <History
              sessions={sessions}
              loading={sessionsLoading}
              error={sessionsError}
              onReload={() => void reloadSessions()}
              onDeleted={(id) => setSessions((prev) => prev.filter((s) => s.id !== id))}
              onNavigate={navigate}
            />
          )}
          {activePage === "Resources" && <Resources />}

          <footer className="footer">
            <span>&copy; 2026 Interview Saathi AI</span>
            <span>Practise smarter. Interview with confidence.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
