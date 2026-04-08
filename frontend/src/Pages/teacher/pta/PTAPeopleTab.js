import React from 'react';

const PTAPeopleTab = ({ members }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-6">PTA Members</h3>
      
      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Position</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>
                    <span className={`badge ${
                      member.position === 'President' ? 'badge-primary' :
                      member.position === 'Secretary' ? 'badge-secondary' : 'badge-ghost'
                    }  p-2`}>
                      {member.position}
                    </span>
                  </td>
                  <td className="font-medium">{member.name}</td>
                  <td>{member.phone}</td>
                  <td>{member.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {members.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No PTA members found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PTAPeopleTab;