const titleCase = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const buildDetailFields = (app) => [
  { label: 'Admission required for class', value: app.classRequired },
  { label: 'Syllabus', value: app.syllabus },
  { label: 'Date of birth', value: app.dob },
  { label: 'Mother tongue', value: app.motherTongue },
  { label: 'Blood group', value: app.bloodGroup },
  { label: 'Nationality', value: app.nationality },
  { label: 'Address', value: app.address },
  { label: 'Door No./House', value: app.door },
  { label: 'Street', value: app.street },
  { label: 'City/region', value: app.city },
  { label: 'Sibling', value: `${app.siblingName} (${app.siblingId})` },
  {
    label: 'Health',
    value: `${app.disability === 'Yes' ? 'Has disability' : 'No disability'}; Disease: ${app.diseaseStatus}${
      app.diseaseNotes ? ` (${app.diseaseNotes})` : ''
    }; Immunization: ${app.immunization}`,
  },
  {
    label: 'Previous school',
    value: `${app.previousSchool.name}, ${app.previousSchool.district}, ${app.previousSchool.state}`,
  },
  { label: 'Previous syllabus', value: app.previousSchool.syllabus },
  { label: 'Previous score', value: `${app.previousSchool.scored} / ${app.previousSchool.outOf}` },
  { label: 'Father contact', value: `${app.father.phone} | ${app.father.email}` },
  { label: 'Mother contact', value: `${app.mother.phone} | ${app.mother.email}` },
  { label: 'Guardian contact', value: `${app.guardian.phone} | ${app.guardian.email}` },
  { label: 'Category', value: app.category },
  { label: 'Religion', value: app.religion },
  { label: 'Cast', value: app.caste },
];

const applicantSeeds = [
  { id: 'A101', suffix: 'one', gender: 'M', classLevel: 5, status: 'Shortlisted', applied: '5, May 2019', classRequired: '5', syllabus: 'CBSE', motherTongue: 'English', bloodGroup: 'A +ve' },
  { id: 'A102', suffix: 'two', gender: 'F', classLevel: 1, status: 'Viewed', applied: '4, May 2019', classRequired: '1', syllabus: 'CBSE', motherTongue: 'Malayalam', bloodGroup: 'B +ve' },
  { id: 'A103', suffix: 'three', gender: 'M', classLevel: 2, status: 'Unread', applied: '6, May 2019', classRequired: '2', syllabus: 'ICSE', motherTongue: 'Hindi', bloodGroup: 'O +ve' },
  { id: 'A104', suffix: 'four', gender: 'M', classLevel: 3, status: 'Interview', applied: '7, May 2019', classRequired: '3', syllabus: 'CBSE', motherTongue: 'English', bloodGroup: 'AB +ve' },
  { id: 'A105', suffix: 'five', gender: 'F', classLevel: 4, status: 'Shortlisted', applied: '8, May 2019', classRequired: '4', syllabus: 'International', motherTongue: 'Tamil', bloodGroup: 'A -ve' },
  { id: 'A106', suffix: 'six', gender: 'M', classLevel: 5, status: 'Viewed', applied: '9, May 2019', classRequired: '5', syllabus: 'CBSE', motherTongue: 'English', bloodGroup: 'B -ve' },
  { id: 'A107', suffix: 'seven', gender: 'F', classLevel: 6, status: 'Unread', applied: '10, May 2019', classRequired: '6', syllabus: 'ICSE', motherTongue: 'Hindi', bloodGroup: 'O -ve' },
  { id: 'A108', suffix: 'eight', gender: 'M', classLevel: 7, status: 'Interview', applied: '11, May 2019', classRequired: '7', syllabus: 'CBSE', motherTongue: 'English', bloodGroup: 'AB -ve' },
  { id: 'A109', suffix: 'nine', gender: 'F', classLevel: 8, status: 'Shortlisted', applied: '12, May 2019', classRequired: '8', syllabus: 'CBSE', motherTongue: 'English', bloodGroup: 'A +ve' },
  { id: 'A110', suffix: 'ten', gender: 'M', classLevel: 9, status: 'Viewed', applied: '13, May 2019', classRequired: '9', syllabus: 'International', motherTongue: 'Hindi', bloodGroup: 'B +ve' },
  { id: 'A201', suffix: 'eleven', gender: 'F', classLevel: 1, status: 'Accepted', applied: '14, May 2019', classRequired: '1', syllabus: 'CBSE', motherTongue: 'English', bloodGroup: 'O +ve' },
  { id: 'A202', suffix: 'twelve', gender: 'M', classLevel: 2, status: 'Accepted', applied: '15, May 2019', classRequired: '2', syllabus: 'ICSE', motherTongue: 'English', bloodGroup: 'A +ve' },
  { id: 'A203', suffix: 'thirteen', gender: 'F', classLevel: 3, status: 'Accepted', applied: '16, May 2019', classRequired: '3', syllabus: 'CBSE', motherTongue: 'Malayalam', bloodGroup: 'B +ve' },
  { id: 'A204', suffix: 'fourteen', gender: 'M', classLevel: 4, status: 'Accepted', applied: '17, May 2019', classRequired: '4', syllabus: 'International', motherTongue: 'English', bloodGroup: 'AB +ve' },
  { id: 'A205', suffix: 'fifteen', gender: 'F', classLevel: 5, status: 'Accepted', applied: '18, May 2019', classRequired: '5', syllabus: 'CBSE', motherTongue: 'Hindi', bloodGroup: 'A -ve' },
  { id: 'A301', suffix: 'sixteen', gender: 'M', classLevel: 6, status: 'Rejected', applied: '19, May 2019', classRequired: '6', syllabus: 'CBSE', motherTongue: 'English', bloodGroup: 'B -ve' },
  { id: 'A302', suffix: 'seventeen', gender: 'F', classLevel: 7, status: 'Rejected', applied: '20, May 2019', classRequired: '7', syllabus: 'ICSE', motherTongue: 'English', bloodGroup: 'O +ve' },
  { id: 'A303', suffix: 'eighteen', gender: 'M', classLevel: 8, status: 'Rejected', applied: '21, May 2019', classRequired: '8', syllabus: 'CBSE', motherTongue: 'English', bloodGroup: 'AB -ve' },
  { id: 'A304', suffix: 'nineteen', gender: 'F', classLevel: 9, status: 'Not joined', applied: '22, May 2019', classRequired: '9', syllabus: 'International', motherTongue: 'Tamil', bloodGroup: 'A +ve' },
  { id: 'A305', suffix: 'twenty', gender: 'M', classLevel: 10, status: 'Rejected', applied: '23, May 2019', classRequired: '10', syllabus: 'CBSE', motherTongue: 'English', bloodGroup: 'B +ve' },
];

