//NAVIGATION OVERLAY "MENU" BUTTON TOGGLE//
function toggleOverlay() {
    let overlay = document.getElementById("info-overlay");
    let menuButtons = document.querySelectorAll(".menu-button"); // Select both menu buttons

    if (overlay.classList.contains("open")) {
        overlay.classList.remove("open"); // Hide overlay
        menuButtons.forEach(button => {
            button.textContent = "Menu"; // Change text back to "Menu"
        });
    } else {
        overlay.classList.add("open"); // Show overlay
        menuButtons.forEach(button => {
            button.textContent = "Home"; // Change text to "Home"
        });
    }
}
    //LOGO IMAGERY//
        // Array of logo images
        const logoImages = [
            'Assets/Logos/Cream/G_01_Cream.svg',
            'Assets/Logos/Cream/G_02_Cream.svg',
            'Assets/Logos/Cream/G_03_Cream.svg',
            'Assets/Logos/Cream/G_04_Cream.svg',
            'Assets/Logos/Cream/G_05_Cream.svg'
        ];

        // Variables to track the current image index
        let currentImageIndex = 0;

        // Function to update the logo image
        function cycleLogo() {
            const logo = document.getElementById('logo');
            currentImageIndex = (currentImageIndex + 1) % logoImages.length; // Cycle to the next image
            logo.src = logoImages[currentImageIndex];
        }

        // Check if the user is on a mobile device
        function isMobile() {
            return /Mobi|Android/i.test(navigator.userAgent);
        }

        // Handle logo behavior for mobile
        if (isMobile()) {
            // Automatically cycle through logos every 3 seconds
            setInterval(cycleLogo, 2000);
        } else {
            // For non-mobile, attach the mouse movement behavior
            let lastX = 0, lastY = 0;
            const speedThreshold = 30;

            document.addEventListener('mousemove', (event) => {
                const distance = Math.sqrt(Math.pow(event.clientX - lastX, 2) + Math.pow(event.clientY - lastY, 2));
                lastX = event.clientX;
                lastY = event.clientY;

                if (distance > speedThreshold) {
                    cycleLogo();
                }
            });
        }


    // EMAIL OPT-IN //
    document.getElementById("emailForm").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent page reload
    
        let emailInput = document.getElementById("emailInput").value.trim();
        let submitButton = document.getElementById("submitButton");
        let buttonText = document.getElementById("buttonText");
        let spinner = document.getElementById("loadingSpinner");
        let checkmark = document.getElementById("checkmark");
        let statusText = document.getElementById("statusText");
        let emailMessage = document.getElementById("emailMessage"); // Ensure this exists in HTML
        let emailTitle = document.querySelector(".emailTitle"); // This is the title text block
        let emailContainer = document.querySelector(".email-container"); // The entire email section
    
        let googleScriptURL = "https://script.google.com/macros/s/AKfycbwkd41HgMaJHEcNo3e8jcB5yDj5FpBDKrqC8NUQHe-BFKJdu6iHSagNS3mdkPBxm3UE/exec";
    
        if (emailInput.includes("@") && emailInput.includes(".")) {
            // Show immediate loading state
            buttonText.style.display = "none";
            spinner.style.display = "inline-block";
            statusText.textContent = "Saving...";
    
            // Send data to Google Apps Script
            fetch(googleScriptURL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `email=${encodeURIComponent(emailInput)}`
            }).then(() => {
                // Show checkmark and success message
                spinner.style.display = "none";
                checkmark.style.display = "inline-block";
                statusText.textContent = "Done";
    
                // Hide the form and title text smoothly
                setTimeout(() => {
                    emailTitle.style.opacity = "0"; // Fade out title
                    document.getElementById("emailForm").style.opacity = "0"; // Fade out form
                    
                    setTimeout(() => {
                        emailTitle.style.display = "none"; // Hide title
                        document.getElementById("emailForm").style.display = "none"; // Hide form
    
                        // Show thank-you message
                        emailMessage.innerHTML = `
                            <div class="thank-you-wrapper">
                                <h4 class="thank-you-title">THANKS FOR REACHING OUT!</h4>
                                <p class="thank-you-message">
                                    We're excited to learn more about your venture and determine how we can best partner with you on creating something 
                                    <span style="font-weight: 400;">meaningful</span> and <span style="font-weight: 400;">impactful.</span>
                                    <br><br>We'll be in touch shortly 🤎
                                </p>
                            </div>`;
                        
                        emailMessage.style.opacity = "1"; // Fade in thank-you message
                    }, 300); // Short delay for smooth transition
                    
                }, 300);
    
                // Reset input field
                document.getElementById("emailInput").value = "";
    
            }).catch(() => {
                // Handle errors
                buttonText.style.display = "inline";
                spinner.style.display = "none";
                statusText.textContent = "";
                alert("An error occurred. Please try again.");
            });
        } else {
            alert("Please enter a valid email.");
        }
    });
    