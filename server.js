import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3000;
const connection = await mysql.createConnection( 
    {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  timezone:'Z'
}) 
// console.log(connection)
app.get('/', (req, res) => {
  res.redirect('/applicants');
});

app.get('/applicants', async (req,res) => {
    // show all the rows from the master table in the main applicants 
    // with edit and view all details function

    const page = parseInt(req.query.page) || 1;
    const recordsPerPage = parseInt(req.query.limit) || 2;
    const recordsToSkip = (page - 1 ) * recordsPerPage;


    const allowedSortColumns = ['id','first_name','email'];
    const currentSort = allowedSortColumns.includes(req.query.sort) ? req.query.sort : 'id'; 
    const currentOrder = ['ASC','DESC'].includes((req.query.order || '').toUpperCase()) ? req.query.order.toUpperCase() : 'ASC';

    const searchString = req.query.searchValue || ''
    const searchVal = '%'+searchString.trim()+'%';


    
  const queryToFetchPaginatedApplicants = `SELECT * FROM applicant_details ORDER BY ${currentSort} ${currentOrder} LIMIT ? OFFSET ?`;
  const queryWithSearch = `SELECT * from applicant_details WHERE id LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR  phone LIKE ? ORDER BY ${currentSort} ${currentOrder} LIMIT ? OFFSET ?`;
  const queryToFetchRecordCount = 'SELECT count(*) as totalCount from applicant_details';

  const [result] = await connection.query(queryToFetchRecordCount);
  const totalRecords = result[0].totalCount;    
  const totalPagesRequired = Math.ceil(totalRecords/recordsPerPage);
  console.log(totalPagesRequired)
    try {
       if(searchString) {
          const queryToCountRecords = `SELECT count(*) as totalRecords from applicant_details WHERE id LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR  phone LIKE ?`;
           
          const [result] = await connection.query(queryToCountRecords,[searchVal,searchVal,searchVal,searchVal,searchVal]);
          const totalRecords = result[0].totalRecords;

          const totalPagesRequired = Math.ceil(totalRecords/recordsPerPage);

           const [rows] = await connection.query(queryWithSearch,[searchVal,searchVal,searchVal,searchVal,recordsPerPage,recordsToSkip]);
           res.render('list', {
        applicants:rows,
        currentPage : page,
        totalRecords,
        totalPagesRequired,
        currentOrder,
        currentSort,
        searchString
    })
       } else {
        const [rows] = await connection.query(queryToFetchPaginatedApplicants,[recordsPerPage,recordsToSkip]);
        // console.log(rows)
        res.render('list', {
        applicants:rows,
        currentPage : page,
        totalRecords,
        totalPagesRequired,
        currentOrder,
        currentSort,
        searchString
    })
       }
    } catch (error) {
        console.log('Error Occurred at database level pleas check logs',error)
        res.status(500).send("Something went wrong!!...")
    }

}) 

app.get('/form', (req,res) => {
    res.render('form')
})

