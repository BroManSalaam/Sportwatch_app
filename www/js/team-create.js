/**
 * @classdesc Houses specifically the creation aspect of team logic
 * @class
 */
class CreateTeam extends Page {
    
    constructor(id, pageSetObject) {
        super(id, "CreateTeam");
        
        this.pageController = pageSetObject;
        this.transitionObj = new PageTransition("#createteamPage");
        
        // Team properties
        this.teamName = "";
        this.schoolName = ""; // TODO: Change to ID or maybe an auto-complete
        this.secondaryCoach = "";
        
        // Control variables
        this.nameIsValid = false;
        this.secondaryValid = false; // Secondary coach
        this.codeValid = false; // Invite code
        
        // Playground:  https://jsbin.com/mokimapiho/edit?html,js,output
        
        // ---- PAGES ---- /
        
        this.namePage = (`
            <div id="namePage" class="div_page">
                <h1 id="h1_giveName">Name the Team</h1><br>
                <input id="input_teamName" class="sw_text_input" type="text" placeholder="Track Team"></input>
                <input id="button_submitName" type="submit" value=" " disabled></input>
                <br><br>
                <p id="p_tipHeading"><u>Naming Tips</u></p><br>
                <ul class="ul_tips">
                    <li id="tip_length" class="tips bolded">Use 15-45 characters</li><br>
                    <li id="tip_specials" class="tips">Avoid special characters</li><br>
                    <li id="tip_capitalize" class="tips bolded">Capitalize significant words</li><br>
                    <li id="tip_uniqueName" class="tips">Create a unique name</li>
                </ul>
            </div>
        `);
        
        // TODO: Add "fill in" / school search and store ID instead of name
        this.schoolPage = (`
            <div id="schoolPage" class="div_page">
                <h1 id="h1_schoolName">Team's School</h1>
                <input id="team_school" class="sw_text_input" type="text" placeholder="Springtime School"></input>
                <br><br>
                
                <!-- Progression Buttons -->
                <button id="schoolBack" class="button_progression button_back"></button>
                <button id="schoolNext" class="button_progression button_next"></button>
            </div>
        `);
        
        this.optionsPage = (`
            <div id="optionsPage" class="div_page">
                <h1 id="h1_secondaryCoach">Secondary Coach (Optional)</h1>
                <input id="input_secondaryCoach" class="sw_text_input" type="text" placeholder="assistant@sportwatch.us"></input>
                <br>
                <h1 id="h1_inviteCode">Invite Code (Optional)</h1>
                <input id="input_inviteCode" class="sw_text_input" type="text" placeholder="6e3bs36"></input>
                <br><br>
                
                <!-- Progression Buttons -->
                <button id="button_createTeam">Create Team</button><br><br><br>
                <button id="schoolNext" class="button_progression button_back"></button>
            </div>
        `);
        
        this.postCreatePage = (`
            <div id="postCreatePage" class="div_page">
                <h1 id="h1_created">Team Created!</h1>
                <p>
                    Congratulations! You have successfully created a team!
                    Your invite code is <b><span id="inviteCode">Not Avaiable</span></b>.
                    Share this with your athletes, or invite them below!
                </p>
                
                <button id="button_goToInvite">Invite Athletes</button><br>
                <button id="button_goToMain">Done</button>
            </div>
        `);
        
        this.invitePage = (`
            <div id="invitePage" class="div_page">
                <div id="schoolInviteWrapper" class="sectionWrapper" style="display: none;">
                    <h1 id="h1_schoolInvite">Invite from School</h1>
                    <div id="schoolAthletesList">
                        <!-- Athlete Buttons will be added here -->
                    </div>
                </div>
                
                <div class="sectionWrapper">
                    <h1 id="h1_emailInvite">Invite via Email</h1>
                    <input id="input_athleteEmail" class="sw_text_input" type="text" placeholder="randy@sportwatch.us"></input>
                    <br>
                    <button id="button_sendInvite" class="sw_button">Invite</button>
                </div>
                
                <!-- Progression Buttons -->
                <button id="button_createTeam">Create Team</button><br><br>
                <button id="schoolNext" class="button_progression button_back"></button>
                <br><br>
            </div>
        `);
    }
    
    getHtml() {
        return (`
            <div id="createteamPage" class="div_page">
                <div id="banner">
                    <h1>Create Team</h1>
                    <span class="step step_selected" id="step1">1</span>
                    <span class="step" id="step2">2</span>
                    <span class="step" id="step3">3</span>
                </div>
                ${this.namePage}
                ${this.schoolPage}
                ${this.optionsPage}
                ${this.postCreatePage}
                ${this.invitePage}
            </div>
        `);
    }
    
