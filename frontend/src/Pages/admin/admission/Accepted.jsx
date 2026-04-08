import { useOutletContext } from 'react-router-dom';
import RequestsTable from '../../../components/admission/RequestsTable.jsx';

const Accepted = () => {
  const { applications, setApplications } = useOutletContext();
  const rows = applications.filter((a) => a.status === 'Accepted');

  return (
    <RequestsTable
      rows={rows}
      fromPath="/admission/accepted"
      readOnlyStatus
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

export default Accepted;
