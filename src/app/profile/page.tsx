"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const HOROSCOPES = [
  { sign: "Aries",       dates: "Mar 21 – Apr 19" },
  { sign: "Taurus",      dates: "Apr 20 – May 20" },
  { sign: "Gemini",      dates: "May 21 – Jun 21" }, 
  { sign: "Cancer",      dates: "Jun 22 – Jul 22" }, 
  { sign: "Leo",         dates: "Jul 23 – Aug 22" },
  { sign: "Virgo",       dates: "Aug 23 – Sep 22" },
  { sign: "Libra",       dates: "Sep 23 – Oct 23" }, 
  { sign: "Scorpius",    dates: "Oct 24 – Nov 21" }, 
  { sign: "Sagittarius", dates: "Nov 22 – Dec 21" },
  { sign: "Capricornus", dates: "Dec 22 – Jan 19" }, 
  { sign: "Aquarius",    dates: "Jan 20 – Feb 18" },
  { sign: "Pisces",      dates: "Feb 19 – Mar 20" },
];

const ZODIACS = [
  { sign: "Rat", years: [1924,1936,1948,1960,1972,1984,1996,2008,2020] },
  { sign: "Ox", years: [1925,1937,1949,1961,1973,1985,1997,2009,2021] },
  { sign: "Tiger", years: [1926,1938,1950,1962,1974,1986,1998,2010,2022] },
  { sign: "Rabbit", years: [1927,1939,1951,1963,1975,1987,1999,2011,2023] },
  { sign: "Dragon", years: [1928,1940,1952,1964,1976,1988,2000,2012,2024] },
  { sign: "Snake", years: [1929,1941,1953,1965,1977,1989,2001,2013,2025] },
  { sign: "Horse", years: [1930,1942,1954,1966,1978,1990,2002,2014,2026] },
  { sign: "Goat", years: [1931,1943,1955,1967,1979,1991,2003,2015,2027] },
  { sign: "Monkey", years: [1932,1944,1956,1968,1980,1992,2004,2016,2028] },
  { sign: "Rooster", years: [1933,1945,1957,1969,1981,1993,2005,2017,2029] },
  { sign: "Dog", years: [1934,1946,1958,1970,1982,1994,2006,2018,2030] },
  { sign: "Pig", years: [1935,1947,1959,1971,1983,1995,2007,2019,2031] },
];

function parseDOB(dob: string): { day: number; month: number; year: number } | null {
  if (!dob || dob.length < 10) return null;
  const parts = dob.trim().split(" ");
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (day < 1 || day > 31) return null;
  if (month < 1 || month > 12) return null;
  if (year < 1900 || year > new Date().getFullYear()) return null;
  return { day, month, year };
}

function getHoroscope(dob: string) {
  const parsed = parseDOB(dob);
  if (!parsed) return null;
  const { day, month } = parsed;
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return HOROSCOPES[0];
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return HOROSCOPES[1];
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return HOROSCOPES[2];
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return HOROSCOPES[3];
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return HOROSCOPES[4];
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return HOROSCOPES[5];
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return HOROSCOPES[6];
  if ((month === 10 && day >= 24) || (month === 11 && day <= 21)) return HOROSCOPES[7];
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return HOROSCOPES[8];
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return HOROSCOPES[9];
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return HOROSCOPES[10];
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return HOROSCOPES[11];
  return null;
}

