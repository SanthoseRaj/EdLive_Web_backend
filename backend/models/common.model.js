import pool from "../db/connectDB-pg.js";

const getParentCommunication=async({
    ids,
    communicationtype
})=>{
    let studentsQuery;
    if(communicationtype==="classes"){
studentsQuery=`
SELECT s.id student_id,
          father_name, father_contact, father_email,
          mother_name, mother_contact, mother_email,
          guardian_name, guardian_contact, guardian_email
      FROM students s 
      left JOIN student_parent_info a ON s.id = a.student_id
      WHERE class_id =ANY($1::int[]);
      `
    }
    if(communicationtype==="students"){
studentsQuery=`
SELECT 
        father_name, father_contact, father_email,
        mother_name, mother_contact, mother_email,
        guardian_name, guardian_contact, guardian_email
      FROM student_parent_info
      WHERE student_id = $1;
      `
    }
    return pool.query(studentsQuery, [ids]);
}
export{
    getParentCommunication
}