const { body, validationResult, query } = require('express-validator');
const path = require('path');

// ⭐ VALIDATION MIDDLEWARE (Add before your route)
const validateApplicantForm = [
    // Personal Details
    body('first_name').trim().isAlpha('en-US', {ignore: ' -'}).withMessage('First name must contain only letters')
        .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
    
    body('last_name').trim().isAlpha('en-US', {ignore: ' -'}).withMessage('Last name must contain only letters')
        .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
    
    body('designation').trim().notEmpty().withMessage('Designation is required')
        .isLength({ max: 100 }).withMessage('Designation too long'),
    
    body('email').normalizeEmail().isEmail().withMessage('Valid email required')
        .isLength({ max: 100 }).withMessage('Email too long'),
    
    body('phone_number').trim().isMobilePhone('en-IN').withMessage('Valid 10-digit Indian phone required')
        .matches(/^\d{10}$/).withMessage('Phone must be exactly 10 digits'),
    
    // Address
    body('address_1').trim().notEmpty().withMessage('Address line 1 required')
        .isLength({ max: 200 }).withMessage('Address too long'),
    
    body('city').trim().notEmpty().withMessage('City required')
        .isLength({ max: 50 }).withMessage('City too long'),
    
    body('state').trim().notEmpty().withMessage('State required')
        .isLength({ min: 2, max: 50 }).withMessage('State must be 2-50 chars'),
    
    body('zip_code').trim().isPostalCode('IN').withMessage('Valid Indian ZIP required')
        .matches(/^\d{6}$/).withMessage('ZIP must be 6 digits'),
    
    // Dates & Numbers
    body('dob').isISO8601().withMessage('Valid date of birth required'),
    
    body('notice_period_days').optional().isInt({ min: 0 }).withMessage('Notice period must be valid number'),
    body('expected_ctc').optional().isFloat({ min: 0 }).withMessage('Expected CTC must be valid number'),
    body('current_ctc').optional().isFloat({ min: 0 }).withMessage('Current CTC must be valid number'),
    
    // Education (dynamic validation)
    body('degree1,degree2,degree3').optional()
        .custom((value) => value ? value.trim().length >= 2 && value.length <= 100 : true)
        .withMessage('Degree name must be 2-100 chars'),
    
    body('year_of_passing1,year_of_passing2,year_of_passing3').optional()
        .isInt({ min: 1900, max: 2030 }).withMessage('Valid year required'),
    
    body('percentage1,percentage2,percentage3').optional()
        .isFloat({ min: 0, max: 100 }).withMessage('Percentage 0-100 required'),
    
    // Work Experience (dynamic)
    body('company_name1,company_name2,job_title1,job_title2').optional()
        .custom((value) => value ? value.trim().length >= 2 && value.length <= 100 : true),
    
    body('salary1,salary2').optional()
        .isFloat({ min: 0 }).withMessage('Valid salary required'),
    
    body('start_date1,end_date1,start_date2,end_date2').optional().isISO8601(),
    
    // Technologies & Languages (arrays auto-validated)
    body('known_language.*').optional().isLength({ min: 2, max: 50 }),
    body('known_tech.*').optional().isLength({ min: 2, max: 50 }),
    
    // Sanitize all text fields
    body('first_name,last_name,designation,address_1,address_2,city,state,degree*,institution*,company_name*,job_title*,description*')
        .optional({ nullable: true })
        .trim()
        .escape()
        .blacklist('<>'),
];

