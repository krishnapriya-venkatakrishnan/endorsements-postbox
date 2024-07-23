import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, get, ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const loginEl = document.getElementById("login")
const loginInpEl = document.getElementById("login-input")
const loginBtnEl = document.getElementById("login-btn")
const logoutBtnEl = document.getElementById("logout-btn")
const endorsementPostboxEl = document.getElementById("endorsement-postbox")

const endorsementsContainerEl = document.getElementById("endorsements-container")
const endorsementInpEl = document.getElementById("endorsement-inp")
const endorsementSenderEl = document.getElementById("endorsement-sender")
const endorsementReceiverEl = document.getElementById("endorsement-receiver")
const endorsementPostBtnEl = document.getElementById("endorsement-post-btn")
const postedEndorsementsEl = document.querySelector(".posted-endorsements")

// get the logged in user
let username = ""
// this id is generated when the user logs in. this is a key to the object value
let endorsementId
// object template is created
let endorsementObject = {
    currentUser: "",
    receiver: "",
    sender: "",
    endorsement: "",
    numberOfLikes: 0,
    likedBy: []
}

// initializing firebase setup
const appSettings = {
    databaseURL: import.meta.env.VITE_FIREBASE_URL
}
const initialize_App = initializeApp(appSettings)
const get_Database = getDatabase(initialize_App)
const _ref = ref(get_Database, "Endorsements")

// below event is triggered, when the user logs in
loginBtnEl.addEventListener("click", function () {
    endorsementObject = {}  // resetting the global template
    endorsementObject.currentUser = loginInpEl.value    
    username = endorsementObject.currentUser    // recording the current user
 
    if (!username){
        alert("Enter username")
        return
    }
// login page is disabled and endorsement page is displayed   
    loginEl.style.display = "none"
    endorsementsContainerEl.style.display = "flex"
    logoutBtnEl.style.display = "block"
    endorsementPostboxEl.style.margin = "0px auto"
    loginInpEl.value = ""
// a key is created for the current endorsement.
// this is a dummy push to reload the data from the firebase
// this is done for correctly choosing the heart image of the current user
    push(_ref, endorsementObject).then((snapshot) => {        
        endorsementId = snapshot.key;
    })
})


// onValue is triggered, whenever there is a change in the firebase
onValue(_ref, function(snapshot) {
        
    if (snapshot.exists()) {
        let snapshotEntries = Object.entries(snapshot.val())
        let snapshotEntriesLength = snapshotEntries.length
        
        // resetting the endorsement section
        postedEndorsementsEl.innerHTML = ""
        // each entry in the Endorsements base is looped and displayed in the site.
        for(let entry = 0 ; entry < snapshotEntriesLength ; entry++ ) {
            
            // values are retrieved from the firebase
            let currentSnapshotEntry = snapshotEntries[entry]
            let endorsementKey = currentSnapshotEntry[0]
            let snapshotValue = currentSnapshotEntry[1]
            
            // then set to the global object, which is used in html display
            endorsementObject.receiver = snapshotValue.receiver
            endorsementObject.sender = snapshotValue.sender
            endorsementObject.endorsement = snapshotValue.endorsement
            endorsementObject.numberOfLikes = snapshotValue.numberOfLikes
            endorsementObject.currentUser = snapshotValue.currentUser    
            
            // below is to delete a dummy entry    
            if (!endorsementObject.endorsement){
                let refLink = ref(get_Database, `Endorsements/${endorsementKey}`)  
                remove(refLink)
                continue
            }
            
            // posting the firebase value in the site    
            postEndorsement(endorsementObject, endorsementKey)
            
            // resetting the input values    
            endorsementReceiverEl.value = ""
            endorsementSenderEl.value = ""
            endorsementInpEl.value = ""
        }    
            
    } 
    
})

// below code is executed, when the user logs out.
// endorsement page is blocked
// login page is displayed
logoutBtnEl.addEventListener("click", function () {
    loginEl.style.display = "flex"
    endorsementsContainerEl.style.display = "none"
    logoutBtnEl.style.display = "none"
    endorsementPostboxEl.style.margin = "50px auto"
})

// when the user submits the endorsement, below is executed
endorsementPostBtnEl.addEventListener("click", function () {
    
    endorsementObject = {}  // resetting the global object
    endorsementObject.receiver = endorsementReceiverEl.value
    endorsementObject.sender = endorsementSenderEl.value
    endorsementObject.endorsement = endorsementInpEl.value
    endorsementObject.numberOfLikes = 0
    endorsementObject.currentUser = username
    endorsementObject.likedBy = [username]
        
    //  push function is called and entire object is updated in the firebase
    push(_ref, endorsementObject)
    
})

