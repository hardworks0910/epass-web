/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useState, useEffect, useRef } from 'react';
import QRious from 'qrious';
import {
  User, Hash, Calendar, Users, Globe, CreditCard, FileBadge,
  ArrowRight, Check, WifiOff, Award, CheckCircle, Fingerprint,
  Download, Printer, RotateCcw, Shield, ChevronDown, ShieldCheck,
  Database, X, Trash2
} from 'lucide-react';

const MAX_DISPLAY_NAME = 40;
const MAX_FILENAME_LEN = 50;
const logoPreview = '/logo.png'; // Extracted to public folder

// Input Component
const InputField = ({ label, name, value, onChange, type = 'text', placeholder, icon: IconComponent, error, hint, ...props }) => (
  <div className="mb-4 group min-w-0">
    <label htmlFor={name} className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 ml-1 transition-colors group-hover:text-primary truncate">
      {label}
    </label>
    <div className="relative min-w-0">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500" aria-hidden="true">
        {IconComponent && <IconComponent size={18} />}
      </div>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        aria-required="true"
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        className={"w-[calc(100%-2px)] min-h-[42px] min-w-[50px] pl-9 sm:pl-10 pr-2 sm:pr-4 py-2.5 bg-slate-800/50 border rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm hover:bg-slate-800/80 appearance-none overflow-hidden text-ellipsis " + (error ? "border-red-500" : "border-slate-600")}
        {...props}
      />
    </div>
    {hint && !error && <p id={`${name}-hint`} className="mt-1 ml-1 text-xs text-slate-500 truncate">{hint}</p>}
    {error && <p id={`${name}-error`} className="mt-1 ml-1 text-xs text-red-400 truncate" role="alert">{error}</p>}
  </div>
);

// Select Component
const SelectField = ({ label, name, value, onChange, options, icon: IconComponent, error }) => (
  <div className="mb-4 group min-w-0">
    <label htmlFor={name} className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 ml-1 transition-colors group-hover:text-primary truncate">
      {label}
    </label>
    <div className="relative min-w-0">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500" aria-hidden="true">
        {IconComponent && <IconComponent size={18} />}
      </div>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required
        aria-required="true"
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={"w-full min-h-[42px] min-w-0 pl-10 pr-10 py-2.5 bg-slate-800/50 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm hover:bg-slate-800/80 appearance-none text-ellipsis " + (error ? "border-red-500" : "border-slate-600")}
      >
        <option value="" disabled>Sila Pilih / Please Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-slate-800 text-white truncate">{opt}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500" aria-hidden="true">
        <ChevronDown size={16} />
      </div>
    </div>
    {error && <p id={`${name}-error`} className="mt-1 ml-1 text-xs text-red-400 truncate" role="alert">{error}</p>}
  </div>
);

