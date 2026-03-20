const isEditForm = window.location.pathname.includes('/edit');
let langBody = document.getElementById('lang-body');
const techBody = document.getElementById('tech-body');
// for (let i = 0; i < languages.length; i++) {
//     let langName = languages[i];
//     let newLangRow = document.createElement('tr');
//     let langId = languages[i].toLowerCase();
    
//     // Notice the "disabled" keyword added to the Read, Write, and Speak checkboxes
//     newLangRow.innerHTML = `
//         <td>
//             <input type="checkbox" id="lang_${langId}" name="known_language" value="${langName}">
//             <label for="lang_${langId}">${langName}</label>
//         </td>
//         <td>
//             <input type="checkbox" id="read_${langId}" name="read_${langId}" disabled>
//             <label for="read_${langId}">Read</label>
//         </td>
//         <td>
//             <input type="checkbox" id="write_${langId}" name="write_${langId}" disabled>
//             <label for="write_${langId}">Write</label>
//         </td>
//         <td>
//             <input type="checkbox" id="speak_${langId}" name="speak_${langId}" disabled>
//             <label for="speak_${langId}">Speak</label>
//         </td>
//     `;
//     langBody.appendChild(newLangRow);

//     // LIVE TOGGLE LOGIC FOR LANGUAGES
//     let mainLangCheckbox = document.getElementById(`lang_${langId}`);
//     mainLangCheckbox.addEventListener('change', function() {
//         let readBox = document.getElementById(`read_${langId}`);
//         let writeBox = document.getElementById(`write_${langId}`);
//         let speakBox = document.getElementById(`speak_${langId}`);

//         if (this.checked) {
//             // Enable them if the main box is checked
//             readBox.disabled = false;
//             writeBox.disabled = false;
//             speakBox.disabled = false;
//         } else {
//             // Disable them AND uncheck them if the main box is unchecked
//             readBox.disabled = true;
//             writeBox.disabled = true;
//             speakBox.disabled = true;
            
//             readBox.checked = false;
//             writeBox.checked = false;
//             speakBox.checked = false;

//             // Clear any red error backgrounds just in case
//             newLangRow.style.backgroundColor = ""; 
//         }
//     });
// }

// // --- Generate Technologies Table ---
// const technologiesKnown = ["Node.js", "Express.js", "React.js", "MySQL", "JavaScript", "HTML"];
// const techTable = document.getElementById('tech-body');

// for (let i = 0; i < technologiesKnown.length; i++) {
//     let techName = technologiesKnown[i];
//     let techId = technologiesKnown[i].toLowerCase().replace('.', ''); 
//     let newTechRow = document.createElement('tr');

//     // Notice the "disabled" keyword added to the Beginner, Intermediate, and Advanced radio buttons
//     newTechRow.innerHTML = `
//         <td>
//             <input type="checkbox" id="tech_${techId}" name="known_tech" value="${techName}">
//             <label for="tech_${techId}">${techName}</label>
//         </td>
//         <td>
//             <input type="radio" id="beginner_${techId}" name="level_${techId}" value="beginner" disabled>
//             <label for="beginner_${techId}">Beginner</label>
//         </td>
//         <td>
//             <input type="radio" id="intermediate_${techId}" name="level_${techId}" value="intermediate" disabled>
//             <label for="intermediate_${techId}">Intermediate</label>
//         </td>
//         <td>
//             <input type="radio" id="advanced_${techId}" name="level_${techId}" value="advanced" disabled>
//             <label for="advanced_${techId}">Advanced</label>
//         </td>
//     `;
//     techTable.append(newTechRow);

//     // LIVE TOGGLE LOGIC FOR TECHNOLOGIES
//     let mainTechCheckbox = document.getElementById(`tech_${techId}`);
//     mainTechCheckbox.addEventListener('change', function() {
//         let beginnerRadio = document.getElementById(`beginner_${techId}`);
//         let intermediateRadio = document.getElementById(`intermediate_${techId}`);
//         let advancedRadio = document.getElementById(`advanced_${techId}`);

