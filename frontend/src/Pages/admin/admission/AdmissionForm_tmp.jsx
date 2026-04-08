const documentList = [
  { label: "Signed copy of application form", files: ["BirthCertificate.pdf"] },
  { label: "Birth Certificate", files: ["TC.pdf"] },
  { label: "Transfer Certificate", files: [] },
  { label: "Aadhar", files: [] },
];

const AdmissionForm = () => {
  return (
    <div className="admission-form">
      <div className="table-toolbar form-toolbar">
        <button className="upload-tile">Upload excel</button>
        <span className="divider-text">OR</span>

        <label className="radio-inline">
          <input type="radio" checked readOnly /> Enter details
        </label>

        <span className="light-note">
          You can use this form, to store information from application forms received as hard copy.
        </span>
      </div>

      <div className="section-card">
        <div className="form-grid grid-2-auto">
          <div className="form-field inline-field">
            <label>Admission required for class</label>
            <select className="wide-select">
              <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>
            </select>
          </div>

          <div className="form-field">
            <label>
              Syllabus <span className="required-star">*</span>
            </label>
            <div className="radio-row">
              <label><input type="radio" name="syllabusPrimary" defaultChecked /> CBSE</label>
              <label><input type="radio" name="syllabusPrimary" /> ICSE</label>
              <label><input type="radio" name="syllabusPrimary" /> International</label>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <h3>Information of the student</h3>

        <div className="detail-pane">
          <label className="avatar-drop" htmlFor="student-photo">
            Upload Photo
            <input id="student-photo" type="file" accept="image/*" capture="environment" className="sr-only" />
          </label>

          <div className="detail-right">
            <div className="form-grid">
              <div className="form-field">
                <label>
                  First name <span className="required-star">*</span>
                </label>
                <input placeholder="First name" />
              </div>
              <div className="form-field">
                <label>Middle name</label>
                <input />
              </div>
              <div className="form-field">
                <label>
                  Last name <span className="required-star">*</span>
                </label>
                <input />
              </div>
            </div>

            <div className="form-grid mt-10px">
              <div className="form-field span-2">
                <label>Address</label>
                <input />
              </div>
              <div className="form-field">
                <label>Door No./House</label>
                <input />
              </div>
              <div className="form-field">
                <label>Street</label>
                <input />
              </div>
              <div className="form-field">
                <label>City/region</label>
                <input />
              </div>
            </div>
          </div>
        </div>

        <div className="form-grid mt-10px">
          <div className="form-field">
            <label>
              Date of birth <span className="required-star">*</span>
            </label>
            <input placeholder="dd/mm/yy" />
          </div>
          <div className="form-field">
            <label>
              Gender <span className="required-star">*</span>
            </label>
            <select className="wide-select">
              <option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option>
            </select>
          </div>
          <div className="form-field">
            <label>
              Mother tongue <span className="required-star">*</span>
            </label>
            <input />
          </div>
          <div className="form-field">
            <label>
              Blood group <span className="required-star">*</span>
            </label>
            <select className="wide-select">
              <option>A +ve</option><option>A -ve</option><option>B +ve</option><option>B -ve</option>
              <option>AB +ve</option><option>AB -ve</option><option>O +ve</option><option>O -ve</option>
            </select>
          </div>
          <div className="form-field">
            <label>
              Nationality <span className="required-star">*</span>
            </label>
            <input list="nationalityOptions" placeholder="Enter nationality" />
            <datalist id="nationalityOptions">
              <option value="Indian" />
              <option value="American" />
              <option value="British" />
              <option value="Canadian" />
              <option value="Other" />
            </datalist>
          </div>
        </div>
      </div>

      <div className="section-card">
        <h3>Student&apos;s health</h3>
        <div className="form-grid">
          <div className="form-field">
            <label>Any kind of disabilities?</label>
            <div className="radio-row tight">
              <label><input type="radio" /> No</label>
              <label><input type="radio" /> Yes</label>
            </div>
          </div>

          <div className="form-field">
            <label>Any existing disease</label>
            <div className="radio-row tight">
              <label><input type="radio" /> No</label>
              <label><input type="radio" defaultChecked /> Yes</label>
            </div>
            <input placeholder="Asthma" />
          </div>

          <div className="form-field">
            <label>Immunization?</label>
            <div className="radio-row tight">
              <label><input type="radio" /> No</label>
              <label><input type="radio" /> Yes</label>
              <label><input type="radio" /> Partial</label>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <h3>Previous school information</h3>
        <div className="form-grid">
          <div className="form-field span-2">
            <label>Name of the school</label>
            <input />
          </div>
          <div className="form-field">
            <label>Country</label>
            <select><option>India</option><option>Other</option></select>
          </div>
          <div className="form-field">
            <label>State</label>
            <select><option>Kerala</option><option>Other</option></select>
          </div>
          <div className="form-field">
            <label>District</label>
            <input />
          </div>
          <div className="form-field span-2">
            <label>
              Syllabus <span className="required-star">*</span>
            </label>
            <div className="radio-row tight wrap">
              <label><input type="radio" name="syllabusPrevious" /> CBSE</label>
              <label><input type="radio" name="syllabusPrevious" /> ICSE</label>
              <label><input type="radio" name="syllabusPrevious" /> International</label>
              <label><input type="radio" name="syllabusPrevious" /> State</label>
              <label><input type="radio" name="syllabusPrevious" /> Other</label>
            </div>
          </div>
          <div className="form-field">
            <label>Scored</label>
            <input />
          </div>
          <div className="form-field">
            <label>Out of</label>
            <input />
          </div>
        </div>
      </div>

      <div className="section-card">
        <h3>Family/guardian information</h3>

        <div className="form-grid grid-2-auto">
          <div className="guardian-card">
            <div className="avatar-drop">Upload Photo</div>
            <div className="form-field grow">
              <label>Father</label>
              <input placeholder="Name" />
              <input placeholder="Date of birth" />
              <input placeholder="Phone (include country code)" />
              <input placeholder="Email" />
              <input placeholder="Address" />
            </div>
          </div>

          <div className="guardian-card">
            <div className="avatar-drop">Upload Photo</div>
            <div className="form-field grow">
              <label>Mother</label>
              <input placeholder="Name" />
              <input placeholder="Date of birth" />
              <input placeholder="Phone (include country code)" />
              <input placeholder="Email" />
              <input placeholder="Address" />
            </div>
          </div>

          <div className="form-field span-2">
            <label>Is local guardian different?</label>
            <div className="radio-row tight">
              <label><input type="radio" /> No</label>
              <label><input type="radio" defaultChecked /> Yes</label>
            </div>
          </div>

          <div className="guardian-card">
            <div className="avatar-drop">Upload Photo</div>
            <div className="form-field grow">
              <label>Local guardian</label>
              <input placeholder="Name" />
              <input placeholder="Date of birth" />
              <input placeholder="Phone (include country code)" />
              <input placeholder="Email" />
            </div>
          </div>

          <div className="form-field">
            <label>Any sibling studying in the same school?</label>
            <div className="radio-row tight">
              <label><input type="radio" /> No</label>
              <label><input type="radio" /> Yes</label>
            </div>
            <input placeholder="Name" />
            <input placeholder="ID no." />
          </div>
        </div>
      </div>

      <div className="section-card">
        <h3>Religion, cast, category</h3>
        <div className="form-grid grid-3-auto">
          <div className="form-field">
            <label>Category</label>
            <div className="radio-row tight">
              <label><input type="radio" /> SC/ST</label>
              <label><input type="radio" /> OBC</label>
              <label><input type="radio" defaultChecked /> General</label>
            </div>
          </div>
          <div className="form-field">
            <label>Religion</label>
            <select>
              <option>Non religion</option>
              <option>Hindu</option>
              <option>Muslim</option>
            </select>
          </div>
          <div className="form-field span-2">
            <label>Cast</label>
            <input placeholder="Enter cast (if you want to collect the data)" />
          </div>
        </div>
      </div>

      <div className="section-card">
        <h3>Upload documents (all documents are mandatory, if a field is created)</h3>

        {documentList.map((doc, idx) => (
          <div key={doc.label} className="form-grid doc-row">
            <div className="form-field span-2">
              <label>
                {idx + 1}. {doc.label}
              </label>

              <div className="doc-actions">
                <button className="btn ghost">Select</button>
                <button className="btn primary">Upload</button>

                <div className="doc-files">
                  {doc.files.map((file) => (
                    <span key={file} className="doc-file">
                      {file} <span aria-hidden="true">×</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        <button className="btn ghost add-doc">+ Add more document</button>
      </div>

      <div className="action-buttons right">
        <button className="btn ghost">Cancel</button>
        <button className="btn primary">Save</button>
        <button className="btn success">Confirm Admission</button>
      </div>
    </div>
  );
};

export default AdmissionForm;