export const applicationsWithDetails = applicantSeeds.map((seed, idx) => {
  const lastName = titleCase(seed.suffix);
  const address = `Door No. ${seed.id.replace('A', '')}, Street ${seed.classLevel}, City/region`;
  const phoneSuffix = (100 + idx).toString().padStart(3, '0');
  const previousSchool = {
    name: `Central School ${seed.classLevel}`,
    country: 'India',
    state: idx % 2 === 0 ? 'Kerala' : 'Karnataka',
    district: idx % 2 === 0 ? 'Ernakulam' : 'Bengaluru',
    syllabus: seed.syllabus,
    scored: `${80 + (idx % 5) * 3}%`,
    outOf: '100%',
  };

  const applicant = {
    id: seed.id,
    status: seed.status,
    name: `Studentname ${seed.suffix}`,
    firstName: 'Studentname',
    middleName: idx % 3 === 0 ? 'K' : '',
    lastName,
    gender: seed.gender,
    classLevel: seed.classLevel,
    classRequired: seed.classRequired,
    syllabus: seed.syllabus,
    applied: seed.applied,
    appliedOn: seed.applied,
    address,
    door: address.split(',')[0],
    street: `Street ${seed.classLevel}`,
    city: 'City/region',
    dob: `${String(5 + (idx % 20)).padStart(2, '0')}/05/2013`,
    motherTongue: seed.motherTongue,
    bloodGroup: seed.bloodGroup,
    nationality: 'Indian',
    siblingName: `Sibling ${seed.suffix}`,
    siblingId: `S${seed.id}`,
    disability: idx % 7 === 0 ? 'Yes' : 'No',
    diseaseStatus: idx % 5 === 0 ? 'Yes' : 'No',
    diseaseNotes: idx % 5 === 0 ? 'Asthma - on inhaler' : '',
    immunization: idx % 4 === 0 ? 'Partial' : 'Yes',
    previousSchool,
    father: {
      name: `Father ${lastName}`,
      dob: '01/01/1980',
      phone: `+91 90000${phoneSuffix}`,
      email: `father${idx + 1}@example.com`,
      address,
    },
    mother: {
      name: `Mother ${lastName}`,
      dob: '02/02/1982',
      phone: `+91 90010${phoneSuffix}`,
      email: `mother${idx + 1}@example.com`,
      address,
    },
    guardian: {
      name: `Guardian ${lastName}`,
      dob: '03/03/1975',
      phone: `+91 90020${phoneSuffix}`,
      email: `guardian${idx + 1}@example.com`,
      address,
    },
    category: idx % 4 === 0 ? 'OBC' : 'General',
    religion: idx % 3 === 0 ? 'Hindu' : idx % 3 === 1 ? 'Muslim' : 'Non religion',
    caste: idx % 2 === 0 ? 'NA' : 'N/A',
    photos: {},
  };

  applicant.detailFields = buildDetailFields(applicant);
  return applicant;
});

export const applicationsById = applicationsWithDetails.reduce((acc, app) => {
  acc[app.id] = app;
  return acc;
}, {});
