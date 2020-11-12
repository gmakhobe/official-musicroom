
const Title = "Music Room";

exports.LandingPage = (req, res) => {
    return res.render('index', { title: Title});
}

exports.LoginPage = (req, res) => {
    return res.render('login', { title: Title});
}

exports.RegisterPage = (req, res) => {
    return res.render('register', { title: Title});
}

exports.ProfilePage = (req, res) => {
    return res.render('Storage/profile', { title: Title});
}

exports.ExplorePage = (req, res) => {
    return res.render('Storage/explore', { title: Title});
}