    start() {

        // Only link them to pageTransition once
        if (this.transitionObj.getPageCount() == 0) {
            this.transitionObj.addPage("namePage", this.namePage, true);
            this.transitionObj.addPage("schoolPage", this.schoolPage);
            this.transitionObj.addPage("optionsPage", this.optionsPage);
            this.transitionObj.addPage("postCreatePage", this.postCreatePage);
            this.transitionObj.addPage("invitePage", this.invitePage);
        } else {
            // Hide other pages besides current (see team.js for full explanation)
            this.transitionObj.hidePages();
            this.transitionObj.showCurrentPage();
        }
        
        // Focus on any elements that are clicked
        this.getPageElement("input").click((e) => {
            $(e.target).focus();
        });
        
        // ---- VALUE POPULATION ---- //
        
        // Fetch account school to auto-fill
        AccountBackend.getAccount((response) => {
            if(response.status < 0) {
                console.log("[team-create.js:start()]: Requesting account info failed");
                console.log(response);
            } else {
                this.getPageElement("#team_school").val(response.schoolName);
            }
        });
        
        
        // ---- PROGRESSION BUTTONS ---- //
        
        // Progression buttons (LAST 2 PAGES)
        this.getPageElement(".button_next").click((e) => {
            let currentPage = this.transitionObj.getCurrentPage();
            document.activeElement.blur();
            
            if(currentPage.includes("school")) {
                this.selectPage(3);
                this.schoolName = this.getPageElement("#team_school").val().trim();
                if(this.secondaryValid) {
                    this.secondaryCoach = this.getPageElement("#input_secondaryCoach").val().trim();
                }
                console.log("Set School (" + this.schoolName + ")");
            } else {
                console.log("[team-create.js:start()]: Next button not configured for page " + currentPage);
            }
        });
        
        // Back button
        this.getPageElement(".button_back").click((e) => {
            let currentPage = this.transitionObj.getCurrentPage();
            document.activeElement.blur();
            
            if(currentPage.includes("school")) {
                this.selectPage(1, false);
                this.getPageElement("#schoolAthletesList").html(""); // Clear in case school is changed
                
            } else if(currentPage.includes("options")) {
                this.selectPage(2, false);
                
            } else if(currentPage.includes("invite")) {
                this.transitionObj.slideRight("postCreatePage");
                
            } else {
                console.log("[team-create.js:start()]: Back button not configured for page " + currentPage);
            }
        });
        
        // Invite button
        this.getPageElement("#button_goToInvite").click((e) => {
            // Try getting a list of athletes from the school's team
            // TODO: Change "2" to actual school ID
            ToolboxBackend.getUsersInSchool(2, (response) => {
                if(response.status > 0) {
                    this.generateAthleteButtons(response);
                } else {
                    console.log("[team-create.js:start()]: Unable to get school users, hiding that portion");
                    this.getPageElement("#schoolInviteWrapper").css("display", "none");
                }
            });
            
            this.transitionObj.slideLeft("invitePage");
        });
        
        // Exit page / go to main page button
        this.getPageElement("#button_goToMain").click((e) => {
            this.pageController.switchPage("TeamLanding");
        });
        
        // ---- SUBMIT LOGIC ---- //
        
        // Team name
        this.getPageElement("#button_submitName").on("click", (e) => {
            e.preventDefault();
            document.activeElement.blur();
            
            if(this.nameIsValid) {
                this.teamName = this.getPageElement("#input_teamName").val().trim();
                console.log("Saved team name: " + this.teamName);
                this.selectPage(2);
            } else {
                // Not valid, so blur (aka hide the keyboard) to show the tips
                document.activeElement.blur();
            }
        });
        
        // Create team (what you've all been waiting for!)
        this.getPageElement("#button_createTeam").on("submit click", (e) => {
            let teamDetails = { }; // Compose the details of the team
            teamDetails.schoolName = this.schoolName;
            teamDetails.primaryCoach = localStorage.getItem("email");
            
            if(this.secondaryValid) {
                teamDetails.secondaryCoach = this.getPageElement("#input_secondaryCoach").val();
            }
            if(this.codeValid) {
                teamDetails.inviteCode = this.getPageElement("#input_inviteCode").val();
            }
            
            TeamBackend.createTeam(this.teamName, (response) => {
                if(response.status > 0) {
                    // Set local storage variables
                    let storage = window.localStorage;
                    storage.setItem("id_team", response.id_team);
                    storage.setItem("teamName", response.teamName);
                    this.getPageElement(".step").not(".step_selected").addClass("step_selected");
                    
                    // And slide!
                    this.getPageElement("#postCreatePage #inviteCode").html(response.inviteCode);
                    this.transitionObj.slideLeft("postCreatePage"); // Not procreate!!! Dirty mind ^_*
                } else {
                    // TODO: Add descriptive error messages
                    Popup.createConfirmationPopup("Team creation failed!", ["OK"], [() => { }]);
                }
            }, teamDetails);
        });
        
        // ---- INPUT CHECKS ---- //
        
        // Tip highlighting
        this.getPageElement("#input_teamName").on("keyup", (e) => {
            let keyCode = e.keyCode || e.charCode;
            if(keyCode == 13) { // Enter
                // Focus next input field
                this.getPageElement("#button_submitName").trigger("click");
            }
        });
        this.getPageElement("#input_teamName").on("input", (e) => {
            
            let input = this.getPageElement("#input_teamName").val();
            input = input.trim();
            // Set it as true; if it passes, it won't be set to false
            this.nameIsValid = true;
            
            // Length
            if((input.length < 15) || (input.length > 45)) {
                // Bold this tip since the criteria isn't met yet
                if(!this.getPageElement("#tip_length").hasClass("bolded")) {
                    this.getPageElement("#tip_length").addClass("bolded");
                }
                this.nameIsValid = false;
            } else {
                this.getPageElement("#tip_length").removeClass("bolded");
            }
            
            // Special characters (Plus &)
            if(input.replace(/[A-Za-z0-9& ]/gm, "").length > 0) {
                if (!this.getPageElement("#tip_specials").hasClass("bolded")) {
                    this.getPageElement("#tip_specials").addClass("bolded");
                }
                this.nameIsValid = false;
            } else {
                this.getPageElement("#tip_specials").removeClass("bolded");
            }
            
            // Capitalization (suggestion, not required)
            if (!(/[A-Z]/g.test(input))) {
                if (!this.getPageElement("#tip_capitalize").hasClass("bolded")) {
                    this.getPageElement("#tip_capitalize").addClass("bolded");
                }
            } else {
                this.getPageElement("#tip_capitalize").removeClass("bolded");
            }
            
            if(this.nameIsValid) {
                this.getPageElement("#button_submitName").prop("disabled", false);
            } else {
                this.getPageElement("#button_submitName").prop("disabled", true);
            }
        });
                
        // School name checking
        this.addInputCheck("#team_school", 5, 65, /[A-Za-z0-9. ]/gm, false, (schoolValid) => {
            // Use the NOT (!) operator since we want it disabled=false with valid=true
            this.getPageElement("#schoolPage .button_next").prop("disabled", !schoolValid);
        }, () => {
            // TODO: Either select best match for school name search and continue
        });
        
        // Secondary coach email (Options page)
        this.addInputCheck("#input_secondaryCoach", 5, 65, /[A-Za-z0-9.@\-_]/gm, true, (secondaryValid) => {
            
            let inputEmail = this.getPageElement("#input_secondaryCoach").val().trim();
            if(inputEmail.length > 0) {
                // Make sure email has all necessary parts (if given)
                let emailValidMatch = inputEmail.match(/[A-Za-z0-9\-_.]*@[A-Za-z0-9\-_.]*\.(com|net|org|us|website|io)/gm);
                if(emailValidMatch == null) {
                    secondaryValid = false;
                } else if(emailValidMatch[0].length != inputEmail.length) {
                    secondaryValid = false;
                }
                
                this.secondaryValid = secondaryValid;
                this.getPageElement("#button_createTeam").prop("disabled", !secondaryValid);
                
            } else { // Blank, so enable button since it's optional
                this.secondaryValid = false;
                this.getPageElement("#button_createTeam").prop("disabled", false);
            }
        }, () => { // On enter press
            document.activeElement.blur();
            // this.getPageElement("#input_inviteCode").focus(); // Doesn't seem to work on iOS
        });
        
        // Invite code (Options page)
        this.addInputCheck("#input_inviteCode", 7, 7, /[A-Za-z0-9]/gm, true, (codeValid) => {
            
            let inputCode = this.getPageElement("#input_inviteCode").val().trim();
            if(inputCode.length > 0) {
                this.codeValid = codeValid;
                this.getPageElement("#button_createTeam").prop("disabled", !codeValid);
            } else {
                this.codeValid = false;
                this.getPageElement("#button_createTeam").prop("disabled", false);
            }
            
        }, () => { // On enter press
            document.activeElement.blur();
            this.getPageElement("#button_createTeam").trigger("click");
        });
        
        // Invite via Email (Invite page)
        this.addInputCheck("#input_athleteEmail", 5, 65, /[A-Za-z0-9.@\-_]/gm, false, (invitedValid) => {
            
            let inputEmail = this.getPageElement("#input_athleteEmail").val().trim();
            if(inputEmail.length > 0) {
                // Make sure email has all necessary parts (if given)
                let emailValidMatch = inputEmail.match(/[A-Za-z0-9\-_.]*@[A-Za-z0-9\-_.]*\.(com|net|org|us|website|io)/gm);
                if(emailValidMatch == null) {
                    invitedValid = false;
                } else if(emailValidMatch[0].length != inputEmail.length) {
                    invitedValid = false;
                }
                
                this.getPageElement("#button_sendInvite").prop("disabled", !invitedValid);
                
            }
        }, () => { // On enter press
            document.activeElement.blur();
            this.getPageElement("#button_sendInvite").trigger("click");
        });
        
        
        // ---- MISC ---- //
        
        // Invite Logic //
        this.getPageElement("#button_sendInvite").click((e) => {
            let invitedEmail = this.getPageElement("#input_athleteEmail").val();
            
            // Don't try inviting if it's disabled
            if(this.getPageElement("#button_sendInvite").prop("disabled") == true) {
                return;
            }
            this.inviteAthlete(invitedEmail);
        })
        
    }
    
