import { useState, useEffect } from "react";
import {
  useVerifyCertificate,
  useAdminLogin,
  useAdminLogout,
  useGetAdminSession,
  useGetCertificateStats,
  useListCertificates,
  useCreateCertificate,
  useUpdateCertificate,
  useDeleteCertificate,
  getGetAdminSessionQueryKey,
  getListCertificatesQueryKey,
  getGetCertificateStatsQueryKey,
  getVerifyCertificateQueryKey,
  type Certificate,
  type CertificateInput,
  type CertificateUpdate,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  Lock,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Download,
  Copy,
  Check,
  QrCode,
  Settings,
} from "lucide-react";
import { format } from "date-fns";
import { PagesManager } from "@/components/admin/PagesManager";

/** Compute display status from expiration date — override the DB value */
function computeStatus(cert: { expirationDate: string; status: string }): "valid" | "expired" | "revoked" {
  if (cert.status === "revoked") return "revoked";
  const exp = new Date(cert.expirationDate);
  exp.setHours(23, 59, 59, 999);
  return exp < new Date() ? "expired" : "valid";
}

function StatusBadge({ status }: { status: string }) {
  const computed = status === "revoked" ? "revoked" : status === "expired" ? "expired" : "valid";
  const styles = {
    valid:   "bg-blue-500/10 text-blue-400 border-blue-500/30",
    expired: "bg-red-500/10 text-red-400 border-red-500/30",
    revoked: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  }[computed];
  const Icon = computed === "valid" ? CheckCircle2 : computed === "expired" ? XCircle : ShieldAlert;
  return (
    <span className={`px-3 py-1 text-xs font-display font-bold tracking-wider uppercase border flex items-center gap-1.5 w-fit ${styles}`} data-testid={`badge-status-${computed}`}>
      <Icon className="w-3.5 h-3.5" />
      {computed.toUpperCase()}
    </span>
  );
}

export default function Certificates() {
  const [searchCode, setSearchCode] = useState("");
  const [verifyCode, setVerifyCode] = useState("");

  // Deep-link support: /certificates?verify=CODE (used by QR codes)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("verify");
    if (code) {
      setSearchCode(code);
      setVerifyCode(code);
    }
  }, []);

  const { data: certificate, error: verifyError, isLoading: isVerifying } = useVerifyCertificate(verifyCode, {
    query: {
      enabled: !!verifyCode,
      retry: false,
      queryKey: getVerifyCertificateQueryKey(verifyCode),
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) setVerifyCode(searchCode.trim());
  };

  return (
    <div className="w-full pt-20">
      {/* Hero */}
      <section className="py-20 md:py-32 bg-card border-b border-white/10 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-4xl">
          <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white leading-tight mb-6">
            CERTIFICATE VERIFICATION
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed font-light tracking-wide">
            Verify the authenticity and status of Top Quality Prospect technical certifications
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="py-24 bg-background border-b border-white/5">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
          <form onSubmit={handleSearch} className="flex max-w-xl mx-auto relative mb-12 group">
            <input
              type="text"
              placeholder="ENTER CERTIFICATE NUMBER..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              data-testid="input-certificate-code"
              className="w-full bg-card border border-white/10 text-white px-6 py-5 pl-14 font-display font-bold tracking-wider focus:outline-none focus:border-primary transition-colors placeholder:text-white/20 uppercase"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <button
              type="submit"
              disabled={isVerifying || !searchCode}
              data-testid="button-verify"
              className="absolute right-2 top-2 bottom-2 bg-primary text-primary-foreground px-8 font-display font-bold tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? "CHECKING..." : "CHECK"}
            </button>
          </form>

          {verifyError && verifyCode && (
            <div className="bg-destructive/10 border border-destructive/30 p-8 flex flex-col items-center" data-testid="card-not-found">
              <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-xl font-display font-bold text-white mb-2">CERTIFICATE NOT FOUND</h3>
              <p className="text-muted-foreground">
                The certificate number "{verifyCode}" could not be verified in our system. Please check the number and try again.
              </p>
            </div>
          )}

          {certificate && <CertificateCard certificate={certificate} />}
        </div>
      </section>

      {/* Hidden admin entrance */}
      <AdminSection />
    </div>
  );
}

