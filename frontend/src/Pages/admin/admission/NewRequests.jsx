import { useOutletContext } from 'react-router-dom';
import RequestsTable from '../../../components/admission/RequestsTable.jsx';

const NewRequests = () => {
  const { applications, setApplications } = useOutletContext();
  const rows = applications.filter(
    (a) => !['Accepted', 'Rejected', 'Not joined'].includes(a.status),
  );

  return (
    <RequestsTable
      rows={rows}
      highlightId={rows[0]?.id}
      showFilter
      fromPath="/admission/new"
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

export default NewRequests;
