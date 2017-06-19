/**
// @name            Unity Style Menu for Chrome
// @version         0.98
// @description     implements a fake menu in the style of the Unity skin for Kodi.
// @author          laforge0780
**/

(function() {
    "use strict";
    var bIsAnimating;

    $("head").append("<link href='https://fonts.googleapis.com/css?family=Roboto:100,300' rel='stylesheet'>");

    loadSavedSettings();

    function init(oSettings) {
        bIsAnimating = null;

        if (oSettings.bUseWhitelist) {
            if ($.inArray(window.location.hostname, oSettings.aWhitelist) === -1) {
                return; //site not on whitelist, exit
            }
        }

        var sHTML = `
          <div class="unity-menu-outer">
              <div class="unity-menu-inner">
                  <div class="unity-menu-sidebar">
                  <div class="action-title" style="background-color:#${oSettings.sMenuColour}">Options</div>
                      <div class="action-exit-btn unity-menu-item active" title="Exit to Kodi">Exit to Kodi</div>
                      <div class="action-fullscreen-btn unity-menu-item" title = "Toggle fullscreen">Toggle Fullscreen</div>
                  </div>
              </div>
          </div> `;

        var $menu = $(sHTML);
        setMenuColour(oSettings.sMenuColour);

        //mouse events
        $menu.find(".action-exit-btn").click(function() {
            closeChromeWindow();
        });

        $menu.find(".action-fullscreen-btn").click(function() {
            toggleChromeFullScreen();
        });

        //add highlight to button under mousecursor, remove others
        $menu.find(".unity-menu-item").mouseenter(function() {
            if (!$(this).hasClass("active")) {
                $(this).addClass("active");

                var oCurrentlySelectedButton = $menu.find(".active");
                $(oCurrentlySelectedButton).removeClass("active");
            }
        })

        $menu.mouseenter(function() {
            if (bIsAnimating) {
                return;
            }
            bIsAnimating = true;
            $(this).animate({
                left: 0
            }, function() {
                bIsAnimating = false;
            });
        });

        $menu.mouseleave(function() {
            if (bIsAnimating) {
                return;
            }
            bIsAnimating = true;
            $(this).animate({
                left: "-" + $(this).css("width")
            }, function() {
                bIsAnimating = false;
            });
        });

        //keyboard events
        $("body").on("keydown", function(e) {

            var oCurrentlySelectedButton = $menu.find(".active");

            if (e.keyCode === 37) {
                //left arrow
                if (!menuIsOpen($menu)) {
                    $menu.animate({
                        left: 0
                    });
                }
            } else if (e.keyCode === 39) {
                //right arrow
                if (menuIsOpen($menu)) {
                    $menu.animate({
                        left: "-" + $menu.css("width")
                    });

                }
            } else if (e.keyCode === 40) {
                //down arrow
                if (oCurrentlySelectedButton.length !== 0 && menuIsOpen($menu)) {
                    e.preventDefault();
                    var oNextButton = $(oCurrentlySelectedButton).next(".unity-menu-item");
                    if (oNextButton.length === 0) {
                        return;
                    }
                    $(oNextButton).addClass("active");
                    $(oCurrentlySelectedButton).removeClass("active");
                }
            } else if (e.keyCode === 38) {
                //up arrow
                if (oCurrentlySelectedButton.length !== 0 && menuIsOpen($menu)) {
                    e.preventDefault();
                    var oPrevButton = $(oCurrentlySelectedButton).prev(".unity-menu-item");
                    if (oPrevButton.length === 0) {
                        return;
                    }
                    $(oPrevButton).addClass("active");
                    $(oCurrentlySelectedButton).removeClass("active");
                }
            } else if (e.keyCode === 13) {
                //enter
                if (oCurrentlySelectedButton.length !== 0 && menuIsOpen($menu)) {
                    if ($(oCurrentlySelectedButton).hasClass("action-fullscreen-btn")) {
                        toggleChromeFullScreen();
                    } else if ($(oCurrentlySelectedButton).hasClass("action-exit-btn")) {
                        closeChromeWindow();
                    }
                }
            }
        });

        $("body").filter(function() {
            return (self == top);
        }).prepend($menu);
    }

    // Functions
    /***
     * toggle fullscreen.
     * Will only execute if user initiated.
     ***/
    function toggleChromeFullScreen() {
        if (document.webkitIsFullScreen) {
            document.webkitCancelFullScreen();
        } else {
            document.body.webkitRequestFullScreen();
        }
    }

    /***
     * Close Chrome.
     * the tabs API required will only run in a background process
     ***/
    function closeChromeWindow() {
        chrome.runtime.sendMessage({
            cmd: "closeTabs"
        }, function(response) {
            if (response) {
                console.log(response.complete);
            }
        });
    }

    /***
     * return menu state
     * @returns {boolean} is open
     ***/
    function menuIsOpen($menu) {
        return ($menu.css("left") === "0px") ? true : false;
    }

    /***
     * set the menu colour in a stylesheet
     ***/
    function setMenuColour(sMenuColour) {
        var newStyle = $("<style>.unity-menu-item.active,.unity-menu-item:hover {  background-color:#" + sMenuColour + "}</style>");
        $("html > head").append(newStyle);
    }

    /***
     * gets a set of saved defaults or generates them
     ***/
    function loadSavedSettings() {
        chrome.storage.sync.get({
            "bUseWhitelist": false,
            "aWhitelist": ["www.stan.com.au"],
            "sMenuColour": "E51C23"
        }, function(data) {
            if (chrome.runtime.lastError) {
                console.log("load settings error.");
            } else {
                init(data);
            }
        })
    }
})();