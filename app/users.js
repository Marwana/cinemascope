module.exports = function() {
    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/user/signup', function(request, response) {

        // render the page and pass in any flash data if it exists
        response.render('signup.ejs', { message: request.flash('signupMessage') });
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/user/login', function(request, response) {

        // render the page and pass in any flash data if it exists
        response.render('login.ejs', { message: request.flash('loginMessage') }); 
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/user/logout', function(request, response) {
        request.logout();
        response.redirect('/');
    });
}
