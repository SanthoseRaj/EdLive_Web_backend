import { useOutletContext } from 'react-router-dom';
import RequestsTable from '../../../components/admission/RequestsTable.jsx';

const Rejected = () => {
  const { applications, setApplications } = useOutletContext();
  const rows = applications.filter((a) => ['Rejected', 'Not joined'].includes(a.status));

  return (
    <RequestsTable
      rows={rows}
      fromPath="/admission/rejected"
      statusOptions={['Rejected', 'Not joined']}
      onStatusChange={(id, newStatus, otherText) => {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === id ? { ...app, status: newStatus === 'Other' ? otherText : newStatus } : app,
          ),
        );
      }}
    />
  );
};

export default Rejected;