//         if (this.checked) {
//             // Enable radios
//             beginnerRadio.disabled = false;
//             intermediateRadio.disabled = false;
//             advancedRadio.disabled = false;
//         } else {
//             // Disable and uncheck radios
//             beginnerRadio.disabled = true;
//             intermediateRadio.disabled = true;
//             advancedRadio.disabled = true;
            
//             beginnerRadio.checked = false;
//             intermediateRadio.checked = false;
//             advancedRadio.checked = false;

//             // Clear any red error backgrounds just in case
//             newTechRow.style.backgroundColor = "";
//         }
//     });
// }



// ==========================================================================
// LANGUAGE TOGGLE LOGIC
// ==========================================================================
if (langBody) {
    if (isEditForm && langBody.children.length > 0) {
        // EDIT FORM: Attach listeners to server-rendered checkboxes
        let langCheckboxes = langBody.querySelectorAll('input[name="known_language"]');
        langCheckboxes.forEach(langBox => {
            let langId = langBox.id.replace('lang_', '');
            let row = langBox.closest('tr');
            
            langBox.addEventListener('change', function() {
                let readBox = document.getElementById(`read_${langId}`);
                let writeBox = document.getElementById(`write_${langId}`);
                let speakBox = document.getElementById(`speak_${langId}`);

                if (this.checked) {
                    if (readBox) readBox.disabled = false;
                    if (writeBox) writeBox.disabled = false;
                    if (speakBox) speakBox.disabled = false;
                } else {
                    if (readBox) { readBox.disabled = true; readBox.checked = false; }
                    if (writeBox) { writeBox.disabled = true; writeBox.checked = false; }
                    if (speakBox) { speakBox.disabled = true; speakBox.checked = false; }
                    if (row) row.style.backgroundColor = ""; 
                }
            });
            
            // Initialize disabled state on page load
            if (!langBox.checked) {
                let readBox = document.getElementById(`read_${langId}`);
                let writeBox = document.getElementById(`write_${langId}`);
                let speakBox = document.getElementById(`speak_${langId}`);
                if (readBox) readBox.disabled = true;
                if (writeBox) writeBox.disabled = true;
                if (speakBox) speakBox.disabled = true;
            }
        });
    } else if (!isEditForm && langBody.children.length === 0) {
        // CREATE FORM: Generate checkboxes dynamically
        const languages = ["Hindi", "English", "Gujarati", "Marathi"];
        for (let i = 0; i < languages.length; i++) {
            let langName = languages[i];
            let langId = languages[i].toLowerCase();
            let newLangRow = document.createElement('tr');
            
            newLangRow.innerHTML = `
                <td>
                    <input type="checkbox" id="lang_${langId}" name="known_language" value="${langName}">
                    <label for="lang_${langId}">${langName}</label>
                </td>
                <td>
                    <input type="checkbox" id="read_${langId}" name="read_${langId}" disabled>
                    <label for="read_${langId}">Read</label>
                </td>
                <td>
                    <input type="checkbox" id="write_${langId}" name="write_${langId}" disabled>
                    <label for="write_${langId}">Write</label>
                </td>
                <td>
                    <input type="checkbox" id="speak_${langId}" name="speak_${langId}" disabled>
                    <label for="speak_${langId}">Speak</label>
                </td>
            `;
            langBody.appendChild(newLangRow);

            // Attach toggle logic
            let mainLangCheckbox = document.getElementById(`lang_${langId}`);
            mainLangCheckbox.addEventListener('change', function() {
                let readBox = document.getElementById(`read_${langId}`);
                let writeBox = document.getElementById(`write_${langId}`);
                let speakBox = document.getElementById(`speak_${langId}`);

                if (this.checked) {
                    readBox.disabled = false;
                    writeBox.disabled = false;
                    speakBox.disabled = false;
                } else {
                    readBox.disabled = true;
                    writeBox.disabled = true;
                    speakBox.disabled = true;
                    readBox.checked = false;
                    writeBox.checked = false;
                    speakBox.checked = false;
                    newLangRow.style.backgroundColor = ""; 
                }
            });
        }
    }
}

