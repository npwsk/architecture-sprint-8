const REPORT_TYPES = [
  'Usage Report',
  'Performance Report',
  'Security Report',
  'Audit Report',
];
const STATUSES = ['Completed', 'In Progress', 'Pending', 'Failed'];
const COUNT = 10;

const generateReportData = () => {
  const reports = [];

  for (let i = 0; i < COUNT; i++) {
    reports.push({
      id: i + 1,
      name: `${
        REPORT_TYPES[Math.floor(Math.random() * REPORT_TYPES.length)]
      } #${i + 1}`,
      date: new Date(
        Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
      )
        .toISOString()
        .split('T')[0],
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      size: `${Math.floor(Math.random() * 1000) + 1} KB`,
      generatedBy: `User ${Math.floor(Math.random() * 100) + 1}`,
    });
  }

  return reports;
};

module.exports = {
  generateReportData,
};