// New Modal Component
const DownloadModal = ({ status }) => {
  if (status === 'idle') return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm fade-in" role="dialog" aria-modal="true" aria-label={status === 'generating' ? 'Sedang menjana imej' : 'Muat turun berjaya'}>
      <div className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-sm text-center relative overflow-hidden pop-in">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-primary/20 rounded-full blur-xl" aria-hidden="true"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-secondary/20 rounded-full blur-xl" aria-hidden="true"></div>
        <div className="relative z-10">
          {status === 'generating' ? (
            <div className="flex flex-col items-center py-2">
              <div className="w-16 h-16 relative mb-5" aria-hidden="true">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">Sedang Menjana...</h3>
              <p className="text-sm text-slate-500">Menyediakan fail imej anda</p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-2">
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-5 pop-in shadow-inner" aria-hidden="true">
                <Check size={40} strokeWidth={3.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">Berjaya Disimpan!</h3>
              <p className="text-sm text-slate-500">e-Pass telah dimuat turun ke peranti anda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Validation helpers
const validatePassport = (v) => {
  if (!v || !v.trim()) return 'Wajib diisi / Required';
  const s = v.trim();
  if (s.length < 5 || s.length > 15) return '5–15 aksara / 5–15 characters';
  if (!/^[A-Za-z0-9]+$/.test(s)) return 'Huruf dan nombor sahaja / Letters and numbers only';
  return null;
};
const validateEpass = (v) => {
  if (!v || !v.trim()) return 'Wajib diisi / Required';
  const s = v.trim();
  if (s.length < 5 || s.length > 25) return '5–25 aksara / 5–25 characters';
  if (!/^[A-Za-z0-9\-]+$/.test(s)) return 'Huruf, nombor dan tanda sempang sahaja / Letters, numbers and hyphen only';
  return null;
};
const validateDate = (v) => {
  if (!v) return 'Wajib diisi / Required';
  const d = new Date(v);
  if (isNaN(d.getTime())) return 'Tarikh tidak sah / Invalid date';
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (d > today) return 'Tarikh tidak boleh masa depan / Date cannot be in future';
  return null;
};

// Hidden Admin Dashboard Component
const AdminDashboard = ({ records, setRecords, setIsAdmin }) => {
  const handleClear = () => {
    if (window.confirm("Adakah anda pasti mahu memadam semua rekod?")) {
      localStorage.removeItem('epass_generated_records');
      setRecords([]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 p-4 sm:p-6 bg-[#1e293b] rounded-3xl shadow-2xl z-10 fade-in border border-slate-700">
      <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-3">
          <Database size={24} className="text-secondary" />
          <h2 className="text-xl font-bold text-white">Rekod e-Pass Jana (Admin)</h2>
        </div>
        <button onClick={() => setIsAdmin(false)} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-600 transition flex items-center gap-2">
          <X size={16} /> Tutup
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800">
        {records.length === 0 ? (
          <p className="text-slate-400 text-center py-8">Tiada rekod ditemui.</p>
        ) : (
          <table className="min-w-full text-sm text-left">
            <thead className="bg-slate-900 text-slate-300">
              <tr>
                <th className="py-3 px-4 font-semibold">Tarikh/Masa</th>
                <th className="py-3 px-4 font-semibold">Nama</th>
                <th className="py-3 px-4 font-semibold">No ePass</th>
                <th className="py-3 px-4 font-semibold">Passport</th>
                <th className="py-3 px-4 font-semibold">Tarikh Lahir</th>
                <th className="py-3 px-4 font-semibold">Warganegara</th>
                <th className="py-3 px-4 font-semibold">Jantina</th>
                <th className="py-3 px-4 font-semibold">Jenis Pas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {records.map((r, i) => (
                <tr key={i} className="hover:bg-slate-700/50 text-slate-200 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">{new Date(r.timestamp).toLocaleString('ms-MY')}</td>
                  <td className="py-3 px-4 font-medium">{r.nama}</td>
                  <td className="py-3 px-4 text-primary">{r.noEpass}</td>
                  <td className="py-3 px-4 text-accent">{r.nomborPassport}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{r.tarikhLahir}</td>
                  <td className="py-3 px-4">{r.warganegara}</td>
                  <td className="py-3 px-4">{r.jantina}</td>
                  <td className="py-3 px-4">{r.jenisPas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={handleClear} className="bg-red-500/20 text-red-400 border border-red-500/50 px-4 py-2 rounded-lg hover:bg-red-500/30 transition flex items-center gap-2 text-sm font-medium">
          <Trash2 size={16} /> Padam Semua Rekod
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState('form'); // form, loading, result, error
  const [formData, setFormData] = useState({
    nama: '',
    noEpass: '',
    tarikhLahir: '',
    warganegara: '',
    jantina: '',
    nomborPassport: '',
    jenisPas: '',
    whoAreWe: ''
  });
  const [errors, setErrors] = useState({});
  const [qrUrl, setQrUrl] = useState('');
  const [downloadStatus, setDownloadStatus] = useState('idle'); // idle, generating, success
  const [qrError, setQrError] = useState(null); // network/QR error + retry

  // Admin and Records State
  const [records, setRecords] = useState([]);
  useEffect(() => {
    const saved = localStorage.getItem('epass_generated_records');
    if (saved) {
      setTimeout(() => {
        try { setRecords(JSON.parse(saved)); } catch (e) { setRecords([]); }
      }, 0);
    }
  }, []);

  const [isAdmin, setIsAdmin] = useState(false);
  const [secretClickCount, setSecretClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const canvasRef = useRef(null);

  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const e = {};
    if (!formData.nama || !formData.nama.trim()) e.nama = 'Wajib diisi / Required';
    const epErr = validateEpass(formData.noEpass); if (epErr) e.noEpass = epErr;
    const dobErr = validateDate(formData.tarikhLahir); if (dobErr) e.tarikhLahir = dobErr;
    if (!formData.warganegara || !formData.warganegara.trim()) e.warganegara = 'Wajib diisi / Required';
    if (!formData.jantina) e.jantina = 'Sila pilih / Please select';
    const ppErr = validatePassport(formData.nomborPassport); if (ppErr) e.nomborPassport = ppErr;
    if (!formData.jenisPas) e.jenisPas = 'Sila pilih / Please select';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString;
    return `${day}-${month}-${year}`;
  };

  const buildDataString = () => {
    const formattedDOB = formatDate(formData.tarikhLahir);
    const cleanJantina = formData.jantina ? formData.jantina.split(' ')[0] : '';
    return `Nama:${formData.nama}\nNo ePass:${formData.noEpass}\nJantina:${cleanJantina}\nDOB:${formattedDOB}\nNo.Pasport:${formData.nomborPassport}\nWarganegara:${formData.warganegara}\nJenis Pas:${formData.jenisPas}\nL1:dgp2026v2\nL2:I8lsCJkOm5ZfEBNWDqQw3RRyQJoh87fOL6r9FCJDMNEiofea3r3ppsNk/nHBApaODXjBTafP96GYRy92LFigippG0Oz2HHd1xmeHMP6fqZbqzJySeF8VGyIbc360biYqJef5gFHV8kko/LUSb9QUWW69PAl4Qhli17vGNiinHfeYiFS/F089h2380hjF)(*#()#$*09ugfj9023-j_()GK#0-23e0sd235`;
  };

  const generateQr = (dataString) => {
    try {
      const qr = new QRious({ value: dataString, size: 600, level: 'H' });
      return Promise.resolve(qr.toDataURL());
    } catch (err) {
      console.error("QRious failed", err);
      const encodedData = encodeURIComponent(dataString);
      const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodedData}&ecc=H&margin=20&format=png`;
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          c.getContext('2d').drawImage(img, 0, 0);
          resolve(c.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('Network or API error'));
        img.src = apiUrl;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setQrError(null);
    setStep('loading');

    const dataString = buildDataString();

    // Save Record to LocalStorage
    const newRecord = { ...formData, timestamp: Date.now() };
    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    localStorage.setItem('epass_generated_records', JSON.stringify(updatedRecords));

    setTimeout(() => {
      generateQr(dataString)
        .then((dataUrl) => {
          setQrUrl(dataUrl);
          setStep('result');
        })
        .catch((err) => {
          console.error('QR error', err);
          setQrError('Rangkaian gagal. Sila cuba lagi. / Network failed. Please try again.');
          setStep('error');
        });
    }, 800);
  };

  const handleRetry = () => {
    setQrError(null);
    setStep('loading');
    const dataString = buildDataString();
    setTimeout(() => {
      generateQr(dataString)
        .then((dataUrl) => {
          setQrUrl(dataUrl);
          setStep('result');
        })
        .catch((err) => {
          setQrError('Rangkaian gagal. Sila cuba lagi. / Network failed. Please try again.');
          setStep('error');
        });
    }, 500);
  };

  const handleReset = () => {
    setStep('form');
    setQrUrl('');
    setQrError(null);
    setDownloadStatus('idle');
    setErrors({});
    setFormData({
      nama: '',
      noEpass: '',
      tarikhLahir: '',
      warganegara: '',
      jantina: '',
      nomborPassport: '',
      jenisPas: ''
    });
  };

  const handleDownload = async () => {
    if (!canvasRef.current || !qrUrl) return;

    setDownloadStatus('generating');

    await new Promise(resolve => setTimeout(resolve, 800));

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 600;
    canvas.width = size;
    canvas.height = size;

    const loadImage = (src, isLocal) => new Promise((resolve, reject) => {
      const img = new Image();
      if (!isLocal && (src.startsWith('http://') || src.startsWith('https://'))) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

    try {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      const qrImg = await loadImage(qrUrl, false);
      ctx.drawImage(qrImg, 0, 0, size, size);

      if (logoPreview) {
        try {
          const logoImg = await loadImage(logoPreview, true);
          const logoSize = size * 0.22;
          const logoX = (size - logoSize) / 2;
          const logoY = (size - logoSize) / 2;
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        } catch (logoErr) {
          console.warn("Logo skipped", logoErr);
        }
      }

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      let safeName = (formData.nama || 'QR').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      if (safeName.length > MAX_FILENAME_LEN) safeName = safeName.slice(0, MAX_FILENAME_LEN);
      link.download = `ePass-${safeName}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadStatus('success');

      setTimeout(() => {
        setDownloadStatus('idle');
      }, 2500);

    } catch (err) {
      console.error("Error generating image:", err);
      setDownloadStatus('idle');
      alert("Ralat semasa memuat turun.");
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0f172a] text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10 flex flex-col items-center animate-in fade-in duration-700">
          <div className="w-24 h-24 mb-10 relative">
            <div className="absolute inset-0 border-4 border-slate-700/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-primary border-r-secondary border-b-transparent border-l-transparent rounded-full animate-spin duration-1000"></div>
            <div className="absolute inset-0 border-4 border-t-transparent border-r-transparent border-b-accent border-l-transparent rounded-full animate-spin duration-[1.5s]" style={{ animationDirection: 'reverse' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield size={40} className="text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            e-Pass Portal
          </h1>
          <div className="flex flex-col items-center gap-4 w-64">
            <div className="flex justify-between w-full text-xs text-slate-400 font-mono">
              <span>SYSTEM INITIALIZING</span>
              <span>100% SECURE</span>
            </div>
            <div className="w-full h-1 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/30">
              <div className="h-full bg-gradient-to-r from-primary via-secondary to-accent shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{
                width: '0%',
                animation: 'progress 2.5s ease-out forwards'
              }}></div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 text-[10px] text-slate-600 font-mono tracking-widest uppercase">
          Establishing Secure Connection...
        </div>
      </div>
    );
  }

  const handleSecretClick = async () => {
    const now = Date.now();
    let count = secretClickCount;
    if (now - lastClickTime > 1200) {
      count = 1;
    } else {
      count += 1;
    }
    setLastClickTime(now);
    setSecretClickCount(count);
    if (count >= 5) {
      setSecretClickCount(0);
      const pwd = prompt("Sila masukkan kata laluan / Admin Password:");
      if (pwd) {
        try {
          const res = await fetch('/api/verify-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pwd })
          });

          const data = await res.json();

          if (data.success) {
            setIsAdmin(true);
          } else {
            alert("Kata laluan salah.");
          }
        } catch (e) {
          console.error("API error:", e);
          alert("Ralat pelayan. Sila cuba lagi / Server error.");
        }
      }
    }
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 fade-in overflow-y-auto w-full">
        <AdminDashboard records={records} setRecords={setRecords} setIsAdmin={setIsAdmin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 fade-in overflow-y-auto">
      <DownloadModal status={downloadStatus} />

      <div className="w-full max-w-md relative z-10 my-auto">

        <div className="text-center mb-6 sm:mb-8 no-print">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg mb-4">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 onClick={handleSecretClick} className="text-2xl sm:text-3xl font-bold text-white tracking-tight cursor-pointer select-none">e-Pass Portal</h1>
          <p className="text-slate-400 mt-2 text-xs sm:text-sm">Sistem Pendaftaran Digital Selamat</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden relative">

          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

          {step === 'form' && (
            <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-1 sm:space-y-2 fade-in">
              <div className="text-white mb-5 sm:mb-6 font-semibold text-base sm:text-lg flex items-center">
                <span className="w-1 h-5 sm:h-6 bg-primary rounded-full mr-3"></span>
                Maklumat Pemohon
              </div>

              <InputField
                label="Nama Penuh / Full Name"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                icon={User}
                placeholder="Contoh: Ali bin Abu"
                error={errors.nama}
                hint="Wajib / Required"
              />

              <InputField
                label="No. ePass"
                name="noEpass"
                value={formData.noEpass}
                onChange={handleChange}
                icon={Hash}
                placeholder="EP-12345678"
                error={errors.noEpass}
                hint="5–25 aksara, huruf/nombor/sempang sahaja"
              />

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <InputField
                  label="Tarikh Lahir"
                  name="tarikhLahir"
                  value={formData.tarikhLahir}
                  onChange={handleChange}
                  type="date"
                  icon={Calendar}
                  max={todayDate}
                  min="1900-01-01"
                  error={errors.tarikhLahir}
                  hint="Format: DD-MM-YYYY"
                />
                <SelectField
                  label="Jantina / Gender"
                  name="jantina"
                  value={formData.jantina}
                  onChange={handleChange}
                  icon={Users}
                  options={["Lelaki (Male)", "Perempuan (Female)"]}
                  error={errors.jantina}
                />
              </div>

              <InputField
                label="Warganegara / Nationality"
                name="warganegara"
                value={formData.warganegara}
                onChange={handleChange}
                icon={Globe}
                placeholder="Malaysia"
                error={errors.warganegara}
                hint="Wajib / Required"
              />

              <InputField
                label="Nombor Passport"
                name="nomborPassport"
                value={formData.nomborPassport}
                onChange={handleChange}
                icon={CreditCard}
                placeholder="A12345678"
                error={errors.nomborPassport}
                hint="5–15 aksara, huruf dan nombor sahaja"
              />

              <SelectField
                label="Jenis Pas / Pass Type"
                name="jenisPas"
                value={formData.jenisPas}
                onChange={handleChange}
                icon={FileBadge}
                error={errors.jenisPas}
                options={[
                  "PLKS",
                  "Employment Pass",
                  "Temporary Employment Pass",
                  "Visit Pass",
                  "Other"
                ]}
              />

              <button
                type="submit"
                className="w-full mt-6 bg-gradient-to-r from-primary to-secondary hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 sm:py-3.5 px-6 rounded-xl shadow-lg transform transition hover:-translate-y-0.5 focus:ring-4 focus:ring-primary/50 flex items-center justify-center gap-2 text-sm sm:text-base"
                aria-label="Hantar borang dan jana kod QR / Submit form and generate QR code"
              >
                <span>Hantar & Jana Kod</span>
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </form>
          )}

          {step === 'loading' && (
            <div className="p-12 flex flex-col items-center justify-center text-center min-h-[350px] sm:min-h-[400px] fade-in">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-6" aria-hidden="true">
                <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-primary border-r-secondary border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Memproses Data</h2>
              <p className="text-slate-400 text-xs sm:text-sm">Menjana kod QR selamat anda...</p>
            </div>
          )}

          {step === 'error' && (
            <div className="p-12 flex flex-col items-center justify-center text-center min-h-[350px] sm:min-h-[400px] fade-in">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6" aria-hidden="true">
                <WifiOff size={32} className="text-red-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Ralat Rangkaian</h2>
              <p className="text-slate-400 text-sm mb-6 max-w-xs">{qrError}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-blue-600"
                  aria-label="Cuba lagi menjana kod QR / Retry generating QR code"
                >Cuba Lagi / Retry</button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 border border-slate-500 text-slate-300 rounded-xl hover:bg-slate-800/50"
                  aria-label="Kembali ke borang / Back to form"
                >Kembali</button>
              </div>
            </div>
          )}

          {step === 'result' && (
            <div className="p-0 bg-white min-h-[500px] flex flex-col fade-in print-only">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 sm:p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10" aria-hidden="true">
                  <Award size={80} className="sm:w-[100px] sm:h-[100px]" />
                </div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-wide">DIGITAL PASS</h2>
                    <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest mt-1">Government of Malaysia</p>
                  </div>
                  <div className="bg-green-500/20 text-green-400 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border border-green-500/30 flex items-center gap-1">
                    <CheckCircle size={12} />
                    AKTIF
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 flex-1 bg-slate-50 text-slate-800 relative">
                <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 mb-6">
                  <div className="flex flex-col items-center justify-center bg-white p-2 sm:p-3 rounded-xl border border-slate-200 shadow-sm mx-auto sm:mx-0 w-fit h-fit">
                    <div className="relative w-[150px] h-[150px] sm:w-[180px] sm:h-[180px]">
                      <img
                        src={qrUrl}
                        alt="QR Code"
                        className="w-full h-full object-contain mix-blend-multiply"
                        crossOrigin="anonymous"
                      />
                      {logoPreview && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[22%] h-[22%] flex items-center justify-center">
                          <img
                            src={logoPreview}
                            alt="Center Logo"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-[8px] sm:text-[10px] text-slate-400 mt-2 font-mono">SCAN UNTUK SAHKAN</p>
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 font-bold">Nama Pemegang</p>
                      <p className="text-base sm:text-lg font-bold text-slate-900 leading-tight" title={formData.nama}>
                        {formData.nama.length > MAX_DISPLAY_NAME ? formData.nama.slice(0, MAX_DISPLAY_NAME) + '…' : formData.nama.toUpperCase()}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-3">
                      <div>
                        <p className="text-[10px] uppercase text-slate-500 font-bold">No. ePass</p>
                        <p className="font-mono text-xs sm:text-sm font-semibold text-primary">{formData.noEpass}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-slate-500 font-bold">Jenis Pas</p>
                        <p className="text-xs sm:text-sm font-semibold">{formData.jenisPas}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-slate-500 font-bold">No. Passport</p>
                        <p className="text-xs sm:text-sm font-semibold">{formData.nomborPassport}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-slate-500 font-bold">Warganegara</p>
                        <p className="text-xs sm:text-sm font-semibold">{formData.warganegara}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 mt-auto">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-slate-400">Tarikh Lahir</p>
                      <p className="text-xs sm:text-sm font-semibold">{formatDate(formData.tarikhLahir)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Jantina</p>
                      <p className="text-xs sm:text-sm font-semibold">{formData.jantina ? formData.jantina.split(' ')[0] : ''}</p>
                    </div>
                    <div className="text-right" aria-hidden="true">
                      <Fingerprint size={32} className="text-slate-300 sm:w-[32px] sm:h-[32px] w-[24px] h-[24px]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="no-print p-4 bg-white border-t border-slate-100 flex gap-3">
                <button
                  onClick={handleDownload}
                  disabled={downloadStatus !== 'idle'}
                  className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl bg-slate-800 text-white text-xs sm:text-sm font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 disabled:opacity-50"
                  aria-label="Muat turun imej ePass / Download ePass image"
                >
                  <Download size={16} aria-hidden="true" />
                  Muat Turun
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  aria-label="Cetak kad ePass / Print ePass card"
                >
                  <Printer size={16} aria-hidden="true" />
                  Cetak
                </button>
                <button
                  onClick={handleReset}
                  className="py-2.5 px-3 sm:px-4 rounded-xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center"
                  aria-label="Buat permohonan baru / New application"
                >
                  <RotateCcw size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-slate-500 text-[10px] sm:text-xs mt-6 mb-4 no-print">
          &copy; {new Date().getFullYear()} ePass Security System. Protected by National Digital ID.
        </p>
      </div>
    </div>
  );
}