// ==========================================================================
// TECHNOLOGY TOGGLE LOGIC
// ==========================================================================
if (techBody) {
    if (isEditForm && techBody.children.length > 0) {
        // EDIT FORM: Attach listeners to server-rendered checkboxes
        let techCheckboxes = techBody.querySelectorAll('input[name="known_tech"]');
        techCheckboxes.forEach(techBox => {
            let techId = techBox.id.replace('tech_', '');
            let row = techBox.closest('tr');
            
            techBox.addEventListener('change', function() {
                let beginnerRadio = document.getElementById(`beginner_${techId}`);
                let intermediateRadio = document.getElementById(`intermediate_${techId}`);
                let advancedRadio = document.getElementById(`advanced_${techId}`);

                if (this.checked) {
                    if (beginnerRadio) beginnerRadio.disabled = false;
                    if (intermediateRadio) intermediateRadio.disabled = false;
                    if (advancedRadio) advancedRadio.disabled = false;
                } else {
                    if (beginnerRadio) { beginnerRadio.disabled = true; beginnerRadio.checked = false; }
                    if (intermediateRadio) { intermediateRadio.disabled = true; intermediateRadio.checked = false; }
                    if (advancedRadio) { advancedRadio.disabled = true; advancedRadio.checked = false; }
                    if (row) row.style.backgroundColor = "";
                }
            });
            
            // Initialize disabled state on page load
            if (!techBox.checked) {
                let beginnerRadio = document.getElementById(`beginner_${techId}`);
                let intermediateRadio = document.getElementById(`intermediate_${techId}`);
                let advancedRadio = document.getElementById(`advanced_${techId}`);
                if (beginnerRadio) beginnerRadio.disabled = true;
                if (intermediateRadio) intermediateRadio.disabled = true;
                if (advancedRadio) advancedRadio.disabled = true;
            }
        });
    } else if (!isEditForm && techBody.children.length === 0) {
        // CREATE FORM: Generate checkboxes dynamically
        const technologiesKnown = ["Node.js", "Express.js", "React.js", "MySQL", "JavaScript", "HTML"];
        for (let i = 0; i < technologiesKnown.length; i++) {
            let techName = technologiesKnown[i];
            let techId = technologiesKnown[i].toLowerCase().replace(/\./g, '').replace(/ /g, '');
            let newTechRow = document.createElement('tr');

            newTechRow.innerHTML = `
                <td>
                    <input type="checkbox" id="tech_${techId}" name="known_tech" value="${techName}">
                    <label for="tech_${techId}">${techName}</label>
                </td>
                <td>
                    <input type="radio" id="beginner_${techId}" name="level_${techId}" value="beginner" disabled>
                    <label for="beginner_${techId}">Beginner</label>
                </td>
                <td>
                    <input type="radio" id="intermediate_${techId}" name="level_${techId}" value="intermediate" disabled>
                    <label for="intermediate_${techId}">Intermediate</label>
                </td>
                <td>
                    <input type="radio" id="advanced_${techId}" name="level_${techId}" value="advanced" disabled>
                    <label for="advanced_${techId}">Advanced</label>
                </td>
            `;
            techBody.appendChild(newTechRow);

            // Attach toggle logic
            let mainTechCheckbox = document.getElementById(`tech_${techId}`);
            mainTechCheckbox.addEventListener('change', function() {
                let beginnerRadio = document.getElementById(`beginner_${techId}`);
                let intermediateRadio = document.getElementById(`intermediate_${techId}`);
                let advancedRadio = document.getElementById(`advanced_${techId}`);

                if (this.checked) {
                    beginnerRadio.disabled = false;
                    intermediateRadio.disabled = false;
                    advancedRadio.disabled = false;
                } else {
                    beginnerRadio.disabled = true;
                    intermediateRadio.disabled = true;
                    advancedRadio.disabled = true;
                    beginnerRadio.checked = false;
                    intermediateRadio.checked = false;
                    advancedRadio.checked = false;
                    newTechRow.style.backgroundColor = "";
                }
            });
        }
    }
}
//Validation
const isNumberRegex = /[0-9]/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const zipcodeRegex = /^[0-9]{6}$/;