let data = {}
app.post('/form/add', async (req,res) => {
    let step = 'applicant_details';
    
    try {
        await connection.beginTransaction();

        console.log('[CRUD] Step:', step);
        const [result] = await connection.execute(
            `INSERT INTO applicant_details (first_name, last_name, designation, email, phone, gender, relationship_status, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.body.first_name, req.body.last_name, req.body.designation, req.body.email, req.body.phone_number, req.body.gender, req.body.relationship_status, req.body.dob]
        );
        const applicantId = result.insertId;

        step = 'applicant_addresses';
        console.log('[CRUD] Step:', step);
        await connection.execute(
            `INSERT INTO applicant_addresses (applicant_id, address_line_1, address_line_2, city, state, zip_code) VALUES (?, ?, ?, ?, ?, ?)`,
            [applicantId, req.body.address_1, req.body.address_2 || null, req.body.city, req.body.state, req.body.zip_code]
        );

        step = 'education_records';
        console.log('[CRUD] Step:', step);
        const educationKeys = Object.keys(req.body).filter(key => key.startsWith('degree'));
        for (let i = 1; i <= educationKeys.length; i++) {
            const degree = req.body[`degree${i}`];
            const yearOfPassing = req.body[`year_of_passing${i}`];
            const institution = req.body[`institution${i}`];
            const percentage = req.body[`percentage${i}`];
            if (degree && yearOfPassing && institution && percentage) {
                await connection.execute(
                    `INSERT INTO education_records (applicant_id, course_name, passing_year, board_university, result_percentage) VALUES (?, ?, ?, ?, ?)`,
                    [applicantId, degree, yearOfPassing, institution, parseFloat(percentage)]
                );
            }
        }

        step = 'work_experiences';
        console.log('[CRUD] Step:', step);
        const workKeys = Object.keys(req.body).filter(key => key.startsWith('company_name'));
        for (let i = 1; i <= workKeys.length; i++) {
            const companyName = req.body[`company_name${i}`];
            const jobTitle = req.body[`job_title${i}`];
            const startDate = req.body[`start_date${i}`];
            const endDate = req.body[`end_date${i}`];
            const salary = req.body[`salary${i}`];
            const description = req.body[`description${i}`];
            if (companyName && jobTitle && startDate && endDate && salary && description) {
                await connection.execute(
                    `INSERT INTO work_experiences (applicant_id, company_name, designation, from_date, to_date, package, leaving_reason) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [applicantId, companyName, jobTitle, startDate, endDate, parseFloat(salary), description]
                );
            }
        }

        step = 'languages_known';
        console.log('[CRUD] Step:', step);
        if (req.body.known_language && Array.isArray(req.body.known_language)) {
            for (const lang of req.body.known_language) {
                const langId = lang.toLowerCase();
                const canRead = req.body[`read_${langId}`] === 'on';
                const canWrite = req.body[`write_${langId}`] === 'on';
                const canSpeak = req.body[`speak_${langId}`] === 'on';
                await connection.execute(
                    `INSERT INTO languages_known (applicant_id, language_name, can_read, can_write, can_speak) VALUES (?, ?, ?, ?, ?)`,
                    [applicantId, lang, canRead, canWrite, canSpeak]
                );
            }
        }

        step = 'technologies_known';
        console.log('[CRUD] Step:', step);
        if (req.body.known_tech && Array.isArray(req.body.known_tech)) {
            for (const tech of req.body.known_tech) {
                const techId = tech.toLowerCase().replace(/\./g, '').replace(/ /g, '');
                const level = req.body[`level_${techId}`];
                if (level) {
                    await connection.execute(
                        `INSERT INTO technologies_known (applicant_id, tech_name, proficiency_level) VALUES (?, ?, ?)`,
                        [applicantId, tech, level]
                    );
                }
            }
        }

        step = 'applicant_preferences';
        console.log('[CRUD] Step:', step);
        const insertIntoApplicantPreferences = 'INSERT into applicant_preferences(applicant_id,pref_location_1,pref_location_2,pref_location_3,notice_period_days,expected_ctc,current_ctc,department) values(?,?,?,?,?,?,?,?)'
        await connection.query(insertIntoApplicantPreferences,[applicantId,req.body.lp1,req.body.lp2,req.body.lp3,parseInt(req.body['notice_period_days']),parseFloat(req.body['expected_ctc']),parseFloat(req.body['current_ctc']),req.body.department || 'Department']);

        await connection.commit();
        res.redirect('/applicants');
    } catch (error) {
        await connection.rollback();
        console.error('[CRUD] Error during step:', step, error);
        res.status(500).send(`Error submitting application at step: ${step}`);
    } 
}) 

app.get('/form/edit/:id', async (req,res) => {
   const applicantId = parseInt(req.params.id);

   // get all the records from each table and combine them together in one single object
   // send that object to the editForm.ejs and show all the values 
   // and when changes are made create another post request with same endpoint and the run the update logic

    const queryToFetchApplicant = 'SELECT * FROM applicant_details where id = ?';
     
    const [applicantRows] = await connection.execute(queryToFetchApplicant,[applicantId]);

    const queryToFetchAddress = 'SELECT * from applicant_addresses where applicant_id = ?'

    const [addressRows] = await connection.execute(queryToFetchAddress,[applicantId]);

    const queryToFetchEducationRecords = 'SELECT * from education_records where applicant_id = ?';

    const [educationRows] = await connection.execute(queryToFetchEducationRecords,[applicantId]);
    
    const queryToFetchWorkExp = 'SELECT * from work_experiences where applicant_id = ?'

    const [workRows] = await connection.execute(queryToFetchWorkExp,[applicantId]);

    const queryToFetchKnowsLanguages = "SELECT * from languages_known where applicant_id = ?";

    const [knownLangs] = await connection.execute(queryToFetchKnowsLanguages,[applicantId]);
    
    const queryToFetchTechnologies = "SELECT * from technologies_known where applicant_id = ?";

    const [knownTech] = await connection.execute(queryToFetchTechnologies,[applicantId]);
     
    const queryToFetchPreferences = 'SELECT * from applicant_preferences where applicant_id = ?'

    const [preferenceRows] = await connection.execute(queryToFetchPreferences,[applicantId]);


    const data = {
        applicant:applicantRows,
        address:addressRows,
        education:educationRows,
        workExp : workRows,
        languages:knownLangs,
        technologies : knownTech,
        preferences:preferenceRows
    }
    console.log(data.languages)
    // console.log(data.applicant[0].date_of_birth.toISOString().slice(0,10));
    res.render('editForm', {data});

})

