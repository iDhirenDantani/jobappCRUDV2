-- 	create database job_applicants_db;

	create table applicant_details(
	id INT AUTO_INCREMENT PRIMARY KEY,
	first_name varchar(100) not null,
	last_name varchar(100) not null,	
	designation varchar(100) not null,
	email varchar(255) unique not null,
	phone varchar(20) unique not null,
	gender ENUM('male','female') not null,
	relationship_status ENUM('single','married','divorced','other') not null,
	date_of_birth DATE not null,
	created_at timestamp default current_timestamp,
	updated_at timestamp default current_timestamp on UPDATE current_timestamp,
	INDEX idx_email (email),
	INDEX idx_phone (phone)
	);

	create table applicant_addresses(
	id int auto_increment primary key,
	applicant_id int not null,
	address_line_1 varchar(255) not null,
	address_line_2 varchar(255),
	city varchar(50) not null,
	state varchar(50) not null,
	zip_code varchar(10) not null,
	created_at timestamp default current_timestamp,
	updated_at timestamp default current_timestamp on UPDATE current_timestamp,

	foreign key (applicant_id) references applicant_details(id) on delete cascade,
	INDEX idx_applicant_id (applicant_id)
	);

	create table education_records (
	id int auto_increment primary key,
	applicant_id int not null,
	course_name varchar(100) not null,
	passing_year YEAR not null,
	board_university varchar(100) not null,
	result_percentage decimal(5,2) not null default 0.00 CHECK (result_percentage BETWEEN 0 AND 100),
	created_at timestamp default current_timestamp,
	updated_at timestamp default current_timestamp on UPDATE current_timestamp,
	foreign key (applicant_id) references applicant_details(id) on delete cascade,
	INDEX idx_applicant_id (applicant_id)
	);


	create table work_experiences (
	id int auto_increment primary key,
	applicant_id int not null,
	company_name varchar(255),
	designation varchar(100),
	from_date date,
	to_date date,
	package decimal(10,2),
	leaving_reason TEXT,
	created_at timestamp default current_timestamp,
	updated_at timestamp default current_timestamp on UPDATE current_timestamp,
	foreign key(applicant_id) references applicant_details(id) on delete cascade,
	INDEX idx_applicant_id (applicant_id)
	);

-- Master table for predefined languages
    CREATE TABLE languages (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
    );

    INSERT INTO languages (name) VALUES
        ('Hindi'),
        ('English'),
        ('Gujarati'),
        ('Marathi');

    CREATE TABLE languages_known (
        id INT AUTO_INCREMENT PRIMARY KEY,
        applicant_id INT NOT NULL,
        language_id INT UNSIGNED NOT NULL,
        can_read BOOLEAN DEFAULT FALSE,
        can_write BOOLEAN DEFAULT FALSE,
        can_speak BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (applicant_id) REFERENCES applicant_details(id) ON DELETE CASCADE,
        FOREIGN KEY (language_id) REFERENCES languages(id),
        INDEX idx_applicant_id (applicant_id)
    );

    Master table for predefined technologies
    CREATE TABLE technologies (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
    );

    INSERT INTO technologies (name) VALUES
        ('Node.js'),
        ('Express.js'),
        ('React.js'),
        ('MySQL'),
        ('JavaScript'),
        ('HTML');

    CREATE TABLE technologies_known (
        id INT AUTO_INCREMENT PRIMARY KEY,
        applicant_id INT NOT NULL,
        tech_id INT UNSIGNED NOT NULL,
        proficiency_level ENUM('beginner', 'intermediate', 'advanced'),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (applicant_id) REFERENCES applicant_details(id) ON DELETE CASCADE,
        FOREIGN KEY (tech_id) REFERENCES technologies(id),
        INDEX idx_applicant_id (applicant_id)
    );

	create table applicant_preferences(
	id int auto_increment primary key,
	applicant_id int not null,
	pref_location_1 varchar(100) not null,
	pref_location_2 varchar(100),
	pref_location_3 varchar(100),
	notice_period_days tinyint unsigned not null,
	expected_ctc decimal(10,2) not null default 0.00,
	current_ctc decimal(10,2) default 0.00,
	department varchar(100) not null,
	created_at timestamp default current_timestamp,
	updated_at timestamp default current_timestamp on UPDATE current_timestamp,
	foreign key(applicant_id) references applicant_details(id) on delete cascade,
	INDEX idx_applicant_id (applicant_id)
	);