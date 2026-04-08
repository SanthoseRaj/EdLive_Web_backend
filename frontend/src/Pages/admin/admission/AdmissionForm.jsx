import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const initialDocs = [
  { label: "Signed copy of application form", files: [] },
  { label: "Birth Certificate", files: [] },
  { label: "Transfer Certificate", files: [] },
  { label: "Aadhar", files: [] },
];

const AdmissionForm = ({ hideEntryToggle = false, initialData = {}, showActions = true }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const prefill = useMemo(() => initialData || {}, [initialData]);

  const [docs, setDocs] = useState(prefill.docs || initialDocs);
  const [photos, setPhotos] = useState({
    student: null,
    father: null,
    mother: null,
    guardian: null,
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "Male",
  });

  const [activePicker, setActivePicker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const triggerFilePicker = (type, key) => {
    setActivePicker({ type, key });
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !activePicker) return;
    const url = URL.createObjectURL(file);

    if (activePicker.type === "photo") {
      setPhotos((p) => ({ ...p, [activePicker.key]: url }));
    } else {
      setDocs((d) => d.map((doc, i) => (i === activePicker.key ? { ...doc, files: [url] } : doc)));
    }

    setActivePicker(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Shared UI classes (Tailwind only)
  const card = "rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200";
  const h3 = "text-[16px] font-extrabold text-[#204098]";
  const label = "text-[13px] font-semibold text-slate-700";
  const help = "text-[12px] font-medium text-slate-400";
  const input =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-800 outline-none transition focus:border-[#18B0D8] focus:ring-2 focus:ring-[#18B0D8]/25";
  const select = input;
  const radioWrap = "flex flex-wrap items-center gap-4 text-[14px] text-slate-700";
  const radio = "inline-flex items-center gap-2";
  const btnPrimary =
    "inline-flex h-10 items-center justify-center rounded-lg bg-[#18B0D8] px-4 text-[14px] font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-60";
  const btnGhost =
    "inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-[14px] font-semibold text-slate-700 transition hover:bg-slate-50";
  const btnBlue =
    "inline-flex h-10 items-center justify-center rounded-lg bg-[#204098] px-4 text-[14px] font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-60";
  const btnSuccess =
    "inline-flex h-10 items-center justify-center rounded-lg bg-[#2FA84F] px-4 text-[14px] font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-60";

  const PhotoTile = ({ value, onClick, labelText = "Upload Photo", subText }) => (
    <button
      type="button"
      onClick={onClick}
      className="group relative grid h-36 w-32 place-items-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-100"
    >
      {value ? (
        <>
          <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/10 opacity-0 transition group-hover:opacity-100" />
          <div className="relative z-10 rounded-full bg-white/80 px-3 py-1 text-[12px] font-bold text-slate-800 opacity-0 transition group-hover:opacity-100">
            Change
          </div>
        </>
      ) : (
        <div className="px-2 text-center">
          <div>{labelText}</div>
          {subText ? <div className="mt-1 text-[11px] font-medium text-slate-400">{subText}</div> : null}
        </div>
      )}
    </button>
  );

  return (
    <div className="space-y-8">
      {/* ================= STUDENT INFO ================= */}
      <section className={`${card} space-y-4`}>
        <div className="flex items-start justify-between gap-4">
          <h3 className={h3}>Student Information</h3>
          {!hideEntryToggle ? (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-[13px] font-semibold text-slate-400">Mode:</span>
              <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-slate-700">
                <input type="radio" checked readOnly />
                Enter details
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          <PhotoTile
            value={photos.student}
            onClick={() => triggerFilePicker("photo", "student")}
            labelText="Upload Photo"
            subText="Student"
          />

          <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <div className={label}>First name <span className="text-[#D02020]">*</span></div>
              <input className={input} placeholder="First name" />
            </div>
            <div>
              <div className={label}>Middle name</div>
              <input className={input} placeholder="Middle name" />
            </div>
            <div>
              <div className={label}>Last name <span className="text-[#D02020]">*</span></div>
              <input className={input} placeholder="Last name" />
            </div>

            <div>
              <div className={label}>DOB <span className="text-[#D02020]">*</span></div>
              <input className={input} placeholder="dd/mm/yy" />
            </div>

            <div>
              <div className={label}>Gender <span className="text-[#D02020]">*</span></div>
              <select className={select} defaultValue={formData.gender}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </div>

            <div>
              <div className={label}>Mother Tongue</div>
              <input className={input} placeholder="Mother tongue" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= SIBLING ================= */}
      <section className={`${card} space-y-4`}>
        <h3 className={h3}>Sibling Information</h3>

        <div className="space-y-3">
          <div className={radioWrap}>
            <label className={radio}><input type="radio" name="hasSibling" /> No</label>
            <label className={radio}><input type="radio" name="hasSibling" /> Yes</label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className={label}>Sibling Name</div>
              <input className={input} placeholder="Sibling name" />
            </div>
            <div>
              <div className={label}>Sibling ID</div>
              <input className={input} placeholder="Sibling ID" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= HEALTH ================= */}
      <section className={`${card} space-y-4`}>
        <h3 className={h3}>Student Health</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <div className={label}>Disability</div>
            <div className={radioWrap}>
              <label className={radio}><input type="radio" name="disability" /> No</label>
              <label className={radio}><input type="radio" name="disability" /> Yes</label>
            </div>
          </div>

          <div className="space-y-2">
            <div className={label}>Disease</div>
            <div className={radioWrap}>
              <label className={radio}><input type="radio" name="disease" /> No</label>
              <label className={radio}><input type="radio" name="disease" /> Yes</label>
            </div>
            <input className={input} placeholder="Disease name" />
          </div>

          <div className="space-y-2">
            <div className={label}>Immunization</div>
            <div className={radioWrap}>
              <label className={radio}><input type="radio" name="immunization" /> No</label>
              <label className={radio}><input type="radio" name="immunization" /> Yes</label>
              <label className={radio}><input type="radio" name="immunization" /> Partial</label>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PREVIOUS SCHOOL ================= */}
      <section className={`${card} space-y-4`}>
        <h3 className={h3}>Previous School Information</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className={label}>School Name</div>
            <input className={input} placeholder="School name" />
          </div>
          <div>
            <div className={label}>Country</div>
            <input className={input} placeholder="Country" />
          </div>
          <div>
            <div className={label}>State</div>
            <input className={input} placeholder="State" />
          </div>
          <div>
            <div className={label}>District</div>
            <input className={input} placeholder="District" />
          </div>
          <div>
            <div className={label}>Scored</div>
            <input className={input} placeholder="Scored" />
          </div>
          <div>
            <div className={label}>Out of</div>
            <input className={input} placeholder="Out of" />
          </div>
        </div>
      </section>

      {/* ================= FAMILY ================= */}
      <section className={`${card} space-y-6`}>
        <h3 className={h3}>Family / Guardian Information</h3>

        {["father", "mother", "guardian"].map((role) => (
          <div key={role} className="grid grid-cols-1 gap-4 md:grid-cols-4 md:items-start">
            <PhotoTile
              value={photos[role]}
              onClick={() => triggerFilePicker("photo", role)}
              labelText="Upload"
              subText={role.charAt(0).toUpperCase() + role.slice(1)}
            />

            <div className="grid grid-cols-1 gap-4 md:col-span-3 md:grid-cols-2">
              <div>
                <div className={label}>{role} name</div>
                <input className={input} placeholder={`${role} name`} />
              </div>
              <div>
                <div className={label}>DOB</div>
                <input className={input} placeholder="dd/mm/yy" />
              </div>
              <div>
                <div className={label}>Phone</div>
                <input className={input} placeholder="Phone" />
              </div>
              <div>
                <div className={label}>Email</div>
                <input className={input} placeholder="Email" />
              </div>
              <div className="md:col-span-2">
                <div className={label}>Address</div>
                <input className={input} placeholder="Address" />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ================= RELIGION ================= */}
      <section className={`${card} space-y-4`}>
        <h3 className={h3}>Religion / Caste / Category</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <div className={label}>Category</div>
            <select className={select} defaultValue="General">
              <option>General</option>
              <option>OBC</option>
              <option>SC/ST</option>
            </select>
          </div>

          <div>
            <div className={label}>Religion</div>
            <select className={select} defaultValue="Non religion">
              <option>Non religion</option>
              <option>Hindu</option>
              <option>Muslim</option>
            </select>
          </div>

          <div>
            <div className={label}>Caste</div>
            <input className={input} placeholder="Caste" />
          </div>
        </div>

        <div className={help}>Optional: collect caste only if your school requires it.</div>
      </section>

      {/* ================= DOCUMENTS ================= */}
      <section className={`${card} space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className={h3}>Documents</h3>
          <div className={help}>Upload one file per document type</div>
        </div>

        <div className="space-y-4">
          {docs.map((doc, i) => (
            <div key={i} className="space-y-2">
              <div className={label}>{doc.label}</div>

              <div className="flex flex-col gap-2 md:flex-row">
                <input readOnly value={doc.files[0] || ""} className={input} />
                <button type="button" onClick={() => triggerFilePicker("doc", i)} className={btnPrimary}>
                  Upload
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

      {/* ================= ACTIONS ================= */}
      {showActions ? (
        <div className="flex flex-wrap items-center justify-end gap-3">
          {errorMessage ? (
            <div className="mr-auto rounded-lg bg-[#FFECEC] px-3 py-2 text-[13px] font-semibold text-[#D84545] ring-1 ring-[#FFC6C6]">
              {errorMessage}
            </div>
          ) : null}

          <button type="button" className={btnGhost} onClick={() => navigate("/admission")}>
            Cancel
          </button>

          <button type="button" className={btnBlue} disabled={loading}>
            Save
          </button>

        </div>
      ) : null}
    </div>
  );
};

export default AdmissionForm;