function CertificateCard({ certificate }: { certificate: Certificate }) {
  const status = computeStatus(certificate);

  const topColor =
    status === "valid"   ? "bg-blue-500" :
    status === "expired" ? "bg-red-500"  : "bg-amber-500";

  return (
    <div className="bg-card border border-white/10 text-left relative overflow-hidden shadow-2xl" data-testid="card-certificate">
      <div className={`h-2 w-full ${topColor}`} />
      <div className="p-8 md:p-12">
        {/* Header row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-8 border-b border-white/10">
          <div>
            <div className="text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-2">Certificate Number</div>
            <div className="text-4xl font-display font-bold text-white tracking-tight">{certificate.certificateNumber}</div>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div>
            <div className="text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-1">Holder Name</div>
            <div className="text-xl text-white font-medium">{certificate.holderName}</div>
          </div>
          <div>
            <div className="text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-1">NDT Method</div>
            <div className="text-xl text-white font-medium">{certificate.ndtMethod}</div>
          </div>
          <div>
            <div className="text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-1">Level</div>
            <div className="text-xl text-white font-medium">{certificate.level}</div>
          </div>
          <div>
            <div className="text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-1">Issued By</div>
            <div className="text-xl text-white font-medium">{certificate.issuedBy}</div>
          </div>
        </div>

        {/* Date row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-background/50 p-6 border border-white/5">
          <div className="flex items-center gap-4">
            <Clock className="w-6 h-6 text-primary" />
            <div>
              <div className="text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-1">Issue Date</div>
              <div className="text-white">{format(new Date(certificate.issuedDate), "MMMM dd, yyyy")}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Clock className="w-6 h-6 text-destructive" />
            <div>
              <div className="text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-1">Expiration Date</div>
              <div className="text-white">{format(new Date(certificate.expirationDate), "MMMM dd, yyyy")}</div>
            </div>
          </div>
        </div>

        {certificate.notes && (
          <div className="mt-10">
            <div className="text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-2">Remarks</div>
            <p className="text-gray-300 bg-white/5 p-4 border-l-2 border-white/20">{certificate.notes}</p>
          </div>
        )}
        {/* NOTE: QR codes are intentionally NOT shown to public visitors */}
      </div>
    </div>
  );
}

