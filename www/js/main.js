class App {

    constructor() {
        this.pages = [];
        this.welcomePages = [];
        this.currentPageID = 0;
        this.activePageSet = 0; // 0=welcome, 1=main

        this.dbConnection;
        this.swipeHandler;

        // Page Sets
        this.mainSet;
        this.welcomeSet;
    }

    initialize(params) {
        // bind sets the value of 'this' inside the function to this object
        document.addEventListener('deviceready', this.onReady.bind(this), false);
        document.addEventListener('pause', this.onPause.bind(this), false);
        document.addEventListener('resume', this.onResume.bind(this), false);
    }

    onReady() {
        console.log("DEVICE READY");
        this.dbConnection = new DatabaseConnection();
        this.dbConnection.createNewTables();
        this.dbConnection.insertDummyValues();
        this.swipeHandler = new SwipeHolder("#app");
        FastClick.attach(document.body);



        $(".loader").remove();
        $("#app").html(""); // Clear so it's a clean slate to add to

        // ---- PAGE SETS ---- //
        this.mainSet = new MainSet(this.swipeHandler, this.setActivePageSet, this);
        this.mainSet.constructPages();

        this.welcomeSet = new WelcomeSet(this.swipeHandler, this.setActivePageSet, this);
        this.welcomeSet.constructPages();

        // And set the PageSet by checking Authentication
        this.determinePageSet();
    }

    /**
     * Attempts to log in the user based on SID. If invalid, it will
     * set the page set to the login / welcome pages
     */
    determinePageSet() {

        // If session is present, attempt to log in
        if (Authentication.hasSession()) {
            let sid = Authentication.getSID();
            // Authenticate and handle response (then = success)
            Authentication.validateSID(sid).then((response) => {
                console.log("[main.js:determinePageSet()] Valid log in data");
                this.setActivePageSet(1); // Bring to main screen
                return;

            }).catch((error) => {
                console.log("[main.js:determinePageSet()] Invalid SID, logging out");
            });

        } else {
            console.log("[main.js:determinePageSet()] No SID data");
        }

        this.setActivePageSet(1); // Default to main page, for now
    }

    /**
     * Sets the active page and calls all functions needed to prepare
     * for usability for the given set. Useful as a callback for logging
     * in or out as page sets change
     * 
     * @param {Integer} pageSetId page set id (0-1 inclusive)
     * @param {App} _this [default = this] Used by PageSets to make sure
     *                    the value of "this" is correctly set
     */
    setActivePageSet(pageSetId, _this = this) {
        // First, disable all sets
        _this.mainSet.disable();
        _this.welcomeSet.disable();

        // Then enable the selected set
        if (pageSetId == 0) {        // Welcome
            _this.welcomeSet.activate();
            _this.activePageSet = 0;
        } else if (pageSetId == 1) { // Main
            _this.mainSet.activate();
            _this.activePageSet = 1;
        } else {
            console.log("[main.js:setActivePageSet()] Invalid page set Id: " + pageSetId);
            _this.welcomeSet.activate();
            _this.activePageSet = 0;
        }
    }

    /**
     * Returns a page by passing in an integer id or string name
     * 
     * @throws an exception if the parameter is not an integer or string
     * 
     * @param {Number | String} identifier 
     */
    getPage(identifier) {
        if (typeof identifier == "string") {
            for (let i = 0; i < this.pages.length; i++) {
                if (this.pages[i].name == identifier) {
                    return this.pages[i];
                }
            }

            throw new Error(`Could not find ${identifier} inside of pages`);
        } else if (typeof identifier == "number" && Number.isInteger(identifier)) {
            for (let i = 0; i < this.pages.length; i++) {
                if (this.pages[i].id == identifier) {
                    return this.pages[i];
                }
            }

            throw new Error(`Could not find ${identifier} inside of pages`);
        } else {
            throw new Error(`Incorrect datatype entered for getPage, expected integer or string, you entered ${typeof identifier}`);
        }
    }

    onPause() {
        console.log("Device is paused");
    }

    onResume() {
        console.log("Device is resumed");
    }
}

// this is the main entry point for the app
let app = new App();
app.initialize();