function getZodiac(dob: string) {
  const parsed = parseDOB(dob);
  if (!parsed) return null;
  return ZODIACS.find((z) => z.years.includes(parsed.year)) || null;
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null); // ← NEW
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false); // ← NEW
  const [previewImage, setPreviewImage] = useState<string | null>(null); // ← NEW
  const [form, setForm] = useState({
    displayName: "",
    gender: "",
    birthday: "",
    horoscope: "",
    zodiac: "",
    height: "",
    weight: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/getProfile", {
        headers: { "x-access-token": token || "" },
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const profile = data.data || data;
        setProfile(profile);
        setPreviewImage(profile.profilePicture || null); // ← NEW
        setForm({
          displayName: profile.name || "",
          gender: profile.gender || "",
          birthday: profile.birthday || "",
          horoscope: profile.horoscope || "",
          zodiac: profile.zodiac || "",
          height: profile.height || "",
          weight: profile.weight || "",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── NEW: Photo upload ─────────────────────────────────────────
  const handlePhotoClick = () => {
    if (editing) fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant preview
    const reader = new FileReader();
    reader.onload = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);

    setUploadingPhoto(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploadPhoto", {
        method: "POST",
        headers: { "x-access-token": token || "" },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        await fetch("/api/updateProfile", {
          method: "PUT",
          headers: { "Content-Type": "application/json", "x-access-token": token || "" },
          body: JSON.stringify({ profilePicture: data.url }),
        });
        await fetchProfile();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingPhoto(false);
    }
  };
  // ─────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const horoscope = getHoroscope(form.birthday);
      const zodiac = getZodiac(form.birthday);
      const payload = {
        name: form.displayName,
        gender: form.gender,
        birthday: form.birthday,
        horoscope: horoscope?.sign || "",
        zodiac: zodiac?.sign || "",
        height: form.height ? Number(form.height) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
      };

      const url = profile ? "/api/updateProfile" : "/api/createProfile";
      const method = profile ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token || "",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save profile");

      await fetchProfile();
      setEditing(false);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const horoscope = getHoroscope(form.birthday);
  const zodiac = getZodiac(form.birthday);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div className="mobile-container">
      <div className="page-wrapper">

        {/* Hidden file input ← NEW */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handlePhotoChange}
        />

        {/* Header */}
        <div className="header">
          <button onClick={() => router.back()} className="back-btn">
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M7 1L1 7L7 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Back</span>
          </button>
          <span className="username">@{profile?.username || "username"}</span>
          <div style={{width: 60}} />
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          {/* ── UPDATED: image area with upload support ── */}
          <div
            className="profile-image-area"
            onClick={handlePhotoClick}
            style={{ cursor: editing ? "pointer" : "default" }}
          >
            {previewImage ? (
              <>
                <img
                  src={previewImage}
                  alt="Profile"
                  style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%",
                    objectFit: "cover", borderRadius: 16,
                  }}
                />
                {editing && (
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "rgba(0,0,0,0.45)",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    borderRadius: 16, zIndex: 2,
                  }}>
                    {uploadingPhoto ? (
                      <p style={{ color: "white", fontSize: 12, margin: 0 }}>Uploading...</p>
                    ) : (
                      <>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                        <p style={{ color: "white", fontSize: 11, margin: "4px 0 0" }}>Change Photo</p>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="profile-image-placeholder">
                {editing ? (
                  <div style={{ textAlign: "center", marginInline:"10px" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, margin: "" }}>
                      {uploadingPhoto ? "Uploading..." : "Add Photo"}
                    </p>
                  </div>
                ) : (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                )}
              </div>
            )}
          </div>

          <div className="profile-info">
            <h2 className="display-name">{profile?.name || "@" + (profile?.username || "")}</h2>
            <div className="badges">
              {horoscope && (
                <span className="badge">
                  <span>{horoscope.sign}</span>
                </span>
              )}
              {zodiac && (
                <span className="badge">
                  <span>{zodiac.sign}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="section-card">
          <div className="section-header">
            <span className="section-title">About</span>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="edit-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            ) : (
              <button onClick={handleSave} disabled={saving} className="save-btn">
                {saving ? "Saving..." : "Save & Update"}
              </button>
            )}
          </div>

          {!editing ? (
            <div className="profile-details">
              {!profile?.name ? (
                <p className="empty-text">Add in your details to help others know you better</p>
              ) : (
                <div className="detail-list">
                  {[
                    { label: "Birthday:", value: formatDate(form.birthday) },
                    { label: "Horoscope:", value: horoscope ? horoscope.sign : "" },
                    { label: "Zodiac:", value: zodiac ? zodiac.sign : "" },
                    { label: "Height:", value: form.height ? `${form.height} cm` : "" },
                    { label: "Weight:", value: form.weight ? `${form.weight} kg` : "" },
                  ].map((item) => item.value ? (
                    <div key={item.label} className="detail-row">
                      <span className="detail-label">{item.label}</span>
                      <span className="detail-value">{item.value}</span>
                    </div>
                  ) : null)}
                </div>
              )}
            </div>
          ) : (
            <div className="edit-form">
              <div className="form-row">
                <label>Display Name:</label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  className="edit-input"
                />
              </div>
              <div className="form-row">
                <label>Gender:</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="edit-input"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-row">
                <label>Birthday:</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="DD MM YYYY"
                  value={form.birthday}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.length > 2) val = val.slice(0, 2) + " " + val.slice(2);
                    if (val.length > 5) val = val.slice(0, 5) + " " + val.slice(5);
                    val = val.slice(0, 10);
                    setForm({ ...form, birthday: val });
                  }}
                  className="edit-input"
                  style={{ textAlign: "right" }}
                />
              </div>
              <div className="form-row">
                <label>Horoscope:</label>
                <input
                  type="text"
                  readOnly
                  value={horoscope ? horoscope.sign : "—"}
                  className="edit-input readonly"
                />
              </div>
              <div className="form-row">
                <label>Zodiac:</label>
                <input
                  type="text"
                  readOnly
                  value={zodiac ? zodiac.sign : "—"}
                  className="edit-input readonly"
                />
              </div>
              <div className="form-row">
                <label>Height</label>
                <div className="input-unit-wrapper">
                  <input
                    type="number"
                    placeholder="Add height"
                    value={form.height}
                    onChange={(e) => setForm({ ...form, height: e.target.value })}
                    className="edit-input unit-input"
                  />
                  <span className="unit-label">cm</span>
                </div>
              </div>
              <div className="form-row">
                <label>Weight</label>
                <div className="input-unit-wrapper">
                  <input
                    type="number"
                    placeholder="Add weight"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className="edit-input unit-input"
                  />
                  <span className="unit-label">kg</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interests Section */}
        <div className="section-card">
          <div className="section-header">
            <span className="section-title">Interest</span>
            <button onClick={() => router.push("/interest")} className="edit-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
          {profile?.interests?.length > 0 ? (
            <div className="badges">
              {profile.interests.map((tag: string) => (
                <span key={tag} className="badge">{tag}</span>
              ))}
            </div>
          ) : (
            <p className="empty-text">Add in your interest to find a better match</p>
          )}
        </div>

      </div>

      <style jsx>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: white;
          font-size: 14px;
          cursor: pointer;
          padding: 0;
        }
        .username {
          color: white;
          font-size: 16px;
          font-weight: 600;
        }
        .profile-card {
          border-radius: 16px;
          background: linear-gradient(135deg, #1a3a4a 0%, #162830 100%);
          height: 190px;
          margin-bottom: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          position: relative;
          overflow: hidden;
        }
        .profile-image-area {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .profile-image-placeholder {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          border: 1px dashed rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }
        .profile-info {
          position: relative;
          z-index: 1;
        }
        .display-name {
          font-size: 20px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px;
        }
        .badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 100px;
          padding: 4px 12px;
          font-size: 12px;
          color: white;
        }
        .section-card {
          border-radius: 16px;
          background: rgba(22, 35, 46, 0.8);
          padding: 20px;
          margin-bottom: 16px;
        }
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: white;
        }
        .edit-btn {
          background: none;
          border: none;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          padding: 4px;
        }
        .save-btn {
          background: none;
          border: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          background: linear-gradient(135deg, #94783E, #F3EDA6, #D5BE88);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .empty-text {
          color: rgba(255,255,255,0.3);
          font-size: 13px;
          margin: 0;
        }
        .detail-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .detail-row {
          display: flex;
          align-items: center;
        }
        .detail-label {
          color: rgba(255,255,255,0.4);
          font-size: 13px;
        }
        .detail-value {
          color: white;
          margin-left: 8px;
          font-size: 13px;
          font-weight: 500;
        }
        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .form-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .form-row label {
          color: rgba(255,255,255,0.4);
          font-size: 13px;
          white-space: nowrap;
          min-width: 90px;
        }
        .edit-input {
          flex: 1;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 10px 14px;
          color: white;
          font-size: 13px;
          outline: none;
          text-align: right;
        }
        .edit-input.readonly {
          color: rgba(255,255,255,0.5);
        }
        .edit-input option {
          background: #1a2a35;
          color: white;
        }
        .input-unit-wrapper {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
        }
        .unit-input {
          width: 100%;
          padding-right: 36px !important;
        }
        .unit-label {
          position: absolute;
          right: 12px;
          color: rgba(255,255,255,0.4);
          font-size: 13px;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}