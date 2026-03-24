import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
import { body, validationResult } from 'express-validator';
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
  timezone:'Z', // so that date stays the same date 
//   dateStrings:true -- can also use this for timezone conversion issues
}) 

const toArray = (value) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
};

const isAdult = (dobString) => {
    if (!dobString) return false;
    const userDob = new Date(dobString);
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return userDob <= minDate;
};

const validateApplicantForm = [
    body('first_name').trim().notEmpty().withMessage('First name is required')
        .matches(/^[A-Za-z\s]+$/).withMessage('First name should contain letters only'),
    body('last_name').trim().notEmpty().withMessage('Last name is required')
        .matches(/^[A-Za-z\s]+$/).withMessage('Last name should contain letters only'),
    body('designation').trim().notEmpty().withMessage('Designation is required'),
    body('email').trim().notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address'),
    body('phone_number').trim().matches(/^\d{10}$/).withMessage('Phone number must be exactly 10 digits'),
    body('address_1').trim().notEmpty().withMessage('Address is required'),
    body('city').trim().notEmpty().withMessage('City is required')
        .matches(/^[A-Za-z\s]+$/).withMessage('City should not contain numbers'),
    body('state').trim().notEmpty().withMessage('Please select a state'),
    body('zip_code').trim().matches(/^\d{6}$/).withMessage('Zip code must be exactly 6 digits'),
    body('gender').isIn(['male', 'female']).withMessage('Please select a valid gender'),
    body('relationship_status').isIn(['single', 'married', 'divorced', 'other']).withMessage('Please select relationship status'),
    body('dob').notEmpty().withMessage('Date of birth is required')
        .custom((value) => isAdult(value)).withMessage('You must be at least 18 years old'),
    body('lp1').notEmpty().withMessage('Location priority 1 is required'),
    body('lp2').notEmpty().withMessage('Location priority 2 is required'),
    body('lp3').notEmpty().withMessage('Location priority 3 is required'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('notice_period_days').trim().notEmpty().withMessage('Notice period is required')
        .isInt({ min: 0, max: 365 }).withMessage('Notice period must be a number between 0 and 365'),
    body('expected_ctc').trim().notEmpty().withMessage('Expected salary is required')
        .isFloat({ min: 0 }).withMessage('Expected salary must be a valid number'),
    body('current_ctc').trim().notEmpty().withMessage('Current CTC is required')
        .isFloat({ min: 0 }).withMessage('Current CTC must be a valid number'),
    body().custom((_, { req }) => {
        const lp1 = req.body.lp1;
        const lp2 = req.body.lp2;
        const lp3 = req.body.lp3;
        if (lp1 && lp2 && lp3 && (lp1 === lp2 || lp1 === lp3 || lp2 === lp3)) {
            throw new Error('Location priorities must be unique');
        }
        return true;
    }),
    body().custom((_, { req }) => {
        const degreeIndexes = Object.keys(req.body)
            .filter((key) => key.startsWith('degree'))
            .map((key) => parseInt(key.replace('degree', ''), 10))
            .filter((index) => !Number.isNaN(index));

        if (degreeIndexes.length === 0) {
            throw new Error('At least one education record is required');
        }

        const maxIndex = Math.max(...degreeIndexes);
        const currentYear = new Date().getFullYear();

        for (let i = 1; i <= maxIndex; i++) {
            const degree = (req.body[`degree${i}`] || '').trim();
            const year = (req.body[`year_of_passing${i}`] || '').trim();
            const institution = (req.body[`institution${i}`] || '').trim();
            const percentage = (req.body[`percentage${i}`] || '').trim();

            if (!degree && !year && !institution && !percentage) {
                continue;
            }

            if (!degree || !year || !institution || !percentage) {
                throw new Error(`Education row ${i} has incomplete fields`);
            }

            if (!/^\d{4}$/.test(year) || Number(year) > currentYear) {
                throw new Error(`Education row ${i} has invalid passing year`);
            }

            const percentageNumber = parseFloat(percentage);
            if (Number.isNaN(percentageNumber) || percentageNumber < 0 || percentageNumber > 100) {
                throw new Error(`Education row ${i} percentage must be between 0 and 100`);
            }
        }

        return true;
    }),
    body().custom((_, { req }) => {
        const companyIndexes = Object.keys(req.body)
            .filter((key) => key.startsWith('company_name'))
            .map((key) => parseInt(key.replace('company_name', ''), 10))
            .filter((index) => !Number.isNaN(index));

        if (companyIndexes.length === 0) {
            throw new Error('At least one work experience row is required');
        }

        const maxIndex = Math.max(...companyIndexes);

        for (let i = 1; i <= maxIndex; i++) {
            const company = (req.body[`company_name${i}`] || '').trim();
            const title = (req.body[`job_title${i}`] || '').trim();
            const start = (req.body[`start_date${i}`] || '').trim();
            const end = (req.body[`end_date${i}`] || '').trim();
            const salary = (req.body[`salary${i}`] || '').trim();
            const reason = (req.body[`description${i}`] || '').trim();

            if (!company && !title && !start && !end && !salary && !reason) {
                continue;
            }

            if (!company || !title || !start || !end || !salary || !reason) {
                throw new Error(`Work experience row ${i} has incomplete fields`);
            }

            if (Number.isNaN(Number(salary))) {
                throw new Error(`Work experience row ${i} salary must be a number`);
            }

            if (new Date(start) > new Date(end)) {
                throw new Error(`Work experience row ${i} has invalid date range`);
            }
        }

        return true;
    }),
    body().custom((_, { req }) => {
        const selectedLanguages = toArray(req.body.known_language);

        if (selectedLanguages.length === 0) {
            throw new Error('Please select at least one language');
        }

        for (const lang of selectedLanguages) {
            const langId = String(lang).toLowerCase();
            const canRead = req.body[`read_${langId}`] === 'on';
            const canWrite = req.body[`write_${langId}`] === 'on';
            const canSpeak = req.body[`speak_${langId}`] === 'on';

            if (!canRead && !canWrite && !canSpeak) {
                throw new Error(`Please select read/write/speak for language ${lang}`);
            }
        }

        return true;
    }),
    body().custom((_, { req }) => {
        const selectedTech = toArray(req.body.known_tech);

        if (selectedTech.length === 0) {
            throw new Error('Please select at least one technology');
        }

        for (const tech of selectedTech) {
            const techId = String(tech).toLowerCase().replace(/\./g, '').replace(/ /g, '');
            const level = req.body[`level_${techId}`];
            if (!level) {
                throw new Error(`Please select level for technology ${tech}`);
            }
        }

        return true;
    })
];

const fetchApplicantDataById = async (applicantId) => {
    const queryToFetchApplicant = 'SELECT * FROM applicant_details where id = ?';
    const [applicantRows] = await connection.execute(queryToFetchApplicant, [applicantId]);

    const queryToFetchAddress = 'SELECT * from applicant_addresses where applicant_id = ?';
    const [addressRows] = await connection.execute(queryToFetchAddress, [applicantId]);

    const queryToFetchEducationRecords = 'SELECT * from education_records where applicant_id = ?';
    const [educationRows] = await connection.execute(queryToFetchEducationRecords, [applicantId]);

    const queryToFetchWorkExp = 'SELECT * from work_experiences where applicant_id = ?';
    const [workRows] = await connection.execute(queryToFetchWorkExp, [applicantId]);

    const queryToFetchKnowsLanguages = 'SELECT * from languages_known where applicant_id = ?';
    const [knownLangs] = await connection.execute(queryToFetchKnowsLanguages, [applicantId]);

    const queryToFetchTechnologies = 'SELECT * from technologies_known where applicant_id = ?';
    const [knownTech] = await connection.execute(queryToFetchTechnologies, [applicantId]);

    const queryToFetchPreferences = 'SELECT * from applicant_preferences where applicant_id = ?';
    const [preferenceRows] = await connection.execute(queryToFetchPreferences, [applicantId]);

    return {
        applicant: applicantRows,
        address: addressRows,
        education: educationRows,
        workExp: workRows,
        languages: knownLangs,
        technologies: knownTech,
        preferences: preferenceRows
    };
};

const handleValidationErrors = async (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }

    const uniqueErrors = [...new Set(errors.array().map((error) => error.msg))];

    if (req.path === '/form/add') {
        return res.status(400).render('form', { serverErrors: uniqueErrors });
    }

    if (req.path.startsWith('/form/update/')) {
        try {
            const applicantId = parseInt(req.params.id, 10);
            const data = await fetchApplicantDataById(applicantId);
            return res.status(400).render('editForm', { data, serverErrors: uniqueErrors });
        } catch (error) {
            console.error('Error while loading edit form after validation failure', error);
        }
    }

    return res.status(400).send(`Validation failed: ${uniqueErrors.join(', ')}`);
};

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
    const queryWithSearch = `SELECT * from applicant_details WHERE id LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR email LIKE ? ORDER BY ${currentSort} ${currentOrder} LIMIT ? OFFSET ?`;
  const queryToFetchRecordCount = 'SELECT count(*) as totalCount from applicant_details';

  const [result] = await connection.query(queryToFetchRecordCount);
  const totalRecords = result[0].totalCount;    
  const totalPagesRequired = Math.ceil(totalRecords/recordsPerPage);
  console.log(totalPagesRequired)
    try {
       if(searchString) {
          const queryToCountRecords = `SELECT count(*) as totalRecords from applicant_details WHERE id LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR email LIKE ?`;
           
          const [result] = await connection.query(queryToCountRecords,[searchVal,searchVal,searchVal,searchVal,searchVal]);
          const totalRecords = result[0].totalRecords;

          const totalPagesRequired = Math.ceil(totalRecords/recordsPerPage);

           const [rows] = await connection.query(queryWithSearch,[searchVal,searchVal,searchVal,searchVal,searchVal,recordsPerPage,recordsToSkip]);
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
app.post('/form/add', validateApplicantForm, handleValidationErrors, async (req,res) => {
    console.log(req.body)
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

app.post('/form/update/:id', validateApplicantForm, handleValidationErrors, async (req, res) => {
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