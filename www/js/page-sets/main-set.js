
class MainSet extends PageSet {
    
    /**
     * Contains the main logic for the app, including the stopwatch and team pages.
     * 
     * @param {SwipeHolder} swipeAgent copy of SwipeHolder instance for gesture handling
     * @param {Function} changeCallback the function used to change page sets, i.e. setActivePageSet()
     * @param {App} appCopy copy of the App instance to perserve the value of "this"
     */
    constructor(swipeAgent, changeCallback, appCopy) {
        super("MainSet", swipeAgent, appCopy);
        this.onChangePageSet = function (newId) {
            changeCallback(newId, this.appCopy);
        };
        
        // this.swipeHandler  (PageSet parent variable)
        this.navbar = new Navbar();
    }
    
    // ---- OVERRIDE METHODS ---- //
    
    constructPages() {
        let pageClassArray = [Stopwatch, Stats, TeamLanding, Account];
        let pageNameArray = ["Stopwatch", "Stats", "TeamLanding", "Account"];
        
        // TODO: To make this cleaner instead of page arrays, use a single "TeamManager" (WIP name)
        //       and have it dynamically show the appropriate team page (i.e. this.pageController.show("CreateTeam"))
        
        // Replace Team class with CreateTeam if the stored ID is missing or invalid
        // if((localStorage.getItem("id_team") == null) || (localStorage.getItem("id_team") == undefined)) {
        //     pageClassArray[2] = CreateTeam;
        //     pageNameArray[2] = "CreateTeam";
        //     $(".navbar > #team").prop("id", "createteam"); // Can't camel case, toLowerCase() is called later
        // }
        
        this.pageArray = pageClassArray.map((page, i) => new page(i, this));
        this.pageArray.forEach((pageObj, pageIndex) => {
            let shouldShow = false; // Should be page be visible at start? (only for first page)
            if (pageIndex == 0) {
                shouldShow = true;
            }
            this.transitionObj.addPage((pageObj.name.toLowerCase() + "Page"), pageObj.getHtml(), shouldShow);
            // Start the pages so they display correctly when sliding
            pageObj.start();
            pageObj.stop();
        });
        
        // Include this here so it's easier to enable / disable later
        this.navbar.initNavbar(this.switchPage.bind(this), pageNameArray);
        this.disable(); // Disable until enabled
    }
    
    activate() {
        this.transitionObj.showCurrentPage();
        this.currentPageId = 0;
        this.pageArray[this.currentPageId].start();
        this.defineSwipes(0);
        
        $(".navbar").css("display", "table");
    }
    
    disable() {
        this.transitionObj.hidePages();
        this.transitionObj.setCurrentPage(this.pageArray[0].name.toLowerCase() + "Page");
        this.currentPageId = this.pageArray[0].id;
        this.clearSwipes();
        
        $(".navbar").css("display", "none");
        this.navbar.focusButton("#" + this.pageArray[0].name.toLowerCase());
    }
    
    switchPage(pageName) {
        // If it's a team thing, let the team-landing determine which page to show
        if(pageName == "TeamLanding") {
            
        }
        
        this.pageArray[this.currentPageId].stop(); // Stop current page
        this.transitionPage(pageName); // Begin transition
        this.currentPageId = (this.getPage(pageName).id);
        this.pageArray[this.currentPageId].start();
    }
    
    
    // ---- SET SPECIFIC METHODS ---- //
    
    /**
     * @description Handle any transition display while moving from one page to another. 
     * @param {String} pageName name of the page to transition to
     */
    transitionPage(pageName) {

        this.navbar.focusButton("#" + pageName.toLowerCase());
        if (this.getPage(pageName).id > this.currentPageId) {
            this.transitionObj.slideLeft(pageName.toLowerCase() + "Page", 200);
        } else if (this.getPage(pageName).id < this.currentPageId) {
            this.transitionObj.slideRight(pageName.toLowerCase() + "Page", 200);
        } else {
            console.log("[main-set.js:transitionPage()]: Tried to switch page! Page ID is already current!!");
        }
        this.defineSwipes(this.getPage(pageName).id);

    }
    
    /**
     * Defines the transitionObj actions for this page (left, right, moving)
     * 
     * @example this.defineSwipes(this.getPage(nextPage).id); --> sets up handlers for new / next page
     * 
     * @param {Ingeger} pageIndex the numerical index corresponding to pageArray Map object
     */
    defineSwipes(pageIndex) {

        // Going left (swiping right)
        if (pageIndex > 0) {
            this.swipeHandler.bindGestureCallback(this.swipeHandler.Gestures.SWIPERIGHT, () => {
                this.switchPage(this.getPage(pageIndex - 1).name);
            });
        } else {
            // Blank since 0 is left-most page
            this.swipeHandler.bindGestureCallback(this.swipeHandler.Gestures.SWIPERIGHT, () => { });
        }

        // Going right (swiping left)
        if (pageIndex < this.pageArray.length - 1) {
            this.swipeHandler.bindGestureCallback(this.swipeHandler.Gestures.SWIPELEFT, () => {
                this.switchPage(this.getPage(pageIndex + 1).name);
            });
        } else {
            this.swipeHandler.bindGestureCallback(this.swipeHandler.Gestures.SWIPELEFT, () => { });
        }

        // Moving (Left / Right)
        // dx > 0 ==> Swiping right to left,   dx < 0 ==> Left to right
        this.swipeHandler.bindGestureCallback(this.swipeHandler.Gestures.MOVE, (dx, dy) => {
            if ((dx > 0) && (pageIndex < this.pageArray.length - 1)) {
                this.transitionObj.slidePageX(this.getPage(pageIndex + 1).name.toLowerCase() + "Page", true, Math.abs(dx), 200);
            } else if ((dx < 0) && (pageIndex > 0)) {
                this.transitionObj.slidePageX(this.getPage(pageIndex - 1).name.toLowerCase() + "Page", false, Math.abs(dx), 200);
            } else {
                this.transitionObj.slidePageX(this.getPage(pageIndex).name.toLowerCase() + "Page", true, 0);
            }
        });

        // If the gesture was classified as a tap or scroll, snap it back / reset it
        this.swipeHandler.bindGestureCallback(this.swipeHandler.Gestures.TAP, () => {
            this.transitionObj.slidePageX(this.getPage(pageIndex).name.toLowerCase() + "Page", true, 0, 200);
        });
        this.swipeHandler.bindGestureCallback(this.swipeHandler.Gestures.SWIPEUP, () => {
            this.transitionObj.slidePageX(this.getPage(pageIndex).name.toLowerCase() + "Page", true, 0, 200);
        });
        this.swipeHandler.bindGestureCallback(this.swipeHandler.Gestures.SWIPEDOWN, () => {
            this.transitionObj.slidePageX(this.getPage(pageIndex).name.toLowerCase() + "Page", true, 0, 200);
        });
        
    }
    
    
    
}