//update thing...

app.post('/form/update/:id', async (req, res) => {
    const applicantId = parseInt(req.params.id);
    let step = 'applicant_details';
    
    try {
        await connection.beginTransaction();

        // 1. Update applicant_details
        step = 'applicant_details';
        await connection.execute(
            `UPDATE applicant_details SET 
                first_name = ?, last_name = ?, designation = ?, email = ?, 
                phone = ?, gender = ?, relationship_status = ?, date_of_birth = ?
             WHERE id = ?`,
            [req.body.first_name, req.body.last_name, req.body.designation, 
             req.body.email, req.body.phone_number, req.body.gender, 
             req.body.relationship_status, req.body.dob, applicantId]
        );

        // 2. Update applicant_addresses
        step = 'applicant_addresses';
        await connection.execute(
            `UPDATE applicant_addresses SET 
                address_line_1 = ?, address_line_2 = ?, city = ?, state = ?, zip_code = ?
             WHERE applicant_id = ?`,
            [req.body.address_1, req.body.address_2 || null, req.body.city, 
             req.body.state, req.body.zip_code, applicantId]
        );

        // 3. Delete and re-insert education_records
        step = 'education_records';
        await connection.execute(`DELETE FROM education_records WHERE applicant_id = ?`, [applicantId]);
        const educationKeys = Object.keys(req.body).filter(key => key.startsWith('degree'));
        for (let i = 1; i <= educationKeys.length; i++) {
            const degree = req.body[`degree${i}`];
            const yearOfPassing = req.body[`year_of_passing${i}`];
            const institution = req.body[`institution${i}`];
            const percentage = req.body[`percentage${i}`];
            if (degree && yearOfPassing && institution && percentage) {
                await connection.execute(
                    `INSERT INTO education_records (applicant_id, course_name, passing_year, board_university, result_percentage) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [applicantId, degree, yearOfPassing, institution, parseFloat(percentage)]
                );
            }
        }

        // 4. Delete and re-insert work_experiences
        step = 'work_experiences';
        await connection.execute(`DELETE FROM work_experiences WHERE applicant_id = ?`, [applicantId]);
        const workKeys = Object.keys(req.body).filter(key => key.startsWith('company_name'));
        for (let i = 1; i <= workKeys.length; i++) {
            const companyName = req.body[`company_name${i}`];
            const jobTitle = req.body[`job_title${i}`];
            const startDate = req.body[`start_date${i}`];
            const endDate = req.body[`end_date${i}`];
            const salary = req.body[`salary${i}`];
            const description = req.body[`description${i}`];
            if (companyName && jobTitle && startDate && endDate) {
                await connection.execute(
                    `INSERT INTO work_experiences (applicant_id, company_name, designation, from_date, to_date, package, leaving_reason) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [applicantId, companyName, jobTitle, startDate, endDate, parseFloat(salary), description]
                );
            }
        }

        // 5. Delete and re-insert languages_known
        step = 'languages_known';
        await connection.execute(`DELETE FROM languages_known WHERE applicant_id = ?`, [applicantId]);
        if (req.body.known_language && Array.isArray(req.body.known_language)) {
            for (const lang of req.body.known_language) {
                const langId = lang.toLowerCase();
                const canRead = req.body[`read_${langId}`] === 'on' ? 1 : 0;
                const canWrite = req.body[`write_${langId}`] === 'on' ? 1 : 0;
                const canSpeak = req.body[`speak_${langId}`] === 'on' ? 1 : 0;
                await connection.execute(
                    `INSERT INTO languages_known (applicant_id, language_name, can_read, can_write, can_speak) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [applicantId, lang, canRead, canWrite, canSpeak]
                );
            }
        }

        // 6. Delete and re-insert technologies_known
        step = 'technologies_known';
        await connection.execute(`DELETE FROM technologies_known WHERE applicant_id = ?`, [applicantId]);
        if (req.body.known_tech && Array.isArray(req.body.known_tech)) {
            for (const tech of req.body.known_tech) {
                const techId = tech.toLowerCase().replace(/\./g, '').replace(/ /g, '');
                const level = req.body[`level_${techId}`];
                if (level) {
                    await connection.execute(
                    `INSERT INTO technologies_known (applicant_id, tech_name, proficiency_level) 
                     VALUES (?, ?, ?)`,
                    [applicantId, tech, level]
                );
                }
            }
        }

        // 7. Update applicant_preferences (use UPDATE or DELETE+INSERT)
        step = 'applicant_preferences';
        await connection.execute(
            `UPDATE applicant_preferences SET 
                pref_location_1 = ?, pref_location_2 = ?, pref_location_3 = ?, 
                notice_period_days = ?, expected_ctc = ?, current_ctc = ?, department = ?
             WHERE applicant_id = ?`,
            [req.body.lp1, req.body.lp2, req.body.lp3, parseInt(req.body['notice_period_days']),
             parseFloat(req.body['expected_ctc']), parseFloat(req.body['current_ctc']), 
             req.body.department || 'Department', applicantId]
        );

        await connection.commit();
        res.redirect('/applicants');
    } catch (error) {
        await connection.rollback();
        console.error('[CRUD UPDATE] Error during step:', step, error);
        res.status(500).send(`Error updating application at step: ${step}`);
    }
});

// delete record 
app.post('/applicants/delete/:id', async (req,res) => {
     const applicantId = parseInt(req.params.id);
    
     const queryToDeleteApplicant = "DELETE From applicant_details where id = ?";

     try{
        const [result] = await connection.query(queryToDeleteApplicant,[applicantId]);
   
            res.redirect('/applicants');
     } catch(err) {
        console.log('Error occured while deleting applicant with id:'+ applicantId, err);
        res.status(500).send(`Error updating application at step: ${applicantId}`);
     }

})

app.get("/form/view/:id", async (req,res) => {
      const applicantId = parseInt(req.params.id);

   // get all the records from each table and combine them together in one single object
   // send that object to the editForm.ejs and show all the values 
   // and when changes are made create another post request with same endpoint and the run the update logic

    const queryToFetchApplicant = 'SELECT * FROM applicant_details where id = ?';
     
    const [applicantRows] = await connection.execute(queryToFetchApplicant,[applicantId]);

    const queryToFetchAddress = 'SELECT * from applicant_addresses where applicant_id = ?'

    const [addressRows] = await connection.execute(queryToFetchAddress,[applicantId]);

    const queryToFetchEducationRecords = 'SELECT * from education_records where applicant_id = ?';

    const [educationRows] = await connection.execute(queryToFetchEducationRecords,[applicantId]);
    
    const queryToFetchWorkExp = 'SELECT * from work_experiences where applicant_id = ?'

    const [workRows] = await connection.execute(queryToFetchWorkExp,[applicantId]);

    const queryToFetchKnowsLanguages = "SELECT * from languages_known where applicant_id = ?";

    const [knownLangs] = await connection.execute(queryToFetchKnowsLanguages,[applicantId]);
    
    const queryToFetchTechnologies = "SELECT * from technologies_known where applicant_id = ?";

    const [knownTech] = await connection.execute(queryToFetchTechnologies,[applicantId]);
     
    const queryToFetchPreferences = 'SELECT * from applicant_preferences where applicant_id = ?'

    const [preferenceRows] = await connection.execute(queryToFetchPreferences,[applicantId]);


    const data = {
        applicant:applicantRows,
        address:addressRows,
        education:educationRows,
        workExp : workRows,
        languages:knownLangs,
        technologies : knownTech,
        preferences:preferenceRows
    }
    
    // console.log(data.applicant[0].date_of_birth.toISOString().slice(0,10));
    res.render('viewDetails', {data});
      
})


app.post('/form/test' , async (req,res) => {
        res.send(req.body);
})

app.get('/form/test', (req,res) => {
    // console.log(req.body);

    res.render('testForm')
})


app.get('/form-data', async (req,res) => {
    const queryToFetchMasterLanguages = "SELECT * FROM master_languages";

    const queryToFetchMasterTech = "SELECT * from master_technologies";

     
})
app.listen(PORT, () => {
    console.log(`Server Running and Listenin on : http://localhost:${PORT}`);
})