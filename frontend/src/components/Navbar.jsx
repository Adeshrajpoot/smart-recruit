function Navbar() {
    return(
        <>
        <nav>
            <div className="logo">
                <div className="logoMain">
                    <span>S</span>
                </div>
                <h1>SmartRecruit</h1>
            </div>
            <div className="nav_link">
                <a href="">Home</a>
                <a href="">Candidate</a>
                <a href="">Recruiter</a>
            </div>
            <button>Login</button>
        </nav>
        </>
    );
}

export default Navbar;