    stop() {
        $("#createteamPage").unbind().off();
        $("#createteamPage *").unbind().off();
    }
    
    // OTHER FUNCTIONS
    
    /**
     * Centralized method for inviting users to a team. It will display any
     * appropriate error (or success) messages
     * 
     * @param {String} email email address to send an invite to
     */
    inviteAthlete(email) {
        // Validate again just to be safe
        let emailMatch = email.match(/[A-Za-z0-9\-_.]*@[A-Za-z0-9\-_.]*\.(com|net|org|us|website|io)/gm);
        if(emailMatch == null) {
            this.getPageElement("#button_sendInvite").prop("disabled", true);
            Popup.createConfirmationPopup("Invalid email, please try again", ["OK"], [() => { }]);
            return;
        } else if(emailMatch[0].length != email.length) {
            this.getPageElement("#button_sendInvite").prop("disabled", true);
            Popup.createConfirmationPopup("Invalid email, please try again", ["OK"], [() => { }]);
            return;
        }
        
        TeamBackend.inviteToTeam(email, (response) => {
            if(response.status > 0) {
                this.getPageElement("#button_sendInvite").prop("disabled", true);
                if(response.substatus == 2) {
                    Popup.createConfirmationPopup("Athlete is already apart of this team", ["OK"], [() => { }]);
                } else {
                    Popup.createConfirmationPopup("Successfully invited!", ["OK"], [() => { }]);
                }
            } else {
                if(response.substatus == 3) {
                    Popup.createConfirmationPopup("Team is locked! Please unlock to invite athletes", ["Unlock Now", "Unlock Later"],
                    [() => {
                        // TODO: Unlock the team
                    }, () => { }]); // End of Popup callbacks
                } else if(response.substatus == 4) {
                    this.getPageElement("#button_sendInvite").prop("disabled", true);
                    Popup.createConfirmationPopup("Invalid email, please try again", ["OK"], [() => { }]);
                } else {
                    Popup.createConfirmationPopup("We're sorry, an error occured. Please try again later", ["OK"], [() => { }]);
                }
            }
        });
    }
    
    
    /**
     * Selects the page corresponding to the given integer. This is helpful
     * because it will also highlight the correct step number in the banner
     * 
     * @example selectPage(2, true); --> Slides left to School Team page
     *          selectPage(1, false); --> Slides right back to the Name the Team page
     * 
     * @param {Integer} stepNum 1-3 inclusive, where 1 is the starting page and 3 is the last page
     * @param {Boolean} slideLeft [default = true] slide left when progressing, right (aka false) when going back
     */
    selectPage(stepNum, slideLeft = true) {
        if(stepNum == 1) {
            if(slideLeft) {
                this.transitionObj.slideLeft("namePage");
            } else {
                this.transitionObj.slideRight("namePage");
            }
        } else if(stepNum == 2) {
            if(slideLeft) {
                this.transitionObj.slideLeft("schoolPage");
            } else {
                this.transitionObj.slideRight("schoolPage");
            }
        } else if(stepNum == 3) {
            if(slideLeft) {
                this.transitionObj.slideLeft("optionsPage");
            } else {
                this.transitionObj.slideRight("optionsPage");
            }
        } else {
            console.log("[team-create.js:selectPage()]: Unknown page number " + stepNum);
            return;
        }
        
        this.getPageElement(".step").removeClass("step_selected");
        this.getPageElement("#step" + stepNum).addClass("step_selected");
    }
    
