"use client";
import { useState, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

export default function InterestPage() {
  const router = useRouter();
  const [interests, setInterests] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchInterests();
  }, []);

const fetchInterests = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/getProfile", {
      headers: { "x-access-token": token || "" },
    });
    if (res.ok) {
      const data = await res.json();
      const profile = data.data || data;           
      setInterests(profile.interests || []);       
    }
  } catch (err) {
    console.error(err);
  }
};

const handleSave = async () => {
  setSaving(true);
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/updateProfile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token || "",             
      },
      body: JSON.stringify({ interests }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to save");
    setSaved(true);
    setTimeout(() => router.push("/profile"), 800);
  } catch (err: any) {
    console.error(err.message);
  } finally {
    setSaving(false);
  }
};

  const addInterest = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (interests.includes(trimmed)) return;
    if (interests.length >= 20) return;
    setInterests((prev) => [...prev, trimmed]);
    setInputValue("");
  };

  const removeInterest = (tag: string) => {
    setInterests((prev) => prev.filter((i) => i !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addInterest(inputValue);
    }
    if (e.key === "Backspace" && inputValue === "" && interests.length > 0) {
      removeInterest(interests[interests.length - 1]);
    }
  };


  return (
    <div className="mobile-container">
      <div className="page-wrapper">


        <div style={styles.header}>
          <button onClick={() => router.back()} style={styles.backBtn}>
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M7 1L1 7L7 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ marginLeft: 8, fontSize: 14, color: "white" }}>Back</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            style={styles.saveBtn}
          >
            {saved ? "Saved! ✓" : saving ? "Saving..." : "Save"}
          </button>
        </div>


        <div style={styles.titleSection}>
          <p className="link-gold">Tell everyone about yourself</p>
          <h1 style={styles.title}>What interest you?</h1>
        </div>


        <div style={styles.tagBox}>

          {interests.map((tag) => (
            <span key={tag} style={styles.tag}>
              {tag}
              <button
                onClick={() => removeInterest(tag)}
                style={styles.tagRemove}
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}


          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.tagInput}
          />
        </div>

      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 48,
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  saveBtn: {
    background: "none",
    border: "none",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    background: "linear-gradient(134.86deg, #ABFFFD 2.64%, #4599DB 102.99%)" as any,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    padding: 0,
  },
  titleSection: {
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
    marginBottom: 8,
    background: "linear-gradient(134.86deg, #ABFFFD 2.64%, #4599DB 102.99%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontWeight: 600,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "white",
    lineHeight: 1.3,
  },
  tagBox: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: "12px 14px",
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 8,
    alignItems: "center",
    cursor: "text",
  },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 6,
    padding: "5px 10px",
    fontSize: 13,
    color: "white",
    fontWeight: 500,
  },
  tagRemove: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.5)",
    cursor: "pointer",
    fontSize: 16,
    lineHeight: 1,
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 16,
    height: 16,
    borderRadius: "50%",
    transition: "color 0.15s",
  },
  tagInput: {
    background: "none",
    border: "none",
    outline: "none",
    color: "white",
    fontSize: 13,
    minWidth: 120,
    flex: 1,
  },
  hintText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.25)",
    marginTop: 8,
    lineHeight: 1.6,
  },
  kbd: {
    background: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    padding: "1px 5px",
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    fontFamily: "monospace",
  },
  counter: {
    fontSize: 12,
    textAlign: "right" as const,
    marginTop: 6,
    marginBottom: 28,
  },
  suggestedSection: {
    marginTop: 8,
  },
  suggestedTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "rgba(255,255,255,0.4)",
    marginBottom: 14,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  },
  suggestedGrid: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 10,
  },
  suggestedTag: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 6,
    padding: "7px 14px",
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    cursor: "pointer",
    transition: "all 0.15s",
    fontWeight: 500,
  },
};