// ⭐ MAIN ROUTE WITH VALIDATION
app.post('/form/add', 
    validateApplicantForm,  // Apply validation first
    async (req, res) => {
        // ⭐ CHECK VALIDATION ERRORS FIRST
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                errors: errors.array().map(err => err.msg)
            });
        }

        let step = 'applicant_details';
        try {
            await connection.beginTransaction();

            // ⭐ SANITIZED DATA READY
            const sanitizedData = req.body;

            // Applicant Details (SAFE)
            const [result] = await connection.execute(
                `INSERT INTO applicant_details (first_name, last_name, designation, email, phone, gender, relationship_status, date_of_birth) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    sanitizedData.first_name?.trim(),
                    sanitizedData.last_name?.trim(),
                    sanitizedData.designation?.trim(),
                    sanitizedData.email?.toLowerCase().trim(),
                    sanitizedData.phone_number?.trim(),
                    sanitizedData.gender,
                    sanitizedData.relationship_status,
                    sanitizedData.dob
                ]
            );
            const applicantId = result.insertId;

            // Addresses (SAFE)
            await connection.execute(
                `INSERT INTO applicant_addresses (applicant_id, address_line_1, address_line_2, city, state, zip_code) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    applicantId,
                    sanitizedData.address_1?.trim(),
                    sanitizedData.address_2?.trim() || null,
                    sanitizedData.city?.trim(),
                    sanitizedData.state?.trim(),
                    sanitizedData.zip_code?.trim()
                ]
            );

            // ⭐ EDUCATION (Dynamic + Validated)
            for (let i = 1; i <= 3; i++) {
                const degree = sanitizedData[`degree${i}`]?.trim();
                const year = sanitizedData[`year_of_passing${i}`];
                const institution = sanitizedData[`institution${i}`]?.trim();
                const percentage = parseFloat(sanitizedData[`percentage${i}`]);
                
                if (degree && year && institution && !isNaN(percentage)) {
                    await connection.execute(
                        `INSERT INTO education_records (applicant_id, course_name, passing_year, board_university, result_percentage) 
                         VALUES (?, ?, ?, ?, ?)`,
                        [applicantId, degree, year, institution, percentage]
                    );
                }
            }

            // ⭐ WORK EXPERIENCE (Dynamic + Validated)
            for (let i = 1; i <= 2; i++) {
                const company = sanitizedData[`company_name${i}`]?.trim();
                const title = sanitizedData[`job_title${i}`]?.trim();
                const start = sanitizedData[`start_date${i}`];
                const end = sanitizedData[`end_date${i}`];
                const salary = parseFloat(sanitizedData[`salary${i}`]);
                const desc = sanitizedData[`description${i}`]?.trim();
                
                if (company && title && start && end && !isNaN(salary) && desc) {
                    await connection.execute(
                        `INSERT INTO work_experiences (applicant_id, company_name, designation, from_date, to_date, package, leaving_reason) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [applicantId, company, title, start, end, salary, desc]
                    );
                }
            }

            // ⭐ LANGUAGES (Safe array handling)
            if (Array.isArray(sanitizedData.known_language)) {
                for (const lang of sanitizedData.known_language) {
                    if (lang && lang.trim()) {
                        const langId = lang.toLowerCase().replace(/\s+/g, '_');
                        const canRead = sanitizedData[`read_${langId}`] === 'on';
                        const canWrite = sanitizedData[`write_${langId}`] === 'on';
                        const canSpeak = sanitizedData[`speak_${langId}`] === 'on';
                        
                        await connection.execute(
                            `INSERT INTO languages_known (applicant_id, language_name, can_read, can_write, can_speak) 
                             VALUES (?, ?, ?, ?, ?)`,
                            [applicantId, lang.trim(), canRead, canWrite, canSpeak]
                        );
                    }
                }
            }

            // ⭐ TECHNOLOGIES (Safe array handling)
            if (Array.isArray(sanitizedData.known_tech)) {
                for (const tech of sanitizedData.known_tech) {
                    if (tech && tech.trim()) {
                        const techId = tech.toLowerCase().replace(/[\s.]+/g, '_');
                        const level = sanitizedData[`level_${techId}`];
                        if (level) {
                            await connection.execute(
                                `INSERT INTO technologies_known (applicant_id, tech_name, proficiency_level) 
                                 VALUES (?, ?, ?)`,
                                [applicantId, tech.trim(), level]
                            );
                        }
                    }
                }
            }

            // ⭐ PREFERENCES (Numbers validated)
            await connection.execute(
                `INSERT INTO applicant_preferences (applicant_id, pref_location_1, pref_location_2, pref_location_3, notice_period_days, expected_ctc, current_ctc, department) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    applicantId,
                    sanitizedData.lp1,
                    sanitizedData.lp2,
                    sanitizedData.lp3,
                    parseInt(sanitizedData.notice_period_days) || 0,
                    parseFloat(sanitizedData.expected_ctc) || 0,
                    parseFloat(sanitizedData.current_ctc) || 0,
                    sanitizedData.department?.trim() || 'General'
                ]
            );

            await connection.commit();
            console.log(`✅ Applicant ${applicantId} created successfully`);
            res.redirect('/applicants');

        } catch (error) {
            await connection.rollback();
            console.error('❌ Database Error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Database error occurred',
                step 
            });
        }
    }
);


/// ejs file 

// <% if (typeof errors !== 'undefined' && errors.length > 0) { %>
//     <div class="alert alert-danger">
//         <% errors.forEach(error => { %>
//             <p><%= error %></p>
//         <% }) %>
//     </div>
// <% } %>