    /**
     * Creates the buttons and their callbacks for inviting athletes
     * from the same school. This is limited to the response from
     * ToolboxBackend.getUsersInSchool() since it requires an array contianing
     * user information.
     * 
     * @param {AssociativeArray} responseObject response containing matches array of athlete information
     */
    generateAthleteButtons(responseObject) {
        
        // Show the "Invite from School" portion
        this.getPageElement("#schoolInviteWrapper").css("display", "");
        
        let buttonArray = []; // Array of button attribute objects [{...}, {...}, etc.]
        let currentAthlete = { }; // Set to each object in the matches array
        
        for(let s = 0; s < responseObject.matches.length; s++) {
            currentAthlete = responseObject.matches[s];
            
            // Skip the logged in user since they're creating the team
            if(currentAthlete.email == localStorage.getItem("email")) {
                continue;
            }
            
            // Set name (ignore NULL last name, limit length)
            let athleteName = currentAthlete.fname;
            if(currentAthlete.lname != null) {
                athleteName = athleteName + " " + currentAthlete.lname;
            }
            if(athleteName.length > 25) {
                athleteName = athleteName.substring(0, 23) + "...";
            }
            
            let buttonId = athleteName.toLowerCase().replace(" ", "");
            buttonArray.push(({"class": "button_schoolAthlete", "id": buttonId, "html": athleteName, "email": currentAthlete.email}));
        }
        
        // Finally, generate them
        ButtonGenerator.generateButtons("#createteamPage #invitePage #schoolAthletesList", buttonArray, (athlete) => {
            this.getPageElement("#" + athlete.id).prop("disabled", true);
            TeamBackend.inviteToTeam(athlete.email, (response) => {
                if(response.status > 0) {
                    this.getPageElement("#" + athlete.id).addClass("invited");
                } else {
                    this.getPageElement("#" + athlete.id).addClass("failed");
                    Popup.createConfirmationPopup("An unknown error occured", ["OK"], [() => { }]);
                }
            });
        });
    }
    