function isAdult(dobString) {
    if (!dobString) return false;
    let userDob = new Date(dobString);
    let today = new Date();
    let minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return userDob <= minDate;
}

function addRow(type) {
    let tbody;
    let newRow = document.createElement('tr');
    let rowCount;

    if (type === 'e') {
        tbody = document.getElementById('education-body');
        rowCount = tbody.children.length + 1;
        newRow.innerHTML = `
            <td>${rowCount}</td>
                        <td>
                            <select name="course${rowCount}" id="course${rowCount}">
                                <option value="" selected disabled>-- Select Course--</option>
                                <option value="SSC">SSC</option>
                                <option value="HSC">HSC</option>
                                <option value="B.Tech">B.Tech</option>
                                <option value="M.Tech">M.Tech</option>
                            </select>
                        </td>
            <td><input type="text" name="year_of_passing${rowCount}" id="year_of_passing${rowCount}"></td>
            <td><input type="text" name="institution${rowCount}" id="institution${rowCount}"></td>
            <td><input type="text" name="percentage${rowCount}" id="percentage${rowCount}"></td>
        `;
        tbody.appendChild(newRow);
    } else if (type === 'w') {
        tbody = document.getElementById('workExp-body');
        rowCount = tbody.children.length + 1;
        newRow.innerHTML = `
            <td>${rowCount}</td>
            <td><input type="text" name="company_name${rowCount}" id="company_name${rowCount}"></td>
            <td><input type="text" name="job_title${rowCount}" id="job_title${rowCount}"></td>
            <td><input type="date" name="start_date${rowCount}" id="start_date${rowCount}"></td>
            <td><input type="date" name="end_date${rowCount}" id="end_date${rowCount}"></td>
            <td><input type="text" name="salary${rowCount}" id="salary${rowCount}"></td>
            <td><input type="text" name="description${rowCount}" id="description${rowCount}"></td>
        `;
        tbody.appendChild(newRow);
    }
}

function removeLastRow(type) {
    let tbody;
    if (type === 'e') {
        tbody = document.getElementById('education-body');
        if (tbody.children.length > 1) {
            tbody.removeChild(tbody.lastElementChild);
        } else {
            alert("You must have at least one Education record.");
        }
    } else if (type === 'w') {
        tbody = document.getElementById('workExp-body');
        if (tbody.children.length > 1) {
            tbody.removeChild(tbody.lastElementChild);
        } else {
            alert("You must have at least one Work Experience record.");
        }
    }
}


document.getElementById('btn-add-edu').addEventListener('click', function () { addRow('e'); });
document.getElementById('btn-remove-edu').addEventListener('click', function () { removeLastRow('e'); });
document.getElementById('btn-add-work').addEventListener('click', function () { addRow('w'); });
document.getElementById('btn-remove-work').addEventListener('click', function () { removeLastRow('w'); });


function checkFirstName() {
    let firstName = document.getElementById('first_name');
    let errorFirstName = document.getElementById('error-first_name');
    let result = true;
    if (firstName.value.trim() === "") {
        errorFirstName.innerText = "First name is required";
        firstName.style.border = "1px solid red";
        result = false;
    } else if (isNumberRegex.test(firstName.value.trim())) {
        errorFirstName.innerText = "Only alphabets allowed!!";
        firstName.style.border = "1px solid red";
        result = false;
    } else {
        errorFirstName.innerText = "";
        firstName.style.border = "1px solid #ccc";
    }
    console.log('checkFirstName: ' + (result ? 'PASS' : 'FAIL'));
    return result;
}

function checkLastName() {
    let lastName = document.getElementById('last_name');
    let errorLastName = document.getElementById('error-last_name');
    let result = true;
    if (lastName.value.trim() === "") {
        errorLastName.innerText = "Last name is required";
        lastName.style.border = "1px solid red";
        result = false;
    } else if (isNumberRegex.test(lastName.value.trim())) {
        errorLastName.innerText = "Only alphabets allowed!!";
        lastName.style.border = "1px solid red";
        result = false;
    } else {
        errorLastName.innerText = "";
        lastName.style.border = "1px solid #ccc";
    }
    console.log('checkLastName: ' + (result ? 'PASS' : 'FAIL'));
    return result;
}

