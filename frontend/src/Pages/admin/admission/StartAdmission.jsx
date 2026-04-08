import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import AdmissionForm from './AdmissionForm.jsx';

const StartAdmission = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('upload');
  const [fileName, setFileName] = useState('');
  const [uploadRows, setUploadRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFilePick = () => fileInputRef.current?.click();

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);

      const formatted = data.map((row, idx) => ({
        applicationNo: `BULK-${Date.now()}-${idx + 1}`,
        academicYear: '2025 - 26',
        classRequired: String(row['Admission required for class'] || ''),
        syllabusPrimary: row['Syllabus'],
        firstName: row['First Name'],
        lastName: row['Last Name'],
        father: {
          name: row['Father Name'],
          phone: row['Phone'],
        },
      }));
      setUploadRows(formatted);
    };
    reader.readAsBinaryString(file);
  };

  const handleSaveUploads = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/admission/new');
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-[1200px] rounded-xl bg-white p-4 shadow-lg">
      {/* TOP TOGGLE */}
      <div className="mb-7 flex justify-center gap-4">
        <button
          className={[
            'rounded-lg border px-6 py-2 font-semibold transition-colors',
            mode === 'upload'
              ? 'border-sky-500 bg-sky-500 text-white'
              : 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200',
          ].join(' ')}
          onClick={() => setMode('upload')}
        >
          Bulk Upload
        </button>

        <button
          className={[
            'rounded-lg border px-6 py-2 font-semibold transition-colors',
            mode === 'form'
              ? 'border-sky-500 bg-sky-500 text-white'
              : 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200',
          ].join(' ')}
          onClick={() => setMode('form')}
        >
          Direct Entry
        </button>
      </div>

      {mode === 'upload' ? (
        <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-sky-200 bg-sky-50 p-8">
          <h3 className="mb-2 text-xl font-bold text-indigo-700">Upload Student List</h3>

          <p className="mb-6 max-w-md text-center text-gray-600">
            Upload an Excel file (.xlsx) containing student admission details to process multiple
            applications at once.
          </p>

          {/* PICK FILE */}
          <button
            onClick={handleFilePick}
            className="flex items-center gap-2.5 rounded-lg border border-dashed border-sky-200 bg-sky-50 px-[18px] py-3 font-semibold text-sky-600 transition-colors hover:bg-sky-100"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {fileName || 'Choose Excel File'}
          </button>

          <input type="file" ref={fileInputRef} hidden accept=".xlsx, .xls" onChange={onFileChange} />

          {/* PREVIEW TABLE */}
          {uploadRows.length > 0 && (
            <div className="mt-8 w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
                <h5 className="font-bold text-gray-800">Preview ({uploadRows.length} Students)</h5>
              </div>

              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="p-3 text-left font-semibold text-gray-800">Name</th>
                    <th className="p-3 text-left font-semibold text-gray-800">Class</th>
                    <th className="p-3 text-left font-semibold text-gray-800">Father</th>
                    <th className="p-3 text-left font-semibold text-gray-800">Phone</th>
                  </tr>
                </thead>

                <tbody>
                  {uploadRows.slice(0, 5).map((r, i) => (
                    <tr key={i} className="border-b border-gray-200 hover:bg-amber-50">
                      <td className="p-3 text-gray-800">
                        {r.firstName} {r.lastName}
                      </td>
                      <td className="p-3 text-gray-800">{r.classRequired}</td>
                      <td className="p-3 text-gray-800">{r.father?.name}</td>
                      <td className="p-3 text-gray-800">{r.father?.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {uploadRows.length > 5 && (
                <p className="border-t border-gray-200 bg-gray-50 p-3 text-center text-xs italic text-gray-500">
                  ...and {uploadRows.length - 5} more records
                </p>
              )}
            </div>
          )}

          {/* ACTIONS */}
          <div className="mt-6 flex w-full justify-end gap-2.5">
            <button
              className="rounded-lg bg-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200"
              onClick={() => {
                setUploadRows([]);
                setFileName('');
              }}
            >
              Cancel
            </button>

            <button
              className="rounded-lg bg-sky-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleSaveUploads}
              disabled={!uploadRows.length || loading}
            >
              {loading ? 'Processing...' : 'Save Uploads'}
            </button>
          </div>
        </div>
      ) : (
        <AdmissionForm hideEntryToggle showActions={true} />
      )}
    </div>
  );
};

export default StartAdmission;