/* ───────────── QR panel (admin only) ───────────── */
function QrPanel({ cert, compact }: { cert: Certificate; compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  const copyQr = async () => {
    if (!cert.qrCodeUrl) return;
    try {
      const resp = await fetch(cert.qrCodeUrl, { credentials: "include" });
      const blob = await resp.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: copy the URL itself
      try {
        await navigator.clipboard.writeText(cert.qrCodeUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { /* clipboard unavailable */ }
    }
  };

  if (!cert.qrCodeUrl) return null;

  return (
    <div className={`flex flex-col items-center ${compact ? "" : "pt-4"}`}>
      <div className="bg-white p-3 mb-3">
        <img
          src={cert.qrCodeUrl}
          alt={`QR code for ${cert.certificateNumber}`}
          className={compact ? "w-32 h-32 object-contain" : "w-44 h-44 object-contain"}
          data-testid="img-qrcode"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={copyQr}
          data-testid="button-copy-qr"
          className="flex items-center gap-2 text-primary border border-primary/40 px-4 py-2 text-xs font-display font-bold tracking-wider hover:bg-primary hover:text-white transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "COPIED!" : "COPY QR"}
        </button>
        <a
          href={cert.qrCodeUrl}
          download={`qr-${cert.certificateNumber}.png`}
          data-testid="button-download-qr"
          className="flex items-center gap-2 text-primary border border-primary/40 px-4 py-2 text-xs font-display font-bold tracking-wider hover:bg-primary hover:text-white transition-colors"
        >
          <Download className="w-4 h-4" /> DOWNLOAD
        </a>
      </div>
    </div>
  );
}

/* ───────────── Hidden Admin Section ───────────── */
const ADMIN_PIN = "1234";

function AdminSection() {
  const queryClient = useQueryClient();
  const { data: session, isLoading: sessionLoading } = useGetAdminSession({
    query: { retry: false, queryKey: getGetAdminSessionQueryKey() },
  });

  // Gate flow: hidden → pin → login
  const [gate, setGate] = useState<"hidden" | "pin" | "login">("hidden");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useAdminLogin();
  const logoutMutation = useAdminLogout();

  const handlePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setGate("login");
      setPin("");
      setPinError(false);
    } else {
      setPinError(true);
      setPin("");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { username, password } }, {
      onSuccess: () => {
        queryClient.invalidateQueries();
        setUsername("");
        setPassword("");
        setGate("hidden");
      },
    });
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        queryClient.invalidateQueries({ queryKey: getGetAdminSessionQueryKey() });
      },
    });
  };

  if (sessionLoading) return null;

  // Logged in → full admin panel
  if (session?.authenticated) {
    return (
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-6">
            <h2 className="text-3xl font-display font-bold text-white uppercase flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-primary" /> Admin Control Panel
            </h2>
            <button
              onClick={handleLogout}
              data-testid="button-logout"
              className="text-muted-foreground hover:text-white flex items-center gap-2 font-display font-bold tracking-wider text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" /> LOGOUT
            </button>
          </div>
          <AdminDashboard />
        </div>
      </section>
    );
  }

  // Hidden state: only a tiny, discreet admin icon at the bottom
  if (gate === "hidden") {
    return (
      <div className="py-10 bg-background flex justify-center">
        <button
          onClick={() => { setGate("pin"); setPinError(false); }}
          data-testid="button-admin-entrance"
          title="Admin"
          className="flex items-center gap-2 text-white/20 hover:text-white/60 transition-colors text-xs font-display tracking-widest uppercase"
        >
          <Settings className="w-4 h-4" /> Admin
        </button>
      </div>
    );
  }

  // PIN gate
  if (gate === "pin") {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-sm">
          <div className="border border-white/10 p-8 bg-card relative">
            <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-3 justify-center uppercase tracking-wider">
              <Lock className="w-5 h-5 text-primary" /> Enter Access Code
            </h2>
            <form onSubmit={handlePin} className="space-y-4">
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoFocus
                placeholder="••••"
                data-testid="input-pin"
                className="w-full bg-background border border-white/10 text-white text-center text-2xl tracking-[0.5em] px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              />
              {pinError && (
                <div className="text-destructive text-xs text-center font-medium" data-testid="text-pin-error">
                  Incorrect code
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setGate("hidden"); setPin(""); setPinError(false); }}
                  className="flex-1 border border-white/10 text-muted-foreground py-3 font-display font-bold tracking-wider text-sm hover:text-white transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={!pin}
                  data-testid="button-pin-submit"
                  className="flex-1 bg-primary text-primary-foreground py-3 font-display font-bold tracking-wider text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  CONTINUE
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    );
  }

  // Login form (after correct PIN)
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-md">
        <div className="border border-white/10 p-8 bg-card relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
          <h2 className="text-2xl font-display font-bold text-white mb-8 flex items-center gap-3 justify-center uppercase tracking-wider">
            <Key className="w-6 h-6 text-primary" /> Admin Portal
          </h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-2">Username</label>
              <input
                type="text"
                value={username}
                autoComplete="username"
                onChange={(e) => setUsername(e.target.value)}
                data-testid="input-username"
                className="w-full bg-background border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-2">Password</label>
              <input
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
                className="w-full bg-background border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            {loginMutation.isError && (
              <div className="text-destructive text-sm bg-destructive/10 p-3 border border-destructive/20 text-center font-medium" data-testid="text-login-error">
                Invalid credentials — please try again.
              </div>
            )}
            <button
              type="submit"
              disabled={loginMutation.isPending || !username || !password}
              data-testid="button-login"
              className="w-full bg-primary text-primary-foreground py-4 font-display font-bold tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50 mt-4"
            >
              {loginMutation.isPending ? "AUTHENTICATING..." : "AUTHENTICATE"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Admin Dashboard ───────────── */
function AdminDashboard() {
  const { data: stats } = useGetCertificateStats();
  const { data: certificates } = useListCertificates();
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [newCert, setNewCert] = useState<Certificate | null>(null);
  const [qrCert, setQrCert] = useState<Certificate | null>(null);
  const [tab, setTab] = useState<"certificates" | "pages">("certificates");

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-10">
        <button
          onClick={() => setTab("certificates")}
          data-testid="tab-certificates"
          className={`px-6 py-3 font-display font-bold tracking-wider text-sm uppercase border transition-colors ${
            tab === "certificates"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-white/10 hover:text-white"
          }`}
        >
          Certificates
        </button>
        <button
          onClick={() => setTab("pages")}
          data-testid="tab-pages"
          className={`px-6 py-3 font-display font-bold tracking-wider text-sm uppercase border transition-colors ${
            tab === "pages"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-white/10 hover:text-white"
          }`}
        >
          Site Pages
        </button>
      </div>

      {tab === "pages" ? (
        <PagesManager />
      ) : (
        <>
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="bg-background border border-white/5 p-6 border-l-4 border-l-white/40">
                <div className="text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-2">Total Issued</div>
                <div className="text-4xl font-display font-bold text-white">{stats.total}</div>
              </div>
              <div className="bg-background border border-white/5 p-6 border-l-4 border-l-blue-500">
                <div className="text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-2">Valid</div>
                <div className="text-4xl font-display font-bold text-blue-400">{stats.valid}</div>
              </div>
              <div className="bg-background border border-white/5 p-6 border-l-4 border-l-red-500">
                <div className="text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-2">Expired</div>
                <div className="text-4xl font-display font-bold text-red-400">{stats.expired}</div>
              </div>
              <div className="bg-background border border-white/5 p-6 border-l-4 border-l-amber-500">
                <div className="text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-2">Revoked</div>
                <div className="text-4xl font-display font-bold text-amber-400">{stats.revoked}</div>
              </div>
            </div>
          )}

          {/* New cert QR preview */}
          {newCert && (
            <div className="mb-8 bg-background border border-blue-500/30 p-6 flex flex-col md:flex-row items-center gap-8" data-testid="card-new-cert">
              <QrPanel cert={newCert} compact />
              <div className="flex-1">
                <div className="text-blue-400 font-display font-bold text-lg mb-2">Certificate Issued Successfully</div>
                <div className="text-muted-foreground text-sm space-y-1">
                  <p><span className="text-white/60">Number:</span> <span className="text-white font-mono">{newCert.certificateNumber}</span></p>
                  <p><span className="text-white/60">Holder:</span> <span className="text-white">{newCert.holderName}</span></p>
                  <p><span className="text-white/60">Method:</span> <span className="text-white">{newCert.ndtMethod} — {newCert.level}</span></p>
                  <p><span className="text-white/60">Expires:</span> <span className="text-white">{format(new Date(newCert.expirationDate), "MMMM dd, yyyy")}</span></p>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Copy or download the QR code and place it on the certificate. Scanning opens the verification page directly.
                </p>
              </div>
              <button onClick={() => setNewCert(null)} className="text-muted-foreground hover:text-white text-xs self-start md:self-center">Dismiss</button>
            </div>
          )}

          {/* QR viewer for an existing certificate */}
          {qrCert && (
            <div className="mb-8 bg-background border border-primary/30 p-6 flex flex-col md:flex-row items-center gap-8" data-testid="card-qr-viewer">
              <QrPanel cert={qrCert} compact />
              <div className="flex-1">
                <div className="text-primary font-display font-bold text-lg mb-2">QR Code — {qrCert.certificateNumber}</div>
                <p className="text-muted-foreground text-sm">{qrCert.holderName} · {qrCert.ndtMethod} · {qrCert.level}</p>
                <p className="text-xs text-muted-foreground mt-3">
                  This QR code links directly to the public verification page for this certificate.
                </p>
              </div>
              <button onClick={() => setQrCert(null)} className="text-muted-foreground hover:text-white text-xs self-start md:self-center" data-testid="button-close-qr">Close</button>
            </div>
          )}

          {editingId !== null ? (
            <CertificateForm
              id={editingId}
              onClose={() => setEditingId(null)}
              onCreated={(cert) => { setNewCert(cert); setEditingId(null); }}
              certificate={editingId !== "new" ? certificates?.find((c) => c.id === editingId) : undefined}
            />
          ) : (
            <div className="bg-background border border-white/10">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-display font-bold text-white uppercase tracking-wider">Certificate Registry</h3>
                <button
                  onClick={() => { setNewCert(null); setQrCert(null); setEditingId("new"); }}
                  data-testid="button-issue-new"
                  className="bg-primary/20 text-primary border border-primary/50 px-4 py-2 text-sm font-display font-bold tracking-wider hover:bg-primary hover:text-white transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> ISSUE NEW
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-muted-foreground text-xs font-display font-bold tracking-widest uppercase border-b border-white/10">
                      <th className="p-4 whitespace-nowrap">Number</th>
                      <th className="p-4 whitespace-nowrap">Holder</th>
                      <th className="p-4 whitespace-nowrap">Method</th>
                      <th className="p-4 whitespace-nowrap">Level</th>
                      <th className="p-4 whitespace-nowrap">Expiry</th>
                      <th className="p-4 whitespace-nowrap">Status</th>
                      <th className="p-4 whitespace-nowrap text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {certificates?.map((cert) => (
                      <tr key={cert.id} className="hover:bg-white/[0.02] transition-colors" data-testid={`row-cert-${cert.certificateNumber}`}>
                        <td className="p-4 font-mono text-white">{cert.certificateNumber}</td>
                        <td className="p-4 text-gray-300">{cert.holderName}</td>
                        <td className="p-4 text-gray-300">{cert.ndtMethod}</td>
                        <td className="p-4 text-gray-300">{cert.level}</td>
                        <td className="p-4 text-gray-300">{format(new Date(cert.expirationDate), "MMM dd, yyyy")}</td>
                        <td className="p-4">
                          <StatusBadge status={computeStatus(cert)} />
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => { setQrCert(cert); setNewCert(null); }}
                              title="Show QR code"
                              data-testid={`button-qr-${cert.id}`}
                              className="p-2 text-muted-foreground hover:text-primary bg-white/5 hover:bg-primary/20 transition-colors border border-white/10 hover:border-primary/50"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(cert.id)}
                              data-testid={`button-edit-${cert.id}`}
                              className="p-2 text-muted-foreground hover:text-primary bg-white/5 hover:bg-primary/20 transition-colors border border-white/10 hover:border-primary/50"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <DeleteButton id={cert.id} />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {certificates?.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">No certificates found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DeleteButton({ id }: { id: number }) {
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteCertificate();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this certificate?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: (_deleted, variables) => {
          queryClient.setQueryData<Certificate[]>(
            getListCertificatesQueryKey(),
            (current) => current?.filter((item) => item.id !== variables.id) ?? [],
          );
          queryClient.invalidateQueries({ queryKey: getListCertificatesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetCertificateStatsQueryKey() });
        },
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleteMutation.isPending}
      data-testid={`button-delete-${id}`}
      title={deleteMutation.error instanceof Error ? deleteMutation.error.message : "Delete certificate"}
      className="p-2 text-muted-foreground hover:text-destructive bg-white/5 hover:bg-destructive/20 transition-colors border border-white/10 hover:border-destructive/50 disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

function CertificateForm({
  id,
  onClose,
  onCreated,
  certificate,
}: {
  id: number | "new";
  onClose: () => void;
  onCreated: (cert: Certificate) => void;
  certificate?: Certificate;
}) {
  const queryClient = useQueryClient();
  const createMutation = useCreateCertificate();
  const updateMutation = useUpdateCertificate();

  const [formData, setFormData] = useState<Partial<CertificateInput>>({
    certificateNumber: certificate?.certificateNumber || "",
    holderName: certificate?.holderName || "",
    ndtMethod: certificate?.ndtMethod || "",
    level: certificate?.level || "",
    issuedDate: certificate?.issuedDate
      ? new Date(certificate.issuedDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    expirationDate: certificate?.expirationDate
      ? new Date(certificate.expirationDate).toISOString().split("T")[0]
      : "",
    issuedBy: certificate?.issuedBy || "Top Quality Prospect",
    notes: certificate?.notes || "",
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getListCertificatesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetCertificateStatsQueryKey() });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (id === "new") {
      createMutation.mutate({ data: formData as CertificateInput }, {
        onSuccess: (created) => {
          invalidateAll();
          onCreated(created);
        },
      });
    } else {
      // Only send updatable fields (certificateNumber is immutable)
      const { certificateNumber: _cn, ...updateData } = formData;
      updateMutation.mutate({ id, data: updateData as CertificateUpdate }, {
        onSuccess: () => {
          invalidateAll();
          onClose();
        },
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const errorMessage =
    (createMutation.error as any)?.response?.data?.error ||
    (updateMutation.error as any)?.response?.data?.error ||
    null;

  return (
    <div className="bg-background border border-white/10 p-8">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
        <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider">
          {id === "new" ? "Issue New Certificate" : "Edit Certificate"}
        </h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-white text-sm" data-testid="button-cancel-form">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {id === "new" && (
            <div>
              <label className="block text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-2">
                Certificate Number
              </label>
              <input
                required
                type="text"
                name="certificateNumber"
                value={formData.certificateNumber}
                onChange={handleChange}
                placeholder="e.g. TQP-2026-010"
                data-testid="input-cert-number"
                className="w-full bg-card border border-white/10 text-white px-4 py-3 focus:border-primary focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-2">Holder Name</label>
            <input required type="text" name="holderName" value={formData.holderName} onChange={handleChange} data-testid="input-holder-name" className="w-full bg-card border border-white/10 text-white px-4 py-3 focus:border-primary focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-2">NDT Method</label>
            <input required type="text" name="ndtMethod" value={formData.ndtMethod} onChange={handleChange} placeholder="e.g. Ultrasonic Testing (UT)" data-testid="input-ndt-method" className="w-full bg-card border border-white/10 text-white px-4 py-3 focus:border-primary focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-2">Level</label>
            <input required type="text" name="level" value={formData.level} onChange={handleChange} placeholder="e.g. Level II" data-testid="input-level" className="w-full bg-card border border-white/10 text-white px-4 py-3 focus:border-primary focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-2">Issued By</label>
            <input required type="text" name="issuedBy" value={formData.issuedBy} onChange={handleChange} data-testid="input-issued-by" className="w-full bg-card border border-white/10 text-white px-4 py-3 focus:border-primary focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-2">Issue Date</label>
            <input required type="date" name="issuedDate" value={formData.issuedDate} onChange={handleChange} data-testid="input-issued-date" className="w-full bg-card border border-white/10 text-white px-4 py-3 focus:border-primary focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-2">Expiration Date</label>
            <input required type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} data-testid="input-expiration-date" className="w-full bg-card border border-white/10 text-white px-4 py-3 focus:border-primary focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-2">Notes (Optional)</label>
          <textarea
            name="notes"
            value={formData.notes || ""}
            onChange={handleChange}
            rows={3}
            data-testid="input-notes"
            className="w-full bg-card border border-white/10 text-white px-4 py-3 focus:border-primary focus:outline-none"
          />
        </div>

        {(createMutation.isError || updateMutation.isError) && (
          <div className="text-destructive text-sm bg-destructive/10 p-3 border border-destructive/20" data-testid="text-form-error">
            {errorMessage || "Failed to save certificate. Please check all fields and try again."}
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-white/10">
          <button
            type="submit"
            disabled={isPending}
            data-testid="button-save-cert"
            className="bg-primary text-primary-foreground px-8 py-3 font-display font-bold tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? "SAVING..." : id === "new" ? "ISSUE CERTIFICATE" : "SAVE CHANGES"}
          </button>
        </div>
      </form>
    </div>
  );
}