function checkDesignation() {
    let designation = document.getElementById('designation');
    let errorDesignation = document.getElementById('error-designation');
    let result = true;
    if (designation.value.trim() === "") {
        errorDesignation.innerText = "Designation cannot be empty";
        designation.style.border = "1px solid red";
        result = false;
    } else {
        errorDesignation.innerText = "";
        designation.style.border = "1px solid #ccc";
    }
    console.log('checkDesignation: ' + (result ? 'PASS' : 'FAIL'));
    return result;
}

function checkEmail() {
    let email = document.getElementById('email');
    let errorEmail = document.getElementById('error-email');
    let result = true;
    if (email.value.trim() === "") {
        errorEmail.innerText = "Email is required";
        email.style.border = "1px solid red";
        result = false;
    } else if (!emailRegex.test(email.value.trim())) {
        errorEmail.innerText = "Enter a valid email";
        email.style.border = "1px solid red";
        result = false;
    } else {
        errorEmail.innerText = "";
        email.style.border = "1px solid #ccc";
    }
    console.log('checkEmail: ' + (result ? 'PASS' : 'FAIL'));
    return result;
}

function checkPhone() {
    let phone = document.getElementById('phone_number');
    let errorPhone = document.getElementById('error-phone_number');
    let result = true;
    if (phone.value.trim() === "") {
        errorPhone.innerText = "Phone number is required";
        phone.style.border = "1px solid red";
        result = false;
    } else if (phone.value.length !== 10 || isNaN(phone.value)) {
        errorPhone.innerText = "Phone must be exactly 10 digits";
        phone.style.border = "1px solid red";
        result = false;
    } else {
        errorPhone.innerText = "";
        phone.style.border = "1px solid #ccc";
    }
    console.log('checkPhone: ' + (result ? 'PASS' : 'FAIL'));
    return result;
}

function checkAddress() {
    let address = document.getElementById('address_1');
    let errorAddress = document.getElementById('error-address_1');
    let result = true;
    if (address.value.trim() === "") {
        errorAddress.innerText = "Address is required";
        address.style.border = "1px solid red";
        result = false;
    } else {
        errorAddress.innerText = "";
        address.style.border = "1px solid #ccc";
    }
    console.log('checkAddress: ' + (result ? 'PASS' : 'FAIL'));
    return result;
}

function checkCity() {
    let city = document.getElementById('city');
    let errorCity = document.getElementById('error-city');
    let result = true;
    if (city.value.trim() === "") {
        errorCity.innerText = "City is required";
        city.style.border = "1px solid red";
        result = false;
    } else if (isNumberRegex.test(city.value.trim())) {
        errorCity.innerText = "City cannot contain numbers";
        city.style.border = "1px solid red";
        result = false;
    } else {
        errorCity.innerText = "";
        city.style.border = "1px solid #ccc";
    }
    console.log('checkCity: ' + (result ? 'PASS' : 'FAIL'));
    return result;
}

function checkState() {
    let state = document.getElementById('state');
    let errorState = document.getElementById('error-state');
    let result = true;
    if (state.value === "") {
        errorState.innerText = "Please select a state";
        state.style.border = "1px solid red";
        result = false;
    } else {
        errorState.innerText = "";
        state.style.border = "1px solid #ccc";
    }
    console.log('checkState: ' + (result ? 'PASS' : 'FAIL'));
    return result;
}

function checkZipCode() {
    let zipCode = document.getElementById('zip_code');
    let errorZip = document.getElementById('error-zip_code');
    let result = true;
    if (zipCode.value.trim() === "") {
        errorZip.innerText = "Zip code is required";
        zipCode.style.border = "1px solid red";
        result = false;
    } else if (!zipcodeRegex.test(zipCode.value.trim())) {
        errorZip.innerText = "Must contain exactly 6 digits";
        zipCode.style.border = "1px solid red";
        result = false;
    } else {
        errorZip.innerText = "";
        zipCode.style.border = "1px solid #ccc";
    }
    console.log('checkZipCode: ' + (result ? 'PASS' : 'FAIL'));
    return result;
}

