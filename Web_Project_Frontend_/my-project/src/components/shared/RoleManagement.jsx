import React, { useEffect, useState } from "react";
import { applyThemeMode, getCurrentProfile, updateCurrentProfile } from "../../services/profile/ProfileService";

const MAX_IMAGE_WIDTH = 720;
const MAX_IMAGE_HEIGHT = 720;
const TARGET_MAX_BYTES = 500 * 1024;

function RoleManagement({ title }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    photo: "",
    password: "",
    themeMode: "dark",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getCurrentProfile();
        const themeMode = profile?.themeMode || "dark";
        setFormData({
          name: profile?.name || "",
          email: profile?.email || "",
          photo: profile?.photo || "",
          password: "",
          themeMode,
        });
        applyThemeMode(themeMode);
      } catch (err) {
        setError("Could not load profile details.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "themeMode") {
      applyThemeMode(value);
    }
  };

  const onPhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const sourceDataUrl = reader.result;
      if (typeof sourceDataUrl !== "string") return;

      const img = new Image();
      img.onload = () => {
        const scale = Math.min(
          MAX_IMAGE_WIDTH / img.width,
          MAX_IMAGE_HEIGHT / img.height,
          1
        );
        const width = Math.max(1, Math.floor(img.width * scale));
        const height = Math.max(1, Math.floor(img.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setError("Image processing failed.");
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        let compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

        while (compressedDataUrl.length > TARGET_MAX_BYTES * 1.37 && quality > 0.45) {
          quality -= 0.1;
          compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        updateField("photo", compressedDataUrl);
        setError("");
      };
      img.onerror = () => {
        setError("Failed to process selected image.");
      };
      img.src = sourceDataUrl;
    };
    reader.onerror = () => {
      setError("Failed to read selected image.");
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        photo: formData.photo,
        themeMode: formData.themeMode,
      };
      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }
      const updatedProfile = await updateCurrentProfile(payload);
      window.dispatchEvent(
        new CustomEvent("profile-updated", {
          detail: {
            name: updatedProfile?.name || payload.name,
            photo: updatedProfile?.photo || payload.photo,
          },
        })
      );
      setSuccess("Profile updated successfully.");
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="mh-subtitle">Loading management settings...</p>;
  }

  return (
    <section className="mh-surface p-6 sm:p-8 max-w-2xl mx-auto">
      <h1 className="mh-title">{title}</h1>
      <p className="mh-subtitle mt-2">Update your details, profile photo and preferred theme.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {error && <div className="text-red-400 text-sm">{error}</div>}
        {success && <div className="text-emerald-400 text-sm">{success}</div>}

        <div>
          <label className="block text-sm mb-2">Name</label>
          <input
            className="mh-input"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-2">Email</label>
          <input
            type="email"
            className="mh-input"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-2">Upload Photo From Device</label>
          <input
            type="file"
            accept="image/*"
            className="mh-input"
            onChange={onPhotoUpload}
          />
          {formData.photo ? (
            <img
              src={formData.photo}
              alt="Profile preview"
              className="mt-3 w-20 h-20 rounded-full object-cover border border-white/20"
            />
          ) : null}
        </div>

        <div>
          <label className="block text-sm mb-2">New Password (optional)</label>
          <input
            type="password"
            className="mh-input"
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-2">Theme Mode</label>
          <div className="flex gap-3">
            <button
              type="button"
              className={`mh-btn-secondary ${formData.themeMode === "dark" ? "ring-2 ring-violet-500" : ""}`}
              onClick={() => updateField("themeMode", "dark")}
            >
              Dark Mode
            </button>
            <button
              type="button"
              className={`mh-btn-secondary ${formData.themeMode === "light" ? "ring-2 ring-violet-500" : ""}`}
              onClick={() => updateField("themeMode", "light")}
            >
              Light Mode
            </button>
          </div>
        </div>

        <button type="submit" className="mh-btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
}

export default RoleManagement;
