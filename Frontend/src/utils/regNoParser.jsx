const COURSE_CODES = {
  'C025': 'Information Technology',
  'C026': 'Computer Science',
  'E001': 'Education (Arts)',
  'N004': 'Nursing',
  'B002': 'Business Administration'
  // Add more as needed
};

export const parseRegNo = (regNo) => {
  if (!regNo) return null;
  
  // Basic validation/cleaning
  const cleanRegNo = regNo.trim().toUpperCase();

  try {
    // Logic: Split "C026-01-0968/2022"
    const partsBySlash = cleanRegNo.split('/');
    const year = partsBySlash[1]; // "2022"

    const mainPart = partsBySlash[0]; // "C026-01-0968"
    const partsByDash = mainPart.split('-');
    const code = partsByDash[0]; // "C026"

    const departmentName = COURSE_CODES[code] || 'General Department';

    return {
      isValid: true,
      regNo: cleanRegNo,
      code,
      departmentName,
      year
    };
  } catch (error) {
    // If format is wrong, just return basic info
    return { 
      isValid: false, 
      regNo: cleanRegNo, 
      departmentName: 'General Department' 
    };
  }
};