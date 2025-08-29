import React from 'react';

const ScheduleTable = ({ scheduleData }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Monday</th>
          <th>Tuesday</th>
          <th>Wednesday</th>
          <th>Thursday</th>
          <th>Friday</th>
        </tr>
      </thead>
      <tbody>
        {scheduleData.map((row, index) => (
          <tr key={index}>
            <td>{row.time}</td>
            {row.classes.map((classData, classIndex) => (
              <td key={classIndex}>
                {classData.className}
                <br />
                {classData.location}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ScheduleTable;