// when the current user clicks on the like(heart) button
function handleClickOfEndorsementImgBtn(p_endorsementImgBtnEl) {
    
    // receive the image button element
    let postedEndorsementImageBtnId = ""
    postedEndorsementImageBtnId = p_endorsementImgBtnEl
    
    // get the respective number of likes element
    // in short, there are 2 siblings
    // 1. div -> img
    // 2. div
    // at this point, we have img from point 1.
    // we need div from point 2. 
    let postedEndorsementNoOfLikesId =postedEndorsementImageBtnId.parentNode.nextElementSibling;
    let postedEndorsementNoOfLikesValue = parseInt(postedEndorsementNoOfLikesId.textContent)

    // flag to indicate if number of likes to be incremented
    let updateNumberOfLikes = 0
    // get the users who have liked the comment
    get(ref(get_Database, 'Endorsements/' + postedEndorsementImageBtnId.id + '/likedBy'))
        .then((snapshot) => {
            let currentLikedBy = [];
            if (snapshot.exists()) {
                currentLikedBy = snapshot.val()    // store the users list
            }
            
            // the current user can like the post, only when he has not already liked it or posted it
            if (!currentLikedBy.includes(username)) {
                updateNumberOfLikes = 1
                currentLikedBy.push(username)
                
                // update the firebase with the latest data
                update(ref(get_Database, 'Endorsements/' + postedEndorsementImageBtnId.id), {
                numberOfLikes: postedEndorsementNoOfLikesValue+1,
                likedBy: currentLikedBy
                })
            } else if (currentLikedBy[0] == username) {
                console.log("Current user posted this comment")
            } else{
                console.log("User has already liked this comment.")
            }
    })

    // update the number of likes
    if (updateNumberOfLikes) {
        postedEndorsementNoOfLikesId.textContent = postedEndorsementNoOfLikesValue + 1
    }

}

// post the endorsements in the site
function postEndorsement (p_endorsementObject, p_endorsementId) {
    
    // to hold the likedBy URL of the looped post
    let likedByURL = ""
    // array to store the values retrieved from firebase
    let likedByArray = []
    
    // username check is done to avoid fetching the URL when the user is in login page
    if (username) {
        let likedByURL = ref(get_Database, `Endorsements/${p_endorsementId}/likedBy`)
        // fetch the specific information from the firebase using get function
        get(likedByURL).then(function (snapshot) {
            if (snapshot.exists()) {
                likedByArray = snapshot.val()
                // below is to decide on why heart to be displayed
                let verifyPostedEndorsementImageBtn = document.getElementById(p_endorsementId)
                if ((likedByArray[0] != username) && likedByArray.includes(username)) {
                    verifyPostedEndorsementImageBtn.textContent = '❤️'
                } else {
                    verifyPostedEndorsementImageBtn.textContent = '🤍'
                }
            }
        })
    }
    
    // element to be posted in the site
    let mocked_endorsement = `
        <div class="posted-endorsement">
            <div class="posted-endorsement-header">To: ${p_endorsementObject.receiver}</div>
            <div class="posted-endorsement-body">${p_endorsementObject.endorsement}</div>
            <div class="posted-endorsement-footer">
                <div class="posted-endorsement-sender">From: ${p_endorsementObject.sender}</div>
                <div class="posted-endorsement-likes">
                    <div class="posted-endorsement-image">
                        <button id=${p_endorsementId} class="posted-endorsement-image-btn">
                            
                        </button>
                    </div>
                    <div class="posted-endorsement-no-of-likes">${p_endorsementObject.numberOfLikes}</div>
                </div>
            </div>
        </div>
    `
    
    // to display the recent comments at top
    postedEndorsementsEl.insertAdjacentHTML('afterbegin', mocked_endorsement)
    
    // setup to handle event
    const endorsementImgBtnEl = document.getElementById(p_endorsementId)
    // if the image element is loaded in the DOM, remove the event from the element
    if (endorsementImgBtnEl) {
        endorsementImgBtnEl.removeEventListener("click", handleClickOfEndorsementImgBtn)
    }
    // then attach the event to the element of the looped endorsement
    endorsementImgBtnEl.addEventListener("click", function(event) {
        if (event.target.classList.contains("posted-endorsement-image-btn")) {
            if (event.target.id == p_endorsementId) {
                handleClickOfEndorsementImgBtn(event.target)
            }
        }
    });

}
