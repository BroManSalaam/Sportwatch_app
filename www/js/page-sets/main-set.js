
class MainSet extends PageSet {
    
    constructor(swipeAgent) {
        super("MainSet", swipeAgent);
        
        // this.swipeHandler  (PageSet parent variable)
        this.navbar = new Navbar();
    }
    
    // ---- OVERRIDE METHODS ---- //
    
    constructPages() {
        this.pageArray = [Stopwatch, Stats, Team, Account].map((page, i) => new page(i));
        this.pageArray.forEach((pageObj, pageIndex) => {
            let shouldShow = false; // Should be page be visible at start? (only for first page)
            if (pageIndex == 0) {
                shouldShow = true;
            }
            this.transitionObj.addPage((pageObj.name.toLowerCase() + "Page"), pageObj.getHtml(), shouldShow);
        });
        
        // Include this hear so it's easier to enable / disable later
        this.navbar.initNavbar(this.switchPage.bind(this));
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
        this.clearSwipes();
        
        $(".navbar").css("display", "none");
    }
    
    switchPage(pageName) {
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
        if (pageIndex < this.pageArray.length) {
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
                this.transitionObj.slidePageX(this.getPage(pageIndex + 1).name.toLowerCase() + "Page", true, Math.abs(dx));
            } else if ((dx < 0) && (pageIndex > 0)) {
                this.transitionObj.slidePageX(this.getPage(pageIndex - 1).name.toLowerCase() + "Page", false, Math.abs(dx));
            } else {
                this.transitionObj.slidePageX(this.getPage(pageIndex).name.toLowerCase() + "Page", true, 0);
            }
        });

        // If the gesture was classified as a tap, snap it back / reset it
        this.swipeHandler.bindGestureCallback(this.swipeHandler.Gestures.TAP, () => {
            this.transitionObj.slidePageX(this.getPage(pageIndex).name.toLowerCase() + "Page", true, 0);
        });

    }
    
    
    
}