    /**
     * Checks the value / content of an input field to determine
     * if it is valid. It will return the boolean to reflect the state of the
     * input.
     * 
     * @example addInputCheck("#input_teamName", 15, 75, /[A-Za-z0-9/gm, false, () => { submitName(); });
     *          --> Will return false until name is 16-75 characters long,
     *              containing only letters or numbers, and will call the
     *              function submitName() if entered is pressed
     * 
     * @param {String} inputSelector jQuery selector for the input element
     * @param {Integer} lengthMin max length of input, exclusive
     * @param {Integer} lengthMax minimum length of input, inclusive
     * @param {Regex} acceptRegex regex expression ("/[A-Za-z0-9/gm") of accepted values
     * @param {Boolean} isOptional is the parameter optional / allowed to have a length of 0?
     * @param {Function} handleStatusCallback function that takes in a boolean (true for valid input, false otherwise)
     * @param {Function} enterActionCallback [optional] function to call when the enter key is pressed
     * 
     * @returns
     * True, if the input matches the criteria. False, otherwise
     */
    addInputCheck(inputSelector, lengthMin, lengthMax, acceptRegex, isOptional, handleStatusCallback, enterActionCallback = function() { }) {
        
        // Create keyup handler for enter button
        this.getPageElement(inputSelector).on("keyup", (e) => {
            let keyCode = e.keyCode || e.charCode;
            if(keyCode == 13) { // Enter
                enterActionCallback();
            }
        });
        
        // Create the input event handler
        this.getPageElement(inputSelector).on("input", (e) => {
            
            let input = this.getPageElement(inputSelector).val();
            input = input.trim();
            // Set it as true; if it passes, it won't be set to false
            let isValid = true;
            
            // Check to see if it's optional and return if it's eligible
            if(isOptional) {
                if(input.length == 0) {
                    handleStatusCallback(true);
                    return;
                }
            }
            
            // Length
            if((input.length < lengthMin) || (input.length > lengthMax)) {
                isValid = false;
            }
            // Special characters
            if(input.replace(acceptRegex, "").length > 0) {
                isValid = false;
            }
            
            handleStatusCallback(isValid);
        });
    }
    
    /**
     * Used to get only the elements contained within this page by prepending
     * #createteamPage to every selector
     * 
     * @param {String} selector jQuery selection criteria
     */
    getPageElement(selector) {
        return $("#createteamPage " + selector);
    }
    
}