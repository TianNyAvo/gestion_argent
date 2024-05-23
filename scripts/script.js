$(document).ready(function(){
    $('#loginForm').submit(function(e){
        e.preventDefault(); // Prevent the default form submission

        // Get the form data
        var formData = {
            matricule: $('#matricule').val(),
            mdp: $('#password').val()
        };

        // Send AJAX request
        $.ajax({
            type: 'POST',
            url: '/login/user', // URL of your Node.js/Express login route
            data: formData,
            success: function(response) {
                // Check if login was successful
                console.log(response);
                if(response != "incorrect") {
                    if (response.role == "admin") {
                        // Store user data in localStorage
                        localStorage.setItem('user_info', JSON.stringify(response));

                        window.location.href = '/admin/home/'; // Redirect to user profile page
                        // $.post('/admin/home', response, function(response) {
                        //     // Handle the response from the server
                        //     // console.log(response);
                        //     // display page

                        // });
                        // Redirect to another page or do something else
                    }
                    else {
                        // Store user data in localStorage
                        localStorage.setItem('user_info', JSON.stringify(response));
                        // Redirect to another page or do something else
                        //call a post method
                        
                        window.location.href = '/guest/home/'+response._id; // Redirect to user profile page
                    }
                } else {
                    // Display error message
                    $('#message').text("données incorrectes");
                }
            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
            }
        });
    });
});