function checkGender() {
    let maleRadio = document.getElementById('male');
    let femaleRadio = document.getElementById('female');
    let errorGender = document.getElementById('error-gender');
    let result = true;
    if (maleRadio.checked === false && femaleRadio.checked === false) {
        errorGender.innerText = "Select your gender";
        result = false;
    } else {
        errorGender.innerText = "";
    }
    console.log('checkGender: ' + (result ? 'PASS' : 'FAIL'));
    return result;
}

function checkRelationship() {
    let relationship = document.getElementById('relationship_status');
    let errorRelationship = document.getElementById('error-relationship_status');
    let result = true;
    if (relationship.value === "") {
        errorRelationship.innerText = "Select relationship status";
        relationship.style.border = "1px solid red";
        result = false;
    } else {
        errorRelationship.innerText = "";
        relationship.style.border = "1px solid #ccc";
    }
    console.log('checkRelationship: ' + (result ? 'PASS' : 'FAIL'));
    return result;
}

function checkDob() {
    let dob = document.getElementById('dob');
    let errorDob = document.getElementById('error-dob');
    let result = true;
    if (dob.value === "") {
        errorDob.innerText = "Date of birth is required";
        dob.style.border = "1px solid red";
        result = false;
    } else if (!isAdult(dob.value)) {
        errorDob.innerText = "You must be at least 18 years old";
        dob.style.border = "1px solid red";
        result = false;
    } else {
        errorDob.innerText = "";
        dob.style.border = "1px solid #ccc";
    }
    console.log('checkDob: ' + (result ? 'PASS' : 'FAIL'));
    return result;
}



function checkExpectedSalary() {
    let expectedSalary = document.getElementById('expected_ctc'); 
    let errorExpectedSalary = document.getElementById('error-expected_salary');
    let result = true;
    if (expectedSalary.value.trim() === "" || isNaN(expectedSalary.value.trim())) {
        errorExpectedSalary.innerText = "Valid Expected Salary required (numbers only)";
        expectedSalary.style.border = "1px solid red";
        result = false;
    } else {
        errorExpectedSalary.innerText = "";
        expectedSalary.style.border = "1px solid #ccc";
    }
    console.log('checkExpectedSalary: ' + (result ? 'PASS' : 'FAIL'));
    return result;
}

function checkCurrCtc() {
    let currCtc = document.getElementById('current_ctc');
    let errorCurrCtc = document.getElementById('error-current_ctc');
    let result = true;
    if (!currCtc) return true;
    if (currCtc.value.trim() === "" || isNaN(currCtc.value.trim())) {
        errorCurrCtc.innerText = "Valid Current CTC required (numbers only)";
        currCtc.style.border = "1px solid red";
        result = false;
    } else {
        errorCurrCtc.innerText = "";
        currCtc.style.border = "1px solid #ccc";
    }
    console.log('checkCurrCtc: ' + (result ? 'PASS' : 'FAIL'));
    return result;
}



function checkLocations() {
    let lp1 = document.getElementById('lp1');
    let lp2 = document.getElementById('lp2');
    let lp3 = document.getElementById('lp3');
    let errorLp1 = document.getElementById('error-lp1');
    let errorLp2 = document.getElementById('error-lp2');
    let errorLp3 = document.getElementById('error-lp3');
    let isValid = true;

    errorLp1.innerText = ""; lp1.style.border = "1px solid #ccc";
    errorLp2.innerText = ""; lp2.style.border = "1px solid #ccc";
    errorLp3.innerText = ""; lp3.style.border = "1px solid #ccc";

    if (lp1.value === "") { errorLp1.innerText = "Required"; lp1.style.border = "1px solid red"; isValid = false; }
    if (lp2.value === "") { errorLp2.innerText = "Required"; lp2.style.border = "1px solid red"; isValid = false; }
    if (lp3.value === "") { errorLp3.innerText = "Required"; lp3.style.border = "1px solid red"; isValid = false; }

    if (isValid && (lp1.value === lp2.value || lp1.value === lp3.value || lp2.value === lp3.value)) {
        errorLp1.innerText = "Locations must be unique";
        errorLp2.innerText = "Locations must be unique";
        errorLp3.innerText = "Locations must be unique";
        lp1.style.border = "1px solid red";
        lp2.style.border = "1px solid red";
        lp3.style.border = "1px solid red";
        isValid = false;
    }
    console.log('checkLocations: ' + (isValid ? 'PASS' : 'FAIL'));
    return isValid;
}



document.getElementById('first_name').addEventListener('blur', checkFirstName);
document.getElementById('last_name').addEventListener('blur', checkLastName);
document.getElementById('designation').addEventListener('blur', checkDesignation);
document.getElementById('email').addEventListener('blur', checkEmail);
document.getElementById('phone_number').addEventListener('blur', checkPhone);
document.getElementById('address_1').addEventListener('blur', checkAddress);
document.getElementById('city').addEventListener('blur', checkCity);
document.getElementById('state').addEventListener('change', checkState);
document.getElementById('zip_code').addEventListener('blur', checkZipCode);
document.getElementById('male').addEventListener('change', checkGender);
document.getElementById('female').addEventListener('change', checkGender);
document.getElementById('relationship_status').addEventListener('change', checkRelationship);
document.getElementById('dob').addEventListener('blur', checkDob);

//Preferences Section...
document.getElementById('expected_salary').addEventListener('blur', checkExpectedSalary);
document.getElementById('expected_ctc')?.addEventListener('blur', checkExpectedSalary);
document.getElementById('current_ctc')?.addEventListener('blur', checkCurrCtc);


function checkEducationTable() {
    let isValid = true;
    let eduInputs = document.getElementById('education-body').querySelectorAll('input[type="text"]');
    let yearRegex = /^[0-9]{4}$/;

    for (let i = 0; i < eduInputs.length; i++) {
        let inputField = eduInputs[i];
        let val = inputField.value.trim();
        let inputName = inputField.name;

        inputField.style.border = "1px solid #ccc"; // Reset first

        if (val === "") {
            inputField.style.border = "1px solid red";
            isValid = false;
        } else if (inputName.includes('year_of_passing')) {
            const currentYear = new Date().getFullYear();
            if (!yearRegex.test(val) || Number(val) > currentYear) {
                inputField.style.border = "1px solid red";
                isValid = false;
            }
        } else if (inputName.includes('percentage')) {
            let numericResult = parseFloat(val);
            if (isNaN(numericResult) || numericResult < 0 || numericResult > 100) {
                inputField.style.border = "1px solid red";
                isValid = false;
            }
        }
    }
    console.log('checkEducationTable: ' + (isValid ? 'PASS' : 'FAIL'));
    return isValid;
}

function checkWorkTable() {
    let isValid = true;
    let workInputs = document.getElementById('workExp-body').querySelectorAll('input[type="text"], input[type="date"]');
    
    for (let i = 0; i < workInputs.length; i++) {
        if (workInputs[i].value.trim() === "") {
            workInputs[i].style.border = "1px solid red";
            isValid = false;
        } else {
            workInputs[i].style.border = "1px solid #ccc";
        }
    }

    // Ensure from-date is not after to-date per row
    let workRows = document.getElementById('workExp-body').querySelectorAll('tr');
    workRows.forEach(row => {
        let fromDate = row.querySelector('input[name^="start_date"]');
        let toDate = row.querySelector('input[name^="end_date"]');

        if (fromDate && toDate && fromDate.value && toDate.value) {
            if (new Date(fromDate.value) > new Date(toDate.value)) {
                fromDate.style.border = "1px solid red";
                toDate.style.border = "1px solid red";
                isValid = false;
            }
        }
    });

    console.log('checkWorkTable: ' + (isValid ? 'PASS' : 'FAIL'));
    return isValid;
}

function checkLanguages() {
    let isValid = true;
    let languageBoxes = document.querySelectorAll('input[name="known_language"]');
    
    for (let i = 0; i < languageBoxes.length; i++) {
        let langBox = languageBoxes[i];
        let row = langBox.closest('tr');
        row.style.backgroundColor = ""; 

        if (langBox.checked === true) {
            let langId = langBox.id.replace('lang_', '');
            let readBox = document.getElementById('read_' + langId);
            let writeBox = document.getElementById('write_' + langId);
            let speakBox = document.getElementById('speak_' + langId);

            if (readBox.checked === false && writeBox.checked === false && speakBox.checked === false) {
                row.style.backgroundColor = "#ffcccc"; 
                isValid = false;
            }
        }
    }
    console.log('checkLanguages: ' + (isValid ? 'PASS' : 'FAIL'));
    return isValid;
}

function checkTechnologies() {
    let isValid = true;
    let techBoxes = document.querySelectorAll('input[name="known_tech"]');
    console.log(techBoxes)
    let anyTechSelected = false;

    for (let i = 0; i < techBoxes.length; i++) {
        let techBox = techBoxes[i];
        let row = techBox.closest('tr');
        row.style.backgroundColor = "";

        if (techBox.checked === true) {
            anyTechSelected = true;
            let techId = techBox.id.replace('tech_', '');
            let levelRadios = document.querySelectorAll('input[name="level_' + techId + '"]');
            let isLevelSelected = false;

            for (let j = 0; j < levelRadios.length; j++) {
                if (levelRadios[j].checked === true) {
                    isLevelSelected = true;
                    break;
                }
            }

            if (isLevelSelected === false) {
                row.style.backgroundColor = "#ffcccc";
                isValid = false;
            }
        }
    }

    if (!anyTechSelected) {
        techBoxes.forEach(box => box.closest('tr').style.backgroundColor = "#ffcccc");
        isValid = false;
    }

    console.log('checkTechnologies: ' + (isValid ? 'PASS' : 'FAIL'));
    return isValid;
}

function checkAtLeastOneLanguage() {
    let languageBoxes = document.querySelectorAll('input[name="known_language"]');
    let anySelected = false;

    languageBoxes.forEach(box => {
        if (box.checked) anySelected = true;
    });

    if (!anySelected) {
        languageBoxes.forEach(box => box.closest('tr').style.backgroundColor = "#ffcccc");
    }

    console.log('checkAtLeastOneLanguage: ' + (anySelected ? 'PASS' : 'FAIL'));
    return anySelected;
}

function checkAtLeastOneTechnology() {
    let techBoxes = document.querySelectorAll('input[name="known_tech"]');
    let anySelected = false;

    techBoxes.forEach(box => {
        if (box.checked) anySelected = true;
    });

    if (!anySelected) {
        techBoxes.forEach(box => box.closest('tr').style.backgroundColor = "#ffcccc");
    }

    console.log('checkAtLeastOneTechnology: ' + (anySelected ? 'PASS' : 'FAIL'));
    return anySelected;
}

function validateAll() {
    const results = [
        checkFirstName(),
        checkLastName(),
        checkDesignation(),
        checkEmail(),
        checkPhone(),
        checkAddress(),
        checkCity(),
        checkState(),
        checkZipCode(),
        checkGender(),
        checkRelationship(),
        checkDob(),
        checkEducationTable(),
        checkWorkTable(),
        checkLanguages(),
        checkTechnologies(),
        checkAvailabilityDate(),
        checkExpectedSalary(),
        checkAdditionalNotes(),
        checkAtLeastOneLanguage(),
        checkAtLeastOneTechnology()
    ];

    const allPass = results.every(Boolean);
    console.log('validateAll: ' + (allPass ? 'ALL PASS' : 'SOME FAIL'));
    return allPass;
}

// ==========================================================================
// PHASE 6: THE MASTER SUBMIT BUTTON
// ==========================================================================

let validateBtn = document.getElementById('btn-validate-basic');

validateBtn.addEventListener('click', function (event) {
    if (validateAll()) {
        alert("Form is perfectly valid!");
    } else {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

let applicationForm = document.getElementById('jobapplication-form');

applicationForm.addEventListener('submit', function (event) {
    if (!validateAll()) {
        event.preventDefault();
        alert("Please fix errors before submitting.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});